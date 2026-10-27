/**
 * Telegram Notification Helper for Rare Ember
 * Alerts the store CEO & team automatically whenever a new order is received, paid, or claimed.
 * Directly links to Rare Ember Founder Admin portal & Qikink fulfillment hub.
 */

export function getFulfillmentHubLink(): string {
  return 'https://www.rareember.shop/admin/orders';
}

export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendTelegramMessage(token: string, chatId: string, rawText: string, disablePreview = false): Promise<boolean> {
  // Truncate to Telegram's 4096 character limit
  const text = rawText.length > 4000 ? `${rawText.slice(0, 3990)}…\n[truncated]` : rawText;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: disablePreview,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('[Telegram] Message send failed (%d): %s', res.status, err);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Telegram] Dispatch exception:', err);
    return false;
  }
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

  // Build items summary with HTML escaping
  const itemsList = order.items && Array.isArray(order.items) && order.items.length > 0 ? order.items : [];
  const firstItem = itemsList[0] || {};
  const firstItemTitle = escapeHtml(firstItem.title || firstItem.name || firstItem.id || 'Rare Ember Exclusive Drop');

  let itemsSummary = '';
  if (itemsList.length > 0) {
    itemsSummary = itemsList
      .map((it, idx) => {
        const itemTitle = escapeHtml(it.title || it.name || it.id || `Item ${idx + 1}`);
        const variantParts = [
          (it as any).color ? `Color: ${escapeHtml((it as any).color)}` : '',
          it.size ? `Size: ${escapeHtml(it.size)}` : '',
          it.phoneModel ? escapeHtml(it.phoneModel) : '',
          (it as any).selectedStyle ? `Style: ${escapeHtml((it as any).selectedStyle)}` : '',
          it.customText ? `Custom: "${escapeHtml(it.customText)}"` : '',
          (it as any).customImageName ? `Graphic: ${escapeHtml((it as any).customImageName)}` : '',
          (it as any).imageUrl ? `<a href="${encodeURI((it as any).imageUrl)}">Selected Photo</a>` : '',
        ].filter(Boolean).join(' • ');
        return `  ${idx + 1}. <b>${itemTitle}</b>${variantParts ? ` [${variantParts}]` : ''} (Qty: ${it.qty || 1})`;
      })
      .join('\n');
  } else {
    itemsSummary = `  • ${firstItemTitle} (${order.itemsCount || 1} item)`;
  }

  // Build customer address string with escaping
  let addrStr = 'Customer details provided during checkout';
  if (order.address && typeof order.address === 'object') {
    const a = order.address;
    const namePart = escapeHtml(order.name || a.name || 'Customer');
    const line1 = escapeHtml(a.line1 || a.address || '');
    const city = escapeHtml(a.city || '');
    const state = escapeHtml(a.state || '');
    const pin = escapeHtml(a.zip || a.pincode || a.postal_code || a.pin || '');
    const phone = escapeHtml(a.phone || '');
    addrStr = `<b>${namePart}</b>\n${line1}\n${city}, ${state} - <b>${pin}</b>\n📞 Phone: <b>${phone}</b>`;
  } else if (typeof order.address === 'string' && order.address.trim()) {
    addrStr = escapeHtml(order.address.trim());
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
    `🆔 <b>Order ID:</b> <code>#${escapeHtml(order.id)}</code>`,
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
    `• Order routed to Qikink Print-on-Demand Hub (Domestic Hub)`,
    `• 100% White-Label Rare Ember packaging with custom packing slip`,
    `• 48-72h production turnaround & BlueDart/Delhivery dispatch tracking`,
    `• Manage in Founder Portal: <a href="https://www.rareember.shop/admin/orders">rareember.shop/admin/orders</a>`
  ].filter(Boolean).join('\n');

  await sendTelegramMessage(token, chatId, text, false);
}

export async function notifyTelegramReturnClaim(claim: {
  orderId: string;
  contact: string;
  reason: string;
  preference: string;
  notes?: string;
  claimId: string;
  customerName?: string;
  storeCreditCode?: string | null;
  storeCreditAmount?: number | null;
  status?: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const enabled = process.env.TELEGRAM_ALERTS_ENABLED === 'true';

  if (!enabled || !token || !chatId) return;

  const cleanPhone = String(claim.contact || '').replace(/\D/g, '');
  const digits = cleanPhone.slice(-10);
  let waSection = '';
  let callSection = '';

  if (digits.length === 10) {
    const intlPhone = `91${digits}`;
    const custName = claim.customerName || 'Customer';
    const waText = claim.storeCreditCode
      ? encodeURIComponent(
          `Namaste ${custName}! 🙏\n\n` +
          `Team Rare Ember here regarding your Store Credit (+10% Bonus) claim #${claim.claimId} for Order #${claim.orderId}.\n\n` +
          `Your ₹${claim.storeCreditAmount} Store Credit voucher is reserved! Our courier partner will pick up your unworn original piece, and your instant voucher will be activated immediately upon pickup scan. ✨`
        )
      : encodeURIComponent(
          `Namaste ${custName}! 🙏\n\n` +
          `Team Rare Ember here regarding your Return/Replacement request #${claim.claimId} for Order #${claim.orderId}.\n\n` +
          `Reason: ${claim.reason}\n` +
          `Requested: ${claim.preference}\n\n` +
          `We are reviewing your request to resolve it immediately under our 7-Day Guarantee. Could you please share a quick photo of the garment/issue here? Dhanyawad! ✨ - Rare Ember Founder Desk`
        );
    waSection = `💬 <a href="https://wa.me/${intlPhone}?text=${waText}">Tap to WhatsApp Customer Directly</a>`;
    callSection = `📞 <a href="tel:+${intlPhone}">Tap to Call Customer (+91 ${digits})</a>`;
  }

  const isCredit = Boolean(claim.storeCreditCode);

  const text = [
    isCredit ? `🔒 <b>110% STORE CREDIT CLAIM (PENDING PICKUP SCAN)</b> 💳` : `⚠️ <b>NEW REPLACEMENT / RETURN CLAIM!</b> 🔄`,
    ``,
    `🎫 <b>Claim Ticket ID:</b> <code>#${escapeHtml(claim.claimId)}</code>`,
    `🆔 <b>Order ID:</b> <code>#${escapeHtml(claim.orderId)}</code>`,
    claim.customerName ? `👤 <b>Customer Name:</b> <b>${escapeHtml(claim.customerName)}</b>` : '',
    `📞 <b>Customer Contact:</b> <b>${escapeHtml(claim.contact)}</b>`,
    `📋 <b>Reason:</b> <b>${escapeHtml(claim.reason)}</b>`,
    `🔄 <b>Requested Resolution:</b> <b>${escapeHtml(claim.preference)}</b>`,
    isCredit ? `🎟️ <b>Reserved Voucher Code:</b> <code>${escapeHtml(claim.storeCreditCode || '')}</code> (<b>₹${claim.storeCreditAmount}</b>)` : '',
    isCredit ? `🔒 <i>Status: LOCKED to account. Voucher activates upon pickup scan.</i>` : '',
    claim.notes ? `📝 <b>Customer Notes:</b> <i>"${escapeHtml(claim.notes)}"</i>` : '',
    ``,
    waSection ? `${waSection}\n${callSection}\n` : '',
    isCredit
      ? `⚡ <b>ACTION REQUIRED:</b>\n1. Reverse pickup scheduled for original unworn garment.\n2. Once reverse pickup is scanned or verified, click <b>"Approve & Release Store Credit"</b> in <a href="https://www.rareember.shop/admin/orders">Admin Orders Portal</a>.\n3. Voucher code will then be activated and emailed to customer automatically.`
      : `⚡ <b>ACTION REQUIRED:</b>\n1. Verify customer order in <a href="https://www.rareember.shop/admin/orders">Admin Orders Portal</a>.\n2. If size mismatch or misprint, trigger 1-click free replacement order via Qikink.\n3. Contact customer via WhatsApp / Email to reassure with 7-Day Guarantee.`
  ].filter(Boolean).join('\n');

  await sendTelegramMessage(token, chatId, text, true);
}

export async function notifyTelegramStoreCreditReleased(details: {
  orderId: string;
  claimId?: string;
  customerName?: string;
  voucherCode: string;
  amount: number;
  email?: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const enabled = process.env.TELEGRAM_ALERTS_ENABLED === 'true';

  if (!enabled || !token || !chatId) return;

  const text = [
    `✅ <b>STORE CREDIT ACTIVATED & EMAILED!</b> 🎉`,
    ``,
    `🆔 <b>Order ID:</b> <code>#${escapeHtml(details.orderId)}</code>`,
    details.claimId ? `🎫 <b>Claim ID:</b> <code>#${escapeHtml(details.claimId)}</code>` : '',
    `👤 <b>Customer:</b> ${escapeHtml(details.customerName || 'Customer')} ${details.email ? `(${escapeHtml(details.email)})` : ''}`,
    `🎟️ <b>Active Voucher Code:</b> <code>${escapeHtml(details.voucherCode)}</code>`,
    `💰 <b>Amount:</b> <b>₹${details.amount}</b> (110% Atelier Value)`,
    ``,
    `✨ Single-use voucher is now active and emailed to customer. Double-spend cryptographic protection enforced.`
  ].filter(Boolean).join('\n');

  await sendTelegramMessage(token, chatId, text, true);
}

export async function notifyTelegramCustomLead(lead: {
  leadId: string;
  orgName: string;
  contactName: string;
  phone: string;
  quantity: number;
  productType: string;
  eventDate?: string;
  estimatedBudget?: number | string;
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
    (lead.estimatedBudget ? `• Estimate: ₹${lead.estimatedBudget}\n\n` : '\n') +
    `Our production desk is ready with fabric batches & DTF print slots. Shall I share the free 3D design proof? ✨`
  );
  const waLink = intlPhone ? `https://wa.me/${intlPhone}?text=${waText}` : '';

  const text = [
    `🏛️ <b>NEW B2B CUSTOM MERCH LEAD!</b> ⚡`,
    ``,
    `🎫 <b>Lead ID:</b> <code>#${escapeHtml(lead.leadId)}</code>`,
    `🏢 <b>Organization / Club:</b> <b>${escapeHtml(lead.orgName || 'Not specified')}</b>`,
    `👤 <b>Contact Person:</b> <b>${escapeHtml(lead.contactName || 'Organizer')}</b>`,
    `📞 <b>WhatsApp / Phone:</b> <b>${escapeHtml(lead.phone)}</b>`,
    `👕 <b>Product:</b> <b>${escapeHtml(lead.productType)}</b>`,
    `📦 <b>Batch Quantity:</b> <b>${lead.quantity} units</b>`,
    lead.eventDate ? `📅 <b>Target Event:</b> ${escapeHtml(lead.eventDate)}` : '',
    lead.estimatedBudget ? `💰 <b>Estimated Budget:</b> <b>₹${escapeHtml(String(lead.estimatedBudget))}</b>` : '',
    ``,
    waLink ? `💬 <b>1-CLICK WHATSAPP TO LEAD:</b>\n👉 <a href="${waLink}">Open WhatsApp & Send 3D Proof Offer</a>\n` : '',
    `⚡ <b>PRODUCTION DESK ACTION:</b>`,
    `1. Contact organizer within 2 hours.`,
    `2. Prepare 3D digital mockup on RareEmber blank templates.`,
    `3. Collect 20% advance booking deposit to reserve production slot.`
  ].filter(Boolean).join('\n');

  await sendTelegramMessage(token, chatId, text, false);
}

export async function notifyTelegramSupportTicket(ticket: {
  ticketId: string;
  name: string;
  phone: string;
  email: string;
  orderId?: string;
  category: string;
  subject: string;
  message: string;
  priority?: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const enabled = process.env.TELEGRAM_ALERTS_ENABLED === 'true';

  if (!enabled || !token || !chatId) return;

  const cleanPhone = String(ticket.phone || '').replace(/\D/g, '');
  const intlPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const waText = encodeURIComponent(
    `Namaste ${ticket.name || 'Customer'}! 🙏\n\n` +
    `We received your Rare Ember Support Ticket #${ticket.ticketId} regarding "${ticket.subject}".\n\n` +
    `Our founder team is actively looking into your inquiry and will resolve this within our 12-hour priority SLA window. How can we best assist?`
  );
  const waLink = intlPhone ? `https://wa.me/${intlPhone}?text=${waText}` : '';
  const callLink = intlPhone ? `tel:+${intlPhone}` : '';

  const text = [
    `🎫 <b>NEW CUSTOMER SUPPORT TICKET RAISED!</b> ⚡`,
    `⏱️ <i>Priority SLA: Guaranteed Reply in 12 Hours</i>`,
    ``,
    `🆔 <b>Ticket ID:</b> <code>#${escapeHtml(ticket.ticketId)}</code>`,
    `👤 <b>Customer Name:</b> <b>${escapeHtml(ticket.name)}</b>`,
    `📞 <b>Mobile Phone:</b> <b>${escapeHtml(ticket.phone)}</b>`,
    `✉️ <b>Email Address:</b> ${escapeHtml(ticket.email)}`,
    ticket.orderId ? `📦 <b>Related Order ID:</b> <code>#${escapeHtml(ticket.orderId)}</code>` : '',
    `🏷️ <b>Category:</b> <b>${escapeHtml(ticket.category)}</b>`,
    `⚡ <b>Priority:</b> ${escapeHtml(ticket.priority || 'Normal')}`,
    ``,
    `📝 <b>Subject:</b> <b>${escapeHtml(ticket.subject)}</b>`,
    `💬 <b>Customer Message:</b>`,
    `<i>"${escapeHtml(ticket.message)}"</i>`,
    ``,
    callLink ? `📞 <a href="${callLink}">Call Customer Now (+91 ${escapeHtml(ticket.phone)})</a>` : '',
    waLink ? `💬 <a href="${waLink}">Open WhatsApp Chat with Customer</a>` : '',
    `🔗 <a href="${getFulfillmentHubLink()}">Open Founder Command Center</a>`,
  ].filter(Boolean).join('\n');

  await sendTelegramMessage(token, chatId, text, true);
}

export async function notifyTelegramCallbackRequest(req: {
  name: string;
  phone: string;
  slot: string;
  reason?: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const enabled = process.env.TELEGRAM_ALERTS_ENABLED === 'true';

  if (!enabled || !token || !chatId) return;

  const cleanPhone = String(req.phone || '').replace(/\D/g, '');
  const intlPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const callLink = intlPhone ? `tel:+${intlPhone}` : '';
  const waLink = intlPhone ? `https://wa.me/${intlPhone}?text=${encodeURIComponent(`Namaste ${req.name}! Rare Ember team calling regarding your callback request.`)}` : '';

  const text = [
    `📞 <b>NEW INSTANT CALLBACK REQUEST!</b> ⚡`,
    ``,
    `👤 <b>Name:</b> <b>${escapeHtml(req.name)}</b>`,
    `📱 <b>Phone:</b> <b>${escapeHtml(req.phone)}</b>`,
    `⏰ <b>Preferred Slot:</b> <b>${escapeHtml(req.slot)}</b>`,
    req.reason ? `📝 <b>Reason / Inquiry:</b> <i>"${escapeHtml(req.reason)}"</i>` : '',
    ``,
    callLink ? `📞 <a href="${callLink}">Tap to Call Customer Now</a>` : '',
    waLink ? `💬 <a href="${waLink}">Chat on WhatsApp</a>` : '',
  ].filter(Boolean).join('\n');

  await sendTelegramMessage(token, chatId, text, true);
}

/**
 * Dispatches an instant Telegram notification whenever a COD OTP is issued.
 */
export async function notifyTelegramOtp(params: {
  otp: string;
  email: string;
  phone: string;
  name?: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const enabled = process.env.TELEGRAM_ALERTS_ENABLED === 'true';

  if (!enabled || !token || !chatId) {
    return;
  }

  const text = [
    `🔐 <b>COD OTP VERIFICATION CODE GENERATED</b>`,
    ``,
    `🔢 <b>OTP Code:</b> <code>${escapeHtml(params.otp)}</code>`,
    `👤 <b>Customer:</b> ${escapeHtml(params.name || 'Anonymous Guest')}`,
    `📧 <b>Email:</b> <code>${escapeHtml(params.email)}</code>`,
    `📱 <b>Phone:</b> <code>${escapeHtml(params.phone)}</code>`,
    `⏱ <b>Validity:</b> 5 minutes (Stateless HMAC-SHA256)`,
    ``,
    `<i>Logged in real-time for customer verification backup.</i>`,
  ].join('\n');

  await sendTelegramMessage(token, chatId, text, true);
}
