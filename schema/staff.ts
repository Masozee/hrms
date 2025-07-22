import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const staff = sqliteTable('staff', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role').notNull(), // admin, manager, front_desk, housekeeping, maintenance
  department: text('department'), // front_office, housekeeping, maintenance, management
  phone: text('phone'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  passwordHash: text('password_hash').notNull(),
  lastLogin: text('last_login'),
  permissions: text('permissions'), // JSON string of permissions
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export type Staff = typeof staff.$inferSelect;
export type NewStaff = typeof staff.$inferInsert;