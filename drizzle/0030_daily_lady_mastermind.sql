CREATE TABLE `exam_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`certificationId` varchar(200) NOT NULL,
	`questions` json NOT NULL,
	`answers` json NOT NULL,
	`currentIndex` int NOT NULL DEFAULT 0,
	`selectedIds` json NOT NULL,
	`startedAt` timestamp NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exam_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `exam_sessions_user_cert_unique` UNIQUE(`userId`,`certificationId`)
);
