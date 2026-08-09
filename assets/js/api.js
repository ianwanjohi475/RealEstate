/* ============================================================
   ESTO — API client (talks to the Node/MongoDB backend)
   Auto-detects the backend; exposes REST + Socket.io realtime.
   If the backend isn't reachable, window.EstoAPI.available stays
   false and the app falls back to demo/local mode.
     window.EstoAPI.ready  -> Promise<boolean>
   ============================================================ */
(function () {
  "use strict";
  const BASE = window.ESTO_API_BASE ||
    (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? "http://localhost:5000" : "");
  const TOKEN_KEY = "esto:token";
  const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) || null; } catch { return null; } };
  const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {} };

  async function req(path, { method = "GET", body, auth = true } = {}) {
    const headers = { "Content-Type": "application/json" };
    const tk = getToken();
    if (auth && tk) headers.Authorization = "Bearer " + tk;
    const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    let data = {}; try { data = await res.json(); } catch (e) {}
    if (!res.ok) throw new Error(data.error || ("Request failed (" + res.status + ")"));
    return data;
  }

  let available = false, socket = null;
  const listeners = { message: new Set(), notification: new Set(), typing: new Set() };

  async function ready() {
    if (!BASE) return false;
    try {
      const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 2500);
      const r = await fetch(BASE + "/api/health", { signal: ctrl.signal }); clearTimeout(to);
      let data = {}; try { data = await r.json(); } catch (e) {}
      // only "available" when the API is up AND its database is connected
      available = r.ok && data.db === true; return available;
    } catch (e) { available = false; return false; }
  }

  function loadSocketLib() {
    if (window.io) return Promise.resolve(window.io);
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = BASE + "/socket.io/socket.io.js";
      s.onload = () => resolve(window.io); s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  async function connectSocket() {
    const tk = getToken(); if (!tk || socket) return socket;
    try {
      const io = await loadSocketLib();
      socket = io(BASE, { auth: { token: tk }, transports: ["websocket", "polling"] });
      socket.on("message:new", (m) => listeners.message.forEach((cb) => cb(m)));
      socket.on("notification:new", (n) => listeners.notification.forEach((cb) => cb(n)));
      socket.on("typing", (t) => listeners.typing.forEach((cb) => cb(t)));
    } catch (e) { socket = null; }
    return socket;
  }
  function disconnectSocket() { if (socket) { socket.close(); socket = null; } }

  window.EstoAPI = {
    base: BASE,
    get available() { return available; },
    ready,
    token: getToken, setToken,
    // auth
    config: () => req("/api/config", { auth: false }),
    register: (name, email, password) => req("/api/auth/register", { method: "POST", auth: false, body: { name, email, password } }),
    login: (email, password) => req("/api/auth/login", { method: "POST", auth: false, body: { email, password } }),
    googleAuth: (credential) => req("/api/auth/google", { method: "POST", auth: false, body: { credential } }),
    me: () => req("/api/me"),
    updateMe: (patch) => req("/api/me", { method: "PATCH", body: patch }),
    logout: () => { setToken(null); disconnectSocket(); },
    // data
    agents: () => req("/api/agents", { auth: false }),
    getSaved: () => req("/api/saved"),
    addSaved: (propertyId) => req("/api/saved", { method: "POST", body: { propertyId } }),
    removeSaved: (propertyId) => req("/api/saved/" + encodeURIComponent(propertyId), { method: "DELETE" }),
    getViewings: () => req("/api/viewings"),
    addViewing: (v) => req("/api/viewings", { method: "POST", body: v }),
    getNotifications: () => req("/api/notifications"),
    readAllNotifications: () => req("/api/notifications/read-all", { method: "POST" }),
    getThreads: () => req("/api/messages/threads"),
    getMessages: (otherId) => req("/api/messages/" + otherId),
    sendMessage: (to, text) => req("/api/messages", { method: "POST", body: { to, text } }),
    mpesa: (payload) => req("/api/mpesa/stkpush", { method: "POST", auth: false, body: payload }),
    // realtime
    connectSocket, disconnectSocket,
    onMessage: (cb) => { listeners.message.add(cb); return () => listeners.message.delete(cb); },
    onNotification: (cb) => { listeners.notification.add(cb); return () => listeners.notification.delete(cb); },
    onTyping: (cb) => { listeners.typing.add(cb); return () => listeners.typing.delete(cb); },
    socketSend: (to, text) => { if (socket) socket.emit("message:send", { to, text }); }
  };

  window.EstoAPI.readyPromise = ready().then((ok) => {
    window.dispatchEvent(new CustomEvent("esto-api-ready", { detail: { available: ok, base: BASE } }));
    return ok;
  });
})();
