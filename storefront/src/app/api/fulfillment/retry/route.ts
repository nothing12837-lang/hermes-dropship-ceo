import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fulfillQikinkOrder } from '@/lib/fulfillment/qikink';
import { isCron } from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';

export const runtime = 'nodejs';

/**
 * GET|POST /api/fulfillment/retry
 * Cron worker: picks up paid orders missing a CJ order and fulfills them.
 * Auth: Authorization: Bearer <CRON_SECRET> (or ADMIN_SECRET).
 * Vercel Cron is configured in vercel.json (every 10 minutes).
 */

const BATCH = 10;

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function runBatch() {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('orders')
    .select('id')
    .in('status', ['paid', 'pending_cod', 'processing'])
    .or('cj_order_id.is.null,cj_order_id.eq.,cj_order_id.ilike.QUEUE_%')
    .order('created_at', { ascending: true })
    .limit(BATCH);

  if (error) {
    return NextResponse.json({ error: 'Order query failed' }, { status: 500 });
  }

  const ids = ((data ?? []) as Array<{ id: string }>).map((o) => o.id);
  const fulfilled: string[] = [];
  const failed: Array<{ orderId: string; reason: string }> = [];

  for (const id of ids) {
    const result = await fulfillQikinkOrder(supabase, id);
    if (result.ok) fulfilled.push(id);
    else failed.push({ orderId: id, reason: result.reason || 'Failed' });
  }

  return NextResponse.json({ processed: ids.length, fulfilled, failed });
}

function guard(req: NextRequest): NextResponse | null {
  const rl = checkRateLimit(`fulfill:${clientIp(req.headers)}`, 12, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  if (!isCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  return runBatch();
}

export async function POST(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  return runBatch();
}
