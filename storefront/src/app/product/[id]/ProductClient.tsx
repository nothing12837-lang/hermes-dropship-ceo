'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store/cart';
import { useWishlist } from '@/lib/store/wishlist';
import { formatPrice, computeDiscount, PET_META, bundles, getProduct } from '@/lib/data/products';
import type { Product } from '@/lib/data/products';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { resolveProductImages } from '@/lib/data/product-gallery';
import ProductCard from '@/components/ui/ProductCard';
import PincodeChecker from '@/components/ui/PincodeChecker';
import ProductReviews from '@/components/ui/ProductReviews';
import { useGeo } from '@/context/GeoContext';
import { trackViewItem, trackAddToCart } from '@/lib/telemetry/dataLayer';

const PERSPECTIVE_LABELS = ['Hero Front', 'Detail Macro', 'In-Room Setup', 'Unboxed & Scale'];

const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'] as const;

const SIZE_GUIDE_ROWS = [
  { size: 'S', chestIn: 38, chestCm: 96, lengthIn: 27, lengthCm: 68, shoulderIn: 18, shoulderCm: 46 },
  { size: 'M', chestIn: 40, chestCm: 101, lengthIn: 28, lengthCm: 71, shoulderIn: 19, shoulderCm: 48 },
  { size: 'L', chestIn: 42, chestCm: 106, lengthIn: 29, lengthCm: 74, shoulderIn: 20, shoulderCm: 51 },
  { size: 'XL', chestIn: 44, chestCm: 112, lengthIn: 30, lengthCm: 76, shoulderIn: 21, shoulderCm: 53 },
  { size: '2XL', chestIn: 46, chestCm: 117, lengthIn: 31, lengthCm: 79, shoulderIn: 22, shoulderCm: 56 },
  { size: '3XL', chestIn: 48, chestCm: 122, lengthIn: 32, lengthCm: 81, shoulderIn: 23, shoulderCm: 58 },
];

const SIZE_SPECS: Record<string, { chest: string; length: string }> = {
  S: { chest: '38"', length: '27"' },
  M: { chest: '40"', length: '28"' },
  L: { chest: '42"', length: '29"' },
  XL: { chest: '44"', length: '30"' },
  '2XL': { chest: '46"', length: '31"' },
  '3XL': { chest: '48"', length: '32"' },
};

const PHONE_MODELS = [
  'iPhone 16 Pro Max',
  'iPhone 16 Pro',
  'iPhone 16',
  'iPhone 15 Pro Max',
  'iPhone 15 Pro',
  'iPhone 15',
  'iPhone 14 Pro Max',
  'iPhone 14',
  'iPhone 13',
  'Samsung Galaxy S24 Ultra',
  'Samsung Galaxy S24+',
  'Samsung Galaxy S24',
  'Samsung Galaxy S23 Ultra',
  'OnePlus 12',
  'OnePlus 11',
];

const PLACEMENT_OPTIONS = [
  { id: 'Front Print', label: 'Front Print', sub: 'Classic Chest / Center' },
  { id: 'Back Print', label: 'Back Print', sub: 'Oversized Streetwear Back' },
  { id: 'Both Sides (+₹149)', label: 'Both Sides (+₹149)', sub: 'Dual Placement (Front & Back)' },
];

export interface TrendingGraphic {
  id: string;
  title: string;
  tag: string;
  style: string;
  emoji: string;
  mockUrl: string;
}

export const TRENDING_GRAPHICS_VAULT: TrendingGraphic[] = [
  {
    id: 'cyber-kanji',
    title: 'Tokyo Cyber Mecha',
    tag: 'NEO-TOKYO',
    style: 'Cyberpunk Kanji & Mecha Core',
    emoji: '⚡',
    mockUrl: '/designs/tokyo-mecha.svg',
  },
  {
    id: 'acid-vintage-flame',
    title: 'Vintage Acid Flame',
    tag: 'HEAVY METAL',
    style: 'Washed Gothic Typography',
    emoji: '🔥',
    mockUrl: '/designs/acid-flame.svg',
  },
  {
    id: 'late-night-builder',
    title: 'Git Commit Dreams',
    tag: 'DEV MODE',
    style: 'Minimal Terminal Code Aesthetic',
    emoji: '💻',
    mockUrl: '/designs/git-commit.svg',
  },
  {
    id: 'y2k-dark-angel',
    title: 'Y2K Dark Angel',
    tag: 'STREET NOSTALGIA',
    style: 'Liquid Metal Grunge Aesthetic',
    emoji: '✨',
    mockUrl: '/designs/y2k-angel.svg',
  },
  {
    id: 'ink-samurai-splash',
    title: 'Monochrome Ronin',
    tag: 'JAPANESE INK',
    style: 'Ukiyo-e Brush Splatter',
    emoji: '⚔️',
    mockUrl: '/designs/ronin-ink.svg',
  },
  {
    id: 'minimal-creator-wave',
    title: 'The Great Ember Wave',
    tag: 'CREATOR DESK',
    style: 'Geometric Waveform Art',
    emoji: '🌊',
    mockUrl: '/designs/ember-wave.svg',
  },
];

export interface BundleSubItem {
  id: string;
  name: string;
  badge: string;
  emoji: string;
  plainImage: string;
  backImage?: string;
  printArea: {
    width: string;
    height: string;
    top: string;
    left: string;
    aspectRatio: string;
    safeZoneLabel: string;
  };
}

export const BUNDLE_SUB_ITEMS: Record<string, BundleSubItem[]> = {
  'bundle-creator-workstation': [
    {
      id: 'desk-mat',
      name: '900x400mm Extended Desk Mat',
      badge: 'Extended Surface',
      emoji: '🖥️',
      plainImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg',
      printArea: {
        width: '84%',
        height: '74%',
        top: '13%',
        left: '8%',
        aspectRatio: '16/9',
        safeZoneLabel: 'MAX PRINT AREA • 900 × 400 MM (MICRO-WEAVE)',
      },
    },
    {
      id: 'graphic-tee',
      name: '240 GSM Graphic Streetwear Tee',
      badge: 'Bio-Washed Cotton',
      emoji: '👕',
      plainImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/4ca57c05-41a5-45b1-9856-5c6ac1e7f33f.jpg',
      backImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/28/30c13fe2-0ca2-4f63-b857-7970c0c0a593.jpg',
      printArea: {
        width: '52%',
        height: '56%',
        top: '22%',
        left: '24%',
        aspectRatio: '3/4',
        safeZoneLabel: 'DTF SAFE PRINT ZONE • 16" × 20" (300 DPI)',
      },
    },
    {
      id: 'ceramic-mug',
      name: 'Artisan Ceramic Coffee Mug',
      badge: '11 Oz Stoneware',
      emoji: '☕',
      plainImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/26/b10e9b51-65a6-43f7-9e93-0e184c5853e9.jpg',
      printArea: {
        width: '42%',
        height: '46%',
        top: '27%',
        left: '29%',
        aspectRatio: '1/1',
        safeZoneLabel: 'CERAMIC WRAP ZONE • 8.5" × 3.5"',
      },
    },
  ],
  'bundle-streetwear-duo': [
    {
      id: 'oversized-tee',
      name: 'Heavyweight Oversized Tee',
      badge: '240 GSM Combed',
      emoji: '👕',
      plainImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/4ca57c05-41a5-45b1-9856-5c6ac1e7f33f.jpg',
      backImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/28/30c13fe2-0ca2-4f63-b857-7970c0c0a593.jpg',
      printArea: {
        width: '52%',
        height: '56%',
        top: '22%',
        left: '24%',
        aspectRatio: '3/4',
        safeZoneLabel: 'DTF SAFE PRINT ZONE • 16" × 20" (300 DPI)',
      },
    },
    {
      id: 'acid-wash-tee',
      name: 'Acid Wash Oversized Tee',
      badge: 'Vintage Mineral Wash',
      emoji: '👕',
      plainImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/44/df1b411b-46ec-4c8f-aa0d-75b796bcda00.jpg',
      backImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/286/84f8f6ae-6521-4be1-9e33-07110cf93ec9.jpg',
      printArea: {
        width: '52%',
        height: '56%',
        top: '22%',
        left: '24%',
        aspectRatio: '3/4',
        safeZoneLabel: 'ACID WASH DTF ZONE • 16" × 20" (300 DPI)',
      },
    },
  ],
  'bundle-winter-heavyweight': [
    {
      id: 'fleece-hoodie',
      name: '380 GSM Fleece Hoodie',
      badge: 'French Terry',
      emoji: '🔥',
      plainImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/82/ddc7518f-afc2-4370-8d1a-43db4863d356.jpg',
      backImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/118/7b58b1da-f241-4994-a5a2-f1a4ec2b5c94.jpg',
      printArea: {
        width: '46%',
        height: '44%',
        top: '28%',
        left: '27%',
        aspectRatio: '1/1',
        safeZoneLabel: 'HOODIE CHEST PRINT ZONE • 10" × 10"',
      },
    },
    {
      id: 'heavyweight-tee',
      name: '240 GSM Bio-Washed Tee',
      badge: 'Streetwear Drop',
      emoji: '👕',
      plainImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/4ca57c05-41a5-45b1-9856-5c6ac1e7f33f.jpg',
      backImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/28/30c13fe2-0ca2-4f63-b857-7970c0c0a593.jpg',
      printArea: {
        width: '52%',
        height: '56%',
        top: '22%',
        left: '24%',
        aspectRatio: '3/4',
        safeZoneLabel: 'DTF SAFE PRINT ZONE • 16" × 20" (300 DPI)',
      },
    },
  ],
  'bundle-founding-50': [
    {
      id: 'builder-tee',
      name: '240 GSM Founding Builder Tee',
      badge: 'Numbered Drop',
      emoji: '⚡',
      plainImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/4ca57c05-41a5-45b1-9856-5c6ac1e7f33f.jpg',
      backImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/28/30c13fe2-0ca2-4f63-b857-7970c0c0a593.jpg',
      printArea: {
        width: '52%',
        height: '56%',
        top: '22%',
        left: '24%',
        aspectRatio: '3/4',
        safeZoneLabel: 'DTF SAFE PRINT ZONE • 16" × 20" (300 DPI)',
      },
    },
    {
      id: 'precision-mat',
      name: '900x400mm Precision Desk Mat',
      badge: 'Precision Surface',
      emoji: '🖥️',
      plainImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg',
      printArea: {
        width: '84%',
        height: '74%',
        top: '13%',
        left: '8%',
        aspectRatio: '16/9',
        safeZoneLabel: 'MAX PRINT AREA • 900 × 400 MM (MICRO-WEAVE)',
      },
    },
  ],
};

interface Props {
  product: Product;
}

export function ProductClient({ product }: Props) {
  const router = useRouter();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { formatPrice: geoFormatPrice } = useGeo();
  const [qty, setQty] = useState(1);

  const isApparel =
    /tee|t-shirt|hoodie|sweatshirt|crop|jogger|sweatpant|shorts|jacket|vest|polo|dress|skirt|legging|romper/i.test(product.title + ' ' + product.id);

  const supportsPrintPlacement =
    /tee|t-shirt|hoodie|sweatshirt|jacket|polo|vest/i.test(product.title + ' ' + product.id);

  const isPhoneCase =
    /case|phone|iphone|samsung/i.test(product.title) ||
    /case|phone|iphone|samsung/i.test(product.id);

  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [sizeUnit, setSizeUnit] = useState<'in' | 'cm'>('in');
  const [selectedPhoneModel, setSelectedPhoneModel] = useState<string>(PHONE_MODELS[0]);
  const isComboProduct = Boolean(
    BUNDLE_SUB_ITEMS[product.id] ||
    (product.id.startsWith('bundle-') && product.images && product.images.length > 1)
  );

  const comboItems: BundleSubItem[] = BUNDLE_SUB_ITEMS[product.id] || (
    product.id.startsWith('bundle-') && product.images && product.images.length > 1
      ? product.images.slice(0, 3).map((img, i) => ({
          id: `combo-item-${i}`,
          name: `Combo Product ${i + 1}`,
          badge: 'Included in Bundle',
          emoji: '📦',
          plainImage: img,
          printArea: {
            width: '52%',
            height: '56%',
            top: '22%',
            left: '24%',
            aspectRatio: '3/4',
            safeZoneLabel: 'DTF SAFE PRINT ZONE',
          },
        }))
      : []
  );

  const [selectedComboItemIndex, setSelectedComboItemIndex] = useState<number>(0);
  const [bundleItemSizes, setBundleItemSizes] = useState<Record<number, string>>({
    0: 'L',
    1: 'L',
    2: 'L',
  });
  const [bundleItemGraphics, setBundleItemGraphics] = useState<Record<number, { title: string; image: string | null }>>({
    0: { title: 'Original Drop', image: null },
    1: { title: 'Original Drop', image: null },
    2: { title: 'Original Drop', image: null },
  });
  const [customPosX, setCustomPosX] = useState<number>(0);
  const [customPosY, setCustomPosY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startPosX: number; startPosY: number } | null>(null);

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPosX: customPosX,
      startPosY: customPosY,
    };
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    e.preventDefault();
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const pctX = (deltaX / 280) * 100;
    const pctY = (deltaY / 280) * 100;
    const newX = Math.round(Math.max(-42, Math.min(42, dragStartRef.current.startPosX + pctX)));
    const newY = Math.round(Math.max(-42, Math.min(42, dragStartRef.current.startPosY + pctY)));
    setCustomPosX(newX);
    setCustomPosY(newY);
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customMode, setCustomMode] = useState<'trending' | 'text' | 'image'>('trending');
  const [customText, setCustomText] = useState('');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customImageName, setCustomImageName] = useState<string>('');
  const [customPlacement, setCustomPlacement] = useState<string>('Center Chest');
  const [customTextColor, setCustomTextColor] = useState<string>('#ffffff');
  const [customFont, setCustomFont] = useState<string>('font-sans font-black tracking-wider uppercase');
  const [customPosition, setCustomPosition] = useState<'center' | 'pocket' | 'mural' | 'hem'>('center');
  const [customScale, setCustomScale] = useState<number>(100);
  const [customRotation, setCustomRotation] = useState<number>(0);
  const [customFlip, setCustomFlip] = useState<boolean>(false);
  const [customView, setCustomView] = useState<'front' | 'back'>('front');
  const [dualPlacement, setDualPlacement] = useState<boolean>(false);
  const [openAccordion, setOpenAccordion] = useState<'shipping' | 'care' | null>(null);

  const [uploadingArtwork, setUploadingArtwork] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('Please upload an image smaller than 15MB.');
      return;
    }
    setCustomImageName(file.name);

    // Instant local preview for zero UI latency
    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage in background for direct cloud URL in Qikink orders
    try {
      setUploadingArtwork(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data?.ok && data?.url) {
        setCustomImage(data.url);
      }
    } catch (err) {
      console.warn('[Artwork Upload] Local preview retained, background upload failed:', err);
    } finally {
      setUploadingArtwork(false);
    }
  };

  const handleRemoveImage = () => {
    setCustomImage(null);
    setCustomImageName('');
  };
  const [addedAlert, setAddedAlert] = useState(false);
  const galleryImages = resolveProductImages(
    product.id,
    product.image_url,
    product.category,
    product.images
  );
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Keyboard navigation for image gallery
  useEffect(() => {
    if (galleryImages.length <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedImgIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedImgIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryImages.length]);

  const validImage = galleryImages.find((_, idx) => !failedImages[idx]) || product.image_url || '';
  const currentSrc: string = !failedImages[selectedImgIndex] ? (galleryImages[selectedImgIndex] || validImage) : validImage;
  const showImage = Boolean((currentSrc && !failedImages[selectedImgIndex]) || validImage);
  const wished = has(product.id);

  const displayTitle = (product.title || '')
    .replace(/\|\s*[A-Z0-9]{2,6}/gi, '')
    .replace(/\b(qikink|ut58|cc32|ms65|fc38|fa30|uj31|fd16|ur50|ua22|ut27|mt45|ut68)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const titleLower = (displayTitle || '').toLowerCase();
  const idLower = (product.id || '').toLowerCase();

  const isHoodieOrSweatshirt = titleLower.includes('hoodie') || titleLower.includes('sweatshirt') || titleLower.includes('jacket') || idLower.includes('hoodie');
  const isCropTopOrPolySpandex = titleLower.includes('crop top') || titleLower.includes('aop') || idLower.includes('crop-top') || idLower.includes('tops-all-over-print') || titleLower.includes('poly-spandex');
  const isJerseyOrDryFit = titleLower.includes('jersey') || titleLower.includes('dry fit') || idLower.includes('jersey') || idLower.includes('dry-fit');
  const isDeskMat = titleLower.includes('desk') || titleLower.includes('pad') || titleLower.includes('mat') || idLower.includes('desk-mat');
  const isDrinkware = titleLower.includes('mug') || titleLower.includes('bottle') || titleLower.includes('tumbler') || idLower.includes('drinkware') || idLower.includes('mug');
  const isCoasterOrDecor = titleLower.includes('coaster') || titleLower.includes('puzzle') || titleLower.includes('poster') || titleLower.includes('frame') || idLower.includes('home-decor');
  const isCottonTee = isApparel && !isHoodieOrSweatshirt && !isCropTopOrPolySpandex && !isJerseyOrDryFit;

  const blankGarmentImage = (() => {
    if (isHoodieOrSweatshirt) {
      return customView === 'back'
        ? 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/118/7b58b1da-f241-4994-a5a2-f1a4ec2b5c94.jpg'
        : 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/82/ddc7518f-afc2-4370-8d1a-43db4863d356.jpg';
    }
    if (isDeskMat) {
      return 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg';
    }
    if (isDrinkware) {
      return 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/26/b10e9b51-65a6-43f7-9e93-0e184c5853e9.jpg';
    }
    if (isCottonTee || isApparel) {
      return customView === 'back'
        ? 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/28/30c13fe2-0ca2-4f63-b857-7970c0c0a593.jpg'
        : 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/4ca57c05-41a5-45b1-9856-5c6ac1e7f33f.jpg';
    }
    return customView === 'back' && galleryImages.length > 1 ? galleryImages[1] : (galleryImages[0] || currentSrc);
  })();

  const activeComboItem: BundleSubItem | null =
    isComboProduct && comboItems.length > 0 ? comboItems[selectedComboItemIndex] || comboItems[0] : null;

  const activeItemTitle = activeComboItem ? activeComboItem.name : displayTitle;
  const activeItemId = activeComboItem ? activeComboItem.id : product.id;
  const activeItemLower = (activeItemTitle + ' ' + activeItemId).toLowerCase();

  const activeItemIsApparel = activeComboItem
    ? /tee|t-shirt|hoodie|sweatshirt|crop|jogger|sweatpant|shorts|jacket|vest|polo/i.test(activeItemLower)
    : isApparel;
  const activeItemIsHoodie = /hoodie|sweatshirt|jacket/i.test(activeItemLower);
  const activeItemIsDeskMat = /desk|pad|mat/i.test(activeItemLower);
  const activeItemIsDrinkware = /mug|cup|bottle|tumbler|drinkware/i.test(activeItemLower);
  const activeItemIsPhoneCase = /case|phone|iphone/i.test(activeItemLower);

  const activeStudioImage = activeComboItem
    ? (customView === 'back' && activeComboItem.backImage ? activeComboItem.backImage : activeComboItem.plainImage)
    : blankGarmentImage;

  const activePrintZone = activeComboItem?.printArea || {
    width: '52%',
    height: '56%',
    top: '22%',
    left: '24%',
    aspectRatio: '3/4',
    safeZoneLabel: 'DTF SAFE PRINT ZONE • 16" × 20" (300 DPI)',
  };

  const relatedIds = bundles[product.id] ?? [];
  const related = relatedIds
    .map((id) => getProduct(id))
    .filter((p): p is Product => Boolean(p));

  const cleanSubtitle = (() => {
    const raw = product.short?.trim() || '';
    if (!raw) {
      if (isHoodieOrSweatshirt) return '380 GSM Heavyweight French Terry Fleece with Archival DTF Screen Print.';
      if (isCropTopOrPolySpandex) return '220 GSM 4-Way Stretch Poly-Spandex with Archival All-Over Print.';
      if (isJerseyOrDryFit) return '180 GSM Quick-Dry Honeycomb Mesh with Embedded Sublimation Print.';
      if (isDeskMat) return '900x400mm Extended Workstation Mat with Precision Micro-Weave Surface.';
      if (isDrinkware) return '330ml Gloss Ceramic Stoneware with High-Definition Sublimation Print.';
      if (isPhoneCase) return 'Dual-Layer Impact Polycarbonate Case with Raised Protective Bezel.';
      if (isCottonTee) return '240 GSM Super Combed Bio-Washed Cotton with Archival DTF Screen Print.';
      return 'Handpicked verified domestic quality with fast express dispatch across India.';
    }
    let s = raw.replace(/[-–—\s]+$/, '').replace(/,\s*(?:pr|pre|bio|and|with|for)$/i, '').replace(/\s+(?:bio|Rar|pr|as a Rar)$/i, '');
    if (s && !/[.!?]$/.test(s)) s += '.';
    return s;
  })();

  const cleanStory = (() => {
    const story = product.story?.trim() || '';
    if (!story) {
      if (isHoodieOrSweatshirt) {
        return 'Crafted in Tirupur with premium 380 GSM combed cotton fleece and archival DTF print execution. Dispatched via tier-1 domestic express couriers (BlueDart & Delhivery) with comprehensive 7-day replacement guarantee.';
      }
      if (isCropTopOrPolySpandex) {
        return 'Crafted in small batches at our Tirupur studio for everyday comfort and durability. Featuring 220 GSM 4-way stretch poly-spandex with vibrant, fade-proof all-over print artwork and tailored athletic stitching.';
      }
      if (isJerseyOrDryFit) {
        return 'Authentic breathable mesh athletic jersey engineered for pitch performance and streetwear layering. Features rich sublimation graphics, lightweight ventilation, and durable athletic seams.';
      }
      if (isDeskMat) {
        return 'Engineered for developers and gamers. Features a 900x400mm micro-weave surface for pixel-perfect sensor tracking, reinforced anti-fray edges, and a textured anti-slip rubber base.';
      }
      if (isDrinkware) {
        return 'Triple-fired 330ml gloss ceramic stoneware with food-grade sublimation glaze. Microwave and dishwasher safe, packaged in shock-resistant protective thermocol casing.';
      }
      return 'Crafted in Tirupur with premium bio-washed materials and archival print execution. Dispatched via tier-1 domestic express couriers (BlueDart & Delhivery) with comprehensive 7-day replacement guarantee.';
    }
    let s = story.replace(/[-–—\s]+$/, '').replace(/,\s*(?:pr|pre|bio|and|with|for)$/i, '').replace(/\s+(?:bio|Rar|pr|as a Rar)$/i, '');
    if (s && !/[.!?]$/.test(s)) s += '.';
    return s;
  })();

  const featureHighlights = (() => {
    if (isHoodieOrSweatshirt) {
      return [
        '380 GSM Heavyweight 100% Combed Cotton French Terry Fleece',
        'Double-Lined Structured Hood with Heavy-Duty Matching Drawcords',
        'Derby Ribbed Anti-Sag Hem & Cuffs with Reinforced Stitching',
        '1200 DPI High-Density Archival DTF Screen Print (50+ Wash Tested)',
        'Pre-Shrunk Silicone Soft-Wash Treated for Zero Shrinkage',
        'Pan-India Tracked 2–4 Day Express Delivery via BlueDart & Delhivery',
      ];
    }
    if (isCropTopOrPolySpandex) {
      return [
        '220 GSM 4-Way Stretch Breathable Poly-Spandex Blend',
        'Archival Edge-to-Edge All-Over Print (AOP) with Zero Cracking',
        'Tailored Athletic Fit with Reinforced Anti-Chafe Flatlock Seams',
        'Quick-Drying & Moisture-Wicking Performance Fabric',
        'Non-Pilling & Shape-Retaining Elastic Memory',
        'Fast 2–4 Day Express Dispatch with 100% Doorstep 7-Day Replacement',
      ];
    }
    if (isJerseyOrDryFit) {
      return [
        '180 GSM Honeycomb Micro-Mesh Quick-Dry Performance Polyester',
        'Vibrant Sublimation Graphics (Embedded in Fiber, Never Fades)',
        'Athletic Ribbed Collar & Armhole Construction for Dynamic Motion',
        'High-Ventilation Moisture-Wicking Fiber Matrix',
        'Engineered for Heavy Sweating, Gym Workouts & Street Styling',
        'Pan-India Tracked 2–4 Day Express Delivery via BlueDart & Delhivery',
      ];
    }
    if (isDeskMat) {
      return [
        '900x400mm Extended Workstation & Gaming Format (4mm Ultra-Thick)',
        'High-Density Micro-Weave Polyester Glide Surface for Precision Tracking',
        'Anti-Slip Natural Textured Vulcanized Rubber Base',
        '360° Anti-Fray Reinforced Double-Stitched Edges',
        'Spill-Resistant Water-Repellent Coating (Easy Wipe Clean)',
        'Dispatched in Heavy-Duty Triangular Protective Tube Packaging',
      ];
    }
    if (isDrinkware) {
      return [
        '330ml High-Grade Triple-Fired Gloss Ceramic Stoneware',
        '100% Microwave & Dishwasher Safe (Certified Food-Grade)',
        '1200 DPI High-Gloss Sublimation Print with Rich Deep Color',
        'Ergonomic Comfort Grip Handle & Chip-Resistant Rim',
        'Thermally Retentive Walls (Keeps Coffee & Tea Hot Longer)',
        'Dispatched in Anti-Shock Thermocol Double-Box Packaging',
      ];
    }
    if (isPhoneCase) {
      return [
        'Dual-Layer Impact-Resistant Polycarbonate Shell with Inner TPU Cushion',
        '360° Raised Bezel Protects Screen & Camera Lenses',
        'Precision Port Cutouts with Responsive Button Covers',
        'Qi Wireless Charging & MagSafe Compatible',
        'High-Resolution Sublimation Print Wrapping Around Sides',
        'Scratch-Resistant Matte Finish with 7-Day Doorstep Replacement',
      ];
    }
    if (isCoasterOrDecor) {
      return [
        'High-Density Rigid Material with High-Gloss Non-Fade Finish',
        'Heat & Moisture Resistant OEKO-TEX Certified UV Print',
        'Anti-Scratch Non-Slip Cork Base Layer Protects Furniture',
        'Precision Laser-Polished Beveled Edges',
        'Dispatched in Rare Ember Studio Presentation Box',
        'Pan-India 2–4 Day Express Delivery with Live Real-Time Tracking',
      ];
    }
    return [
      '240 GSM Super Combed 100% Bio-Washed Cotton Heavyweight Jersey',
      'Relaxed Drop-Shoulder Oversized Streetwear Silhouette',
      '1.25-Inch Lycra Ribbed Anti-Sag Neckband with Reinforced Collar',
      '1200 DPI Direct-to-Film (DTF) Archival Print with Zero Cracking',
      'Pre-Shrunk & Colorfast Treated for 50+ Wash Color Longevity',
      'Fast 2–4 Day Express Dispatch with 100% Doorstep 7-Day Replacement',
    ];
  })();

  const baseInr = product.price_inr || (product.price >= 80 ? product.price : Math.round(product.price * 85));
  const customizationFeeInr = isCustomizing && supportsPrintPlacement && customPlacement.includes('Both Sides') ? 149 : 0;
  const effectiveInr = baseInr + customizationFeeInr;
  const effectivePriceUsd = Number((effectiveInr / 85).toFixed(2));

  // Anchor M.R.P. mathematically so it is never broken, never divides by 100 or passes small USD numbers
  const mrpInr = (() => {
    if (product.old_price && product.old_price > baseInr) return Math.round(product.old_price);
    if (product.compare_at_price && product.compare_at_price > baseInr) return Math.round(product.compare_at_price);
    if (product.compareAtPrice && product.compareAtPrice > baseInr) return Math.round(product.compareAtPrice);
    if (product.compareAtPrice && product.compareAtPrice * 85 > baseInr) return Math.round(product.compareAtPrice * 85);
    if (product.compare_at_price && product.compare_at_price * 85 > baseInr) return Math.round(product.compare_at_price * 85);
    const raw = Math.round(baseInr / 0.56);
    return Math.round(raw / 100) * 100 - 1; // e.g. 1599, 999, 2199
  })();
  const mrpUsd = Number((mrpInr / 85).toFixed(2));
  const discountPercent = Math.max(15, Math.min(75, Math.round((1 - baseInr / mrpInr) * 100)));

  const isMultiBundle = isComboProduct && comboItems.length > 1;
  const bundleSizeSummary = isMultiBundle
    ? comboItems.map((item, idx) => `${item.name.split(' ')[0]}: ${bundleItemSizes[idx] || 'L'}`).join(', ')
    : (isApparel ? selectedSize : undefined);

  const bundleGraphicSummary = isMultiBundle
    ? comboItems.map((item, idx) => `${item.name.split(' ')[0]}: ${bundleItemGraphics[idx]?.title || 'Standard'}`).join(', ')
    : ((customMode === 'image' || customMode === 'trending') && customImageName ? customImageName : undefined);

  const getItemMeta = () => ({
    title: displayTitle,
    price: effectivePriceUsd,
    price_inr: effectiveInr,
    emoji: product.emoji,
    imageUrl: currentSrc || product.image_url,
    selectedStyle: isMultiBundle ? bundleGraphicSummary : undefined,
    gradient: product.gradient,
    size: bundleSizeSummary,
    phoneModel: isPhoneCase ? selectedPhoneModel : undefined,
    customText: isCustomizing && customMode === 'text' && customText.trim() ? customText.trim() : undefined,
    customPlacement: isCustomizing && supportsPrintPlacement
      ? (dualPlacement ? 'Both Sides (+₹149)' : customView === 'back' ? 'Back Print' : 'Front Print')
      : undefined,
    customPosition: isCustomizing ? (customPosX === 0 && customPosY === 0 ? 'center' : `${customPosX}%x${customPosY}%`) : undefined,
    customPosX: isCustomizing && customPosX !== 0 ? customPosX : undefined,
    customPosY: isCustomizing && customPosY !== 0 ? customPosY : undefined,
    customScale: isCustomizing ? customScale : undefined,
    customRotation: isCustomizing && customRotation !== 0 ? customRotation : undefined,
    customFlip: isCustomizing && customFlip ? true : undefined,
    customTextColor: isCustomizing && customMode === 'text' ? customTextColor : undefined,
    customFont: isCustomizing && customMode === 'text' ? customFont : undefined,
    customImage: (customMode === 'image' || customMode === 'trending') && customImage ? customImage : undefined,
    customImageName: bundleGraphicSummary,
    customizedItemName: isComboProduct && activeComboItem ? activeComboItem.name : undefined,
  });

  // Telemetry: track view_item on mount
  useEffect(() => {
    trackViewItem({
      id: product.id,
      title: displayTitle,
      price: effectiveInr,
      qty: 1,
      category: isApparel ? 'Apparel / Streetwear' : 'Lifestyle / Desk Gear',
      variant: isApparel ? selectedSize : undefined,
    });
  }, [product.id]);

  const handleAddToCart = () => {
    add(product.id, qty, getItemMeta());
    trackAddToCart({
      id: product.id,
      title: displayTitle,
      price: effectiveInr,
      qty,
      category: isApparel ? 'Apparel / Streetwear' : 'Lifestyle / Desk Gear',
      variant: isApparel ? selectedSize : undefined,
    });
    setAddedAlert(true);
    setTimeout(() => setAddedAlert(false), 2500);
  };

  const handleOrderNow = () => {
    add(product.id, qty, getItemMeta());
    trackAddToCart({
      id: product.id,
      title: displayTitle,
      price: effectiveInr,
      qty,
      category: isApparel ? 'Apparel / Streetwear' : 'Lifestyle / Desk Gear',
      variant: isApparel ? selectedSize : undefined,
    });
    router.push('/checkout');
  };

  return (
    <main className="page-top pb-28 md:pb-12" style={{ background: '#fffbf5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem)' }}>
        <Link href="/shop" style={{ color: '#8a7b6b', fontWeight: 700, textDecoration: 'none' }}>
          ← Explore Catalog
        </Link>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%, 320px),1fr))',
            gap: 'clamp(1.25rem, 3vw, 2.5rem)',
            marginTop: '1.25rem',
            alignItems: 'start',
          }}
        >
          {/* Multi-Image Interactive Gallery (Sticky on Desktop Scroll) */}
          <div className="lg:sticky lg:top-24 lg:self-start" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                aspectRatio: '1',
                background: product.gradient || '#f8fafc',
                borderRadius: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.07)',
                border: '1px solid rgba(0,0,0,0.06)',
                touchAction: 'pan-y',
              }}
              onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchStartX === null || galleryImages.length <= 1) return;
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;
                if (diff > 40) {
                  setSelectedImgIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
                } else if (diff < -40) {
                  setSelectedImgIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
                }
                setTouchStartX(null);
              }}
            >
              {showImage && currentSrc ? (
                <Image
                  key={isCustomizing && activeStudioImage ? activeStudioImage : currentSrc}
                  src={isCustomizing && activeStudioImage ? activeStudioImage : currentSrc}
                  alt={`${product.title} - Photo ${selectedImgIndex + 1}`}
                  fill
                  priority={selectedImgIndex === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover', transition: 'opacity 0.25s ease-in-out' }}
                  onError={() => setFailedImages((prev) => ({ ...prev, [selectedImgIndex]: true }))}
                />
              ) : (
                <span style={{ fontSize: '6rem', filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.15))' }}>
                  {product.emoji}
                </span>
              )}

              {/* LIVE FINISHED STREETWEAR GRAPHIC & PERSONALIZATION OVERLAY */}
              {(isCustomizing || (isApparel && customImage)) && (
                <div
                  style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    zIndex: 10,
                    transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    top: activePrintZone.top,
                    left: activePrintZone.left,
                    width: activePrintZone.width,
                    height: activePrintZone.height,
                  }}
                >
                  {/* Print Safety Margin Frame (Only visible when studio is open) */}
                  {isCustomizing && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        border: '1.5px dashed rgba(255, 77, 36, 0.8)',
                        borderRadius: '0.75rem',
                        background: 'rgba(255, 77, 36, 0.05)',
                        boxShadow: '0 0 16px rgba(255, 77, 36, 0.2)',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: '-0.75rem',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#FF4D24',
                          color: '#ffffff',
                          fontSize: '9px',
                          fontWeight: 900,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          letterSpacing: '0.05em',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                        }}
                      >
                        ⚡ RareEmber™ Studio ({customPlacement})
                      </span>
                    </div>
                  )}

                  {/* Live Text Overlay */}
                  {customMode === 'text' && isCustomizing && (
                    <div
                      className={customFont}
                      style={{
                        color: customTextColor,
                        fontSize: `clamp(13px, ${(customScale / 100) * 3.5}vw, 36px)`,
                        lineHeight: 1.15,
                        textShadow:
                          customTextColor.toLowerCase() === '#ffffff'
                            ? '0 2px 8px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.95)'
                            : '0 2px 8px rgba(255,255,255,0.45)',
                        maxWidth: '92%',
                        wordBreak: 'break-word',
                        userSelect: 'none',
                        transform: `translate(${customPosX}%, ${customPosY}%) scale(${customScale / 100}) rotate(${customRotation}deg) scaleX(${customFlip ? -1 : 1})`,
                        transition: isDragging ? 'none' : 'transform 0.15s ease',
                      }}
                    >
                      {customText.trim() || 'RARE EMBER'}
                    </div>
                  )}

                  {/* Live Uploaded or Curated Trending Image Overlay */}
                  {(customMode === 'image' || customMode === 'trending' || !isCustomizing) && customImage && (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: `translate(${customPosX}%, ${customPosY}%) scale(${customScale / 100}) rotate(${customRotation}deg) scaleX(${customFlip ? -1 : 1})`,
                        transition: isDragging ? 'none' : 'transform 0.15s ease',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={customImage}
                        alt="Custom print design"
                        style={{
                          maxWidth: '90%',
                          maxHeight: '90%',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.5))',
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Live Status Simulation Pill */}
              {isCustomizing && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    background: 'rgba(22, 19, 17, 0.92)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 77, 36, 0.45)',
                    color: '#fff',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    zIndex: 12,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '9999px',
                      background: '#FF4D24',
                    }}
                  />
                  <span>Live RareEmber™ Studio 3D Simulation</span>
                </div>
              )}

              {/* Photo Count Pill */}
              {galleryImages.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    zIndex: 2,
                  }}
                >
                  <span>📷</span>
                  <span>{selectedImgIndex + 1} / {galleryImages.length}</span>
                </div>
              )}

              {/* Previous / Next Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImgIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
                    }}
                    aria-label="Previous photo"
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(6px)',
                      color: '#0f172a',
                      border: '1px solid rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                      transition: 'transform 0.15s ease, background 0.15s ease',
                      zIndex: 3,
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImgIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
                    }}
                    aria-label="Next photo"
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(6px)',
                      color: '#0f172a',
                      border: '1px solid rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                      transition: 'transform 0.15s ease, background 0.15s ease',
                      zIndex: 3,
                    }}
                  >
                    ›
                  </button>
                </>
              )}

              {product.chapter && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1.2rem',
                    fontWeight: 900,
                    fontSize: '2rem',
                    color: 'rgba(0,0,0,0.06)',
                    pointerEvents: 'none',
                  }}
                >
                  {product.chapter}
                </span>
              )}
            </div>

            {/* Clickable Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div style={{ marginTop: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', padding: '0 0.15rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#161311' }}>
                    Product Photos &amp; Angles
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#78716c', fontWeight: 600 }}>
                    Tap to preview angle
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    overflowX: 'auto',
                    padding: '0.25rem 0.1rem',
                    scrollbarWidth: 'none',
                  }}
                >
                {galleryImages.map((imgUrl: string, idx: number) => {
                  if (failedImages[idx]) return null;
                  const isSelected = idx === selectedImgIndex;
                  return (
                    <div
                      key={imgUrl + idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.35rem',
                        flexShrink: 0,
                      }}
                    >
                      <button
                        onClick={() => setSelectedImgIndex(idx)}
                        aria-label={`View photo ${idx + 1}`}
                        style={{
                          position: 'relative',
                          width: '4.75rem',
                          height: '4.75rem',
                          borderRadius: '0.85rem',
                          overflow: 'hidden',
                          border: isSelected ? '2.5px solid #ff6b35' : '1.5px solid rgba(0,0,0,0.1)',
                          transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                          boxShadow: isSelected ? '0 4px 12px rgba(255,107,53,0.25)' : 'none',
                          cursor: 'pointer',
                          padding: 0,
                          background: '#f1f5f9',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        <Image
                          src={imgUrl}
                          alt={`${product.title} thumbnail ${idx + 1}`}
                          fill
                          sizes="80px"
                          style={{ objectFit: 'cover' }}
                          onError={() => setFailedImages((prev) => ({ ...prev, [idx]: true }))}
                        />
                      </button>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: isSelected ? 800 : 600,
                          color: isSelected ? '#ff4d24' : '#64748b',
                          letterSpacing: '0.01em',
                        }}
                      >
                        {idx === 0 ? 'Hero View' : `Angle ${idx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </div>

          <div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span
                style={{
                  padding: '0.35rem 0.9rem',
                  borderRadius: '9999px',
                  background: product.tagBg || 'rgba(255,107,53,0.12)',
                  color: product.tagColor || '#ff6b35',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {product.tag || (isHoodieOrSweatshirt ? '380 GSM FLEECE' : isCropTopOrPolySpandex ? '220 GSM POLY-SPANDEX' : isJerseyOrDryFit ? '180 GSM QUICK-DRY' : isDeskMat ? 'EXTENDED 900×400MM' : isDrinkware ? 'CERAMIC STONEWARE' : isCottonTee ? '240 GSM HEAVYWEIGHT' : 'FLAGSHIP DROP')}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.75rem,3.5vw,2.75rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.25 }}>
              {displayTitle}
            </h1>
            <p style={{ color: '#52453e', marginTop: '0.6rem', lineHeight: 1.6, fontSize: '0.98rem', fontWeight: 500 }}>
              {cleanSubtitle}
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#212121' }}>
                {geoFormatPrice(effectivePriceUsd, effectiveInr)}
              </span>
              <span style={{ color: '#8a7b6b', textDecoration: 'line-through', fontSize: '1.05rem', fontWeight: 500 }}>
                M.R.P.: {geoFormatPrice(mrpUsd, mrpInr)}
              </span>
              <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.95rem', background: '#ecfdf5', padding: '0.2rem 0.55rem', borderRadius: '0.5rem', border: '1px solid #a7f3d0' }}>
                {discountPercent}% OFF
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                ✓ 100% Genuine Quality
              </span>
            </div>

            {/* Real Honest Inventory & Verification Badges */}
            {(() => {
              const isOutOfStock = (product as any).active === false || ((product as any).stock != null && Number((product as any).stock) <= 0);
              return (
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                  {!isOutOfStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 font-semibold border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> In Stock • Ready to Dispatch (Domestic Hub)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-800 font-bold border border-rose-500/20">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Temporarily Out of Stock • Restocking Soon
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-800 font-semibold border border-blue-500/20">
                    <span>🛡️</span> 100% Genuine & Quality Tested
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 font-semibold border border-amber-500/20">
                    <span>🚚</span> 2–4 Days Express Pan-India
                  </span>
                </div>
              );
            })()}

            {/* Key Highlights */}
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8a7b6b', marginBottom: '0.6rem' }}>
                Product Highlights & Specs
              </div>
              <ul style={{ display: 'grid', gap: '0.45rem', color: '#443731', fontSize: '0.88rem' }}>
                {featureHighlights.map((d) => (
                  <li key={d} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#059669', fontWeight: 900, flexShrink: 0 }}>✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ======================================================== */}
            {/* THE NEW "EASY + POWERFUL" 3-STEP CONFIGURATOR            */}
            {/* ======================================================== */}

            {/* STEP 1: UNIFIED BUNDLE ITEM TABS (Only for Combos) */}
            {isComboProduct && comboItems.length > 1 && (
              <div className="mt-5 p-3.5 rounded-2xl bg-neutral-900 text-white border border-white/10 shadow-lg">
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#FF9A3D] flex items-center gap-1.5">
                    <span>📦</span>
                    <span>Step 1: Customize Combo Items ({selectedComboItemIndex + 1}/{comboItems.length})</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-bold">
                    Tap to select item to configure
                  </span>
                </div>
                <div className={`grid gap-2 ${comboItems.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {comboItems.map((item, idx) => {
                    const isCurrent = selectedComboItemIndex === idx;
                    const itemLower = (item.name + ' ' + item.id).toLowerCase();
                    const itemIsApp = /tee|t-shirt|hoodie|sweatshirt|crop|jogger|jacket|polo/i.test(itemLower);
                    const itemIsMat = /desk|pad|mat/i.test(itemLower);
                    const itemIsMug = /mug|cup|bottle/i.test(itemLower);

                    const itemSpecLabel = itemIsApp
                      ? `Size: ${bundleItemSizes[idx] || 'L'}`
                      : itemIsMat
                      ? '900×400mm'
                      : itemIsMug
                      ? '330ml'
                      : 'Standard';

                    const itemGraphicTitle = bundleItemGraphics[idx]?.title || 'Original Drop';

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedComboItemIndex(idx);
                          setSelectedSize(bundleItemSizes[idx] || 'L');
                          const g = bundleItemGraphics[idx];
                          if (g) {
                            setCustomImage(g.image);
                            setCustomImageName(g.title);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-[#FF4D24] bg-[#FF4D24]/15 ring-2 ring-[#FF4D24]/60 text-white shadow-md'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 font-black text-xs truncate">
                            <span>{item.emoji}</span>
                            <span className="truncate">{idx + 1}. {item.name}</span>
                          </div>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${isCurrent ? 'bg-[#FF4D24] text-white' : 'bg-white/10 text-neutral-400'}`}>
                            {isCurrent ? '● ACTIVE' : 'EDIT'}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold mt-1.5 text-neutral-300 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[#FF9A3D] font-extrabold">{itemSpecLabel}</span>
                          <span className="text-neutral-500">•</span>
                          <span className="truncate max-w-[150px] text-neutral-300">{itemGraphicTitle}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: SMART SIZE & FIT SELECTOR (Item-Aware) */}
            <div className="mt-4">
              {activeItemIsApparel ? (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                      <span>📏</span>
                      <span>Step 2: Select Size {isComboProduct && activeComboItem ? `for ${activeComboItem.name}` : ''}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(true)}
                      className="text-xs font-bold text-[#FF4D24] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                    >
                      <span>📏 Size Guide &amp; Fit Advice ↗</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-1.5">
                    {SIZES.map((s) => {
                      const isSelected = selectedSize === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setSelectedSize(s);
                            if (isComboProduct) {
                              setBundleItemSizes((prev) => ({ ...prev, [selectedComboItemIndex]: s }));
                            }
                          }}
                          className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[50px] ${
                            isSelected
                              ? 'bg-neutral-900 text-white border-2 border-[#FF4D24] shadow-md'
                              : 'bg-white text-neutral-800 border border-black/10 hover:border-black/25'
                          }`}
                        >
                          <span className="text-sm font-black">{s}</span>
                          <span className={`text-[9px] font-bold ${isSelected ? 'text-[#FF9A3D]' : 'text-neutral-500'}`}>
                            {SIZE_SPECS[s]?.chest || ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-[#FF4D24]">⚡ Drop-Shoulder Oversized Fit:</span>
                    <span>
                      Size <strong>{selectedSize}</strong> ({SIZE_SPECS[selectedSize]?.chest || 'Standard'} Chest) • {
                        activeItemIsHoodie
                          ? '380 GSM Heavyweight French Terry Fleece (Structured Boxy Silhouette).'
                          : isCropTopOrPolySpandex
                          ? '220 GSM Poly-Spandex 4-Way Stretch (Tailored Athletic Fit).'
                          : isJerseyOrDryFit
                          ? '180 GSM Honeycomb Quick-Dry Mesh (Breathable Performance Matrix).'
                          : '240 GSM Super Combed Bio-Washed Cotton (Pre-Shrunk Streetwear Drop).'
                      }
                    </span>
                  </p>
                </div>
              ) : activeItemIsDeskMat ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                  <span className="text-2xl shrink-0">🖥️</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
                        Step 2: Standard Extended Dimensions
                      </span>
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        ONE SIZE
                      </span>
                    </div>
                    <p className="text-xs font-black text-neutral-900 mt-0.5">
                      900 × 400 × 3 mm • Stitched Edge Micro-Weave
                    </p>
                    <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                      ✓ Standard Extended Size: Fits full keyboard + mouse with high-density tracking surface and vulcanized non-slip rubber base.
                    </p>
                  </div>
                </div>
              ) : activeItemIsDrinkware ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                  <span className="text-2xl shrink-0">☕</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
                        Step 2: Standard Ceramic Stoneware
                      </span>
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        330 ML (11 OZ)
                      </span>
                    </div>
                    <p className="text-xs font-black text-neutral-900 mt-0.5">
                      Triple-Fired Gloss Ceramic Mug • Microwave &amp; Dishwasher Safe
                    </p>
                    <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                      ✓ Certified food-grade stoneware with ergonomic comfort grip handle and chip-resistant rim.
                    </p>
                  </div>
                </div>
              ) : activeItemIsPhoneCase ? (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-500 mb-1.5">
                    Step 2: Select Phone Model
                  </label>
                  <select
                    value={selectedPhoneModel}
                    onChange={(e) => setSelectedPhoneModel(e.target.value)}
                    className="w-full p-3 rounded-xl border border-black/15 bg-white text-neutral-900 font-bold text-sm cursor-pointer"
                  >
                    {PHONE_MODELS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-neutral-100 border border-black/10 text-xs text-neutral-600 font-semibold">
                  ✓ Standard Calibrated One-Size Item Specification
                </div>
              )}
            </div>

            {/* STEP 3: TWO-MODE ARTWORK SELECTOR (PROGRESSIVE DISCLOSURE) */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <span>🎨</span> Step 3: Artwork &amp; Personalization
                </span>
                {isCustomizing && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FF4D24] bg-[#FF4D24]/10 px-2.5 py-0.5 rounded-full border border-[#FF4D24]/30">
                    RareEmber™ Lab Active
                  </span>
                )}
              </div>

              {/* 2-Pill Progressive Disclosure Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-2xl border border-black/5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomizing(false);
                    setCustomImage(null);
                    setCustomImageName('');
                    setCustomText('');
                    if (isComboProduct) {
                      setBundleItemGraphics((prev) => ({
                        ...prev,
                        [selectedComboItemIndex]: { title: 'Original Drop', image: null },
                      }));
                    }
                  }}
                  className={`py-3 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    !isCustomizing
                      ? 'bg-neutral-900 text-white shadow-md'
                      : 'text-neutral-600 hover:text-neutral-900 bg-transparent'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${!isCustomizing ? 'bg-emerald-400' : 'bg-neutral-400'}`} />
                  <span>Keep Original Drop</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCustomizing(true);
                    if (!customImage && !customText.trim() && TRENDING_GRAPHICS_VAULT[0]) {
                      setCustomImage(TRENDING_GRAPHICS_VAULT[0].mockUrl);
                      setCustomImageName(TRENDING_GRAPHICS_VAULT[0].title);
                      if (isComboProduct) {
                        setBundleItemGraphics((prev) => ({
                          ...prev,
                          [selectedComboItemIndex]: { title: TRENDING_GRAPHICS_VAULT[0].title, image: TRENDING_GRAPHICS_VAULT[0].mockUrl },
                        }));
                      }
                    }
                  }}
                  className={`py-3 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isCustomizing
                      ? 'bg-gradient-to-r from-[#FF4D24] to-[#E8244B] text-white shadow-md'
                      : 'text-neutral-600 hover:text-neutral-900 bg-transparent'
                  }`}
                >
                  <span>🎨</span>
                  <span>Customize Print / Logo</span>
                </button>
              </div>

              {/* RARE EMBER™ CUSTOM LAB (REVEALED WHEN CUSTOMIZE IS TAPPED) */}
              {isCustomizing && (
                <div className="mt-3 p-4 md:p-5 rounded-3xl bg-[#0c0b0a] text-white border-2 border-[#FF4D24] shadow-[0_20px_50px_rgba(255,77,36,0.18)] space-y-4">
                  {/* Studio Header Bar */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        RareEmber™ Custom Lab
                      </span>
                      <span className="text-[10px] font-bold text-[#FF9A3D] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                        {activeComboItem ? activeComboItem.name : displayTitle}
                      </span>
                    </div>

                    {/* View Angle Switcher for Apparel */}
                    {((!activeComboItem && supportsPrintPlacement) || (activeComboItem && activeComboItem.backImage)) && (
                      <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setCustomView('front');
                            if (customPlacement === 'Oversized Back') setCustomPlacement('Center Chest');
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            customView === 'front' ? 'bg-[#FF4D24] text-white' : 'text-neutral-300 hover:text-white'
                          }`}
                        >
                          Front
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomView('back');
                            setCustomPlacement('Oversized Back');
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            customView === 'back' ? 'bg-[#FF4D24] text-white' : 'text-neutral-300 hover:text-white'
                          }`}
                        >
                          Back
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 3D Garment Viewport with Authentic Blank Garment Mockup & Safe Print Zone */}
                  <div className="relative aspect-square w-full max-w-[320px] md:max-w-[360px] mx-auto rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 flex items-center justify-center shadow-inner select-none">
                    <Image
                      src={activeStudioImage}
                      alt={activeComboItem ? activeComboItem.name : displayTitle}
                      fill
                      sizes="360px"
                      className="object-cover pointer-events-none"
                    />

                    {/* RareEmber Safe Print Zone (Dashed Boundary) */}
                    <div
                      className="absolute pointer-events-none z-10 transition-all duration-200"
                      style={{
                        top: activePrintZone.top,
                        left: activePrintZone.left,
                        width: activePrintZone.width,
                        height: activePrintZone.height,
                      }}
                    >
                      <div className="absolute inset-0 border-2 border-dashed border-[#FF4D24]/80 rounded-xl pointer-events-none bg-[#FF4D24]/[0.03]">
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#FF4D24] text-[8px] font-black uppercase text-white tracking-wider whitespace-nowrap shadow-sm">
                          {activePrintZone.safeZoneLabel}
                        </span>
                      </div>

                      {/* Render Active Graphic or Text in Validated Preset Position */}
                      {(customImage || (customMode === 'text' && customText.trim())) && (
                        <div
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          style={{
                            transform: `translate(${customPosX}%, ${customPosY}%) scale(${customScale / 100})`,
                            transition: 'transform 0.2s ease',
                          }}
                        >
                          {customMode === 'text' && customText.trim() ? (
                            <div
                              className={`${customFont} select-none text-center p-1 pointer-events-none`}
                              style={{
                                color: customTextColor,
                                fontSize: 'clamp(14px, 4vw, 24px)',
                                lineHeight: 1.15,
                                textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                              }}
                            >
                              {customText}
                            </div>
                          ) : customImage ? (
                            <img
                              src={customImage}
                              alt="Active Print Design"
                              className="max-w-[140px] md:max-w-[160px] max-h-[140px] md:max-h-[160px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)] pointer-events-none"
                            />
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Viewport Status Pill */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-white/90 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 z-20 pointer-events-none">
                      <span className="font-bold truncate max-w-[190px]">
                        🎨 {customImageName || (customText ? `"${customText}"` : 'Clean Blank')}
                      </span>
                      <span className="font-mono text-[#FF9A3D] font-black">
                        {customPlacement}
                      </span>
                    </div>
                  </div>

                  {/* 4 VALIDATED PRINT PRESETS (APPAREL ONLY) */}
                  {activeItemIsApparel ? (
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">
                        Print Placement Presets:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { id: 'front-center', label: '🎯 Center Chest', sub: '10" × 12"', placement: 'Center Chest', view: 'front', x: 0, y: -10, scale: 100 },
                          { id: 'pocket-crest', label: '👕 Pocket Crest', sub: '3.5" × 3.5"', placement: 'Pocket Crest', view: 'front', x: -24, y: -20, scale: 65 },
                          { id: 'back-oversized', label: '🔄 Oversized Back', sub: '12" × 14"', placement: 'Oversized Back', view: 'back', x: 0, y: 0, scale: 125 },
                          { id: 'minimal-clean', label: '🚫 Minimal Clean', sub: 'Solid Blank', placement: 'Minimal Clean', view: 'front', x: 0, y: 0, scale: 100, isClean: true },
                        ].map((preset) => {
                          const isPresetActive = preset.isClean
                            ? (!customImage && !customText.trim())
                            : (customPlacement === preset.placement && (customImage || customText.trim()));

                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                if (preset.isClean) {
                                  setCustomImage(null);
                                  setCustomImageName('Clean Blank Drop');
                                  setCustomText('');
                                  setCustomPlacement('Minimal Clean');
                                  if (isComboProduct) {
                                    setBundleItemGraphics((prev) => ({
                                      ...prev,
                                      [selectedComboItemIndex]: { title: 'Original Drop', image: null },
                                    }));
                                  }
                                } else {
                                  setCustomPlacement(preset.placement);
                                  setCustomView(preset.view as 'front' | 'back');
                                  setCustomPosX(preset.x);
                                  setCustomPosY(preset.y);
                                  setCustomScale(preset.scale);
                                  setCustomRotation(0);
                                  setCustomFlip(false);
                                  if (!customImage && !customText.trim() && TRENDING_GRAPHICS_VAULT[0]) {
                                    setCustomImage(TRENDING_GRAPHICS_VAULT[0].mockUrl);
                                    setCustomImageName(TRENDING_GRAPHICS_VAULT[0].title);
                                    if (isComboProduct) {
                                      setBundleItemGraphics((prev) => ({
                                        ...prev,
                                        [selectedComboItemIndex]: { title: TRENDING_GRAPHICS_VAULT[0].title, image: TRENDING_GRAPHICS_VAULT[0].mockUrl },
                                      }));
                                    }
                                  }
                                }
                              }}
                              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                isPresetActive
                                  ? 'border-[#FF4D24] bg-[#FF4D24]/20 ring-1 ring-[#FF4D24] text-white shadow-sm'
                                  : 'border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300'
                              }`}
                            >
                              <div className="text-xs font-black">{preset.label}</div>
                              <div className="text-[10px] text-neutral-400 font-bold mt-0.5">{preset.sub}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : activeItemIsDeskMat ? (
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-center justify-between">
                      <span className="font-bold">Print Placement:</span>
                      <span className="font-black text-[#FF9A3D]">Full Surface Precision Print (900 × 400 mm)</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-center justify-between">
                      <span className="font-bold">Print Placement:</span>
                      <span className="font-black text-[#FF9A3D]">Panoramic 360° Wrap Print (8.5" × 3.5")</span>
                    </div>
                  )}

                  {/* ARTWORK PICKER (HORIZONTAL THUMBNAIL CAROUSEL) */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-2">
                      <span>Choose Archival Streetwear Graphic:</span>
                      <span className="text-[#FF9A3D] text-[11px] font-black">1200 DPI Vector HD</span>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                      {/* Clean Blank Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomImage(null);
                          setCustomImageName('Clean Blank Drop');
                          setCustomText('');
                          setCustomPlacement('Minimal Clean');
                          if (isComboProduct) {
                            setBundleItemGraphics((prev) => ({
                              ...prev,
                              [selectedComboItemIndex]: { title: 'Original Drop', image: null },
                            }));
                          }
                        }}
                        className={`snap-start shrink-0 p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2 min-w-[135px] ${
                          !customImage && !customText.trim()
                            ? 'border-[#FF4D24] bg-[#FF4D24]/15 ring-2 ring-[#FF4D24]/40'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center shrink-0 text-base">
                          🚫
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold text-neutral-400 block uppercase">Clean</span>
                          <span className="text-xs font-black text-white block truncate">Original Drop</span>
                        </div>
                      </button>

                      {/* 6 Curated Streetwear Graphics */}
                      {TRENDING_GRAPHICS_VAULT.map((g) => {
                        const isSelected = customImageName === g.title;
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => {
                              setCustomImage(g.mockUrl);
                              setCustomImageName(g.title);
                              if (customPlacement === 'Minimal Clean') {
                                setCustomPlacement('Center Chest');
                              }
                              if (isComboProduct) {
                                setBundleItemGraphics((prev) => ({
                                  ...prev,
                                  [selectedComboItemIndex]: { title: g.title, image: g.mockUrl },
                                }));
                              }
                            }}
                            className={`snap-start shrink-0 p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2 min-w-[160px] ${
                              isSelected
                                ? 'border-[#FF4D24] bg-[#FF4D24]/15 ring-2 ring-[#FF4D24]/40 shadow-sm'
                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className="w-9 h-9 rounded-xl bg-[#09090b] border border-white/15 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                              <img src={g.mockUrl} alt={g.title} className="w-full h-full object-contain" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-black text-[#FF9A3D] uppercase tracking-wider block truncate">
                                {g.emoji} {g.tag}
                              </span>
                              <span className="text-xs font-black text-white block truncate">
                                {g.title}
                              </span>
                            </div>
                            {isSelected && <span className="text-xs font-black text-[#FF4D24] shrink-0">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PRO UPLOAD & CUSTOM TEXT DRAWER */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setCustomMode(customMode === 'image' ? 'trending' : 'image')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          customMode === 'image'
                            ? 'bg-[#FF4D24] text-white border-transparent'
                            : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span>🖼️</span>
                        <span>Upload Your Logo (PNG/SVG)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomMode(customMode === 'text' ? 'trending' : 'text')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          customMode === 'text'
                            ? 'bg-[#FF4D24] text-white border-transparent'
                            : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span>✏️</span>
                        <span>Add Custom Text</span>
                      </button>
                    </div>

                    {customMode === 'image' && (
                      <div className="space-y-2 mt-2">
                        {!customImage || customMode !== 'image' ? (
                          <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-[#FF4D24]/40 bg-white/5 hover:bg-white/10 cursor-pointer text-center transition-all">
                            <span className="text-2xl mb-1">📁</span>
                            <span className="text-xs font-black text-white">
                              {uploadingArtwork ? 'Uploading to Archival Vault...' : 'Click to Upload High-Res Logo (PNG, SVG, WEBP)'}
                            </span>
                            <span className="text-[10px] text-neutral-400 mt-0.5">
                              Direct cloud upload to factory print queue • Up to 15MB
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={customImage} alt="Uploaded Logo" className="w-10 h-10 object-contain rounded-lg bg-neutral-900 p-1 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-xs font-black text-white block truncate">{customImageName}</span>
                                <span className="text-[10px] font-bold text-emerald-400 block">✓ Cloud Stored for Factory DTF Print</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/20 cursor-pointer"
                            >
                              Remove ✕
                            </button>
                          </div>
                        )}

                        <p className="text-[11px] text-neutral-400 leading-relaxed bg-white/5 p-2.5 rounded-xl border border-white/10">
                          💬 <strong>Prefer to WhatsApp or email your vector file later?</strong> Place order normally, then WhatsApp or email artwork to{' '}
                          <a href="mailto:rareemberagency@gmail.com" className="text-[#FF9A3D] font-bold underline">
                            rareemberagency@gmail.com
                          </a>{' '}
                          with your Order ID!
                        </p>
                      </div>
                    )}

                    {customMode === 'text' && (
                      <div className="space-y-3 mt-2">
                        <input
                          type="text"
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value.slice(0, 30))}
                          placeholder="Enter Text, Name or Monogram (e.g. EMBER, SPEED, 2026)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white font-bold text-sm focus:outline-none focus:border-[#FF4D24]"
                        />

                        {/* Font Style */}
                        <div>
                          <span className="text-[11px] font-black uppercase text-neutral-400 block mb-1">
                            Typography Style
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {[
                              { label: 'Streetwear', font: 'font-sans font-black tracking-wider uppercase' },
                              { label: 'Cyber Mono', font: 'font-mono font-bold tracking-widest uppercase' },
                              { label: 'Athletic Block', font: 'font-sans font-extrabold tracking-normal uppercase' },
                              { label: 'Vintage Serif', font: 'font-serif font-bold italic tracking-wide' },
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

                        {/* Ink Color */}
                        <div>
                          <span className="text-[11px] font-black uppercase text-neutral-400 block mb-1">
                            Print Ink Color
                          </span>
                          <div className="flex items-center gap-2">
                            {[
                              { color: '#ffffff', name: 'Crisp White', border: 'border-neutral-300' },
                              { color: '#FF4D24', name: 'Ember Orange', border: 'border-[#FF4D24]' },
                              { color: '#00F0FF', name: 'Cyber Cyan', border: 'border-cyan-400' },
                              { color: '#F59E0B', name: 'Gold', border: 'border-amber-400' },
                              { color: '#18181B', name: 'Stealth Black', border: 'border-neutral-600' },
                              { color: '#DC2626', name: 'Crimson', border: 'border-red-500' },
                            ].map((c) => (
                              <button
                                key={c.color}
                                type="button"
                                onClick={() => setCustomTextColor(c.color)}
                                className={`w-7 h-7 rounded-full transition-all cursor-pointer border-2 ${c.border} ${
                                  customTextColor === c.color
                                    ? 'ring-2 ring-[#FF4D24] ring-offset-2 ring-offset-black scale-110'
                                    : 'opacity-70 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: c.color }}
                                title={c.name}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Added to Bag Toast Alert */}
            {addedAlert && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.85rem',
                  background: '#059669',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                }}
              >
                <span>✓</span> Added {product.title} {isApparel ? `(Size ${selectedSize})` : ''} to your bag!
              </div>
            )}

            {((product as any).active === false || ((product as any).stock != null && Number((product as any).stock) <= 0)) ? (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1.75rem', flexWrap: 'wrap' }}>
                <div style={{ padding: '0.85rem 1.75rem', borderRadius: '9999px', background: '#fef2f2', border: '1.5px solid #fecaca', color: '#dc2626', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>⚠️</span> CURRENTLY OUT OF STOCK AT SUPPLIER
                </div>
                <button
                  onClick={() => toggle(product.id)}
                  aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                  style={wishBtn}
                >
                  {wished ? '♥' : '♡'}
                </button>
                <button
                  onClick={async () => {
                    const contact = prompt('Back in stock alert ke liye email/phone likho:');
                    if (!contact) return;
                    try {
                      await fetch('/api/restock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: product.id, contact }) });
                      alert('✅ Notify-Me ON! Stock aate hi message milega.');
                    } catch { alert('Try again later.'); }
                  }}
                  style={{ ...wishBtn, border: '1.5px solid #FF4D24', color: '#FF4D24' }}
                >
                  🔔 Notify Me
                </button>
              </div>
            ) : (
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Primary High-Converting 1-Tap CTA */}
                <button
                  onClick={handleOrderNow}
                  style={{
                    ...addBtn,
                    width: '100%',
                    padding: '1rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 900,
                    letterSpacing: '0.02em',
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, #FF4D24 0%, #E8244B 100%)',
                    boxShadow: '0 8px 24px -4px rgba(255, 77, 36, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>{isComboProduct ? 'ORDER BUNDLE NOW ⚡' : 'ORDER NOW ⚡'}</span>
                  <span>•</span>
                  <span>{geoFormatPrice(effectivePriceUsd * qty, effectiveInr * qty)}</span>
                </button>

                {/* Priority Dispatch Reassurance */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-600 font-bold text-center">
                  <span className="text-[#FF4D24]">⚡</span>
                  <span>Order in 3 hrs for priority dispatch tomorrow • Delivers in 2–4 Days (Free Air Express)</span>
                </div>

                {/* Secondary Row: Quantity, Add to Bag, Wishlist */}
                <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', background: '#f5f5f4', padding: '0.35rem 0.55rem', borderRadius: '0.85rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      style={qtyBtn}
                    >
                      −
                    </button>
                    <span style={{ fontWeight: 800, minWidth: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(99, q + 1))}
                      aria-label="Increase quantity"
                      style={qtyBtn}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    style={{
                      ...secondaryAddBtn,
                      flex: 1,
                      padding: '0.85rem 1rem',
                      borderRadius: '0.85rem',
                    }}
                  >
                    🛍️ Add to Bag
                  </button>

                  <button
                    onClick={() => toggle(product.id)}
                    aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                    style={{
                      ...wishBtn,
                      width: '48px',
                      height: '48px',
                      borderRadius: '0.85rem',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                    }}
                  >
                    {wished ? '♥' : '♡'}
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <PincodeChecker />
            </div>

            {/* Apple-styled Trust & Security Guarantee Grid */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/returns"
                className="p-3 rounded-2xl bg-white border border-black/[0.06] shadow-xs no-underline hover:border-black/20 transition-all text-inherit"
              >
                <div className="text-base mb-1">🛡️</div>
                <div className="font-bold text-neutral-950 flex items-center justify-between">
                  <span>7-Day Replacement</span>
                  <span className="text-[10px] text-amber-600 font-bold">Claim Portal →</span>
                </div>
                <div className="text-[11px] text-neutral-500">100% free doorstep reprint for sizing or defects</div>
              </Link>
              <div className="p-3 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
                <div className="text-base mb-1">🔒</div>
                <div className="font-bold text-neutral-950">256-Bit SSL Checkout</div>
                <div className="text-[11px] text-neutral-500">Bank-grade encrypted gateway</div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
                <div className="text-base mb-1">⚡</div>
                <div className="font-bold text-neutral-950">Express Insured</div>
                <div className="text-[11px] text-neutral-500">Tracked door-to-door courier</div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
                <div className="text-base mb-1">✨</div>
                <div className="font-bold text-neutral-950">100% Genuine Quality</div>
                <div className="text-[11px] text-neutral-500">Verified factory inspection</div>
              </div>
            </div>

            {/* Collapsible Accordions: Shipping & Packaging / Fabric & Wash Care */}
            <div className="mt-4 space-y-2 text-xs">
              {/* Accordion 1: Shipping & Protective Packaging */}
              <div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setOpenAccordion((prev) => (prev === 'shipping' ? null : 'shipping'))}
                  className="w-full p-3.5 flex items-center justify-between text-left font-black text-neutral-900 cursor-pointer hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">📦</span>
                    <span>Shipping &amp; Protective Packaging</span>
                  </div>
                  <span className="text-neutral-400 font-bold text-sm">
                    {openAccordion === 'shipping' ? '−' : '+'}
                  </span>
                </button>
                {openAccordion === 'shipping' && (
                  <div className="px-3.5 pb-3.5 text-neutral-600 space-y-2 border-t border-black/[0.06] pt-2.5 leading-relaxed">
                    <p>
                      ⚡ <strong>Express Pan-India Delivery:</strong> Orders dispatch within 24–48 hours from our domestic fulfillment hub via BlueDart Air &amp; Delhivery Express (Estimated arrival: 2–4 business days).
                    </p>
                    <p>
                      📦 <strong>Damage-Proof Packaging:</strong>
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      <li><strong>Extended Desk Mats:</strong> Shipped rolled in heavy-duty triangular protective tube packaging to prevent edge curling and transport creasing.</li>
                      <li><strong>Streetwear Tees &amp; Hoodies:</strong> Packed in tamper-evident, weather-proof protective courier mailers with branded dust wrap.</li>
                      <li><strong>Ceramic Drinkware:</strong> Enclosed in custom shock-absorbent molded thermocol double-box packaging.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 2: Fabric & Care Guide */}
              <div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setOpenAccordion((prev) => (prev === 'care' ? null : 'care'))}
                  className="w-full p-3.5 flex items-center justify-between text-left font-black text-neutral-900 cursor-pointer hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🫧</span>
                    <span>Fabric &amp; Care Guide</span>
                  </div>
                  <span className="text-neutral-400 font-bold text-sm">
                    {openAccordion === 'care' ? '−' : '+'}
                  </span>
                </button>
                {openAccordion === 'care' && (
                  <div className="px-3.5 pb-3.5 text-neutral-600 space-y-2 border-t border-black/[0.06] pt-2.5 leading-relaxed">
                    {isApparel ? (
                      <div>
                        <p className="font-bold text-neutral-900 mb-1">Archival Garment &amp; DTF Print Care:</p>
                        <ul className="list-disc pl-4 space-y-1 text-[11px]">
                          <li>Machine wash cold (30°C max) inside-out with gentle detergent.</li>
                          <li>Do NOT iron directly over the print. Iron on reverse side on low heat.</li>
                          <li>Tumble dry low or line dry in shade to maintain rich fabric density.</li>
                          <li>Do not bleach or dry clean. Fabric is pre-shrunk for zero post-wash distortion.</li>
                        </ul>
                      </div>
                    ) : isDeskMat ? (
                      <div>
                        <p className="font-bold text-neutral-900 mb-1">Desk Mat Surface Care:</p>
                        <ul className="list-disc pl-4 space-y-1 text-[11px]">
                          <li>Spill-resistant micro-weave surface wipes clean instantly with a damp cloth.</li>
                          <li>For deeper stains, use lukewarm water and mild dish soap with a soft sponge.</li>
                          <li>Air dry flat. Do not machine wash, fold, or iron.</li>
                        </ul>
                      </div>
                    ) : isDrinkware ? (
                      <div>
                        <p className="font-bold text-neutral-900 mb-1">Ceramic Stoneware Care:</p>
                        <ul className="list-disc pl-4 space-y-1 text-[11px]">
                          <li>100% microwave safe and dishwasher friendly.</li>
                          <li>Avoid abrasive metallic scouring pads to preserve the deep-gloss glaze.</li>
                        </ul>
                      </div>
                    ) : (
                      <p className="text-[11px]">
                        Wipe with a clean, dry microfiber cloth. Avoid harsh chemical cleaners or abrasive scouring.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <ProductReviews productId={product.id} productTitle={product.title} />

        {related.length > 0 && (
          <section style={{ marginTop: 'clamp(2rem, 5vw, 3.5rem)' }}>
            <h2 style={{ fontWeight: 900, fontSize: '1.6rem', marginBottom: '1.5rem' }}>
              Pairs well with
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
                gap: '1.5rem',
              }}
            >
              {related.map((p: any) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  emoji={p.emoji}
                  tag={p.tag}
                  tagColor={p.tagColor}
                  tagBg={p.tagBg}
                  title={p.title}
                  desc={p.short}
                  price={geoFormatPrice(p.price)}
                  oldPrice={p.compareAtPrice ? geoFormatPrice(p.compareAtPrice) : undefined}
                  rawPrice={p.price}
                  rawComparePrice={p.compareAtPrice}
                  gradient={p.gradient}
                  chapter={p.chapter}
                  pet={undefined}
                  rating={p.rating}
                  reviews={p.reviews}
                  discount={computeDiscount(p.price, p.compareAtPrice, p.price_inr)}
                />
              ))}
            </div>
          </section>
        )}
        {/* Size Guide & Fit Advice Modal */}
        {showSizeGuide && (
          <div
            onClick={() => setShowSizeGuide(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#ffffff',
                borderRadius: '1.5rem',
                padding: 'clamp(1.25rem, 3vw, 2rem)',
                maxWidth: '32rem',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                border: '1px solid rgba(0,0,0,0.08)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.85rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#161311', margin: 0 }}>
                    📏 Apparel Sizing & Fit Guide
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#78716c', margin: '0.2rem 0 0 0' }}>
                    Rare Ember Official Garment Specifications
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(false)}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '9999px',
                    border: 'none',
                    background: 'rgba(0,0,0,0.06)',
                    color: '#161311',
                    fontSize: '0.9rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Units toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 0.75rem 0' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#57534e' }}>
                  Measurements in:
                </span>
                <div style={{ display: 'flex', background: '#f5f5f4', padding: '0.2rem', borderRadius: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => setSizeUnit('in')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: sizeUnit === 'in' ? '#ffffff' : 'transparent',
                      color: sizeUnit === 'in' ? '#161311' : '#78716c',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      boxShadow: sizeUnit === 'in' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    Inches (&quot;)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizeUnit('cm')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: sizeUnit === 'cm' ? '#ffffff' : 'transparent',
                      color: sizeUnit === 'cm' ? '#161311' : '#78716c',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      boxShadow: sizeUnit === 'cm' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    Centimeters (cm)
                  </button>
                </div>
              </div>

              {/* Sizing Table */}
              <div style={{ overflowX: 'auto', borderRadius: '0.85rem', border: '1px solid rgba(0,0,0,0.08)' }}>
                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f4', color: '#78716c', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Size</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Chest</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Length</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Shoulder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_GUIDE_ROWS.map((row) => {
                      const isRowSelected = selectedSize === row.size;
                      return (
                        <tr
                          key={row.size}
                          onClick={() => setSelectedSize(row.size)}
                          style={{
                            borderTop: '1px solid rgba(0,0,0,0.06)',
                            background: isRowSelected ? 'rgba(255, 77, 36, 0.08)' : 'transparent',
                            cursor: 'pointer',
                            fontWeight: isRowSelected ? 800 : 500,
                          }}
                        >
                          <td style={{ padding: '0.65rem 0.85rem', fontWeight: 900, color: isRowSelected ? '#FF4D24' : '#161311' }}>
                            {row.size} {isRowSelected ? '✓' : ''}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem' }}>
                            {sizeUnit === 'in' ? `${row.chestIn}"` : `${row.chestCm} cm`}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem' }}>
                            {sizeUnit === 'in' ? `${row.lengthIn}"` : `${row.lengthCm} cm`}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem' }}>
                            {sizeUnit === 'in' ? `${row.shoulderIn}"` : `${row.shoulderCm} cm`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '0.85rem', padding: '0.75rem 0.95rem', borderRadius: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', fontSize: '0.75rem', color: '#92400e', lineHeight: 1.5 }}>
                <strong>💡 Streetwear Fit Note:</strong> Our tees and hoodies feature a relaxed, dropped-shoulder boxy silhouette. If you prefer a tailored/regular fit, order 1 size down.
              </div>

              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '9999px',
                  border: 'none',
                  background: '#161311',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Done • Select Size {selectedSize}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE STICKY FLOATING BUY BAR */}
      {((product as any).active !== false && ((product as any).stock == null || Number((product as any).stock) > 0)) && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/10 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Live Mini Preview Icon */}
            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-neutral-100 border border-black/10 shrink-0">
              {currentSrc ? (
                <Image
                  src={currentSrc}
                  alt={product.title}
                  fill
                  sizes="44px"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <span className="text-xl flex items-center justify-center h-full">{product.emoji}</span>
              )}
              {/* If custom graphic selected, overlay mini preview */}
              {((customMode === 'trending' || customMode === 'image') && customImage) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={customImage}
                    alt=""
                    className="w-5 h-5 object-contain drop-shadow"
                  />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-[#161311]">
                  {geoFormatPrice(effectivePriceUsd * qty, effectiveInr * qty)}
                </span>
                {isApparel && (
                  <span className="text-[10px] font-black uppercase bg-[#161311] text-white px-2 py-0.5 rounded-md">
                    {selectedSize}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-neutral-500 truncate font-semibold">
                {displayTitle}
              </div>
            </div>
          </div>

          {/* 1-Tap CTA */}
          <button
            onClick={handleOrderNow}
            className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-[#FF4D24] to-[#E8244B] text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border-none"
          >
            <span>ORDER NOW</span>
            <span>⚡</span>
          </button>
        </div>
      )}
    </main>
  );
}

const qtyBtn: React.CSSProperties = {
  width: '42px',
  height: '42px',
  borderRadius: '50%',
  border: '1px solid rgba(0,0,0,0.08)',
  background: 'white',
  cursor: 'pointer',
  fontWeight: 800,
  fontSize: '1.1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
};

const secondaryAddBtn: React.CSSProperties = {
  flex: 1,
  minWidth: '150px',
  padding: '1.05rem 1.4rem',
  background: '#ffffff',
  color: '#161311',
  border: '1.5px solid rgba(0,0,0,0.14)',
  borderRadius: '9999px',
  fontWeight: 800,
  fontSize: '0.95rem',
  letterSpacing: '-0.01em',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.45rem',
  transition: 'all 0.18s ease',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
};

const addBtn: React.CSSProperties = {
  flex: 1.3,
  minWidth: '190px',
  padding: '1.05rem 1.6rem',
  background: 'linear-gradient(135deg, #FF4D24 0%, #E63900 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '9999px',
  fontWeight: 900,
  fontSize: '0.98rem',
  letterSpacing: '-0.01em',
  cursor: 'pointer',
  boxShadow: '0 10px 24px rgba(255, 77, 36, 0.32)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
};

const wishBtn: React.CSSProperties = {
  width: '52px',
  height: '52px',
  borderRadius: '50%',
  border: '1px solid rgba(0,0,0,0.08)',
  background: 'white',
  cursor: 'pointer',
  fontSize: '1.3rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
};
