# Esto — Real Estate, Made Certain

A professional, installable real-estate web app built from scratch as a portfolio
project. **Esto** is a Nairobi property platform with one unique idea at its core:

> **The Esto TrustScore** — every listing is scored 0–100 as the average of four
> independent checks (title & ownership, physical inspection, price fairness, and
> agent record) *before* it is ever shown to you. No ghost listings, no fake photos,
> no hidden broker fees.

Maroon theme · light **and** dark mode · Firebase auth · PWA · Nairobi-focused.

---

## Highlights

- **Bespoke maroon design system** with full **light + dark mode** (persisted, respects
  system preference), `Sora` display + `Plus Jakarta Sans` body, a custom SVG icon set
  (no emojis), floating pill navigation, gradient hero, scroll-reveal + counter
  animations, marquee, and a video showreel.
- **The TrustScore** — a signature widget: a conic-gradient ring on every property
  card and a full four-factor breakdown on each detail page.
- **8 pages** — Home, Properties (live filter/sort incl. *Highest TrustScore*),
  Property detail (gallery + lightbox, TrustScore breakdown, map, live mortgage
  calculator, enquiry), Agents, About (how TrustScore works), Contact, and a
  redesigned **Dashboard** (KPI cards with sparklines, bar chart, donut, saved homes,
  viewings, market insight, messages, settings with a theme switch).
- **Real Firebase Authentication** — email/password + Google, wired to project
  `realestate-17867`, plus Analytics. A slide-in **Login / Register modal** (matching
  modern real-estate templates) handles auth site-wide.
- **Installable PWA** — manifest, maskable icons, offline service worker, install prompt.
- **Mixed real image sources** (Pexels + Unsplash CDNs) with a branded graceful
  fallback if any image fails to load.

---

## Firebase — it's live

`assets/js/firebase-config.js` already contains the project's public web config
(`realestate-17867`). To finish enabling sign-in:

1. Firebase Console → **Build → Authentication → Sign-in method** → enable
   **Email/Password** (and **Google** for the Google button).
2. **Authentication → Settings → Authorized domains** → add your hosting domain and
   `localhost`.

That's all — signup, login and Google sign-in then run against Firebase. If the
Firebase SDK can't load (e.g. offline), the app automatically falls back to a local
demo auth so the portfolio is never broken.

---

## Run locally

```bash
python3 -m http.server 8080     # then open http://localhost:8080
```

PWA install + service worker require `http://localhost` or HTTPS.

## Deploy (Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting        # config in firebase.json / .firebaserc
```

Deploys to `https://realestate-17867.web.app`.

---

## Structure

```
index · properties · property · agents · about · contact · dashboard   (pages)
login/signup  → redirect into the auth modal
assets/css/styles.css        design system + light/dark themes
assets/js/data.js            listings, agents, TrustScores, categories
assets/js/icons.js           inline SVG icon set
assets/js/firebase-config.js live Firebase config
assets/js/auth.js            Firebase auth (+ demo fallback)
assets/js/main.js            chrome, theme, auth modal, rendering, PWA
assets/video/esto-showreel.mp4
manifest.webmanifest · sw.js · firebase.json
```

## Real-time features & payments

- **Dark / light mode** everywhere, with a wordmark **Esto.** logo and a fully
  responsive floating navbar (mobile slide-in drawer).
- **Dashboard** is fully functional: real-time **chat** with agents (auto-replies,
  syncs across browser tabs), a **notifications** dropdown, working **search**,
  **market insight** with live-updating figures, and **settings** that persist.
- **M-Pesa payments** (Safaricom Daraja STK Push) power how Esto earns — viewing
  **booking fees**, **Premium/Investor subscriptions**, wallet **top-ups** and
  **featured-listing** boosts. See [`server/`](server/README.md).
  - The frontend calls the Node server in [`server/`](server/); if it's not
    running it falls back to a realistic demo so the UI always works.
  - Point the frontend at a deployed API with
    `<script>window.ESTO_API_BASE="https://your-api"</script>`.
  - **Secrets live only in `server/.env`** (git-ignored) — copy
    `server/.env.example` and paste your Daraja keys there.
- **Contact form / email** posts to the server's `/api/contact` (nodemailer),
  falling back to a success acknowledgement when no backend/SMTP is set.

## Contact (portfolio)

- **Phone / WhatsApp:** 0758 950 370
- **Email:** ianwanjohi475@gmail.com

Built by **Ian Wanjohi**. Photos: Pexels & Unsplash. Maps: OpenStreetMap.
The agency, listings and reviews are illustrative for portfolio purposes.
