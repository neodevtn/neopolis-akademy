CREATE TABLE `private_message_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`messageId` int NOT NULL,
	`storageKey` varchar(520) NOT NULL,
	`originalName` varchar(180) NOT NULL,
	`mimeType` enum('image/jpeg','image/png','image/gif','image/webp','application/pdf') NOT NULL,
	`sizeBytes` int NOT NULL,
	`uploadedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `private_message_attachments_id` PRIMARY KEY(`id`),
	CONSTRAINT `private_message_attachments_storage_key_unique` UNIQUE(`storageKey`)
);
--> statement-breakpoint
ALTER TABLE `private_message_events` MODIFY COLUMN `eventType` enum('conversation_created','message_sent','attachment_uploaded','conversation_closed','conversation_reopened','learner_delivered','admin_delivered','learner_read','admin_read','notification_requested','notification_delivered','notification_failed') NOT NULL;--> statement-breakpoint
ALTER TABLE `private_messages` ADD `learnerDeliveredAt` timestamp;--> statement-breakpoint
ALTER TABLE `private_messages` ADD `adminDeliveredAt` timestamp;--> statement-breakpoint
CREATE INDEX `private_message_attachments_message_idx` ON `private_message_attachments` (`messageId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `private_message_attachments_conversation_idx` ON `private_message_attachments` (`conversationId`,`createdAt`);