/* ============================================================
   ESTO backend entry
   - Connects to MongoDB (MONGODB_URI)
   - REST API + Socket.io realtime chat + JWT auth + M-Pesa
   Configure via server/.env (see .env.example).
   ============================================================ */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createApp, seedAgents } from "./src/app.js";
dotenv.config();

const PORT = process.env.PORT || 5000;
const { server } = createApp(process.env);

async function start() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    mongoose.set("bufferCommands", false);
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log("MongoDB connected");
      await seedAgents();
      console.log("Agents seeded");
    } catch (e) {
      console.error("MongoDB connection FAILED:", e.message);
      console.error("Auth/chat/saved routes will not work until MONGODB_URI is valid.");
    }
  } else {
    console.warn("No MONGODB_URI set — only M-Pesa/contact endpoints will work. Add it to server/.env for accounts, chat, saved homes.");
  }
  server.listen(PORT, () => console.log(`Esto API on http://localhost:${PORT}`));
}
start();
