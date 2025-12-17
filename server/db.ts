import { eq, and, desc, sql, or, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  creatorProfiles, InsertCreatorProfile,
  brandProfiles, InsertBrandProfile,
  campaigns, InsertCampaign,
  campaignApplications, InsertCampaignApplication,
  deliverables, InsertDeliverable,
  contracts, InsertContract,
  payments, InsertPayment,
  escrow, InsertEscrow,
  conversations, InsertConversation,
  messages, InsertMessage,
  reviews, InsertReview,
  notifications, InsertNotification,
  analyticsEvents, InsertAnalyticsEvent,
  socialAccounts, InsertSocialAccount
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach((field) => {
      const value = user[field];
      if (value !== undefined) {
        values[field] = value ?? null;
        updateSet[field] = value ?? null;
      }
    });
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function updateUserRole(userId: number, role: "user" | "admin" | "creator" | "brand") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ============ CREATOR PROFILE FUNCTIONS ============
export async function createCreatorProfile(profile: InsertCreatorProfile) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(creatorProfiles).values(profile);
  return result[0].insertId;
}

export async function getCreatorProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function getCreatorProfileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(creatorProfiles).where(eq(creatorProfiles.id, id)).limit(1);
  return result[0];
}

export async function updateCreatorProfile(userId: number, data: Partial<InsertCreatorProfile>) {
  const db = await getDb();
  if (!db) return;
  await db.update(creatorProfiles).set(data).where(eq(creatorProfiles.userId, userId));
}

export async function updateCreatorProfileById(id: number, data: Partial<InsertCreatorProfile>) {
  const db = await getDb();
  if (!db) return;
  await db.update(creatorProfiles).set(data).where(eq(creatorProfiles.id, id));
}

export async function getAllCreators() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(creatorProfiles).orderBy(desc(creatorProfiles.createdAt));
}

export async function getVerifiedCreators() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(creatorProfiles).where(eq(creatorProfiles.isVerified, true)).orderBy(desc(creatorProfiles.averageRating));
}

// ============ BRAND PROFILE FUNCTIONS ============
export async function createBrandProfile(profile: InsertBrandProfile) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(brandProfiles).values(profile);
  return result[0].insertId;
}

export async function getBrandProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(brandProfiles).where(eq(brandProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function getBrandProfileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(brandProfiles).where(eq(brandProfiles.id, id)).limit(1);
  return result[0];
}

export async function updateBrandProfile(userId: number, data: Partial<InsertBrandProfile>) {
  const db = await getDb();
  if (!db) return;
  await db.update(brandProfiles).set(data).where(eq(brandProfiles.userId, userId));
}

export async function updateBrandProfileById(id: number, data: Partial<InsertBrandProfile>) {
  const db = await getDb();
  if (!db) return;
  await db.update(brandProfiles).set(data).where(eq(brandProfiles.id, id));
}

// ============ SOCIAL ACCOUNTS FUNCTIONS ============
export async function createSocialAccount(account: InsertSocialAccount) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(socialAccounts).values(account);
  return result[0].insertId;
}

// Helper to add social account with just platform and username
export async function addSocialAccount(creatorId: number, platform: "instagram" | "tiktok" | "youtube" | "twitter" | "twitch", username: string) {
  const profileUrl = platform === "instagram" ? `https://instagram.com/${username}` :
                     platform === "tiktok" ? `https://tiktok.com/@${username}` :
                     platform === "youtube" ? username : // YouTube can be full URL
                     platform === "twitter" ? `https://twitter.com/${username}` :
                     `https://twitch.tv/${username}`;
  return createSocialAccount({
    creatorId,
    platform,
    username,
    profileUrl,
  });
}

export async function getSocialAccountsByCreatorId(creatorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(socialAccounts).where(eq(socialAccounts.creatorId, creatorId));
}

export async function updateSocialAccount(id: number, data: Partial<InsertSocialAccount>) {
  const db = await getDb();
  if (!db) return;
  await db.update(socialAccounts).set(data).where(eq(socialAccounts.id, id));
}

export async function deleteSocialAccount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(socialAccounts).where(eq(socialAccounts.id, id));
}

// ============ CAMPAIGN FUNCTIONS ============
export async function createCampaign(campaign: InsertCampaign) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(campaigns).values(campaign);
  return result[0].insertId;
}

export async function getCampaignById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return result[0];
}

export async function getCampaignsByBrandId(brandId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).where(eq(campaigns.brandId, brandId)).orderBy(desc(campaigns.createdAt));
}

export async function getActiveCampaigns() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).where(eq(campaigns.status, "active")).orderBy(desc(campaigns.createdAt));
}

export async function getAllCampaigns() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
}

export async function updateCampaign(id: number, data: Partial<InsertCampaign>) {
  const db = await getDb();
  if (!db) return;
  await db.update(campaigns).set(data).where(eq(campaigns.id, id));
}

export async function incrementCampaignViews(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(campaigns).set({ totalViews: sql`${campaigns.totalViews} + 1` }).where(eq(campaigns.id, id));
}

export async function incrementCampaignApplications(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(campaigns).set({ totalApplications: sql`${campaigns.totalApplications} + 1` }).where(eq(campaigns.id, id));
}

// ============ APPLICATION FUNCTIONS ============
export async function createApplication(application: InsertCampaignApplication) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(campaignApplications).values(application);
  return result[0].insertId;
}

export async function getApplicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(campaignApplications).where(eq(campaignApplications.id, id)).limit(1);
  return result[0];
}

export async function getApplicationsByCampaignId(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaignApplications).where(eq(campaignApplications.campaignId, campaignId)).orderBy(desc(campaignApplications.createdAt));
}

export async function getApplicationsByCreatorId(creatorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaignApplications).where(eq(campaignApplications.creatorId, creatorId)).orderBy(desc(campaignApplications.createdAt));
}

export async function getExistingApplication(campaignId: number, creatorId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(campaignApplications)
    .where(and(eq(campaignApplications.campaignId, campaignId), eq(campaignApplications.creatorId, creatorId)))
    .limit(1);
  return result[0];
}

export async function updateApplication(id: number, data: Partial<InsertCampaignApplication>) {
  const db = await getDb();
  if (!db) return;
  await db.update(campaignApplications).set(data).where(eq(campaignApplications.id, id));
}

// ============ DELIVERABLE FUNCTIONS ============
export async function createDeliverable(deliverable: InsertDeliverable) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(deliverables).values(deliverable);
  return result[0].insertId;
}

export async function getDeliverablesByApplicationId(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deliverables).where(eq(deliverables.applicationId, applicationId)).orderBy(desc(deliverables.submittedAt));
}

export async function getDeliverableById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(deliverables).where(eq(deliverables.id, id)).limit(1);
  return result[0];
}

export async function updateDeliverable(id: number, data: Partial<InsertDeliverable>) {
  const db = await getDb();
  if (!db) return;
  await db.update(deliverables).set(data).where(eq(deliverables.id, id));
}

// ============ CONTRACT FUNCTIONS ============
export async function createContract(contract: InsertContract) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(contracts).values(contract);
  return result[0].insertId;
}

export async function getContractById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contracts).where(eq(contracts.id, id)).limit(1);
  return result[0];
}

export async function getContractByApplicationId(applicationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contracts).where(eq(contracts.applicationId, applicationId)).limit(1);
  return result[0];
}

export async function getContractsByCreatorId(creatorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contracts).where(eq(contracts.creatorId, creatorId)).orderBy(desc(contracts.createdAt));
}

export async function getContractsByBrandId(brandId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contracts).where(eq(contracts.brandId, brandId)).orderBy(desc(contracts.createdAt));
}

export async function updateContract(id: number, data: Partial<InsertContract>) {
  const db = await getDb();
  if (!db) return;
  await db.update(contracts).set(data).where(eq(contracts.id, id));
}

export async function getAllContracts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contracts).orderBy(desc(contracts.createdAt));
}

// ============ PAYMENT FUNCTIONS ============
export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(payments).values(payment);
  return result[0].insertId;
}

export async function getPaymentsByCreatorId(creatorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.creatorId, creatorId)).orderBy(desc(payments.createdAt));
}

export async function getAllPayments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).orderBy(desc(payments.createdAt));
}

export async function updatePayment(id: number, data: Partial<InsertPayment>) {
  const db = await getDb();
  if (!db) return;
  await db.update(payments).set(data).where(eq(payments.id, id));
}

export async function getPaymentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  return result[0];
}

// ============ ESCROW FUNCTIONS ============
export async function createEscrow(escrowData: InsertEscrow) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(escrow).values(escrowData);
  return result[0].insertId;
}

export async function getEscrowByCampaignId(campaignId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(escrow).where(eq(escrow.campaignId, campaignId)).limit(1);
  return result[0];
}

export async function updateEscrow(id: number, data: Partial<InsertEscrow>) {
  const db = await getDb();
  if (!db) return;
  await db.update(escrow).set(data).where(eq(escrow.id, id));
}

// ============ CONVERSATION & MESSAGE FUNCTIONS ============
export async function createConversation(conversation: InsertConversation) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(conversations).values(conversation);
  return result[0].insertId;
}

export async function getConversationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result[0];
}

export async function getConversationByParticipants(creatorId: number, brandId: number, campaignId?: number) {
  const db = await getDb();
  if (!db) return undefined;
  let query = and(eq(conversations.creatorId, creatorId), eq(conversations.brandId, brandId));
  if (campaignId) {
    query = and(query, eq(conversations.campaignId, campaignId));
  }
  const result = await db.select().from(conversations).where(query).limit(1);
  return result[0];
}

export async function getConversationsByCreatorId(creatorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversations).where(eq(conversations.creatorId, creatorId)).orderBy(desc(conversations.lastMessageAt));
}

export async function getConversationsByBrandId(brandId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversations).where(eq(conversations.brandId, brandId)).orderBy(desc(conversations.lastMessageAt));
}

export async function updateConversation(id: number, data: Partial<InsertConversation>) {
  const db = await getDb();
  if (!db) return;
  await db.update(conversations).set(data).where(eq(conversations.id, id));
}

export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(messages).values(message);
  return result[0].insertId;
}

export async function getMessagesByConversationId(conversationId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(desc(messages.createdAt)).limit(limit);
}

export async function markMessagesAsRead(conversationId: number, recipientType: "creator" | "brand") {
  const db = await getDb();
  if (!db) return;
  const senderType = recipientType === "creator" ? "brand" : "creator";
  await db.update(messages)
    .set({ isRead: true })
    .where(and(eq(messages.conversationId, conversationId), eq(messages.senderType, senderType)));
  
  // Reset unread count
  if (recipientType === "creator") {
    await db.update(conversations).set({ creatorUnread: 0 }).where(eq(conversations.id, conversationId));
  } else {
    await db.update(conversations).set({ brandUnread: 0 }).where(eq(conversations.id, conversationId));
  }
}

// ============ REVIEW FUNCTIONS ============
export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(reviews).values(review);
  return result[0].insertId;
}

export async function getReviewsByRevieweeId(revieweeId: number, revieweeType: "creator" | "brand") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews)
    .where(and(eq(reviews.revieweeId, revieweeId), eq(reviews.revieweeType, revieweeType)))
    .orderBy(desc(reviews.createdAt));
}

export async function getReviewByContractAndReviewer(contractId: number, reviewerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(reviews)
    .where(and(eq(reviews.contractId, contractId), eq(reviews.reviewerId, reviewerId)))
    .limit(1);
  return result[0];
}

export async function updateCreatorRating(creatorId: number) {
  const db = await getDb();
  if (!db) return;
  const reviewsList = await getReviewsByRevieweeId(creatorId, "creator");
  if (reviewsList.length === 0) return;
  const avgRating = reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length;
  await db.update(creatorProfiles)
    .set({ averageRating: avgRating.toFixed(2), totalReviews: reviewsList.length })
    .where(eq(creatorProfiles.id, creatorId));
}

export async function updateBrandRating(brandId: number) {
  const db = await getDb();
  if (!db) return;
  const reviewsList = await getReviewsByRevieweeId(brandId, "brand");
  if (reviewsList.length === 0) return;
  const avgRating = reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length;
  await db.update(brandProfiles)
    .set({ averageRating: avgRating.toFixed(2), totalReviews: reviewsList.length })
    .where(eq(brandProfiles.id, brandId));
}

// ============ NOTIFICATION FUNCTIONS ============
export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(notifications).values(notification);
  return result[0].insertId;
}

export async function getNotificationsByUserId(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result[0]?.count || 0;
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

// ============ ANALYTICS FUNCTIONS ============
export async function createAnalyticsEvent(event: InsertAnalyticsEvent) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(analyticsEvents).values(event);
  return result[0].insertId;
}

export async function getAnalyticsForCreator(creatorId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return db.select().from(analyticsEvents)
    .where(and(eq(analyticsEvents.creatorId, creatorId), sql`${analyticsEvents.createdAt} >= ${startDate}`))
    .orderBy(desc(analyticsEvents.createdAt));
}

export async function getAnalyticsForBrand(brandId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return db.select().from(analyticsEvents)
    .where(and(eq(analyticsEvents.brandId, brandId), sql`${analyticsEvents.createdAt} >= ${startDate}`))
    .orderBy(desc(analyticsEvents.createdAt));
}

export async function getAnalyticsForCampaign(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(analyticsEvents)
    .where(eq(analyticsEvents.campaignId, campaignId))
    .orderBy(desc(analyticsEvents.createdAt));
}

// ============ STATS FUNCTIONS ============
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, totalCreators: 0, totalBrands: 0, totalCampaigns: 0, totalPayments: 0, activeCampaigns: 0, pendingPayments: 0 };
  
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [creatorCount] = await db.select({ count: sql<number>`count(*)` }).from(creatorProfiles);
  const [brandCount] = await db.select({ count: sql<number>`count(*)` }).from(brandProfiles);
  const [campaignCount] = await db.select({ count: sql<number>`count(*)` }).from(campaigns);
  const [activeCampaignCount] = await db.select({ count: sql<number>`count(*)` }).from(campaigns).where(eq(campaigns.status, "active"));
  const [paymentSum] = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` }).from(payments).where(eq(payments.status, "completed"));
  const [pendingPaymentSum] = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` }).from(payments).where(eq(payments.status, "pending"));
  
  return {
    totalUsers: userCount?.count || 0,
    totalCreators: creatorCount?.count || 0,
    totalBrands: brandCount?.count || 0,
    totalCampaigns: campaignCount?.count || 0,
    activeCampaigns: activeCampaignCount?.count || 0,
    totalPayments: parseFloat(paymentSum?.total || "0"),
    pendingPayments: parseFloat(pendingPaymentSum?.total || "0")
  };
}

export async function getCreatorStats(creatorId: number) {
  const db = await getDb();
  if (!db) return { totalEarnings: 0, pendingPayments: 0, completedCampaigns: 0, activeApplications: 0 };
  
  const [completedPayments] = await db.select({ total: sql<string>`COALESCE(SUM(netAmount), 0)` }).from(payments)
    .where(and(eq(payments.creatorId, creatorId), eq(payments.status, "completed")));
  const [pendingPayments] = await db.select({ total: sql<string>`COALESCE(SUM(netAmount), 0)` }).from(payments)
    .where(and(eq(payments.creatorId, creatorId), eq(payments.status, "pending")));
  const [completedContracts] = await db.select({ count: sql<number>`count(*)` }).from(contracts)
    .where(and(eq(contracts.creatorId, creatorId), eq(contracts.status, "completed")));
  const [activeApps] = await db.select({ count: sql<number>`count(*)` }).from(campaignApplications)
    .where(and(eq(campaignApplications.creatorId, creatorId), ne(campaignApplications.status, "rejected")));
  
  return {
    totalEarnings: parseFloat(completedPayments?.total || "0"),
    pendingPayments: parseFloat(pendingPayments?.total || "0"),
    completedCampaigns: completedContracts?.count || 0,
    activeApplications: activeApps?.count || 0
  };
}

export async function getBrandStats(brandId: number) {
  const db = await getDb();
  if (!db) return { totalSpent: 0, activeCampaigns: 0, completedCampaigns: 0, totalCreatorsHired: 0 };
  
  const [totalSpent] = await db.select({ total: sql<string>`COALESCE(SUM(budget), 0)` }).from(campaigns)
    .where(and(eq(campaigns.brandId, brandId), eq(campaigns.status, "completed")));
  const [activeCampaigns] = await db.select({ count: sql<number>`count(*)` }).from(campaigns)
    .where(and(eq(campaigns.brandId, brandId), or(eq(campaigns.status, "active"), eq(campaigns.status, "in_progress"))));
  const [completedCampaigns] = await db.select({ count: sql<number>`count(*)` }).from(campaigns)
    .where(and(eq(campaigns.brandId, brandId), eq(campaigns.status, "completed")));
  const [creatorsHired] = await db.select({ count: sql<number>`count(*)` }).from(contracts)
    .where(eq(contracts.brandId, brandId));
  
  return {
    totalSpent: parseFloat(totalSpent?.total || "0"),
    activeCampaigns: activeCampaigns?.count || 0,
    completedCampaigns: completedCampaigns?.count || 0,
    totalCreatorsHired: creatorsHired?.count || 0
  };
}

// ============ WEBHOOK HELPER FUNCTIONS ============
export async function updateCampaignPaymentStatus(
  campaignId: number,
  paymentData: {
    stripePaymentId?: string;
    paymentStatus?: string;
    amountPaid?: number;
  }
) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = {};
  if (paymentData.stripePaymentId) updateData.stripePaymentId = paymentData.stripePaymentId;
  if (paymentData.paymentStatus) updateData.paymentStatus = paymentData.paymentStatus;
  if (paymentData.amountPaid !== undefined) updateData.budget = paymentData.amountPaid;
  
  await db.update(campaigns).set(updateData).where(eq(campaigns.id, campaignId));
}

export async function recordCreatorPayout(
  contractId: number,
  payoutData: {
    stripePaymentId: string;
    amount: number;
    status: "pending" | "processing" | "completed" | "failed";
  }
) {
  const db = await getDb();
  if (!db) return;
  
  // Get contract to find creator
  const contract = await getContractById(contractId);
  if (!contract) return;
  
  // Create payment record
  await createPayment({
    campaignId: contract.campaignId,
    creatorId: contract.creatorId,
    contractId: contractId,
    type: "sponsorship",
    amount: payoutData.amount.toFixed(2),
    netAmount: payoutData.amount.toFixed(2),
    platformFee: "0.00",
    status: payoutData.status,
    stripePayoutId: payoutData.stripePaymentId,
  });
}
