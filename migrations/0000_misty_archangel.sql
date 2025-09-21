CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`achievement_type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`badge_icon` varchar(100),
	`unlocked_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`category` varchar(50) NOT NULL,
	`subcategory` varchar(100),
	`quantity` decimal(10,3) NOT NULL,
	`unit` varchar(20) NOT NULL,
	`co2_emissions` decimal(10,3) NOT NULL,
	`date` datetime NOT NULL,
	`description` text,
	`department` varchar(100),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `emissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`goal_name` varchar(255) NOT NULL,
	`goal_type` varchar(50) NOT NULL,
	`target_value` decimal(10,3) NOT NULL,
	`current_value` decimal(10,3) DEFAULT '0',
	`target_date` datetime NOT NULL,
	`status` varchar(20) DEFAULT 'active',
	`category` varchar(50),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`completed_at` timestamp,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`message` text NOT NULL,
	`is_read` varchar(5) DEFAULT 'false',
	`scheduled_for` datetime,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`report_type` varchar(50) NOT NULL,
	`report_date` datetime NOT NULL,
	`file_path` varchar(500),
	`file_format` varchar(10),
	`report_data` json,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` varchar(50) NOT NULL,
	`target_role` varchar(20) NOT NULL,
	`impact_level` varchar(20) DEFAULT 'medium',
	`is_active` varchar(5) DEFAULT 'true',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `tips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'individual',
	`first_name` varchar(100),
	`last_name` varchar(100),
	`company_name` varchar(255),
	`company_department` varchar(100),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
