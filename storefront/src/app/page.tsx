import Link from 'next/link';
import { Truck, ShieldCheck, Banknote, RefreshCw } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { formatPrice, computeDiscount, type Product } from '@/lib/data/products';
import { getProductsFromDB } from '@/lib/products-server';

export const revalidate = 60; // 60s ISR: Edge cached in Mumbai (bom1)

export const metadata = {
  title: 'Rare Ember — Independent Heavyweight Streetwear & Graphic Drops',
  description: '240 GSM combed cotton streetwear, 380 GSM French terry hoodies & original graphic drops. Tailored in India, dispatched via express air with 7-day doorstep replacements.',
};

function toCard(p: Product, rank?: number) {
  return {
    id: p.id,
    slug: p.slug,
    tag: p.tag || (p.is_printed ? 'Graphic Print' : 'Essential Blank'),
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
  { id: 'custom-drops', label: 'Custom Merch Studio', href: '/custom-drops' },
  { id: 'bulk-orders', label: 'Bulk & Corporate', href: '/bulk-orders' },
];

const ASSURANCES = [
  {
    icon: Truck,
    title: 'Express Air Dispatch',
    desc: 'Pan-India 2–4 business days via BlueDart & Delhivery Air. Standard delivery included in all prices.',
  },
  {
    icon: ShieldCheck,
    title: '7-Day Doorstep Replacement',
    desc: 'Hassle-free size exchanges and print defect replacements directly at your door.',
  },
  {
    icon: Banknote,
    title: 'Cash on Delivery Available',
    desc: 'Pay at your doorstep across 19,000+ PIN codes with a transparent ₹49 courier handling fee.',
  },
  {
    icon: RefreshCw,
    title: 'Domestic Tirupur Hub',
    desc: 'Every garment is cut from bio-washed combed cotton, screenprinted, and inspected in Tamil Nadu.',
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-2.5 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            {CATEGORY_TABS.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className="no-underline px-3 py-1.5 rounded-md text-xs font-bold text-[#0D0D0F]/80 hover:text-[#0D0D0F] hover:bg-black/[0.06] transition-colors whitespace-nowrap"
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-neutral-600 shrink-0">
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
        <div className="animate-marquee flex items-center gap-8 text-[11px] font-mono tracking-widest uppercase">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="flex items-center gap-8 shrink-0">
              <span className="text-[#E04F33] font-bold">240 GSM COMBED COTTON</span>
              <span>•</span>
              <span>380 GSM FRENCH TERRY</span>
              <span>•</span>
              <span className="text-[#E04F33] font-bold">TIRUPUR DOMESTIC MILLING</span>
              <span>•</span>
              <span>AIR DISPATCH INCLUDED</span>
              <span>•</span>
              <span className="text-[#E04F33] font-bold">7-DAY DOORSTEP REPLACEMENTS</span>
              <span>•</span>
              <span>BOX-FIT ARCHITECTURAL CUTS</span>
              <span>•</span>
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 flex flex-col gap-12 sm:gap-16">

        {/* 1. SECTION: MEN'S GRAPHIC STREETWEAR (PRIORITY USER SPOTLIGHT) */}
        {mensPrinted.length > 0 && (
          <section id="mens-printed" className="scroll-mt-24">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#FF4D24]/10 text-[#FF4D24] text-[11px] font-mono uppercase tracking-widest font-bold mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D24] pulse-dot" />
                  Collection 01 • Flagship Drops
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#12100E]">
                  Men&apos;s Graphic Streetwear
                </h1>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  High-density DTF prints on 240 GSM bio-washed combed cotton. Dispatched in 2–4 business days.
                </p>
              </div>
              <Link
                href="/shop?cat=mens-printed"
                className="text-xs font-bold text-[#12100E] hover:text-[#FF4D24] no-underline flex items-center gap-1 shrink-0 pb-1 border-b border-black/20 hover:border-[#FF4D24] link-underline transition-colors"
              >
                <span>View All ({mensPrinted.length})</span>
                <span>→</span>
              </Link>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {mensPrinted.map((p, i) => (
                <ScrollReveal key={p.id} delay={Math.min(i * 30, 240)}>
                  <ProductCard {...toCard(p)} priority={i < 4} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* 4. EDITORIAL LOOKBOOK: THE CUT & FABRICATION */}
        <ScrollReveal>
          <section className="p-6 sm:p-10 rounded-2xl bg-[#F4EFEA] border border-black/[0.08]">
            <div className="max-w-2xl mb-8">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Material &amp; Architecture
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#12100E]">
                Streetwear Cuts Engineered to Hold Shape.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                We reject thin fast-fashion fabrics that warp after two washes. Every piece is built around heavyweight domestic cotton with reinforced seams and pre-shrunk treatment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-white border border-black/[0.06] flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div>
                  <span className="text-xs font-mono font-bold text-[#FF4D24] uppercase tracking-wider">
                    Silhouette 01
                  </span>
                  <h3 className="text-lg font-bold text-[#12100E] mt-1 mb-2">
                    The 240 GSM Boxy Drop-Shoulder Tee
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Super-combed 100% bio-washed cotton. Features an extended drop-shoulder seam, wider chest proportions, and a dense 1.25-inch ribbed collar that doesn&apos;t bacon or sag.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs font-bold text-neutral-700">
                  <span>Fit: Relaxed Boxy</span>
                  <span>Weight: 240 GSM Combed</span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-white border border-black/[0.06] flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div>
                  <span className="text-xs font-mono font-bold text-[#FF4D24] uppercase tracking-wider">
                    Silhouette 02
                  </span>
                  <h3 className="text-lg font-bold text-[#12100E] mt-1 mb-2">
                    The 380 GSM Heavy French Terry Hoodie
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Brushed loopback fleece exterior with a plush interior. Double-layered crossover hood engineered to stay structured without drawstrings, paired with 2x2 heavy ribbed cuffs.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs font-bold text-neutral-700">
                  <span>Fit: Structured Oversized</span>
                  <span>Weight: 380 GSM Terry</span>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* 3. SECTION: WOMEN'S & ART EDITIONS */}
        {otherPrinted.length > 0 && (
          <section id="other-printed" className="scroll-mt-24">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#FF4D24]/10 text-[#FF4D24] text-[11px] font-mono uppercase tracking-widest font-bold mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D24] pulse-dot" />
                  Collection 02 • Limited Drops
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#12100E]">
                  Women&apos;s &amp; Art Editions
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Crop silhouettes, classic crewnecks, and aesthetic typographic graphics.
                </p>
              </div>
              <Link
                href="/shop?cat=womens"
                className="text-xs font-bold text-[#12100E] hover:text-[#FF4D24] no-underline flex items-center gap-1 shrink-0 pb-1 border-b border-black/20 hover:border-[#FF4D24] link-underline transition-colors"
              >
                <span>View All ({otherPrinted.length})</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
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
          <section id="streetwear-blanks" className="scroll-mt-24">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#12100E]/10 text-[#12100E] text-[11px] font-mono uppercase tracking-widest font-bold mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12100E] pulse-dot" />
                  Collection 03 • Daily Architecture
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#12100E]">
                  Essential Blanks
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Acid-wash textures, heavyweight raglan tees, solid crewnecks, and minimal wardrobe staples.
                </p>
              </div>
              <Link
                href="/shop?cat=blanks"
                className="text-xs font-bold text-[#12100E] hover:text-[#FF4D24] no-underline flex items-center gap-1 shrink-0 pb-1 border-b border-black/20 hover:border-[#FF4D24] link-underline transition-colors"
              >
                <span>View All ({blanks.length})</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {blanks.map((p, i) => (
                <ScrollReveal key={p.id} delay={Math.min(i * 30, 240)}>
                  <ProductCard {...toCard(p)} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* 5. CREDIBLE BRAND STORY */}
        <ScrollReveal>
          <section className="p-8 sm:p-12 rounded-2xl bg-[#12100E] text-white grain border border-white/10 transition-all duration-300 hover:border-white/20">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-mono font-bold text-gradient-ember-animated uppercase tracking-wider">
                The Rare Ember Story
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Independent Streetwear. Direct from the Loom.
              </h2>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                We started Rare Ember because we were tired of generic fast-fashion tees with peel-and-stick prints and paper-thin cotton. Every silhouette in our catalog is engineered in Tirupur, India, from heavyweight combed cotton and dense French terry.
              </p>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                By working on demand with direct air fulfillment, we eliminate dead inventory and wasteful markups. Every garment is inspected, packed in premium white-label packaging, and shipped directly to your door with express air delivery.
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="text-xs font-bold text-[#FF4D24] hover:text-[#FF7A18] inline-flex items-center gap-1 link-underline transition-colors"
                >
                  Read more about our sourcing and production →
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>

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
