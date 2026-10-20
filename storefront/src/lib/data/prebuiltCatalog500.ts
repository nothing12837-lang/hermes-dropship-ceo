// storefront/src/lib/data/prebuiltCatalog500.ts

export interface PrebuiltDesignTheme {
  designId: string;
  title: string;
  collection: string;
  tagline: string;
  placement: 'Back Oversized (12"×14") + Front Chest Crest' | 'Front Center Archival (10"×12")';
  accentHex: string;
  badgeText: string;
  svgMotif: 'ronin' | 'cyber' | 'code' | 'chai' | 'chakra' | 'varsity' | 'motorsport' | 'acid' | 'stoic' | 'bauhaus';
}

export const HUNDRED_INDIAN_TRENDING_DESIGNS: PrebuiltDesignTheme[] = [
  // 1. BENGALURU TECH, AI & 3AM STARTUP CLUB (10 Designs)
  { designId: 'blr-01', title: '3AM Indiranagar Founder Club', collection: 'Bengaluru Tech & Builders', tagline: 'Build in silence on 100ft Road, ship to the world at 3AM.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F97316', badgeText: 'BLR TECH DROP', svgMotif: 'code' },
  { designId: 'blr-02', title: 'Git Commit Or Die Trying', collection: 'Bengaluru Tech & Builders', tagline: 'Zero merge conflicts, 100% production grade streetwear.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#10B981', badgeText: 'DEV BESTSELLER', svgMotif: 'code' },
  { designId: 'blr-03', title: 'Koramangala Stealth Mode Startup', collection: 'Bengaluru Tech & Builders', tagline: 'Pre-seed, caffeinated, and building the next unicorn.', placement: 'Front Center Archival (10"×12")', accentHex: '#3B82F6', badgeText: 'FOUNDER EDITION', svgMotif: 'code' },
  { designId: 'blr-04', title: '404 Sleep Not Found — Nocturnal Engineer', collection: 'Bengaluru Tech & Builders', tagline: 'Powered by dark mode, mechanical keyboards, and filter coffee.', placement: 'Front Center Archival (10"×12")', accentHex: '#A855F7', badgeText: 'NIGHT CODER', svgMotif: 'code' },
  { designId: 'blr-05', title: 'Linux Kernel Panic Archival', collection: 'Bengaluru Tech & Builders', tagline: 'Retro green-phosphor terminal dump for systems engineers.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#22C55E', badgeText: 'SYSTEMS CORE', svgMotif: 'code' },
  { designId: 'blr-06', title: 'I Test In Production Hazard Crew', collection: 'Bengaluru Tech & Builders', tagline: 'Friday 5PM deployment energy in heavyweight cotton.', placement: 'Front Center Archival (10"×12")', accentHex: '#EAB308', badgeText: 'DEV HUMOR', svgMotif: 'code' },
  { designId: 'blr-07', title: 'Localhost:3000 Full-Stack Architect', collection: 'Bengaluru Tech & Builders', tagline: 'From localhost to global edge network.', placement: 'Front Center Archival (10"×12")', accentHex: '#06B6D4', badgeText: 'NEXT-GEN DEV', svgMotif: 'code' },
  { designId: 'blr-08', title: 'GPU Cluster Overclocked AI Lab', collection: 'Bengaluru Tech & Builders', tagline: 'Training weights while the city sleeps.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#EC4899', badgeText: 'AI BUILDER', svgMotif: 'cyber' },
  { designId: 'blr-09', title: 'Zero VC Pure Bootstrapped Mafia', collection: 'Bengaluru Tech & Builders', tagline: 'Customer-funded, profitable from day one.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F97316', badgeText: 'BOOTSTRAPPED', svgMotif: 'stoic' },
  { designId: 'blr-10', title: 'HSR Layout Builders Syndicate', collection: 'Bengaluru Tech & Builders', tagline: 'Sector 2 co-working nights and shipping streaks.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#14B8A6', badgeText: 'HSR SYNDICATE', svgMotif: 'code' },

  // 2. DESI STREET CULTURE, CHAI & RETRO INDIA (10 Designs)
  { designId: 'desi-01', title: 'Cutting Chai & Midnight Hustle', collection: 'Desi Street Culture', tagline: 'Tapri glass aesthetics blended with heavy Tokyo streetwear.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#D97706', badgeText: 'DESI STREET', svgMotif: 'chai' },
  { designId: 'desi-02', title: 'Filter Kaapi Club 560001', collection: 'Desi Street Culture', tagline: 'Brass davara-tumbler heritage for South India creators.', placement: 'Front Center Archival (10"×12")', accentHex: '#B45309', badgeText: 'BLR KAAPI CLUB', svgMotif: 'chai' },
  { designId: 'desi-03', title: 'Meter Down — Mumbai Night Auto', collection: 'Desi Street Culture', tagline: 'Black-and-yellow retro meter typography for maximum street cred.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#FACC15', badgeText: 'BOMBAY DROP', svgMotif: 'motorsport' },
  { designId: 'desi-04', title: 'Horn OK Please Cyber-Truck Art', collection: 'Desi Street Culture', tagline: 'Indian highway hand-painted typography remixed in neo-vector.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#EF4444', badgeText: 'HIGHWAY ART', svgMotif: 'acid' },
  { designId: 'desi-05', title: 'Delhi Winter Fog & Shaadi Season', collection: 'Desi Street Culture', tagline: 'Engineered for 8°C North Indian January nights.', placement: 'Front Center Archival (10"×12")', accentHex: '#60A5FA', badgeText: 'NORTH WINTER', svgMotif: 'varsity' },
  { designId: 'desi-06', title: '2AM Hostel Maggi & Dreams', collection: 'Desi Street Culture', tagline: 'Every Indian engineer and creator origin story.', placement: 'Front Center Archival (10"×12")', accentHex: '#FBBF24', badgeText: 'HOSTEL LEGEND', svgMotif: 'chai' },
  { designId: 'desi-07', title: 'Gully Sound System 1998 Hip-Hop', collection: 'Desi Street Culture', tagline: 'Boombox vinyl aesthetics for the Indian underground scene.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F43F5E', badgeText: 'DESI HIP-HOP', svgMotif: 'acid' },
  { designId: 'desi-08', title: 'Pune FC Road Cold Brew Club', collection: 'Desi Street Culture', tagline: 'Campus cafes, vintage bikes, and crisp winter evenings.', placement: 'Front Center Archival (10"×12")', accentHex: '#10B981', badgeText: 'PUNE EDITION', svgMotif: 'chai' },
  { designId: 'desi-09', title: 'Hyderabad Irani Chai & Osmania Syndicate', collection: 'Desi Street Culture', tagline: 'Charminar midnight drives and high-tech city energy.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F59E0B', badgeText: 'HYD EDITION', svgMotif: 'chai' },
  { designId: 'desi-10', title: 'Made In Tirupur — 240 GSM Craft', collection: 'Desi Street Culture', tagline: 'Celebrating India textile capital with archival minimalism.', placement: 'Front Center Archival (10"×12")', accentHex: '#EA580C', badgeText: 'DOMESTIC CRAFT', svgMotif: 'bauhaus' },

  // 3. MODERN INDIAN MYTHOLOGY & WARRIOR AESTHETICS (10 Designs)
  { designId: 'myth-01', title: 'Sudarshana Chakra Cyber-Mandala', collection: 'Modern Bharatiya Warrior', tagline: 'Sacred geometric precision rendered in 1200 DPI line art.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F97316', badgeText: 'BHARAT ARCHIVE', svgMotif: 'chakra' },
  { designId: 'myth-02', title: 'Garuda Spec-Ops Tactical Wings', collection: 'Modern Bharatiya Warrior', tagline: 'Mythological speed meets modern tactical streetwear.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#EAB308', badgeText: 'WARRIOR DROP', svgMotif: 'chakra' },
  { designId: 'myth-03', title: 'Trishul & Damaru Minimalist Shadow', collection: 'Modern Bharatiya Warrior', tagline: 'High-contrast charcoal and terracotta spiritual strength.', placement: 'Front Center Archival (10"×12")', accentHex: '#EA580C', badgeText: 'SHIVA EDITION', svgMotif: 'chakra' },
  { designId: 'myth-04', title: 'Kurukshetra Dharma Protocol', collection: 'Modern Bharatiya Warrior', tagline: 'Focus on the action, never the fruit — Gita Ch. 2 Verse 47.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F59E0B', badgeText: 'KARMA YOGA', svgMotif: 'chakra' },
  { designId: 'myth-05', title: 'Agni Sacred Ember Rising', collection: 'Modern Bharatiya Warrior', tagline: 'Born from fire, forged for winter.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#EF4444', badgeText: 'SIGNATURE DROP', svgMotif: 'acid' },
  { designId: 'myth-06', title: 'Rudra Himalayan Storm Fury', collection: 'Modern Bharatiya Warrior', tagline: 'Heavyweight protection inspired by high-altitude tempests.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#38BDF8', badgeText: 'WINTER STORM', svgMotif: 'chakra' },
  { designId: 'myth-07', title: 'Gandiva Celestial Archer Blueprint', collection: 'Modern Bharatiya Warrior', tagline: 'Unwavering aim — sees only the eye of the bird.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F97316', badgeText: 'ARCHER SPEC', svgMotif: 'chakra' },
  { designId: 'myth-08', title: 'Kalaripayattu Ancient Martial Club', collection: 'Modern Bharatiya Warrior', tagline: 'Honoring the world oldest martial art in heavyweight fleece.', placement: 'Front Center Archival (10"×12")', accentHex: '#DC2626', badgeText: 'MARTIAL HERITAGE', svgMotif: 'ronin' },
  { designId: 'myth-09', title: 'Ashoka Four-Lion Street Crest', collection: 'Modern Bharatiya Warrior', tagline: 'Sovereign heritage typography with bold chest emblem.', placement: 'Front Center Archival (10"×12")', accentHex: '#D97706', badgeText: 'HERITAGE CREST', svgMotif: 'varsity' },
  { designId: 'myth-10', title: 'Yali Temple Guardian Beast', collection: 'Modern Bharatiya Warrior', tagline: 'Dravidian architectural sculpture reimagined for streetwear.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F97316', badgeText: 'DRAVIDIAN ART', svgMotif: 'chakra' },

  // 4. JAPANESE ANIME, RONIN & DARK MANGA (10 Designs)
  { designId: 'jpn-01', title: 'Midnight Ronin Crimson Slash', collection: 'Tokyo & Ronin Archive', tagline: 'Masterless samurai ink wash with crimson katana arc.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#EF4444', badgeText: '#1 WINTER SELLER', svgMotif: 'ronin' },
  { designId: 'jpn-02', title: 'Tokyo Cyber-Mecha Unit-09', collection: 'Tokyo & Ronin Archive', tagline: 'Mechanical exoskeleton schematic with Japanese kanji callouts.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#06B6D4', badgeText: 'CYBER MECHA', svgMotif: 'cyber' },
  { designId: 'jpn-03', title: 'Shibuya Scramble Night-Runners', collection: 'Tokyo & Ronin Archive', tagline: 'Neon rain and midnight asphalt matrix.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#A855F7', badgeText: 'SHIBUYA DROP', svgMotif: 'cyber' },
  { designId: 'jpn-04', title: 'The Great Ember Wave of Kanagawa', collection: 'Tokyo & Ronin Archive', tagline: 'Ukiyo-e woodblock ocean wave fused with terracotta embers.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F97316', badgeText: 'ARTIST SERIES', svgMotif: 'ronin' },
  { designId: 'jpn-05', title: 'Berserk Dark Eclipse Engraving', collection: 'Tokyo & Ronin Archive', tagline: 'High-contrast dark manga crosshatching for heavy metal aesthetics.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#DC2626', badgeText: 'DARK MANGA', svgMotif: 'ronin' },
  { designId: 'jpn-06', title: 'Kyoto Bonsai Zen Serenity', collection: 'Tokyo & Ronin Archive', tagline: 'Minimalist ink-wash pine bonsai with haiku typography.', placement: 'Front Center Archival (10"×12")', accentHex: '#10B981', badgeText: 'ZEN MINIMAL', svgMotif: 'bauhaus' },
  { designId: 'jpn-07', title: 'Neo-Tokyo 2088 Capsule Drift', collection: 'Tokyo & Ronin Archive', tagline: 'Cyberpunk motorcycle club tribute in 300 DPI vector.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#EF4444', badgeText: '2088 DRIFT', svgMotif: 'motorsport' },
  { designId: 'jpn-08', title: 'Bushido Seven Virtues Code', collection: 'Tokyo & Ronin Archive', tagline: 'Rectitude, Courage, Honor, and Loyalty in vertical kanji.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F59E0B', badgeText: 'BUSHIDO CODE', svgMotif: 'ronin' },
  { designId: 'jpn-09', title: 'Shadow Shinobi Hidden Village', collection: 'Tokyo & Ronin Archive', tagline: 'Stealth black-on-charcoal tactical anime streetwear.', placement: 'Front Center Archival (10"×12")', accentHex: '#6366F1', badgeText: 'STEALTH ANIME', svgMotif: 'ronin' },
  { designId: 'jpn-10', title: 'Koi Dragon Waterfall Ascension', collection: 'Tokyo & Ronin Archive', tagline: 'Traditional irezumi tattoo artwork scaled for oversized backs.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F97316', badgeText: 'IREZUMI INK', svgMotif: 'ronin' },

  // 5. INDIAN COLLEGE FEST, CAMPUS & VARSITY HERITAGE (10 Designs)
  { designId: 'cam-01', title: 'Founding Builder 1998 Varsity', collection: 'Campus & Varsity Division', tagline: 'Chenille-style collegiate monogram built for winter fests.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F97316', badgeText: 'FEST HEADLINER', svgMotif: 'varsity' },
  { designId: 'cam-02', title: 'Backbencher CEO Venture Club', collection: 'Campus & Varsity Division', tagline: '75% attendance survivor, 100% founder mentality.', placement: 'Front Center Archival (10"×12")', accentHex: '#10B981', badgeText: 'CAMPUS VIRAL', svgMotif: 'varsity' },
  { designId: 'cam-03', title: 'Class Of 2027 Archival Athletics', collection: 'Campus & Varsity Division', tagline: 'Heavyweight varsity typography for final-year legends.', placement: 'Front Center Archival (10"×12")', accentHex: '#3B82F6', badgeText: 'CLASS OF 27', svgMotif: 'varsity' },
  { designId: 'cam-04', title: 'Hostel Block-C Midnight Poker & Fifa', collection: 'Campus & Varsity Division', tagline: 'Wing brotherhood immortalized in 380 GSM fleece.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#EAB308', badgeText: 'HOSTEL SQUAD', svgMotif: 'varsity' },
  { designId: 'cam-05', title: 'Ivy League Startup Mafia India', collection: 'Campus & Varsity Division', tagline: 'Old-money collegiate crest meets Bengaluru tech ambition.', placement: 'Front Center Archival (10"×12")', accentHex: '#10B981', badgeText: 'OLD MONEY', svgMotif: 'varsity' },
  { designId: 'cam-06', title: 'Campus Battle Of Bands Backstage', collection: 'Campus & Varsity Division', tagline: 'Distressed tour poster graphic for December cultural fests.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#EC4899', badgeText: 'CULTURAL FEST', svgMotif: 'acid' },
  { designId: 'cam-07', title: 'Semester End All-Nighter Survival', collection: 'Campus & Varsity Division', tagline: 'One night, six units, infinite caffeine.', placement: 'Front Center Archival (10"×12")', accentHex: '#F97316', badgeText: 'EXAM SEASON', svgMotif: 'code' },
  { designId: 'cam-08', title: 'Hackathon 48-Hour Winner Division', collection: 'Campus & Varsity Division', tagline: 'Built for teams that ship working demos before Sunday noon.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#06B6D4', badgeText: 'HACKATHON PRO', svgMotif: 'code' },
  { designId: 'cam-09', title: 'Robotics & Aero Modelling Club', collection: 'Campus & Varsity Division', tagline: 'Precision CAD drone and rover schematic on heavy cotton.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#38BDF8', badgeText: 'TECH FEST', svgMotif: 'cyber' },
  { designId: 'cam-10', title: 'RareEmber Athletic Dept. Track Club', collection: 'Campus & Varsity Division', tagline: 'Clean vintage sports typography for everyday layering.', placement: 'Front Center Archival (10"×12")', accentHex: '#EA580C', badgeText: 'ATHLETIC DEPT', svgMotif: 'varsity' },

  // 6. WINTER MOTORSPORT, F1 & HIMALAYAN RIDERS (10 Designs)
  { designId: 'mot-01', title: 'Monaco 1988 V12 Heritage Grand Prix', collection: 'Motorsport & Riders', tagline: 'Golden-era open-wheel racing poster with telemetry specs.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#EF4444', badgeText: 'PADDOCK CLUB', svgMotif: 'motorsport' },
  { designId: 'mot-02', title: 'Khardung-La 17,582 Ft Himalayan Rider', collection: 'Motorsport & Riders', tagline: 'Built for Royal Enfield tours and freezing mountain passes.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F59E0B', badgeText: 'LADAKH RIDER', svgMotif: 'motorsport' },
  { designId: 'mot-03', title: 'Apex Telemetry V10 Pit-Crew', collection: 'Motorsport & Riders', tagline: 'Downforce aerodynamics diagram + Scuderia chest badge.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F97316', badgeText: 'APEX RACING', svgMotif: 'motorsport' },
  { designId: 'mot-04', title: 'Midnight Touge Mountain Drift', collection: 'Motorsport & Riders', tagline: 'JDM twin-turbo boost gauge and hairpins.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#A855F7', badgeText: 'JDM DRIFT', svgMotif: 'motorsport' },
  { designId: 'mot-05', title: 'Nürburgring Nordschleife 20.8 KM', collection: 'Motorsport & Riders', tagline: 'The Green Hell circuit map with lap-time typography.', placement: 'Front Center Archival (10"×12")', accentHex: '#22C55E', badgeText: 'TRACK DAY', svgMotif: 'motorsport' },
  { designId: 'mot-06', title: 'Cafe Racer Garage 66 Custom Build', collection: 'Motorsport & Riders', tagline: 'Spoked wheels, clip-on bars, and raw exhaust note.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#D97706', badgeText: 'MOTO GARAGE', svgMotif: 'motorsport' },
  { designId: 'mot-07', title: 'Nandi Hills 5AM Sunday Ride Club', collection: 'Motorsport & Riders', tagline: 'Bengaluru biker brotherhood — hairpins before sunrise.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#38BDF8', badgeText: 'BLR RIDERS', svgMotif: 'motorsport' },
  { designId: 'mot-08', title: 'Redline 9000 RPM Naturally Aspirated', collection: 'Motorsport & Riders', tagline: 'Tachometer needle buried in the red.', placement: 'Front Center Archival (10"×12")', accentHex: '#EF4444', badgeText: '9000 RPM', svgMotif: 'motorsport' },
  { designId: 'mot-09', title: 'Dakar Rally Desert Overland Spec', collection: 'Motorsport & Riders', tagline: 'Compass coordinates and off-road suspension blueprint.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#EAB308', badgeText: 'OVERLAND', svgMotif: 'motorsport' },
  { designId: 'mot-10', title: 'Box Box Box — Slick Tyre Strategy', collection: 'Motorsport & Riders', tagline: 'Sunday race-day couch pit-wall director uniform.', placement: 'Front Center Archival (10"×12")', accentHex: '#F97316', badgeText: 'RACE WEEKEND', svgMotif: 'motorsport' },

  // 7. VINTAGE ACID-WASH, HEAVY METAL & Y2K STREETWEAR (10 Designs)
  { designId: 'acd-01', title: 'Vintage Acid Flame Thrasher', collection: 'Acid & Y2K Vault', tagline: 'High-density orange and chrome flame emblem.', placement: 'Front Center Archival (10"×12")', accentHex: '#F97316', badgeText: 'ACID HERO', svgMotif: 'acid' },
  { designId: 'acd-02', title: 'Y2K Fallen Cyber Angel Wings', collection: 'Acid & Y2K Vault', tagline: 'Halftone gothic wings with liquid chrome typography.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#EC4899', badgeText: 'Y2K ARCHIVE', svgMotif: 'acid' },
  { designId: 'acd-03', title: 'Heavy Metal Lightning Distortion', collection: 'Acid & Y2K Vault', tagline: '1986 stadium rock tour emblem for acid-wash fleece.', placement: 'Front Center Archival (10"×12")', accentHex: '#38BDF8', badgeText: 'METAL VAULT', svgMotif: 'acid' },
  { designId: 'acd-04', title: '1999 Underground Warehouse Rave', collection: 'Acid & Y2K Vault', tagline: '303 acid bassline flyer graphics in neon halftone.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#A3E635', badgeText: '99 RAVE', svgMotif: 'acid' },
  { designId: 'acd-05', title: 'Chrome Tribal Cyber Sigilism', collection: 'Acid & Y2K Vault', tagline: 'Sharp metallic neo-tribal chest and spine artwork.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#94A3B8', badgeText: 'CYBER SIGIL', svgMotif: 'acid' },
  { designId: 'acd-06', title: 'Distressed Punk Zine Cutout', collection: 'Acid & Y2K Vault', tagline: 'Ransom-note xerox texture with bold street manifesto.', placement: 'Front Center Archival (10"×12")', accentHex: '#F43F5E', badgeText: 'PUNK ZINE', svgMotif: 'acid' },
  { designId: 'acd-07', title: 'Brutalist Concrete Overpass 026', collection: 'Acid & Y2K Vault', tagline: 'Raw architectural photography halftone with Swiss grid.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F97316', badgeText: 'BRUTALIST', svgMotif: 'bauhaus' },
  { designId: 'acd-08', title: 'Outrun 1989 Synthwave Sunset', collection: 'Acid & Y2K Vault', tagline: 'Laser grid horizon and retro supercar silhouette.', placement: 'Front Center Archival (10"×12")', accentHex: '#EC4899', badgeText: 'SYNTHWAVE', svgMotif: 'cyber' },
  { designId: 'acd-09', title: 'Gothic Cathedral Stained Glass', collection: 'Acid & Y2K Vault', tagline: 'Intricate rose-window linework for winter layering.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#8B5CF6', badgeText: 'DARK GOTHIC', svgMotif: 'acid' },
  { designId: 'acd-10', title: 'Liquid Mercury Melt Typeface', collection: 'Acid & Y2K Vault', tagline: 'Futuristic 3D chrome lettering on heavyweight cotton.', placement: 'Front Center Archival (10"×12")', accentHex: '#06B6D4', badgeText: 'CHROME EDITION', svgMotif: 'acid' },

  // 8. STOIC PHILOSOPHY, GYM & HIGH-PERFORMANCE MINDSET (10 Designs)
  { designId: 'stc-01', title: 'Memento Mori — Marcus Aurelius', collection: 'Stoic & Iron Mindset', tagline: 'Classical marble statue halftone with Latin maxim.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F59E0B', badgeText: 'STOIC ARCHIVE', svgMotif: 'stoic' },
  { designId: 'stc-02', title: 'Amor Fati — Love Your Fate', collection: 'Stoic & Iron Mindset', tagline: 'A blazing fire makes flame and brightness out of everything.', placement: 'Front Center Archival (10"×12")', accentHex: '#EA580C', badgeText: 'AMOR FATI', svgMotif: 'stoic' },
  { designId: 'stc-03', title: '5AM Iron Paradise Heavyweight Pump', collection: 'Stoic & Iron Mindset', tagline: 'Oversized drop-shoulder pump cover built for winter gym sessions.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#EF4444', badgeText: 'GYM PUMP COVER', svgMotif: 'stoic' },
  { designId: 'stc-04', title: 'Discipline Over Motivation Daily', collection: 'Stoic & Iron Mindset', tagline: 'No excuses, no shortcuts — show up in the cold.', placement: 'Front Center Archival (10"×12")', accentHex: '#10B981', badgeText: 'DISCIPLINE', svgMotif: 'stoic' },
  { designId: 'stc-05', title: 'Sisyphus Smiling At The Summit', collection: 'Stoic & Iron Mindset', tagline: 'The struggle itself toward the heights is enough to fill a man heart.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F97316', badgeText: 'ABSURDIST HERO', svgMotif: 'stoic' },
  { designId: 'stc-06', title: 'Monk Mode — Deep Work Protocol', collection: 'Stoic & Iron Mindset', tagline: '90 days of zero distraction and relentless building.', placement: 'Front Center Archival (10"×12")', accentHex: '#6366F1', badgeText: 'MONK MODE', svgMotif: 'stoic' },
  { designId: 'stc-07', title: 'The Obstacle Is The Way', collection: 'Stoic & Iron Mindset', tagline: 'What stands in the way becomes the way.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#D97706', badgeText: 'RYAN STOIC', svgMotif: 'stoic' },
  { designId: 'stc-08', title: 'Heavyweight Barbell Club 200KG', collection: 'Stoic & Iron Mindset', tagline: 'Deadlift & squat division — chalk, iron, and 380 GSM fleece.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#EF4444', badgeText: 'IRON CLUB', svgMotif: 'varsity' },
  { designId: 'stc-09', title: 'Zero Expectations 100% Execution', collection: 'Stoic & Iron Mindset', tagline: 'Ultra-clean micro chest typography for daily focus.', placement: 'Front Center Archival (10"×12")', accentHex: '#14B8A6', badgeText: 'MINIMAL CORE', svgMotif: 'bauhaus' },
  { designId: 'stc-10', title: 'Icarus Flew Too Close To The Sun', collection: 'Stoic & Iron Mindset', tagline: 'Neo-classical winged engraving with golden sun halo.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#FBBF24', badgeText: 'CLASSICAL ART', svgMotif: 'stoic' },

  // 9. CRICKET, FOOTBALL & INDIAN GAMING ESPORTS (10 Designs)
  { designId: 'esp-01', title: 'Bleed Blue Championship Roar 18', collection: 'Cricket & Esports Arena', tagline: 'Stadium chase-master energy in streetwear silhouette.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#3B82F6', badgeText: 'CRICKET STREET', svgMotif: 'varsity' },
  { designId: 'esp-02', title: 'Gully Cricket One-Tip One-Hand Rules', collection: 'Cricket & Esports Arena', tagline: 'Underarm banned, compound wall is six — pure Indian nostalgia.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F97316', badgeText: 'GULLY LEGEND', svgMotif: 'chai' },
  { designId: 'esp-03', title: 'Clutch 1v5 Radiant Ace Protocol', collection: 'Cricket & Esports Arena', tagline: 'Crosshair placement and 240Hz reflex streetwear.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F43F5E', badgeText: 'FPS ESPORTS', svgMotif: 'cyber' },
  { designId: 'esp-04', title: 'Pochinki Hot-Drop Squad Leader', collection: 'Cricket & Esports Arena', tagline: 'Winner Winner Chicken Dinner tactical crate drop.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#EAB308', badgeText: 'BATTLE ROYALE', svgMotif: 'cyber' },
  { designId: 'esp-05', title: '240Hz Zero-Ping LAN Party Club', collection: 'Cricket & Esports Arena', tagline: 'Built for winter gaming marathons and tournament stages.', placement: 'Front Center Archival (10"×12")', accentHex: '#06B6D4', badgeText: 'GAMER GEAR', svgMotif: 'cyber' },
  { designId: 'esp-06', title: '90th Minute Champions League Screamer', collection: 'Cricket & Esports Arena', tagline: 'European football terrace culture meets Indian streetwear.', placement: 'Front Center Archival (10"×12")', accentHex: '#10B981', badgeText: 'FOOTBALL CLUB', svgMotif: 'varsity' },
  { designId: 'esp-07', title: 'Test Cricket 5-Day Purist Society', collection: 'Cricket & Esports Arena', tagline: 'Red cherry seam, white flannels, and timeless patience.', placement: 'Front Center Archival (10"×12")', accentHex: '#DC2626', badgeText: 'RED BALL CLUB', svgMotif: 'varsity' },
  { designId: 'esp-08', title: 'Grandmaster Elo 2800 Chess Tactics', collection: 'Cricket & Esports Arena', tagline: 'Indian chess prodigy era — Sicilian Defense board diagram.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F59E0B', badgeText: 'CHESS PRODIGY', svgMotif: 'bauhaus' },
  { designId: 'esp-09', title: 'Sim-Racing Force Feedback Rig', collection: 'Cricket & Esports Arena', tagline: 'Trail-braking telemetry for desk setup enthusiasts.', placement: 'Front Center Archival (10"×12")', accentHex: '#EF4444', badgeText: 'SIM RACER', svgMotif: 'motorsport' },
  { designId: 'esp-10', title: 'RGB Free Matte-Black Setup Club', collection: 'Cricket & Esports Arena', tagline: 'Minimalist stealth workstation aesthetic.', placement: 'Front Center Archival (10"×12")', accentHex: '#A1A1AA', badgeText: 'STEALTH SETUP', svgMotif: 'bauhaus' },

  // 10. MINIMALIST BAUHAUS, COFFEE & CREATOR STUDIO (10 Designs)
  { designId: 'bau-01', title: 'Bauhaus Weimar 1919 Exhibition Grid', collection: 'Bauhaus & Creator Studio', tagline: 'Form follows function — primary geometry on heavy cotton.', placement: 'Front Center Archival (10"×12")', accentHex: '#EF4444', badgeText: 'BAUHAUS 1919', svgMotif: 'bauhaus' },
  { designId: 'bau-02', title: 'Helvetica & Swiss International Style', collection: 'Bauhaus & Creator Studio', tagline: 'Asymmetric typographic perfection for designers.', placement: 'Front Center Archival (10"×12")', accentHex: '#F97316', badgeText: 'DESIGNER PICK', svgMotif: 'bauhaus' },
  { designId: 'bau-03', title: '9-Bar Espresso Extraction Blueprint', collection: 'Bauhaus & Creator Studio', tagline: '18g in, 36g out in 28 seconds — specialty coffee engineering.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#D97706', badgeText: 'COFFEE NERD', svgMotif: 'chai' },
  { designId: 'bau-04', title: '35mm Analog Film Camera Club', collection: 'Bauhaus & Creator Studio', tagline: 'Grain, light leaks, and manual focus street photography.', placement: 'Front Center Archival (10"×12")', accentHex: '#F59E0B', badgeText: '35MM FILM', svgMotif: 'bauhaus' },
  { designId: 'bau-05', title: 'Lo-Fi Beats To Code & Chill To', collection: 'Bauhaus & Creator Studio', tagline: 'Cozy rainy window desk illustration for winter nights.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#A855F7', badgeText: 'LO-FI WINTER', svgMotif: 'cyber' },
  { designId: 'bau-06', title: 'Golden Ratio Fibonacci Spiral 1.618', collection: 'Bauhaus & Creator Studio', tagline: 'Mathematical harmony drafted in crisp architectural lines.', placement: 'Front Center Archival (10"×12")', accentHex: '#EAB308', badgeText: '1.618 RATIO', svgMotif: 'bauhaus' },
  { designId: 'bau-07', title: 'Less But Better — Dieter Rams Tribute', collection: 'Bauhaus & Creator Studio', tagline: 'Ten principles of good design on 240+ GSM combed cotton.', placement: 'Front Center Archival (10"×12")', accentHex: '#EA580C', badgeText: 'INDUSTRIAL ART', svgMotif: 'bauhaus' },
  { designId: 'bau-08', title: 'Vinyl Crate Digger 33⅓ RPM', collection: 'Bauhaus & Creator Studio', tagline: 'Warm analog soundwaves and turntable schematics.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#10B981', badgeText: 'ANALOG SOUND', svgMotif: 'bauhaus' },
  { designId: 'bau-09', title: 'Pantone Terracotta & Obsidian Swatch', collection: 'Bauhaus & Creator Studio', tagline: 'Color theory specimen card for creative directors.', placement: 'Front Center Archival (10"×12")', accentHex: '#C2410C', badgeText: 'COLOR STUDIO', svgMotif: 'bauhaus' },
  { designId: 'bau-10', title: 'RareEmber™ Archival Division 001', collection: 'Bauhaus & Creator Studio', tagline: 'Signature flagship house emblem — crafted in Tirupur.', placement: 'Back Oversized (12"×14") + Front Chest Crest', accentHex: '#F97316', badgeText: 'HOUSE SIGNATURE', svgMotif: 'bauhaus' },
];

export const FIVE_CORE_SILHOUETTES = [
  {
    key: 'hoodie',
    suffixName: '380 GSM Heavyweight Winter Hoodie',
    category: 'fashion' as const,
    subCategory: 'Winter Hoodies',
    qikinkSkuPrefix: 'UHd',
    price: 1099,
    originalPrice: 1899,
    gsmSpec: '380 GSM Brushed French Terry Cotton Fleece • Double-Lined Hood',
    baseImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/5/9bd43925-3bff-4f53-9d92-80c14714fd19.jpg',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: ['Black', 'Navy', 'Olive', 'Maroon', 'Grey']
  },
  {
    key: 'crewneck',
    suffixName: '320 GSM Winter Crewneck Sweatshirt',
    category: 'fashion' as const,
    subCategory: 'Crewneck Sweatshirts',
    qikinkSkuPrefix: 'USs',
    price: 899,
    originalPrice: 1499,
    gsmSpec: '320 GSM Super Combed Terry Fleece • Derby Ribbed Collar & Cuffs',
    baseImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/4/23175e0b-febe-4d12-83e2-f9a76506d24f.jpg',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: ['Black', 'Navy', 'Olive', 'Beige', 'Grey']
  },
  {
    key: 'varsity',
    suffixName: '350 GSM Contrast-Sleeve Varsity Jacket',
    category: 'fashion' as const,
    subCategory: 'Varsity Jackets',
    qikinkSkuPrefix: 'UVJ',
    price: 1399,
    originalPrice: 2299,
    gsmSpec: '350 GSM Heavy Fleece Varsity Jacket • Snap-Button Front & Ribbed Trim',
    baseImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/95/b3298941-1294-4945-ac9c-c5aaafd3403d.jpg',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Black', 'Navy', 'Maroon']
  },
  {
    key: 'oversized-tee',
    suffixName: '240 GSM Drop-Shoulder Oversized Tee',
    category: 'fashion' as const,
    subCategory: 'Oversized Tees',
    qikinkSkuPrefix: 'UOst',
    price: 649,
    originalPrice: 1199,
    gsmSpec: '240 GSM Bio-Washed Combed Cotton • Relaxed Drop-Shoulder Fit',
    baseImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/28/30c13fe2-0ca2-4f63-b857-7970c0c0a593.jpg',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: ['Black', 'White', 'Navy', 'Olive', 'Beige']
  },
  {
    key: 'acid-or-mat',
    suffixName: '240 GSM Vintage Acid-Wash Heavy Tee',
    category: 'fashion' as const,
    subCategory: 'Acid-Wash & Desk Gear',
    qikinkSkuPrefix: 'ATe',
    price: 699,
    originalPrice: 1299,
    gsmSpec: '240 GSM Custom Enzyme Acid-Wash Cotton • Vintage Charcoal Fade',
    baseImage: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/variations/b8d5807e-f669-4087-9dd4-a136e0af3e87.webp',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Charcoal', 'Black']
  }
];

export function getMotifSvgPath(motif?: string): string {
  switch (motif) {
    case 'ronin': return '/designs/ronin-ink.svg';
    case 'cyber': return '/designs/tokyo-mecha.svg';
    case 'code': return '/designs/git-commit.svg';
    case 'acid': return '/designs/acid-flame.svg';
    case 'chai': return '/designs/chai.svg';
    case 'chakra': return '/designs/chakra.svg';
    case 'varsity': return '/designs/varsity.svg';
    case 'motorsport': return '/designs/motorsport.svg';
    case 'stoic': return '/designs/stoic.svg';
    case 'bauhaus': return '/designs/bauhaus.svg';
    default: return '/designs/ronin-ink.svg';
  }
}

export function generate500PrebuiltProducts(): any[] {
  const catalog: any[] = [];
  let index = 1;

  for (const design of HUNDRED_INDIAN_TRENDING_DESIGNS) {
    for (const sil of FIVE_CORE_SILHOUETTES) {
      const isDeskMatSlot = sil.key === 'acid-or-mat' && index % 2 === 0;
      const id = `re-prebuilt-${design.designId}-${isDeskMatSlot ? 'deskmat' : sil.key}`;
      const name = isDeskMatSlot
        ? `${design.title} — 900×400mm Extended Creator Desk Mat`
        : `${design.title} — ${sil.suffixName}`;

      const activeImage = isDeskMatSlot
        ? 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg'
        : sil.baseImage;

      const desc = `${design.tagline} Pre-designed archival drop crafted in Tirupur using ${
        isDeskMatSlot
          ? '900×400×3mm high-density micro-weave cloth with stitched anti-fray edges and natural rubber base'
          : sil.gsmSpec
      } and 1200 DPI OEKO-TEX® certified print technology. Ready to wear—just select your size and check out.`;

      catalog.push({
        id,
        slug: id,
        title: name,
        name,
        subtitle: `${design.collection} • ${design.placement}`,
        short: `${design.collection} • ${design.placement}`,
        story: desc,
        description: desc,
        details: [
          isDeskMatSlot
            ? '900×400×3mm High-Density Micro-Weave Tracking Surface'
            : sil.gsmSpec,
          `High-Resolution Archival Graphic: ${design.title}`,
          `Placement: ${isDeskMatSlot ? 'Full Surface 900×400mm Print' : design.placement}`,
          '1200 DPI OEKO-TEX® Certified Non-Fade Print Technology',
          'Fast 2–4 Day Express Pan-India Air Dispatch with 7-Day Doorstep Replacement Guarantee'
        ],
        emoji: isDeskMatSlot ? '🖥️' : sil.key === 'hoodie' ? '🧥' : sil.key === 'varsity' ? '⚡' : '👕',
        tag: design.badgeText,
        tagColor: design.accentHex,
        tagBg: `${design.accentHex}15`,
        price: isDeskMatSlot ? 699 : sil.price,
        price_inr: isDeskMatSlot ? 699 : sil.price,
        compareAtPrice: isDeskMatSlot ? 1299 : sil.originalPrice,
        compare_at_price: isDeskMatSlot ? 1299 : sil.originalPrice,
        old_price: isDeskMatSlot ? 1299 : sil.originalPrice,
        category: isDeskMatSlot ? 'electronics' : 'fashion',
        subCategory: isDeskMatSlot ? 'Extended Desk Mats' : sil.subCategory,
        collection: design.collection,
        badge: design.badgeText,
        image: activeImage,
        image_url: activeImage,
        images: [activeImage],
        sizes: isDeskMatSlot ? ['900x400mm'] : sil.sizes,
        colors: isDeskMatSlot ? ['Black'] : sil.colors,
        qikinkSkuPrefix: isDeskMatSlot ? 'MPad-900x400' : sil.qikinkSkuPrefix,
        isPrebuilt: true,
        isCustomBlank: false,
        lockedGraphicTitle: design.title,
        lockedGraphicPlacement: isDeskMatSlot ? 'Full Surface 900×400mm Print' : design.placement,
        lockedAccentHex: design.accentHex,
        lockedSvgMotif: design.svgMotif,
        inStock: true,
        active: true,
        rating: 4.9,
        reviews: 0,
        gradient: 'linear-gradient(135deg, rgba(255,77,36,0.06), rgba(0,0,0,0.03))',
        supplier: 'RareEmber™ Tirupur Studio',
        market: 'IN' as const
      });
      index++;
    }
  }
  return catalog;
}
