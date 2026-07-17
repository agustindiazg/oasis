ALTER TABLE `user` ADD `clerk_user_id` varchar(64);
CREATE UNIQUE INDEX `user_clerk_user_id_unique` ON `user` (`clerk_user_id`);
