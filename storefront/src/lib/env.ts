/**
 * Centralized environment validation.
 * Demo-friendly: missing keys warn (storefront falls back to local data /
 * mock checkout) instead of crashing `next build`. In production, call
 * `assertEnv()` from instrumentation or route handlers to fail fast.
 */

export interface EnvStatus {
  configured: boolean;
  missing: string[];
  warnings: string[];
}

const REQUIRED_PUBLIC = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;

const RECOMMENDED = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'ADMIN_SECRET',
  'CRON_SECRET',
  'GEMINI_API_KEY',
  'TELEGRAM_BOT_TOKEN',
  'CJ_API_TOKEN',
  'CJ_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL',
] as const;

function read(key: string): string | undefined {
  const v = process.env[key];
  return v && v.trim() !== '' ? v : undefined;
}

export function validateEnv(): boolean {
  return getEnvStatus().configured;
}

export function getEnvStatus(): EnvStatus {
  const missing = REQUIRED_PUBLIC.filter((key) => !read(key));
  const warnings = RECOMMENDED.filter((key) => !read(key)).map(
    (key) => `${key} not set — related feature runs in demo/fallback mode.`
  );
  return { configured: missing.length === 0, missing, warnings };
}

export function logEnvStatus(): EnvStatus {
  const status = getEnvStatus();
  if (!status.configured) {
    console.warn(`Missing required environment variables: ${status.missing.join(', ')}`);
  }
  for (const w of status.warnings) console.warn(w);
  return status;
}

export function assertEnv(): void {
  const status = getEnvStatus();
  if (!status.configured) {
    throw new Error(
      `Missing required environment variables: ${status.missing.join(', ')}. See .env.example.`
    );
  }
}

export function getRazorpayConfig(): { keyId: string; keySecret: string } | null {
  const keyId = read('RAZORPAY_KEY_ID');
  const keySecret = read('RAZORPAY_KEY_SECRET');
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

export function getCJConfig(): { token: string } | null {
  const token = read('CJ_API_TOKEN');
  if (!token) return null;
  return { token };
}

export function getAppUrl(): string {
  return read('NEXT_PUBLIC_APP_URL') ?? 'http://localhost:3000';
}
