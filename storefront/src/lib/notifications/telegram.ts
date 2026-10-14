/**
 * Telegram Notification Helper for RareEmber
 * Alerts the store owner automatically whenever a new order is received or paid.
 * Includes direct 1-click Meesho sourcing link & full delivery address for instant fulfillment.
 */

export const MEESHO_DIRECT_URLS: Record<string, string> = {
  'meesho-crystal-ball-3d-galaxy-led-lamp-wooden-base': 'https://www.meesho.com/s/p/h61mf5',
  'meesho-water-sensor-led-diyas-pack-of-12': 'https://www.meesho.com/s/p/756ycd',
  'meesho-heavy-duty-welcome-textured-mesh-door-mat': 'https://www.meesho.com/s/p/hbentp',
  'meesho-galaxy-star-astronaut-projector-night-lamp': 'https://www.meesho.com/s/p/ck0svm',
  'meesho-ultrasonic-flame-mist-aroma-diffuser': 'https://www.meesho.com/s/p/ga8uq8',
  'meesho-crystal-diamond-touch-led-table-lamp': 'https://www.meesho.com/s/p/gxgqyy',
  'meesho-electric-mini-wireless-garlic-chopper': 'https://www.meesho.com/s/p/gk1pui',
  'meesho-acrylic-led-glow-message-note-board': 'https://www.meesho.com/s/p/9skjts',
  'meesho-3in1-foldable-magnetic-wireless-charging-pad': 'https://www.meesho.com/s/p/a62v2o',
  'meesho-luxury-travel-jewelry-organizer-box': 'https://www.meesho.com/s/p/etztkc',
  'meesho-automatic-magnetic-self-stirring-mug': 'https://www.meesho.com/s/p/cgjz5c',
  'meesho-moroccan-golden-metal-fairy-lantern-string': 'https://www.meesho.com/s/p/7eb6x1',
  'meesho-golden-metal-hanging-birdcage-tealight-lantern-set': 'https://www.meesho.com/s/p/121h54',
  'meesho-portable-mini-thermal-bluetooth-pocket-printer': 'https://www.meesho.com/s/p/789hag',
  'meesho-rechargeable-motion-sensor-led-cabinet-stair-light': 'https://www.meesho.com/s/p/6e7uwm',
  'meesho-foldable-heavy-base-mobile-tablet-desk-stand': 'https://www.meesho.com/s/p/fa1ldj',
  'meesho-multi-blade-mandoline-vegetable-slicer-cutter': 'https://www.meesho.com/s/p/71b9uy',
  'meesho-oil-dispenser-bottle-silicone-basting-brush': 'https://www.meesho.com/s/p/gsce3g',
  'meesho-electric-fabric-shaver-lint-remover-usb': 'https://www.meesho.com/s/p/ai41up',
  'meesho-astronaut-magnetic-cable-organizer-desk-clips': 'https://www.meesho.com/s/p/8zcq5w',
  'meesho-vintage-amber-edison-decorative-led-filament-bulb': 'https://www.meesho.com/s/p/er1af1',
  'meesho-4-layer-rotating-jewelry-storage-box-mirror': 'https://www.meesho.com/s/p/ctey2b',
  'meesho-diamond-wall-organiser-rack-no-drill': 'https://www.meesho.com/s/p/fa1ldj',
  'meesho-nordic-insulated-coffee-tumbler-straw-500ml': 'https://www.meesho.com/s/p/92h14r',
};

export function getMeeshoSourcingLink(itemId?: string, title?: string): string {
  if (itemId && MEESHO_DIRECT_URLS[itemId]) {
    return MEESHO_DIRECT_URLS[itemId];
  }
  // Check substring match in ID
  if (itemId) {
    const matchedKey = Object.keys(MEESHO_DIRECT_URLS).find((k) => itemId.includes(k) || k.includes(itemId));
    if (matchedKey) return MEESHO_DIRECT_URLS[matchedKey];
  }
  // Check title matching against keys
  if (title && title.trim()) {
    const lowerTitle = title.toLowerCase();
    for (const [key, url] of Object.entries(MEESHO_DIRECT_URLS)) {
      const cleanKey = key.replace(/^meesho-/, '').replace(/-/g, ' ');
      const keyWords = cleanKey.split(' ').filter((w) => w.length >= 4);
      const matches = keyWords.filter((w) => lowerTitle.includes(w));
      if (matches.length >= 2) {
        return url;
      }
    }
    const cleanTitle = title.replace(/\([^)]*\)/g, '').replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    return `https://www.meesho.com/search?q=${encodeURIComponent(cleanTitle.slice(0, 45))}`;
  }
  if (itemId && itemId.startsWith('meesho-')) {
    const clean = itemId.replace(/^meesho-/, '').replace(/-/g, ' ');
    return `https://www.meesho.com/search?q=${encodeURIComponent(clean)}`;
  }
  return 'https://www.meesho.com';
}

export async function notifyTelegramOrder(order: {
  id: string;
  total: number;
  paymentMethod: string;
  email: string;
  name?: string | null;
  itemsCount?: number;
  city?: string | null;
  items?: Array<{ id?: string; title?: string; name?: string; qty?: number; price?: number }>;
  address?: any;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const enabled = process.env.TELEGRAM_ALERTS_ENABLED === 'true';

  if (!enabled || !token || !chatId) {
    return;
  }

  const isCod = order.paymentMethod === 'cod';
  const icon = isCod ? '📦' : '💳';
  const payLabel = isCod ? 'Cash on Delivery (COD)' : 'Paid Online (Razorpay Live)';

  // Build items summary & Meesho direct links
  const itemsList = order.items && Array.isArray(order.items) && order.items.length > 0 ? order.items : [];
  const firstItem = itemsList[0] || {};
  const firstItemTitle = firstItem.title || firstItem.name || firstItem.id || 'Winning Catalog Item';

  const itemLinks: Array<{ title: string; url: string }> = [];
  let itemsSummary = '';

  if (itemsList.length > 0) {
    itemsSummary = itemsList
      .map((it, idx) => {
        const itemTitle = it.title || it.name || it.id || `Item ${idx + 1}`;
        const itemUrl = getMeeshoSourcingLink(it.id, itemTitle);
        itemLinks.push({ title: itemTitle, url: itemUrl });
        return `  ${idx + 1}. <b>${itemTitle}</b> (Qty: ${it.qty || 1})`;
      })
      .join('\n');
  } else {
    itemsSummary = `  • ${firstItemTitle} (${order.itemsCount || 1} item)`;
    itemLinks.push({ title: firstItemTitle, url: getMeeshoSourcingLink(firstItem.id, firstItemTitle) });
  }

  // Build customer address string
  let addrStr = 'Customer details provided during checkout';
  if (order.address && typeof order.address === 'object') {
    const a = order.address;
    const namePart = order.name || a.name || 'Customer';
    const line1 = a.line1 || a.address || '';
    const city = a.city || '';
    const state = a.state || '';
    const pin = a.pincode || a.postal_code || a.pin || '';
    const phone = a.phone || '';
    addrStr = `<b>${namePart}</b>\n${line1}\n${city}, ${state} - <b>${pin}</b>\n📞 Phone: <b>${phone}</b>`;
  } else if (typeof order.address === 'string' && order.address.trim()) {
    addrStr = order.address.trim();
  }

  // Extract customer phone & create 1-click WhatsApp verification link
  let waSection = '';
  const rawPhone = order.address && typeof order.address === 'object' ? order.address.phone : '';
  const cleanPhone = String(rawPhone || '').replace(/\D/g, '');
  if (cleanPhone.length >= 10) {
    const intlPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const custName = order.name || (order.address && typeof order.address === 'object' ? order.address.name : '') || 'Customer';
    const waText = encodeURIComponent(
      `Namaste ${custName}! 🙏\n\n` +
      `Aapka RareEmber Cash on Delivery order #${order.id} receive ho gaya hai!\n\n` +
      `📦 Item: ${firstItemTitle}\n` +
      `💰 Delivery Amount: ₹${order.total.toLocaleString()} (COD)\n\n` +
      `Order confirm karne aur express dispatch lock karne ke liye kripya 'CONFIRM' reply karein. Dhanyawad! ✨ - Team RareEmber`
    );
    const waLink = `https://wa.me/${intlPhone}?text=${waText}`;
    waSection = `💬 <b>1-CLICK WHATSAPP COD CONFIRMATION:</b>\n👉 <a href="${waLink}">Tap to Send Pre-written WhatsApp to Customer</a>\n\n`;
  }

  const directLinksFormatted = itemLinks
    .map(
      (il) =>
        `👉 <a href="${il.url}"><b>${il.title.slice(0, 42)}</b></a>\n🔗 <code>${il.url}</code>`
    )
    .join('\n\n');

  const text = [
    `🚨 <b>NEW ORDER ON RAREEMBER!</b> ${icon}`,
    ``,
    `🆔 <b>Order ID:</b> <code>#${order.id}</code>`,
    `💳 <b>Payment:</b> <b>${payLabel}</b>`,
    `💰 <b>Total Amount:</b> <b>₹${order.total.toLocaleString()}</b>`,
    ``,
    `📦 <b>ORDERED ITEMS:</b>`,
    itemsSummary,
    ``,
    `📍 <b>CUSTOMER DELIVERY ADDRESS:</b>`,
    addrStr,
    ``,
    waSection,
    `📲 <b>1-CLICK MEESHO DIRECT PRODUCT LISTING:</b>`,
    directLinksFormatted,
    ``,
    `⚡ <b>Quick Reseller Fulfillment & Tracking (30 Seconds):</b>`,
    `1. Tap Meesho link above & tap 'Buy Now'`,
    `2. Paste customer delivery address`,
    `3. Select 'Yes' for Reselling & enter ₹${order.total} as selling price`,
    `4. Meesho ships directly to customer under RareEmber with COD collected!`,
    `5. 🚚 <b>Tracking Sync:</b> Jab Meesho dispatch kare, Founder Portal (<a href="https://rareember-store.vercel.app/admin/orders">/admin/orders</a>) par 'Mark Shipped' dabayein taaki customer ke page par live Delhivery map activate ho jaye!`
  ].filter(Boolean).join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });
  } catch (err) {
    console.error('Failed to dispatch Telegram order alert:', err);
  }
}
