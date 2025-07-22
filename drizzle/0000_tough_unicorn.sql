CREATE TABLE `rooms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_number` text NOT NULL,
	`room_type` text NOT NULL,
	`floor` integer NOT NULL,
	`max_occupancy` integer NOT NULL,
	`base_rate` real NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`amenities` text,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rooms_room_number_unique` ON `rooms` (`room_number`);--> statement-breakpoint
CREATE TABLE `guests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`id_type` text,
	`id_number` text,
	`nationality` text,
	`address` text,
	`city` text,
	`country` text,
	`date_of_birth` text,
	`special_requests` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guests_email_unique` ON `guests` (`email`);--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`confirmation_number` text NOT NULL,
	`guest_id` integer NOT NULL,
	`room_id` integer NOT NULL,
	`check_in_date` text NOT NULL,
	`check_out_date` text NOT NULL,
	`number_of_guests` integer DEFAULT 1 NOT NULL,
	`number_of_nights` integer NOT NULL,
	`room_rate` real NOT NULL,
	`total_amount` real NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`special_requests` text,
	`notes` text,
	`source` text DEFAULT 'front_desk',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`checked_in_at` text,
	`checked_out_at` text,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reservations_confirmation_number_unique` ON `reservations` (`confirmation_number`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reservation_id` integer NOT NULL,
	`amount` real NOT NULL,
	`payment_method` text NOT NULL,
	`payment_type` text NOT NULL,
	`transaction_id` text,
	`status` text DEFAULT 'completed' NOT NULL,
	`notes` text,
	`processed_by` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`reservation_id`) REFERENCES `reservations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `housekeeping_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_id` integer NOT NULL,
	`task_type` text NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`assigned_to` text,
	`description` text,
	`estimated_duration` integer,
	`started_at` text,
	`completed_at` text,
	`notes` text,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`role` text NOT NULL,
	`department` text,
	`phone` text,
	`is_active` integer DEFAULT true NOT NULL,
	`password_hash` text NOT NULL,
	`last_login` text,
	`permissions` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_username_unique` ON `staff` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `staff_email_unique` ON `staff` (`email`);