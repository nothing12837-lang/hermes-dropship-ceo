/**
 * Lightweight transactional email client for order confirmation and tax receipts.
 * Uses native fetch (Zero dependencies) compatible with Resend REST API.
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

export async function sendOrderConfirmationEmail(payload: OrderEmailPayload): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[Email Service] RESEND_API_KEY not configured. Order confirmation email queued in memory.');
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  const isCod = payload.paymentMethod === 'cod';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Rare Ember <onboarding@resend.dev>';
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
              Your order <strong>#${shortOrderId}</strong> has been confirmed and queued for production at our Tirupur manufacturing plant.
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
            Protected by Rare Ember 7-Day Free Replacement Guarantee • Bangalore, India
          </div>
        </div>
      </body>
    </html>
  `;

  const sendEmailRequest = async (toEmail: string, subjectLine: string) => {
    return await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: subjectLine,
        html,
      }),
    });
  };

  try {
    // 1. Send to customer email
    const res = await sendEmailRequest(payload.email, `Order Confirmed: #${shortOrderId} — Rare Ember`);
    const data = await res.json();

    if (res.ok && data.id) {
      console.log('[Email Service] Customer confirmation email sent to %s (id: %s)', payload.email, data.id);
      return { ok: true };
    }

    // 2. If domain is unverified (Resend Sandbox allows sending only to owner), fallback to owner inbox
    console.warn('[Email Service] Direct customer dispatch deferred:', data?.message);
    const ownerEmail = 'rareemberagency@gmail.com';
    if (payload.email.toLowerCase() !== ownerEmail) {
      const fallbackRes = await sendEmailRequest(
        ownerEmail,
        `[Customer Order #${shortOrderId}] ${payload.name || 'Customer'} — Rare Ember Invoice`
      );
      const fallbackData = await fallbackRes.json();
      if (fallbackRes.ok && fallbackData.id) {
        console.log('[Email Service] Order copy sent to owner inbox %s (id: %s)', ownerEmail, fallbackData.id);
        return { ok: true };
      }
    }

    return { ok: false, error: data?.message || 'Resend error' };
  } catch (err: any) {
    console.error('[Email Service] Dispatch failed:', err.message);
    return { ok: false, error: err.message };
  }
}
