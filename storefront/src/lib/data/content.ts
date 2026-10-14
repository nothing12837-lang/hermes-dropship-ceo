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
];

export const faqs = [
  {
    q: 'How fast is express delivery across India? Is shipping really free?',
    a: 'All orders qualify for 100% Free Express Shipping Pan-India. We dispatch within 24 to 48 hours from vetted domestic warehouse hubs via BlueDart, Delhivery, and India Post with live end-to-end tracking (typical delivery 2–4 business days).',
  },
  {
    q: 'Can I pay via Cash on Delivery (COD)?',
    a: 'Yes! Cash on Delivery is available across 19,000+ PIN codes in India. You only pay when the package arrives safely at your doorstep.',
  },
  {
    q: 'What is your 7-Day Easy Replacement policy?',
    a: 'We offer a 7-day hassle-free replacement policy. If an item arrives damaged, defective, or incorrect, email support at rareemberagency@gmail.com or message us on WhatsApp with your Order ID for an immediate free doorstep replacement.',
  },
  {
    q: 'How are your prices so competitive compared to retail stores?',
    a: 'We operate on a factory-direct D2C model. By connecting verified manufacturing facilities directly with consumers without distributor markups, fancy retail storefront rents, or multi-tier agent commissions, you receive authentic premium items at 40–70% off M.R.P.',
  },
  {
    q: 'How do I track my order status in real time?',
    a: 'Enter your email or Order ID on our /track page to view live milestone updates from Dispatch → Air Cargo Transit → Out for Delivery. You also receive real-time SMS & email notifications at every milestone.',
  },
];

export const lifestyleTips = [
  { emoji: '💡', name: 'Aarav Mehta, Workspace Ergonomist', tip: '“Elevate your display to eye level. Raising your screen just 15cm prevents chronic neck fatigue and doubles posture comfort.”' },
  { emoji: '🪴', name: 'Tanvi Sharma, Interior Stylist', tip: '“Group decor in threes of varying heights. A textured ceramic planter, warm ambient lamp, and clean book stack creates instant balance.”' },
  { emoji: '⚡', name: 'Rohan Verma, Tech Reviewer', tip: '“Standardize on 65W GaN chargers with braided cables. Eliminates clutter and powers your phone, earbuds, and laptop simultaneously.”' },
];

export const reviewsFull = [
  { product: 'meesho-crystal-ball-3d-galaxy-led-lamp-wooden-base', name: 'Pooja K., Mumbai', verified: 'Verified Buyer', stars: 5, text: 'The 3D crystal ball galaxy look is breathtaking. Packaging was rock solid and arrived via BlueDart in 2 days. Transformed my study desk!' },
  { product: 'meesho-heavy-duty-welcome-textured-mesh-door-mat', name: 'Vikram S., Bengaluru', verified: 'Verified Buyer', stars: 5, text: 'Dirt trapping loop mesh is super heavy duty. Mud and water stays outside. Easily rivals brands charging 3x the price.' },
  { product: 'meesho-water-sensor-led-diyas-pack-of-12', name: 'Ankit R., Delhi NCR', verified: 'Verified Buyer', stars: 5, text: 'Poured a few drops of water and all 12 diyas lit up with warm golden light! Completely smokeless and safe for kids.' },
  { product: 'meesho-ultrasonic-flame-mist-aroma-diffuser', name: 'Sneha M., Pune', verified: 'Verified Buyer', stars: 5, text: 'The flame lighting effect in a dim bedroom looks mesmerizing. Whisper quiet and shuts off automatically when water runs out.' },
  { product: 'meesho-galaxy-star-astronaut-projector-night-lamp', name: 'Rahul D., Hyderabad', verified: 'Verified Buyer', stars: 5, text: 'The nebula galaxy projection on the ceiling is unreal. Magnetic head rotation works effortlessly with remote.' },
];
