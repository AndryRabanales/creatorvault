CREATE TABLE `brand_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`industry` varchar(100),
	`website` varchar(500),
	`description` text,
	`onboardingComplete` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brand_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `brand_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `campaign_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`creatorId` int NOT NULL,
	`message` text,
	`status` enum('pending','approved','rejected') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaign_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brandId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`budget` decimal(10,2) NOT NULL,
	`creatorsNeeded` int DEFAULT 1,
	`requirements` text,
	`deadline` timestamp,
	`status` enum('draft','active','in_progress','completed','cancelled') DEFAULT 'draft',
	`fundsDeposited` boolean DEFAULT false,
	`stripePaymentIntentId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`campaignId` int NOT NULL,
	`creatorId` int NOT NULL,
	`brandId` int NOT NULL,
	`terms` text,
	`paymentAmount` decimal(10,2) NOT NULL,
	`platformFee` decimal(10,2) NOT NULL,
	`creatorPayout` decimal(10,2) NOT NULL,
	`creatorSigned` boolean DEFAULT false,
	`creatorSignedAt` timestamp,
	`brandSigned` boolean DEFAULT false,
	`brandSignedAt` timestamp,
	`status` enum('pending','active','completed','cancelled') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`),
	CONSTRAINT `contracts_applicationId_unique` UNIQUE(`applicationId`)
);
--> statement-breakpoint
CREATE TABLE `creator_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`bio` text,
	`niche` varchar(100),
	`followers` int DEFAULT 0,
	`tier` enum('tier1','tier2','tier3') DEFAULT 'tier1',
	`guaranteedIncome` decimal(10,2) DEFAULT '500.00',
	`onboardingComplete` boolean DEFAULT false,
	`bankName` varchar(255),
	`bankAccount` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creator_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `creator_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `deliverables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`link` varchar(1000) NOT NULL,
	`description` text,
	`status` enum('pending','approved','rejected') DEFAULT 'pending',
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `deliverables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `escrow` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`brandId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('held','released','refunded') DEFAULT 'held',
	`stripePaymentIntentId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`releasedAt` timestamp,
	CONSTRAINT `escrow_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`campaignId` int,
	`contractId` int,
	`type` enum('guaranteed','sponsorship','bonus') DEFAULT 'sponsorship',
	`amount` decimal(10,2) NOT NULL,
	`platformFee` decimal(10,2) DEFAULT '0.00',
	`netAmount` decimal(10,2) NOT NULL,
	`status` enum('pending','processing','completed','failed') DEFAULT 'pending',
	`stripeTransferId` varchar(255),
	`scheduledFor` timestamp,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','creator','brand') NOT NULL DEFAULT 'user';