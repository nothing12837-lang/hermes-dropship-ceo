import urllib.request
import json
import urllib.parse

def search_unsplash(query):
    url = f"https://unsplash.com/napi/search/photos?query={urllib.parse.quote(query)}&per_page=4"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode())
            results = data.get("results", [])
            return [(r.get("id"), r.get("urls", {}).get("raw", ""), r.get("alt_description", "")) for r in results]
    except Exception as e:
        print(f"Error searching '{query}': {e}")
        return []

queries = [
    ("rareember-oversized-streetwear-tee-obsidian", "black oversized t-shirt streetwear male model"),
    ("rareember-oversized-streetwear-tee-offwhite", "white oversized t-shirt streetwear male model"),
    ("rareember-heavyweight-fleece-hoodie-onyx", "black hoodie streetwear oversized hood"),
    ("rareember-heavyweight-zip-up-hoodie-bone", "white zip up hoodie streetwear"),
    ("rareember-essential-crewneck-sweatshirt-heather", "grey crewneck sweatshirt streetwear"),
    ("rareember-acid-wash-vintage-oversized-tee", "acid wash grey t-shirt vintage wash"),
    ("rareember-supima-luxury-minimalist-tee", "black plain crewneck t-shirt premium minimal"),
    ("rareember-streetwear-heavyweight-cargo-joggers", "cargo sweatpants joggers streetwear"),
    ("rareember-premium-matty-polo-tshirt", "black polo shirt collar men"),
    ("rareember-sleeveless-athletic-tank-top", "men tank top streetwear muscle sleeveless"),
    ("rareember-womens-cropped-fleece-hoodie", "woman cropped hoodie streetwear fleece"),
    ("rareember-womens-boxy-heavyweight-crop-tee", "woman crop t-shirt white streetwear"),
    ("rareember-matte-black-ceramic-coffee-mug", "black ceramic coffee mug minimalist"),
    ("rareember-thermal-insulated-travel-tumbler-straw", "stainless steel tumbler with straw drinkware"),
    ("rareember-frosted-glass-sipper-bamboo-lid", "can glass bamboo lid straw iced coffee"),
    ("rareember-magic-thermochromic-ceramic-mug", "black ceramic mug coffee hot steam"),
    ("rareember-stainless-sports-insulated-flask", "stainless steel water bottle thermos flask"),
    ("rareember-extended-desk-mat-gaming-mousepad", "extended desk mat mousepad mechanical keyboard clean desk"),
    ("rareember-compact-microfiber-desk-mousepad", "desk mouse pad workspace computer mouse"),
    ("rareember-shockproof-matte-iphone-case", "black matte iphone case minimal sleek"),
    ("rareember-padded-creator-laptop-sleeve", "laptop sleeve bag case macbook minimalist"),
    ("rareember-heavyweight-canvas-tote-bag", "canvas tote bag aesthetic minimalist cotton"),
    ("rareember-hardbound-minimalist-dot-journal", "black hardcover journal notebook diary minimal"),
    ("rareember-wooden-framed-streetwear-art-poster", "framed poster modern art wall living room"),
    ("rareember-waterproof-vinyl-sticker-pack", "vinyl stickers laptop pack skateboard decals")
]

out = {}
for pid, q in queries:
    res = search_unsplash(q)
    print(f"\n[{pid}] (Query: {q})")
    if res:
        best_id, raw_url, alt = res[0]
        clean_url = raw_url.split("?")[0] if raw_url else ""
        print(f" -> Best: {clean_url}?auto=format&fit=crop&w=1000&q=80 (Alt: {alt})")
        out[pid] = f"{clean_url}?auto=format&fit=crop&w=1000&q=80"
    else:
        print(" -> No results")

with open("tools/new_images.json", "w") as f:
    json.dump(out, f, indent=2)

print("\nSaved new_images.json!")
