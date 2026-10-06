CREATE TABLE `direct_exam_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`certificationId` varchar(200) NOT NULL,
	`name` varchar(200),
	`tokenHash` varchar(64) NOT NULL,
	`status` enum('pending','accepted','revoked') NOT NULL DEFAULT 'pending',
	`acceptedUserId` int,
	`invitedBy` int NOT NULL,
	`acceptedAt` timestamp,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `direct_exam_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `direct_exam_invitation_email_cert_unique` UNIQUE(`email`,`certificationId`),
	CONSTRAINT `direct_exam_invitation_token_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE INDEX `direct_exam_invitation_user_status_idx` ON `direct_exam_invitations` (`acceptedUserId`,`status`);--> statement-breakpoint
CREATE INDEX `direct_exam_invitation_cert_status_idx` ON `direct_exam_invitations` (`certificationId`,`status`);