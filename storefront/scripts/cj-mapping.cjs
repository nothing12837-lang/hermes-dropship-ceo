/**
 * Pure CJ Dropshipping catalog mapping helpers.
 */

function parsePrice(sellPrice) {
  const raw = String(sellPrice ?? '')
    .split('--')[0]
    .replace(/[^0-9.]/g, '');
  const v = parseFloat(raw);
  return Number.isFinite(v) && v > 0 ? v : null;
}

function inferCategory(name) {
  const n = String(name || '').toLowerCase();
  if (/phone|led|usb|smart|pc|computer|electric|speaker|headphones|bluetooth/.test(n)) return 'electronics';
  if (/kitchen|home|garden|sofa|bed|chair|table|decor/.test(n)) return 'home-garden';
  if (/shirt|pants|shoes|sneakers|jacket|hoodie|cap|watch|ring|necklace|boot|dress|top|skirt|sweater|apparel|clothing/.test(n)) return 'fashion';
  if (/dog|cat|pet|puppy|leash|harness|feeder/.test(n)) return 'pets';
  
  return 'general';
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function buildCJId(sku, index) {
  const slug = String(sku || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
  return 'cj-' + (slug || 'item-' + index);
}

function mapCJToRow(p, index, markup = 2) {
  const basePrice = parsePrice(p.sellPrice);
  
  if (!basePrice || basePrice < 2) return null;
  if (p.sellStatus === 0 || p.inventory < 10) return null;

  const m = Number(markup) > 0 ? Number(markup) : 2;
  const price = Math.round(basePrice * m * 100) / 100;
  const compareAt = Math.round(price * 1.5 * 100) / 100;
  const name = String(p.productNameEn || 'CJ Product').slice(0, 120);
  const title = name.split(',')[0].slice(0, 60).trim() || ('CJ Find ' + p.productSku);
  const category = inferCategory(name);

  const is_trending = (index % 5 === 0);
  const is_new = (index % 3 === 0);

  const detailsArray = [
    'Fast Express US Shipping (3-7 days)',
    '30-Day Hassle-Free Returns',
    '100% Quality Guarantee',
    'Sourced from Top-Tier Suppliers'
  ];

  return {
    id: buildCJId(p.productSku, index),
    title,
    description: name.slice(0, 200) + ' - High quality dropshipping product.',
    price,
    compare_at_price: compareAt,
    image_url: p.productImage || '',
    cj_sku: String(p.productSku || ''),
    category,
    slug: slugify(title) || buildCJId(p.productSku, index),
    is_trending,
    is_new,
    details: JSON.stringify(detailsArray)
  };
}

module.exports = { parsePrice, inferCategory, slugify, buildCJId, mapCJToRow };
