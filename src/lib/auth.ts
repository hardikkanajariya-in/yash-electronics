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

/**
 * Normalizes and validates Indian mobile numbers.
 * Strips country codes (+91, 91), leading zeros (0, 0091), spaces, hyphens, and special characters.
 * Converts Gujarati (૦-૯) and Devanagari (०-९) digits to standard ASCII (0-9).
 * Enforces strictly 10 digits starting with 6, 7, 8, or 9.
 */
export function normalizeIndianPhone(input: string): { isValid: boolean; phone: string } {
  if (!input) return { isValid: false, phone: '' };

  let cleaned = input.trim();
  // Convert Gujarati Unicode digits (૦-૯) to standard digits (0-9)
  cleaned = cleaned.replace(/[૦-૯]/g, (d) => (d.charCodeAt(0) - 2406).toString());
  // Convert Devanagari Unicode digits (०-९) to standard digits (0-9)
  cleaned = cleaned.replace(/[०-९]/g, (d) => (d.charCodeAt(0) - 2400).toString());

  // Extract digits only
  let digits = cleaned.replace(/\D/g, '');

  // Strip international / trunk prefixes if present
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  } else if (digits.length === 13 && digits.startsWith('091')) {
    digits = digits.slice(3);
  } else if (digits.length === 14 && digits.startsWith('0091')) {
    digits = digits.slice(4);
  }

  const isValid = /^[6-9]\d{9}$/.test(digits);
  return {
    isValid,
    phone: digits,
  };
}


// Session Helpers
const SESSION_COOKIE_NAME = 'ye_session_id';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function sessionCookieOptions(requestUrl: URL) {
  return {
    path: '/',
    httpOnly: true,
    secure: requestUrl.protocol === 'https:',
    sameSite: 'lax' as const,
    maxAge: SESSION_MAX_AGE,
  };
}

export async function getSessionUser(cookies: any) {
  const sessionId = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return null;

  try {
    const [user] = await db.select().from(users).where(eq(users.id, sessionId));
    if (user && user.isSuspended) {
      return null;
    }
    return user || null;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('[auth] Session lookup failed:', e);
    }
    return null;
  }
}

export function setSessionUser(cookies: any, userId: string, requestUrl: URL) {
  cookies.set(SESSION_COOKIE_NAME, userId, sessionCookieOptions(requestUrl));
}

export function clearSessionUser(cookies: any, requestUrl: URL) {
  cookies.delete(SESSION_COOKIE_NAME, sessionCookieOptions(requestUrl));
}

/**
 * Set session cookie and redirect. Uses 303 + Response instead of Astro.redirect()
 * so Set-Cookie is not dropped on the redirect response (known Astro/Vercel issue).
 */
export function redirectWithSession(
  cookies: any,
  userId: string,
  location: string,
  requestUrl: URL,
): Response {
  setSessionUser(cookies, userId, requestUrl);
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
