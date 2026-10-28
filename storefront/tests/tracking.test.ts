import { describe, it, expect } from 'vitest';
import { isValidOrderId, isValidEmail } from '../src/lib/security/validation';

describe('Tracking & Order Carrier Resolution', () => {
  it('validates order ID format for sample and standard order formats', () => {
    expect(isValidOrderId('7792e434')).toBe(true);
    expect(isValidOrderId('7792e434-7bf5-4ff4-9296-cf2f4c2af57f')).toBe(true);
    expect(isValidOrderId('658581_RE7792e4347b')).toBe(true);
    expect(isValidOrderId('RE7792e4347b')).toBe(true);
    expect(isValidOrderId('BD-18023747616')).toBe(true);
    expect(isValidOrderId('18023747616')).toBe(true);
  });

  it('validates support and customer email formats', () => {
    expect(isValidEmail('support@rareember.shop')).toBe(true);
    expect(isValidEmail('customer@example.com')).toBe(true);
  });

  it('correctly strips carrier prefixes and constructs Delhivery & Blue Dart URLs', () => {
    const rawTracking = 'BD-18023747616';
    const cleanAwb = rawTracking.replace(/^(BD|DL)-/i, '').trim();

    expect(cleanAwb).toBe('18023747616');

    const delhiveryUrl = `https://www.delhivery.com/track-v2/package/${encodeURIComponent(cleanAwb)}`;
    const bluedartUrl = `https://www.bluedart.com/tracking?trackRef=${encodeURIComponent(cleanAwb)}`;

    expect(delhiveryUrl).toBe('https://www.delhivery.com/track-v2/package/18023747616');
    expect(bluedartUrl).toBe('https://www.bluedart.com/tracking?trackRef=18023747616');
  });

  it('properly calculates estimated delivery window for October 22 order', () => {
    const createdAt = '2026-10-22T07:19:00.000Z';
    const d = new Date(createdAt);
    const start = new Date(d);
    start.setDate(start.getDate() + 3);
    const end = new Date(d);
    end.setDate(end.getDate() + 5);

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    expect(`${startStr} – ${endStr}`).toBe('Oct 25 – Oct 27, 2026');
  });
});
