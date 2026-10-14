import { beforeEach, describe, expect, it } from 'vitest';
import { checkRateLimit, clearRateLimits } from '@/lib/security/rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => clearRateLimits());

  it('allows up to the limit then blocks', () => {
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit('k', 3, 60_000, 1000 + i).allowed).toBe(true);
    }
    const blocked = checkRateLimit('k', 3, 60_000, 1004);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('slides the window', () => {
    checkRateLimit('w', 1, 1000, 0);
    expect(checkRateLimit('w', 1, 1000, 500).allowed).toBe(false);
    expect(checkRateLimit('w', 1, 1000, 1001).allowed).toBe(true);
  });

  it('isolates keys', () => {
    checkRateLimit('a', 1, 60_000, 0);
    expect(checkRateLimit('b', 1, 60_000, 0).allowed).toBe(true);
  });
});
