/* ============================================================
   ESTO — real-time layer (chat + notifications)
   Cross-tab live sync via BroadcastChannel + storage events.
   Persists to localStorage; agents auto-reply so the chat feels
   alive. (Drop-in point for Firestore later.)
     window.EstoChat   — threads(), messages(), send(), markRead(), onChange()
     window.EstoNotify — list(), add(), unread(), markAllRead(), onChange()
   ============================================================ */
(function () {
  "use strict";
  const D = window.ESTO;
  const bc = ("BroadcastChannel" in window) ? new BroadcastChannel("esto-rt") : null;
  const now = () => Date.now();
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  function bus(type) {
    const subs = new Set();
    const emit = () => subs.forEach((cb) => { try { cb(); } catch (e) {} });
    if (bc) bc.addEventListener("message", (e) => { if (e.data === type) emit(); });
    window.addEventListener("storage", (e) => { if (e.key === type) emit(); });
    return { subs, emit, ping() { emit(); if (bc) bc.postMessage(type); } };
  }

  /* ---------------- Notifications ---------------- */
  const NKEY = "esto:notifs";
  const nBus = bus(NKEY);
  function seedNotifs() {
    if (load(NKEY, null)) return;
    save(NKEY, [
      { id: "n1", ico: "verified", title: "New verified listing", body: "Sky Villa Penthouse in Kilimani · TrustScore 94", at: now() - 2 * 36e5, read: false },
      { id: "n2", ico: "calendar", title: "Viewing confirmed", body: "Ambassadorial Villa, Karen · Sat 10:00am", at: now() - 6 * 36e5, read: false },
      { id: "n3", ico: "message", title: "Wanjiru replied", body: "Happy to arrange that viewing.", at: now() - 26 * 36e5, read: true }
    ]);
  }
  seedNotifs();
  window.EstoNotify = {
    list: () => load(NKEY, []),
    unread: () => load(NKEY, []).filter((n) => !n.read).length,
    add(n) { const a = load(NKEY, []); a.unshift(Object.assign({ id: "n_" + now(), at: now(), read: false, ico: "bell" }, n)); save(NKEY, a.slice(0, 40)); nBus.ping(); },
    markAllRead() { save(NKEY, load(NKEY, []).map((n) => ({ ...n, read: true }))); nBus.ping(); },
    onChange(cb) { nBus.subs.add(cb); return () => nBus.subs.delete(cb); }
  };

  /* ---------------- Chat ---------------- */
  const CKEY = "esto:chat";
  const cBus = bus(CKEY);
  const AGENT_IDS = (D && D.AGENTS ? D.AGENTS.slice(0, 4) : []).map((a) => a.id);
  function seedChat() {
    if (load(CKEY, null)) return;
    const seed = {};
    const first = D && D.AGENTS ? D.AGENTS[0] : null;
    if (first) seed[first.id] = [
      { from: "them", text: "Hi! Thanks for your interest in the Karen villa — happy to help.", at: now() - 3 * 36e5 },
      { from: "them", text: "Would a Saturday viewing at 10am work for you?", at: now() - 3 * 36e5 + 60000 }
    ];
    save(CKEY, seed);
  }
  seedChat();
  const store = () => load(CKEY, {});
  const REPLIES = [
    "Great question — let me confirm and get right back to you.",
    "Yes, that property is verified and available. Want to book a viewing?",
    "I can share the title documents and the full inspection report.",
    "The price is negotiable within reason — shall I put in an offer for you?",
    "Absolutely, I'll send over a few similar options in your budget.",
    "You can pay the small reservation fee via M-Pesa to hold it."
  ];
  window.EstoChat = {
    agents: () => (D && D.AGENTS ? D.AGENTS.slice(0, 4) : []),
    threads() {
      const s = store();
      return this.agents().map((a) => {
        const msgs = s[a.id] || [];
        const last = msgs[msgs.length - 1];
        const unread = msgs.filter((m) => m.from === "them" && !m.seen).length;
        return { agent: a, last, unread, at: last ? last.at : 0 };
      }).sort((x, y) => y.at - x.at);
    },
    messages: (id) => store()[id] || [],
    markRead(id) { const s = store(); if (s[id]) { s[id] = s[id].map((m) => ({ ...m, seen: true })); save(CKEY, s); cBus.ping(); } },
    send(id, text) {
      const s = store(); s[id] = s[id] || [];
      s[id].push({ from: "me", text, at: now(), seen: true }); save(CKEY, s); cBus.ping();
      // agent auto-reply
      const delay = 1400 + Math.random() * 1800;
      setTimeout(() => {
        const s2 = store(); s2[id] = s2[id] || [];
        s2[id].push({ from: "them", text: REPLIES[Math.floor(Math.random() * REPLIES.length)], at: now(), seen: false });
        save(CKEY, s2); cBus.ping();
        const ag = (D.AGENTS || []).find((a) => a.id === id);
        window.EstoNotify.add({ ico: "message", title: (ag ? ag.name.split(" ")[0] : "Agent") + " replied", body: "New message in your chat" });
      }, delay);
    },
    onChange(cb) { cBus.subs.add(cb); return () => cBus.subs.delete(cb); }
  };
})();
