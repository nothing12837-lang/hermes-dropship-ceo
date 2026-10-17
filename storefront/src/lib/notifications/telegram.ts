/**
 * Telegram Notification Helper for Rare Ember
 * Alerts the store CEO & team automatically whenever a new order is received, paid, or claimed.
 * Directly links to Rare Ember Founder Admin portal & Qikink fulfillment hub.
 */

export function getFulfillmentHubLink(): string {
  return 'https://www.rareember.shop/admin/orders';
}

export async function notifyTelegramOrder(order: {
  id: string;
  total: number;
  paymentMethod: string;
  email: string;
  name?: string | null;
  itemsCount?: number;
  city?: string | null;
  items?: Array<{ id?: string; title?: string; name?: string; qty?: number; price?: number; size?: string; phoneModel?: string; customText?: string }>;
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

  // Build items summary
  const itemsList = order.items && Array.isArray(order.items) && order.items.length > 0 ? order.items : [];
  const firstItem = itemsList[0] || {};
  const firstItemTitle = firstItem.title || firstItem.name || firstItem.id || 'Rare Ember Exclusive Drop';

  let itemsSummary = '';
  if (itemsList.length > 0) {
    itemsSummary = itemsList
      .map((it, idx) => {
        const itemTitle = it.title || it.name || it.id || `Item ${idx + 1}`;
        const variantParts = [
          it.size ? `Size: ${it.size}` : '',
          it.phoneModel,
          (it as any).selectedStyle ? `Style: ${(it as any).selectedStyle}` : '',
          it.customText ? `Custom: "${it.customText}"` : '',
          (it as any).customImageName ? `Graphic: ${(it as any).customImageName}` : '',
          (it as any).imageUrl ? `<a href="${(it as any).imageUrl}">Selected Photo</a>` : '',
        ].filter(Boolean).join(' • ');
        return `  ${idx + 1}. <b>${itemTitle}</b>${variantParts ? ` [${variantParts}]` : ''} (Qty: ${it.qty || 1})`;
      })
      .join('\n');
  } else {
    itemsSummary = `  • ${firstItemTitle} (${order.itemsCount || 1} item)`;
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

  // Extract customer phone & create 1-click WhatsApp confirmation link
  let waSection = '';
  const rawPhone = order.address && typeof order.address === 'object' ? order.address.phone : '';
  const cleanPhone = String(rawPhone || '').replace(/\D/g, '');
  if (cleanPhone.length >= 10) {
    const intlPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const custName = order.name || (order.address && typeof order.address === 'object' ? order.address.name : '') || 'Customer';
    const waText = encodeURIComponent(
      `Namaste ${custName}! 🙏\n\n` +
      `Aapka Rare Ember order #${order.id} receive ho gaya hai!\n\n` +
      `📦 Item: ${firstItemTitle}\n` +
      `💰 Delivery Amount: ₹${order.total.toLocaleString()} (${isCod ? 'COD' : 'Paid'})\n\n` +
      `Aapka order Rare Ember production queue me add ho chuka hai. Express dispatch ke saath live tracking link SMS/WhatsApp par milega. Dhanyawad! ✨ - Team Rare Ember`
    );
    const waLink = `https://wa.me/${intlPhone}?text=${waText}`;
    waSection = `💬 <b>1-CLICK WHATSAPP CONFIRMATION:</b>\n👉 <a href="${waLink}">Tap to Send WhatsApp to Customer</a>\n\n`;
  }

  const text = [
    `🚨 <b>NEW ORDER ON RARE EMBER!</b> ${icon}`,
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
    `⚡ <b>QIKINK AUTOMATED FULFILLMENT:</b>`,
    `• Order routed to Qikink Print-on-Demand Hub (Tirupur/Coimbatore)`,
    `• 100% White-Label Rare Ember packaging with custom packing slip`,
    `• 48-72h production turnaround & BlueDart/Delhivery dispatch tracking`,
    `• Manage in Founder Portal: <a href="https://www.rareember.shop/admin/orders">rareember.shop/admin/orders</a>`
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

export async function notifyTelegramReturnClaim(claim: {
  orderId: string;
  contact: string;
  reason: string;
  preference: string;
  notes?: string;
  claimId: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const enabled = process.env.TELEGRAM_ALERTS_ENABLED === 'true';

  if (!enabled || !token || !chatId) return;

  const text = [
    `⚠️ <b>NEW REPLACEMENT / RETURN CLAIM!</b> 🔄`,
    ``,
    `🎫 <b>Claim Ticket ID:</b> <code>#${claim.claimId}</code>`,
    `🆔 <b>Order ID:</b> <code>#${claim.orderId}</code>`,
    `👤 <b>Customer Contact:</b> <b>${claim.contact}</b>`,
    `📋 <b>Reason:</b> <b>${claim.reason}</b>`,
    `🔄 <b>Requested Resolution:</b> <b>${claim.preference}</b>`,
    claim.notes ? `📝 <b>Customer Notes:</b> <i>${claim.notes}</i>` : '',
    ``,
    `⚡ <b>ACTION REQUIRED:</b>`,
    `1. Verify customer order in <a href="https://www.rareember.shop/admin/orders">Admin Orders Portal</a>.`,
    `2. If size mismatch or misprint, trigger 1-click free replacement order via Qikink.`,
    `3. Contact customer via WhatsApp / Email to reassure with 7-Day Guarantee.`
  ].filter(Boolean).join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error('Failed to dispatch Telegram return alert:', err);
  }
}

export async function notifyTelegramCustomLead(lead: {
  leadId: string;
  orgName: string;
  contactName: string;
  phone: string;
  quantity: number;
  productType: string;
  eventDate?: string;
  estimatedBudget?: number;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const enabled = process.env.TELEGRAM_ALERTS_ENABLED === 'true';

  if (!enabled || !token || !chatId) return;

  const cleanPhone = String(lead.phone || '').replace(/\D/g, '');
  const intlPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const waText = encodeURIComponent(
    `Namaste ${lead.contactName || 'Organizer'}! 🙏\n\n` +
    `Thank you for your custom merch inquiry for *${lead.orgName || 'your team'}* on RareEmber!\n\n` +
    `• Product: ${lead.productType}\n` +
    `• Quantity: ${lead.quantity} units\n` +
    `• Event Date: ${lead.eventDate || 'Upcoming'}\n` +
    (lead.estimatedBudget ? `• Estimate: ₹${lead.estimatedBudget.toLocaleString('en-IN')}\n\n` : '\n') +
    `Our Tirupur production desk is ready with fabric batches & DTF print slots. Shall I share the free 3D design proof? ✨`
  );
  const waLink = intlPhone ? `https://wa.me/${intlPhone}?text=${waText}` : '';

  const text = [
    `🏛️ <b>NEW B2B CUSTOM MERCH LEAD!</b> ⚡`,
    ``,
    `🎫 <b>Lead ID:</b> <code>#${lead.leadId}</code>`,
    `🏢 <b>Organization / Club:</b> <b>${lead.orgName || 'Not specified'}</b>`,
    `👤 <b>Contact Person:</b> <b>${lead.contactName || 'Organizer'}</b>`,
    `📞 <b>WhatsApp / Phone:</b> <b>${lead.phone}</b>`,
    `👕 <b>Product:</b> <b>${lead.productType}</b>`,
    `📦 <b>Batch Quantity:</b> <b>${lead.quantity} units</b>`,
    lead.eventDate ? `📅 <b>Target Event:</b> ${lead.eventDate}` : '',
    lead.estimatedBudget ? `💰 <b>Estimated Budget:</b> <b>₹${lead.estimatedBudget.toLocaleString('en-IN')}</b>` : '',
    ``,
    waLink ? `💬 <b>1-CLICK WHATSAPP TO LEAD:</b>\n👉 <a href="${waLink}">Open WhatsApp & Send 3D Proof Offer</a>\n` : '',
    `⚡ <b>PRODUCTION DESK ACTION:</b>`,
    `1. Contact organizer within 2 hours.`,
    `2. Prepare 3D digital mockup on RareEmber blank templates.`,
    `3. Collect 20% advance booking deposit to reserve Tirupur print slot.`
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
    console.error('Failed to dispatch Telegram custom lead alert:', err);
  }
}

