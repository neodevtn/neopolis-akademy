CREATE TABLE `learning_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`certificationId` varchar(200),
	`courseId` varchar(200),
	`lessonIndex` int,
	`chapterIndex` int,
	`exerciseId` varchar(255),
	`durationSeconds` int NOT NULL DEFAULT 0,
	`success` int,
	`score` int,
	`attemptNumber` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_events_id` PRIMARY KEY(`id`)
);
