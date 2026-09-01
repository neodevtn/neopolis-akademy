ALTER TABLE `exam_attempts` ADD `timeLimitMinutes` int;--> statement-breakpoint
ALTER TABLE `exam_attempts` ADD `timedOut` int DEFAULT 0 NOT NULL;