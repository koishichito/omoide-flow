// Set POSTGRES_URL from NEON_DATABASE_URL if not already set
// This allows @vercel/postgres to work with NEON_DATABASE_URL
if (!process.env.POSTGRES_URL && process.env.NEON_DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.NEON_DATABASE_URL;
}

// Import sql after setting environment variable
import { sql as vercelSql } from '@vercel/postgres';

export const sql = vercelSql;
