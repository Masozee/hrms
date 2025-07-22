import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { rooms } from './rooms';

export const housekeepingTasks = sqliteTable('housekeeping_tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomId: integer('room_id').notNull().references(() => rooms.id),
  taskType: text('task_type').notNull(), // cleaning, maintenance, inspection, deep_clean
  priority: text('priority').notNull().default('normal'), // low, normal, high, urgent
  status: text('status').notNull().default('pending'), // pending, in_progress, completed, cancelled
  assignedTo: text('assigned_to'), // staff member assigned
  description: text('description'),
  estimatedDuration: integer('estimated_duration'), // in minutes
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
  notes: text('notes'),
  createdBy: text('created_by').notNull(), // who created the task
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export type HousekeepingTask = typeof housekeepingTasks.$inferSelect;
export type NewHousekeepingTask = typeof housekeepingTasks.$inferInsert;