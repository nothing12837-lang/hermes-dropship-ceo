'use client';

import Link from 'next/link';
import Image from 'next/image';
import { COPY } from '@/lib/data/copy';
import { GoogleCustomerReviewsBadge } from '@/components/google/GoogleCustomerReviewsBadge';

export default function Footer() {
  return (
    <footer className="w-full bg-[#12100E] text-white grain border-t border-white/10">
      <div className="max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12 py-16 relative z-10">
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
            <div className="flex flex-col gap-2 pt-1 text-xs text-white/70">
              <div className="flex items-start gap-2">
                <span className="text-sm">📍</span>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-mono font-bold tracking-wider">
                    Registered Operating Address
                  </span>
                  <span className="text-white/80 text-[11px] leading-relaxed">
                    Near Aerospace Park, Bagalur Main Road, Bangalore, Karnataka — 562107, India
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm">📞</span>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-mono font-bold tracking-wider">
                    Customer Care Helpline
                  </span>
                  <a href="tel:+919118211860" className="text-white/90 text-xs font-mono font-bold hover:text-[#E04F33] transition-colors">
                    +91 91182 11860
                  </a>
                  <span className="text-white/40 text-[10px] ml-2 font-mono">(Mon–Sat 9AM–8PM IST)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">✉️</span>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-mono font-bold tracking-wider">
                    Official Support Email
                  </span>
                  <a href="mailto:support@rareember.shop" className="text-white/90 text-xs font-mono font-bold hover:text-[#E04F33] transition-colors">
                    support@rareember.shop
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded bg-white/5 border border-white/10 text-white/70 text-[11px] font-medium">
                Pan-India Express Air Dispatch • Free Prepaid Delivery
              </span>
              <GoogleCustomerReviewsBadge variant="inline" />
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

        {/* Payment Methods Transparency Strip (Required for Google Merchant Center) */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs text-white/60">
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 font-bold">
              100% Secure Checkout:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-white/80">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">UPI (GPay / PhonePe / Paytm)</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Visa &amp; Mastercard</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">RuPay</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">NetBanking</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Cash on Delivery (COD)</span>
            </div>
          </div>
          <div className="text-[11px] text-white/40 font-mono">
            Encrypted by Razorpay PCI-DSS Level 1 Gateway
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div>{COPY.footer.bottom}</div>
          <div>{COPY.footer.signoff}</div>
        </div>
      </div>
    </footer>
  );
}
