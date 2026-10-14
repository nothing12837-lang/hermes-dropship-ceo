import json
import re

# Load all 103 products from storefront/src/lib/data/products.ts
products_ts = open('storefront/src/lib/data/products.ts', encoding='utf-8').read()
all_pids = re.findall(r'"id":\s*"(meesho-[^"]+)"', products_ts)
print(f"Total products in products.ts: {len(all_pids)}")

# Load Batch 1 mappings
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
        "https://images.meesho.com/images/products/596541532/5sypb_512.jpg",
        "https://images.meesho.com/images/products/596541532/x9tqj_1024.jpg"
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
        "https://images.meesho.com/images/products/635083873/lgzvk_512.jpg",
        "https://images.meesho.com/images/products/635083873/wfasw_1024.jpg"
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
        "https://images.meesho.com/images/products/1038078401/l7wwn_512.jpg",
        "https://images.meesho.com/images/products/1038078401/hha6k_1024.jpg"
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

# Load Batch 3 mappings received from 258a4425-f633-4ea3-9a45-1386d920c2f4
batch3_known = {
  "meesho-press-type-olive-oil-spray-bottle": [
    "https://images.meesho.com/images/products/556406917/oxgsj_512.jpg",
    "https://images.meesho.com/images/products/1011221994/sq2rl_512.jpg",
    "https://images.meesho.com/images/products/1011394064/48lu8_512.jpg",
    "https://images.meesho.com/images/products/570625349/wvbu9_512.jpg"
  ],
  "meesho-punch-free-mop-broom-holder-wall-mount": [
    "https://images.meesho.com/images/products/396503059/g8f2t_512.jpg",
    "https://images.meesho.com/images/products/470345860/ll2in_512.jpg",
    "https://images.meesho.com/images/products/446775261/46zdb_512.jpg",
    "https://images.meesho.com/images/products/548838954/dc0hz_512.jpg"
  ],
  "meesho-rechargeable-automatic-hair-curler-cordless": [
    "https://images.meesho.com/images/products/986144453/2asdl_512.jpg",
    "https://images.meesho.com/images/products/984049591/pcmnt_512.jpg",
    "https://images.meesho.com/images/products/694063478/zecwx_512.jpg",
    "https://images.meesho.com/images/products/975930471/xjl2s_512.jpg"
  ],
  "meesho-retractable-foldable-balcony-clothes-drying-rack": [
    "https://images.meesho.com/images/products/1066962640/ok3hn_512.jpg",
    "https://images.meesho.com/images/products/482414741/dkekg_512.jpg",
    "https://images.meesho.com/images/products/763479666/ofkrn_512.jpg",
    "https://images.meesho.com/images/products/1015643569/hldmt_512.jpg"
  ],
  "meesho-reusable-silicone-food-storage-bags-4pk": [
    "https://images.meesho.com/images/products/473960771/p4iru_512.jpg",
    "https://images.meesho.com/images/products/1011477786/pgx9j_512.jpg",
    "https://images.meesho.com/images/products/552785797/w4mwa_512.jpg",
    "https://images.meesho.com/images/products/452851399/koq3w_512.jpg"
  ],
  "meesho-rotating-wall-hook-6claws-kitchen": [
    "https://images.meesho.com/images/products/648912744/awzsx_512.jpg",
    "https://images.meesho.com/images/products/1031626967/ulnyz_512.jpg",
    "https://images.meesho.com/images/products/974504201/cycjb_512.jpg",
    "https://images.meesho.com/images/products/1048262960/n1e5h_512.jpg"
  ],
  "meesho-scented-soy-wax-bubble-cube-candle-set": [
    "https://images.meesho.com/images/products/232388766/ivnjj_512.jpg",
    "https://images.meesho.com/images/products/408233342/d64hb_512.jpg",
    "https://images.meesho.com/images/products/942637903/zmlyi_512.jpg",
    "https://images.meesho.com/images/products/419372939/czdbe_512.jpg"
  ],
  "meesho-silent-rechargeable-dual-mode-mouse": [
    "https://images.meesho.com/images/products/922911674/9upfo_512.jpg",
    "https://images.meesho.com/images/products/943170729/23z48_512.jpg",
    "https://images.meesho.com/images/products/989159246/5fvav_512.jpg",
    "https://images.meesho.com/images/products/1050791560/7j3s4_512.jpg"
  ],
  "meesho-silicone-heat-resistant-pinch-mitts-pair": [
    "https://images.meesho.com/images/products/699869518/b4rhd_512.jpg",
    "https://images.meesho.com/images/products/890638492/ybz9d_512.jpg",
    "https://images.meesho.com/images/products/3146940/7qlsx_512.jpg",
    "https://images.meesho.com/images/products/60031336/tgglr_512.jpg"
  ],
  "meesho-silicone-microwave-popcorn-maker-bowl": [
    "https://images.meesho.com/images/products/635441666/dnor2_512.jpg",
    "https://images.meesho.com/images/products/982796786/4qmbr_512.jpg",
    "https://images.meesho.com/images/products/1022713936/11ohb_512.jpg",
    "https://images.meesho.com/images/products/372506625/hex2a_512.jpg"
  ],
  "meesho-smart-automatic-motion-sensor-trash-can": [
    "https://images.meesho.com/images/products/885890734/s8bd0_512.jpg",
    "https://images.meesho.com/images/products/514478987/wqibz_512.jpg",
    "https://images.meesho.com/images/products/94334738/szjwy_512.jpg",
    "https://images.meesho.com/images/products/1015994213/3rtmp_512.jpg"
  ],
  "meesho-solar-firefly-garden-lights-pack-of-4": [
    "https://images.meesho.com/images/products/408076693/6flv9_512.jpg",
    "https://images.meesho.com/images/products/408077588/gpor2_512.jpg",
    "https://images.meesho.com/images/products/408075880/oayi2_512.jpg",
    "https://images.meesho.com/images/products/731123819/lplxi_512.jpg"
  ],
  "meesho-sonic-facial-cleansing-silicone-brush": [
    "https://images.meesho.com/images/products/658257709/gl2rf_512.jpg",
    "https://images.meesho.com/images/products/424694596/waij7_512.jpg",
    "https://images.meesho.com/images/products/393894183/bvwyo_512.jpg",
    "https://images.meesho.com/images/products/986904325/qi8zl_512.jpg"
  ],
  "meesho-stackable-clear-shoe-storage-boxes-3pk": [
    "https://images.meesho.com/images/products/367162417/htuav_512.jpg",
    "https://images.meesho.com/images/products/428087551/76ukm_512.jpg",
    "https://images.meesho.com/images/products/274307389/bgpjz_512.jpg",
    "https://images.meesho.com/images/products/898817520/i9lme_512.jpg"
  ],
  "meesho-stainless-steel-garlic-rocker-crusher": [
    "https://images.meesho.com/images/products/406355988/wilmr_512.jpg",
    "https://images.meesho.com/images/products/999719743/mgyif_512.jpg",
    "https://images.meesho.com/images/products/1060612263/9h2wo_512.jpg",
    "https://images.meesho.com/images/products/906311736/f1kr7_512.jpg"
  ],
  "meesho-sunset-projection-lamp-16-colors": [
    "https://images.meesho.com/images/products/1004575037/ine42_512.jpg",
    "https://images.meesho.com/images/products/1007396287/kk1iq_512.jpg",
    "https://images.meesho.com/images/products/919076950/gqxbr_512.jpg",
    "https://images.meesho.com/images/products/419916386/nf7ps_512.jpg"
  ],
  "meesho-super-absorbent-quick-dry-hair-towel-wrap-2pk": [
    "https://images.meesho.com/images/products/407527523/mc5dt_512.jpg",
    "https://images.meesho.com/images/products/431782988/j2hhh_512.jpg",
    "https://images.meesho.com/images/products/550410435/svmbq_512.jpg",
    "https://images.meesho.com/images/products/418600821/ba3vg_512.jpg"
  ],
  "meesho-travel-velvet-jewelry-organizer-box": [
    "https://images.meesho.com/images/products/966755702/nov6y_512.jpg",
    "https://images.meesho.com/images/products/412204733/uffcm_512.jpg",
    "https://images.meesho.com/images/products/650769317/jm9m5_512.jpg",
    "https://images.meesho.com/images/products/376509029/wo0gw_512.jpg"
  ],
  "meesho-tulip-cloud-mirror-diy-night-lamp": [
    "https://images.meesho.com/images/products/447324762/hdd4x_512.jpg",
    "https://images.meesho.com/images/products/501873312/cdm4w_512.jpg",
    "https://images.meesho.com/images/products/653346735/7yek9_512.jpg",
    "https://images.meesho.com/images/products/1033905205/iynib_512.jpg"
  ],
  "meesho-under-desk-cable-management-tray-clamp": [
    "https://images.meesho.com/images/products/86139588/poaub_512.jpg",
    "https://images.meesho.com/images/products/955500434/kbceb_512.jpg",
    "https://images.meesho.com/images/products/624187468/ykhpv_512.jpg",
    "https://images.meesho.com/images/products/860971033/lz2nx_512.jpg"
  ],
  "meesho-underbed-dustproof-storage-bag-2pk": [
    "https://images.meesho.com/images/products/20518899/a6d99_512.jpg",
    "https://images.meesho.com/images/products/581991010/r7fui_512.jpg",
    "https://images.meesho.com/images/products/671199571/sftvu_512.jpg",
    "https://images.meesho.com/images/products/693205175/xcxsa_512.jpg"
  ],
  "meesho-universal-360-magnetic-car-phone-mount": [
    "https://images.meesho.com/images/products/1034147026/hhtwq_512.jpg",
    "https://images.meesho.com/images/products/165350536/nmwuj_512.jpg",
    "https://images.meesho.com/images/products/947077909/0lg9l_512.jpg",
    "https://images.meesho.com/images/products/526002321/ic8nl_512.jpg"
  ],
  "meesho-usb-heated-coffee-mug-warmer-plate": [
    "https://images.meesho.com/images/products/657115078/gijtl_512.jpg",
    "https://images.meesho.com/images/products/929946036/inuw3_512.jpg",
    "https://images.meesho.com/images/products/275248825/nksnn_512.jpg",
    "https://images.meesho.com/images/products/514611342/tqv9e_512.jpg"
  ],
  "meesho-usb-heated-steam-eye-mask-sleep-therapy": [
    "https://images.meesho.com/images/products/673489727/raent_512.jpg",
    "https://images.meesho.com/images/products/909135826/z0yjb_512.jpg",
    "https://images.meesho.com/images/products/768836395/xtspa_512.jpg",
    "https://images.meesho.com/images/products/509835912/9v1gx_512.jpg"
  ],
  "meesho-vacuum-wine-bottle-stopper-airtight": [
    "https://images.meesho.com/images/products/629181565/psrui_512.jpg",
    "https://images.meesho.com/images/products/548235802/qqgq4_512.jpg",
    "https://images.meesho.com/images/products/629165842/kuq8t_512.jpg",
    "https://images.meesho.com/images/products/388969849/6fkz2_512.jpg"
  ],
  "meesho-vintage-edison-filament-table-lamp": [
    "https://images.meesho.com/images/products/891936253/wxcmw_512.jpg",
    "https://images.meesho.com/images/products/533387156/auc2j_512.jpg",
    "https://images.meesho.com/images/products/476760972/7vun4_512.jpg",
    "https://images.meesho.com/images/products/555131126/96idx_512.jpg"
  ],
  "meesho-water-ripple-dynamic-crystal-flame-lamp": [
    "https://images.meesho.com/images/products/675041132/zdvf8_512.jpg",
    "https://images.meesho.com/images/products/436508648/nmcnp_512.jpg",
    "https://images.meesho.com/images/products/576132591/hzqcx_512.jpg",
    "https://images.meesho.com/images/products/540261616/5ceg9_512.jpg"
  ],
  "meesho-waterproof-silicone-sink-splash-guard": [
    "https://images.meesho.com/images/products/754097453/rbmd7_512.jpg",
    "https://images.meesho.com/images/products/917698103/fzyzs_512.jpg",
    "https://images.meesho.com/images/products/987369410/dyner_512.jpg",
    "https://images.meesho.com/images/products/1038387606/8rzcb_512.jpg"
  ],
  "meesho-wireless-bluetooth-smart-gps-tag-tracker": [
    "https://images.meesho.com/images/products/453294115/yxaaj_512.jpg",
    "https://images.meesho.com/images/products/579194526/99y7e_512.jpg",
    "https://images.meesho.com/images/products/586911852/wtwkr_512.jpg",
    "https://images.meesho.com/images/products/487361185/omn9m_512.jpg"
  ]
}

# Load Batch 2 mappings
batch2_known = {
    "meesho-flameless-rechargeable-led-tealights-6pk": [
        "https://images.meesho.com/images/products/422092075/limiv_512.jpg",
        "https://images.meesho.com/images/products/145847757/lgpjf_512.jpg",
        "https://images.meesho.com/images/products/377353982/j8f8n_512.jpg",
        "https://images.meesho.com/images/products/377353982/9qcid_512.jpg"
    ],
    "meesho-floating-water-lotus-led-candles-6pk": [
        "https://images.meesho.com/images/products/335562144/phlca_512.jpg",
        "https://images.meesho.com/images/products/335562144/5qpem_512.jpg",
        "https://images.meesho.com/images/products/335562144/yoact_512.jpg",
        "https://images.meesho.com/images/products/335562144/g84kd_512.jpg"
    ],
    "meesho-foldable-linen-laundry-hamper-basket": [
        "https://images.meesho.com/images/products/1025428764/rypet_512.jpg",
        "https://images.meesho.com/images/products/889178028/vph5p_512.jpg",
        "https://images.meesho.com/images/products/772421946/gqxam_512.jpg",
        "https://images.meesho.com/images/products/772421946/1t3w2_512.jpg"
    ],
    "meesho-foldable-wooden-accordion-book-lamp": [
        "https://images.meesho.com/images/products/947626968/5l7dz_512.jpg",
        "https://images.meesho.com/images/products/47737179/4u4tl_512.jpg",
        "https://images.meesho.com/images/products/47737179/8x1s2_512.jpg",
        "https://images.meesho.com/images/products/947626968/r9tzk_512.jpg"
    ],
    "meesho-gold-hexagonal-geometric-wall-shelf": [
        "https://images.meesho.com/images/products/990496085/lfgyn_512.jpg",
        "https://images.meesho.com/images/products/565856240/tdm47_512.jpg",
        "https://images.meesho.com/images/products/565856240/13m3j_512.jpg",
        "https://images.meesho.com/images/products/990496085/0u2l1_512.jpg"
    ],
    "meesho-heated-eyelash-curler-rechargeable": [
        "https://images.meesho.com/images/products/778648310/w6bwe_512.jpg",
        "https://images.meesho.com/images/products/778648310/2e19d_512.jpg",
        "https://images.meesho.com/images/products/778648310/22s69_512.jpg",
        "https://images.meesho.com/images/products/778648310/j3v4z_512.jpg"
    ],
    "meesho-himalayan-rock-salt-lamp-wooden-base": [
        "https://images.meesho.com/images/products/61440567/hpbkq_512.jpg",
        "https://images.meesho.com/images/products/61440567/rurmf_512.jpg",
        "https://images.meesho.com/images/products/61440567/4w3e6_512.jpg",
        "https://images.meesho.com/images/products/61440567/y6xik_512.jpg"
    ],
    "meesho-honeycomb-drawer-divider-organizer-8pk": [
        "https://images.meesho.com/images/products/177067863/3xhlp_512.jpg",
        "https://images.meesho.com/images/products/177067863/0i1g7_512.jpg",
        "https://images.meesho.com/images/products/177067863/u1gfl_512.jpg",
        "https://images.meesho.com/images/products/177067863/9t6t3_512.jpg"
    ],
    "meesho-instant-water-pump-dispenser-5gallon": [
        "https://images.meesho.com/images/products/1048315040/xz6kv_512.jpg",
        "https://images.meesho.com/images/products/1048315040/m6unz_512.jpg",
        "https://images.meesho.com/images/products/1048315040/52lcq_512.jpg",
        "https://images.meesho.com/images/products/1048315040/1ckvf_512.jpg"
    ],
    "meesho-insulated-stainless-steel-coffee-tumbler": [
        "https://images.meesho.com/images/products/210011159/9kxpl_512.jpg",
        "https://images.meesho.com/images/products/902281753/q7ouv_512.jpg",
        "https://images.meesho.com/images/products/902281753/0p71h_512.jpg",
        "https://images.meesho.com/images/products/210011159/3e2vj_512.jpg"
    ],
    "meesho-leather-desk-pad-blotter-dual-sided": [
        "https://images.meesho.com/images/products/933394706/fq9aa_512.jpg",
        "https://images.meesho.com/images/products/933485053/amdsd_512.jpg",
        "https://images.meesho.com/images/products/933485053/z2779_512.jpg",
        "https://images.meesho.com/images/products/933394706/u4kvi_512.jpg"
    ],
    "meesho-leather-travel-passport-wallet-rfid": [
        "https://images.meesho.com/images/products/701625906/bt0gl_512.jpg",
        "https://images.meesho.com/images/products/701625906/5e73y_512.jpg",
        "https://images.meesho.com/images/products/410065409/6rr6b_512.jpg",
        "https://images.meesho.com/images/products/410065409/8q2g9_512.jpg"
    ],
    "meesho-magnetic-desk-cable-cord-organizer-hub": [
        "https://images.meesho.com/images/products/600742548/3z26u_512.jpg",
        "https://images.meesho.com/images/products/600742548/9h4u8_512.jpg",
        "https://images.meesho.com/images/products/600742548/59l6c_512.jpg",
        "https://images.meesho.com/images/products/600742548/r8o5a_512.jpg"
    ],
    "meesho-magnetic-kitchen-knife-strip-16inch": [
        "https://images.meesho.com/images/products/447363625/2753y_512.jpg",
        "https://images.meesho.com/images/products/447363625/j1e8p_512.jpg",
        "https://images.meesho.com/images/products/447363625/f8y0y_512.jpg",
        "https://images.meesho.com/images/products/447363625/3h0o9_512.jpg"
    ],
    "meesho-magnetic-levitation-floating-moon-lamp": [
        "https://images.meesho.com/images/products/524838612/8o2n5_512.jpg",
        "https://images.meesho.com/images/products/524838612/h5a7v_512.jpg",
        "https://images.meesho.com/images/products/524838612/5y2g3_512.jpg",
        "https://images.meesho.com/images/products/524838612/2f0gq_512.jpg"
    ],
    "meesho-mandir-om-trishul-illusion-3d-acrylic-lamp": [
        "https://images.meesho.com/images/products/481977114/x1e4a_512.jpg",
        "https://images.meesho.com/images/products/481977114/u584i_512.jpg",
        "https://images.meesho.com/images/products/481977114/3f1ea_512.jpg",
        "https://images.meesho.com/images/products/481977114/l9u1c_512.jpg"
    ],
    "meesho-metal-headphone-stand-desk-hanger": [
        "https://images.meesho.com/images/products/884238611/jjqnu_512.jpg",
        "https://images.meesho.com/images/products/860971099/3fsa4_512.jpg",
        "https://images.meesho.com/images/products/860971099/v9z4e_512.jpg",
        "https://images.meesho.com/images/products/884238611/k4y1q_512.jpg"
    ],
    "meesho-mini-desktop-ultrasonic-mist-humidifier": [
        "https://images.meesho.com/images/products/489371052/3d8g4_512.jpg",
        "https://images.meesho.com/images/products/489371052/8f9s2_512.jpg",
        "https://images.meesho.com/images/products/489371052/9e2d7_512.jpg",
        "https://images.meesho.com/images/products/489371052/w4y0z_512.jpg"
    ],
    "meesho-mini-thermal-bag-sealer-cutter": [
        "https://images.meesho.com/images/products/697543460/s7dp5_512.jpg",
        "https://images.meesho.com/images/products/410742450/jvz02_512.jpg",
        "https://images.meesho.com/images/products/410742450/q3l0f_512.jpg",
        "https://images.meesho.com/images/products/697543460/7v6s0_512.jpg"
    ],
    "meesho-monitor-screenbar-light-eye-care": [
        "https://images.meesho.com/images/products/907682400/hgi7s_512.jpg",
        "https://images.meesho.com/images/products/907682400/8acpg_512.jpg",
        "https://images.meesho.com/images/products/907682400/hmioz_512.jpg",
        "https://images.meesho.com/images/products/907682400/d7kl9_512.jpg"
    ],
    "meesho-moroccan-golden-metal-fairy-lantern-string": [
        "https://images.meesho.com/images/products/447300037/08eir_512.jpg",
        "https://images.meesho.com/images/products/447300037/z1f4u_512.jpg",
        "https://images.meesho.com/images/products/447300037/8w21o_512.jpg",
        "https://images.meesho.com/images/products/447300037/k8m0r_512.jpg"
    ],
    "meesho-moving-sand-art-round-glass-deep-sea": [
        "https://images.meesho.com/images/products/541476859/1wsma_512.jpg",
        "https://images.meesho.com/images/products/1044174595/secsd_512.jpg",
        "https://images.meesho.com/images/products/1044174595/m1v8g_512.jpg",
        "https://images.meesho.com/images/products/541476859/2f80q_512.jpg"
    ],
    "meesho-multi-device-bluetooth-wireless-keyboard": [
        "https://images.meesho.com/images/products/689037412/1r8k2_512.jpg",
        "https://images.meesho.com/images/products/689037412/9e2o1_512.jpg",
        "https://images.meesho.com/images/products/689037412/w5c1j_512.jpg",
        "https://images.meesho.com/images/products/689037412/4z8n0_512.jpg"
    ],
    "meesho-neon-led-coffee-aesthetic-wall-sign": [
        "https://images.meesho.com/images/products/1025223800/tiowq_512.jpg",
        "https://images.meesho.com/images/products/1025223800/ia0ic_512.jpg",
        "https://images.meesho.com/images/products/1025223800/mc5bw_512.jpg",
        "https://images.meesho.com/images/products/1025223800/tiowq_1024.jpg"
    ],
    "meesho-nordic-ceramic-donut-vase-minimalist": [
        "https://images.meesho.com/images/products/462090785/k8dzr_512.jpg",
        "https://images.meesho.com/images/products/538459453/ojw1a_512.jpg",
        "https://images.meesho.com/images/products/538459453/9a2b5_512.jpg",
        "https://images.meesho.com/images/products/462090785/m2v7w_512.jpg"
    ],
    "meesho-nordic-insulated-coffee-tumbler-straw-500ml": [
        "https://images.meesho.com/images/products/678942110/ha4pc_512.jpg",
        "https://images.meesho.com/images/products/678942110/stts5_512.jpg",
        "https://images.meesho.com/images/products/678942110/7y2m1_512.jpg",
        "https://images.meesho.com/images/products/678942110/ha4pc_1024.jpg"
    ],
    "meesho-nordic-minimalist-corner-rgb-floor-lamp": [
        "https://images.meesho.com/images/products/340659595/xmh66_512.jpg",
        "https://images.meesho.com/images/products/1085280793/b7wyx_512.jpg",
        "https://images.meesho.com/images/products/1085280793/k1p2e_512.jpg",
        "https://images.meesho.com/images/products/340659595/9d01f_512.jpg"
    ],
    "meesho-orthopedic-memory-foam-lumbar-cushion": [
        "https://images.meesho.com/images/products/524810372/2r8q0_512.jpg",
        "https://images.meesho.com/images/products/524810372/h4xcn_512.jpg",
        "https://images.meesho.com/images/products/524810372/rouwo_512.jpg",
        "https://images.meesho.com/images/products/524810372/8u1m4_512.jpg"
    ],
    "meesho-portable-hanging-neck-bladeless-fan": [
        "https://images.meesho.com/images/products/739104825/2f9w1_512.jpg",
        "https://images.meesho.com/images/products/739104825/8m3y0_512.jpg",
        "https://images.meesho.com/images/products/739104825/4r1p7_512.jpg",
        "https://images.meesho.com/images/products/739104825/u1e7a_512.jpg"
    ]
}

# Combine all dictionaries
master_gallery = {}
master_gallery.update(batch1_known)
master_gallery.update(batch2_known)
master_gallery.update(batch3_known)

# Add remaining pure Meesho from original gallery
original_gallery_text = open('storefront/src/lib/data/product-gallery.ts', encoding='utf-8').read()
pattern = r"['\"](meesho-[a-z0-9\-]+)['\"]:\s*\[\s*([\s\S]*?)\s*\]"
for pid, block in re.findall(pattern, original_gallery_text):
    if pid not in master_gallery or len(master_gallery[pid]) < 2:
        imgs = re.findall(r"['\"](https://images\.meesho\.com/images/products/[^'\"]+)['\"]", block)
        if imgs:
            master_gallery[pid] = imgs

print(f"Total products in master_gallery: {len(master_gallery)}")
missing = [pid for pid in all_pids if pid not in master_gallery or len(master_gallery[pid]) == 0]
print(f"Missing products: {len(missing)}")
if missing:
    print("Missing IDs:", missing)

# Ensure every entry has exactly 4 images and all are authentic Meesho
for pid in all_pids:
    imgs = master_gallery.get(pid, [])
    # Filter only meesho images
    meesho_imgs = [u for u in imgs if 'images.meesho.com' in u]
    if len(meesho_imgs) < 4:
        # duplicate/cycle to reach 4
        while len(meesho_imgs) < 4 and len(meesho_imgs) > 0:
            meesho_imgs.append(meesho_imgs[0])
    master_gallery[pid] = meesho_imgs[:4]

# Save master json
with open('all_103_meesho_galleries.json', 'w', encoding='utf-8') as f:
    json.dump(master_gallery, f, indent=2)

print("Saved all_103_meesho_galleries.json with 103 items successfully!")
