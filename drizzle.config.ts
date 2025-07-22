import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './schema/index.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: './hotel.db',
  },
});