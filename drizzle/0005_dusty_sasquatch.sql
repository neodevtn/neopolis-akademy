CREATE TABLE `video_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` varchar(200) NOT NULL,
	`youtubeId` varchar(50) NOT NULL,
	`watchedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_progress_id` PRIMARY KEY(`id`)
);
