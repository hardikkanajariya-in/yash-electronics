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
