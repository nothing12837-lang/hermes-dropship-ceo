'use client';

import React from 'react';
import { getMotifSvgPath } from '@/lib/data/prebuiltCatalog500';

export interface PrebuiltMockupProps {
  id: string;
  title: string;
  collection?: string;
  subCategory?: string;
  qikinkSkuPrefix?: string;
  accentHex?: string;
  svgMotif?: string;
  placement?: string;
  badge?: string;
  className?: string;
  showPipFront?: boolean;
}

// 5 Curated Streetwear Dye Colorways with realistic fabric color grading
const COLORWAYS = [
  {
    name: 'Obsidian Black',
    filter: 'contrast(1.06) brightness(0.96)',
    tintBg: 'rgba(20, 20, 23, 0.1)',
  },
  {
    name: 'Acid Charcoal',
    filter: 'contrast(1.15) brightness(0.88) grayscale(0.3)',
    tintBg: 'rgba(39, 39, 43, 0.15)',
  },
  {
    name: 'Forest Olive',
    filter: 'hue-rotate(65deg) saturate(0.85) brightness(0.92) contrast(1.05)',
    tintBg: 'rgba(35, 49, 39, 0.12)',
  },
  {
    name: 'Midnight Navy',
    filter: 'hue-rotate(190deg) saturate(0.90) brightness(0.88) contrast(1.05)',
    tintBg: 'rgba(22, 31, 48, 0.12)',
  },
  {
    name: 'Oxblood Maroon',
    filter: 'hue-rotate(315deg) saturate(1.10) brightness(0.82) contrast(1.08)',
    tintBg: 'rgba(58, 23, 30, 0.12)',
  },
];

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// 100% Real Studio Photography Assets (Verified clean dark blanks without supplier watermarks)
const STUDIO_GARMENTS = {
  hoodie: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/5/9bd43925-3bff-4f53-9d92-80c14714fd19.jpg',
  crewneck: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/4/23175e0b-febe-4d12-83e2-f9a76506d24f.jpg',
  varsity: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/95/b3298941-1294-4945-ac9c-c5aaafd3403d.jpg',
  oversizedTee: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/28/30c13fe2-0ca2-4f63-b857-7970c0c0a593.jpg',
  acidWashTee: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/variations/b8d5807e-f669-4087-9dd4-a136e0af3e87.webp',
  deskMat: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg',
  mug: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/130/c4d6d737-e7b6-4927-a4b9-1fbe856ffd9f.jpg',
};

export default function PrebuiltMockupRenderer({
  id,
  title,
  subCategory = '',
  qikinkSkuPrefix = '',
  svgMotif = 'ronin',
  className = '',
}: PrebuiltMockupProps) {
  const seed = hashString(id + title);
  const lower = (title + ' ' + subCategory + ' ' + id + ' ' + qikinkSkuPrefix).toLowerCase();

  // Determine exact garment silhouette
  const isDeskMat = id.includes('deskmat') || lower.includes('desk mat') || lower.includes('gaming pad') || lower.includes('mouse pad') || qikinkSkuPrefix.startsWith('MPad');
  const isMug = lower.includes('mug') || qikinkSkuPrefix.startsWith('CMg') || qikinkSkuPrefix.startsWith('EMg');
  const isVarsity = id.includes('varsity') || lower.includes('varsity') || lower.includes('bomber') || qikinkSkuPrefix === 'UVJ';
  const isCrewneck = !isVarsity && (id.includes('crewneck') || lower.includes('crewneck') || lower.includes('sweatshirt') || qikinkSkuPrefix === 'USs');
  const isHoodie = !isCrewneck && !isVarsity && (id.includes('hoodie') || lower.includes('hoodie') || qikinkSkuPrefix === 'UHd' || qikinkSkuPrefix === 'UZHd');
  const isAcidWash = !isDeskMat && !isMug && !isVarsity && !isCrewneck && !isHoodie && (id.includes('acid') || lower.includes('acid') || qikinkSkuPrefix === 'ATe');

  let basePhoto = STUDIO_GARMENTS.oversizedTee;
  if (isDeskMat) basePhoto = STUDIO_GARMENTS.deskMat;
  else if (isMug) basePhoto = STUDIO_GARMENTS.mug;
  else if (isVarsity) basePhoto = STUDIO_GARMENTS.varsity;
  else if (isCrewneck) basePhoto = STUDIO_GARMENTS.crewneck;
  else if (isHoodie) basePhoto = STUDIO_GARMENTS.hoodie;
  else if (isAcidWash) basePhoto = STUDIO_GARMENTS.acidWashTee;

  // Select colorway studio color grading
  const colorwayIndex = seed % COLORWAYS.length;
  const colorway = COLORWAYS[colorwayIndex];
  const photoFilter = isDeskMat || isMug ? 'brightness(0.98)' : colorway.filter;

  // Resolve die-cut transparent vector graphic
  const motifPath = getMotifSvgPath(svgMotif);

  // Exact print zone placement
  const printZoneStyle: React.CSSProperties = isDeskMat
    ? {
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '56%',
        height: '56%',
        mixBlendMode: 'screen',
        opacity: 0.92,
        filter: 'contrast(1.05)',
        pointerEvents: 'none',
      }
    : isMug
    ? {
        position: 'absolute',
        top: '32%',
        left: '46%',
        transform: 'translateX(-50%)',
        width: '38%',
        height: '38%',
        mixBlendMode: 'screen',
        opacity: 0.88,
        filter: 'contrast(1.05)',
        pointerEvents: 'none',
      }
    : isVarsity
    ? {
        position: 'absolute',
        top: '30%',
        left: '35%',
        transform: 'translateX(-50%)',
        width: '26%',
        height: '26%',
        mixBlendMode: 'screen',
        opacity: 0.90,
        filter: 'contrast(1.05)',
        pointerEvents: 'none',
      }
    : {
        position: 'absolute',
        top: '28%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '34%',
        height: '34%',
        mixBlendMode: 'screen',
        opacity: 0.88,
        filter: 'contrast(1.05)',
        pointerEvents: 'none',
      };

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#0D0D10] select-none ${className}`}>
      {/* 1. Real Studio Garment Photography with Color Grading */}
      <img
        src={basePhoto}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 ease-out"
        style={{ filter: photoFilter }}
        loading="lazy"
      />

      {/* 2. Transparent Die-Cut Screenprint Vector Graphic (NO BOX, NO BORDER, SCREEN BLENDED) */}
      <div style={printZoneStyle} className="flex items-center justify-center">
        <img
          src={motifPath}
          alt={title}
          className="w-full h-full object-contain"
          style={{
            background: 'transparent',
            border: 'none',
          }}
        />
      </div>

      {/* 3. Subtle Fabric Crease Lighting Pass Over Print */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}
