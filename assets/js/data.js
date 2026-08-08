/* ============================================================
   NYUMBA — data layer
   Curated, Nairobi-focused sample listings & agents.
   Images served from Unsplash CDN.
   ============================================================ */
(function (global) {
  "use strict";

  const img = (id, w = 900) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

  const AGENTS = [
    {
      id: "wanjiru-kamau",
      name: "Wanjiru Kamau",
      role: "Principal Agent · Karen & Runda",
      photo: img("1573496359142-b8d87734a5a2", 500),
      license: "EARB/2019/04127",
      phone: "0758950370",
      email: "ianwanjohi475@gmail.com",
      sales: 128, years: 11, rating: 4.9,
      bio: "Wanjiru leads our leafy-suburbs desk and has closed over KES 6.4B in verified transactions across Karen, Runda and Kitisuru."
    },
    {
      id: "brian-otieno",
      name: "Brian Otieno",
      role: "Senior Agent · Westlands & Riverside",
      photo: img("1507003211169-0a1dd7228f2d", 500),
      license: "EARB/2020/07731",
      phone: "0758950370",
      email: "ianwanjohi475@gmail.com",
      sales: 96, years: 8, rating: 4.8,
      bio: "Brian specialises in serviced apartments and mixed-use investment stock along the Westlands–Riverside corridor."
    },
    {
      id: "aisha-mohamed",
      name: "Aisha Mohamed",
      role: "Lettings Lead · Kilimani & Kileleshwa",
      photo: img("1544005313-94ddf0286df2", 500),
      license: "EARB/2021/09904",
      phone: "0758950370",
      email: "ianwanjohi475@gmail.com",
      sales: 74, years: 6, rating: 5.0,
      bio: "Aisha runs our lettings book and personally verifies every managed unit before it reaches a tenant."
    },
    {
      id: "david-mwangi",
      name: "David Mwangi",
      role: "Land & New Homes · Kiambu Road",
      photo: img("1500648767791-00dcc994a43e", 500),
      license: "EARB/2018/03318",
      phone: "0758950370",
      email: "ianwanjohi475@gmail.com",
      sales: 141, years: 13, rating: 4.9,
      bio: "David advises on titled land and off-plan developments along Kiambu Road, Ruaka and Tigoni."
    },
    {
      id: "grace-njeri",
      name: "Grace Njeri",
      role: "Buyer's Advisor · Lavington",
      photo: img("1580489944761-15a19d654956", 500),
      license: "EARB/2022/11288",
      phone: "0758950370",
      email: "ianwanjohi475@gmail.com",
      sales: 58, years: 5, rating: 4.9,
      bio: "Grace guides first-time buyers through financing, due-diligence and closing with total transparency."
    },
    {
      id: "samuel-kiptoo",
      name: "Samuel Kiptoo",
      role: "Commercial & Investment",
      photo: img("1519085360753-af0119f7cbe7", 500),
      license: "EARB/2017/02201",
      phone: "0758950370",
      email: "ianwanjohi475@gmail.com",
      sales: 83, years: 14, rating: 4.7,
      bio: "Samuel structures yield-focused portfolios for diaspora and institutional investors."
    }
  ];

  const agentBy = (id) => AGENTS.find((a) => a.id === id);

  const PROPERTIES = [
    {
      id: "nyum-001",
      title: "Ambassadorial 5-Bed Villa",
      type: "House", purpose: "sale", status: "For Sale",
      neighborhood: "Karen", city: "Nairobi",
      address: "Marula Lane, Karen",
      price: 92500000, currency: "KES",
      beds: 5, baths: 6, garage: 3, area: 620, plot: "0.75 acre",
      year: 2021, featured: true, verified: true, tag: "Signature",
      lat: -1.319, lng: 36.706,
      images: ["1600596542815-ffad4c1539a9","1600585154340-be6161a56a0c","1600607687939-ce8a6c25118c","1600566753086-00f18fb6b3ea"],
      agent: "wanjiru-kamau",
      amenities: ["Borehole & tank","Solar backup","Staff quarters (DSQ)","Landscaped garden","Electric fence","CCTV","Fibre ready","Fireplace"],
      desc: "A commanding ambassadorial residence on three-quarters of an acre in the heart of Karen. Double-volume living spaces, a chef's kitchen, and a wrapped verandah overlooking mature indigenous gardens."
    },
    {
      id: "nyum-002",
      title: "Sky Villa Penthouse",
      type: "Apartment", purpose: "sale", status: "For Sale",
      neighborhood: "Kilimani", city: "Nairobi",
      address: "Lenana Road, Kilimani",
      price: 46000000, currency: "KES",
      beds: 3, baths: 4, garage: 2, area: 245, plot: "—",
      year: 2023, featured: true, verified: true, tag: "New",
      lat: -1.294, lng: 36.786,
      images: ["1512917774080-9991f1c4c750","1502672260266-1c1ef2d93688","1494526585095-c41746248156","1600566753190-17f0baa2a6c3"],
      agent: "brian-otieno",
      amenities: ["Rooftop pool","Gym & spa","High-speed lifts","Backup generator","Borehole","24/7 security","Smart access","Visitor parking"],
      desc: "A full-floor penthouse with wrap-around city views, private lift lobby and a 60 sqm entertainment terrace. Turn-key with premium finishes throughout."
    },
    {
      id: "nyum-003",
      title: "Contemporary 4-Bed Townhouse",
      type: "Townhouse", purpose: "sale", status: "For Sale",
      neighborhood: "Lavington", city: "Nairobi",
      address: "Muthangari Drive, Lavington",
      price: 58000000, currency: "KES",
      beds: 4, baths: 5, garage: 2, area: 340, plot: "1/8 acre",
      year: 2022, featured: true, verified: true, tag: "Verified",
      lat: -1.279, lng: 36.766,
      images: ["1600585154526-990dced4db0d","1600607687939-ce8a6c25118c","1600566753086-00f18fb6b3ea","1502672260266-1c1ef2d93688"],
      agent: "grace-njeri",
      amenities: ["Gated community","Clubhouse","Heated pool","Kids play area","Borehole","Backup power","DSQ","Fibre ready"],
      desc: "Part of a boutique cluster of eight units, this townhouse pairs open-plan living with a private garden and a rooftop lounge in prime Lavington."
    },
    {
      id: "nyum-004",
      title: "Furnished 2-Bed Serviced Suite",
      type: "Apartment", purpose: "rent", status: "To Let",
      neighborhood: "Westlands", city: "Nairobi",
      address: "Rhapta Road, Westlands",
      price: 185000, currency: "KES", per: "/month",
      beds: 2, baths: 2, garage: 1, area: 118, plot: "—",
      year: 2020, featured: false, verified: true, tag: "Furnished",
      lat: -1.267, lng: 36.803,
      images: ["1545324418-cc1a3fa10c00","1494526585095-c41746248156","1502672260266-1c1ef2d93688","1600566753190-17f0baa2a6c3"],
      agent: "aisha-mohamed",
      amenities: ["Fully furnished","Housekeeping","Rooftop deck","Gym","Backup power","Borehole","Secure parking","Fibre"],
      desc: "Move-in-ready serviced apartment steps from Westlands' offices and dining. Flexible leases with all utilities and weekly housekeeping included."
    },
    {
      id: "nyum-005",
      title: "Garden 3-Bed Maisonette",
      type: "House", purpose: "rent", status: "To Let",
      neighborhood: "Kileleshwa", city: "Nairobi",
      address: "Gatundu Road, Kileleshwa",
      price: 145000, currency: "KES", per: "/month",
      beds: 3, baths: 3, garage: 2, area: 210, plot: "1/8 acre",
      year: 2019, featured: true, verified: true, tag: "Verified",
      lat: -1.283, lng: 36.780,
      images: ["1568605114967-8130f3a36994","1600566753086-00f18fb6b3ea","1600607687939-ce8a6c25118c","1494526585095-c41746248156"],
      agent: "aisha-mohamed",
      amenities: ["Private garden","DSQ","Borehole","Backup power","Electric fence","Pet friendly","Fibre ready","Ample parking"],
      desc: "A quiet family maisonette in a compound of four, with a generous private garden and secure gated access on a leafy Kileleshwa lane."
    },
    {
      id: "nyum-006",
      title: "Prime 0.5-Acre Residential Plot",
      type: "Land", purpose: "sale", status: "For Sale",
      neighborhood: "Runda", city: "Nairobi",
      address: "Ruaka Road, Runda",
      price: 38000000, currency: "KES",
      beds: 0, baths: 0, garage: 0, area: 2023, plot: "0.5 acre",
      year: null, featured: false, verified: true, tag: "Titled",
      lat: -1.213, lng: 36.807,
      images: ["1500382017468-9049fed747ef","1416879595882-3373a0480b5b","1441974231531-c6227db76b6e","1470071459604-3b5ec3a7fe05"],
      agent: "david-mwangi",
      amenities: ["Ready title deed","Controlled development","Mains water","Tarmac access","Gated estate","Perimeter wall"],
      desc: "A rare half-acre in Runda's controlled zone with a clean, ready title. Ideal for a bespoke family residence within a secure gated estate."
    },
    {
      id: "nyum-007",
      title: "Modern 4-Bed Family Home",
      type: "House", purpose: "sale", status: "For Sale",
      neighborhood: "Kitisuru", city: "Nairobi",
      address: "Thigiri Ridge, Kitisuru",
      price: 74000000, currency: "KES",
      beds: 4, baths: 5, garage: 3, area: 410, plot: "1/2 acre",
      year: 2022, featured: false, verified: true, tag: "Verified",
      lat: -1.230, lng: 36.789,
      images: ["1613490493576-7fde63acd811","1600585154340-be6161a56a0c","1600607687939-ce8a6c25118c","1600566753086-00f18fb6b3ea"],
      agent: "wanjiru-kamau",
      amenities: ["Infinity pool","Home office","Solar & inverter","Borehole","Staff quarters","Smart home","Double-height lounge","Gated"],
      desc: "An architect-designed home on a ridge with valley views, blending warm timber, natural stone and floor-to-ceiling glazing."
    },
    {
      id: "nyum-008",
      title: "Studio Loft Apartment",
      type: "Apartment", purpose: "rent", status: "To Let",
      neighborhood: "Riverside", city: "Nairobi",
      address: "Riverside Drive, Nairobi",
      price: 95000, currency: "KES", per: "/month",
      beds: 1, baths: 1, garage: 1, area: 62, plot: "—",
      year: 2021, featured: false, verified: true, tag: "Furnished",
      lat: -1.270, lng: 36.797,
      images: ["1502672260266-1c1ef2d93688","1494526585095-c41746248156","1545324418-cc1a3fa10c00","1600566753190-17f0baa2a6c3"],
      agent: "brian-otieno",
      amenities: ["Furnished","Rooftop garden","Co-working lounge","Gym","Backup power","Borehole","Secure parking","Fibre"],
      desc: "A light-filled studio loft in a boutique Riverside block, perfect for professionals who want a walkable, secure base in the city."
    },
    {
      id: "nyum-009",
      title: "5-Bed Executive Mansion",
      type: "House", purpose: "sale", status: "For Sale",
      neighborhood: "Nyari", city: "Nairobi",
      address: "Nyari Estate, Nairobi",
      price: 135000000, currency: "KES",
      beds: 5, baths: 7, garage: 4, area: 720, plot: "1 acre",
      year: 2023, featured: true, verified: true, tag: "Signature",
      lat: -1.222, lng: 36.798,
      images: ["1580587771525-78b9dba3b914","1600585154340-be6161a56a0c","1600607687939-ce8a6c25118c","1600566753086-00f18fb6b3ea"],
      agent: "wanjiru-kamau",
      amenities: ["Cinema room","Wine cellar","Heated pool","Gym","Solar farm","Borehole","Guest wing","Smart security"],
      desc: "A one-acre estate in the diplomatic enclave of Nyari with a resort-style garden, entertainment wing and full backup infrastructure."
    },
    {
      id: "nyum-010",
      title: "Affordable 2-Bed Apartment",
      type: "Apartment", purpose: "sale", status: "For Sale",
      neighborhood: "Syokimau", city: "Machakos",
      address: "Gateway Mall Road, Syokimau",
      price: 6900000, currency: "KES",
      beds: 2, baths: 2, garage: 1, area: 92, plot: "—",
      year: 2024, featured: false, verified: true, tag: "New",
      lat: -1.360, lng: 36.955,
      images: ["1512918728675-ed5a9ecdebfd","1502672260266-1c1ef2d93688","1494526585095-c41746248156","1545324418-cc1a3fa10c00"],
      agent: "grace-njeri",
      amenities: ["Swimming pool","Kids play area","Backup power","Borehole","CCTV","Ample parking","Perimeter wall","SGR nearby"],
      desc: "Great-value new-build near the SGR terminus and Gateway Mall — an ideal first home or buy-to-let with strong rental demand."
    },
    {
      id: "nyum-011",
      title: "Townhouse in Gated Court",
      type: "Townhouse", purpose: "rent", status: "To Let",
      neighborhood: "Ruaka", city: "Kiambu",
      address: "Ndenderu, Ruaka",
      price: 120000, currency: "KES", per: "/month",
      beds: 4, baths: 4, garage: 2, area: 260, plot: "—",
      year: 2022, featured: false, verified: true, tag: "Verified",
      lat: -1.207, lng: 36.783,
      images: ["1570129477492-45c003edd2be","1600585154340-be6161a56a0c","1600566753086-00f18fb6b3ea","1494526585095-c41746248156"],
      agent: "david-mwangi",
      amenities: ["Gated court","Clubhouse","Pool","Gym","Backup power","Borehole","DSQ","Fibre ready"],
      desc: "A bright four-bedroom townhouse in a managed court minutes from Two Rivers Mall, with shared pool and clubhouse."
    },
    {
      id: "nyum-012",
      title: "Loft Penthouse with Terrace",
      type: "Apartment", purpose: "sale", status: "For Sale",
      neighborhood: "Westlands", city: "Nairobi",
      address: "Peponi Road, Westlands",
      price: 39500000, currency: "KES",
      beds: 3, baths: 3, garage: 2, area: 190, plot: "—",
      year: 2023, featured: false, verified: true, tag: "New",
      lat: -1.258, lng: 36.795,
      images: ["1600047509807-ba8f99d2cdde","1502672260266-1c1ef2d93688","1494526585095-c41746248156","1600566753190-17f0baa2a6c3"],
      agent: "samuel-kiptoo",
      amenities: ["Private terrace","Rooftop pool","Gym","Backup power","Borehole","Smart access","Fibre","Concierge"],
      desc: "A duplex penthouse with a 40 sqm terrace and skyline views, walkable to Sarit Centre and the Westlands business district."
    }
  ];

  const NEIGHBORHOODS = [
    { name: "Karen", count: 42, img: img("1600596542815-ffad4c1539a9", 700), size: "tall" },
    { name: "Kilimani", count: 68, img: img("1512917774080-9991f1c4c750", 700), size: "" },
    { name: "Westlands", count: 55, img: img("1600047509807-ba8f99d2cdde", 700), size: "" },
    { name: "Lavington", count: 37, img: img("1600585154526-990dced4db0d", 700), size: "wide" },
    { name: "Runda", count: 24, img: img("1613490493576-7fde63acd811", 700), size: "" },
    { name: "Kileleshwa", count: 31, img: img("1568605114967-8130f3a36994", 700), size: "" }
  ];

  const TESTIMONIALS = [
    { name: "Janet Wambui", role: "Bought in Lavington", photo: img("1494790108377-be9c29b29330", 200), stars: 5,
      quote: "Nyumba verified the title and the physical unit before I flew in from Dubai. Zero surprises on closing day — exactly what the market has been missing." },
    { name: "Peter Ochieng", role: "Sold in Kilimani", photo: img("1472099645785-5658abf4ff4e", 200), stars: 5,
      quote: "They photographed, staged and had a verified buyer in three weeks. The transparent fee schedule meant no awkward broker games." },
    { name: "Fatuma Hassan", role: "Renting in Westlands", photo: img("1573496359142-b8d87734a5a2", 200), stars: 5,
      quote: "Every listing I viewed actually existed and matched the photos. After months of ghost adverts elsewhere, that alone won me over." }
  ];

  function fmtPrice(p) {
    if (p == null) return "—";
    if (p >= 1_000_000) {
      const m = p / 1_000_000;
      return "KES " + (m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)) + "M";
    }
    return "KES " + p.toLocaleString("en-KE");
  }

  global.NYUMBA = {
    AGENTS, PROPERTIES, NEIGHBORHOODS, TESTIMONIALS,
    agentBy, fmtPrice, img
  };
})(window);
