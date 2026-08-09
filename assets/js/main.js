/* ============================================================
   ESTO — main application script
   Chrome (pill nav, theme, auth modal), rendering, PWA.
   ============================================================ */
(function () {
  "use strict";
  const D = window.ESTO;
  const I = (n, c) => window.EstoIcon.get(n, c);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const A = () => window.EstoAuth;
  const PHONE = "0758950370", PHONE_INTL = "254758950370", EMAIL = "ianwanjohi475@gmail.com";
  const sz = D ? D.sized : (u) => u;

  /* ---------- Image fallback (broken remote CDN -> branded placeholder) ---------- */
  const PLACEHOLDER = "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='420'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#8B1E3F'/><stop offset='1' stop-color='#3a0d20'/></linearGradient></defs><rect width='600' height='420' fill='url(#g)'/><g fill='none' stroke='#E2B46E' stroke-width='3' opacity='.7' stroke-linejoin='round'><rect x='250' y='210' width='34' height='70' rx='3'/><rect x='288' y='180' width='34' height='100' rx='3'/><rect x='326' y='200' width='34' height='80' rx='3'/><path d='M240 280h140'/></g><text x='300' y='330' fill='#ffffff' opacity='.55' font-family='sans-serif' font-size='18' text-anchor='middle'>Esto</text></svg>`
  );
  document.addEventListener("error", (e) => {
    const t = e.target;
    if (t && t.tagName === "IMG" && !t.dataset.fb && !t.src.startsWith("data:")) {
      t.dataset.fb = "1"; t.src = PLACEHOLDER;
    }
  }, true);

  /* ---------- Icons ---------- */
  function hydrateIcons(root = document) {
    $$("[data-ico]", root).forEach((el) => { if (el.dataset.done) return; el.innerHTML = I(el.dataset.ico); el.dataset.done = "1"; });
  }

  /* ---------- Theme ---------- */
  const THEME_KEY = "esto:theme";
  function currentTheme() { return document.documentElement.getAttribute("data-theme") || "light"; }
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    $$("[data-theme-ico]").forEach((el) => { el.innerHTML = I(t === "dark" ? "sun" : "moon"); });
    const meta = $('meta[name="theme-color"]'); if (meta) meta.setAttribute("content", t === "dark" ? "#120c16" : "#8B1E3F");
  }
  function toggleTheme() { setTheme(currentTheme() === "dark" ? "light" : "dark"); }

  /* ---------- Official Google logo ---------- */
  const GOOGLE_LOGO = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

  /* ---------- Brand (wordmark) ---------- */
  function brandHTML(href = "index.html") {
    return `<a class="brand" href="${href}" aria-label="Esto home"><span class="logo">Esto<span class="dot">.</span></span></a>`;
  }
  const initials = (u) => { const n = (u && (u.name || u.email)) || "U"; return n.trim().split(/\s+/).slice(0, 2).map((x) => x[0].toUpperCase()).join(""); };

  /* ---------- Header ---------- */
  const NAV = [["index.html", "Home"], ["properties.html", "Properties"], ["about.html", "About"], ["agents.html", "Agents"], ["contact.html", "Contact"]];
  function currentPage() { const p = location.pathname.split("/").pop(); return !p ? "index.html" : p; }

  function renderHeader() {
    const host = $("#site-header"); if (!host) return;
    const onHero = host.dataset.hero === "true";
    const page = currentPage();
    const user = A() && A().currentUser();
    const links = NAV.map(([h, l]) => `<a href="${h}" class="${page === h ? "active" : ""}">${l}</a>`).join("");
    const authArea = user
      ? `<a class="avatar-btn" href="dashboard.html#settings" title="Your profile"><span class="avatar">${initials(user)}</span><span class="lbl">${(user.name || "Account").split(" ")[0]}</span></a>`
      : `<button class="btn--login" data-open-auth="login">Login</button>`;

    host.className = "site-header" + (onHero ? " on-hero" : "");
    host.innerHTML = `
      <div class="bar container">
        ${brandHTML()}
        <nav class="nav-pill">${links}</nav>
        <div class="header-actions">
          <button class="theme-toggle" data-theme-toggle data-theme-ico aria-label="Toggle theme">${I(currentTheme() === "dark" ? "sun" : "moon")}</button>
          ${authArea}
          <button class="nav-toggle" aria-label="Menu" data-open-drawer>${I("menu")}</button>
        </div>
      </div>
      <div class="mobile-drawer" id="drawer">
        <div class="scrim" data-close-drawer></div>
        <div class="panel">
          <div class="drawer-head">${brandHTML()}<button class="drawer-close" data-close-drawer aria-label="Close">${I("close")}</button></div>
          ${NAV.map(([h, l]) => `<a href="${h}" class="${page === h ? "active" : ""}" style="${page === h ? "color:var(--brand)" : ""}">${l}</a>`).join("")}
          ${user ? `<a href="dashboard.html">Dashboard</a>` : ""}
          <div class="drawer-theme">Dark mode <button data-theme-toggle data-theme-ico>${I(currentTheme() === "dark" ? "sun" : "moon")}</button></div>
          <div class="drawer-contact">
            <a href="tel:+${PHONE_INTL}">${I("phone")}${PHONE}</a>
            <a href="mailto:${EMAIL}">${I("mail")}${EMAIL}</a>
          </div>
          <div class="drawer-cta">
            ${user
              ? `<a class="btn btn--block" href="dashboard.html">${I("dashboard")}My dashboard</a>`
              : `<button class="btn btn--block" data-open-auth="login">${I("user")}Login</button><button class="btn btn--gold btn--block" data-open-auth="register">${I("sparkles")}Create account</button>`}
            <button class="btn btn--ghost btn--block" data-install-app>${I("download")}Install app</button>
          </div>
        </div>
      </div>`;

    const onScroll = () => host.classList.toggle("solid", window.scrollY > 30);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    const drawer = $("#drawer");
    $$("[data-open-drawer]", host).forEach((b) => b.addEventListener("click", () => drawer.classList.add("open")));
    $$("[data-close-drawer]", host).forEach((b) => b.addEventListener("click", () => drawer.classList.remove("open")));
    $$("[data-theme-toggle]", host).forEach((b) => b.addEventListener("click", toggleTheme));
    $$("[data-open-auth]", host).forEach((b) => b.addEventListener("click", () => { drawer.classList.remove("open"); openAuth(b.dataset.openAuth); }));
    hydrateIcons(host);
  }

  /* ---------- Social rail (home only) ---------- */
  function renderSocialRail() {
    const host = $("#social-rail"); if (!host) return;
    host.className = "social-rail";
    host.innerHTML = [["instagram"], ["pinterest"], ["whatsapp", `https://wa.me/${PHONE_INTL}`], ["facebook"]]
      .map(([ic, href]) => `<a href="${href || "#"}" aria-label="${ic}">${I(ic)}</a>`).join("");
  }

  /* ---------- Footer ---------- */
  function renderFooter() {
    const host = $("#site-footer"); if (!host) return;
    host.className = "site-footer";
    host.innerHTML = `
      <div class="container">
        <div class="footer-top">
          <div>
            ${brandHTML()}
            <p class="footer-about">Esto is Nairobi's trust-first property platform. Every listing carries a data-driven <b style="color:#fff">TrustScore</b> — title, inspection, price fairness and agent record, verified before you ever view.</p>
            <div class="footer-soc">
              <a href="#" aria-label="Facebook">${I("facebook")}</a>
              <a href="#" aria-label="Instagram">${I("instagram")}</a>
              <a href="#" aria-label="X">${I("twitter")}</a>
              <a href="#" aria-label="LinkedIn">${I("linkedin")}</a>
            </div>
          </div>
          <div class="footer-col"><h5>Explore</h5>
            <a href="properties.html">Buy a home</a><a href="properties.html?purpose=rent">Rent a home</a>
            <a href="properties.html?type=Land">Land &amp; plots</a><a href="agents.html">Our agents</a><a href="about.html">TrustScore</a></div>
          <div class="footer-col"><h5>Company</h5>
            <a href="about.html">About us</a><a href="about.html#story">Our story</a>
            <a href="contact.html">Contact</a><a href="dashboard.html">Dashboard</a><a href="#" data-install-app>Install app</a></div>
          <div class="footer-col"><h5>Get in touch</h5>
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
          <span>© ${new Date().getFullYear()} Esto. Portfolio project by Ian Wanjohi.</span>
          <span style="display:flex;gap:20px"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">EARB Licensed</a></span>
        </div>
      </div>`;
    hydrateIcons(host);
    const nf = $("[data-newsletter]", host);
    if (nf) nf.addEventListener("submit", (e) => { e.preventDefault(); toast("You're on the list — new verified listings incoming.", "check"); nf.reset(); });
    $$("[data-open-auth]", host).forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); openAuth(b.dataset.openAuth); }));
  }

  /* ---------- AUTH MODAL ---------- */
  let authNext = null;
  function buildAuthModal() {
    if ($("#auth-modal")) return;
    const el = document.createElement("div");
    el.className = "auth-modal"; el.id = "auth-modal";
    el.innerHTML = `
      <div class="scrim" data-auth-close></div>
      <div class="dialog" role="dialog" aria-modal="true">
        <div class="auth-head">
          <button class="auth-tab active" data-auth-tab="login">Login</button>
          <button class="auth-tab" data-auth-tab="register">Register</button>
          <button class="auth-close" data-auth-close aria-label="Close">${I("close")}</button>
        </div>
        <div class="auth-body">
          <div class="form-alert" id="auth-alert"></div>
          <div id="auth-forms"></div>
        </div>
      </div>`;
    document.body.appendChild(el);
    $$("[data-auth-close]", el).forEach((b) => b.addEventListener("click", closeAuth));
    $$("[data-auth-tab]", el).forEach((b) => b.addEventListener("click", () => switchAuth(b.dataset.authTab)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAuth(); });
    hydrateIcons(el);
  }
  function alertAuth(msg, ok) { const a = $("#auth-alert"); if (!a) return; a.className = "form-alert " + (ok ? "ok" : "err"); a.textContent = msg; }
  function switchAuth(mode) {
    $$("[data-auth-tab]").forEach((b) => b.classList.toggle("active", b.dataset.authTab === mode));
    const a = $("#auth-alert"); if (a) { a.className = "form-alert"; a.textContent = ""; }
    const host = $("#auth-forms");
    const googleBtn = `<button class="oauth-btn" data-google>${GOOGLE_LOGO}Continue with Google</button><div class="divider">or with email</div>`;
    if (mode === "login") {
      host.innerHTML = `
        <h3>Welcome back</h3><p class="sub">Log in to your Esto account.</p>
        ${googleBtn}
        <form data-login>
          <div class="form-field"><label>Email</label><div class="inp-wrap">${I("mail")}<input class="inp" type="email" name="email" placeholder="you@example.com" required></div></div>
          <div class="form-field"><label>Password</label><div class="inp-wrap">${I("lock")}<input class="inp" type="password" name="password" placeholder="Your password" required><button type="button" class="inp-toggle" data-pw>${I("eye")}</button></div></div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
            <label class="check-row" style="align-items:center"><input type="checkbox" checked>Remember me</label>
            <button type="button" class="forgot" data-forgot>Forgot password?</button>
          </div>
          <button class="btn btn--block btn--lg" type="submit">Login</button>
        </form>`;
    } else {
      host.innerHTML = `
        <h3>Create your account</h3><p class="sub">Free forever. No card required.</p>
        ${googleBtn}
        <form data-register>
          <div class="form-field"><label>Full name</label><div class="inp-wrap">${I("user")}<input class="inp" name="name" placeholder="Jane Wanjiru" required></div></div>
          <div class="form-field"><label>Email</label><div class="inp-wrap">${I("mail")}<input class="inp" type="email" name="email" placeholder="you@example.com" required></div></div>
          <div class="form-field"><label>Password</label><div class="inp-wrap">${I("lock")}<input class="inp" type="password" name="password" placeholder="At least 6 characters" required><button type="button" class="inp-toggle" data-pw>${I("eye")}</button></div>
            <div class="pw-meter"><i id="pw-bar"></i></div></div>
          <label class="check-row" style="margin-bottom:18px"><input type="checkbox" required>I agree to Esto's Terms &amp; Privacy Policy.</label>
          <button class="btn btn--block btn--lg" type="submit">Create account</button>
        </form>`;
    }
    hydrateIcons(host);
    // eye toggles
    $$("[data-pw]", host).forEach((b) => b.addEventListener("click", () => {
      const inp = b.parentElement.querySelector("input");
      inp.type = inp.type === "password" ? "text" : "password";
      b.innerHTML = I(inp.type === "password" ? "eye" : "eyeOff");
    }));
    const bar = $("#pw-bar", host);
    if (bar) $("input[name=password]", host).addEventListener("input", (e) => {
      const v = e.target.value; let s = 0;
      if (v.length >= 6) s++; if (v.length >= 10) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++;
      const pct = Math.min(s / 5 * 100, 100); bar.style.width = pct + "%";
      bar.style.background = pct < 40 ? "var(--danger)" : pct < 80 ? "var(--warn)" : "var(--ok)";
    });
    const gb = $("[data-google]", host);
    if (gb) gb.addEventListener("click", async () => { try { await A().signInGoogle(); afterAuth(); } catch (e) { alertAuth(e.message); } });
    const fb = $("[data-forgot]", host);
    if (fb) fb.addEventListener("click", () => alertAuth("Password reset: contact us at " + EMAIL, true));
    const lf = $("[data-login]", host);
    if (lf) lf.addEventListener("submit", async (e) => {
      e.preventDefault(); const btn = $("button[type=submit]", lf); btn.disabled = true; const t = btn.textContent; btn.textContent = "Please wait…";
      try { await A().signIn({ email: lf.email.value.trim(), password: lf.password.value }); afterAuth(); }
      catch (err) { alertAuth(err.message); btn.disabled = false; btn.textContent = t; }
    });
    const rf = $("[data-register]", host);
    if (rf) rf.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (rf.password.value.length < 6) return alertAuth("Password must be at least 6 characters.");
      const btn = $("button[type=submit]", rf); btn.disabled = true; const t = btn.textContent; btn.textContent = "Creating…";
      try { await A().signUp({ name: rf.name.value.trim(), email: rf.email.value.trim(), password: rf.password.value }); afterAuth(); }
      catch (err) { alertAuth(err.message); btn.disabled = false; btn.textContent = t; }
    });
  }
  function openAuth(mode = "login", next) {
    authNext = next || null;
    buildAuthModal(); switchAuth(mode);
    requestAnimationFrame(() => $("#auth-modal").classList.add("open"));
    document.body.style.overflow = "hidden";
  }
  function closeAuth() { const m = $("#auth-modal"); if (m) m.classList.remove("open"); document.body.style.overflow = ""; }
  function afterAuth() {
    closeAuth(); renderHeader();
    toast("Signed in successfully.", "checkCircle");
    if (authNext) { const n = authNext; authNext = null; setTimeout(() => location.href = n, 400); }
  }
  window.EstoAuthUI = { open: openAuth };

  /* ---------- Reveal / counters / back-top ---------- */
  function initReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((e) => io.observe(e));
  }
  function initCounters() {
    const nums = $$("[data-count]"); if (!nums.length) return;
    const run = (el) => {
      const target = parseFloat(el.dataset.count); const dec = (el.dataset.count.split(".")[1] || "").length; const dur = 1600; const t0 = performance.now();
      const step = (t) => { const p = Math.min((t - t0) / dur, 1); const e = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * e).toLocaleString("en-KE", { minimumFractionDigits: dec, maximumFractionDigits: dec });
        if (p < 1) requestAnimationFrame(step); else el.textContent = target.toLocaleString("en-KE", { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } }), { threshold: 0.5 });
    nums.forEach((n) => io.observe(n));
  }
  function initBackTop() {
    let btn = $(".back-top");
    if (!btn) { btn = document.createElement("button"); btn.className = "back-top"; btn.setAttribute("aria-label", "Back to top"); btn.innerHTML = I("arrowUp"); document.body.appendChild(btn); }
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => btn.classList.toggle("show", window.scrollY > 600), { passive: true });
  }

  /* ---------- Favorites (localStorage + Firestore mirror) ---------- */
  const FAV_KEY = "esto:favs";
  const getFavs = () => { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; } };
  const setFavs = (a) => localStorage.setItem(FAV_KEY, JSON.stringify(a));
  const fbUid = () => (window.EstoFB && window.EstoFB.uid && window.EstoFB.uid()) || null;
  async function fsWriteFav(id, on) {
    const fb = window.EstoFB; if (!fb || !fbUid()) return;
    try { const { doc, setDoc, deleteDoc } = fb.fx; const ref = doc(fb.db, `users/${fbUid()}/saved/${id}`);
      if (on) await setDoc(ref, { at: Date.now() }); else await deleteDoc(ref); } catch (e) {}
  }
  function apiWriteFav(id, on) {
    const A = window.EstoAPI; if (!A || !A.available || !A.token()) return;
    (on ? A.addSaved(id) : A.removeSaved(id)).catch(() => {});
  }
  function toggleFav(id) {
    const f = getFavs(); const i = f.indexOf(id); let on;
    if (i >= 0) { f.splice(i, 1); on = false; toast("Removed from saved homes", "heart"); }
    else { f.push(id); on = true; toast("Saved to your homes", "heart"); }
    setFavs(f); fsWriteFav(id, on); apiWriteFav(id, on); return f.includes(id);
  }
  async function pullFavsAPI() {
    const A = window.EstoAPI; if (!A || !A.available || !A.token()) return;
    try {
      const remote = (await A.getSaved()).saved || [];
      const merged = Array.from(new Set([...getFavs(), ...remote]));
      merged.filter((id) => !remote.includes(id)).forEach((id) => A.addSaved(id).catch(() => {}));
      setFavs(merged); document.dispatchEvent(new Event("esto-favs-synced"));
    } catch (e) {}
  }
  window.addEventListener("esto-api-ready", (e) => { if (e.detail && e.detail.available) setTimeout(pullFavsAPI, 400); });
  async function pullFavs(fb) {
    try {
      const { collection, getDocs, doc, setDoc } = fb.fx; const uid = fb.uid();
      const snap = await getDocs(collection(fb.db, `users/${uid}/saved`));
      const remote = snap.docs.map((d) => d.id);
      const merged = Array.from(new Set([...getFavs(), ...remote]));
      // push any local-only saves up so the DB is the union
      merged.filter((id) => !remote.includes(id)).forEach((id) => { try { setDoc(doc(fb.db, `users/${uid}/saved/${id}`), { at: Date.now() }); } catch (e) {} });
      setFavs(merged);
      document.dispatchEvent(new Event("esto-favs-synced"));
    } catch (e) {}
  }
  window.addEventListener("esto-fb-ready", (e) => { if (e.detail && e.detail.uid && e.detail.uid()) pullFavs(e.detail); });
  window.EstoFavs = { get: getFavs, toggle: toggleFav };

  /* ---------- Cards ---------- */
  function priceLabel(p) { return D.fmtPrice(p.price) + (p.per ? `<span class="per">${p.per}</span>` : ""); }
  function trustRing(t) { return `<div class="trust-ring" style="--v:${t.overall}"><span>${t.overall}</span><small>TrustScore</small></div>`; }
  function propCard(p) {
    const ag = D.agentBy(p.agent); const fav = getFavs().includes(p.id);
    const specs = p.type === "Land"
      ? `<span>${I("plot")}${p.plot}</span><span>${I("ruler")}${p.area} m²</span>`
      : `<span>${I("bed")}${p.beds}</span><span>${I("bath")}${p.baths}</span><span>${I("car")}${p.garage}</span><span>${I("ruler")}${p.area} m²</span>`;
    return `<article class="pcard reveal">
      <div class="pcard__media">
        <a href="property.html?id=${p.id}"><img src="${sz(p.images[0], 800)}" alt="${p.title}" loading="lazy"></a>
        <div class="pcard__tags"><span class="badge ${p.tag === "New" ? "badge--gold" : ""}">${p.tag}</span>${p.verified ? `<span class="badge badge--verified">${I("verified")}Verified</span>` : ""}</div>
        <button class="pcard__fav ${fav ? "is-fav" : ""}" data-fav="${p.id}" aria-label="Save home">${I("heart")}</button>
        <span class="pcard__price">${priceLabel(p)}</span>
        ${trustRing(p.trust)}
      </div>
      <div class="pcard__body">
        <div class="pcard__loc">${I("pin")}${p.address}</div>
        <h3><a href="property.html?id=${p.id}">${p.title}</a></h3>
        <div class="pcard__feats">${specs}</div>
      </div>
      <div class="pcard__foot">
        <div class="pcard__agent"><img src="${sz(ag.photo, 80)}" alt="${ag.name}"><span><b>${ag.name.split(" ")[0]}</b><small>${p.status}</small></span></div>
        <a class="btn btn--ghost btn--sm" href="property.html?id=${p.id}">View ${I("arrowRight")}</a>
      </div>
    </article>`;
  }
  function bindFavs(root = document) {
    $$("[data-fav]", root).forEach((b) => { if (b.dataset.bound) return; b.dataset.bound = "1";
      b.addEventListener("click", (e) => { e.preventDefault(); const on = toggleFav(b.dataset.fav); b.classList.toggle("is-fav", on); hydrateIcons(b); }); });
  }
  function agentCard(a) {
    return `<article class="acard reveal">
      <div class="acard__media"><img src="${sz(a.photo, 500)}" alt="${a.name}" loading="lazy">
        <div class="acard__soc"><a href="tel:+${PHONE_INTL}">${I("phone")}</a><a href="mailto:${EMAIL}">${I("mail")}</a><a href="https://wa.me/${PHONE_INTL}">${I("whatsapp")}</a></div></div>
      <div class="acard__body"><h3>${a.name}</h3><div class="acard__role">${a.role}</div>
        <div class="acard__meta"><div><b>${a.sales}</b><small>Sales</small></div><div><b>${a.years} yrs</b><small>Experience</small></div><div><b>${a.rating}</b><small>Rating</small></div></div></div>
    </article>`;
  }
  function testCard(t) {
    return `<div class="tcard reveal"><div class="quote-mark">&rdquo;</div><div class="tstars">${Array(t.stars).fill(I("star")).join("")}</div>
      <p>${t.quote}</p><div class="tcard__who"><img src="${sz(t.photo, 120)}" alt="${t.name}"><div><b>${t.name}</b><small>${t.role}</small></div></div></div>`;
  }

  /* ---------- Toast ---------- */
  function toast(msg, ico = "check") {
    let host = $(".toast-host"); if (!host) { host = document.createElement("div"); host.className = "toast-host"; document.body.appendChild(host); }
    const el = document.createElement("div"); el.className = "toast"; el.innerHTML = `${I(ico)}<span>${msg}</span>`; host.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(10px)"; el.style.transition = ".4s"; }, 2600);
    setTimeout(() => el.remove(), 3100);
  }
  window.EstoToast = toast;

  /* ---------- Home ---------- */
  function buildHome() {
    const cats = $("#home-cats");
    if (cats) cats.innerHTML = D.CATEGORIES.map((c) => `
      <a class="cat reveal ${c.primary ? "is-primary" : ""}" href="properties.html?type=${encodeURIComponent(c.name.replace(/s$/, ""))}">
        <div class="cat__ico">${I(c.icon)}</div>
        <div><h3>${c.name}</h3><p>${c.count} properties</p></div>
        <span class="cat__arrow">${I("arrowRight")}</span>
      </a>`).join("");
    const feat = $("#home-featured");
    if (feat) feat.innerHTML = D.PROPERTIES.filter((p) => p.featured).slice(0, 6).map(propCard).join("");
    const hoods = $("#home-hoods");
    if (hoods) hoods.innerHTML = D.NEIGHBORHOODS.map((n) => `
      <a class="hood ${n.size === "wide" ? "hood--wide" : n.size === "tall" ? "hood--tall" : ""}" href="properties.html?q=${encodeURIComponent(n.name)}">
        <img src="${sz(n.img, 700)}" alt="${n.name}" loading="lazy"><div><h4>${n.name}</h4><span>${n.count} verified listings</span></div></a>`).join("");
    const ag = $("#home-agents"); if (ag) ag.innerHTML = D.AGENTS.slice(0, 4).map(agentCard).join("");
    const tt = $("#home-tests"); if (tt) tt.innerHTML = D.TESTIMONIALS.map(testCard).join("");
    initHeroSearch();
  }
  function initHeroSearch() {
    const form = $("#hero-search"); if (!form) return;
    $$(".search-tabs button", form).forEach((b) => b.addEventListener("click", () => {
      $$(".search-tabs button", form).forEach((x) => x.classList.remove("active")); b.classList.add("active"); form.dataset.purpose = b.dataset.purpose;
    }));
    form.addEventListener("submit", (e) => {
      e.preventDefault(); const params = new URLSearchParams();
      const q = $("#hs-q", form).value.trim(), type = $("#hs-type", form).value, price = $("#hs-price", form).value;
      if (form.dataset.purpose) params.set("purpose", form.dataset.purpose);
      if (q) params.set("q", q); if (type) params.set("type", type); if (price) params.set("max", price);
      location.href = "properties.html?" + params.toString();
    });
  }

  /* ---------- Listings ---------- */
  function buildListings() {
    const grid = $("#listings-grid"); if (!grid) return;
    const params = new URLSearchParams(location.search);
    const state = { purpose: params.get("purpose") || "", type: params.get("type") || "", hood: params.get("q") || "",
      max: params.get("max") ? +params.get("max") : 0, beds: params.get("beds") ? +params.get("beds") : 0, sort: "featured" };
    const set = (id, v) => { const el = $(id); if (el && v) el.value = v; };
    set("#f-purpose", state.purpose); set("#f-type", state.type); set("#f-beds", state.beds || ""); set("#f-max", state.max || "");
    const qi = $("#f-q"); if (qi && state.hood) qi.value = state.hood;
    function apply() {
      let out = D.PROPERTIES.filter((p) => {
        if (state.purpose && p.purpose !== state.purpose) return false;
        if (state.type && p.type !== state.type) return false;
        if (state.beds && p.beds < state.beds) return false;
        if (state.max && p.price > state.max) return false;
        if (state.hood) { const q = state.hood.toLowerCase(); if (!(p.neighborhood + " " + p.title + " " + p.address + " " + p.city + " " + p.type).toLowerCase().includes(q)) return false; }
        return true;
      });
      if (state.sort === "low") out.sort((a, b) => a.price - b.price);
      else if (state.sort === "high") out.sort((a, b) => b.price - a.price);
      else if (state.sort === "trust") out.sort((a, b) => b.trust.overall - a.trust.overall);
      else if (state.sort === "new") out.sort((a, b) => (b.year || 0) - (a.year || 0));
      else out.sort((a, b) => (b.featured - a.featured));
      grid.innerHTML = out.length ? out.map(propCard).join("")
        : `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted)"><div style="width:64px;height:64px;margin:0 auto 16px;border-radius:16px;background:var(--brand-050);color:var(--brand);display:grid;place-items:center">${I("search")}</div><h3 style="margin-bottom:8px">No homes match those filters</h3><p>Try widening your budget or location.</p></div>`;
      const c = $("#result-count"); if (c) c.innerHTML = `<b>${out.length}</b> verified ${out.length === 1 ? "home" : "homes"}`;
      hydrateIcons(grid); bindFavs(grid); initReveal();
    }
    $$("[data-filter]").forEach((el) => el.addEventListener("change", () => {
      state.purpose = $("#f-purpose").value; state.type = $("#f-type").value; state.beds = +$("#f-beds").value || 0; state.max = +$("#f-max").value || 0; apply();
    }));
    const qEl = $("#f-q"); if (qEl) qEl.addEventListener("input", () => { state.hood = qEl.value; apply(); });
    const sortEl = $("#f-sort"); if (sortEl) sortEl.addEventListener("change", () => { state.sort = sortEl.value; apply(); });
    const reset = $("#f-reset"); if (reset) reset.addEventListener("click", () => {
      state.purpose = state.type = state.hood = ""; state.beds = state.max = 0; state.sort = "featured";
      ["#f-purpose", "#f-type", "#f-beds", "#f-max", "#f-q", "#f-sort"].forEach((s) => { const e = $(s); if (e) e.value = ""; }); apply();
    });
    $$(".view-toggle button").forEach((b) => b.addEventListener("click", () => {
      $$(".view-toggle button").forEach((x) => x.classList.remove("active")); b.classList.add("active");
      grid.style.gridTemplateColumns = b.dataset.view === "list" ? "1fr" : "";
    }));
    apply();
  }

  /* ---------- Detail ---------- */
  function buildDetail() {
    const host = $("#property-detail"); if (!host) return;
    const id = new URLSearchParams(location.search).get("id");
    const p = D.PROPERTIES.find((x) => x.id === id) || D.PROPERTIES[0];
    const ag = D.agentBy(p.agent); const t = p.trust;
    document.title = `${p.title} · ${p.neighborhood} — Esto`;
    const fav = getFavs().includes(p.id);
    const specs = p.type === "Land"
      ? [["plot", p.plot, "Plot size"], ["ruler", p.area + " m²", "Area"], ["shieldCheck", "Titled", "Tenure"], ["pin", p.neighborhood, "Location"]]
      : [["bed", p.beds, "Bedrooms"], ["bath", p.baths, "Bathrooms"], ["car", p.garage, "Parking"], ["ruler", p.area + " m²", "Floor area"], ["calendar", p.year || "—", "Built"], ["plot", p.plot, "Plot"]];
    host.innerHTML = `
      <div class="container">
        <div class="crumbs"><a href="index.html">Home</a>${I("chevronRight")}<a href="properties.html">Properties</a>${I("chevronRight")}<span>${p.neighborhood}</span></div>
        <div class="listings-head">
          <div>
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
              <span class="badge badge--verified">${I("verified")}Verified</span><span class="badge">${p.status}</span><span class="badge badge--gold">${p.tag}</span>
              <span class="badge" style="background:var(--gold-050);color:var(--gold)">${I("shieldCheck")}TrustScore ${t.overall} · ${D.trustLabel(t.overall)}</span>
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
          <img class="g-main" src="${sz(p.images[0], 1100)}" alt="${p.title}" data-lb="0">
          ${p.images.slice(1, 5).map((im, i) => `<img src="${sz(im, 600)}" alt="${p.title}" data-lb="${i + 1}">`).join("")}
        </div>
        <div class="detail-grid">
          <div class="detail-main">
            <div class="spec-grid">${specs.map(([ic, v, l]) => `<div class="spec">${I(ic)}<b>${v}</b><small>${l}</small></div>`).join("")}</div>
            <h2 class="section-title" style="font-size:1.7rem">About this home</h2>
            <p class="section-lead" style="margin-top:12px">${p.desc}</p>
            <h2 class="section-title" style="font-size:1.7rem;margin-top:40px">Amenities</h2>
            <ul class="amenities" style="margin-top:20px">${p.amenities.map((a) => `<li>${I("checkCircle")}${a}</li>`).join("")}</ul>
            <h2 class="section-title" style="font-size:1.7rem;margin-top:40px">Location</h2>
            <div style="margin-top:20px;border-radius:var(--r-lg);overflow:hidden;border:1px solid var(--line)">
              <iframe title="Map" width="100%" height="320" style="border:0;display:block" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=${p.lng - 0.02}%2C${p.lat - 0.015}%2C${p.lng + 0.02}%2C${p.lat + 0.015}&layer=mapnik&marker=${p.lat}%2C${p.lng}"></iframe>
            </div>
          </div>
          <aside class="detail-side">
            <div class="side-card">
              <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
                <div class="trust-ring" style="--v:${t.overall};position:relative;width:60px;height:60px;flex:none"><span>${t.overall}</span></div>
                <div><b style="font-family:var(--font-display);font-size:1.1rem">Esto TrustScore</b><div style="color:var(--muted);font-size:.85rem">${D.trustLabel(t.overall)} — verified before listing</div></div>
              </div>
              <div class="trust-breakdown">
                ${[["Title & ownership", t.title], ["Physical inspection", t.inspection], ["Price fairness", t.price], ["Agent record", t.agent]]
                  .map(([l, v]) => `<div class="tb-row"><span class="tb-lab">${l}</span><div class="tb-bar"><i data-w="${v}"></i></div><span class="tb-val">${v}</span></div>`).join("")}
              </div>
            </div>
            <div class="side-card">
              <div class="agent-box"><img src="${sz(ag.photo, 120)}" alt="${ag.name}">
                <div><b>${ag.name}</b><div style="color:var(--muted);font-size:.85rem">${ag.role}</div>
                  <div style="display:flex;align-items:center;gap:5px;color:var(--gold);font-weight:700;font-size:.85rem;margin-top:2px">${I("star")}${ag.rating} · ${ag.sales} sales</div></div>
              </div>
              <form data-enquiry>
                <div class="form-field"><input class="inp" name="name" placeholder="Your name" required></div>
                <div class="form-field"><input class="inp" name="phone" placeholder="Phone number" required></div>
                <div class="form-field"><textarea name="msg" rows="3">I'd like to arrange a viewing of ${p.title}.</textarea></div>
                <button class="btn btn--block" type="submit">${I("message")}Request a viewing</button>
              </form>
              <button class="btn btn--gold btn--block" style="margin-top:10px" data-reserve>${I("wallet")}Reserve viewing · M-Pesa</button>
              <a class="btn btn--ghost btn--block" style="margin-top:10px" href="https://wa.me/${PHONE_INTL}?text=${encodeURIComponent("Hi Esto, I'm interested in " + p.title + " (" + p.id + ")")}">${I("whatsapp")}WhatsApp us</a>
              <a class="btn btn--ghost btn--block" style="margin-top:10px" href="tel:+${PHONE_INTL}">${I("phone")}${PHONE}</a>
            </div>
            <div class="side-card"><h3 style="font-size:1.1rem;margin-bottom:14px">Mortgage estimate</h3><div id="mortgage"></div></div>
          </aside>
        </div>
        <div class="section--tight"><h2 class="section-title" style="font-size:1.8rem;margin-bottom:24px">Similar verified homes</h2><div class="cards-grid" id="similar"></div></div>
      </div>`;
    const sim = D.PROPERTIES.filter((x) => x.id !== p.id && (x.neighborhood === p.neighborhood || x.type === p.type)).slice(0, 3);
    $("#similar").innerHTML = (sim.length ? sim : D.PROPERTIES.filter((x) => x.id !== p.id).slice(0, 3)).map(propCard).join("");
    $$("[data-lb]", host).forEach((im) => im.addEventListener("click", () => openLightbox(p.images.map((x) => sz(x, 1400)), +im.dataset.lb)));
    const ef = $("[data-enquiry]", host);
    ef.addEventListener("submit", (e) => { e.preventDefault(); toast("Viewing request sent — " + ag.name.split(" ")[0] + " will call you shortly.", "checkCircle"); ef.reset(); });
    const rb = $("[data-reserve]", host);
    if (rb && window.EstoPay) rb.addEventListener("click", () => window.EstoPay.open({
      amount: 2000, title: "Reserve: " + p.title, description: "Refundable viewing fee", type: "booking",
      accountRef: p.id, phone: (typeof localStorage !== "undefined" && localStorage.getItem("esto:phone")) || "",
      onSuccess: () => toast("Viewing reserved — " + ag.name.split(" ")[0] + " will confirm your slot.", "checkCircle")
    }));
    buildMortgage($("#mortgage"), p.price || 10000000);
    hydrateIcons(host); bindFavs(host);
    // animate trust bars
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { $$("[data-w]", host).forEach((i) => i.style.width = i.dataset.w + "%"); io.disconnect(); } }), { threshold: .2 });
    io.observe($(".trust-breakdown", host));
  }
  function buildMortgage(host, price) {
    if (!host) return; const state = { price, deposit: 20, rate: 13.5, years: 20 };
    function calc() { const loan = state.price * (1 - state.deposit / 100); const r = state.rate / 100 / 12; const n = state.years * 12; const m = r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n)); return { loan, m }; }
    function render() { const { loan, m } = calc();
      host.innerHTML = `
        <label class="field-hint">Deposit: <b>${state.deposit}%</b> (${D.fmtPrice(Math.round(state.price * state.deposit / 100))})</label>
        <input type="range" min="5" max="60" value="${state.deposit}" data-m="deposit" style="width:100%;accent-color:var(--brand)">
        <label class="field-hint">Interest rate: <b>${state.rate}%</b></label>
        <input type="range" min="8" max="20" step="0.5" value="${state.rate}" data-m="rate" style="width:100%;accent-color:var(--brand)">
        <label class="field-hint">Term: <b>${state.years} years</b></label>
        <input type="range" min="5" max="25" value="${state.years}" data-m="years" style="width:100%;accent-color:var(--brand)">
        <div style="margin-top:16px;padding:16px;border-radius:12px;background:var(--brand-050);text-align:center">
          <small style="color:var(--muted)">Estimated monthly repayment</small>
          <div style="font-family:var(--font-display);font-size:1.9rem;color:var(--brand);font-weight:800">${D.fmtPrice(Math.round(m))}<span style="font-size:.9rem">/mo</span></div>
          <small style="color:var(--muted)">Loan ${D.fmtPrice(Math.round(loan))} · illustrative only</small></div>`;
      $$("[data-m]", host).forEach((s) => s.addEventListener("input", () => { state[s.dataset.m] = +s.value; render(); }));
    }
    render();
  }
  function openLightbox(images, start = 0) {
    let i = start; const ov = document.createElement("div");
    ov.style.cssText = "position:fixed;inset:0;z-index:300;background:rgba(12,6,10,.95);display:grid;place-items:center;padding:30px";
    const draw = () => ov.innerHTML = `
      <button style="position:absolute;top:20px;right:24px;background:none;border:none;color:#fff" data-x>${I("close")}</button>
      <button style="position:absolute;left:20px;top:50%;background:rgba(255,255,255,.14);border:none;color:#fff;width:52px;height:52px;border-radius:50%;transform:rotate(180deg)" data-prev>${I("chevronRight")}</button>
      <img src="${images[i]}" style="max-width:92vw;max-height:82vh;border-radius:14px;object-fit:contain">
      <button style="position:absolute;right:20px;top:50%;background:rgba(255,255,255,.14);border:none;color:#fff;width:52px;height:52px;border-radius:50%" data-next>${I("chevronRight")}</button>
      <div style="position:absolute;bottom:24px;color:#fff;font-weight:600">${i + 1} / ${images.length}</div>`;
    const rr = () => { draw();
      $("[data-x]", ov).onclick = () => ov.remove();
      $("[data-prev]", ov).onclick = () => { i = (i - 1 + images.length) % images.length; rr(); };
      $("[data-next]", ov).onclick = () => { i = (i + 1) % images.length; rr(); }; };
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov); rr();
  }

  /* ---------- Agents page ---------- */
  function buildAgents() { const g = $("#agents-grid"); if (g) g.innerHTML = D.AGENTS.map(agentCard).join(""); }

  /* ---------- Video ---------- */
  function initVideo() {
    const wrap = $("[data-video]"); if (!wrap) return;
    const vid = $("video", wrap), poster = $(".video-poster", wrap);
    if (!vid || !poster) return;
    poster.addEventListener("click", () => { poster.style.display = "none"; vid.play(); vid.setAttribute("controls", ""); });
  }

  /* ---------- Contact form (posts to backend; graceful fallback) ---------- */
  const API_BASE = window.ESTO_API_BASE || (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? "http://localhost:5000" : "");
  function initForms() {
    const cf = $("[data-contact]");
    if (!cf) return;
    cf.addEventListener("submit", async (e) => {
      e.preventDefault();
      const a = $(".form-alert", cf);
      const btn = $("button[type=submit]", cf); const t = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      const fd = Object.fromEntries(new FormData(cf).entries());
      const done = (ok, msg) => { if (a) { a.className = "form-alert " + (ok ? "ok" : "err"); a.textContent = msg; } if (btn) { btn.disabled = false; btn.textContent = t; } if (ok) cf.reset(); };
      try {
        if (API_BASE) {
          const r = await fetch(API_BASE + "/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fd) });
          if (r.ok) return done(true, "Thank you — your message is with our team. We'll reply within one business day.");
        }
        throw new Error("no-backend");
      } catch (_) {
        done(true, "Thank you — your message has been received. We'll reply within one business day.");
      }
    });
  }

  /* ---------- PWA install ---------- */
  let deferredInstall = null;
  const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

  async function doInstall() {
    if (isStandalone()) { toast("Esto is already installed on this device.", "checkCircle"); return; }
    if (deferredInstall) {
      deferredInstall.prompt();
      const { outcome } = await deferredInstall.userChoice;
      deferredInstall = null;
      const b = $("#install-banner"); if (b) b.classList.remove("show");
      if (outcome === "accepted") toast("Installing Esto…", "download");
      return;
    }
    // No automatic prompt available → tell the user how
    if (isIOS()) toast("On iPhone: tap Share, then 'Add to Home Screen'.", "download");
    else toast("Open your browser menu (⋮) and choose 'Install app' / 'Add to Home screen'.", "download");
  }
  window.EstoInstall = doInstall;

  function initPWA() {
    if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));

    // wire every install affordance (footer, drawer, banner)
    const wire = () => $$("[data-install-app],[data-install]").forEach((b) => { if (b.dataset.bound) return; b.dataset.bound = "1"; b.addEventListener("click", (e) => { e.preventDefault(); doInstall(); }); });
    wire();

    const banner = $("#install-banner");
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault(); deferredInstall = e;
      document.body.classList.add("can-install");
      if (banner && !sessionStorage.getItem("esto:install-dismissed") && !isStandalone()) banner.classList.add("show");
    });
    window.addEventListener("appinstalled", () => { deferredInstall = null; document.body.classList.remove("can-install"); if (banner) banner.classList.remove("show"); toast("Esto installed. Find it on your home screen.", "checkCircle"); });
    if (banner) {
      const dis = $("[data-dismiss]", banner);
      if (dis) dis.addEventListener("click", () => { banner.classList.remove("show"); sessionStorage.setItem("esto:install-dismissed", "1"); });
    }
    // re-wire after header/footer inject
    setTimeout(wire, 300);
  }

  /* ---------- Boot ---------- */
  function boot() {
    renderHeader(); renderSocialRail(); renderFooter(); hydrateIcons();
    buildHome(); buildListings(); buildDetail(); buildAgents(); initVideo(); initForms();
    bindFavs(); initReveal(); initCounters(); initBackTop(); initPWA(); buildAuthModal();
    // open auth modal from ?auth=login&next=...
    const params = new URLSearchParams(location.search);
    if (params.get("auth")) openAuth(params.get("auth"), params.get("next") || null);
    if (A()) A().onChange(() => renderHeader());
  }
  window.EstoUI = { propCard, agentCard, testCard, hydrateIcons, bindFavs, toast, openAuth, trustRing };
  // legacy aliases used by dashboard
  window.NyRender = window.EstoUI; window.NyToast = toast; window.NyFavs = window.EstoFavs;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
