CREATE TABLE `private_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`learnerId` int NOT NULL,
	`subject` varchar(220) NOT NULL,
	`status` enum('open','closed') NOT NULL DEFAULT 'open',
	`source` enum('learner','admin','integrity_review','problem_report') NOT NULL DEFAULT 'learner',
	`initiatedByUserId` int,
	`closedByUserId` int,
	`closedAt` timestamp,
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	`lastMessagePreview` varchar(280),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `private_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `private_message_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`messageId` int,
	`actorUserId` int,
	`eventType` enum('conversation_created','message_sent','conversation_closed','conversation_reopened','learner_read','admin_read','notification_requested','notification_delivered','notification_failed') NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `private_message_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `private_message_notification_state` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`messageId` int NOT NULL,
	`recipientUserId` int NOT NULL,
	`channel` enum('web','email') NOT NULL,
	`status` enum('pending','sent','failed','suppressed') NOT NULL DEFAULT 'pending',
	`errorCode` varchar(160),
	`attemptedAt` timestamp,
	`deliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `private_message_notification_state_id` PRIMARY KEY(`id`),
	CONSTRAINT `private_message_notification_unique` UNIQUE(`messageId`,`recipientUserId`,`channel`)
);
--> statement-breakpoint
CREATE TABLE `private_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`authorUserId` int,
	`authorRole` enum('learner','admin','system') NOT NULL,
	`body` text NOT NULL,
	`learnerReadAt` timestamp,
	`adminReadAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `private_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `private_conversations_learner_idx` ON `private_conversations` (`learnerId`,`lastMessageAt`);--> statement-breakpoint
CREATE INDEX `private_conversations_status_idx` ON `private_conversations` (`status`,`lastMessageAt`);--> statement-breakpoint
CREATE INDEX `private_message_events_conversation_idx` ON `private_message_events` (`conversationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `private_message_events_message_idx` ON `private_message_events` (`messageId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `private_message_notification_recipient_idx` ON `private_message_notification_state` (`recipientUserId`,`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `private_messages_conversation_idx` ON `private_messages` (`conversationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `private_messages_learner_unread_idx` ON `private_messages` (`learnerReadAt`,`conversationId`);--> statement-breakpoint
CREATE INDEX `private_messages_admin_unread_idx` ON `private_messages` (`adminReadAt`,`conversationId`);