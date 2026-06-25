import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import { autoSeedEmptyProductReviews } from '../lib/review-seeder';

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

// Self-healing migration for service_requests, orders, reviews and notifications tables
pool.query(`
  CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    purchase_source TEXT NOT NULL DEFAULT 'online',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(255) PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  ALTER TABLE service_requests ALTER COLUMN user_id DROP NOT NULL;
  ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS customer_name TEXT;
  ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS customer_phone TEXT;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
  
  ALTER TABLE products ADD COLUMN IF NOT EXISTS eligible_for_bundle BOOLEAN NOT NULL DEFAULT TRUE;
  CREATE TABLE IF NOT EXISTS bundle_rules (
    id VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    name_gu TEXT,
    min_quantity INTEGER NOT NULL DEFAULT 3,
    reward_type TEXT NOT NULL,
    reward_value INTEGER NOT NULL DEFAULT 0,
    reward_description TEXT NOT NULL,
    reward_description_gu TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS bundle_rule_id VARCHAR(255) REFERENCES bundle_rules(id) ON DELETE SET NULL;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS bundle_discount_applied INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS bundle_reward_given TEXT;
`).then(async () => {
  await autoSeedEmptyProductReviews(pool);
}).catch(err => {
  console.error('[DB Schema Migration] Failed to run self-healing migration:', err);
});

export const db = drizzle(pool, { schema });

