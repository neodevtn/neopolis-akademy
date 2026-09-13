CREATE TABLE `tektek_budget_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scope` enum('global','training','course','user') NOT NULL,
	`scopeKey` varchar(200) NOT NULL,
	`monthlyTokenBudget` int NOT NULL,
	`alertThresholdPercent` int NOT NULL DEFAULT 80,
	`updatedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tektek_budget_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `tektek_budget_scope_unique` UNIQUE(`scope`,`scopeKey`)
);
--> statement-breakpoint
ALTER TABLE `tektek_messages` ADD `courseId` varchar(200);--> statement-breakpoint
CREATE INDEX `tektek_budget_updated_idx` ON `tektek_budget_settings` (`updatedAt`);--> statement-breakpoint
CREATE INDEX `tektek_message_course_created_idx` ON `tektek_messages` (`courseId`,`createdAt`);