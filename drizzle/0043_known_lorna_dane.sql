CREATE TABLE `talent_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('workgroup','mission','opportunity','recruitment','ambassador','partnership') NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`status` enum('proposed','active','paused','completed','declined','withdrawn') NOT NULL DEFAULT 'proposed',
	`startsAt` timestamp,
	`endsAt` timestamp,
	`visibleToLearner` int NOT NULL DEFAULT 1,
	`metadata` json,
	`assignedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `talent_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `talent_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`eventId` int,
	`userId` int NOT NULL,
	`evaluationType` varchar(120) NOT NULL,
	`score` decimal(7,2),
	`maxScore` decimal(7,2),
	`recommendation` enum('continue','develop','certify','assign','recruit','ambassador','hold','decline') NOT NULL DEFAULT 'continue',
	`rubric` json,
	`strengths` text,
	`improvements` text,
	`learnerFeedback` text,
	`privateNotes` text,
	`visibleToLearner` int NOT NULL DEFAULT 0,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `talent_evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `talent_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('interview','evaluation','certification_test','certification_review','onboarding','follow_up','other') NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`modality` enum('video','in_person','phone','platform','external','other') NOT NULL DEFAULT 'video',
	`status` enum('requested','scheduled','completed','cancelled','missed') NOT NULL DEFAULT 'requested',
	`responseStatus` enum('pending','accepted','declined','reschedule_requested') NOT NULL DEFAULT 'pending',
	`startsAt` timestamp,
	`endsAt` timestamp,
	`timezone` varchar(80) NOT NULL DEFAULT 'UTC',
	`location` varchar(500),
	`meetingUrl` varchar(1000),
	`certificationId` varchar(200),
	`learnerInstructions` text,
	`privateNotes` text,
	`visibleToLearner` int NOT NULL DEFAULT 1,
	`learnerResponseNote` text,
	`respondedAt` timestamp,
	`notificationStatus` enum('not_requested','sent','failed') NOT NULL DEFAULT 'not_requested',
	`notifiedAt` timestamp,
	`lastNotificationError` varchar(500),
	`createdBy` int NOT NULL,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `talent_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `talent_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stageId` int,
	`ownerId` int,
	`sourceApplicationId` int,
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`availability` enum('unknown','available','busy','unavailable') NOT NULL DEFAULT 'unknown',
	`headline` varchar(300),
	`summary` text,
	`nextReviewAt` timestamp,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `talent_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `talent_profile_user_once` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `talent_stage_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`userId` int NOT NULL,
	`fromStageId` int,
	`toStageId` int NOT NULL,
	`reason` text,
	`changedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `talent_stage_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `talent_stages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(80) NOT NULL,
	`label` json NOT NULL,
	`description` json,
	`color` varchar(20) NOT NULL DEFAULT '#2563eb',
	`icon` varchar(80) NOT NULL DEFAULT 'user-round-search',
	`sortOrder` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`isSystem` int NOT NULL DEFAULT 0,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `talent_stages_id` PRIMARY KEY(`id`),
	CONSTRAINT `talent_stages_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `talent_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`status` enum('open','in_progress','completed','cancelled') NOT NULL DEFAULT 'open',
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`dueAt` timestamp,
	`ownerId` int,
	`completedAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `talent_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `talent_assignment_user_status_idx` ON `talent_assignments` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `talent_evaluation_user_created_idx` ON `talent_evaluations` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `talent_event_user_start_idx` ON `talent_events` (`userId`,`startsAt`);--> statement-breakpoint
CREATE INDEX `talent_event_status_start_idx` ON `talent_events` (`status`,`startsAt`);--> statement-breakpoint
CREATE INDEX `talent_profile_stage_priority_idx` ON `talent_profiles` (`stageId`,`priority`);--> statement-breakpoint
CREATE INDEX `talent_profile_owner_review_idx` ON `talent_profiles` (`ownerId`,`nextReviewAt`);--> statement-breakpoint
CREATE INDEX `talent_stage_history_user_idx` ON `talent_stage_history` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `talent_stage_active_order_idx` ON `talent_stages` (`active`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `talent_task_owner_status_due_idx` ON `talent_tasks` (`ownerId`,`status`,`dueAt`);--> statement-breakpoint
CREATE INDEX `talent_task_user_idx` ON `talent_tasks` (`userId`,`createdAt`);