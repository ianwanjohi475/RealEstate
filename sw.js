/* ============================================================
   ESTO — service worker (PWA offline support)
   ============================================================ */
const VERSION = "esto-v2.0.0";
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;

const SHELL_ASSETS = [
  "index.html", "properties.html", "property.html", "agents.html", "about.html",
  "contact.html", "dashboard.html",
  "assets/css/styles.css",
  "assets/js/data.js", "assets/js/icons.js", "assets/js/main.js",
  "assets/js/auth.js", "assets/js/firebase-config.js",
  "assets/icons/favicon.svg", "assets/icons/icon-192.png", "assets/icons/icon-512.png",
  "manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // never intercept Firebase / auth / maps
  if (/googleapis|gstatic\/firebasejs|firebaseio|identitytoolkit|openstreetmap|google-analytics/.test(url.href)) return;
  // remote images: stale-while-revalidate
  if (url.hostname.includes("images.unsplash.com") || url.hostname.includes("images.pexels.com")) {
    e.respondWith(caches.open(RUNTIME).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => cached);
      return cached || network;
    }));
    return;
  }
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((res) => { const c = res.clone(); caches.open(RUNTIME).then((x) => x.put(req, c)); return res; })
      .catch(() => caches.match(req).then((r) => r || caches.match("index.html"))));
    return;
  }
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(req).then((cached) => cached || fetch(req).then((res) => { const c = res.clone(); caches.open(RUNTIME).then((x) => x.put(req, c)); return res; })));
  }
});
