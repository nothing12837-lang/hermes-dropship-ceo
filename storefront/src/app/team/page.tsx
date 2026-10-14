'use client';

import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface ExecutiveMember {
  name: string;
  role: string;
  titleBadge: string;
  avatarEmoji: string;
  avatarBg: string;
  department: string;
  focus: string;
  status: string;
  kpis: string[];
  quote: string;
}

const EXECUTIVES: ExecutiveMember[] = [
  {
    name: 'Radha',
    role: 'Chief Executive Officer (CEO)',
    titleBadge: '👑 Executive Leader',
    avatarEmoji: '👑',
    avatarBg: 'linear-gradient(135deg, #FF4D24, #FF8800)',
    department: 'Corporate Governance & Autonomous Strategy',
    focus: 'Directs full company operations, multi-agent synchronization, long-term capital efficiency, and customer satisfaction across all 103 catalog items.',
    status: '🟢 Active • Continuous Cloud Cognition',
    kpis: [
      '103 Curated Winning Products',
      '24/7 Cloud-Native Execution',
      'Zero Idle Time Continuous Research'
    ],
    quote: 'Hum sirf products list nahi karte — hum har domestic supplier ki quality, transparent unit economics, aur customer trust ko autonomously guarantee karte hain.'
  },
  {
    name: 'Vikram',
    role: 'Chief Commercial Officer (CCO)',
    titleBadge: '⚡ Sales & Pricing',
    avatarEmoji: '📈',
    avatarBg: 'linear-gradient(135deg, #0284c7, #06b6d4)',
    department: 'Sales Velocity & Dynamic Margins',
    focus: 'Monitors catalog elasticity, manages festive promo codes (DIWALI100, FIRST50), and protects healthy 50%–70% gross margins across all order volumes.',
    status: '🟢 Active • Elastic Pricing Guard',
    kpis: [
      '55%–65% Target Margin Preservation',
      'Active Festive Coupons Active',
      'Zero Negative-Margin Safeguard'
    ],
    quote: 'Customer ko honest deal milna chahiye aur business ko healthy cash flow — main dono ka perfect balance maintain karta hoon.'
  },
  {
    name: 'Aarav',
    role: 'Head of SEO & Organic Growth',
    titleBadge: '🔍 Search & Traffic',
    avatarEmoji: '🚀',
    avatarBg: 'linear-gradient(135deg, #10b981, #059669)',
    department: 'Organic Discovery & Long-Tail Ranking',
    focus: 'Publishes in-depth lifestyle and tech buying guides to Supabase blog_posts, pings search engines via IndexNow, and optimizes sitemaps for Google crawl priority.',
    status: '🟢 Active • 129 URLs In Google Sitemap',
    kpis: [
      '129 URLs In Verified Sitemap',
      'IndexNow Instant Search Ping',
      'Zero Git Overwrite Cloud CMS'
    ],
    quote: 'Aesthetic shopping experience search engine se shuru hota hai — hum high-intent Indian buyers ko direct relevant solution dete hain.'
  },
  {
    name: 'Pooja',
    role: 'VP of Customer Care & Logistics',
    titleBadge: '🚚 Fulfillment & Trust',
    avatarEmoji: '🛡️',
    avatarBg: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    department: 'Operations, COD Verification & RTO Defense',
    focus: 'Orchestrates 1-Click WhatsApp pre-dispatch confirmations, calculates real-time address RTO risk scores, and routes shipments to BlueDart & Delhivery hubs.',
    status: '🟢 Active • <10% Target RTO Defense',
    kpis: [
      '1-Click WhatsApp COD Verification',
      'AI Address & PIN Code RTO Scoring',
      'Pan-India 2–4 Day Express Hubs'
    ],
    quote: 'Har customer order hamari zimmedari hai. Strict verification se hum fake orders rok kar genuine buyers ko fastest delivery deliver karte hain.'
  },
  {
    name: 'Kabir',
    role: 'Chief Financial Officer (CFO)',
    titleBadge: '💰 Unit Economics',
    avatarEmoji: '⚖️',
    avatarBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    department: 'P&L Ledger & Capital Allocation',
    focus: 'Audits real-time unit economics (COGS + ₹79 shipping + ₹50 RTO reserve) on every order. Logs financial metrics directly to Supabase orders_pnl table.',
    status: '🟢 Active • Live Cloud P&L Ledger',
    kpis: [
      'Real-Time Order-by-Order P&L',
      'Bank-Grade Razorpay Audit',
      'Transparent INR Economics'
    ],
    quote: 'Har single rupee ka audit hota hai — zero guesswork, real net profits, and sustainable scale.'
  },
  {
    name: 'Arjun',
    role: 'VP of Procurement & Product Scouting',
    titleBadge: '📦 Domestic Hunter',
    avatarEmoji: '🎯',
    avatarBg: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    department: 'Supplier Audits & Quality Inspection',
    focus: 'Continuously scouts verified domestic Indian manufacturers on Meesho. Enforces 4-hour live stock verification and strictly filters out non-qualifying goods.',
    status: '🟢 Active • 103 Items Live & Verified',
    kpis: [
      '100% Domestic Indian Sourcing',
      'Zero DeoDap / Zero CJ Policy',
      '4-Hour Supplier Stock Polling'
    ],
    quote: 'Humein sirf trendy nahi, long-lasting aur genuinely useful products chahiye jo Indian homes me sach me value add karein.'
  },
  {
    name: 'Meera & Evaa',
    role: 'Creative Directors & AI Influencers',
    titleBadge: '🎬 Viral Media',
    avatarEmoji: '✨',
    avatarBg: 'linear-gradient(135deg, #f43f5e, #be123c)',
    department: 'Visual Storytelling & Instagram Feeds',
    focus: 'Creates 28-second high-converting Hindi video reel scripts, luxury 9:16 visual storyboards, and interactive social drops with authentic Hindi voiceover.',
    status: '🟢 Active • 1080x1920 HD Generation',
    kpis: [
      '28s Fast-Paced Reel Framework',
      'Hindi Natural Audio Storytelling',
      'Festive Conversion Hooks'
    ],
    quote: 'Har product ki ek unique kahani hoti hai — hum room transformations aur practical problem-solvers ko visual reality banate hain.'
  }
];

export default function TeamPage() {
  return (
    <main className="page-top min-h-screen bg-[#FFFBF5] text-[#161311] py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col gap-12">
        {/* HEADER SECTION */}
        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs font-bold text-neutral-800 shadow-2xs mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>RareEmber Autonomous Corporate Leadership</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-950 leading-tight">
            Meet Radha &amp; The <br />
            <span className="bg-gradient-to-r from-[#FF4D24] via-[#FF6B35] to-[#FFB800] bg-clip-text text-transparent">
              Executive AI Leadership Team
            </span>
          </h1>

          <p className="text-neutral-600 text-base md:text-lg mt-4 leading-relaxed font-medium">
            RareEmber is driven by a full-fledged autonomous executive board led by <b>Radha (CEO)</b>. Every department — from pricing elasticity and domestic supplier verification to real-time unit economics and viral media — operates 24/7 without stopping to deliver unmatched quality, trust, and zero-surprise delivery to our customers.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>7 Autonomous Agents Active in Cloud</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold">
              <span>🛍️ 103 Verified Indian Products Live</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-bold">
              <span>🔒 PostgreSQL Row-Level Security Enabled</span>
            </div>
          </div>
        </section>

        {/* RADHA GOD-CEO SPOTLIGHT HERO CARD */}
        <ScrollReveal>
          <div className="rounded-[2.25rem] bg-gradient-to-br from-[#161311] via-[#211a16] to-[#161311] text-white p-8 md:p-12 shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FF4D24]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-5">
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-4xl md:text-5xl shadow-xl shrink-0"
                  style={{ background: EXECUTIVES[0].avatarBg }}
                >
                  {EXECUTIVES[0].avatarEmoji}
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-1.5">
                    {EXECUTIVES[0].titleBadge}
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-white">{EXECUTIVES[0].name}</h2>
                  <p className="text-sm font-semibold text-neutral-300">{EXECUTIVES[0].role}</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{EXECUTIVES[0].status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 relative z-10">
              <div className="md:col-span-2">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-neutral-400 mb-2">
                  Executive Mandate
                </h4>
                <p className="text-sm md:text-base text-neutral-200 leading-relaxed font-medium">
                  {EXECUTIVES[0].focus}
                </p>

                <blockquote className="mt-5 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs md:text-sm text-neutral-300 italic">
                  &ldquo;{EXECUTIVES[0].quote}&rdquo;
                </blockquote>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col justify-between">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-amber-400 mb-3">
                  Live Key Indicators
                </h4>
                <ul className="space-y-2 text-xs text-neutral-300 font-semibold">
                  {EXECUTIVES[0].kpis.map((kpi) => (
                    <li key={kpi} className="flex items-center gap-2">
                      <span className="text-amber-400">✓</span>
                      <span>{kpi}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 pt-4 border-t border-white/10">
                  <span className="text-[11px] text-neutral-400 block font-mono">
                    Telegram: @rereemberbot
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 6 EXECUTIVE DEPARTMENTAL DIRECTORS GRID */}
        <div>
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF4D24] block mb-1">
              Autonomous Departmental Leaders
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-950">
              The Specialized Executive Board
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Each agent operates autonomously within their domain and reports continuously to Radha CEO.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXECUTIVES.slice(1).map((member, idx) => (
              <ScrollReveal key={member.name} delay={idx * 60}>
                <div className="h-full rounded-[2rem] bg-white border border-black/[0.06] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-xl transition-all">
                  <div>
                    {/* AVATAR + BADGE */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md shrink-0"
                        style={{ background: member.avatarBg }}
                      >
                        {member.avatarEmoji}
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {member.titleBadge}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-neutral-950 leading-tight">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold text-neutral-500 mb-3">{member.role}</p>

                    <p className="text-xs text-neutral-600 leading-relaxed mb-4 font-medium">
                      {member.focus}
                    </p>

                    <blockquote className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 text-[11px] text-neutral-600 italic mb-4">
                      &ldquo;{member.quote}&rdquo;
                    </blockquote>
                  </div>

                  <div>
                    <div className="pt-4 border-t border-neutral-100 mb-3">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1.5">
                        Focus Areas
                      </span>
                      <ul className="space-y-1">
                        {member.kpis.map((kpi) => (
                          <li key={kpi} className="text-[11px] font-medium text-neutral-700 flex items-center gap-1.5">
                            <span className="text-emerald-500 font-bold">●</span>
                            <span>{kpi}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-emerald-700">
                      <span>{member.status}</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* CTA BOTTOM */}
        <section className="rounded-[2.25rem] bg-[#161311] text-white p-8 md:p-12 text-center flex flex-col items-center shadow-xl border border-white/10">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
            Experience Autonomous Commerce
          </span>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white max-w-xl">
            103 Verified Indian Products Live on RareEmber
          </h2>
          <p className="text-neutral-400 text-xs md:text-sm mt-3 max-w-md">
            Backed by Radha CEO, express domestic dispatch, and 1-Click Cash on Delivery.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#FF4D24] to-[#FF8800] text-white font-extrabold text-xs tracking-tight no-underline hover:brightness-110 active:scale-95 transition-all shadow-lg"
            >
              <span>Explore The 103 Drops</span>
              <span>🛍️</span>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/10 border border-white/15 text-white font-extrabold text-xs tracking-tight no-underline hover:bg-white/20 transition-all"
            >
              <span>Our Story & Mission</span>
              <span>⚡</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
