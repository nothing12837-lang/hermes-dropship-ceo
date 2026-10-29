export interface BlogPost {
  slug: string;
  emoji: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  wash: string;
  body: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'the-architecture-of-the-drop-shoulder-silhouette',
    emoji: '📐',
    category: 'Silhouette & Proportions',
    title: 'The Architecture of the Drop-Shoulder Silhouette: Mastering Modern Streetwear Proportions',
    excerpt: 'The geometric science behind relaxed armholes, 240 GSM fabric rigidity, and how drop-shoulder proportions create a structured streetwear drape.',
    readTime: '5 min',
    wash: '#f5f5f4',
    body: [
      'Standard mass-market apparel relies on conventional set-in sleeves cut close to the shoulder joint. This pattern was conceived for fitted business dress shirts, not modern streetwear. When rendered in lightweight 140–160 GSM single jersey cotton, the garment collapses inward, clingy awkwardly to the chest and midriff while wrinkling uncontrollably after a single laundering cycle.',
      'RareEmber approaches streetwear as wearable brutalist architecture. Our drop-shoulder silhouette drops the shoulder seam 2.5 to 3.5 inches past the natural acromion bone, paired with an expanded chest circumference and calibrated sleeve taper. This creates an authentic boxy volume that frames the torso with deliberate rectangular balance.',
      'Structure requires substance. To achieve that signature architectural drape that remains crisp through dynamic movement, we exclusively mill 240 GSM super-combed bio-washed cotton. The heavier yarn density imparts natural vertical rigidity, allowing the fabric to cascade straight down rather than bunching. Paired with our high-density 1-inch Lycra ribbed collar that resists neck distortion, each piece retains its intended sculptural form indefinitely.',
      'When styling drop-shoulder proportions, volume discipline is paramount. Counterbalance the broad, relaxed upper silhouette with wide-leg carpenter trousers, raw selvedge denim, or heavyweight parachute pants. Discover our complete range of architectural oversized editions online at https://www.rareember.shop/shop.',
    ],
  },
  {
    slug: 'inside-collection-01-statement-graphics-acid-wash-textures',
    emoji: '🔥',
    category: 'Archive Editorial',
    title: 'Inside Collection 01: Statement Graphics, Acid-Wash Textures & Timeless Cuts',
    excerpt: 'A deep dive into the mineral acid-wash process, high-density archival prints, and why Collection 01 rejects fast-fashion polyester shortcuts.',
    readTime: '4 min',
    wash: '#fee2e2',
    body: [
      'Collection 01 represents the foundational thesis of RareEmber: modern streetwear elevated by timeless cuts, raw organic textures, and museum-grade graphic execution. In an era dominated by synthetic polyester blends and disposable hype drops, Collection 01 returns to the sensory purity of heavyweight natural cotton fibers.',
      'The defining centerpiece of the collection is our mineral acid-wash treatment. Unlike surface-level digital sublimation or flat reactive dyes, our acid-wash pieces undergo an intensive artisanal bleaching and pumice stone tumbler washing protocol. The process selectively strips pigments along the seams, cuffs, and collar ridges, generating an individualized, distressed marble patina where no two garments in the archive are identical.',
      'Complementing the distressed wash is our archival graphic engine. From the mechanical futurism of Red Mecha and Chrome Cyber to the evocative inkwork of Tokyo Street and the Stay True Skull & Fearless Dragon, every artwork is screen-cured using high-density elastomeric inks. The print integrates directly into the knitted cotton loops, flexing with the garment without cracking, peeling, or stiffening.',
      'Collection 01 is produced in strictly limited small-batch editions to preserve exclusivity and collector integrity. Explore available graphic editions and mineral washes now at https://www.rareember.shop/shop.',
    ],
  },
  {
    slug: 'autumn-winter-layering-varsity-jackets-heavyweight-hoodies',
    emoji: '🧥',
    category: 'Styling Lookbook',
    title: 'Autumn/Winter Layering: Styling Contrast Varsity Jackets & Heavyweight Hoodies',
    excerpt: 'The definitive guide to cold-weather streetwear layering: pairing 380 GSM loopback fleece hoodies with 350 GSM contrast varsity jackets.',
    readTime: '4 min',
    wash: '#e0f2fe',
    body: [
      'Cold-weather layering is the ultimate test of streetwear discernment. When executed properly, layering creates depth, textural contrast, and functional thermal insulation without sacrificing kinetic mobility or structural proportions.',
      'The foundation of any serious cold-weather street fit begins with our 380 GSM Heavyweight Winter Fleece Hoodie. Engineered from 100% super-combed cotton loops with an ultra-dense brushed interior, its crown achievement is the double-layered self-fabric hood. By eliminating flimsy drawstrings and constructing a four-piece hood panel, the hood stands permanently upright, creating an elevated architectural collarline that never sags.',
      'Layering begins by pairing the 380 GSM hoodie beneath our Contrast-Sleeve Varsity Jacket (350 GSM). The matte wool-blend body and structured contrast sleeves frame the heavyweight hoodie interior, while heavy custom metal snap buttons allow versatile thermal regulation. The upright double-hood sits cleanly over the varsity collar without bunching.',
      'Complete the look with relaxed-fit heavyweight fleece joggers or vintage-washed utility cargos and retro athletic sneakers. View our curated outerwear lineup and duo sets at https://www.rareember.shop/shop.',
    ],
  },
  {
    slug: 'rareember-standard-serialized-digital-ownership-pass',
    emoji: '🛡️',
    category: 'Brand Heritage & Technology',
    title: 'The RareEmber Standard: How Our Serialized Digital Ownership Pass Works',
    excerpt: 'Every completed RareEmber acquisition generates an encrypted, tamper-proof digital archival certificate. Here is how we verify authentic ownership.',
    readTime: '3 min',
    wash: '#fef3c7',
    body: [
      'In the modern luxury landscape, authenticity and provenance are as vital as fabric craftsmanship. High-end streetwear collectors demand absolute certainty that the pieces in their personal wardrobe are genuine studio editions produced under strict quality control standards.',
      'The RareEmber Standard introduces an automated digital ownership verification system embedded directly into the client checkout journey. The moment an acquisition is verified through our studio servers, an immutable cryptographic ownership pass is generated and bound to the client order record.',
      'Upon order completion, clients access their private confirmation desk at /success, where their Serialized Digital Archival Ownership Pass is displayed with an encrypted cryptographic fingerprint, timestamped order ledger, and verified acquisition credentials. This digital pass serves as permanent provenance for insurance valuation, future secondary market authentication, and collector verification.',
      'Every piece dispatched from our workshops carries this uncompromising standard of luxury transparency. Acquire your authentic studio piece today at https://www.rareember.shop/shop.',
    ],
  },
];

export const faqs = [
  {
    q: 'How fast is express delivery across India? Is shipping really free?',
    a: 'All orders qualify for 100% Complimentary Express Air Delivery across 29,000+ PIN codes in India. We dispatch within 24 to 48 hours from our domestic workshops via BlueDart Air and Delhivery Air with live milestone tracking (typical transit time 3–5 business days).',
  },
  {
    q: 'Can I pay via Cash on Delivery (COD)?',
    a: 'Yes. Verified Cash on Delivery (COD) is supported nationwide. We use automated instant OTP confirmation at checkout to ensure seamless doorstep handoff.',
  },
  {
    q: 'What is the 7-Day Doorstep Size Exchange policy?',
    a: 'We offer an effortless 7-day doorstep size exchange guarantee. If your garment silhouette or size does not fit your proportions as desired, visit our /returns portal for a prompt doorstep collection and free size exchange.',
  },
  {
    q: 'How are RareEmber garments engineered and constructed?',
    a: 'We operate as an independent direct-to-consumer luxury streetwear studio. By crafting in limited small-batch editions and shipping directly from our domestic workshops in Tirupur, we deliver authentic 240 GSM combed cotton and 380 GSM fleece streetwear with zero inflated showroom markups.',
  },
  {
    q: 'How do I track my order status in real time?',
    a: 'Enter your email or Order ID on our /track portal to view real-time transit milestones from Workshop Quality Inspection to Air Express Cargo Transit and Doorstep Delivery.',
  },
];

export const lifestyleTips = [
  { emoji: '🔥', name: 'Kabir V., Streetwear Designer', tip: '“Invest in structured 240 GSM cotton. The boxy drop-shoulder cut flatters any frame without clinging.”' },
  { emoji: '🪴', name: 'Tanvi Sharma, Lifestyle Curator', tip: '“An extended minimalist desk mat provides an ultra-clean foundation for any focused creative workstation.”' },
  { emoji: '⚡', name: 'Rohan Verma, Street Style Reviewer', tip: '“Always wash heavyweight streetwear inside-out in cold water. Preserves cotton fiber density and archival graphic saturation for years.”' },
];

export const reviewsFull = [
  { product: 'unisex-acid-wash-hoodie-32493953', name: 'Aarav M., Mumbai', verified: 'Verified Collector', stars: 5, text: 'The 380 GSM fabric weight and mineral acid wash are unreal. The double hood stands completely upright and the boxy drape easily rivals ₹6,000 designer imports.' },
  { product: 'unisex-oversized-standard-t-shirt-32476431', name: 'Vikram S., Bengaluru', verified: 'Verified Collector', stars: 5, text: 'The 240 GSM bio-washed cotton drape is incredible. The liquid chrome graphics look high-end and the 1-inch collar has zero sag after washing. Express air delivered in 2 days.' },
  { product: 'unisex-oversized-classic-t-shirt-32476332', name: 'Ananya R., Delhi NCR', verified: 'Verified Collector', stars: 5, text: 'The Tokyo Street artwork is razor sharp. Substantial boxy streetwear cut that pairs perfectly with wide-leg denim. Best streetwear purchase of the year.' },
  { product: 'unisex-heavyweight-hoodie-32493938', name: 'Sneha P., Pune', verified: 'Verified Collector', stars: 5, text: 'Heavy 380 GSM fleece that keeps you warm in serious winter weather. The drop-shoulder cut looks effortlessly stylish.' },
  { product: 'desk-mat-900x400-32476856', name: 'Rahul D., Hyderabad', verified: 'Verified Collector', stars: 5, text: 'Massive 900x400mm desk mat with water-resistant surface and anti-fray stitched perimeter. Upgraded my dual monitor setup instantly.' },
];
