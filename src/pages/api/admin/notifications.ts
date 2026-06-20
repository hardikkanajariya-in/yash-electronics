import { getSessionUser } from '../../../lib/auth';
import { db } from '../../../db';
import { notifications } from '../../../db/schema';
import { desc, eq } from 'drizzle-orm';

export const prerender = false;

export const GET = async ({ cookies }: { cookies: any }) => {
  try {
    const currentUser = await getSessionUser(cookies);
    if (!currentUser || currentUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get latest 20 notifications
    const recentNotifications = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    // Get true unread count from db
    const unreadRes = await db
      .select()
      .from(notifications)
      .where(eq(notifications.isRead, false));
    const unreadCount = unreadRes.length;

    return new Response(JSON.stringify({
      notifications: recentNotifications,
      unreadCount,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[Notifications GET Error]:', e);
    return new Response(JSON.stringify({ error: e.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST = async ({ request, cookies }: { request: Request; cookies: any }) => {
  try {
    const currentUser = await getSessionUser(cookies);
    if (!currentUser || currentUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id, all, action } = await request.json();

    if (action === 'delete') {
      if (all) {
        // Delete all notifications
        await db.delete(notifications);
      } else if (id) {
        // Delete specific notification
        await db.delete(notifications).where(eq(notifications.id, id));
      }
    } else {
      if (all) {
        // Mark all as read
        await db
          .update(notifications)
          .set({ isRead: true })
          .where(eq(notifications.isRead, false));
      } else if (id) {
        // Mark specific notification as read
        await db
          .update(notifications)
          .set({ isRead: true })
          .where(eq(notifications.id, id));
      } else {
        return new Response(JSON.stringify({ error: 'Missing parameters id or all' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[Notifications POST Error]:', e);
    return new Response(JSON.stringify({ error: e.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
