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
 * Automates order transmission directly to Qikink Dropshipping & Fulfillment API.
 * Uses Direct-to-Garment (DTG) print on demand with customer-selected mockup & design link.
 */
export async function fulfillQikinkOrder(
  supabase: SupabaseClient,
  orderId: string
): Promise<QikinkFulfillmentResult> {
  const clientId = process.env.QIKINK_CLIENT_ID || '964148691892386';
  const clientSecret = process.env.QIKINK_CLIENT_SECRET;
  const apiUrl = process.env.QIKINK_API_URL || 'https://api.qikink.com';

  // 1. Fetch order details from Supabase
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, user_email, total_amount, shipping_name, shipping_address, items, payment_method, status, cj_order_id')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return { ok: false, reason: `Order ${orderId} not found in database: ${error?.message}` };
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

  const items = Array.isArray(order.items) ? order.items : [];
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

    const placement = it.customPlacement === 'Back Print' ? 'bk' : 'fr';
    const designCode = `RE${idx + 1}${cleanOrderNum.slice(-6)}`.slice(0, 15);

    return {
      search_from_my_products: 0, // Dynamic POD injection
      sku,
      quantity: String(it.qty || 1),
      price: String(Math.round(Number(it.price || order.total_amount / Math.max(1, items.length)))),
      print_type_id: 1, // DTG Direct-to-Garment print
      designs: [
        {
          design_code: designCode,
          width_inches: '10',
          height_inches: '10',
          placement_sku: placement,
          design_link: selectedDesignUrl,
          mockup_link: selectedDesignUrl,
        },
      ],
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
    await supabase
      .from('orders')
      .update({
        cj_order_id: qikinkRef,
        tracking_number: `BD-${qikinkRef}`,
        tracking_url: 'https://courierupdates.com/?awb=',
        status: isCod ? 'pending_cod' : 'processing',
      })
      .eq('id', order.id);

    // Send Telegram Notification about automated Qikink dispatch
    notifyTelegramQikinkSuccess(order.id, qikinkRef, isCod).catch(() => {});

    return {
      ok: true,
      qikinkOrderId: qikinkRef,
      courier: 'BlueDart Express (Qikink)',
      trackingUrl: 'https://courierupdates.com/?awb=',
    };
  } else {
    // Graceful queue: Save status for admin review / auto-retry so order is never lost
    await supabase
      .from('orders')
      .update({
        cj_order_id: `QUEUE_${cleanOrderNum}`,
        status: isCod ? 'pending_cod' : 'paid',
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
