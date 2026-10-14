import json
import re

lines = open(r"C:\Users\ajay kumar\.gemini\antigravity\brain\8ead37fe-8276-4b3e-8391-46f377e32145\.system_generated\logs\transcript.jsonl", encoding="utf-8").readlines()

batch2_slugs = [
    ('meesho-flameless-rechargeable-led-tealights-6pk', ['tealight', 'candle']),
    ('meesho-floating-water-lotus-led-candles-6pk', ['lotus', 'floating']),
    ('meesho-foldable-linen-laundry-hamper-basket', ['laundry', 'hamper']),
    ('meesho-foldable-wooden-accordion-book-lamp', ['book lamp', 'accordion']),
    ('meesho-gold-hexagonal-geometric-wall-shelf', ['hexagonal', 'shelf']),
    ('meesho-heated-eyelash-curler-rechargeable', ['eyelash', 'curler']),
    ('meesho-himalayan-rock-salt-lamp-wooden-base', ['salt lamp', 'himalayan']),
    ('meesho-honeycomb-drawer-divider-organizer-8pk', ['honeycomb', 'drawer', 'divider']),
    ('meesho-instant-water-pump-dispenser-5gallon', ['water dispenser', 'water pump', 'dispenser']),
    ('meesho-insulated-stainless-steel-coffee-tumbler', ['tumbler', 'insulated', 'coffee']),
    ('meesho-leather-desk-pad-blotter-dual-sided', ['desk pad', 'blotter']),
    ('meesho-leather-travel-passport-wallet-rfid', ['passport', 'wallet']),
    ('meesho-magnetic-desk-cable-cord-organizer-hub', ['cable organizer', 'cable clip']),
    ('meesho-magnetic-kitchen-knife-strip-16inch', ['knife holder', 'knife strip']),
    ('meesho-magnetic-levitation-floating-moon-lamp', ['floating moon', 'levitation', 'moon lamp']),
    ('meesho-mandir-om-trishul-illusion-3d-acrylic-lamp', ['trishul', 'mandir', 'illusion']),
    ('meesho-metal-headphone-stand-desk-hanger', ['headphone stand', 'headphone holder']),
    ('meesho-mini-desktop-ultrasonic-mist-humidifier', ['humidifier', 'mist']),
    ('meesho-mini-thermal-bag-sealer-cutter', ['bag sealer', 'heat sealer']),
    ('meesho-monitor-screenbar-light-eye-care', ['screenbar', 'monitor light']),
    ('meesho-moroccan-golden-metal-fairy-lantern-string', ['fairy string', 'moroccan', 'lantern']),
    ('meesho-moving-sand-art-round-glass-deep-sea', ['sand art', 'deep sea']),
    ('meesho-multi-device-bluetooth-wireless-keyboard', ['bluetooth wireless keyboard', 'keyboard']),
    ('meesho-neon-led-coffee-aesthetic-wall-sign', ['neon', 'coffee sign']),
    ('meesho-nordic-ceramic-donut-vase-minimalist', ['donut vase', 'ceramic vase']),
    ('meesho-nordic-insulated-coffee-tumbler-straw-500ml', ['tumbler with straw', 'nordic tumbler']),
    ('meesho-nordic-minimalist-corner-rgb-floor-lamp', ['corner floor lamp', 'floor lamp']),
    ('meesho-orthopedic-memory-foam-lumbar-cushion', ['lumbar cushion', 'back cushion']),
    ('meesho-portable-hanging-neck-bladeless-fan', ['neck fan', 'bladeless fan'])
]

# Map each slug to images that appeared in the same step
mapping = {s[0]: [] for s in batch2_slugs}

for l in lines:
    d = json.loads(l)
    content = d.get('content', '')
    tc = d.get('tool_calls', [])
    query = ''
    if tc:
        query = tc[0].get('args', {}).get('query', '') + ' ' + tc[0].get('args', {}).get('toolSummary', '')
    
    text = (content + ' ' + query).lower()
    
    # Extract images from content
    imgs = re.findall(r'https://images\.meesho\.com/images/products/\d+/[a-z0-9_]+', content)
    cleaned_imgs = [re.sub(r'_[0-9]+$', '', img) + '_512.jpg' for img in imgs]
    
    for slug, kws in batch2_slugs:
        if any(kw in text for kw in kws):
            for img in cleaned_imgs:
                if img not in mapping[slug]:
                    mapping[slug].append(img)

for s, kws in batch2_slugs:
    print(f"{s}: {len(mapping[s])} images -> {mapping[s][:2]}")
