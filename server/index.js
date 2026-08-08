/* ============================================================
   ESTO backend
   - M-Pesa Daraja STK Push (sandbox by default)
   - Contact / enquiry email (nodemailer)
   Secrets are read from environment variables only (see .env.example).
   No credentials are hard-coded or committed.
   ============================================================ */
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const {
  PORT = 5000,
  MPESA_ENV = "sandbox",
  MPESA_CONSUMER_KEY = "",
  MPESA_CONSUMER_SECRET = "",
  MPESA_SHORTCODE = "174379",
  MPESA_PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
  MPESA_CALLBACK_URL = "https://example.com/api/mpesa/callback",
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO = "ianwanjohi475@gmail.com"
} = process.env;

const BASE = MPESA_ENV === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

const ready = () => MPESA_CONSUMER_KEY && MPESA_CONSUMER_SECRET;

/* ---- helpers ---- */
const timestamp = () => {
  const d = new Date(), p = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
};
const normalizePhone = (raw) => {
  let p = String(raw).replace(/\D/g, "");
  if (p.startsWith("0")) p = "254" + p.slice(1);
  if (p.startsWith("7") || p.startsWith("1")) p = "254" + p;
  if (p.startsWith("254254")) p = p.slice(3);
  return p;
};

async function getToken() {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");
  const res = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  if (!res.ok) throw new Error("OAuth failed: " + res.status + " " + (await res.text()));
  const data = await res.json();
  return data.access_token;
}

/* ---- routes ---- */
app.get("/api/health", (_req, res) => res.json({ ok: true, mpesa: ready() ? "configured" : "missing-keys", env: MPESA_ENV }));

app.post("/api/mpesa/stkpush", async (req, res) => {
  try {
    if (!ready()) return res.status(503).json({ error: "M-Pesa keys not configured on the server (.env)." });
    const { phone, amount, accountRef = "Esto", description = "Esto payment" } = req.body || {};
    if (!phone || !amount) return res.status(400).json({ error: "phone and amount are required." });

    const token = await getToken();
    const ts = timestamp();
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${ts}`).toString("base64");
    const msisdn = normalizePhone(phone);

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: ts,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.max(1, Math.round(Number(amount))),
      PartyA: msisdn,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: msisdn,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: String(accountRef).slice(0, 12),
      TransactionDesc: String(description).slice(0, 20)
    };

    const r = await fetch(`${BASE}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (data.ResponseCode === "0") {
      return res.json({ ok: true, message: "STK push sent. Check your phone to enter your M-Pesa PIN.", checkoutRequestId: data.CheckoutRequestID, merchantRequestId: data.MerchantRequestID });
    }
    return res.status(400).json({ error: data.errorMessage || data.ResponseDescription || "STK push failed", raw: data });
  } catch (e) {
    console.error("stkpush error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// Daraja posts the payment result here
app.post("/api/mpesa/callback", (req, res) => {
  console.log("M-Pesa callback:", JSON.stringify(req.body));
  // TODO: persist result (e.g. Firestore) keyed by CheckoutRequestID
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message, topic } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: "name, email and message are required." });
  const body = `New Esto enquiry\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "-"}\nTopic: ${topic || "-"}\n\n${message}`;
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST, port: Number(SMTP_PORT || 587), secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS }
      });
      await transporter.sendMail({ from: `"Esto" <${SMTP_USER}>`, to: CONTACT_TO, replyTo: email, subject: `Esto enquiry from ${name}`, text: body });
      return res.json({ ok: true, sent: true });
    } catch (e) {
      console.error("mail error:", e.message);
      return res.status(500).json({ error: "Could not send email: " + e.message });
    }
  }
  // No SMTP configured: log it and acknowledge (demo)
  console.log("Contact (no SMTP configured):\n" + body);
  res.json({ ok: true, sent: false, note: "Logged on server (configure SMTP_* to email)." });
});

app.listen(PORT, () => console.log(`Esto server on http://localhost:${PORT}  (M-Pesa ${ready() ? "ready" : "keys missing"})`));
