import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const groupBookings = sqliteTable('group_bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupName: text('group_name').notNull(),
  eventType: text('event_type').notNull(), // conference, wedding, corporate, leisure
  contactPersonName: text('contact_person_name').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone').notNull(),
  company: text('company'),
  eventStartDate: text('event_start_date').notNull(),
  eventEndDate: text('event_end_date').notNull(),
  totalRooms: integer('total_rooms').notNull(),
  totalGuests: integer('total_guests').notNull(),
  specialRequests: text('special_requests'),
  notes: text('notes'),
  totalAmount: real('total_amount').notNull().default(0),
  paidAmount: real('paid_amount').notNull().default(0),
  status: text('status').notNull().default('pending'), // pending, confirmed, checked_in, checked_out, cancelled
  createdBy: text('created_by').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const groupBookingRooms = sqliteTable('group_booking_rooms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupBookingId: integer('group_booking_id').notNull().references(() => groupBookings.id),
  reservationId: integer('reservation_id').notNull().references(() => groupBookings.id), // Foreign key to reservations table
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export type GroupBooking = typeof groupBookings.$inferSelect;
export type NewGroupBooking = typeof groupBookings.$inferInsert;
export type GroupBookingRoom = typeof groupBookingRooms.$inferSelect;
export type NewGroupBookingRoom = typeof groupBookingRooms.$inferInsert;