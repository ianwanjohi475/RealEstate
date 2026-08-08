/* ============================================================
   ESTO — real-time layer (chat + notifications)
   Backed by Cloud Firestore when a Firebase user is signed in
   (data stored in YOUR database, live across devices), with a
   localStorage + BroadcastChannel fallback for demo/offline.
     window.EstoChat   — threads(), messages(), send(), markRead(), onChange(), agents()
     window.EstoNotify — list(), add(), unread(), markAllRead(), onChange()
   ============================================================ */
(function () {
  "use strict";
  const D = window.ESTO;
  const now = () => Date.now();
  const AGENTS = () => (D && D.AGENTS ? D.AGENTS.slice(0, 4) : []);

  // ---- shared in-memory caches (read synchronously by the UI) ----
  let notifCache = [];
  let chatCache = {};           // { agentId: [ {from,text,at,seen,_id} ] }
  let mode = "local";           // "local" | "firestore"

  // ---- change buses (support cross-tab sync in local mode) ----
  const bc = ("BroadcastChannel" in window) ? new BroadcastChannel("esto-rt") : null;
  function makeBus(tag) {
    const subs = new Set();
    const emit = () => subs.forEach((cb) => { try { cb(); } catch (e) {} });
    if (bc) bc.addEventListener("message", (e) => { if (e.data === tag) emit(); });
    window.addEventListener("storage", (e) => { if (e.key === tag) emit(); });
    return { subs, emit, ping() { emit(); if (bc) bc.postMessage(tag); } };
  }
  const nBus = makeBus("esto:notifs");
  const cBus = makeBus("esto:chat");

  const REPLIES = [
    "Great question — let me confirm and get right back to you.",
    "Yes, that property is verified and available. Want to book a viewing?",
    "I can share the title documents and the full inspection report.",
    "The price is negotiable within reason — shall I put in an offer for you?",
    "Absolutely, I'll send over a few similar options in your budget.",
    "You can pay the small reservation fee via M-Pesa to hold it."
  ];
  const reply = () => REPLIES[Math.floor(Math.random() * REPLIES.length)];

  /* =====================================================
     LOCAL backend (default)
     ===================================================== */
  const NKEY = "esto:notifs", CKEY = "esto:chat";
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  function localSeed() {
    if (!load(NKEY, null)) save(NKEY, [
      { id: "n1", ico: "verified", title: "New verified listing", body: "Sky Villa Penthouse in Kilimani · TrustScore 94", at: now() - 2 * 36e5, read: false },
      { id: "n2", ico: "calendar", title: "Viewing confirmed", body: "Ambassadorial Villa, Karen · Sat 10:00am", at: now() - 6 * 36e5, read: false },
      { id: "n3", ico: "message", title: "Wanjiru replied", body: "Happy to arrange that viewing.", at: now() - 26 * 36e5, read: true }
    ]);
    if (!load(CKEY, null)) {
      const first = AGENTS()[0]; const seed = {};
      if (first) seed[first.id] = [
        { from: "them", text: "Hi! Thanks for your interest in the Karen villa — happy to help.", at: now() - 3 * 36e5, seen: false },
        { from: "them", text: "Would a Saturday viewing at 10am work for you?", at: now() - 3 * 36e5 + 60000, seen: false }
      ];
      save(CKEY, seed);
    }
  }
  function localRefresh() { notifCache = load(NKEY, []); chatCache = load(CKEY, {}); }

  const local = {
    addNotif(n) { const a = load(NKEY, []); a.unshift(Object.assign({ id: "n_" + now(), at: now(), read: false, ico: "bell" }, n)); save(NKEY, a.slice(0, 40)); localRefresh(); nBus.ping(); },
    markAllRead() { save(NKEY, load(NKEY, []).map((n) => ({ ...n, read: true }))); localRefresh(); nBus.ping(); },
    markChatRead(id) { const s = load(CKEY, {}); if (s[id]) { s[id] = s[id].map((m) => ({ ...m, seen: true })); save(CKEY, s); localRefresh(); cBus.ping(); } },
    send(id, text) {
      const s = load(CKEY, {}); s[id] = s[id] || []; s[id].push({ from: "me", text, at: now(), seen: true }); save(CKEY, s); localRefresh(); cBus.ping();
      setTimeout(() => {
        const s2 = load(CKEY, {}); s2[id] = s2[id] || []; s2[id].push({ from: "them", text: reply(), at: now(), seen: false }); save(CKEY, s2); localRefresh(); cBus.ping();
        const ag = (D.AGENTS || []).find((a) => a.id === id);
        local.addNotif({ ico: "message", title: (ag ? ag.name.split(" ")[0] : "Agent") + " replied", body: "New message in your chat" });
      }, 1400 + Math.random() * 1800);
    }
  };
  // keep caches live when localStorage changes in another tab
  nBus.subs.add(localRefresh); cBus.subs.add(localRefresh);
  localSeed(); localRefresh();

  /* =====================================================
     FIRESTORE backend (when signed in with Firebase)
     ===================================================== */
  let fb = null, uid = null, unsubN = null, unsubM = null, seededN = false, seededM = false;
  function fsPaths() {
    const { collection } = fb.fx; const db = fb.db;
    return {
      notifs: collection(db, `users/${uid}/notifications`),
      msgs: collection(db, `users/${uid}/messages`)
    };
  }
  async function fsSeed() {
    const { addDoc } = fb.fx; const P = fsPaths(); const first = AGENTS()[0];
    try {
      if (!seededN) { seededN = true;
        await addDoc(P.notifs, { ico: "verified", title: "Welcome to Esto", body: "Your account is ready — start exploring verified homes.", at: now(), read: false });
      }
      if (!seededM && first) { seededM = true;
        await addDoc(P.msgs, { threadId: first.id, from: "them", text: "Hi! I'm " + first.name.split(" ")[0] + ". Happy to help you find a verified home — what are you looking for?", at: now(), seen: false });
      }
    } catch (e) { /* rules may block until enabled */ }
  }
  function activateFirestore(_fb) {
    const u = _fb && _fb.uid && _fb.uid();
    if (!u) return;                 // no signed-in user yet
    if (mode === "firestore" && uid === u) return;
    fb = _fb; uid = u; mode = "firestore";
    // drop local cross-tab mirroring; Firestore is source of truth
    nBus.subs.delete(localRefresh); cBus.subs.delete(localRefresh);
    if (unsubN) unsubN(); if (unsubM) unsubM();
    const { query, orderBy, onSnapshot } = fb.fx; const P = fsPaths();
    try {
      unsubN = onSnapshot(query(P.notifs, orderBy("at", "desc")), (snap) => {
        notifCache = snap.docs.map((d) => Object.assign({ _id: d.id }, d.data()));
        if (snap.empty) fsSeed(); nBus.emit();
      }, () => {});
      unsubM = onSnapshot(query(P.msgs, orderBy("at", "asc")), (snap) => {
        const c = {}; snap.forEach((d) => { const m = Object.assign({ _id: d.id }, d.data()); (c[m.threadId] = c[m.threadId] || []).push(m); });
        chatCache = c; if (snap.empty) fsSeed(); cBus.emit();
      }, () => {});
    } catch (e) { mode = "local"; }
  }
  const fsBackend = {
    async addNotif(n) { try { const { addDoc } = fb.fx; await addDoc(fsPaths().notifs, Object.assign({ at: now(), read: false, ico: "bell" }, n)); } catch (e) {} },
    async markAllRead() { try { const { writeBatch, doc } = fb.fx; const b = writeBatch(fb.db); notifCache.forEach((n) => { if (!n.read) b.update(doc(fb.db, `users/${uid}/notifications/${n._id}`), { read: true }); }); await b.commit(); } catch (e) {} },
    async markChatRead(id) { try { const { writeBatch, doc } = fb.fx; const b = writeBatch(fb.db); (chatCache[id] || []).forEach((m) => { if (m.from === "them" && !m.seen) b.update(doc(fb.db, `users/${uid}/messages/${m._id}`), { seen: true }); }); await b.commit(); } catch (e) {} },
    async send(id, text) {
      const { addDoc } = fb.fx; const P = fsPaths();
      try { await addDoc(P.msgs, { threadId: id, from: "me", text, at: now(), seen: true }); } catch (e) { return; }
      setTimeout(async () => {
        try {
          await addDoc(P.msgs, { threadId: id, from: "them", text: reply(), at: now(), seen: false });
          const ag = (D.AGENTS || []).find((a) => a.id === id);
          await addDoc(P.notifs, { ico: "message", title: (ag ? ag.name.split(" ")[0] : "Agent") + " replied", body: "New message in your chat", at: now(), read: false });
        } catch (e) {}
      }, 1400 + Math.random() * 1800);
    }
  };

  const be = () => (mode === "firestore" ? fsBackend : local);

  // Hook up Firebase readiness + auth changes
  window.addEventListener("esto-fb-ready", (e) => activateFirestore(e.detail));
  if (window.EstoFB) activateFirestore(window.EstoFB);
  if (window.EstoAuth && window.EstoAuth.onChange) window.EstoAuth.onChange(() => { if (window.EstoFB) activateFirestore(window.EstoFB); });

  /* =====================================================
     PUBLIC API (identical for both backends)
     ===================================================== */
  window.EstoNotify = {
    list: () => notifCache,
    unread: () => notifCache.filter((n) => !n.read).length,
    add(n) { be().addNotif(n); },
    markAllRead() { be().markAllRead(); },
    onChange(cb) { nBus.subs.add(cb); return () => nBus.subs.delete(cb); }
  };
  window.EstoChat = {
    agents: () => AGENTS(),
    threads() {
      return this.agents().map((a) => {
        const msgs = chatCache[a.id] || [];
        const last = msgs[msgs.length - 1];
        const unread = msgs.filter((m) => m.from === "them" && !m.seen).length;
        return { agent: a, last, unread, at: last ? last.at : 0 };
      }).sort((x, y) => y.at - x.at);
    },
    messages: (id) => chatCache[id] || [],
    markRead(id) { be().markChatRead(id); },
    send(id, text) { be().send(id, text); },
    onChange(cb) { cBus.subs.add(cb); return () => cBus.subs.delete(cb); },
    mode: () => mode
  };
})();
