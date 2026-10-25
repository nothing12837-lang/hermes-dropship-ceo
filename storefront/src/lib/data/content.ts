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
    slug: 'hackathon-college-fest-custom-merch-guide',
    emoji: '⚡',
    category: 'Merch Engineering',
    title: 'The Blueprint for High-End College Fest & Hackathon Merch in India',
    excerpt: 'Why tech clubs and collegiate societies are abandoning flimsy 140 GSM promotional tees for 240 GSM drop-shoulder streetwear drops.',
    readTime: '4 min',
    wash: '#fef3c7',
    body: [
      'Every major tech conference and college festival hands out swag tees. Yet within 48 hours, 90% of them end up as dusters or sleepwear because cheap, thin cotton warps and generic logos look uninspired.',
      'Rare Ember custom merch flips the model: we supply authentic 240 GSM bio-washed combed cotton blanks and 350 GSM varsity jackets cut in contemporary relaxed boxy fits.',
      'Combined with high-density archival screenprints and zero setup fees, campus organizers can create merch that students proudly wear on rotation across college campuses and tech workspaces.',
    ],
  },
  {
    slug: '380-gsm-french-terry-hoodie-craftsmanship',
    emoji: '🧥',
    category: 'Fabric Craftsmanship',
    title: 'Inside the Loom: Why 380 GSM French Terry Fleece Defines Premium Streetwear',
    excerpt: 'The technical differences between brushed fleece, loopback French terry, and why dense yarn weight prevents hoodie sag.',
    readTime: '5 min',
    wash: '#e0f2fe',
    body: [
      'A great hoodie is measured by its architectural drape and hood posture. Standard retail fleece uses synthetic polyester blends that pill, build static, and collapse when worn without a jacket.',
      'Our 380 GSM French Terry is knit from 100% super-combed cotton loops. The interior loopback construction promotes breathability in ambient Indian temperatures while providing substantial insulation against chilly evenings.',
      'Featuring a double-layered structured hood that stands upright without flimsy drawstrings and heavy 2.5-inch ribbed hems, this is heavyweight street apparel designed to last 5+ years.',
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
    slug: 'how-to-style-oversized-full-sleeve-tees',
    emoji: '✨',
    category: 'Style & Fit Guide',
    title: 'The Definitive Guide to Styling 240 GSM Full Sleeve Graphic Tees',
    excerpt: 'From wide-leg cargo pants to layered streetwear aesthetics: how to rock heavyweight cotton in everyday Indian street style.',
    readTime: '3 min',
    wash: '#ede9fe',
    body: [
      'A heavyweight full sleeve tee is the centerpiece of modern minimalist fashion. The secret lies in weight: 240 GSM combed cotton naturally sits structured over the shoulders and chest without sagging or clinging.',
      'For the ultimate casual street aesthetic, balance the boxy upper volume with relaxed-fit parachute trousers or raw denim and clean neutral sneakers.',
      'Always wash cold inside-out and avoid direct hot ironing on DTF chest or back graphics to keep your tee looking pristine for years.',
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
  { product: 'qikink-32477737-mens-full-sleeve-t-shirt', name: 'Vikram S., Bengaluru', verified: 'Verified Buyer', stars: 5, text: '240 GSM bio-washed cotton drape is unreal. The full sleeve cuffs fit snugly and the graphic looks high-end. Delhivery Air delivered in 2 days.' },
  { product: 'rareember-artisan-matte-ceramic-coffee-mug', name: 'Ananya R., Delhi NCR', verified: 'Verified Buyer', stars: 5, text: 'Matte terracotta finish feels super premium in hand. Safely packed in molded thermocol with zero scratches. My morning coffee go-to!' },
  { product: 'rareember-custom-heavyweight-oversized-tee', name: 'Sneha P., Pune', verified: 'Verified Buyer', stars: 5, text: 'Ordered with my custom initials on the chest. The DTF print quality is crisp and looks factory tailored. Best personalized gift ever.' },
  { product: 'rareember-minimalist-desk-mat', name: 'Rahul D., Hyderabad', verified: 'Verified Buyer', stars: 5, text: 'Massive desk mat with water-resistant surface and anti-fray stitched edges. Upgraded my dual monitor setup instantly.' },
];
