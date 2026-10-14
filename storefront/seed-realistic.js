const { Client } = require('pg');

const DB_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres:(process.env.SUPABASE_DB_PASS || "")@db.qdkkxpfhwrwyoardlceo.supabase.co:5432/postgres';

const catalog = [
  // Electronics
  {
    title: "Sony WH-1000XM4 Noise Canceling Headphones",
    category: "electronics",
    price: 248.00,
    compare: 349.99,
    img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800",
    desc: "Industry-leading noise canceling overhead headphones with mic for phone-calls and Alexa voice control."
  },
  {
    title: "Apple AirPods Pro (2nd Gen)",
    category: "electronics",
    price: 199.00,
    compare: 249.00,
    img: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800",
    desc: "Active Noise Cancellation, Transparency mode, and Personalized Spatial Audio."
  },
  {
    title: "Logitech MX Master 3S Wireless Mouse",
    category: "electronics",
    price: 99.99,
    compare: 119.99,
    img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800",
    desc: "Ergonomic 8K DPI track-on-glass sensor, quiet clicks, USB-C, Bluetooth."
  },
  {
    title: "Samsung 49-Inch Odyssey G9 Gaming Monitor",
    category: "electronics",
    price: 999.00,
    compare: 1399.00,
    img: "https://images.unsplash.com/photo-1527443195645-1133f7f28990?auto=format&fit=crop&q=80&w=800",
    desc: "Curved QLED computer monitor, 240Hz, 1ms response time, G-Sync."
  },
  {
    title: "Keychron K2 Wireless Mechanical Keyboard",
    category: "electronics",
    price: 79.00,
    compare: 99.00,
    img: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800",
    desc: "Bluetooth custom mechanical keyboard with white LED backlight."
  },

  // Fashion
  {
    title: "Classic Aviator Sunglasses",
    category: "fashion",
    price: 45.00,
    compare: 85.00,
    img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800",
    desc: "Timeless polarized aviators with metal frames and UV400 protection."
  },
  {
    title: "Minimalist Leather Cardholder Wallet",
    category: "fashion",
    price: 29.99,
    compare: 49.99,
    img: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800",
    desc: "Ultra-slim front pocket wallet crafted from genuine full-grain leather."
  },
  {
    title: "Vintage Moto Leather Jacket",
    category: "fashion",
    price: 195.00,
    compare: 295.00,
    img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800",
    desc: "Premium full-grain leather motorcycle jacket. Timeless design, built to last."
  },
  {
    title: "Men's Classic Canvas Sneakers",
    category: "fashion",
    price: 55.00,
    compare: 75.00,
    img: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800",
    desc: "Everyday versatile low-top sneakers perfect for casual styling."
  },
  {
    title: "Luxury Automatic Dive Watch",
    category: "fashion",
    price: 299.00,
    compare: 499.00,
    img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800",
    desc: "Water resistant up to 200m with a sapphire crystal dial and stainless steel band."
  },

  // Home-Garden
  {
    title: "Breville Barista Pro Espresso Machine",
    category: "home-garden",
    price: 549.99,
    compare: 699.99,
    img: "https://images.unsplash.com/photo-1517246281096-749e7354972f?auto=format&fit=crop&q=80&w=800",
    desc: "Barista-quality performance with a new intuitive interface and integrated grinder."
  },
  {
    title: "Ceramic Minimalist Planter Set",
    category: "home-garden",
    price: 34.00,
    compare: 55.00,
    img: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800",
    desc: "Matte white indoor plant pots with drainage holes and bamboo trays."
  },
  {
    title: "Smart Wi-Fi Essential Oil Diffuser",
    category: "home-garden",
    price: 49.00,
    compare: 69.00,
    img: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=800",
    desc: "App controlled ultrasonic aromatherapy diffuser works with Alexa & Google Home."
  },
  {
    title: "Chunky Knit Weighted Blanket",
    category: "home-garden",
    price: 89.00,
    compare: 149.00,
    img: "https://images.unsplash.com/photo-1580828326082-9e5b9858564b?auto=format&fit=crop&q=80&w=800",
    desc: "Breathable heavy cotton throw for deep, calming sleep on the couch or bed."
  },
  {
    title: "Modern Brass Desk Lamp",
    category: "home-garden",
    price: 42.00,
    compare: 65.00,
    img: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800",
    desc: "Adjustable reading lamp with a warm gold finish and LED bulb included."
  },

  // Pets
  {
    title: "Premium Orthopedic Dog Bed",
    category: "pets",
    price: 55.00,
    compare: 85.00,
    img: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800",
    desc: "Ultra-soft memory foam donut bed. Proven to reduce pet anxiety and joint pain."
  },
  {
    title: "Interactive Smart Laser Toy for Cats",
    category: "pets",
    price: 24.99,
    compare: 39.99,
    img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800",
    desc: "Automatic randomized laser patterns to keep indoor cats entertained for hours."
  },
  {
    title: "Heavy Duty No-Pull Dog Harness",
    category: "pets",
    price: 32.00,
    compare: 45.00,
    img: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800",
    desc: "Reflective and adjustable vest harness with front clip for training."
  },
  {
    title: "Modern Elevated Ceramic Pet Bowls",
    category: "pets",
    price: 38.00,
    compare: 50.00,
    img: "https://images.unsplash.com/photo-1598133894008-61f4f82828b6?auto=format&fit=crop&q=80&w=800",
    desc: "Reduces neck strain for cats and dogs, set in an aesthetic bamboo stand."
  }
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function run() {
  const client = new Client(DB_URL);
  await client.connect();
  
  let i = 0;
  for (const item of catalog) {
    i++;
    const id = 'hc-' + slugify(item.title).slice(0, 40) + '-' + i;
    
    // Mix trending and new arrivals
    const isTrending = (i % 3 === 0);
    const isNew = (i % 2 === 0);
    
    // Assign proper emojis based on category
    const emoji = item.category === 'electronics' ? '💻' :
                  item.category === 'fashion' ? '👕' :
                  item.category === 'home-garden' ? '🪴' : '🐕';
                  
    // Add realistic JSON details array
    const details = JSON.stringify([
      "Fast Express US Shipping (3-7 days)",
      "30-Day Hassle-Free Returns",
      "100% Quality Guarantee"
    ]);

    await client.query(`
      insert into products
        (id, title, description, price, compare_at_price, image_url, cj_sku, category,
         is_trending, is_new, slug, emoji, tag, short, details, rating, reviews, active)
      values
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16,$17,true)
      on conflict (id) do nothing;
    `, [
      id, item.title, item.desc, item.price, item.compare, item.img, 'mock-sku', item.category,
      isTrending, isNew, id, emoji, (isTrending ? 'Trending' : 'New'), item.desc, details, 4.8, 120 + (i * 45)
    ]);
  }

  console.log('Seeded completely realistic items!');
  await client.end();
}

run().catch(console.error);
