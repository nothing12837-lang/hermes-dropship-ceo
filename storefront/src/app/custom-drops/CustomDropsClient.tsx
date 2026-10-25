// storefront/src/app/custom-drops/CustomDropsClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/store/cart';

type ProductType = 'tee' | 'hoodie' | 'mat';

interface PricingTier {
  min: number;
  max: number;
  teePrice: number;
  hoodiePrice: number;
  matPrice: number;
}

const PRICING_TIERS: PricingTier[] = [
  { min: 25, max: 50, teePrice: 399, hoodiePrice: 699, matPrice: 449 },
  { min: 51, max: 100, teePrice: 349, hoodiePrice: 649, matPrice: 399 },
  { min: 101, max: 250, teePrice: 299, hoodiePrice: 599, matPrice: 349 },
  { min: 251, max: 1000, teePrice: 269, hoodiePrice: 549, matPrice: 299 },
];

export interface BlankGarment {
  id: string;
  name: string;
  badge: string;
  gsm: string;
  price: number;
  frontImage: string;
  backImage?: string;
  isApparel: boolean;
  isDeskMat: boolean;
  isMug: boolean;
  skuPrefix: string;
  sizes: string[];
  colors?: string[];
}

export type QikinkPlacement = 'Front' | 'Back' | 'Left Pocket' | 'Right Pocket' | 'Left Sleeve' | 'Right Sleeve';

export const QIKINK_PLACEMENT_OPTIONS: {
  id: QikinkPlacement;
  label: string;
  view: 'front' | 'back';
  top: string;
  left: string;
  width: string;
  height: string;
  safeLabel: string;
}[] = [
  { id: 'Front', label: 'Front', view: 'front', top: '22%', left: '26%', width: '48%', height: '52%', safeLabel: 'CENTER FRONT • 10" × 12"' },
  { id: 'Back', label: 'Back', view: 'back', top: '20%', left: '22%', width: '56%', height: '56%', safeLabel: 'OVERSIZED BACK • 12" × 14"' },
  { id: 'Left Pocket', label: 'Left Pocket', view: 'front', top: '24%', left: '27%', width: '22%', height: '22%', safeLabel: 'LEFT POCKET • 3.5" × 3.5"' },
  { id: 'Right Pocket', label: 'Right Pocket', view: 'front', top: '24%', left: '51%', width: '22%', height: '22%', safeLabel: 'RIGHT POCKET • 3.5" × 3.5"' },
  { id: 'Left Sleeve', label: 'Left Sleeve', view: 'front', top: '26%', left: '7%', width: '22%', height: '30%', safeLabel: 'LEFT SLEEVE • 3" × 5"' },
  { id: 'Right Sleeve', label: 'Right Sleeve', view: 'front', top: '26%', left: '71%', width: '22%', height: '30%', safeLabel: 'RIGHT SLEEVE • 3" × 5"' },
];

export const QIKINK_GARMENT_COLORS = [
  { name: 'White', hex: '#FFFFFF', isLight: true },
  { name: 'Black', hex: '#111111', isLight: false },
  { name: 'Navy Blue', hex: '#1E293B', isLight: false },
  { name: 'Grey Melange', hex: '#9CA3AF', isLight: true },
  { name: 'Red', hex: '#DC2626', isLight: false },
  { name: 'Royal Blue', hex: '#2563EB', isLight: false },
  { name: 'Bottle Green', hex: '#14532D', isLight: false },
];

export const SEVEN_CORE_BLANKS: BlankGarment[] = [
  {
    id: 'blank-jersey',
    name: 'Unisex Oversized Jersey | UJ35',
    badge: 'CREATOR JERSEY',
    gsm: '180 GSM Quick-Dry Mesh Aeroknit • All-Over Sublimation / DTF Print',
    price: 679,
    frontImage: '/products/user-oversized-jersey-64950694.jpg',
    backImage: 'https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/32475347/images/Front_1_c_1.jpg',
    isApparel: true,
    isDeskMat: false,
    isMug: false,
    skuPrefix: 'UJ35',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    colors: ['White', 'Black', 'Navy Blue', 'Grey Melange', 'Red', 'Royal Blue'],
  },
  {
    id: 'blank-hoodie',
    name: '380 GSM Heavyweight Winter Hoodie',
    badge: 'WINTER BESTSELLER',
    gsm: '380 GSM Combed French Terry Cotton Fleece • Double-Lined Hood',
    price: 1099,
    frontImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/5/9bd43925-3bff-4f53-9d92-80c14714fd19.jpg',
    backImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/118/7b58b1da-f241-4994-a5a2-f1a4ec2b5c94.jpg',
    isApparel: true,
    isDeskMat: false,
    isMug: false,
    skuPrefix: 'UHd',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  },
  {
    id: 'blank-crewneck',
    name: '320 GSM Winter Crewneck Sweatshirt',
    badge: 'CAMPUS FAVORITE',
    gsm: '320 GSM Super Combed Terry Fleece • Derby Ribbed Collar',
    price: 899,
    frontImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/4/23175e0b-febe-4d12-83e2-f9a76506d24f.jpg',
    backImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/4/23175e0b-febe-4d12-83e2-f9a76506d24f.jpg',
    isApparel: true,
    isDeskMat: false,
    isMug: false,
    skuPrefix: 'USs',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  },
  {
    id: 'blank-varsity',
    name: '350 GSM Contrast Varsity Jacket',
    badge: 'COLLEGE FEST HEADLINER',
    gsm: '350 GSM Heavyweight Fleece Varsity • Snap Buttons',
    price: 1399,
    frontImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/95/b3298941-1294-4945-ac9c-c5aaafd3403d.jpg',
    backImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/95/b3298941-1294-4945-ac9c-c5aaafd3403d.jpg',
    isApparel: true,
    isDeskMat: false,
    isMug: false,
    skuPrefix: 'UVJ',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
  },
  {
    id: 'blank-oversized-tee',
    name: '240 GSM Drop-Shoulder Oversized Tee',
    badge: 'SIGNATURE DROP',
    gsm: '240 GSM Bio-Washed Combed Cotton • Drop-Shoulder Fit',
    price: 649,
    frontImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/28/30c13fe2-0ca2-4f63-b857-7970c0c0a593.jpg',
    backImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/28/30c13fe2-0ca2-4f63-b857-7970c0c0a593.jpg',
    isApparel: true,
    isDeskMat: false,
    isMug: false,
    skuPrefix: 'UOst',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  },
  {
    id: 'blank-acid-tee',
    name: '240 GSM Vintage Acid-Wash Heavy Tee',
    badge: 'VINTAGE CHARCOAL',
    gsm: '240 GSM Custom Enzyme Acid-Wash Cotton • Vintage Fade',
    price: 699,
    frontImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/variations/b8d5807e-f669-4087-9dd4-a136e0af3e87.webp',
    backImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/variations/b8d5807e-f669-4087-9dd4-a136e0af3e87.webp',
    isApparel: true,
    isDeskMat: false,
    isMug: false,
    skuPrefix: 'ATe',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
  },
  {
    id: 'blank-deskmat',
    name: '900×400mm Extended Creator Desk Mat',
    badge: 'WORKSTATION GRADE',
    gsm: '3mm Micro-Weave Cloth • Stitched Anti-Fray Edges • Rubber Base',
    price: 699,
    frontImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg',
    isApparel: false,
    isDeskMat: true,
    isMug: false,
    skuPrefix: 'MPad-900x400',
    sizes: ['900×400mm'],
  },
  {
    id: 'blank-mug',
    name: '11 Oz High-Fired Ceramic Coffee Mug',
    badge: 'MICROWAVE SAFE',
    gsm: '330ml Gloss Ceramic Stoneware • High-Gloss Sublimation Glaze',
    price: 399,
    frontImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/26/b10e9b51-65a6-43f7-9e93-0e184c5853e9.jpg',
    isApparel: false,
    isDeskMat: false,
    isMug: true,
    skuPrefix: 'Mug-11oz',
    sizes: ['11 Oz (330ml)'],
  },
];

export function CustomDropsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { add } = useCart();

  // B2B Bulk State
  const [productType, setProductType] = useState<ProductType>('tee');
  const [quantity, setQuantity] = useState<number>(35);
  const [orgName, setOrgName] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAiAgentOpen, setIsAiAgentOpen] = useState<boolean>(false);

  // Dedicated Interactive Custom Lab State
  const baseParam = searchParams?.get('base') || '';
  const initialBlank = (() => {
    const b = baseParam.toLowerCase();
    if (b.includes('jersey') || b.includes('uj35') || b.includes('64950694')) return 'blank-jersey';
    if (b.includes('hoodie')) return 'blank-hoodie';
    if (b.includes('crewneck')) return 'blank-crewneck';
    if (b.includes('varsity')) return 'blank-varsity';
    if (b.includes('acid')) return 'blank-acid-tee';
    if (b.includes('deskmat') || b.includes('mat')) return 'blank-deskmat';
    if (b.includes('mug')) return 'blank-mug';
    return 'blank-jersey';
  })();

  const [selectedBlankId, setSelectedBlankId] = useState<string>(initialBlank);
  const [customView, setCustomView] = useState<'front' | 'back'>('front');
  const [selectedPlacement, setSelectedPlacement] = useState<QikinkPlacement>('Front');
  const [selectedLabColor, setSelectedLabColor] = useState<string>('White');
  const [customMode, setCustomMode] = useState<'image' | 'text'>('image');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customImageName, setCustomImageName] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [customTextColor, setCustomTextColor] = useState<string>('#FFFFFF');
  const [customFont, setCustomFont] = useState<string>('font-sans font-black tracking-wider uppercase');
  const [selectedLabSize, setSelectedLabSize] = useState<string>('L');
  const [uploadingLabImage, setUploadingLabImage] = useState<boolean>(false);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const currentBlank = SEVEN_CORE_BLANKS.find((b) => b.id === selectedBlankId) || SEVEN_CORE_BLANKS[0];

  const handleSelectPlacement = (plc: QikinkPlacement) => {
    setSelectedPlacement(plc);
    const cfg = QIKINK_PLACEMENT_OPTIONS.find((p) => p.id === plc) || QIKINK_PLACEMENT_OPTIONS[0];
    setCustomView(cfg.view);
  };

  useEffect(() => {
    if (currentBlank.isDeskMat) {
      setSelectedLabSize('900×400mm');
      setSelectedPlacement('Front');
    } else if (currentBlank.isMug) {
      setSelectedLabSize('11 Oz (330ml)');
      setSelectedPlacement('Front');
    } else {
      setSelectedLabSize('L');
    }
  }, [currentBlank.id]);

  const handleLabUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Please upload an image smaller than 15MB.');
      setTimeout(() => setUploadError(null), 5000);
      return;
    }
    setCustomImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setUploadingLabImage(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data?.ok && data?.url) {
        setCustomImage(data.url);
      }
    } catch {
      // preview retained
    } finally {
      setUploadingLabImage(false);
    }
  };

  const handleOrderSingleLabPiece = () => {
    add(currentBlank.id, 1, {
      title: `Custom ${currentBlank.name}`,
      price: Number((currentBlank.price / 85).toFixed(2)),
      price_inr: currentBlank.price,
      emoji: '',
      imageUrl: customView === 'back' && currentBlank.backImage ? currentBlank.backImage : currentBlank.frontImage,
      gradient: 'linear-gradient(135deg, rgba(255,77,36,0.1), rgba(0,0,0,0.05))',
      size: selectedLabSize,
      color: selectedLabColor,
      customText: customMode === 'text' && customText.trim() ? customText.trim() : undefined,
      customPlacement: selectedPlacement,
      customTextColor: customMode === 'text' ? customTextColor : undefined,
      customFont: customMode === 'text' ? customFont : undefined,
      customImage: customMode === 'image' && customImage ? customImage : undefined,
      customImageName: customImageName || (customText ? `Text: ${customText}` : 'Custom Tirupur Print'),
    });
    setOrderNotice(`✓ Added custom ${currentBlank.name} (${selectedPlacement} • ${selectedLabColor}) to cart! Redirecting to checkout...`);
    setTimeout(() => {
      router.push('/checkout');
    }, 400);
  };

  const handleTransferToBulk = () => {
    if (currentBlank.isDeskMat) setProductType('mat');
    else if (currentBlank.id.includes('hoodie') || currentBlank.id.includes('crewneck') || currentBlank.id.includes('varsity')) setProductType('hoodie');
    else setProductType('tee');

    const el = document.getElementById('estimator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Bulk Tier Calculations
  const tier = PRICING_TIERS.find((t) => quantity >= t.min && quantity <= t.max) || PRICING_TIERS[0];
  const unitPrice =
    productType === 'tee'
      ? tier.teePrice
      : productType === 'hoodie'
      ? tier.hoodiePrice
      : tier.matPrice;

  const retailPrice =
    productType === 'tee' ? 699 : productType === 'hoodie' ? 1499 : 899;

  const totalEstimate = unitPrice * quantity;
  const totalRetail = retailPrice * quantity;
  const totalSavings = totalRetail - totalEstimate;

  const getProductName = () => {
    if (productType === 'tee') return '240 GSM Heavyweight Oversized Tee';
    if (productType === 'hoodie') return '380 GSM Heavyweight Fleece Hoodie';
    return '900x400mm Extended Gaming Desk Mat';
  };

  const generateWhatsAppUrl = () => {
    const text = encodeURIComponent(
      `Hi RareEmber Team! I want a custom bulk quote:\n\n` +
      `• Organization / College: ${orgName || 'College Club / Startup'}\n` +
      `• Contact Person: ${contactName || 'Lead Organizer'}\n` +
      `• Product: ${getProductName()}\n` +
      `• Quantity: ${quantity} units\n` +
      `• Target Event Date: ${eventDate || 'Next 2-3 weeks'}\n` +
      `• Estimated Budget: ₹${totalEstimate.toLocaleString('en-IN')}\n\n` +
      `Please share free digital mockups & dispatch timeline!`
    );
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
    return waNumber ? `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${text}` : `https://wa.me/?text=${text}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await fetch('/api/custom-drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName,
          contactName,
          phone,
          quantity,
          productType: getProductName(),
          eventDate,
          estimatedBudget: totalEstimate,
        }),
      });
    } catch (err) {
      console.warn('Custom lead notification network error (falling back to UI confirmation):', err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const activeCanvasImage =
    customView === 'back' && currentBlank.backImage ? currentBlank.backImage : currentBlank.frontImage;

  return (
    <main className="page-top min-h-screen text-[#161311] pb-24 bg-[#FFFBF5]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#12100E] text-white py-14 px-4 md:px-8 border-b border-white/10 grain">
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-white/90 text-[11px] font-bold uppercase tracking-wider">
            Custom Silhouettes &amp; Studio Printing • Tirupur Hub
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Custom Merch &amp; Bulk Silhouettes for Startups, Creators &amp; Teams.
          </h1>

          <p className="max-w-2xl mx-auto text-sm md:text-base text-white/70 font-medium leading-relaxed">
            Direct production from 240 GSM combed cotton tees to 380 GSM heavyweight hoodies. 
            High-density Direct-to-Film prints, zero screen fees, and express air delivery across India.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-white/80">
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              Zero Setup or Screen Fees
            </span>
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              Digital Proof Included
            </span>
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              Pan-India Express Air Dispatch
            </span>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#custom-lab"
              className="w-full sm:w-auto px-6 py-3 rounded-lg btn-ember text-white font-bold text-xs uppercase tracking-wider no-underline text-center"
            >
              Open Custom Design Studio ↓
            </a>
            <Link
              href="/support"
              className="w-full sm:w-auto px-5 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all no-underline text-center border border-white/15"
            >
              Contact Production Desk
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION: RAREEMBER™ CUSTOM LAB (QIKINK-INSPIRED SIMPLE CREATOR) */}
      {/* ======================================================== */}
      <section id="custom-lab" className="max-w-6xl mx-auto px-4 md:px-8 py-12 relative z-20">
        <div className="p-6 md:p-10 rounded-3xl bg-[#0c0b0a] text-white border-2 border-[#FF4D24]/40 shadow-[0_20px_50px_rgba(0,0,0,0.25)] space-y-8">
          
          {/* Qikink Breadcrumb & Header */}
          <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                <span>Choose Collections</span>
                <span className="text-[#FF4D24]">›</span>
                <span>Select Products</span>
                <span className="text-[#FF4D24]">›</span>
                <span className="text-white font-black bg-white/10 px-2 py-0.5 rounded-md">Create Product</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2.5 flex-wrap">
                <span>{currentBlank.name}</span>
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#FF4D24]/20 border border-[#FF4D24]/50 text-[#FF9A3D]">
                  ₹{currentBlank.price}
                </span>
              </h2>
              <p className="text-xs md:text-sm text-neutral-400 mt-1">
                {currentBlank.gsm} • High-Definition OEKO-TEX® DTF &amp; Sublimation
              </p>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-neutral-300">
                Direct Tirupur Factory Queue
              </span>
            </div>
          </div>

          {/* 1. Choose Product (Silhouette) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-400">
                1. Select Product Silhouette
              </label>
              <span className="text-[11px] font-bold text-[#FF9A3D]">8 Flagship Blanks</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SEVEN_CORE_BLANKS.map((blank) => {
                const isSelected = selectedBlankId === blank.id;
                return (
                  <button
                    key={blank.id}
                    type="button"
                    onClick={() => setSelectedBlankId(blank.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#FF4D24] bg-[#FF4D24]/15 ring-2 ring-[#FF4D24] text-white shadow-lg'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-[#FF9A3D]">
                          {blank.skuPrefix}
                        </span>
                        <span className="text-xs font-black text-white">₹{blank.price}</span>
                      </div>
                      <div className="font-black text-xs text-white leading-tight truncate">{blank.name}</div>
                    </div>
                    <div className="mt-2 text-[9px] font-bold text-[#FF4D24]">
                      {isSelected ? '● ACTIVE' : 'Select ➔'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Studio: Canvas (Left) + Qikink Controls (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: Live Garment Canvas with Dynamic Placement */}
            <div className="lg:col-span-6 bg-neutral-950 rounded-3xl p-5 border border-white/10 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-neutral-300">
                  Preview: <strong className="text-white">{currentBlank.name}</strong>
                </span>
                <span className="text-[11px] font-mono font-bold text-[#FF9A3D] bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                  {selectedPlacement} View
                </span>
              </div>

              {/* Garment Mockup Container */}
              <div className="relative w-full aspect-square max-w-[420px] rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 flex items-center justify-center">
                <Image
                  src={activeCanvasImage}
                  alt={currentBlank.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  style={{ objectFit: 'cover' }}
                />

                {/* Dynamic Print Safe Zone based on Qikink Placement */}
                {(() => {
                  const plcConfig = QIKINK_PLACEMENT_OPTIONS.find((p) => p.id === selectedPlacement) || QIKINK_PLACEMENT_OPTIONS[0];
                  const boxStyle = currentBlank.isDeskMat
                    ? { width: '82%', height: '72%', top: '14%', left: '9%' }
                    : currentBlank.isMug
                    ? { width: '70%', height: '60%', top: '20%', left: '15%' }
                    : {
                        width: plcConfig.width,
                        height: plcConfig.height,
                        top: plcConfig.top,
                        left: plcConfig.left,
                      };

                  return (
                    <div
                      className="absolute pointer-events-none border-2 border-dashed border-[#FF4D24] rounded-xl flex items-center justify-center p-2 transition-all duration-300 bg-[#FF4D24]/[0.04]"
                      style={boxStyle}
                    >
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF4D24] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-md uppercase tracking-wider">
                        {currentBlank.isDeskMat
                          ? 'FULL SURFACE PRINT'
                          : currentBlank.isMug
                          ? 'PANORAMIC WRAP'
                          : plcConfig.safeLabel}
                      </span>

                      {/* Custom Artwork or Text */}
                      {customMode === 'image' && customImage && (
                        <div className="w-full h-full flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={customImage}
                            alt="Custom Print"
                            className="max-w-[90%] max-h-[90%] object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.7)]"
                          />
                        </div>
                      )}

                      {customMode === 'text' && (
                        <div
                          className={`${customFont} text-center select-none`}
                          style={{
                            color: customTextColor,
                            fontSize: 'clamp(14px, 2.5vw, 26px)',
                            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                          }}
                        >
                          {customText.trim() || 'YOUR BRAND'}
                        </div>
                      )}

                      {customMode === 'image' && !customImage && (
                        <div className="text-[11px] font-bold text-white/60 text-center flex flex-col items-center gap-1">
                          <span>+ Add Design</span>
                          <span className="text-[9px] text-[#FF9A3D]">({selectedPlacement})</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="w-full mt-3 flex items-center justify-between text-[11px] text-neutral-400 px-1">
                <span>Color: <strong className="text-white">{selectedLabColor}</strong></span>
                <span>Placement: <strong className="text-white">{selectedPlacement}</strong></span>
                <span>Size: <strong className="text-white">{selectedLabSize}</strong></span>
              </div>
            </div>

            {/* RIGHT: The 5 Simple Qikink Steps */}
            <div className="lg:col-span-6 space-y-6">

              {/* STEP 2: Placement Selector (Front, Back, Left Pocket, Right Pocket, Left Sleeve, Right Sleeve) */}
              {currentBlank.isApparel && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-2.5">
                    2. Choose Placement (Qikink Direct Zones)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {QIKINK_PLACEMENT_OPTIONS.map((plc) => {
                      const isActive = selectedPlacement === plc.id;
                      return (
                        <button
                          key={plc.id}
                          type="button"
                          onClick={() => handleSelectPlacement(plc.id)}
                          className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                            isActive
                              ? 'border-[#FF4D24] bg-[#FF4D24] text-white font-black shadow-md scale-[1.02]'
                              : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
                          }`}
                        >
                          <span className="block text-xs font-bold truncate leading-tight">{plc.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Design */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-2.5">
                  3. Design
                </label>
                
                {/* Mode Selector */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 mb-3">
                  <button
                    type="button"
                    onClick={() => setCustomMode('image')}
                    className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      customMode === 'image'
                        ? 'bg-[#FF4D24] text-white shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>Upload Artwork / Logo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomMode('text')}
                    className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      customMode === 'text'
                        ? 'bg-[#FF4D24] text-white shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>Custom Text</span>
                  </button>
                </div>

                {/* Upload File */}
                {customMode === 'image' && (
                  <div className="space-y-2">
                    <label className="block p-4 rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer text-center">
                      <span className="text-xs font-bold text-white block">
                        {uploadingLabImage ? 'Uploading Logo...' : 'Click or Drag & Drop PNG/SVG Design'}
                      </span>
                      <span className="text-[10px] text-neutral-400 mt-0.5 block">
                        Transparent background recommended • Up to 15MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLabUpload}
                        className="hidden"
                      />
                    </label>

                    {uploadError && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-bold">
                        {uploadError}
                      </div>
                    )}

                    {customImage && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate max-w-[220px]">
                          ✓ {customImageName || 'Custom Artwork Attached'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomImage(null);
                            setCustomImageName('');
                          }}
                          className="text-xs text-rose-400 font-bold hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Option C: Custom Text */}
                {customMode === 'text' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value.slice(0, 30))}
                      placeholder="Enter Custom Text (e.g. EMBER BUILDERS 2026)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white font-bold text-sm focus:outline-none focus:border-[#FF4D24]"
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: 'Streetwear Sans', font: 'font-sans font-black tracking-wider uppercase' },
                        { label: 'Cyber Monospace', font: 'font-mono font-bold tracking-widest uppercase' },
                        { label: 'Athletic Block', font: 'font-sans font-extrabold uppercase' },
                        { label: 'Vintage Serif', font: 'font-serif font-bold italic' },
                      ].map((f) => (
                        <button
                          key={f.label}
                          type="button"
                          onClick={() => setCustomFont(f.font)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                            customFont === f.font
                              ? 'border-[#FF4D24] bg-[#FF4D24]/15 text-[#FF9A3D]'
                              : 'border-white/10 bg-white/5 text-neutral-300'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 4: Product Colors (Qikink Default Color & Swatches) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-neutral-400">
                    4. Product Colors
                  </label>
                  <span className="text-xs font-bold text-neutral-300">
                    Default Color: <strong className="text-white">{selectedLabColor}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {QIKINK_GARMENT_COLORS.map((c) => {
                    const isSelected = selectedLabColor === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedLabColor(c.name)}
                        className={`group relative flex items-center gap-1.5 py-1.5 px-3 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#FF4D24] bg-white/15 text-white font-black ring-1 ring-[#FF4D24]'
                            : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/30'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border shadow-xs ${c.isLight ? 'border-black/30' : 'border-white/30'}`}
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs">{c.name}</span>
                        {isSelected && <span className="text-[#FF4D24] text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 5: Available Sizes (Qikink XS, S, M, L, XL, XXL) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-neutral-400">
                    5. Available Sizes
                  </label>
                  <span className="text-[11px] font-bold text-neutral-400">
                    Base: <strong className="text-white">₹{currentBlank.price}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {currentBlank.sizes.map((s) => {
                    const isSelected = selectedLabSize === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedLabSize(s)}
                        className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                          isSelected
                            ? 'border-[#FF4D24] bg-[#FF4D24] text-white font-black shadow-md'
                            : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="block text-xs font-black">{s}</span>
                        <span className="block text-[9px] text-white/70 font-semibold mt-0.5">
                          ₹{currentBlank.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order Notice Toast */}
              {orderNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  {orderNotice}
                </div>
              )}

              {/* STEP 6: Actions (Order 1 Piece or Transfer to Bulk) */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleOrderSingleLabPiece}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF4D24] to-[#E8244B] hover:brightness-110 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-[0_10px_25px_rgba(255,77,36,0.35)] transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  <span>ORDER CUSTOM DROP NOW ⚡</span>
                  <span>•</span>
                  <span>₹{currentBlank.price}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTransferToBulk}
                  className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Transfer Design to Bulk Calculator (25+ Units) ↓</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR & ESTIMATOR */}
      <section id="estimator" className="max-w-5xl mx-auto px-4 md:px-8 mt-4 relative z-20">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-black/[0.08]">
          <div className="border-b border-black/[0.06] pb-6 mb-8">
            <h2 className="text-xl md:text-3xl font-black text-[#161311] tracking-tight">
              Instant Bulk Price Estimator
            </h2>
            <p className="text-xs md:text-sm text-neutral-500 mt-1">
              Select your merchandise type and quantity to see live transparent factory-direct bulk pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT CONFIGURATOR (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2.5">
                  1. Choose Apparel / Setup Gear
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setProductType('tee')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      productType === 'tee'
                        ? 'border-[#FF4D24] bg-[#FF4D24]/[0.04] ring-1 ring-[#FF4D24]'
                        : 'border-black/[0.08] hover:border-black/20 bg-neutral-50/50'
                    }`}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">TEE</span>
                    <span className="block font-bold text-xs text-neutral-900">240 GSM Oversized Tee</span>
                    <span className="block text-[11px] text-[#FF4D24] font-bold mt-0.5">From ₹269/unit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductType('hoodie')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      productType === 'hoodie'
                        ? 'border-[#FF4D24] bg-[#FF4D24]/[0.04] ring-1 ring-[#FF4D24]'
                        : 'border-black/[0.08] hover:border-black/20 bg-neutral-50/50'
                    }`}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">FLEECE</span>
                    <span className="block font-bold text-xs text-neutral-900">380 GSM Fleece Hoodie</span>
                    <span className="block text-[11px] text-[#FF4D24] font-bold mt-0.5">From ₹549/unit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductType('mat')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      productType === 'mat'
                        ? 'border-[#FF4D24] bg-[#FF4D24]/[0.04] ring-1 ring-[#FF4D24]'
                        : 'border-black/[0.08] hover:border-black/20 bg-neutral-50/50'
                    }`}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">DESK</span>
                    <span className="block font-bold text-xs text-neutral-900">900x400 Desk Mat</span>
                    <span className="block text-[11px] text-[#FF4D24] font-bold mt-0.5">From ₹299/unit</span>
                  </button>
                </div>
              </div>

              {/* Quantity Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    2. Quantity (Min: 25 Units)
                  </label>
                  <span className="text-xs font-black text-[#FF4D24] bg-[#FF4D24]/10 px-2.5 py-0.5 rounded-full">
                    {quantity} Units Selected
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {[25, 35, 50, 100, 200, 350].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQuantity(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        quantity === preset
                          ? 'bg-[#161311] text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="25"
                  max="500"
                  step="5"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full accent-[#FF4D24] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-bold text-neutral-400 mt-1">
                  <span>25 units</span>
                  <span>100 units</span>
                  <span>250 units</span>
                  <span>500+ units</span>
                </div>
              </div>

              {/* Details List */}
              <div className="bg-[#FFFBF5] rounded-xl p-4 border border-black/[0.06] space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-700">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">Fabric Specs</span>
                  <span className="font-bold text-neutral-900">
                    {productType === 'tee' ? '240 GSM Combed Cotton (Bio-Washed)' : productType === 'hoodie' ? '380 GSM Heavy French Terry Brushed' : '4mm Micro-Weave Rubber Backing'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-700">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">Print Technology</span>
                  <span className="font-bold text-neutral-900">OEKO-TEX Certified HD DTF (Chest + Back)</span>
                </div>
                <div className="flex items-center justify-between text-neutral-700">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">Dispatch Lead Time</span>
                  <span className="font-bold text-emerald-700">4–6 Working Days Direct to Campus/Office</span>
                </div>
              </div>
            </div>

            {/* RIGHT SUMMARY CARD (5 Cols) */}
            <div className="lg:col-span-5 bg-[#12100E] text-white rounded-2xl p-6 md:p-7 shadow-xl border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#FF4D24]">Tier Quotation</span>
                  <h3 className="text-xl font-bold">{getProductName()}</h3>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-white/70">
                  <span>Bulk Tier Unit Price:</span>
                  <span className="text-base font-bold text-white">₹{unitPrice}</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>Standard Retail Value:</span>
                  <span className="line-through text-white/40">₹{totalRetail.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Your Bulk Club Savings:</span>
                  <span>- ₹{totalSavings.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>Screen &amp; Setup Fee:</span>
                  <span className="text-emerald-400 font-bold">₹0 (FREE)</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>Pan-India Air Logistics:</span>
                  <span className="text-emerald-400 font-bold">FREE</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-white/60 block">Total Estimated Cost:</span>
                  <span className="text-2xl md:text-3xl font-black text-[#FF4D24]">
                    ₹{totalEstimate.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-white/60 bg-white/10 px-2.5 py-1 rounded uppercase">
                  100% Prepaid
                </span>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAiAgentOpen(true)}
                  className="w-full py-3.5 px-4 rounded-lg bg-[#FF4D24] hover:bg-[#e03d15] text-white font-bold text-xs md:text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-sm active:scale-95"
                >
                  <span>Negotiate &amp; Lock Advance via Assistant</span>
                </button>

                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all no-underline border border-white/15"
                >
                  <span>WhatsApp Merch Lead with this Quote →</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK INQUIRY FORM */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 mt-12">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-black/[0.08]">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <span className="text-[#FF4D24] text-xs font-black uppercase tracking-wider">Fast Turnaround</span>
            <h3 className="text-2xl md:text-3xl font-black text-neutral-900 mt-1">
              Lock Your Order / Request Sample Swatches
            </h3>
            <p className="text-xs md:text-sm text-neutral-500 mt-1.5">
              Fill in your details and our Tirupur production manager will send digital 3D mockups and fabric specs via WhatsApp within 2 hours.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-8 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3 max-w-md mx-auto">
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-800 font-bold block">CONFIRMED</span>
              <h4 className="font-bold text-lg text-emerald-950">Inquiry Received</h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Thank you. Our team has logged your requirement for <b>{quantity} units</b> of <b>{getProductName()}</b>. We will reach out via WhatsApp with fabric specifications and digital proofs within 2 hours.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="mt-2 text-xs font-bold text-emerald-900 underline cursor-pointer bg-transparent border-none"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  College / Startup / Organization *
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. PES University ACM Club or Stealth AI"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-xs text-neutral-900 font-semibold focus:outline-none focus:border-[#FF4D24]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Lead Organizer / Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-xs text-neutral-900 font-semibold focus:outline-none focus:border-[#FF4D24]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  WhatsApp Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-xs text-neutral-900 font-semibold focus:outline-none focus:border-[#FF4D24]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Target Event / Delivery Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-xs text-neutral-900 font-semibold focus:outline-none focus:border-[#FF4D24]"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-[#161311] hover:bg-black text-white font-black text-xs md:text-sm uppercase tracking-wider transition-all cursor-pointer border-none shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Transmitting to Factory Desk...' : 'Request Free 3D Mockup & Lock Factory Slot ⚡'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* WHY RAREEMBER SECTION */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 mt-16">
        <div className="text-center mb-8">
          <span className="text-[#FF4D24] text-xs font-black uppercase tracking-wider">Direct Manufacturing</span>
          <h3 className="text-2xl md:text-3xl font-black text-neutral-900 mt-1">Why Top College Fests Trust RareEmber</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white border border-black/[0.08] space-y-3">
            <span className="font-mono text-xs font-bold text-[#FF4D24] uppercase tracking-wider block">01 / PRODUCTION</span>
            <h4 className="font-bold text-sm text-neutral-900">Direct Tirupur Mill Output</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              No middleman brokers or retail markups. Direct manufacturing with partnered knitting and finishing mills in Tirupur.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-black/[0.08] space-y-3">
            <span className="font-mono text-xs font-bold text-[#FF4D24] uppercase tracking-wider block">02 / TEXTILES</span>
            <h4 className="font-bold text-sm text-neutral-900">100% Pre-Shrunk &amp; Bio-Washed</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Substantial 240+ GSM combed cotton and 380 GSM fleece. Pre-shrunk, dense knit, structured silhouettes built to hold shape.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-black/[0.08] space-y-3">
            <span className="font-mono text-xs font-bold text-[#FF4D24] uppercase tracking-wider block">03 / LOGISTICS</span>
            <h4 className="font-bold text-sm text-neutral-900">Guaranteed Event Timelines</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Strict delivery SLAs for hackathons, college fests, and company merch. Partnered with BlueDart Air and Delhivery Express.
            </p>
          </div>
        </div>
      </section>

      {/* FLOATING DIRECT SUPPORT BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link
          href="/support"
          className="px-5 py-3 rounded-lg bg-[#12100E] text-white hover:bg-black font-bold text-xs uppercase tracking-wider shadow-xl border border-white/20 flex items-center gap-2 transition-all no-underline"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Priority Care Desk</span>
        </Link>
      </div>
    </main>
  );
}
