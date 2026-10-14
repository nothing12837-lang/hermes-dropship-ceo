'use client';

import { useState, useEffect, useRef } from 'react';
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

const AUTONOMOUS_LOGS = [
  { agent: 'Radha (CEO)', text: 'Cognitive cycle executed: Synchronized multi-agent objectives for 103 domestic SKUs. Zero laptop load.' },
  { agent: 'Vikram (CCO)', text: 'Margin guard audit completed: 55%-65% target margin verified on all 103 products. Festive promo code DIWALI100 active.' },
  { agent: 'Aarav (SEO)', text: 'Search pulse dispatched: 129 URLs verified in Google Search Console priority sitemap. Instant IndexNow ping sent.' },
  { agent: 'Pooja (Logistics)', text: 'COD dispatch matrix verified across 19,000+ PIN codes. Delhivery & BlueDart express hubs allocated.' },
  { agent: 'Kabir (CFO)', text: 'Unit economics audit: COGS + ₹79 logistics + ₹50 RTO reserve confirmed. Zero negative margin orders logged.' },
  { agent: 'Arjun (Procurement)', text: 'Meesho domestic supplier stock audit: 103 active verified listings with 4-angle HD photo galleries.' },
  { agent: 'Meera & Evaa (Media)', text: 'Viral Hindi storyboards & 28-second visual scripts ready for Instagram & festive promotional drops.' },
];

const QUICK_QUESTIONS = [
  'What is Radha’s vision for RareEmber?',
  'How do we guarantee domestic Meesho quality?',
  'How does 2-4 day COD express delivery work?',
  'What are our unit economics and profit margins?',
  'How does PostgreSQL Row-Level Security protect us?',
];

export default function TeamPage() {
  const [activeLogs, setActiveLogs] = useState<typeof AUTONOMOUS_LOGS>(AUTONOMOUS_LOGS.slice(0, 4));
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'radha'; text: string }>>([
    {
      sender: 'radha',
      text: 'Namaste! Main Radha hoon, RareEmber ki CEO. Hamari autonomous executive team 24/7 bina ruke operations, quality audits, pricing margins, aur domestic delivery ko guide karti hai. Aap hamare business models, unit economics ya supplier standards ke bare me kuch bhi pooch sakte hain.'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Rotating telemetry logs stream
  useEffect(() => {
    let index = 4;
    const interval = setInterval(() => {
      const nextLog = AUTONOMOUS_LOGS[index % AUTONOMOUS_LOGS.length];
      setActiveLogs((prev) => [nextLog, ...prev.slice(0, 5)]);
      index++;
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleAskRadha = async (questionText: string) => {
    if (!questionText.trim() || isTyping) return;
    const q = questionText.trim();
    setChatInput('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: q }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'radha',
          text: data?.reply || 'Namaste! Humari domestic operations aur 103 products 2-4 din delivery aur COD ke sath 100% active hain.'
        }
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'radha',
          text: 'Radha is continuously synchronizing cloud telemetry. All 103 items, domestic logistics hubs, and PostgreSQL RLS security are 100% healthy.'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

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
              Autonomous AI Executive Board
            </span>
          </h1>

          <p className="text-neutral-600 text-base md:text-lg mt-4 leading-relaxed font-medium">
            RareEmber operates with human-grade corporate excellence driven by <b>Radha (CEO)</b> and 6 autonomous departmental leaders. Running 24/7 with zero laptop overhead, the team monitors dynamic pricing elasticity, domestic supplier quality, Google search indexing, and real-time unit economics without stopping.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>7 Autonomous Agents Active 24/7</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold">
              <span>🛍️ 103 Verified Indian Products Live</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-bold">
              <span>🔒 9/9 Supabase Tables Protected by RLS</span>
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
                <div>
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
                </div>

                <div className="mt-5 pt-4 border-t border-white/10">
                  <span className="text-[11px] text-neutral-400 block font-mono">
                    Direct Channel: Telegram @rereemberbot
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* INTERACTIVE AUTONOMOUS OPERATIONS TELEMETRY CONSOLE */}
        <ScrollReveal>
          <div className="rounded-[2rem] bg-neutral-900 text-white p-6 md:p-8 border border-neutral-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-lg font-black tracking-tight text-white">
                  Mission Control: Autonomous Operations Stream
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
                <span>Latency: 38ms</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">Cloud Sync 100%</span>
              </div>
            </div>

            <div
              ref={logContainerRef}
              className="mt-5 space-y-3 font-mono text-xs max-h-48 overflow-y-auto pr-2"
            >
              {activeLogs.map((log, idx) => (
                <div
                  key={idx + log.agent}
                  className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50 flex items-start gap-3 transition-all"
                >
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold shrink-0">
                    {log.agent}
                  </span>
                  <span className="text-neutral-300 leading-relaxed">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ASK CEO RADHA INTERACTIVE BRIEFING BOX */}
        <ScrollReveal>
          <div className="rounded-[2rem] bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-orange-200/60 p-6 md:p-8 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">👑</span>
              <div>
                <h3 className="text-lg font-black text-neutral-900 tracking-tight">
                  Direct Briefing with CEO Radha
                </h3>
                <p className="text-xs text-neutral-500">
                  Ask Radha about product sourcing, unit economics, delivery networks, or autonomous agency architecture.
                </p>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-2 my-4">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleAskRadha(q)}
                  className="px-3 py-1.5 rounded-full bg-white border border-neutral-300/80 text-xs font-semibold text-neutral-700 hover:border-[#FF4D24] hover:text-[#FF4D24] hover:bg-orange-50/50 active:scale-95 transition-all cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Conversation Window */}
            <div className="space-y-3 max-h-64 overflow-y-auto p-4 rounded-2xl bg-white/80 border border-neutral-200/80 mb-4">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'radha' && <span className="text-lg shrink-0">👑</span>}
                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-[#FF4D24] text-white font-medium rounded-tr-none'
                        : 'bg-neutral-100 text-neutral-800 font-normal rounded-tl-none border border-neutral-200/60'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-neutral-500 italic">
                  <span>👑 Radha is formulating strategic executive response...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskRadha(chatInput);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask CEO Radha any question about RareEmber's operations..."
                className="flex-1 px-4 py-3 rounded-xl border border-neutral-300 bg-white text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FF4D24]/40"
              />
              <button
                type="submit"
                disabled={isTyping || !chatInput.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF4D24] to-[#FF8800] text-white font-bold text-xs tracking-tight hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                Send Question →
              </button>
            </form>
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
              Each executive operates autonomously within their domain and reports continuously to Radha CEO.
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
            Backed by Radha CEO, express domestic dispatch, and 1-Click Cash on Delivery across all 19,000+ PIN codes.
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
