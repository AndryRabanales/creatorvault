import Stripe from "stripe";
import { ENV } from "../_core/env";
import { calculatePaymentSplit } from "./products";

// Initialize Stripe with secret key
const stripe = new Stripe(ENV.stripeSecretKey || "");

export { stripe };

// Create a checkout session for campaign deposit
export async function createCampaignDepositSession({
  campaignId,
  brandId,
  brandEmail,
  brandName,
  amount,
  campaignTitle,
  successUrl,
  cancelUrl,
}: {
  campaignId: number;
  brandId: number;
  brandEmail: string;
  brandName: string;
  amount: number;
  campaignTitle: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Campaign Deposit: ${campaignTitle}`,
            description: `Escrow deposit for sponsorship campaign. Funds will be released to creators upon deliverable approval.`,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: brandEmail,
    client_reference_id: brandId.toString(),
    metadata: {
      type: "campaign_deposit",
      campaign_id: campaignId.toString(),
      brand_id: brandId.toString(),
      brand_name: brandName,
      amount: amount.toString(),
    },
    allow_promotion_codes: true,
  });

  return session;
}

// Create Stripe Connect account for creator
export async function createConnectAccount({
  creatorId,
  email,
  name,
}: {
  creatorId: number;
  email: string;
  name: string;
}) {
  const account = await stripe.accounts.create({
    type: "express",
    email,
    metadata: {
      creator_id: creatorId.toString(),
      name,
    },
    capabilities: {
      transfers: { requested: true },
    },
  });

  return account;
}

// Create onboarding link for Connect account
export async function createConnectOnboardingLink({
  accountId,
  refreshUrl,
  returnUrl,
}: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return accountLink;
}

// Transfer funds to creator (payout)
export async function transferToCreator({
  amount,
  creatorStripeAccountId,
  campaignId,
  contractId,
}: {
  amount: number;
  creatorStripeAccountId: string;
  campaignId: number;
  contractId: number;
}) {
  const { creatorPayout } = calculatePaymentSplit(amount);
  
  const transfer = await stripe.transfers.create({
    amount: Math.round(creatorPayout * 100), // Convert to cents
    currency: "usd",
    destination: creatorStripeAccountId,
    metadata: {
      type: "creator_payout",
      campaign_id: campaignId.toString(),
      contract_id: contractId.toString(),
      original_amount: amount.toString(),
      platform_fee: (amount - creatorPayout).toString(),
    },
  });

  return transfer;
}

// Create refund for cancelled campaign
export async function createRefund({
  paymentIntentId,
  amount,
  reason,
}: {
  paymentIntentId: string;
  amount?: number;
  reason?: string;
}) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
    reason: "requested_by_customer",
    metadata: {
      custom_reason: reason || "Campaign cancelled",
    },
  });

  return refund;
}

// Get payment intent details
export async function getPaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

// Create customer for brand
export async function createCustomer({
  email,
  name,
  brandId,
}: {
  email: string;
  name: string;
  brandId: number;
}) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      brand_id: brandId.toString(),
    },
  });

  return customer;
}

// Verify webhook signature
export function constructWebhookEvent(
  payload: Buffer,
  signature: string,
  webhookSecret: string
) {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
