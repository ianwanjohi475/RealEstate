# Nyumba — Verified Homes, Nairobi

A professional, installable real-estate web app built from scratch as a portfolio
project. Nyumba is a fictional-but-realistic Nairobi agency with a clear mission:
**end ghost listings, fake adverts and hidden broker fees** by only marketing homes
that have been *physically inspected and title-checked*.

> Live demo brand · Buy · Rent · Invest · Progressive Web App · Firebase Auth

---

## Highlights

- **Bespoke design system** — deep-forest + champagne-gold luxury palette, `Fraunces`
  display serif paired with `Plus Jakarta Sans`, custom SVG icon set (no emojis, no
  icon-font dependency), scroll-reveal animations, animated counters, marquee and a
  video showreel section.
- **8 fully-built pages** — Home, Properties (live filtering + sort + grid/list),
  Property detail (gallery lightbox, map, amenities, **live mortgage calculator**,
  enquiry form), Agents, About, Contact (map + form), Login, Signup and a
  **professional Dashboard** (KPIs, chart, saved homes, viewings, market insight,
  messages, settings).
- **Firebase Authentication** — email/password + Google sign-in. Ships with a
  self-contained **demo mode** so the app is fully clickable before you add keys.
- **Installable PWA** — web manifest, maskable icons, offline service worker
  (app-shell cache-first, network-first navigation, stale-while-revalidate images)
  and an in-app install prompt.
- **Nairobi-real content** — Karen, Kilimani, Westlands, Runda, Lavington,
  Kileleshwa, Kitisuru, Nyari, Syokimau, Ruaka; KES pricing; EARB-style licensing.
- **Zero build step** — pure HTML/CSS/vanilla JS. Just serve the folder.

---

## Run it locally

Any static file server works. For example:

```bash
# Python (already available on most machines)
python3 -m http.server 8080

# or Node
npx serve .
```

Then open <http://localhost:8080>.

> The service worker and "Add to home screen" require `http://localhost` or HTTPS —
> opening `index.html` via `file://` will still render the site but PWA features stay off.

---

## Connect the real Firebase project (2 minutes)

The project is pre-wired to **RealEstate** (`realestate-17867`). To switch from demo
mode to live auth:

1. Open the console →
   <https://console.firebase.google.com/project/realestate-17867/overview>
2. **Project settings** → **Your apps** → add/select a **Web app**.
3. Copy the `apiKey` and `appId` into `assets/js/firebase-config.js`
   (replace the two `REPLACE_ME_...` placeholders). The other values are already set.
4. **Build → Authentication → Sign-in method**: enable **Email/Password** and **Google**.
5. **Authentication → Settings → Authorized domains**: add your hosting domain
   (and `localhost` for testing).

That's it — signup, login and Google sign-in now use Firebase. No other code changes.

| Config value | Status |
|---|---|
| `projectId` | `realestate-17867` ✅ |
| `authDomain` | `realestate-17867.firebaseapp.com` ✅ |
| `storageBucket` | `realestate-17867.appspot.com` ✅ |
| `messagingSenderId` | `626024295803` ✅ |
| `apiKey` | add from console |
| `appId` | add from console |

---

## Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting     # uses the included firebase.json / .firebaserc
```

The site deploys to `https://realestate-17867.web.app`.

---

## Project structure

```
.
├── index.html            # Landing page
├── properties.html       # Listings with live filters
├── property.html         # Single property (?id=nyum-001)
├── agents.html           # Team
├── about.html            # Story + verification promise
├── contact.html          # Contact form + map
├── login.html            # Firebase / demo login
├── signup.html           # Firebase / demo signup
├── dashboard.html        # Authenticated dashboard
├── manifest.webmanifest  # PWA manifest
├── sw.js                 # Service worker
├── firebase.json         # Hosting config
├── .firebaserc           # Project alias
└── assets/
    ├── css/styles.css     # Full design system
    ├── js/
    │   ├── data.js        # Listings, agents, testimonials
    │   ├── icons.js       # Inline SVG icon set
    │   ├── firebase-config.js
    │   ├── auth.js        # Firebase + demo auth
    │   └── main.js        # Chrome, rendering, PWA, interactions
    ├── icons/             # Favicon + PWA icons
    ├── img/               # Pattern
    └── video/             # Showreel
```

---

## Contact (portfolio)

- **Phone / WhatsApp:** 0758 950 370
- **Email:** ianwanjohi475@gmail.com

Built by **Ian Wanjohi**. Images courtesy of Unsplash. Maps by OpenStreetMap.
This is a portfolio demonstration — the agency, listings and reviews are illustrative.
