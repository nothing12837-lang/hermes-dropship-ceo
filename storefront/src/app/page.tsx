import Link from 'next/link';
import { Truck, ShieldCheck, Banknote, RefreshCw } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import GsmCategorizerSection from '@/components/GsmCategorizerSection';
import { formatPrice, computeDiscount, getGarmentSpecBadge, enforcePriceFloor, isKidsProduct, type Product } from '@/lib/data/products';
import { getProductsFromDB } from '@/lib/products-server';

export const revalidate = 60; // 60s ISR: Edge cached in Mumbai (bom1)

export const metadata = {
  title: {
    absolute: 'Rare Ember — 240 GSM Heavyweight Streetwear & Acid Wash Hoodies India',
  },
  description: '240 GSM combed cotton streetwear, acid wash hoodies, and original graphic drops. Tailored in India, dispatched via express air with Cash on Delivery & 7-day returns.',
  alternates: {
    canonical: 'https://www.rareember.shop',
  },
};

function toCard(rawP: Product, rank?: number) {
  const p = enforcePriceFloor(rawP);
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
    title: 'Free Prepaid Delivery',
    desc: 'Pan-India air dispatch via BlueDart & Delhivery Air. 100% free delivery on all prepaid orders.',
  },
  {
    icon: ShieldCheck,
    title: '7-Day Easy Returns',
    desc: 'Hassle-free 7-day doorstep returns for defective or unwanted items directly at your door.',
  },
  {
    icon: Banknote,
    title: 'Cash on Delivery Available',
    desc: 'Pay at your doorstep across 19,000+ PIN codes. 100% Waived handling fee on Prepaid UPI/Cards.',
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
    (p) => (p.gender === 'men' || p.category === 'mens') && (p.is_printed === true || (p as any).isPrinted === true) && !p.id.startsWith('bundle-') && !isKidsProduct(p)
  );

  // 2. Women's & Art Editions Printed Graphic Drops (Strictly adult drops only)
  const otherPrinted = allProducts.filter(
    (p) => (p.gender === 'women' || p.category === 'womens') && (p.is_printed === true || (p as any).isPrinted === true) && !p.id.startsWith('bundle-') && !isKidsProduct(p)
  );

  // 3. Essential Streetwear Blanks (Acid Wash, Solid Oversized Tees, Polos, Minimal Silhouettes)
  const blanks = allProducts.filter(
    (p) => (p.is_printed === false || (p as any).isPrinted === false) && !p.id.startsWith('bundle-') && !isKidsProduct(p)
  );

  return (
    <main id="main-content" className="page-top min-h-screen text-[#0D0D0F] pb-20">
      {/* 1. BREADCRUMBS FOR AGENTS & SEARCH ENGINES */}
      <nav aria-label="Breadcrumb" className="bg-[#FAF8F5] border-b border-black/[0.05] py-2 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-[1600px] 2xl:max-w-[1760px] mx-auto flex items-center gap-2 text-[11px] font-mono text-neutral-500">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-black transition-colors">Streetwear Catalog</Link>
          <span>/</span>
          <span className="text-neutral-900 font-bold">2026 Heavyweight Drops</span>
        </div>
      </nav>

      {/* 2. RESTRAINED ANNOUNCEMENT & CATEGORY STRIP */}
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
              Pan-India Express Active
            </span>
            <span className="text-black/15">•</span>
            <span>Free Delivery</span>
            <span className="text-black/15">•</span>
            <span>COD Available</span>
          </div>
        </div>
      </section>

      

      <div className="max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-6 sm:pt-8 flex flex-col gap-12 sm:gap-16">

        {/* 1. SECTION: ARCHIVAL DROPS — CRAFTED FOR THE RARE */}
        {mensPrinted.length > 0 && (
          <section id="mens-printed" className="scroll-mt-24 overflow-x-hidden">
            

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-4">
              <div>
                <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E04F33] font-bold mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E04F33] pulse-live-dot" />
                  Collection 01 • Crafted For The Rare
                  <time dateTime="2026-10-30" className="text-neutral-400 font-mono text-[10px] ml-2">
                    Studio Archive 2026
                  </time>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-950">
                  Made For The Rare, Never The Crowd
                </h1>
                <p className="text-sm sm:text-base text-neutral-600 mt-1.5 font-medium max-w-2xl leading-relaxed">
                  We don&apos;t make disposable fast-fashion. Every piece is engineered with substantial, verified factory weights (180 to 400 GSM) and museum-grade archival prints. Architectural drop-shoulder proportions designed for those who walk their own path.
                </p>
              </div>
              <Link
                href="/shop?cat=mens-printed"
                className="text-xs sm:text-sm font-bold text-zinc-950 hover:text-[#E04F33] no-underline flex items-center gap-1 shrink-0 pb-1 border-b border-black/20 hover:border-[#E04F33] transition-colors self-start sm:self-auto"
              >
                <span>Explore All Graphic Drops ({mensPrinted.length})</span>
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

        {/* 1.5 DEDICATED GSM CATEGORIZER SECTION */}
        <GsmCategorizerSection products={allProducts} />

        {/* 2. SECTION: WOMEN'S & ART EDITIONS */}
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
                <span>Explore Women&apos;s Collection ({otherPrinted.length})</span>
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

        {/* 3. SECTION: ESSENTIAL STREETWEAR BLANKS */}
        {blanks.length > 0 && (
          <section id="streetwear-blanks" className="scroll-mt-24 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-4">
              <div>
                <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#0D0D0F] font-bold mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D0D0F] pulse-live-dot" />
                  Collection 03 • Daily Architecture
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-950">
                  Essential Blanks &amp; Acid Wash Silhouettes
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 mt-1.5 font-medium max-w-2xl">
                  Acid-wash textures, heavyweight raglan tees, solid crewnecks, and minimal wardrobe staples.
                </p>
              </div>
              <Link
                href="/shop?cat=blanks"
                className="text-xs sm:text-sm font-bold text-zinc-950 hover:text-[#E04F33] no-underline flex items-center gap-1 shrink-0 pb-1 border-b border-black/20 hover:border-[#E04F33] transition-colors self-start sm:self-auto"
              >
                <span>Explore Essential Blanks ({blanks.length})</span>
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

        {/* 4. GEO & SEO AUTHORITY SECTION: STREETWEAR CRAFTSMANSHIP, SIZING & SCIENCE */}
        <section id="streetwear-craftsmanship" className="scroll-mt-24 bg-white border border-black/[0.08] rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm space-y-8">
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E04F33] font-bold block mb-1">
              Fabric Engineering • Sizing Science
            </span>
            <h2 id="fabric-guide" className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-950">
              Streetwear Craftsmanship &amp; Fabric Science Guide
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-3xl leading-relaxed">
              Why fabric weight, yarn density, and enzyme washing define the difference between disposable fast fashion and authentic streetwear.
            </p>
          </div>

          {/* Question-Based Headings & Answer Snippets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-black/[0.05] space-y-2">
              <h3 id="what-is-240-gsm" className="text-sm sm:text-base font-bold text-zinc-950">
                What is a 240 GSM Oversized T-Shirt?
              </h3>
              <p className="speakable-lead text-xs sm:text-sm text-neutral-700 leading-relaxed">
                A 240 GSM oversized t-shirt is a heavyweight luxury streetwear garment crafted from dense, super-combed cotton fabric. Unlike lightweight 160–180 GSM commercial t-shirts that turn transparent or deform after two washes, 240 GSM fabric delivers an architectural drop-shoulder silhouette, thick non-sagging ribbed collar, and substantial drape that maintains structure all day in Indian weather.
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-black/[0.05] space-y-2">
              <h3 id="what-is-acid-wash-hoodie" className="text-sm sm:text-base font-bold text-zinc-950">
                What is an Acid Wash French Terry Hoodie?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                An acid wash French terry hoodie is a 380 GSM heavyweight pullover engineered with unbrushed interior loops for breathability and an artisanal enzyme mineral wash that gives each piece unique distressed vintage marble textures with zero transparency.
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-black/[0.05] space-y-2">
              <h3 id="how-to-size-streetwear" className="text-sm sm:text-base font-bold text-zinc-950">
                How to choose the right size for a boxy streetwear fit?
              </h3>
              <ol className="list-decimal pl-4 space-y-1.5 text-xs sm:text-sm text-neutral-700 leading-relaxed">
                <li>Measure your chest circumference across the fullest part using a soft measuring tape.</li>
                <li>For a true relaxed boxy look, select your regular size as Rare Ember silhouettes feature built-in drop shoulders and 2 inches of ease.</li>
                <li>For an exaggerated streetwear drape, size up one level.</li>
              </ol>
            </div>
          </div>

          {/* Structured Comparison Data Table */}
          <div className="space-y-3 pt-2">
            <h3 id="fabric-comparison-table" className="text-base sm:text-lg font-bold text-zinc-950">
              Fabric Comparison: Commercial Fast Fashion vs Rare Ember
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-black/[0.08]">
              <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white">
                <thead>
                  <tr className="bg-zinc-100/80 border-b border-black/[0.08] text-zinc-900 font-bold">
                    <th className="p-3 sm:p-4">Specification</th>
                    <th className="p-3 sm:p-4">Standard Fast Fashion</th>
                    <th className="p-3 sm:p-4 text-[#E04F33]">Rare Ember 240 GSM Tees</th>
                    <th className="p-3 sm:p-4 text-[#E04F33]">Rare Ember 380 GSM Hoodies</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06] text-neutral-700">
                  <tr>
                    <td className="p-3 sm:p-4 font-bold text-zinc-950">Fabric Density</td>
                    <td className="p-3 sm:p-4">160–180 GSM (Lightweight)</td>
                    <td className="p-3 sm:p-4 font-semibold text-zinc-950">240 GSM (Dense Heavyweight)</td>
                    <td className="p-3 sm:p-4 font-semibold text-zinc-950">380 GSM (French Terry Fleece)</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-bold text-zinc-950">Cotton Grade</td>
                    <td className="p-3 sm:p-4">Short-Staple Open-End Yarn</td>
                    <td className="p-3 sm:p-4 font-semibold text-zinc-950">100% Super-Combed Bio-Washed</td>
                    <td className="p-3 sm:p-4 font-semibold text-zinc-950">100% Combed Cotton Loopback</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-bold text-zinc-950">Collar Durability</td>
                    <td className="p-3 sm:p-4">1×1 Lightweight Rib (Stretches Out)</td>
                    <td className="p-3 sm:p-4 font-semibold text-zinc-950">2.5cm Heavy 2×1 Lycra Rib (Retains Shape)</td>
                    <td className="p-3 sm:p-4 font-semibold text-zinc-950">Double-Layer Thermal Hood &amp; Drawcords</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-bold text-zinc-950">Indian Weather Drape</td>
                    <td className="p-3 sm:p-4">Clings to body &amp; Translucent</td>
                    <td className="p-3 sm:p-4 font-semibold text-zinc-950">Opaque, Breathable &amp; Boxy Drape</td>
                    <td className="p-3 sm:p-4 font-semibold text-zinc-950">Thermal Insulation with Breathable Loopback</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-bold text-zinc-950">Delivery &amp; COD</td>
                    <td className="p-3 sm:p-4">Paid shipping + COD extra charge</td>
                    <td className="p-3 sm:p-4 font-semibold text-zinc-950">Free Express Air + COD Available</td>
                    <td className="p-3 sm:p-4 font-semibold text-zinc-950">Free Express Air + COD Available</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Definition List (<dl>, <dt>, <dd>) */}
          <div className="space-y-3 pt-2">
            <h3 id="streetwear-glossary" className="text-base sm:text-lg font-bold text-zinc-950">
              Streetwear Terminology Glossary
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-black/[0.05]">
                <dt className="font-bold text-zinc-950 text-xs sm:text-sm">GSM (Grams per Square Meter)</dt>
                <dd className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Metric measuring fabric density. Commercial tees run 160–180 GSM, while true streetwear silhouettes begin at 240+ GSM.
                </dd>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-black/[0.05]">
                <dt className="font-bold text-zinc-950 text-xs sm:text-sm">Super-Combed Cotton</dt>
                <dd className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Premium long-staple cotton fibers combed to remove short fibers and impurities, completely preventing surface fuzz and pilling.
                </dd>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-black/[0.05]">
                <dt className="font-bold text-zinc-950 text-xs sm:text-sm">Bio-Washed Finish</dt>
                <dd className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Enzymatic bath that treats cellulose fibers, delivering a rich silky-smooth hand feel with enhanced dye retention over dozens of washes.
                </dd>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-black/[0.05]">
                <dt className="font-bold text-zinc-950 text-xs sm:text-sm">Drop-Shoulder Fit</dt>
                <dd className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Architectural tailoring pattern where sleeve seams rest below the natural shoulder line for a boxy, contemporary streetwear silhouette.
                </dd>
              </div>
            </dl>
          </div>

          {/* 5. PAA FREQUENTLY ASKED QUESTIONS */}
          <div className="space-y-4 pt-4 border-t border-black/[0.08]">
            <h3 id="faq-section" className="text-lg sm:text-xl font-black text-zinc-950">
              Frequently Asked Questions (FAQ)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-black/[0.05] space-y-1.5">
                <h4 className="font-bold text-zinc-950">Does Rare Ember offer Cash on Delivery (COD) across India?</h4>
                <p className="faq-answer text-neutral-700 leading-relaxed">
                  Yes, Cash on Delivery is supported across 19,000+ PIN codes in India. We verify COD orders instantly via secure SMS OTP to prevent logistics delays.
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-black/[0.05] space-y-1.5">
                <h4 className="font-bold text-zinc-950">How fast is delivery for streetwear orders?</h4>
                <p className="faq-answer text-neutral-700 leading-relaxed">
                  All orders are dispatched via express air couriers (BlueDart &amp; Delhivery Air), typically delivering in 2 to 4 business days to metro cities.
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-black/[0.05] space-y-1.5">
                <h4 className="font-bold text-zinc-950">What is Rare Ember&apos;s return and replacement policy?</h4>
                <p className="faq-answer text-neutral-700 leading-relaxed">
                  We provide a 7-day doorstep replacement guarantee. If there is any sizing mismatch, transit defect, or manufacturing issue, submit a claim on our returns portal.
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-black/[0.05] space-y-1.5">
                <h4 className="font-bold text-zinc-950">How should I wash 240 GSM tees and acid wash hoodies?</h4>
                <p className="faq-answer text-neutral-700 leading-relaxed">
                  Turn garments inside-out and machine wash in cold water with mild liquid detergent. Line dry in the shade. Never iron directly on graphic print surfaces.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. PURCHASE ASSURANCES & TRANSPARENCY */}
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
