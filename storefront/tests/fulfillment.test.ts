import { describe, expect, it } from 'vitest';
import {
  buildCJAddress,
  normalizeCJUpdate,
  resolveFulfillmentItems,
  splitName,
} from '@/lib/fulfillment/cj';

describe('splitName', () => {
  it('splits first and rest', () => {
    expect(splitName('Ada Lovelace Smith')).toEqual({ firstName: 'Ada', lastName: 'Lovelace Smith' });
  });
  it('handles single names', () => {
    expect(splitName('Madonna')).toEqual({ firstName: 'Madonna', lastName: 'Customer' });
  });
  it('handles blanks', () => {
    expect(splitName('   ')).toEqual({ firstName: 'RareEmber', lastName: 'Customer' });
  });
});

describe('buildCJAddress', () => {
  const base = {
    user_email: 'a@b.com',
    shipping_name: 'Ada Lovelace',
    shipping_address: { line1: '1 Main St', city: 'Austin', zip: '78701' },
  };
  it('builds a CJ address with US defaults', () => {
    const res = buildCJAddress(base);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.address).toMatchObject({
        firstName: 'Ada',
        lastName: 'Lovelace',
        country: 'US',
        email: 'a@b.com',
      });
    }
  });
  it('rejects incomplete addresses', () => {
    const res = buildCJAddress({ ...base, shipping_address: { city: 'Austin', zip: '78701' } });
    expect(res.ok).toBe(false);
  });
});

describe('resolveFulfillmentItems', () => {
  it('keeps SKUs, reports skipped lines', () => {
    const { lines, skipped } = resolveFulfillmentItems(
      [
        { id: 'a', qty: 2 },
        { id: 'b', qty: 1 },
      ],
      [{ id: 'a', title: 'A', cj_sku: 'CJ-A' }]
    );
    expect(lines).toEqual([{ sku: 'CJ-A', qty: 2 }]);
    expect(skipped).toEqual(['b']);
  });
  it('clamps quantities', () => {
    const { lines } = resolveFulfillmentItems(
      [{ id: 'a', qty: 500 }],
      [{ id: 'a', title: 'A', cj_sku: 'CJ-A' }]
    );
    expect(lines[0].qty).toBe(99);
  });
});

describe('normalizeCJUpdate', () => {
  it('accepts canonical payloads', () => {
    const res = normalizeCJUpdate({
      cj_order_id: 'CJ-1',
      tracking_number: 'T1',
      tracking_url: 'https://t/1',
      status: 'shipped',
    });
    expect(res).toEqual({
      ok: true,
      update: { cjOrderId: 'CJ-1', trackingNumber: 'T1', trackingUrl: 'https://t/1', status: 'shipped' },
    });
  });
  it('accepts camelCase aliases and defaults status', () => {
    const res = normalizeCJUpdate({ orderId: 'CJ-2' });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.update.status).toBe('shipped');
  });
  it('rejects missing ids and non-objects', () => {
    expect(normalizeCJUpdate({}).ok).toBe(false);
    expect(normalizeCJUpdate(null).ok).toBe(false);
    expect(normalizeCJUpdate('x').ok).toBe(false);
  });
});
