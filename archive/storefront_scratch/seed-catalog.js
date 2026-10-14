const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:(process.env.SUPABASE_DB_PASS || "")@db.qdkkxpfhwrwyoardlceo.supabase.co:5432/postgres';

const categories = ['electronics', 'fashion', 'home-garden', 'pets'];

const products = [
  // Electronics
  { id: 'elec-1', title: 'Noise Cancelling Headphones Pro', description: 'Industry leading noise cancellation.', price: 199.99, compare: 249.99, cat: 'electronics', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' },
  { id: 'elec-2', title: 'Smart Fitness Watch Series 7', description: 'Track your health and fitness 24/7.', price: 149.00, compare: 199.00, cat: 'electronics', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' },
  { id: 'elec-3', title: '4K Ultra HD Action Camera', description: 'Capture your adventures in stunning 4K.', price: 89.99, compare: 129.99, cat: 'electronics', img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800' },
  { id: 'elec-4', title: 'Wireless Bluetooth Earbuds', description: 'True wireless freedom with deep bass.', price: 45.99, compare: 79.99, cat: 'electronics', img: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800' },
  { id: 'elec-5', title: 'Portable Power Bank 20000mAh', description: 'Fast charging for all your devices.', price: 35.00, compare: 50.00, cat: 'electronics', img: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800' },
  // Fashion
  { id: 'fash-1', title: 'Men\'s Classic Leather Jacket', description: 'Genuine leather jacket for all seasons.', price: 120.00, compare: 180.00, cat: 'fashion', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800' },
  { id: 'fash-2', title: 'Women\'s Floral Summer Dress', description: 'Lightweight and breathable for summer.', price: 45.99, compare: 65.00, cat: 'fashion', img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800' },
  { id: 'fash-3', title: 'Unisex Aviator Sunglasses', description: 'UV400 protection with classic design.', price: 25.00, compare: 40.00, cat: 'fashion', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800' },
  { id: 'fash-4', title: 'Comfort Running Sneakers', description: 'Shock-absorbing soles for long runs.', price: 65.00, compare: 95.00, cat: 'fashion', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800' },
  { id: 'fash-5', title: 'Minimalist Canvas Tote Bag', description: 'Eco-friendly everyday tote.', price: 15.99, compare: 25.00, cat: 'fashion', img: 'https://images.unsplash.com/photo-1597811985956-6a537f818cc7?w=800' },
  // Home & Garden
  { id: 'home-1', title: 'Ceramic Pour-Over Coffee Maker', description: 'Brews the perfect cup every time.', price: 34.50, compare: 45.00, cat: 'home-garden', img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800' },
  { id: 'home-2', title: 'Luxury Velvet Throw Blanket', description: 'Super soft and cozy for cold nights.', price: 28.00, compare: 40.00, cat: 'home-garden', img: 'https://images.unsplash.com/photo-1580828326082-9e5b9858564b?w=800' },
  { id: 'home-3', title: 'Smart LED Light Bulbs (4-Pack)', description: 'Color-changing bulbs works with Alexa.', price: 39.99, compare: 55.00, cat: 'home-garden', img: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800' },
  { id: 'home-4', title: 'Indoor Succulent Planter Set', description: 'Set of 3 geometric planters.', price: 22.00, compare: 30.00, cat: 'home-garden', img: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800' },
  { id: 'home-5', title: 'Aromatherapy Essential Oil Diffuser', description: 'Humidifier with 7 color lights.', price: 29.99, compare: 45.00, cat: 'home-garden', img: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800' },
  // Pets
  { id: 'pet-1', title: 'Orthopedic Dog Bed with Memory Foam', description: 'Relieves joint pain for older dogs.', price: 59.99, compare: 89.99, cat: 'pets', img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800' },
  { id: 'pet-2', title: 'Interactive Laser Cat Toy', description: 'Automatic rotating laser for endless fun.', price: 18.50, compare: 25.00, cat: 'pets', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800' },
  { id: 'pet-3', title: 'Heavy Duty Dog Leash', description: 'Reflective threads and comfortable handle.', price: 14.99, compare: 20.00, cat: 'pets', img: 'https://images.unsplash.com/photo-1598133894008-61f4f82828b6?w=800' },
  { id: 'pet-4', title: 'Ceramic Elevated Cat Bowls', description: 'Prevents whisker fatigue.', price: 24.00, compare: 35.00, cat: 'pets', img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800' },
  { id: 'pet-5', title: 'Waterproof Pet Car Seat Cover', description: 'Protects backseat from dirt and hair.', price: 32.99, compare: 50.00, cat: 'pets', img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800' }
];

async function seed() {
  const client = new Client(DB_URL);
  await client.connect();
  
  for (const p of products) {
    const emoji = p.cat === 'electronics' ? '💻' : p.cat === 'fashion' ? '👕' : p.cat === 'home-garden' ? '🪴' : '🐕';
    
    await client.query(`
      insert into products (
        id, title, description, price, compare_at_price, image_url, category,
        is_trending, is_new, slug, emoji, active, short, story, details, rating, reviews
      ) values (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, true, $12, $13, '["High Quality", "Fast Shipping"]'::jsonb, 4.8, 150
      ) on conflict (id) do update set
        title = excluded.title,
        price = excluded.price,
        category = excluded.category,
        image_url = excluded.image_url,
        emoji = excluded.emoji
    `, [
      p.id, p.title, p.description, p.price, p.compare, p.img, p.cat,
      true, true, p.id, emoji, p.description, p.title
    ]);
  }
  
  console.log('Seeded ' + products.length + ' products.');
  await client.end();
}

seed().catch(console.error);
