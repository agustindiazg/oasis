CREATE TABLE `service_plans` (
  `id` varchar(36) NOT NULL,
  `organization_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `amount` bigint unsigned NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'ARS',
  `frequency` enum('WEEKLY','BIWEEKLY','MONTHLY','CUSTOM') NOT NULL,
  `interval_days` int,
  `due_day` int,
  `status` enum('ACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `service_plan_org_idx` (`organization_id`),
  KEY `service_plan_status_idx` (`organization_id`,`status`),
  CONSTRAINT `service_plans_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
);
--> statement-breakpoint
ALTER TABLE `billing_plans` ADD `service_plan_id` varchar(36);
--> statement-breakpoint
ALTER TABLE `billing_plans` ADD CONSTRAINT `billing_plans_service_plan_id_fk` FOREIGN KEY (`service_plan_id`) REFERENCES `service_plans` (`id`) ON DELETE SET NULL;
--> statement-breakpoint
CREATE INDEX `billing_plan_service_idx` ON `billing_plans` (`service_plan_id`);
