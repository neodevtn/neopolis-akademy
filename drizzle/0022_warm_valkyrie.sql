CREATE TABLE `learner_integrity_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('review_required','confirmed','dismissed') NOT NULL DEFAULT 'review_required',
	`riskScore` int NOT NULL DEFAULT 0,
	`signals` json NOT NULL,
	`reviewerId` int,
	`reviewerNotes` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learner_integrity_reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `learner_integrity_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `learner_integrity_status_idx` ON `learner_integrity_reviews` (`status`,`updatedAt`);