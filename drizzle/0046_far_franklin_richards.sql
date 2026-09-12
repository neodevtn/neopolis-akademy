CREATE TABLE `private_message_notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`webEnabled` int NOT NULL DEFAULT 1,
	`emailEnabled` int NOT NULL DEFAULT 1,
	`soundEnabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `private_message_notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `private_message_notification_preferences_user_unique` UNIQUE(`userId`)
);
