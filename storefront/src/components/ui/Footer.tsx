'use client';

import Link from 'next/link';
import Image from 'next/image';
import { COPY } from '@/lib/data/copy';

export default function Footer() {
  return (
    <footer className="w-full bg-[#12100E] text-white grain border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2 flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline group">
              <Image
                src="/flame-icon.png"
                alt="Rare Ember"
                width={26}
                height={26}
                className="object-contain"
              />
              <span className="text-xl font-black tracking-tight text-white">
                Rare Ember
              </span>
            </Link>
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-sm">
              {COPY.footer.blurb}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded bg-white/5 border border-white/10 text-white/70 text-[11px] font-medium">
                Pan-India Express Air Dispatch
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded bg-white/5 border border-white/10 text-white/70 text-[11px] font-medium">
                256-Bit SSL Encrypted
              </span>
            </div>
          </div>

          {/* Links Columns */}
          {COPY.footer.cols.map((c) => (
            <div key={c.title} className="flex flex-col gap-3">
              <div className="font-bold text-xs uppercase tracking-wider text-white/40">
                {c.title}
              </div>
              <div className="flex flex-col gap-2 text-xs font-medium">
                {c.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="text-white/70 no-underline hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div>{COPY.footer.bottom}</div>
          <div>{COPY.footer.signoff}</div>
        </div>
      </div>
    </footer>
  );
}
