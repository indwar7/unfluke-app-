import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Top-level error boundary so any uncaught render error shows a friendly
// fallback screen instead of a white-screen crash. Wrapped around the
// root layout so it catches everything below.
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    try {
      router.replace("/dashboard");
    } catch {
      try { router.replace("/"); } catch { }
    }
  };

  handleLoginRedirect = () => {
    this.setState({ hasError: false, error: null });
    try { router.replace("/login"); } catch { }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              The app ran into an unexpected error. Don't worry — your data is
              safe.
            </Text>
            {this.state.error ? (
              <Text style={styles.errorText} numberOfLines={12} selectable>
                {(this.state.error.message || String(this.state.error)) +
                  (this.state.error.stack ? "\n\n" + this.state.error.stack : "")}
              </Text>
            ) : null}
            <TouchableOpacity style={styles.primaryButton} onPress={this.handleReset}>
              <Text style={styles.primaryButtonText}>Back to dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={this.handleLoginRedirect}>
              <Text style={styles.secondaryButtonText}>Sign in again</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 12,
    color: "#991B1B",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    fontFamily: "monospace",
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: 200,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  secondaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    minWidth: 200,
  },
  secondaryButtonText: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 14,
    textAlign: "center",
  },
});

export default ErrorBoundary;
