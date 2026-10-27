import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { fulfillQikinkOrder, isTestOrder } from '@/lib/fulfillment/qikink';
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
  // Service role ONLY. The anon key cannot read `orders` under RLS, so the
  // webhook silently found no order, skipped mark-paid and skipped fulfilment,
  // yet still answered 200 -- paid customers were never shipped.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
        amount?: number;
      };
    };
  };
}

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const supabase = getSupabase();
  if (!secret || !supabase) {
    return NextResponse.json(
      { error: 'Webhooks not configured (RAZORPAY_WEBHOOK_SECRET / SUPABASE_SERVICE_ROLE_KEY required)' },
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
        .select('id, status, user_email, total_amount, shipping_name, shipping_address, items, cj_order_id')
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
        cj_order_id?: string | null;
      } | null;

      // Only the transition pending -> paid may trigger fulfilment. Razorpay
      // replays webhooks; without this guard a replay dispatched a SECOND
      // physical order from the same payment.
      const justPaid = Boolean(order && order.status === 'pending');

      if (order && order.status === 'pending') {
        // Verify payment amount matches order total in paise (prevents gateway underpayment tampering)
        const paidPaise = Number(event?.payload?.payment?.entity?.amount);
        const expectedPaise = Math.round(Number(order.total_amount || 0) * 100);
        if (paidPaise && expectedPaise && paidPaise < expectedPaise) {
          console.error(`Razorpay webhook: amount mismatch for order ${order.id}. Paid: ${paidPaise}, expected: ${expectedPaise}`);
          return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
        }

        const claim = await supabase
          .from('orders')
          .update({ status: 'paid' })
          .eq('id', order.id)
          .eq('status', 'pending')
          .select('id')
          .maybeSingle();
        if (claim.error) {
          console.error('Razorpay webhook: failed to mark order paid:', claim.error.message);
          return NextResponse.json({ error: 'Failed to mark order paid' }, { status: 500 });
        }
        if (!claim.data) {
          // Another replay won the race.
          return NextResponse.json({ received: true, orderId, idempotent: true });
        }
        
        // Notify store owner on Telegram automatically with 1-click WhatsApp link & dispatch status
        notifyTelegramOrder({
          id: order.id,
          total: Number(order.total_amount || 0),
          paymentMethod: 'online',
          email: order.user_email || (order as { email?: string }).email || 'customer@rareember.shop',
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
        if (order && (justPaid || !order.cj_order_id)) {
          if (isTestOrder(order)) {
            console.log(`[Razorpay Webhook] Order ${order.id} is a test/gateway verification drop (${order.user_email}). Skipping Qikink factory dispatch.`);
            await supabase.from('orders').update({ cj_order_id: 'TEST_ORDER_SKIPPED' }).eq('id', order.id);
            fulfilled = { ok: false, reason: 'Test/gateway verification drop. Qikink factory transmission blocked.' };
          } else {
            const result = await fulfillQikinkOrder(supabase, order.id);
            fulfilled = result.ok
              ? { ok: true, cjOrderId: result.qikinkOrderId }
              : { ok: false, reason: result.reason };
          }
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
