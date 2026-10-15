'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { COPY } from '@/lib/data/copy';

function RareEmberLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <Image
      src="/flame-icon.png"
      alt="RareEmber"
      width={32}
      height={32}
      className={`object-contain ${className}`}
    />
  );
}

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/dots')) {
    return null;
  }
  return (
    <footer className="w-full relative overflow-hidden text-white grain bg-gradient-night">
      {/* Ambient aurora glow */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="aurora-blob" style={{ width: 460, height: 460, top: -160, left: -120, background: 'rgba(255,77,36,0.30)' }} />
        <span className="aurora-blob aurora-blob-b" style={{ width: 380, height: 380, bottom: -140, right: -100, background: 'rgba(247,183,51,0.22)' }} />
        <span className="aurora-blob aurora-blob-c" style={{ width: 300, height: 300, top: 30, right: '35%', background: 'rgba(232,36,75,0.18)' }} />
      </div>

      {/* Gradient top edge */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg, #FF9A3D, #FF4D24 40%, #E8244B 70%, #F7B733)' }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-2 flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline group">
              <span className="relative">
                <RareEmberLogo className="w-8 h-8 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" />
                <span
                  aria-hidden
                  className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"
                  style={{ background: 'radial-gradient(circle, rgba(255,77,36,0.6), transparent 70%)' }}
                />
              </span>
              <span className="font-display text-2xl font-black tracking-tight text-white">
                Rare Ember
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              {COPY.footer.blurb}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.07] border border-white/10 text-white/80 text-xs font-semibold backdrop-blur-md">
                <span>🚚</span> Pan-India & Global Dispatch
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.07] border border-white/10 text-white/80 text-xs font-semibold backdrop-blur-md">
                <span>🔒</span> 256-Bit SSL Gateway
              </span>
            </div>
          </div>

          {/* Links Cols */}
          {COPY.footer.cols.map((c) => (
            <div key={c.title} className="flex flex-col gap-3">
              <div className="font-extrabold text-[11px] tracking-[0.18em] uppercase text-[#F7B733]/85">
                {c.title}
              </div>
              <div className="flex flex-col gap-2.5 text-sm font-medium">
                {c.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="text-white/65 no-underline hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Large Aesthetic Watermark */}
        <div className="mt-16 pt-8 border-t border-white/[0.08]">
          <div
            className="text-[clamp(2.5rem,10vw,8rem)] font-black select-none whitespace-nowrap text-center leading-none tracking-tighter"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,77,36,0.10) 55%, transparent)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Rare Ember
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex justify-between items-center flex-wrap gap-4 text-white/45 text-xs font-medium">
          <span>{COPY.footer.bottom}</span>
          <span className="text-gradient-gold font-semibold">{COPY.footer.signoff}</span>
        </div>
      </div>
    </footer>
  );
}
