ALTER TABLE `payment_connections` ADD `environment` enum('PRODUCTION','SANDBOX') NOT NULL DEFAULT 'PRODUCTION';
