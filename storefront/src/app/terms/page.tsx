import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for purchasing and browsing on Rare Ember.',
  alternates: {
    canonical: 'https://www.rareember.shop/terms',
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FFF9F1] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-black/[0.06] shadow-xl text-neutral-900">
        <div className="inline-block px-3 py-1 rounded-full bg-[#E04F33]/10 text-[#E04F33] text-xs font-bold uppercase tracking-wider mb-4">
          Legal &amp; Compliance
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-neutral-950 mb-4">
          Terms of Service
        </h1>
        <p className="text-xs text-neutral-400 mb-8 font-mono">Last Updated: October 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-neutral-700">
          <section>
            <h2 className="text-lg font-bold text-neutral-950 mb-2">1. Overview &amp; Agreement</h2>
            <p>
              Welcome to Rare Ember (https://www.rareember.shop). By accessing our website, placing an order, or utilizing our services, you agree to be bound by these Terms of Service, our Privacy Policy, our Shipping Policy, and our 7-Day Easy Returns Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-950 mb-2">2. Products &amp; Pricing</h2>
            <p>
              All product descriptions, textile weights (GSM), specifications, and prices displayed on RareEmber are accurate and verified from factory blanks. All domestic transactions are processed in Indian Rupees (INR ₹). All prices include applicable taxes. We reserve the right to adjust catalog pricing and promotional discounts at any time prior to order confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-950 mb-2">3. Payment &amp; Security</h2>
            <p>
              Prepaid payments are securely handled via Razorpay (supporting UPI, Credit/Debit Cards, NetBanking, and Wallets) with PCI-DSS Level 1 bank-grade encryption. We also offer verified Cash on Delivery (COD) across eligible PIN codes in India with SMS OTP verification.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-950 mb-2">4. Shipping &amp; Delivery Policy</h2>
            <p>
              • <b>Pan-India Delivery:</b> 2 to 4 business days via trusted logistics partners (BlueDart Air, Delhivery Express, India Post). Free shipping on all prepaid orders.<br />
              • <b>Order Handling / Dispatch:</b> Orders are dispatched within 24 to 48 hours from our Bangalore fulfillment hub.<br />
              • Real-time tracking links are provided via email and SMS immediately upon carrier scan.<br />
              • Review our complete <Link href="/shipping" className="text-[#E04F33] font-bold underline">Official Shipping Policy</Link> for detailed transit matrices across India.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-950 mb-2">5. Returns, Replacements &amp; Refunds</h2>
            <p>
              We provide a transparent <b>7-Day Easy Returns Policy</b>. If an item arrives damaged, defective, or with a sizing mismatch, submit a request on our <Link href="/returns" className="text-[#E04F33] font-bold underline">Returns Portal</Link> or email support@rareember.shop within 7 days of delivery with your Order ID for an immediate 1-to-1 doorstep exchange or full refund to your original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-950 mb-2">6. Verified Merchant &amp; Contact Information</h2>
            <div className="space-y-1 text-xs font-mono bg-neutral-50 p-4 rounded-xl border border-black/[0.06] text-neutral-800">
              <p><strong className="text-neutral-950">Brand / Legal Entity:</strong> Rare Ember</p>
              <p><strong className="text-neutral-950">Registered Operating Address:</strong> Near Ayyappa Swami Temple, Yadavnahalli (Landmark: Near St Antony's Church), Bangalore, Karnataka — 562107, India</p>
              <p><strong className="text-neutral-950">Customer Care Helpline:</strong> <a href="tel:+919118211860" className="text-[#E04F33] underline">+91 91182 11860</a></p>
              <p><strong className="text-neutral-950">Official Support Email:</strong> <a href="mailto:support@rareember.shop" className="text-[#E04F33] underline">support@rareember.shop</a></p>
              <p><strong className="text-neutral-950">Operating Hours:</strong> Monday – Saturday: 9:00 AM – 8:00 PM IST</p>
              <p><strong className="text-neutral-950">Official Portal:</strong> https://www.rareember.shop</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
