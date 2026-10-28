// storefront/src/app/custom-drops/CustomDropsClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/store/cart';
import {
  STREETWEAR_GRAPHIC_PRESETS,
  TEXT_FONT_OPTIONS,
  TEXT_COLOR_OPTIONS,
  GraphicPreset,
} from './customizer-presets';

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
    price: 799,
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
    price: 1399,
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
    price: 1099,
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
    price: 1499,
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
    price: 849,
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
    price: 949,
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
    price: 799,
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
    price: 499,
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
  const [selectedLabColor, setSelectedLabColor] = useState<string>('White');
  const [selectedLabSize, setSelectedLabSize] = useState<string>('L');
  const [uploadingLabImage, setUploadingLabImage] = useState<boolean>(false);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Front Design State
  const [frontPlacement, setFrontPlacement] = useState<QikinkPlacement>('Front');
  const [frontMode, setFrontMode] = useState<'vault' | 'upload' | 'text'>('vault');
  const [frontImage, setFrontImage] = useState<string | null>(STREETWEAR_GRAPHIC_PRESETS[0].dataUrl);
  const [frontImageName, setFrontImageName] = useState<string>(STREETWEAR_GRAPHIC_PRESETS[0].name);
  const [frontPresetId, setFrontPresetId] = useState<string | null>(STREETWEAR_GRAPHIC_PRESETS[0].id);
  const [frontText, setFrontText] = useState<string>('');
  const [frontFont, setFrontFont] = useState<string>(TEXT_FONT_OPTIONS[0].className);
  const [frontTextColor, setFrontTextColor] = useState<string>('#FFFFFF');
  const [frontTextSize, setFrontTextSize] = useState<number>(22);
  const [frontTextTracking, setFrontTextTracking] = useState<string>('tracking-wider');
  const [frontTextEffect, setFrontTextEffect] = useState<'flat' | 'shadow' | 'glow'>('shadow');
  const [frontScale, setFrontScale] = useState<number>(1.0);
  const [frontPosX, setFrontPosX] = useState<number>(0);
  const [frontPosY, setFrontPosY] = useState<number>(0);
  const [frontRotation, setFrontRotation] = useState<number>(0);
  const [frontIsFlipped, setFrontIsFlipped] = useState<boolean>(false);

  // Back Design State
  const [backPlacement] = useState<QikinkPlacement>('Back');
  const [backMode, setBackMode] = useState<'vault' | 'upload' | 'text'>('vault');
  const [backImage, setBackImage] = useState<string | null>(null);
  const [backImageName, setBackImageName] = useState<string>('');
  const [backPresetId, setBackPresetId] = useState<string | null>(null);
  const [backText, setBackText] = useState<string>('');
  const [backFont, setBackFont] = useState<string>(TEXT_FONT_OPTIONS[0].className);
  const [backTextColor, setBackTextColor] = useState<string>('#FFFFFF');
  const [backTextSize, setBackTextSize] = useState<number>(24);
  const [backTextTracking, setBackTextTracking] = useState<string>('tracking-widest');
  const [backTextEffect, setBackTextEffect] = useState<'flat' | 'shadow' | 'glow'>('shadow');
  const [backScale, setBackScale] = useState<number>(1.1);
  const [backPosX, setBackPosX] = useState<number>(0);
  const [backPosY, setBackPosY] = useState<number>(0);
  const [backRotation, setBackRotation] = useState<number>(0);
  const [backIsFlipped, setBackIsFlipped] = useState<boolean>(false);

  const currentBlank = SEVEN_CORE_BLANKS.find((b) => b.id === selectedBlankId) || SEVEN_CORE_BLANKS[0];

  // Active view helpers
  const isFront = customView === 'front';
  const activeMode = isFront ? frontMode : backMode;
  const activeImage = isFront ? frontImage : backImage;
  const activeImageName = isFront ? frontImageName : backImageName;
  const activePresetId = isFront ? frontPresetId : backPresetId;
  const activeText = isFront ? frontText : backText;
  const activeFont = isFront ? frontFont : backFont;
  const activeTextColor = isFront ? frontTextColor : backTextColor;
  const activeTextSize = isFront ? frontTextSize : backTextSize;
  const activeTextTracking = isFront ? frontTextTracking : backTextTracking;
  const activeTextEffect = isFront ? frontTextEffect : backTextEffect;
  const activeScale = isFront ? frontScale : backScale;
  const activePosX = isFront ? frontPosX : backPosX;
  const activePosY = isFront ? frontPosY : backPosY;
  const activeRotation = isFront ? frontRotation : backRotation;
  const activeIsFlipped = isFront ? frontIsFlipped : backIsFlipped;
  const activePlacement = isFront ? frontPlacement : backPlacement;

  const handleSelectPlacement = (plc: QikinkPlacement) => {
    if (plc === 'Back') {
      setCustomView('back');
    } else {
      setFrontPlacement(plc);
      setCustomView('front');
    }
  };

  const handleSelectPreset = (preset: GraphicPreset) => {
    if (isFront) {
      setFrontMode('vault');
      setFrontImage(preset.dataUrl);
      setFrontImageName(preset.name);
      setFrontPresetId(preset.id);
      setFrontScale(preset.defaultScale);
      setFrontPosX(0);
      setFrontPosY(0);
      setFrontRotation(0);
      setFrontIsFlipped(false);
    } else {
      setBackMode('vault');
      setBackImage(preset.dataUrl);
      setBackImageName(preset.name);
      setBackPresetId(preset.id);
      setBackScale(preset.defaultScale);
      setBackPosX(0);
      setBackPosY(0);
      setBackRotation(0);
      setBackIsFlipped(false);
    }
  };

  const handleClearCurrentDesign = () => {
    if (isFront) {
      setFrontImage(null);
      setFrontImageName('');
      setFrontPresetId(null);
      setFrontText('');
    } else {
      setBackImage(null);
      setBackImageName('');
      setBackPresetId(null);
      setBackText('');
    }
  };

  const handleResetTransform = () => {
    if (isFront) {
      setFrontScale(1.0);
      setFrontPosX(0);
      setFrontPosY(0);
      setFrontRotation(0);
      setFrontIsFlipped(false);
    } else {
      setBackScale(1.1);
      setBackPosX(0);
      setBackPosY(0);
      setBackRotation(0);
      setBackIsFlipped(false);
    }
  };

  const handleNudge = (dx: number, dy: number) => {
    if (isFront) {
      setFrontPosX((prev) => Math.max(-35, Math.min(35, prev + dx)));
      setFrontPosY((prev) => Math.max(-35, Math.min(35, prev + dy)));
    } else {
      setBackPosX((prev) => Math.max(-35, Math.min(35, prev + dx)));
      setBackPosY((prev) => Math.max(-35, Math.min(35, prev + dy)));
    }
  };

  const handleRotate = (delta: number) => {
    if (isFront) {
      setFrontRotation((prev) => (prev + delta + 360) % 360);
    } else {
      setBackRotation((prev) => (prev + delta + 360) % 360);
    }
  };

  const handleToggleFlip = () => {
    if (isFront) {
      setFrontIsFlipped((prev) => !prev);
    } else {
      setBackIsFlipped((prev) => !prev);
    }
  };

  useEffect(() => {
    if (currentBlank.isDeskMat) {
      setSelectedLabSize('900×400mm');
      setFrontPlacement('Front');
      setCustomView('front');
    } else if (currentBlank.isMug) {
      setSelectedLabSize('11 Oz (330ml)');
      setFrontPlacement('Front');
      setCustomView('front');
    } else {
      if (!currentBlank.sizes.includes(selectedLabSize)) {
        setSelectedLabSize(currentBlank.sizes.includes('L') ? 'L' : currentBlank.sizes[0]);
      }
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

    if (isFront) {
      setFrontMode('upload');
      setFrontImageName(file.name);
      setFrontPresetId(null);
    } else {
      setBackMode('upload');
      setBackImageName(file.name);
      setBackPresetId(null);
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      if (isFront) setFrontImage(dataUri);
      else setBackImage(dataUri);
    };
    reader.readAsDataURL(file);

    try {
      setUploadingLabImage(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data?.ok && data?.url) {
        if (isFront) setFrontImage(data.url);
        else setBackImage(data.url);
      }
    } catch {
      // preview retained
    } finally {
      setUploadingLabImage(false);
    }
  };

  const handleOrderSingleLabPiece = () => {
    const hasFrontArt = Boolean(frontImage || (frontMode === 'text' && frontText.trim()));
    const hasBackArt = Boolean(backImage || (backMode === 'text' && backText.trim()));

    add(currentBlank.id, 1, {
      title: `Custom ${currentBlank.name}`,
      price: Number((currentBlank.price / 85).toFixed(2)),
      price_inr: currentBlank.price,
      emoji: '',
      imageUrl: customView === 'back' && currentBlank.backImage ? currentBlank.backImage : currentBlank.frontImage,
      gradient: 'linear-gradient(135deg, rgba(255,77,36,0.1), rgba(0,0,0,0.05))',
      size: selectedLabSize,
      color: selectedLabColor,
      customPlacement: hasFrontArt ? frontPlacement : hasBackArt ? 'Back' : 'Front',
      customText: frontMode === 'text' && frontText.trim() ? frontText.trim() : undefined,
      customTextColor: frontMode === 'text' ? frontTextColor : undefined,
      customFont: frontMode === 'text' ? frontFont : undefined,
      customImage: frontMode !== 'text' && frontImage ? frontImage : undefined,
      customImageName: frontImageName || (frontText ? `Front: ${frontText}` : undefined),
      customScale: frontScale,
      customPosition: { x: frontPosX, y: frontPosY },
      customRotation: frontRotation,
      customBackText: backMode === 'text' && backText.trim() ? backText.trim() : undefined,
      customBackImage: backMode !== 'text' && backImage ? backImage : undefined,
      customBackPlacement: hasBackArt ? 'Oversized Back' : undefined,
    });

    setOrderNotice(`✓ Added custom ${currentBlank.name} (${selectedLabColor} • ${selectedLabSize}) to cart! Redirecting to checkout...`);
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

  const handleB2bSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/custom-drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName,
          contactName,
          phone,
          eventDate,
          productType,
          quantity,
          estimatedTotal: totalEstimate,
        }),
      });
      if (res.ok) setIsSubmitted(true);
      else setIsSubmitted(true); // Fallback to success toast
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const activeCanvasImage =
    customView === 'back' && currentBlank.backImage ? currentBlank.backImage : currentBlank.frontImage;

  // Realistic fabric color simulation for blanks
  const colorFilterStyle = (() => {
    if (!currentBlank.isApparel) return null;
    switch (selectedLabColor) {
      case 'Black':
        return { backgroundColor: '#18181B', mixBlendMode: 'multiply' as const, opacity: 0.88 };
      case 'Navy Blue':
        return { backgroundColor: '#1E293B', mixBlendMode: 'multiply' as const, opacity: 0.85 };
      case 'Grey Melange':
        return { backgroundColor: '#6B7280', mixBlendMode: 'multiply' as const, opacity: 0.5 };
      case 'Red':
        return { backgroundColor: '#DC2626', mixBlendMode: 'multiply' as const, opacity: 0.75 };
      case 'Royal Blue':
        return { backgroundColor: '#2563EB', mixBlendMode: 'multiply' as const, opacity: 0.75 };
      case 'Bottle Green':
        return { backgroundColor: '#14532D', mixBlendMode: 'multiply' as const, opacity: 0.8 };
      default:
        return null;
    }
  })();

  const frontHasDesign = Boolean(frontImage || (frontMode === 'text' && frontText.trim()));
  const backHasDesign = Boolean(backImage || (backMode === 'text' && backText.trim()));

  return (
    <main className="page-top min-h-screen text-[#161311] pb-24 bg-[#FFFBF5]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#12100E] text-white py-14 px-4 md:px-8 border-b border-white/10 grain">
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-white/90 text-[11px] font-bold uppercase tracking-wider">
            Custom Silhouettes &amp; Studio Printing • Direct Studio Drops
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Custom Streetwear Drops &amp; Silhouettes for Creators &amp; Teams.
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
              Order Single Samples or Bulk 25–1,000+
            </span>
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              ⚡ 48–72h Fast Turnaround
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION: RAREEMBER™ CUSTOM LAB (ADVANCED INTERACTIVE STUDIO) */}
      {/* ======================================================== */}
      <section id="custom-lab" className="max-w-6xl mx-auto px-4 md:px-8 py-12 relative z-20">
        <div className="p-6 md:p-10 rounded-3xl bg-[#0c0b0a] text-white border-2 border-[#FF4D24]/40 shadow-[0_20px_50px_rgba(0,0,0,0.25)] space-y-8">
          
          {/* Header & Breadcrumb */}
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
                Direct Studio Sourcing Queue
              </span>
            </div>
          </div>

          {/* STEP 1: Choose Product (Silhouette) */}
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

          {/* Visual Studio: Canvas (Left) + Customizer Controls (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Garment Canvas + Interactive Transform Controls */}
            <div className="lg:col-span-6 bg-neutral-950 rounded-3xl p-5 border border-white/10 flex flex-col items-center">
              
              {/* Dual-Side View Switcher (Front vs Back) */}
              {currentBlank.isApparel && (
                <div className="w-full grid grid-cols-2 gap-2 mb-3 bg-white/5 p-1 rounded-2xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setCustomView('front')}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      customView === 'front'
                        ? 'bg-[#FF4D24] text-white shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>👕 Front Side</span>
                    {frontHasDesign && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Front has custom design" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomView('back')}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      customView === 'back'
                        ? 'bg-[#FF4D24] text-white shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>🔄 Back Side</span>
                    {backHasDesign && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Back has custom design" />
                    )}
                  </button>
                </div>
              )}

              <div className="w-full flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-neutral-300">
                  Viewing: <strong className="text-white">{isFront ? 'Front View' : 'Back View'}</strong>
                </span>
                <span className="text-[11px] font-mono font-bold text-[#FF9A3D] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                  {activePlacement} Zone
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

                {/* Fabric Multiply Color Wash Overlay */}
                {colorFilterStyle && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-300"
                    style={colorFilterStyle}
                  />
                )}

                {/* Dynamic Print Safe Zone */}
                {(() => {
                  const plcConfig = QIKINK_PLACEMENT_OPTIONS.find((p) => p.id === activePlacement) || QIKINK_PLACEMENT_OPTIONS[0];
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

                  const transformStyle = {
                    transform: `translate(${activePosX}%, ${activePosY}%) scale(${activeScale}) rotate(${activeRotation}deg) scaleX(${activeIsFlipped ? -1 : 1})`,
                    transition: 'transform 0.12s ease-out',
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

                      {/* Custom Artwork (Vault or Upload) */}
                      {activeMode !== 'text' && activeImage && (
                        <div
                          className="w-full h-full flex items-center justify-center origin-center"
                          style={transformStyle}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={activeImage}
                            alt="Custom Print"
                            className="max-w-[92%] max-h-[92%] object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.7)]"
                          />
                        </div>
                      )}

                      {/* Custom Text */}
                      {activeMode === 'text' && (
                        <div
                          className={`${activeFont} ${activeTextTracking} text-center select-none origin-center`}
                          style={{
                            ...transformStyle,
                            color: activeTextColor,
                            fontSize: `${activeTextSize}px`,
                            textShadow:
                              activeTextEffect === 'glow'
                                ? `0 0 16px ${activeTextColor}, 0 2px 8px rgba(0,0,0,0.9)`
                                : activeTextEffect === 'shadow'
                                ? '0 3px 10px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.9)'
                                : 'none',
                          }}
                        >
                          {activeText.trim() || 'YOUR BRAND'}
                        </div>
                      )}

                      {/* Placeholder when empty */}
                      {activeMode !== 'text' && !activeImage && (
                        <div className="text-[11px] font-bold text-white/60 text-center flex flex-col items-center gap-1">
                          <span>+ Add Design</span>
                          <span className="text-[9px] text-[#FF9A3D]">({activePlacement})</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Status Info Strip */}
              <div className="w-full mt-3 flex items-center justify-between text-[11px] text-neutral-400 px-1 flex-wrap gap-1">
                <span>Color: <strong className="text-white">{selectedLabColor}</strong></span>
                <span>Side: <strong className="text-white">{isFront ? 'Front' : 'Back'}</strong></span>
                <span>Scale: <strong className="text-[#FF9A3D]">{Math.round(activeScale * 100)}%</strong></span>
                <span>Size: <strong className="text-white">{selectedLabSize}</strong></span>
              </div>

              {/* INTERACTIVE TRANSFORM TOOLBAR (Scale, Position, Rotate, Flip) */}
              <div className="w-full mt-4 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    📐 Design Placement &amp; Scale Controls
                  </span>
                  <button
                    type="button"
                    onClick={handleResetTransform}
                    className="text-[10px] text-neutral-400 hover:text-white font-bold cursor-pointer"
                  >
                    ↺ Reset Center
                  </button>
                </div>

                {/* Scale Slider + Presets */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-300 mb-1">
                    <span>Print Size</span>
                    <span className="font-mono font-bold text-[#FF9A3D]">{Math.round(activeScale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    step="5"
                    value={Math.round(activeScale * 100)}
                    onChange={(e) => {
                      const val = Number(e.target.value) / 100;
                      if (isFront) setFrontScale(val);
                      else setBackScale(val);
                    }}
                    className="w-full accent-[#FF4D24] cursor-pointer"
                  />
                  <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                    {[
                      { label: 'Pocket Crest (60%)', scale: 0.6 },
                      { label: 'Standard (100%)', scale: 1.0 },
                      { label: 'Oversized (140%)', scale: 1.4 },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => {
                          if (isFront) setFrontScale(btn.scale);
                          else setBackScale(btn.scale);
                        }}
                        className={`py-1 px-1.5 rounded-lg text-[10px] font-bold border transition-all text-center cursor-pointer ${
                          Math.abs(activeScale - btn.scale) < 0.05
                            ? 'bg-[#FF4D24]/20 border-[#FF4D24] text-white'
                            : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position Nudge Buttons & Rotate/Flip */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                  {/* Position Nudge Pad */}
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 block mb-1">Position Alignment</span>
                    <div className="grid grid-cols-3 gap-1">
                      <span />
                      <button
                        type="button"
                        onClick={() => handleNudge(0, -6)}
                        title="Move Up"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-white border border-white/10 flex items-center justify-center cursor-pointer"
                      >
                        ▲
                      </button>
                      <span />
                      <button
                        type="button"
                        onClick={() => handleNudge(-6, 0)}
                        title="Move Left"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-white border border-white/10 flex items-center justify-center cursor-pointer"
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (isFront) { setFrontPosX(0); setFrontPosY(0); }
                          else { setBackPosX(0); setBackPosY(0); }
                        }}
                        title="Center"
                        className="p-1.5 rounded-lg bg-[#FF4D24]/20 hover:bg-[#FF4D24]/30 text-[10px] text-white border border-[#FF4D24]/40 flex items-center justify-center font-bold cursor-pointer"
                      >
                        •
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNudge(6, 0)}
                        title="Move Right"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-white border border-white/10 flex items-center justify-center cursor-pointer"
                      >
                        ▶
                      </button>
                      <span />
                      <button
                        type="button"
                        onClick={() => handleNudge(0, 6)}
                        title="Move Down"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-white border border-white/10 flex items-center justify-center cursor-pointer"
                      >
                        ▼
                      </button>
                      <span />
                    </div>
                  </div>

                  {/* Rotate & Mirror Controls */}
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 block mb-1">Rotate &amp; Flip</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRotate(-90)}
                        className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/15 text-[11px] font-bold text-white border border-white/10 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>⟲</span>
                        <span>-90°</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRotate(90)}
                        className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/15 text-[11px] font-bold text-white border border-white/10 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>⟳</span>
                        <span>+90°</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleFlip}
                        className={`col-span-2 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          activeIsFlipped
                            ? 'bg-[#FF4D24]/20 border-[#FF4D24] text-white'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white'
                        }`}
                      >
                        <span>⇄</span>
                        <span>Flip Mirror {activeIsFlipped ? '(Active)' : ''}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Step-by-Step Customizer Controls */}
            <div className="lg:col-span-6 space-y-6">

              {/* STEP 2: Placement Selector */}
              {currentBlank.isApparel && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black uppercase tracking-wider text-neutral-400">
                      2. Choose Placement ({isFront ? 'Front Zones' : 'Back Zone'})
                    </label>
                    <span className="text-[10px] text-neutral-400">
                      Currently: <strong className="text-white">{activePlacement}</strong>
                    </span>
                  </div>
                  
                  {isFront ? (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {QIKINK_PLACEMENT_OPTIONS.filter((p) => p.id !== 'Back').map((plc) => {
                        const isActive = frontPlacement === plc.id;
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
                  ) : (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">✨</span>
                        <div>
                          <div className="text-xs font-black text-white">Oversized Back Placement</div>
                          <div className="text-[10px] text-neutral-400">12" × 14" High-Definition Direct-to-Film Print Area</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase bg-[#FF4D24]/20 border border-[#FF4D24]/50 text-[#FF9A3D] px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Design Engine (Vault Graphics | Upload Logo | Custom Typography) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-neutral-400">
                    3. Artwork &amp; Typography ({isFront ? 'Front Side' : 'Back Side'})
                  </label>
                  {(activeImage || activeText) && (
                    <button
                      type="button"
                      onClick={handleClearCurrentDesign}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                    >
                      Clear {isFront ? 'Front' : 'Back'}
                    </button>
                  )}
                </div>
                
                {/* Mode Selector (3 Tabs) */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (isFront) setFrontMode('vault');
                      else setBackMode('vault');
                    }}
                    className={`py-2 px-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeMode === 'vault'
                        ? 'bg-[#FF4D24] text-white shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>🔥 Vault</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (isFront) setFrontMode('upload');
                      else setBackMode('upload');
                    }}
                    className={`py-2 px-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeMode === 'upload'
                        ? 'bg-[#FF4D24] text-white shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>📁 Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (isFront) setFrontMode('text');
                      else setBackMode('text');
                    }}
                    className={`py-2 px-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeMode === 'text'
                        ? 'bg-[#FF4D24] text-white shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>🔤 Text</span>
                  </button>
                </div>

                {/* TAB 1: STREETWEAR VAULT (8 Curated Graphics) */}
                {activeMode === 'vault' && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Tap any streetwear graphic to apply instantly:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {STREETWEAR_GRAPHIC_PRESETS.map((pst) => {
                        const isSelected = activePresetId === pst.id;
                        return (
                          <button
                            key={pst.id}
                            type="button"
                            onClick={() => handleSelectPreset(pst)}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 ${
                              isSelected
                                ? 'border-[#FF4D24] bg-[#FF4D24]/15 ring-2 ring-[#FF4D24] text-white'
                                : 'border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300'
                            }`}
                          >
                            <div className="w-12 h-12 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={pst.dataUrl} alt={pst.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <span className="text-[10px] font-black truncate w-full leading-tight">{pst.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: UPLOAD LOGO / ARTWORK */}
                {activeMode === 'upload' && (
                  <div className="space-y-2">
                    <label className="block p-4 rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer text-center">
                      <span className="text-xs font-bold text-white block">
                        {uploadingLabImage ? 'Uploading Logo...' : 'Click or Drag & Drop PNG/SVG/JPG'}
                      </span>
                      <span className="text-[10px] text-neutral-400 mt-0.5 block">
                        Transparent PNG recommended • Up to 15MB
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

                    {activeImage && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate max-w-[220px]">
                          ✓ {activeImageName || 'Custom Artwork Attached'}
                        </span>
                        <button
                          type="button"
                          onClick={handleClearCurrentDesign}
                          className="text-xs text-rose-400 font-bold hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: CUSTOM TYPOGRAPHY */}
                {activeMode === 'text' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      maxLength={32}
                      value={activeText}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (isFront) setFrontText(val);
                        else setBackText(val);
                      }}
                      placeholder="Enter Custom Text (e.g. RARE EMBER)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white font-bold text-sm focus:outline-none focus:border-[#FF4D24]"
                    />

                    {/* Font Selector */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Font Personality
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {TEXT_FONT_OPTIONS.map((f) => {
                          const isSelected = activeFont === f.className;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => {
                                if (isFront) setFrontFont(f.className);
                                else setBackFont(f.className);
                              }}
                              className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center truncate ${
                                isSelected
                                  ? 'border-[#FF4D24] bg-[#FF4D24]/15 text-[#FF9A3D]'
                                  : 'border-white/10 bg-white/5 text-neutral-300 hover:text-white'
                              }`}
                            >
                              {f.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Text Color Swatches */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Text Color
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {TEXT_COLOR_OPTIONS.map((col) => {
                          const isSelected = activeTextColor === col.hex;
                          return (
                            <button
                              key={col.name}
                              type="button"
                              onClick={() => {
                                if (isFront) setFrontTextColor(col.hex);
                                else setBackTextColor(col.hex);
                              }}
                              className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                                isSelected ? 'ring-2 ring-[#FF4D24] scale-110' : 'opacity-80 hover:opacity-100'
                              } ${col.border || 'border-transparent'}`}
                              style={{ backgroundColor: col.hex }}
                              title={col.name}
                            >
                              {isSelected && (
                                <span className={col.hex === '#FFFFFF' ? 'text-black text-xs font-black' : 'text-white text-xs font-black'}>
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Font Size & Spacing */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                          <span>Font Size</span>
                          <span className="text-white font-bold">{activeTextSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="12"
                          max="36"
                          value={activeTextSize}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (isFront) setFrontTextSize(val);
                            else setBackTextSize(val);
                          }}
                          className="w-full accent-[#FF4D24] cursor-pointer"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 block mb-1">Text Style / Glow</span>
                        <div className="grid grid-cols-3 gap-1">
                          {(['flat', 'shadow', 'glow'] as const).map((eff) => (
                            <button
                              key={eff}
                              type="button"
                              onClick={() => {
                                if (isFront) setFrontTextEffect(eff);
                                else setBackTextEffect(eff);
                              }}
                              className={`py-1 rounded-lg text-[10px] font-bold uppercase border transition-all text-center cursor-pointer ${
                                activeTextEffect === eff
                                  ? 'bg-[#FF4D24] text-white border-[#FF4D24]'
                                  : 'bg-white/5 border-white/10 text-neutral-400'
                              }`}
                            >
                              {eff}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 4: Product Colors */}
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
                        {isSelected && <span className="text-[#FF4D24] text-xs font-black">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 5: Available Sizes */}
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
                  className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📦 Need 25+ Units for College Fest or Startup? Transfer to Bulk Estimator ↓</span>
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
                  <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">Printing Tech</span>
                  <span className="font-bold text-neutral-900">
                    High-Definition OEKO-TEX® Direct-to-Film (DTF)
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-700">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">Delivery SLA</span>
                  <span className="font-bold text-emerald-700">
                    Pan-India Express Air (4-Day Delivery)
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT QUOTE BREAKDOWN (5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#161311] to-[#26211D] text-white rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-xl border border-white/5">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">Total Units</span>
                  <span className="text-sm font-bold text-white">{quantity} pieces</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">Per Unit Factory Rate</span>
                  <span className="text-sm font-bold text-white">₹{unitPrice}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">M.R.P. Equivalent</span>
                  <span className="text-xs text-neutral-400 line-through">₹{totalRetail.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Estimated Factory Total
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    ₹{totalEstimate.toLocaleString('en-IN')}
                  </div>
                  <div className="mt-1 text-xs font-bold text-emerald-400">
                    Club Savings: ₹{totalSavings.toLocaleString('en-IN')} ({Math.round((totalSavings / totalRetail) * 100)}% Factory Discount)
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <span>Chat on WhatsApp for Free Mockups</span>
                  <span>→</span>
                </a>

                <a
                  href="#contact-form"
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all"
                >
                  Submit Official RFP Form
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY ZERO CUSTOMERS REGRET */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 mt-12">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#161311]">
            Why Zero College Clubs Regret Rare Ember Drops
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Built for campus festivals, tech conferences, and student engineering clubs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-black/[0.08] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-[#FF4D24] font-black flex items-center justify-center text-sm">
              01
            </div>
            <h3 className="font-bold text-sm text-[#161311]">Zero Blind Ordering</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We send digital proof mockups within 2 hours. Physical production samples can be shipped in 24 hours.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-black/[0.08] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 font-black flex items-center justify-center text-sm">
              02
            </div>
            <h3 className="font-bold text-sm text-[#161311]">True Streetwear Fit</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              No cheap 140 GSM see-through blanks. Every tee is 240 GSM combed cotton with drop-shoulder silhouette.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-black/[0.08] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 font-black flex items-center justify-center text-sm">
              03
            </div>
            <h3 className="font-bold text-sm text-[#161311]">Doorstep Delivery SLA</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Express domestic air courier across Delhi, Bangalore, Mumbai, Pune, Chennai, Hyderabad, and all IIT/NIT campuses.
            </p>
          </div>
        </div>
      </section>

      {/* OFFICIAL RFP / INQUIRY FORM */}
      <section id="contact-form" className="max-w-5xl mx-auto px-4 md:px-8 mt-16">
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-black/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="border-b border-black/[0.06] pb-6 mb-6">
            <h2 className="text-xl md:text-2xl font-black text-[#161311] tracking-tight">
              Request College / Startup Bulk Sample Kit
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Submit your event details and our lead merchandiser will call you with direct factory sample rates.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <span className="text-2xl">✓</span>
              <h3 className="text-sm font-bold text-emerald-900">Inquiry Received!</h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Our factory merchandiser will WhatsApp you within 2 hours with free mockups and dispatch timeline.
              </p>
            </div>
          ) : (
            <form onSubmit={handleB2bSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    College Name / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. IIT Bombay / IEEE Student Branch"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs text-neutral-900 focus:outline-none focus:border-[#FF4D24]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Your Name (Lead Organizer) *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs text-neutral-900 focus:outline-none focus:border-[#FF4D24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs text-neutral-900 focus:outline-none focus:border-[#FF4D24]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Target Fest / Event Date
                  </label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="e.g. Next month / Nov 15th"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs text-neutral-900 focus:outline-none focus:border-[#FF4D24]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#161311] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Sending Request…' : 'Submit for Free Mockups & Sample Kit'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
