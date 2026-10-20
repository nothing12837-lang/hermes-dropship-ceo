import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp, isValidOrderId, normalizeEmail, sanitizeCheckoutItems } from '@/lib/security/validation';
import { notifyTelegramOrder } from '@/lib/notifications/telegram';
import { isAdmin } from '@/lib/security/auth';
import { validateCouponCode } from '@/lib/festivals';
import { products as fallbackCatalog } from '@/lib/data/products';
import { fulfillQikinkOrder, isTestOrder } from '@/lib/fulfillment/qikink';

// GET /api/orders?email=x&orderId=y — Public /track read path & Admin lookup
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`orders:${clientIp(req.headers)}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ orders: [], error: 'Too many requests' }, { status: 429 });
  }

  const params = new URL(req.url).searchParams;
  const email = normalizeEmail(params.get('email'));
  const rawOrderId = params.get('orderId')?.trim() ?? '';
  const orderId = isValidOrderId(rawOrderId) ? rawOrderId : null;

  const adminAuthorized = isAdmin(req);

  // IDOR & PII Protection: Public users MUST provide BOTH orderId AND email.
  if (!adminAuthorized) {
    if (!email || !orderId) {
      return NextResponse.json(
        { orders: [], error: 'Both valid Order ID and Email are required to track an order.' },
        { status: 400 }
      );
    }
  } else {
    if (!email && !orderId) {
      return NextResponse.json({ orders: [], error: 'Email or Order ID required for admin query' }, { status: 400 });
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ orders: [], demo: true });

  try {
    const sb = createClient(url, key);
    let data: any[] | null = null;
    let error: any = null;

    if (adminAuthorized) {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        let q = sb
          .from('orders')
          .select('id,user_email,total_amount,status,cj_order_id,tracking_number,tracking_url,items,payment_method,shipping_name,shipping_address,created_at')
          .order('created_at', { ascending: false });
        if (email) q = q.eq('user_email', email);
        if (orderId) q = q.ilike('id', `${orderId}%`);
        const res = await q.limit(20);
        data = res.data;
        error = res.error;
      } else {
        const adminSecret = process.env.ADMIN_SECRET;
        if (!adminSecret) {
          return NextResponse.json({ error: 'Server admin configuration missing' }, { status: 500 });
        }
        const res = await sb.rpc('admin_lookup_orders', {
          p_admin_secret: adminSecret,
          p_order_id: orderId || null,
          p_email: email || null,
        });
        data = res.data;
        error = res.error;
      }
    } else {
      // Secure public tracking: exact match on both order ID and email via security-definer RPC
      const res = await sb.rpc('track_order', {
        p_order_id: orderId,
        p_email: email,
      });
      data = res.data;
      error = res.error;
    }

    if (error) {
      console.error('Orders lookup failed:', error.message);
      return NextResponse.json({ orders: [], error: 'Lookup failed' }, { status: 500 });
    }

    // Public view masks full street address / sensitive PII
    const orders = (data ?? []).map((o: Record<string, unknown>) => {
      const isPublic = !adminAuthorized;
      const addr = (o.shipping_address as Record<string, unknown>) || {};
      const safeAddress = isPublic
        ? { city: addr.city || null, state: addr.state || null, country: addr.country || 'India' }
        : o.shipping_address;

      return {
        id: String(o.id),
        email: isPublic ? String(o.user_email ?? '').replace(/(?<=.{2}).(?=[^@]*?@)/g, '*') : String(o.user_email ?? ''),
        user_email: isPublic ? undefined : String(o.user_email ?? ''),
        items: Array.isArray(o.items) ? o.items : [],
        total: Number(o.total_amount ?? 0),
        total_amount: Number(o.total_amount ?? 0),
        status: String(o.status ?? 'pending'),
        payment_method: String(o.payment_method ?? 'online'),
        shipping_name: (o.shipping_name as string) ?? null,
        shipping_address: safeAddress,
        tracking_number: (o.tracking_number as string) ?? null,
        tracking_url: (o.tracking_url as string) ?? null,
        created_at: String(o.created_at ?? ''),
      };
    });

    return NextResponse.json({ orders });
  } catch (e) {
    console.error('Orders lookup error:', e instanceof Error ? e.message : e);
    return NextResponse.json({ orders: [], error: 'Lookup failed' }, { status: 500 });
  }
}

// POST /api/orders — Create COD Order (Server-recalculated pricing & stock check)
export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`order_create:${clientIp(req.headers)}`, 6, 600_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait a few minutes.' }, { status: 429 });
  }

  try {
    const body = await req.json();

    // Anti-bot honeypot check
    if (body._hp_company) {
      return NextResponse.json({ error: 'Automated submission rejected' }, { status: 400 });
    }

    const email = normalizeEmail(body.email);
    if (!email) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Validate checkout items schema and bounded quantities
    const validatedItems = sanitizeCheckoutItems(body.items);
    if (!validatedItems || validatedItems.length === 0) {
      return NextResponse.json({ error: 'Invalid cart items or quantities (1–99)' }, { status: 400 });
    }

    // Address verification: line1, city, zip required
    const addr = body.address || {};
    if (!addr.line1 || !addr.city || !addr.zip) {
      return NextResponse.json({ error: 'Complete delivery address (street, city, pincode) is required' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json({ ok: true, mock: true, order_id: `mock_${Date.now()}` });
    }

    const sb = createClient(url, key);

    // Fetch product catalog to recalculate prices & verify stock server-side
    const itemIds = validatedItems.map((i) => i.id);
    const { data: dbProducts, error: prodErr } = await sb
      .from('products')
      .select('id, title, price_inr, price, active, stock')
      .in('id', itemIds);

    if (prodErr) {
      console.error('Products fetch failed:', prodErr.message);
      return NextResponse.json({ error: 'Unable to verify catalog prices' }, { status: 500 });
    }

    const prodMap = new Map((dbProducts ?? []).map((p) => [p.id, p]));

    let calculatedSubtotal = 0;
    const enrichedItems: Array<{
      id: string;
      title: string;
      price: number;
      qty: number;
      imageUrl?: string;
      selectedStyle?: string;
      size?: string;
      color?: string;
      phoneModel?: string;
      customText?: string;
      customPlacement?: string;
      customPosition?: string;
      customScale?: number;
      customTextColor?: string;
      customFont?: string;
      customImage?: string;
      customImageName?: string;
    }> = [];

    for (const item of validatedItems) {
      const prod = prodMap.get(item.id) || fallbackCatalog.find((f) => f.id === item.id);
      if (!prod) {
        return NextResponse.json({ error: `Product "${item.id}" is not available in catalog` }, { status: 400 });
      }
      if ((prod as any).active === false || ((prod as any).stock != null && Number((prod as any).stock) <= 0)) {
        return NextResponse.json(
          { error: `"${prod.title}" is currently out of stock. Order cannot be placed.` },
          { status: 400 }
        );
      }

      let unitPrice = 449;
      if ((prod as any).price_inr != null && Number((prod as any).price_inr) > 0) {
        unitPrice = Math.round(Number((prod as any).price_inr));
      } else if (prod.price != null && Number(prod.price) > 0) {
        const p = Number(prod.price);
        unitPrice = p >= 80 ? Math.round(p) : Math.round(p * 85);
      }
      calculatedSubtotal += unitPrice * item.qty;
      enrichedItems.push({
        id: item.id,
        title: prod.title,
        price: unitPrice,
        qty: item.qty,
        imageUrl: item.imageUrl || (prod as any).image_url,
        selectedStyle: item.selectedStyle || (item.imageUrl ? 'Selected Design' : undefined),
        size: item.size,
        color: item.color,
        phoneModel: item.phoneModel,
        customText: item.customText,
        customPlacement: item.customPlacement,
        customPosition: item.customPosition,
        customScale: item.customScale,
        customTextColor: item.customTextColor,
        customFont: item.customFont,
        customImage: item.customImage,
        customImageName: item.customImageName,
      });
    }

    // Apply Coupon Code server-side only (block stacking on bundles)
    let discountAmount = 0;
    let verifiedCoupon = '';
    const hasBundle = validatedItems.some((i) => i.id.startsWith('bundle-'));
    if (body.coupon_code) {
      if (hasBundle) {
        console.log(`[Orders API] Coupon ${body.coupon_code} disallowed on bundle order.`);
      } else {
        const couponCheck = validateCouponCode(body.coupon_code, calculatedSubtotal);
        if (couponCheck.valid) {
          discountAmount = couponCheck.discountAmount;
          verifiedCoupon = String(body.coupon_code).trim().toUpperCase();
        }
      }
    }

    const finalTotal = Math.max(0, calculatedSubtotal - discountAmount);

    // Server-side COD Threshold Protection: COD capped strictly under ₹3,000 to prevent RTO courier fraud
    if (body.payment_method === 'cod' && finalTotal >= 3000) {
      return NextResponse.json(
        {
          error:
            'Cash on Delivery is limited to orders up to ₹2,999. For high-value orders of ₹3,000 and above, please complete payment via Instant UPI or Cards for insured express air dispatch.',
        },
        { status: 400 }
      );
    }

    // Strict Idempotency Guard
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
      // Deduplication window (60s) for identical email + total + pending_cod
      const recent = await sb
        .from('orders')
        .select('id, created_at')
        .eq('user_email', email)
        .eq('total_amount', finalTotal)
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

    const orderId = crypto.randomUUID();
    const orderRef = idempotencyKey || `cod_${Date.now()}`;

    const newOrder = {
      id: orderId,
      user_email: email,
      user_id: body.user_id || null,
      stripe_session_id: orderRef,
      total_amount: finalTotal,
      status: body.payment_method === 'cod' ? 'pending_cod' : 'pending',
      items: enrichedItems,
      subtotal: calculatedSubtotal,
      shipping: 0,
      shipping_name: typeof body.name === 'string' ? body.name.slice(0, 100) : null,
      shipping_address: {
        line1: String(addr.line1).slice(0, 200),
        city: String(addr.city).slice(0, 100),
        state: String(addr.state || '').slice(0, 100),
        zip: String(addr.zip).slice(0, 20),
        country: 'India',
        phone: String(addr.phone || body.phone || '').slice(0, 20),
      },
    };

    // Explicit UUID supplied: We omit .select('id') so Supabase executes return=minimal,
    // avoiding the Postgres RLS 42501 error on anon key where SELECT is restricted to authenticated users.
    const { error } = await sb.from('orders').insert([newOrder]);

    if (error) {
      console.warn('Orders insert retry minimal:', error.message);
      const minimal = {
        id: orderId,
        user_email: email,
        total_amount: finalTotal,
        status: body.payment_method === 'cod' ? 'pending_cod' : 'pending',
        shipping_address: newOrder.shipping_address,
      };
      const retry = await sb.from('orders').insert([minimal]);
      if (retry.error) {
        console.error('Order creation failed:', retry.error.message);
        return NextResponse.json({ error: 'Failed to record order' }, { status: 500 });
      }
    }

    const finalOrderId = orderId;

    // Automated Alert to Store Owner on Telegram
    await notifyTelegramOrder({
      id: finalOrderId,
      total: finalTotal,
      paymentMethod: body.payment_method || 'cod',
      email,
      name: body.name,
      itemsCount: enrichedItems.length,
      city: addr.city,
      items: enrichedItems,
      address: newOrder.shipping_address,
    }).catch((e) => console.error('Telegram background alert error:', e));

    // Automated Order Dispatch to Qikink (Tirupur hub)
    // ONLY dispatch genuine customer orders; test/temp orders are strictly blocked.
    // COD orders are safely held in 'pending_cod' awaiting WhatsApp address confirmation,
    // protecting against ₹345 RTO dead-inventory losses. Prepaid orders dispatch immediately!
    let fulfillment: any = null;
    const isCod = body.payment_method === 'cod';

    if (isTestOrder(newOrder)) {
      console.log(`[Orders API] Order ${finalOrderId} identified as test/temp order. Skipping Qikink factory dispatch.`);
    } else if (isCod) {
      console.log(`[Orders API] COD Order ${finalOrderId} safely held in pending_cod awaiting customer confirmation.`);
    } else {
      fulfillment = await fulfillQikinkOrder(sb, finalOrderId, newOrder).catch((e) => {
        console.error('Qikink auto-fulfillment background error:', e);
        return { ok: false, reason: String(e) };
      });
    }

    return NextResponse.json({
      ok: true,
      order_id: finalOrderId,
      qikink_order_id: fulfillment?.qikinkOrderId || null,
      courier: fulfillment?.courier || null,
    });
  } catch (err) {
    console.error('POST /api/orders error:', err);
    return NextResponse.json({ error: 'Internal order error' }, { status: 500 });
  }
}
