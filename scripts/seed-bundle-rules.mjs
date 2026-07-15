import fs from 'fs';
import path from 'path';
import pg from 'pg';

// 1. Load environment variables from .env
try {
  const envPath = path.resolve(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    const [key, ...valueParts] = trimmedLine.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  }
} catch (e) {
  console.warn('[Seed] Could not read .env file, using existing process.env variables.');
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[Seed] Error: DATABASE_URL environment variable is missing.');
  process.exit(1);
}

const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
const hasDisableSSL = connectionString.includes('sslmode=disable');
const client = new pg.Client({
  connectionString,
  ssl: (isLocal || hasDisableSSL) ? false : { rejectUnauthorized: false },
});

const bundleRulesData = [
  {
    id: 'rule-b3',
    name: '3 Products Special Gift',
    nameGu: '૩ પ્રોડક્ટ્સ સ્પેશિયલ ગિફ્ટ',
    minQuantity: 3,
    rewardType: 'free_gift',
    rewardValue: 0,
    rewardDescription: 'Free Noise Bluetooth Soundbar',
    rewardDescriptionGu: 'મફત નોઈઝ બ્લૂટૂથ સાઉન્ડબાર',
    isActive: true,
  },
  {
    id: 'rule-b4',
    name: '4 Products Checkout Discount',
    nameGu: '૪ પ્રોડક્ટ્સ ચેકઆઉટ ડિસ્કાઉન્ટ',
    minQuantity: 4,
    rewardType: 'percentage_discount',
    rewardValue: 10,
    rewardDescription: '10% off your order total!',
    rewardDescriptionGu: 'તમારા ઓર્ડર પર ૧૦% વધારાનું ડિસ્કાઉન્ટ!',
    isActive: true,
  },
  {
    id: 'rule-b5',
    name: '5 Products Flat Discount',
    nameGu: '૫ પ્રોડક્ટ્સ ફ્લેટ ડિસ્કાઉન્ટ',
    minQuantity: 5,
    rewardType: 'flat_discount',
    rewardValue: 1000,
    rewardDescription: '₹1,000 flat discount applied at checkout!',
    rewardDescriptionGu: 'ઓર્ડર ચેકઆઉટ પર ₹૧,૦૦૦ ફ્લેટ ડિસ્કાઉન્ટ!',
    isActive: true,
  },
  {
    id: 'rule-b6',
    name: '6 Products Store Cash Voucher',
    nameGu: '૬ પ્રોડક્ટ્સ સ્ટોર કેશ વાઉચર',
    minQuantity: 6,
    rewardType: 'store_voucher',
    rewardValue: 0,
    rewardDescription: '₹1,500 Store Cash Voucher',
    rewardDescriptionGu: '₹૧,૫૦૦ સ્ટોર કેશ વાઉચર',
    isActive: true,
  }
];

async function seedBundleRulesOnly() {
  try {
    console.log('[Seed] Connecting to database...');
    await client.connect();
    
    console.log('[Seed] Starting transaction...');
    await client.query('BEGIN');
    
    console.log('[Seed] Clearing existing bundle rules...');
    await client.query('DELETE FROM bundle_rules');
    
    console.log('[Seed] Inserting bundle rules...');
    for (const rule of bundleRulesData) {
      await client.query(
        `INSERT INTO bundle_rules (id, name, name_gu, min_quantity, reward_type, reward_value, reward_description, reward_description_gu, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          rule.id,
          rule.name,
          rule.nameGu,
          rule.minQuantity,
          rule.rewardType,
          rule.rewardValue,
          rule.rewardDescription,
          rule.rewardDescriptionGu,
          rule.isActive,
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
    }
    
    await client.query('COMMIT');
    console.log('[Seed] Bundle rules seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seed] Failed to seed bundle rules:', err);
  } finally {
    await client.end();
  }
}

seedBundleRulesOnly();
