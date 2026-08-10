/* ============================================================
   ESTO — authentication (Firebase, live)
   Public API (window.EstoAuth):
     currentUser() | onChange(cb) | signUp() | signIn()
     signInGoogle() | updateName() | signOutUser()
     requireAuth() | mode
   Falls back to a local demo mode only if the Firebase SDK
   cannot be loaded (e.g. no network), so the UI never breaks.
   ============================================================ */
(function () {
  "use strict";
  const cfg = window.ESTO_FIREBASE || {};
  const CONFIGURED = cfg.apiKey && cfg.appId && !/REPLACE_ME/.test(cfg.apiKey);

  const listeners = new Set();
  let user = null;
  const emit = () => listeners.forEach((cb) => { try { cb(user); } catch (e) {} });
  // Resolves once the active backend has FINISHED its first session-restore
  // attempt. requireAuth waits for this instead of a blind timeout, so a slow
  // mobile restore (Firebase SDK load + redirect result) can't bounce a
  // signed-in user back home.
  let markAuthReady; const authReady = new Promise((r) => { markAuthReady = r; });
  let authReadyDone = false; const settleAuth = () => { if (!authReadyDone) { authReadyDone = true; markAuthReady(); } };
  // Safety net: if the SDK never loads (offline / blocked), still let the
  // guard decide eventually. Real Firebase restore finishes well inside this.
  setTimeout(settleAuth, 6000);
  const normalize = (u, extra = {}) => u ? {
    uid: u.uid,
    name: u.displayName || extra.name || (u.email ? u.email.split("@")[0] : "User"),
    email: u.email,
    photo: u.photoURL || null,
    provider: (u.providerData && u.providerData[0] && u.providerData[0].providerId) || extra.provider || "password"
  } : null;

  /* ---------------- DEMO fallback ---------------- */
  const demo = (() => {
    const UKEY = "esto:user", AKEY = "esto:accounts";
    const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
    const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i); return (h >>> 0).toString(16); };
    const wait = (ms = 500) => new Promise((r) => setTimeout(r, ms));
    user = load(UKEY, null);
    return {
      async signUp({ name, email, password }) { await wait();
        const a = load(AKEY, {}); email = email.toLowerCase().trim();
        if (a[email]) throw new Error("An account with that email already exists.");
        a[email] = { uid: "u_" + Date.now().toString(36), name, email, pw: hash(password) }; save(AKEY, a);
        user = { uid: a[email].uid, name, email, provider: "password" }; save(UKEY, user); emit(); return user; },
      async signIn({ email, password }) { await wait();
        const a = load(AKEY, {}); email = email.toLowerCase().trim(); const x = a[email];
        if (!x || x.pw !== hash(password)) throw new Error("Incorrect email or password.");
        user = { uid: x.uid, name: x.name, email, provider: "password" }; save(UKEY, user); emit(); return user; },
      async signInGoogle() { await wait(600);
        user = { uid: "g_" + Date.now().toString(36), name: "Guest User", email: "guest@esto.co.ke", provider: "google.com" };
        save(UKEY, user); emit(); return user; },
      async updateName(name) { if (!user) return; user.name = name; save(UKEY, user);
        const a = load(AKEY, {}); if (a[user.email]) { a[user.email].name = name; save(AKEY, a); } emit(); },
      async signOutUser() { await wait(150); user = null; localStorage.removeItem(UKEY); emit(); },
      currentUser: () => user
    };
  })();

  function wireDemo(degraded) {
    window.EstoAuth = {
      mode: "demo", degraded: !!degraded,
      currentUser: demo.currentUser,
      onChange(cb) { listeners.add(cb); cb(user); return () => listeners.delete(cb); },
      signUp: demo.signUp, signIn: demo.signIn, signInGoogle: demo.signInGoogle,
      updateName: demo.updateName, signOutUser: demo.signOutUser
    };
    attachRequireAuth();
  }

  /* ---------------- FIREBASE ---------------- */
  function initFirebase() {
    const V = "10.12.5", base = `https://www.gstatic.com/firebasejs/${V}`;
    Promise.all([ import(`${base}/firebase-app.js`), import(`${base}/firebase-auth.js`) ])
      .then(([appMod, authMod]) => {
        const app = appMod.initializeApp(cfg);
        const auth = authMod.getAuth(app);
        // fire-and-forget analytics
        if (cfg.measurementId) import(`${base}/firebase-analytics.js`).then((m) => { try { m.getAnalytics(app); } catch (e) {} }).catch(() => {});
        // Firestore — real database for chats, saved homes, notifications
        import(`${base}/firebase-firestore.js`).then((fs) => {
          const db = fs.getFirestore(app);
          window.EstoFB = { app, auth, db, fx: fs, uid: () => (user && user.uid) || null };
          window.dispatchEvent(new CustomEvent("esto-fb-ready", { detail: window.EstoFB }));
        }).catch(() => {});
        const { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
          GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
          updateProfile, signOut, setPersistence, browserLocalPersistence } = authMod;
        setPersistence(auth, browserLocalPersistence).catch(() => {});
        // Don't declare auth "ready" until BOTH the first auth-state event and
        // the redirect result have resolved — otherwise a signed-in user
        // restored from persistence (or a mobile redirect) could be missed.
        let sawAuthEvent = false, redirectDone = false;
        const maybeReady = () => { if (sawAuthEvent && redirectDone) settleAuth(); };
        // complete any pending Google redirect sign-in
        getRedirectResult(auth).then((r) => { if (r && r.user) { user = normalize(r.user); emit(); } }).catch(() => {}).finally(() => { redirectDone = true; maybeReady(); });
        const map = {
          "auth/email-already-in-use":"An account with that email already exists.",
          "auth/invalid-email":"That email address looks invalid.",
          "auth/weak-password":"Password should be at least 6 characters.",
          "auth/wrong-password":"Incorrect email or password.",
          "auth/user-not-found":"Incorrect email or password.",
          "auth/invalid-credential":"Incorrect email or password.",
          "auth/popup-closed-by-user":"Google sign-in was cancelled.",
          "auth/popup-blocked":"Your browser blocked the popup. Allow popups and retry.",
          "auth/too-many-requests":"Too many attempts. Please try again shortly.",
          "auth/operation-not-allowed":"Enable Email/Password in Firebase Console → Authentication → Sign-in method.",
          "auth/unauthorized-domain":"This domain isn't authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains (add 'localhost' for local testing).",
          "auth/network-request-failed":"Network error — check your connection and retry."
        };
        const nice = (e) => new Error(map[e.code] || e.message || "Something went wrong.");
        onAuthStateChanged(auth, (u) => { user = normalize(u); emit(); sawAuthEvent = true; maybeReady(); });
        window.EstoAuth = {
          mode: "firebase",
          currentUser: () => user,
          onChange(cb) { listeners.add(cb); cb(user); return () => listeners.delete(cb); },
          async signUp({ name, email, password }) { try {
            const c = await createUserWithEmailAndPassword(auth, email, password);
            if (name) await updateProfile(c.user, { displayName: name });
            user = normalize(c.user, { name }); emit(); return user; } catch (e) { throw nice(e); } },
          async signIn({ email, password }) { try { const c = await signInWithEmailAndPassword(auth, email, password); return normalize(c.user); } catch (e) { throw nice(e); } },
          async signInGoogle() {
            const provider = new GoogleAuthProvider();
            try { const c = await signInWithPopup(auth, provider); return normalize(c.user); }
            catch (e) {
              // popup blocked/closed -> fall back to full-page redirect (no popup needed)
              if (e.code === "auth/popup-blocked" || e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") {
                try { await signInWithRedirect(auth, provider); return null; } catch (e2) { throw nice(e2); }
              }
              throw nice(e);
            }
          },
          async updateName(name) { try { if (auth.currentUser) { await updateProfile(auth.currentUser, { displayName: name }); user = normalize(auth.currentUser); emit(); } } catch (e) { throw nice(e); } },
          async signOutUser() { await signOut(auth); }
        };
        attachRequireAuth();
      })
      .catch(() => { wireDemo(true); settleAuth(); });
  }

  function attachRequireAuth() {
    window.EstoAuth.requireAuth = function (redirect = "index.html?auth=login") {
      // Already signed in — nothing to guard.
      if (window.EstoAuth.currentUser()) return;
      let settled = false;
      // If a user appears while we wait (session restore / redirect result),
      // cancel the pending redirect and stay on the page.
      const unsub = window.EstoAuth.onChange((u) => { if (u) { settled = true; if (unsub) unsub(); } });
      // Only decide AFTER the backend has attempted to restore the session.
      authReady.then(() => setTimeout(() => {
        if (settled || window.EstoAuth.currentUser()) return;
        const next = location.pathname.split("/").pop() || "dashboard.html";
        location.replace(redirect + "&next=" + encodeURIComponent(next));
      }, 200));
    };
    // legacy alias
    window.NyAuth = window.EstoAuth;
  }

  /* ---------------- API (MongoDB backend) MODE ---------------- */
  const mapApiUser = (u) => u ? { uid: u.id, name: u.name, email: u.email, provider: "password", role: u.role, photo: u.photo || null } : null;
  function wireAPI() {
    const API = window.EstoAPI;
    window.EstoAuth = {
      mode: "api",
      currentUser: () => user,
      onChange(cb) { listeners.add(cb); cb(user); return () => listeners.delete(cb); },
      async signUp({ name, email, password }) { const r = await API.register(name, email, password); API.setToken(r.token); user = mapApiUser(r.user); emit(); API.connectSocket(); return user; },
      async signIn({ email, password }) { const r = await API.login(email, password); API.setToken(r.token); user = mapApiUser(r.user); emit(); API.connectSocket(); return user; },
      async signInGoogle() { throw new Error("Google isn't configured. Add GOOGLE_CLIENT_ID in server/.env, or use email & password."); },
      // called by the Google Identity Services button with a verified credential
      async signInGoogleCredential(credential) { const r = await API.googleAuth(credential); API.setToken(r.token); user = mapApiUser(r.user); emit(); API.connectSocket(); return user; },
      async updateName(name) { try { const r = await API.updateMe({ name }); user = mapApiUser(r.user); emit(); } catch (e) {} },
      async signOutUser() { API.logout(); user = null; emit(); }
    };
    attachRequireAuth();
    // restore session from stored token
    if (API.token()) API.me().then((r) => { user = mapApiUser(r.user); emit(); API.connectSocket(); }).catch(() => { API.setToken(null); user = null; emit(); }).finally(settleAuth);
    else settleAuth();
  }

  /* ---------------- decide backend: API -> Firebase -> demo ---------------- */
  wireDemo(false); // instant fallback so the UI always works
  const decide = (window.EstoAPI && window.EstoAPI.readyPromise) || Promise.resolve(false);
  decide.then((apiOk) => {
    if (apiOk) { wireAPI(); return; }
    if (CONFIGURED) initFirebase();      // only touch Firebase if no backend
    else settleAuth();                   // pure demo — nothing async to restore
  });
})();
