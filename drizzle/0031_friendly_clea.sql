CREATE TABLE `invitation_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invitationId` int NOT NULL,
	`groupId` int NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invitation_groups_id` PRIMARY KEY(`id`),
	CONSTRAINT `invitation_group_unique` UNIQUE(`invitationId`,`groupId`)
);
--> statement-breakpoint
CREATE TABLE `learner_group_courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`certificationId` varchar(200),
	`courseId` varchar(200) NOT NULL,
	`assignedBy` int,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learner_group_courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `learner_group_course_unique` UNIQUE(`groupId`,`courseId`)
);
--> statement-breakpoint
CREATE TABLE `learner_group_memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`groupId` int NOT NULL,
	`assignedBy` int,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learner_group_memberships_id` PRIMARY KEY(`id`),
	CONSTRAINT `learner_group_membership_unique` UNIQUE(`userId`,`groupId`)
);
--> statement-breakpoint
CREATE TABLE `learner_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`color` varchar(20) NOT NULL DEFAULT '#1d4ed8',
	`isSystem` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learner_groups_id` PRIMARY KEY(`id`),
	CONSTRAINT `learner_groups_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE INDEX `invitation_group_invitation_idx` ON `invitation_groups` (`invitationId`);--> statement-breakpoint
CREATE INDEX `learner_group_course_course_idx` ON `learner_group_courses` (`courseId`,`groupId`);--> statement-breakpoint
CREATE INDEX `learner_group_membership_group_idx` ON `learner_group_memberships` (`groupId`,`userId`);