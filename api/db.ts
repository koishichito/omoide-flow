import { createPool } from '@vercel/postgres';

// Use NEON_URL instead of default POSTGRES_URL
const pool = createPool({
  connectionString: process.env.NEON_URL
});

export const sql = pool.sql;
