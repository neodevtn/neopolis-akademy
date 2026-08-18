CREATE TABLE `communication_segments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`recipientFilter` json NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communication_segments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `communications` MODIFY COLUMN `status` enum('draft','scheduled','sending','sent','failed','cancelled') NOT NULL DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `communications` ADD `scheduledAt` timestamp;--> statement-breakpoint
ALTER TABLE `communications` ADD `schedule_cron_task_uid` varchar(65);--> statement-breakpoint
CREATE INDEX `communication_segments_creator_idx` ON `communication_segments` (`createdBy`);--> statement-breakpoint
CREATE INDEX `communications_schedule_task_idx` ON `communications` (`schedule_cron_task_uid`);--> statement-breakpoint
CREATE INDEX `communications_scheduled_at_idx` ON `communications` (`scheduledAt`);