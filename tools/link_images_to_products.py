import json
import re

# Load unsplash products
unsplash_prods = json.load(open('unsplash_products_list.json', encoding='utf-8'))
slugs = [p['id'] for p in unsplash_prods]
titles = {p['id']: p['title'] for p in unsplash_prods}

subagents = [
    ('9a41891c-cb09-4cdd-88de-a6a96444a098', 'Batch 1'),
    ('8ead37fe-8276-4b3e-8391-46f377e32145', 'Batch 2'),
    ('258a4425-f633-4ea3-9a45-1386d920c2f4', 'Batch 3'),
]

product_image_map = {s: [] for s in slugs}

# 1. From Batch 1 report received from 9a41891c-cb09-4cdd-88de-a6a96444a098
batch1_known = {
    "meesho-10in1-electronic-cleaner-kit-keyboard-earbuds": [
        "https://images.meesho.com/images/products/609133396/ujs4q_512.jpg",
        "https://images.meesho.com/images/products/609133396/cuyiv_512.jpg",
        "https://images.meesho.com/images/products/609133396/advra_512.jpg",
        "https://images.meesho.com/images/products/609133396/07ptk_512.jpg"
    ],
    "meesho-360-rotating-makeup-cosmetic-organizer-acrylic": [
        "https://images.meesho.com/images/products/239049045/hx7yx_512.jpg",
        "https://images.meesho.com/images/products/239049045/cpwii_512.jpg",
        "https://images.meesho.com/images/products/239049045/uedwl_512.jpg",
        "https://images.meesho.com/images/products/239049045/6vof0_512.jpg"
    ],
    "meesho-360-rotating-spice-rack-turntable-lazy-susan": [
        "https://images.meesho.com/images/products/681447111/bwzxw_512.jpg",
        "https://images.meesho.com/images/products/681447111/kujc8_512.jpg",
        "https://images.meesho.com/images/products/681447111/ctjts_512.jpg",
        "https://images.meesho.com/images/products/681447111/d5mvi_512.jpg"
    ],
    "meesho-4in1-handheld-electric-vegetable-cutter-set": [
        "https://images.meesho.com/images/products/527716065/erpia_512.jpg",
        "https://images.meesho.com/images/products/527716065/vtjxs_512.jpg",
        "https://images.meesho.com/images/products/527716065/tq811_512.jpg",
        "https://images.meesho.com/images/products/527716065/5js3e_512.jpg"
    ],
    "meesho-8in1-type-c-hub-hdmi-sd-card-usb3": [
        "https://images.meesho.com/images/products/1015542681/5pias_512.jpg",
        "https://images.meesho.com/images/products/1015542681/qfeag_512.jpg",
        "https://images.meesho.com/images/products/1015542681/wpw6a_512.jpg",
        "https://images.meesho.com/images/products/542736092/cgqgt_512.jpg"
    ],
    "meesho-acrylic-led-glow-message-note-board": [
        "https://images.meesho.com/images/products/596541532/x9tqj_512.jpg",
        "https://images.meesho.com/images/products/596541532/9h1y7_512.jpg",
        "https://images.meesho.com/images/products/596541532/5sypb_512.jpg"
    ],
    "meesho-adhesive-bathroom-corner-shower-caddy-2pk": [
        "https://images.meesho.com/images/products/719201159/owu7i_512.jpg",
        "https://images.meesho.com/images/products/719201159/hukkb_512.jpg",
        "https://images.meesho.com/images/products/719201159/grtiy_512.jpg",
        "https://images.meesho.com/images/products/719201159/wpmdy_512.jpg"
    ],
    "meesho-anti-blue-light-blocking-computer-glasses": [
        "https://images.meesho.com/images/products/613749826/dk2bi_512.jpg",
        "https://images.meesho.com/images/products/613749826/2nsxv_512.jpg",
        "https://images.meesho.com/images/products/613749826/9vz7j_512.jpg",
        "https://images.meesho.com/images/products/613749826/wkpxx_512.jpg"
    ],
    "meesho-automatic-magnetic-self-stirring-mug": [
        "https://images.meesho.com/images/products/753399984/fpmqz_512.jpg",
        "https://images.meesho.com/images/products/753399984/retdj_512.jpg",
        "https://images.meesho.com/images/products/753399984/xs3wz_512.jpg",
        "https://images.meesho.com/images/products/753399984/zcbmo_512.jpg"
    ],
    "meesho-automatic-wall-toothpaste-dispenser-cup-holder": [
        "https://images.meesho.com/images/products/884033635/rytgi_512.jpg",
        "https://images.meesho.com/images/products/884033635/gxzid_512.jpg",
        "https://images.meesho.com/images/products/884033635/s8tfj_512.jpg",
        "https://images.meesho.com/images/products/884033635/wdoka_512.jpg"
    ],
    "meesho-boho-macrame-woven-wall-hanging-shelf": [
        "https://images.meesho.com/images/products/494516454/yxtv3_512.jpg",
        "https://images.meesho.com/images/products/494516454/xdlb7_512.jpg",
        "https://images.meesho.com/images/products/494516454/ihgdz_512.jpg",
        "https://images.meesho.com/images/products/494516454/8vaeq_512.jpg"
    ],
    "meesho-capsule-mini-pocket-uv-sun-umbrella": [
        "https://images.meesho.com/images/products/410882010/iidgy_512.jpg",
        "https://images.meesho.com/images/products/410882010/g1iv5_512.jpg",
        "https://images.meesho.com/images/products/410882010/ckvxo_512.jpg",
        "https://images.meesho.com/images/products/410882010/83nix_512.jpg"
    ],
    "meesho-ceramic-aroma-diffuser-electric-touch-lamp": [
        "https://images.meesho.com/images/products/538967791/xiqyt_512.jpg",
        "https://images.meesho.com/images/products/538967791/vvsxc_512.jpg",
        "https://images.meesho.com/images/products/538967791/taxob_512.jpg",
        "https://images.meesho.com/images/products/538967791/d7njm_512.jpg"
    ],
    "meesho-collapsible-silicone-leakproof-water-bottle": [
        "https://images.meesho.com/images/products/440375513/mxce7_512.jpg",
        "https://images.meesho.com/images/products/440375513/x6z1w_512.jpg",
        "https://images.meesho.com/images/products/440375513/pw92m_512.jpg",
        "https://images.meesho.com/images/products/440375513/bq81n_512.jpg"
    ],
    "meesho-cordless-fabric-lint-shaver-rechargeable": [
        "https://images.meesho.com/images/products/635083873/wfasw_512.jpg",
        "https://images.meesho.com/images/products/635083873/mv0un_512.jpg",
        "https://images.meesho.com/images/products/635083873/lgzvk_512.jpg"
    ],
    "meesho-cordless-mini-portable-vacuum-cleaner-usb": [
        "https://images.meesho.com/images/products/1048478715/32eci_512.jpg",
        "https://images.meesho.com/images/products/1048478715/s2sck_512.jpg",
        "https://images.meesho.com/images/products/1048478715/mq2cw_512.jpg",
        "https://images.meesho.com/images/products/1048478715/w7hbk_512.jpg"
    ],
    "meesho-crystal-ball-3d-galaxy-led-lamp-wooden-base": [
        "https://images.meesho.com/images/products/1038078401/hha6k_512.jpg",
        "https://images.meesho.com/images/products/1038078401/t7ub2_512.jpg",
        "https://images.meesho.com/images/products/1038078401/l7wwn_512.jpg"
    ],
    "meesho-crystal-rose-diamond-touch-lamp-16rgb": [
        "https://images.meesho.com/images/products/1023667594/w5bxr_512.jpg",
        "https://images.meesho.com/images/products/1023667594/t0ds8_512.jpg",
        "https://images.meesho.com/images/products/1023667594/bgtil_512.jpg",
        "https://images.meesho.com/images/products/1023667594/h7qsy_512.jpg"
    ],
    "meesho-digital-kitchen-food-scale-10kg-lcd": [
        "https://images.meesho.com/images/products/1043226086/u33az_512.jpg",
        "https://images.meesho.com/images/products/1043226086/nf3gp_512.jpg",
        "https://images.meesho.com/images/products/1043226086/mo6pr_512.jpg",
        "https://images.meesho.com/images/products/1043226086/7nlnp_512.jpg"
    ],
    "meesho-digital-kitchen-gram-weighing-scale": [
        "https://images.meesho.com/images/products/1043226086/u33az_512.jpg",
        "https://images.meesho.com/images/products/1043226086/nf3gp_512.jpg",
        "https://images.meesho.com/images/products/1043226086/mo6pr_512.jpg",
        "https://images.meesho.com/images/products/1043226086/7nlnp_512.jpg"
    ],
    "meesho-digital-wooden-led-alarm-clock-temp": [
        "https://images.meesho.com/images/products/510843012/lrw2j_512.jpg",
        "https://images.meesho.com/images/products/510843012/exmwi_512.jpg",
        "https://images.meesho.com/images/products/510843012/vv2vz_512.jpg",
        "https://images.meesho.com/images/products/510843012/ul2el_512.jpg"
    ],
    "meesho-egg-boiler-poacher-steamer-7eggs": [
        "https://images.meesho.com/images/products/891713961/6ppzx_512.jpg",
        "https://images.meesho.com/images/products/891713961/oxxdm_512.jpg",
        "https://images.meesho.com/images/products/891713961/e1moe_512.jpg",
        "https://images.meesho.com/images/products/891713961/na9ab_512.jpg"
    ],
    "meesho-electric-dry-spice-nut-coffee-grinder": [
        "https://images.meesho.com/images/products/1031980035/blvuo_512.jpg",
        "https://images.meesho.com/images/products/1031980035/wapwf_512.jpg",
        "https://images.meesho.com/images/products/1031980035/ij3ye_512.jpg",
        "https://images.meesho.com/images/products/1031980035/kbhyy_512.jpg"
    ],
    "meesho-electric-manicure-pedicure-nail-drill-kit": [
        "https://images.meesho.com/images/products/696522587/zm2pg_512.jpg",
        "https://images.meesho.com/images/products/696522587/lwrca_512.jpg",
        "https://images.meesho.com/images/products/696522587/wiiot_512.jpg",
        "https://images.meesho.com/images/products/696522587/rgcai_512.jpg"
    ],
    "meesho-electric-milk-frother-coffee-whisk": [
        "https://images.meesho.com/images/products/508283374/wqk4r_512.jpg",
        "https://images.meesho.com/images/products/508283374/gviyp_512.jpg",
        "https://images.meesho.com/images/products/508283374/7lgaj_512.jpg",
        "https://images.meesho.com/images/products/508283374/h4q8p_512.jpg"
    ],
    "meesho-ergonomic-aluminum-folding-laptop-stand": [
        "https://images.meesho.com/images/products/407794791/oa7n5_512.jpg",
        "https://images.meesho.com/images/products/407794791/vylxl_512.jpg",
        "https://images.meesho.com/images/products/407794791/bt1n6_512.jpg",
        "https://images.meesho.com/images/products/407794791/jh5rd_512.jpg"
    ],
    "meesho-extended-rgb-gaming-desk-mat-mousepad": [
        "https://images.meesho.com/images/products/802952646/snrfn_512.jpg",
        "https://images.meesho.com/images/products/802952646/hhjlb_512.jpg",
        "https://images.meesho.com/images/products/802952646/vy1xy_512.jpg",
        "https://images.meesho.com/images/products/802952646/5xuqq_512.jpg"
    ],
    "meesho-eyewear-multi-tier-sunglasses-display-case": [
        "https://images.meesho.com/images/products/419515147/mw4b2_512.jpg",
        "https://images.meesho.com/images/products/419515147/wow9x_512.jpg",
        "https://images.meesho.com/images/products/419515147/20vvr_512.jpg",
        "https://images.meesho.com/images/products/419515147/6i2pz_512.jpg"
    ]
}

for k, v in batch1_known.items():
    product_image_map[k] = v

print(f"Loaded {len(batch1_known)} products from Batch 1")
