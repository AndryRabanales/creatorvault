// Stripe Products and Prices Configuration
// These are used for campaign deposits and platform fees

export const PLATFORM_FEE_PERCENTAGE = 0.20; // 20% platform fee

export const STRIPE_PRODUCTS = {
  CAMPAIGN_DEPOSIT: {
    name: "Campaign Deposit",
    description: "Escrow deposit for sponsorship campaign",
  },
  GUARANTEED_PAYMENT: {
    name: "Guaranteed Monthly Payment",
    description: "Monthly guaranteed income for creators",
  },
  SPONSORSHIP_PAYMENT: {
    name: "Sponsorship Payment",
    description: "Payment for completed sponsorship deliverables",
  },
};

// Calculate platform fee and creator payout
export function calculatePaymentSplit(totalAmount: number) {
  const platformFee = Math.round(totalAmount * PLATFORM_FEE_PERCENTAGE * 100) / 100;
  const creatorPayout = Math.round((totalAmount - platformFee) * 100) / 100;
  
  return {
    total: totalAmount,
    platformFee,
    creatorPayout,
    platformFeePercentage: PLATFORM_FEE_PERCENTAGE * 100,
  };
}

// Tier configuration
export const CREATOR_TIERS = {
  tier1: {
    name: "Tier 1",
    minFollowers: 10000,
    maxFollowers: 49999,
    guaranteedIncome: 500,
    description: "10K - 50K followers",
  },
  tier2: {
    name: "Tier 2",
    minFollowers: 50000,
    maxFollowers: 199999,
    guaranteedIncome: 1000,
    description: "50K - 200K followers",
  },
  tier3: {
    name: "Tier 3",
    minFollowers: 200000,
    maxFollowers: Infinity,
    guaranteedIncome: 2000,
    description: "200K+ followers",
  },
};

export function getTierFromFollowers(followers: number): keyof typeof CREATOR_TIERS {
  if (followers >= 200000) return "tier3";
  if (followers >= 50000) return "tier2";
  return "tier1";
}
