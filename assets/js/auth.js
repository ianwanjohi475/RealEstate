/* ============================================================
   NYUMBA — authentication module
   Uses Firebase Auth when real keys are present in
   firebase-config.js; otherwise falls back to a fully working
   local "demo" mode so the portfolio is always usable.
   Public API (window.NyAuth):
     currentUser()               -> {uid,name,email,provider}|null
     onChange(cb)                -> subscribe to auth changes
     signUp({name,email,password})     -> Promise<user>
     signIn({email,password})          -> Promise<user>
     signInGoogle()                    -> Promise<user>
     updateName(name)                  -> Promise
     signOutUser()                     -> Promise
     mode                        -> "firebase" | "demo"
   ============================================================ */
(function () {
  "use strict";

  const cfg = window.NYUMBA_FIREBASE || {};
  const CONFIGURED =
    cfg.apiKey && !/REPLACE_ME/.test(cfg.apiKey) &&
    cfg.appId && !/REPLACE_ME/.test(cfg.appId);

  const listeners = new Set();
  let user = null;
  const emit = () => listeners.forEach((cb) => { try { cb(user); } catch {} });

  const normalize = (u, extra = {}) =>
    u ? {
      uid: u.uid,
      name: u.displayName || extra.name || (u.email ? u.email.split("@")[0] : "User"),
      email: u.email,
      photo: u.photoURL || null,
      provider: (u.providerData && u.providerData[0] && u.providerData[0].providerId) || extra.provider || "password"
    } : null;

  /* ---------------- DEMO MODE ---------------- */
  const demo = (() => {
    const UKEY = "nyumba:user";
    const AKEY = "nyumba:accounts";
    const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
    const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    // light obfuscation only — demo, never for production secrets
    const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i); return (h >>> 0).toString(16); };
    const wait = (ms = 550) => new Promise((r) => setTimeout(r, ms));

    user = load(UKEY, null);

    return {
      mode: "demo",
      async signUp({ name, email, password }) {
        await wait();
        const accts = load(AKEY, {});
        email = email.toLowerCase().trim();
        if (accts[email]) throw new Error("An account with that email already exists.");
        accts[email] = { uid: "u_" + Date.now().toString(36), name, email, pw: hash(password), provider: "password" };
        save(AKEY, accts);
        user = { uid: accts[email].uid, name, email, provider: "password", photo: null };
        save(UKEY, user); emit(); return user;
      },
      async signIn({ email, password }) {
        await wait();
        const accts = load(AKEY, {});
        email = email.toLowerCase().trim();
        const a = accts[email];
        if (!a || a.pw !== hash(password)) throw new Error("Incorrect email or password.");
        user = { uid: a.uid, name: a.name, email, provider: "password", photo: null };
        save(UKEY, user); emit(); return user;
      },
      async signInGoogle() {
        await wait(700);
        user = { uid: "g_" + Date.now().toString(36), name: "Guest User", email: "guest@nyumba.co.ke", provider: "google.com", photo: null };
        save(UKEY, user); emit(); return user;
      },
      async updateName(name) {
        if (!user) return; user.name = name; save(UKEY, user);
        const accts = load(AKEY, {}); if (accts[user.email]) { accts[user.email].name = name; save(AKEY, accts); }
        emit();
      },
      async signOutUser() { await wait(200); user = null; localStorage.removeItem(UKEY); emit(); },
      currentUser: () => user
    };
  })();

  /* ---------------- FIREBASE MODE ---------------- */
  function initFirebase() {
    const V = "10.12.5";
    const base = `https://www.gstatic.com/firebasejs/${V}`;
    Promise.all([
      import(`${base}/firebase-app.js`),
      import(`${base}/firebase-auth.js`)
    ]).then(([appMod, authMod]) => {
      const app = appMod.initializeApp(cfg);
      const auth = authMod.getAuth(app);
      const {
        onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
        GoogleAuthProvider, signInWithPopup, updateProfile, signOut
      } = authMod;

      const map = {
        "auth/email-already-in-use": "An account with that email already exists.",
        "auth/invalid-email": "That email address looks invalid.",
        "auth/weak-password": "Password should be at least 6 characters.",
        "auth/wrong-password": "Incorrect email or password.",
        "auth/user-not-found": "Incorrect email or password.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/popup-closed-by-user": "Google sign-in was cancelled.",
        "auth/too-many-requests": "Too many attempts. Please try again shortly."
      };
      const nice = (e) => new Error(map[e.code] || e.message || "Something went wrong.");

      onAuthStateChanged(auth, (u) => { user = normalize(u); emit(); });

      window.NyAuth = {
        mode: "firebase",
        currentUser: () => user,
        onChange(cb) { listeners.add(cb); cb(user); return () => listeners.delete(cb); },
        async signUp({ name, email, password }) {
          try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            if (name) await updateProfile(cred.user, { displayName: name });
            user = normalize(cred.user, { name }); emit(); return user;
          } catch (e) { throw nice(e); }
        },
        async signIn({ email, password }) {
          try { const c = await signInWithEmailAndPassword(auth, email, password); return normalize(c.user); }
          catch (e) { throw nice(e); }
        },
        async signInGoogle() {
          try { const c = await signInWithPopup(auth, new GoogleAuthProvider()); return normalize(c.user); }
          catch (e) { throw nice(e); }
        },
        async updateName(name) {
          try { if (auth.currentUser) { await updateProfile(auth.currentUser, { displayName: name }); user = normalize(auth.currentUser); emit(); } }
          catch (e) { throw nice(e); }
        },
        async signOutUser() { await signOut(auth); }
      };
    }).catch(() => wireDemo(true));
  }

  function wireDemo(fell) {
    window.NyAuth = {
      mode: "demo",
      degraded: !!fell,
      currentUser: demo.currentUser,
      onChange(cb) { listeners.add(cb); cb(user); return () => listeners.delete(cb); },
      signUp: demo.signUp, signIn: demo.signIn, signInGoogle: demo.signInGoogle,
      updateName: demo.updateName, signOutUser: demo.signOutUser
    };
  }

  if (CONFIGURED) { wireDemo(false); initFirebase(); }
  else wireDemo(false);

  /* Route guard helper used by dashboard */
  window.NyAuth.requireAuth = function (redirect = "login.html") {
    const check = () => {
      if (!window.NyAuth.currentUser()) {
        location.replace(redirect + "?next=" + encodeURIComponent(location.pathname.split("/").pop()));
      }
    };
    // give firebase a moment to restore session
    if (window.NyAuth.mode === "firebase") setTimeout(check, 900);
    else check();
  };
})();
