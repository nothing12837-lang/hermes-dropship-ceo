import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export const metadata = {
  title: 'Contact Us | RareEmber Support',
  description: 'Get in touch with RareEmber support team for order tracking, product help, and inquiries.',
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFF9F1] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-black/[0.06] shadow-xl text-neutral-900">
          <div className="inline-block px-3 py-1 rounded-full bg-[#FF4D24]/10 text-[#FF4D24] text-xs font-bold uppercase tracking-wider mb-4">
            Customer Support
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-neutral-950 mb-4">
            Contact RareEmber
          </h1>
          <p className="text-sm text-neutral-500 mb-8 max-w-xl">
            Have a question about your order, tracking status, returns, or our catalog? Our dedicated customer care desk and 24/7 support team are here to help.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="p-6 rounded-2xl bg-[#FFF9F1]/60 border border-black/[0.06]">
              <span className="text-2xl mb-2 block">✉️</span>
              <h3 className="text-base font-bold text-neutral-950 mb-1">Email Care Desk</h3>
              <p className="text-xs text-neutral-500 mb-3">Direct reply in under 12 hours for all order inquiries.</p>
              <a
                href="mailto:rareemberagency@gmail.com"
                className="text-sm font-bold text-[#FF4D24] hover:underline"
              >
                rareemberagency@gmail.com
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFF9F1]/60 border border-black/[0.06]">
              <span className="text-2xl mb-2 block">📍</span>
              <h3 className="text-base font-bold text-neutral-950 mb-1">Live Package Tracking</h3>
              <p className="text-xs text-neutral-500 mb-3">Track real-time courier updates via Order ID or Email.</p>
              <Link
                href="/track"
                className="text-sm font-bold text-neutral-950 hover:underline inline-flex items-center gap-1"
              >
                Go to Tracking Portal →
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFF9F1]/60 border border-black/[0.06]">
              <span className="text-2xl mb-2 block">🔄</span>
              <h3 className="text-base font-bold text-neutral-950 mb-1">7-Day Free Replacement</h3>
              <p className="text-xs text-neutral-500 mb-3">Instant doorstep reprint for size mismatches or defects.</p>
              <Link
                href="/returns"
                className="text-sm font-bold text-[#FF4D24] hover:underline inline-flex items-center gap-1"
              >
                File Replacement Claim →
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-950 mb-2">Business & Factory Fulfillment Operations</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Rare Ember Domestic Fulfillment Center<br />
              Apparel & POD Manufacturing Hub: Tirupur & Coimbatore, Tamil Nadu, India<br />
              Express Logistics Courier Partners: BlueDart Air Express, Delhivery & DTDC<br />
              Operational Hours: Monday – Saturday, 9:00 AM – 8:00 PM IST
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
