import { createPool } from '@vercel/postgres';

// Use NEON_DATABASE_URL for pooled connection
const connectionString = process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error(
    'Database connection string not found. Please set NEON_DATABASE_URL or POSTGRES_URL in Vercel environment variables. ' +
    `Available env vars: ${Object.keys(process.env).filter(k => k.includes('POSTGRES') || k.includes('NEON')).join(', ')}`
  );
}

const pool = createPool({
  connectionString
});

export const sql = pool.sql;
