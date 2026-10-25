import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for purchasing and browsing on Rare Ember.',
};

export default function TermsPage() {
  return (
      <main className="min-h-screen bg-[#FFF9F1] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-black/[0.06] shadow-xl text-neutral-900">
          <div className="inline-block px-3 py-1 rounded-full bg-[#FF4D24]/10 text-[#FF4D24] text-xs font-bold uppercase tracking-wider mb-4">
            Legal & Compliance
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-neutral-950 mb-4">
            Terms of Service
          </h1>
          <p className="text-xs text-neutral-400 mb-8">Last Updated: October 2026</p>

          <div className="space-y-8 text-sm leading-relaxed text-neutral-700">
            <section>
              <h2 className="text-lg font-bold text-neutral-950 mb-2">1. Overview & Agreement</h2>
              <p>
                Welcome to Rare Ember (https://www.rareember.shop). By accessing our website, placing an order, or utilizing our services, you agree to be bound by these Terms of Service, our Privacy Policy, and our 7-Day Easy Replacement Policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-950 mb-2">2. Products, Pricing & Multi-Currency</h2>
              <p>
                All product descriptions, specifications, and prices displayed on RareEmber are accurate to the best of our knowledge. In India, transactions are processed in Indian Rupees (INR ₹). For international shoppers, prices are billed in US Dollars (USD $). We reserve the right to adjust catalog pricing and promotional discounts at any time.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-950 mb-2">3. Payment & Security</h2>
              <p>
                Prepaid payments are securely handled via Razorpay (supporting UPI, Credit/Debit Cards, NetBanking, and Wallets) with 256-bit SSL encryption. We also offer Cash on Delivery (COD) across eligible PIN codes in India.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-950 mb-2">4. Shipping & Delivery</h2>
              <p>
                • <b>Pan-India Delivery:</b> 2 to 5 business days via trusted logistics partners (BlueDart, Delhivery, India Post).<br />
                • <b>International Delivery:</b> 7 to 14 business days with real-time package tracking.<br />
                Real-time tracking links are provided via email/SMS immediately upon carrier scan.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-950 mb-2">5. Returns, Replacements & Refunds</h2>
              <p>
                We offer a <b>7-Day Easy Replacement Policy</b>. If an item arrives damaged, defective, or incorrect, contact support@rareember.shop within 7 days of delivery with your Order ID for an immediate free replacement or resolution.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-950 mb-2">6. Contact Information</h2>
              <p>
                For any inquiries regarding these terms, reach our support team at:
                <br />
                <b>Email:</b> support@rareember.shop
                <br />
                <b>Website:</b> https://www.rareember.shop
              </p>
            </section>
          </div>
        </div>
      </main>
      );
}
