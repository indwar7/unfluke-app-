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
import { LinearGradient } from "expo-linear-gradient";
import { Send, AtSign, HelpCircle } from "lucide-react-native";

import { postData } from "../Unfluke_helpers/backend_helper";
import { loginSuccess } from "../redux/Unfluke_slices/auth/login/reducer";
import { ScreenWithHeader } from "@/components/AppHeader";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { Surface, SectionLabel } from "@/components/ui/Premium";
import { Radius, Space, Shadow } from "@/constants/Theme";
import { TELEGRAM_ACTIVATION_BOT_URL } from "@/constants/telegram";

const ActivateTelegram = () => {
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLinked, setIsLinked] = useState(false);

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
        // Do NOT auto-launch Telegram here. Leaving the app on a network
        // response rather than a tap is a "forced redirect" pattern to policy
        // scanners, and it also yanked the user out mid-flow. Show the linked
        // state and let them choose to open Telegram.
        setIsLinked(true);
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

  const steps = [
    {
      key: "1",
      node: (
        <Text style={s.stepText}>
          Open Telegram on your phone and go to{" "}
          <Text style={s.bold}>Settings</Text>
        </Text>
      ),
    },
    {
      key: "2",
      node: (
        <Text style={s.stepText}>
          Tap on your <Text style={s.bold}>profile picture</Text> at the top
        </Text>
      ),
    },
    {
      key: "3",
      node: (
        <Text style={s.stepText}>
          Your username is shown below your name. If you don't have one, set it
          there.
        </Text>
      ),
    },
  ];

  return (
    <ScreenWithHeader>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.heroIconWrap}>
          <Send size={26} color={c.gold} strokeWidth={2.2} />
        </View>

        <Text style={s.title}>
          {isLinked ? "Telegram Connected" : "Connect Telegram"}
        </Text>
        <Text style={s.subtitle}>
          {isLinked
            ? "Your username is saved. Open the Unfluke bot and press Start to begin receiving alerts."
            : "Enter your Telegram username to receive alerts on Telegram"}
        </Text>

        {isLinked ? (
          <View style={s.linkedActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[s.button, s.linkedPrimary]}
              onPress={() =>
                Linking.openURL(TELEGRAM_ACTIVATION_BOT_URL).catch(() =>
                  Toast.show({
                    type: "error",
                    text1: "Couldn't open Telegram. Is it installed?",
                    position: "top",
                    visibilityTime: 3000,
                    autoHide: true,
                  })
                )
              }
            >
              <LinearGradient
                colors={[c.goldBright, c.gold, c.goldDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.buttonGradient}
              >
                <View style={s.buttonInner}>
                  <Send size={16} color={c.onGold} strokeWidth={2.4} />
                  <Text style={s.buttonText}>Open Telegram</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={s.secondaryButton}
              onPress={() => router.replace("/profile")}
            >
              <Text style={s.secondaryButtonText}>Back to profile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
        <SectionLabel style={s.fieldLabel}>Telegram Username</SectionLabel>

        <View style={s.inputRow}>
          <View style={s.atSign}>
            <AtSign size={18} color={c.textMuted} strokeWidth={2.2} />
          </View>
          <TextInput
            style={s.input}
            placeholder="your_telegram_username"
            placeholderTextColor={c.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[s.button, isSubmitting && s.buttonDisabled]}
          onPress={submitUsername}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={[c.goldBright, c.gold, c.goldDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.buttonGradient}
          >
            {isSubmitting ? (
              <ActivityIndicator color={c.onGold} />
            ) : (
              <View style={s.buttonInner}>
                <Send size={16} color={c.onGold} strokeWidth={2.4} />
                <Text style={s.buttonText}>Submit</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
          </>
        )}

        <Surface style={s.stepsContainer}>
          <View style={s.stepsHeader}>
            <HelpCircle size={16} color={c.gold} strokeWidth={2.2} />
            <Text style={s.stepsTitle}>
              How to find your Telegram username?
            </Text>
          </View>

          {steps.map((step) => (
            <View key={step.key} style={s.step}>
              <View style={s.stepNumber}>
                <Text style={s.stepNumberText}>{step.key}</Text>
              </View>
              {step.node}
            </View>
          ))}
        </Surface>
      </ScrollView>
      <Toast />
    </ScreenWithHeader>
  );
};

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: Space.xxl, paddingTop: Space.xxxl, paddingBottom: 48 },
    heroIconWrap: {
      width: 56,
      height: 56,
      borderRadius: Radius.lg,
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Space.lg,
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      letterSpacing: -0.4,
      color: c.text,
      marginBottom: Space.sm,
    },
    subtitle: {
      fontSize: 14,
      color: c.textSecondary,
      marginBottom: Space.xxl,
      lineHeight: 20,
    },
    fieldLabel: { marginBottom: Space.sm },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.inputBg,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: c.inputBorder,
      marginBottom: Space.lg,
      overflow: "hidden",
    },
    atSign: {
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRightWidth: 1,
      borderRightColor: c.inputBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    input: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: 15,
      color: c.text,
    },
    button: {
      borderRadius: Radius.md,
      marginBottom: Space.xxxl,
      ...Shadow.gold,
    },
    buttonDisabled: { opacity: 0.6 },
    linkedActions: { marginBottom: Space.xxxl },
    linkedPrimary: { marginBottom: Space.md },
    secondaryButton: {
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonText: {
      color: c.textSecondary,
      fontSize: 15,
      fontWeight: "600",
    },
    buttonGradient: {
      borderRadius: Radius.md,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonInner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    buttonText: {
      color: c.onGold,
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: 0.4,
    },
    stepsContainer: {
      padding: Space.lg,
    },
    stepsHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: Space.lg,
    },
    stepsTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: "700",
      color: c.text,
    },
    step: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: Space.md,
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: Radius.full,
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: c.gold,
      alignItems: "center",
      justifyContent: "center",
      marginRight: Space.md,
      marginTop: 1,
    },
    stepNumberText: { color: c.gold, fontSize: 12, fontWeight: "800" },
    stepText: { flex: 1, fontSize: 13, color: c.textSecondary, lineHeight: 20 },
    bold: { fontWeight: "700", color: c.text },
  });

export default ActivateTelegram;
