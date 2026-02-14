// store.js - Alternative approach
import { configureStore } from "@reduxjs/toolkit";
import { 
  persistReducer, 
  persistStore, 
  FLUSH, 
  REHYDRATE, 
  PAUSE, 
  PERSIST, 
  PURGE, 
  REGISTER 
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import rootReducer from "../Unfluke_slices";

const persistConfig = {
  key: "root",
  version: 1,
  storage: AsyncStorage,
  // Remove whitelist to persist everything
  // Only use blacklist if you want to exclude specific reducers
  blacklist: [], // Empty array means persist everything
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck:false
    }),
});

export const persistor = persistStore(store);