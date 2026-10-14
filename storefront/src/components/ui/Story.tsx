'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

export function ChapterHeading({
  index,
  label,
  title,
  accent,
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  accent?: string;
}) {
  return (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            background: '#2d2420',
            color: 'white',
            padding: '0.3rem 0.8rem',
            borderRadius: '9999px',
          }}
        >
          {index}
        </span>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#ff6b35',
          }}
        >
          {label}
        </span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
      </div>
      <h2
        style={{
          fontSize: 'clamp(2.4rem,6vw,4.8rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 0.95,
          color: '#2d2420',
        }}
      >
        {title} {accent && <span style={{ color: '#ff6b35' }}>{accent}</span>}
      </h2>
    </div>
  );
}

export function StoryText({ text }: { text: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const words = text.split(' ');
  return (
    <p ref={ref} style={{ fontSize: 'clamp(1.3rem,2.6vw,2rem)', lineHeight: 1.4, fontWeight: 500, color: '#2d2420', letterSpacing: '-0.01em' }}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ delay: Math.min(i * 0.03, 1.2), duration: 0.5 }}
          style={{ display: 'inline-block', marginRight: '0.35em' }}
        >
          {w}
        </motion.span>
      ))}
    </p>
  );
}

// True magnetic button — drifts toward cursor on hover, springs back on leave
export function MagneticButton({
  children,
  onClick,
  variant = 'primary',
  strength = 0.3,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'dark' | 'ghost';
  strength?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const bg = variant === 'primary' ? '#ff6b35' : variant === 'dark' ? '#321004' : 'white';
  const color = variant === 'ghost' ? '#321004' : 'white';
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    setOffset({ x: x * strength, y: y * strength });
  };
  const reset = () => setOffset({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      animate={{ x: offset.x, y: offset.y, scale: offset.x === 0 ? 1 : 1.05 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{
        padding: '1.1rem 2.6rem',
        background: bg,
        color,
        borderRadius: '9999px',
        fontWeight: 800,
        fontSize: '1rem',
        border: variant === 'ghost' ? '1px solid #ebebeb' : 'none',
        cursor: 'pointer',
        minHeight: '44px',
        boxShadow: variant === 'primary' ? '0 10px 30px rgba(255,107,53,0.35)' : '0 8px 24px rgba(0,0,0,0.12)',
      }}
    >
      {children}
    </motion.button>
  );
}
