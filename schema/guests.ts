import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const guests = sqliteTable('guests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  idType: text('id_type'), // passport, driver_license, national_id
  idNumber: text('id_number'),
  nationality: text('nationality'),
  address: text('address'),
  city: text('city'),
  country: text('country'),
  dateOfBirth: text('date_of_birth'),
  specialRequests: text('special_requests'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;