const fs = require('fs');
const path = require('path');
const https = require('https');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'storefront', 'src', 'lib', 'data', 'qikink-products.json'), 'utf8'));
const variantsMap = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'storefront', 'src', 'lib', 'data', 'qikink-variants-map.json'), 'utf8'));

console.log('=== VERIFYING ALL 31 PRODUCTS ON LIVE STORE ===\n');

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ statusCode: res.statusCode, headers: res.headers });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function run() {
  console.log(`Checking live PDPs for all ${products.length} products on https://www.rareember.shop...`);
  let passedPDPs = 0;
  let failedPDPs = [];

  for (const p of products) {
    const slug = p.slug || p.id;
    const url = `https://www.rareember.shop/product/${slug}`;
    const res = await checkUrl(url);
    if (res.statusCode === 200) {
      passedPDPs++;
    } else {
      failedPDPs.push({ slug, status: res.statusCode, error: res.error });
    }
  }

  console.log(`PDP Health: ${passedPDPs}/${products.length} live PDPs return 200 OK.`);
  if (failedPDPs.length > 0) {
    console.log('Failed PDPs:', failedPDPs);
  } else {
    console.log('✅ ZERO PDP ERRORS: Every product page loads cleanly on production!');
  }

  console.log('\nChecking image URLs for all 31 products on Qikink AWS S3...');
  let passedImages = 0;
  let failedImages = [];

  for (const p of products) {
    if (!p.image_url) {
      failedImages.push({ title: p.title, reason: 'Missing image_url' });
      continue;
    }
    const res = await checkUrl(p.image_url);
    if (res.statusCode === 200) {
      passedImages++;
    } else {
      failedImages.push({ title: p.title, url: p.image_url, status: res.statusCode });
    }
  }

  console.log(`Image Health: ${passedImages}/${products.length} product images return 200 OK.`);
  if (failedImages.length > 0) {
    console.log('Failed Images:', failedImages);
  } else {
    console.log('✅ ZERO BROKEN IMAGES: All S3 mockup images load with 200 OK!');
  }
}

run();
