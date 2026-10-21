import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp, normalizeEmail, sanitizeCheckoutItems, sanitizeMessage } from '@/lib/security/validation';
import { products as staticCatalog, getProduct } from '@/lib/data/products';
import { validateCouponCode } from '@/lib/festivals';

function getRazorpay(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

interface DbProduct {
  id: string;
  title: string;
  price: number | string;
  price_inr?: number | string | null;
  image_url?: string | null;
}

interface CheckoutItem {
  id: string;
  qty: number;
}

interface CheckoutBody {
  items?: CheckoutItem[];
  email?: string;
  name?: string;
  phone?: string;
  address?: Record<string, string>;
  user_id?: string;
  market?: string;
  coupon_code?: string;
  discount?: number;
}

/**
 * Lenient address parser: keeps whatever address fields the shopper filled
 * in (partial addresses are fine — city/ZIP optional), drops anything
 * empty or over-long. Never rejects the whole address for one blank field.
 */
function parseAddress(v: unknown): Record<string, string> | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v)) {
    if (typeof val !== 'string') continue;
    const clean = val.trim().slice(0, 200);
    if (clean.length === 0) continue;
    out[k.slice(0, 50)] = clean;
  }
  return Object.keys(out).length > 0 ? out : null;
}

export async function POST(req: NextRequest) {
  try {
    const rl = checkRateLimit(`checkout:${clientIp(req.headers)}`, 8, 600_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 });
    }

    const body = (await req.json()) as CheckoutBody & { _hp_company?: string };

    // Anti-bot honeypot check
    if (body._hp_company) {
      return NextResponse.json({ error: 'Automated submission rejected' }, { status: 400 });
    }

    const items = sanitizeCheckoutItems(body.items);
    if (!items) {
      return NextResponse.json({ error: 'Cart is empty or invalid' }, { status: 400 });
    }

    const email = normalizeEmail(body.email);
    if (!email) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const name = sanitizeMessage(body.name, 100);
    const address = parseAddress(body.address);
    if (!address || !address.line1 || !address.city || !address.zip) {
      return NextResponse.json(
        { error: 'Complete delivery address (street address, city, and pincode/zip) is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const razorpay = getRazorpay();

    const isIndia = body.market !== 'GLOBAL';
    let subtotal = 0;
    let byId = new Map<string, DbProduct>();

    if (supabase) {
      const ids = [...new Set(items.map((i) => i.id.split('__')[0]))];
      const { data: rows } = await supabase
        .from('products')
        .select('id, title, price, price_inr, image_url, active, stock')
        .in('id', ids);

      if (rows && rows.length > 0) {
        const outOfStock = rows.find((r: any) => r.active === false || (r.stock != null && Number(r.stock) <= 0));
        if (outOfStock) {
          return NextResponse.json(
            { error: `"${outOfStock.title}" is currently out of stock at our studio. Order cannot be placed.` },
            { status: 400 }
          );
        }
      }
      byId = new Map((rows ?? []).map((r) => [r.id, r as DbProduct]));
    }

    for (const item of items) {
      const baseId = item.id.split('__')[0];
      const dbProd = byId.get(baseId) || byId.get(item.id);
      const staticProd = getProduct(baseId) || getProduct(item.id) || staticCatalog.find((p) => p.id === baseId || p.id === item.id || p.slug === baseId);
      if (!dbProd && !staticProd) {
        return NextResponse.json({ error: `Product "${item.id}" is no longer available in catalog` }, { status: 400 });
      }

      let unitPrice = 0;
      if (dbProd) {
        if (isIndia) {
          if (dbProd.price_inr != null && Number(dbProd.price_inr) > 0) {
            unitPrice = Number(dbProd.price_inr);
          } else {
            const p = Number(dbProd.price);
            unitPrice = p >= 80 ? Math.round(p) : Math.round(p * 85);
          }
        } else {
          const p = Number(dbProd.price);
          unitPrice = p >= 80 ? Number((p / 85).toFixed(2)) : p;
        }
      } else if (staticProd) {
        if (isIndia) {
          unitPrice = staticProd.price_inr || (staticProd.price >= 80 ? Math.round(staticProd.price) : Math.round(staticProd.price * 85));
        } else {
          unitPrice = staticProd.price >= 80 ? Number((staticProd.price / 85).toFixed(2)) : staticProd.price;
        }
      }
      subtotal += unitPrice * item.qty;
    }

    // Apply Coupon Code if verified (block stacking on bundles)
    let discountAmount = 0;
    let verifiedCoupon = '';
    const hasBundle = items.some((i) => i.id.startsWith('bundle-'));
    if (body.coupon_code) {
      if (hasBundle) {
        console.log(`[Checkout API] Coupon ${body.coupon_code} disallowed on bundle cart.`);
      } else {
        const couponCheck = validateCouponCode(body.coupon_code, subtotal);
        if (couponCheck.valid) {
          discountAmount = couponCheck.discountAmount;
          verifiedCoupon = body.coupon_code.trim().toUpperCase();
        }
      }
    }

    const finalTotal = Math.max(0, subtotal - discountAmount);

    // Insert helper: tries the full schema.sql shape first, then falls back
    // to the minimal live-safe columns if migration 0002 hasn't run yet.
    async function insertOrder(row: Record<string, unknown>): Promise<boolean> {
      if (!supabase) return false;
      const orderPayload = {
        id: row.id || crypto.randomUUID(),
        ...row,
      };
      const { error } = await supabase.from('orders').insert([orderPayload]);
      if (!error) return true;
      if (/column .* does not exist/i.test(error.message)) {
        console.warn('Orders table missing extension columns — retrying minimal insert (run migration 0002).');
        const minimal = {
          id: orderPayload.id,
          user_email: row.user_email,
          user_id: row.user_id,
          total_amount: row.total_amount,
          status: row.status,
          shipping_address: row.shipping_address,
        };
        const retry = await supabase.from('orders').insert([minimal]);
        if (retry.error) {
          console.error('Minimal order insert failed:', retry.error.message);
          return false;
        }
        return true;
      }
      console.error('Order insert failed:', error.message);
      return false;
    }

    if (!razorpay || !supabase) {
      if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_MOCK_CHECKOUT === 'true') {
        const mockOrderId = `mock_${Date.now()}`;
        if (supabase) {
          await insertOrder({
            user_email: email,
            user_id: body.user_id || null,
            stripe_session_id: mockOrderId,
            total_amount: finalTotal,
            status: 'pending',
            items,
            subtotal,
            shipping: 0,
          });
        }
        return NextResponse.json({ mock: true, url: `/success?mock=1&email=${encodeURIComponent(email)}&total=${finalTotal.toFixed(2)}` });
      }
      return NextResponse.json({ error: 'Payment gateway configuration unavailable' }, { status: 503 });
    }

    if (finalTotal === 0) {
      return NextResponse.json({ error: 'No valid products in cart' }, { status: 400 });
    }

    // Razorpay amount in paise (1 INR = 100 paise)
    const inrPaise = isIndia
      ? Math.round(finalTotal * 100)
      : Math.round(finalTotal * 85 * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: inrPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        email,
        name: (name || '').slice(0, 100),
        phone: String(body.phone || address?.phone || '').slice(0, 20),
        coupon: (verifiedCoupon || '').slice(0, 50),
        discount: String(discountAmount),
      },
    });

    const saved = await insertOrder({
      user_email: email,
      user_id: body.user_id || null,
      stripe_session_id: rzpOrder.id,
      total_amount: finalTotal,
      status: 'pending',
      items,
      subtotal,
      shipping: 0,
      shipping_name: name || null,
      shipping_address: address || null,
    });

    if (!saved) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json({
      order_id: rzpOrder.id,
      amount: inrPaise,
      currency: 'INR',
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('POST /api/checkout error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Checkout failed' }, { status: 500 });
  }
}
