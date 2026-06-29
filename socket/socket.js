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

export const chatbotSocket = io(Config.REACT_APP_CHATBOT_URL, socketOpts);