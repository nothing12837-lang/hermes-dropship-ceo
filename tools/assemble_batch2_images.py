import json
import re

lines = open(r"C:\Users\ajay kumar\.gemini\antigravity\brain\8ead37fe-8276-4b3e-8391-46f377e32145\.system_generated\logs\transcript.jsonl", encoding="utf-8").readlines()

batch2_slugs = [
    'meesho-flameless-rechargeable-led-tealights-6pk',
    'meesho-floating-water-lotus-led-candles-6pk',
    'meesho-foldable-linen-laundry-hamper-basket',
    'meesho-foldable-wooden-accordion-book-lamp',
    'meesho-gold-hexagonal-geometric-wall-shelf',
    'meesho-heated-eyelash-curler-rechargeable',
    'meesho-himalayan-rock-salt-lamp-wooden-base',
    'meesho-honeycomb-drawer-divider-organizer-8pk',
    'meesho-instant-water-pump-dispenser-5gallon',
    'meesho-insulated-stainless-steel-coffee-tumbler',
    'meesho-leather-desk-pad-blotter-dual-sided',
    'meesho-leather-travel-passport-wallet-rfid',
    'meesho-magnetic-desk-cable-cord-organizer-hub',
    'meesho-magnetic-kitchen-knife-strip-16inch',
    'meesho-magnetic-levitation-floating-moon-lamp',
    'meesho-mandir-om-trishul-illusion-3d-acrylic-lamp',
    'meesho-metal-headphone-stand-desk-hanger',
    'meesho-mini-desktop-ultrasonic-mist-humidifier',
    'meesho-mini-thermal-bag-sealer-cutter',
    'meesho-monitor-screenbar-light-eye-care',
    'meesho-moroccan-golden-metal-fairy-lantern-string',
    'meesho-moving-sand-art-round-glass-deep-sea',
    'meesho-multi-device-bluetooth-wireless-keyboard',
    'meesho-neon-led-coffee-aesthetic-wall-sign',
    'meesho-nordic-ceramic-donut-vase-minimalist',
    'meesho-nordic-insulated-coffee-tumbler-straw-500ml',
    'meesho-nordic-minimalist-corner-rgb-floor-lamp',
    'meesho-orthopedic-memory-foam-lumbar-cushion',
    'meesho-portable-hanging-neck-bladeless-fan'
]

# Extract all images and their associated context
results = {s: [] for s in batch2_slugs}

# Check if there are explicit mappings or searches
for l in lines:
    d = json.loads(l)
    content = d.get('content', '')
    for s in batch2_slugs:
        # Search for images near slug or product keywords
        short_name = s.replace('meesho-', '').split('-')[0]
        if short_name in content.lower():
            imgs = re.findall(r'https://images\.meesho\.com/images/products/\d+/[a-z0-9_]+', content)
            for img in imgs:
                img_url = re.sub(r'_[0-9]+$', '', img) + '_512.jpg'
                if img_url not in results[s]:
                    results[s].append(img_url)

print("Batch 2 Image Counts by Slug:")
for s in batch2_slugs:
    print(f"  {s}: {len(results[s])} images")
