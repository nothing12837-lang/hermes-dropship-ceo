'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ui/ProductCard';
import { ChapterHeading } from '@/components/ui/Story';
import { formatPrice, enforcePriceFloor, products } from '@/lib/data/products';

const steps = [
  {
    q: 'What is your current aesthetic or style focus?',
    key: 'space',
    options: [
      { id: 'streetwear', label: '👕 Oversized Streetwear Fits', desc: '240 GSM heavyweight tees, 380 GSM fleece hoodies, boxy cuts' },
      { id: 'desk', label: '🖥️ Coding & Gaming Desk Setup', desc: 'Extended 900x400 micro-weave mats, artisan ceramic mugs, desk pads' },
      { id: 'edc', label: '🎒 Daily Carry Essentials', desc: 'Reinforced canvas totes, commuter accessories, stainless drinkware' },
    ],
  },
  {
    q: 'What is your primary design aesthetic?',
    key: 'priority',
    options: [
      { id: 'cyber', label: '⚡ Cyberpunk & Tech Noir', desc: 'Neo-Tokyo mecha, Japanese ink ronin, glitch aesthetics' },
      { id: 'vintage', label: '🔥 Vintage & Acid Flame', desc: 'Heavy metal typography, Y2K dark angel, vintage mineral wash' },
      { id: 'dev', label: '💻 Dev Mode & Minimalist', desc: 'Git commit dreams, clean monochrome geometry, terminal vibes' },
    ],
  },
  {
    q: 'What is your budget for this drop upgrade?',
    key: 'budget',
    options: [
      { id: 'budget1', label: '🏷️ Under ₹999', desc: 'Single oversized tee, ceramic stoneware, or desk pad' },
      { id: 'budget2', label: '⚡ ₹999 – ₹1,999', desc: 'The Streetwear Duo bundles & heavyweight hoodies' },
      { id: 'budget3', label: '💎 ₹1,999+', desc: 'Creator Workstation complete bundle sets & drops' },
    ],
  },
];

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState('');

  const done = step >= steps.length;

  const results = useMemo(() => {
    if (!done) return [];
    let list = [...products];
    const space = answers.space;
    if (space === 'streetwear') {
      list = list.filter((p) => p.category === 'fashion');
    } else if (space === 'desk') {
      list = list.filter((p) => p.category === 'electronics' || (p.title && /desk|mug|pad|mat/i.test(p.title)));
    } else if (space === 'edc') {
      list = list.filter((p) => p.category === 'general' || (p.title && /tote|bag|bottle|tumbler|coaster/i.test(p.title)));
    }
    if (list.length === 0) list = [...products];
    return list.slice(0, 3);
  }, [done, answers]);

  const pick = (key: string, id: string) => {
    setAnswers((a) => ({ ...a, [key]: id }));
    setStep((s) => s + 1);
  };

  return (
    <main className="page-top" style={{ background: '#fffbf5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem' }}>
        <ChapterHeading index="✨" label="60-second style match" title={done ? `Curated for ${name || 'your space'}` : 'Discover your'} accent={done ? 'perfect items.' : 'aesthetic match.'} />

        {!done && (
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name or space title (e.g. Studio Room) — optional"
              style={{ width: '100%', padding: '0.9rem 1.3rem', borderRadius: '9999px', border: '1px solid #ebebeb', background: 'white', outline: 'none' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: '6px', borderRadius: '9999px', background: i <= step ? '#ff4d24' : '#ebebeb' }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '1.5rem', color: '#161311' }}>{steps[step].q}</h2>
              <div style={{ display: 'grid', gap: '0.8rem' }}>
                {steps[step].options.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => pick(steps[step].key, o.id)}
                    style={{ textAlign: 'left', background: 'white', border: '1px solid #ebebeb', borderRadius: '1.2rem', padding: '1.3rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                  >
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#161311' }}>{o.label}</div>
                      <div style={{ color: '#8a7b6b', fontSize: '0.9rem', marginTop: '0.2rem' }}>{o.desc}</div>
                    </div>
                    <span style={{ fontSize: '1.3rem', color: '#ff4d24' }}>→</span>
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} style={{ marginTop: '1.2rem', background: 'none', border: 'none', color: '#8a7b6b', cursor: 'pointer', fontWeight: 700 }}>
                  ← Back
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p style={{ color: '#52453e', marginBottom: '1.5rem', fontWeight: 600 }}>
                Based on your aesthetic preferences — here are the top factory-direct recommendations{name ? ` for ${name}` : ''}:
              </p>
              <div style={{ display: 'grid', gap: '1.2rem' }}>
                {results.map((rawP) => {
                  const p = enforcePriceFloor(rawP);
                  return (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      slug={p.slug}
                      imageUrl={p.image_url}
                      sizes={p.sizes}
                      tag="Aesthetic Match"
                      tagColor="#ff4d24"
                      tagBg="rgba(255,77,36,0.12)"
                      title={p.title}
                      desc={p.short}
                      price={formatPrice(p.price_inr || p.price)}
                      oldPrice={p.compareAtPrice ? formatPrice(p.compareAtPrice) : undefined}
                      rawPrice={p.price_inr || p.price}
                      rawComparePrice={p.compareAtPrice}
                    />
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <button onClick={() => { setStep(0); setAnswers({}); }} style={{ padding: '0.9rem 1.8rem', borderRadius: '9999px', border: '1px solid #ebebeb', background: 'white', fontWeight: 800, cursor: 'pointer' }}>
                  Retake quiz
                </button>
                <Link href="/shop" style={{ padding: '0.9rem 1.8rem', borderRadius: '9999px', background: '#161311', color: 'white', fontWeight: 800, textDecoration: 'none' }}>
                  Explore All Catalog →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
