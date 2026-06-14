import crypto from 'node:crypto';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Hash password using native crypto sha256
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate random referral code
export function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Generate random ID
export function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Session Helpers
const SESSION_COOKIE_NAME = 'ye_session_id';

export async function getSessionUser(cookies: any) {
  const sessionId = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return null;

  try {
    const [user] = await db.select().from(users).where(eq(users.id, sessionId));
    return user || null;
  } catch (e) {
    return null;
  }
}

export function setSessionUser(cookies: any, userId: string) {
  cookies.set(SESSION_COOKIE_NAME, userId, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export function clearSessionUser(cookies: any) {
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}
