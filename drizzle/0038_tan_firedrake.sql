CREATE TABLE `certification_exams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`certificationId` varchar(200) NOT NULL,
	`configuration` json NOT NULL,
	`questions` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `certification_exams_id` PRIMARY KEY(`id`),
	CONSTRAINT `certification_exams_cert_unique` UNIQUE(`certificationId`)
);
