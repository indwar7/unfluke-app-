


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Clipboard,
  Linking,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import Toast from "react-native-toast-message";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Feather,
  MaterialCommunityIcons,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

import { router } from "expo-router";
import { MembershipPlansList } from "../../redux/Unfluke_slices/thunks";
import {
  postChangePassword,
  postData,
  postEmailSendOtp,
  postVerifyEmailOtp,
} from "../../Unfluke_helpers/backend_helper";
import { loginSuccess } from "../../redux//Unfluke_slices/auth/login/reducer";
import OTPVerificationModal from "../../components/UnflukeMain/Authentication/OtpVerificationProfile";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { KeyboardAvoidingView } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import ThemeToggle from "@/components/ui/ThemeToggle";


const Settings = () => {
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("1");
  const { width } = useWindowDimensions()
  const isTablet = width >= 768;

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // OTP Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Account info state
  const [accountInfo, setAccountInfo] = useState({
    plan: "",
    totalAlerts: 0,
    totalVirtual: 0,
    totalbacktest: 0,
    backtestWidth: "",
    emailWidth: "",
    telegramWidth: "",
    whatsappWidth: "",
    virtualWidth: "",
  });

  const [usersTier, setUsersTier] = useState({
    backtests: "",
    charts_crypto: "",
    charts_equities: "",
    charts_fno: "",
    cost: "",
    live_scanner_emails: "",
    live_scanner_telegrams: "",
    options_analyzer: "",
    scans_limit: "",
    scans_max_results: "",
    scans_start_year: "",
    tier: "",
    virtual_trading: "",
  });

  // Selectors
  const authUser = createSelector(
    (state) => state.Login,
    (auth) => auth.user
  );
  const membershipPlans = createSelector(
    (state) => state.MemebershipPlans,
    (tiers) => tiers.tiers
  );
  const user = useSelector(authUser);
  const tiers = useSelector(membershipPlans);

  // user can briefly become null during logout — guard every access so the
  // screen never crashes while ScreenWithHeader redirects to /login.
  const [email, setEmail] = useState(user?.email);
  const [isEmailVerified, setIsEmailVerified] = useState(!!user?.emailVerified);
  const [isSendingOtp, setIsSendingOtp] = useState(false);


  // Handle email OTP verification
  const handleVerify = async (otpValue) => {
    try {
      // Get stored response from AsyncStorage
      const respStorageString = await AsyncStorage.getItem("response");
      const respStorage = respStorageString ? JSON.parse(respStorageString) : null;

      // Get stored email from AsyncStorage
      const storedEmail = await AsyncStorage.getItem("email") || email;

      if (!respStorage || !respStorage.hash) {
        Toast.show({
          type: "error",
          text1: "OTP session expired",
          text2: "Please resend OTP",
          position: "top",
          visibilityTime: 3000,
          autoHide: true,
        });
        return;
      }

      const payload = {
        phone: respStorage.phone,
        hash: respStorage.hash,
        otp: otpValue,
        email: storedEmail,
      };

      const verificationResp = await postVerifyEmailOtp(payload);
      if (!verificationResp) throw new Error("No response from server");

      if (verificationResp.msg && /incorrect/i.test(verificationResp.msg)) {
        throw new Error("Incorrect OTP");
      }

      const serverUser = verificationResp.data || verificationResp.user || null;
      const updatedUser = {
        ...user,
        ...(serverUser || {}),
        email: storedEmail,
        emailVerified: true,
      };

      // Store updated user in AsyncStorage
      await AsyncStorage.setItem("authUser", JSON.stringify(updatedUser));

      // Remove response from AsyncStorage
      await AsyncStorage.removeItem("response");

      dispatch(loginSuccess(updatedUser));
      setIsEmailVerified(true);
      setEmail(storedEmail);

      Toast.show({
        type: "success",
        text1: verificationResp.msg || "Email verified",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
    } catch (err) {
      console.error("Email OTP verify error", err);
      Toast.show({
        type: "error",
        text1: "Invalid OTP",
        text2: "Please try again",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
      throw err;
    }
  };

  const isEmpty = (value) => !value;
  const isLength = (password) => password.length < 6;
  const isMatch = (password, cf_password) => password === cf_password;

  const changeYourPassword = async () => {
    if (isEmpty(oldPassword) || isEmpty(newPassword) || isEmpty(confirmPassword)) {
      Toast.show({
        type: "error",
        text1: "Please fill all the details",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
      return;
    }
    if (isLength(oldPassword) || isLength(newPassword) || isLength(confirmPassword)) {
      Toast.show({
        type: "error",
        text1: "Password must be at least 6 characters",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
      return;
    }
    if (!isMatch(newPassword, confirmPassword)) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
      return;
    }
    try {
      const res = await postChangePassword({
        userId: user._id,
        oldPassword,
        newPassword,
      });
      if (res) {
        Toast.show({
          type: "success",
          text1: "Password changed successfully",
          position: "top",
          visibilityTime: 3000,
          autoHide: true,
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err.response?.data?.msg || "Failed to change password",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

  const deactivateTelegram = async () => {
    try {
      const res = await postData(`api/alert/deactivateTelegram`, {
        userId: user._id,
        username: user.telegramUsername,
      });
      if (res && (res.status === 200 || res.msg)) {
        const updatedUser = { ...user, telegramUsername: "", telegramChatID: "" };
        await AsyncStorage.setItem("authUser", JSON.stringify(updatedUser));
        dispatch(loginSuccess(updatedUser));
        Toast.show({
          type: "info",
          text1: "Telegram service deactivated",
          position: "top",
          visibilityTime: 3000,
          autoHide: true,
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed to deactivate Telegram",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };


  const handleCopyLink = () => {
    if (user.hisReferral) {
      const text = "https://unfluke.in/signup/" + user.hisReferral;
      Clipboard.setString(text);
      Toast.show({
        type: "success",
        text1: "Link copied to clipboard",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Could not copy link",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

  const handleSendOtp = async () => {
    try {
      setIsSendingOtp(true);
      const resp = await postEmailSendOtp({
        phone: user.phoneNos,
        email,
      });
      if (resp.phone) {
        resp.email = email;

        // Store response in AsyncStorage
        await AsyncStorage.setItem("response", JSON.stringify(resp));

        // Store email in AsyncStorage
        await AsyncStorage.setItem("email", email);

        toggleModal();
      } else {
        Toast.show({
          type: "error",
          text1: resp.msg || "Failed to send OTP",
          position: "top",
          visibilityTime: 3000,
          autoHide: true,
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error sending OTP",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    tiers.forEach((plan) => {
      if (user.tier == plan.tier) {
        setUsersTier(plan);
        let planName =
          plan.tier == 0
            ? "Free"
            : plan.tier == 1
              ? "Basic"
              : plan.tier == 2
                ? "Advanced"
                : plan.tier == 3
                  ? "Pro"
                  : "No Info Found";
        setAccountInfo({
          plan: planName,
          totalAlerts: plan.live_scanner_emails,
          totalVirtual: plan.virtual_trading,
          totalbacktest: plan.backtests,
          backtestWidth: (user.backtest / plan.backtests) * 100,
          emailWidth: (user.emailNotification / plan.live_scanner_emails) * 100,
          telegramWidth: (user.telegramNotification / plan.live_scanner_emails) * 100,
          whatsappWidth: (user.whatsappNotification / plan.live_scanner_emails) * 100,
          virtualWidth: (user.virtualTrades / plan.virtual_trading) * 100,
        });
      }
    });
  }, [tiers]);

  useEffect(() => {
    if (tiers.length == 0) {
      dispatch(MembershipPlansList());
    }
  }, [dispatch]);

  // During logout `user` becomes null; bail out of the render to avoid
  // reading user.* on null. ScreenWithHeader handles the redirect to /login.
  if (!user) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        <View style={s.content}>
          <View style={isTablet ? s.rowLayout : s.columnLayout}>
            {/* Left Profile Card */}
            <View style={[isTablet ? s.leftCard : s.fullWidthCard, {
              width: isTablet ? "25%" : "100%",
            }]}>
              <View style={s.card}>
                {/* User Avatar */}
                <View style={s.avatarContainer}>
                  <View style={s.avatar}>
                    <Feather name="user" size={40} color={c.gold} />
                  </View>
                </View>

                {/* User Name */}
                <Text style={s.userName}>{user.name}</Text>

                {/* Account Info */}
                <View style={s.accountInfoContainer}>
                  <Text style={s.accountInfoLabel}>Account Information</Text>
                  <View style={s.planBadge}>
                    <Ionicons name="star" size={11} color={c.onGold} />
                    <Text style={s.planBadgeText}>{accountInfo.plan}</Text>
                  </View>
                </View>

                {/* Appearance / Theme toggle */}
                <ThemeToggle style={{ marginBottom: 16 }} />

                {/* Alerts Notification Section */}
                <View style={s.alertsSection}>
                  <Text style={s.alertsSectionTitle}>Alerts Notification</Text>

                  {/* Telegram */}
                  <View style={s.alertRow}>
                    <View style={s.telegramIcon}>
                      <MaterialCommunityIcons
                        name="send-circle"
                        size={18}
                        color={c.onGold}
                      />
                    </View>
                    {user.telegramUsername ? (
                      <View style={s.alertInputContainer}>
                        <TextInput
                          style={s.alertInput}
                          value={user.telegramUsername}
                          editable={false}
                          placeholder="Username"
                          placeholderTextColor={c.textMuted}
                        />
                        <View style={s.alertActions}>
                          <TouchableOpacity
                            style={s.openButton}
                            onPress={() => Linking.openURL("https://t.me/unflukebotbot")}
                          >
                            <MaterialIcons name="open-in-new" size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={s.closeButton}
                            onPress={deactivateTelegram}
                          >
                            <Ionicons name="close" size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={s.alertInputContainer}
                        onPress={() => router.push("/activate-telegram")}
                      >
                        <Text style={[s.alertInput, { color: c.textMuted, paddingVertical: 10 }]}>
                          Not Connected
                        </Text>
                        <View style={s.warningButton}>
                          <Ionicons name="warning" size={14} color="#FFFFFF" />
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Email */}
                  <View style={s.alertRow}>
                    <View style={s.emailIcon}>
                      <MaterialCommunityIcons name="email" size={18} color={c.onGold} />
                    </View>
                    {isEmailVerified ? (
                      <View style={s.alertInputContainer}>
                        <TextInput
                          style={s.alertInput}
                          value={email || user.email}
                          editable={false}
                          placeholderTextColor={c.textMuted}
                        />
                        <View style={s.checkButton}>
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        </View>
                      </View>
                    ) : (
                      <View style={s.alertInputContainer}>
                        <TextInput
                          style={s.alertInput}
                          value={email}
                          onChangeText={setEmail}
                          placeholder="Enter email"
                          placeholderTextColor={c.textMuted}
                        />
                        <TouchableOpacity
                          style={s.warningButton}
                          onPress={handleSendOtp}
                          disabled={isSendingOtp}
                        >
                          {isSendingOtp ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <MaterialIcons name="open-in-new" size={14} color="#FFFFFF" />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Email Verification Status */}
                  <View
                    style={[
                      s.verificationBox,
                      isEmailVerified
                        ? s.verificationBoxSuccess
                        : s.verificationBoxError,
                    ]}
                  >
                    <View style={s.verificationContent}>
                      <View style={s.verificationLeft}>
                        <View
                          style={[
                            s.verificationIconContainer,
                            isEmailVerified
                              ? s.verificationIconSuccess
                              : s.verificationIconError,
                          ]}
                        >
                          {isEmailVerified ? (
                            <Ionicons name="checkmark-circle" size={20} color={c.success} />
                          ) : (
                            <Ionicons name="alert-circle" size={20} color={c.error} />
                          )}
                        </View>
                        <View style={s.verificationTextContainer}>
                          <Text
                            style={[
                              s.verificationTitle,
                              isEmailVerified
                                ? s.verificationTitleSuccess
                                : s.verificationTitleError,
                            ]}
                          >
                            {isEmailVerified ? "Email Verified" : "Email Not Verified"}
                          </Text>
                          <Text
                            style={[
                              s.verificationDescription,
                              isEmailVerified
                                ? s.verificationDescSuccess
                                : s.verificationDescError,
                            ]}
                          >
                            {isEmailVerified
                              ? "Your email has been verified"
                              : "Please verify your email"}
                          </Text>
                        </View>
                      </View>
                      {!isEmailVerified && (
                        <TouchableOpacity
                          style={s.resendButton}
                          onPress={handleSendOtp}
                          disabled={isSendingOtp}
                        >
                          <MaterialCommunityIcons name="send" size={16} color={c.onGold} />
                          <Text style={s.resendButtonText}>
                            {isSendingOtp ? "Sending..." : "Resend"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {!isEmailVerified && (
                      <View style={s.verificationFooter}>
                        <Text style={s.verificationFooterText}>
                          Check your inbox and enter the OTP
                        </Text>
                        <TouchableOpacity onPress={handleSendOtp}>
                          <Text style={s.verifyNowText}>Verify Now</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {isEmailVerified && (
                      <View style={s.securityFooter}>
                        <MaterialCommunityIcons name="shield-check" size={16} color={c.success} />
                        <Text style={s.securityText}>Account Security Enhanced</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Right Content Card */}
            <View style={[isTablet ? s.rightCard : s.fullWidthCard, {
              width: isTablet ? "75%" : "100%",
            }]}>
              <View style={[s.card, s.rightCardContent]}>
                {/* Tabs Header */}
                <View style={s.tabsContainer}>
                  <View style={s.tabsWrapper}>
                    <TouchableOpacity
                      style={[
                        s.tab,
                        activeTab === "1" && s.tabActive,
                      ]}
                      onPress={() => setActiveTab("1")}
                    >
                      <Text
                        style={[
                          s.tabText,
                          activeTab === "1" && s.tabTextActive,
                        ]}
                      >
                        Personal Details
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        s.tab,
                        activeTab === "2" && s.tabActive,
                      ]}
                      onPress={() => setActiveTab("2")}
                    >
                      <Text
                        style={[
                          s.tabText,
                          activeTab === "2" && s.tabTextActive,
                        ]}
                      >
                        Change Password
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Tab Content */}
                <ScrollView style={s.tabContent} showsVerticalScrollIndicator={false}>
                  {activeTab === "1" && (
                    <View>
                      {/* Personal Info */}
                      <View style={s.personalInfoSection}>
                        <View style={[s.inputRow, {
                          flexDirection: isTablet ? "row" : "column",
                        }]}>
                          <View style={s.inputGroup}>
                            <Text style={s.label}>Full Name</Text>
                            <TextInput
                              style={s.input}
                              value={user.name}
                              editable={false}
                              placeholderTextColor={c.textMuted}
                            />
                          </View>
                          <View style={s.inputGroup}>
                            <Text style={s.label}>Phone Number</Text>
                            <TextInput
                              style={s.input}
                              value={user.phoneNos}
                              editable={false}
                              placeholderTextColor={c.textMuted}
                            />
                          </View>
                        </View>
                        <View style={s.inputGroup}>
                          <Text style={s.label}>Email Address</Text>
                          <TextInput
                            style={s.input}
                            value={user.email}
                            editable={false}
                            placeholderTextColor={c.textMuted}
                          />
                        </View>
                      </View>

                      {/* Bottom Section */}
                      <View style={s.bottomSection}>
                        {/* Pending Credits */}
                        <View style={s.creditsCard}>
                          <View style={s.creditsHeader}>
                            <MaterialCommunityIcons
                              name="equalizer"
                              size={20}
                              color={c.gold}
                            />
                            <Text style={s.creditsTitle}>Pending Credits</Text>
                          </View>
                          <View style={s.creditsContent}>
                            {[
                              {
                                label: "Alerts",
                                val: user.backtests,
                                max: usersTier.backtests,
                                color: c.info,
                              },
                              {
                                label: "Scanners",
                                val: user.scans_limit,
                                max: usersTier.scans_limit,
                                color: c.gold,
                              },
                              {
                                label: "Advanced Backtest",
                                val: user.live_scanner_emails,
                                max: usersTier.live_scanner_emails,
                                color: c.warning,
                              },
                            ].map((item, i) => (
                              <View key={i} style={s.creditItem}>
                                <Text style={s.creditLabel}>{item.label}</Text>
                                <View style={s.creditValue}>
                                  <View
                                    style={[
                                      s.creditDot,
                                      { backgroundColor: item.color },
                                    ]}
                                  />
                                  <Text style={s.creditText}>
                                    {item.val}/{item.max} Pending
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>

                        {/* Share Referral Code */}
                        <View style={s.referralCard}>
                          <View style={s.referralHeader}>
                            <MaterialCommunityIcons
                              name="share-variant"
                              size={20}
                              color={c.gold}
                            />
                            <Text style={s.referralTitle}>Share your Code</Text>
                          </View>
                          <View style={s.referralContent}>
                            <Text style={s.referralCode}>{user.hisReferral}</Text>
                            <Text style={s.referralDescription}>
                              Share the redeem code with others to get extra cashbacks and
                              rewards
                            </Text>
                            <TouchableOpacity
                              style={s.copyButton}
                              onPress={handleCopyLink}
                            >
                              <MaterialCommunityIcons
                                name="content-copy"
                                size={16}
                                color={c.onGold}
                              />
                              <Text style={s.copyButtonText}>Copy Link</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}

                  {activeTab === "2" && (
                    <View style={s.passwordSection}>
                      <View style={s.inputGroup}>
                        <Text style={s.label}>Current Password</Text>
                        <TextInput
                          style={s.input}
                          placeholder="Enter current password"
                          placeholderTextColor={c.textMuted}
                          secureTextEntry
                          value={oldPassword}
                          onChangeText={setOldPassword}
                        />
                      </View>
                      <View style={s.inputGroup}>
                        <Text style={s.label}>New Password</Text>
                        <TextInput
                          style={s.input}
                          placeholder="Enter new password"
                          placeholderTextColor={c.textMuted}
                          secureTextEntry
                          value={newPassword}
                          onChangeText={setNewPassword}
                        />
                      </View>
                      <View style={s.inputGroup}>
                        <Text style={s.label}>Confirm Password</Text>
                        <TextInput
                          style={s.input}
                          placeholder="Confirm password"
                          placeholderTextColor={c.textMuted}
                          secureTextEntry
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                        />
                      </View>
                      <TouchableOpacity
                        style={s.updateButton}
                        onPress={changeYourPassword}
                      >
                        <Text style={s.updateButtonText}>Update Password</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>

        {/* OTP Modal */}
        <OTPVerificationModal
          isOpen={isModalOpen}
          toggle={toggleModal}
          onVerify={handleVerify}
          digits={6}
          title="Verify Your Email"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  content: {
    padding: 12,
    paddingBottom: 90
  },
  rowLayout: {
    flexDirection: "row",
    gap: 16,
  },
  columnLayout: {
    flexDirection: "column",
    gap: 16,
  },
  leftCard: {
  },
  rightCard: {
  },
  fullWidthCard: {
    width: "100%",
  },
  card: {
    backgroundColor: c.card,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#0B0D12",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: c.border,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: c.goldLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: c.gold,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    color: c.text,
  },
  accountInfoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  accountInfoLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: c.textMuted,
    marginBottom: 10,
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: c.gold,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
  },
  planBadgeText: {
    color: c.onGold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  alertsSection: {
    borderTopWidth: 1,
    borderTopColor: c.border,
    paddingTop: 16,
  },
  alertsSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    color: c.text,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  telegramIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: c.gold,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  emailIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: c.gold,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  alertInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  alertInput: {
    flex: 1,
    backgroundColor: c.inputBg,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: c.text,
  },
  alertActions: {
    flexDirection: "row",
    gap: 4,
  },
  openButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: c.success,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: c.error,
    alignItems: "center",
    justifyContent: "center",
  },
  warningButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: c.error,
    alignItems: "center",
    justifyContent: "center",
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: c.success,
    alignItems: "center",
    justifyContent: "center",
  },
  verificationBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  verificationBoxSuccess: {
    backgroundColor: c.successLight,
    borderColor: c.success,
  },
  verificationBoxError: {
    backgroundColor: c.errorLight,
    borderColor: c.error,
  },
  verificationContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verificationLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  verificationIconContainer: {
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  verificationIconSuccess: {
    backgroundColor: c.successLight,
  },
  verificationIconError: {
    backgroundColor: c.errorLight,
  },
  verificationTextContainer: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  verificationTitleSuccess: {
    color: c.success,
  },
  verificationTitleError: {
    color: c.error,
  },
  verificationDescription: {
    fontSize: 12,
  },
  verificationDescSuccess: {
    color: c.success,
  },
  verificationDescError: {
    color: c.error,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.gold,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  resendButtonText: {
    color: c.onGold,
    fontSize: 12,
    fontWeight: "700",
  },
  verificationFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: c.error,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verificationFooterText: {
    fontSize: 12,
    color: c.error,
    flex: 1,
  },
  verifyNowText: {
    fontSize: 12,
    color: c.error,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  securityFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: c.success,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    color: c.success,
    fontWeight: "700",
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    paddingBottom: 16,
    marginBottom: 16,
  },
  tabsWrapper: {
    flexDirection: "row",
    backgroundColor: c.inputBg,
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: c.gold,
    shadowColor: "#C99A2E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: c.textMuted,
  },
  tabTextActive: {
    color: c.onGold,
  },
  tabContent: {
    flex: 1,
  },
  personalInfoSection: {
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    paddingBottom: 16,
    marginBottom: 24,
  },
  inputRow: {
    gap: 1,
    marginBottom: 2,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: c.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: c.inputBg,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: c.text,
  },
  bottomSection: {
    gap: 16,
  },
  creditsCard: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 14,
    backgroundColor: c.surface,
  },
  creditsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  creditsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: c.text,
  },
  creditsContent: {
    padding: 16,
    gap: 12,
  },
  creditItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: c.inputBg,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.borderLight,
  },
  creditLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: c.text,
  },
  creditValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  creditDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  creditText: {
    fontSize: 14,
    fontWeight: "600",
    color: c.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  referralCard: {
    borderRadius: 14,
  },
  referralHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  referralTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: c.text,
  },
  referralContent: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: c.goldLight,
    borderWidth: 1,
    borderColor: c.gold,
    alignItems: "center",
  },
  referralCode: {
    fontSize: 32,
    fontWeight: "800",
    color: isDark ? c.goldBright : c.goldDeep,
    marginBottom: 8,
    letterSpacing: 1,
  },
  referralDescription: {
    fontSize: 14,
    color: c.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.gold,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  copyButtonText: {
    color: c.onGold,
    fontSize: 14,
    fontWeight: "800",
  },
  passwordSection: {
    gap: 2,
  },
  updateButton: {
    backgroundColor: c.gold,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#C99A2E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  updateButtonText: {
    color: c.onGold,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});

export default Settings;