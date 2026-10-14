'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: '#fffbf5', color: '#1a1412', fontFamily: 'system-ui, sans-serif' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '3.5rem' }}>🐾</div>
            <h1 style={{ fontWeight: 900, fontSize: '1.8rem', marginTop: '1rem' }}>
              RareEmber stumbled
            </h1>
            <p style={{ color: '#52453e', marginTop: '0.75rem' }}>
              A critical error occurred{error.digest ? ` (ID: ${error.digest})` : ''}. Please
              reload the page.
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: '1.5rem',
                padding: '0.9rem 1.8rem',
                borderRadius: '9999px',
                border: 'none',
                background: '#ff6b35',
                color: 'white',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Reload
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
