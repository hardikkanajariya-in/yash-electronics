import { db } from '../../db';
import { offers } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const prerender = false;

export const GET = async ({ request }: { request: Request }) => {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code')?.trim().toUpperCase() || '';

    if (!code) {
      return new Response(JSON.stringify({ valid: false, message: 'No coupon code provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [offer] = await db
      .select()
      .from(offers)
      .where(
        and(
          eq(offers.couponCode, code),
          eq(offers.isActive, true)
        )
      );

    if (!offer) {
      return new Response(JSON.stringify({ valid: false, message: 'Invalid or inactive coupon code.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check expiry date if defined (format YYYY-MM-DD)
    if (offer.validUntil) {
      const expiry = new Date(offer.validUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry.getTime() < today.getTime()) {
        return new Response(JSON.stringify({ valid: false, message: 'This coupon code has expired.' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(
      JSON.stringify({
        valid: true,
        code: offer.couponCode,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ valid: false, error: e.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
