import { describe, expect, it } from 'vitest';
import { isTestOrder, expandBundleItems } from '@/lib/fulfillment/qikink';

describe('isTestOrder', () => {
  it('detects test emails', () => {
    expect(isTestOrder({ user_email: 'test@example.com' })).toBe(true);
    expect(isTestOrder({ user_email: 'customer@gmail.com', phone: '9123456789', shipping_name: 'Rahul Sharma' })).toBe(false);
  });

  it('detects dummy phone numbers', () => {
    expect(isTestOrder({ user_email: 'real@gmail.com', phone: '9876543210' })).toBe(true);
    expect(isTestOrder({ user_email: 'real@gmail.com', phone: '0000000000' })).toBe(true);
  });

  it('detects test addresses and names', () => {
    expect(isTestOrder({ shipping_name: 'Test Customer', user_email: 'real@gmail.com', phone: '9812345678' })).toBe(true);
    expect(isTestOrder({ shipping_address: { line1: 'Dummy Street 123' }, user_email: 'real@gmail.com' })).toBe(true);
  });

  it('passes genuine production orders', () => {
    const order = {
      user_email: 'ajaykumar.tech@gmail.com',
      shipping_name: 'Ajay Kumar',
      phone: '9820112345',
      shipping_address: {
        line1: 'Flat 402, Lotus Residency',
        city: 'Bengaluru',
        state: 'Karnataka',
        zip: '560001',
      },
    };
    expect(isTestOrder(order)).toBe(false);
  });
});

describe('expandBundleItems', () => {
  it('passes regular single items through unchanged', () => {
    const items = [{ id: 'qikink-32477737-mens-full-sleeve-t-shirt', qty: 2, size: 'L' }];
    const res = expandBundleItems(items);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('qikink-32477737-mens-full-sleeve-t-shirt');
  });

  it('expands multi-piece winter bundles into sub-items', () => {
    const items = [{ id: 'bundle-winter-spec-ops', qty: 1, size: 'XL' }];
    const res = expandBundleItems(items);
    expect(res.length).toBeGreaterThan(1);
    expect(res[0].size).toBe('XL');
  });
});
