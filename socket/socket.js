import { io } from 'socket.io-client';
import { Config } from '../helpers/config';

console.log("Backend Socket URL:", Config.BACKEND_URL);
console.log("Chatbot Socket URL:", Config.REACT_APP_CHATBOT_URL);

export const backendSocket = io(Config.BACKEND_URL, {
    transports: ["websocket"],
});

export const chatbotSocket = io(Config.REACT_APP_CHATBOT_URL, {
    transports: ["websocket"],
});