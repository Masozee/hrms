import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { reservations } from './reservations';

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reservationId: integer('reservation_id').notNull().references(() => reservations.id),
  amount: real('amount').notNull(),
  paymentMethod: text('payment_method').notNull(), // cash, card, bank_transfer, online
  paymentType: text('payment_type').notNull(), // deposit, full_payment, refund, partial_payment
  transactionId: text('transaction_id'), // for card/online payments
  status: text('status').notNull().default('completed'), // pending, completed, failed, refunded
  notes: text('notes'),
  processedBy: text('processed_by'), // staff member who processed payment
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;