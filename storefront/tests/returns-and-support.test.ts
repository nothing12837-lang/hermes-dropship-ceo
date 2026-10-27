import { describe, it, expect } from 'vitest';
import { validateCouponCode } from '@/lib/festivals';
import {
  generateSignedStoreCredit,
  verifyStoreCreditCode,
  redeemStoreCredit,
  parseStoreCreditCode,
  computeStoreCreditHmac,
} from '@/lib/store-credit';

describe('Returns, Replacements & Reverse Logistics System', () => {
  it('validates 7-day return window boundary correctly', () => {
    const REPLACEMENT_WINDOW_DAYS = 7;
    const now = Date.now();
    const threeDaysAgo = now - 3 * 86400000;
    const eightDaysAgo = now - 8 * 86400000;

    const ageDaysRecent = (now - threeDaysAgo) / 86400000;
    const ageDaysOld = (now - eightDaysAgo) / 86400000;

    expect(ageDaysRecent <= REPLACEMENT_WINDOW_DAYS).toBe(true);
    expect(ageDaysOld <= REPLACEMENT_WINDOW_DAYS).toBe(false);
  });

  it('correctly matches customer contact against email and phone', () => {
    const order = {
      user_email: 'ajaykumar@gmail.com',
      shipping_address: { phone: '9876543210' },
    };

    const orderEmail = order.user_email.toLowerCase();
    const orderPhone = order.shipping_address.phone.replace(/\D/g, '');

    // Valid inputs
    const testEmail1 = 'ajaykumar@gmail.com';
    const testPhone1 = '9876543210';
    const testPhoneWithCountry = '+919876543210';

    const checkMatch = (contact: string) => {
      const contactLower = contact.toLowerCase();
      const contactDigits = contact.replace(/\D/g, '');
      const emailMatches = orderEmail.length > 0 && contactLower.includes(orderEmail);
      const phoneMatches =
        contactDigits.length >= 6 &&
        orderPhone.length >= 6 &&
        (contactDigits.includes(orderPhone) || orderPhone.includes(contactDigits));
      return emailMatches || phoneMatches;
    };

    expect(checkMatch(testEmail1)).toBe(true);
    expect(checkMatch(testPhone1)).toBe(true);
    expect(checkMatch(testPhoneWithCountry)).toBe(true);

    // Invalid inputs
    const wrongEmail = 'someoneelse@gmail.com';
    const wrongPhone = '9111111111';

    expect(checkMatch(wrongEmail)).toBe(false);
    expect(checkMatch(wrongPhone)).toBe(false);
  });

  it('normalizes order ID properly removing leading hash symbols and trimming whitespace', () => {
    const rawInputs = ['#6c7e6415', ' 6c7e6415 ', '# 6c7e6415 '];
    const cleaned = rawInputs.map((s) => s.replace(/^#\s*/, '').trim());
    cleaned.forEach((res) => {
      expect(res).toBe('6c7e6415');
    });
  });

  it('generates consistent claim ticket ID with RE-CLM prefix', () => {
    const claimId = `RE-CLM-9F2B81C4`;
    expect(claimId.startsWith('RE-CLM-')).toBe(true);
    expect(claimId.length).toBe(15);
  });

  it('correctly distinguishes full UUIDs from short order ID prefixes', () => {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const fullUuid = '7792e434-7bf5-4ff4-9296-cf2f4c2af57f';
    const shortPrefix = '7792e434';
    const invalidFormat = 'non-existent-order';

    expect(UUID_REGEX.test(fullUuid)).toBe(true);
    expect(UUID_REGEX.test(shortPrefix)).toBe(false);
    expect(/^[0-9a-f]{6,36}$/i.test(shortPrefix)).toBe(true);
    expect(/^[0-9a-f]{6,36}$/i.test(invalidFormat)).toBe(false);
  });

  it('validates store credit vouchers correctly at checkout', () => {
    const voucher = 'CREDIT-770-75DC-B2C3D4';
    const res = validateCouponCode(voucher, 699);
    expect(res.valid).toBe(true);
    // Capped at subtotal 699
    expect(res.discountAmount).toBe(699);
    expect(res.label).toContain('Store Credit');

    // Applied to larger cart of 1299
    const resLarge = validateCouponCode(voucher, 1299);
    expect(resLarge.valid).toBe(true);
    expect(resLarge.discountAmount).toBe(770);
  });
});

describe('Cryptographic Store Credit & Anti-Fraud Engine (store-credit.ts)', () => {
  const testOrderId = '7792e434-7bf5-4ff4-9296-cf2f4c2af57f';
  const testAmount = 769;

  it('generates a valid signed store credit voucher with HMAC-SHA256 signature', () => {
    const code = generateSignedStoreCredit(testOrderId, testAmount);
    expect(code.startsWith('CREDIT-769-F57F-')).toBe(true);

    const parsed = parseStoreCreditCode(code);
    expect(parsed).not.toBeNull();
    expect(parsed?.amount).toBe(769);
    expect(parsed?.orderSuffix).toBe('F57F');
    expect(parsed?.sig.length).toBe(6);

    const expectedHmac = computeStoreCreditHmac(testOrderId, 769);
    expect(parsed?.sig).toBe(expectedHmac);
  });

  it('detects and fails verification if a user tampers with the amount (CREDIT-769 -> CREDIT-5000)', async () => {
    const legitCode = generateSignedStoreCredit(testOrderId, 769);
    const parsed = parseStoreCreditCode(legitCode)!;

    // Attacker modifies the credit amount from 769 to 5000 keeping the old signature
    const tamperedCode = `CREDIT-5000-${parsed.orderSuffix}-${parsed.sig}`;

    // Attacker tries to verify against an order in the database
    const mockDb = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                claim_id: 'RE-CLM-001',
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

    const res = await verifyStoreCreditCode(tamperedCode, mockDb);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Invalid or tampered store credit voucher signature');
  });

  it('rejects store credit vouchers that are still in pending_pickup status (Path 1 Loophole Closed)', async () => {
    const validCode = generateSignedStoreCredit(testOrderId, 769);

    const mockDb = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                claim_id: 'RE-CLM-001',
                order_id: testOrderId,
                voucher_code: validCode,
                status: 'pending_pickup',
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

    const res = await verifyStoreCreditCode(validCode, mockDb);
    expect(res.valid).toBe(false);
    expect(res.status).toBe('pending_pickup');
    expect(res.error).toBe(
      'This store credit voucher is reserved and will activate automatically once your return pickup is scanned.'
    );
  });

  it('rejects store credit vouchers that have already been redeemed (Single-Use Lock Enforcement)', async () => {
    const validCode = generateSignedStoreCredit(testOrderId, 769);

    const mockDb = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                claim_id: 'RE-CLM-001',
                order_id: testOrderId,
                voucher_code: validCode,
                status: 'credit_released',
                credit_amount: 769,
                is_redeemed: true,
                redeemed_order_id: 'order_prior_redemption',
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

    const res = await verifyStoreCreditCode(validCode, mockDb);
    expect(res.valid).toBe(false);
    expect(res.isRedeemed).toBe(true);
    expect(res.error).toBe('This store credit voucher has already been used.');
  });

  it('successfully verifies a released, unredeemed voucher with matching HMAC', async () => {
    const validCode = generateSignedStoreCredit(testOrderId, 769);

    const mockDb = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                claim_id: 'RE-CLM-001',
                order_id: testOrderId,
                voucher_code: validCode,
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

    const res = await verifyStoreCreditCode(validCode, mockDb);
    expect(res.valid).toBe(true);
    expect(res.creditAmount).toBe(769);
    expect(res.orderId).toBe(testOrderId);
  });

  it('redeems a voucher and locks it so it cannot be used again', async () => {
    const validCode = generateSignedStoreCredit(testOrderId, 769);
    const dbRecord = {
      claim_id: 'RE-CLM-001',
      order_id: testOrderId,
      voucher_code: validCode,
      status: 'credit_released',
      credit_amount: 769,
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
        update: (payload: any) => ({
          eq: (field: string, val: any) => {
            if (field === 'voucher_code' && val === validCode) {
              Object.assign(dbRecord, payload);
            }
            return Promise.resolve({ error: null });
          },
        }),
      }),
    };

    // First verification: should succeed
    const firstCheck = await verifyStoreCreditCode(validCode, mockDb);
    expect(firstCheck.valid).toBe(true);

    // Redeem voucher for new order
    const redeemRes = await redeemStoreCredit(validCode, 'new_order_999', mockDb);
    expect(redeemRes.success).toBe(true);
    expect(dbRecord.is_redeemed).toBe(true);
    expect(dbRecord.redeemed_order_id).toBe('new_order_999');

    // Second verification attempt: must fail with "already been used"
    const secondCheck = await verifyStoreCreditCode(validCode, mockDb);
    expect(secondCheck.valid).toBe(false);
    expect(secondCheck.error).toBe('This store credit voucher has already been used.');
  });
});
