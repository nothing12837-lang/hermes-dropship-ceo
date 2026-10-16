'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <main
      style={{
        background: '#fffbf5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '480px' }}>
        <div style={{ fontSize: '3.5rem' }}>⚡</div>
        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', marginTop: '1rem' }}>
          Stream Temporarily Interrupted
        </h1>
        <p style={{ color: '#52453e', marginTop: '0.75rem', lineHeight: 1.7 }}>
          Something went wrong while loading this page. Your cart and orders are safe — try refreshing or head back to the catalog.
        </p>
        {error.digest && (
          <p style={{ color: '#8a7b6b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Error ID: {error.digest}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              padding: '0.9rem 1.8rem',
              borderRadius: '9999px',
              border: 'none',
              background: '#ff6b35',
              color: 'white',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <Link
            href="/shop"
            style={{
              padding: '0.9rem 1.8rem',
              borderRadius: '9999px',
              background: '#1a1412',
              color: 'white',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            Back to shop
          </Link>
        </div>
      </div>
    </main>
  );
}
