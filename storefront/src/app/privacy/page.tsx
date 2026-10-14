import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export const metadata = {
  title: 'Privacy Policy | RareEmber',
  description: 'Privacy Policy explaining data protection and customer privacy on RareEmber.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFF9F1] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-black/[0.06] shadow-xl text-neutral-900">
          <div className="inline-block px-3 py-1 rounded-full bg-[#FF4D24]/10 text-[#FF4D24] text-xs font-bold uppercase tracking-wider mb-4">
            Security & Privacy
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-neutral-950 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xs text-neutral-400 mb-8">Last Updated: October 2026</p>

          <div className="space-y-8 text-sm leading-relaxed text-neutral-700">
            <section>
              <h2 className="text-lg font-bold text-neutral-950 mb-2">1. Data We Collect</h2>
              <p>
                When you visit RareEmber or make a purchase, we collect necessary personal information to fulfill your orders, including your name, email address, shipping address, phone number, and transaction identifiers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-950 mb-2">2. How We Use Your Information</h2>
              <p>
                • To process, dispatch, and track your orders.<br />
                • To communicate live shipment tracking notifications via email/SMS.<br />
                • To prevent fraud, verify payments, and process refunds.<br />
                • To provide 24/7 AI-assisted customer support.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-950 mb-2">3. Payment Information & Security</h2>
              <p>
                We do not store your raw Credit/Debit card numbers or banking passwords on our servers. All financial transactions are securely processed through Razorpay using industry-standard 256-Bit SSL encryption complying with PCI-DSS standards.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-950 mb-2">4. Third-Party Sharing</h2>
              <p>
                We only share required customer details with verified logistics partners (such as BlueDart, Delhivery, India Post) and payment gateways solely for delivering your items and processing transactions. We never sell or rent your personal data to advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-950 mb-2">5. Your Rights & Data Deletion</h2>
              <p>
                You may request access to, correction of, or deletion of your personal data at any time by contacting us at <b>rareemberagency@gmail.com</b>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-950 mb-2">6. Contact Us</h2>
              <p>
                For privacy-related questions or data inquiries:
                <br />
                <b>Support Email:</b> rareemberagency@gmail.com
                <br />
                <b>Store:</b> RareEmber Store (https://rareember-store.vercel.app)
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
