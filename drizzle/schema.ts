import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

// Users table - Core authentication
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "creator", "brand"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// Creator profiles
export const creatorProfiles = mysqlTable("creator_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  bio: text("bio"),
  niche: varchar("niche", { length: 100 }),
  followers: int("followers").default(0),
  tier: mysqlEnum("tier", ["tier1", "tier2", "tier3"]).default("tier1"),
  guaranteedIncome: decimal("guaranteedIncome", { precision: 10, scale: 2 }).default("500.00"),
  onboardingComplete: boolean("onboardingComplete").default(false),
  bankName: varchar("bankName", { length: 255 }),
  bankAccount: varchar("bankAccount", { length: 50 }),
  // Verification & ratings
  isVerified: boolean("isVerified").default(false),
  verificationDate: timestamp("verificationDate"),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: int("totalReviews").default(0),
  completedCampaigns: int("completedCampaigns").default(0),
  // Stripe Connect
  stripeAccountId: varchar("stripeAccountId", { length: 255 }),
  stripeOnboarded: boolean("stripeOnboarded").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Brand profiles
export const brandProfiles = mysqlTable("brand_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }),
  website: varchar("website", { length: 500 }),
  description: text("description"),
  logo: varchar("logo", { length: 500 }),
  onboardingComplete: boolean("onboardingComplete").default(false),
  // Verification & ratings
  isVerified: boolean("isVerified").default(false),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: int("totalReviews").default(0),
  totalCampaigns: int("totalCampaigns").default(0),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0.00"),
  // Stripe
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Social media accounts for verification
export const socialAccounts = mysqlTable("social_accounts", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId").notNull(),
  platform: mysqlEnum("platform", ["instagram", "tiktok", "youtube", "twitter", "twitch"]).notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  profileUrl: varchar("profileUrl", { length: 500 }),
  followers: int("followers").default(0),
  engagementRate: decimal("engagementRate", { precision: 5, scale: 2 }),
  isVerified: boolean("isVerified").default(false),
  verifiedAt: timestamp("verifiedAt"),
  lastSyncedAt: timestamp("lastSyncedAt"),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Campaigns created by brands
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  brandId: int("brandId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  creatorsNeeded: int("creatorsNeeded").default(1),
  creatorsApproved: int("creatorsApproved").default(0),
  requirements: text("requirements"),
  niche: varchar("niche", { length: 100 }),
  deadline: timestamp("deadline"),
  status: mysqlEnum("status", ["draft", "active", "in_progress", "completed", "cancelled"]).default("draft"),
  fundsDeposited: boolean("fundsDeposited").default(false),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  // Analytics
  totalViews: int("totalViews").default(0),
  totalApplications: int("totalApplications").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Campaign applications from creators
export const campaignApplications = mysqlTable("campaign_applications", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  creatorId: int("creatorId").notNull(),
  message: text("message"),
  proposedRate: decimal("proposedRate", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Deliverables submitted by creators
export const deliverables = mysqlTable("deliverables", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  link: varchar("link", { length: 1000 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "revision_requested"]).default("pending"),
  feedback: text("feedback"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});

// Digital contracts
export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull().unique(),
  campaignId: int("campaignId").notNull(),
  creatorId: int("creatorId").notNull(),
  brandId: int("brandId").notNull(),
  terms: text("terms"),
  paymentAmount: decimal("paymentAmount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platformFee", { precision: 10, scale: 2 }).notNull(),
  creatorPayout: decimal("creatorPayout", { precision: 10, scale: 2 }).notNull(),
  creatorSigned: boolean("creatorSigned").default(false),
  creatorSignedAt: timestamp("creatorSignedAt"),
  brandSigned: boolean("brandSigned").default(false),
  brandSignedAt: timestamp("brandSignedAt"),
  status: mysqlEnum("status", ["pending", "active", "completed", "cancelled", "disputed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Payments tracking
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId").notNull(),
  campaignId: int("campaignId"),
  contractId: int("contractId"),
  type: mysqlEnum("type", ["guaranteed", "sponsorship", "bonus", "refund"]).default("sponsorship"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platformFee", { precision: 10, scale: 2 }).default("0.00"),
  netAmount: decimal("netAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  stripeTransferId: varchar("stripeTransferId", { length: 255 }),
  stripePayoutId: varchar("stripePayoutId", { length: 255 }),
  scheduledFor: timestamp("scheduledFor"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Escrow for campaign funds
export const escrow = mysqlTable("escrow", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  brandId: int("brandId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["held", "partial_released", "released", "refunded"]).default("held"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  releasedAt: timestamp("releasedAt"),
});

// Messages between creators and brands
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId").notNull(),
  brandId: int("brandId").notNull(),
  campaignId: int("campaignId"),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  creatorUnread: int("creatorUnread").default(0),
  brandUnread: int("brandUnread").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  senderType: mysqlEnum("senderType", ["creator", "brand"]).notNull(),
  content: text("content").notNull(),
  attachmentUrl: varchar("attachmentUrl", { length: 500 }),
  attachmentType: varchar("attachmentType", { length: 50 }),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Reviews and ratings
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId").notNull(),
  campaignId: int("campaignId").notNull(),
  reviewerId: int("reviewerId").notNull(),
  reviewerType: mysqlEnum("reviewerType", ["creator", "brand"]).notNull(),
  revieweeId: int("revieweeId").notNull(),
  revieweeType: mysqlEnum("revieweeType", ["creator", "brand"]).notNull(),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  isPublic: boolean("isPublic").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Analytics events
export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  eventType: mysqlEnum("eventType", [
    "campaign_view", "campaign_apply", "creator_profile_view",
    "brand_profile_view", "contract_signed", "payment_completed",
    "message_sent", "deliverable_submitted", "deliverable_approved"
  ]).notNull(),
  userId: int("userId"),
  creatorId: int("creatorId"),
  brandId: int("brandId"),
  campaignId: int("campaignId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Notifications
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", [
    "application_received", "application_approved", "application_rejected",
    "deliverable_submitted", "deliverable_approved", "deliverable_rejected",
    "payment_received", "message_received", "review_received",
    "campaign_completed", "contract_ready"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  link: varchar("link", { length: 500 }),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type InsertCreatorProfile = typeof creatorProfiles.$inferInsert;
export type BrandProfile = typeof brandProfiles.$inferSelect;
export type InsertBrandProfile = typeof brandProfiles.$inferInsert;
export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = typeof socialAccounts.$inferInsert;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;
export type CampaignApplication = typeof campaignApplications.$inferSelect;
export type InsertCampaignApplication = typeof campaignApplications.$inferInsert;
export type Deliverable = typeof deliverables.$inferSelect;
export type InsertDeliverable = typeof deliverables.$inferInsert;
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type Escrow = typeof escrow.$inferSelect;
export type InsertEscrow = typeof escrow.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
