'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

/**
 * AuthHashSync:
 * 1. Permanently prevents .vercel.app domain leakage by immediately bouncing to https://www.rareember.shop.
 * 2. Seamlessly processes Supabase OAuth / Magic link hash tokens (#access_token=...).
 * 3. Restores user's intended target route (e.g. /profile, /checkout) and removes unsightly '#' from URL.
 */
export default function AuthHashSync() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Domain Guard: If running on any Vercel domain, immediately switch to canonical
    const host = window.location.hostname;
    if (host.endsWith('.vercel.app')) {
      const canonical = `https://www.rareember.shop${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.replace(canonical);
      return;
    }

    const hash = window.location.hash;
    const isAuthHash =
      hash.includes('access_token=') ||
      hash.includes('refresh_token=') ||
      hash.includes('type=recovery');

    // 2. Auth State Listener for OAuth returns
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'SIGNED_IN' && session) {
        let redirectTarget: string | null = null;
        try {
          redirectTarget =
            localStorage.getItem('rareember_login_redirect') ||
            sessionStorage.getItem('rareember_login_redirect');
          localStorage.removeItem('rareember_login_redirect');
          sessionStorage.removeItem('rareember_login_redirect');
        } catch {
          // ignore storage errors
        }

        const destination =
          redirectTarget && redirectTarget.startsWith('/') && !redirectTarget.startsWith('//')
            ? redirectTarget
            : '/profile';

        // Clean trailing hash from browser address bar
        if (window.location.hash) {
          try {
            window.history.replaceState(
              null,
              '',
              window.location.pathname + window.location.search
            );
          } catch {
            // ignore
          }
        }

        // If user landed on root page or login page from an OAuth redirect, navigate to their destination
        if (window.location.pathname === '/' || window.location.pathname === '/login') {
          router.push(destination);
        }
      }
    });

    // 3. Clean unsightly trailing '#' or '#access_token' after Supabase parses it
    if (hash === '#' || isAuthHash) {
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.hash) {
          try {
            window.history.replaceState(
              null,
              '',
              window.location.pathname + window.location.search
            );
          } catch {
            // ignore
          }
        }
      }, 800);
      return () => {
        clearTimeout(timer);
        subscription.unsubscribe();
      };
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
