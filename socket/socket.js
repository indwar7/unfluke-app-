import { io } from 'socket.io-client';
import { Config } from '../helpers/config';

console.log("Backend Socket URL:", Config.BACKEND_URL);
console.log("Chatbot Socket URL:", Config.REACT_APP_CHATBOT_URL);

// websocket first, but fall back to polling so the connection establishes
// quickly even on flaky mobile networks; aggressive reconnect keeps the
// chatbot stream responsive instead of waiting on a dead socket.
const socketOpts = {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 800,
    reconnectionDelayMax: 4000,
    timeout: 12000,
};

export const backendSocket = io(Config.BACKEND_URL, socketOpts);

// Chatbot origin currently takes 20-30s to respond under load (confirmed by
// backend, Sep 2026) — the default connection timeout is too tight for that,
// so give the handshake more room than the general-purpose backend socket.
export const chatbotSocket = io(Config.REACT_APP_CHATBOT_URL, {
    ...socketOpts,
    timeout: 35000,
});

// Connection diagnostics — surfaces chatbot reachability in logs so a down
// origin (e.g. edbot HTTPS) is obvious instead of a silent stuck spinner.
chatbotSocket.on("connect", () => console.log("[chatbotSocket] connected"));
chatbotSocket.on("connect_error", (e) =>
  console.log("[chatbotSocket] connect_error:", e?.message || e));
chatbotSocket.on("disconnect", (r) => console.log("[chatbotSocket] disconnect:", r));