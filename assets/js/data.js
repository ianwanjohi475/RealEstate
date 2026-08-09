/* ============================================================
   ESTO — data layer
   Nairobi-focused listings with the Esto TrustScore.
   Images mix Pexels + Unsplash CDNs (with graceful fallback).
   ============================================================ */
(function (global) {
  "use strict";

  // width helper — rewrites the ?w= / &w= value on any CDN url
  const sized = (url, w) => url.replace(/([?&]w=)\d+/i, "$1" + w);
  const px = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
  const un = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;
  // self-hosted African avatars (work offline in the PWA, no external CDN)
  const av = (slug) => `assets/img/avatars/${slug}.svg`;

  const trust = (title, inspection, price, agent) => {
    const overall = Math.round((title + inspection + price + agent) / 4);
    return { overall, title, inspection, price, agent };
  };

  const AGENTS = [
    { id:"wanjiru-kamau", name:"Wanjiru Kamau", role:"Principal Agent · Karen & Runda",
      photo: av("wanjiru-kamau"), license:"EARB/2019/04127", phone:"0758950370", email:"ianwanjohi475@gmail.com",
      sales:128, years:11, rating:4.9, bio:"Wanjiru leads our leafy-suburbs desk and has closed over KES 6.4B in verified transactions across Karen, Runda and Kitisuru." },
    { id:"brian-otieno", name:"Brian Otieno", role:"Senior Agent · Westlands & Riverside",
      photo: av("brian-otieno"), license:"EARB/2020/07731", phone:"0758950370", email:"ianwanjohi475@gmail.com",
      sales:96, years:8, rating:4.8, bio:"Brian specialises in serviced apartments and mixed-use investment stock along the Westlands–Riverside corridor." },
    { id:"aisha-mohamed", name:"Aisha Mohamed", role:"Lettings Lead · Kilimani & Kileleshwa",
      photo: av("aisha-mohamed"), license:"EARB/2021/09904", phone:"0758950370", email:"ianwanjohi475@gmail.com",
      sales:74, years:6, rating:5.0, bio:"Aisha runs our lettings book and personally verifies every managed unit before it reaches a tenant." },
    { id:"david-mwangi", name:"David Mwangi", role:"Land & New Homes · Kiambu Road",
      photo: av("david-mwangi"), license:"EARB/2018/03318", phone:"0758950370", email:"ianwanjohi475@gmail.com",
      sales:141, years:13, rating:4.9, bio:"David advises on titled land and off-plan developments along Kiambu Road, Ruaka and Tigoni." },
    { id:"grace-njeri", name:"Grace Njeri", role:"Buyer's Advisor · Lavington",
      photo: av("grace-njeri"), license:"EARB/2022/11288", phone:"0758950370", email:"ianwanjohi475@gmail.com",
      sales:58, years:5, rating:4.9, bio:"Grace guides first-time buyers through financing, due-diligence and closing with total transparency." },
    { id:"samuel-kiptoo", name:"Samuel Kiptoo", role:"Commercial & Investment",
      photo: av("samuel-kiptoo"), license:"EARB/2017/02201", phone:"0758950370", email:"ianwanjohi475@gmail.com",
      sales:83, years:14, rating:4.7, bio:"Samuel structures yield-focused portfolios for diaspora and institutional investors." }
  ];
  const agentBy = (id) => AGENTS.find((a) => a.id === id) || AGENTS[0];

  const PROPERTIES = [
    { id:"esto-001", title:"Ambassadorial 5-Bed Villa", type:"Villa", purpose:"sale", status:"For Sale",
      neighborhood:"Karen", city:"Nairobi", address:"Marula Lane, Karen", price:92500000, currency:"KES",
      beds:5, baths:6, garage:3, area:620, plot:"0.75 acre", year:2021, featured:true, verified:true, tag:"Signature",
      lat:-1.319, lng:36.706, agent:"wanjiru-kamau", trust:trust(99,96,88,98),
      images:[px(1396122),px(1643383),px(1571460),px(1571468)],
      amenities:["Borehole & tank","Solar backup","Staff quarters (DSQ)","Landscaped garden","Electric fence","CCTV","Fibre ready","Fireplace"],
      desc:"A commanding ambassadorial residence on three-quarters of an acre in the heart of Karen. Double-volume living spaces, a chef's kitchen and a wrapped verandah overlooking mature indigenous gardens." },
    { id:"esto-002", title:"Sky Villa Penthouse", type:"Apartment", purpose:"sale", status:"For Sale",
      neighborhood:"Kilimani", city:"Nairobi", address:"Lenana Road, Kilimani", price:46000000, currency:"KES",
      beds:3, baths:4, garage:2, area:245, plot:"—", year:2023, featured:true, verified:true, tag:"New",
      lat:-1.294, lng:36.786, agent:"brian-otieno", trust:trust(97,94,90,94),
      images:[px(1571460),px(1918291),px(1457842),px(2635038)],
      amenities:["Rooftop pool","Gym & spa","High-speed lifts","Backup generator","Borehole","24/7 security","Smart access","Visitor parking"],
      desc:"A full-floor penthouse with wrap-around city views, private lift lobby and a 60 sqm entertainment terrace. Turn-key with premium finishes throughout." },
    { id:"esto-003", title:"Contemporary 4-Bed Townhouse", type:"Townhouse", purpose:"sale", status:"For Sale",
      neighborhood:"Lavington", city:"Nairobi", address:"Muthangari Drive, Lavington", price:58000000, currency:"KES",
      beds:4, baths:5, garage:2, area:340, plot:"1/8 acre", year:2022, featured:true, verified:true, tag:"Verified",
      lat:-1.279, lng:36.766, agent:"grace-njeri", trust:trust(98,95,92,97),
      images:[px(323780),px(1571463),px(1080721),px(1643384)],
      amenities:["Gated community","Clubhouse","Heated pool","Kids play area","Borehole","Backup power","DSQ","Fibre ready"],
      desc:"Part of a boutique cluster of eight units, this townhouse pairs open-plan living with a private garden and a rooftop lounge in prime Lavington." },
    { id:"esto-004", title:"Furnished 2-Bed Serviced Suite", type:"Apartment", purpose:"rent", status:"To Let",
      neighborhood:"Westlands", city:"Nairobi", address:"Rhapta Road, Westlands", price:185000, currency:"KES", per:"/mo",
      beds:2, baths:2, garage:1, area:118, plot:"—", year:2020, featured:false, verified:true, tag:"Furnished",
      lat:-1.267, lng:36.803, agent:"aisha-mohamed", trust:trust(96,98,86,95),
      images:[px(1918291),px(1571459),px(276724),px(2029722)],
      amenities:["Fully furnished","Housekeeping","Rooftop deck","Gym","Backup power","Borehole","Secure parking","Fibre"],
      desc:"Move-in-ready serviced apartment steps from Westlands' offices and dining. Flexible leases with all utilities and weekly housekeeping included." },
    { id:"esto-005", title:"Garden 3-Bed Maisonette", type:"Villa", purpose:"rent", status:"To Let",
      neighborhood:"Kileleshwa", city:"Nairobi", address:"Gatundu Road, Kileleshwa", price:145000, currency:"KES", per:"/mo",
      beds:3, baths:3, garage:2, area:210, plot:"1/8 acre", year:2019, featured:true, verified:true, tag:"Verified",
      lat:-1.283, lng:36.780, agent:"aisha-mohamed", trust:trust(95,93,90,96),
      images:[px(1029599),px(1080721),px(276724),px(259588)],
      amenities:["Private garden","DSQ","Borehole","Backup power","Electric fence","Pet friendly","Fibre ready","Ample parking"],
      desc:"A quiet family maisonette in a compound of four, with a generous private garden and secure gated access on a leafy Kileleshwa lane." },
    { id:"esto-006", title:"Prime 0.5-Acre Residential Plot", type:"Land", purpose:"sale", status:"For Sale",
      neighborhood:"Runda", city:"Nairobi", address:"Ruaka Road, Runda", price:38000000, currency:"KES",
      beds:0, baths:0, garage:0, area:2023, plot:"0.5 acre", year:null, featured:false, verified:true, tag:"Titled",
      lat:-1.213, lng:36.807, agent:"david-mwangi", trust:trust(100,90,95,92),
      images:[un("1500382017468-9049fed747ef"),un("1416879595882-3373a0480b5b"),un("1441974231531-c6227db76b6e"),un("1470071459604-3b5ec3a7fe05")],
      amenities:["Ready title deed","Controlled development","Mains water","Tarmac access","Gated estate","Perimeter wall"],
      desc:"A rare half-acre in Runda's controlled zone with a clean, ready title. Ideal for a bespoke family residence within a secure gated estate." },
    { id:"esto-007", title:"Modern 4-Bed Family Home", type:"Villa", purpose:"sale", status:"For Sale",
      neighborhood:"Kitisuru", city:"Nairobi", address:"Thigiri Ridge, Kitisuru", price:74000000, currency:"KES",
      beds:4, baths:5, garage:3, area:410, plot:"1/2 acre", year:2022, featured:false, verified:true, tag:"Verified",
      lat:-1.230, lng:36.789, agent:"wanjiru-kamau", trust:trust(97,96,89,98),
      images:[px(2404843),px(1643383),px(1080721),px(276724)],
      amenities:["Infinity pool","Home office","Solar & inverter","Borehole","Staff quarters","Smart home","Double-height lounge","Gated"],
      desc:"An architect-designed home on a ridge with valley views, blending warm timber, natural stone and floor-to-ceiling glazing." },
    { id:"esto-008", title:"Studio Loft Apartment", type:"Apartment", purpose:"rent", status:"To Let",
      neighborhood:"Riverside", city:"Nairobi", address:"Riverside Drive, Nairobi", price:95000, currency:"KES", per:"/mo",
      beds:1, baths:1, garage:1, area:62, plot:"—", year:2021, featured:false, verified:true, tag:"Furnished",
      lat:-1.270, lng:36.797, agent:"brian-otieno", trust:trust(94,95,88,93),
      images:[px(1571453),px(2029722),px(276724),px(1080721)],
      amenities:["Furnished","Rooftop garden","Co-working lounge","Gym","Backup power","Borehole","Secure parking","Fibre"],
      desc:"A light-filled studio loft in a boutique Riverside block, perfect for professionals who want a walkable, secure base in the city." },
    { id:"esto-009", title:"5-Bed Executive Mansion", type:"Villa", purpose:"sale", status:"For Sale",
      neighborhood:"Nyari", city:"Nairobi", address:"Nyari Estate, Nairobi", price:135000000, currency:"KES",
      beds:5, baths:7, garage:4, area:720, plot:"1 acre", year:2023, featured:true, verified:true, tag:"Signature",
      lat:-1.222, lng:36.798, agent:"wanjiru-kamau", trust:trust(99,97,85,99),
      images:[px(32870),px(1643383),px(1571460),px(1080721)],
      amenities:["Cinema room","Wine cellar","Heated pool","Gym","Solar farm","Borehole","Guest wing","Smart security"],
      desc:"A one-acre estate in the diplomatic enclave of Nyari with a resort-style garden, entertainment wing and full backup infrastructure." },
    { id:"esto-010", title:"Affordable 2-Bed Apartment", type:"Apartment", purpose:"sale", status:"For Sale",
      neighborhood:"Syokimau", city:"Machakos", address:"Gateway Mall Road, Syokimau", price:6900000, currency:"KES",
      beds:2, baths:2, garage:1, area:92, plot:"—", year:2024, featured:false, verified:true, tag:"New",
      lat:-1.360, lng:36.955, agent:"grace-njeri", trust:trust(96,92,97,94),
      images:[px(1546168),px(2635038),px(1080721),px(276724)],
      amenities:["Swimming pool","Kids play area","Backup power","Borehole","CCTV","Ample parking","Perimeter wall","SGR nearby"],
      desc:"Great-value new-build near the SGR terminus and Gateway Mall — an ideal first home or buy-to-let with strong rental demand." },
    { id:"esto-011", title:"Townhouse in Gated Court", type:"Townhouse", purpose:"rent", status:"To Let",
      neighborhood:"Ruaka", city:"Kiambu", address:"Ndenderu, Ruaka", price:120000, currency:"KES", per:"/mo",
      beds:4, baths:4, garage:2, area:260, plot:"—", year:2022, featured:false, verified:true, tag:"Verified",
      lat:-1.207, lng:36.783, agent:"david-mwangi", trust:trust(95,94,91,95),
      images:[px(1974596),px(1643384),px(1080721),px(276724)],
      amenities:["Gated court","Clubhouse","Pool","Gym","Backup power","Borehole","DSQ","Fibre ready"],
      desc:"A bright four-bedroom townhouse in a managed court minutes from Two Rivers Mall, with shared pool and clubhouse." },
    { id:"esto-012", title:"Loft Penthouse with Terrace", type:"Apartment", purpose:"sale", status:"For Sale",
      neighborhood:"Westlands", city:"Nairobi", address:"Peponi Road, Westlands", price:39500000, currency:"KES",
      beds:3, baths:3, garage:2, area:190, plot:"—", year:2023, featured:false, verified:true, tag:"New",
      lat:-1.258, lng:36.795, agent:"samuel-kiptoo", trust:trust(96,93,90,92),
      images:[px(2251247),px(2635038),px(1571459),px(1080721)],
      amenities:["Private terrace","Rooftop pool","Gym","Backup power","Borehole","Smart access","Fibre","Concierge"],
      desc:"A duplex penthouse with a 40 sqm terrace and skyline views, walkable to Sarit Centre and the Westlands business district." }
  ];

  const CATEGORIES = [
    { name:"Villas", icon:"villa", count:42, primary:true },
    { name:"Apartments", icon:"apartment2", count:88 },
    { name:"Townhouses", icon:"townhome", count:37 },
    { name:"Bungalows", icon:"bungalow", count:24 },
    { name:"Offices", icon:"office", count:31 },
    { name:"Land & Plots", icon:"land", count:19 },
    { name:"Commercial", icon:"shop", count:26 },
    { name:"Studios", icon:"apartment2", count:44 }
  ];

  const NEIGHBORHOODS = [
    { name:"Karen", count:42, img:px(1396122), size:"tall" },
    { name:"Kilimani", count:68, img:px(1571460), size:"" },
    { name:"Westlands", count:55, img:px(2251247), size:"" },
    { name:"Lavington", count:37, img:px(323780), size:"wide" },
    { name:"Runda", count:24, img:px(32870), size:"" },
    { name:"Kileleshwa", count:31, img:px(1029599), size:"" }
  ];

  const TESTIMONIALS = [
    { name:"Janet Wambui", role:"Bought in Lavington", photo:av("janet-wambui"), stars:5,
      quote:"The Esto TrustScore told me the title, the inspection and the price were all checked before I flew in from Dubai. Zero surprises on closing day." },
    { name:"Peter Ochieng", role:"Sold in Kilimani", photo:av("peter-ochieng"), stars:5,
      quote:"They photographed, staged and had a verified buyer in three weeks. The transparent, all-in fee schedule meant no awkward broker games." },
    { name:"Fatuma Hassan", role:"Renting in Westlands", photo:av("fatuma-hassan"), stars:5,
      quote:"Every listing I viewed actually existed and matched the photos. After months of ghost adverts elsewhere, that alone won me over." }
  ];

  function fmtPrice(p) {
    if (p == null) return "—";
    if (p >= 1e6) { const m = p / 1e6; return "KES " + (m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)) + "M"; }
    if (p >= 1e3) return "KES " + Math.round(p / 1e3) + "K";
    return "KES " + p.toLocaleString("en-KE");
  }
  const trustLabel = (v) => v >= 95 ? "Excellent" : v >= 90 ? "Great" : v >= 80 ? "Good" : "Fair";

  global.ESTO = {
    AGENTS, PROPERTIES, CATEGORIES, NEIGHBORHOODS, TESTIMONIALS,
    agentBy, fmtPrice, trustLabel, sized, px, un
  };
})(window);
