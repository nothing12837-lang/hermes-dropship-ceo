'use client';

import React from 'react';

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

// 100% Real Studio Photography Assets (Fallback clean dark blanks)
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

  // Resolve pre-rendered real studio photographic mockup
  const motifKey = svgMotif || 'ronin';
  const silKey = isDeskMat
    ? 'deskmat'
    : isVarsity
    ? 'varsity'
    : isCrewneck
    ? 'crewneck'
    : isHoodie
    ? 'hoodie'
    : isAcidWash
    ? 'acid'
    : 'tee';

  const prebuiltMockupPath = `/mockups/mockup-${motifKey}-${silKey}.webp`;

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#0D0D10] select-none ${className}`}>
      {/* 1. Real Pre-Rendered Studio Garment Photography */}
      <img
        src={prebuiltMockupPath}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        loading="lazy"
        onError={(e) => {
          // Graceful fallback to clean blank photo if needed
          (e.currentTarget as HTMLImageElement).src = basePhoto;
        }}
      />
    </div>
  );
}
