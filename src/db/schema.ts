import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull().default('user'),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const capsules = sqliteTable('capsules', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  title: text('title').notNull(),
  description: text('description'),
  unlockDate: text('unlock_date').notNull(),
  isLocked: integer('is_locked', { mode: 'boolean' }).notNull().default(true),
  isEmergencyAccessible: integer('is_emergency_accessible', { mode: 'boolean' }).notNull().default(false),
  emergencyQrCode: text('emergency_qr_code'),
  theme: text('theme').notNull().default('default'),
  status: text('status').notNull().default('draft'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const capsuleFiles = sqliteTable('capsule_files', {
  id: text('id').primaryKey(),
  capsuleId: text('capsule_id').notNull().references(() => capsules.id),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  fileUrl: text('file_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  uploadedBy: text('uploaded_by').notNull().references(() => user.id),
  createdAt: text('created_at').notNull(),
});

export const capsuleCollaborators = sqliteTable('capsule_collaborators', {
  id: text('id').primaryKey(),
  capsuleId: text('capsule_id').notNull().references(() => capsules.id),
  userId: text('user_id').notNull().references(() => user.id),
  permission: text('permission').notNull().default('view'),
  invitedBy: text('invited_by').notNull().references(() => user.id),
  acceptedAt: text('accepted_at'),
  createdAt: text('created_at').notNull(),
});

export const capsuleActivities = sqliteTable('capsule_activities', {
  id: text('id').primaryKey(),
  capsuleId: text('capsule_id').notNull().references(() => capsules.id),
  userId: text('user_id').notNull().references(() => user.id),
  activityType: text('activity_type').notNull(),
  description: text('description').notNull(),
  createdAt: text('created_at').notNull(),
});

// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  capsuleId: text('capsule_id').references(() => capsules.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  scheduledFor: text('scheduled_for'),
  createdAt: text('created_at').notNull(),
});