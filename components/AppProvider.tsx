import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { store, persistor } from "@/redux/store";

export function AppProvider({ children }: { children: React.ReactNode }) {
    const scheme = useColorScheme();

    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
                    {children}
                </ThemeProvider>
            </PersistGate>
        </Provider>
    );
}
