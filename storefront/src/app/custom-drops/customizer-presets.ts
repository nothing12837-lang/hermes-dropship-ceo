export interface GraphicPreset {
  id: string;
  name: string;
  category: string;
  dataUrl: string;
  defaultScale: number;
}

export const STREETWEAR_GRAPHIC_PRESETS: GraphicPreset[] = [
  {
    id: 'ember-flame',
    name: 'Rare Ember Flame',
    category: 'Brand Icon',
    defaultScale: 1.0,
    dataUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
        <defs>
          <linearGradient id="flameGrad" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FFF078"/>
            <stop offset="35%" stop-color="#FF9A3D"/>
            <stop offset="70%" stop-color="#FF4D24"/>
            <stop offset="100%" stop-color="#D91E18"/>
          </linearGradient>
          <linearGradient id="innerGrad" x1="100" y1="60" x2="100" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="60%" stop-color="#FFE600"/>
            <stop offset="100%" stop-color="#FF4D24"/>
          </linearGradient>
        </defs>
        <path d="M100 10 C100 10 135 60 145 95 C152 120 145 150 125 172 C115 183 95 190 75 180 C50 168 45 138 52 110 C58 85 80 62 85 35 C88 50 95 62 90 75 C105 50 100 10 100 10 Z" fill="url(#flameGrad)" />
        <path d="M100 65 C100 65 118 95 120 115 C122 130 115 150 102 162 C95 168 85 170 78 163 C68 154 68 135 74 118 C80 100 95 85 100 65 Z" fill="url(#innerGrad)" />
      </svg>
    `),
  },
  {
    id: 'tokyo-kanji',
    name: '東京 Cyber Kanji',
    category: 'Japanese Streetwear',
    defaultScale: 1.1,
    dataUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="90" stroke="#FF4D24" stroke-width="4" stroke-dasharray="10 6" opacity="0.8"/>
        <circle cx="100" cy="100" r="76" stroke="#FFFFFF" stroke-width="2" opacity="0.4"/>
        <text x="100" y="90" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="52" text-anchor="middle" letter-spacing="4">東</text>
        <text x="100" y="150" fill="#FF4D24" font-family="system-ui, sans-serif" font-weight="900" font-size="52" text-anchor="middle" letter-spacing="4">京</text>
        <text x="100" y="180" fill="#AAAAAA" font-family="monospace" font-weight="700" font-size="10" text-anchor="middle" letter-spacing="5">RARE EMBER • 2026</text>
      </svg>
    `),
  },
  {
    id: 'archival-cross',
    name: 'Heraldic Cross',
    category: 'Archival Luxury',
    defaultScale: 1.0,
    dataUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
        <path d="M92 20 H108 V70 H158 V86 H108 V180 H92 V86 H42 V70 H92 Z" fill="#FFFFFF"/>
        <circle cx="100" cy="78" r="48" stroke="#FF4D24" stroke-width="3" fill="none"/>
        <polygon points="100,10 106,30 94,30" fill="#FF4D24"/>
        <polygon points="100,190 106,170 94,170" fill="#FF4D24"/>
        <polygon points="35,78 55,84 55,72" fill="#FF4D24"/>
        <polygon points="165,78 145,84 145,72" fill="#FF4D24"/>
        <circle cx="100" cy="78" r="8" fill="#FF4D24"/>
      </svg>
    `),
  },
  {
    id: 'cyber-skull',
    name: 'Cyber Circuit Skull',
    category: 'Mecha & Tech',
    defaultScale: 1.1,
    dataUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
        <path d="M50 85 C50 45 70 30 100 30 C130 30 150 45 150 85 C150 110 140 125 130 135 L130 160 L70 160 L70 135 C60 125 50 110 50 85 Z" stroke="#06B6D4" stroke-width="5" fill="#0A0F1D"/>
        <circle cx="80" cy="95" r="16" fill="#06B6D4"/>
        <circle cx="120" cy="95" r="16" fill="#06B6D4"/>
        <path d="M100 115 L92 128 L108 128 Z" fill="#FFFFFF"/>
        <line x1="82" y1="145" x2="82" y2="160" stroke="#06B6D4" stroke-width="3"/>
        <line x1="100" y1="145" x2="100" y2="160" stroke="#06B6D4" stroke-width="3"/>
        <line x1="118" y1="145" x2="118" y2="160" stroke="#06B6D4" stroke-width="3"/>
        <path d="M30 100 L50 85 M170 100 L150 85 M100 15 L100 30" stroke="#06B6D4" stroke-width="3"/>
      </svg>
    `),
  },
  {
    id: 'speed-99',
    name: 'Speed Club 99',
    category: 'Motorsport',
    defaultScale: 1.15,
    dataUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
        <rect x="20" y="30" width="160" height="140" rx="16" fill="#18181B" stroke="#F59E0B" stroke-width="4"/>
        <text x="100" y="62" fill="#F59E0B" font-family="system-ui, sans-serif" font-weight="900" font-size="14" text-anchor="middle" letter-spacing="6">RARE EMBER</text>
        <text x="100" y="132" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="72" text-anchor="middle" font-style="italic">99</text>
        <text x="100" y="155" fill="#A1A1AA" font-family="monospace" font-weight="700" font-size="10" text-anchor="middle" letter-spacing="3">RACING DIVISION • BLR</text>
      </svg>
    `),
  },
  {
    id: 'aura-sun',
    name: 'Aura Sunburst',
    category: 'Celestial',
    defaultScale: 1.0,
    dataUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="38" fill="#FF4D24"/>
        <g stroke="#FF9A3D" stroke-width="3" stroke-linecap="round">
          <line x1="100" y1="25" x2="100" y2="45"/>
          <line x1="100" y1="155" x2="100" y2="175"/>
          <line x1="25" y1="100" x2="45" y2="100"/>
          <line x1="155" y1="100" x2="175" y2="100"/>
          <line x1="47" y1="47" x2="61" y2="61"/>
          <line x1="139" y1="139" x2="153" y2="153"/>
          <line x1="47" y1="153" x2="61" y2="139"/>
          <line x1="139" y1="61" x2="153" y2="47"/>
        </g>
        <circle cx="100" cy="100" r="22" fill="#FFF078"/>
      </svg>
    `),
  },
  {
    id: 'acid-smiley',
    name: 'Acid Street Smiley',
    category: 'Retro Underground',
    defaultScale: 1.0,
    dataUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="75" fill="#FACC15" stroke="#000000" stroke-width="7"/>
        <ellipse cx="78" cy="82" rx="7" ry="14" fill="#000000"/>
        <ellipse cx="122" cy="82" rx="7" ry="14" fill="#000000"/>
        <path d="M68 120 C80 148 120 148 132 120 C134 116 128 114 126 117 C116 138 84 138 74 117 C72 114 66 116 68 120 Z" fill="#000000"/>
        <circle cx="140" cy="55" r="10" fill="#FF4D24"/>
      </svg>
    `),
  },
  {
    id: 'box-logo',
    name: 'Box Bar',
    category: 'Minimalist Stamp',
    defaultScale: 1.25,
    dataUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" fill="none">
        <rect x="5" y="5" width="230" height="60" rx="8" fill="#FF4D24"/>
        <text x="120" y="44" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="5" font-style="italic">RARE EMBER</text>
      </svg>
    `),
  },
];

export interface TextFontOption {
  id: string;
  label: string;
  className: string;
}

export const TEXT_FONT_OPTIONS: TextFontOption[] = [
  { id: 'impact', label: 'Streetwear Heavy', className: 'font-sans font-black uppercase tracking-wider' },
  { id: 'mono', label: 'Cyber Monospace', className: 'font-mono font-bold uppercase tracking-widest' },
  { id: 'varsity', label: 'Varsity Athletic', className: 'font-sans font-extrabold uppercase tracking-tight' },
  { id: 'serif', label: 'Luxury Serif', className: 'font-serif font-black italic' },
  { id: 'minimal', label: 'Swiss Minimal', className: 'font-sans font-semibold uppercase tracking-[0.25em]' },
  { id: 'gothic', label: 'Gothic Script', className: 'font-serif font-bold italic tracking-wide' },
];

export interface TextColorOption {
  name: string;
  hex: string;
  border?: string;
}

export const TEXT_COLOR_OPTIONS: TextColorOption[] = [
  { name: 'Pure White', hex: '#FFFFFF', border: 'border-white/40' },
  { name: 'Pitch Black', hex: '#111111', border: 'border-black' },
  { name: 'Ember Orange', hex: '#FF4D24' },
  { name: 'Cyber Gold', hex: '#F59E0B' },
  { name: 'Electric Cyan', hex: '#06B6D4' },
  { name: 'Crimson Flame', hex: '#EF4444' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Cyber Violet', hex: '#A855F7' },
];
