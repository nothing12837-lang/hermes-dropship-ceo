import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fulfillOrder } from '@/lib/fulfillment/cj';
import { isAdmin } from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';

export const runtime = 'nodejs';

/**
 * Admin ops API (gated by ADMIN_SECRET / CRON_SECRET).
 * GET  /api/admin/orders?limit=20&status=paid — recent orders with fulfillment state.
 * POST /api/admin/orders { orderId } — retry fulfillment for one order.
 */

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function guard(req: NextRequest): NextResponse | null {
  if (!process.env.ADMIN_SECRET && !process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'Admin not configured. Set ADMIN_SECRET (see .env.example).' },
      { status: 503 }
    );
  }
  const rl = checkRateLimit(`admin:${clientIp(req.headers)}`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  const supabase = getAdminSupabase();
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });

  const params = new URL(req.url).searchParams;
  const limit = Math.min(50, Math.max(1, parseInt(params.get('limit') ?? '20', 10) || 20));
  const status = params.get('status')?.trim();

  // Live-safe column set (see migration 0002): extension columns may not
  // exist yet on older databases; the admin page renders them as null.
  let query = supabase
    .from('orders')
    .select(
      'id,user_email,total_amount,status,cj_order_id,meesho_order_id,meesho_url,tracking_number,created_at,shipping_address'
    )
    .order('created_at', { ascending: false })
    .limit(limit);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Order query failed' }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  const supabase = getAdminSupabase();
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });

  try {
    const body = (await req.json()) as { orderId?: string; status?: string; tracking_number?: string; meesho_order_id?: string; meesho_url?: string };
    const { orderId, status, tracking_number } = body;
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const ALLOWED_STATUSES = new Set(['pending', 'pending_cod', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']);
    const updates: Record<string, unknown> = {};
    if (status) {
      const cleanStatus = status.trim().toLowerCase();
      if (!ALLOWED_STATUSES.has(cleanStatus)) {
        return NextResponse.json({ error: `Invalid status. Allowed: ${[...ALLOWED_STATUSES].join(', ')}` }, { status: 400 });
      }
      updates.status = cleanStatus;
    }

    if (tracking_number !== undefined) {
      const cleanTn = String(tracking_number).trim().slice(0, 64);
      updates.tracking_number = cleanTn || null;
      if ((body as any).tracking_url) {
        const rawUrl = String((body as any).tracking_url).trim();
        if (rawUrl.startsWith('https://') && rawUrl.length <= 500) {
          updates.tracking_url = rawUrl;
        }
      } else if (cleanTn) {
        if (/^SF/i.test(cleanTn)) {
          updates.tracking_url = `https://tracker.shadowfax.in/#/track/${cleanTn}`;
        } else if (/^1\d{10,13}$/.test(cleanTn) || /^\d{12,14}$/.test(cleanTn)) {
          updates.tracking_url = `https://www.delhivery.com/track/package/${cleanTn}`;
        } else if (/^XB/i.test(cleanTn)) {
          updates.tracking_url = `https://www.xpressbees.com/shipment/tracking?awbNo=${cleanTn}`;
        } else {
          updates.tracking_url = `https://www.delhivery.com/track/package/${cleanTn}`;
        }
      }
    }

    if (body.meesho_order_id !== undefined) {
      updates.meesho_order_id = String(body.meesho_order_id).trim().slice(0, 64) || null;
    }
    if (body.meesho_url !== undefined) {
      const u = String(body.meesho_url).trim().slice(0, 500);
      if (u === "" || u.startsWith("https://")) updates.meesho_url = u || null;
    }

    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (error) return NextResponse.json({ error: 'Order update failed' }, { status: 500 });
    return NextResponse.json({ ok: true, orderId, updates });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Update failed' }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  const supabase = getAdminSupabase();
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });

  let orderId: unknown;
  try {
    orderId = ((await req.json()) as { orderId?: unknown }).orderId;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (typeof orderId !== 'string' || orderId.length === 0) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 });
  }

  const result = await fulfillOrder(supabase, orderId);
  if (result.ok) return NextResponse.json({ ok: true, cjOrderId: result.cjOrderId });
  return NextResponse.json(
    { ok: false, reason: result.reason, retryable: result.retryable },
    { status: result.retryable ? 502 : 400 }
  );
}
