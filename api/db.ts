import { sql as vercelSql } from '@vercel/postgres';

// Re-export sql from @vercel/postgres
// Vercel will automatically use the correct pooled connection string
// from environment variables (POSTGRES_URL, etc.)
export const sql = vercelSql;
