'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ChapterHeading, MagneticButton } from '@/components/ui/Story';

function SuccessInner() {
  const q = useSearchParams();
  const mock = q.get('mock');
  const isCod = q.get('cod') === '1';
  const email = q.get('email') || 'your inbox';
  const total = q.get('total');
  const session = q.get('session_id') || q.get('order_id');

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
              Demo mode — Razorpay keys aren't configured yet, so no charge was made.
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
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href={`/track?email=${encodeURIComponent(email)}${session ? `&orderId=${encodeURIComponent(session)}` : ''}`} style={{ textDecoration: 'none' }}>
            <MagneticButton>Track this order 📍</MagneticButton>
          </Link>
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
