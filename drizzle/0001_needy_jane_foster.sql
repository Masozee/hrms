CREATE TABLE `group_booking_rooms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_booking_id` integer NOT NULL,
	`reservation_id` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`group_booking_id`) REFERENCES `group_bookings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reservation_id`) REFERENCES `group_bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `group_bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_name` text NOT NULL,
	`event_type` text NOT NULL,
	`contact_person_name` text NOT NULL,
	`contact_email` text NOT NULL,
	`contact_phone` text NOT NULL,
	`company` text,
	`event_start_date` text NOT NULL,
	`event_end_date` text NOT NULL,
	`total_rooms` integer NOT NULL,
	`total_guests` integer NOT NULL,
	`special_requests` text,
	`notes` text,
	`total_amount` real DEFAULT 0 NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
