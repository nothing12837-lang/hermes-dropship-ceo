import { describe, expect, it } from 'vitest';
import {
  isValidOrderId,
  isValidSku,
  normalizeEmail,
  sanitizeCheckoutItems,
  sanitizeMessage,
  cleanOrderId,
  isUuid,
  isHexPrefix,
  isNumericTracking,
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
    expect(isValidOrderId('#7792e434')).toBe(true);
    expect(isValidOrderId('INV-RE-7792E434')).toBe(true);
    expect(isValidOrderId('7792e434-7bf5-4ff4-9296-cf2f4c2af57f')).toBe(true);
    expect(isValidOrderId('658581_RE7792e4347b')).toBe(true);
    expect(isValidOrderId('RE7792e4347b')).toBe(true);
    expect(isValidOrderId('46600611743280')).toBe(true);
    expect(isValidSku('CJ-PET-001')).toBe(true);
  });
  it('rejects injection-ish input', () => {
    expect(isValidOrderId('../../etc')).toBe(false);
    expect(isValidSku('a'.repeat(65))).toBe(false);
    expect(isValidSku('')).toBe(false);
  });
  it('cleanOrderId cleans prefixes and hash symbols', () => {
    expect(cleanOrderId('#7792e434')).toBe('7792e434');
    expect(cleanOrderId('INV-RE-7792E434')).toBe('7792E434');
    expect(cleanOrderId('  #INV-RE-7792e434  ')).toBe('7792e434');
    expect(cleanOrderId('7792e434-7bf5-4ff4-9296-cf2f4c2af57f')).toBe('7792e434-7bf5-4ff4-9296-cf2f4c2af57f');
    expect(cleanOrderId('658581_RE7792e4347b')).toBe('7792e4347b');
    expect(cleanOrderId('RE7792e4347b')).toBe('7792e4347b');
    expect(cleanOrderId('re7792e4347b')).toBe('7792e4347b');
  });
  it('isUuid, isHexPrefix, and isNumericTracking accurately classify IDs', () => {
    expect(isUuid('7792e434-7bf5-4ff4-9296-cf2f4c2af57f')).toBe(true);
    expect(isUuid('7792e434')).toBe(false);
    expect(isHexPrefix('7792e434')).toBe(true);
    expect(isHexPrefix('7792E434')).toBe(true);
    expect(isHexPrefix('7792e4347b')).toBe(true);
    expect(isHexPrefix('invalid123')).toBe(false);
    expect(isHexPrefix('1234')).toBe(false);
    expect(isNumericTracking('46600611743280')).toBe(true);
    expect(isNumericTracking('18023747616')).toBe(true);
    expect(isNumericTracking('7792e434')).toBe(false);
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
