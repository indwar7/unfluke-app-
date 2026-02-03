


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


const Settings = () => {
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

  const [email, setEmail] = useState(user.email);
  const [isEmailVerified, setIsEmailVerified] = useState(!!user.emailVerified);
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
    const res = await postData(`api/alert/deactivateTelegram`, {
      userId: user._id,
      username: user.telegramUsername,
    });
    if (res.status === 200) {
      Toast.show({
        type: "info",
        text1: "Telegram service deactivated",
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

  return (
     <KeyboardAvoidingView 
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
  >
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={isTablet ? styles.rowLayout : styles.columnLayout}>
          {/* Left Profile Card */}
          <View style={[isTablet ? styles.leftCard : styles.fullWidthCard,{    width: isTablet ? "25%" : "100%",
}]}>
            <View style={styles.card}>
              {/* User Avatar */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Feather name="user" size={40} color="#9CA3AF" />
                </View>
              </View>

              {/* User Name */}
              <Text style={styles.userName}>{user.name}</Text>

              {/* Account Info */}
              <View style={styles.accountInfoContainer}>
                <Text style={styles.accountInfoLabel}>Account Information</Text>
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>{accountInfo.plan}</Text>
                </View>
              </View>

              {/* Alerts Notification Section */}
              <View style={styles.alertsSection}>
                <Text style={styles.alertsSectionTitle}>Alerts Notification</Text>

                {/* Telegram */}
                <View style={styles.alertRow}>
                  <View style={styles.telegramIcon}>
                    <MaterialCommunityIcons
                      name="send-circle"
                      size={18}
                      color="white"
                    />
                  </View>
                  {user.telegramUsername ? (
                    <View style={styles.alertInputContainer}>
                      <TextInput
                        style={styles.alertInput}
                        value={user.telegramUsername}
                        editable={false}
                        placeholder="Username"
                      />
                      <View style={styles.alertActions}>
                        <TouchableOpacity
                          style={styles.openButton}
                          onPress={() => Linking.openURL("https://t.me/unflukebotbot")}
                        >
                          <MaterialIcons name="open-in-new" size={14} color="white"/>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.closeButton}
                          onPress={deactivateTelegram}
                        >
                          <Ionicons name="close" size={14} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.alertInputContainer}>
                      <TextInput
                        style={styles.alertInput}
                        placeholder="Username"
                      />
                      <TouchableOpacity style={styles.warningButton}>
                        <Ionicons name="warning" size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Email */}
                <View style={styles.alertRow}>
                  <View style={styles.emailIcon}>
                    <MaterialCommunityIcons name="email" size={18} color="white"/>
                  </View>
                  {isEmailVerified ? (
                    <View style={styles.alertInputContainer}>
                      <TextInput
                        style={styles.alertInput}
                        value={email || user.email}
                        editable={false}
                      />
                      <View style={styles.checkButton}>
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.alertInputContainer}>
                      <TextInput
                        style={styles.alertInput}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter email"
                      />
                      <TouchableOpacity
                        style={styles.warningButton}
                        onPress={handleSendOtp}
                        disabled={isSendingOtp}
                      >
                        {isSendingOtp ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <MaterialIcons name="open-in-new" size={14} color="white" />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Email Verification Status */}
                <View
                  style={[
                    styles.verificationBox,
                    isEmailVerified
                      ? styles.verificationBoxSuccess
                      : styles.verificationBoxError,
                  ]}
                >
                  <View style={styles.verificationContent}>
                    <View style={styles.verificationLeft}>
                      <View
                        style={[
                          styles.verificationIconContainer,
                          isEmailVerified
                            ? styles.verificationIconSuccess
                            : styles.verificationIconError,
                        ]}
                      >
                        {isEmailVerified ? (
                          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        ) : (
                          <Ionicons name="alert-circle" size={20} color="#EF4444" />
                        )}
                      </View>
                      <View style={styles.verificationTextContainer}>
                        <Text
                          style={[
                            styles.verificationTitle,
                            isEmailVerified
                              ? styles.verificationTitleSuccess
                              : styles.verificationTitleError,
                          ]}
                        >
                          {isEmailVerified ? "Email Verified" : "Email Not Verified"}
                        </Text>
                        <Text
                          style={[
                            styles.verificationDescription,
                            isEmailVerified
                              ? styles.verificationDescSuccess
                              : styles.verificationDescError,
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
                        style={styles.resendButton}
                        onPress={handleSendOtp}
                        disabled={isSendingOtp}
                      >
                        <MaterialCommunityIcons name="send" size={16} color="white" />
                        <Text style={styles.resendButtonText}>
                          {isSendingOtp ? "Sending..." : "Resend"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {!isEmailVerified && (
                    <View style={styles.verificationFooter}>
                      <Text style={styles.verificationFooterText}>
                        Check your inbox and enter the OTP
                      </Text>
                      <TouchableOpacity onPress={handleSendOtp}>
                        <Text style={styles.verifyNowText}>Verify Now</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {isEmailVerified && (
                    <View style={styles.securityFooter}>
                      <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />
                      <Text style={styles.securityText}>Account Security Enhanced</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Right Content Card */}
          <View style={[isTablet ? styles.rightCard : styles.fullWidthCard,{    width: isTablet ? "75%" : "100%",
}]}>
            <View style={[styles.card, styles.rightCardContent]}>
              {/* Tabs Header */}
              <View style={styles.tabsContainer}>
                <View style={styles.tabsWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === "1" && styles.tabActive,
                    ]}
                    onPress={() => setActiveTab("1")}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === "1" && styles.tabTextActive,
                      ]}
                    >
                      Personal Details
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === "2" && styles.tabActive,
                    ]}
                    onPress={() => setActiveTab("2")}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === "2" && styles.tabTextActive,
                      ]}
                    >
                      Change Password
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tab Content */}
              <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                {activeTab === "1" && (
                  <View>
                    {/* Personal Info */}
                    <View style={styles.personalInfoSection}>
                      <View style={[styles.inputRow,{    flexDirection: isTablet ? "row" : "column",
}]}>
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Full Name</Text>
                          <TextInput
                            style={styles.input}
                            value={user.name}
                            editable={false}
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Phone Number</Text>
                          <TextInput
                            style={styles.input}
                            value={user.phoneNos}
                            editable={false}
                          />
                        </View>
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                          style={styles.input}
                          value={user.email}
                          editable={false}
                        />
                      </View>
                    </View>

                    {/* Bottom Section */}
                    <View style={styles.bottomSection}>
                      {/* Pending Credits */}
                      <View style={styles.creditsCard}>
                        <View style={styles.creditsHeader}>
                          <MaterialCommunityIcons
                            name="equalizer"
                            size={20}
                            color="#374151"
                          />
                          <Text style={styles.creditsTitle}>Pending Credits</Text>
                        </View>
                        <View style={styles.creditsContent}>
                          {[
                            {
                              label: "Alerts",
                              val: user.backtests,
                              max: usersTier.backtests,
                              color: "#06B6D4",
                            },
                            {
                              label: "Scanners",
                              val: user.scans_limit,
                              max: usersTier.scans_limit,
                              color: "#2563EB",
                            },
                            {
                              label: "Advanced Backtest",
                              val: user.live_scanner_emails,
                              max: usersTier.live_scanner_emails,
                              color: "#F97316",
                            },
                          ].map((item, i) => (
                            <View key={i} style={styles.creditItem}>
                              <Text style={styles.creditLabel}>{item.label}</Text>
                              <View style={styles.creditValue}>
                                <View
                                  style={[
                                    styles.creditDot,
                                    { backgroundColor: item.color },
                                  ]}
                                />
                                <Text style={styles.creditText}>
                                  {item.val}/{item.max} Pending
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Share Referral Code */}
                      <View style={styles.referralCard}>
                        <View style={styles.referralHeader}>
                          <MaterialCommunityIcons
                            name="share-variant"
                            size={20}
                            color="#374151"
                          />
                          <Text style={styles.referralTitle}>Share your Code</Text>
                        </View>
                        <View style={styles.referralContent}>
                          <Text style={styles.referralCode}>{user.hisReferral}</Text>
                          <Text style={styles.referralDescription}>
                            Share the redeem code with others to get extra cashbacks and
                            rewards
                          </Text>
                          <TouchableOpacity
                            style={styles.copyButton}
                            onPress={handleCopyLink}
                          >
                            <MaterialCommunityIcons
                              name="content-copy"
                              size={16}
                              color="white"
                            />
                            <Text style={styles.copyButtonText}>Copy Link</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {activeTab === "2" && (
                  <View style={styles.passwordSection}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Current Password</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter current password"
                        secureTextEntry
                        value={oldPassword}
                        onChangeText={setOldPassword}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>New Password</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter new password"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Confirm Password</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm password"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.updateButton}
                      onPress={changeYourPassword}
                    >
                      <Text style={styles.updateButtonText}>Update Password</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingTop: 76,
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
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    color: "#111827",
  },
  accountInfoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  accountInfoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  planBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  planBadgeText: {
    color: "#065F46",
    fontSize: 12,
    fontWeight: "600",
  },
  alertsSection: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },
  alertsSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  telegramIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  emailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2563EB",
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
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    color: "#111827",
  },
  alertActions: {
    flexDirection: "row",
    gap: 4,
  },
  openButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  warningButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  verificationBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  verificationBoxSuccess: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  verificationBoxError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
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
    backgroundColor: "#D1FAE5",
  },
  verificationIconError: {
    backgroundColor: "#FEE2E2",
  },
  verificationTextContainer: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  verificationTitleSuccess: {
    color: "#065F46",
  },
  verificationTitleError: {
    color: "#991B1B",
  },
  verificationDescription: {
    fontSize: 12,
  },
  verificationDescSuccess: {
    color: "#059669",
  },
  verificationDescError: {
    color: "#DC2626",
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  resendButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  verificationFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#FECACA",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verificationFooterText: {
    fontSize: 12,
    color: "#B91C1C",
    flex: 1,
  },
  verifyNowText: {
    fontSize: 12,
    color: "#B91C1C",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  securityFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#A7F3D0",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "600",
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 16,
    marginBottom: 16,
  },
  tabsWrapper: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#111827",
  },
  tabContent: {
    flex: 1,
  },
  personalInfoSection: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
  },
  bottomSection: {
    gap: 16,
  },
  creditsCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
  },
  creditsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  creditsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  creditsContent: {
    padding: 16,
    gap: 12,
  },
  creditItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
  },
  creditLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
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
    fontWeight: "500",
    color: "#111827",
  },
  referralCard: {
    borderRadius: 12,
  },
  referralHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  referralContent: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: "#FFE4EC",
    alignItems: "center",
  },
  referralCode: {
    fontSize: 32,
    fontWeight: "700",
    color: "#BA1EA1",
    marginBottom: 8,
  },
  referralDescription: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 16,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  copyButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  passwordSection: {
    gap: 2,
  },
  updateButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Settings;