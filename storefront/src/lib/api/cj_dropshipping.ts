import type { CJOrderAddress, CJProductMedia } from '@/lib/types';

const CJ_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

function getToken(): string | null {
  return process.env.CJ_API_TOKEN ?? null;
}

export function isCJConfigured(): boolean {
  return Boolean(getToken());
}

async function cjGet<T>(path: string): Promise<T> {
  const token = getToken();
  if (!token) throw new Error('CJ API token not configured. Set CJ_API_TOKEN.');
  const res = await fetch(`${CJ_BASE}${path}`, {
    headers: { 'CJ-Access-Token': token },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`CJ API error: ${res.status}`);
  return (await res.json()) as T;
}

interface CJQueryResponse {
  code: number;
  data?: {
    productImageSet?: string[];
    description?: string;
    productVideo?: string | null;
  };
}

interface CJListResponse {
  code: number;
  data?: {
    list?: Array<{
      productSku?: string;
      productImage?: string;
    }>;
  };
}

export async function getCJProductMedia(sku: string): Promise<CJProductMedia> {
  const clean = sku.trim();
  if (!clean) throw new Error('SKU required');

  try {
    const data = await cjGet<CJQueryResponse>(`/product/query?pid=${encodeURIComponent(clean)}`);
    if (data.code === 200 && data.data) {
      return {
        images: data.data.productImageSet ?? [],
        htmlDescription: data.data.description ?? '',
        video: data.data.productVideo ?? null,
      };
    }
  } catch {
    // Fall through to list lookup.
  }

  const list = await cjGet<CJListResponse>(
    `/product/list?productSku=${encodeURIComponent(clean)}`
  );
  const first = list.data?.list?.[0];
  if (list.code === 200 && first?.productImage) {
    return { images: [first.productImage], htmlDescription: '', video: null };
  }
  throw new Error('CJ product not found');
}

interface CJCreateOrderPayload {
  items: Array<{ sku: string; qty: number }>;
  address: CJOrderAddress;
}

export async function createCJOrder(payload: CJCreateOrderPayload): Promise<{ orderId: string }> {
  const token = getToken();
  if (!token) throw new Error('CJ API token not configured.');
  // Docs: POST /shopping/order/createOrder — keep payload minimal and typed.
  const res = await fetch(`${CJ_BASE}/shopping/order/createOrder`, {
    method: 'POST',
    headers: {
      'CJ-Access-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderList: payload.items.map((i) => ({ sku: i.sku, qty: i.qty })),
      shippingAddress: payload.address,
    }),
  });
  if (!res.ok) throw new Error(`CJ order creation failed: ${res.status}`);
  const data = (await res.json()) as { code: number; data?: { orderId?: string; id?: string } };
  const orderId = data.data?.orderId ?? data.data?.id;
  if (data.code !== 200 || !orderId) throw new Error('CJ order creation failed');
  return { orderId };
}

export async function getCJTracking(cjOrderId: string): Promise<{
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: string | null;
}> {
  const data = await cjGet<{
    code: number;
    data?: { trackingNumber?: string; trackingUrl?: string; status?: string };
  }>(`/shopping/order/getOrderDetail?orderId=${encodeURIComponent(cjOrderId)}`);
  return {
    trackingNumber: data.data?.trackingNumber ?? null,
    trackingUrl: data.data?.trackingUrl ?? null,
    status: data.data?.status ?? null,
  };
}
