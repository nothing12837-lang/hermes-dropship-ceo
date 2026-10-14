import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp, isValidOrderId, normalizeEmail } from '@/lib/security/validation';
import { notifyTelegramOrder } from '@/lib/notifications/telegram';

// GET /api/orders?email=x&orderId=y — Radha + /track read path (service key, server only).
// Blueprint table: orders(id, user_email, stripe_session_id, total_amount,
// status, cj_order_id, tracking_number).
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`orders:${clientIp(req.headers)}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ orders: [], error: 'Too many requests' }, { status: 429 });
  }

  const params = new URL(req.url).searchParams;
  const email = normalizeEmail(params.get('email'));
  const rawOrderId = params.get('orderId')?.trim() ?? '';
  const orderId = isValidOrderId(rawOrderId) ? rawOrderId : null;
  if (!email && !orderId)
    return NextResponse.json({ orders: [], error: 'Valid email or Order ID required' }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ orders: [], demo: true });

  try {
    const sb = createClient(url, key);
    // NOTE: select only columns guaranteed on every live DB. Extension
    // columns (items, tracking_url, …) are added by migration 0002 and
    // mapped defensively below, so /track works before AND after it runs.
    let q = sb
      .from('orders')
      .select('id,user_email,total_amount,status,cj_order_id,tracking_number,tracking_url,items,payment_method,shipping_name,shipping_address,created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    if (email) q = q.eq('user_email', email);
    // Order IDs are uuids — match by prefix so users can paste short IDs.
    if (orderId) q = q.ilike('id', `${orderId}%`);
    const { data, error } = await q;
    if (error) {
      console.error('Orders lookup failed:', error.message);
      return NextResponse.json({ orders: [], error: 'Lookup failed' }, { status: 500 });
    }
    // Normalize to the storefront shape
    const orders = (data ?? []).map((o: Record<string, unknown>) => ({
      id: String(o.id),
      email: String(o.user_email ?? ''),
      user_email: String(o.user_email ?? ''),
      items: Array.isArray(o.items) ? o.items : [],
      subtotal: Number(o.subtotal ?? o.total_amount ?? 0),
      shipping: Number(o.shipping ?? 0),
      total: Number(o.total_amount ?? 0),
      total_amount: Number(o.total_amount ?? 0),
      status: String(o.status ?? 'pending'),
      payment_method: String(o.payment_method ?? 'online'),
      shipping_name: (o.shipping_name as string) ?? null,
      shipping_address: o.shipping_address ?? null,
      stripe_session_id: (o.stripe_session_id as string) ?? null,
      cj_order_id: (o.cj_order_id as string) ?? null,
      tracking_number: (o.tracking_number as string) ?? null,
      tracking_url: (o.tracking_url as string) ?? null,
      created_at: String(o.created_at ?? ''),
    }));
    return NextResponse.json({ orders });
  } catch (e) {
    console.error('Orders lookup threw:', e instanceof Error ? e.message : e);
    return NextResponse.json({ orders: [], error: 'Lookup failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`order_create:${clientIp(req.headers)}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const email = normalizeEmail(body.email);
    if (!email) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json({ error: 'Cart cannot be empty' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json({ ok: true, mock: true, order_id: `mock_${Date.now()}` });
    }

    const sb = createClient(url, key);

    // Verify supplier stock availability
    const itemIds = items.map((i: any) => i.id).filter(Boolean);
    if (itemIds.length > 0) {
      const { data: dbProducts } = await sb
        .from('products')
        .select('id, title, active')
        .in('id', itemIds);

      if (dbProducts && dbProducts.length > 0) {
        const outOfStockItem = dbProducts.find((p) => p.active === false);
        if (outOfStockItem) {
          return NextResponse.json(
            { error: `"${outOfStockItem.title}" is currently out of stock at supplier. Order cannot be placed.` },
            { status: 400 }
          );
        }
      }
    }
    
    // Strict Idempotency Guard (Prevents double submission on slow network or double-clicks)
    const idempotencyKey = (req.headers.get('x-idempotency-key') || body.idempotency_key || '').trim();
    if (idempotencyKey) {
      const existing = await sb
        .from('orders')
        .select('id')
        .eq('stripe_session_id', idempotencyKey)
        .maybeSingle();
      if (existing.data?.id) {
        return NextResponse.json({ ok: true, order_id: existing.data.id, idempotent: true });
      }
    } else {
      // Natural deduplication window (60s) for identical email + total + pending_cod
      const recent = await sb
        .from('orders')
        .select('id, created_at')
        .eq('user_email', email)
        .eq('total_amount', Number(body.total_amount || 0))
        .eq('status', 'pending_cod')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (recent.data?.id && recent.data?.created_at) {
        const orderTime = new Date(recent.data.created_at).getTime();
        if (Date.now() - orderTime < 60_000) {
          return NextResponse.json({ ok: true, order_id: recent.data.id, idempotent: true });
        }
      }
    }

    const mockRef = idempotencyKey || `cod_${Date.now()}`;
    const totalAmount = Number(body.total_amount || 0);

    const newOrder = {
      user_email: email,
      user_id: body.user_id || null,
      stripe_session_id: mockRef,
      total_amount: totalAmount,
      status: body.payment_method === 'cod' ? 'pending_cod' : 'pending',
      items,
      subtotal: totalAmount,
      shipping: 0,
      shipping_name: typeof body.name === 'string' ? body.name.slice(0, 100) : null,
      shipping_address: body.address || null,
    };

    const { data, error } = await sb.from('orders').insert([newOrder]).select('id').single();

    if (error) {
      // Fallback to minimal schema if extension columns not yet applied
      console.warn('Orders full insert failed, retrying minimal:', error.message);
      const minimal = {
        user_email: email,
        user_id: body.user_id || null,
        total_amount: totalAmount,
        status: body.payment_method === 'cod' ? 'pending_cod' : 'pending',
        shipping_address: body.address || null,
      };
      const retry = await sb.from('orders').insert([minimal]).select('id').single();
      if (retry.error) {
        console.error('Order creation failed:', retry.error.message);
        return NextResponse.json({ error: 'Failed to record order' }, { status: 500 });
      }
      return NextResponse.json({ ok: true, order_id: retry.data?.id || mockRef });
    }

    const finalOrderId = data?.id || mockRef;

    // Automated Alert to Store Owner on Telegram
    notifyTelegramOrder({
      id: finalOrderId,
      total: totalAmount,
      paymentMethod: body.payment_method || 'cod',
      email,
      name: body.name,
      itemsCount: items.length,
      city: body.address?.city,
      items,
      address: body.address,
    }).catch((e) => console.error('Telegram background alert error:', e));

    return NextResponse.json({ ok: true, order_id: finalOrderId });
  } catch (err) {
    console.error('POST /api/orders error:', err);
    return NextResponse.json({ error: 'Internal order error' }, { status: 500 });
  }
}

