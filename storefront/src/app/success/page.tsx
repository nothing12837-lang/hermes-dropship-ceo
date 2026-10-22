'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ChapterHeading } from '@/components/ui/Story';
import { trackPurchase } from '@/lib/telemetry/dataLayer';

function SuccessInner() {
  const q = useSearchParams();
  const mock = q.get('mock');
  const isCod = q.get('cod') === '1';
  const email = q.get('email') || 'your inbox';
  const total = q.get('total');
  const session = q.get('session_id') || q.get('order_id');

  const [copied, setCopied] = useState(false);

  // Deterministic order ID
  const orderId = session || 'ord_pending';
  const orderTotal = total ? parseFloat(total) : 899;

  // Calculate dynamic 3-5 day delivery ETA
  const estimatedDates = (() => {
    const start = new Date();
    start.setDate(start.getDate() + 3);
    const end = new Date();
    end.setDate(end.getDate() + 5);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  })();

  const copyOrderId = () => {
    if (session) {
      navigator.clipboard.writeText(session);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
  }, [orderId, orderTotal]);

  const trackUrl = `/track?email=${encodeURIComponent(email)}${session ? `&orderId=${encodeURIComponent(session)}` : ''}`;

  return (
    <main className="page-top min-h-screen bg-[#FFFBF5] text-[#161311] py-10 px-4">
      <div className="max-w-xl mx-auto text-center">
        {/* Status Badge & Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-4xl shadow-inner mb-4">
          {isCod ? '📦' : '⚡'}
        </div>

        <ChapterHeading
          index="05"
          label={isCod ? 'Cash on Delivery Verified' : mock ? 'Demo Mode' : 'Payment Confirmed'}
          title={isCod ? 'Order' : 'Payment'}
          accent={isCod ? 'Confirmed ⚡' : 'Secured ⚡'}
        />

        <p className="text-neutral-600 text-sm md:text-base -mt-4 mb-6 leading-relaxed max-w-md mx-auto">
          {isCod ? (
            <>
              Your Cash on Delivery order has been registered in the Tirupur fulfillment queue. Please keep{' '}
              <strong className="text-neutral-900 font-black">₹{total || orderTotal}</strong> ready in Cash or UPI QR scan upon delivery.
            </>
          ) : (
            <>
              Your payment has been secured via 256-bit SSL encryption. Factory dispatch queue has been assigned to your items.
            </>
          )}
        </p>

        {/* Order Reference Card */}
        {session && (
          <div className="mb-6 p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-sm flex items-center justify-between gap-3 text-xs">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                Order Reference ID
              </span>
              <span className="font-mono font-bold text-neutral-900">
                {session}
              </span>
            </div>
            <button
              onClick={copyOrderId}
              className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold border-none cursor-pointer transition-all shrink-0"
            >
              {copied ? '✓ Copied' : 'Copy ID'}
            </button>
          </div>
        )}

        {/* Estimated Doorstep Delivery Banner */}
        <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-amber-500/[0.08] via-orange-500/[0.05] to-transparent border border-amber-500/20 text-left shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <span>⚡</span> Estimated Doorstep Delivery
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-full border border-purple-200">
              Delhivery Air Express
            </span>
          </div>
          <p className="text-base font-extrabold text-neutral-900">
            {estimatedDates}{' '}
            <span className="text-xs font-semibold text-neutral-500">(3–5 Business Days)</span>
          </p>
          <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center gap-2 text-xs text-neutral-600">
            <span>📲</span>
            <span>
              Live courier tracking updates via <strong>SMS &amp; WhatsApp</strong> will activate upon physical hub scan.
            </span>
          </div>
        </div>

        {/* 4-Stage Progress Stepper */}
        <div className="mb-8 p-5 rounded-3xl bg-white border border-black/[0.06] text-left shadow-sm">
          <div className="flex items-center justify-between mb-3 text-[11px] font-black uppercase tracking-wider text-neutral-400">
            <span>Live Manufacturing Pipeline</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
              Stage 1 of 4
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl">
              <div className="text-base">⚡</div>
              <div className="text-[10px] font-black text-emerald-800 mt-1">Confirmed</div>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/30 p-2.5 rounded-xl">
              <div className="text-base">🧵</div>
              <div className="text-[10px] font-black text-indigo-900 mt-1">In Print</div>
            </div>
            <div className="bg-neutral-50 border border-black/[0.06] p-2.5 rounded-xl opacity-60">
              <div className="text-base">✈️</div>
              <div className="text-[10px] font-bold text-neutral-500 mt-1">Air Cargo</div>
            </div>
            <div className="bg-neutral-50 border border-black/[0.06] p-2.5 rounded-xl opacity-60">
              <div className="text-base">🏠</div>
              <div className="text-[10px] font-bold text-neutral-500 mt-1">Doorstep</div>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={trackUrl}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#FF4D24] to-[#FF6B35] hover:brightness-105 text-white font-black text-xs uppercase tracking-wider no-underline shadow-lg shadow-[#FF4D24]/20 active:scale-95 transition-all text-center inline-flex items-center justify-center gap-2"
          >
            <span>📍</span>
            <span>Track Order Milestones →</span>
          </Link>
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs border border-black/10 cursor-pointer transition-all text-center"
          >
            📄 Print Tax Receipt
          </button>
          <Link
            href="/shop"
            className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs no-underline transition-all text-center"
          >
            Explore Catalog →
          </Link>
        </div>

        {/* 1-Tap Concierge reassurance */}
        <div className="mt-8 pt-6 border-t border-black/[0.06] text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>Need instant confirmation?</span>
          <a
            href={`https://wa.me/919118211860?text=${encodeURIComponent(`Hi Rare Ember, I placed Order #${session || 'N/A'}. Please confirm dispatch status.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 font-bold underline inline-flex items-center gap-1"
          >
            <span>💬</span> Chat with Atelier Concierge on WhatsApp
          </a>
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
