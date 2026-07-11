CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`phase` text NOT NULL,
	`task_no` text NOT NULL,
	`name_zh` text NOT NULL,
	`name_en` text NOT NULL,
	`owner` text NOT NULL,
	`status` text NOT NULL,
	`planned_start` text,
	`planned_end` text,
	`actual_start` text,
	`actual_end` text,
	`updated_at` integer NOT NULL
);
