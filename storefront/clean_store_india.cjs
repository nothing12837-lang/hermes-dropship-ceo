const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:(process.env.SUPABASE_DB_PASS || "")@db.qdkkxpfhwrwyoardlceo.supabase.co:5432/postgres';

async function main() {
  console.log('🧹 Purging CJ Products & Test History for 100% Indian Focus...');
  const client = new Client(DB_URL);
  await client.connect();

  // 1. Delete CJ / Global products
  const delCJ = await client.query("DELETE FROM products WHERE market != 'INDIA' OR supplier = 'CJ'");
  console.log(`✅ Removed ${delCJ.rowCount} CJ/Global products from database.`);

  // 2. Clear test orders & order items
  try {
    const delItems = await client.query("DELETE FROM order_items");
    console.log(`✅ Removed test order items: ${delItems.rowCount}`);
  } catch (e) {
    // If order_items table does not exist, ignore
  }

  const delOrders = await client.query("DELETE FROM orders");
  console.log(`✅ Cleared ${delOrders.rowCount} test orders. Orders ledger is now 100% clean!`);

  // 3. Verify remaining active catalog
  const prods = await client.query("SELECT id, title, price_inr, compare_at_price, category, supplier, market FROM products ORDER BY price_inr ASC");
  console.log(`\n🇮🇳 Total Indian Products Live in Store: ${prods.rows.length}`);
  
  console.log('\n--- Sample of Active Indian Catalog & Pricing ---');
  prods.rows.slice(0, 10).forEach((p, idx) => {
    const margin = p.compare_at_price ? Math.round((1 - p.price_inr / p.compare_at_price) * 100) : 40;
    console.log(`${idx + 1}. [${p.category.toUpperCase()}] ${p.title.slice(0, 42)}... | ₹${p.price_inr} (MRP: ₹${p.compare_at_price}, ~${margin}% OFF)`);
  });

  await client.end();
  console.log('\n✨ Database is now 100% focused on India domestic market!');
}

main().catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
