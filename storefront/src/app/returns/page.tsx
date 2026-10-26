import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ReturnsClient } from './ReturnsClient';

export const metadata: Metadata = {
  title: '7-Day Easy Returns Policy',
  description: 'Our 100% 7-day returns guarantee. Hassle-free resolution and returns for any order within 7 days of delivery.',
};

export default function ReturnsPage() {
  return (
    <main className="page-top min-h-screen bg-[#FFF9F1] pb-24">
      <Suspense fallback={<div className="text-center py-24 text-neutral-400 text-xs">Loading returns portal…</div>}>
        <ReturnsClient />
      </Suspense>
    </main>
  );
}
