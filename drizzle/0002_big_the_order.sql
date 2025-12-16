CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` enum('campaign_view','campaign_apply','creator_profile_view','brand_profile_view','contract_signed','payment_completed','message_sent','deliverable_submitted','deliverable_approved') NOT NULL,
	`userId` int,
	`creatorId` int,
	`brandId` int,
	`campaignId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`brandId` int NOT NULL,
	`campaignId` int,
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	`creatorUnread` int DEFAULT 0,
	`brandUnread` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`senderType` enum('creator','brand') NOT NULL,
	`content` text NOT NULL,
	`attachmentUrl` varchar(500),
	`attachmentType` varchar(50),
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('application_received','application_approved','application_rejected','deliverable_submitted','deliverable_approved','deliverable_rejected','payment_received','message_received','review_received','campaign_completed','contract_ready') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`link` varchar(500),
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int NOT NULL,
	`campaignId` int NOT NULL,
	`reviewerId` int NOT NULL,
	`reviewerType` enum('creator','brand') NOT NULL,
	`revieweeId` int NOT NULL,
	`revieweeType` enum('creator','brand') NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`isPublic` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`platform` enum('instagram','tiktok','youtube','twitter','twitch') NOT NULL,
	`username` varchar(255) NOT NULL,
	`profileUrl` varchar(500),
	`followers` int DEFAULT 0,
	`engagementRate` decimal(5,2),
	`isVerified` boolean DEFAULT false,
	`verifiedAt` timestamp,
	`lastSyncedAt` timestamp,
	`accessToken` text,
	`refreshToken` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contracts` MODIFY COLUMN `status` enum('pending','active','completed','cancelled','disputed') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `deliverables` MODIFY COLUMN `status` enum('pending','approved','rejected','revision_requested') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `escrow` MODIFY COLUMN `status` enum('held','partial_released','released','refunded') DEFAULT 'held';--> statement-breakpoint
ALTER TABLE `payments` MODIFY COLUMN `type` enum('guaranteed','sponsorship','bonus','refund') DEFAULT 'sponsorship';--> statement-breakpoint
ALTER TABLE `brand_profiles` ADD `logo` varchar(500);--> statement-breakpoint
ALTER TABLE `brand_profiles` ADD `isVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `brand_profiles` ADD `averageRating` decimal(3,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `brand_profiles` ADD `totalReviews` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `brand_profiles` ADD `totalCampaigns` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `brand_profiles` ADD `totalSpent` decimal(12,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `brand_profiles` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `campaign_applications` ADD `proposedRate` decimal(10,2);--> statement-breakpoint
ALTER TABLE `campaigns` ADD `creatorsApproved` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `niche` varchar(100);--> statement-breakpoint
ALTER TABLE `campaigns` ADD `totalViews` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `totalApplications` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `creator_profiles` ADD `isVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `creator_profiles` ADD `verificationDate` timestamp;--> statement-breakpoint
ALTER TABLE `creator_profiles` ADD `averageRating` decimal(3,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `creator_profiles` ADD `totalReviews` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `creator_profiles` ADD `completedCampaigns` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `creator_profiles` ADD `stripeAccountId` varchar(255);--> statement-breakpoint
ALTER TABLE `creator_profiles` ADD `stripeOnboarded` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `deliverables` ADD `feedback` text;--> statement-breakpoint
ALTER TABLE `payments` ADD `stripePayoutId` varchar(255);