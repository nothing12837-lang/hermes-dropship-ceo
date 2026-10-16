import { SupabaseClient } from '@supabase/supabase-js';

export interface QikinkFulfillmentResult {
  ok: boolean;
  qikinkOrderId?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  courier?: string;
  reason?: string;
  status?: string;
}

// In-memory token cache to prevent redundant auth calls
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Exchanges ClientId & client_secret for an active Bearer Accesstoken.
 * Qikink tokens are valid for 3600 seconds (1 hour).
 */
async function getQikinkToken(clientId: string, clientSecret: string, apiUrl: string): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 120_000) {
    return cachedToken;
  }

  const res = await fetch(`${apiUrl}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    body: new URLSearchParams({
      ClientId: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Qikink auth failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const token = data.Accesstoken || data.access_token || data.token;
  if (!token) {
    throw new Error('Qikink auth returned 200 but no Accesstoken was provided in payload');
  }

  cachedToken = token;
  const expiresIn = Number(data.expires_in || 3600);
  tokenExpiresAt = now + expiresIn * 1000;
  return token;
}

/**
 * Maps a storefront product ID and attributes to Qikink's verified base catalog garment blank.
 * Format: {ProductCode}-{ColorCode}-{SizeCode} (e.g. MRnHs-Bk-L, UHd-Bk-XL, USs-Wh-M)
 */
export function resolveQikinkSku(item: {
  id?: string;
  title?: string;
  size?: string;
  selectedStyle?: string;
  imageUrl?: string;
}): string {
  const title = (item.title || '').toLowerCase();
  const id = (item.id || '').toLowerCase();
  const style = (item.selectedStyle || '').toLowerCase();

  // 1. Determine Product Blank Prefix
  let prefix = 'MRnHs'; // Default: Men's/Unisex Heavyweight Round Neck Half Sleeve Tee

  if (title.includes('hoodie') || id.includes('uh32') || id.includes('uh38') || id.includes('hoodie')) {
    prefix = 'UHd'; // Unisex Premium Hoodie
  } else if (title.includes('sweatshirt') || id.includes('uh35') || id.includes('sweatshirt')) {
    prefix = 'USs'; // Unisex Heavyweight Sweatshirt
  } else if (title.includes('crop') || id.includes('fc39') || id.includes('crop-top') || title.includes('female')) {
    prefix = 'FRnHs'; // Female Round Neck Half Sleeve
  } else if (title.includes('v-neck') || title.includes('v neck') || id.includes('vn')) {
    prefix = 'MVnHs'; // Men's V-Neck Half Sleeve
  } else if (title.includes('full sleeve') || id.includes('rnfs')) {
    prefix = 'MRnFs'; // Men's Round Neck Full Sleeve
  }

  // 2. Determine Color Code (Wh = White, Bk = Black/Colored)
  let color = 'Bk';
  if (
    title.includes('white') ||
    style.includes('white') ||
    id.includes('white')
  ) {
    color = 'Wh';
  }

  // 3. Determine Size Code
  let size = (item.size || 'L').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!['S', 'M', 'L', 'XL', '2XL', '3XL', 'XS'].includes(size)) {
    if (size === 'XXL') size = '2XL';
    else if (size === 'XXXL') size = '3XL';
    else size = 'L';
  }

  return `${prefix}-${color}-${size}`;
}

/**
 * Sanitizes delivery address strictly conforming to Qikink Open API schema.
 */
function cleanShippingAddress(shippingName: string | null, addr: Record<string, string>, userEmail: string) {
  const fullName = (shippingName || addr.name || 'Valued Customer').trim();
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || 'Customer'; // Mandatory in Qikink validation

  const rawPhone = addr.phone || '';
  const digits = rawPhone.replace(/\D/g, '');
  const cleanPhone = digits.length >= 10 ? digits.slice(-10) : '9876543210';

  const rawZip = String(addr.zip || addr.pincode || addr.postal_code || '560001').replace(/\D/g, '');
  const cleanZip = rawZip.length === 6 ? rawZip : '560001';

  return {
    first_name: firstName.slice(0, 50),
    last_name: lastName.slice(0, 50),
    address1: String(addr.line1 || addr.address || 'Street Address').slice(0, 100),
    address2: String(addr.line2 || '').slice(0, 100),
    phone: cleanPhone,
    email: userEmail.trim() || 'rareemberagency@gmail.com',
    city: String(addr.city || 'Bengaluru').slice(0, 50),
    zip: cleanZip,
    province: String(addr.state || 'Karnataka').slice(0, 50),
    country_code: 'IN',
  };
}

/**
 * Detects if an order is a test/temp order so it is NEVER submitted to Qikink manufacturing floor.
 */
export function isTestOrder(order: any): boolean {
  if (!order) return false;
  if (order.is_test === true || order.test === true) return true;

  const email = (order.user_email || order.email || '').toLowerCase().trim();
  const addr = (order.shipping_address as Record<string, string>) || {};
  const phone = String(addr.phone || order.phone || '').replace(/\D/g, '');
  const name = (order.shipping_name || addr.name || '').toLowerCase().trim();
  const addressLine = `${addr.line1 || ''} ${addr.address || ''} ${addr.city || ''}`.toLowerCase();

  // Test emails
  if (
    email.includes('test_') ||
    email.includes('_test') ||
    email.endsWith('@rareember.com') ||
    email.includes('test@') ||
    email.includes('example.com') ||
    email.includes('dummy') ||
    email === 'rareemberagency@gmail.com'
  ) {
    return true;
  }

  // Dummy / test phone numbers
  const dummyPhones = ['9876543210', '1234567890', '0000000000', '1111111111', '9999999999'];
  if (dummyPhones.includes(phone) || (phone.length > 0 && phone.length < 10)) {
    return true;
  }

  // Test address strings
  if (
    name.includes('test') ||
    name.includes('dummy') ||
    addressLine.includes('test') ||
    addressLine.includes('dummy')
  ) {
    return true;
  }

  return false;
}

/**
 * Automatically disaggregates curated bundles into individual printable Qikink garment/accessory blanks.
 * Ensures the factory prints each physical piece inside one combined parcel.
 */
export function expandBundleItems(items: any[]): any[] {
  const expanded: any[] = [];
  for (const it of items) {
    const id = (it.id || '').toLowerCase();
    const size = it.size || 'L';

    if (id.includes('bundle-streetwear-duo')) {
      expanded.push({
        ...it,
        id: 'qikink-t-shirts-oversized-t-shirt-standard-us22',
        title: 'Rare Ember Unisex Oversized Heavyweight Tee (Duo Piece 1)',
        qty: it.qty || 1,
        size,
      });
      expanded.push({
        ...it,
        id: 'qikink-t-shirts-acid-wash-oversized-t-shirt-uc61',
        title: 'Rare Ember Unisex Acid Wash Oversized Tee (Duo Piece 2)',
        qty: it.qty || 1,
        size,
      });
    } else if (id.includes('bundle-founding-50')) {
      expanded.push({
        ...it,
        id: 'qikink-t-shirts-oversized-t-shirt-standard-us22',
        title: 'Rare Ember Founding Builder 240 GSM Heavyweight Tee',
        qty: it.qty || 1,
        size,
      });
      expanded.push({
        ...it,
        id: 'qikink-accessories-desk-mat',
        title: 'Rare Ember 900x400mm Precision Gaming Desk Mat',
        qty: it.qty || 1,
      });
    } else if (id.includes('bundle-creator-workstation')) {
      expanded.push({
        ...it,
        id: 'qikink-accessories-desk-mat',
        title: 'Rare Ember 900x400mm Extended Gaming Desk Mat',
        qty: it.qty || 1,
      });
      expanded.push({
        ...it,
        id: 'qikink-t-shirts-oversized-t-shirt-standard-us22',
        title: 'Rare Ember 240 GSM Creator Graphic Tee',
        qty: it.qty || 1,
        size,
      });
      expanded.push({
        ...it,
        id: 'qikink-drinkware-coffee-mug-black-mug',
        title: 'Rare Ember Artisan Ceramic Coffee Mug',
        qty: it.qty || 1,
      });
    } else if (id.includes('bundle-winter-heavyweight')) {
      expanded.push({
        ...it,
        id: 'qikink-hoodies-oversized-hoodie-uh32',
        title: 'Rare Ember 380 GSM French Terry Fleece Hoodie',
        qty: it.qty || 1,
        size,
      });
      expanded.push({
        ...it,
        id: 'qikink-t-shirts-oversized-t-shirt-standard-us22',
        title: 'Rare Ember 240 GSM Combed Bio-Washed Tee',
        qty: it.qty || 1,
        size,
      });
    } else {
      expanded.push(it);
    }
  }
  return expanded;
}

/**
 * Automates order transmission directly to Qikink Dropshipping & Fulfillment API.
 * Uses Direct-to-Garment (DTG) print on demand with customer-selected mockup & design link.
 */
export async function fulfillQikinkOrder(
  supabase: SupabaseClient,
  orderId: string,
  providedOrder?: any,
  options?: { force?: boolean }
): Promise<QikinkFulfillmentResult> {
  const clientId = process.env.QIKINK_CLIENT_ID || '964148691892386';
  const clientSecret = process.env.QIKINK_CLIENT_SECRET;
  const apiUrl = process.env.QIKINK_API_URL || 'https://api.qikink.com';

  // 1. Fetch order details from memory, RPC, or Supabase table
  let order = providedOrder;
  if (!order) {
    const rpcRes = await supabase.rpc('get_order_for_fulfillment', { p_order_id: orderId });
    if (rpcRes.data && Array.isArray(rpcRes.data) && rpcRes.data.length > 0) {
      order = rpcRes.data[0];
    } else {
      const { data: dbOrder } = await supabase
        .from('orders')
        .select('id, user_email, total_amount, shipping_name, shipping_address, items, payment_method, status, cj_order_id')
        .eq('id', orderId)
        .maybeSingle();
      order = dbOrder;
    }
  }

  if (!order) {
    return { ok: false, reason: `Order ${orderId} not found for fulfillment` };
  }

  // Safety Gate: Block test / temp orders from physical printing
  if (isTestOrder(order) && !options?.force) {
    console.log(`[Qikink] Test/temp order ${orderId} detected (${order.user_email}). Skipped Qikink factory transmission.`);
    return {
      ok: false,
      reason: 'Test/temp order detected. Qikink factory transmission blocked to prevent unwanted printing/shipping.',
      status: 'test_order_blocked',
    };
  }

  // Idempotency: Don't re-transmit if already successfully fulfilled with a numeric Qikink order ID
  if (order.cj_order_id && /^\d+$/.test(order.cj_order_id)) {
    return {
      ok: true,
      qikinkOrderId: order.cj_order_id,
      courier: 'BlueDart Express (Qikink)',
      status: order.status,
    };
  }

  const rawItems = Array.isArray(order.items) ? order.items : [];
  const items = expandBundleItems(rawItems);
  const isCod = order.payment_method === 'cod';
  const addr = (order.shipping_address as Record<string, string>) || {};

  // Clean alphanumeric order reference (max 15 chars for Qikink)
  const cleanOrderNum = `RE${order.id.replace(/-/g, '').slice(0, 10)}`.slice(0, 15);

  // 2. Prepare Line Items & Design Artwork
  const lineItems = items.map((it: any, idx: number) => {
    const sku = resolveQikinkSku(it);
    const selectedDesignUrl =
      it.imageUrl ||
      it.customImage ||
      'https://rareember.shop/flame-icon.png';

    // Resolve exact Qikink placement SKU and dimensions
    const scaleFactor = it.customScale ? Number(it.customScale) / 100 : 1.0;
    let primaryPlacement = 'fr'; // default front center
    let baseWidth = 10;
    let baseHeight = 12;

    if (it.customPosition === 'pocket') {
      primaryPlacement = 'lch'; // Qikink official Left Chest (pocket) placement
      baseWidth = 4;
      baseHeight = 4;
    } else if (it.customPosition === 'mural') {
      baseWidth = 14;
      baseHeight = 16;
    }

    const calculatedWidth = String(Math.max(3, Math.min(16, Math.round(baseWidth * scaleFactor))));
    const calculatedHeight = String(Math.max(3, Math.min(18, Math.round(baseHeight * scaleFactor))));

    const designs: Array<{
      design_code: string;
      width_inches: string;
      height_inches: string;
      placement_sku: string;
      design_link: string;
      mockup_link: string;
    }> = [];

    const isBackOnly = it.customPlacement === 'Back Print' || it.placement === 'Back Print';
    const isBothSides = it.customPlacement?.includes('Both Sides') || it.placement?.includes('Both Sides');

    if (isBothSides) {
      // Front placement
      designs.push({
        design_code: `RE${idx + 1}F${cleanOrderNum.slice(-5)}`.slice(0, 15),
        width_inches: calculatedWidth,
        height_inches: calculatedHeight,
        placement_sku: primaryPlacement,
        design_link: selectedDesignUrl,
        mockup_link: selectedDesignUrl,
      });
      // Back placement
      designs.push({
        design_code: `RE${idx + 1}B${cleanOrderNum.slice(-5)}`.slice(0, 15),
        width_inches: '12',
        height_inches: '14',
        placement_sku: 'bk',
        design_link: selectedDesignUrl,
        mockup_link: selectedDesignUrl,
      });
    } else if (isBackOnly) {
      designs.push({
        design_code: `RE${idx + 1}B${cleanOrderNum.slice(-5)}`.slice(0, 15),
        width_inches: '12',
        height_inches: '14',
        placement_sku: 'bk',
        design_link: selectedDesignUrl,
        mockup_link: selectedDesignUrl,
      });
    } else {
      // Front placement
      designs.push({
        design_code: `RE${idx + 1}${cleanOrderNum.slice(-6)}`.slice(0, 15),
        width_inches: calculatedWidth,
        height_inches: calculatedHeight,
        placement_sku: primaryPlacement,
        design_link: selectedDesignUrl,
        mockup_link: selectedDesignUrl,
      });
    }

    return {
      search_from_my_products: 0, // Dynamic POD injection
      sku,
      quantity: String(it.qty || 1),
      price: String(Math.round(Number(it.price || order.total_amount / Math.max(1, items.length)))),
      print_type_id: 1, // DTG Direct-to-Garment print
      designs,
    };
  });

  const shippingAddress = cleanShippingAddress(order.shipping_name, addr, order.user_email || '');

  const qikinkPayload = {
    order_number: cleanOrderNum,
    qikink_shipping: '1', // BlueDart / integrated courier fulfillment
    gateway: isCod ? 'COD' : 'Prepaid',
    total_order_value: String(Math.round(Number(order.total_amount || 0))),
    line_items: lineItems,
    shipping_address: shippingAddress,
  };

  // 3. Transmit to Qikink API
  let qikinkRef: string | null = null;
  let qikinkError: string | null = null;

  if (clientSecret) {
    try {
      const token = await getQikinkToken(clientId, clientSecret, apiUrl);
      const resp = await fetch(`${apiUrl}/api/order/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ClientId': String(clientId),
          'Accesstoken': token,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        body: JSON.stringify(qikinkPayload),
      });

      const json = await resp.json();
      if (resp.ok && (json.order_id || json.qikink_order_id)) {
        qikinkRef = String(json.order_id || json.qikink_order_id);
      } else {
        qikinkError = json.error || json.message || `HTTP ${resp.status}`;
        console.error('Qikink API order creation rejected:', json);
      }
    } catch (apiErr: any) {
      qikinkError = apiErr?.message || String(apiErr);
      console.error('Qikink API transmission error:', apiErr);
    }
  } else {
    qikinkError = 'QIKINK_CLIENT_SECRET not configured';
  }

  // 4. Update order in Supabase
  if (qikinkRef) {
    const newStatus = isCod ? 'pending_cod' : 'processing';
    const trackingNum = `BD-${qikinkRef}`;
    const trackingLink = 'https://courierupdates.com/?awb=';

    await supabase.rpc('update_order_fulfillment', {
      p_order_id: String(order.id),
      p_qikink_order_id: qikinkRef,
      p_tracking_number: trackingNum,
      p_tracking_url: trackingLink,
      p_status: newStatus,
    });

    await supabase
      .from('orders')
      .update({
        cj_order_id: qikinkRef,
        tracking_number: trackingNum,
        tracking_url: trackingLink,
        status: newStatus,
      })
      .eq('id', order.id);

    // Send Telegram Notification about automated Qikink dispatch
    notifyTelegramQikinkSuccess(order.id, qikinkRef, isCod).catch(() => {});

    return {
      ok: true,
      qikinkOrderId: qikinkRef,
      courier: 'BlueDart Express (Qikink)',
      trackingUrl: trackingLink,
    };
  } else {
    // Graceful queue: Save status for admin review / auto-retry so order is never lost
    const queueId = `QUEUE_${cleanOrderNum}`;
    const queueStatus = isCod ? 'pending_cod' : 'paid';

    await supabase.rpc('update_order_fulfillment', {
      p_order_id: String(order.id),
      p_qikink_order_id: queueId,
      p_tracking_number: '',
      p_tracking_url: '',
      p_status: queueStatus,
    });

    await supabase
      .from('orders')
      .update({
        cj_order_id: queueId,
        status: queueStatus,
      })
      .eq('id', order.id);

    return {
      ok: false,
      reason: qikinkError || 'Order queued for background retry',
    };
  }
}

/**
 * Sends automated Telegram update when Qikink API creates an order.
 */
async function notifyTelegramQikinkSuccess(orderId: string, qikinkOrderId: string, isCod: boolean) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const enabled = process.env.TELEGRAM_ALERTS_ENABLED === 'true';

  if (!enabled || !token || !chatId) return;

  const msg = [
    `⚡ <b>QIKINK AUTOMATED ORDER DISPATCHED!</b> 🏭`,
    ``,
    `🆔 <b>Rare Ember Order:</b> <code>#${orderId}</code>`,
    `🏭 <b>Qikink Order ID:</b> <code>#${qikinkOrderId}</code>`,
    `🚚 <b>Logistics:</b> BlueDart Air Express via Qikink Tirupur Hub`,
    `💳 <b>Payment Gateway:</b> ${isCod ? 'Cash on Delivery (COD)' : 'Prepaid'}`,
    `🔎 <b>Live Qikink Tracking:</b> <a href="https://courierupdates.com/?awb=">courierupdates.com</a>`,
    ``,
    `✅ <i>Zero manual action required! Qikink print floor is preparing this drop.</i>`
  ].join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('Failed to send Qikink dispatch telegram notice:', err);
  }
}
