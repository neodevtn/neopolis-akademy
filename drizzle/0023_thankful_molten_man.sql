CREATE TABLE `learner_orientation_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('not_started','goals_set','completed') NOT NULL DEFAULT 'not_started',
	`goals` json,
	`wantsOfficialCertification` int NOT NULL DEFAULT 0,
	`officialCertificationIds` json,
	`assessment` json,
	`recommendations` json,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
		CONSTRAINT `learner_orientation_profiles_id` PRIMARY KEY(`id`),
		CONSTRAINT `learner_orientation_profiles_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `learner_orientation_profile_user_once` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `learner_orientation_profile_status_idx` ON `learner_orientation_profiles` (`status`);
