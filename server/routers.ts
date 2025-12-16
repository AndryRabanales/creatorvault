import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { createCampaignDepositSession, createConnectAccount, createConnectOnboardingLink } from "./stripe/stripe";
import { calculatePaymentSplit, getTierFromFollowers, CREATOR_TIERS } from "./stripe/products";
import { ENV } from "./_core/env";

// Helper to calculate tier based on followers
function calculateTier(followers: number): { tier: "tier1" | "tier2" | "tier3"; guaranteedIncome: string } {
  const tierKey = getTierFromFollowers(followers);
  const tierInfo = CREATOR_TIERS[tierKey];
  return { tier: tierKey, guaranteedIncome: tierInfo.guaranteedIncome.toFixed(2) };
}

// Generate contract terms
function generateContractTerms(campaignTitle: string, creatorName: string, brandName: string, amount: string): string {
  const { platformFee, creatorPayout } = calculatePaymentSplit(parseFloat(amount));
  return `
DIGITAL SPONSORSHIP CONTRACT

This Agreement is entered into between:
- Creator: ${creatorName}
- Brand: ${brandName}

Campaign: ${campaignTitle}

TERMS AND CONDITIONS:

1. SCOPE OF WORK
The Creator agrees to produce and deliver content as specified in the campaign requirements.

2. COMPENSATION
Total Payment: $${amount}
Platform Fee (20%): $${platformFee.toFixed(2)}
Creator Payout (80%): $${creatorPayout.toFixed(2)}

3. PAYMENT TERMS
Payment will be released upon approval of deliverables by the Brand.
Funds are held in escrow until deliverables are approved.

4. CONTENT RIGHTS
The Brand receives a license to use the created content for marketing purposes.

5. CONFIDENTIALITY
Both parties agree to keep campaign details confidential until publication.

6. TERMINATION
Either party may terminate with written notice if obligations are not met.

By signing below, both parties agree to these terms.

Generated on: ${new Date().toLocaleDateString()}
  `.trim();
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    setRole: protectedProcedure
      .input(z.object({ role: z.enum(["creator", "brand"]) }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserRole(ctx.user.id, input.role);
        return { success: true, role: input.role };
      }),
  }),

  // Creator routes
  creator: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return db.getCreatorProfileByUserId(ctx.user.id);
    }),
    
    getProfileById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const profile = await db.getCreatorProfileById(input.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
        return profile;
      }),
    
    createProfile: protectedProcedure
      .input(z.object({
        name: z.string().min(2).max(50),
        bio: z.string().max(500).optional(),
        niche: z.string().optional(),
        followers: z.number().min(10000).max(100000000),
        instagram: z.string().optional(),
        tiktok: z.string().optional(),
        youtube: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if profile already exists
        const existing = await db.getCreatorProfileByUserId(ctx.user.id);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Profile already exists" });
        }
        
        const { tier, guaranteedIncome } = calculateTier(input.followers);
        const profile = await db.createCreatorProfile({
          userId: ctx.user.id,
          name: input.name,
          bio: input.bio,
          niche: input.niche,
          followers: input.followers,
          tier,
          guaranteedIncome,
          onboardingComplete: true,
        });
        
        // Add social accounts if provided
        if (profile && (input.instagram || input.tiktok || input.youtube)) {
          const creatorProfile = await db.getCreatorProfileByUserId(ctx.user.id);
          if (creatorProfile) {
            if (input.instagram) {
              await db.addSocialAccount(creatorProfile.id, "instagram", input.instagram);
            }
            if (input.tiktok) {
              await db.addSocialAccount(creatorProfile.id, "tiktok", input.tiktok);
            }
            if (input.youtube) {
              await db.addSocialAccount(creatorProfile.id, "youtube", input.youtube);
            }
          }
        }
        
        await db.updateUserRole(ctx.user.id, "creator");
        return { success: true, tier, guaranteedIncome };
      }),
    
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        niche: z.string().optional(),
        followers: z.number().optional(),
        bankName: z.string().optional(),
        bankAccount: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const updates: Record<string, unknown> = { ...input };
        if (input.followers !== undefined) {
          const { tier, guaranteedIncome } = calculateTier(input.followers);
          updates.tier = tier;
          updates.guaranteedIncome = guaranteedIncome;
        }
        await db.updateCreatorProfile(ctx.user.id, updates);
        return { success: true };
      }),
    
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
      return db.getCreatorStats(profile.id);
    }),
    
    getApplications: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return db.getApplicationsByCreatorId(profile.id);
    }),
    
    getContracts: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return db.getContractsByCreatorId(profile.id);
    }),
    
    getPayments: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return db.getPaymentsByCreatorId(profile.id);
    }),
    
    // Stripe Connect onboarding
    setupStripeConnect: protectedProcedure.mutation(async ({ ctx }) => {
      const profile = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
      
      if (!profile.stripeAccountId) {
        const account = await createConnectAccount({
          creatorId: profile.id,
          email: ctx.user.email || "",
          name: profile.name,
        });
        await db.updateCreatorProfile(ctx.user.id, { stripeAccountId: account.id });
        profile.stripeAccountId = account.id;
      }
      
      const origin = ctx.req.headers.origin || "http://localhost:3000";
      const accountLink = await createConnectOnboardingLink({
        accountId: profile.stripeAccountId,
        refreshUrl: `${origin}/dashboard/creator/settings`,
        returnUrl: `${origin}/dashboard/creator/settings?stripe=success`,
      });
      
      return { url: accountLink.url };
    }),
    
    // Social accounts
    getSocialAccounts: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return db.getSocialAccountsByCreatorId(profile.id);
    }),
    
    addSocialAccount: protectedProcedure
      .input(z.object({
        platform: z.enum(["instagram", "tiktok", "youtube", "twitter", "twitch"]),
        username: z.string().min(1),
        profileUrl: z.string().url().optional(),
        followers: z.number().min(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getCreatorProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
        
        await db.createSocialAccount({
          creatorId: profile.id,
          platform: input.platform,
          username: input.username,
          profileUrl: input.profileUrl,
          followers: input.followers,
        });
        
        // Update total followers
        const accounts = await db.getSocialAccountsByCreatorId(profile.id);
        const totalFollowers = accounts.reduce((sum, acc) => sum + (acc.followers || 0), 0);
        const { tier, guaranteedIncome } = calculateTier(totalFollowers);
        await db.updateCreatorProfile(ctx.user.id, { followers: totalFollowers, tier, guaranteedIncome });
        
        return { success: true };
      }),
    
    removeSocialAccount: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteSocialAccount(input.id);
        return { success: true };
      }),
    
    // Reviews received
    getReviews: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return db.getReviewsByRevieweeId(profile.id, "creator");
    }),
  }),

  // Brand routes
  brand: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return db.getBrandProfileByUserId(ctx.user.id);
    }),
    
    getProfileById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const profile = await db.getBrandProfileById(input.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
        return profile;
      }),
    
    createProfile: protectedProcedure
      .input(z.object({
        companyName: z.string().min(1),
        industry: z.string().optional(),
        website: z.string().url().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createBrandProfile({
          userId: ctx.user.id,
          companyName: input.companyName,
          industry: input.industry,
          website: input.website,
          description: input.description,
          onboardingComplete: true,
        });
        await db.updateUserRole(ctx.user.id, "brand");
        return { success: true };
      }),
    
    updateProfile: protectedProcedure
      .input(z.object({
        companyName: z.string().optional(),
        industry: z.string().optional(),
        website: z.string().optional(),
        description: z.string().optional(),
        logo: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateBrandProfile(ctx.user.id, input);
        return { success: true };
      }),
    
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getBrandProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
      return db.getBrandStats(profile.id);
    }),
    
    getCampaigns: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getBrandProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return db.getCampaignsByBrandId(profile.id);
    }),
    
    getContracts: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getBrandProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return db.getContractsByBrandId(profile.id);
    }),
    
    // Reviews received
    getReviews: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getBrandProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return db.getReviewsByRevieweeId(profile.id, "brand");
    }),
  }),

  // Campaign routes
  campaign: router({
    getAll: publicProcedure.query(async () => {
      return db.getActiveCampaigns();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const campaign = await db.getCampaignById(input.id);
        if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
        // Track view
        await db.incrementCampaignViews(input.id);
        await db.createAnalyticsEvent({ eventType: "campaign_view", campaignId: input.id });
        return campaign;
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        budget: z.number().min(100),
        creatorsNeeded: z.number().min(1).default(1),
        requirements: z.string().optional(),
        niche: z.string().optional(),
        deadline: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getBrandProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Brand profile not found" });
        
        const campaignId = await db.createCampaign({
          brandId: profile.id,
          title: input.title,
          description: input.description,
          budget: input.budget.toFixed(2),
          creatorsNeeded: input.creatorsNeeded,
          requirements: input.requirements,
          niche: input.niche,
          deadline: input.deadline,
          status: "draft",
        });
        
        return { success: true, campaignId };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        budget: z.number().optional(),
        creatorsNeeded: z.number().optional(),
        requirements: z.string().optional(),
        niche: z.string().optional(),
        deadline: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        if (updates.budget) updates.budget = parseFloat(updates.budget.toFixed(2)) as any;
        await db.updateCampaign(id, updates as any);
        return { success: true };
      }),
    
    // Create Stripe checkout for campaign deposit
    createDepositSession: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const campaign = await db.getCampaignById(input.campaignId);
        if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
        
        const profile = await db.getBrandProfileByUserId(ctx.user.id);
        if (!profile || profile.id !== campaign.brandId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        const origin = ctx.req.headers.origin || "http://localhost:3000";
        const session = await createCampaignDepositSession({
          campaignId: campaign.id,
          brandId: profile.id,
          brandEmail: ctx.user.email || "",
          brandName: profile.companyName,
          amount: parseFloat(campaign.budget),
          campaignTitle: campaign.title,
          successUrl: `${origin}/dashboard/brand/campaigns/${campaign.id}?payment=success`,
          cancelUrl: `${origin}/dashboard/brand/campaigns/${campaign.id}?payment=cancelled`,
        });
        
        return { url: session.url };
      }),
    
    activate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const campaign = await db.getCampaignById(input.id);
        if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
        
        // For MVP, allow activation without actual payment (simulated)
        await db.updateCampaign(input.id, { status: "active", fundsDeposited: true });
        await db.createEscrow({
          campaignId: input.id,
          brandId: campaign.brandId,
          amount: campaign.budget,
          status: "held",
        });
        
        return { success: true };
      }),
    
    complete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateCampaign(input.id, { status: "completed" });
        const escrowRecord = await db.getEscrowByCampaignId(input.id);
        if (escrowRecord) {
          await db.updateEscrow(escrowRecord.id, { status: "released", releasedAt: new Date() });
        }
        return { success: true };
      }),
    
    getApplications: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(async ({ input }) => {
        return db.getApplicationsByCampaignId(input.campaignId);
      }),
  }),

  // Application routes
  application: router({
    applyToCampaign: protectedProcedure
      .input(z.object({
        campaignId: z.number(),
        message: z.string().optional(),
        proposedRate: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getCreatorProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Creator profile not found" });
        
        const existing = await db.getExistingApplication(input.campaignId, profile.id);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Already applied" });
        
        await db.createApplication({
          campaignId: input.campaignId,
          creatorId: profile.id,
          message: input.message,
          proposedRate: input.proposedRate?.toFixed(2),
        });
        
        await db.incrementCampaignApplications(input.campaignId);
        await db.createAnalyticsEvent({ eventType: "campaign_apply", campaignId: input.campaignId, creatorId: profile.id });
        
        // Create notification for brand
        const campaign = await db.getCampaignById(input.campaignId);
        if (campaign) {
          const brand = await db.getBrandProfileById(campaign.brandId);
          if (brand) {
            await db.createNotification({
              userId: brand.userId,
              type: "application_received",
              title: "New Application",
              message: `${profile.name} applied to your campaign "${campaign.title}"`,
              link: `/dashboard/brand/campaigns/${campaign.id}`,
            });
          }
        }
        
        return { success: true };
      }),
    
    approve: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const application = await db.getApplicationById(input.applicationId);
        if (!application) throw new TRPCError({ code: "NOT_FOUND" });
        
        const campaign = await db.getCampaignById(application.campaignId);
        if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
        
        const creator = await db.getCreatorProfileById(application.creatorId);
        if (!creator) throw new TRPCError({ code: "NOT_FOUND" });
        
        const brand = await db.getBrandProfileById(campaign.brandId);
        if (!brand) throw new TRPCError({ code: "NOT_FOUND" });
        
        await db.updateApplication(input.applicationId, { status: "approved" });
        
        // Calculate payment per creator
        const paymentPerCreator = parseFloat(campaign.budget) / (campaign.creatorsNeeded || 1);
        const { platformFee, creatorPayout } = calculatePaymentSplit(paymentPerCreator);
        
        // Create contract
        const terms = generateContractTerms(campaign.title, creator.name, brand.companyName, paymentPerCreator.toFixed(2));
        await db.createContract({
          applicationId: input.applicationId,
          campaignId: campaign.id,
          creatorId: creator.id,
          brandId: brand.id,
          terms,
          paymentAmount: paymentPerCreator.toFixed(2),
          platformFee: platformFee.toFixed(2),
          creatorPayout: creatorPayout.toFixed(2),
          brandSigned: true,
          brandSignedAt: new Date(),
        });
        
        // Update campaign status
        await db.updateCampaign(campaign.id, { 
          status: "in_progress",
          creatorsApproved: (campaign.creatorsApproved || 0) + 1
        });
        
        // Notify creator
        await db.createNotification({
          userId: creator.userId,
          type: "application_approved",
          title: "Application Approved!",
          message: `Your application for "${campaign.title}" has been approved. Please sign the contract.`,
          link: `/dashboard/creator/contracts`,
        });
        
        return { success: true };
      }),
    
    reject: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const application = await db.getApplicationById(input.applicationId);
        if (!application) throw new TRPCError({ code: "NOT_FOUND" });
        
        await db.updateApplication(input.applicationId, { status: "rejected" });
        
        const creator = await db.getCreatorProfileById(application.creatorId);
        const campaign = await db.getCampaignById(application.campaignId);
        
        if (creator && campaign) {
          await db.createNotification({
            userId: creator.userId,
            type: "application_rejected",
            title: "Application Update",
            message: `Your application for "${campaign.title}" was not selected.`,
            link: `/marketplace`,
          });
        }
        
        return { success: true };
      }),
  }),

  // Contract routes
  contract: router({
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getContractById(input.id);
      }),
    
    getByApplicationId: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ input }) => {
        return db.getContractByApplicationId(input.applicationId);
      }),
    
    sign: protectedProcedure
      .input(z.object({ contractId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const contract = await db.getContractById(input.contractId);
        if (!contract) throw new TRPCError({ code: "NOT_FOUND" });
        
        const profile = await db.getCreatorProfileByUserId(ctx.user.id);
        if (!profile || profile.id !== contract.creatorId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        await db.updateContract(input.contractId, {
          creatorSigned: true,
          creatorSignedAt: new Date(),
          status: "active",
        });
        
        await db.createAnalyticsEvent({ eventType: "contract_signed", creatorId: profile.id, campaignId: contract.campaignId });
        
        // Notify brand
        const brand = await db.getBrandProfileById(contract.brandId);
        const campaign = await db.getCampaignById(contract.campaignId);
        if (brand && campaign) {
          await db.createNotification({
            userId: brand.userId,
            type: "contract_ready",
            title: "Contract Signed",
            message: `${profile.name} has signed the contract for "${campaign.title}"`,
            link: `/dashboard/brand/campaigns/${campaign.id}`,
          });
        }
        
        return { success: true };
      }),
  }),

  // Deliverable routes
  deliverable: router({
    submit: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        link: z.string().url(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const application = await db.getApplicationById(input.applicationId);
        if (!application) throw new TRPCError({ code: "NOT_FOUND" });
        
        await db.createDeliverable({
          applicationId: input.applicationId,
          link: input.link,
          description: input.description,
        });
        
        await db.createAnalyticsEvent({ eventType: "deliverable_submitted", campaignId: application.campaignId });
        
        // Notify brand
        const campaign = await db.getCampaignById(application.campaignId);
        if (campaign) {
          const brand = await db.getBrandProfileById(campaign.brandId);
          if (brand) {
            await db.createNotification({
              userId: brand.userId,
              type: "deliverable_submitted",
              title: "Deliverable Submitted",
              message: `A creator has submitted a deliverable for "${campaign.title}"`,
              link: `/dashboard/brand/campaigns/${campaign.id}`,
            });
          }
        }
        
        return { success: true };
      }),
    
    getByApplicationId: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ input }) => {
        return db.getDeliverablesByApplicationId(input.applicationId);
      }),
    
    approve: protectedProcedure
      .input(z.object({ deliverableId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const deliverable = await db.getDeliverableById(input.deliverableId);
        if (!deliverable) throw new TRPCError({ code: "NOT_FOUND" });
        
        await db.updateDeliverable(input.deliverableId, { status: "approved", reviewedAt: new Date() });
        
        // Get contract and create payment
        const contract = await db.getContractByApplicationId(deliverable.applicationId);
        if (contract) {
          await db.createPayment({
            creatorId: contract.creatorId,
            campaignId: contract.campaignId,
            contractId: contract.id,
            type: "sponsorship",
            amount: contract.paymentAmount,
            platformFee: contract.platformFee,
            netAmount: contract.creatorPayout,
            status: "completed",
            processedAt: new Date(),
          });
          
          await db.updateContract(contract.id, { status: "completed" });
          await db.createAnalyticsEvent({ eventType: "deliverable_approved", campaignId: contract.campaignId, creatorId: contract.creatorId });
          await db.createAnalyticsEvent({ eventType: "payment_completed", campaignId: contract.campaignId, creatorId: contract.creatorId });
          
          // Update creator stats
          const creator = await db.getCreatorProfileById(contract.creatorId);
          if (creator) {
            await db.updateCreatorProfileById(creator.id, {
              completedCampaigns: (creator.completedCampaigns || 0) + 1
            });
            
            await db.createNotification({
              userId: creator.userId,
              type: "payment_received",
              title: "Payment Received!",
              message: `You've received $${contract.creatorPayout} for your deliverable`,
              link: `/dashboard/creator/payments`,
            });
          }
        }
        
        return { success: true };
      }),
    
    reject: protectedProcedure
      .input(z.object({ deliverableId: z.number(), feedback: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateDeliverable(input.deliverableId, { 
          status: "rejected", 
          feedback: input.feedback,
          reviewedAt: new Date() 
        });
        
        const deliverable = await db.getDeliverableById(input.deliverableId);
        if (deliverable) {
          const application = await db.getApplicationById(deliverable.applicationId);
          if (application) {
            const creator = await db.getCreatorProfileById(application.creatorId);
            const campaign = await db.getCampaignById(application.campaignId);
            if (creator && campaign) {
              await db.createNotification({
                userId: creator.userId,
                type: "deliverable_rejected",
                title: "Deliverable Needs Revision",
                message: `Your deliverable for "${campaign.title}" needs revision`,
                link: `/dashboard/creator/campaigns/${campaign.id}`,
              });
            }
          }
        }
        
        return { success: true };
      }),
    
    requestRevision: protectedProcedure
      .input(z.object({ deliverableId: z.number(), feedback: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateDeliverable(input.deliverableId, { 
          status: "revision_requested", 
          feedback: input.feedback,
          reviewedAt: new Date() 
        });
        return { success: true };
      }),
  }),

  // Messaging routes
  message: router({
    getConversations: protectedProcedure.query(async ({ ctx }) => {
      const creatorProfile = await db.getCreatorProfileByUserId(ctx.user.id);
      const brandProfile = await db.getBrandProfileByUserId(ctx.user.id);
      
      if (creatorProfile) {
        return db.getConversationsByCreatorId(creatorProfile.id);
      } else if (brandProfile) {
        return db.getConversationsByBrandId(brandProfile.id);
      }
      return [];
    }),
    
    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return db.getMessagesByConversationId(input.conversationId);
      }),
    
    startConversation: protectedProcedure
      .input(z.object({
        creatorId: z.number().optional(),
        brandId: z.number().optional(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const creatorProfile = await db.getCreatorProfileByUserId(ctx.user.id);
        const brandProfile = await db.getBrandProfileByUserId(ctx.user.id);
        
        let creatorId = input.creatorId;
        let brandId = input.brandId;
        
        if (creatorProfile) creatorId = creatorProfile.id;
        if (brandProfile) brandId = brandProfile.id;
        
        if (!creatorId || !brandId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Both creator and brand required" });
        }
        
        // Check if conversation exists
        const existing = await db.getConversationByParticipants(creatorId, brandId, input.campaignId);
        if (existing) return { conversationId: existing.id };
        
        const conversationId = await db.createConversation({
          creatorId,
          brandId,
          campaignId: input.campaignId,
        });
        
        return { conversationId };
      }),
    
    sendMessage: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        content: z.string().min(1),
        attachmentUrl: z.string().optional(),
        attachmentType: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await db.getConversationById(input.conversationId);
        if (!conversation) throw new TRPCError({ code: "NOT_FOUND" });
        
        const creatorProfile = await db.getCreatorProfileByUserId(ctx.user.id);
        const brandProfile = await db.getBrandProfileByUserId(ctx.user.id);
        
        let senderId: number;
        let senderType: "creator" | "brand";
        
        if (creatorProfile && creatorProfile.id === conversation.creatorId) {
          senderId = creatorProfile.id;
          senderType = "creator";
        } else if (brandProfile && brandProfile.id === conversation.brandId) {
          senderId = brandProfile.id;
          senderType = "brand";
        } else {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        await db.createMessage({
          conversationId: input.conversationId,
          senderId,
          senderType,
          content: input.content,
          attachmentUrl: input.attachmentUrl,
          attachmentType: input.attachmentType,
        });
        
        // Update conversation
        const updateData: Record<string, unknown> = { lastMessageAt: new Date() };
        if (senderType === "creator") {
          updateData.brandUnread = (conversation.brandUnread || 0) + 1;
        } else {
          updateData.creatorUnread = (conversation.creatorUnread || 0) + 1;
        }
        await db.updateConversation(input.conversationId, updateData);
        
        await db.createAnalyticsEvent({ eventType: "message_sent" });
        
        // Create notification
        const recipientProfile = senderType === "creator" 
          ? await db.getBrandProfileById(conversation.brandId)
          : await db.getCreatorProfileById(conversation.creatorId);
        
        if (recipientProfile) {
          await db.createNotification({
            userId: recipientProfile.userId,
            type: "message_received",
            title: "New Message",
            message: `You have a new message`,
            link: `/messages/${input.conversationId}`,
          });
        }
        
        return { success: true };
      }),
    
    markAsRead: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const creatorProfile = await db.getCreatorProfileByUserId(ctx.user.id);
        const brandProfile = await db.getBrandProfileByUserId(ctx.user.id);
        
        if (creatorProfile) {
          await db.markMessagesAsRead(input.conversationId, "creator");
        } else if (brandProfile) {
          await db.markMessagesAsRead(input.conversationId, "brand");
        }
        
        return { success: true };
      }),
  }),

  // Review routes
  review: router({
    create: protectedProcedure
      .input(z.object({
        contractId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const contract = await db.getContractById(input.contractId);
        if (!contract) throw new TRPCError({ code: "NOT_FOUND" });
        
        const creatorProfile = await db.getCreatorProfileByUserId(ctx.user.id);
        const brandProfile = await db.getBrandProfileByUserId(ctx.user.id);
        
        let reviewerId: number;
        let reviewerType: "creator" | "brand";
        let revieweeId: number;
        let revieweeType: "creator" | "brand";
        
        if (creatorProfile && creatorProfile.id === contract.creatorId) {
          reviewerId = creatorProfile.id;
          reviewerType = "creator";
          revieweeId = contract.brandId;
          revieweeType = "brand";
        } else if (brandProfile && brandProfile.id === contract.brandId) {
          reviewerId = brandProfile.id;
          reviewerType = "brand";
          revieweeId = contract.creatorId;
          revieweeType = "creator";
        } else {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        // Check if already reviewed
        const existing = await db.getReviewByContractAndReviewer(input.contractId, reviewerId);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Already reviewed" });
        
        await db.createReview({
          contractId: input.contractId,
          campaignId: contract.campaignId,
          reviewerId,
          reviewerType,
          revieweeId,
          revieweeType,
          rating: input.rating,
          comment: input.comment,
        });
        
        // Update ratings
        if (revieweeType === "creator") {
          await db.updateCreatorRating(revieweeId);
        } else {
          await db.updateBrandRating(revieweeId);
        }
        
        // Notify reviewee
        const revieweeProfile = revieweeType === "creator"
          ? await db.getCreatorProfileById(revieweeId)
          : await db.getBrandProfileById(revieweeId);
        
        if (revieweeProfile) {
          await db.createNotification({
            userId: revieweeProfile.userId,
            type: "review_received",
            title: "New Review",
            message: `You received a ${input.rating}-star review`,
            link: revieweeType === "creator" ? `/dashboard/creator/reviews` : `/dashboard/brand/reviews`,
          });
        }
        
        return { success: true };
      }),
    
    getForContract: protectedProcedure
      .input(z.object({ contractId: z.number() }))
      .query(async ({ input }) => {
        const contract = await db.getContractById(input.contractId);
        if (!contract) return [];
        
        const creatorReviews = await db.getReviewsByRevieweeId(contract.creatorId, "creator");
        const brandReviews = await db.getReviewsByRevieweeId(contract.brandId, "brand");
        
        return [...creatorReviews, ...brandReviews].filter(r => r.contractId === input.contractId);
      }),
  }),

  // Notification routes
  notification: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return db.getNotificationsByUserId(ctx.user.id);
    }),
    
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotificationCount(ctx.user.id);
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),
    
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // Admin routes
  admin: router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.getAdminStats();
    }),
    
    getAllUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.getAllUsers();
    }),
    
    getAllCreators: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.getAllCreators();
    }),
    
    getAllCampaigns: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.getAllCampaigns();
    }),
    
    getAllPayments: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.getAllPayments();
    }),
    
    getAllContracts: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.getAllContracts();
    }),
    
    verifyCreator: protectedProcedure
      .input(z.object({ creatorId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        await db.updateCreatorProfileById(input.creatorId, { isVerified: true, verificationDate: new Date() });
        return { success: true };
      }),
    
    verifyBrand: protectedProcedure
      .input(z.object({ brandId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        await db.updateBrandProfileById(input.brandId, { isVerified: true });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
