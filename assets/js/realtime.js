/* ============================================================
   ESTO — real-time layer (chat + notifications)
   Uses the MongoDB backend (Socket.io realtime + REST) when a
   user is signed in through the API; otherwise a localStorage +
   BroadcastChannel fallback so demo/offline still works.
     window.EstoChat   — threads(), messages(), send(), markRead(), onChange(), agents()
     window.EstoNotify — list(), add(), unread(), markAllRead(), onChange()
   ============================================================ */
(function () {
  "use strict";
  const D = window.ESTO;
  const now = () => Date.now();
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  let notifCache = [];
  let chatCache = {};      // { otherId: [ {from:'me'|'them', text, at, seen} ] }
  let agentList = [];      // [ {id,name,title,photo,role} ]
  let mode = "local";      // "local" | "api"
  let myId = null;

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
  // map API agent -> nice photo from local data by matching first name
  function agentPhoto(name) { const a = (D.AGENTS || []).find((x) => x.name === name || x.name.split(" ")[0] === (name || "").split(" ")[0]); return a ? a.photo : ""; }

  /* ===================== LOCAL backend ===================== */
  const NKEY = "esto:notifs", CKEY = "esto:chat";
  function localSeed() {
    if (!load(NKEY, null)) save(NKEY, [
      { id: "n1", ico: "verified", title: "New verified listing", body: "Sky Villa Penthouse in Kilimani · TrustScore 94", at: now() - 2 * 36e5, read: false },
      { id: "n2", ico: "calendar", title: "Viewing confirmed", body: "Ambassadorial Villa, Karen · Sat 10:00am", at: now() - 6 * 36e5, read: false },
      { id: "n3", ico: "message", title: "Wanjiru replied", body: "Happy to arrange that viewing.", at: now() - 26 * 36e5, read: true }
    ]);
    if (!load(CKEY, null)) {
      const first = (D.AGENTS || [])[0]; const seed = {};
      if (first) seed[first.id] = [
        { from: "them", text: "Hi! Thanks for your interest in the Karen villa — happy to help.", at: now() - 3 * 36e5, seen: false },
        { from: "them", text: "Would a Saturday viewing at 10am work for you?", at: now() - 3 * 36e5 + 60000, seen: false }
      ];
      save(CKEY, seed);
    }
  }
  function localRefresh() { if (mode === "local") { notifCache = load(NKEY, []); chatCache = load(CKEY, {}); agentList = (D.AGENTS || []).slice(0, 4); } }
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
  nBus.subs.add(localRefresh); cBus.subs.add(localRefresh);
  localSeed(); localRefresh();

  /* ===================== API backend (MongoDB) ===================== */
  const API = () => window.EstoAPI;
  async function activateAPI() {
    if (mode === "api") return;
    if (!API() || !API().available || !API().token()) return;
    const u = window.EstoAuth && window.EstoAuth.currentUser && window.EstoAuth.currentUser();
    if (!u) return;
    myId = u.uid; mode = "api";
    nBus.subs.delete(localRefresh); cBus.subs.delete(localRefresh);
    try {
      const { agents } = await API().agents();
      agentList = agents.map((a) => ({ id: a.id, name: a.name, title: a.title, photo: a.photo || agentPhoto(a.name), role: "agent" }));
      cBus.emit();
    } catch (e) {}
    try { notifCache = (await API().getNotifications()).notifications.map((n) => ({ id: n._id, ico: n.ico, title: n.title, body: n.body, at: new Date(n.at).getTime(), read: n.read })); nBus.emit(); } catch (e) {}
    try {
      const { threads } = await API().getThreads();
      threads.forEach((t) => { chatCache[t.user.id] = chatCache[t.user.id] || []; });
      cBus.emit();
    } catch (e) {}
    await API().connectSocket();
    API().onMessage((m) => {
      const other = String(m.from) === String(myId) ? String(m.to) : String(m.from);
      chatCache[other] = chatCache[other] || [];
      chatCache[other].push({ _id: m.id, from: String(m.from) === String(myId) ? "me" : "them", text: m.text, at: new Date(m.at).getTime(), seen: String(m.from) === String(myId) });
      cBus.emit();
    });
    API().onNotification((n) => { notifCache.unshift({ id: n.id, ico: n.ico, title: n.title, body: n.body, at: new Date(n.at).getTime(), read: false }); nBus.emit(); });
  }
  const apiBackend = {
    async addNotif() {},   // server-generated
    async markAllRead() { try { await API().readAllNotifications(); notifCache = notifCache.map((n) => ({ ...n, read: true })); nBus.emit(); } catch (e) {} },
    async markChatRead(id) {
      try { const { messages } = await API().getMessages(id);
        chatCache[id] = messages.map((m) => ({ _id: m.id, from: m.mine ? "me" : "them", text: m.text, at: new Date(m.at).getTime(), seen: true }));
        cBus.emit();
      } catch (e) {}
    },
    async send(id, text) {
      // realtime via socket (server echoes to sender); fall back to REST
      if (API().socketSend && window.io) API().socketSend(id, text);
      else { try { await API().sendMessage(id, text); await this.markChatRead(id); } catch (e) {} }
    }
  };

  const be = () => (mode === "api" ? apiBackend : local);
  window.addEventListener("esto-api-ready", () => activateAPI());
  if (window.EstoAuth && window.EstoAuth.onChange) window.EstoAuth.onChange(() => activateAPI());
  setTimeout(activateAPI, 500);

  /* ===================== PUBLIC API ===================== */
  window.EstoNotify = {
    list: () => notifCache,
    unread: () => notifCache.filter((n) => !n.read).length,
    add(n) { be().addNotif(n); },
    markAllRead() { be().markAllRead(); },
    onChange(cb) { nBus.subs.add(cb); return () => nBus.subs.delete(cb); }
  };
  window.EstoChat = {
    agents: () => (mode === "api" ? agentList : (D.AGENTS || []).slice(0, 4)),
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
