import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateSignedStoreCredit,
  verifyStoreCreditCode,
  redeemStoreCredit,
  parseStoreCreditCode,
  computeStoreCreditHmac,
} from '@/lib/store-credit';
import { validateCouponCode } from '@/lib/festivals';

describe('Store Credit Cryptographic Security & Anti-Fraud Suite', () => {
  const originalSecret = process.env.RAZORPAY_KEY_SECRET;
  const testSecret = 'test_razorpay_secret_key_2026';
  const testOrderId = '4f83b123-9c84-4821-b384-934fa7912a4b';
  const testAmount = 769;

  beforeEach(() => {
    process.env.RAZORPAY_KEY_SECRET = testSecret;
  });

  afterEach(() => {
    process.env.RAZORPAY_KEY_SECRET = originalSecret;
  });

  it('generates an HMAC-SHA256 signature bound strictly to orderId and amount', () => {
    const code = generateSignedStoreCredit(testOrderId, testAmount, testSecret);
    expect(code).toBe(`CREDIT-769-2A4B-${computeStoreCreditHmac(testOrderId, testAmount, testSecret)}`);

    const parsed = parseStoreCreditCode(code);
    expect(parsed).toEqual({
      amount: 769,
      orderSuffix: '2A4B',
      sig: computeStoreCreditHmac(testOrderId, testAmount, testSecret),
    });
  });

  it('rejects tampered voucher when amount is altered from CREDIT-769 to CREDIT-5000', async () => {
    const legitimateCode = generateSignedStoreCredit(testOrderId, testAmount, testSecret);
    const parsed = parseStoreCreditCode(legitimateCode)!;

    // Attacker modifies amount to 5000 while retaining original HMAC signature
    const tamperedCode = `CREDIT-5000-${parsed.orderSuffix}-${parsed.sig}`;

    const mockDb = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                claim_id: 'RE-CLM-991',
                order_id: testOrderId,
                voucher_code: tamperedCode,
                status: 'credit_released',
                credit_amount: 5000,
                is_redeemed: false,
              },
              error: null,
            }),
          }),
          ilike: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    };

    const result = await verifyStoreCreditCode(tamperedCode, mockDb);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid or tampered store credit voucher signature.');
  });

  it('rejects tampered voucher when order suffix is altered', async () => {
    const legitimateCode = generateSignedStoreCredit(testOrderId, testAmount, testSecret);
    const parsed = parseStoreCreditCode(legitimateCode)!;

    // Attacker modifies order suffix
    const tamperedCode = `CREDIT-769-9999-${parsed.sig}`;

    const mockDb = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                claim_id: 'RE-CLM-991',
                order_id: testOrderId, // Ends in 2A4B, but code has 9999
                voucher_code: tamperedCode,
                status: 'credit_released',
                credit_amount: 769,
                is_redeemed: false,
              },
              error: null,
            }),
          }),
          ilike: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    };

    const result = await verifyStoreCreditCode(tamperedCode, mockDb);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('order binding mismatch');
  });

  it('rejects voucher if status is pending_pickup with exact required error message', async () => {
    const validCode = generateSignedStoreCredit(testOrderId, testAmount, testSecret);

    const mockDb = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                claim_id: 'RE-CLM-778',
                order_id: testOrderId,
                voucher_code: validCode,
                status: 'pending_pickup',
                credit_amount: testAmount,
                is_redeemed: false,
              },
              error: null,
            }),
          }),
          ilike: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    };

    const result = await verifyStoreCreditCode(validCode, mockDb);
    expect(result.valid).toBe(false);
    expect(result.status).toBe('pending_pickup');
    expect(result.error).toBe(
      'This store credit voucher is reserved and will activate automatically once your return pickup is scanned.'
    );
  });

  it('rejects voucher if already redeemed (is_redeemed === true)', async () => {
    const validCode = generateSignedStoreCredit(testOrderId, testAmount, testSecret);

    const mockDb = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                claim_id: 'RE-CLM-778',
                order_id: testOrderId,
                voucher_code: validCode,
                status: 'credit_released',
                credit_amount: testAmount,
                is_redeemed: true,
                redeemed_order_id: 'order_12345',
              },
              error: null,
            }),
          }),
          ilike: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    };

    const result = await verifyStoreCreditCode(validCode, mockDb);
    expect(result.valid).toBe(false);
    expect(result.isRedeemed).toBe(true);
    expect(result.error).toBe('This store credit voucher has already been used.');
  });

  it('rejects voucher if record does not exist in Supabase', async () => {
    const validCode = generateSignedStoreCredit(testOrderId, testAmount, testSecret);

    const mockDb = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
          ilike: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    };

    const result = await verifyStoreCreditCode(validCode, mockDb);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Store credit voucher not found or invalid.');
  });

  it('atomically redeems store credit voucher and prevents subsequent double-spend', async () => {
    const validCode = generateSignedStoreCredit(testOrderId, testAmount, testSecret);

    const dbRecord = {
      claim_id: 'RE-CLM-200',
      order_id: testOrderId,
      voucher_code: validCode,
      status: 'credit_released',
      credit_amount: testAmount,
      is_redeemed: false,
      redeemed_order_id: null as string | null,
    };

    const mockDb = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: dbRecord, error: null }),
          }),
          ilike: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
        update: (updates: any) => ({
          eq: (col: string, val: any) => {
            if (col === 'voucher_code' && val === validCode) {
              Object.assign(dbRecord, updates);
            }
            return Promise.resolve({ error: null });
          },
        }),
      }),
    };

    // First checkout redemption: must succeed
    const firstVerify = await verifyStoreCreditCode(validCode, mockDb);
    expect(firstVerify.valid).toBe(true);

    const redeem = await redeemStoreCredit(validCode, 'new_order_abc_1', mockDb);
    expect(redeem.success).toBe(true);
    expect(dbRecord.is_redeemed).toBe(true);
    expect(dbRecord.redeemed_order_id).toBe('new_order_abc_1');

    // Second checkout attempt (attempting "2 shirts for 1 price"): must fail with 400 error message
    const secondVerify = await verifyStoreCreditCode(validCode, mockDb);
    expect(secondVerify.valid).toBe(false);
    expect(secondVerify.isRedeemed).toBe(true);
    expect(secondVerify.error).toBe('This store credit voucher has already been used.');
  });

  it('validates signed vouchers through festivals client validator for UI display', () => {
    const signedVoucher = generateSignedStoreCredit('6c7e6415', 770);
    const res = validateCouponCode(signedVoucher, 1000);
    expect(res.valid).toBe(true);
    expect(res.discountAmount).toBe(770);
    expect(res.label).toContain('Store Credit');
  });
});
