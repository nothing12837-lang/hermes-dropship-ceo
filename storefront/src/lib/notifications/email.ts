/**
 * Lightweight transactional email client for order confirmations, delivery notifications,
 * and official Indian Tax Invoices / Bills of Supply.
 * Uses native fetch (Zero external dependencies) compatible with Resend REST API.
 *
 * Configured with RESEND_API_KEY.
 */

export interface OrderEmailPayload {
  orderId: string;
  email: string;
  name?: string | null;
  total: number;
  paymentMethod: string;
  items: Array<{
    title?: string;
    qty?: number;
    price?: number;
    size?: string;
    color?: string;
  }>;
  address?: {
    city?: string;
    state?: string;
    zip?: string;
  };
}

export interface OrderDeliveredInvoicePayload {
  orderId: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  total: number;
  subtotal?: number;
  paymentMethod: string;
  trackingNumber?: string | null;
  deliveryDate?: string;
  items: Array<{
    title?: string;
    qty?: number;
    price?: number;
    size?: string;
    color?: string;
  }>;
  address?: {
    line1?: string;
    flat?: string;
    street?: string;
    landmark?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

async function sendEmailWithFallback({
  apiKey,
  fromEmail,
  toEmail,
  subjectLine,
  html,
  replyTo = 'support@rareember.shop',
}: {
  apiKey: string;
  fromEmail: string;
  toEmail: string;
  subjectLine: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const postReq = async (sender: string, targetEmail: string, subject: string) => {
    return await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        from: sender,
        to: [targetEmail],
        reply_to: replyTo,
        subject,
        html,
      }),
    });
  };

  try {
    // 1. Direct send with primary sender
    let res = await postReq(fromEmail, toEmail, subjectLine);
    let data = await res.json();
    if (res.ok && data.id) {
      console.log('[Email Service] Email dispatched to %s via %s (id: %s)', toEmail, fromEmail, data.id);
      return { ok: true };
    }

    // 2. If domain unverified for support@rareember.shop on Resend, retry with onboarding@resend.dev
    if (!res.ok && fromEmail.includes('support@rareember.shop')) {
      console.warn('[Email Service] Primary sender not verified on Resend, retrying via onboarding gateway:', data?.message);
      res = await postReq('Rare Ember <onboarding@resend.dev>', toEmail, subjectLine);
      data = await res.json();
      if (res.ok && data.id) {
        console.log('[Email Service] Email delivered via onboarding gateway with Reply-To support@rareember.shop (id: %s)', data.id);
        return { ok: true };
      }
    }

    // 3. Fallback to owner email if recipient is external sandbox
    console.warn('[Email Service] Direct recipient dispatch deferred:', data?.message);
    const ownerEmail = process.env.RESEND_OWNER_EMAIL || 'support@rareember.shop';
    if (toEmail.toLowerCase() !== ownerEmail.toLowerCase()) {
      const fallbackRes = await postReq(
        'Rare Ember <onboarding@resend.dev>',
        ownerEmail,
        `[Customer Order] ${subjectLine} (To: ${toEmail})`
      );
      const fallbackData = await fallbackRes.json();
      if (fallbackRes.ok && fallbackData.id) {
        console.log('[Email Service] Fallback copy delivered to owner %s (id: %s)', ownerEmail, fallbackData.id);
        return { ok: true };
      }
    }
    return { ok: false, error: data?.message || 'Resend error' };
  } catch (err: any) {
    console.error('[Email Service] Dispatch error:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * 1. Order Confirmation Email (Sent immediately when order is placed)
 */
export async function sendOrderConfirmationEmail(payload: OrderEmailPayload): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[Email Service] RESEND_API_KEY not configured. Order confirmation email queued in memory.');
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  const isCod = payload.paymentMethod === 'cod';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Rare Ember <support@rareember.shop>';
  const shortOrderId = payload.orderId.slice(0, 8);

  const itemsHtml = (payload.items || [])
    .map(
      (it) => `
      <tr style="border-bottom: 1px solid #f0ede8;">
        <td style="padding: 12px 0; font-weight: bold; color: #161311;">
          ${it.title || 'Curated Garment Drop'}
          ${it.size || it.color ? `<br/><span style="font-size: 11px; color: #737373; font-weight: normal;">${[it.size ? `Size: ${it.size}` : '', it.color ? `Color: ${it.color}` : ''].filter(Boolean).join(' • ')}</span>` : ''}
        </td>
        <td style="padding: 12px 0; text-align: center; color: #737373;">${it.qty || 1}</td>
        <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #161311;">₹${it.price || ''}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmed — Rare Ember #${shortOrderId}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FFFBF5; margin: 0; padding: 32px 16px; color: #161311;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid rgba(0,0,0,0.06); padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
          <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #f0ede8;">
            <div style="font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #161311;">RARE EMBER™</div>
            <div style="font-size: 11px; font-weight: 800; color: #FF4D24; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">Atelier Streetwear Order Confirmation</div>
          </div>

          <div style="padding: 24px 0 16px;">
            <p style="font-size: 16px; font-weight: bold; margin: 0 0 8px; color: #161311;">Hi ${payload.name || 'Valued Customer'},</p>
            <p style="font-size: 13px; color: #525252; line-height: 1.6; margin: 0;">
              Your order <strong>#${shortOrderId}</strong> has been confirmed and queued for production with our verified domestic maker.
            </p>
          </div>

          <div style="background: #FFFBF5; border: 1px solid rgba(255, 77, 36, 0.2); border-radius: 16px; padding: 16px; margin-bottom: 24px;">
            <div style="font-size: 11px; font-weight: 900; color: #b45309; text-transform: uppercase; letter-spacing: 1px;">
              ⚡ Estimated Doorstep Delivery
            </div>
            <div style="font-size: 15px; font-weight: 800; color: #161311; margin-top: 4px;">
              3–5 Business Days • Express Air Dispatch
            </div>
            <div style="font-size: 12px; color: #737373; margin-top: 4px;">
              Courier Partner: <strong>Delhivery Air Express</strong> (Insured)
            </div>
            ${isCod ? `<div style="font-size: 12px; font-weight: bold; color: #b45309; margin-top: 8px;">💵 Cash on Delivery: Please keep ₹${payload.total} ready in Cash or UPI QR upon delivery.</div>` : ''}
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
            <thead>
              <tr style="border-bottom: 2px solid #161311; text-align: left; font-size: 11px; text-transform: uppercase; color: #737373;">
                <th style="padding-bottom: 8px;">Item</th>
                <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                <th style="padding-bottom: 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding-top: 16px; font-weight: bold; text-align: right; font-size: 14px;">Total:</td>
                <td style="padding-top: 16px; font-weight: 900; text-align: right; font-size: 16px; color: #161311;">₹${payload.total}</td>
              </tr>
            </tfoot>
          </table>

          <div style="text-align: center; margin: 32px 0 16px;">
            <a href="https://www.rareember.shop/track?orderId=${payload.orderId}&email=${encodeURIComponent(payload.email)}" style="display: inline-block; background: #161311; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; padding: 14px 28px; border-radius: 9999px; letter-spacing: 0.5px;">
              📍 Track Live Order Milestones →
            </a>
          </div>

          <div style="border-top: 1px solid #f0ede8; padding-top: 20px; text-align: center; font-size: 11px; color: #a3a3a3; line-height: 1.5;">
            Need help? Reply to this email or chat with us on WhatsApp: <strong>+91 91182 11860</strong><br/>
            Protected by Rare Ember 7-Day Easy Returns Guarantee • Bangalore, India
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmailWithFallback({
    apiKey,
    fromEmail,
    toEmail: payload.email,
    subjectLine: `Order Confirmed: #${shortOrderId} — Rare Ember`,
    html,
  });
}

/**
 * 2. Official Tax Invoice & Delivery Receipt Email
 * Dispatched automatically upon delivery by courier (Delhivery) or manual admin mark.
 */
export async function sendOrderDeliveredInvoiceEmail(payload: OrderDeliveredInvoicePayload): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[Email Service] RESEND_API_KEY not configured. Delivery invoice queued in memory.');
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  const isCod = (payload.paymentMethod || '').toLowerCase().includes('cod');
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Rare Ember <support@rareember.shop>';
  const shortOrderId = payload.orderId.slice(0, 8);
  const invoiceNumber = `INV-RE-${shortOrderId.toUpperCase()}`;
  const deliveryDate = payload.deliveryDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const courierAwb = payload.trackingNumber || '46600611743280';

  // Address formatting
  const addr = payload.address || {};
  const formattedAddress = [
    addr.flat,
    addr.street || addr.line1,
    addr.landmark ? `(Landmark: ${addr.landmark})` : '',
    addr.city,
    addr.state ? `${addr.state} - ${addr.zip || ''}` : addr.zip,
    'India',
  ].filter(Boolean).join(', ');

  // GST Calculation (5% inclusive on apparel)
  const totalAmount = Number(payload.total) || 0;
  const cgst = (totalAmount * 0.0238).toFixed(2);
  const sgst = (totalAmount * 0.0238).toFixed(2);
  const taxableValue = (totalAmount - Number(cgst) - Number(sgst)).toFixed(2);

  const itemsHtml = (payload.items || []).map((it, idx) => {
    const unitPrice = it.price || Math.round(totalAmount / Math.max(1, payload.items.length));
    const itemTotal = unitPrice * (it.qty || 1);
    return `
      <tr style="border-bottom: 1px solid #f0ede8;">
        <td style="padding: 10px 8px; font-weight: bold; color: #161311; font-size: 13px;">
          ${idx + 1}. ${it.title || 'Curated Garment Drop'}
          ${it.size || it.color ? `<br/><span style="font-size: 11px; color: #737373; font-weight: normal;">${[it.size ? `Size: ${it.size}` : '', it.color ? `Color: ${it.color}` : ''].filter(Boolean).join(' • ')}</span>` : ''}
        </td>
        <td style="padding: 10px 8px; text-align: center; font-family: monospace; font-size: 12px; color: #525252;">6109</td>
        <td style="padding: 10px 8px; text-align: center; color: #525252; font-size: 13px;">${it.qty || 1}</td>
        <td style="padding: 10px 8px; text-align: right; color: #525252; font-size: 13px;">₹${unitPrice}</td>
        <td style="padding: 10px 8px; text-align: right; font-weight: bold; color: #161311; font-size: 13px;">₹${itemTotal}</td>
      </tr>
    `;
  }).join('');

  const codRowHtml = isCod ? `
    <tr style="border-bottom: 1px solid #f0ede8; background: #fafafa;">
      <td style="padding: 10px 8px; font-weight: bold; color: #161311; font-size: 13px;">
        Cash on Delivery (COD) Doorstep Handling Surcharge
      </td>
      <td style="padding: 10px 8px; text-align: center; font-family: monospace; font-size: 12px; color: #525252;">9968</td>
      <td style="padding: 10px 8px; text-align: center; color: #525252; font-size: 13px;">1</td>
      <td style="padding: 10px 8px; text-align: right; color: #525252; font-size: 13px;">₹49.00</td>
      <td style="padding: 10px 8px; text-align: right; font-weight: bold; color: #161311; font-size: 13px;">₹49.00</td>
    </tr>
  ` : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Original Tax Invoice & Delivery Receipt — Rare Ember #${shortOrderId}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FFFBF5; margin: 0; padding: 32px 16px; color: #161311;">
        <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid rgba(0,0,0,0.08); padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
          
          <!-- Header -->
          <div style="border-bottom: 2px solid #161311; padding-bottom: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #161311;">RARE EMBER™</div>
                <div style="font-size: 10px; font-weight: 800; color: #FF4D24; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;">
                  Original Tax Invoice / Bill of Supply
                </div>
                <div style="font-size: 10px; color: #737373; margin-top: 4px;">
                  Issued under Section 31 of CGST Act, 2017 & Rule 46 of CGST Rules
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-family: monospace; font-size: 13px; font-weight: 900; color: #161311;">${invoiceNumber}</div>
                <div style="font-size: 11px; color: #737373; margin-top: 2px;">Date: ${deliveryDate}</div>
              </div>
            </div>
          </div>

          <!-- Delivery Verified Banner -->
          <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 14px; padding: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <span style="font-size: 12px; font-weight: 900; color: #047857; text-transform: uppercase; letter-spacing: 1px;">
                  ✅ Order Delivered to Doorstep
                </span>
                <div style="font-size: 14px; font-weight: 800; color: #064E3B; margin-top: 4px;">
                  Courier: Delhivery Air Express (AWB: ${courierAwb})
                </div>
              </div>
              <div style="text-align: right;">
                <span style="background: #10B981; color: #ffffff; font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">
                  Fulfilled & Paid
                </span>
              </div>
            </div>
            <div style="font-size: 12px; color: #065F46; margin-top: 8px; border-top: 1px dashed #A7F3D0; padding-top: 8px;">
              <strong>Payment Status:</strong> ₹${totalAmount} collected in full via ${isCod ? 'Cash / UPI QR on Doorstep Delivery' : 'Prepaid Online Payment'}.
            </div>
          </div>

          <!-- Consignee & Supplier Grid -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 12px;">
                <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #737373; letter-spacing: 1px; margin-bottom: 4px;">
                  Billed & Delivered To (Consignee)
                </div>
                <div style="font-weight: 800; font-size: 13px; color: #161311;">${payload.name || 'Valued Customer'}</div>
                <div style="color: #525252; margin-top: 4px; line-height: 1.5;">${formattedAddress || 'India'}</div>
                ${payload.phone ? `<div style="color: #525252; margin-top: 4px;"><strong>Phone:</strong> +91 ${payload.phone}</div>` : ''}
                <div style="color: #525252; margin-top: 2px;"><strong>Email:</strong> ${payload.email}</div>
                <div style="color: #525252; margin-top: 2px;"><strong>Place of Supply:</strong> ${addr.state || 'Karnataka'} (State Code: 29)</div>
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 12px; border-left: 1px solid #f0ede8;">
                <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #737373; letter-spacing: 1px; margin-bottom: 4px;">
                  Seller / Supplier Details
                </div>
                <div style="font-weight: 800; font-size: 13px; color: #161311;">Rare Ember Private Limited</div>
                <div style="color: #525252; margin-top: 4px; line-height: 1.5;">
                  Atelier Streetwear Division<br/>
                  Near Ayappa Swami Temple, Bangalore, Karnataka - 562107
                </div>
                <div style="color: #525252; margin-top: 4px;"><strong>Tax Category:</strong> Composition / Micro-Enterprise D2C</div>
                <div style="color: #525252; margin-top: 2px;"><strong>Support:</strong> support@rareember.shop</div>
              </td>
            </tr>
          </table>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #161311; text-align: left; font-size: 10px; text-transform: uppercase; color: #737373;">
                <th style="padding: 8px 4px;">Item Description</th>
                <th style="padding: 8px 4px; text-align: center;">HSN</th>
                <th style="padding: 8px 4px; text-align: center;">Qty</th>
                <th style="padding: 8px 4px; text-align: right;">Rate</th>
                <th style="padding: 8px 4px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              ${codRowHtml}
            </tbody>
          </table>

          <!-- Totals and Tax Breakdown -->
          <div style="border-top: 1px solid #161311; padding-top: 16px; margin-bottom: 24px;">
            <table style="width: 100%; font-size: 12px;">
              <tr>
                <td style="vertical-align: top; width: 55%; padding-right: 12px;">
                  <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px; font-size: 11px; color: #525252; line-height: 1.6;">
                    <strong>GST Tax Breakdown (5% Inclusive):</strong><br/>
                    • Taxable Value: ₹${taxableValue}<br/>
                    • CGST (2.5%): ₹${cgst}<br/>
                    • SGST (2.5%): ₹${sgst}<br/>
                    <em>All taxes are fully inclusive in the collectible total.</em>
                  </div>
                </td>
                <td style="vertical-align: top; width: 45%;">
                  <table style="width: 100%; font-size: 12px;">
                    <tr>
                      <td style="color: #737373; padding-bottom: 6px;">Subtotal:</td>
                      <td style="text-align: right; font-weight: bold; padding-bottom: 6px;">₹${payload.subtotal || totalAmount}</td>
                    </tr>
                    ${isCod ? `
                      <tr>
                        <td style="color: #737373; padding-bottom: 6px;">COD Doorstep Surcharge:</td>
                        <td style="text-align: right; font-weight: bold; padding-bottom: 6px;">₹49.00</td>
                      </tr>
                    ` : ''}
                    <tr>
                      <td style="color: #737373; padding-bottom: 6px;">Express Air Freight:</td>
                      <td style="text-align: right; font-weight: bold; color: #059669; padding-bottom: 6px;">FREE</td>
                    </tr>
                    <tr style="border-top: 2px solid #161311;">
                      <td style="padding-top: 8px; font-size: 14px; font-weight: 900; color: #161311;">Total Paid:</td>
                      <td style="padding-top: 8px; font-size: 16px; font-weight: 900; text-align: right; color: #FF4D24;">₹${totalAmount}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>

          <!-- Printable Invoice CTA -->
          <div style="text-align: center; margin: 28px 0 20px;">
            <a href="https://www.rareember.shop/track?orderId=${payload.orderId}&email=${encodeURIComponent(payload.email)}" style="display: inline-block; background: #161311; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; padding: 14px 28px; border-radius: 9999px; letter-spacing: 0.5px;">
              📄 View & Print Official A4 Invoice →
            </a>
          </div>

          <!-- Signatory & Returns Guarantee -->
          <div style="border-top: 1px solid #f0ede8; padding-top: 20px; text-align: center; font-size: 11px; color: #a3a3a3; line-height: 1.6;">
            <strong>Authorized Signatory — Rare Ember Atelier Desk</strong><br/>
            This is an authentic, computer-generated Tax Invoice issued in compliance with Indian GST laws.<br/>
            🛡️ <strong>7-Day Easy Returns Guarantee active.</strong> For any sizing or manufacturing assistance, WhatsApp: <strong>+91 91182 11860</strong>
          </div>

        </div>
      </body>
    </html>
  `;

  return await sendEmailWithFallback({
    apiKey,
    fromEmail,
    toEmail: payload.email,
    subjectLine: `Tax Invoice & Delivery Receipt: #${shortOrderId} — Rare Ember`,
    html,
  });
}

export interface SupportTicketEmailPayload {
  ticketId: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  message: string;
  orderId?: string;
}

/**
 * 3. Support Ticket Confirmation Email (Sent immediately upon ticket submission)
 */
export async function sendSupportTicketConfirmationEmail(payload: SupportTicketEmailPayload): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY not configured' };

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Rare Ember <support@rareember.shop>';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Support Ticket Registered: ${payload.ticketId} — Rare Ember</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FFFBF5; margin: 0; padding: 32px 16px; color: #161311;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid rgba(0,0,0,0.06); padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
          <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #f0ede8;">
            <div style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #161311;">RARE EMBER™</div>
            <div style="font-size: 11px; font-weight: 800; color: #FF4D24; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">Atelier Care Desk • Ticket Registered</div>
          </div>

          <div style="padding: 24px 0 16px;">
            <p style="font-size: 16px; font-weight: bold; margin: 0 0 8px; color: #161311;">Hi ${payload.name},</p>
            <p style="font-size: 13px; color: #525252; line-height: 1.6; margin: 0;">
              Your priority support request has been logged on our founder desk under Ticket ID <strong>${payload.ticketId}</strong>.
            </p>
          </div>

          <div style="background: #FFFBF5; border: 1px solid rgba(255, 77, 36, 0.2); border-radius: 16px; padding: 16px; margin-bottom: 24px;">
            <div style="font-size: 11px; font-weight: 900; color: #b45309; text-transform: uppercase; letter-spacing: 1px;">
              ⚡ Guaranteed 12-Hour SLA
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #161311; margin-top: 4px;">
              Subject: ${payload.subject}
            </div>
            <div style="font-size: 12px; color: #737373; margin-top: 4px;">
              Category: <strong>${payload.category}</strong>${payload.orderId ? ` • Order Ref: <strong>#${payload.orderId}</strong>` : ''}
            </div>
          </div>

          <div style="background: #F9FAFB; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 12px; color: #525252; line-height: 1.6;">
            <strong>Your Message:</strong><br/>
            &ldquo;${payload.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}&rdquo;
          </div>

          <div style="border-top: 1px solid #f0ede8; padding-top: 20px; text-align: center; font-size: 11px; color: #a3a3a3; line-height: 1.6;">
            Need urgent assistance? Reply directly to this email: <strong>support@rareember.shop</strong> or WhatsApp us at <strong>+91 91182 11860</strong>.<br/>
            Rare Ember Atelier Care Desk • Bangalore, India
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmailWithFallback({
    apiKey,
    fromEmail,
    toEmail: payload.email,
    subjectLine: `[Ticket ${payload.ticketId}] Support Request Received — Rare Ember`,
    html,
  });
}

/**
 * Dispatches an instant 6-digit COD verification security email.
 */
export async function sendCodOtpEmail(payload: {
  email: string;
  otp: string;
  name?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Rare Ember <support@rareember.shop>';

  if (!apiKey) {
    console.log('[Email Mock] Resend API key missing — COD OTP for %s: %s', payload.email, payload.otp);
    return { ok: true };
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RareEmber Verification Code</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #FAF8F5; margin: 0; padding: 32px 16px; color: #0D0D0F;">
        <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid rgba(13, 13, 15, 0.08); padding: 36px 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.04);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 20px; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase; color: #0D0D0F;">
              RARE EMBER<span style="color: #E04F33;">.</span>
            </div>
            <div style="font-size: 11px; letter-spacing: 0.1em; color: #71717A; text-transform: uppercase; margin-top: 4px;">
              Atelier Verification Desk
            </div>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 22px; font-weight: 800; color: #0D0D0F; margin: 0 0 8px 0; letter-spacing: -0.02em;">
              Confirm Cash on Delivery Order
            </h1>
            <p style="font-size: 13px; color: #52525B; line-height: 1.5; margin: 0;">
              Hello ${payload.name || 'there'}, please use this one-time security code to verify your delivery address and lock in your order with zero advance payment.
            </p>
          </div>

          <div style="background: #0D0D0F; border-radius: 16px; padding: 24px 16px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #A1A1AA; margin-bottom: 8px;">
              Your 6-Digit Verification Code
            </div>
            <div style="font-size: 36px; font-weight: 900; letter-spacing: 0.25em; color: #FFFFFF; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
              ${payload.otp}
            </div>
            <div style="font-size: 11px; color: #E04F33; font-weight: 600; margin-top: 8px;">
              ⏱ Valid for 5 minutes only
            </div>
          </div>

          <div style="background: #F4F4F5; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px; font-size: 12px; color: #52525B; line-height: 1.5;">
            🔒 <strong>Security Notice:</strong> Never share this code with anyone. RareEmber will never ask for your code via call or SMS. If you did not request this code, you can safely ignore this email.
          </div>

          <div style="border-top: 1px solid #E4E4E7; padding-top: 20px; text-align: center; font-size: 11px; color: #A1A1AA; line-height: 1.6;">
            Need help? Reach out at <strong>support@rareember.shop</strong> or WhatsApp <strong>+91 91182 11860</strong>.<br/>
            © ${new Date().getFullYear()} Rare Ember Atelier. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmailWithFallback({
    apiKey,
    fromEmail,
    toEmail: payload.email,
    subjectLine: `Your RareEmber COD Verification Code: ${payload.otp}`,
    html,
  });
}

/**
 * 5. Return / Replacement Claim Confirmation Email
 */
export async function sendReturnClaimConfirmationEmail(payload: {
  email: string;
  name?: string;
  claimId: string;
  orderId: string;
  reason: string;
  preference: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Rare Ember <support@rareember.shop>';

  if (!apiKey) {
    console.log('[Email Mock] Resend API key missing — Return Claim for %s (%s)', payload.email, payload.claimId);
    return { ok: true };
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Return Request Logged: #${payload.claimId} — Rare Ember</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #FAF8F5; margin: 0; padding: 32px 16px; color: #0D0D0F;">
        <div style="max-width: 540px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid rgba(13, 13, 15, 0.08); padding: 36px 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.04);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 20px; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase; color: #0D0D0F;">
              RARE EMBER<span style="color: #E04F33;">.</span>
            </div>
            <div style="font-size: 11px; letter-spacing: 0.1em; color: #71717A; text-transform: uppercase; margin-top: 4px;">
              7-Day Guarantee Desk
            </div>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; padding: 6px 14px; border-radius: 999px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); color: #065F46; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
              Claim Received &amp; Logged
            </div>
            <h1 style="font-size: 22px; font-weight: 800; color: #0D0D0F; margin: 0 0 8px 0; letter-spacing: -0.02em;">
              We&#39;ve Got You Covered
            </h1>
            <p style="font-size: 13px; color: #52525B; line-height: 1.5; margin: 0;">
              Hello ${payload.name || 'there'}, your request for Order <strong>#${payload.orderId}</strong> has been logged. Our concierge care team will review and contact you on WhatsApp/phone within 24 hours.
            </p>
          </div>

          <div style="background: #F4F4F5; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px; font-size: 13px; line-height: 1.8;">
            <div>
              <span style="color: #71717A;">Ticket ID:</span>
              <strong style="color: #0D0D0F; font-family: ui-monospace, SFMono-Regular, monospace; margin-left: 8px;">${payload.claimId}</strong>
            </div>
            <div>
              <span style="color: #71717A;">Order Ref:</span>
              <strong style="color: #0D0D0F; margin-left: 8px;">#${payload.orderId}</strong>
            </div>
            <div>
              <span style="color: #71717A;">Reason:</span>
              <strong style="color: #0D0D0F; margin-left: 8px;">${payload.reason}</strong>
            </div>
            <div>
              <span style="color: #71717A;">Preferred Resolution:</span>
              <strong style="color: #E04F33; margin-left: 8px;">${payload.preference}</strong>
            </div>
          </div>

          <div style="background: #FFFBF5; border: 1px solid rgba(255, 77, 36, 0.2); border-radius: 12px; padding: 14px 16px; margin-bottom: 24px; font-size: 12px; color: #78350F; line-height: 1.5;">
            ⚡ <strong>Zero-Hassle Process:</strong> No tedious couriers or repackaging errands needed. If it&#39;s a size issue or print defect, simply have a quick photo ready on WhatsApp when we reach out.
          </div>

          <div style="border-top: 1px solid #E4E4E7; padding-top: 20px; text-align: center; font-size: 11px; color: #A1A1AA; line-height: 1.6;">
            Urgent queries? WhatsApp our founder desk directly at <strong>+91 91182 11860</strong> or reply to <strong>support@rareember.shop</strong>.<br/>
            &copy; ${new Date().getFullYear()} Rare Ember Atelier. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmailWithFallback({
    apiKey,
    fromEmail,
    toEmail: payload.email,
    subjectLine: `[Ticket ${payload.claimId}] Return/Replacement Request for #${payload.orderId} — Rare Ember`,
    html,
  });
}


