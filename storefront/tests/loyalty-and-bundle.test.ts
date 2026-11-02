import { describe, it, expect } from 'vitest';
import { generateVoucherCode, isEligible240Tee, calculateTeeBundleSavings, calculateTierAutoDiscount } from '@/lib/loyalty';
import { validateCouponCode } from '@/lib/festivals';

describe('Loyalty Voucher, Tier Auto-Discounts & 240 GSM Bundle Engine', () => {
  it('generates random uppercase 6-character RE-GIFT-XXXXXX codes', () => {
    const code = generateVoucherCode();
    expect(code).toMatch(/^RE-GIFT-[A-Z0-9]{6}$/);
    expect(code.length).toBe(14);
  });

  it('calculates Tier Auto-Deductions accurately (₹69 on ₹1,000+, ₹149 on ₹2,000+)', () => {
    expect(calculateTierAutoDiscount(669)).toBe(0);
    expect(calculateTierAutoDiscount(999)).toBe(0);
    expect(calculateTierAutoDiscount(1000)).toBe(69);
    expect(calculateTierAutoDiscount(1349)).toBe(69);
    expect(calculateTierAutoDiscount(1999)).toBe(69);
    expect(calculateTierAutoDiscount(2000)).toBe(149);
    expect(calculateTierAutoDiscount(2999)).toBe(149);
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

    // 2 tees: ₹99 bundle savings
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

  it('validates RE-GIFT- voucher format and enforces ₹669 minimum order value with tiered amounts', () => {
    const tooLow = validateCouponCode('RE-GIFT-ABC123', 600);
    expect(tooLow.valid).toBe(false);
    expect(tooLow.error).toContain('minimum order value of ₹669');

    const validAtTier1 = validateCouponCode('RE-GIFT-ABC123', 669);
    expect(validAtTier1.valid).toBe(true);
    expect(validAtTier1.discountAmount).toBe(70);

    const validAbove1k = validateCouponCode('RE-GIFT-ABC123', 1499);
    expect(validAbove1k.valid).toBe(true);
    expect(validAbove1k.discountAmount).toBe(70);

    const validAbove2k = validateCouponCode('RE-GIFT-ABC123', 2199);
    expect(validAbove2k.valid).toBe(true);
    expect(validAbove2k.discountAmount).toBe(130);
  });

  it('enforces first-order vs returning customer separation and repeat drop voucher cycle', () => {
    // 1st time customer on ₹1,349 hoodie:
    const subtotal = 1349;
    const isFirstOrder = true;
    const firstOrderAutoSavings = isFirstOrder ? calculateTierAutoDiscount(subtotal) : 0;
    expect(firstOrderAutoSavings).toBe(69);
    expect(subtotal - firstOrderAutoSavings).toBe(1280);

    // 2nd time customer: auto-discount is 0, they fill their ₹70 voucher into the empty coupon space:
    const returningSubtotal = 1349;
    const isReturning = false;
    const returningAutoSavings = isReturning ? calculateTierAutoDiscount(returningSubtotal) : 0;
    const voucherRes = validateCouponCode('RE-GIFT-ABC123', returningSubtotal);

    expect(returningAutoSavings).toBe(0); // No auto 69 for returning customer!
    expect(voucherRes.valid).toBe(true);
    expect(voucherRes.discountAmount).toBe(70);
    const finalReturningTotal = returningSubtotal - returningAutoSavings - voucherRes.discountAmount;
    expect(finalReturningTotal).toBe(1279);

    // 2nd time VIP customer buying 2 hoodies (₹2,698) with their ₹130 voucher:
    const vipSubtotal = 2698;
    const vipAutoSavings = isReturning ? calculateTierAutoDiscount(vipSubtotal) : 0;
    const vipVoucherRes = validateCouponCode('RE-GIFT-ABC123', vipSubtotal);

    expect(vipAutoSavings).toBe(0);
    expect(vipVoucherRes.valid).toBe(true);
    expect(vipVoucherRes.discountAmount).toBe(130);
    expect(vipSubtotal - vipAutoSavings - vipVoucherRes.discountAmount).toBe(2568);
  });
});
