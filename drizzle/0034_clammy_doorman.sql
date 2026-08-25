CREATE TABLE `course_lifecycle_states` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` varchar(200) NOT NULL,
	`status` enum('active','disabled','archived') NOT NULL DEFAULT 'active',
	`reason` text,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_lifecycle_states_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_lifecycle_states_courseId_unique` UNIQUE(`courseId`)
);
--> statement-breakpoint
CREATE INDEX `course_lifecycle_status_idx` ON `course_lifecycle_states` (`status`);