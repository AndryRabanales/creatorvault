import { Router, raw } from "express";
import { stripe, constructWebhookEvent } from "./stripe";
import { ENV } from "../_core/env";
import * as db from "../db";
import type Stripe from "stripe";

const router = Router();

// Stripe webhook endpoint - MUST use raw body
router.post(
  "/api/stripe/webhook",
  raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      console.error("[Stripe Webhook] No signature header");
      return res.status(400).send("No signature");
    }

    if (!ENV.stripeWebhookSecret) {
      console.error("[Stripe Webhook] Webhook secret not configured");
      return res.status(500).send("Webhook secret not configured");
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = constructWebhookEvent(
        req.body,
        signature,
        ENV.stripeWebhookSecret
      );
    } catch (err: any) {
      console.error("[Stripe Webhook] Signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutSessionCompleted(session);
          break;
        }

        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentIntentSucceeded(paymentIntent);
          break;
        }

        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentIntentFailed(paymentIntent);
          break;
        }

        case "checkout.session.expired": {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutSessionExpired(session);
          break;
        }

        default:
          console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err: any) {
      console.error("[Stripe Webhook] Error processing event:", err);
      res.status(500).json({ error: "Webhook handler failed" });
    }
  }
);

// Handler for successful checkout
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("[Stripe] Checkout session completed:", session.id);

  const metadata = session.metadata;
  if (!metadata) {
    console.warn("[Stripe] No metadata in checkout session");
    return;
  }

  if (metadata.type === "campaign_deposit") {
    const campaignId = parseInt(metadata.campaign_id);
    const brandId = parseInt(metadata.brand_id);
    const amount = parseFloat(metadata.amount);

    // Update campaign with payment info
    await db.updateCampaignPaymentStatus(campaignId, {
      stripePaymentId: session.payment_intent as string,
      paymentStatus: "paid",
      amountPaid: amount,
    });

    console.log(`[Stripe] Campaign ${campaignId} payment completed: $${amount}`);
  }
}

// Handler for successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("[Stripe] Payment intent succeeded:", paymentIntent.id);

  const metadata = paymentIntent.metadata;
  if (!metadata) {
    return;
  }

  if (metadata.type === "creator_payout") {
    const contractId = parseInt(metadata.contract_id);
    const amount = paymentIntent.amount / 100; // Convert from cents

    // Record the payout in the database
    await db.recordCreatorPayout(contractId, {
      stripePaymentId: paymentIntent.id,
      amount,
      status: "completed",
    });

    console.log(`[Stripe] Creator payout completed for contract ${contractId}: $${amount}`);
  }
}

// Handler for failed payment intent
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error("[Stripe] Payment intent failed:", paymentIntent.id);

  const metadata = paymentIntent.metadata;
  if (!metadata) {
    return;
  }

  if (metadata.type === "campaign_deposit") {
    const campaignId = parseInt(metadata.campaign_id);

    // Update campaign payment status to failed
    await db.updateCampaignPaymentStatus(campaignId, {
      paymentStatus: "failed",
      stripePaymentId: paymentIntent.id,
    });

    console.log(`[Stripe] Campaign ${campaignId} payment failed`);
  }
}

// Handler for expired checkout session
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log("[Stripe] Checkout session expired:", session.id);

  const metadata = session.metadata;
  if (!metadata || metadata.type !== "campaign_deposit") {
    return;
  }

  const campaignId = parseInt(metadata.campaign_id);

  // You might want to notify the brand or update the campaign status
  console.log(`[Stripe] Campaign ${campaignId} checkout session expired`);
}

export default router;
