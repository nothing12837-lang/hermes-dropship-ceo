import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fulfillQikinkOrder } from '@/lib/fulfillment/qikink';
import { sendOrderDeliveredInvoiceEmail } from '@/lib/notifications/email';
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
  const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') ?? '50', 10) || 50));
  const status = params.get('status')?.trim();

  // Primary: Select every single detail (items, payment_method, shipping_name, address, tracking_url, totals)
  let query = supabase
    .from('orders')
    .select(
      'id,user_email,total_amount,subtotal,shipping,status,cj_order_id,meesho_order_id,meesho_url,tracking_number,tracking_url,items,payment_method,shipping_name,shipping_address,created_at'
    )
    .order('created_at', { ascending: false })
    .limit(limit);
  if (status) query = query.eq('status', status);

  const queryResult = await query;
  let { data } = queryResult;
  const { error } = queryResult;
  if (error) {
    console.warn('[Admin API] Comprehensive column select warning, falling back to base columns:', error.message);
    // Safe fallback if optional legacy columns are absent
    let fallbackQuery = supabase
      .from('orders')
      .select('id,user_email,total_amount,status,cj_order_id,tracking_number,tracking_url,items,payment_method,shipping_name,shipping_address,created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (status) fallbackQuery = fallbackQuery.eq('status', status);
    const fallbackRes = await fallbackQuery;
    if (!fallbackRes.error) {
      data = fallbackRes.data as any;
    } else {
      return NextResponse.json({ error: 'Order query failed' }, { status: 500 });
    }
  }
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

    // NOTE: `cod_confirmed` is a BOOLEAN column on `orders`, not a status
    // value. It is set separately below.
    const ALLOWED_STATUSES = new Set([
      'pending', 'pending_cod', 'paid', 'processing',
      'shipped', 'delivered', 'cancelled', 'refunded', 'returned',
    ]);

    // Legal transitions. Previously ANY status could be set on ANY order, so
    // "Mark Shipped" on an UNPAID order followed by "Dispatch to Qikink"
    // printed and shipped free merchandise.
    const ORDER_TRANSITIONS: Record<string, string[]> = {
      pending: ['paid', 'cancelled'],
      pending_cod: ['paid', 'cancelled'],
      paid: ['processing', 'cancelled', 'refunded'],
      processing: ['shipped', 'delivered', 'cancelled', 'refunded'],
      shipped: ['delivered', 'refunded'],
      delivered: ['returned'],
      returned: [],
      cancelled: [],
      refunded: [],
    };

    // Read the current status so the transition can be validated and the
    // update can be made conditional (no lost updates).
    const { data: currentRow, error: currentErr } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .maybeSingle();
    if (currentErr) {
      return NextResponse.json({ error: 'Order lookup failed' }, { status: 500 });
    }
    if (!currentRow) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const currentStatus = String(currentRow.status || '').trim().toLowerCase();

    const updates: Record<string, unknown> = {};
    if (status) {
      const cleanStatus = status.trim().toLowerCase();
      if (!ALLOWED_STATUSES.has(cleanStatus)) {
        return NextResponse.json({ error: `Invalid status. Allowed: ${[...ALLOWED_STATUSES].join(', ')}` }, { status: 400 });
      }
      const allowedNext = ORDER_TRANSITIONS[currentStatus] || [];
      if (!allowedNext.includes(cleanStatus)) {
        return NextResponse.json(
          {
            error:
              `Cannot move an order from "${currentStatus}" to "${cleanStatus}". ` +
              `Allowed from "${currentStatus}": ${allowedNext.join(', ') || 'none'}.`,
          },
          { status: 400 }
        );
      }
      updates.status = cleanStatus;
    }

    if ((body as any).cod_confirmed !== undefined) {
      updates.cod_confirmed = Boolean((body as any).cod_confirmed);
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
          updates.tracking_url = `https://courierupdates.com/?awb=${cleanTn}`;
        } else if (/^XB/i.test(cleanTn)) {
          updates.tracking_url = `https://www.xpressbees.com/shipment/tracking?awbNo=${cleanTn}`;
        } else {
          updates.tracking_url = `https://courierupdates.com/?awb=${cleanTn}`;
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

    // Conditional on the status we validated against, so a concurrent write
    // cannot be clobbered.
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .eq('status', currentStatus);
    if (error) return NextResponse.json({ error: 'Order update failed' }, { status: 500 });

    // When status changes to delivered, automatically dispatch the Official Tax Invoice email
    if (updates.status === 'delivered') {
      try {
        const { data: fullOrder } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();

        if (fullOrder) {
          const addr = (fullOrder.shipping_address as any) || {};
          void sendOrderDeliveredInvoiceEmail({
            orderId: String(fullOrder.id),
            email: String(fullOrder.user_email || ''),
            name: fullOrder.shipping_name,
            phone: addr.phone || '',
            total: Number(fullOrder.total_amount || 0),
            subtotal: Number(fullOrder.subtotal || fullOrder.total_amount || 0),
            paymentMethod: String(fullOrder.payment_method || 'cod'),
            trackingNumber: fullOrder.tracking_number,
            deliveryDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            items: Array.isArray(fullOrder.items) ? fullOrder.items : [],
            address: {
              line1: addr.line1 || addr.street || '',
              flat: addr.flat || addr.flatHouse || '',
              street: addr.street || addr.areaStreet || '',
              landmark: addr.landmark || '',
              city: addr.city || '',
              state: addr.state || '',
              zip: addr.zip || '',
            },
          }).catch((err) => console.error('[Delivery Invoice Email] Dispatch failed:', err));
        }
      } catch (emailErr) {
        console.error('[Admin Orders] Failed to query full order for delivery invoice:', emailErr);
      }
    }

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
  let force = false;
  let action: string | undefined;
  try {
    const body = (await req.json()) as { orderId?: unknown; force?: boolean; action?: string };
    orderId = body.orderId;
    force = Boolean(body.force);
    action = body.action;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (typeof orderId !== 'string' || orderId.length === 0) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 });
  }

  // Action: Manually send/resend original Tax Invoice email for delivered order
  if (action === 'send_invoice') {
    const { data: fullOrder, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (fetchErr || !fullOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const addr = (fullOrder.shipping_address as any) || {};
    const emailResult = await sendOrderDeliveredInvoiceEmail({
      orderId: String(fullOrder.id),
      email: String(fullOrder.user_email || ''),
      name: fullOrder.shipping_name,
      phone: addr.phone || '',
      total: Number(fullOrder.total_amount || 0),
      subtotal: Number(fullOrder.subtotal || fullOrder.total_amount || 0),
      paymentMethod: String(fullOrder.payment_method || 'cod'),
      trackingNumber: fullOrder.tracking_number,
      deliveryDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: Array.isArray(fullOrder.items) ? fullOrder.items : [],
      address: {
        line1: addr.line1 || addr.street || '',
        flat: addr.flat || addr.flatHouse || '',
        street: addr.street || addr.areaStreet || '',
        landmark: addr.landmark || '',
        city: addr.city || '',
        state: addr.state || '',
        zip: addr.zip || '',
      },
    });

    return NextResponse.json({ ok: emailResult.ok, error: emailResult.error });
  }

  const result = await fulfillQikinkOrder(supabase, orderId, undefined, { force });
  if (result.ok) return NextResponse.json({ ok: true, qikinkOrderId: result.qikinkOrderId, trackingUrl: result.trackingUrl });
  return NextResponse.json(
    { ok: false, reason: result.reason },
    { status: 400 }
  );
}

export async function DELETE(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  const supabase = getAdminSupabase();
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });

  const params = new URL(req.url).searchParams;
  let orderId = params.get('orderId')?.trim();
  if (!orderId) {
    try {
      const body = (await req.json()) as { orderId?: string };
      orderId = body.orderId?.trim();
    } catch {
      // ignore
    }
  }
  if (!orderId) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 });
  }

  const { error } = await supabase.from('orders').delete().eq('id', orderId);
  if (error) {
    return NextResponse.json({ error: `Delete failed: ${error.message}` }, { status: 500 });
  }
  return NextResponse.json({ ok: true, deleted: orderId });
}
