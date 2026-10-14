import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { fulfillOrder } from '@/lib/fulfillment/cj';
import { notifyTelegramOrder } from '@/lib/notifications/telegram';

export const runtime = 'nodejs';

/**
 * POST /api/webhooks/razorpay
 * Razorpay → mark order paid → auto-fulfill via CJ (best-effort).
 * Configure in Razorpay Dashboard with events:
 *   payment.captured, payment.failed
 * Webhook secret: RAZORPAY_WEBHOOK_SECRET.
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

interface RazorpayEvent {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        order_id?: string;
        status?: string;
      };
    };
  };
}

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const supabase = getSupabase();
  if (!secret || !supabase) {
    return NextResponse.json(
      { error: 'Webhooks not configured (RAZORPAY_WEBHOOK_SECRET / Supabase)' },
      { status: 503 }
    );
  }

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const rawBody = await req.text();
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: RazorpayEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const orderId = event.payload?.payment?.entity?.order_id;
  if (!orderId) return NextResponse.json({ received: true, ignored: 'no order_id' });

  try {
    if (event.event === 'payment.captured') {
      const lookup = await supabase
        .from('orders')
        .select('id, status, user_email, total_amount, shipping_name, shipping_address, items')
        .eq('stripe_session_id', orderId)
        .maybeSingle();
      if (lookup.error && /column .* does not exist/i.test(lookup.error.message)) {
        // Migration 0002 hasn't run: no payment-ref column to match on.
        // Acknowledge so Razorpay stops retrying; run the migration to
        // restore auto-fulfillment.
        console.error('Razorpay webhook: orders.stripe_session_id missing — run migration 0002.');
        return NextResponse.json({ received: true, orderId, deferred: 'missing stripe_session_id column' });
      }
      const order = lookup.data as {
        id: string;
        status: string;
        user_email?: string;
        total_amount?: number;
        shipping_name?: string;
        shipping_address?: any;
        items?: any[];
      } | null;

      if (order && order.status === 'pending') {
        await supabase.from('orders').update({ status: 'paid' }).eq('id', order.id);
        
        // Notify store owner on Telegram automatically with exact Meesho link
        notifyTelegramOrder({
          id: order.id,
          total: Number(order.total_amount || 0),
          paymentMethod: 'online',
          email: order.user_email || 'shopper@rareember.com',
          name: order.shipping_name,
          itemsCount: Array.isArray(order.items) ? order.items.length : 1,
          items: order.items || [],
          address: order.shipping_address,
        }).catch((e) => console.error('Telegram notification error:', e));
      }

      // Best-effort auto-fulfillment. Failures are recorded and retried by
      // GET /api/fulfillment/retry — always return 200 so Razorpay stops retrying.
      let fulfilled: { ok: boolean; cjOrderId?: string; reason?: string } = { ok: false };
      try {
        if (order) {
          const result = await fulfillOrder(supabase, order.id);
          fulfilled = result.ok
            ? { ok: true, cjOrderId: result.cjOrderId }
            : { ok: false, reason: result.reason };
        }
      } catch (err) {
        console.error('Auto-fulfillment error:', err instanceof Error ? err.message : err);
        fulfilled = { ok: false, reason: 'fulfillment threw (see logs); retry worker will pick it up' };
      }
      return NextResponse.json({ received: true, orderId, fulfilled });
    }

    if (event.event === 'payment.failed') {
      // Only cancel still-pending orders — never clobber an order that has
      // since been paid/fulfilled (late failure callbacks happen).
      const cancelled = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('stripe_session_id', orderId)
        .eq('status', 'pending');
      if (cancelled.error) {
        console.error('Razorpay webhook (failed) DB error:', cancelled.error.message);
      }
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true, ignored: event.event ?? 'unknown' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook handler failed';
    console.error('Razorpay webhook error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
