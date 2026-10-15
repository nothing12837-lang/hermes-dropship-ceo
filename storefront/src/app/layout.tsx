import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/store/cart";
import { WishlistProvider } from "@/lib/store/wishlist";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import CartDrawer from "@/components/ui/CartDrawer";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { GeoProvider } from "@/context/GeoContext";
import Chatbot from "@/components/ui/Chatbot";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rareember.shop';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rare Ember — Curated Streetwear, Drinkware & Creator Lifestyle",
    template: "%s | Rare Ember",
  },
  description: "Discover premium heavyweight streetwear, artisan drinkware, and creator desk essentials at Rare Ember. Pan-India 2–4 days express delivery with UPI, Cards & Cash on Delivery (COD).",
  keywords: [
    "Rare Ember",
    "Rare Ember store",
    "streetwear India",
    "oversized t-shirts online India",
    "heavyweight hoodie 380 gsm",
    "creator desk accessories",
    "matte ceramic coffee mug",
    "aesthetic lifestyle brand India",
    "cash on delivery streetwear"
  ],
  authors: [{ name: "Rare Ember" }],
  creator: "Rare Ember",
  publisher: "Rare Ember",
  alternates: {
    canonical: siteUrl,
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
    locale: 'en_US',
    url: siteUrl,
    siteName: 'RareEmber',
    title: 'RareEmber™ — Curated Tech, Fashion & Modern Home Living',
    description: 'Trending electronics, curated fashion, and lifestyle essentials delivered fast. 100% Secure Checkout with Razorpay & Cash on Delivery.',
    images: [
      {
        url: '/flame-icon.png',
        width: 800,
        height: 800,
        alt: 'RareEmber Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RareEmber™ — Curated Living & Express Delivery',
    description: 'Trending electronics, curated fashion, and lifestyle essentials delivered fast.',
    images: ['/flame-icon.png'],
    creator: '@rareember',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/flame-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://qdkkxpfhwrwyoardlceo.supabase.co" />
        <link rel="dns-prefetch" href="https://qdkkxpfhwrwyoardlceo.supabase.co" />
      </head>
      <body className="font-sans antialiased bg-[#FFF9F1] text-neutral-900">
        <ErrorBoundary>
          <GeoProvider>
            <CartProvider>
              <WishlistProvider>
                <Navbar />
                {children}
                <Footer />
                <CartDrawer />
                <Chatbot />
              </WishlistProvider>
            </CartProvider>
          </GeoProvider>
        </ErrorBoundary>

        {/* Global Structured Data (JSON-LD) for Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Rare Ember',
              url: siteUrl,
              logo: `${siteUrl}/flame-icon.png`,
              sameAs: [
                'https://instagram.com/rareember',
                'https://twitter.com/rareember'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'care@rareember.shop',
                contactType: 'customer service',
                availableLanguage: ['English', 'Hindi'],
                areaServed: ['IN', 'US', 'GB', 'CA', 'AU', 'AE']
              },
            }),
          }}
        />
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
