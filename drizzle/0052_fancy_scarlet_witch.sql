CREATE TABLE `indexnow_submission_state` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revision` varchar(64) NOT NULL,
	`reason` varchar(120) NOT NULL,
	`status` enum('pending','processing','submitted','failed') NOT NULL DEFAULT 'pending',
	`urlCount` int NOT NULL DEFAULT 0,
	`attemptCount` int NOT NULL DEFAULT 0,
	`lastHttpStatus` int,
	`lastError` text,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`nextAttemptAt` timestamp NOT NULL DEFAULT (now()),
	`lastAttemptAt` timestamp,
	`submittedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `indexnow_submission_state_id` PRIMARY KEY(`id`),
	CONSTRAINT `indexnow_submission_revision_unique` UNIQUE(`revision`)
);
--> statement-breakpoint
CREATE INDEX `indexnow_submission_status_next_idx` ON `indexnow_submission_state` (`status`,`nextAttemptAt`);