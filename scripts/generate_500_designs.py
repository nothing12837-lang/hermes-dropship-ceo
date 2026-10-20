"""
Rare Ember™ - 500 Trending Streetwear & Merchandise PNG Graphics Generator
Creates 500 unique, print-ready, high-resolution transparent PNG designs
categorized across 6 trending themes for DTF / Sublimation printing on Qikink.
"""

import os
import math
import random
import zipfile
import json
from PIL import Image, ImageDraw, ImageFont

# Canvas dimensions (Print-ready high-res 1800 x 2400 at 300 DPI)
W, H = 1800, 2400
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIR = os.path.join(BASE_DIR, "storefront", "public", "designs", "500-trending-collection")
ZIP_PATH = os.path.join(BASE_DIR, "storefront", "public", "designs", "rare-ember-500-trending-designs.zip")

# Font paths
FONT_DIR = "C:/Windows/Fonts"
FONTS = {
    "heavy": os.path.join(FONT_DIR, "ariblk.ttf") if os.path.exists(os.path.join(FONT_DIR, "ariblk.ttf")) else os.path.join(FONT_DIR, "impact.ttf"),
    "impact": os.path.join(FONT_DIR, "impact.ttf"),
    "sans": os.path.join(FONT_DIR, "arial.ttf"),
    "sans_bold": os.path.join(FONT_DIR, "arialbd.ttf"),
    "mono": os.path.join(FONT_DIR, "consolab.ttf") if os.path.exists(os.path.join(FONT_DIR, "consolab.ttf")) else os.path.join(FONT_DIR, "consola.ttf"),
    "serif": os.path.join(FONT_DIR, "georgiab.ttf") if os.path.exists(os.path.join(FONT_DIR, "georgiab.ttf")) else os.path.join(FONT_DIR, "timesbd.ttf"),
    "kanji": os.path.join(FONT_DIR, "msgothic.ttc") if os.path.exists(os.path.join(FONT_DIR, "msgothic.ttc")) else os.path.join(FONT_DIR, "arial.ttf"),
    "devanagari": os.path.join(FONT_DIR, "Nirmala.ttc") if os.path.exists(os.path.join(FONT_DIR, "Nirmala.ttc")) else os.path.join(FONT_DIR, "arial.ttf")
}

PALETTES = {
    "ember": {"primary": (255, 77, 36, 255), "secondary": (255, 255, 255, 255), "accent": (255, 170, 50, 255), "muted": (255, 255, 255, 170)},
    "cyan": {"primary": (0, 240, 255, 255), "secondary": (255, 255, 255, 255), "accent": (0, 160, 255, 255), "muted": (200, 245, 255, 170)},
    "acid": {"primary": (204, 255, 0, 255), "secondary": (255, 255, 255, 255), "accent": (140, 255, 50, 255), "muted": (230, 255, 180, 170)},
    "tokyo": {"primary": (255, 42, 85, 255), "secondary": (255, 255, 255, 255), "accent": (255, 120, 160, 255), "muted": (255, 220, 230, 170)},
    "gold": {"primary": (255, 215, 0, 255), "secondary": (255, 255, 255, 255), "accent": (255, 160, 20, 255), "muted": (255, 240, 200, 170)},
    "purple": {"primary": (168, 85, 247, 255), "secondary": (255, 255, 255, 255), "accent": (216, 180, 254, 255), "muted": (235, 215, 255, 170)},
    "white": {"primary": (255, 255, 255, 255), "secondary": (230, 235, 240, 255), "accent": (255, 77, 36, 255), "muted": (200, 210, 220, 170)},
    "cream": {"primary": (250, 240, 220, 255), "secondary": (255, 255, 255, 255), "accent": (210, 175, 130, 255), "muted": (220, 210, 195, 170)},
}

def get_font(font_key, size):
    path = FONTS.get(font_key, FONTS["sans"])
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def draw_centered_text(draw, y, text, font, fill):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (W - tw) // 2
    draw.text((x, y), text, font=font, fill=fill)
    return y + (bbox[3] - bbox[1])

def draw_corner_ticks(draw, box, length=45, width=5, fill=(255, 255, 255, 220)):
    x1, y1, x2, y2 = box
    draw.line([(x1, y1), (x1 + length, y1)], fill=fill, width=width)
    draw.line([(x1, y1), (x1, y1 + length)], fill=fill, width=width)
    draw.line([(x2, y1), (x2 - length, y1)], fill=fill, width=width)
    draw.line([(x2, y1), (x2, y1 + length)], fill=fill, width=width)
    draw.line([(x1, y2), (x1 + length, y2)], fill=fill, width=width)
    draw.line([(x1, y2), (x1, y2 - length)], fill=fill, width=width)
    draw.line([(x2, y2), (x2 - length, y2)], fill=fill, width=width)
    draw.line([(x2, y2), (x2, y2 - length)], fill=fill, width=width)

def draw_barcode(draw, x, y, width=560, height=90, fill=(255, 255, 255, 240)):
    random.seed(x + y)
    cx = x
    while cx < x + width:
        bar_w = random.choice([2, 4, 6, 8, 12])
        gap = random.choice([2, 4, 6, 8])
        if cx + bar_w <= x + width:
            draw.rectangle([cx, y, cx + bar_w, y + height], fill=fill)
        cx += bar_w + gap

def draw_reticle(draw, cx, cy, radius=180, fill=(0, 240, 255, 255)):
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=fill, width=4)
    draw.ellipse([cx - radius + 35, cy - radius + 35, cx + radius - 35, cy + radius - 35], outline=fill, width=2)
    draw.line([(cx - radius - 50, cy), (cx - radius + 25, cy)], fill=fill, width=4)
    draw.line([(cx + radius - 25, cy), (cx + radius + 50, cy)], fill=fill, width=4)
    draw.line([(cx, cy - radius - 50), (cx, cy - radius + 25)], fill=fill, width=4)
    draw.line([(cx, cy + radius - 25), (cx, cy + radius + 50)], fill=fill, width=4)
    draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=fill)
    for deg in [45, 135, 225, 315]:
        rad = math.radians(deg)
        x1 = cx + (radius - 20) * math.cos(rad)
        y1 = cy + (radius - 20) * math.sin(rad)
        x2 = cx + (radius + 20) * math.cos(rad)
        y2 = cy + (radius + 20) * math.sin(rad)
        draw.line([(x1, y1), (x2, y2)], fill=fill, width=3)

def draw_mandala(draw, cx, cy, radius=190, fill=(255, 215, 0, 255)):
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=fill, width=5)
    draw.ellipse([cx - radius + 30, cy - radius + 30, cx + radius - 30, cy + radius - 30], outline=fill, width=2)
    draw.ellipse([cx - 35, cy - 35, cx + 35, cy + 35], fill=fill)
    for i in range(12):
        angle = i * 30
        rad = math.radians(angle)
        x1 = cx + 35 * math.cos(rad)
        y1 = cy + 35 * math.sin(rad)
        x2 = cx + (radius - 30) * math.cos(rad)
        y2 = cy + (radius - 30) * math.sin(rad)
        draw.line([(x1, y1), (x2, y2)], fill=fill, width=3)
        tip_x = cx + (radius + 20) * math.cos(rad)
        tip_y = cy + (radius + 20) * math.sin(rad)
        draw.polygon([(x2 - 12 * math.sin(rad), y2 + 12 * math.cos(rad)),
                      (tip_x, tip_y),
                      (x2 + 12 * math.sin(rad), y2 - 12 * math.cos(rad))], fill=fill)

def draw_circuit(draw, cx, cy, span=450, fill=(0, 240, 255, 190)):
    points_sets = [
        [(cx - span, cy - 90), (cx - span + 120, cy - 90), (cx - span + 180, cy - 150), (cx - 120, cy - 150)],
        [(cx + span, cy - 90), (cx + span - 120, cy - 90), (cx + span - 180, cy - 150), (cx + 120, cy - 150)],
        [(cx - span, cy + 90), (cx - span + 140, cy + 90), (cx - span + 200, cy + 150), (cx - 140, cy + 150)],
        [(cx + span, cy + 90), (cx + span - 140, cy + 90), (cx + span - 200, cy + 150), (cx + 140, cy + 150)],
    ]
    for pts in points_sets:
        draw.line(pts, fill=fill, width=5)
        end_x, end_y = pts[-1]
        draw.ellipse([end_x - 12, end_y - 12, end_x + 12, end_y + 12], fill=fill)
        start_x, start_y = pts[0]
        draw.ellipse([start_x - 8, start_y - 8, start_x + 8, start_y + 8], outline=fill, width=4)

def draw_barbell(draw, cx, cy, fill=(255, 255, 255, 255)):
    draw.rectangle([cx - 280, cy - 14, cx + 280, cy + 14], fill=fill)
    for kx in range(cx - 150, cx + 150, 18):
        draw.line([(kx, cy - 14), (kx + 8, cy + 14)], fill=(40, 40, 40, 200), width=3)
    draw.rectangle([cx - 210, cy - 28, cx - 195, cy + 28], fill=fill)
    draw.rectangle([cx + 195, cy - 28, cx + 210, cy + 28], fill=fill)
    draw.rectangle([cx - 250, cy - 100, cx - 225, cy + 100], fill=fill)
    draw.rectangle([cx + 225, cy - 100, cx + 250, cy + 100], fill=fill)
    draw.rectangle([cx - 280, cy - 80, cx - 258, cy + 80], fill=fill)
    draw.rectangle([cx + 258, cy - 80, cx + 280, cy + 80], fill=fill)

def draw_pillar(draw, cx, cy, fill=(250, 240, 220, 255)):
    draw.rectangle([cx - 110, cy - 150, cx + 110, cy - 130], fill=fill)
    draw.rectangle([cx - 130, cy - 130, cx + 130, cy - 110], fill=fill)
    draw.rectangle([cx - 95, cy - 110, cx + 95, cy + 110], fill=fill)
    for fx in range(cx - 80, cx + 90, 28):
        draw.line([(fx, cy - 105), (fx, cy + 105)], fill=(30, 30, 30, 180), width=5)
    draw.rectangle([cx - 130, cy + 110, cx + 130, cy + 130], fill=fill)
    draw.rectangle([cx - 150, cy + 130, cx + 150, cy + 150], fill=fill)

# Design Generators by Template
def render_brutalist_box(spec):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pal = PALETTES[spec.get("palette", "ember")]
    margin = 150
    box = (margin, margin, W - margin, H - margin)
    
    # Outer frame & corner ticks
    d.rectangle(box, outline=pal["muted"], width=3)
    draw_corner_ticks(d, box, length=50, width=6, fill=pal["primary"])
    
    # Top header bar
    d.rectangle([margin, margin, W - margin, margin + 70], fill=(0, 0, 0, 180))
    f_mono = get_font("mono", 28)
    d.text((margin + 30, margin + 20), spec.get("top_code", "ARCHIVE // NO. 001"), font=f_mono, fill=pal["primary"])
    d.text((W - margin - 350, margin + 20), spec.get("coord", "LAT 28.6139° N"), font=f_mono, fill=pal["muted"])
    
    # Main Headline
    f_heavy = get_font("heavy", spec.get("title_size", 130))
    title = spec.get("title", "RAW CUT")
    y = margin + 220
    y = draw_centered_text(d, y, title, f_heavy, pal["primary"])
    
    # Inverted contrast banner
    banner_y = y + 40
    d.rectangle([margin + 60, banner_y, W - margin - 60, banner_y + 110], fill=pal["primary"])
    f_impact = get_font("impact", 56)
    sub = spec.get("subtitle", "HEAVYWEIGHT ARCHIVE").upper()
    bbox = d.textbbox((0, 0), sub, font=f_impact)
    tw = bbox[2] - bbox[0]
    d.text(((W - tw) // 2, banner_y + 25), sub, font=f_impact, fill=(0, 0, 0, 255))
    
    # Center graphic motif
    cy = banner_y + 440
    motif = spec.get("motif", "reticle")
    if motif == "reticle":
        draw_reticle(d, W // 2, cy, radius=180, fill=pal["accent"])
    elif motif == "circuit":
        draw_circuit(d, W // 2, cy, span=400, fill=pal["accent"])
    elif motif == "mandala":
        draw_mandala(d, W // 2, cy, radius=190, fill=pal["accent"])
    elif motif == "barbell":
        draw_barbell(d, W // 2, cy, fill=pal["secondary"])
    else:
        draw_pillar(d, W // 2, cy, fill=pal["secondary"])
        
    # Statement block
    f_sans = get_font("sans_bold", 38)
    stmt = spec.get("statement", "DESIGNED FOR RESISTANCE // BUILT TO LAST")
    draw_centered_text(d, cy + 280, stmt, f_sans, pal["secondary"])
    
    # Barcode & dispatch stamp at bottom
    bar_x = (W - 560) // 2
    bar_y = H - margin - 220
    draw_barcode(d, bar_x, bar_y, width=560, height=80, fill=pal["secondary"])
    
    f_small = get_font("mono", 22)
    stamp = spec.get("bottom_stamp", "RARE EMBER™ STUDIO • OEKO-TEX CERTIFIED DTF • TIRUPUR HUB")
    draw_centered_text(d, bar_y + 105, stamp, f_small, pal["muted"])
    
    return img

def render_kanji_mecha(spec):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pal = PALETTES[spec.get("palette", "tokyo")]
    
    # Vertical Japanese Kanji
    kanji = spec.get("kanji", "浪人")
    f_kanji = get_font("kanji", 240)
    
    # Draw Kanji in upper center
    bbox = d.textbbox((0, 0), kanji, font=f_kanji)
    kw = bbox[2] - bbox[0]
    kx = (W - kw) // 2
    ky = 260
    
    # Glowing backdrop pill
    d.rectangle([kx - 40, ky - 30, kx + kw + 40, ky + (bbox[3] - bbox[1]) + 30], outline=pal["primary"], width=4)
    d.text((kx, ky), kanji, font=f_kanji, fill=pal["secondary"])
    
    # Cyber Katakana accent
    f_kana = get_font("kanji", 50)
    kana = spec.get("kana", "ローニン // システム")
    draw_centered_text(d, ky + (bbox[3] - bbox[1]) + 60, kana, f_kana, pal["primary"])
    
    # Reticle / Mecha HUD
    cy = ky + (bbox[3] - bbox[1]) + 420
    draw_reticle(d, W // 2, cy, radius=210, fill=pal["accent"])
    
    # English Primary Headline
    f_heavy = get_font("heavy", 95)
    title = spec.get("title", "CYBER RONIN").upper()
    draw_centered_text(d, cy + 290, title, f_heavy, pal["secondary"])
    
    # Warning Label
    f_impact = get_font("impact", 44)
    warn = spec.get("subtitle", "MECHA DIVISION // UNIT-01 ACTIVE")
    d.rectangle([(W - 750) // 2, cy + 440, (W + 750) // 2, cy + 510], fill=pal["primary"])
    bbox = d.textbbox((0, 0), warn, font=f_impact)
    tw = bbox[2] - bbox[0]
    d.text(((W - tw) // 2, cy + 452), warn, font=f_impact, fill=(0, 0, 0, 255))
    
    # Tech Coordinate stamp
    f_mono = get_font("mono", 24)
    coord = spec.get("coord", "SECTOR 07 • 35.6762° N, 139.6503° E • RE-V2")
    draw_centered_text(d, H - 260, coord, f_mono, pal["muted"])
    
    return img

def render_desi_culture(spec):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pal = PALETTES[spec.get("palette", "gold")]
    
    # Sacred Mandala Center
    cy = 760
    draw_mandala(d, W // 2, cy, radius=230, fill=pal["primary"])
    
    # Authentic Hindi Devanagari Headline
    hindi = spec.get("hindi", "रफ्तार")
    f_hindi = get_font("devanagari", 160)
    bbox = d.textbbox((0, 0), hindi, font=f_hindi)
    hw = bbox[2] - bbox[0]
    hx = (W - hw) // 2
    hy = cy + 290
    d.text((hx, hy), hindi, font=f_hindi, fill=pal["secondary"])
    
    # English translation badge
    title = spec.get("title", "SPEED // RAFTAR").upper()
    f_impact = get_font("impact", 65)
    draw_centered_text(d, hy + 220, title, f_impact, pal["primary"])
    
    # Urban Context line
    f_sans = get_font("sans_bold", 38)
    sub = spec.get("subtitle", "3AM INDIRANAGAR FOUNDER CLUB")
    draw_centered_text(d, hy + 330, sub, f_sans, pal["secondary"])
    
    # Star Divider
    f_mono = get_font("mono", 28)
    divider = "★  ★  ★  •  ESTD 2026  •  ★  ★  ★"
    draw_centered_text(d, hy + 410, divider, f_mono, pal["muted"])
    
    # Bottom dispatch stamp
    f_small = get_font("mono", 22)
    draw_centered_text(d, H - 240, spec.get("bottom_stamp", "RARE EMBER™ DESI STREETWEAR • TIRUPUR COMBED COTTON"), f_small, pal["muted"])
    
    return img

def render_code_terminal(spec):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pal = PALETTES[spec.get("palette", "cyan")]
    
    margin = 160
    t_top = 260
    t_h = 1000
    
    # Terminal Window Outline
    d.rectangle([margin, t_top, W - margin, t_top + t_h], outline=pal["muted"], width=3)
    d.rectangle([margin, t_top, W - margin, t_top + 70], fill=(0, 240, 255, 30))
    
    # Window Buttons
    for i, bx in enumerate([margin + 35, margin + 70, margin + 105]):
        col = (255, 95, 86, 255) if i == 0 else ((255, 189, 46, 255) if i == 1 else (39, 201, 63, 255))
        d.ellipse([bx - 10, t_top + 25, bx + 10, t_top + 45], fill=col)
        
    f_mono = get_font("mono", 26)
    d.text((margin + 160, t_top + 20), spec.get("terminal_title", "bash ~ dev/rare_ember.sh"), font=f_mono, fill=pal["muted"])
    
    # Monospace Code Lines
    f_code = get_font("mono", 46)
    lines = spec.get("code_lines", [
        "$ git commit -m \"fix: life\"",
        "[main 404c0de] 1 file changed",
        "$ while (alive) {",
        "    build_future();",
        "    sleep(0);",
        "}"
    ])
    
    ly = t_top + 130
    for idx, l in enumerate(lines):
        col = pal["primary"] if idx == 0 else (pal["accent"] if "while" in l or "{" in l or "}" in l else pal["secondary"])
        d.text((margin + 50, ly), l, font=f_code, fill=col)
        ly += 80
        
    # Circuit elements below terminal
    cy = t_top + t_h + 300
    draw_circuit(d, W // 2, cy, span=440, fill=pal["primary"])
    
    # Tech Motto Headline
    f_heavy = get_font("heavy", 85)
    title = spec.get("title", "COMMIT OR DIE").upper()
    draw_centered_text(d, cy + 180, title, f_heavy, pal["secondary"])
    
    f_impact = get_font("impact", 44)
    draw_centered_text(d, cy + 300, spec.get("subtitle", "KERNEL PANIC // 0 ERRORS 0 WARNINGS"), f_impact, pal["primary"])
    
    return img

def render_heavy_iron(spec):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pal = PALETTES[spec.get("palette", "ember")]
    
    # Barbell Icon Center
    cy = 580
    draw_barbell(d, W // 2, cy, fill=pal["secondary"])
    
    # Bold Block Title
    f_heavy = get_font("heavy", spec.get("title_size", 120))
    title = spec.get("title", "HEAVY IRON").upper()
    y = draw_centered_text(d, cy + 220, title, f_heavy, pal["primary"])
    
    # Subtitle Ribbon
    d.rectangle([(W - 800) // 2, y + 40, (W + 800) // 2, y + 130], fill=pal["primary"])
    f_impact = get_font("impact", 60)
    sub = spec.get("subtitle", "DISCIPLINE > MOTIVATION").upper()
    bbox = d.textbbox((0, 0), sub, font=f_impact)
    tw = bbox[2] - bbox[0]
    d.text(((W - tw) // 2, y + 55), sub, font=f_impact, fill=(0, 0, 0, 255))
    
    # Weight Class / Establish Year
    f_sans = get_font("sans_bold", 45)
    draw_centered_text(d, y + 210, spec.get("statement", "1000 LB CLUB // BARBELL THERAPY"), f_sans, pal["secondary"])
    
    # Circular emblem ring
    d.ellipse([(W - 400) // 2, y + 330, (W + 400) // 2, y + 730], outline=pal["muted"], width=4)
    f_mono = get_font("mono", 32)
    draw_centered_text(d, y + 510, spec.get("badge", "NO EXCUSES"), f_mono, pal["primary"])
    
    # Bottom stamp
    f_small = get_font("mono", 22)
    draw_centered_text(d, H - 200, "RARE EMBER™ HEAVYWEIGHT POWERLIFTING ARCHIVE", f_small, pal["muted"])
    
    return img

def render_stoic_pillar(spec):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pal = PALETTES[spec.get("palette", "cream")]
    
    # Pillar Graphic Center
    cy = 600
    draw_pillar(d, W // 2, cy, fill=pal["primary"])
    
    # Latin Stoic Maxim
    latin = spec.get("latin", "AMOR FATI").upper()
    f_serif = get_font("serif", 130)
    y = draw_centered_text(d, cy + 260, latin, f_serif, pal["primary"])
    
    # English Philosophical Translation
    f_sans = get_font("sans_bold", 44)
    trans = spec.get("title", "LOVE YOUR FATE").upper()
    y = draw_centered_text(d, y + 30, trans, f_sans, pal["secondary"])
    
    # Quote / Author
    f_mono = get_font("mono", 32)
    author = spec.get("subtitle", "MARCUS AURELIUS • MEDITATIONS")
    draw_centered_text(d, y + 60, author, f_mono, pal["muted"])
    
    # Balanced Geometric Circles
    gc_y = y + 260
    d.ellipse([(W - 200) // 2, gc_y, (W + 200) // 2, gc_y + 200], outline=pal["primary"], width=3)
    d.line([(W // 2 - 160, gc_y + 100), (W // 2 + 160, gc_y + 100)], fill=pal["primary"], width=2)
    d.ellipse([W // 2 - 8, gc_y + 92, W // 2 + 8, gc_y + 108], fill=pal["secondary"])
    
    # Bottom Roman Stamp
    f_small = get_font("mono", 24)
    draw_centered_text(d, H - 240, spec.get("statement", "STILLNESS IS KEY • EGO IS THE ENEMY • MMXXVI"), f_small, pal["muted"])
    
    return img

def run_generation():
    import time
    from catalog_data import get_all_500_specs

    start_time = time.time()
    specs = get_all_500_specs()
    os.makedirs(OUT_DIR, exist_ok=True)
    
    user_downloads_dir = os.path.join(os.path.expanduser("~"), "Downloads", "500-trending-designs-png")
    os.makedirs(user_downloads_dir, exist_ok=True)

    categories = [
        "01-streetwear-typography",
        "02-anime-mecha",
        "03-indian-desi-pop",
        "04-tech-coder",
        "05-gym-alpha",
        "06-minimalist-stoic"
    ]
    for cat in categories:
        os.makedirs(os.path.join(OUT_DIR, cat), exist_ok=True)
        os.makedirs(os.path.join(user_downloads_dir, cat), exist_ok=True)

    print(f"Starting batch generation of {len(specs)} transparent PNG designs...")
    
    generated_count = 0
    catalog_metadata = []

    for idx, spec in enumerate(specs, start=1):
        tmpl = spec.get("template")
        cat = spec.get("category")
        fname = spec.get("filename")
        out_path = os.path.join(OUT_DIR, cat, fname)
        user_copy_path = os.path.join(user_downloads_dir, cat, fname)

        if tmpl == "brutalist_box":
            img = render_brutalist_box(spec)
        elif tmpl == "kanji_mecha":
            img = render_kanji_mecha(spec)
        elif tmpl == "desi_culture":
            img = render_desi_culture(spec)
        elif tmpl == "code_terminal":
            img = render_code_terminal(spec)
        elif tmpl == "heavy_iron":
            img = render_heavy_iron(spec)
        elif tmpl == "stoic_pillar":
            img = render_stoic_pillar(spec)
        else:
            img = render_brutalist_box(spec)

        img.save(out_path, "PNG", optimize=True)
        img.save(user_copy_path, "PNG", optimize=True)
        
        generated_count += 1
        catalog_metadata.append({
            "id": spec.get("id"),
            "title": spec.get("title"),
            "category": cat,
            "filename": fname,
            "rel_path": f"{cat}/{fname}"
        })

        if idx % 50 == 0 or idx == len(specs):
            elapsed = time.time() - start_time
            print(f"[{idx}/{len(specs)}] Generated ({elapsed:.1f}s) - Latest: {cat}/{fname}")

    print(f"\nAll {generated_count} PNGs generated successfully!")

    # Package ZIP archive
    print(f"Packaging {ZIP_PATH} ...")
    with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(OUT_DIR):
            for file in files:
                if file.endswith('.png'):
                    full_p = os.path.join(root, file)
                    rel_p = os.path.relpath(full_p, OUT_DIR)
                    zipf.write(full_p, rel_p)

    zip_size_mb = os.path.getsize(ZIP_PATH) / (1024 * 1024)
    print(f"Zip created: {ZIP_PATH} ({zip_size_mb:.2f} MB)")
    
    # Also save a copy of zip to Downloads
    user_zip_path = os.path.join(os.path.expanduser("~"), "Downloads", "rare-ember-500-trending-designs.zip")
    with open(ZIP_PATH, "rb") as sf, open(user_zip_path, "wb") as df:
        df.write(sf.read())
    print(f"Downloads copy created: {user_zip_path}")

    # Generate HTML Catalog
    html_path = os.path.join(OUT_DIR, "index.html")
    generate_html_catalog(catalog_metadata, html_path)
    print(f"HTML Visual Catalog created: {html_path}")

def generate_html_catalog(items, html_path):
    items_json = json.dumps(items)
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rare Ember™ • 500 Trending Print-Ready PNG Designs Catalog</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: #0d0c0b;
      color: #f5f5f4;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 2rem 1rem;
    }}
    .container {{ max-width: 1400px; margin: 0 auto; }}
    header {{
      text-align: center;
      margin-bottom: 2.5rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }}
    .brand {{
      display: inline-block;
      font-size: 0.85rem;
      font-weight: 800;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #FF4D24;
      background: rgba(255, 77, 36, 0.12);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      margin-bottom: 0.75rem;
    }}
    h1 {{ font-size: 2.5rem; font-weight: 900; margin-bottom: 0.5rem; }}
    p.subtitle {{ color: #a8a29e; font-size: 1.05rem; max-width: 700px; margin: 0 auto 1.5rem; }}
    .download-banner {{
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: linear-gradient(135deg, #FF4D24, #E8244B);
      color: white;
      text-decoration: none;
      font-weight: 800;
      font-size: 1rem;
      padding: 0.85rem 1.75rem;
      border-radius: 1rem;
      box-shadow: 0 8px 24px rgba(255,77,36,0.35);
      transition: transform 0.2s ease;
    }}
    .download-banner:hover {{ transform: translateY(-2px); }}
    .filters {{
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }}
    .filter-btn {{
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: #d6d3d1;
      padding: 0.55rem 1.1rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }}
    .filter-btn:hover, .filter-btn.active {{
      background: #FF4D24;
      border-color: #FF4D24;
      color: white;
    }}
    .search-box {{
      max-width: 450px;
      margin: 0 auto 2rem;
      position: relative;
    }}
    .search-input {{
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 9999px;
      padding: 0.75rem 1.5rem;
      color: white;
      font-size: 0.95rem;
      outline: none;
    }}
    .search-input:focus {{ border-color: #FF4D24; }}
    .stats {{ text-align: center; color: #78716c; font-size: 0.9rem; margin-bottom: 1.5rem; }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.5rem;
    }}
    .card {{
      background: #191614;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 1.25rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.25s ease, border-color 0.25s ease;
    }}
    .card:hover {{
      transform: translateY(-4px);
      border-color: rgba(255, 77, 36, 0.4);
    }}
    .preview {{
      aspect-ratio: 3/4;
      background: #110e0c;
      background-image: 
        radial-gradient(circle at 50% 50%, rgba(255, 77, 36, 0.05) 0%, transparent 70%),
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 100% 100%, 20px 20px, 20px 20px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }}
    .preview img {{
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,0.6));
    }}
    .badge {{
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(8px);
      color: #FF4D24;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 0.35rem;
      border: 1px solid rgba(255, 77, 36, 0.3);
    }}
    .details {{
      padding: 1rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }}
    .card-title {{
      font-weight: 800;
      font-size: 0.95rem;
      color: white;
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}
    .card-cat {{
      font-size: 0.75rem;
      color: #a8a29e;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }}
    .download-btn {{
      display: block;
      text-align: center;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      color: #f5f5f4;
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.5rem 0.75rem;
      border-radius: 0.65rem;
      transition: background 0.2s ease;
    }}
    .download-btn:hover {{
      background: #FF4D24;
      border-color: #FF4D24;
      color: white;
    }}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <span class="brand">Rare Ember™ Studio • Official Release</span>
      <h1>500 Trending Streetwear & Merch Designs</h1>
      <p class="subtitle">High-resolution (1800×2400 @ 300 DPI) transparent PNGs ready to upload directly into Qikink, Shopify, or print onto oversized tees, hoodies, mugs, and desk mats.</p>
      <a href="../rare-ember-500-trending-designs.zip" class="download-banner" download>
        ⬇ Download Complete 500 Designs Archive (.ZIP)
      </a>
    </header>

    <div class="search-box">
      <input type="text" id="searchInput" class="search-input" placeholder="Search across all 500 designs (e.g. Ronin, Jugaad, Gym, Terminal)..." oninput="filterDesigns()">
    </div>

    <div class="filters" id="filters">
      <button class="filter-btn active" onclick="setCategory('all')">All Themes (500)</button>
      <button class="filter-btn" onclick="setCategory('01-streetwear-typography')">01. Streetwear Typography (85)</button>
      <button class="filter-btn" onclick="setCategory('02-anime-mecha')">02. Anime & Mecha (85)</button>
      <button class="filter-btn" onclick="setCategory('03-indian-desi-pop')">03. Indian & Desi Pop (85)</button>
      <button class="filter-btn" onclick="setCategory('04-tech-coder')">04. Tech & Coder (85)</button>
      <button class="filter-btn" onclick="setCategory('05-gym-alpha')">05. Gym & Alpha (80)</button>
      <button class="filter-btn" onclick="setCategory('06-minimalist-stoic')">06. Minimalist & Stoic (80)</button>
    </div>

    <div class="stats" id="stats">Showing 500 of 500 designs</div>

    <div class="grid" id="grid"></div>
  </div>

  <script>
    const allItems = {items_json};
    let currentCategory = 'all';

    function setCategory(cat) {{
      currentCategory = cat;
      document.querySelectorAll('.filter-btn').forEach(btn => {{
        if ((cat === 'all' && btn.innerText.startsWith('All')) || btn.getAttribute('onclick').includes(cat)) {{
          btn.classList.add('active');
        }} else {{
          btn.classList.remove('active');
        }}
      }});
      filterDesigns();
    }}

    function filterDesigns() {{
      const query = document.getElementById('searchInput').value.toLowerCase().trim();
      const filtered = allItems.filter(item => {{
        const matchCat = currentCategory === 'all' || item.category === currentCategory;
        const matchQuery = !query || 
          item.title.toLowerCase().includes(query) || 
          item.id.toLowerCase().includes(query) || 
          item.category.toLowerCase().includes(query) ||
          item.filename.toLowerCase().includes(query);
        return matchCat && matchQuery;
      }});

      document.getElementById('stats').innerText = `Showing ${{filtered.length}} of ${{allItems.length}} designs`;
      renderGrid(filtered);
    }}

    function renderGrid(items) {{
      const grid = document.getElementById('grid');
      grid.innerHTML = items.map(item => `
        <div class="card">
          <div class="preview">
            <span class="badge">${{item.id}}</span>
            <img src="${{item.rel_path}}" alt="${{item.title}}" loading="lazy">
          </div>
          <div class="details">
            <div>
              <div class="card-title">${{item.title}}</div>
              <div class="card-cat">${{item.category.replace(/^\\d+-/, '').replace(/-/g, ' ')}}</div>
            </div>
            <a href="${{item.rel_path}}" download="${{item.filename}}" class="download-btn">
              Download PNG ➔
            </a>
          </div>
        </div>
      `).join('');
    }}

    // Initial render
    filterDesigns();
  </script>
</body>
</html>
"""
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

if __name__ == "__main__":
    run_generation()

