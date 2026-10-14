import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAppUrl, getCJConfig, getEnvStatus, getRazorpayConfig } from '@/lib/env';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getEnvStatus', () => {
  it('reports configured when public keys exist', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://x.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');
    const s = getEnvStatus();
    expect(s.configured).toBe(true);
    expect(s.missing).toEqual([]);
  });

  it('lists missing required keys', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    const s = getEnvStatus();
    expect(s.configured).toBe(false);
    expect(s.missing).toContain('NEXT_PUBLIC_SUPABASE_URL');
  });
});

describe('service getters', () => {
  it('returns null without secrets', () => {
    vi.stubEnv('RAZORPAY_KEY_ID', '');
    vi.stubEnv('RAZORPAY_KEY_SECRET', '');
    vi.stubEnv('CJ_API_TOKEN', '');
    expect(getRazorpayConfig()).toBeNull();
    expect(getCJConfig()).toBeNull();
  });

  it('returns configs when set', () => {
    vi.stubEnv('RAZORPAY_KEY_ID', 'rzp_test');
    vi.stubEnv('RAZORPAY_KEY_SECRET', 'secret');
    vi.stubEnv('CJ_API_TOKEN', 'tok');
    expect(getRazorpayConfig()).toEqual({ keyId: 'rzp_test', keySecret: 'secret' });
    expect(getCJConfig()).toEqual({ token: 'tok' });
  });

  it('falls back to localhost app url', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');
    expect(getAppUrl()).toBe('http://localhost:3000');
  });
});
