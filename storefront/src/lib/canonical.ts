/**
 * Canonical Site Domain & URL Helper for RareEmber.
 * Strictly guarantees canonical production domain https://www.rareember.shop
 * to prevent OAuth, password-reset, and webview domain mismatches.
 */
export function getCanonicalSiteUrl(): string {
  // In production environments (or when VERCEL_ENV is production), strictly return canonical domain
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    return 'https://www.rareember.shop';
  }

  // Allow localhost for local development & unit testing
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin;
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (appUrl && (appUrl.includes('localhost') || appUrl.includes('127.0.0.1'))) {
    return appUrl.replace(/\/$/, '');
  }

  return 'https://www.rareember.shop';
}

/**
 * Generates an absolute canonical auth callback URL.
 */
export function getCanonicalAuthCallbackUrl(nextPath = '/profile'): string {
  const base = getCanonicalSiteUrl();
  const cleanNext = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
  return `${base}/auth/callback?next=${encodeURIComponent(cleanNext)}`;
}
