import { describe, expect, it } from 'vitest';
import { normalizeIndianState } from '@/app/checkout/page';
import { getProductFromDB } from '@/lib/products-server';
import qp from '@/lib/data/qikink-products.json';

describe('normalizeIndianState', () => {
  it('normalizes common Indian state variations and aliases', () => {
    expect(normalizeIndianState('NCT of Delhi')).toBe('Delhi');
    expect(normalizeIndianState('Delhi NCR')).toBe('Delhi');
    expect(normalizeIndianState('New Delhi')).toBe('Delhi');
    expect(normalizeIndianState('Jammu & Kashmir')).toBe('Jammu and Kashmir');
    expect(normalizeIndianState('Orissa')).toBe('Odisha');
    expect(normalizeIndianState('Pondicherry')).toBe('Puducherry');
    expect(normalizeIndianState('Uttaranchal')).toBe('Uttarakhand');
    expect(normalizeIndianState('Tamilnadu')).toBe('Tamil Nadu');
    expect(normalizeIndianState('Chattisgarh')).toBe('Chhattisgarh');
    expect(normalizeIndianState('Andaman & Nicobar')).toBe('Andaman and Nicobar Islands');
    expect(normalizeIndianState('Daman and Diu')).toBe('Dadra and Nagar Haveli and Daman and Diu');
    expect(normalizeIndianState('Karnataka')).toBe('Karnataka');
    expect(normalizeIndianState('Maharashtra')).toBe('Maharashtra');
  });
});

describe('Product Catalog Resolution (Zero 404 Glitches)', () => {
  it('successfully resolves the 380 GSM Heavyweight Hoodie without 404', async () => {
    const hoodie = await getProductFromDB('rare-ember-380gsm-heavyweight-streetwear-hoodie');
    expect(hoodie).toBeDefined();
    expect(hoodie?.id).toBe('rare-ember-380gsm-heavyweight-streetwear-hoodie');
    expect(hoodie?.title).toContain('380 GSM Heavyweight');
  });

  it('resolves all 33 products in the catalog cleanly', async () => {
    for (const item of qp) {
      const slug = item.slug || item.id;
      const res = await getProductFromDB(slug);
      expect(res, `Product ${slug} failed to resolve`).toBeDefined();
      expect(res?.title).toBeTruthy();
    }
  });
});
