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
  // Persist only Login (auth) and Layout (UI prefs). Other slices —
  // Wallet, ScannerAlert, StrategyCharts, TestMyStrategy, Historical,
  // Crypto, etc. — reset on app restart so trading data from a previous
  // session or a different user on a shared device does not leak.
  whitelist: ["Login", "Layout"],
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