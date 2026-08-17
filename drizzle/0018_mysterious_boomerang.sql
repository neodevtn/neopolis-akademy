CREATE TABLE `competency_contribution_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`competencyId` varchar(80) NOT NULL,
	`sourceType` varchar(80) NOT NULL,
	`sourceKey` varchar(255) NOT NULL DEFAULT '*',
	`label` varchar(255) NOT NULL,
	`points` decimal(6,2) NOT NULL,
	`minScore` decimal(5,2),
	`active` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competency_contribution_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competency_definitions` (
	`id` varchar(80) NOT NULL,
	`title` json NOT NULL,
	`description` json,
	`category` varchar(100) NOT NULL DEFAULT 'ai',
	`icon` varchar(80) NOT NULL DEFAULT 'sparkles',
	`color` varchar(40) NOT NULL DEFAULT 'blue',
	`maxPoints` decimal(6,2) NOT NULL DEFAULT '100.00',
	`sortOrder` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competency_definitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learner_competency_contributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`competencyId` varchar(80) NOT NULL,
	`ruleId` int NOT NULL,
	`sourceType` varchar(80) NOT NULL,
	`sourceKey` varchar(255) NOT NULL,
	`eventKey` varchar(255) NOT NULL,
	`points` decimal(6,2) NOT NULL,
	`score` decimal(5,2),
	`evidence` json,
	`awardedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learner_competency_contributions_id` PRIMARY KEY(`id`),
	CONSTRAINT `learner_competency_once` UNIQUE(`userId`,`ruleId`,`eventKey`)
);
--> statement-breakpoint
CREATE INDEX `competency_rule_competency_idx` ON `competency_contribution_rules` (`competencyId`);--> statement-breakpoint
CREATE INDEX `competency_rule_source_idx` ON `competency_contribution_rules` (`sourceType`,`sourceKey`);--> statement-breakpoint
CREATE INDEX `learner_competency_user_idx` ON `learner_competency_contributions` (`userId`);--> statement-breakpoint
CREATE INDEX `learner_competency_skill_idx` ON `learner_competency_contributions` (`competencyId`);