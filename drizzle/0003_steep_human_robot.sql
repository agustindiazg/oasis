CREATE TABLE `waitlist_leads` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`source` varchar(80) NOT NULL DEFAULT 'landing',
	`status` enum('NEW','CONTACTED','CONVERTED','UNSUBSCRIBED') NOT NULL DEFAULT 'NEW',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `waitlist_leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `waitlist_lead_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `waitlist_lead_status_idx` ON `waitlist_leads` (`status`);