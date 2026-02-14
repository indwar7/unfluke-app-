import io from 'socket.io-client';
import { webSocketConnected, webSocketDisconnected, webSocketError, webSocketMessageReceived } from './reducer';

export const connectWebSocket = (url) => (dispatch) => {
  const socket = io(url);

  socket.on('connect', () => {
    dispatch(webSocketConnected());
  });

  socket.on('message', (message) => {
    dispatch(webSocketMessageReceived(message));
  });

  socket.on('connect_error', (error) => {
    dispatch(webSocketError(error));
  });

  socket.on('disconnect', () => {
    dispatch(webSocketDisconnected());
  });

  return socket;
};
