CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`password` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `account_id` PRIMARY KEY(`id`),
	CONSTRAINT `account_provider_unique` UNIQUE(`provider_id`,`account_id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36),
	`user_id` varchar(36),
	`action` varchar(120) NOT NULL,
	`entity_type` varchar(80),
	`entity_id` varchar(36),
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `billing_periods` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`plan_id` varchar(36) NOT NULL,
	`period_key` varchar(40) NOT NULL,
	`due_at` timestamp NOT NULL,
	`amount` bigint unsigned NOT NULL,
	`currency` varchar(3) NOT NULL,
	`status` enum('PENDING','IN_PROCESS','APPROVED','REJECTED','OVERDUE','CANCELED','REFUNDED','CHARGED_BACK') NOT NULL DEFAULT 'PENDING',
	`payment_link` text,
	`paid_at` timestamp,
	`canceled_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `billing_periods_id` PRIMARY KEY(`id`),
	CONSTRAINT `billing_period_plan_key_unique` UNIQUE(`plan_id`,`period_key`)
);
--> statement-breakpoint
CREATE TABLE `billing_plans` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`service_name` varchar(255) NOT NULL,
	`amount` bigint unsigned NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'ARS',
	`frequency` enum('WEEKLY','BIWEEKLY','MONTHLY','CUSTOM') NOT NULL,
	`interval_days` int,
	`due_day` int,
	`status` enum('ACTIVE','PAUSED','CANCELED') NOT NULL DEFAULT 'ACTIVE',
	`next_period_at` timestamp NOT NULL,
	`paused_at` timestamp,
	`canceled_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `billing_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `business_settings` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`business_name` varchar(255) NOT NULL,
	`contact_email` varchar(255),
	`default_service_name` varchar(255),
	`default_currency` varchar(3) NOT NULL DEFAULT 'ARS',
	`default_amount` bigint unsigned NOT NULL DEFAULT 0,
	`default_frequency` enum('WEEKLY','BIWEEKLY','MONTHLY','CUSTOM') NOT NULL DEFAULT 'MONTHLY',
	`default_due_day` int NOT NULL DEFAULT 10,
	`reminder_days_before` int NOT NULL DEFAULT 3,
	`overdue_reminders_enabled` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `business_settings_org_unique` UNIQUE(`organization_id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`phone` varchar(80),
	`notes` text,
	`status` enum('ACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organization_members` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` enum('OWNER','ADMIN','MEMBER') NOT NULL DEFAULT 'MEMBER',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organization_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `organization_member_unique` UNIQUE(`organization_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`support_email` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organization_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `payment_connections` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`provider` enum('MERCADO_PAGO','STRIPE','GALIO') NOT NULL,
	`provider_account_id` varchar(255),
	`encrypted_access_token` text,
	`encrypted_refresh_token` text,
	`token_expires_at` timestamp,
	`status` enum('CONNECTED','DISCONNECTED','ERROR') NOT NULL DEFAULT 'DISCONNECTED',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_connection_org_provider_unique` UNIQUE(`organization_id`,`provider`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`billing_period_id` varchar(36) NOT NULL,
	`provider` enum('MERCADO_PAGO','STRIPE','GALIO') NOT NULL,
	`provider_payment_id` varchar(255) NOT NULL,
	`external_reference` varchar(255) NOT NULL,
	`amount` bigint unsigned NOT NULL,
	`currency` varchar(3) NOT NULL,
	`status` varchar(60) NOT NULL,
	`raw_payload` json,
	`paid_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_provider_id_unique` UNIQUE(`provider`,`provider_payment_id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`ip_address` varchar(255),
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`role` enum('USER','SUPER_ADMIN') NOT NULL DEFAULT 'USER',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` varchar(36) NOT NULL,
	`provider` enum('MERCADO_PAGO','STRIPE','GALIO') NOT NULL,
	`provider_event_id` varchar(255) NOT NULL,
	`payload` json NOT NULL,
	`status` enum('RECEIVED','PROCESSED','FAILED') NOT NULL DEFAULT 'RECEIVED',
	`error` text,
	`processed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `webhook_provider_event_unique` UNIQUE(`provider`,`provider_event_id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `billing_periods` ADD CONSTRAINT `billing_periods_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `billing_periods` ADD CONSTRAINT `billing_periods_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `billing_periods` ADD CONSTRAINT `billing_periods_plan_id_billing_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `billing_plans`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `billing_plans` ADD CONSTRAINT `billing_plans_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `billing_plans` ADD CONSTRAINT `billing_plans_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `business_settings` ADD CONSTRAINT `business_settings_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organization_members` ADD CONSTRAINT `organization_members_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organization_members` ADD CONSTRAINT `organization_members_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_connections` ADD CONSTRAINT `payment_connections_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_billing_period_id_billing_periods_id_fk` FOREIGN KEY (`billing_period_id`) REFERENCES `billing_periods`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_user_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `audit_org_created_idx` ON `audit_logs` (`organization_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `billing_period_org_status_idx` ON `billing_periods` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `billing_period_client_idx` ON `billing_periods` (`client_id`);--> statement-breakpoint
CREATE INDEX `billing_period_due_idx` ON `billing_periods` (`due_at`);--> statement-breakpoint
CREATE INDEX `billing_plan_org_idx` ON `billing_plans` (`organization_id`);--> statement-breakpoint
CREATE INDEX `billing_plan_client_idx` ON `billing_plans` (`client_id`);--> statement-breakpoint
CREATE INDEX `billing_plan_next_idx` ON `billing_plans` (`status`,`next_period_at`);--> statement-breakpoint
CREATE INDEX `client_organization_idx` ON `clients` (`organization_id`);--> statement-breakpoint
CREATE INDEX `client_name_idx` ON `clients` (`name`);--> statement-breakpoint
CREATE INDEX `organization_member_user_idx` ON `organization_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `payment_period_idx` ON `payments` (`billing_period_id`);--> statement-breakpoint
CREATE INDEX `session_user_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);