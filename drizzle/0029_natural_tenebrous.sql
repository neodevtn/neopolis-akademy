ALTER TABLE `course_feedback` ADD `contentRating` int;--> statement-breakpoint
ALTER TABLE `course_feedback` ADD `experienceRating` int;--> statement-breakpoint
ALTER TABLE `course_feedback` ADD `difficultyRating` int;--> statement-breakpoint
ALTER TABLE `course_feedback` ADD `recommendScore` int;--> statement-breakpoint
ALTER TABLE `course_feedback` ADD `category` enum('content','exercise','media','technical','suggestion','other');--> statement-breakpoint
ALTER TABLE `course_feedback` ADD `suggestion` text;--> statement-breakpoint
ALTER TABLE `course_feedback` ADD `status` enum('new','in_review','responded','resolved','dismissed') DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE `course_feedback` ADD `adminResponse` text;--> statement-breakpoint
ALTER TABLE `course_feedback` ADD `adminResponderId` int;--> statement-breakpoint
ALTER TABLE `course_feedback` ADD `respondedAt` timestamp;--> statement-breakpoint
ALTER TABLE `course_feedback` ADD `resolvedAt` timestamp;--> statement-breakpoint
CREATE INDEX `course_feedback_status_idx` ON `course_feedback` (`status`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `course_feedback_category_idx` ON `course_feedback` (`category`,`updatedAt`);