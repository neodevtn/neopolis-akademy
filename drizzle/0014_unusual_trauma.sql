CREATE TABLE `exercise_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`courseId` varchar(128) NOT NULL,
	`moduleId` varchar(128) NOT NULL,
	`score` int NOT NULL,
	`totalQuestions` int NOT NULL,
	`answers` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exercise_results_id` PRIMARY KEY(`id`)
);
