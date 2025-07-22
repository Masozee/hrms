import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const rooms = sqliteTable('rooms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomNumber: text('room_number').notNull().unique(),
  roomType: text('room_type').notNull(), // single, double, suite, deluxe
  floor: integer('floor').notNull(),
  maxOccupancy: integer('max_occupancy').notNull(),
  baseRate: real('base_rate').notNull(), // per night
  status: text('status').notNull().default('available'), // available, occupied, dirty, maintenance, blocked
  amenities: text('amenities'), // JSON string of amenities
  description: text('description'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;