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
        const { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
          GoogleAuthProvider, signInWithPopup, updateProfile, signOut, setPersistence,
          browserLocalPersistence } = authMod;
        setPersistence(auth, browserLocalPersistence).catch(() => {});
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
          "auth/network-request-failed":"Network error — check your connection and retry."
        };
        const nice = (e) => new Error(map[e.code] || e.message || "Something went wrong.");
        onAuthStateChanged(auth, (u) => { user = normalize(u); emit(); });
        window.EstoAuth = {
          mode: "firebase",
          currentUser: () => user,
          onChange(cb) { listeners.add(cb); cb(user); return () => listeners.delete(cb); },
          async signUp({ name, email, password }) { try {
            const c = await createUserWithEmailAndPassword(auth, email, password);
            if (name) await updateProfile(c.user, { displayName: name });
            user = normalize(c.user, { name }); emit(); return user; } catch (e) { throw nice(e); } },
          async signIn({ email, password }) { try { const c = await signInWithEmailAndPassword(auth, email, password); return normalize(c.user); } catch (e) { throw nice(e); } },
          async signInGoogle() { try { const c = await signInWithPopup(auth, new GoogleAuthProvider()); return normalize(c.user); } catch (e) { throw nice(e); } },
          async updateName(name) { try { if (auth.currentUser) { await updateProfile(auth.currentUser, { displayName: name }); user = normalize(auth.currentUser); emit(); } } catch (e) { throw nice(e); } },
          async signOutUser() { await signOut(auth); }
        };
        attachRequireAuth();
      })
      .catch(() => wireDemo(true));
  }

  function attachRequireAuth() {
    window.EstoAuth.requireAuth = function (redirect = "index.html?auth=login") {
      const go = () => { if (!window.EstoAuth.currentUser()) {
        const next = location.pathname.split("/").pop() || "dashboard.html";
        location.replace(redirect + "&next=" + encodeURIComponent(next));
      }};
      // always allow time for Firebase session restore before redirecting
      setTimeout(go, 1100);
    };
    // legacy alias
    window.NyAuth = window.EstoAuth;
  }

  if (CONFIGURED) { wireDemo(false); initFirebase(); }
  else wireDemo(false);
})();
