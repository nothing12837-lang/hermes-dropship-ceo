import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/store/cart";
import { WishlistProvider } from "@/lib/store/wishlist";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { GeoProvider } from "@/context/GeoContext";
import ClientOverlays from "@/components/ui/ClientOverlays";
import { TelemetryProvider } from "@/components/telemetry/TelemetryProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rareember.shop';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF8F5",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.rareember.shop'),
  title: {
    default: "Rare Ember — 240 GSM Combed Cotton Oversized Streetwear & Acid Wash Hoodies India",
    template: "%s | Rare Ember",
  },
  description: "Independent Indian streetwear engineered from 240 GSM combed cotton and architectural cuts. Directly sourced from verified makers with free express air delivery.",
  keywords: [
    "Rare Ember",
    "Rare Ember store",
    "streetwear India",
    "oversized t-shirts online India",
    "240 gsm oversized tshirt",
    "acid wash hoodie india",
    "380 gsm french terry hoodie",
    "drop shoulder streetwear tee",
    "aesthetic lifestyle brand India",
    "cash on delivery streetwear"
  ],
  authors: [{ name: "Rare Ember" }],
  creator: "Rare Ember",
  publisher: "Rare Ember",
  alternates: {
    canonical: 'https://www.rareember.shop',
  },
  verification: {
    google: ['iLDXfXOQJgdWVHjp6RKhahF3-lbLS_frVYkqxeXsA44', 'Iv2WSIz7SyvJ2zs7ZqGrhyQC8-d5CSY8qjTBlgiQTOg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Rare Ember',
    title: 'Rare Ember — 240 GSM Combed Cotton Oversized Streetwear & Acid Wash Hoodies India',
    description: '240 GSM combed cotton oversized streetwear, acid wash hoodies, and original graphic drops with free Pan-India delivery.',
    images: [
      {
        url: '/rareember-logo.png',
        width: 1024,
        height: 1024,
        alt: 'Rare Ember Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rare Ember — Heavyweight Streetwear & Graphic Drops',
    description: '240 GSM combed cotton oversized streetwear, acid wash hoodies, and original graphic drops with free Pan-India delivery.',
    images: ['/rareember-logo.png'],
    creator: '@rareember',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="144x144" href="/favicon-144x144.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        <link rel="preconnect" href="https://qdkkxpfhwrwyoardlceo.supabase.co" />
        <link rel="dns-prefetch" href="https://qdkkxpfhwrwyoardlceo.supabase.co" />
        <link rel="preconnect" href="https://qikink-stores.s3.ap-south-1.amazonaws.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://qikink-stores.s3.ap-south-1.amazonaws.com" />
      </head>
      <body className="font-sans antialiased bg-[#FFF9F1] text-neutral-900">
        {/* Agent & Accessibility Skip-to-Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#E04F33] focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>

        <TelemetryProvider />

        <ErrorBoundary>
          <GeoProvider>
            <CartProvider>
              <WishlistProvider>
                <Navbar />
                {children}
                <Footer />
                <ClientOverlays />
              </WishlistProvider>
            </CartProvider>
          </GeoProvider>
        </ErrorBoundary>

        {/* Global Structured Data (JSON-LD) for Search Engines & AI Recommendation Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['Organization', 'OnlineStore'],
              name: 'Rare Ember',
              alternateName: ['RareEmber', 'Rare Ember Shop'],
              url: siteUrl,
              logo: 'https://www.rareember.shop/icon-512.png',
              image: `${siteUrl}/icon-512.png`,
              description:
                'Rare Ember is an Indian direct-to-consumer streetwear brand specializing in 240 GSM bio-washed oversized graphic tees, 380 GSM acid wash hoodies, and luxury streetwear drops with express Pan-India delivery and Cash on Delivery.',
              priceRange: '₹699 - ₹1,899',
              currenciesAccepted: 'INR',
              paymentAccepted: 'Cash on Delivery, UPI, Credit Card, Debit Card, NetBanking',
              founder: {
                '@type': 'Person',
                name: 'Ajay Kumar',
              },
              knowsAbout: [
                'Indian Streetwear',
                'Heavyweight Oversized T-Shirts',
                '240 GSM Combed Cotton',
                'Acid Wash Hoodies',
                '380 GSM French Terry Fleece',
                'Drop Shoulder Streetwear Silhouettes',
              ],
              sameAs: [
                'https://instagram.com/rareember',
                'https://twitter.com/rareember',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'support@rareember.shop',
                contactType: 'customer service',
                availableLanguage: ['English', 'Hindi'],
                areaServed: ['IN'],
              },
              hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'IN',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 7,
                returnMethod: 'https://schema.org/ReturnByMail',
                returnFees: 'https://schema.org/FreeReturn',
                returnShippingFeesAmount: {
                  '@type': 'MonetaryAmount',
                  value: '0',
                  currency: 'INR',
                },
                merchantReturnLink: `${siteUrl}/returns`,
              },
              speakable: {
                '@type': 'SpeakableSpecification',
                cssSelector: ['h1', '.speakable-lead', '.faq-answer'],
              },
            }),
          }}
        />

        {/* BreadcrumbList Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: siteUrl,
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Streetwear Catalog',
                  item: `${siteUrl}/shop`,
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: "240 GSM Oversized Tees",
                  item: `${siteUrl}/shop?cat=tees`,
                },
              ],
            }),
          }}
        />

        {/* FAQPage Schema for Voice Search & GEO Citations */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is a 240 GSM oversized t-shirt?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'A 240 GSM oversized t-shirt is a luxury streetwear garment made from dense, super-combed bio-washed cotton (240 GSM Combed Cotton) that delivers an architectural drop-shoulder drape, durable non-sagging ribbed collar, and substantial breathable structure that maintains form all day in Indian weather.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What makes Rare Ember acid wash hoodies unique?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Our acid wash hoodies are engineered with 380 GSM French terry cotton fleece and an artisanal mineral enzyme wash that creates one-of-a-kind vintage marble textures with zero transparency.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Does Rare Ember offer Cash on Delivery (COD) in India?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, Cash on Delivery is available across 19,000+ PIN codes in India with instant SMS OTP verification.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How fast is express delivery across India?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Orders are dispatched directly via BlueDart and Delhivery Air express hubs, reaching metro destinations within 2 to 4 business days.',
                  },
                },
                {
                  '@type': 'Question',
                  name: "What is Rare Ember's return and exchange policy?",
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'We offer a hassle-free 7-day doorstep replacement and return window for any sizing, transit, or defect issues through our automated returns desk.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How should I wash and care for heavyweight streetwear garments?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Machine wash cold inside-out on a gentle cycle with mild detergent. Do not bleach or iron directly on high-density DTF prints. Tumble dry low or line dry in the shade.',
                  },
                },
              ],
            }),
          }}
        />

        {/* WebSite & SearchAction Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Rare Ember',
              url: siteUrl,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${siteUrl}/shop?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
