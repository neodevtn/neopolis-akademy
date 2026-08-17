CREATE TABLE `gamification_ranks` (
	`id` varchar(40) NOT NULL,
	`label` varchar(80) NOT NULL,
	`minPoints` decimal(6,2) NOT NULL,
	`color` varchar(40) NOT NULL DEFAULT 'slate',
	`icon` varchar(80) NOT NULL DEFAULT 'award',
	`sortOrder` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gamification_ranks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gamification_settings` (
	`id` varchar(40) NOT NULL DEFAULT 'default',
	`weeklyGoalPoints` decimal(6,2) NOT NULL DEFAULT '5.00',
	`pointsLabel` varchar(120) NOT NULL DEFAULT 'Points de progression Neopolis Akademy',
	`rewardNotice` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gamification_settings_id` PRIMARY KEY(`id`)
);
