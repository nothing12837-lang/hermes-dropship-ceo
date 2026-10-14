import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeCJUpdate } from '@/lib/fulfillment/cj';

/**
 * POST /api/webhooks/cj
 * CJ fulfillment updates → order tracking.
 *
 * Body (JSON):
 *   { cj_order_id: string, tracking_number?: string, tracking_url?: string,
 *     status?: 'processing'|'fulfilled'|'shipped'|'delivered'|'cancelled' }
 *
 * Auth: Bearer <CJ_WEBHOOK_SECRET> when configured. If CJ_WEBHOOK_SECRET
 * is unset, the route still works but logs a warning (demo mode).
 */

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const expected = process.env.CJ_WEBHOOK_SECRET;
  if (expected) {
    const auth = req.headers.get('authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
    if (token !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    console.warn('CJ_WEBHOOK_SECRET not set — accepting unauthenticated CJ callbacks (demo).');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = normalizeCJUpdate(body);
  if (!parsed.ok) {
    const status = parsed.reason === 'cj_order_id required' ? 400 : 400;
    return NextResponse.json({ error: parsed.reason }, { status });
  }
  const { cjOrderId, trackingNumber, trackingUrl, status } = parsed.update;

  // tracking_url may not exist pre-migration 0002 — retry without it.
  let { data, error } = await supabase
    .from('orders')
    .update({
      status,
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
    })
    .eq('cj_order_id', cjOrderId)
    .select('id');

  if (error && /column .*tracking_url.* does not exist/i.test(error.message)) {
    console.warn('CJ webhook: orders.tracking_url missing — updating without it (run migration 0002).');
    const retry = await supabase
      .from('orders')
      .update({ status, tracking_number: trackingNumber })
      .eq('cj_order_id', cjOrderId)
      .select('id');
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('CJ webhook DB error:', error.message);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }

  const updated = (data ?? []) as Array<{ id: string }>;
  if (updated.length === 0) {
    return NextResponse.json({ error: 'Order not found for cj_order_id' }, { status: 404 });
  }

  return NextResponse.json({ received: true, orderId: updated[0].id, status });
}
