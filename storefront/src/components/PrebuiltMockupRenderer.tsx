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
  angle?: 1 | 2 | 3 | 4;
  comboBadge?: string;
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
  className = '',
  angle = 1,
  comboBadge
}: PrebuiltMockupProps) {
  const seed = hashString(id + title);
  const lowerTitle = (title + ' ' + subCategory + ' ' + id).toLowerCase();

  // Determine exact garment silhouette
  const isDeskMat =
    (qikinkSkuPrefix && qikinkSkuPrefix.startsWith('MPad')) ||
    lowerTitle.includes('desk mat') ||
    lowerTitle.includes('gaming pad') ||
    lowerTitle.includes('mouse pad') ||
    id.includes('deskmat') ||
    id.includes('desk-mat');
  const isMug =
    (qikinkSkuPrefix && (qikinkSkuPrefix.startsWith('CMg') || qikinkSkuPrefix.startsWith('EMg'))) ||
    lowerTitle.includes('mug');
  const isVarsity =
    qikinkSkuPrefix === 'UVJ' ||
    lowerTitle.includes('varsity') ||
    lowerTitle.includes('bomber') ||
    id.includes('varsity');
  const isCrewneck =
    qikinkSkuPrefix === 'USs' ||
    lowerTitle.includes('crewneck') ||
    lowerTitle.includes('sweatshirt') ||
    id.includes('crewneck');
  const isHoodie =
    !isCrewneck &&
    !isVarsity &&
    (qikinkSkuPrefix === 'UHd' ||
      qikinkSkuPrefix === 'UZHd' ||
      lowerTitle.includes('hoodie') ||
      id.includes('hoodie'));
  const isAcidWash =
    qikinkSkuPrefix === 'ATe' || lowerTitle.includes('acid') || id.includes('acid');

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

  const gsmLabel = isHoodie
    ? '380 GSM BRUSHED FLEECE'
    : isCrewneck
    ? '320 GSM MINIMALIST FLEECE'
    : isVarsity
    ? '350 GSM WOOL & FLEECE'
    : isAcidWash
    ? '240 GSM ACID-WASH JERSEY'
    : isDeskMat
    ? '900×400×3MM WATER-RESISTANT'
    : '240 GSM COMBED COTTON JERSEY';

  // Central Die-Cut Transparent Artwork
  const renderDieCutArtwork = (scale = 1) => {
    const variant = seed % 5;
    return (
      <g transform={`scale(${scale})`} style={{ mixBlendMode: palette.isLight ? 'multiply' : 'screen' }}>
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

  // =========================================================================
  // ANGLE 4: DIRECT-FROM-LOOM ATELIER COST TRANSPARENCY & TECHNICAL BLUEPRINT
  // =========================================================================
  if (angle === 4) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-[#0C0B0A] overflow-hidden select-none ${className}`}>
        <svg viewBox="0 0 400 440" className="w-full h-full">
          <defs>
            <pattern id={`blueprint-grid-${seed}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#27272A" strokeWidth="0.6" strokeOpacity="0.4" />
            </pattern>
          </defs>
          <rect width="400" height="440" fill="#0C0B0A" />
          <rect width="400" height="440" fill={`url(#blueprint-grid-${seed})`} />

          {/* Blueprint Border & Caliper Corner Notches */}
          <rect x="18" y="18" width="364" height="404" fill="none" stroke="#3F3F46" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />
          <path d="M14,28 L14,14 L28,14 M372,14 L386,14 L386,28 M386,412 L386,426 L372,426 M28,426 L14,426 L14,412" fill="none" stroke={inkAccent} strokeWidth="2" />

          {/* Header Title */}
          <text x="32" y="44" fill={inkAccent} fontSize="8.5" fontWeight="900" letterSpacing="3">
            SPECIFICATION &amp; COST BLUEPRINT
          </text>
          <text x="32" y="66" fill="#FFFFFF" fontSize="15" fontWeight="900" letterSpacing="0.8">
            DIRECT-FROM-LOOM TRANSPARENCY
          </text>
          <text x="32" y="80" fill="#A1A1AA" fontSize="8.5" fontWeight="600" letterSpacing="1.2">
            RAREEMBER™ ATELIER • TIRUPUR HUB, TAMIL NADU
          </text>

          {/* Garment Spec Box */}
          <rect x="32" y="96" width="336" height="52" rx="8" fill="#18181B" stroke="#27272A" strokeWidth="1" />
          <text x="44" y="114" fill="#71717A" fontSize="7.5" fontWeight="800" letterSpacing="2">GARMENT SILHOUETTE &amp; DENSITY</text>
          <text x="44" y="134" fill="#FFFFFF" fontSize="12" fontWeight="900" letterSpacing="1">{gsmLabel}</text>
          <text x="354" y="132" textAnchor="end" fill={inkAccent} fontSize="9" fontWeight="800" letterSpacing="1">100% BIO-WASHED</text>

          {/* Price Transparency Comparison Matrix */}
          <text x="32" y="174" fill="#71717A" fontSize="7.5" fontWeight="800" letterSpacing="2">PRICE ANCHOR COMPARISON</text>

          {/* Row 1: Traditional Luxury */}
          <rect x="32" y="184" width="336" height="42" rx="6" fill="#141416" stroke="#27272A" strokeWidth="1" />
          <text x="44" y="202" fill="#A1A1AA" fontSize="9.5" fontWeight="700">Traditional Mall Luxury Label</text>
          <text x="44" y="216" fill="#71717A" fontSize="7" fontWeight="600">Middleman + Retail Rent + 5× Brand Markup</text>
          <text x="354" y="210" textAnchor="end" fill="#EF4444" fontSize="13" fontWeight="900">₹3,800</text>

          {/* Row 2: RareEmber Direct */}
          <rect x="32" y="234" width="336" height="52" rx="8" fill="#1E1C1A" stroke={inkAccent} strokeWidth="1.5" />
          <text x="44" y="254" fill="#FFFFFF" fontSize="11" fontWeight="900">RareEmber™ Direct Atelier</text>
          <text x="44" y="270" fill="#FDBA74" fontSize="8" fontWeight="700">Tirupur Loom Direct • 0% Middleman • 0% Mall Rent</text>
          <text x="354" y="264" textAnchor="end" fill="#22C55E" fontSize="16" fontWeight="900">₹649–₹1,099</text>

          {/* Sizing Blueprint Grid */}
          <text x="32" y="312" fill="#71717A" fontSize="7.5" fontWeight="800" letterSpacing="2">CHEST &amp; LENGTH ATELIER GRADING</text>
          <g transform="translate(32, 322)">
            <rect width="336" height="48" rx="6" fill="#141416" stroke="#27272A" strokeWidth="1" />
            <text x="28" y="20" textAnchor="middle" fill="#71717A" fontSize="7.5" fontWeight="800">S (38")</text>
            <text x="28" y="36" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontWeight="700">27" L</text>
            <text x="84" y="20" textAnchor="middle" fill="#71717A" fontSize="7.5" fontWeight="800">M (40")</text>
            <text x="84" y="36" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontWeight="700">28" L</text>
            <text x="140" y="20" textAnchor="middle" fill={inkAccent} fontSize="8" fontWeight="900">L (42")</text>
            <text x="140" y="36" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontWeight="900">29" L</text>
            <text x="196" y="20" textAnchor="middle" fill="#71717A" fontSize="7.5" fontWeight="800">XL (44")</text>
            <text x="196" y="36" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontWeight="700">30" L</text>
            <text x="252" y="20" textAnchor="middle" fill="#71717A" fontSize="7.5" fontWeight="800">2XL (46")</text>
            <text x="252" y="36" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontWeight="700">31" L</text>
            <text x="308" y="20" textAnchor="middle" fill="#71717A" fontSize="7.5" fontWeight="800">3XL (48")</text>
            <text x="308" y="36" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontWeight="700">32" L</text>
            <line x1="56" y1="8" x2="56" y2="40" stroke="#27272A" strokeWidth="0.8" />
            <line x1="112" y1="8" x2="112" y2="40" stroke="#27272A" strokeWidth="0.8" />
            <line x1="168" y1="8" x2="168" y2="40" stroke="#27272A" strokeWidth="0.8" />
            <line x1="224" y1="8" x2="224" y2="40" stroke="#27272A" strokeWidth="0.8" />
            <line x1="280" y1="8" x2="280" y2="40" stroke="#27272A" strokeWidth="0.8" />
          </g>

          {/* Guarantee Pill */}
          <rect x="32" y="386" width="336" height="24" rx="12" fill="#18181B" stroke="#27272A" strokeWidth="0.8" />
          <text x="200" y="401" textAnchor="middle" fill="#D4D4D8" fontSize="7.5" fontWeight="700" letterSpacing="1.2">
            QUALITY-CHECKED IN TIRUPUR • BLUE-DART AIR • 7-DAY DOORSTEP EXCHANGE
          </text>
        </svg>
      </div>
    );
  }

  // =========================================================================
  // ANGLE 3: 3× ZOOMED MACRO WEAVE & WOVEN ARCHIVAL NECK LABEL VIEW
  // =========================================================================
  if (angle === 3) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden select-none ${className}`}>
        <svg viewBox="0 0 400 440" className="w-full h-full">
          <defs>
            <pattern id={`fabric-weave-${seed}`} width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M0,3 L3,0 L6,3 L3,6 Z" fill={palette.rib} opacity="0.6" />
              <line x1="0" y1="6" x2="6" y2="0" stroke="#FFFFFF" strokeWidth="0.4" strokeOpacity="0.08" />
            </pattern>
            <radialGradient id={`macro-vignette-${seed}`} cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.75" />
            </radialGradient>
          </defs>

          {/* Fabric Zoom Background */}
          <rect width="400" height="440" fill={palette.body} />
          <rect width="400" height="440" fill={`url(#fabric-weave-${seed})`} />

          {/* Zoomed 1.25-Inch Ribbed Neckband Collar Arc */}
          <path d="M-40,110 Q200,230 440,110" fill="none" stroke={palette.rib} strokeWidth="48" strokeLinecap="round" />
          <path d="M-40,110 Q200,230 440,110" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.1" strokeDasharray="3 4" />
          <path d="M-40,132 Q200,252 440,132" fill="none" stroke="#000000" strokeWidth="3" strokeOpacity="0.45" />

          {/* Studio Zoom Shadow Beneath Collar */}
          <path d="M-20,138 Q200,260 420,138" fill="none" stroke="#000000" strokeWidth="22" strokeOpacity="0.5" />

          {/* Archival Woven Neck Label (Satin Black with Metallic Gold/Ember Ink) */}
          <g transform="translate(110, 160)">
            {/* Label Shadow & Base */}
            <rect x="0" y="0" width="180" height="115" rx="5" fill="#000000" opacity="0.6" transform="translate(4, 6)" />
            <rect x="0" y="0" width="180" height="115" rx="4" fill="#141416" stroke="#27272A" strokeWidth="1.2" />
            {/* Top Loop Fold */}
            <rect x="0" y="0" width="180" height="12" fill="#09090B" />
            <line x1="8" y1="12" x2="172" y2="12" stroke={inkAccent} strokeWidth="1" strokeDasharray="4 2" />

            {/* Label Content */}
            <text x="90" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900" letterSpacing="2.5">
              RAREEMBER™
            </text>
            <text x="90" y="44" textAnchor="middle" fill={inkAccent} fontSize="6.5" fontWeight="800" letterSpacing="2">
              ARCHIVAL DIVISION • ATELIER
            </text>
            <line x1="26" y1="52" x2="154" y2="52" stroke="#27272A" strokeWidth="0.8" />
            <text x="90" y="66" textAnchor="middle" fill="#E4E4E7" fontSize="7.5" fontWeight="800" letterSpacing="1.2">
              {isHoodie ? '380 GSM BRUSHED FLEECE' : isCrewneck ? '320 GSM HEAVYWEIGHT' : '240 GSM COMBED COTTON'}
            </text>
            <text x="90" y="78" textAnchor="middle" fill="#A1A1AA" fontSize="6.5" fontWeight="700" letterSpacing="1">
              100% BIO-WASHED • PRE-SHRUNK
            </text>
            <text x="90" y="90" textAnchor="middle" fill="#71717A" fontSize="6" fontWeight="600" letterSpacing="1.5">
              CRAFTED IN TIRUPUR, INDIA
            </text>
            {/* Size Stamp */}
            <rect x="80" y="95" width="20" height="12" rx="2" fill={inkAccent} />
            <text x="90" y="104" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="900">L</text>
          </g>

          {/* Direct-To-Film Ink Crack-Proof Spec Badge */}
          <g transform="translate(110, 310)">
            <rect x="0" y="0" width="180" height="34" rx="17" fill="#18181B" stroke="#27272A" strokeWidth="1" />
            <text x="90" y="16" textAnchor="middle" fill={inkAccent} fontSize="7" fontWeight="900" letterSpacing="2">
              1200 DPI ARCHIVAL DTF
            </text>
            <text x="90" y="27" textAnchor="middle" fill="#A1A1AA" fontSize="6.5" fontWeight="600" letterSpacing="1">
              50+ WASH ZERO-CRACK GUARANTEE
            </text>
          </g>

          {/* Vignette Lighting */}
          <rect width="400" height="440" fill={`url(#macro-vignette-${seed})`} pointerEvents="none" />
          <text x="200" y="420" textAnchor="middle" fill="#71717A" fontSize="8" fontWeight="700" letterSpacing="2">
            03 / MACRO FABRIC WEAVE &amp; ATELIER LABEL VIEW
          </text>
        </svg>
      </div>
    );
  }

  // =========================================================================
  // ANGLE 2: FRONT MINIMAL CREST & CLEAN DRAPE STUDIO VIEW
  // =========================================================================
  if (angle === 2) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-gradient-to-b from-zinc-900 via-zinc-950 to-black overflow-hidden select-none ${className}`}>
        <svg viewBox="0 0 400 440" className="w-full h-full">
          <defs>
            <linearGradient id={`front-fold-${seed}`} x1="0%" y1="0%" x2="100%" y2="5%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.36" />
              <stop offset="22%" stopColor="#FFFFFF" stopOpacity="0.06" />
              <stop offset="48%" stopColor="#000000" stopOpacity="0.16" />
              <stop offset="76%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
            </linearGradient>
            <radialGradient id={`studio-glow-front-${seed}`} cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor={inkAccent} stopOpacity="0.14" />
              <stop offset="100%" stopColor="#09090B" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="200" cy="210" r="175" fill={`url(#studio-glow-front-${seed})`} />
          <ellipse cx="200" cy="396" rx="115" ry="12" fill="#000000" opacity="0.55" />

          {/* HOODIE FRONT */}
          {isHoodie && (
            <g>
              <path d="M92,102 L32,265 L68,280 L108,168 Z" fill={palette.sleeve} />
              <path d="M308,102 L368,265 L332,280 L292,168 Z" fill={palette.sleeve} />
              <path d="M32,265 L68,280 L62,296 L26,281 Z" fill={palette.rib} />
              <path d="M368,265 L332,280 L338,296 L374,281 Z" fill={palette.rib} />
              <path d="M92,102 Q200,112 308,102 L302,362 L98,362 Z" fill={palette.body} />
              <rect x="98" y="360" width="204" height="22" rx="3" fill={palette.rib} />
              <path d="M134,104 C128,42 162,26 200,26 C238,26 272,42 266,104 Q200,118 134,104 Z" fill={palette.body} stroke="#000000" strokeOpacity="0.35" strokeWidth="2" />
              <path d="M150,104 C150,58 174,44 200,44 C226,44 250,58 250,104 Q200,114 150,104 Z" fill={palette.rib} />
              {/* Kangaroo Pocket */}
              <path d="M132,360 L146,278 L254,278 L268,360 Z" fill={palette.body} stroke="#000000" strokeOpacity="0.25" strokeWidth="1.5" />
              <path d="M146,278 L138,320" stroke="#000000" strokeOpacity="0.35" strokeWidth="1.5" />
              <path d="M254,278 L262,320" stroke="#000000" strokeOpacity="0.35" strokeWidth="1.5" />
            </g>
          )}

          {/* CREWNECK FRONT */}
          {isCrewneck && (
            <g>
              <path d="M90,94 L28,262 L66,278 L108,164 Z" fill={palette.sleeve} />
              <path d="M310,94 L372,262 L334,278 L292,164 Z" fill={palette.sleeve} />
              <path d="M28,262 L66,278 L60,294 L22,278 Z" fill={palette.rib} />
              <path d="M372,262 L334,278 L340,294 L378,278 Z" fill={palette.rib} />
              <path d="M90,94 L148,74 Q200,92 252,74 L310,94 L302,360 L98,360 Z" fill={palette.body} />
              <rect x="98" y="358" width="204" height="22" rx="3" fill={palette.rib} />
              <path d="M148,74 Q200,104 252,74 Q244,62 200,66 Q156,62 148,74 Z" fill={palette.rib} />
              <path d="M156,78 Q200,114 244,78" fill="none" stroke={palette.rib} strokeWidth="9" />
              <polygon points="184,89 216,89 200,114" fill="none" stroke="#000000" strokeOpacity="0.35" strokeWidth="1.8" />
            </g>
          )}

          {/* VARSITY FRONT */}
          {isVarsity && (
            <g>
              <path d="M90,94 L28,262 L66,278 L108,164 Z" fill={palette.sleeve} />
              <path d="M310,94 L372,262 L334,278 L292,164 Z" fill={palette.sleeve} />
              <path d="M28,262 L66,278 L60,294 L22,278 Z" fill={palette.rib} stroke={inkAccent} strokeWidth="2" />
              <path d="M372,262 L334,278 L340,294 L378,278 Z" fill={palette.rib} stroke={inkAccent} strokeWidth="2" />
              <path d="M90,94 L148,74 Q200,92 252,74 L310,94 L302,360 L98,360 Z" fill={palette.body} />
              <line x1="200" y1="92" x2="200" y2="358" stroke="#111114" strokeWidth="5" />
              {/* Snap Buttons */}
              <circle cx="200" cy="120" r="4" fill="#D4D4D8" stroke="#18181B" strokeWidth="1" />
              <circle cx="200" cy="165" r="4" fill="#D4D4D8" stroke="#18181B" strokeWidth="1" />
              <circle cx="200" cy="210" r="4" fill="#D4D4D8" stroke="#18181B" strokeWidth="1" />
              <circle cx="200" cy="255" r="4" fill="#D4D4D8" stroke="#18181B" strokeWidth="1" />
              <circle cx="200" cy="300" r="4" fill="#D4D4D8" stroke="#18181B" strokeWidth="1" />
              <rect x="98" y="358" width="204" height="22" rx="3" fill={palette.rib} />
              <line x1="98" y1="366" x2="302" y2="366" stroke="#F4F4F5" strokeWidth="2" opacity="0.8" />
              <line x1="98" y1="373" x2="302" y2="373" stroke={inkAccent} strokeWidth="2" opacity="0.9" />
              <path d="M150,74 Q200,104 250,74" fill="none" stroke={palette.rib} strokeWidth="12" strokeLinecap="round" />
            </g>
          )}

          {/* OVERSIZED TEE FRONT */}
          {!isHoodie && !isCrewneck && !isVarsity && !isDeskMat && (
            <g>
              <path d="M88,92 L26,184 L68,212 L104,158 Z" fill={palette.sleeve} />
              <path d="M312,92 L374,184 L332,212 L296,158 Z" fill={palette.sleeve} />
              <path d="M88,92 L148,70 Q200,88 252,70 L312,92 L304,372 L96,372 Z" fill={palette.body} />
              <path d="M148,70 Q200,98 252,70 Q244,58 200,62 Q156,58 148,70 Z" fill={palette.rib} />
              <path d="M152,74 Q200,106 248,74" fill="none" stroke={palette.rib} strokeWidth="9" />
            </g>
          )}

          {/* MINIMAL LEFT-CHEST ARCHIVAL CREST (Angle 2 Signature) */}
          {!isDeskMat && (
            <g transform="translate(155, 172)" style={{ mixBlendMode: palette.isLight ? 'multiply' : 'screen' }}>
              <circle cx="0" cy="0" r="16" fill="none" stroke={inkAccent} strokeWidth="1.5" />
              <circle cx="0" cy="0" r="12" fill="none" stroke={inkPrimary} strokeWidth="0.8" strokeDasharray="2 2" />
              <text x="0" y="3" textAnchor="middle" fill={inkPrimary} fontSize="7" fontWeight="900" letterSpacing="1">
                RE
              </text>
              <text x="0" y="24" textAnchor="middle" fill={inkPrimary} fontSize="5" fontWeight="800" letterSpacing="1.2">
                EST. 2026
              </text>
              <text x="0" y="31" textAnchor="middle" fill={inkAccent} fontSize="4.5" fontWeight="900" letterSpacing="1.5">
                TIRUPUR
              </text>
            </g>
          )}

          {/* 3D Fabric Drape Shadow */}
          <path
            d="M92,90 L308,90 L304,375 L96,375 Z"
            fill={`url(#front-fold-${seed})`}
            style={{ mixBlendMode: 'multiply', pointerEvents: 'none' }}
          />

          <text x="200" y="422" textAnchor="middle" fill="#A1A1AA" fontSize="8" fontWeight="700" letterSpacing="2">
            02 / FRONT MINIMAL CREST &amp; TAILORED DRAPE
          </text>
        </svg>
      </div>
    );
  }

  // =========================================================================
  // ANGLE 1: HERO MAIN/BACK ARTWORK STUDIO FLAT-LAY (Default)
  // =========================================================================
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
          <rect width="400" height="400" fill={`url(#desk-glow-${seed})`} />
          <rect x="32" y="116" width="344" height="165" rx="14" fill="#000000" opacity="0.65" />
          <g clipPath={`url(#mat-clip-${seed})`}>
            <rect x="28" y="110" width="344" height="165" fill={palette.body} />
            <path d="M28,145 Q140,120 240,165 T372,140 M28,225 Q160,190 270,240 T372,210" fill="none" stroke={inkAccent} strokeWidth="1.5" opacity="0.35" />
            <circle cx="290" cy="192" r="68" fill={inkAccent} opacity="0.18" />
            <g transform="translate(200, 188)">
              {renderDieCutArtwork(0.82)}
            </g>
          </g>
          <rect x="28" y="110" width="344" height="165" rx="14" fill="none" stroke={inkAccent} strokeWidth="2.5" strokeDasharray="4 2" opacity="0.85" />
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

  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-gradient-to-b from-zinc-900 via-zinc-950 to-black overflow-hidden select-none ${className}`}>
      <svg viewBox="0 0 400 440" className="w-full h-full">
        <defs>
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

        <circle cx="200" cy="210" r="175" fill={`url(#studio-vignette-${seed})`} />
        <ellipse cx="200" cy="396" rx="115" ry="12" fill="#000000" opacity="0.55" />

        {/* SILHOUETTE A: 380 GSM HEAVYWEIGHT HOODIE */}
        {isHoodie && (
          <g>
            <path d="M92,102 L32,265 L68,280 L108,168 Z" fill={palette.sleeve} />
            <path d="M308,102 L368,265 L332,280 L292,168 Z" fill={palette.sleeve} />
            <path d="M32,265 L68,280 L62,296 L26,281 Z" fill={palette.rib} />
            <path d="M368,265 L332,280 L338,296 L374,281 Z" fill={palette.rib} />
            <path d="M92,102 Q200,112 308,102 L302,362 L98,362 Z" fill={palette.body} />
            <rect x="98" y="360" width="204" height="22" rx="3" fill={palette.rib} />
            <path d="M134,104 C128,42 162,26 200,26 C238,26 272,42 266,104 Q200,118 134,104 Z" fill={palette.body} stroke="#000000" strokeOpacity="0.35" strokeWidth="2" />
            <path d="M150,104 C150,58 174,44 200,44 C226,44 250,58 250,104 Q200,114 150,104 Z" fill={palette.rib} />
            <rect x="184" y="84" width="32" height="12" rx="1.5" fill="#18181B" stroke={inkAccent} strokeWidth="0.8" />
            <text x="200" y="92" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontWeight="800" letterSpacing="1">RAREEMBER</text>
            <path d="M132,360 L146,298 L254,298 L268,360" fill="none" stroke="#000000" strokeOpacity="0.28" strokeWidth="2" />
          </g>
        )}

        {/* SILHOUETTE B: 320 GSM CREWNECK (Zero Hood, No Strings) */}
        {isCrewneck && (
          <g>
            <path d="M90,94 L28,262 L66,278 L108,164 Z" fill={palette.sleeve} />
            <path d="M310,94 L372,262 L334,278 L292,164 Z" fill={palette.sleeve} />
            <path d="M28,262 L66,278 L60,294 L22,278 Z" fill={palette.rib} />
            <path d="M372,262 L334,278 L340,294 L378,278 Z" fill={palette.rib} />
            <path d="M90,94 L148,74 Q200,92 252,74 L310,94 L302,360 L98,360 Z" fill={palette.body} />
            <rect x="98" y="358" width="204" height="22" rx="3" fill={palette.rib} />
            <path d="M148,74 Q200,104 252,74 Q244,62 200,66 Q156,62 148,74 Z" fill={palette.rib} />
            <path d="M156,78 Q200,114 244,78" fill="none" stroke={palette.rib} strokeWidth="9" />
            <polygon points="184,89 216,89 200,114" fill="none" stroke="#000000" strokeOpacity="0.35" strokeWidth="1.8" />
            <rect x="184" y="70" width="32" height="11" rx="1.5" fill="#18181B" stroke={inkAccent} strokeWidth="0.8" />
            <text x="200" y="78" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontWeight="800" letterSpacing="1">RAREEMBER</text>
          </g>
        )}

        {/* SILHOUETTE C: 350 GSM CONTRAST VARSITY JACKET */}
        {isVarsity && (
          <g>
            <path d="M90,94 L28,262 L66,278 L108,164 Z" fill={palette.sleeve} />
            <path d="M310,94 L372,262 L334,278 L292,164 Z" fill={palette.sleeve} />
            <path d="M28,262 L66,278 L60,294 L22,278 Z" fill={palette.rib} stroke={inkAccent} strokeWidth="2" />
            <path d="M372,262 L334,278 L340,294 L378,278 Z" fill={palette.rib} stroke={inkAccent} strokeWidth="2" />
            <path d="M90,94 L148,74 Q200,92 252,74 L310,94 L302,360 L98,360 Z" fill={palette.body} />
            <rect x="98" y="358" width="204" height="22" rx="3" fill={palette.rib} />
            <line x1="98" y1="366" x2="302" y2="366" stroke="#F4F4F5" strokeWidth="2" opacity="0.8" />
            <line x1="98" y1="373" x2="302" y2="373" stroke={inkAccent} strokeWidth="2" opacity="0.9" />
            <path d="M150,74 Q200,104 250,74" fill="none" stroke={palette.rib} strokeWidth="12" strokeLinecap="round" />
            <path d="M152,74 Q200,104 248,74" fill="none" stroke="#F4F4F5" strokeWidth="2" opacity="0.8" />
          </g>
        )}

        {/* SILHOUETTE D: 240 GSM DROP-SHOULDER OVERSIZED TEE */}
        {!isHoodie && !isCrewneck && !isVarsity && (
          <g>
            <path d="M88,92 L26,184 L68,212 L104,158 Z" fill={palette.sleeve} />
            <path d="M312,92 L374,184 L332,212 L296,158 Z" fill={palette.sleeve} />
            <path d="M88,92 L148,70 Q200,88 252,70 L312,92 L304,372 L96,372 Z" fill={palette.body} />
            <path d="M148,70 Q200,98 252,70 Q244,58 200,62 Q156,58 148,70 Z" fill={palette.rib} />
            <path d="M152,74 Q200,106 248,74" fill="none" stroke={palette.rib} strokeWidth="9" />
            <rect x="184" y="67" width="32" height="11" rx="1.5" fill="#18181B" stroke={inkAccent} strokeWidth="0.8" />
            <text x="200" y="75" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontWeight="800" letterSpacing="1">RAREEMBER</text>
          </g>
        )}

        {/* MAIN OVERSIZED ARTWORK */}
        <g transform="translate(200, 214)">
          {renderDieCutArtwork(1.08)}
        </g>

        {/* 3D FABRIC CREASES & STUDIO LIGHTING OVERLAY */}
        <path
          d="M92,90 L308,90 L304,375 L96,375 Z"
          fill={`url(#fold-drape-${seed})`}
          style={{ mixBlendMode: 'multiply', pointerEvents: 'none' }}
        />

        {/* Subtle Bottom Woven Brand Tag */}
        <g transform="translate(104, 344)">
          <rect width="72" height="12" rx="2" fill="#0D0D0F" stroke="#27272A" strokeWidth="0.8" />
          <text x="36" y="8.5" textAnchor="middle" fill="#A1A1AA" fontSize="5" fontWeight="800" letterSpacing="1.2">
            ATELIER • TIRUPUR LOOM
          </text>
        </g>

        {/* Corner Inset Badge for Combos */}
        {comboBadge && (
          <g transform="translate(376, 26)">
            <rect x="-140" y="0" width="140" height="24" rx="12" fill="#000000" fillOpacity="0.88" stroke={inkAccent} strokeWidth="1" />
            <text x="-70" y="15.5" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="800" letterSpacing="1.2">
              {comboBadge.toUpperCase()}
            </text>
          </g>
        )}

        <text x="200" y="422" textAnchor="middle" fill="#A1A1AA" fontSize="8.5" fontWeight="700" letterSpacing="2">
          {palette.name.toUpperCase()} • {gsmLabel}
        </text>
      </svg>
    </div>
  );
}
