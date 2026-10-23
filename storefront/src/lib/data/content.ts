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
    slug: 'minimalist-desk-setup-guide',
    emoji: '💻',
    category: 'Workspace Aesthetics',
    title: 'How to Build an Ultra-Clean Minimalist Desk Setup Under ₹3,000',
    excerpt: 'Cable discipline, floating surfaces, and ambient backlighting tips that double your focus and elevate your workspace.',
    readTime: '4 min',
    wash: '#f1f5f9',
    body: [
      'Visual clutter creates cognitive friction. When your work surface is congested with tangled charging cords and loose stationery, your brain expends micro-energy constantly filtering out background noise.',
      'The foundational rule of modern aesthetic workspaces is elevation: get your laptop onto an angled aluminum riser to align the display with eye level, and route every peripheral cable through magnetic desk channels beneath the rim.',
      'Finish with warm 2700K ambient backlighting or a flame diffuser to transform a harsh fluorescent study area into a calm, focused executive cockpit. You do not need expensive designer Scandinavian oak; thoughtful modular organization achieves the same luxury look.',
    ],
  },
  {
    slug: 'smart-home-essentials-india',
    emoji: '⚡',
    category: 'Smart Living',
    title: '5 Factory-Direct Smart Gadgets That Instantly Upgrade Your Apartment',
    excerpt: 'From ambient flame LED humidifiers to wireless magnetic docks: the everyday tech upgrades worth having.',
    readTime: '3 min',
    wash: '#fef3c7',
    body: [
      'Modern urban living moves fast. Small daily rituals — returning home to a calm, cozy ambient space, dropping your phone onto a magnetic 15W dock instead of hunting for cords — compound into a higher quality of life.',
      'Our product sourcing team tests hundreds of factory-direct items to identify real utility: high-grade matte polycarbonate finishes, low-noise brushless motors, and USB-C universal power delivery.',
      'By bypassing traditional high-street middlemen, you get verified Japanese & minimalist design at true factory-floor pricing, delivered directly to your doorstep with full cash-on-delivery inspection.',
    ],
  },
  {
    slug: 'curated-living-space-zen',
    emoji: '🪴',
    category: 'Home & Decor',
    title: 'Why Japanese Wabi-Sabi Decor Is Dominating Modern Indian Homes',
    excerpt: 'Textured ceramic planters, natural linen tones, and warm minimal textures that bring serene balance to urban apartments.',
    readTime: '5 min',
    wash: '#e0f2fe',
    body: [
      'Wabi-sabi is the art of finding peace in natural simplicity and authentic textures. In fast-paced metropolitan centers like Bengaluru, Mumbai, and Delhi, homes are increasingly treated as restorative sanctuaries away from screen glare.',
      'Pairing unglazed matte ceramic pots with indoor greenery (monstera, jade, snake plants) softens hard concrete architecture and regulates ambient room humidity naturally.',
      'Keep color palettes grounded in oatmeals, warm terracotta, and subtle sage. A single artisanal statement piece commands more quiet elegance than ten pieces of plastic shelf filler.',
    ],
  },
  {
    slug: 'why-240-gsm-heavyweight-tees-dominate-indian-streetwear',
    emoji: '🔥',
    category: 'Streetwear Culture',
    title: 'Why 240 GSM Heavyweight Streetwear Is Replacing Standard Fast-Fashion in 2026',
    excerpt: 'The structural science behind drop-shoulder boxy cuts, GSM weight, and why combed bio-washed cotton preserves structured drape.',
    readTime: '4 min',
    wash: '#fee2e2',
    body: [
      'Standard mall brand t-shirts are made from cheap 140–160 GSM single jersey cotton that clings awkwardly, fades after two cycles, and shrinks in Indian weather. Genuine streetwear requires architectural structure.',
      'Rare Ember uses 240 GSM combed ring-spun cotton. The extra weight gives the t-shirt a crisp, relaxed drop-shoulder drape that maintains its boxy silhouette without feeling stuffy, thanks to bio-washing.',
      'Paired with archival Direct-To-Film (DTF) graphics that bend with the fabric rather than cracking, heavyweight streetwear delivers 10x the longevity of commercial fast-fashion at direct-from-mill pricing.',
    ],
  },
  {
    slug: 'how-to-style-oversized-boxy-hoodies',
    emoji: '✨',
    category: 'Style & Fit Guide',
    title: 'The Definitive Guide to Styling 380 GSM Heavyweight Boxy Hoodies',
    excerpt: 'From wide-leg cargo pants to layered streetwear aesthetics: how to rock heavyweight fleece in everyday Indian street style.',
    readTime: '3 min',
    wash: '#ede9fe',
    body: [
      'An oversized hoodie is the centerpiece of modern minimalist fashion. The secret lies in weight: a 380 GSM brushed fleece hoodie naturally sits structured over the shoulders and chest without sagging.',
      'For the ultimate casual street aesthetic, balance the boxy upper volume with relaxed-fit parachute trousers or raw denim and clean neutral sneakers.',
      'Always wash cold inside-out and avoid direct hot ironing on DTF chest or back graphics to keep your hoodie looking pristine for years.',
    ],
  },
];

export const faqs = [
  {
    q: 'How fast is express delivery across India? Is shipping really free?',
    a: 'All orders qualify for 100% Free Express Shipping Pan-India. We dispatch within 24 to 48 hours from our Tirupur manufacturing hub via BlueDart Air, Delhivery, and India Post with live end-to-end tracking (typical delivery 2–4 business days).',
  },
  {
    q: 'Can I pay via Cash on Delivery (COD)?',
    a: 'Yes! Cash on Delivery is available across 29,000+ PIN codes in India. You only pay when the package arrives safely at your doorstep.',
  },
  {
    q: 'What is your 7-Day Easy Replacement policy?',
    a: 'We offer a 7-day hassle-free replacement policy. If an item arrives damaged, defective, or with a sizing mismatch, visit our /returns portal or email support@rareember.shop with your Order ID for an immediate free doorstep replacement.',
  },
  {
    q: 'How are your prices so competitive compared to retail stores?',
    a: 'We operate on a factory-direct D2C model powered by on-demand production in Tirupur, Tamil Nadu. By bypassing traditional middlemen, excessive retail showroom rents, and unsold dead inventory markups, you receive authentic 240 GSM streetwear at factory pricing.',
  },
  {
    q: 'How do I track my order status in real time?',
    a: 'Enter your email or Order ID on our /track page to view live milestone updates from DTF Printing → Quality Inspection → Air Express Cargo Transit → Out for Delivery.',
  },
];

export const lifestyleTips = [
  { emoji: '🔥', name: 'Kabir V., Streetwear Designer', tip: '“Invest in structured 240 GSM cotton. The boxy drop-shoulder cut flatters any frame without clinging.”' },
  { emoji: '🪴', name: 'Tanvi Sharma, Lifestyle Curator', tip: '“A minimalist ceramic desk mug and an extended vegan leather desk mat turn any workstation into a focused zen studio.”' },
  { emoji: '⚡', name: 'Rohan Verma, Street Style Reviewer', tip: '“Always wash high-density DTF graphics inside-out in cold water. Preserves color saturation through 50+ wash cycles.”' },
];

export const reviewsFull = [
  { product: 'rareember-heavyweight-oversized-graphic-tee', name: 'Aarav M., Mumbai', verified: 'Verified Buyer', stars: 5, text: 'The 240 GSM fabric weight is unreal! Thick, structured drop shoulders, and the graphic print is razor sharp. Easily rivals luxury streetwear drops charging ₹3,500.' },
  { product: 'rareember-heavyweight-streetwear-hoodie', name: 'Vikram S., Bengaluru', verified: 'Verified Buyer', stars: 5, text: '380 GSM fleece is so warm and cozy. Boxy fit is spot on and the kangaroo pocket has reinforced stitching. BlueDart delivered in 3 days.' },
  { product: 'rareember-artisan-matte-ceramic-coffee-mug', name: 'Ananya R., Delhi NCR', verified: 'Verified Buyer', stars: 5, text: 'Matte terracotta finish feels super premium in hand. Safely packed in molded thermocol with zero scratches. My morning coffee go-to!' },
  { product: 'rareember-custom-heavyweight-oversized-tee', name: 'Sneha P., Pune', verified: 'Verified Buyer', stars: 5, text: 'Ordered with my custom initials on the chest. The DTF print quality is crisp and looks factory tailored. Best personalized gift ever.' },
  { product: 'rareember-minimalist-desk-mat', name: 'Rahul D., Hyderabad', verified: 'Verified Buyer', stars: 5, text: 'Massive desk mat with water-resistant surface and anti-fray stitched edges. Upgraded my dual monitor setup instantly.' },
];
