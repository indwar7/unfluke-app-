import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { Stack } from "expo-router";
import { store } from "../redux/store";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="fundamental" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="strategy-charts" />
            <Stack.Screen name="chatbot" />
            <Stack.Screen name="historical" />
            <Stack.Screen name="simulator" />
            <Stack.Screen name="scannermain" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="activate-telegram" />
            <Stack.Screen name="pricing" />
            <Stack.Screen name="leads" />
            <Stack.Screen name="advanced-backtester-main" />
            <Stack.Screen name="advanced-backtester-home" />
            <Stack.Screen name="advanced-backtester" />
            <Stack.Screen name="basic-backtester-view" />
            <Stack.Screen name="basic-backtester-home" />
            <Stack.Screen name="basic-backtester-main" />
            <Stack.Screen name="basic-backtester" />
          </Stack>
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
