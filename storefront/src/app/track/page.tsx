import { Suspense } from 'react';
import type { Metadata } from 'next';
import { TrackClient } from './TrackClient';

export const metadata: Metadata = {
  title: 'Track Your Order | Rare Ember',
  description: 'Track your live order fulfillment and BlueDart / Delhivery Air shipment in real-time.',
  alternates: {
    canonical: 'https://www.rareember.shop/track',
  },
};

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <main className="page-top min-h-screen bg-[#FFFBF5] flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
            <p className="font-semibold text-neutral-600 text-xs">Loading order tracker…</p>
          </div>
        </main>
      }
    >
      <TrackClient />
    </Suspense>
  );
}
