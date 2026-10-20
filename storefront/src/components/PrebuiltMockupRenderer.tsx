// storefront/src/components/PrebuiltMockupRenderer.tsx
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

const GARMENT_PALETTES = [
  { name: 'Obsidian Black', body: '#141417', rib: '#0D0D0F', sleeve: '#141417', isLight: false },
  { name: 'Vintage Acid Charcoal', body: '#27272B', rib: '#1C1C20', sleeve: '#27272B', isLight: false },
  { name: 'Forest Olive', body: '#233127', rib: '#1A241D', sleeve: '#233127', isLight: false },
  { name: 'Midnight Navy', body: '#161F30', rib: '#101724', sleeve: '#161F30', isLight: false },
  { name: 'Oxblood Maroon', body: '#3A171E', rib: '#2A1015', sleeve: '#3A171E', isLight: false },
  { name: 'Espresso Brown', body: '#2B201A', rib: '#1F1712', sleeve: '#2B201A', isLight: false },
  { name: 'Warm Sand Beige', body: '#D8CBB8', rib: '#C7B8A2', sleeve: '#D8CBB8', isLight: true },
  { name: 'Varsity Cream Sleeve', body: '#161619', rib: '#111114', sleeve: '#E5DEC9', isLight: false }
];

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export default function PrebuiltMockupRenderer({
  id,
  title,
  collection = 'RareEmber Archive',
  subCategory = '',
  qikinkSkuPrefix = 'UOst',
  accentHex = '#F97316',
  svgMotif = 'ronin',
  placement = 'Back Oversized',
  className = ''
}: PrebuiltMockupProps) {
  const seed = hashString(id + title);
  const lowerTitle = (title + ' ' + subCategory).toLowerCase();

  // Determine exact garment silhouette so Crewnecks NEVER show a Hoodie
  const isDeskMat = (qikinkSkuPrefix && qikinkSkuPrefix.startsWith('MPad')) || lowerTitle.includes('desk mat') || lowerTitle.includes('gaming pad') || lowerTitle.includes('mouse pad') || id.includes('deskmat');
  const isMug = (qikinkSkuPrefix && (qikinkSkuPrefix.startsWith('CMg') || qikinkSkuPrefix.startsWith('EMg'))) || lowerTitle.includes('mug');
  const isVarsity = qikinkSkuPrefix === 'UVJ' || lowerTitle.includes('varsity') || lowerTitle.includes('bomber') || id.includes('varsity');
  const isCrewneck = qikinkSkuPrefix === 'USs' || lowerTitle.includes('crewneck') || lowerTitle.includes('sweatshirt') || id.includes('crewneck');
  const isHoodie = !isCrewneck && !isVarsity && (qikinkSkuPrefix === 'UHd' || qikinkSkuPrefix === 'UZHd' || lowerTitle.includes('hoodie') || id.includes('hoodie'));
  const isAcidWash = qikinkSkuPrefix === 'ATe' || lowerTitle.includes('acid') || id.includes('acid');

  const palette = isVarsity
    ? GARMENT_PALETTES[7]
    : isAcidWash
    ? GARMENT_PALETTES[1]
    : GARMENT_PALETTES[seed % 7];

  const inkPrimary = palette.isLight ? '#18181B' : '#F4F4F5';
  const inkAccent = accentHex || '#F97316';
  const cleanTitle = title.split('—')[0].trim().toUpperCase();
  const words = cleanTitle.split(/\s+/);
  const line1 = words.slice(0, 2).join(' ');
  const line2 = words.slice(2, 5).join(' ');

  // Die-cut transparent screenprint graphic (ZERO rectangular boxes)
  const renderDieCutArtwork = (scale = 1) => {
    const variant = seed % 5;
    return (
      <g transform={`scale(${scale})`} style={{ mixBlendMode: palette.isLight ? 'multiply' : 'screen' }}>
        {/* Central Artistic Motif — No outer box! */}
        {svgMotif === 'ronin' || variant === 0 ? (
          <g>
            <circle cx="0" cy="-18" r="44" fill={inkAccent} opacity="0.88" />
            <path d="M-55,10 Q0,-45 60,-15 Q10,-5 -55,10 Z" fill={palette.body} />
            <path d="M-48,22 L52,-38" stroke={inkPrimary} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M-38,-52 L-38,28 M38,-52 L38,28" stroke={inkPrimary} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
            <text x="0" y="-12" textAnchor="middle" fill={inkPrimary} fontSize="22" fontWeight="900" letterSpacing="4" fontFamily="serif">武士道</text>
          </g>
        ) : svgMotif === 'chakra' || variant === 1 ? (
          <g>
            <circle cx="0" cy="-16" r="46" fill="none" stroke={inkAccent} strokeWidth="2.5" strokeDasharray="6 4" />
            <circle cx="0" cy="-16" r="34" fill="none" stroke={inkPrimary} strokeWidth="1.8" />
            <polygon points="0,-58 36,6 -36,6" fill="none" stroke={inkAccent} strokeWidth="2.2" />
            <polygon points="0,26 36,-38 -36,-38" fill="none" stroke={inkPrimary} strokeWidth="2.2" />
            <circle cx="0" cy="-16" r="10" fill={inkAccent} />
          </g>
        ) : svgMotif === 'motorsport' || variant === 2 ? (
          <g>
            <path d="M-58,-28 L58,-28 L46,8 L-46,8 Z" fill="none" stroke={inkAccent} strokeWidth="2.5" />
            <path d="M-48,-16 L48,-16 M-38,-4 L38,-4" stroke={inkPrimary} strokeWidth="2" />
            <circle cx="-26" cy="-38" r="12" fill="none" stroke={inkPrimary} strokeWidth="2.5" />
            <circle cx="26" cy="-38" r="12" fill="none" stroke={inkAccent} strokeWidth="2.5" />
            <text x="0" y="-2" textAnchor="middle" fill={inkAccent} fontSize="14" fontWeight="900" letterSpacing="3">V12 • 9000 RPM</text>
          </g>
        ) : svgMotif === 'code' || variant === 3 ? (
          <g>
            <path d="M-28,-42 L-48,-18 L-28,6 M28,-42 L48,-18 L28,6" fill="none" stroke={inkAccent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="10" y1="-46" x2="-10" y2="10" stroke={inkPrimary} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="0" cy="-18" r="38" fill="none" stroke={inkPrimary} strokeWidth="1.2" strokeDasharray="3 5" opacity="0.6" />
          </g>
        ) : (
          <g>
            <path d="M0,-62 C22,-35 42,-20 34,8 C28,26 -28,26 -34,8 C-42,-20 -22,-35 0,-62 Z" fill="none" stroke={inkAccent} strokeWidth="3" />
            <path d="M0,-42 C12,-22 22,-12 18,6 C14,18 -14,18 -18,6 C-22,-12 -12,-22 0,-42 Z" fill={inkAccent} opacity="0.85" />
            <line x1="-52" y1="-12" x2="52" y2="-12" stroke={inkPrimary} strokeWidth="2" />
          </g>
        )}

        {/* Die-Cut Archival Streetwear Typography (No Box Background) */}
        <text x="0" y="44" textAnchor="middle" fill={inkPrimary} fontSize="13.5" fontWeight="900" letterSpacing="2.2" fontFamily="sans-serif">
          {line1.slice(0, 18)}
        </text>
        {line2 && (
          <text x="0" y="61" textAnchor="middle" fill={inkAccent} fontSize="10.5" fontWeight="800" letterSpacing="2.8" fontFamily="sans-serif">
            {line2.slice(0, 22)}
          </text>
        )}
        <text x="0" y="76" textAnchor="middle" fill={inkPrimary} opacity="0.65" fontSize="6.5" fontWeight="700" letterSpacing="3.2" fontFamily="monospace">
          RAREEMBER™ ARCHIVE • TIRUPUR CRAFT
        </text>
      </g>
    );
  };

  // 1. EXTENDED 900x400mm DESK MAT FULL-BLEED STUDIO RENDER
  if (isDeskMat) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden select-none ${className}`}>
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <radialGradient id={`desk-glow-${seed}`} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor={inkAccent} stopOpacity="0.22" />
              <stop offset="100%" stopColor="#09090B" stopOpacity="1" />
            </radialGradient>
            <clipPath id={`mat-clip-${seed}`}>
              <rect x="28" y="110" width="344" height="165" rx="14" />
            </clipPath>
          </defs>
          {/* Dark Walnut / Obsidian Studio Desk Surface */}
          <rect width="400" height="400" fill={`url(#desk-glow-${seed})`} />
          {/* Drop Shadow under Desk Mat */}
          <rect x="32" y="116" width="344" height="165" rx="14" fill="#000000" opacity="0.65" />
          {/* 900x400mm Extended Mat Surface with Full-Bleed Artwork */}
          <g clipPath={`url(#mat-clip-${seed})`}>
            <rect x="28" y="110" width="344" height="165" fill={palette.body} />
            {/* Topographic / Cyber Grid lines across mat */}
            <path d="M28,145 Q140,120 240,165 T372,140 M28,225 Q160,190 270,240 T372,210" fill="none" stroke={inkAccent} strokeWidth="1.5" opacity="0.35" />
            <circle cx="290" cy="192" r="68" fill={inkAccent} opacity="0.18" />
            <g transform="translate(200, 188)">
              {renderDieCutArtwork(0.82)}
            </g>
          </g>
          {/* Stitched Anti-Fray Edge Border */}
          <rect x="28" y="110" width="344" height="165" rx="14" fill="none" stroke={inkAccent} strokeWidth="2.5" strokeDasharray="4 2" opacity="0.85" />
          {/* Minimalist 65% Mechanical Keyboard & Wireless Mouse Silhouette for Scale */}
          <rect x="56" y="162" width="102" height="42" rx="5" fill="#18181B" stroke="#3F3F46" strokeWidth="1.2" opacity="0.92" />
          <rect x="61" y="167" width="92" height="32" rx="3" fill="#09090B" />
          <rect x="318" y="172" width="22" height="34" rx="11" fill="#18181B" stroke="#3F3F46" strokeWidth="1.2" opacity="0.92" />
          <text x="200" y="316" textAnchor="middle" fill="#A1A1AA" fontSize="9.5" fontWeight="700" letterSpacing="2.5">
            900 × 400 × 3 MM • STITCHED ANTI-FRAY DESK MAT
          </text>
        </svg>
      </div>
    );
  }

  // 2. APPAREL STUDIO GHOST-MANNEQUIN FLAT-LAY RENDERER (Hoodie vs. Crewneck vs. Varsity vs. Tee)
  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-gradient-to-b from-zinc-900 via-zinc-950 to-black overflow-hidden select-none ${className}`}>
      <svg viewBox="0 0 400 440" className="w-full h-full">
        <defs>
          {/* Realistic Fabric Fold & Drape Shadow Gradient placed OVER the artwork */}
          <linearGradient id={`fold-drape-${seed}`} x1="0%" y1="0%" x2="100%" y2="5%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.38" />
            <stop offset="18%" stopColor="#FFFFFF" stopOpacity="0.06" />
            <stop offset="34%" stopColor="#000000" stopOpacity="0.16" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="68%" stopColor="#000000" stopOpacity="0.18" />
            <stop offset="84%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.42" />
          </linearGradient>
          <radialGradient id={`studio-vignette-${seed}`} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor={inkAccent} stopOpacity="0.14" />
            <stop offset="100%" stopColor="#09090B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Subtle Studio Backlight Glow */}
        <circle cx="200" cy="210" r="175" fill={`url(#studio-vignette-${seed})`} />

        {/* Drop Shadow Under Garment */}
        <ellipse cx="200" cy="396" rx="115" ry="12" fill="#000000" opacity="0.55" />

        {/* SILHOUETTE A: 380 GSM HEAVYWEIGHT BOXY HOODIE (Double-lined hood, NO drawstrings, kangaroo pocket) */}
        {isHoodie && (
          <g>
            {/* Long Dropped Sleeves */}
            <path d="M92,102 L32,265 L68,280 L108,168 Z" fill={palette.sleeve} />
            <path d="M308,102 L368,265 L332,280 L292,168 Z" fill={palette.sleeve} />
            {/* Ribbed Cuffs */}
            <path d="M32,265 L68,280 L62,296 L26,281 Z" fill={palette.rib} />
            <path d="M368,265 L332,280 L338,296 L374,281 Z" fill={palette.rib} />
            {/* Boxy Torso Body */}
            <path d="M92,102 Q200,112 308,102 L302,362 L98,362 Z" fill={palette.body} />
            {/* Heavy Ribbed Waistband Hem */}
            <rect x="98" y="360" width="204" height="22" rx="3" fill={palette.rib} />
            {/* Double-Lined Streetwear Hood (Clean, No Strings) */}
            <path d="M134,104 C128,42 162,26 200,26 C238,26 272,42 266,104 Q200,118 134,104 Z" fill={palette.body} stroke="#000000" strokeOpacity="0.35" strokeWidth="2" />
            <path d="M150,104 C150,58 174,44 200,44 C226,44 250,58 250,104 Q200,114 150,104 Z" fill={palette.rib} />
            {/* Inside Neck Woven Label */}
            <rect x="184" y="84" width="32" height="12" rx="1.5" fill="#18181B" stroke={inkAccent} strokeWidth="0.8" />
            <text x="200" y="92" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontWeight="800" letterSpacing="1">RAREEMBER</text>
            {/* Subtle Kangaroo Pocket Seam at Lower Torso */}
            <path d="M132,360 L146,298 L254,298 L268,360" fill="none" stroke="#000000" strokeOpacity="0.28" strokeWidth="2" />
          </g>
        )}

        {/* SILHOUETTE B: 320 GSM WINTER CREWNECK SWEATSHIRT (Round ribbed collar + V-stitch, ZERO hood!) */}
        {isCrewneck && (
          <g>
            {/* Long Dropped Sleeves */}
            <path d="M90,94 L28,262 L66,278 L108,164 Z" fill={palette.sleeve} />
            <path d="M310,94 L372,262 L334,278 L292,164 Z" fill={palette.sleeve} />
            {/* Ribbed Cuffs */}
            <path d="M28,262 L66,278 L60,294 L22,278 Z" fill={palette.rib} />
            <path d="M372,262 L334,278 L340,294 L378,278 Z" fill={palette.rib} />
            {/* Boxy Crewneck Torso */}
            <path d="M90,94 L148,74 Q200,92 252,74 L310,94 L302,360 L98,360 Z" fill={palette.body} />
            {/* Heavy Derby Ribbed Waistband */}
            <rect x="98" y="358" width="204" height="22" rx="3" fill={palette.rib} />
            {/* Thick Ribbed Crewneck Collar + Heritage V-Gusset Stitch (No Hood!) */}
            <path d="M148,74 Q200,104 252,74 Q244,62 200,66 Q156,62 148,74 Z" fill={palette.rib} />
            <path d="M156,78 Q200,114 244,78" fill="none" stroke={palette.rib} strokeWidth="9" />
            <polygon points="184,89 216,89 200,114" fill="none" stroke="#000000" strokeOpacity="0.35" strokeWidth="1.8" />
            {/* Inside Collar Tag */}
            <rect x="184" y="70" width="32" height="11" rx="1.5" fill="#18181B" stroke={inkAccent} strokeWidth="0.8" />
            <text x="200" y="78" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontWeight="800" letterSpacing="1">RAREEMBER</text>
          </g>
        )}

        {/* SILHOUETTE C: 350 GSM CONTRAST-SLEEVE VARSITY JACKET (Cream sleeves, striped rib collar/cuffs, snap buttons) */}
        {isVarsity && (
          <g>
            {/* Cream Contrast Leather/Fleece Sleeves */}
            <path d="M90,94 L28,262 L66,278 L108,164 Z" fill={palette.sleeve} />
            <path d="M310,94 L372,262 L334,278 L292,164 Z" fill={palette.sleeve} />
            {/* Striped Varsity Cuffs */}
            <path d="M28,262 L66,278 L60,294 L22,278 Z" fill={palette.rib} stroke={inkAccent} strokeWidth="2" />
            <path d="M372,262 L334,278 L340,294 L378,278 Z" fill={palette.rib} stroke={inkAccent} strokeWidth="2" />
            {/* Varsity Wool Body */}
            <path d="M90,94 L148,74 Q200,92 252,74 L310,94 L302,360 L98,360 Z" fill={palette.body} />
            {/* Striped Varsity Ribbed Hem */}
            <rect x="98" y="358" width="204" height="22" rx="3" fill={palette.rib} />
            <line x1="98" y1="366" x2="302" y2="366" stroke="#F4F4F5" strokeWidth="2" opacity="0.8" />
            <line x1="98" y1="373" x2="302" y2="373" stroke={inkAccent} strokeWidth="2" opacity="0.9" />
            {/* Striped Varsity Collar */}
            <path d="M150,74 Q200,104 250,74" fill="none" stroke={palette.rib} strokeWidth="12" strokeLinecap="round" />
            <path d="M152,74 Q200,104 248,74" fill="none" stroke="#F4F4F5" strokeWidth="2" opacity="0.8" />
          </g>
        )}

        {/* SILHOUETTE D: 240 GSM DROP-SHOULDER OVERSIZED & ACID-WASH TEE */}
        {!isHoodie && !isCrewneck && !isVarsity && (
          <g>
            {/* Boxy Dropped Half-Sleeves */}
            <path d="M88,92 L26,184 L68,212 L104,158 Z" fill={palette.sleeve} />
            <path d="M312,92 L374,184 L332,212 L296,158 Z" fill={palette.sleeve} />
            {/* Heavy 240 GSM Boxy Torso */}
            <path d="M88,92 L148,70 Q200,88 252,70 L312,92 L304,372 L96,372 Z" fill={palette.body} />
            {/* Thick 1.2-Inch Ribbed Streetwear Crew Collar */}
            <path d="M148,70 Q200,98 252,70 Q244,58 200,62 Q156,58 148,70 Z" fill={palette.rib} />
            <path d="M152,74 Q200,106 248,74" fill="none" stroke={palette.rib} strokeWidth="9" />
            {/* Inside Neck Branded DTF Label */}
            <rect x="184" y="67" width="32" height="11" rx="1.5" fill="#18181B" stroke={inkAccent} strokeWidth="0.8" />
            <text x="200" y="75" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontWeight="800" letterSpacing="1">RAREEMBER</text>
          </g>
        )}

        {/* LAYER 2: DIE-CUT TRANSPARENT STREETWEAR ARTWORK (Printed directly on the fabric) */}
        <g transform="translate(200, 214)">
          {renderDieCutArtwork(1.08)}
        </g>

        {/* LAYER 3: 3D FABRIC CREASES & STUDIO LIGHTING OVERLAY (Passes OVER the artwork for realism!) */}
        <path
          d="M92,90 L308,90 L304,375 L96,375 Z"
          fill={`url(#fold-drape-${seed})`}
          style={{ mixBlendMode: 'multiply', pointerEvents: 'none' }}
        />

        {/* Subtle Studio Spec Watermark at Bottom */}
        <text x="200" y="422" textAnchor="middle" fill="#A1A1AA" fontSize="8.5" fontWeight="700" letterSpacing="2">
          {palette.name.toUpperCase()} • {isHoodie ? '380 GSM FLEECE HOODIE' : isCrewneck ? '320 GSM CREWNECK' : isVarsity ? '350 GSM VARSITY JACKET' : isAcidWash ? '240 GSM ACID-WASH TEE' : '240 GSM OVERSIZED TEE'}
        </text>
      </svg>
    </div>
  );
}
