import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy — Express Pan-India Logistics',
  description:
    'Rare Ember official shipping policy. Express Air pan-India delivery in 2–4 business days via BlueDart Air and Delhivery. Free shipping on prepaid orders with Cash on Delivery available.',
  alternates: {
    canonical: 'https://www.rareember.shop/shipping',
  },
};

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-[#FFF9F1] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-black/[0.06] shadow-xl text-neutral-900">
        <div className="inline-block px-3 py-1 rounded-full bg-[#E04F33]/10 text-[#E04F33] text-xs font-bold uppercase tracking-wider mb-4">
          Logistics & Fulfillment
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-neutral-950 mb-4">
          Shipping &amp; Delivery Policy
        </h1>
        <p className="text-xs text-neutral-400 mb-8 font-mono">
          Last Updated: October 2026 • Compliant with Indian Consumer Protection (E-Commerce) Rules
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-neutral-700">
          {/* Quick Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-neutral-50 border border-black/[0.06] text-center">
            <div className="p-3">
              <span className="text-2xl block mb-1">⚡</span>
              <strong className="block text-neutral-950 text-xs uppercase tracking-wider">Handling Time</strong>
              <span className="text-xs text-neutral-600">24–48 Hours (1–2 Days)</span>
            </div>
            <div className="p-3 border-y sm:border-y-0 sm:border-x border-black/[0.08]">
              <span className="text-2xl block mb-1">✈️</span>
              <strong className="block text-neutral-950 text-xs uppercase tracking-wider">Transit Time</strong>
              <span className="text-xs text-neutral-600">2–4 Business Days</span>
            </div>
            <div className="p-3">
              <span className="text-2xl block mb-1">📦</span>
              <strong className="block text-neutral-950 text-xs uppercase tracking-wider">Shipping Cost</strong>
              <span className="text-xs text-emerald-700 font-bold">₹0.00 (Free Pan-India)</span>
            </div>
          </div>

          {/* Section 1: Order Processing & Dispatch */}
          <section>
            <h2 className="text-lg font-bold text-neutral-950 mb-2">1. Order Processing &amp; Handling Times</h2>
            <p>
              Every Rare Ember piece is tailored on verified heavyweight blanks with museum-grade high-density prints.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-xs text-neutral-600">
              <li><strong>Order Cut-Off Time:</strong> 5:00 PM IST (Monday through Saturday). Orders received after 5:00 PM are queued the following business day.</li>
              <li><strong>Handling / Dispatch Window:</strong> 24 to 48 hours (1–2 business days) from receipt of confirmed order.</li>
              <li><strong>Dispatch Hub:</strong> Bangalore Central Logistics Hub, Karnataka, India.</li>
            </ul>
          </section>

          {/* Section 2: Domestic Shipping & Delivery Times */}
          <section>
            <h2 className="text-lg font-bold text-neutral-950 mb-2">2. Pan-India Delivery Timelines &amp; Rates</h2>
            <p className="mb-3">
              We ship across 19,000+ PIN codes across India using priority air cargo:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-black/[0.08] rounded-xl overflow-hidden">
                <thead className="bg-neutral-100 text-neutral-900 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Destination Region</th>
                    <th className="p-3">Courier Service</th>
                    <th className="p-3">Estimated Delivery</th>
                    <th className="p-3">Shipping Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06] text-neutral-700">
                  <tr>
                    <td className="p-3 font-semibold">Tier-1 Metros (Bangalore, Mumbai, Delhi-NCR, Hyderabad, Chennai, Kolkata)</td>
                    <td className="p-3">BlueDart Express Air / Delhivery Air</td>
                    <td className="p-3">2–3 Business Days</td>
                    <td className="p-3 text-emerald-700 font-bold">₹0.00 (Free)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Tier-2 &amp; Tier-3 Cities (State Capitals &amp; Major Towns)</td>
                    <td className="p-3">Delhivery Express / BlueDart Surface</td>
                    <td className="p-3">3–4 Business Days</td>
                    <td className="p-3 text-emerald-700 font-bold">₹0.00 (Free)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">North-East, J&amp;K, Islands &amp; Remote PIN Codes</td>
                    <td className="p-3">Delhivery / India Post Speed Post</td>
                    <td className="p-3">4–6 Business Days</td>
                    <td className="p-3 text-emerald-700 font-bold">₹0.00 (Free)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Payment Methods & Cash on Delivery (COD) */}
          <section>
            <h2 className="text-lg font-bold text-neutral-950 mb-2">3. Payment Methods &amp; Cash on Delivery (COD)</h2>
            <p className="mb-2">
              We support transparent payment options with zero hidden checkout fees:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-600">
              <li><strong>Prepaid Orders:</strong> Processed securely via Razorpay (UPI: Google Pay, PhonePe, Paytm, BHIM; Cards: Visa, MasterCard, RuPay; NetBanking: All major Indian banks). Prepaid orders receive instant dispatch prioritization and an additional ₹30 discount.</li>
              <li><strong>Cash on Delivery (COD):</strong> Available across India. To prevent logistics fraud and duplicate dispatches, COD orders are verified via automated SMS OTP prior to dispatch. You pay the exact cart amount in cash or UPI to the delivery courier at your doorstep.</li>
            </ul>
          </section>

          {/* Section 4: Real-Time Order Tracking */}
          <section>
            <h2 className="text-lg font-bold text-neutral-950 mb-2">4. Live Package Tracking</h2>
            <p>
              Once your order dispatches from our Bangalore hub, an automated notification containing your Air Waybill (AWB) number and direct courier tracking link is dispatched via Email and WhatsApp.
            </p>
            <p className="mt-2 text-xs">
              You can also track your shipment status at any time on our{' '}
              <Link href="/track" className="text-[#E04F33] font-bold underline">
                Live Order Tracking Desk
              </Link>{' '}
              by entering your Order ID and mobile number.
            </p>
          </section>

          {/* Section 5: Damage in Transit & 7-Day Returns */}
          <section>
            <h2 className="text-lg font-bold text-neutral-950 mb-2">5. Transit Damage &amp; Doorstep Sizing Exchanges</h2>
            <p>
              All shipments are packed in weather-resistant, tamper-evident protective packaging. In the rare event of damage in transit or a size mismatch:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-neutral-600">
              <li>Submit a claim on our <Link href="/returns" className="text-[#E04F33] font-bold underline">7-Day Easy Returns Portal</Link> within 7 days of delivery.</li>
              <li>Damaged or defective pieces receive an immediate 100% free reprint/replacement with zero reverse courier charges.</li>
              <li>Size exchanges are executed via a 1-to-1 doorstep handover with the delivery courier.</li>
            </ul>
          </section>

          {/* Section 6: Verified Merchant Business Information */}
          <section className="bg-neutral-950 text-white rounded-2xl p-6 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>📍</span> Verified Merchant Entity &amp; Operating Headquarters
            </h2>
            <div className="text-xs space-y-1 text-neutral-300 font-mono">
              <p><strong className="text-white">Legal Entity / Brand:</strong> Rare Ember</p>
              <p><strong className="text-white">Registered Address:</strong> Near Aerospace Park, Bagalur Main Road, Bangalore, Karnataka — 562107, India</p>
              <p><strong className="text-white">Customer Support Helpline:</strong> <a href="tel:+919118211860" className="text-[#FF6B4A] underline">+91 91182 11860</a></p>
              <p><strong className="text-white">Customer Support Email:</strong> <a href="mailto:support@rareember.shop" className="text-[#FF6B4A] underline">support@rareember.shop</a></p>
              <p><strong className="text-white">Operating Hours:</strong> Monday – Saturday: 9:00 AM – 8:00 PM IST</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
