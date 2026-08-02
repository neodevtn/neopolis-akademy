CREATE TABLE `client_errors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message` varchar(500) NOT NULL,
	`stack` text,
	`source` enum('window','promise','boundary','manual') NOT NULL,
	`url` varchar(500) NOT NULL,
	`componentStack` text,
	`clientTimestamp` timestamp NOT NULL,
	`ip` varchar(45),
	`userAgent` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_errors_id` PRIMARY KEY(`id`)
);
