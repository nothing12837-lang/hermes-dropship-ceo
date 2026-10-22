'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { ChapterHeading, MagneticButton } from '@/components/ui/Story';
import { trackPurchase } from '@/lib/telemetry/dataLayer';

function SuccessInner() {
  const q = useSearchParams();
  const mock = q.get('mock');
  const isCod = q.get('cod') === '1';
  const email = q.get('email') || 'your inbox';
  const total = q.get('total');
  const session = q.get('session_id') || q.get('order_id');

  // Deterministic: `Date.now()` during render is an impure call and produced
  // a server/client hydration mismatch on this page.
  const orderId = session || 'ord_pending';
  const orderTotal = total ? parseFloat(total) : 899;

  // Telemetry: track purchase on success load
  useEffect(() => {
    trackPurchase({
      transactionId: orderId,
      value: orderTotal,
      currency: 'INR',
      items: [
        {
          id: 'rareember-flagship-drop',
          title: 'RareEmber Curated Streetwear Drop',
          price: orderTotal,
          qty: 1,
          category: 'Streetwear Apparel',
        },
      ],
    });
  }, [orderId]);

  return (
    <main className="page-top" style={{ background: '#fffbf5', minHeight: '100vh', textAlign: 'center' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ fontSize: '4rem' }}>{isCod ? '📦' : '🎉'}</div>
        <ChapterHeading
          index="05"
          label={isCod ? 'COD Confirmed' : mock ? 'Demo order' : 'Paid'}
          title={isCod ? 'Order' : 'Story'}
          accent={isCod ? 'Placed.' : 'continues.'}
        />
        <p style={{ color: '#52453e', lineHeight: 1.7, fontSize: '1.05rem' }}>
          {isCod ? (
            <>
              Your Cash on Delivery order is confirmed{session ? <> (Order Ref: <code style={{ fontSize: '0.85rem' }}>{session.slice(0, 16)}</code>)</> : null}.
              {total && <> Please keep <b>₹{total}</b> in cash or UPI ready upon delivery.</>} Dispatch notifications will be sent to <b>{email}</b>.
            </>
          ) : mock ? (
            <>
              Demo mode — Razorpay keys aren&apos;t configured yet, so no charge was made.
              {total && <> Total would have been <b>₹{total}</b>.</>} Tracking would go to <b>{email}</b>.
              <br /><br />Live orders are automatically recorded in our fulfillment engine.
            </>
          ) : (
            <>
              Payment confirmed{session ? <> (Order <code style={{ fontSize: '0.8rem' }}>{session.slice(0, 14)}…</code>)</> : null}.
              Tracking is heading to <b>{email}</b>. Our fulfillment engine has started processing your order.
            </>
          )}
        </p>

        {/* 4-Stage Order Progression */}
        <div style={{ margin: '2rem 0', padding: '1.25rem', background: '#FFFFFF', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.08)', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: '0.75rem' }}>
            Live Fulfillment Pipeline
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
            <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1rem' }}>✅</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#047857', marginTop: '0.25rem' }}>Order Confirmed</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1rem' }}>✈️</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginTop: '0.25rem' }}>Hub Dispatch</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1rem' }}>🚚</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginTop: '0.25rem' }}>Out for Delivery</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1rem' }}>🏠</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginTop: '0.25rem' }}>Delivered</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href={`/track?email=${encodeURIComponent(email)}${session ? `&orderId=${encodeURIComponent(session)}` : ''}`} style={{ textDecoration: 'none' }}>
            <MagneticButton>Track this order 📍</MagneticButton>
          </Link>
          <button
            onClick={() => window.print()}
            style={{
              padding: '0.85rem 1.5rem',
              borderRadius: '9999px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#1f2937',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📄 Print Tax Invoice
          </button>
          <Link href="/shop" style={{ textDecoration: 'none' }}>
            <MagneticButton variant="dark">Keep shopping →</MagneticButton>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}
