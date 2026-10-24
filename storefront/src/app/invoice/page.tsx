import { Metadata } from 'next';
import { Suspense } from 'react';
import InvoiceClient from './InvoiceClient';

export const metadata: Metadata = {
  title: 'Official GST Tax Invoice | Rare Ember Atelier',
  description: 'Download, print, or email your official Section 31 CGST Act tax invoice and authenticity certificate.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function InvoicePage() {
  return (
    <Suspense
      fallback={
        <main className="page-top min-h-screen bg-[#FAF8F5] flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-900 animate-spin" />
            <p className="font-semibold text-stone-600 text-xs">Generating official tax invoice…</p>
          </div>
        </main>
      }
    >
      <InvoiceClient />
    </Suspense>
  );
}
