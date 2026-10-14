import { describe, expect, it } from 'vitest';
import {
  isValidOrderId,
  isValidSku,
  normalizeEmail,
  sanitizeCheckoutItems,
  sanitizeMessage,
} from '@/lib/security/validation';

describe('normalizeEmail', () => {
  it('lowercases and trims', () => {
    expect(normalizeEmail('  Ada@Example.COM ')).toBe('ada@example.com');
  });
  it('rejects bad emails', () => {
    expect(normalizeEmail('not-an-email')).toBeNull();
    expect(normalizeEmail('a@b')).toBeNull();
    expect(normalizeEmail(42)).toBeNull();
  });
});

describe('isValidOrderId / isValidSku', () => {
  it('accepts sane ids', () => {
    expect(isValidOrderId('abc-123_XY')).toBe(true);
    expect(isValidSku('CJ-PET-001')).toBe(true);
  });
  it('rejects injection-ish input', () => {
    expect(isValidOrderId('../../etc')).toBe(false);
    expect(isValidSku('a'.repeat(65))).toBe(false);
    expect(isValidSku('')).toBe(false);
  });
});

describe('sanitizeCheckoutItems', () => {
  it('accepts a normal cart', () => {
    expect(sanitizeCheckoutItems([{ id: 'bed-1', qty: 2 }])).toEqual([{ id: 'bed-1', qty: 2 }]);
  });
  it('rejects empty, huge, or malformed carts', () => {
    expect(sanitizeCheckoutItems([])).toBeNull();
    expect(sanitizeCheckoutItems(new Array(51).fill({ id: 'x', qty: 1 }))).toBeNull();
    expect(sanitizeCheckoutItems([{ id: 'x', qty: 0 }])).toBeNull();
    expect(sanitizeCheckoutItems([{ id: 'x', qty: 100 }])).toBeNull();
    expect(sanitizeCheckoutItems([{ qty: 1 }])).toBeNull();
  });
});

describe('sanitizeMessage', () => {
  it('trims and caps length', () => {
    expect(sanitizeMessage('  hi  ')).toBe('hi');
    expect(sanitizeMessage('')).toBeNull();
    expect(sanitizeMessage('x'.repeat(1001))).toBeNull();
  });
});
