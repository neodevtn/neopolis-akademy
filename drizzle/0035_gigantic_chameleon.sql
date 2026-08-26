CREATE TABLE `ai_response_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`certificationId` varchar(200),
	`courseId` varchar(200) NOT NULL,
	`lessonIndex` int NOT NULL,
	`chapterIndex` int NOT NULL,
	`blockId` varchar(255) NOT NULL,
	`attemptNumber` int NOT NULL,
	`answer` text NOT NULL,
	`rubric` json NOT NULL,
	`score` decimal(6,2) NOT NULL,
	`maxScore` decimal(6,2) NOT NULL,
	`passingScore` decimal(6,2) NOT NULL,
	`passed` int NOT NULL DEFAULT 0,
	`feedback` text NOT NULL,
	`strengths` json,
	`improvements` json,
	`model` varchar(160) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_response_evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `ai_response_evaluation_block_idx` ON `ai_response_evaluations` (`userId`,`courseId`,`blockId`);--> statement-breakpoint
CREATE INDEX `ai_response_evaluation_course_idx` ON `ai_response_evaluations` (`courseId`,`lessonIndex`,`chapterIndex`);