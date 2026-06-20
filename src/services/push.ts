import webpush from 'web-push';
import { db } from '../db';
import { pushSubscriptions, users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Fetch credentials from Astro env or process env
const publicKey = import.meta.env?.PUBLIC_VAPID_PUBLIC_KEY || process.env.PUBLIC_VAPID_PUBLIC_KEY || '';
const privateKey = import.meta.env?.VAPID_PRIVATE_KEY || process.env.VAPID_PRIVATE_KEY || '';

if (publicKey && privateKey) {
  try {
    webpush.setVapidDetails(
      'mailto:admin@yashelectronics.in',
      publicKey,
      privateKey
    );
    console.log('[Push Service] VAPID details set successfully.');
  } catch (e) {
    console.error('[Push Service] Failed to set VAPID details:', e);
  }
} else {
  console.warn('[Push Service] VAPID keys not configured. Offline push notifications will be disabled.');
}

/**
 * Triggers offline web push notifications to all registered admin devices.
 * This runs asynchronously and does not block client requests.
 */
export function triggerPushNotification(title: string, message: string, targetUrl: string = '/admin') {
  if (!publicKey || !privateKey) {
    console.warn('[Push Service] Cannot send push notification: VAPID keys not configured.');
    return;
  }

  // Run async push job without blocking main request thread
  (async () => {
    try {
      // Find all subscriptions for users with 'admin' role
      const subs = await db
        .select({
          id: pushSubscriptions.id,
          endpoint: pushSubscriptions.endpoint,
          p256dh: pushSubscriptions.p256dh,
          auth: pushSubscriptions.auth,
        })
        .from(pushSubscriptions)
        .innerJoin(users, eq(pushSubscriptions.userId, users.id))
        .where(eq(users.role, 'admin'));

      if (subs.length === 0) {
        return;
      }

      const payload = JSON.stringify({
        title,
        body: message,
        url: targetUrl,
      });

      const promises = subs.map(async (sub) => {
        const pushConfig = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushConfig, payload);
        } catch (error: any) {
          // 410 (Gone) or 404 (Not Found) means subscription has expired/been revoked
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`[Push Service] Removing expired subscription endpoint: ${sub.id}`);
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
          } else {
            console.error(`[Push Service] Push delivery failed for subscription ${sub.id}:`, error);
          }
        }
      });

      await Promise.all(promises);
    } catch (e) {
      console.error('[Push Service] Error executing push notifications broadcast:', e);
    }
  })();
}
