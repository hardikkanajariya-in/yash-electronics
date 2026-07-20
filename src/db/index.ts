import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const connectionString = import.meta.env?.DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables.');
}

const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
const hasDisableSSL = connectionString.includes('sslmode=disable');

export const pool = new pg.Pool({
  connectionString,
  ssl: (isLocal || hasDisableSSL) ? false : { rejectUnauthorized: false },
  max: isLocal ? 10 : 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});

export const db = drizzle(pool, { schema });

