import { createApp } from "./src/app.js";
import jwt from "jsonwebtoken";
import { io as ioClient } from "socket.io-client";
let pass=0,fail=0; const ok=(n,c,d="")=>{c?pass++:fail++;console.log(`${c?"PASS":"FAIL"}: ${n}${d?" — "+d:""}`);};
const { server } = createApp({ JWT_SECRET:"test" });
await new Promise(r=>server.listen(0,r));
const port=server.address().port, B=`http://localhost:${port}`;
// health (no DB needed)
const h=await fetch(B+"/api/health").then(r=>r.json());
ok("server boots + /api/health", h.ok===true);
// protected route without token -> 401
ok("protected route 401 w/o token", (await fetch(B+"/api/me")).status===401);
// unknown route -> 404
ok("unknown route 404", (await fetch(B+"/api/nope")).status===404);
// mpesa without keys -> 503 (wired)
ok("mpesa route wired (503 no keys)", (await fetch(B+"/api/mpesa/stkpush",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"})).status===503);
// socket: valid JWT connects, bad JWT rejected (no DB needed for auth)
const good=jwt.sign({id:"64b000000000000000000001",role:"user"},"test");
const sg=ioClient(B,{auth:{token:good},transports:["websocket"]});
ok("socket accepts valid JWT", await new Promise(r=>{sg.on("connect",()=>r(true));sg.on("connect_error",()=>r(false));setTimeout(()=>r(false),2000);}));
const sb=ioClient(B,{auth:{token:"garbage"},transports:["websocket"]});
ok("socket rejects bad JWT", await new Promise(r=>{sb.on("connect_error",()=>r(true));sb.on("connect",()=>r(false));setTimeout(()=>r(false),2000);}));
sg.close();sb.close();
console.log(`\n==== ${pass} passed, ${fail} failed ====`);
server.close(); process.exit(fail?1:0);
