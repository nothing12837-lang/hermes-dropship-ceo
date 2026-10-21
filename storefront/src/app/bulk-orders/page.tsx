import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Bulk Orders & Custom Merchandise — Tirupur Manufacturing Hub',
  description: 'Factory-direct custom merch for hackathons, college fests, startups, and creator brands. Wholesale tier pricing from ₹269/unit with free digital 3D mockups and Pan-India dispatch.',
};

const BULK_TIERS = [
  { min: 25, max: 50, teePrice: 399, hoodiePrice: 699, matPrice: 449, label: 'Starter Batch (25-50)' },
  { min: 51, max: 100, teePrice: 349, hoodiePrice: 649, matPrice: 399, label: 'Community Tier (51-100)', popular: true },
  { min: 101, max: 250, teePrice: 299, hoodiePrice: 599, matPrice: 349, label: 'Hackathon Tier (101-250)' },
  { min: 251, max: 1000, teePrice: 269, hoodiePrice: 549, matPrice: 299, label: 'Wholesale Flagship (250+)' },
];

export default function BulkOrdersPage() {
  return (
    <main className="page-top min-h-screen bg-[#FFF9F1] text-neutral-900 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-[#161311] text-white p-6 sm:p-12 border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF4D24]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF4D24]/20 border border-[#FF4D24]/40 text-[#FF9A3D] text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <span>🏭</span> Direct Tirupur Apparel Hub
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Custom Merch &amp; <span className="text-gradient-ember">Bulk Orders</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
              Equip your hackathon, college club, startup team, or creator brand with studio-grade 240 GSM tees and 380 GSM fleece hoodies. Direct factory pricing, free 3D proofs, and 20% advance booking.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                href="/support"
                className="no-underline px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF4D24] to-[#E8244B] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>💬</span> Request Bulk Quote &amp; Digital Proof
              </Link>

              <Link
                href="/custom-drops#custom-lab"
                className="no-underline px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md transition-all text-center"
              >
                Open 3D Design Studio ➔
              </Link>
            </div>
          </div>
        </section>

        {/* Wholesale Tier Pricing Table */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-black/[0.08] shadow-xl space-y-6">
          <div className="border-b border-black/[0.06] pb-4">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
              Transparent Factory Tiers
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-950">
              Bulk Wholesale Volume Pricing (GST &amp; Printing Included)
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              No hidden screen charges. Includes front &amp; back DTF printing, polybag packing, and express door delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BULK_TIERS.map((tier) => (
              <div
                key={tier.label}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative ${
                  tier.popular
                    ? 'border-[#FF4D24] bg-orange-50/40 shadow-md ring-2 ring-[#FF4D24]/20'
                    : 'border-black/10 bg-neutral-50/50 hover:border-black/20'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#FF4D24] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-sm font-black text-neutral-900">{tier.label}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">{tier.min} – {tier.max} units batch</p>
                  
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">240 GSM Tee:</span>
                      <strong className="text-neutral-950 font-mono text-sm">₹{tier.teePrice}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">380 GSM Hoodie:</span>
                      <strong className="text-neutral-950 font-mono text-sm">₹{tier.hoodiePrice}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Desk Mat:</span>
                      <strong className="text-neutral-950 font-mono text-sm">₹{tier.matPrice}</strong>
                    </div>
                  </div>
                </div>

                <Link
                  href="/support"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#161311] hover:bg-black text-white text-xs font-bold text-center no-underline transition-all block"
                >
                  Book Quote &amp; SLA ↗
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Why Rare Ember Bulk */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-black/[0.08] shadow-xs space-y-2">
            <span className="text-2xl block">🎨</span>
            <h3 className="text-base font-bold text-neutral-950">Free 3D Digital Proofs</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Send us your logo or artwork on WhatsApp, and our studio will generate a high-definition 3D proof in under 2 hours.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/[0.08] shadow-xs space-y-2">
            <span className="text-2xl block">⚡</span>
            <h3 className="text-base font-bold text-neutral-950">20% Advance Booking</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Lock in your manufacturing batch and print slot with only a 20% advance booking deposit. Pay the balance prior to dispatch.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/[0.08] shadow-xs space-y-2">
            <span className="text-2xl block">🚚</span>
            <h3 className="text-base font-bold text-neutral-950">Event Deadline Assurance</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Strict delivery timeline guarantee via BlueDart Air Express. Your merchandise reaches your venue before your event kicks off.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
