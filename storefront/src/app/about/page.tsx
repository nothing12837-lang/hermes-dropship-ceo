'use client';

import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export default function AboutPage() {
  return (
    <main className="page-top min-h-screen bg-[#FBF8F3] text-[#12100E] py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 md:px-8 flex flex-col gap-20">
        {/* HERO MISSION SECTION */}
        <section className="max-w-3xl">
          <div className="hero-rise hero-rise-1 inline-flex items-center gap-2 px-3 py-1 bg-white border border-black/[0.08] text-[11px] font-mono tracking-wider uppercase text-neutral-600 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D24]" />
            <span>01 — Origin & Philosophy</span>
          </div>

          <h1 className="hero-rise hero-rise-2 text-4xl md:text-6xl font-black tracking-tight text-[#12100E] leading-[1.08]">
            Heavyweight Cotton. <br />
            Boxy Silhouettes. <br />
            Constructed in Tirupur.
          </h1>

          <p className="hero-rise hero-rise-3 text-neutral-600 text-base md:text-lg mt-6 leading-relaxed font-normal max-w-2xl">
            Rare Ember is an independent Indian streetwear label built as an antidote to disposable fast fashion. We engineer garments from scratch using 240 GSM combed cotton jersey—proportioned with dropped shoulders, wide sleeves, and dense ribbed collars built to hold shape wash after wash.
          </p>
        </section>

        {/* 4 CORE VALUE PILLARS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              num: '01',
              title: 'Heavyweight Fabrication',
              desc: 'Custom-milled 240 GSM super-combed cotton. Pre-shrunk, substantial drape, and structured lines that never cling.',
            },
            {
              num: '02',
              title: 'Tirupur Craft Production',
              desc: 'Manufactured directly in India’s textile heartland. Flatlock and twin-needle edge finishing with 1x1 lycra-ribbed neckbands that resist stretching.',
            },
            {
              num: '03',
              title: 'Zero Waste Drops',
              desc: 'Every drop is produced in disciplined batches. No deadstock mountains, no warehouse liquidations, and zero synthetic poly blends on core apparel.',
            },
            {
              num: '04',
              title: 'Transparent Logistics',
              desc: 'Transparent pricing with nationwide courier dispatch included in every garment price. Verified doorstep tracking from factory floor to your city.',
            },
          ].map((c, idx) => (
            <ScrollReveal key={c.num} delay={idx * 80}>
              <div
                className="bg-white border border-black/[0.08] p-8 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-[#FF4D24] tracking-widest block mb-4">
                    SPEC // {c.num}
                  </span>
                  <h3 className="font-bold text-lg text-[#12100E] mb-2">{c.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </section>

        {/* HOW WE WORK (STREAMLINED 3-STEP PIPELINE) */}
        <ScrollReveal>
          <section className="bg-white border border-black/[0.08] p-8 md:p-12">
            <div className="max-w-xl mb-10">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#FF4D24] block mb-2">
                Production Pipeline
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#12100E]">
                From Raw Yarn to Finished Garment
              </h2>
              <p className="text-sm text-neutral-500 mt-2">
                Every Rare Ember piece moves through a rigorous three-stage production standard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: 'Phase 01',
                  title: 'Pattern & Silhouette',
                  desc: 'Architectural streetwear cuts with relaxed drop shoulders, widened chest circumferences, and clean hem lengths drafted for streetwear layering.',
                },
                {
                  step: 'Phase 02',
                  title: 'Textile Milling & Print',
                  desc: 'Combed long-staple cotton spun with OEKO-TEX certified reactive dyes and high-resolution screen or DTG graphics cured for abrasion resistance.',
                },
                {
                  step: 'Phase 03',
                  title: 'Inspection & Dispatch',
                  desc: 'Individual garment measurement, seam stress testing, and express air packaging dispatched directly via BlueDart, Delhivery, or India Post.',
                },
              ].map((s) => (
                <div key={s.step} className="border-t border-black/[0.08] pt-6 transition-all duration-300 hover:-translate-y-1">
                  <span className="font-mono text-xs text-[#FF4D24] uppercase tracking-wider block mb-2">
                    {s.step}
                  </span>
                  <h4 className="font-bold text-base text-[#12100E] mb-2">{s.title}</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* TRUST GUARANTEES GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <ScrollReveal delay={0}>
            <div className="p-6 bg-white border border-black/[0.08] h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest block mb-2">Delivery</span>
              <span className="font-bold text-sm text-[#12100E] block mb-1">Pan-India Courier</span>
              <span className="text-xs text-neutral-500">Fast tracked delivery included across 19,000+ PIN codes.</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={60}>
            <div className="p-6 bg-white border border-black/[0.08] h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest block mb-2">Policy</span>
              <span className="font-bold text-sm text-[#12100E] block mb-1">7-Day Returns</span>
              <span className="text-xs text-neutral-500">Hassle-free 7-day returns for any defect or return request.</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <div className="p-6 bg-white border border-black/[0.08] h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest block mb-2">Customer Care</span>
              <span className="font-bold text-sm text-[#12100E] block mb-1">Direct Support</span>
              <span className="text-xs text-neutral-500">Real support team available over WhatsApp and email.</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={180}>
            <div className="p-6 bg-white border border-black/[0.08] h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest block mb-2">Security</span>
              <span className="font-bold text-sm text-[#12100E] block mb-1">256-Bit SSL Razorpay</span>
              <span className="text-xs text-neutral-500">Bank-grade encrypted payments via UPI, Cards, and NetBanking.</span>
            </div>
          </ScrollReveal>
        </section>

        {/* CALL TO ACTION */}
        <ScrollReveal>
          <section className="bg-[#12100E] text-white p-10 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 rounded-2xl border border-white/10 transition-all duration-300 hover:border-white/20">
            <div className="max-w-xl">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#FF4D24] block mb-3">
                Drop Archive & Catalog
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                Explore Active Streetwear Drops
              </h2>
              <p className="text-neutral-400 text-sm mt-3 leading-relaxed">
                Boxy t-shirts, heavyweight winter hoodies, custom drops, and desk essentials.
              </p>
            </div>
            <div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF4D24] hover:bg-[#e03d15] text-white font-bold text-sm tracking-wide no-underline transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#FF4D24]/20"
              >
                <span>View Collection</span>
                <span>→</span>
              </Link>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </main>
  );
}
