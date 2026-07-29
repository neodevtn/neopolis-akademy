CREATE TABLE `admin_activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`targetType` varchar(50) NOT NULL,
	`targetId` int,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetType` enum('user','application') NOT NULL,
	`targetId` int NOT NULL,
	`authorId` int NOT NULL,
	`content` text NOT NULL,
	`category` enum('general','evaluation','follow_up','alert','decision') NOT NULL DEFAULT 'general',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`color` varchar(20) NOT NULL DEFAULT '#6b7280',
	`description` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_tags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `communications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(500) NOT NULL,
	`body` text NOT NULL,
	`type` enum('invitation','announcement','reminder','welcome','custom') NOT NULL,
	`recipientFilter` json,
	`recipientCount` int NOT NULL DEFAULT 0,
	`sentBy` int NOT NULL,
	`status` enum('draft','sending','sent','failed') NOT NULL DEFAULT 'draft',
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tagId` int NOT NULL,
	`assignedBy` int NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_tags_id` PRIMARY KEY(`id`)
);
