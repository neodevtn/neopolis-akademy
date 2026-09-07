ALTER TABLE `email_events` ADD `webhookEventId` varchar(255);--> statement-breakpoint
ALTER TABLE `email_events` ADD CONSTRAINT `email_events_webhook_event_unique` UNIQUE(`webhookEventId`);