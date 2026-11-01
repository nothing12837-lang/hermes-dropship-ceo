import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp, normalizeEmail, sanitizeCheckoutItems, sanitizeMessage } from '@/lib/security/validation';
import { products as staticCatalog, getProduct, enforcePriceFloor } from '@/lib/data/products';
import { validateCouponCode } from '@/lib/festivals';
import { verifyStoreCreditCode, redeemStoreCredit } from '@/lib/store-credit';
import { verifyLoyaltyVoucher, redeemLoyaltyVoucher, calculateTeeBundleSavings } from '@/lib/loyalty';

function getRazorpay(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Require service role: orders table has RLS enabled with service_role ONLY access.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

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

    // PRICING CONTEXT MUST BE DERIVED FROM THE SHIPPING PIN.
    //
    // This used to be `body.market !== 'GLOBAL'` -- a CLIENT-SUPPLIED string.
    // Sending market:"GLOBAL" turned every price into a USD float (~1/85 of
    // the INR price), and combined with the client-trusted `discount` field
    // it let any cart be bought for ~Rs.85. India-ness is now derived from
    // the delivery pincode, which the orders route validates anyway.
    const addrZip = String(
      (body as any)?.address?.zip || (body as any)?.address?.pincode || ''
    ).replace(/\D/g, '');
    const isIndia = /^[1-9][0-9]{5}$/.test(addrZip);
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
      const rawProd = (byId.get(baseId) || byId.get(item.id) || getProduct(baseId) || getProduct(item.id) || staticCatalog.find((p) => p.id === baseId || p.id === item.id || p.slug === baseId)) as any;
      if (!rawProd) {
        return NextResponse.json({ error: `Product "${item.id}" is no longer available in catalog` }, { status: 400 });
      }
      if (rawProd.active === false) {
        return NextResponse.json(
          { error: `"${rawProd.title}" is currently out of stock or paused. Order cannot be placed.` },
          { status: 400 }
        );
      }
      const prod = enforcePriceFloor(rawProd);
      if (prod.active === false) {
        return NextResponse.json(
          { error: `"${prod.title}" is currently out of stock or paused. Order cannot be placed.` },
          { status: 400 }
        );
      }

      let unitPrice = 0;
      const isUsdFloat = (p: number) => p > 0 && p < 60 && !Number.isInteger(p);
      if (isIndia) {
        if (prod.price_inr != null && Number(prod.price_inr) > 0) {
          unitPrice = Number(prod.price_inr);
        } else {
          const p = Number(prod.price);
          unitPrice = isUsdFloat(p) ? Math.round(p * 85) : Math.round(p);
        }
      } else {
        const p = Number(prod.price);
        unitPrice = p >= 80 ? Number((p / 85).toFixed(2)) : p;
      }
      subtotal += unitPrice * item.qty;
    }

    // ₹0 COD Handling Surcharge across all payment methods
    const isCod = (body as any).payment_method === 'cod' || (body as any).payment_method === 'partial_cod';
    const isPartialCod = (body as any).payment_method === 'partial_cod';
    const codFee = 0; // ₹0 COD Fee

    // First-Order Welcome Discount verification (0 previous confirmed/delivered orders)
    let isFirstOrder = true;
    try {
      const cleanEmail = normalizeEmail(body.email);
      const cleanPhone = String(body.phone || address?.phone || '').replace(/\D/g, '').slice(-10);
      if ((cleanEmail || cleanPhone) && supabase) {
        let checkQuery = supabase.from('orders').select('id', { count: 'exact', head: true });
        if (cleanEmail && cleanPhone) {
          checkQuery = checkQuery.or(`user_email.ilike.${cleanEmail},shipping_address->>phone.ilike.%${cleanPhone}%`);
        } else if (cleanEmail) {
          checkQuery = checkQuery.ilike('user_email', cleanEmail);
        } else {
          checkQuery = checkQuery.ilike('shipping_address->>phone', `%${cleanPhone}%`);
        }
        const { count } = await checkQuery.in('status', ['paid', 'delivered', 'shipped', 'processing']);
        if (count && count > 0) {
          isFirstOrder = false;
        }
      }
    } catch (checkErr) {
      console.warn('[Checkout API] First order check failed, defaulting to true:', checkErr);
    }

    // Calculate Buy Any 2 (240 GSM Tees) Bundle Savings
    const teeBundleSavings = calculateTeeBundleSavings(items.map(it => {
      const prod = (byId.get(it.id) || staticCatalog.find((p) => p.id === it.id)) as any;
      return {
        id: it.id,
        qty: it.qty,
        title: prod?.title || (it as any).title,
        price: prod?.price != null ? Number(prod.price) : undefined,
        price_inr: prod?.price_inr != null ? Number(prod.price_inr) : undefined,
      };
    }));

    // Apply Coupon Code if verified (block stacking on bundles)
    let discountAmount = 0;
    let verifiedCoupon = '';
    const hasBundle = items.some((i) => i.id.startsWith('bundle-'));

    if (body.coupon_code) {
      if (hasBundle || teeBundleSavings > 0) {
        console.log(`[Checkout API] Coupon ${body.coupon_code} disallowed on bundle/buy2 cart.`);
        return NextResponse.json({ error: 'Coupon codes cannot be applied to combo or 240 GSM multi-tee bundles.' }, { status: 400 });
      }
      const rawCode = body.coupon_code.trim().toUpperCase();
      if (isCod && (rawCode === 'PREPAID50' || rawCode === 'PREPAID30' || rawCode === 'ARCHIVE100' || rawCode === 'WELCOME_UPI100')) {
        return NextResponse.json({
          error: `The ${rawCode} coupon is exclusively valid for online prepaid orders.`
        }, { status: 400 });
      }
      if (rawCode.startsWith('CREDIT-') || rawCode.startsWith('RECREDIT-') || rawCode.startsWith('RE-CREDIT-')) {
        const creditCheck = await verifyStoreCreditCode(rawCode, supabase);
        if (!creditCheck.valid) {
          return NextResponse.json({ error: creditCheck.error || 'Invalid store credit voucher.' }, { status: 400 });
        }
        discountAmount = Math.min(creditCheck.creditAmount, subtotal);
        verifiedCoupon = rawCode;
      } else if (rawCode.startsWith('RE-GIFT-')) {
        const voucherCheck = await verifyLoyaltyVoucher(rawCode, subtotal, supabase);
        if (!voucherCheck.valid) {
          return NextResponse.json({ error: voucherCheck.error || 'Invalid gift voucher.' }, { status: 400 });
        }
        // Returning customer combines ₹50 Gift Voucher + ₹50 UPI Discount on online prepaid
        const baseVoucher = voucherCheck.discountAmount;
        discountAmount = !isCod && isIndia ? Math.min(baseVoucher + 50, subtotal) : Math.min(baseVoucher, subtotal);
        verifiedCoupon = rawCode;
      } else {
        const couponCheck = validateCouponCode(body.coupon_code, subtotal);
        if (couponCheck.valid) {
          discountAmount = couponCheck.discountAmount;
          verifiedCoupon = rawCode;
        } else {
          return NextResponse.json({
            error: couponCheck.error || `Coupon code "${body.coupon_code}" is invalid or minimum order requirement not met.`
          }, { status: 400 });
        }
      }
    } else {
      // Auto UPI Instant Discount calibrated for strict 20.0% to 25.0% profit margin
      if (!isCod && isIndia) {
        const upiOff = subtotal <= 700 ? 10 : 20;
        discountAmount = upiOff;
        verifiedCoupon = upiOff === 10 ? 'PREPAID10' : 'PREPAID20';
      } else {
        discountAmount = 0;
        verifiedCoupon = '';
      }
    }

    const finalTotal = Math.max(1, subtotal - discountAmount + codFee);

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
        console.warn('Orders table missing extension columns — retrying with standard fulfillment columns.');
        const minimal = {
          id: orderPayload.id,
          user_email: row.user_email,
          user_id: row.user_id,
          stripe_session_id: row.stripe_session_id,
          total_amount: row.total_amount,
          status: row.status,
          payment_method: row.payment_method,
          items: row.items,
          subtotal: row.subtotal,
          shipping: row.shipping ?? 0,
          shipping_name: row.shipping_name,
          shipping_address: row.shipping_address,
        };
        const retry = await supabase.from('orders').insert([minimal]);
        if (retry.error) {
          console.error('Standard order insert failed:', retry.error.message);
          return false;
        }
        return true;
      }
      console.error('Order insert failed:', error.message);
      return false;
    }

    const verifiedUserId = await getVerifiedUserId(req, supabase);

    if (!razorpay || !supabase) {
      if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_MOCK_CHECKOUT === 'true') {
        const mockOrderId = `mock_${Date.now()}`;
        if (supabase) {
          await insertOrder({
            id: mockOrderId,
            user_email: email,
            user_id: verifiedUserId,
            stripe_session_id: mockOrderId,
            total_amount: finalTotal,
            status: 'pending',
            payment_method: 'prepaid',
            items,
            subtotal,
            shipping: 0,
          });
          if (verifiedCoupon && (verifiedCoupon.startsWith('CREDIT-') || verifiedCoupon.startsWith('RECREDIT-') || verifiedCoupon.startsWith('RE-CREDIT-'))) {
            await redeemStoreCredit(verifiedCoupon, mockOrderId, supabase);
          } else if (verifiedCoupon && verifiedCoupon.startsWith('RE-GIFT-')) {
            await redeemLoyaltyVoucher(verifiedCoupon, mockOrderId, supabase);
          }
        }
        return NextResponse.json({ mock: true, url: `/success?mock=1&email=${encodeURIComponent(email)}&total=${finalTotal.toFixed(2)}` });
      }
      return NextResponse.json({ error: 'Payment gateway configuration unavailable' }, { status: 503 });
    }

    if (finalTotal === 0) {
      return NextResponse.json({ error: 'No valid products in cart' }, { status: 400 });
    }

    const isPartialCodOrder = isPartialCod;
    // For Partial COD, charge exactly ₹100.00 advance (10,000 paise). Full prepaid charges finalTotal.
    const inrPaise = isPartialCodOrder
      ? 10000
      : (isIndia ? Math.round(finalTotal * 100) : Math.round(finalTotal * 85 * 100));

    const checkoutOrderId = crypto.randomUUID();
    const rzpOrder = await razorpay.orders.create({
      amount: inrPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        order_id: checkoutOrderId,
        payment_type: isPartialCodOrder ? 'partial_cod' : 'full_prepaid',
        full_total: String(finalTotal),
        cod_balance: String(isPartialCodOrder ? Math.max(0, finalTotal - 100) : 0),
        email,
        name: (name || '').slice(0, 100),
        phone: String(body.phone || address?.phone || '').slice(0, 20),
        coupon: (verifiedCoupon || '').slice(0, 50),
        discount: String(discountAmount),
      },
    });

    const saved = await insertOrder({
      id: checkoutOrderId,
      user_email: email,
      user_id: verifiedUserId,
      stripe_session_id: rzpOrder.id,
      total_amount: finalTotal,
      status: 'pending',
      payment_method: isPartialCodOrder ? 'partial_cod' : 'prepaid',
      advance_paid: isPartialCodOrder ? 100 : finalTotal,
      cod_balance: isPartialCodOrder ? Math.max(0, finalTotal - 100) : 0,
      items,
      subtotal,
      shipping: 0,
      shipping_name: name || null,
      shipping_address: address || null,
      fulfillment_error: verifiedCoupon ? `STORE_CREDIT_APPLIED: [${verifiedCoupon}] Discount: ₹${discountAmount}` : null,
    });

    if (!saved) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    if (verifiedCoupon && (verifiedCoupon.startsWith('CREDIT-') || verifiedCoupon.startsWith('RECREDIT-') || verifiedCoupon.startsWith('RE-CREDIT-'))) {
      const redemption = await redeemStoreCredit(verifiedCoupon, checkoutOrderId, supabase);
      if (!redemption.success) {
        if (supabase) {
          await supabase.from('orders').delete().eq('id', checkoutOrderId);
        }
        return NextResponse.json(
          { error: redemption.error || 'This store credit voucher has already been used.' },
          { status: 400 }
        );
      }
    } else if (verifiedCoupon && verifiedCoupon.startsWith('RE-GIFT-')) {
      const voucherRedeemed = await redeemLoyaltyVoucher(verifiedCoupon, checkoutOrderId, supabase);
      if (!voucherRedeemed) {
        console.warn(`[Checkout API] Failed to mark loyalty voucher ${verifiedCoupon} as redeemed for order ${checkoutOrderId}`);
      }
    }

    return NextResponse.json({
      order_id: rzpOrder.id,
      amount: inrPaise,
      currency: 'INR',
      key_id: process.env.RAZORPAY_KEY_ID,
      payment_type: isPartialCodOrder ? 'partial_cod' : 'full_prepaid',
      cod_balance: isPartialCodOrder ? Math.max(0, finalTotal - 100) : 0,
    });
  } catch (err: any) {
    console.error('POST /api/checkout error:', err);
    const message =
      err?.message ||
      err?.error?.description ||
      (typeof err === 'string' ? err : 'Checkout failed');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
