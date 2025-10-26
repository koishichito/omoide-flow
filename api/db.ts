import { createPool } from '@vercel/postgres';

// Use NEON_DATABASE_URL for pooled connection
const pool = createPool({
  connectionString: process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL
});

export const sql = pool.sql;
