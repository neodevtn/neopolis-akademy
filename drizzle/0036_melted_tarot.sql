CREATE TABLE `exam_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`certificationId` varchar(200) NOT NULL,
	`completionQualifiedAt` timestamp NOT NULL,
	`status` enum('sending','sent','failed') NOT NULL DEFAULT 'sending',
	`resendMessageId` varchar(255),
	`lastError` varchar(500),
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exam_reminders_id` PRIMARY KEY(`id`),
	CONSTRAINT `exam_reminders_user_cert_once` UNIQUE(`userId`,`certificationId`)
);
--> statement-breakpoint
CREATE INDEX `exam_reminders_status_created_idx` ON `exam_reminders` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `exam_reminders_cert_completion_idx` ON `exam_reminders` (`certificationId`,`completionQualifiedAt`);