CREATE TABLE `learner_achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('skill_badge','certification') NOT NULL,
	`achievementKey` varchar(255) NOT NULL,
	`certificationId` varchar(200),
	`courseId` varchar(200),
	`title` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(80) NOT NULL DEFAULT 'award',
	`credentialCode` varchar(120) NOT NULL,
	`evidence` json,
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`emailedAt` timestamp,
	CONSTRAINT `learner_achievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `learner_achievements_credentialCode_unique` UNIQUE(`credentialCode`),
	CONSTRAINT `learner_achievement_once` UNIQUE(`userId`,`kind`,`achievementKey`)
);
--> statement-breakpoint
CREATE INDEX `learner_achievement_user_idx` ON `learner_achievements` (`userId`);--> statement-breakpoint
CREATE INDEX `learner_achievement_certification_idx` ON `learner_achievements` (`certificationId`);