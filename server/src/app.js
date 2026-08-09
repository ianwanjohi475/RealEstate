/* Esto API — auth (JWT), chat (REST + Socket.io), saved, viewings,
   notifications, M-Pesa, contact. */
import express from "express";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import { OAuth2Client } from "google-auth-library";
import { User, Message, Notification, Saved, Viewing, Payment, threadId } from "./models.js";

const AGENTS = [
  { key: "wanjiru-kamau", name: "Wanjiru Kamau", email: "wanjiru@esto.co.ke", title: "Principal Agent · Karen & Runda" },
  { key: "brian-otieno", name: "Brian Otieno", email: "brian@esto.co.ke", title: "Senior Agent · Westlands & Riverside" },
  { key: "aisha-mohamed", name: "Aisha Mohamed", email: "aisha@esto.co.ke", title: "Lettings Lead · Kilimani & Kileleshwa" },
  { key: "david-mwangi", name: "David Mwangi", email: "david@esto.co.ke", title: "Land & New Homes · Kiambu Road" },
  { key: "grace-njeri", name: "Grace Njeri", email: "grace@esto.co.ke", title: "Buyer's Advisor · Lavington" },
  { key: "samuel-kiptoo", name: "Samuel Kiptoo", email: "samuel@esto.co.ke", title: "Commercial & Investment" }
];

export async function seedAgents() {
  const pass = await bcrypt.hash(process.env.AGENT_PASSWORD || "agent123", 10);
  for (const a of AGENTS) {
    await User.updateOne(
      { email: a.email },
      { $setOnInsert: { name: a.name, email: a.email, passwordHash: pass, role: "agent", title: a.title } },
      { upsert: true }
    );
  }
}

export function createApp(env = process.env) {
  const JWT_SECRET = env.JWT_SECRET || "esto-dev-secret-change-me";
  const app = express();
  app.use(cors());
  app.use(express.json());

  const sign = (u) => jwt.sign({ id: String(u._id), role: u.role }, JWT_SECRET, { expiresIn: "30d" });
  const authOptional = (req, _res, next) => {
    const h = req.headers.authorization || "";
    const t = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (t) { try { req.user = jwt.verify(t, JWT_SECRET); } catch (e) {} }
    next();
  };
  const auth = (req, res, next) => { authOptional(req, res, () => req.user ? next() : res.status(401).json({ error: "Sign in required." })); };
  app.use(authOptional);

  const server = http.createServer(app);
  const io = new IOServer(server, { cors: { origin: "*" } });
  io.use((socket, next) => {
    try { const t = socket.handshake.auth && socket.handshake.auth.token; socket.userId = jwt.verify(t, JWT_SECRET).id; next(); }
    catch (e) { next(new Error("unauthorized")); }
  });
  io.on("connection", (socket) => {
    socket.join(String(socket.userId));
    socket.on("message:send", async ({ to, text }, ack) => {
      try {
        const msg = await saveMessage(socket.userId, to, text, io);
        ack && ack({ ok: true, message: msg });
      } catch (e) { ack && ack({ ok: false, error: e.message }); }
    });
    socket.on("typing", ({ to }) => io.to(String(to)).emit("typing", { from: socket.userId }));
  });

  async function saveMessage(from, to, text, io) {
    if (!text || !to) throw new Error("to and text required");
    const doc = await Message.create({ threadId: threadId(from, to), from, to, text });
    const payload = { id: doc._id, threadId: doc.threadId, from: String(from), to: String(to), text: doc.text, at: doc.at };
    io.to(String(from)).to(String(to)).emit("message:new", payload);
    // notify recipient
    const sender = await User.findById(from).lean();
    const note = await Notification.create({ user: to, ico: "message", title: (sender ? sender.name.split(" ")[0] : "Someone") + " messaged you", body: text.slice(0, 60) });
    io.to(String(to)).emit("notification:new", { id: note._id, ico: note.ico, title: note.title, body: note.body, at: note.at, read: false });
    return payload;
  }

  /* ---------- health & public config ---------- */
  app.get("/api/health", (_req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1, ts: Date.now() }));
  app.get("/api/config", (_req, res) => res.json({ googleClientId: env.GOOGLE_CLIENT_ID || null, mpesa: !!(env.MPESA_CONSUMER_KEY && env.MPESA_CONSUMER_SECRET) }));

  /* ---------- Google sign-in (verifies Google token, issues our JWT) ---------- */
  const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;
  app.post("/api/auth/google", async (req, res) => {
    try {
      if (!googleClient) return res.status(501).json({ error: "Google sign-in isn't configured on the server. Set GOOGLE_CLIENT_ID in server/.env." });
      const { credential } = req.body || {};
      if (!credential) return res.status(400).json({ error: "Missing Google credential." });
      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.GOOGLE_CLIENT_ID });
      const p = ticket.getPayload();
      if (!p || !p.email) return res.status(401).json({ error: "Could not verify Google account." });
      const email = p.email.toLowerCase();
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ name: p.name || email.split("@")[0], email, photo: p.picture, role: "user" });
        await Notification.create({ user: user._id, ico: "verified", title: "Welcome to Esto", body: "Signed in with Google — start exploring verified homes." });
      } else if (p.picture && !user.photo) { user.photo = p.picture; await user.save(); }
      res.json({ token: sign(user), user: user.public() });
    } catch (e) { res.status(401).json({ error: "Google sign-in failed: " + e.message }); }
  });

  /* ---------- auth ---------- */
  app.post("/api/auth/register", async (req, res) => {
    try {
      let { name, email, password } = req.body || {};
      if (!name || !email || !password) return res.status(400).json({ error: "name, email and password are required." });
      email = String(email).toLowerCase().trim();
      if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });
      if (await User.findOne({ email })) return res.status(409).json({ error: "An account with that email already exists." });
      const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10) });
      await Notification.create({ user: user._id, ico: "verified", title: "Welcome to Esto", body: "Your account is ready — start exploring verified homes." });
      res.json({ token: sign(user), user: user.public() });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });
  app.post("/api/auth/login", async (req, res) => {
    try {
      let { email, password } = req.body || {};
      email = String(email || "").toLowerCase().trim();
      const user = await User.findOne({ email });
      if (!user || !user.passwordHash || !(await bcrypt.compare(password || "", user.passwordHash)))
        return res.status(401).json({ error: "Incorrect email or password." });
      res.json({ token: sign(user), user: user.public() });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });
  app.get("/api/me", auth, async (req, res) => {
    const u = await User.findById(req.user.id); if (!u) return res.status(404).json({ error: "not found" });
    res.json({ user: u.public() });
  });
  app.patch("/api/me", auth, async (req, res) => {
    const { name, phone } = req.body || {};
    const u = await User.findByIdAndUpdate(req.user.id, { $set: { ...(name && { name }), ...(phone && { phone }) } }, { new: true });
    res.json({ user: u.public() });
  });

  /* ---------- agents (public) ---------- */
  app.get("/api/agents", async (_req, res) => {
    const list = await User.find({ role: "agent" }).lean();
    res.json({ agents: list.map((a) => ({ id: a._id, name: a.name, title: a.title, photo: a.photo })) });
  });

  /* ---------- saved homes ---------- */
  app.get("/api/saved", auth, async (req, res) => res.json({ saved: (await Saved.find({ user: req.user.id }).lean()).map((s) => s.propertyId) }));
  app.post("/api/saved", auth, async (req, res) => {
    const { propertyId } = req.body || {}; if (!propertyId) return res.status(400).json({ error: "propertyId required" });
    await Saved.updateOne({ user: req.user.id, propertyId }, { $setOnInsert: { at: new Date() } }, { upsert: true });
    res.json({ ok: true });
  });
  app.delete("/api/saved/:propertyId", auth, async (req, res) => { await Saved.deleteOne({ user: req.user.id, propertyId: req.params.propertyId }); res.json({ ok: true }); });

  /* ---------- viewings ---------- */
  app.get("/api/viewings", auth, async (req, res) => res.json({ viewings: await Viewing.find({ user: req.user.id }).sort({ at: -1 }).lean() }));
  app.post("/api/viewings", auth, async (req, res) => {
    const v = await Viewing.create({ user: req.user.id, ...req.body });
    await Notification.create({ user: req.user.id, ico: "calendar", title: "Viewing requested", body: (req.body.title || "A property") + " — we'll confirm shortly." });
    res.json({ viewing: v });
  });

  /* ---------- notifications ---------- */
  app.get("/api/notifications", auth, async (req, res) => res.json({ notifications: await Notification.find({ user: req.user.id }).sort({ at: -1 }).limit(40).lean() }));
  app.post("/api/notifications/read-all", auth, async (req, res) => { await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } }); res.json({ ok: true }); });

  /* ---------- messages ---------- */
  app.get("/api/messages/threads", auth, async (req, res) => {
    const me = req.user.id;
    const msgs = await Message.find({ $or: [{ from: me }, { to: me }] }).sort({ at: 1 }).lean();
    const byOther = {};
    for (const m of msgs) { const other = String(m.from) === me ? String(m.to) : String(m.from); (byOther[other] = byOther[other] || []).push(m); }
    const others = await User.find({ _id: { $in: Object.keys(byOther) } }).lean();
    const threads = others.map((u) => {
      const arr = byOther[String(u._id)]; const last = arr[arr.length - 1];
      const unread = arr.filter((m) => String(m.to) === me && !m.read).length;
      return { user: { id: u._id, name: u.name, title: u.title, photo: u.photo }, last: { text: last.text, at: last.at, from: String(last.from) }, unread, at: last.at };
    }).sort((a, b) => new Date(b.at) - new Date(a.at));
    res.json({ threads });
  });
  app.get("/api/messages/:otherId", auth, async (req, res) => {
    const me = req.user.id, other = req.params.otherId;
    const msgs = await Message.find({ threadId: threadId(me, other) }).sort({ at: 1 }).lean();
    await Message.updateMany({ threadId: threadId(me, other), to: me, read: false }, { $set: { read: true } });
    res.json({ messages: msgs.map((m) => ({ id: m._id, from: String(m.from), to: String(m.to), text: m.text, at: m.at, mine: String(m.from) === me })) });
  });
  app.post("/api/messages", auth, async (req, res) => {
    try { const { to, text } = req.body || {}; const m = await saveMessage(req.user.id, to, text, io); res.json({ message: m }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  });

  /* ---------- M-Pesa (Daraja STK Push) ---------- */
  const MP = {
    env: env.MPESA_ENV || "sandbox",
    key: env.MPESA_CONSUMER_KEY || "", secret: env.MPESA_CONSUMER_SECRET || "",
    shortcode: env.MPESA_SHORTCODE || "174379",
    passkey: env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    cb: env.MPESA_CALLBACK_URL || "https://example.com/api/mpesa/callback"
  };
  const MP_BASE = MP.env === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
  const ts = () => { const d = new Date(), p = (n) => String(n).padStart(2, "0"); return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()); };
  const norm = (raw) => { let x = String(raw).replace(/\D/g, ""); if (x.startsWith("0")) x = "254" + x.slice(1); if (x.startsWith("7") || x.startsWith("1")) x = "254" + x; return x; };
  async function mpToken() {
    const a = Buffer.from(`${MP.key}:${MP.secret}`).toString("base64");
    const r = await fetch(`${MP_BASE}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${a}` } });
    if (!r.ok) throw new Error("M-Pesa OAuth failed: " + r.status); return (await r.json()).access_token;
  }
  app.post("/api/mpesa/stkpush", authOptional, async (req, res) => {
    try {
      if (!MP.key || !MP.secret) return res.status(503).json({ error: "M-Pesa keys not configured on the server (.env)." });
      const { phone, amount, accountRef = "Esto", description = "Esto payment" } = req.body || {};
      if (!phone || !amount) return res.status(400).json({ error: "phone and amount required." });
      const token = await mpToken(); const t = ts();
      const password = Buffer.from(`${MP.shortcode}${MP.passkey}${t}`).toString("base64"); const msisdn = norm(phone);
      const r = await fetch(`${MP_BASE}/mpesa/stkpush/v1/processrequest`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ BusinessShortCode: MP.shortcode, Password: password, Timestamp: t, TransactionType: "CustomerPayBillOnline", Amount: Math.max(1, Math.round(+amount)), PartyA: msisdn, PartyB: MP.shortcode, PhoneNumber: msisdn, CallBackURL: MP.cb, AccountReference: String(accountRef).slice(0, 12), TransactionDesc: String(description).slice(0, 20) })
      });
      const data = await r.json();
      if (data.ResponseCode === "0") {
        if (req.user) await Payment.create({ user: req.user.id, type: "stk", amount: +amount, ref: accountRef, phone: msisdn, checkoutRequestId: data.CheckoutRequestID });
        return res.json({ ok: true, message: "STK push sent. Enter your M-Pesa PIN on your phone.", checkoutRequestId: data.CheckoutRequestID });
      }
      res.status(400).json({ error: data.errorMessage || data.ResponseDescription || "STK push failed", raw: data });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });
  app.post("/api/mpesa/callback", (req, res) => { console.log("M-Pesa callback:", JSON.stringify(req.body)); res.json({ ResultCode: 0, ResultDesc: "Accepted" }); });

  // Confirm the real result of an STK push (so we never claim "paid" falsely)
  app.post("/api/mpesa/query", async (req, res) => {
    try {
      if (!MP.key || !MP.secret) return res.status(503).json({ error: "M-Pesa keys not configured." });
      const { checkoutRequestId } = req.body || {};
      if (!checkoutRequestId) return res.status(400).json({ error: "checkoutRequestId required." });
      const token = await mpToken(); const t = ts();
      const password = Buffer.from(`${MP.shortcode}${MP.passkey}${t}`).toString("base64");
      const r = await fetch(`${MP_BASE}/mpesa/stkpushquery/v1/query`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ BusinessShortCode: MP.shortcode, Password: password, Timestamp: t, CheckoutRequestID: checkoutRequestId })
      });
      const data = await r.json();
      // ResultCode "0" = success; "1032" = cancelled; else pending/failed. errorCode present => still processing.
      res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  /* ---------- contact ---------- */
  app.post("/api/contact", async (req, res) => {
    const { name, email, phone, message, topic } = req.body || {};
    if (!name || !email || !message) return res.status(400).json({ error: "name, email and message are required." });
    const body = `New Esto enquiry\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "-"}\nTopic: ${topic || "-"}\n\n${message}`;
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      try {
        const tx = nodemailer.createTransport({ host: env.SMTP_HOST, port: +(env.SMTP_PORT || 587), secure: +env.SMTP_PORT === 465, auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } });
        await tx.sendMail({ from: `"Esto" <${env.SMTP_USER}>`, to: env.CONTACT_TO || "ianwanjohi475@gmail.com", replyTo: email, subject: `Esto enquiry from ${name}`, text: body });
        return res.json({ ok: true, sent: true });
      } catch (e) { return res.status(500).json({ error: "Could not send email: " + e.message }); }
    }
    console.log("Contact (no SMTP):\n" + body); res.json({ ok: true, sent: false });
  });

  return { app, server, io };
}
