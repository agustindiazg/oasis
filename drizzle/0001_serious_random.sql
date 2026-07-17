CREATE TABLE `reminder_deliveries` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`billing_period_id` varchar(36) NOT NULL,
	`delivery_key` varchar(120) NOT NULL,
	`channel` enum('EMAIL') NOT NULL DEFAULT 'EMAIL',
	`kind` enum('BEFORE_DUE','OVERDUE') NOT NULL,
	`recipient` varchar(255) NOT NULL,
	`status` enum('SCHEDULED','SENT','FAILED') NOT NULL DEFAULT 'SCHEDULED',
	`provider_message_id` varchar(255),
	`error` text,
	`sent_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reminder_deliveries_id` PRIMARY KEY(`id`),
	CONSTRAINT `reminder_delivery_key_unique` UNIQUE(`delivery_key`)
);
--> statement-breakpoint
ALTER TABLE `reminder_deliveries` ADD CONSTRAINT `reminder_deliveries_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reminder_deliveries` ADD CONSTRAINT `reminder_deliveries_billing_period_id_billing_periods_id_fk` FOREIGN KEY (`billing_period_id`) REFERENCES `billing_periods`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `reminder_org_status_idx` ON `reminder_deliveries` (`organization_id`,`status`);