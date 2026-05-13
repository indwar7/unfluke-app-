// Catch promise rejections and JS errors that escape try/catch blocks so
// the app logs them instead of crashing. Imported once from _layout.tsx
// as a side-effect; no exports are needed.

import { Platform } from "react-native";

declare const HermesInternal: any;

const safeLog = (label: string, payload: unknown) => {
  try {
    console.error(`[GlobalError] ${label}:`, payload);
  } catch {
    // swallow logging errors — they should never crash the app
  }
};

// Unhandled promise rejections — axios calls without .catch, async
// handlers that throw, etc. Without this they hit RN's redbox in dev
// and silently drop in production. Hook into the polyfill if available.
try {
  const tracking = require("promise/setimmediate/rejection-tracking");
  if (tracking && typeof tracking.enable === "function") {
    tracking.enable({
      allRejections: true,
      onUnhandled: (id: number, error: unknown) => {
        safeLog(`Unhandled promise rejection #${id}`, error);
      },
      onHandled: () => {
        // no-op — rejection was eventually handled
      },
    });
  }
} catch (err) {
  safeLog("Could not enable rejection tracking", err);
}

// JS-thread uncaught errors. React Native exposes a global handler.
try {
  const ErrorUtils: any = (global as any).ErrorUtils;
  if (ErrorUtils && typeof ErrorUtils.getGlobalHandler === "function") {
    const previousHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      safeLog(
        `Uncaught ${isFatal ? "FATAL" : "non-fatal"} error on ${Platform.OS}`,
        error
      );
      // Chain to the previous handler so dev redbox still fires.
      if (typeof previousHandler === "function") {
        try {
          previousHandler(error, isFatal);
        } catch {
          // ignore — handler should never crash
        }
      }
    });
  }
} catch (err) {
  safeLog("Could not set global error handler", err);
}
