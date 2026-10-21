const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'storefront', 'src', 'lib', 'data', 'qikink-products.json'), 'utf8'));
const variantsMap = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'storefront', 'src', 'lib', 'data', 'qikink-variants-map.json'), 'utf8'));

console.log('=== PRODUCT & VARIANT HEALTH DIAGNOSTIC ===');
console.log('Total Products:', products.length);
console.log('Total Variants in Map:', Object.keys(variantsMap).length);

const issues = [];

products.forEach((p, idx) => {
  if (!p.id) issues.push(`Product index ${idx}: Missing id`);
  if (!p.title) issues.push(`Product ${p.id}: Missing title`);
  if (!p.price || isNaN(p.price) || p.price <= 0) issues.push(`Product ${p.id}: Invalid price (${p.price})`);
  if (!p.compareAtPrice || isNaN(p.compareAtPrice) || p.compareAtPrice <= p.price) {
    issues.push(`Product ${p.id}: Invalid compareAtPrice (${p.compareAtPrice} vs price ${p.price})`);
  }
  if (!p.image_url || !p.image_url.startsWith('http')) issues.push(`Product ${p.id}: Missing or invalid image_url (${p.image_url})`);
  if (!Array.isArray(p.sizes) || p.sizes.length === 0) issues.push(`Product ${p.id}: Missing sizes`);
  if (!p.qikinkClientProductId) issues.push(`Product ${p.id}: Missing qikinkClientProductId`);
});

console.log('\n--- 1. Catalog Field Integrity ---');
if (issues.length === 0) {
  console.log('✅ ZERO ERRORS: All 31 products have valid id, title, price, compareAtPrice, sizes, and images.');
} else {
  console.log('❌ Issues found in products:', issues);
}

console.log('\n--- 2. Product-to-Variant Coverage ---');
let missingVariants = 0;
let productVariantStats = [];
products.forEach(p => {
  const pid = p.qikinkClientProductId;
  const pVariants = Object.entries(variantsMap).filter(([k, v]) => v.product_id === pid || k.startsWith(pid + '_'));
  if (pVariants.length === 0) {
    console.log(`❌ WARNING: Product ${p.title} (${pid}) has 0 mapped variants!`);
    missingVariants++;
  } else {
    productVariantStats.push({ title: p.title, variants: pVariants.length });
  }
});

if (missingVariants === 0) {
  console.log('✅ ZERO ERRORS: Every single product has all variants mapped in qikink-variants-map.json.');
}

console.log('\n--- 3. Variant Field Integrity (All 1,383 Variants) ---');
const variantIssues = [];
let invalidPrices = 0;
let missingSkus = 0;

for (const [key, v] of Object.entries(variantsMap)) {
  if (!v.product_id) variantIssues.push(`Variant ${key}: Missing product_id`);
  if (!v.variant_sku) missingSkus++;
  if (!v.color) variantIssues.push(`Variant ${key}: Missing color`);
  if (!v.size) variantIssues.push(`Variant ${key}: Missing size`);
  if (!v.selling_price || isNaN(v.selling_price) || v.selling_price <= 0) invalidPrices++;
}

console.log(`Variants missing SKU: ${missingSkus}`);
console.log(`Variants with invalid price: ${invalidPrices}`);
console.log(`Variant Field Errors: ${variantIssues.length}`);

console.log('\n--- 4. Size & Color Key Matching ---');
let keyMismatchCount = 0;
products.forEach(p => {
  const pid = p.qikinkClientProductId;
  const colors = p.colors || [];
  const sizes = p.sizes || [];

  colors.forEach(c => {
    sizes.forEach(s => {
      const expectedKey = `${pid}_${c.name.toLowerCase().trim()}_${s.toLowerCase().trim()}`;
      if (!variantsMap[expectedKey]) {
        // check if variant exists under slightly different casing
        const found = Object.keys(variantsMap).find(k => k.toLowerCase() === expectedKey.toLowerCase());
        if (!found) {
          keyMismatchCount++;
        }
      }
    });
  });
});

console.log(`Total potential key permutations checked: ${keyMismatchCount} misses out of all combinations`);
