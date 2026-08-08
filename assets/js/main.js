/* ============================================================
   NYUMBA — main application script
   Shared chrome, rendering, interactions, PWA.
   ============================================================ */
(function () {
  "use strict";
  const D = window.NYUMBA;
  const I = (n, c) => window.NyIcon.get(n, c);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const PHONE = "0758950370";
  const PHONE_INTL = "254758950370";
  const EMAIL = "ianwanjohi475@gmail.com";

  /* ---------- Icon hydration ---------- */
  function hydrateIcons(root = document) {
    $$("[data-ico]", root).forEach((el) => {
      if (el.dataset.done) return;
      el.innerHTML = I(el.dataset.ico);
      el.dataset.done = "1";
    });
  }

  /* ---------- Brand mark ---------- */
  const BRAND_MARK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"/><path d="M9.5 20v-5a2.5 2.5 0 0 1 5 0v5"/></svg>';

  function brandHTML(sub = true) {
    return `<a class="brand" href="index.html" aria-label="Nyumba home">
      <span class="brand-mark">${BRAND_MARK}</span>
      <span><b>Nyumba</b>${sub ? "<small>Verified Homes · Nairobi</small>" : ""}</span>
    </a>`;
  }

  /* ---------- Header ---------- */
  const NAV = [
    ["index.html", "Home"],
    ["properties.html", "Properties"],
    ["about.html", "About"],
    ["agents.html", "Agents"],
    ["contact.html", "Contact"]
  ];

  function currentPage() {
    const p = location.pathname.split("/").pop() || "index.html";
    return p === "" ? "index.html" : p;
  }

  function renderHeader() {
    const host = $("#site-header");
    if (!host) return;
    const onDark = host.dataset.dark === "true";
    const page = currentPage();
    const user = window.NyAuth && window.NyAuth.currentUser();

    const links = NAV.map(
      ([href, label]) =>
        `<a href="${href}" class="${page === href ? "active" : ""}">${label}</a>`
    ).join("");

    const authArea = user
      ? `<a class="avatar-btn" href="dashboard.html">
           <span class="avatar">${initials(user)}</span>
           <span>${(user.name || "Account").split(" ")[0]}</span>
         </a>`
      : `<a class="btn btn--ghost btn--sm" href="login.html">Log in</a>
         <a class="btn btn--sm" href="signup.html">Get started</a>`;

    host.className = "site-header" + (onDark ? " on-dark" : "");
    host.innerHTML = `
      <div class="bar container">
        ${brandHTML()}
        <nav class="nav">${links}</nav>
        <div class="header-actions">
          ${authArea}
          <button class="nav-toggle" aria-label="Open menu" data-open-drawer>${I("menu")}</button>
        </div>
      </div>
      <div class="mobile-drawer" id="drawer">
        <div class="scrim" data-close-drawer></div>
        <div class="panel">
          <button class="drawer-close" aria-label="Close" data-close-drawer>${I("close")}</button>
          ${NAV.map(([h, l]) => `<a href="${h}">${l}</a>`).join("")}
          ${user
            ? `<a href="dashboard.html">Dashboard</a>`
            : `<a href="login.html">Log in</a>`}
          <a class="btn ${user ? "" : "btn--gold"}" style="margin-top:14px" href="${user ? "dashboard.html" : "signup.html"}">${user ? "My dashboard" : "Get started"}</a>
        </div>
      </div>`;

    // scroll solid state
    const onScroll = () => host.classList.toggle("solid", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // drawer
    const drawer = $("#drawer");
    $$("[data-open-drawer]", host).forEach((b) =>
      b.addEventListener("click", () => drawer.classList.add("open"))
    );
    $$("[data-close-drawer]", host).forEach((b) =>
      b.addEventListener("click", () => drawer.classList.remove("open"))
    );
    hydrateIcons(host);
  }

  function initials(u) {
    const n = (u && (u.name || u.email)) || "U";
    return n.trim().split(/\s+/).slice(0, 2).map((x) => x[0].toUpperCase()).join("");
  }

  /* ---------- Footer ---------- */
  function renderFooter() {
    const host = $("#site-footer");
    if (!host) return;
    host.className = "site-footer";
    host.innerHTML = `
      <div class="container">
        <div class="footer-top">
          <div>
            ${brandHTML()}
            <p class="footer-about">Nyumba is Nairobi's verified-listings agency. Every home we market is physically inspected and title-checked — so what you see is exactly what you buy.</p>
            <div class="footer-soc">
              <a href="#" aria-label="Facebook">${I("facebook")}</a>
              <a href="#" aria-label="Instagram">${I("instagram")}</a>
              <a href="#" aria-label="X">${I("twitter")}</a>
              <a href="#" aria-label="LinkedIn">${I("linkedin")}</a>
            </div>
          </div>
          <div class="footer-col">
            <h5>Explore</h5>
            <a href="properties.html">Buy a home</a>
            <a href="properties.html?purpose=rent">Rent a home</a>
            <a href="properties.html?type=Land">Land & plots</a>
            <a href="agents.html">Our agents</a>
            <a href="about.html">Verification promise</a>
          </div>
          <div class="footer-col">
            <h5>Company</h5>
            <a href="about.html">About us</a>
            <a href="about.html#story">Our story</a>
            <a href="contact.html">Contact</a>
            <a href="login.html">Client login</a>
            <a href="dashboard.html">Dashboard</a>
          </div>
          <div class="footer-col">
            <h5>Get in touch</h5>
            <ul class="footer-contact">
              <li>${I("pin")}<span>ABC Place, Waiyaki Way,<br>Westlands, Nairobi</span></li>
              <li>${I("phone")}<a href="tel:+${PHONE_INTL}">${PHONE}</a></li>
              <li>${I("mail")}<a href="mailto:${EMAIL}">${EMAIL}</a></li>
            </ul>
            <form class="footer-news" data-newsletter>
              <input type="email" placeholder="Email for new listings" required aria-label="Email">
              <button class="btn btn--gold btn--sm" type="submit">Join</button>
            </form>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} Nyumba Realty. Portfolio project by Ian Wanjohi.</span>
          <span style="display:flex;gap:20px">
            <a href="#">Privacy</a><a href="#">Terms</a><a href="#">EARB Licensed</a>
          </span>
        </div>
      </div>`;
    hydrateIcons(host);
    const nf = $("[data-newsletter]", host);
    if (nf) nf.addEventListener("submit", (e) => {
      e.preventDefault();
      toast("You're on the list — new verified listings incoming.", "check");
      nf.reset();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      }),
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((e) => io.observe(e));
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    const nums = $$("[data-count]");
    if (!nums.length) return;
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split(".")[1] || "").length;
      const dur = 1600; const t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * e).toLocaleString("en-KE", { minimumFractionDigits: dec, maximumFractionDigits: dec });
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString("en-KE", { minimumFractionDigits: dec, maximumFractionDigits: dec });
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    }), { threshold: 0.5 });
    nums.forEach((n) => io.observe(n));
  }

  /* ---------- Favorites ---------- */
  const FAV_KEY = "nyumba:favs";
  const getFavs = () => { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; } };
  const setFavs = (a) => localStorage.setItem(FAV_KEY, JSON.stringify(a));
  function toggleFav(id) {
    const f = getFavs(); const i = f.indexOf(id);
    if (i >= 0) { f.splice(i, 1); toast("Removed from saved homes", "heart"); }
    else { f.push(id); toast("Saved to your homes", "heart"); }
    setFavs(f); return f.includes(id);
  }
  window.NyFavs = { get: getFavs, toggle: toggleFav };

  /* ---------- Property card ---------- */
  function priceLabel(p) {
    return D.fmtPrice(p.price) + (p.per ? `<span style="font-size:.7em;font-weight:600;opacity:.8">${p.per}</span>` : "");
  }
  function propCard(p) {
    const ag = D.agentBy(p.agent);
    const fav = getFavs().includes(p.id);
    const specs = p.type === "Land"
      ? `<span>${I("plot")}${p.plot}</span><span>${I("ruler")}${p.area} m²</span>`
      : `<span>${I("bed")}${p.beds}</span><span>${I("bath")}${p.baths}</span>
         <span>${I("car")}${p.garage}</span><span>${I("ruler")}${p.area} m²</span>`;
    return `<article class="pcard reveal">
      <div class="pcard__media">
        <a href="property.html?id=${p.id}"><img src="${D.img(p.images[0], 800)}" alt="${p.title}" loading="lazy"></a>
        <div class="pcard__tags">
          <span class="badge ${p.tag === "New" ? "badge--gold" : ""}">${p.tag}</span>
          ${p.verified ? `<span class="badge badge--verified">${I("verified")}Verified</span>` : ""}
        </div>
        <button class="pcard__fav ${fav ? "is-fav" : ""}" data-fav="${p.id}" aria-label="Save home">${I("heart")}</button>
        <span class="pcard__price-badge">${priceLabel(p)}</span>
      </div>
      <div class="pcard__body">
        <div class="pcard__loc">${I("pin")}${p.address}</div>
        <h3><a href="property.html?id=${p.id}">${p.title}</a></h3>
        <div class="pcard__feats">${specs}</div>
      </div>
      <div class="pcard__foot">
        <div class="pcard__agent">
          <img src="${ag.photo}" alt="${ag.name}">
          <span><b>${ag.name.split(" ")[0]}</b><small>${p.status}</small></span>
        </div>
        <a class="btn btn--ghost btn--sm" href="property.html?id=${p.id}">View ${I("arrowRight")}</a>
      </div>
    </article>`;
  }

  function bindFavs(root = document) {
    $$("[data-fav]", root).forEach((b) => {
      if (b.dataset.bound) return; b.dataset.bound = "1";
      b.addEventListener("click", (e) => {
        e.preventDefault();
        const on = toggleFav(b.dataset.fav);
        b.classList.toggle("is-fav", on);
        hydrateIcons(b);
      });
    });
  }

  /* ---------- Agent card ---------- */
  function agentCard(a) {
    return `<article class="acard reveal">
      <div class="acard__media">
        <img src="${a.photo}" alt="${a.name}" loading="lazy">
        <div class="acard__soc">
          <a href="tel:+${PHONE_INTL}" aria-label="Call">${I("phone")}</a>
          <a href="mailto:${EMAIL}" aria-label="Email">${I("mail")}</a>
          <a href="https://wa.me/${PHONE_INTL}" aria-label="WhatsApp">${I("whatsapp")}</a>
        </div>
      </div>
      <div class="acard__body">
        <h3>${a.name}</h3>
        <div class="acard__role">${a.role}</div>
        <div class="acard__meta">
          <div><b>${a.sales}</b><small>Sales</small></div>
          <div><b>${a.years} yrs</b><small>Experience</small></div>
          <div><b>${a.rating}</b><small>Rating</small></div>
        </div>
      </div>
    </article>`;
  }

  /* ---------- Testimonial ---------- */
  function testCard(t) {
    return `<div class="tcard reveal">
      <div class="quote-mark">&rdquo;</div>
      <div class="tstars">${Array(t.stars).fill(I("star")).join("")}</div>
      <p>${t.quote}</p>
      <div class="tcard__who">
        <img src="${t.photo}" alt="${t.name}">
        <div><b>${t.name}</b><small>${t.role}</small></div>
      </div>
    </div>`;
  }

  /* ---------- Toast ---------- */
  function toast(msg, ico = "check") {
    let host = $(".toast-host");
    if (!host) { host = document.createElement("div"); host.className = "toast-host"; document.body.appendChild(host); }
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `${I(ico)}<span>${msg}</span>`;
    host.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(10px)"; el.style.transition = ".4s"; }, 2600);
    setTimeout(() => el.remove(), 3100);
  }
  window.NyToast = toast;

  /* ---------- Home page ---------- */
  function buildHome() {
    const feat = $("#home-featured");
    if (feat) {
      const list = D.PROPERTIES.filter((p) => p.featured).slice(0, 6);
      feat.innerHTML = list.map(propCard).join("");
    }
    const hoods = $("#home-hoods");
    if (hoods) {
      hoods.innerHTML = D.NEIGHBORHOODS.map((n) =>
        `<a class="hood ${n.size === "wide" ? "hood--wide" : n.size === "tall" ? "hood--tall" : ""}" href="properties.html?q=${encodeURIComponent(n.name)}">
          <img src="${n.img}" alt="${n.name}" loading="lazy">
          <div><h4>${n.name}</h4><span>${n.count} verified listings</span></div>
        </a>`).join("");
    }
    const ag = $("#home-agents");
    if (ag) ag.innerHTML = D.AGENTS.slice(0, 4).map(agentCard).join("");
    const tt = $("#home-tests");
    if (tt) tt.innerHTML = D.TESTIMONIALS.map(testCard).join("");
    initHeroSearch();
  }

  /* ---------- Hero search ---------- */
  function initHeroSearch() {
    const form = $("#hero-search");
    if (!form) return;
    $$(".search-tabs button", form).forEach((b) =>
      b.addEventListener("click", () => {
        $$(".search-tabs button", form).forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        form.dataset.purpose = b.dataset.purpose;
      })
    );
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const params = new URLSearchParams();
      const q = $("#hs-q", form).value.trim();
      const type = $("#hs-type", form).value;
      const price = $("#hs-price", form).value;
      if (form.dataset.purpose) params.set("purpose", form.dataset.purpose);
      if (q) params.set("q", q);
      if (type) params.set("type", type);
      if (price) params.set("max", price);
      location.href = "properties.html?" + params.toString();
    });
  }

  /* ---------- Listings page ---------- */
  function buildListings() {
    const grid = $("#listings-grid");
    if (!grid) return;
    const params = new URLSearchParams(location.search);
    const state = {
      purpose: params.get("purpose") || "",
      type: params.get("type") || "",
      hood: params.get("q") || "",
      max: params.get("max") ? +params.get("max") : 0,
      beds: params.get("beds") ? +params.get("beds") : 0,
      sort: "featured"
    };
    // hydrate controls
    const set = (id, v) => { const el = $(id); if (el && v) el.value = v; };
    set("#f-purpose", state.purpose); set("#f-type", state.type);
    set("#f-beds", state.beds || ""); set("#f-max", state.max || "");
    const qi = $("#f-q"); if (qi && state.hood) qi.value = state.hood;

    function apply() {
      let out = D.PROPERTIES.filter((p) => {
        if (state.purpose && p.purpose !== state.purpose) return false;
        if (state.type && p.type !== state.type) return false;
        if (state.beds && p.beds < state.beds) return false;
        if (state.max && p.price > state.max) return false;
        if (state.hood) {
          const q = state.hood.toLowerCase();
          if (!(p.neighborhood + " " + p.title + " " + p.address + " " + p.city).toLowerCase().includes(q)) return false;
        }
        return true;
      });
      if (state.sort === "low") out.sort((a, b) => a.price - b.price);
      else if (state.sort === "high") out.sort((a, b) => b.price - a.price);
      else if (state.sort === "new") out.sort((a, b) => (b.year || 0) - (a.year || 0));
      else out.sort((a, b) => (b.featured - a.featured));

      grid.innerHTML = out.length
        ? out.map(propCard).join("")
        : `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted)">
             <div style="width:64px;height:64px;margin:0 auto 16px;border-radius:16px;background:var(--brand-050);color:var(--brand);display:grid;place-items:center">${I("search")}</div>
             <h3 style="margin-bottom:8px">No homes match those filters</h3>
             <p>Try widening your budget or location.</p></div>`;
      const c = $("#result-count"); if (c) c.innerHTML = `<b>${out.length}</b> verified ${out.length === 1 ? "home" : "homes"}`;
      hydrateIcons(grid); bindFavs(grid); initReveal();
    }

    $$("[data-filter]").forEach((el) =>
      el.addEventListener("change", () => {
        state.purpose = $("#f-purpose").value; state.type = $("#f-type").value;
        state.beds = +$("#f-beds").value || 0; state.max = +$("#f-max").value || 0;
        apply();
      })
    );
    const qEl = $("#f-q");
    if (qEl) qEl.addEventListener("input", () => { state.hood = qEl.value; apply(); });
    const sortEl = $("#f-sort");
    if (sortEl) sortEl.addEventListener("change", () => { state.sort = sortEl.value; apply(); });
    const reset = $("#f-reset");
    if (reset) reset.addEventListener("click", () => {
      state.purpose = state.type = state.hood = ""; state.beds = state.max = 0; state.sort = "featured";
      ["#f-purpose", "#f-type", "#f-beds", "#f-max", "#f-q", "#f-sort"].forEach((s) => { const e = $(s); if (e) e.value = ""; });
      apply();
    });

    // view toggle
    $$(".view-toggle button").forEach((b) =>
      b.addEventListener("click", () => {
        $$(".view-toggle button").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        grid.style.gridTemplateColumns = b.dataset.view === "list" ? "1fr" : "";
      })
    );
    apply();
  }

  /* ---------- Property detail ---------- */
  function buildDetail() {
    const host = $("#property-detail");
    if (!host) return;
    const id = new URLSearchParams(location.search).get("id");
    const p = D.PROPERTIES.find((x) => x.id === id) || D.PROPERTIES[0];
    const ag = D.agentBy(p.agent);
    document.title = `${p.title} · ${p.neighborhood} — Nyumba`;
    const fav = getFavs().includes(p.id);
    const specs = p.type === "Land"
      ? [["plot", p.plot, "Plot size"], ["ruler", p.area + " m²", "Area"], ["shieldCheck", "Titled", "Tenure"], ["pin", p.neighborhood, "Location"]]
      : [["bed", p.beds, "Bedrooms"], ["bath", p.baths, "Bathrooms"], ["car", p.garage, "Parking"], ["ruler", p.area + " m²", "Floor area"], ["calendar", p.year || "—", "Built"], ["plot", p.plot, "Plot"]];

    host.innerHTML = `
      <div class="container">
        <div class="crumbs">
          <a href="index.html">Home</a>${I("chevronRight")}
          <a href="properties.html">Properties</a>${I("chevronRight")}
          <span>${p.neighborhood}</span>
        </div>
        <div class="listings-head">
          <div>
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
              <span class="badge badge--verified">${I("verified")}Verified listing</span>
              <span class="badge">${p.status}</span>
              <span class="badge badge--gold">${p.tag}</span>
            </div>
            <h1 style="font-size:clamp(1.8rem,3.4vw,2.6rem)">${p.title}</h1>
            <div class="pcard__loc" style="margin-top:8px">${I("pin")}${p.address}, ${p.city}</div>
          </div>
          <div style="text-align:right">
            <div class="d-price">${D.fmtPrice(p.price)}${p.per ? `<span style="font-size:.9rem;color:var(--muted)">${p.per}</span>` : ""}</div>
            <button class="btn btn--ghost btn--sm" data-fav="${p.id}" style="margin-top:8px">${I("heart")}${fav ? "Saved" : "Save home"}</button>
          </div>
        </div>

        <div class="gallery reveal">
          <img class="g-main" src="${D.img(p.images[0], 1100)}" alt="${p.title}" data-lightbox>
          ${p.images.slice(1, 5).map((im) => `<img src="${D.img(im, 600)}" alt="${p.title}" data-lightbox>`).join("")}
        </div>

        <div class="detail-grid">
          <div class="detail-main">
            <div class="spec-grid">
              ${specs.map(([ic, v, l]) => `<div class="spec">${I(ic)}<b>${v}</b><small>${l}</small></div>`).join("")}
            </div>
            <h2 class="section-title" style="font-size:1.7rem">About this home</h2>
            <p class="section-lead" style="margin-top:12px">${p.desc}</p>

            <h2 class="section-title" style="font-size:1.7rem;margin-top:40px">Amenities</h2>
            <ul class="amenities" style="margin-top:20px">
              ${p.amenities.map((a) => `<li>${I("checkCircle")}${a}</li>`).join("")}
            </ul>

            <h2 class="section-title" style="font-size:1.7rem;margin-top:40px">Nyumba verification</h2>
            <div class="feature" style="margin-top:20px;background:var(--brand-050);border:none">
              <div style="display:flex;gap:16px;align-items:flex-start">
                <div class="feature__icon" style="margin:0;background:var(--brand);color:var(--gold-300)">${I("shieldCheck")}</div>
                <div>
                  <h3 style="font-size:1.2rem">Physically inspected & title-checked</h3>
                  <p>Our team visited this property, GPS-tagged the location, confirmed the ownership documents and photographed every room you see above. Verification ref: <b>NV-${p.id.toUpperCase()}</b>.</p>
                </div>
              </div>
            </div>

            <h2 class="section-title" style="font-size:1.7rem;margin-top:40px">Location</h2>
            <div style="margin-top:20px;border-radius:var(--r-lg);overflow:hidden;border:1px solid var(--line)">
              <iframe title="Map" width="100%" height="320" style="border:0;display:block" loading="lazy"
                src="https://www.openstreetmap.org/export/embed.html?bbox=${p.lng - 0.02}%2C${p.lat - 0.015}%2C${p.lng + 0.02}%2C${p.lat + 0.015}&layer=mapnik&marker=${p.lat}%2C${p.lng}"></iframe>
            </div>
          </div>

          <aside class="detail-side">
            <div class="side-card">
              <div class="agent-box">
                <img src="${ag.photo}" alt="${ag.name}">
                <div>
                  <b>${ag.name}</b>
                  <div style="color:var(--muted);font-size:.85rem">${ag.role}</div>
                  <div style="display:flex;align-items:center;gap:5px;color:var(--gold);font-weight:700;font-size:.85rem;margin-top:2px">${I("star")}${ag.rating} · ${ag.sales} sales</div>
                </div>
              </div>
              <form data-enquiry>
                <div class="form-field"><input class="inp" name="name" placeholder="Your name" required></div>
                <div class="form-field"><input class="inp" name="phone" placeholder="Phone number" required></div>
                <div class="form-field"><textarea name="msg" rows="3" placeholder="I'd like to arrange a viewing of ${p.title}.">I'd like to arrange a viewing of ${p.title}.</textarea></div>
                <button class="btn btn--block" type="submit">${I("message")}Request a viewing</button>
              </form>
              <a class="btn btn--gold btn--block" style="margin-top:10px" href="https://wa.me/${PHONE_INTL}?text=${encodeURIComponent("Hi Nyumba, I'm interested in " + p.title + " (" + p.id + ")")}">${I("whatsapp")}WhatsApp us</a>
              <a class="btn btn--ghost btn--block" style="margin-top:10px" href="tel:+${PHONE_INTL}">${I("phone")}${PHONE}</a>
            </div>
            <div class="side-card">
              <h3 style="font-size:1.1rem;margin-bottom:14px">Mortgage estimate</h3>
              <div id="mortgage"></div>
            </div>
          </aside>
        </div>

        <div class="section--tight">
          <h2 class="section-title" style="font-size:1.8rem;margin-bottom:24px">Similar verified homes</h2>
          <div class="cards-grid" id="similar"></div>
        </div>
      </div>`;

    // similar
    const sim = D.PROPERTIES.filter((x) => x.id !== p.id && (x.neighborhood === p.neighborhood || x.type === p.type)).slice(0, 3);
    $("#similar").innerHTML = (sim.length ? sim : D.PROPERTIES.slice(0, 3).filter(x=>x.id!==p.id)).map(propCard).join("");

    // gallery lightbox
    $$("[data-lightbox]", host).forEach((im) =>
      im.addEventListener("click", () => openLightbox(p.images.map((x) => D.img(x, 1400)), p.images.indexOf(p.images.find((_, i) => D.img(p.images[i], 1100) === im.src || D.img(p.images[i], 600) === im.src)) || 0))
    );

    // enquiry
    const ef = $("[data-enquiry]", host);
    ef.addEventListener("submit", (e) => { e.preventDefault(); toast("Viewing request sent — " + ag.name.split(" ")[0] + " will call you shortly.", "checkCircle"); ef.reset(); });

    // mortgage widget
    buildMortgage($("#mortgage"), p.price || 10000000);

    hydrateIcons(host); bindFavs(host);
  }

  function buildMortgage(host, price) {
    if (!host) return;
    const state = { price, deposit: 20, rate: 13.5, years: 20 };
    function calc() {
      const loan = state.price * (1 - state.deposit / 100);
      const r = state.rate / 100 / 12; const n = state.years * 12;
      const m = r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n));
      return { loan, m };
    }
    function render() {
      const { loan, m } = calc();
      host.innerHTML = `
        <label class="field-hint">Deposit: <b>${state.deposit}%</b> (${D.fmtPrice(state.price * state.deposit / 100)})</label>
        <input type="range" min="5" max="60" value="${state.deposit}" data-m="deposit" style="width:100%;accent-color:var(--brand)">
        <label class="field-hint">Interest rate: <b>${state.rate}%</b></label>
        <input type="range" min="8" max="20" step="0.5" value="${state.rate}" data-m="rate" style="width:100%;accent-color:var(--brand)">
        <label class="field-hint">Term: <b>${state.years} years</b></label>
        <input type="range" min="5" max="25" value="${state.years}" data-m="years" style="width:100%;accent-color:var(--brand)">
        <div style="margin-top:16px;padding:16px;border-radius:12px;background:var(--brand-050);text-align:center">
          <small style="color:var(--muted)">Estimated monthly repayment</small>
          <div style="font-family:var(--font-display);font-size:1.9rem;color:var(--brand)">${D.fmtPrice(Math.round(m))}<span style="font-size:.9rem">/mo</span></div>
          <small style="color:var(--muted)">Loan ${D.fmtPrice(Math.round(loan))} · illustrative only</small>
        </div>`;
      $$("[data-m]", host).forEach((s) => s.addEventListener("input", () => {
        state[s.dataset.m] = +s.value; render();
      }));
    }
    render();
  }

  /* ---------- Lightbox ---------- */
  function openLightbox(images, start = 0) {
    let i = start;
    const ov = document.createElement("div");
    ov.style.cssText = "position:fixed;inset:0;z-index:300;background:rgba(8,16,13,.94);display:grid;place-items:center;padding:30px";
    const draw = () => ov.innerHTML = `
      <button style="position:absolute;top:20px;right:24px;background:none;border:none;color:#fff" aria-label="Close" data-x>${I("close")}</button>
      <button style="position:absolute;left:20px;top:50%;background:rgba(255,255,255,.12);border:none;color:#fff;width:52px;height:52px;border-radius:50%" data-prev>${I("chevronRight")}</button>
      <img src="${images[i]}" style="max-width:92vw;max-height:82vh;border-radius:14px;object-fit:contain">
      <button style="position:absolute;right:20px;top:50%;background:rgba(255,255,255,.12);border:none;color:#fff;width:52px;height:52px;border-radius:50%" data-next>${I("chevronRight")}</button>
      <div style="position:absolute;bottom:24px;color:#fff;font-weight:600">${i + 1} / ${images.length}</div>`;
    const rerender = () => { draw(); hydrateIcons(ov);
      $("[data-prev]", ov).style.transform = "rotate(180deg)";
      $("[data-x]", ov).onclick = () => ov.remove();
      $("[data-prev]", ov).onclick = () => { i = (i - 1 + images.length) % images.length; rerender(); };
      $("[data-next]", ov).onclick = () => { i = (i + 1) % images.length; rerender(); };
    };
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov); rerender();
  }

  /* ---------- Agents page ---------- */
  function buildAgents() {
    const g = $("#agents-grid");
    if (!g) return;
    g.innerHTML = D.AGENTS.map(agentCard).join("");
  }

  /* ---------- Video ---------- */
  function initVideo() {
    const wrap = $("[data-video]");
    if (!wrap) return;
    const vid = $("video", wrap); const poster = $(".video-poster", wrap);
    if (!vid || !poster) return;
    poster.addEventListener("click", () => {
      poster.style.display = "none"; vid.play(); vid.setAttribute("controls", "");
    });
  }

  /* ---------- Generic forms (contact) ---------- */
  function initForms() {
    const cf = $("[data-contact]");
    if (cf) cf.addEventListener("submit", (e) => {
      e.preventDefault();
      const a = $(".form-alert", cf);
      if (a) { a.className = "form-alert ok"; a.textContent = "Thank you — your message is with our team. We'll reply within one business day."; }
      cf.reset();
    });
  }

  /* ---------- PWA ---------- */
  function initPWA() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () =>
        navigator.serviceWorker.register("sw.js").catch(() => {})
      );
    }
    let deferred = null;
    const banner = $("#install-banner");
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault(); deferred = e;
      if (banner && !sessionStorage.getItem("nyumba:install-dismissed")) banner.classList.add("show");
    });
    if (banner) {
      $("[data-install]", banner)?.addEventListener("click", async () => {
        banner.classList.remove("show");
        if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; }
      });
      $("[data-dismiss]", banner)?.addEventListener("click", () => {
        banner.classList.remove("show"); sessionStorage.setItem("nyumba:install-dismissed", "1");
      });
    }
  }

  /* ---------- Boot ---------- */
  function boot() {
    renderHeader();
    renderFooter();
    hydrateIcons();
    buildHome();
    buildListings();
    buildDetail();
    buildAgents();
    initVideo();
    initForms();
    bindFavs();
    initReveal();
    initCounters();
    initPWA();
    // re-render header when auth changes
    if (window.NyAuth) window.NyAuth.onChange(() => renderHeader());
  }

  window.NyRender = { propCard, agentCard, testCard, hydrateIcons, bindFavs, toast };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
