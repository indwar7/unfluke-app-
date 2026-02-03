
import { createSlice } from '@reduxjs/toolkit';

const webSocketSlice = createSlice({
  name: 'webSocket',
  initialState: {
    messages: [],
    status: 'disconnected', // 'connected', 'disconnected', 'error'
    error: null,
  },
  reducers: {
    webSocketConnected: (state) => {
      state.status = 'connected';
      state.error = null;
    },
    webSocketDisconnected: (state) => {
      state.status = 'disconnected';
    },
    webSocketError: (state, action) => {
      state.status = 'error';
      state.error = action.payload;
    },
    webSocketMessageReceived: (state, action) => {
      state.messages = action.payload;
    },
  },
});

export const {
  webSocketConnected,
  webSocketDisconnected,
  webSocketError,
  webSocketMessageReceived,
} = webSocketSlice.actions;

export default webSocketSlice.reducer;
