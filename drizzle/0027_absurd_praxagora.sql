CREATE TABLE `course_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`certificationId` varchar(200) NOT NULL,
	`courseId` varchar(200) NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_feedback_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_feedback_user_course_once` UNIQUE(`userId`,`courseId`)
);
--> statement-breakpoint
CREATE TABLE `learner_activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`actionType` varchar(80) NOT NULL,
	`certificationId` varchar(200),
	`courseId` varchar(200),
	`lessonIndex` int,
	`chapterIndex` int,
	`exerciseId` varchar(255),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learner_activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `course_feedback_course_idx` ON `course_feedback` (`courseId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `course_feedback_user_idx` ON `course_feedback` (`userId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `learner_activity_user_created_idx` ON `learner_activity_log` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `learner_activity_action_created_idx` ON `learner_activity_log` (`actionType`,`createdAt`);--> statement-breakpoint
CREATE INDEX `learner_activity_course_idx` ON `learner_activity_log` (`courseId`,`createdAt`);