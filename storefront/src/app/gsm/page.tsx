import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, Sparkles, Feather, Flame, ArrowRight, CheckCircle2, XCircle, Info, Wind, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'The RareEmber™ Streetwear GSM & Fabric Weight Guide — Complete Technical Specs',
  description: 'Understand streetwear fabric weights: 160 GSM, 180 GSM, 240 GSM, 260 GSM, 300 GSM, and 400 GSM. Detailed breakdown of pros, cons, feel, opacity, and weather suitability for Indian luxury streetwear.',
  alternates: {
    canonical: 'https://www.rareember.shop/gsm',
  },
  openGraph: {
    title: 'The RareEmber™ Streetwear GSM & Fabric Weight Guide',
    description: 'Understand streetwear fabric weights: 160 GSM to 400 GSM with pros, cons, opacity, and climate suitability.',
    url: 'https://www.rareember.shop/gsm',
    siteName: 'Rare Ember',
    type: 'article',
  },
};

const TIERS = [
  {
    id: 'gsm-400',
    gsm: '400 GSM',
    title: 'Ultra-Heavyweight Brushed Thermal Fleece',
    category: 'Winter Outerwear & Armor',
    blankSku: 'UH32 (Unisex Heavyweight Oversized Hoodie)',
    composition: 'Heavyweight Cotton-Poly Brushed Thermal Fleece',
    handFeel: 'Fortress-grade thickness, dense structural weave, plush brushed thermal fleece lining. Double-lined hood stands upright with zero sagging.',
    weightIndex: '100% Max Density',
    opacity: '100% Completely Opaque (Zero Show-Through)',
    idealSeason: 'North & Central Indian Winter, Hill Stations, Cold Night Breeze Commutes (10°C–18°C)',
    pros: [
      'Unrivaled cold-weather thermal insulation with plush interior fleece',
      'Architectural drop-shoulder boxy drape that holds its structure permanently',
      'Double-layered self-fabric hood that stands rigid without flimsy drawstring reliance',
      'Dense 2.5-inch ribbed cuffs and hem with reinforced anti-sag elasticity',
      'Pre-shrunk compacted fabric engineered for zero shrinkage over 50+ cold washes',
    ],
    cons: [
      'Substantial weight (approx. 850–950g per hoodie)—not meant for lightweight packing',
      'Too warm for humid summer afternoons or unventilated tropical indoor rooms',
      'Requires natural air-drying (longer dry time due to heavy cotton-poly fleece pile)',
    ],
    care: 'Machine wash cold (max 30°C) inside-out on gentle cycle. Reshape while damp and flat dry in shade. Never tumble dry on high heat.',
    pieces: [
      {
        name: 'Unisex Heavyweight Hoodie — Unstoppable Tiger Edition',
        price: '₹1,399',
        slug: 'unisex-heavyweight-hoodie-32493938',
      },
    ],
  },
  {
    id: 'gsm-300',
    gsm: '300 GSM',
    title: 'Artisanal Enzyme Acid-Wash Cotton Terry Fleece',
    category: 'Vintage Patina Outerwear',
    blankSku: 'UH62 (Unisex Acid Washed Hoodie)',
    composition: '100% Super Combed Cotton French Terry Fleece',
    handFeel: 'Unique textured vintage mineral patina from individual enzyme acid wash treatment. Soft brushed cotton exterior with breathable loopback interior.',
    weightIndex: '85% Density',
    opacity: '100% Opaque',
    idealSeason: 'Autumn, Mild Winter, Air-Conditioned Workspaces, Evening Streetwear (15°C–24°C)',
    pros: [
      '100% pure combed cotton breathability without synthetic polyester trap',
      'Authentic hand-treated enzyme acid-wash mineral patina—every piece has unique highs and lows',
      'Derby ribbed cuffs and hem engineered for substantial street drape',
      'Double-lined structured hood with matching chunky dyed drawcords',
      'Soft loopback interior that prevents itching or overheating',
    ],
    cons: [
      'Must be washed with like dark colors to preserve artisanal acid wash highlights',
      'Slightly heavier than standard mall fleece',
    ],
    care: 'Cold wash with mild detergent inside-out. Do not bleach. Dry in shade away from direct scorching sunlight.',
    pieces: [
      {
        name: 'Unisex Acid Washed Hoodie — Skull & Dragon Edition',
        price: '₹1,789',
        slug: 'unisex-acid-wash-hoodie-32493953',
      },
    ],
  },
  {
    id: 'gsm-260',
    gsm: '260 GSM',
    title: 'French Terry & Artisanal Tie-Dye Blends',
    category: 'Textured Streetwear & All-Season Layers',
    blankSku: 'UT27, UT58, UH83 (Terry Oversized Tee, Tie Dye Tee, Pullover Hoodie)',
    composition: '100% Cotton French Terry & 90/10 Cotton-Poly French Terry',
    handFeel: 'Tactile textured exterior with distinctive breathable micro-loops on the inside. Fluid yet weighty horizontal drape that falls away from the body.',
    weightIndex: '75% Density',
    opacity: '100% Opaque',
    idealSeason: 'Monsoon, Transition Months, Year-Round Air-Conditioned Studios (18°C–28°C)',
    pros: [
      'Superior sweat and moisture absorption driven by physical micro-loop geometry',
      'Natural horizontal give and recovery without synthetic elastane degradation',
      'Tactile visual depth that looks markedly more luxurious than standard flat jerseys',
      'Substantial boxy drop-shoulder hang with zero clinging',
    ],
    cons: [
      'Micro-loops require gentle laundering (avoid washing with sharp zippers or hooks that could snag loops)',
      'Slightly longer drying cycle compared to single jersey cotton',
    ],
    care: 'Machine wash cold on delicate cycle. Line dry in shade. Iron inside-out on low heat.',
    pieces: [
      {
        name: 'Unisex Terry Oversized Tee — Not Today Edition',
        price: '₹849',
        slug: 'unisex-terry-oversized-tee-32476620',
      },
      {
        name: 'Unisex Tie Dye Oversized T-Shirt — Hand-Dyed Artisan Blank',
        price: '₹849',
        slug: 'unisex-tie-dye-oversized-t-shirt-32476436',
      },
      {
        name: 'Unisex Pullover Hoodie — Cyber Designer Edition',
        price: '₹1,399',
        slug: 'unisex-pullover-hoodie-32493470',
      },
    ],
  },
  {
    id: 'gsm-240',
    gsm: '240 GSM',
    title: 'The Gold Standard Heavyweight Combed Cotton & Mesh',
    category: 'Architectural Drop-Shoulder Oversized Drops',
    blankSku: 'UC22, UC61, UC28, UJ35, FT47 (Oversized Classic, Acid Wash Tee, Resort Shirt, Jersey, Baby Tee)',
    composition: '100% Super Combed Bio-Washed Cotton / Double-Knit Aeroknit Mesh / Woven Canvas / Cotton Spandex',
    handFeel: 'The quintessential luxury streetwear weight. Substantial, crisp, completely opaque, and structured. Glides over contours without clinging.',
    weightIndex: '70% Density',
    opacity: '100% Solid Opacity (Zero Silhouette Bleed)',
    idealSeason: 'Year-Round Daily Streetwear Across All Indian Metros (20°C–32°C)',
    pros: [
      'The definitive sweet spot of modern streetwear: heavyweight structure with breathable cotton coolness',
      'Zero chest, stomach, or back clinging—holds architectural drop-shoulder silhouette flawlessly',
      'Reinforced 1-inch Lycra ribbed crewneck collar that never sags, bacon-curls, or loses shape',
      'Compacted combed cotton yarns treated with bio-wash for zero pilling and silky skin contact',
      'Withstands 50+ wash cycles while maintaining saturated color and archival graphic sharpness',
    ],
    cons: [
      'Heavier than standard 140 GSM summer mall tees—takes an hour to adapt if transitioning from fast fashion',
      'Not engineered for intense gym sweat sessions (use 160 GSM DryFit for sports)',
    ],
    care: 'Machine wash cold inside-out. Do not wring. Line dry in shade. Iron reverse side only.',
    pieces: [
      {
        name: 'Unisex Oversized Classic T-Shirt — Tokyo Street Graphic',
        price: '₹849',
        slug: 'unisex-oversized-classic-t-shirt-32476332',
      },
      {
        name: 'Unisex Acid Washed Oversized Tee — Vintage Heavyweight Blank',
        price: '₹849',
        slug: 'unisex-acid-washed-oversized-tee-32476438',
      },
      {
        name: 'Unisex Oversized Button-Down Shirt — Flame Embroidered Icon',
        price: '₹849',
        slug: 'unisex-oversized-shirt-32476629',
      },
      {
        name: 'Unisex Oversized Jersey — Cyber Sublimation Edition',
        price: '₹849',
        slug: 'unisex-oversized-jersey-32476280',
      },
      {
        name: 'Baby Tee — Bright Days Y2K Graphic',
        price: '₹749',
        slug: 'baby-tee-32476716',
      },
    ],
  },
  {
    id: 'gsm-220',
    gsm: '220 GSM',
    title: 'Super Combed Cotton Airtex Pique Knit',
    category: 'Executive Polos & Sharp Streetwear',
    blankSku: 'MP25 (Men’s Polo)',
    composition: '100% Super Combed Cotton Airtex Pique Knit',
    handFeel: 'Structured honeycomb waffle weave that provides natural air circulation channels. Firm derby-ribbed collar that stays crisp.',
    weightIndex: '62% Density',
    opacity: '100% Opaque',
    idealSeason: 'Warm Afternoons, Daytime Casual Meetings, Tropical Street Events (22°C–34°C)',
    pros: [
      'Engineered honeycomb pique texture allows maximum heat escape and cross-breeze airflow',
      'Structured 3-button placket and anti-roll collar provide an elevated, polished presence',
      'Side vent slits reinforced with industrial bartack stitching for ease of movement',
      'Pre-shrunk bio-washed yarns with zero twisting or torquing',
    ],
    cons: [
      'Textured micro-waffle hand feel rather than ultra-slick smooth jersey',
      'Formal-leaning streetwear silhouette rather than exaggerated boxy drape',
    ],
    care: 'Wash cold with similar tones. Button placket before washing to preserve collar alignment. Line dry in shade.',
    pieces: [
      {
        name: 'Men\'s Polo — 220 GSM Pique Blank',
        price: '₹799',
        slug: 'mens-polo-32476788',
      },
    ],
  },
  {
    id: 'gsm-180',
    gsm: '180 GSM',
    title: 'Super Combed Bio-Washed Cotton Single Jersey',
    category: 'Full Sleeves, Layering & Daily Staples',
    blankSku: 'MRnFs, US22, MRnHs, US21, UR39, UR50, FC39, FC43',
    composition: '100% Super Combed Bio-Washed Cotton Single Jersey',
    handFeel: 'Featherlight, ultra-breathable, silky second-skin hand feel. Highly fluid drape that moves naturally with the body.',
    weightIndex: '50% Density',
    opacity: '95% Non-Sheer (Substantially More Opaque than 130 GSM Mall Fast-Fashion)',
    idealSeason: 'Peak Summer Heatwaves, All-Season Full-Sleeve Layering Under Jackets (24°C–40°C)',
    pros: [
      'Effortless breathability in extreme 38°C+ Indian summer humidity without heat buildup',
      'The premier canvas for full-sleeve tees—extended ribbed cuffs stay put when pushed up',
      'Rapid air-drying time (dries within 2–3 hours under shade breeze)',
      'Pre-shrunk bio-washed cotton eliminates surface fuzz and scratchiness',
      'Smooth, non-bulky drape ideal for base-layering under hoodies, varsity jackets, or overshirts',
    ],
    cons: [
      'More fluid, relaxed drape rather than the rigid, boxy architecture of 240 GSM',
      'Requires gentle care to avoid overstretching when wet',
    ],
    care: 'Gentle machine wash cold. Do not wring tightly. Reshape while wet and dry on flat surface or clothesline in shade.',
    pieces: [
      {
        name: 'Men\'s Full Sleeve T-Shirt — Rare Ember Signature Graphic',
        price: '₹999',
        slug: 'mens-full-sleeve-t-shirt-32477737',
      },
      {
        name: 'Men\'s Full Sleeve T-Shirt — Red Mecha Graphic',
        price: '₹999',
        slug: 'mens-full-sleeve-t-shirt-32476824',
      },
      {
        name: 'Unisex Oversized Standard T-Shirt — Chrome Bengaluru Cyber Drop',
        price: '₹849',
        slug: 'unisex-oversized-standard-t-shirt-32476431',
      },
      {
        name: 'Unisex Ringer T-Shirt — Urban Retro Graphic',
        price: '₹749',
        slug: 'unisex-ringer-t-shirt-32476299',
      },
      {
        name: 'Crop Top & T-Shirt Dresses — Studio Editions',
        price: '₹749–₹999',
        slug: 'crop-top-32476851',
      },
    ],
  },
  {
    id: 'gsm-160',
    gsm: '160–170 GSM',
    title: 'Long-Staple American Supima Cotton & Salina Quick-Dry',
    category: 'Ultra-Luxury Silky Single Jersey & High-Performance Active',
    blankSku: 'UC23, UD15, US02 (Supima Tee, DryFit Tee, Aeromesh Jersey)',
    composition: '100% American Supima Cotton / 100% Salina Micro-Knit Polyester',
    handFeel: 'Supima feels like liquid cashmere against the skin with natural luster; Salina Quick-Dry feels weightless and cool with rapid moisture dispersion.',
    weightIndex: '42% Density',
    opacity: '90% Lightweight Luxury / Athletic',
    idealSeason: 'High-Heat Coastal Humidity (Mumbai, Chennai, Kolkata, Goa), Intense Workouts, Travel',
    pros: [
      'Supima cotton features extra-long staple fibers (45% stronger than standard cotton) that never pill',
      'Incomparable silky hand-feel and vibrant natural dye retention over dozens of washes',
      'Salina Micro-Knit features capillary moisture channels that evaporate sweat almost instantly',
      'Infused molecular sublimation graphics with zero ink hand-feel on the skin',
    ],
    cons: [
      'Supima fine yarns must not be washed with heavy abrasive canvas or metal hardware',
      'Not designed for stiff boxy streetwear drape; designed for fluid luxury & performance',
    ],
    care: 'Delicate cold wash in a mesh laundry bag. Low agitation. Never use chlorine bleach or industrial fabric softeners. Line dry in shade.',
    pieces: [
      {
        name: 'Unisex Supima T-Shirt — Dil Se Delhi Luxury Supima',
        price: '₹849',
        slug: 'unisex-supima-t-shirt-32476663',
      },
      {
        name: 'Unisex DryFit T-Shirt — Apex Athletic Sublimation',
        price: '₹749',
        slug: 'unisex-dryfit-t-shirt-32476284',
      },
      {
        name: 'Unisex Jersey T-Shirt — Matrix Sublimation Mesh',
        price: '₹849',
        slug: 'unisex-jersey-t-shirt-32476281',
      },
    ],
  },
];

const COMPARISON_ROWS = [
  {
    feature: 'Fabric Density (GSM)',
    fastFashion: '120–145 GSM (Thin & Flimsy)',
    rareEmber: '160 to 400 GSM (Verified Factory Blanks)',
    verdict: 'RareEmber provides 2x to 3x more physical yarn heft per square meter.',
  },
  {
    feature: 'Opacity & Transparency',
    fastFashion: 'High see-through risk; silhouettes reveal undergarments in sunlight',
    rareEmber: '100% solid opacity across 240–400 GSM cuts; zero see-through',
    verdict: 'Hang with confidence under any daylight or flash photography condition.',
  },
  {
    feature: 'Neckline & Collar Ribbing',
    fastFashion: 'Weak 0.5-inch single jersey rib; bacon-curls after 2 washes',
    rareEmber: '1-inch dense Lycra-reinforced rib; holds circular structure permanently',
    verdict: 'Zero sag, zero collar deformation, zero neckline warping.',
  },
  {
    feature: 'Drape & Silhouette',
    fastFashion: 'Clings to chest, torso, and back; loses shape when damp',
    rareEmber: 'Architectural boxy drop-shoulder cut hangs away from the torso',
    verdict: 'Creates structured streetwear proportions regardless of body type.',
  },
  {
    feature: 'Print Technology',
    fastFashion: 'Cracking rubberized plastisol or peeling transfers',
    rareEmber: 'Industrial heat-cured DTF & molecular dye-sublimation',
    verdict: 'Prints flex with the cotton fibers and withstand 50+ cold washes without fading.',
  },
  {
    feature: 'Fabric Composition',
    fastFashion: 'Low-grade carded poly-cotton blends prone to pilling',
    rareEmber: '100% Super Combed Bio-Washed Cotton & American Supima',
    verdict: 'Combed long-staple yarns with hypoallergenic, itch-free bio-wash finish.',
  },
];

export default function GsmGuidePage() {
  return (
    <main className="page-top min-h-screen text-[#0D0D0F] pb-24 bg-[#FAF8F5]">
      {/* 1. BREADCRUMBS */}
      <nav aria-label="Breadcrumb" className="bg-[#FAF8F5] border-b border-black/[0.05] py-2 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-[1400px] mx-auto flex items-center gap-2 text-[11px] font-mono text-neutral-500">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-black transition-colors">Streetwear Catalog</Link>
          <span>/</span>
          <span className="text-neutral-900 font-bold">GSM &amp; Technical Fabric Guide</span>
        </div>
      </nav>

      {/* 2. HERO EDITORIAL HEADER */}
      <section className="bg-gradient-to-b from-[#F3F0EA] via-[#FAF8F5] to-[#FAF8F5] border-b border-black/[0.08] py-12 sm:py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 border border-black/10 text-neutral-800 text-xs font-mono font-bold tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-[#E04F33] animate-pulse" />
            TECHNICAL TEXTILE MANIFESTO
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#0D0D0F] tracking-tight leading-[1.08]">
            The Authoritative Guide to Streetwear GSM &amp; Fabric Weights
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mx-auto mt-4 font-medium">
            Fabric density dictates how a garment hangs, breathes, insulates, and survives the washer. Understand the real science behind 160 GSM Supima, 240 GSM heavyweights, and 400 GSM winter fleece armor.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-neutral-700">
            <span className="px-3 py-1.5 rounded-lg bg-white border border-black/10 shadow-2xs">
              🧵 Verified Factory Blanks (Qikink Spec)
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-black/10 shadow-2xs">
              ⚖️ 160 to 400 GSM Full Spectrum
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-black/10 shadow-2xs">
              🇮🇳 Tailored for Indian Climates
            </span>
          </div>

          {/* Quick-Jump Anchors */}
          <div className="mt-8 pt-6 border-t border-black/[0.08] max-w-4xl mx-auto">
            <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider block mb-3">
              Quick Jump To Weight Tier
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {TIERS.map((tier) => (
                <a
                  key={tier.id}
                  href={`#${tier.id}`}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-950 hover:text-white border border-black/10 text-xs font-mono font-bold transition-all no-underline text-neutral-800 shadow-2xs"
                >
                  {tier.gsm}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 mt-12 sm:mt-16 flex flex-col gap-16 sm:gap-20">

        {/* 3. WHAT IS GSM & THE 3 GOLDEN RULES */}
        <section className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-10 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E04F33] uppercase tracking-wider mb-2">
            <Info className="w-4 h-4" />
            Textile Physics 101
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            What Does GSM Actually Mean in Streetwear?
          </h2>
          <div className="prose prose-neutral max-w-none mt-4 text-sm sm:text-base text-neutral-700 leading-relaxed font-normal">
            <p>
              <strong>GSM stands for &ldquo;Grams per Square Meter&rdquo;</strong> (\(g/m^2\)). It is the international standard metric used by textile mills to measure the exact physical weight of raw fabric when cut into a one-meter by one-meter square.
            </p>
            <p>
              In mass-market retail, fast-fashion brands often use <strong>120–145 GSM</strong> cotton to save yarn costs. While cheap to produce, these thin fabrics cling to the torso, show body contours or undergarments in daylight, twist sideways at the seams, and lose collar tension after only two washes.
            </p>
            <p>
              True luxury streetwear relies on <strong>substantial fabric heft (240 to 400 GSM)</strong>. The weight of the fabric pulls downward under gravity, creating the coveted architectural drop-shoulder boxy drape that hangs away from the torso and holds its clean rectangular silhouette all day long.
            </p>
          </div>

          {/* THE 3 CORE RULES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 pt-8 border-t border-black/[0.08]">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-black/[0.05]">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-mono font-bold text-xs mb-3">
                01
              </div>
              <h3 className="font-bold text-zinc-950 text-base mb-1.5">
                Higher GSM ≠ Always Better
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                A 400 GSM hoodie is unbeatable in a cold Delhi or Bengaluru winter night, but unwearable in a 38°C Chennai afternoon. True craftsmanship is matching the right GSM to the right climate and silhouette.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-black/[0.05]">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-mono font-bold text-xs mb-3">
                02
              </div>
              <h3 className="font-bold text-zinc-950 text-base mb-1.5">
                Yarn Quality Trumps Raw Bulk
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Cheap carded cotton or thick unbreathable polyester feels like wearing a plastic greenhouse. RareEmber uses 100% super-combed bio-washed cotton yarns that breathe naturally and feel silky soft.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-black/[0.05]">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-mono font-bold text-xs mb-3">
                03
              </div>
              <h3 className="font-bold text-zinc-950 text-base mb-1.5">
                The Drop-Shoulder Equation
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                A drop-shoulder cut requires at least 240 GSM single jersey or 260 GSM French terry. Any lighter, and the extended sleeve droops and collapses against the arm instead of holding its boxy streetwear drape.
              </p>
            </div>
          </div>
        </section>

        {/* 4. EXHAUSTIVE TIER-BY-TIER DEEP-DIVE CARDS */}
        <section className="flex flex-col gap-10 sm:gap-14">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-[#E04F33] uppercase tracking-wider block mb-1">
              Technical Specifications
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              Tier-By-Tier Breakdown: Pros, Cons &amp; Best Seasons
            </h2>
            <p className="text-sm text-neutral-600 mt-2 font-medium">
              Every garment weight tested against real Indian humidity, wash resistance, opacity, and silhouette drape.
            </p>
          </div>

          {TIERS.map((tier, idx) => (
            <article
              key={tier.id}
              id={tier.id}
              className="scroll-mt-24 rounded-3xl bg-white border border-black/[0.08] overflow-hidden shadow-xs hover:border-black/20 transition-colors"
            >
              {/* Tier Header Banner */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-zinc-950 via-neutral-900 to-zinc-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E04F33] text-white text-[11px] font-mono font-bold uppercase tracking-wider">
                      {tier.gsm}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      Tier 0{idx + 1} • {tier.category}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
                    {tier.title}
                  </h3>
                  <div className="text-xs sm:text-sm font-mono text-neutral-400 mt-1">
                    Verified Factory Blank: <span className="text-white font-bold">{tier.blankSku}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Fabric Density</div>
                    <div className="text-xs font-mono font-bold text-emerald-400">{tier.weightIndex}</div>
                  </div>
                  <div className="h-8 w-px bg-white/10 hidden sm:block" />
                  <Link
                    href={`/shop?cat=all`}
                    className="px-4 py-2 rounded-xl bg-white text-zinc-950 hover:bg-[#E04F33] hover:text-white text-xs font-mono font-bold transition-all no-underline inline-flex items-center gap-1.5"
                  >
                    <span>Shop This Weight</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* Tier Content Body */}
              <div className="p-6 sm:p-8 md:p-10 flex flex-col gap-6 sm:gap-8">
                {/* Hand Feel & Composition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-black/[0.05]">
                  <div>
                    <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                      Fabric Composition
                    </span>
                    <p className="text-sm sm:text-base font-bold text-zinc-950">
                      {tier.composition}
                    </p>
                    <div className="mt-3">
                      <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                        Opacity Rating
                      </span>
                      <p className="text-xs sm:text-sm text-neutral-700 font-medium">
                        {tier.opacity}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                      Hand Feel &amp; Drape Profile
                    </span>
                    <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium">
                      {tier.handFeel}
                    </p>
                    <div className="mt-3">
                      <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                        Best Season &amp; Weather in India
                      </span>
                      <p className="text-xs sm:text-sm text-[#E04F33] font-bold">
                        {tier.idealSeason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pros and Cons Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* Advantages */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Key Advantages &amp; Why We Choose It
                    </div>
                    <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-neutral-800 font-medium pl-0 list-none mb-0">
                      {tier.pros.map((pro, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold text-base leading-none mt-0.5">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Considerations & Cons */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/50 border border-amber-200/60">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
                      <XCircle className="w-4 h-4 text-amber-600" />
                      Trade-Offs &amp; What to Expect
                    </div>
                    <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-neutral-800 font-medium pl-0 list-none mb-0">
                      {tier.cons.map((con, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold text-base leading-none mt-0.5">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Garment Care Tip */}
                <div className="p-4 rounded-xl bg-neutral-100/70 border border-black/5 flex items-start gap-3 text-xs text-neutral-700">
                  <ShieldCheck className="w-4 h-4 text-zinc-950 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-zinc-950 font-bold">Washing &amp; Care Mandate: </strong>
                    {tier.care}
                  </div>
                </div>

                {/* Available RareEmber Pieces in this Tier */}
                <div className="pt-2">
                  <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider block mb-3">
                    Available Pieces in {tier.gsm}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {tier.pieces.map((piece, pIdx) => (
                      <Link
                        key={pIdx}
                        href={`/product/${piece.slug}`}
                        className="p-3.5 rounded-xl bg-[#FAF8F5] border border-black/10 hover:border-black/30 hover:bg-white transition-all flex items-center justify-between gap-2 no-underline text-zinc-950 group shadow-2xs"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate group-hover:text-[#E04F33] transition-colors">
                            {piece.name}
                          </div>
                          <div className="text-[11px] font-mono text-neutral-500 font-bold mt-0.5">
                            {piece.price}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-zinc-950 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* 5. SIDE-BY-SIDE BENCHMARK TABLE */}
        <section className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-10 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-mono font-bold text-[#E04F33] uppercase tracking-wider block mb-1">
              Direct Benchmark
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              Mall Fast Fashion vs. RareEmber Streetwear
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">
              Why mass-market mall tees feel flimsy after three washes while archival heavyweight cotton lasts years.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-black/10 text-neutral-500 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3 sm:px-4">Dimension</th>
                  <th className="py-3 px-3 sm:px-4 text-neutral-400">Fast-Fashion Retail</th>
                  <th className="py-3 px-3 sm:px-4 text-zinc-950 font-bold bg-neutral-100/50 rounded-t-lg">RareEmber Archival</th>
                  <th className="py-3 px-3 sm:px-4">Engineering Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {COMPARISON_ROWS.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-zinc-950 align-top">
                      {row.feature}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-neutral-500 align-top">
                      {row.fastFashion}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-zinc-950 font-semibold bg-neutral-100/30 align-top">
                      {row.rareEmber}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-xs font-medium text-emerald-800 align-top">
                      {row.verdict}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. GLOBAL CTA */}
        <section className="bg-gradient-to-r from-zinc-950 via-neutral-900 to-zinc-950 rounded-3xl p-8 sm:p-12 text-white text-center shadow-md relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10">
            <span className="px-3 py-1 rounded-full bg-[#E04F33]/20 border border-[#E04F33]/50 text-[#FF6B4A] text-xs font-mono font-bold tracking-widest uppercase inline-block mb-3">
              CRAFTED FOR THE RARE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Feel the Physical Difference?
            </h2>
            <p className="text-neutral-300 text-xs sm:text-base mt-2 max-w-xl mx-auto font-medium">
              Explore Collection 01. Complimentary express air delivery across India with 7-day doorstep size exchange.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop?cat=mens-printed"
                className="px-6 py-3 rounded-xl bg-white text-zinc-950 hover:bg-[#E04F33] hover:text-white text-xs sm:text-sm font-bold transition-all shadow-sm no-underline"
              >
                Shop 240 GSM Graphic Drops
              </Link>
              <Link
                href="/shop"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition-all no-underline"
              >
                Explore Full Catalog
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
