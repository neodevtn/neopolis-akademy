CREATE TABLE `email_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resendMessageId` varchar(100) NOT NULL,
	`type` enum('sent','delivered','bounced','complained','opened','clicked') NOT NULL,
	`email` varchar(320) NOT NULL,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_invitations` ADD `emailDeliveryStatus` enum('sent','delivered','bounced','complained','suppressed') DEFAULT 'sent';--> statement-breakpoint
ALTER TABLE `user_invitations` ADD `resendMessageId` varchar(100);--> statement-breakpoint
ALTER TABLE `user_invitations` ADD `applicationId` int;