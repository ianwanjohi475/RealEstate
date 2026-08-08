/* ============================================================
   ESTO — inline SVG icon set (Lucide-style, no emojis)
   Usage:  NyIcon.get('bed')  -> "<svg ...>...</svg>"
           <span data-ico="bed"></span>  (auto-hydrated by main.js)
   ============================================================ */
(function (global) {
  "use strict";
  const P = {
    /* nav / ui */
    menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    chevronRight: '<polyline points="9 18 15 12 9 6"/>',
    chevronDown: '<polyline points="6 9 12 15 18 9"/>',
    arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    arrowUpRight: '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>',
    /* property specs */
    bed: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>',
    bath: '<path d="M4 12V5a2 2 0 0 1 2-2 2 2 0 0 1 2 2"/><line x1="4" y1="12" x2="20" y2="12"/><path d="M2 12h20v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z"/><line x1="7" y1="19" x2="6" y2="21"/><line x1="17" y1="19" x2="18" y2="21"/>',
    car: '<path d="M5 17H3v-5l2-4h11l3 4v5h-2"/><circle cx="7.5" cy="17" r="1.6"/><circle cx="16.5" cy="17" r="1.6"/><path d="M5 13h14"/>',
    ruler: '<path d="M3 8l5-5 13 13-5 5Z"/><path d="M8 8l1.5 1.5M11 5l1.5 1.5M14 8l1.5 1.5M8 14l1.5 1.5"/>',
    plot: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    /* trust / marketing */
    shieldCheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><polyline points="9 12 11 14 15 10"/>',
    verified: '<path d="M12 2l2.4 1.8 3 .1 1 2.8 2.4 1.7-.9 2.9.9 2.9-2.4 1.7-1 2.8-3 .1L12 22l-2.4-1.8-3-.1-1-2.8L3.2 15.6 4.1 12l-.9-2.9 2.4-1.7 1-2.8 3-.1Z"/><polyline points="9 12 11 14 15 10"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    tag: '<path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    handshake: '<path d="m11 17 2 2a1 1 0 0 0 1.4 0l3.6-3.6"/><path d="m18 15 2-2a1 1 0 0 0 0-1.4l-4-4-2 2"/><path d="M2 12l4-4 4 4-2 2"/><path d="m6 8 4 4"/>',
    gauge: '<path d="M12 14 8 10"/><path d="M20 12a8 8 0 1 0-16 0"/><circle cx="12" cy="14" r="1.5"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.5 12.5 8-8"/><path d="m15 6 2 2M18 3l3 3"/>',
    scale: '<path d="M12 3v18"/><path d="M6 21h12"/><path d="m3 8 3-5 3 5a3 3 0 0 1-6 0Z"/><path d="m15 8 3-5 3 5a3 3 0 0 1-6 0Z"/>',
    lightbulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2h6c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z"/>',
    /* location / contact */
    pin: '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7 10-7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
    whatsapp: '<path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12Z"/><path d="M8.5 8.8c0 3 2.7 5.7 5.7 5.7l.9-1.6-1.8-.8-.8.8a4 4 0 0 1-2.3-2.3l.8-.8-.8-1.8Z"/>',
    /* social */
    facebook: '<path d="M14 9V7a2 2 0 0 1 2-2h2V2h-3a4 4 0 0 0-4 4v3H8v3h3v9h3v-9h3l1-3Z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
    twitter: '<path d="M4 4l7.5 9.5L4 20h2l6-6.7L17 20h4l-7.9-10L20 4h-2l-5.4 6L8 4Z"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><line x1="7" y1="10" x2="7" y2="17"/><circle cx="7" cy="7" r="1"/><path d="M11 17v-4a2 2 0 0 1 4 0v4"/><line x1="11" y1="11" x2="11" y2="17"/>',
    /* actions */
    heart: '<path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z"/>',
    play: '<path d="M6 4l14 8-14 8Z"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><polyline points="8.5 12 11 14.5 15.5 9.5"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    filter: '<polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
    download: '<path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><path d="M5 21h14"/>',
    /* auth / user */
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    eyeOff: '<path d="M2 12s3.5-7 10-7c1.5 0 2.9.3 4.1.9"/><path d="M22 12s-3.5 7-10 7c-1.5 0-2.9-.3-4.1-.9"/><path d="M9.5 9.5a3 3 0 0 0 4 4"/><line x1="3" y1="3" x2="21" y2="21"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    google: '<path d="M21 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.1 2.7-7.1Z"/><path d="M12 22c2.6 0 4.8-.9 6.4-2.3l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.4-4H3.4v2.5A10 10 0 0 0 12 22Z"/><path d="M6.6 14.2a6 6 0 0 1 0-3.8V7.9H3.4a10 10 0 0 0 0 9Z"/><path d="M12 6.4c1.4 0 2.7.5 3.7 1.4l2.7-2.7A10 10 0 0 0 3.4 7.9l3.2 2.5c.8-2.3 2.9-4 5.4-4Z"/>',
    /* dashboard */
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/>',
    dashboard: '<rect x="3" y="3" width="8" height="10" rx="1.5"/><rect x="13" y="3" width="8" height="6" rx="1.5"/><rect x="13" y="12" width="8" height="9" rx="1.5"/><rect x="3" y="16" width="8" height="5" rx="1.5"/>',
    bookmark: '<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="1.5"/><path d="M9 6h2M13 6h2M9 10h2M13 10h2M9 14h2M13 14h2"/><path d="M10 22v-4h4v4"/>',
    chart: '<path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="17" cy="15" r="1.2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7.7 1.6 1.6 0 0 0-1.6 1.3H12a2 2 0 0 1-2-2v-.1a1.6 1.6 0 0 0-2.7-.7 2 2 0 1 1-2.8-2.8 1.6 1.6 0 0 0-.7-2.7A2 2 0 0 1 2 12a2 2 0 0 1 2-2 1.6 1.6 0 0 0 .7-2.7 2 2 0 1 1 2.8-2.8 1.6 1.6 0 0 0 2.7-.7A2 2 0 0 1 12 2a2 2 0 0 1 2 2 1.6 1.6 0 0 0 2.7.7 2 2 0 1 1 2.8 2.8 1.6 1.6 0 0 0 .7 2.7A2 2 0 0 1 22 12a2 2 0 0 1-2 2 1.6 1.6 0 0 0-.6 1Z"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M10.3 21a2 2 0 0 0 3.4 0"/>',
    trending: '<polyline points="3 17 9 11 13 15 21 7"/><polyline points="16 7 21 7 21 12"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z"/>',
    doc: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><polyline points="14 3 14 9 20 9"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6"/><path d="M18 14.5a6 6 0 0 1 3 5.5"/>',
    sparkles: '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Z"/><path d="M5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8Z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-6 7-9 16-9 0 9-3 16-9 16Z"/><path d="M11 20c0-6 2-9 6-11"/>',
    map: '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>',
    camera: '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.2"/>',
    /* theme */
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
    sliders: '<line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="9" cy="8" r="2.4" fill="currentColor" stroke="none"/><circle cx="15" cy="16" r="2.4" fill="currentColor" stroke="none"/>',
    arrowUp: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="6 11 12 5 18 11"/>',
    quote: '<path d="M7 7h4v6a4 4 0 0 1-4 4M13 7h4v6a4 4 0 0 1-4 4"/>',
    pinterest: '<circle cx="12" cy="12" r="9"/><path d="M9.5 19c-.4-1.8 0-3.5 1-7.5a2.6 2.6 0 1 1 4.4 1.9c-.6 1.8-2.6 2-3.2.4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="M9 14.5 8 22l4-2 4 2-1-7.5"/>',
    trendUp: '<polyline points="3 17 9 11 13 15 21 7"/><polyline points="16 7 21 7 21 12"/>',
    coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M15 12.5c2.4.4 6 1.4 6 3.5 0 1.7-2.7 3-6 3s-6-1.3-6-3"/>',
    /* property categories */
    villa: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-5h6v5"/><path d="M10 10h4"/>',
    bungalow: '<path d="M3 12l9-6 9 6"/><path d="M5 11v9h14v-9"/><rect x="9" y="14" width="6" height="6"/>',
    apartment2: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/><path d="M10 21v-3h4v3"/>',
    townhome: '<rect x="3" y="8" width="8" height="13" rx="1"/><rect x="13" y="5" width="8" height="16" rx="1"/><path d="M6 12h2M6 16h2M16 9h2M16 13h2M16 17h2"/>',
    office: '<rect x="4" y="2" width="16" height="20" rx="1.5"/><path d="M8 6h2M14 6h2M8 10h2M14 10h2M8 14h2M14 14h2"/><path d="M10 22v-4h4v4"/>',
    factory: '<path d="M3 21V9l6 4V9l6 4V5l6 4v12Z"/><path d="M7 21v-4M12 21v-4M17 21v-4"/>',
    shop: '<path d="M4 9h16l-1-4H5Z"/><path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9"/><path d="M9 21v-6h6v6"/>',
    land: '<path d="M4 20h16"/><path d="M4 20l4-9 4 5 3-4 5 8"/><circle cx="17" cy="5" r="2"/>'
  };

  function svg(name, cls) {
    const inner = P[name];
    if (!inner) return "";
    return `<svg class="ico${cls ? " " + cls : ""}" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
  }

  global.EstoIcon = { get: svg, names: Object.keys(P) };
  global.NyIcon = global.EstoIcon; // legacy alias
})(window);
