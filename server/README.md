# Esto server (M-Pesa + contact email)

A tiny Express backend that powers the parts a static site can't do safely:

- **M-Pesa Daraja STK Push** — prompts a customer's phone for their PIN to pay
  (booking/reservation fees, featured-listing boosts, Premium). Secrets stay on
  the server.
- **Contact email** — receives enquiries and (optionally) emails them.

The frontend works **without** this server too: if it can't reach the API it
falls back to a realistic demo payment so the UI is never broken. Run the server
to make payments real.

## Setup

```bash
cd server
cp .env.example .env      # then paste your Daraja Consumer Key & Secret into .env
npm install
npm start                 # http://localhost:5000
```

`.env` is git-ignored, so your keys never get committed.

## Point the frontend at it

By default the frontend calls `http://localhost:5000`. To change it, set this on
the page (e.g. in `index.html` before the other scripts) or your host's env:

```html
<script>window.ESTO_API_BASE = "https://your-api.onrender.com";</script>
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET  | `/api/health` | status + whether M-Pesa keys are present |
| POST | `/api/mpesa/stkpush` | `{ phone, amount, accountRef, description }` → triggers STK push |
| POST | `/api/mpesa/callback` | Daraja posts the payment result here |
| POST | `/api/contact` | `{ name, email, phone, topic, message }` → email/log |

## Notes on M-Pesa sandbox

- Get a Consumer Key/Secret from <https://developer.safaricom.co.ke> (create an app).
- Sandbox shortcode `174379` + the public test passkey are pre-filled.
- `MPESA_CALLBACK_URL` must be a public HTTPS URL. In development, expose your
  local server with `ngrok http 5000` and use that URL.
- Test with a sandbox phone number in the format `2547XXXXXXXX`.

## Deploy

Any Node host works (Render, Railway, Fly, Cloud Run). Set the same env vars
there, then set `window.ESTO_API_BASE` on the frontend to the deployed URL.
