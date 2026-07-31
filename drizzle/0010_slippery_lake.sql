CREATE TABLE `video_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`videoId` varchar(32) NOT NULL,
	`lessonId` varchar(255) NOT NULL,
	`certId` varchar(255) NOT NULL,
	`reason` enum('not_relevant','obsolete','broken_link','other') NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_feedback_id` PRIMARY KEY(`id`)
);
