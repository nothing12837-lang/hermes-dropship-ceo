async function verify() {
  try {
    const res = await fetch('https://www.rareember.shop', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    console.log('--- LIVE SITE VERIFICATION ---');
    console.log('Drops Live badge:', html.includes('Drops Live'));
    console.log('Narrow hero title:', html.includes('Rare Ember</span> — Heavyweight Streetwear &amp; Custom Studio'));
    console.log('Old gavel photo (photo-1589829085413):', html.includes('photo-1589829085413'));
    
    // Check PDP for Bone White Hoodie
    const pdpRes = await fetch('https://www.rareember.shop/product/rareember-heavyweight-zip-up-hoodie-bone', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const pdpHtml = await pdpRes.text();
    console.log('Bone White Hoodie uses white hoodie photo (photo-1556906781):', pdpHtml.includes('photo-1556906781'));
    
    // Check PDP for Athletic Tank Top
    const tankRes = await fetch('https://www.rareember.shop/product/rareember-sleeveless-athletic-tank-top', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const tankHtml = await tankRes.text();
    console.log('Tank Top uses athletic gym tank photo (photo-1583496661):', tankHtml.includes('photo-1583496661'));

    // Check PDP for Laptop Sleeve
    const sleeveRes = await fetch('https://www.rareember.shop/product/rareember-padded-creator-laptop-sleeve', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const sleeveHtml = await sleeveRes.text();
    console.log('Laptop sleeve uses laptop sleeve photo (photo-1584438784):', sleeveHtml.includes('photo-1584438784'));

    // Check PDP for Vinyl Stickers
    const stickerRes = await fetch('https://www.rareember.shop/product/rareember-waterproof-vinyl-sticker-pack', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const stickerHtml = await stickerRes.text();
    console.log('Sticker pack uses vinyl sticker decals photo (photo-1589384267):', stickerHtml.includes('photo-1589384267'));
    console.log('--- ALL VERIFICATIONS COMPLETE ---');
  } catch (err) {
    console.error('Error:', err);
  }
}

verify();
