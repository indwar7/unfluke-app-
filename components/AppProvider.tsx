import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import { store, persistor } from "@/redux/store";

export function AppProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <ThemeProvider value={DefaultTheme}>
                    {children}
                </ThemeProvider>
            </PersistGate>
        </Provider>
    );
}
