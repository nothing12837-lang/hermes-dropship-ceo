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
import dynamic from "next/dynamic";

const Chatbot = dynamic(() => import("@/components/ui/Chatbot"));

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://rareember-store.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RareEmber™ — Curated Tech, Fashion, Home & Lifestyle Essentials",
    template: "%s | RareEmber",
  },
  description: "Discover viral electronics, designer apparel, premium home aesthetics, and trending lifestyle essentials at RareEmber. Pan-India & Worldwide Express Delivery with Razorpay UPI & Cash on Delivery (COD).",
  keywords: [
    "RareEmber",
    "online shopping India",
    "trending electronics",
    "noise canceling headphones",
    "curated fashion apparel",
    "home and living essentials",
    "smart gadgets online India",
    "cash on delivery store",
    "buy online UPI netbanking",
    "viral TikTok products",
    "fast shipping India"
  ],
  authors: [{ name: "RareEmber" }],
  creator: "RareEmber",
  publisher: "RareEmber",
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
              name: 'RareEmber',
              url: siteUrl,
              logo: `${siteUrl}/flame-icon.png`,
              sameAs: [
                'https://instagram.com/rareember',
                'https://twitter.com/rareember'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'rareemberagency@gmail.com',
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
              name: 'RareEmber',
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
