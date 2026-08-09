/* ============================================================
   ESTO — service worker (PWA)
   Network-first for app code (HTML/CSS/JS) so updates show
   immediately; cache-first only for icons; stale-while-
   revalidate for remote images. Never touches Firebase/maps.
   ============================================================ */
const VERSION = "esto-v3.1.0";
const CODE = `${VERSION}-code`;
const IMG = `${VERSION}-img`;
const PRECACHE = ["index.html", "assets/css/styles.css", "assets/js/main.js", "manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CODE).then((c) => c.addAll(PRECACHE)).catch(() => {}).then(() => self.skipWaiting()));
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

  // Never intercept Firebase / auth / analytics / maps
  if (/googleapis|gstatic\/firebasejs|firebaseio|firestore|identitytoolkit|openstreetmap|google-analytics|safaricom/.test(url.href)) return;

  // Remote images: stale-while-revalidate
  if (url.hostname.includes("images.unsplash.com") || url.hostname.includes("images.pexels.com")) {
    e.respondWith(caches.open(IMG).then(async (cache) => {
      const cached = await cache.match(req);
      const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => cached);
      return cached || net;
    }));
    return;
  }

  // Same-origin app code + navigations: NETWORK-FIRST (fresh on every deploy)
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CODE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req).then((r) => r || (req.mode === "navigate" ? caches.match("index.html") : undefined)))
    );
  }
});
