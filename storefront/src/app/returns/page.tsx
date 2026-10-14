import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Return & Replacement Policy | RareEmber',
  description: 'Our 7-day easy replacement policy. Hassle-free doorstep resolution for damaged or defective items.',
};

export default function ReturnsPage() {
  return (
    <main className="page-top min-h-screen bg-[#FFF9F1] pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto pt-6 pb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs font-bold text-neutral-800 shadow-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            7-Day Easy Replacement Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight leading-tight">
            Return & Refund Policy
          </h1>
          <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
            We stand behind every handpicked drop. If something arrives damaged or not as described, we make it right immediately.
          </p>
        </div>

        {/* 3-Step Process Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-black/[0.06] shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-900 flex items-center justify-center text-xl font-bold mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-neutral-950 mb-2">Reach Out</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Contact us within 7 days of delivery at <code className="text-neutral-900 font-bold">rareemberagency@gmail.com</code> or ask our 24/7 Hermes AI Concierge.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-black/[0.06] shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-900 flex items-center justify-center text-xl font-bold mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-neutral-950 mb-2">Photo / Video Proof</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Share your Order ID and a clear photo or short clip showing the defect or issue. No complex paperwork required.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-black/[0.06] shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-900 flex items-center justify-center text-xl font-bold mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-neutral-950 mb-2">Instant Solution</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              We dispatch a <b>free priority replacement</b> or issue a <b>100% refund</b> to your original payment method. No return shipping hassle needed.
            </p>
          </div>
        </div>

        {/* Detailed Policy Accordion / Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-black/[0.06] shadow-xs mb-10 space-y-8">
          <div>
            <h2 className="text-lg font-black text-neutral-950 mb-2">Damaged, Defective or Incorrect Items</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              If an item is damaged during courier transit or arrives with a factory defect, we do not require you to pay costly reverse courier shipping. Simply send visual evidence to our support desk within 7 days of delivery, and our fulfillment engine will dispatch a brand-new replacement at zero cost, or issue a complete refund.
            </p>
          </div>

          <div className="border-t border-black/[0.05] pt-6">
            <h2 className="text-lg font-black text-neutral-950 mb-2">Refund Processing Times</h2>
            <ul className="text-xs text-neutral-600 space-y-2 list-disc pl-5 leading-relaxed">
              <li><b>Prepaid Orders (UPI, Cards, Netbanking):</b> Refunds are credited back to your original bank account within 3–5 business days via Razorpay.</li>
              <li><b>Cash on Delivery (COD) Orders:</b> Once your replacement or claim is approved, refunds are sent directly via instant UPI transfer or bank NEFT.</li>
            </ul>
          </div>

          <div className="border-t border-black/[0.05] pt-6">
            <h2 className="text-lg font-black text-neutral-950 mb-2">Order Cancellations</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Orders can be modified or cancelled within <b>12 hours of placement</b> before courier dispatch. Once a parcel is in transit, cancellation cannot be processed until delivery is attempted.
            </p>
          </div>

          <div className="border-t border-black/[0.05] pt-6">
            <h2 className="text-lg font-black text-neutral-950 mb-2">Need Immediate Help?</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Our 24/7 Hermes AI assistant is active in the bottom right corner to answer any order queries, or you can email our support team directly:
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="mailto:rareemberagency@gmail.com"
                className="px-5 py-2.5 rounded-full bg-[#1d1d1f] text-white text-xs font-bold hover:bg-black transition-all no-underline shadow-xs"
              >
                Email Support Team →
              </a>
              <Link
                href="/track"
                className="px-5 py-2.5 rounded-full bg-neutral-100 text-neutral-800 text-xs font-bold hover:bg-neutral-200 transition-all no-underline"
              >
                Track an Active Order 📍
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
