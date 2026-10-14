const { Client } = require('pg');

const DB_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres:(process.env.SUPABASE_DB_PASS || "")@db.qdkkxpfhwrwyoardlceo.supabase.co:5432/postgres';

const categories = ['electronics', 'fashion', 'home-garden', 'pets'];

const adjectives = ['Premium', 'Luxury', 'Essential', 'Smart', 'Advanced', 'Classic', 'Modern', 'Eco-friendly', 'Pro', 'Ultra'];
const electronicsNouns = ['Headphones', 'Speaker', 'Watch', 'Charger', 'Power Bank', 'Camera', 'Microphone', 'Keyboard', 'Mouse', 'Tablet Stand'];
const fashionNouns = ['Jacket', 'Sneakers', 'Sunglasses', 'Backpack', 'T-Shirt', 'Jeans', 'Watch', 'Belt', 'Wallet', 'Scarf'];
const homeNouns = ['Coffee Maker', 'Desk Lamp', 'Planter', 'Throw Blanket', 'Diffuser', 'Vase', 'Candle', 'Clock', 'Mug', 'Pillow'];
const petsNouns = ['Dog Bed', 'Cat Toy', 'Leash', 'Collar', 'Bowl', 'Harness', 'Carrier', 'Grooming Brush', 'Scratching Post', 'Treat Dispenser'];

const images = {
  'electronics': ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800', 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800'],
  'fashion': ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 'https://images.unsplash.com/photo-1597811985956-6a537f818cc7?w=800'],
  'home-garden': ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800', 'https://images.unsplash.com/photo-1580828326082-9e5b9858564b?w=800', 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800', 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800'],
  'pets': ['https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', 'https://images.unsplash.com/photo-1598133894008-61f4f82828b6?w=800', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800']
};

function generateProducts() {
  const products = [];
  let idCounter = 1;
  
  for (const cat of categories) {
    const nouns = cat === 'electronics' ? electronicsNouns :
                  cat === 'fashion' ? fashionNouns :
                  cat === 'home-garden' ? homeNouns : petsNouns;
                  
    for (let i = 0; i < 25; i++) {
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const title = `${adj} ${noun} ${i + 1}`;
      const price = Math.floor(Math.random() * 150) + 15;
      const compare = Math.floor(price * (1.2 + Math.random() * 0.5));
      const img = images[cat][Math.floor(Math.random() * images[cat].length)];
      
      products.push({
        id: `${cat}-gen-${idCounter++}`,
        title: title,
        description: `High-quality ${title.toLowerCase()} perfect for everyday use.`,
        price: price,
        compare: compare,
        cat: cat,
        img: img
      });
    }
  }
  return products;
}

async function seed() {
  const client = new Client(DB_URL);
  await client.connect();
  
  const products = generateProducts();
  
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
      Math.random() > 0.8, Math.random() > 0.7, p.id, emoji, p.description, p.title
    ]);
  }
  
  console.log('Seeded ' + products.length + ' auto-generated products.');
  await client.end();
}

seed().catch(console.error);
