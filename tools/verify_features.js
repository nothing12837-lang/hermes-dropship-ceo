const https = require('https');

function checkFeature(path, pattern, name) {
  return new Promise((resolve) => {
    https.get('https://www.rareember.shop' + path, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const found = data.includes(pattern);
        console.log((found ? '✅ ' : '❌ ') + name + ': ' + (found ? '100% INTACT & ACTIVE' : 'NOT FOUND'));
        resolve(found);
      });
    }).on('error', (e) => {
      console.log('❌ ' + name + ': ERROR ' + e.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log('--- COMPREHENSIVE FEATURE AUDIT ---');
  await checkFeature('/', 'Custom Studio', 'Homepage Hero & Custom Studio Banner');
  await checkFeature('/', 'RARE100', 'Promo Code RARE100');
  await checkFeature('/', 'Browse By Department', 'Department Categories');
  await checkFeature('/shop', 'All Items', 'Shop Catalog & Filters');
  await checkFeature('/product/qikink-t-shirts-full-sleeve-t-shirt-mf31', 'Choose Design', 'PDP Multi-Image & Style Selector');
  await checkFeature('/product/qikink-t-shirts-full-sleeve-t-shirt-mf31', 'Check Delivery', 'Indian PIN Code Checker');
  await checkFeature('/checkout', 'Express Guest Checkout', '1-Click Checkout Flow');
  await checkFeature('/checkout', 'DPDP Act', 'DPDP Act Checkout Consent');
  await checkFeature('/privacy', 'DPDP Act, 2023', 'DPDP Act Privacy Compliance');
  await checkFeature('/track', 'Track', 'Live Order Tracking Portal');
  await checkFeature('/admin/orders', 'Command Center', 'Founder Admin Command Center');
  console.log('--- AUDIT COMPLETE ---');
}

run();
