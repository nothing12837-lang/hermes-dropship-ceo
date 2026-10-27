import { describe, it, expect } from 'vitest';
import {
  GOOGLE_MERCHANT_CENTER_ID,
  calculateEstimatedDeliveryDate,
} from '@/components/google/GoogleCustomerReviewsOptIn';

describe('Google Customer Reviews & Shop Ratings Engine', () => {
  it('should use the exact verified Merchant Center ID', () => {
    expect(GOOGLE_MERCHANT_CENTER_ID).toBe(5885607413);
  });

  it('should calculate estimated delivery date formatted strictly as YYYY-MM-DD', () => {
    const dateStr = calculateEstimatedDeliveryDate(4);
    expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const parsed = new Date(dateStr);
    expect(Number.isNaN(parsed.getTime())).toBe(false);

    // Verify it is in the future
    const now = new Date();
    const diffDays = (parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThan(2);
    expect(diffDays).toBeLessThan(6);
  });

  it('should format delivery dates consistently for Indian logistics (3 to 5 days)', () => {
    const eta3 = calculateEstimatedDeliveryDate(3);
    const eta5 = calculateEstimatedDeliveryDate(5);
    expect(eta3).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(eta5).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(eta5).getTime()).toBeGreaterThan(new Date(eta3).getTime());
  });
});
