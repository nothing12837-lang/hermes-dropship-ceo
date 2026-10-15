import json
import re
from pathlib import Path
from typing import Dict, List, Optional

GALLERY_TS_FILE = Path(__file__).resolve().parent.parent / "storefront" / "src" / "lib" / "data" / "product-gallery.ts"
GALLERY_JSON_FILE = Path(__file__).resolve().parent / "product_galleries.json"

_CACHED_GALLERIES: Optional[Dict[str, List[str]]] = None

def get_product_galleries() -> Dict[str, List[str]]:
    global _CACHED_GALLERIES
    if _CACHED_GALLERIES is not None:
        return _CACHED_GALLERIES

    if GALLERY_JSON_FILE.exists():
        try:
            _CACHED_GALLERIES = json.loads(GALLERY_JSON_FILE.read_text(encoding="utf-8"))
            if _CACHED_GALLERIES:
                return _CACHED_GALLERIES
        except Exception:
            pass

    galleries: Dict[str, List[str]] = {}
    if GALLERY_TS_FILE.exists():
        content = GALLERY_TS_FILE.read_text(encoding="utf-8")
        # Parse each product block
        blocks = re.findall(r"'([^']+)':\s*\[(.*?)\]", content, re.DOTALL)
        for prod_id, urls_block in blocks:
            urls = re.findall(r"'https://[^']+'", urls_block)
            cleaned_urls = [u.strip("'") for u in urls]
            if cleaned_urls:
                galleries[prod_id] = cleaned_urls

    if galleries:
        GALLERY_JSON_FILE.write_text(json.dumps(galleries, indent=2), encoding="utf-8")
        _CACHED_GALLERIES = galleries

    return galleries or {}

def get_images_for_product(product_id: str) -> List[str]:
    galleries = get_product_galleries()
    if product_id in galleries:
        return galleries[product_id]
    # Fallback to high quality verified product images
    return [
        "https://images.meesho.com/images/products/614873040/qmb1a_512.jpg",
        "https://images.meesho.com/images/products/614873040/udpwg_512.jpg",
        "https://images.meesho.com/images/products/614873040/fww1j_512.jpg",
        "https://images.meesho.com/images/products/614873040/nsq0j_512.jpg"
    ]

if __name__ == "__main__":
    g = get_product_galleries()
    print(f"Successfully extracted {len(g)} curated product galleries!")
    first_key = next(iter(g))
    print(f"Sample '{first_key}': {g[first_key]}")
