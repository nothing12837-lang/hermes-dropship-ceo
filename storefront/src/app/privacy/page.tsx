import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy & DPDP Act Compliance',
  description: 'Official Privacy Policy complying with the Digital Personal Data Protection (DPDP) Act 2023 and Information Technology Act 2000.',
};

export default function PrivacyPage() {
  return (
      <main className="min-h-screen bg-[#FFF9F1] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-black/[0.06] shadow-xl text-neutral-900">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FF4D24]/10 text-[#FF4D24] text-xs font-bold uppercase tracking-wider">
              Legal & Data Privacy
            </span>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold tracking-wider">
              🇮🇳 Compliant with India DPDP Act 2023
            </span>
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-neutral-950 mb-3">
            Privacy Policy & Data Protection Notice
          </h1>
          <p className="text-xs text-neutral-500 mb-8 font-mono">
            Effective Date: October 15, 2026 • Governing Law: Digital Personal Data Protection Act, 2023 (DPDP Act) & IT Act, 2000
          </p>

          <div className="space-y-8 text-sm leading-relaxed text-neutral-700">
            {/* Introduction */}
            <section className="bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-5">
              <h2 className="text-base font-bold text-neutral-950 mb-2 flex items-center gap-2">
                <span>🛡️</span> Notice under DPDP Act, 2023
              </h2>
              <p className="text-xs text-neutral-800 leading-relaxed">
                Rare Ember (&ldquo;We&rdquo;, &ldquo;Our&rdquo;, &ldquo;Store&rdquo;) acts as a <b>Data Fiduciary</b> under the Digital Personal Data Protection Act, 2023. When you visit our website (<b>https://www.rareember.shop</b>) or purchase from our streetwear & lifestyle collection, you are the <b>Data Principal</b>. This policy explains what personal data we collect, our lawful purpose for processing it, and how you can exercise your statutory rights.
              </p>
            </section>

            {/* 1. Data Collected */}
            <section>
              <h2 className="text-base font-bold text-neutral-950 mb-2">1. Personal Data We Collect</h2>
              <p className="mb-2">We collect only minimal, purpose-specific personal data required for legitimate e-commerce operations:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600 text-xs">
                <li><b>Identity & Contact Data:</b> Full name, email address, mobile phone number.</li>
                <li><b>Delivery & Logistics Data:</b> Shipping address, city, state, postal PIN code.</li>
                <li><b>Transaction Details:</b> Order ID, items selected, chosen apparel size/style, transaction timestamp.</li>
                <li><b>Payment Identifiers:</b> Payment mode (Cash on Delivery / UPI / Card / NetBanking) and Razorpay transaction reference IDs. (Note: We <u>never</u> store raw card numbers, CVVs, or bank PINs).</li>
                <li><b>Technical & Device Telemetry:</b> IP address, browser type, and anonymous session identifiers used solely for rate limiting, DDoS defense, and fraud prevention.</li>
              </ul>
            </section>

            {/* 2. Lawful Grounds & Purpose */}
            <section>
              <h2 className="text-base font-bold text-neutral-950 mb-2">2. Lawful Grounds & Purpose of Processing</h2>
              <p className="mb-2">Under Section 4 and Section 7 of the DPDP Act 2023, your personal data is processed solely for:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600 text-xs">
                <li><b>Fulfillment of Contractual Obligations:</b> Manufacturing, tailoring, quality checking, and dispatching your streetwear orders.</li>
                <li><b>Doorstep Logistics & Tracking:</b> Sharing delivery coordinates with integrated courier partners (e.g. BlueDart, Delhivery) and generating live AWB tracking updates.</li>
                <li><b>Transaction Notifications:</b> Sending instant order confirmations, live dispatch updates, and delivery OTP verification via SMS/Email/WhatsApp.</li>
                <li><b>Statutory & Tax Compliance:</b> Generating GST invoices, handling returns/replacements within our 7-day guarantee window, and maintaining statutory accounting records as per Indian laws.</li>
              </ul>
            </section>

            {/* 3. Third-Party Sharing */}
            <section>
              <h2 className="text-base font-bold text-neutral-950 mb-2">3. Data Sharing & Third-Party Processors</h2>
              <p className="mb-2">
                We strictly <b>DO NOT SELL, RENT, OR TRADE</b> your personal data to any marketing brokers, data aggregators, or external advertisers.
              </p>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Your data is only shared with authorized <b>Data Processors</b> under strict non-disclosure and security safeguards:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-600 text-xs">
                <li><b>Logistics & Fulfillment:</b> Authorized Direct Domestic Facilities / BlueDart / Delhivery (solely for parcel delivery to your address).</li>
                <li><b>Payment Infrastructure:</b> Razorpay Software Pvt. Ltd. (PCI-DSS Level 1 certified gateway).</li>
                <li><b>Secure Database:</b> Supabase / PostgreSQL (Enterprise-grade AES-256 encryption at rest and in transit).</li>
              </ul>
            </section>

            {/* 4. Data Principal Rights */}
            <section className="bg-emerald-500/[0.05] border border-emerald-500/20 rounded-2xl p-5">
              <h2 className="text-base font-bold text-neutral-950 mb-2">4. Your Statutory Rights Under the DPDP Act, 2023</h2>
              <p className="text-xs text-neutral-700 mb-3">As a Data Principal, you have the following enforceable rights under Indian law:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-black/[0.05]">
                  <p className="font-bold text-neutral-900 mb-1">🔍 Right to Access Summary</p>
                  <p className="text-neutral-600">You may request a copy of the personal data we hold about you and the processing activities undertaken.</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-black/[0.05]">
                  <p className="font-bold text-neutral-900 mb-1">✏️ Right to Correction & Update</p>
                  <p className="text-neutral-600">You have the right to rectify misleading, outdated, or incomplete personal data at any time.</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-black/[0.05]">
                  <p className="font-bold text-neutral-900 mb-1">🗑️ Right to Erasure (&ldquo;Right to be Forgotten&rdquo;)</p>
                  <p className="text-neutral-600">You may request complete deletion of your personal data from our active databases once order delivery is fulfilled.</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-black/[0.05]">
                  <p className="font-bold text-neutral-900 mb-1">⚖️ Right to Grievance Redressal</p>
                  <p className="text-neutral-600">You have a statutory right to fast-track redressal of any grievance regarding your personal data within 48 business hours.</p>
                </div>
              </div>
            </section>

            {/* 5. Data Retention & Erasure */}
            <section>
              <h2 className="text-base font-bold text-neutral-950 mb-2">5. Data Retention & Secure Erasure</h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                We retain personal data only for as long as necessary to fulfill your order, honor our 7-day doorstep replacement guarantee, and satisfy mandatory legal/tax requirements. After the statutory retention period, customer records are securely purged or irreversibly anonymized.
              </p>
            </section>

            {/* 6. Children's Data */}
            <section>
              <h2 className="text-base font-bold text-neutral-950 mb-2">6. Protection of Children&apos;s Personal Data</h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Under Section 9 of the DPDP Act 2023, Rare Ember does not knowingly collect, process, or track personal data of individuals under the age of 18 without verifiable parental or guardian consent.
              </p>
            </section>

            {/* 7. Grievance Redressal Officer */}
            <section className="bg-neutral-950 text-white rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span>⚖️</span> Statutory Grievance Redressal Officer
              </h2>
              <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                In compliance with the Digital Personal Data Protection Act, 2023 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the designated Grievance Officer details are published below:
              </p>

              <div className="text-xs space-y-1.5 text-neutral-300 font-mono">
                <p><span className="text-neutral-500">Designation:</span> Data Protection & Grievance Officer</p>
                <p><span className="text-neutral-500">Entity:</span> Rare Ember</p>
                <p><span className="text-neutral-500">Official Portal:</span> https://www.rareember.shop</p>
                <p>
                  <span className="text-neutral-500">Grievance Email:</span>{' '}
                  <a href="mailto:support@rareember.shop" className="text-[#FF4D24] underline">
                    support@rareember.shop
                  </a>
                </p>
                <p><span className="text-neutral-500">Acknowledgement Timeline:</span> Within 24–48 Business Hours</p>
                <p><span className="text-neutral-500">Resolution SLA:</span> Within 15 Calendar Days</p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-neutral-400">
                <p>To request permanent data deletion or exercise your DPDP rights, email us with subject &ldquo;DPDP Data Request&rdquo;.</p>
                <Link href="/contact" className="text-white hover:text-[#FF4D24] underline">
                  Contact Support Page →
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
      );
}
