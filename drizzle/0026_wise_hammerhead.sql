CREATE TABLE `learner_orientation_proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`proposedBy` int NOT NULL,
	`goals` json NOT NULL,
	`wantsOfficialCertification` int NOT NULL DEFAULT 0,
	`officialCertificationIds` json,
	`certificationTargetDates` json,
	`justification` text NOT NULL,
	`status` enum('pending','accepted','declined') NOT NULL DEFAULT 'pending',
	`respondedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learner_orientation_proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `orientation_proposal_user_status_idx` ON `learner_orientation_proposals` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `orientation_proposal_admin_idx` ON `learner_orientation_proposals` (`proposedBy`);