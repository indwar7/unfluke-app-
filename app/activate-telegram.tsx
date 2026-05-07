import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import { postData } from "../Unfluke_helpers/backend_helper";
import { loginSuccess } from "../redux/Unfluke_slices/auth/login/reducer";
import { ScreenWithHeader } from "@/components/AppHeader";

const ActivateTelegram = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authUser = createSelector(
    (state: any) => state.Login,
    (auth) => auth.user
  );
  const user = useSelector(authUser);

  const submitUsername = async () => {
    if (!username.trim()) {
      Toast.show({
        type: "error",
        text1: "Please enter your Telegram username",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await postData(`api/alert/addUsername`, {
        username: username.trim(),
        userId: user._id,
      });

      if (data && (data.status === 200 || data.msg)) {
        const updatedUser = { ...user, telegramUsername: username.trim() };
        await AsyncStorage.setItem("authUser", JSON.stringify(updatedUser));
        dispatch(loginSuccess(updatedUser));
        Linking.openURL("https://t.me/UnflukeAI_bot");
        router.replace("/profile");
      } else {
        Toast.show({
          type: "error",
          text1: data?.msg || "Something went wrong. Please try again.",
          position: "top",
          visibilityTime: 3000,
          autoHide: true,
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: typeof err === "string" ? err : "Could not reach the server",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWithHeader>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Connect Telegram</Text>
        <Text style={styles.subtitle}>
          Enter your Telegram username to receive alerts on Telegram
        </Text>

        <View style={styles.inputRow}>
          <View style={styles.atSign}>
            <Text style={styles.atText}>@</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="your_telegram_username"
            placeholderTextColor="#9ca3af"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={submitUsername}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Submit</Text>
          )}
        </TouchableOpacity>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>How to find your Telegram username?</Text>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Open Telegram on your phone and go to{" "}
              <Text style={styles.bold}>Settings</Text>
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Tap on your <Text style={styles.bold}>profile picture</Text> at the top
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Your username is shown below your name. If you don't have one, set it
              there.
            </Text>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </ScreenWithHeader>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f7" },
  content: { padding: 24, paddingTop: 32 },
  title: { fontSize: 22, fontWeight: "700", color: "#1a202c", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: 28, lineHeight: 20 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
    overflow: "hidden",
  },
  atSign: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  atText: { fontSize: 16, color: "#64748b", fontWeight: "600" },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1a202c",
  },
  button: {
    backgroundColor: "#5b4d8e",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 36,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "white", fontSize: 15, fontWeight: "700" },
  stepsContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  step: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#5b4d8e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 1,
  },
  stepNumberText: { color: "white", fontSize: 12, fontWeight: "700" },
  stepText: { flex: 1, fontSize: 13, color: "#475569", lineHeight: 20 },
  bold: { fontWeight: "700", color: "#1e293b" },
});

export default ActivateTelegram;
