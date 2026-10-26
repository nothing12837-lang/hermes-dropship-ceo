import Link from 'next/link';
import { Truck, ShieldCheck, Banknote, RefreshCw } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { formatPrice, computeDiscount, getGarmentSpecBadge, type Product } from '@/lib/data/products';
import { getProductsFromDB } from '@/lib/products-server';

export const revalidate = 60; // 60s ISR: Edge cached in Mumbai (bom1)

export const metadata = {
  title: {
    absolute: 'Rare Ember — Independent Heavyweight Streetwear & Graphic Drops',
  },
  description: '240 GSM combed cotton streetwear, full sleeve silhouettes & original graphic drops. Tailored in India, dispatched via express air with 7-day returns.',
  alternates: {
    canonical: 'https://www.rareember.shop',
  },
};

function toCard(p: Product, rank?: number) {
  return {
    id: p.id,
    slug: p.slug,
    tag: getGarmentSpecBadge(p),
    tagColor: p.tagColor,
    tagBg: p.tagBg,
    title: p.title,
    desc: p.short,
    price: formatPrice(p.price_inr || p.price),
    oldPrice: p.compareAtPrice ? formatPrice(p.compareAtPrice) : undefined,
    rawPrice: p.price_inr || p.price,
    rawComparePrice: p.compareAtPrice,
    imageUrl: p.image_url,
    images: p.images,
    isPrebuilt: (p as any).isPrebuilt,
    lockedSvgMotif: (p as any).lockedSvgMotif,
    lockedGraphicTitle: (p as any).lockedGraphicTitle,
    lockedGraphicPlacement: (p as any).lockedGraphicPlacement,
    lockedAccentHex: (p as any).lockedAccentHex,
    sizes: p.sizes,
    colors: p.colors,
    chapter: undefined,
    pet: undefined,
    rating: p.rating,
    reviews: p.reviews,
    discount: computeDiscount(p.price, p.compareAtPrice, p.price_inr),
    rank,
  };
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Catalog', href: '/shop' },
  { id: 'mens-printed', label: "Men's Graphic Drops", href: '/shop?cat=mens-printed' },
  { id: 'printed', label: 'All Graphic Prints', href: '/shop?cat=printed' },
  { id: 'womens', label: "Women's Collection", href: '/shop?cat=womens' },
  { id: 'blanks', label: 'Essential Blanks', href: '/shop?cat=blanks' },
];

const ASSURANCES = [
  {
    icon: Truck,
    title: 'Express Air Delivery (2–4 Days)',
    desc: 'Pan-India 2–4 business days via BlueDart & Delhivery Air. Express air dispatch included in all prices.',
  },
  {
    icon: ShieldCheck,
    title: '7-Day Easy Returns',
    desc: 'Hassle-free 7-day doorstep returns for defective or unwanted items directly at your door.',
  },
  {
    icon: Banknote,
    title: 'Free Cash on Delivery',
    desc: 'Pay at your doorstep across 19,000+ PIN codes with zero extra fees. 100% Free COD included.',
  },
  {
    icon: RefreshCw,
    title: 'Verified Seller Sourcing',
    desc: 'Every garment is crafted from 100% bio-washed combed cotton, directly sourced from verified makers.',
  },
];

export default async function Home() {
  const allProducts = await getProductsFromDB();

  // 1. Men's Graphic Printed Streetwear (Priority showcase)
  const mensPrinted = allProducts.filter(
    (p) => (p.gender === 'men' || p.category === 'mens') && (p.is_printed === true || (p as any).isPrinted === true) && !p.id.startsWith('bundle-')
  );

  // 2. Women's & Kids' Printed Graphic Drops
  const otherPrinted = allProducts.filter(
    (p) => (p.gender === 'women' || p.gender === 'kids' || p.category === 'womens' || p.category === 'kids') && (p.is_printed === true || (p as any).isPrinted === true) && !p.id.startsWith('bundle-')
  );

  // 3. Essential Streetwear Blanks (Acid Wash, Solid Oversized Tees, Polos, Minimal Silhouettes)
  const blanks = allProducts.filter(
    (p) => (p.is_printed === false || (p as any).isPrinted === false) && !p.id.startsWith('bundle-')
  );

  return (
    <main className="page-top min-h-screen text-[#0D0D0F] pb-20">
      {/* 1. RESTRAINED ANNOUNCEMENT & CATEGORY STRIP */}
      <section className="bg-[#F3F0EA] border-b border-black/[0.08] relative z-20">
        <div className="max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-2.5 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            {CATEGORY_TABS.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className="no-underline px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-bold text-[#0D0D0F]/80 hover:text-[#0D0D0F] hover:bg-black/[0.06] transition-colors whitespace-nowrap"
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs sm:text-sm font-semibold text-neutral-600 shrink-0">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] pulse-live-dot" />
              Pan-India 2–4d Express Active
            </span>
            <span className="text-black/15">•</span>
            <span>Delivery Included</span>
            <span className="text-black/15">•</span>
            <span>COD Available</span>
          </div>
        </div>
      </section>

      {/* CONTINUOUS EDITORIAL RUNNING TICKER */}
      <div className="bg-[#0D0D0F] text-white py-2.5 overflow-hidden border-b border-white/10 select-none">
        <div className="animate-marquee flex items-center gap-8 text-[11px] sm:text-xs font-mono tracking-widest uppercase">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="flex items-center gap-8 shrink-0">
              <span className="text-[#E04F33] font-bold">240 GSM COMBED COTTON</span>
              <span>•</span>
              <span>240 GSM FULL SLEEVE DROPS</span>
              <span>•</span>
              <span className="text-[#E04F33] font-bold">DIRECT VERIFIED SELLER SOURCING</span>
              <span>•</span>
              <span>AIR DISPATCH INCLUDED</span>
              <span>•</span>
              <span className="text-[#E04F33] font-bold">7-DAY EASY RETURNS</span>
              <span>•</span>
              <span>BOX-FIT ARCHITECTURAL CUTS</span>
              <span>•</span>
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-6 sm:pt-8 flex flex-col gap-12 sm:gap-16">

        {/* 1. SECTION: MEN'S GRAPHIC STREETWEAR (PRIORITY USER SPOTLIGHT) */}
        {mensPrinted.length > 0 && (
          <section id="mens-printed" className="scroll-mt-24 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-4">
              <div>
                <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E04F33] font-bold mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E04F33] pulse-live-dot" />
                  Collection 01 • Flagship Drops
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-950">
                  Men&apos;s Graphic Streetwear
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 mt-1.5 font-medium max-w-2xl">
                  High-density DTF prints on 240 GSM bio-washed combed cotton. Dispatched in 2–4 business days.
                </p>
              </div>
              <Link
                href="/shop?cat=mens-printed"
                className="text-xs sm:text-sm font-bold text-zinc-950 hover:text-[#E04F33] no-underline flex items-center gap-1 shrink-0 pb-1 border-b border-black/20 hover:border-[#E04F33] transition-colors self-start sm:self-auto"
              >
                <span>View All ({mensPrinted.length})</span>
                <span>→</span>
              </Link>
            </div>
            <div className="w-full h-px bg-zinc-200/80 mb-5" />

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {mensPrinted.map((p, i) => (
                <ScrollReveal key={p.id} delay={Math.min(i * 30, 240)}>
                  <ProductCard {...toCard(p)} priority={i < 6} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}


        {/* 3. SECTION: WOMEN'S & ART EDITIONS */}
        {otherPrinted.length > 0 && (
          <section id="other-printed" className="scroll-mt-24 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-4">
              <div>
                <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E04F33] font-bold mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E04F33] pulse-live-dot" />
                  Collection 02 • Limited Drops
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-950">
                  Women&apos;s &amp; Art Editions
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 mt-1.5 font-medium max-w-2xl">
                  Crop silhouettes, classic crewnecks, and aesthetic typographic graphics.
                </p>
              </div>
              <Link
                href="/shop?cat=womens"
                className="text-xs sm:text-sm font-bold text-zinc-950 hover:text-[#E04F33] no-underline flex items-center gap-1 shrink-0 pb-1 border-b border-black/20 hover:border-[#E04F33] transition-colors self-start sm:self-auto"
              >
                <span>View All ({otherPrinted.length})</span>
                <span>→</span>
              </Link>
            </div>
            <div className="w-full h-px bg-zinc-200/80 mb-5" />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {otherPrinted.map((p, i) => (
                <ScrollReveal key={p.id} delay={Math.min(i * 30, 240)}>
                  <ProductCard {...toCard(p)} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* 4. SECTION: ESSENTIAL STREETWEAR BLANKS */}
        {blanks.length > 0 && (
          <section id="streetwear-blanks" className="scroll-mt-24 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-4">
              <div>
                <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#0D0D0F] font-bold mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D0D0F] pulse-live-dot" />
                  Collection 03 • Daily Architecture
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-950">
                  Essential Blanks
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 mt-1.5 font-medium max-w-2xl">
                  Acid-wash textures, heavyweight raglan tees, solid crewnecks, and minimal wardrobe staples.
                </p>
              </div>
              <Link
                href="/shop?cat=blanks"
                className="text-xs sm:text-sm font-bold text-zinc-950 hover:text-[#E04F33] no-underline flex items-center gap-1 shrink-0 pb-1 border-b border-black/20 hover:border-[#E04F33] transition-colors self-start sm:self-auto"
              >
                <span>View All ({blanks.length})</span>
                <span>→</span>
              </Link>
            </div>
            <div className="w-full h-px bg-zinc-200/80 mb-5" />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {blanks.map((p, i) => (
                <ScrollReveal key={p.id} delay={Math.min(i * 30, 240)}>
                  <ProductCard {...toCard(p)} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* 8. PURCHASE ASSURANCES & TRANSPARENCY */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-black/[0.08]">
          {ASSURANCES.map((a, i) => (
            <ScrollReveal key={a.title} delay={i * 60}>
              <div className="p-5 rounded-xl bg-white border border-black/[0.08] flex flex-col justify-between h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div>
                  <a.icon className="w-5 h-5 text-[#FF4D24] mb-3 transition-transform duration-300 hover:scale-110" />
                  <h3 className="text-sm font-bold text-[#12100E]">{a.title}</h3>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </section>

      </div>
    </main>
  );
}
