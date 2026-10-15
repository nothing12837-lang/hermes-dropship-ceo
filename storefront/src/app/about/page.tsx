'use client';

import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export default function AboutPage() {
  return (
    <main className="page-top min-h-screen bg-[#FFFBF5] text-[#161311] py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col gap-16">
        {/* HERO MISSION SECTION */}
        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs font-bold text-neutral-800 shadow-2xs mb-4">
            <span className="w-2 h-2 rounded-full bg-[#FF4D24]" />
            <span>00 — Our Story & Mission</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-950 leading-tight">
            Handpicked Quality. <br />
            <span className="bg-gradient-to-r from-[#FF4D24] via-[#FF6B35] to-[#FFB800] bg-clip-text text-transparent">
              Delivered With Zero Surprises.
            </span>
          </h1>

          <p className="text-neutral-600 text-base md:text-lg mt-5 leading-relaxed font-medium">
            Rare Ember began with a simple vision: curating premium heavyweight streetwear, artisan drinkware, and creator desk essentials. We connect verified domestic manufacturing hubs directly with Indian and global buyers, backed by automated dispatch, live tracking, and strict buyer protection.
          </p>
        </section>

        {/* 4 CORE VALUE PILLARS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              e: '💎',
              t: 'Curated Catalog',
              d: 'Every item is handpicked for build quality, practical utility, and verified customer satisfaction ratings.',
            },
            {
              e: '🏭',
              t: 'Factory Verified',
              d: 'Direct partnerships with vetted domestic and global fulfillment hubs. Strict quality inspections before dispatch.',
            },
            {
              e: '🚚',
              t: 'Express Logistics',
              d: 'Pan-India 2–5 day delivery via BlueDart & India Post, plus fast global air cargo with live tracking.',
            },
            {
              e: '⚡',
              t: 'Automated Hub',
              d: 'Zero lag: orders are verified, routed to nearest warehouse hubs, and dispatched within 24 to 48 hours.',
            },
          ].map((c, i) => (
            <ScrollReveal key={c.t} delay={i * 60}>
              <div className="h-full rounded-[1.75rem] bg-white border border-black/[0.06] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all">
                <div className="text-3xl mb-3">{c.e}</div>
                <h3 className="font-black text-base text-neutral-900 mb-2">{c.t}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{c.d}</p>
              </div>
            </ScrollReveal>
          ))}
        </section>

        {/* HOW WE WORK (STREAMLINED 3-STEP PIPELINE) */}
        <section className="rounded-[2rem] bg-white border border-black/[0.06] p-6 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="max-w-xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF4D24] block mb-1">
              Fulfillment Architecture
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-950">
              How Rare Ember Works
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Transparent, automated, and backed by full buyer protection from click to doorstep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                t: 'Instant One-Click Order',
                d: 'Browse curated collections, verify your PIN code for instant arrival ETA, and check out securely via UPI, Cards, or COD.',
              },
              {
                n: '02',
                t: 'Automated Hub Dispatch',
                d: 'Our system automatically verifies payment, routes the order to the closest fulfillment facility, and packages it within 24 hours.',
              },
              {
                n: '03',
                t: 'Track to Your Doorstep',
                d: 'Live SMS & email tracking updates straight to your inbox. 7-day easy replacement policy for damaged or defective items.',
              },
            ].map((s) => (
              <div
                key={s.n}
                className="p-6 rounded-2xl bg-neutral-50/70 border border-black/[0.05] flex flex-col justify-between"
              >
                <div>
                  <span className="font-display text-2xl font-black text-[#FF4D24] block mb-2">
                    {s.n}
                  </span>
                  <h4 className="font-bold text-sm text-neutral-900 mb-2">{s.t}</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TRUST GUARANTEES GRID */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-black/[0.06] text-center">
            <span className="text-3xl block mb-2">🚚</span>
            <span className="font-bold text-sm text-neutral-900 block">Free Express Delivery</span>
            <span className="text-xs text-neutral-500">Every order, transparent ETA</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-black/[0.06] text-center">
            <span className="text-3xl block mb-2">🛡️</span>
            <span className="font-bold text-sm text-neutral-900 block">7-Day Replacement</span>
            <span className="text-xs text-neutral-500">Free replacement for defects</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-black/[0.06] text-center">
            <span className="text-3xl block mb-2">👑</span>
            <span className="font-bold text-sm text-neutral-900 block">24/7 Radha AI Care</span>
            <span className="text-xs text-neutral-500">Instant tracking & specs help</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-black/[0.06] text-center">
            <span className="text-3xl block mb-2">🔒</span>
            <span className="font-bold text-sm text-neutral-900 block">256-Bit SSL Razorpay</span>
            <span className="text-xs text-neutral-500">Bank-grade security gateway</span>
          </div>
        </section>

        {/* MEET RADHA CEO & EXECUTIVE BOARD BANNER */}
        <section className="rounded-[2rem] bg-gradient-to-r from-[#161311] via-[#241a15] to-[#161311] border border-amber-500/20 p-8 md:p-10 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold mb-3">
              <span>👑 24/7 Autonomous Corporate Leadership</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Meet Radha &amp; The AI Executive Board
            </h3>
            <p className="text-xs md:text-sm text-neutral-300 mt-2 leading-relaxed font-medium">
              Rare Ember is steered by 7 autonomous specialized agents — Radha (CEO), Vikram (Merchandising), Aarav (SEO), Pooja (Logistics), Kabir (CFO), Arjun (Procurement), and Meera (Marketing &amp; Creative) — continuously optimizing collections, premium quality, and fast domestic dispatch.
            </p>
          </div>
          <Link
            href="/team"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#FF4D24] to-[#FF8800] text-white font-extrabold text-xs tracking-tight shrink-0 shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            <span>Explore Executive Board</span>
            <span>➔</span>
          </Link>
        </section>

        {/* CALL TO ACTION */}
        <section className="rounded-[2.25rem] bg-[#161311] text-white p-8 md:p-14 text-center flex flex-col items-center shadow-2xl border border-white/10">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
            Explore Handpicked Catalog
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white max-w-xl">
            Ready to find your next favorite item?
          </h2>
          <p className="text-neutral-400 text-sm mt-3 max-w-md">
            New drops every Friday. Pan-India and global tracked shipping on every order.
          </p>
          <div className="mt-8">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#FF4D24] to-[#FF8800] text-white font-extrabold text-sm tracking-tight no-underline hover:brightness-110 active:scale-95 transition-all shadow-lg"
            >
              <span>Explore The Catalog</span>
              <span>⚡</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
