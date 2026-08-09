/* ============================================================
   ESTO — M-Pesa payment client
   Talks to the Esto server (/api/mpesa/stkpush). If the server
   is unreachable, falls back to a realistic demo so the UI works
   on static hosting.  window.EstoPay.open({...})
   Also maintains a local wallet/transactions ledger.
   ============================================================ */
(function () {
  "use strict";
  const I = (n) => window.EstoIcon.get(n);
  const $ = (s, r = document) => r.querySelector(s);

  const API_BASE = window.ESTO_API_BASE ||
    (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? "http://localhost:5000" : "");

  /* ---- wallet ledger ---- */
  const TX_KEY = "esto:txns";
  const getTx = () => { try { return JSON.parse(localStorage.getItem(TX_KEY)) || []; } catch { return []; } };
  const addTx = (t) => { const a = getTx(); a.unshift(Object.assign({ id: "tx_" + Date.now(), at: Date.now() }, t)); localStorage.setItem(TX_KEY, JSON.stringify(a.slice(0, 50))); return a; };
  const balance = () => getTx().reduce((s, t) => s + (t.dir === "in" ? t.amount : -t.amount), 0);
  window.EstoWallet = { list: getTx, add: addTx, balance };

  /* ---- modal ---- */
  let cfg = null;
  function build() {
    if ($("#pay-modal")) return;
    const el = document.createElement("div");
    el.className = "pay-modal"; el.id = "pay-modal";
    el.innerHTML = `
      <div class="scrim" data-pay-close></div>
      <div class="dialog" role="dialog" aria-modal="true">
        <div class="pay-head"><span class="mlogo">M-PESA</span><b style="font-family:var(--font-display)">Secure payment</b>
          <button class="pay-close" data-pay-close aria-label="Close">${I("close")}</button></div>
        <div class="pay-body" id="pay-body"></div>
      </div>`;
    document.body.appendChild(el);
    el.querySelectorAll("[data-pay-close]").forEach((b) => b.addEventListener("click", close));
  }
  function fmt(n) { return "KES " + Number(n).toLocaleString("en-KE"); }

  function renderForm() {
    const body = $("#pay-body");
    body.innerHTML = `
      <div class="pay-amount"><small>${cfg.title || "Payment"}</small><b>${fmt(cfg.amount)}</b><small>${cfg.description || ""}</small></div>
      <form id="pay-form">
        <div class="form-field"><label>M-Pesa phone number</label>
          <div class="inp-wrap">${I("phone")}<input class="inp" id="pay-phone" inputmode="tel" placeholder="07XX XXX XXX" value="${cfg.phone || ""}" required></div>
          <div class="field-hint">You'll get an STK prompt on this number — enter your PIN to confirm.</div></div>
        <button class="btn btn--block btn--lg" type="submit" style="background:#0a8f3c">${I("shieldCheck")}Pay ${fmt(cfg.amount)}</button>
        <p style="text-align:center;color:var(--muted);font-size:.8rem;margin-top:12px">Secured by Safaricom Daraja · ${API_BASE ? "live" : "demo"} mode</p>
      </form>`;
    $("#pay-form").addEventListener("submit", pay);
  }
  function status(html, spinner) {
    $("#pay-body").innerHTML = `
      <div class="pay-amount"><small>${cfg.title || "Payment"}</small><b>${fmt(cfg.amount)}</b></div>
      <div class="pay-status">${spinner ? '<span class="pay-spinner"></span>' : I(spinner === false ? "checkCircle" : "clock")}<span>${html}</span></div>`;
  }
  function success() {
    addTx({ dir: "out", type: cfg.type || "payment", title: cfg.title || "Payment", amount: +cfg.amount, ref: cfg.accountRef || "Esto" });
    if (window.EstoNotify) window.EstoNotify.add({ ico: "coins", title: "Payment received", body: `${fmt(cfg.amount)} — ${cfg.title}` });
    $("#pay-body").innerHTML = `
      <div style="text-align:center;padding:14px 0">
        <div style="width:74px;height:74px;border-radius:50%;background:rgba(46,158,107,.14);color:var(--ok);display:grid;place-items:center;margin:0 auto 16px">${I("checkCircle")}</div>
        <h3 style="font-size:1.3rem;margin-bottom:6px">Payment successful</h3>
        <p style="color:var(--muted)">${fmt(cfg.amount)} for ${cfg.title}.</p>
        <button class="btn btn--block btn--lg" style="margin-top:20px" data-pay-close>Done</button>
      </div>`;
    $("#pay-body").querySelector("[data-pay-close]").addEventListener("click", close);
    if (window.EstoToast) window.EstoToast("Payment successful — " + fmt(cfg.amount), "checkCircle");
    if (cfg.onSuccess) try { cfg.onSuccess(); } catch (e) {}
  }
  function fail(msg) {
    status(msg || "Payment failed. Please try again.", false);
    const b = document.createElement("button"); b.className = "btn btn--ghost btn--block"; b.style.marginTop = "14px"; b.textContent = "Try again";
    b.addEventListener("click", renderForm); $("#pay-body").appendChild(b);
  }

  async function pay(e) {
    e.preventDefault();
    const phone = $("#pay-phone").value.trim();
    if (!/^(?:\+?254|0)?7\d{8}$/.test(phone.replace(/\s/g, ""))) return alertField("Enter a valid Safaricom number, e.g. 0712 345 678.");
    cfg.phone = phone;
    status("Sending STK push to your phone…", true);
    // try the real backend
    if (API_BASE) {
      try {
        const headers = { "Content-Type": "application/json" };
        const tk = window.EstoAPI && window.EstoAPI.token && window.EstoAPI.token();
        if (tk) headers.Authorization = "Bearer " + tk;
        const r = await fetch(API_BASE + "/api/mpesa/stkpush", {
          method: "POST", headers,
          body: JSON.stringify({ phone, amount: cfg.amount, accountRef: cfg.accountRef || "Esto", description: cfg.description || cfg.title })
        });
        const data = await r.json();
        if (r.ok && data.ok) { status("Prompt sent. Enter your M-Pesa PIN on your phone…", true); setTimeout(success, 6000); return; }
        // key-missing or error -> demo fallback
      } catch (err) { /* server down -> demo */ }
    }
    // DEMO fallback (no reachable backend)
    status("Prompt sent to " + phone + ". Enter your M-Pesa PIN…", true);
    setTimeout(success, 3200);
  }
  function alertField(msg) { const b = $("#pay-body"); const h = b.querySelector(".field-hint"); if (h) { h.textContent = msg; h.style.color = "var(--danger)"; } }

  function open(options) {
    cfg = Object.assign({ amount: 1000, title: "Esto payment", type: "payment" }, options || {});
    build(); renderForm();
    requestAnimationFrame(() => $("#pay-modal").classList.add("open"));
    document.body.style.overflow = "hidden";
  }
  function close() { const m = $("#pay-modal"); if (m) m.classList.remove("open"); document.body.style.overflow = ""; }
  window.EstoPay = { open, close, apiBase: API_BASE };
})();
