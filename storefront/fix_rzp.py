import re

with open('src/app/api/checkout/route.ts', 'r', encoding='utf-8') as f:
    text = f.read()

old_rzp = '''const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});'''

new_rzp = '''// Instantiate razorpay lazily to avoid build errors if env is missing
let razorpay: any = null;
if (process.env.RAZORPAY_KEY_ID) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
  });
}'''

text = text.replace(old_rzp, new_rzp)

old_post = '''  try {
    const { items, email } = await request.json();'''

new_post = '''  try {
    const { items, email } = await request.json();
    
    if (!razorpay) {
      return NextResponse.json({ error: 'Razorpay keys missing in .env.local' }, { status: 500 });
    }'''

text = text.replace(old_post, new_post)

with open('src/app/api/checkout/route.ts', 'w', encoding='utf-8') as f:
    f.write(text)
