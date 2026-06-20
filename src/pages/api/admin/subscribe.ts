import { getSessionUser, generateId } from '../../../lib/auth';
import { db } from '../../../db';
import { pushSubscriptions } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const POST = async ({ request, cookies }: { request: Request; cookies: any }) => {
  try {
    const currentUser = await getSessionUser(cookies);
    if (!currentUser || currentUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return new Response(JSON.stringify({ error: 'Invalid subscription object' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if subscription with endpoint already exists
    const [existing] = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint));

    if (existing) {
      await db
        .update(pushSubscriptions)
        .set({
          userId: currentUser.id,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          createdAt: new Date().toISOString(),
        })
        .where(eq(pushSubscriptions.id, existing.id));
    } else {
      await db.insert(pushSubscriptions).values({
        id: generateId(),
        userId: currentUser.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        createdAt: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[Subscribe API Error]:', e);
    return new Response(JSON.stringify({ error: e.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
