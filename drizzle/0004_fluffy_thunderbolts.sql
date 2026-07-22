CREATE TABLE `exam_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`certificationId` varchar(200) NOT NULL,
	`score` int NOT NULL,
	`totalQuestions` int NOT NULL,
	`correctAnswers` int NOT NULL,
	`passed` int NOT NULL DEFAULT 0,
	`domainScores` json,
	`startedAt` timestamp NOT NULL,
	`finishedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`certificationId` varchar(200) NOT NULL,
	`courseId` varchar(200) NOT NULL,
	`lessonIndex` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `training_progress_id` PRIMARY KEY(`id`)
);
