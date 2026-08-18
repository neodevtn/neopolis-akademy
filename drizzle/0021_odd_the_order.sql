CREATE TABLE `communication_receipts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`communicationId` int NOT NULL,
	`userId` int NOT NULL,
	`readAt` timestamp,
	`acknowledgedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communication_receipts_id` PRIMARY KEY(`id`),
	CONSTRAINT `communication_receipt_user_unique` UNIQUE(`communicationId`,`userId`)
);
--> statement-breakpoint
ALTER TABLE `communications` ADD `isImportant` int DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `communication_receipts_user_idx` ON `communication_receipts` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `communication_receipts_pending_idx` ON `communication_receipts` (`userId`,`acknowledgedAt`);