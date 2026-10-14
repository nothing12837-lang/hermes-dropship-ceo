const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || `postgresql://postgres:${process.env.SUPABASE_DB_PASS || ''}@db.qdkkxpfhwrwyoardlceo.supabase.co:5432/postgres`;

async function main() {
  if (process.env.CONFIRM_PURGE !== 'YES_I_REALLY_WANT_TO_PURGE') {
    console.warn('⚠️ Safety Notice: Destructive cleanup script is locked. Set CONFIRM_PURGE=YES_I_REALLY_WANT_TO_PURGE to execute.');
    return;
  }

  if (!process.env.SUPABASE_DB_PASS && !process.env.DATABASE_URL) {
    console.error('Error: SUPABASE_DB_PASS or DATABASE_URL must be set in environment.');
    return;
  }

  console.log('🧹 Purging Non-Indian Products & Old Test Records safely...');
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  try {
    await client.query('BEGIN');

    // 1. Delete CJ / non-India products
    const delCJ = await client.query("DELETE FROM products WHERE market != 'INDIA' AND supplier != 'Meesho'");
    console.log(`✅ Removed ${delCJ.rowCount} non-India products from database.`);

    // 2. Only clear test orders (never delete production customer orders)
    const delOrders = await client.query("DELETE FROM orders WHERE user_email ILIKE '%test%' OR user_email ILIKE '%example.com%'");
    console.log(`✅ Cleared ${delOrders.rowCount} dummy test orders.`);

    await client.query('COMMIT');
    console.log('✨ Transaction committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during cleanup, rolled back:', err);
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('Error during cleanup:', err);
});
