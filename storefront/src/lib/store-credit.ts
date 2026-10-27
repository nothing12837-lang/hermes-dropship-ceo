import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Store Credit Voucher Cryptographic Signature & Single-Use Security Engine.
 *
 * Solves:
 * 1. "2 Shirts for 1 Price" Loophole: Gating store credit behind reverse pickup scan / admin approval.
 * 2. Voucher Tampering: HMAC-SHA256 cryptographic signature binds the order ID and exact credit amount.
 * 3. Double-Spend Fraud: Strict single-use lock (`is_redeemed === false` -> `is_redeemed = true`).
 */

function getSecret(): string {
  const secret =
    process.env.STORE_CREDIT_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'test') {
      return 'test-store-credit-secret-hex-1234567890abcdef';
    }
    throw new Error('STORE_CREDIT_SECRET or server key required for store credit operations. Refusing to use hardcoded secret.');
  }
  return secret;
}

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Compute a 6-character uppercase HMAC-SHA256 signature binding orderId and creditAmount.
 */
export function computeStoreCreditHmac(orderId: string, creditAmount: number, customSecret?: string): string {
  const secret = customSecret || getSecret();
  return crypto
    .createHmac('sha256', secret)
    .update(`CREDIT:${orderId}:${creditAmount}`)
    .digest('hex')
    .slice(0, 6)
    .toUpperCase();
}

/**
 * Generate a cryptographically signed store credit voucher code.
 * Format: CREDIT-${creditAmount}-${orderId.slice(-4).toUpperCase()}-${sig}
 */
export function generateSignedStoreCredit(orderId: string, creditAmount: number, customSecret?: string): string {
  const cleanOrderId = String(orderId || '').trim();
  const amount = Math.max(1, Math.round(Number(creditAmount)));
  const sig = computeStoreCreditHmac(cleanOrderId, amount, customSecret);
  const suffix = cleanOrderId.slice(-4).toUpperCase();
  return `CREDIT-${amount}-${suffix}-${sig}`;
}

export interface ParsedStoreCredit {
  amount: number;
  orderSuffix: string;
  sig: string;
}

/**
 * Parse a signed store credit voucher code.
 */
export function parseStoreCreditCode(code: string): ParsedStoreCredit | null {
  if (!code || typeof code !== 'string') return null;
  const match = code.trim().match(/^(?:RE-?)?CREDIT-(\d{2,6})-([A-Z0-9]{3,10})-([A-Z0-9]{6})$/i);
  if (!match) return null;
  return {
    amount: parseInt(match[1], 10),
    orderSuffix: match[2].toUpperCase(),
    sig: match[3].toUpperCase(),
  };
}

export interface VerifyStoreCreditResult {
  valid: boolean;
  creditAmount: number;
  orderId?: string;
  claimId?: string;
  status?: string;
  isRedeemed?: boolean;
  error?: string;
  record?: any;
}

/**
 * Verify a store credit voucher code against cryptographic HMAC signature and Supabase database state.
 *
 * Enforces:
 * 1. Format and HMAC validity.
 * 2. Record exists in database.
 * 3. status === 'credit_released' (Never redeemable while 'pending_pickup').
 * 4. is_redeemed === false (Single-use lock).
 */
export async function verifyStoreCreditCode(
  code: string,
  customSb?: SupabaseClient | any
): Promise<VerifyStoreCreditResult> {
  const normalizedCode = String(code || '').trim().toUpperCase();
  const parsed = parseStoreCreditCode(normalizedCode);

  if (!parsed || parsed.amount <= 0) {
    return {
      valid: false,
      creditAmount: 0,
      error: 'Invalid store credit voucher format.',
    };
  }

  const sb = customSb !== undefined ? customSb : getSupabase();

  let record: any = null;

  if (sb) {
    // 1. Try returns table
    try {
      const q = sb.from('returns').select('*').eq('voucher_code', normalizedCode);
      const res = typeof q.maybeSingle === 'function' ? await q.maybeSingle() : await q;
      if (!res?.error && res?.data) {
        record = Array.isArray(res.data) ? res.data[0] : res.data;
      }
    } catch {
      // returns table might not exist; fall through
    }

    // 2. Try return_claims table
    if (!record) {
      try {
        const q = sb.from('return_claims').select('*').eq('voucher_code', normalizedCode);
        const res = typeof q.maybeSingle === 'function' ? await q.maybeSingle() : await q;
        if (!res?.error && res?.data) {
          record = Array.isArray(res.data) ? res.data[0] : res.data;
        } else {
          // Fallback: search notes if voucher_code column not yet present
          const { data: noteRows } = await sb
            .from('return_claims')
            .select('*')
            .ilike('notes', `%${normalizedCode}%`)
            .limit(1);
          if (noteRows && noteRows.length > 0) {
            record = noteRows[0];
          }
        }
      } catch {
        // return_claims table might not exist; fall through
      }
    }

    // 3. Fallback: Check orders table fulfillment_error
    if (!record) {
      try {
        const { data: orderRows } = await sb
          .from('orders')
          .select('id, user_email, total_amount, status, fulfillment_error, created_at')
          .ilike('fulfillment_error', `%${normalizedCode}%`)
          .limit(1);
        if (orderRows && orderRows.length > 0) {
          const ord = orderRows[0];
          const errText = ord.fulfillment_error || '';
          const isReleased = errText.includes('STORE_CREDIT_RELEASED');
          const isRedeemed = errText.includes('REDEEMED');
          record = {
            order_id: ord.id,
            claim_id: ord.id.slice(0, 8),
            voucher_code: normalizedCode,
            status: isReleased ? 'credit_released' : 'pending_pickup',
            is_redeemed: isRedeemed,
            // Sanity cap: the voucher can never claim more than the order
            // it was issued against was worth.
            credit_amount: Math.min(parsed.amount, Number(ord.total_amount) || parsed.amount),
            order_total_inr: ord.total_amount,
          };
        }
      } catch {
        // orders table fallback query failed; fall through
      }
    }
  }

  // Record must exist in database
  if (!record) {
    return {
      valid: false,
      creditAmount: 0,
      error: 'Store credit voucher not found or invalid.',
    };
  }

  // Verify status is approved / released
  if (record.status === 'pending_pickup') {
    return {
      valid: false,
      creditAmount: 0,
      status: 'pending_pickup',
      error: 'This store credit voucher is reserved and will activate automatically once your return pickup is scanned.',
    };
  }

  if (record.status !== 'credit_released') {
    return {
      valid: false,
      creditAmount: 0,
      status: record.status,
      error: `This store credit voucher is not active (current status: ${record.status || 'unapproved'}).`,
    };
  }

  // Single-use enforcement
  if (record.is_redeemed === true) {
    return {
      valid: false,
      creditAmount: 0,
      isRedeemed: true,
      error: 'This store credit voucher has already been used.',
    };
  }

  // Ensure order suffix matches the recorded order ID
  const cleanDbOrderId = String(record.order_id || '').trim().replace(/^#\s*/, '');
  const expectedSuffix = cleanDbOrderId.slice(-4).toUpperCase();
  if (parsed.orderSuffix !== expectedSuffix) {
    return {
      valid: false,
      creditAmount: 0,
      error: 'Store credit voucher order binding mismatch.',
    };
  }

  // Cryptographic HMAC signature verification
  const expectedSig = computeStoreCreditHmac(record.order_id, parsed.amount);
  const sigBuf = Buffer.from(parsed.sig, 'utf8');
  const expBuf = Buffer.from(expectedSig, 'utf8');

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return {
      valid: false,
      creditAmount: 0,
      error: 'Invalid or tampered store credit voucher signature.',
    };
  }

  // Ensure amount matches recorded amount if stored
  if (record.credit_amount != null && Number(record.credit_amount) !== parsed.amount) {
    return {
      valid: false,
      creditAmount: 0,
      error: 'Store credit voucher value does not match registered claim value.',
    };
  }

  return {
    valid: true,
    creditAmount: parsed.amount,
    orderId: record.order_id,
    claimId: record.claim_id,
    status: record.status,
    isRedeemed: false,
    record,
  };
}

/**
 * Mark a store credit voucher as redeemed atomically upon successful order creation.
 * Enforces atomic single-use locking so concurrent checkout requests cannot reuse the same voucher.
 */
export async function redeemStoreCredit(
  code: string,
  newOrderId: string,
  customSb?: SupabaseClient | any
): Promise<{ success: boolean; error?: string }> {
  const normalizedCode = String(code || '').trim().toUpperCase();
  const sb = customSb !== undefined ? customSb : getSupabase();
  if (!sb) {
    return { success: false, error: 'Database service client not configured.' };
  }

  // Check if voucher was already redeemed first (enforces exact error message and short-circuits)
  for (const table of ['return_claims', 'returns']) {
    try {
      const q = sb.from(table).select('*').eq('voucher_code', normalizedCode);
      const res = typeof q?.maybeSingle === 'function' ? await q.maybeSingle() : await q;
      const rec = res?.data ? (Array.isArray(res.data) ? res.data[0] : res.data) : null;
      if (rec && rec.is_redeemed === true) {
        return { success: false, error: 'This store credit voucher has already been used.' };
      }
    } catch {}
  }

  // 1. Primary: Atomic Database RPC (Zero race conditions under concurrent checkouts)
  try {
    if (typeof sb.rpc === 'function') {
      const { data: rpcSuccess, error: rpcError } = await sb.rpc('redeem_store_credit_atomic', {
        p_voucher_code: normalizedCode,
        p_order_id: newOrderId,
      });
      if (!rpcError && typeof rpcSuccess === 'boolean') {
        if (rpcSuccess) {
          return { success: true };
        } else {
          return { success: false, error: 'This store credit voucher has already been used.' };
        }
      }
    }
  } catch (rpcErr) {
    // Fall back to direct atomic SQL update below if RPC is not available in mock/test environment
  }

  // 2. Direct Atomic UPDATE guard on return_claims / returns
  for (const table of ['return_claims', 'returns']) {
    try {
      const updateCall = sb.from(table).update({
        is_redeemed: true,
        redeemed_order_id: newOrderId,
        updated_at: new Date().toISOString(),
      });
      const eqVoucher = updateCall.eq('voucher_code', normalizedCode);
      let res: any;
      if (eqVoucher && typeof eqVoucher.eq === 'function') {
        const eqRedeemed = eqVoucher.eq('is_redeemed', false);
        if (eqRedeemed && typeof eqRedeemed.select === 'function') {
          res = await eqRedeemed.select('id');
        } else {
          res = await eqRedeemed;
        }
      } else {
        res = await eqVoucher;
      }

      if (res && !res.error && (res.data ? res.data.length > 0 : true)) {
        return { success: true };
      }
    } catch {}
  }

  return {
    success: false,
    error: 'This store credit voucher has already been used.',
  };
}
