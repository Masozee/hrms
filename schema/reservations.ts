import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { rooms } from './rooms';
import { guests } from './guests';

export const reservations = sqliteTable('reservations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  confirmationNumber: text('confirmation_number').notNull().unique(),
  guestId: integer('guest_id').notNull().references(() => guests.id),
  roomId: integer('room_id').notNull().references(() => rooms.id),
  checkInDate: text('check_in_date').notNull(),
  checkOutDate: text('check_out_date').notNull(),
  numberOfGuests: integer('number_of_guests').notNull().default(1),
  numberOfNights: integer('number_of_nights').notNull(),
  roomRate: real('room_rate').notNull(), // rate per night at time of booking
  totalAmount: real('total_amount').notNull(),
  paidAmount: real('paid_amount').notNull().default(0),
  status: text('status').notNull().default('confirmed'), // confirmed, checked_in, checked_out, cancelled, no_show
  specialRequests: text('special_requests'),
  notes: text('notes'),
  source: text('source').default('front_desk'), // front_desk, online, phone, walk_in
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  checkedInAt: text('checked_in_at'),
  checkedOutAt: text('checked_out_at'),
});

export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;