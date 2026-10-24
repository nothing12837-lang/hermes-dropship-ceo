'use client';

import { useState } from 'react';
import Link from 'next/link';
import { COPY } from '@/lib/data/copy';
import { AnimatePresence, motion } from 'framer-motion';
import { products } from '@/lib/data/products';
import { blogPosts, faqs, lifestyleTips } from '@/lib/data/content';
import { ScrollReveal } from './ScrollReveal';

// — Shop by Department —
export function ShopByDepartment({ onPick }: { onPick?: (dept: string) => void }) {
  const cards = [
    { id: 'fashion', title: 'Heavyweight Streetwear', sub: '240 GSM drop-shoulder tees, bio-washed cotton', emoji: '👕', color: '#ff4d24', bg: '#fff7ed' },
    { id: 'home-garden', title: 'Artisan Drinkware', sub: 'Stoneware mugs, matte tumblers, coasters', emoji: '☕', color: '#16a34a', bg: '#f0fdf4' },
    { id: 'electronics', title: 'Desk & Creator Gear', sub: '900x400 extended mats, mousepads, EDC', emoji: '🖥️', color: '#2563eb', bg: '#eff6ff' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
      {cards.map((c) => {
        const count = products.filter((p) => p.category === c.id).length || 8;
        const inner = (
          <div
            style={{
              background: c.bg,
              border: `1px solid ${c.color}33`,
              borderRadius: '1.4rem',
              padding: '1.8rem',
              cursor: 'pointer',
              transition: 'transform 0.25s',
            }}
            onMouseEnter={(e) => ((e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)'))}
            onMouseLeave={(e) => ((e.currentTarget.style.transform = 'none'))}
            onClick={() => onPick?.(c.id)}
          >
            <div style={{ fontSize: '2.6rem' }}>{c.emoji}</div>
            <div style={{ fontWeight: 900, fontSize: '1.25rem', marginTop: '0.8rem', color: '#161311' }}>{c.title}</div>
            <div style={{ color: '#8a7b6b', fontSize: '0.9rem', marginTop: '0.2rem' }}>{c.sub}</div>
            <div style={{ marginTop: '0.8rem', fontWeight: 800, fontSize: '0.85rem', color: c.color }}>
              {count}+ Drops →
            </div>
          </div>
        );
        return onPick ? <div key={c.id}>{inner}</div> : (
          <Link key={c.id} href={`/shop?cat=${c.id}`} style={{ textDecoration: 'none' }}>{inner}</Link>
        );
      })}
    </div>
  );
}

export const ShopByPet = ShopByDepartment;

// — Trust bar —
export function TrustBadges() {
  const items = [...COPY.trustBar, { icon: '🔒', title: 'Secure Razorpay', sub: 'UPI, Cards & Netbanking' }];
  const list = items.map((b) => ({ e: (b as { icon: string }).icon, t: b.title, s: (b as { sub: string }).sub }));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem' }}>
      {list.map((b) => (
        <div key={b.t} style={{ background: 'white', border: '1px solid #ebebeb', borderRadius: '1rem', padding: '1.1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem' }}>{b.e}</div>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', marginTop: '0.4rem' }}>{b.t}</div>
          <div style={{ fontSize: '0.75rem', color: '#8a7b6b' }}>{b.s}</div>
        </div>
      ))}
    </div>
  );
}

// — AI Aesthetic Match widget: 3 questions inline, suggests best product —
export function PetMatchWidget({ compact = false }: { compact?: boolean }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const qs = [
    { key: 'category', q: 'What is your current rotation focus?', opts: [{ id: 'streetwear', l: '👕 Oversized Streetwear' }, { id: 'desk', l: '🖥️ Workstation Gear' }, { id: 'drinkware', l: '☕ Artisan Drinkware' }] },
    { key: 'vibe', q: 'Choose your graphic vibe?', opts: [{ id: 'cyber', l: '⚡ Cyber Mecha' }, { id: 'metal', l: '🔥 Heavy Metal' }, { id: 'dev', l: '💻 Dev Mode' }] },
    { key: 'budget', q: 'Preferred pricing?', opts: [{ id: 'b1', l: '🏷️ Under ₹999' }, { id: 'b2', l: '⚡ ₹999 - ₹1,899' }, { id: 'b3', l: '💎 Bundles' }] },
  ];
  const done = step >= qs.length;
  const match = (() => {
    if (!done) return null;
    let list = [...products];
    if (answers.category === 'desk') list = list.filter((p) => p.category === 'electronics' || p.category === 'general');
    else if (answers.category === 'drinkware') list = list.filter((p) => p.category === 'home-garden');
    else list = list.filter((p) => p.category === 'fashion');
    return list[0] || products[0];
  })();

  return (
    <div style={{ background: 'white', border: '1px solid #ebebeb', borderRadius: '1.6rem', padding: compact ? '1.5rem' : '2rem' }}>
      <div style={{ fontWeight: 800, letterSpacing: '0.2em', fontSize: '0.72rem', color: '#ff4d24' }}>AI STYLE MATCH ✨</div>
      {!done ? (
        <>
          <div style={{ fontWeight: 900, fontSize: '1.15rem', margin: '0.6rem 0 1rem', color: '#161311' }}>{qs[step].q} ({step + 1}/3)</div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {qs[step].opts.map((o) => (
              <button
                key={o.id}
                onClick={() => { setAnswers((a) => ({ ...a, [qs[step].key]: o.id })); setStep(step + 1); }}
                style={{ padding: '0.8rem 1.3rem', borderRadius: '9999px', border: '1px solid #ebebeb', background: '#fffbf5', fontWeight: 800, cursor: 'pointer', minHeight: '44px' }}
              >
                {o.l}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: '#8a7b6b' }}>
            {step > 0 ? <button onClick={() => setStep(step - 1)} style={{ background: 'none', border: 'none', color: '#8a7b6b', cursor: 'pointer', fontWeight: 700 }}>← Back</button> : <Link href="/quiz" style={{ color: '#ff4d24', fontWeight: 700 }}>Full 60-second quiz →</Link>}
          </div>
        </>
      ) : match ? (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.8rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '1rem', background: match.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
            {match.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669' }}>AI CURATED PICK ✓</div>
            <div style={{ fontWeight: 900, color: '#161311' }}>{match.title}</div>
            <div style={{ fontSize: '0.85rem', color: '#8a7b6b' }}>{match.short.slice(0, 60)}…</div>
          </div>
          <Link href={`/product/${((match as any)?.slug || match.id).replace(/^meesho-/, '')}`} style={{ background: '#ff4d24', color: 'white', padding: '0.7rem 1.2rem', borderRadius: '9999px', fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            View Drop →
          </Link>
        </div>
      ) : null}
      {done && (
        <button onClick={() => { setStep(0); setAnswers({}); }} style={{ marginTop: '0.8rem', background: 'none', border: 'none', color: '#8a7b6b', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
          Retake
        </button>
      )}
    </div>
  );
}

// — Quiz teaser —
export function QuizTeaser() {
  return (
    <div style={{ background: '#161311', color: 'white', borderRadius: '2rem', padding: '3rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '2rem', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
      <div>
        <div style={{ color: '#fed7aa', fontWeight: 800, letterSpacing: '0.25em', fontSize: '0.75rem' }}>60-SECOND STYLE MATCH</div>
        <h3 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.03em', marginTop: '0.8rem', lineHeight: 1 }}>
          Tell us about your space.<br />We’ll match the drop.
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.65)', marginTop: '1rem' }}>Room vibe, utility need, budget → personalized recommendations at direct factory rates.</p>
        <Link href="/quiz" style={{ display: 'inline-block', marginTop: '1.5rem', background: '#ff4d24', color: 'white', padding: '1rem 2rem', borderRadius: '9999px', fontWeight: 800, textDecoration: 'none' }}>
          Find my match →
        </Link>
      </div>
      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
        {['💻 Clean Desk Setup', '🪴 Minimalist Ceramic', '⚡ Fast GaN Power', '🕶️ Polarized Shades', '🕯️ Ambient Light', '🚚 Pan-India COD'].map((t) => (
          <span key={t} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.7rem 1.2rem', borderRadius: '9999px', fontWeight: 700 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// — Curator Picks & Design Advice —
export function VetSection() {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '2rem', padding: '3rem 2rem' }}>
      <div style={{ fontWeight: 800, letterSpacing: '0.25em', fontSize: '0.75rem', color: '#ff4d24' }}>RAREMBER STUDIO — CURATOR INSIGHTS</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.2rem', marginTop: '1.5rem' }}>
        {lifestyleTips.map((v, i) => (
          <ScrollReveal key={i} delay={i * 100}>
            <div style={{ background: 'white', borderRadius: '1.2rem', padding: '1.6rem', border: '1px solid #ebebeb' }}>
              <div style={{ fontSize: '2rem' }}>{v.emoji}</div>
              <p style={{ fontWeight: 600, lineHeight: 1.6, marginTop: '0.8rem', color: '#334155' }}>{v.tip}</p>
              <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', fontWeight: 800, color: '#ff4d24' }}>{v.name}</div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}

// — Blog preview —
export function BlogPreview() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.2rem' }}>
      {blogPosts.map((b) => (
        <Link key={b.slug} href={`/blog/${b.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: b.wash, borderRadius: '1.4rem', padding: '2rem', minHeight: '240px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '2.2rem' }}>{b.emoji}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '1rem', opacity: 0.6 }}>
              {b.category} • {b.readTime}
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.15rem', lineHeight: 1.3, marginTop: '0.5rem', color: '#161311' }}>{b.title}</div>
            <div style={{ marginTop: 'auto', paddingTop: '1rem', fontWeight: 800, fontSize: '0.85rem', color: '#ff4d24' }}>Read guide →</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// — FAQ accordion —
export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div style={{ display: 'grid', gap: '0.7rem' }}>
      {faqs.map((f, i) => (
        <div key={i} style={{ background: 'white', border: '1px solid #ebebeb', borderRadius: '1rem', overflow: 'hidden' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{ width: '100%', textAlign: 'left', padding: '1.2rem 1.4rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}
          >
            {f.q}
            <span style={{ color: '#ff4d24' }}>{open === i ? '−' : '+'}</span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ padding: '0 1.4rem 1.3rem', color: '#52453e', lineHeight: 1.7 }}>{f.a}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// — Loyalty banner —
export function LoyaltyBanner({ points = 0 }: { points?: number }) {
  return (
    <div style={{ background: 'linear-gradient(135deg,#fff3e0,#fed7aa)', borderRadius: '1.6rem', padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ fontSize: '2.5rem' }}>🎁</div>
      <div style={{ flex: 1, minWidth: '220px' }}>
        <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#161311' }}>Rare Ember Club — earn {points} VIP pts today</div>
        <div style={{ color: '#52453e', fontSize: '0.92rem' }}>1 pt per ₹10 • 100 pts = ₹100 off • Secret Festive Codes • Priority Dispatch</div>
      </div>
      <Link href="/shop" style={{ background: '#161311', color: 'white', padding: '0.9rem 1.8rem', borderRadius: '9999px', fontWeight: 800, textDecoration: 'none' }}>
        Explore Catalog →
      </Link>
    </div>
  );
}

// — Live support assistant —
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ me: boolean; t: string }[]>([
    { me: false, t: 'Hi! Welcome to Rare Ember. Ask us about dispatch ETAs, Cash on Delivery, or product specifications!' },
  ]);
  const [input, setInput] = useState('');
  const send = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setInput('');
    setMsgs((m) => [...m, { me: true, t: q }]);
    setTimeout(() => {
      const lq = q.toLowerCase();
      let a = 'For product specs, check the detailed breakdown on any product page. Free express delivery on all orders.';
      if (lq.includes('track') || lq.includes('where')) a = 'You can track live at /track with your email. Need instant help? support@rareember.shop replies within hours.';
      else if (lq.includes('ship') || lq.includes('delivery')) a = 'Orders dispatch within 24-48 hours via BlueDart & Delhivery with live SMS & email tracking.';
      else if (lq.includes('cod') || lq.includes('cash')) a = 'Cash on Delivery is available across 19,000+ PIN codes in India. Pay only when package reaches your door.';
      else if (lq.includes('return') || lq.includes('refund')) a = '7-day easy replacement policy for damaged or defective items — email support@rareember.shop or WhatsApp us for instant replacement.';
      else if (lq.includes('quiz')) a = 'Take the 60-second style quiz at /quiz to find the ideal match for your space.';
      setMsgs((m) => [...m, { me: false, t: a }]);
    }, 600);
  };
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{ position: 'fixed', bottom: '1.4rem', right: '1.4rem', zIndex: 180, width: '58px', height: '58px', borderRadius: '50%', background: '#ff4d24', color: 'white', border: 'none', fontSize: '1.6rem', cursor: 'pointer', boxShadow: '0 12px 30px rgba(255,77,36,0.4)' }}
        aria-label="Chat with Support"
      >
        {open ? '✕' : '💬'}
      </button>
      {open && (
        <div style={{ position: 'fixed', bottom: '5.2rem', right: '1.4rem', zIndex: 180, width: 'min(340px,90vw)', background: 'white', borderRadius: '1.2rem', border: '1px solid #ebebeb', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '440px' }}>
          <div style={{ background: '#161311', color: 'white', padding: '1rem 1.2rem', fontWeight: 800 }}>Rare Ember Support <span style={{ opacity: 0.6, fontWeight: 400, fontSize: '0.8rem' }}>• online</span></div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.me ? 'flex-end' : 'flex-start', background: m.me ? '#ff4d24' : '#f9f9f9', color: m.me ? 'white' : '#161311', padding: '0.7rem 1rem', borderRadius: '1rem', maxWidth: '85%', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {m.t}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.8rem', borderTop: '1px solid #ebebeb' }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask support…" style={{ flex: 1, padding: '0.7rem 1rem', borderRadius: '9999px', border: '1px solid #ebebeb', outline: 'none' }} />
            <button onClick={send} style={{ background: '#161311', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}
