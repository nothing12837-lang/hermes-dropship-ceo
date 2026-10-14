'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  return (
    <footer className="w-full bg-white/80 backdrop-blur-2xl border-t border-black/[0.06] overflow-hidden text-neutral-900">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-2 flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-2 no-underline">
              <RareEmberLogo className="w-7 h-7" />
              <span className="font-display text-2xl font-black tracking-tight text-neutral-950">
                rareember<span className="text-[#FF4D24]">.</span>
              </span>
            </Link>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
              {COPY.footer.blurb}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                <span>🚚</span> Pan-India & Global Dispatch
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                <span>🔒</span> 256-Bit SSL Gateway
              </span>
            </div>
          </div>

          {/* Links Cols */}
          {COPY.footer.cols.slice(0, 3).map((c) => (
            <div key={c.title} className="flex flex-col gap-3">
              <div className="font-extrabold text-xs tracking-wider uppercase text-neutral-400">
                {c.title}
              </div>
              <div className="flex flex-col gap-2.5 text-sm font-medium">
                {c.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="text-neutral-600 no-underline hover:text-black transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Large Aesthetic Watermark */}
        <div className="mt-16 pt-8 border-t border-black/[0.04]">
          <div className="text-[clamp(2.5rem,10vw,8rem)] font-black text-black/[0.03] select-none whitespace-nowrap text-center leading-none tracking-tighter">
            rareember
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex justify-between items-center flex-wrap gap-4 text-neutral-400 text-xs font-medium">
          <span>{COPY.footer.bottom}</span>
          <span>{COPY.footer.signoff}</span>
        </div>
      </div>
    </footer>
  );
}
