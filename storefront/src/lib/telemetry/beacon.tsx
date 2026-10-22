'use client';

/**
 * First-party analytics beacon — near-zero cost.
 * - sendBeacon / keepalive fetch (runs in background, never blocks UI).
 * - No cookies, no IP, no PII. Random session token per tab session.
 * - Skipped entirely for /admin pages.
 */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SID_KEY = 're_sid';
let sessionToken = '';

function sessionId(): string {
  if (sessionToken) return sessionToken;
  try {
    const existing = sessionStorage.getItem(SID_KEY);
    sessionToken =
      existing ||
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID().replace(/-/g, '').slice(0, 32)
        : Math.random().toString(36).slice(2) + Date.now().toString(36));
    try {
      sessionStorage.setItem(SID_KEY, sessionToken);
    } catch {}
  } catch {
    sessionToken = 'anon-' + Math.random().toString(36).slice(2, 10);
  }
  return sessionToken;
}

function deviceKind(): string {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/bot|crawler|spider|crawling|headless|lighthouse/i.test(ua)) return 'bot';
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'tablet';
  return /Mobi|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop';
}

export function track(type: 'pageview' | 'view_product' | 'add_to_cart' | 'session_ping', extra: { productId?: string } = {}): void {
  if (typeof window === 'undefined') return;
  const p = window.location.pathname + window.location.search;
  const body = JSON.stringify({
    t: type,
    s: sessionId(),
    p: p.slice(0, 300),
    r: document.referrer?.slice(0, 700) || '',
    pr: extra.productId?.slice(0, 200) || undefined,
    m: { d: deviceKind(), q: window.location.search.slice(0, 300) },
  });
  try {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon && navigator.sendBeacon('/api/track', blob)) return;
    void fetch('/api/track', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } });
  } catch {
    /* analytics must never throw in the storefront */
  }
}

/** Heartbeats long sessions so real on-site time is measurable. Counts nothing until mounted. */
export default function AnalyticsBeacon() {
  const path = usePathname();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!path || path.startsWith('/admin') || path.startsWith('/api')) return;
    let timer: number | undefined;
    const fire = () => {
      track('pageview', { productId: path.startsWith('/product/') ? path.split('/')[2] : undefined });
      timer = window.setInterval(() => track('session_ping'), 120_000);
    };
    timer = window.setTimeout(fire, 900);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    };
  }, [path]);
  return null;
}