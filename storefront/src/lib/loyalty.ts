import { createClient } from '@supabase/supabase-js';
import { sendVoucherReminderEmail } from '@/lib/notifications/email';

export interface LoyaltyVoucher {
  id: string;
  code: string;
  customer_email: string;
  customer_name?: string | null;
  source_order_id: string;
  purchased_item_title?: string | null;
  amount_inr: number;
  min_order_value: number;
  issued_at: string;
  expires_at: string;
  is_redeemed: boolean;
  redeemed_order_id?: string | null;
  redeemed_at?: string | null;
  reminder_20d_sent_at?: string | null;
  reminder_45d_sent_at?: string | null;
  reminder_87d_sent_at?: string | null;
}

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Generates an uppercase 6-character random voucher string: RE-GIFT-XXXXXX
 */
export function generateVoucherCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RE-GIFT-${rand}`;
}

/**
 * Tiered Automatic Order Volume Discount:
 * - Subtotal >= 2000 => Flat ₹149 Instant Auto-Deduction
 * - Subtotal >= 1000 => Flat ₹69 Instant Auto-Deduction
 * - Subtotal < 1000 => ₹0
 */
export function calculateTierAutoDiscount(subtotal: number): number {
  if (subtotal >= 2000) return 149;
  if (subtotal >= 1000) return 69;
  return 0;
}

/**
 * Issues a post-delivery 60-day gift voucher upon order delivery.
 * - Total >= 2000 => ₹130 Gift Voucher (valid 60 days)
 * - Total >= 1000 => ₹70 Gift Voucher (valid 60 days)
 * - Total < 1000 => ₹50 Gift Voucher (valid 60 days)
 * - Min Order Value: ₹669
 * - Idempotent via UNIQUE(source_order_id)
 */
export async function issueOrderLoyaltyVoucher(order: {
  id: string;
  email: string;
  name?: string | null;
  total: number;
  purchasedItemTitle?: string;
}, supabaseClient?: any): Promise<{ code: string; amount: number; minOrderValue: number; expiresAt: string } | null> {
  const total = Number(order.total) || 0;
  if (total <= 0) return null;

  // Tiered Post-Delivery Voucher for 60-day repeat purchase:
  const voucherAmount = total >= 2000 ? 130 : total >= 1000 ? 70 : 50;
  const minOrderFloor = 669; // Allows redemption on any active catalog drop
  const supabase = supabaseClient || getServiceSupabase();
  if (!supabase) return null;

  try {
    // Check if voucher already exists for this order
    const { data: existing } = await supabase
      .from('loyalty_vouchers')
      .select('code, amount_inr, min_order_value, expires_at')
      .eq('source_order_id', order.id)
      .maybeSingle();

    if (existing) {
      return {
        code: existing.code,
        amount: Number(existing.amount_inr),
        minOrderValue: Number(existing.min_order_value || 669),
        expiresAt: new Date(existing.expires_at).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      };
    }

    const code = generateVoucherCode();
    const expiresDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60-day validity window

    const { data: created, error } = await supabase
      .from('loyalty_vouchers')
      .insert({
        code,
        customer_email: (order.email || '').trim().toLowerCase(),
        customer_name: order.name || 'Valued Collector',
        source_order_id: order.id,
        purchased_item_title: order.purchasedItemTitle || 'Rare Ember Architectural Garment',
        amount_inr: voucherAmount,
        min_order_value: minOrderFloor,
        issued_at: new Date().toISOString(),
        expires_at: expiresDate.toISOString(),
        is_redeemed: false,
      })
      .select('code, amount_inr, min_order_value, expires_at')
      .single();

    if (error) {
      console.warn('[Loyalty] Voucher issuance warning:', error.message);
      return null;
    }

    return {
      code: created.code,
      amount: Number(created.amount_inr),
      minOrderValue: Number(created.min_order_value),
      expiresAt: new Date(created.expires_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
  } catch (err) {
    console.error('[Loyalty] Failed to issue voucher:', err);
    return null;
  }
}

/**
 * Validates a loyalty voucher at checkout.
 * Enforces:
 * - is_redeemed = false
 * - NOW() < expires_at
 * - cart_total >= min_order_value (default ₹999)
 */
export async function verifyLoyaltyVoucher(
  code: string,
  cartTotal: number,
  supabaseClient?: any
): Promise<{ valid: boolean; discountAmount: number; code: string; error?: string }> {
  if (!code || !code.trim().toUpperCase().startsWith('RE-GIFT-')) {
    return { valid: false, discountAmount: 0, code, error: 'Invalid voucher format.' };
  }

  const supabase = supabaseClient || getServiceSupabase();
  if (!supabase) {
    return { valid: false, discountAmount: 0, code, error: 'Voucher validation service unavailable.' };
  }

  const cleanCode = code.trim().toUpperCase();

  try {
    const { data: voucher, error } = await supabase
      .from('loyalty_vouchers')
      .select('*')
      .eq('code', cleanCode)
      .maybeSingle();

    if (error || !voucher) {
      return { valid: false, discountAmount: 0, code: cleanCode, error: 'Gift voucher code not found.' };
    }

    if (voucher.is_redeemed) {
      return { valid: false, discountAmount: 0, code: cleanCode, error: 'This gift voucher has already been redeemed.' };
    }

    const expiresAt = new Date(voucher.expires_at).getTime();
    if (Date.now() > expiresAt) {
      return { valid: false, discountAmount: 0, code: cleanCode, error: 'This gift voucher has expired.' };
    }

    const minReq = Number(voucher.min_order_value || 669);
    if (cartTotal < minReq) {
      return {
        valid: false,
        discountAmount: 0,
        code: cleanCode,
        error: `Gift voucher requires a minimum order value of ₹${minReq}. Current cart: ₹${cartTotal}.`,
      };
    }

    return {
      valid: true,
      discountAmount: Number(voucher.amount_inr),
      code: cleanCode,
    };
  } catch (err) {
    console.error('[Loyalty] verifyLoyaltyVoucher error:', err);
    return { valid: false, discountAmount: 0, code: cleanCode, error: 'Error validating gift voucher.' };
  }
}

/**
 * Redeems the voucher upon successful checkout.
 */
export async function redeemLoyaltyVoucher(
  code: string,
  orderId: string,
  supabaseClient?: any
): Promise<boolean> {
  const cleanCode = code.trim().toUpperCase();
  const supabase = supabaseClient || getServiceSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('loyalty_vouchers')
      .update({
        is_redeemed: true,
        redeemed_order_id: orderId,
        redeemed_at: new Date().toISOString(),
      })
      .eq('code', cleanCode);

    if (error) {
      console.error('[Loyalty] Failed to redeem voucher:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Loyalty] redeemLoyaltyVoucher exception:', err);
    return false;
  }
}

/**
 * Daily cron worker to send 3-stage retention emails:
 * - Day 20: Wardrobe Check-In
 * - Day 45: Mid-Validity Reminder
 * - Day 87 (3 days before expiry): 72-Hour Warning
 *
 * Stops immediately once is_redeemed = true.
 */
export async function processVoucherReminders(supabaseClient?: any): Promise<{
  processed: number;
  stage20Sent: number;
  stage45Sent: number;
  stage87Sent: number;
}> {
  const supabase = supabaseClient || getServiceSupabase();
  if (!supabase) return { processed: 0, stage20Sent: 0, stage45Sent: 0, stage87Sent: 0 };

  const now = Date.now();
  const { data: vouchers, error } = await supabase
    .from('loyalty_vouchers')
    .select('*')
    .eq('is_redeemed', false)
    .gt('expires_at', new Date(now).toISOString());

  if (error || !Array.isArray(vouchers)) {
    console.warn('[Loyalty Cron] Failed to fetch active vouchers:', error?.message);
    return { processed: 0, stage20Sent: 0, stage45Sent: 0, stage87Sent: 0 };
  }

  let stage20Sent = 0;
  let stage45Sent = 0;
  let stage87Sent = 0;

  for (const v of vouchers) {
    const issuedAt = new Date(v.issued_at).getTime();
    const expiresAt = new Date(v.expires_at).getTime();
    const daysSinceIssued = (now - issuedAt) / (1000 * 60 * 60 * 24);
    const msUntilExpiry = expiresAt - now;
    const daysUntilExpiry = msUntilExpiry / (1000 * 60 * 60 * 24);

    const formattedExpiry = new Date(v.expires_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    // Stage 3: 72-Hour Final Expiry Alert (Day 57 of 60 / <= 3 days remaining)
    if (daysUntilExpiry <= 3 && !v.reminder_87d_sent_at) {
      const sent = await sendVoucherReminderEmail({
        stage: 'day87',
        customerEmail: v.customer_email,
        customerName: v.customer_name || 'Valued Collector',
        voucherCode: v.code,
        amount: Number(v.amount_inr),
        expiresAt: formattedExpiry,
        purchasedItemTitle: v.purchased_item_title || 'Rare Ember Drop',
      });
      if (sent.ok) {
        await supabase
          .from('loyalty_vouchers')
          .update({ reminder_87d_sent_at: new Date().toISOString() })
          .eq('id', v.id);
        stage87Sent++;
      }
      continue;
    }

    // Stage 2: Mid-Validity Reminder (Day 35 of 60)
    if (daysSinceIssued >= 35 && !v.reminder_45d_sent_at) {
      const sent = await sendVoucherReminderEmail({
        stage: 'day45',
        customerEmail: v.customer_email,
        customerName: v.customer_name || 'Valued Collector',
        voucherCode: v.code,
        amount: Number(v.amount_inr),
        expiresAt: formattedExpiry,
        purchasedItemTitle: v.purchased_item_title || 'Rare Ember Drop',
      });
      if (sent.ok) {
        await supabase
          .from('loyalty_vouchers')
          .update({ reminder_45d_sent_at: new Date().toISOString() })
          .eq('id', v.id);
        stage45Sent++;
      }
      continue;
    }

    // Stage 1: Wardrobe Check-In & Activation (Day 15 of 60)
    if (daysSinceIssued >= 15 && !v.reminder_20d_sent_at) {
      const sent = await sendVoucherReminderEmail({
        stage: 'day20',
        customerEmail: v.customer_email,
        customerName: v.customer_name || 'Valued Collector',
        voucherCode: v.code,
        amount: Number(v.amount_inr),
        expiresAt: formattedExpiry,
        purchasedItemTitle: v.purchased_item_title || 'Rare Ember Drop',
      });
      if (sent.ok) {
        await supabase
          .from('loyalty_vouchers')
          .update({ reminder_20d_sent_at: new Date().toISOString() })
          .eq('id', v.id);
        stage20Sent++;
      }
    }
  }

  return {
    processed: vouchers.length,
    stage20Sent,
    stage45Sent,
    stage87Sent,
  };
}


/**
 * Checks whether a catalog item or cart item is an eligible 240 GSM Structured Cotton Tee / Jersey.
 */
export function isEligible240Tee(item: { id?: string; title?: string; price?: number; price_inr?: number }): boolean {
  const id = (item.id || '').toLowerCase();
  const title = (item.title || '').toLowerCase();
  const p = Number(item.price_inr || item.price || 0);
  if (p === 669 || p === 799) return true;
  if (id.includes('32476431') || id.includes('32476280') || id.includes('32476332') || id.includes('32476629')) return true;
  if (/240 gsm|standard-t-shirt|classic-t-shirt|oversized-shirt|oversized-jersey/i.test(`${title} ${id}`)) return true;
  return false;
}

/**
 * Calculates multi-piece savings for 240 GSM Tees if applicable.
 */
export function calculateTeeBundleSavings(
  items: Array<{ id: string; qty?: number; title?: string; price?: number; price_inr?: number }>
): number {
  let eligibleQty = 0;
  for (const it of items) {
    if (isEligible240Tee(it)) {
      eligibleQty += (it.qty || 1);
    }
  }
  return Math.floor(eligibleQty / 2) * 99;
}
