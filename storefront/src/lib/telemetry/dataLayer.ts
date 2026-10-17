/**
 * E-Commerce Telemetry Engine for RareEmber
 * Dual-dispatch: Google Tag Manager / GA4 dataLayer + Meta Pixel (fbq)
 * Implements strict event_id generation for Meta CAPI deduplication and GA4 e-commerce schema.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: any[]) => void;
  }
}

export interface EcomItem {
  id: string;
  title: string;
  price: number;
  qty: number;
  size?: string;
  category?: string;
  variant?: string;
}

export interface PurchasePayload {
  transactionId: string;
  value: number;
  currency?: string;
  tax?: number;
  shipping?: number;
  coupon?: string;
  items: EcomItem[];
}

function getSafeDataLayer(): Record<string, unknown>[] {
  if (typeof window === 'undefined') return [];
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

export function generateEventId(prefix = 'evt'): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${ts}_${rand}`;
}

function logTelemetry(eventName: string, eventId: string, payload: unknown) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    // Visual telemetry logger for QA and DevTools inspection
    console.group(`📡 [TELEMETRY SENTINEL] Event: %c${eventName}`, 'color: #FF4D24; font-weight: bold;');
    console.log('Event ID:', eventId);
    console.log('Payload:', payload);
    console.groupEnd();
  }
}

/**
 * 1. Track Page View
 */
export function trackPageView(pathname: string, title?: string) {
  if (typeof window === 'undefined') return;
  const dl = getSafeDataLayer();
  const eventId = generateEventId('pv');

  dl.push({
    event: 'page_view',
    event_id: eventId,
    page_path: pathname,
    page_title: title || (typeof document !== 'undefined' ? document.title : ''),
    page_location: typeof window !== 'undefined' ? window.location.href : '',
  });

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView', {}, { eventID: eventId });
  }

  logTelemetry('page_view', eventId, { pathname, title });
}

/**
 * 2. Track View Item (Product Detail Page)
 */
export function trackViewItem(item: EcomItem, currency = 'INR') {
  if (typeof window === 'undefined') return;
  const dl = getSafeDataLayer();
  const eventId = generateEventId('vi');

  // GA4 requires clearing ecommerce object first
  dl.push({ ecommerce: null });
  dl.push({
    event: 'view_item',
    event_id: eventId,
    ecommerce: {
      currency,
      value: item.price * (item.qty || 1),
      items: [
        {
          item_id: item.id,
          item_name: item.title,
          index: 0,
          item_brand: 'RareEmber',
          item_category: item.category || 'Streetwear Apparel',
          item_variant: item.variant || item.size || 'L',
          price: item.price,
          quantity: item.qty || 1,
        },
      ],
    },
  });

  if (typeof window.fbq === 'function') {
    window.fbq(
      'track',
      'ViewContent',
      {
        content_name: item.title,
        content_ids: [item.id],
        content_type: 'product',
        value: item.price * (item.qty || 1),
        currency,
      },
      { eventID: eventId }
    );
  }

  logTelemetry('view_item', eventId, item);
}

/**
 * 3. Track Add to Cart
 */
export function trackAddToCart(item: EcomItem, currency = 'INR') {
  if (typeof window === 'undefined') return;
  const dl = getSafeDataLayer();
  const eventId = generateEventId('atc');

  const totalValue = item.price * item.qty;

  dl.push({ ecommerce: null });
  dl.push({
    event: 'add_to_cart',
    event_id: eventId,
    ecommerce: {
      currency,
      value: totalValue,
      items: [
        {
          item_id: item.id,
          item_name: item.title,
          index: 0,
          item_brand: 'RareEmber',
          item_category: item.category || 'Streetwear Apparel',
          item_variant: item.variant || item.size || 'L',
          price: item.price,
          quantity: item.qty,
        },
      ],
    },
  });

  if (typeof window.fbq === 'function') {
    window.fbq(
      'track',
      'AddToCart',
      {
        content_name: item.title,
        content_ids: [item.id],
        content_type: 'product',
        value: totalValue,
        currency,
        num_items: item.qty,
      },
      { eventID: eventId }
    );
  }

  logTelemetry('add_to_cart', eventId, item);
}

/**
 * 4. Track Begin Checkout
 */
export function trackBeginCheckout(items: EcomItem[], value: number, currency = 'INR', coupon?: string) {
  if (typeof window === 'undefined') return;
  const dl = getSafeDataLayer();
  const eventId = generateEventId('chk');

  const formattedItems = items.map((i, idx) => ({
    item_id: i.id,
    item_name: i.title,
    index: idx,
    item_brand: 'RareEmber',
    item_category: i.category || 'Streetwear Apparel',
    item_variant: i.variant || i.size || 'L',
    price: i.price,
    quantity: i.qty,
  }));

  dl.push({ ecommerce: null });
  dl.push({
    event: 'begin_checkout',
    event_id: eventId,
    ecommerce: {
      currency,
      value,
      coupon,
      items: formattedItems,
    },
  });

  if (typeof window.fbq === 'function') {
    window.fbq(
      'track',
      'InitiateCheckout',
      {
        content_ids: items.map((i) => i.id),
        content_type: 'product',
        value,
        currency,
        num_items: items.reduce((acc, i) => acc + i.qty, 0),
      },
      { eventID: eventId }
    );
  }

  logTelemetry('begin_checkout', eventId, { value, itemsCount: items.length });
}

/**
 * 5. Track Add Shipping Info
 */
export function trackAddShippingInfo(items: EcomItem[], value: number, shippingTier = 'Express Insured Air', currency = 'INR') {
  if (typeof window === 'undefined') return;
  const dl = getSafeDataLayer();
  const eventId = generateEventId('shp');

  const formattedItems = items.map((i, idx) => ({
    item_id: i.id,
    item_name: i.title,
    index: idx,
    item_brand: 'RareEmber',
    item_category: i.category || 'Streetwear Apparel',
    item_variant: i.variant || i.size || 'L',
    price: i.price,
    quantity: i.qty,
  }));

  dl.push({ ecommerce: null });
  dl.push({
    event: 'add_shipping_info',
    event_id: eventId,
    ecommerce: {
      currency,
      value,
      shipping_tier: shippingTier,
      items: formattedItems,
    },
  });

  if (typeof window.fbq === 'function') {
    window.fbq(
      'track',
      'AddShippingInfo',
      {
        content_ids: items.map((i) => i.id),
        content_type: 'product',
        value,
        currency,
      },
      { eventID: eventId }
    );
  }

  logTelemetry('add_shipping_info', eventId, { shippingTier, value });
}

/**
 * 6. Track Purchase (Order Confirmation / Success)
 */
export function trackPurchase(payload: PurchasePayload) {
  if (typeof window === 'undefined') return;
  const dl = getSafeDataLayer();
  const eventId = generateEventId('pur');
  const currency = payload.currency || 'INR';

  const formattedItems = payload.items.map((i, idx) => ({
    item_id: i.id,
    item_name: i.title,
    index: idx,
    item_brand: 'RareEmber',
    item_category: i.category || 'Streetwear Apparel',
    item_variant: i.variant || i.size || 'L',
    price: i.price,
    quantity: i.qty,
  }));

  dl.push({ ecommerce: null });
  dl.push({
    event: 'purchase',
    event_id: eventId,
    ecommerce: {
      transaction_id: payload.transactionId,
      value: payload.value,
      tax: payload.tax || 0,
      shipping: payload.shipping || 0,
      currency,
      coupon: payload.coupon,
      items: formattedItems,
    },
  });

  if (typeof window.fbq === 'function') {
    window.fbq(
      'track',
      'Purchase',
      {
        content_ids: payload.items.map((i) => i.id),
        content_type: 'product',
        value: payload.value,
        currency,
        num_items: payload.items.reduce((acc, i) => acc + i.qty, 0),
      },
      { eventID: eventId }
    );
  }

  logTelemetry('purchase', eventId, payload);
}
