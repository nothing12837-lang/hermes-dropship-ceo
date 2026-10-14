import Link from 'next/link';

export default function NotFound() {
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
        <div style={{ fontSize: '3.5rem' }}>🕵️</div>
        <h1 style={{ fontWeight: 900, fontSize: '2rem', marginTop: '1rem' }}>Lost in the woods?</h1>
        <p style={{ color: '#52453e', marginTop: '0.75rem', lineHeight: 1.7 }}>
          This page doesn&apos;t exist — but eight cozy chapters do. Let&apos;s get you back
          to the good stuff.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <Link
            href="/shop"
            style={{
              padding: '0.9rem 1.8rem',
              borderRadius: '9999px',
              background: '#ff6b35',
              color: 'white',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            Explore chapters →
          </Link>
          <Link
            href="/"
            style={{
              padding: '0.9rem 1.8rem',
              borderRadius: '9999px',
              background: '#1a1412',
              color: 'white',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
