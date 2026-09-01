CREATE TABLE `scheduled_job_registry` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobKey` varchar(80) NOT NULL,
	`taskUid` varchar(65) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_job_registry_id` PRIMARY KEY(`id`),
	CONSTRAINT `scheduled_job_registry_key_once` UNIQUE(`jobKey`),
	CONSTRAINT `scheduled_job_registry_task_once` UNIQUE(`taskUid`)
);
