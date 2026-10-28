import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp, isValidOrderId, normalizeEmail, sanitizeCheckoutItems, cleanOrderId, isUuid, isHexPrefix, isNumericTracking } from '@/lib/security/validation';
import { notifyTelegramOrder } from '@/lib/notifications/telegram';
import { sendOrderConfirmationEmail, sendOrderDeliveredInvoiceEmail } from '@/lib/notifications/email';
import { isAdmin } from '@/lib/security/auth';
import { validateCouponCode } from '@/lib/festivals';
import { verifyStoreCreditCode, redeemStoreCredit } from '@/lib/store-credit';
import { products as fallbackCatalog, getProduct, enforcePriceFloor } from '@/lib/data/products';
import { fulfillQikinkOrder, isTestOrder } from '@/lib/fulfillment/qikink';

async function getVerifiedUserId(req: NextRequest, supabase: any): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ') || !supabase) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  try {
    const res = await supabase.auth.getUser(token);
    if (!res || res.error || !res.data?.user) return null;
    return res.data.user.id || null;
  } catch {
    return null;
  }
}

// GET /api/orders?email=x&orderId=y — Public /track read path & Admin lookup
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`orders:${clientIp(req.headers)}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ orders: [], error: 'Too many requests' }, { status: 429 });
  }

  const params = new URL(req.url).searchParams;
  const email = normalizeEmail(params.get('email'));
  const rawOrderId = params.get('orderId')?.trim() ?? '';
  const cleanedId = cleanOrderId(rawOrderId);
  const orderId = isValidOrderId(rawOrderId) ? cleanedId : null;

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
  // Service role only. The anon key cannot read `orders` under RLS, so the
  // previous fallback made every customer order lookup silently return empty.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { orders: [], demo: true, error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 503 }
    );
  }

  try {
    const sb = createClient(url, key);
    let data: any[] | null = null;
    let error: any = null;

    if (adminAuthorized) {
      let q = sb
        .from('orders')
        .select('id,user_email,total_amount,status,cj_order_id,tracking_number,tracking_url,items,payment_method,shipping_name,shipping_address,created_at')
        .order('created_at', { ascending: false });
      if (email) q = q.eq('user_email', email);
      if (orderId) {
        if (isUuid(orderId)) {
          q = q.eq('id', orderId);
        } else if (isNumericTracking(rawOrderId) || isNumericTracking(orderId)) {
          const num = isNumericTracking(rawOrderId) ? rawOrderId : orderId;
          q = q.or(`tracking_number.eq.${num},cj_order_id.eq.${num}`);
        } else if (isHexPrefix(orderId)) {
          const p = orderId.slice(0, 8).toLowerCase();
          q = q.gte('id', `${p}-0000-0000-0000-000000000000`).lte('id', `${p}-ffff-ffff-ffff-ffffffffffff`);
        }
      }
      const res = await q.limit(20);
      data = res.data;
      error = res.error;
    } else {
      const normalizedEmail = email!.toLowerCase().trim();
      // Secure public tracking: exact match on both order ID and email via service-role query
      if (isUuid(orderId!)) {
        const res = await sb
          .from('orders')
          .select('id,user_email,total_amount,subtotal,status,items,payment_method,shipping_name,shipping_address,tracking_number,tracking_url,created_at')
          .eq('id', orderId!)
          .eq('user_email', normalizedEmail)
          .limit(1);
        data = res.data;
        error = res.error;
      } else if (isNumericTracking(rawOrderId) || isNumericTracking(orderId!)) {
        const num = isNumericTracking(rawOrderId) ? rawOrderId : orderId!;
        const res = await sb
          .from('orders')
          .select('id,user_email,total_amount,subtotal,status,items,payment_method,shipping_name,shipping_address,tracking_number,tracking_url,created_at')
          .eq('user_email', normalizedEmail)
          .or(`tracking_number.eq.${num},cj_order_id.eq.${num}`)
          .limit(1);
        if (res.data && res.data.length > 0) {
          data = res.data;
          error = res.error;
        } else if (isHexPrefix(orderId!)) {
          const p = orderId!.slice(0, 8).toLowerCase();
          const pRes = await sb
            .from('orders')
            .select('id,user_email,total_amount,subtotal,status,items,payment_method,shipping_name,shipping_address,tracking_number,tracking_url,created_at')
            .gte('id', `${p}-0000-0000-0000-000000000000`)
            .lte('id', `${p}-ffff-ffff-ffff-ffffffffffff`)
            .eq('user_email', normalizedEmail)
            .limit(1);
          data = pRes.data;
          error = pRes.error;
        }
      } else if (isHexPrefix(orderId!)) {
        const p = orderId!.slice(0, 8).toLowerCase();
        const res = await sb
          .from('orders')
          .select('id,user_email,total_amount,subtotal,status,items,payment_method,shipping_name,shipping_address,tracking_number,tracking_url,created_at')
          .gte('id', `${p}-0000-0000-0000-000000000000`)
          .lte('id', `${p}-ffff-ffff-ffff-ffffffffffff`)
          .eq('user_email', normalizedEmail)
          .limit(1);
        data = res.data;
        error = res.error;
      } else {
        // Safe exit for non-UUID / non-prefix formats — guarantees zero Postgres 22P02 syntax crashes
        return NextResponse.json({ orders: [] });
      }
    }

    if (error) {
      console.error('Orders lookup failed:', error.message);
      if (error.code === '22P02') {
        return NextResponse.json({ orders: [] });
      }
      return NextResponse.json({ orders: [], error: 'Lookup failed' }, { status: 500 });
    }

    // Public view masks full street address / sensitive PII
    const orders = (data ?? []).map((o: Record<string, unknown>) => {
      const isPublic = !adminAuthorized;
      const addr = (o.shipping_address as Record<string, unknown>) || {};
      const safeAddress = isPublic
        ? {
            city: addr.city || null,
            state: addr.state || null,
            zip: addr.zip || null,
            country: addr.country || 'India',
          }
        : o.shipping_address;

      return {
        id: String(o.id),
        email: isPublic ? String(o.user_email ?? '').replace(/(?<=.{2}).(?=[^@]*?@)/g, '*') : String(o.user_email ?? ''),
        user_email: isPublic ? undefined : String(o.user_email ?? ''),
        items: Array.isArray(o.items) ? o.items : [],
        subtotal: Number(o.subtotal ?? o.total_amount ?? 0),
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

    // Public / Buyer Tax Invoice email request (verified via track_order security-definer RPC)
    if (body.action === 'email_invoice') {
      const rawTarget = String(body.orderId || '').trim();
      const targetOrderId = cleanOrderId(rawTarget);
      const targetEmail = normalizeEmail(body.email);
      if (!targetOrderId || !targetEmail) {
        return NextResponse.json({ error: 'orderId and email required' }, { status: 400 });
      }

      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) return NextResponse.json({ error: 'Database service unavailable (SUPABASE_SERVICE_ROLE_KEY required)' }, { status: 503 });
      const sb = createClient(url, key);

      let q = sb
        .from('orders')
        .select('id,user_email,total_amount,subtotal,status,items,payment_method,shipping_name,shipping_address,tracking_number,tracking_url,created_at')
        .eq('user_email', targetEmail.toLowerCase().trim());

      if (isUuid(targetOrderId)) {
        q = q.eq('id', targetOrderId);
      } else if (isNumericTracking(rawTarget) || isNumericTracking(targetOrderId)) {
        const num = isNumericTracking(rawTarget) ? rawTarget : targetOrderId;
        q = q.or(`tracking_number.eq.${num},cj_order_id.eq.${num}`);
      } else if (isHexPrefix(targetOrderId)) {
        const p = targetOrderId.slice(0, 8).toLowerCase();
        q = q.gte('id', `${p}-0000-0000-0000-000000000000`).lte('id', `${p}-ffff-ffff-ffff-ffffffffffff`);
      } else {
        return NextResponse.json({ error: 'Order not found or email does not match' }, { status: 404 });
      }

      const { data, error } = await q.limit(1);

      if (error || !data || data.length === 0) {
        return NextResponse.json({ error: 'Order not found or email does not match' }, { status: 404 });
      }

      const order = data[0];
      const addr = (order.shipping_address as any) || {};

      const sendRes = await sendOrderDeliveredInvoiceEmail({
        orderId: String(order.id),
        email: String(order.user_email || targetEmail),
        name: order.shipping_name,
        phone: addr.phone || '',
        total: Number(order.total_amount || 0),
        subtotal: Number(order.subtotal || order.total_amount || 0),
        paymentMethod: String(order.payment_method || 'cod'),
        trackingNumber: order.tracking_number,
        deliveryDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: Array.isArray(order.items) ? order.items : [],
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

      if (!sendRes.ok) {
        return NextResponse.json({ ok: false, error: sendRes.error || 'Failed to dispatch tax invoice email' }, { status: 502 });
      }

      return NextResponse.json({ ok: true, message: 'Tax invoice dispatched successfully' });
    }

    // Payment method is a CLOSED enum. Any other value previously slipped past
    // the COD guards and triggered an unpaid dispatch to the print factory.
    const rawPaymentMethod =
      typeof body.payment_method === 'string' ? body.payment_method.trim().toLowerCase() : '';
    if (!['cod', 'prepaid', 'online'].includes(rawPaymentMethod)) {
      return NextResponse.json(
        { error: 'Unsupported payment method. Use "cod" or "prepaid".' },
        { status: 400 }
      );
    }
    const isCod = rawPaymentMethod === 'cod';
    const paymentMethod = isCod ? 'cod' : 'prepaid';

    const email = normalizeEmail(body.email);
    if (!email) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Enforce 100% Free COD OTP Verification Token
    if (isCod) {
      const codToken = typeof body.cod_verified_token === 'string' ? body.cod_verified_token.trim() : '';
      if (!codToken) {
        return NextResponse.json(
          { error: 'Cash on Delivery orders require 6-digit email OTP verification before submission.' },
          { status: 400 }
        );
      }

      const secret = process.env.COD_OTP_SECRET || process.env.ADMIN_SECRET;
      if (!secret) {
        return NextResponse.json(
          { error: 'COD verification service unavailable (COD_OTP_SECRET required)' },
          { status: 503 }
        );
      }
      const parts = codToken.split(':');
      if (parts.length !== 5 || parts[0] !== 'cod-verified') {
        return NextResponse.json({ error: 'Invalid COD verification token format' }, { status: 400 });
      }

      const [, tokenEmail, tokenPhone, tokenTimestampStr, tokenSig] = parts;
      const tokenTimestamp = Number(tokenTimestampStr);

      // Token valid for 30 minutes
      if (isNaN(tokenTimestamp) || Date.now() - tokenTimestamp > 30 * 60 * 1000) {
        return NextResponse.json({ error: 'COD verification code has expired. Please verify again.' }, { status: 400 });
      }

      if (tokenEmail.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json({ error: 'COD verification token email mismatch' }, { status: 400 });
      }

      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(`cod-verified:${tokenEmail}:${tokenPhone}:${tokenTimestampStr}`)
        .digest('hex');

      const sigBuf = Buffer.from(tokenSig, 'utf8');
      const expBuf = Buffer.from(expectedSig, 'utf8');

      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return NextResponse.json({ error: 'Invalid or forged COD verification token' }, { status: 400 });
      }
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

    // Indian PIN codes are exactly 6 digits and never start with 0.
    // Without this the factory payload silently defaulted a malformed PIN to
    // 560001 (Bengaluru) and the parcel was routed to the wrong city.
    const pincode = String(addr.zip).trim();
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      return NextResponse.json({ error: 'Invalid Indian pincode. Must be 6 digits.' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Service role MANDATORY for order writes. No anon fallback: the public
    // anon key must never be able to write an order row.
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) {
      return NextResponse.json({ ok: true, mock: true, order_id: `mock_${Date.now()}` });
    }
    if (!key) {
      console.error(
        '[Orders API] SUPABASE_SERVICE_ROLE_KEY is not set - order creation is blocked. The anon key cannot read orders under RLS and must not write them.'
      );
      return NextResponse.json(
        { error: 'Order service is not configured. Set SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 503 }
      );
    }

    const sb = createClient(url, key);

    // Fetch product catalog to recalculate prices & verify stock server-side
    const itemIds = [...new Set(validatedItems.map((i) => i.id.split('__')[0]))];
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
      const baseId = item.id.split('__')[0];
      const rawProd = (prodMap.get(baseId) || prodMap.get(item.id) || getProduct(baseId) || getProduct(item.id) || fallbackCatalog.find((f) => f.id === baseId || f.id === item.id || f.slug === baseId)) as any;
      if (!rawProd) {
        return NextResponse.json({ error: `Product "${item.id}" is not available in catalog` }, { status: 400 });
      }
      const prod = enforcePriceFloor(rawProd);
      if ((prod as any).active === false || ((prod as any).stock != null && Number((prod as any).stock) <= 0)) {
        return NextResponse.json(
          { error: `"${prod.title}" is currently out of stock. Order cannot be placed.` },
          { status: 400 }
        );
      }

      let unitPrice = 449;
      const isUsdFloat = (p: number) => p > 0 && p < 60 && !Number.isInteger(p);
      if ((prod as any).price_inr != null && Number((prod as any).price_inr) > 0) {
        unitPrice = Math.round(Number((prod as any).price_inr));
      } else if (prod.price != null && Number(prod.price) > 0) {
        const p = Number(prod.price);
        unitPrice = isUsdFloat(p) ? Math.round(p * 85) : Math.round(p);
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
        return NextResponse.json({ error: 'Coupon codes cannot be applied to combo bundles.' }, { status: 400 });
      } else {
        const normalizedCode = String(body.coupon_code).trim().toUpperCase();
        if (isCod && normalizedCode === 'PREPAID30') {
          return NextResponse.json({
            error: 'The PREPAID30 coupon is exclusively valid for online prepaid orders.'
          }, { status: 400 });
        }
        if (normalizedCode.startsWith('CREDIT-') || normalizedCode.startsWith('RECREDIT-') || normalizedCode.startsWith('RE-CREDIT-')) {
          const credCheck = await verifyStoreCreditCode(normalizedCode, sb);
          if (!credCheck.valid) {
            return NextResponse.json({ error: credCheck.error || 'Invalid store credit voucher.' }, { status: 400 });
          }
          discountAmount = Math.min(credCheck.creditAmount, calculatedSubtotal);
          verifiedCoupon = normalizedCode;
        } else {
          // Store credit must NEVER pass through the plain coupon path: the
        // creditMatch branch in festivals.ts accepts signed vouchers with no
        // database check, so a CREDIT-* code here would apply a discount
        // with no verification and no redemption. Store credit redemption
        // lives exclusively in the prepaid checkout route.
        const rawCoupon = String(body.coupon_code).trim().toUpperCase();
        if (/^(?:RE-?)?CREDIT-/i.test(rawCoupon)) {
          return NextResponse.json(
            { error: 'Store credit vouchers can only be applied to prepaid online orders.' },
            { status: 400 }
          );
        }
        const couponCheck = validateCouponCode(body.coupon_code, calculatedSubtotal);
          if (couponCheck.valid) {
            discountAmount = couponCheck.discountAmount;
            verifiedCoupon = normalizedCode;
          } else {
            return NextResponse.json({
              error: couponCheck.error || `Coupon code "${body.coupon_code}" is invalid or order requirements not met.`
            }, { status: 400 });
          }
        }
      }
    }
    // NOTE: the previous `else if (body.discount)` branch trusted a
    // client-sent discount on COD orders with none of the prepaid-only /
    // minimum-order rules. It is deleted. COD orders get coupons only,
    // validated above; the prepaid incentive is computed server-side in the
    // checkout route for prepaid orders.

    const finalTotal = Math.max(1, calculatedSubtotal - discountAmount);

    // COD Handling & Verification Fee: ₹59 to cover courier collection costs (waived 100% on Prepaid UPI/Cards)
    const codFee = isCod ? 59 : 0;
    const chargedTotal = finalTotal + codFee;

    // Server-side COD Threshold Protection: COD capped strictly under ₹3,000 to prevent RTO courier fraud
    if (isCod && finalTotal >= 3000) {
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
        .eq('total_amount', chargedTotal)
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

    const verifiedUserId = await getVerifiedUserId(req, sb);

    const newOrder = {
      id: orderId,
      user_email: email,
      user_id: verifiedUserId,
      stripe_session_id: orderRef,
      total_amount: chargedTotal,
      status: isCod ? 'pending_cod' : 'pending',
      payment_method: paymentMethod,
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
      fulfillment_error: verifiedCoupon ? `STORE_CREDIT_APPLIED: [${verifiedCoupon}] Discount: ₹${discountAmount}` : null,
    };

    // Explicit UUID supplied: We omit .select('id') so Supabase executes return=minimal,
    // avoiding the Postgres RLS 42501 error on anon key where SELECT is restricted to authenticated users.
    const { error } = await sb.from('orders').insert([newOrder]);

    if (error) {
      console.warn('Orders insert retry minimal:', error.message);
      const minimal = {
        id: orderId,
        user_email: email,
        total_amount: chargedTotal,
        status: isCod ? 'pending_cod' : 'pending',
        payment_method: paymentMethod,
        shipping_address: newOrder.shipping_address,
      };
      const retry = await sb.from('orders').insert([minimal]);
      if (retry.error) {
        console.error('Order creation failed:', retry.error.message);
        return NextResponse.json({ error: 'Failed to record order' }, { status: 500 });
      }
    }

    const finalOrderId = orderId;

    if (verifiedCoupon && (verifiedCoupon.startsWith('CREDIT-') || verifiedCoupon.startsWith('RECREDIT-') || verifiedCoupon.startsWith('RE-CREDIT-'))) {
      const redemption = await redeemStoreCredit(verifiedCoupon, finalOrderId, sb);
      if (!redemption.success) {
        await sb.from('orders').delete().eq('id', finalOrderId);
        return NextResponse.json(
          { error: redemption.error || 'This store credit voucher has already been used.' },
          { status: 400 }
        );
      }
    }

    // Automated Alert to Store Owner on Telegram
    await notifyTelegramOrder({
      id: finalOrderId,
      total: chargedTotal,
      paymentMethod,
      email,
      name: body.name,
      itemsCount: enrichedItems.length,
      city: addr.city,
      items: enrichedItems,
      address: newOrder.shipping_address,
    }).catch((e) => console.error('Telegram background alert error:', e));

    // Automated Order Confirmation Email to Customer
    sendOrderConfirmationEmail({
      orderId: finalOrderId,
      email,
      name: body.name,
      total: chargedTotal,
      paymentMethod,
      items: enrichedItems.map((it: any) => ({
        title: it.title,
        qty: it.qty,
        price: it.price,
        size: it.size,
        color: it.color,
      })),
      address: {
        city: addr.city,
        state: addr.state,
        zip: addr.zip,
      },
    }).then((emailRes) => {
      if (!emailRes.ok) {
        console.warn(`[Orders API] Customer order confirmation email deferred/failed for ${finalOrderId}:`, emailRes.error);
      }
    }).catch((e) => console.error('Customer email confirmation error:', e));

    // Automated Order Dispatch to Qikink (Domestic hub)
    // ONLY dispatch genuine customer orders; test/temp orders are strictly blocked.
    // COD orders are safely held in 'pending_cod' awaiting WhatsApp address confirmation,
    // protecting against ₹345 RTO dead-inventory losses. Prepaid orders dispatch immediately!
    if (isTestOrder(newOrder)) {
      console.log(`[Orders API] Order ${finalOrderId} identified as test/temp order. Skipping Qikink factory dispatch.`);
    } else if (isCod) {
      console.log(`[Orders API] Dispatching COD Order ${finalOrderId} to Qikink manufacturing hub.`);
      // Await, never fire-and-forget: serverless freezes the function once
      // the response returns, which can kill the factory call mid-flight.
      await fulfillQikinkOrder(sb, finalOrderId, newOrder).then((res) => {
        if (res.ok) console.log(`[Orders API] COD Order ${finalOrderId} transmitted to Qikink: ${res.qikinkOrderId}`);
        else console.warn(`[Orders API] COD Order ${finalOrderId} Qikink dispatch failed: ${res.reason}`);
      });
    } else {
      // Prepaid orders are NOT paid yet at this point (Razorpay has not
      // captured the payment). Dispatching here printed and shipped free
      // merchandise. Factory transmission now happens only from the verified
      // Razorpay webhook, or from the retry worker once status='paid'.
      console.log(
        `[Orders API] Prepaid order ${finalOrderId} recorded as pending. Factory dispatch deferred until Razorpay confirms payment.`
      );
    }

    return NextResponse.json({
      ok: true,
      order_id: finalOrderId,
      // Factory dispatch no longer happens here for prepaid orders: the
      // payment is not confirmed at this point. It happens from the verified
      // Razorpay webhook, or from the retry worker once status='paid'.
      qikink_order_id: null,
      courier: null,
    });
  } catch (err) {
    console.error('POST /api/orders error:', err);
    return NextResponse.json({ error: 'Internal order error' }, { status: 500 });
  }
}
