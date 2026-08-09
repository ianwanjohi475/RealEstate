/* End-to-end backend test against a real in-memory MongoDB. */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { io as ioClient } from "socket.io-client";
import { createApp, seedAgents } from "./src/app.js";

let pass = 0, fail = 0;
const ok = (n, c, d = "") => { c ? pass++ : fail++; console.log(`${c ? "PASS" : "FAIL"}: ${n}${d ? " — " + d : ""}`); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const mem = await MongoMemoryServer.create();
  const uri = mem.getUri();
  mongoose.set("bufferCommands", false);
  await mongoose.connect(uri);
  await seedAgents();

  const { server } = createApp({ JWT_SECRET: "test" });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const B = `http://localhost:${port}`;
  const api = (path, opts = {}, token) => fetch(B + path, { ...opts, headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}), ...(opts.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));

  // health
  ok("health", (await api("/api/health")).body.ok === true);

  // register two users
  const rA = await api("/api/auth/register", { method: "POST", body: JSON.stringify({ name: "Alice Buyer", email: "alice@test.co", password: "secret123" }) });
  ok("register A", rA.status === 200 && !!rA.body.token, rA.body.error);
  const rB = await api("/api/auth/register", { method: "POST", body: JSON.stringify({ name: "Bob Buyer", email: "bob@test.co", password: "secret123" }) });
  ok("register B", rB.status === 200 && !!rB.body.token);
  const tokenA = rA.body.token, tokenB = rB.body.token, idA = rA.body.user.id, idB = rB.body.user.id;

  // dup email rejected
  ok("duplicate email rejected", (await api("/api/auth/register", { method: "POST", body: JSON.stringify({ name: "x", email: "alice@test.co", password: "secret123" }) })).status === 409);
  // login + wrong password
  ok("login works", (await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: "alice@test.co", password: "secret123" }) })).body.token != null);
  ok("wrong password rejected", (await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: "alice@test.co", password: "nope" }) })).status === 401);
  // me + protected route requires auth
  ok("/me requires auth", (await api("/api/me")).status === 401);
  ok("/me returns user", (await api("/api/me", {}, tokenA)).body.user.email === "alice@test.co");

  // agents seeded
  const agents = (await api("/api/agents")).body.agents;
  ok("agents seeded (6)", agents.length === 6, "" + agents.length);
  const agentId = agents[0].id;

  // saved homes
  await api("/api/saved", { method: "POST", body: JSON.stringify({ propertyId: "esto-001" }) }, tokenA);
  await api("/api/saved", { method: "POST", body: JSON.stringify({ propertyId: "esto-003" }) }, tokenA);
  await api("/api/saved", { method: "POST", body: JSON.stringify({ propertyId: "esto-001" }) }, tokenA); // dup ignored
  let saved = (await api("/api/saved", {}, tokenA)).body.saved;
  ok("saved homes stored (2, dedup)", saved.length === 2, saved.join(","));
  await api("/api/saved/esto-001", { method: "DELETE" }, tokenA);
  saved = (await api("/api/saved", {}, tokenA)).body.saved;
  ok("saved home removed", saved.length === 1 && saved[0] === "esto-003");
  ok("saved isolated per user", (await api("/api/saved", {}, tokenB)).body.saved.length === 0);

  // viewings
  await api("/api/viewings", { method: "POST", body: JSON.stringify({ propertyId: "esto-001", title: "Karen Villa", area: "Karen", when: "Sat 10am", agent: "Wanjiru" }) }, tokenA);
  ok("viewing created", (await api("/api/viewings", {}, tokenA)).body.viewings.length === 1);

  // notifications (welcome + viewing)
  const notes = (await api("/api/notifications", {}, tokenA)).body.notifications;
  ok("notifications created", notes.length >= 2, "" + notes.length);
  await api("/api/notifications/read-all", { method: "POST" }, tokenA);
  ok("notifications mark-all-read", (await api("/api/notifications", {}, tokenA)).body.notifications.every((n) => n.read));

  // REST message A -> agent, thread + unread for agent
  await api("/api/messages", { method: "POST", body: JSON.stringify({ to: agentId, text: "Hi, is the Karen villa available?" }) }, tokenA);
  const threadsA = (await api("/api/messages/threads", {}, tokenA)).body.threads;
  ok("thread listed for sender", threadsA.length === 1 && threadsA[0].user.id === agentId);
  const msgsA = (await api("/api/messages/" + agentId, {}, tokenA)).body.messages;
  ok("messages fetched in thread", msgsA.length === 1 && msgsA[0].mine === true);

  // REALTIME: socket A and B, A sends to B, B receives
  const sockA = ioClient(B, { auth: { token: tokenA }, transports: ["websocket"] });
  const sockB = ioClient(B, { auth: { token: tokenB }, transports: ["websocket"] });
  await new Promise((res) => { let n = 0; const d = () => (++n === 2) && res(); sockA.on("connect", d); sockB.on("connect", d); });
  ok("sockets connect (JWT auth)", sockA.connected && sockB.connected);
  let received = null, gotNotif = false;
  sockB.on("message:new", (m) => { if (String(m.from) === String(idA)) received = m; });
  sockB.on("notification:new", () => { gotNotif = true; });
  sockA.emit("message:send", { to: idB, text: "hello Bob, live chat!" });
  await wait(600);
  ok("realtime message delivered to recipient", received && received.text === "hello Bob, live chat!");
  ok("realtime notification delivered", gotNotif);
  // socket without token rejected
  const bad = ioClient(B, { auth: { token: "garbage" }, transports: ["websocket"] });
  const badErr = await new Promise((res) => { bad.on("connect_error", () => res(true)); bad.on("connect", () => res(false)); setTimeout(() => res(false), 1500); });
  ok("socket rejects bad token", badErr);

  sockA.close(); sockB.close(); bad.close();
  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  await mongoose.disconnect(); await mem.stop(); server.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("TEST CRASH:", e); process.exit(1); });
