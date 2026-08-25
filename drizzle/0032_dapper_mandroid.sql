CREATE TABLE `referral_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	`tokenRewardLabel` varchar(300) NOT NULL DEFAULT 'Tokens gratuits',
	`giftRewardLabel` varchar(300) NOT NULL DEFAULT 'Cadeaux Neopolis',
	`eligibilityText` text,
	`shareMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referral_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referral_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`userId` int NOT NULL,
	`code` varchar(48) NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referral_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_codes_code_unique` UNIQUE(`code`),
	CONSTRAINT `referral_code_user_campaign_unique` UNIQUE(`userId`,`campaignId`)
);
--> statement-breakpoint
CREATE TABLE `referral_conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`referralCodeId` int NOT NULL,
	`referrerUserId` int NOT NULL,
	`applicationId` int NOT NULL,
	`referredEmail` varchar(320) NOT NULL,
	`sourceChannel` varchar(80),
	`shareTarget` varchar(80),
	`status` enum('pending','eligible','rewarded','rejected') NOT NULL DEFAULT 'pending',
	`rewardNote` text,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referral_conversions_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_conversion_application_unique` UNIQUE(`applicationId`)
);
--> statement-breakpoint
ALTER TABLE `applications` ADD `referralCode` varchar(48);--> statement-breakpoint
ALTER TABLE `applications` ADD `referrerUserId` int;--> statement-breakpoint
ALTER TABLE `applications` ADD `referralSource` varchar(80);--> statement-breakpoint
CREATE INDEX `referral_code_campaign_idx` ON `referral_codes` (`campaignId`,`active`);--> statement-breakpoint
CREATE INDEX `referral_conversion_referrer_idx` ON `referral_conversions` (`referrerUserId`,`status`);--> statement-breakpoint
CREATE INDEX `referral_conversion_campaign_idx` ON `referral_conversions` (`campaignId`,`status`);