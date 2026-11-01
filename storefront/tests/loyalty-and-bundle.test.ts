import { describe, it, expect } from 'vitest';
import { generateVoucherCode, isEligible240Tee, calculateTeeBundleSavings } from '@/lib/loyalty';
import { validateCouponCode } from '@/lib/festivals';

describe('Loyalty Voucher & 240 GSM Bundle Engine', () => {
  it('generates random uppercase 6-character RE-GIFT-XXXXXX codes', () => {
    const code = generateVoucherCode();
    expect(code).toMatch(/^RE-GIFT-[A-Z0-9]{6}$/);
    expect(code.length).toBe(14);
  });

  it('correctly identifies eligible 240 GSM Structured Cotton tees and jerseys', () => {
    expect(isEligible240Tee({ price_inr: 799, title: 'Unisex Oversized Standard T-Shirt — Chrome Bengaluru Cyber Drop' })).toBe(true);
    expect(isEligible240Tee({ id: '32476280', title: 'Unisex Oversized Jersey' })).toBe(true);
    expect(isEligible240Tee({ id: '32476332', title: 'Tokyo Street Graphic' })).toBe(true);
    expect(isEligible240Tee({ id: '32476629', title: 'Flame Embroidered Icon' })).toBe(true);

    // Non-tees should return false
    expect(isEligible240Tee({ id: '32493953', price_inr: 1699, title: 'Acid Washed Hoodie' })).toBe(false);
    expect(isEligible240Tee({ id: 'desk-mat-01', price_inr: 699, title: 'Gaming Desk Mat' })).toBe(false);
  });

  it('calculates Buy Any 2 240 GSM bundle savings correctly (₹99 per pair)', () => {
    // 1 tee: no savings
    expect(calculateTeeBundleSavings([{ id: '32476431', qty: 1, price_inr: 799 }])).toBe(0);

    // 2 tees: ₹99 bundle savings (combines with ₹100 UPI discount => ₹1,399 net)
    expect(calculateTeeBundleSavings([
      { id: '32476431', qty: 1, price_inr: 799 },
      { id: '32476332', qty: 1, price_inr: 799 },
    ])).toBe(99);

    // 3 tees: ₹99 bundle savings
    expect(calculateTeeBundleSavings([
      { id: '32476431', qty: 2, price_inr: 799 },
      { id: '32476332', qty: 1, price_inr: 799 },
    ])).toBe(99);

    // 4 tees: 2 pairs = ₹198 bundle savings
    expect(calculateTeeBundleSavings([
      { id: '32476431', qty: 2, price_inr: 799 },
      { id: '32476332', qty: 2, price_inr: 799 },
    ])).toBe(198);
  });

  it('validates ARCHIVE100 tiered VIP discount on orders of ₹2,000+', () => {
    const invalidBelow2k = validateCouponCode('ARCHIVE100', 1899);
    expect(invalidBelow2k.valid).toBe(false);
    expect(invalidBelow2k.error).toContain('minimum order of ₹2000');

    const validAbove2k = validateCouponCode('ARCHIVE100', 2199);
    expect(validAbove2k.valid).toBe(true);
    expect(validAbove2k.discountAmount).toBe(100);
  });

  it('validates RE-GIFT- voucher format and enforces ₹799 minimum order value', () => {
    const tooLow = validateCouponCode('RE-GIFT-ABC123', 699);
    expect(tooLow.valid).toBe(false);
    expect(tooLow.error).toContain('minimum order value of ₹799');

    const validAtMin = validateCouponCode('RE-GIFT-ABC123', 799);
    expect(validAtMin.valid).toBe(true);
    expect(validAtMin.discountAmount).toBe(50);

    const validAboveMin = validateCouponCode('RE-GIFT-ABC123', 1399);
    expect(validAboveMin.valid).toBe(true);
    expect(validAboveMin.discountAmount).toBe(50);
  });
});
