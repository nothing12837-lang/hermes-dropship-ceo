import type { SupabaseClient } from '@supabase/supabase-js';
import { createCJOrder } from '@/lib/api/cj_dropshipping';
import type { CJOrderAddress } from '@/lib/types';

/**
 * CJ fulfillment core: pure mapping helpers + idempotent order fulfillment.
 * Used by the Razorpay webhook (auto-fulfill on payment), the retry worker
 * (GET /api/fulfillment/retry) and unit tests. No Next.js imports here.
 */

export interface FulfillmentOrderItem {
  id: string;
  qty: number;
}

export interface FulfillmentProduct {
  id: string;
  title: string;
  cj_sku: string | null;
}

export interface FulfillmentOrder {
  id: string;
  user_email: string;
  status: string;
  cj_order_id: string | null;
  shipping_name: string | null;
  shipping_address: {
    line1?: string;
    city?: string;
    zip?: string;
    state?: string;
    country?: string;
    phone?: string;
  } | null;
  items: FulfillmentOrderItem[];
}

export type FulfillmentResult =
  | { ok: true; cjOrderId: string; skipped: string[] }
  | { ok: false; reason: string; retryable: boolean };

export function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: 'RareEmber', lastName: 'Customer' };
  if (parts.length === 1) return { firstName: parts[0], lastName: 'Customer' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export function buildCJAddress(
  order: Pick<FulfillmentOrder, 'user_email' | 'shipping_name' | 'shipping_address'>
): { ok: true; address: CJOrderAddress } | { ok: false; reason: string } {
  const addr = order.shipping_address ?? {};
  const line1 = (addr.line1 ?? '').trim();
  const city = (addr.city ?? '').trim();
  const zip = (addr.zip ?? '').trim();
  if (!line1 || !city || !zip) {
    return {
      ok: false,
      reason: 'Incomplete shipping address (line1, city and zip are required for CJ).',
    };
  }
  const { firstName, lastName } = splitName(order.shipping_name ?? '');
  return {
    ok: true,
    address: {
      firstName: firstName.slice(0, 40),
      lastName: lastName.slice(0, 40),
      address1: line1.slice(0, 120),
      city: city.slice(0, 60),
      state: (addr.state ?? '').trim().slice(0, 60) || 'N/A',
      zip: zip.slice(0, 20),
      country: (addr.country ?? 'US').trim().slice(0, 10) || 'US',
      phone: (addr.phone ?? '').trim().slice(0, 20) || '0000000000',
      email: order.user_email,
    },
  };
}

export function resolveFulfillmentItems(
  items: FulfillmentOrderItem[],
  products: FulfillmentProduct[]
): { lines: Array<{ sku: string; qty: number }>; skipped: string[] } {
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: Array<{ sku: string; qty: number }> = [];
  const skipped: string[] = [];
  for (const item of items) {
    const qty = Math.min(99, Math.max(1, Math.floor(Number(item.qty) || 1)));
    const product = byId.get(item.id);
    const sku = product?.cj_sku?.trim();
    if (!sku) {
      skipped.push(item.id);
      continue;
    }
    lines.push({ sku, qty });
  }
  return { lines, skipped };
}

function toFulfillmentOrder(row: Record<string, unknown>): FulfillmentOrder | null {
  if (!row || typeof row.id !== 'string' || typeof row.user_email !== 'string') return null;
  const items = Array.isArray(row.items)
    ? (row.items as Array<{ id?: unknown; qty?: unknown }>)
        .filter((i) => typeof i?.id === 'string')
        .map((i) => ({
          id: i.id as string,
          qty: Math.min(99, Math.max(1, Math.floor(Number(i.qty) || 1))),
        }))
    : [];
  const addr = (row.shipping_address ?? null) as FulfillmentOrder['shipping_address'];
  return {
    id: row.id,
    user_email: row.user_email,
    status: typeof row.status === 'string' ? row.status : 'pending',
    cj_order_id: typeof row.cj_order_id === 'string' ? row.cj_order_id : null,
    shipping_name: typeof row.shipping_name === 'string' ? row.shipping_name : null,
    shipping_address:
      addr && typeof addr === 'object'
        ? {
            line1: typeof addr.line1 === 'string' ? addr.line1 : undefined,
            city: typeof addr.city === 'string' ? addr.city : undefined,
            zip: typeof addr.zip === 'string' ? addr.zip : undefined,
            state: typeof addr.state === 'string' ? addr.state : undefined,
            country: typeof addr.country === 'string' ? addr.country : undefined,
            phone: typeof addr.phone === 'string' ? addr.phone : undefined,
          }
        : null,
    items,
  };
}

async function recordAttempt(
  supabase: SupabaseClient,
  orderId: string,
  patch: Record<string, unknown>
): Promise<void> {
  // Tolerates databases where the fulfillment migration hasn't run yet.
  const { error } = await supabase.from('orders').update(patch).eq('id', orderId);
  if (error && /fulfillment_|fulfilled_at/i.test(error.message)) {
    const fallback: Record<string, unknown> = {};
    if (typeof patch.cj_order_id === 'string') fallback.cj_order_id = patch.cj_order_id;
    if (typeof patch.status === 'string') fallback.status = patch.status;
    if (typeof patch.tracking_number !== 'undefined')
      fallback.tracking_number = patch.tracking_number;
    if (typeof patch.tracking_url !== 'undefined') fallback.tracking_url = patch.tracking_url;
    if (Object.keys(fallback).length > 0) {
      await supabase.from('orders').update(fallback).eq('id', orderId);
    }
  }
}

/**
 * Idempotently fulfill one paid order via CJ.
 * Safe to call from webhooks, cron workers and the admin panel.
 */
export async function fulfillOrder(
  supabase: SupabaseClient,
  orderId: string
): Promise<FulfillmentResult> {
  const { data: row, error: fetchError } = await supabase
    .from('orders')
    .select('id,user_email,status,cj_order_id,shipping_name,shipping_address,items,fulfillment_attempts')
    .eq('id', orderId)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, reason: `Order lookup failed: ${fetchError.message}`, retryable: true };
  }
  if (!row || typeof row !== 'object') {
    return { ok: false, reason: 'Order not found', retryable: false };
  }
  const order = toFulfillmentOrder(row as Record<string, unknown>);
  if (!order) return { ok: false, reason: 'Order not found', retryable: false };

  // Idempotency: already handed to CJ.
  if (order.cj_order_id) {
    return { ok: true, cjOrderId: order.cj_order_id, skipped: [] };
  }
  if (order.status !== 'paid' && order.status !== 'processing') {
    return {
      ok: false,
      reason: `Order is "${order.status}" — only paid orders are fulfilled.`,
      retryable: false,
    };
  }
  if (order.items.length === 0) {
    return { ok: false, reason: 'Order has no items', retryable: false };
  }

  const attempts =
    typeof (row as Record<string, unknown> | null)?.fulfillment_attempts === 'number'
      ? ((row as Record<string, unknown>).fulfillment_attempts as number)
      : 0;

  // Resolve CJ SKUs for each line.
  const { data: products } = await supabase
    .from('products')
    .select('id,title,cj_sku')
    .in(
      'id',
      order.items.map((i) => i.id)
    );
  const { lines, skipped } = resolveFulfillmentItems(
    order.items,
    ((products ?? []) as Array<Record<string, unknown>>).map((p) => ({
      id: String(p.id),
      title: typeof p.title === 'string' ? p.title : String(p.id),
      cj_sku: typeof p.cj_sku === 'string' ? p.cj_sku : null,
    }))
  );
  if (lines.length === 0) {
    await recordAttempt(supabase, order.id, {
      status: 'processing',
      fulfillment_attempts: attempts + 1,
      fulfillment_error:
        'No CJ SKUs on order lines (seed catalog items ship manually). Skipped: ' +
        skipped.join(', '),
    });
    return {
      ok: false,
      reason: 'No fulfillable CJ SKUs — seed items need manual handling.',
      retryable: false,
    };
  }

  const addr = buildCJAddress(order);
  if (!addr.ok) {
    await recordAttempt(supabase, order.id, {
      status: order.status,
      fulfillment_attempts: attempts + 1,
      fulfillment_error: addr.reason,
    });
    return { ok: false, reason: addr.reason, retryable: false };
  }

  try {
    const { orderId: cjOrderId } = await createCJOrder({ items: lines, address: addr.address });
    await recordAttempt(supabase, order.id, {
      cj_order_id: cjOrderId,
      status: 'processing',
      fulfillment_attempts: attempts + 1,
      fulfillment_error: null,
      fulfilled_at: new Date().toISOString(),
    });
    return { ok: true, cjOrderId, skipped };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'CJ order creation failed';
    await recordAttempt(supabase, order.id, {
      fulfillment_attempts: attempts + 1,
      fulfillment_error: reason,
    });
    return { ok: false, reason, retryable: true };
  }
}

// ── CJ inbound webhook payload normalization (also unit-tested) ──

export interface CJStatusUpdate {
  cjOrderId: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: 'processing' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled';
}

const ALLOWED_INBOUND = new Set(['processing', 'fulfilled', 'shipped', 'delivered', 'cancelled']);

export function normalizeCJUpdate(body: unknown):
  | { ok: true; update: CJStatusUpdate }
  | { ok: false; reason: string } {
  if (!body || typeof body !== 'object') return { ok: false, reason: 'Invalid JSON body' };
  const b = body as Record<string, unknown>;
  const cjOrderId = b.cj_order_id ?? b.orderId ?? b.cjOrderId;
  if (!cjOrderId || typeof cjOrderId !== 'string') {
    return { ok: false, reason: 'cj_order_id required' };
  }
  const trackingNumber =
    typeof b.tracking_number === 'string'
      ? b.tracking_number
      : typeof b.trackingNumber === 'string'
        ? b.trackingNumber
        : null;
  const trackingUrl =
    typeof b.tracking_url === 'string'
      ? b.tracking_url
      : typeof b.trackingUrl === 'string'
        ? b.trackingUrl
        : null;
  const status =
    typeof b.status === 'string' && ALLOWED_INBOUND.has(b.status)
      ? (b.status as CJStatusUpdate['status'])
      : 'shipped';
  return { ok: true, update: { cjOrderId, trackingNumber, trackingUrl, status } };
}
