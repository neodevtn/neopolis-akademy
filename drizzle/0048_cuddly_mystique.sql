CREATE TABLE `tektek_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`certificationId` varchar(200) NOT NULL,
	`activeCourseId` varchar(200) NOT NULL,
	`language` varchar(8) NOT NULL DEFAULT 'fr',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tektek_conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `tektek_conversation_user_training_unique` UNIQUE(`userId`,`certificationId`)
);
--> statement-breakpoint
CREATE TABLE `tektek_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`sourceReferences` json,
	`model` varchar(160),
	`promptTokens` int,
	`completionTokens` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tektek_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `tektek_conversation_user_updated_idx` ON `tektek_conversations` (`userId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `tektek_message_conversation_idx` ON `tektek_messages` (`conversationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `tektek_message_created_idx` ON `tektek_messages` (`createdAt`);