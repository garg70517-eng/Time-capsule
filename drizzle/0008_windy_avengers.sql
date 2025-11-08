PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_capsule_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`capsule_id` text NOT NULL,
	`user_id` text NOT NULL,
	`activity_type` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`capsule_id`) REFERENCES `capsules`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_capsule_activities`("id", "capsule_id", "user_id", "activity_type", "description", "created_at") SELECT "id", "capsule_id", "user_id", "activity_type", "description", "created_at" FROM `capsule_activities`;--> statement-breakpoint
DROP TABLE `capsule_activities`;--> statement-breakpoint
ALTER TABLE `__new_capsule_activities` RENAME TO `capsule_activities`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_capsule_collaborators` (
	`id` text PRIMARY KEY NOT NULL,
	`capsule_id` text NOT NULL,
	`user_id` text NOT NULL,
	`permission` text DEFAULT 'view' NOT NULL,
	`invited_by` text NOT NULL,
	`accepted_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`capsule_id`) REFERENCES `capsules`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invited_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_capsule_collaborators`("id", "capsule_id", "user_id", "permission", "invited_by", "accepted_at", "created_at") SELECT "id", "capsule_id", "user_id", "permission", "invited_by", "accepted_at", "created_at" FROM `capsule_collaborators`;--> statement-breakpoint
DROP TABLE `capsule_collaborators`;--> statement-breakpoint
ALTER TABLE `__new_capsule_collaborators` RENAME TO `capsule_collaborators`;--> statement-breakpoint
CREATE TABLE `__new_capsule_files` (
	`id` text PRIMARY KEY NOT NULL,
	`capsule_id` text NOT NULL,
	`file_name` text NOT NULL,
	`file_type` text NOT NULL,
	`file_size` integer NOT NULL,
	`file_url` text NOT NULL,
	`thumbnail_url` text,
	`uploaded_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`capsule_id`) REFERENCES `capsules`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`uploaded_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_capsule_files`("id", "capsule_id", "file_name", "file_type", "file_size", "file_url", "thumbnail_url", "uploaded_by", "created_at") SELECT "id", "capsule_id", "file_name", "file_type", "file_size", "file_url", "thumbnail_url", "uploaded_by", "created_at" FROM `capsule_files`;--> statement-breakpoint
DROP TABLE `capsule_files`;--> statement-breakpoint
ALTER TABLE `__new_capsule_files` RENAME TO `capsule_files`;--> statement-breakpoint
CREATE TABLE `__new_capsules` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`unlock_date` text NOT NULL,
	`is_locked` integer DEFAULT true NOT NULL,
	`is_emergency_accessible` integer DEFAULT false NOT NULL,
	`emergency_qr_code` text,
	`theme` text DEFAULT 'default' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_capsules`("id", "user_id", "title", "description", "unlock_date", "is_locked", "is_emergency_accessible", "emergency_qr_code", "theme", "status", "created_at", "updated_at") SELECT "id", "user_id", "title", "description", "unlock_date", "is_locked", "is_emergency_accessible", "emergency_qr_code", "theme", "status", "created_at", "updated_at" FROM `capsules`;--> statement-breakpoint
DROP TABLE `capsules`;--> statement-breakpoint
ALTER TABLE `__new_capsules` RENAME TO `capsules`;