const https = require('https');

function checkURL(url, name) {
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`\n=== Checking ${name} (${url}) ===`);
      console.log('Status code:', res.statusCode);
      const titleMatch = data.match(/<title>([^<]+)<\/title>/);
      console.log('Title:', titleMatch ? titleMatch[1] : 'None');

      // Check S3 mockups
      const rawS3 = (data.match(/qikink-stores\.s3\.ap-south-1\.amazonaws\.com/gi) || []).length;
      console.log('Qikink S3 occurrences (raw/encoded):', rawS3);

      const ogImage = data.match(/property="og:image"[^>]+content="([^"]+)"/);
      console.log('OG Image:', ogImage ? ogImage[1] : 'None');

      // Check for Meesho mentions
      const meeshoMatches = (data.match(/meesho/gi) || []).length;
      console.log('Meesho mentions:', meeshoMatches);
    });
  }).on('error', console.error);
}

checkURL('https://www.rareember.shop', 'Homepage');
checkURL('https://www.rareember.shop/shop', 'Shop Page');
checkURL('https://www.rareember.shop/product/qikink-oversized-t-shirt-uc22', 'PDP: Oversized T-Shirt UC22');
checkURL('https://www.rareember.shop/product/qikink-oversized-hoodie-uh32', 'PDP: Oversized Hoodie UH32');
checkURL('https://www.rareember.shop/product/qikink-joggers-uj29', 'PDP: Joggers UJ29');
