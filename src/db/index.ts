import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

// Support both Astro environment (import.meta.env) and standard Node scripts (process.env)
const connectionString = import.meta.env?.DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables.');
}

const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

export const pool = new pg.Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: isLocal ? 10 : 1,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});

// Self-healing migration for service_requests table
pool.query(`
  ALTER TABLE service_requests ALTER COLUMN user_id DROP NOT NULL;
  ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS customer_name TEXT;
  ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS customer_phone TEXT;
`).catch(err => {
  console.error('[DB Schema Migration] Failed to run self-healing migration:', err);
});

export const db = drizzle(pool, { schema });
