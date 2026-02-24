import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar,
} from "react-native";
import {
  Bell,
  Moon,
  Sun,
  User,
} from "lucide-react-native";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/Unfluke_slices/thunks";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SidebarMenu from "./SidebarMenu";

/**
 * AppHeader — SINGLE SOURCE OF TRUTH
 * This component MUST be used on EVERY screen.
 * Never duplicate header code anywhere else.
 */

export const AppHeader = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [menuVisible, setMenuVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profilePopupVisible, setProfilePopupVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Redux selectors - safe access
  const user = useSelector((state: any) => state?.Login?.user ?? null);
  const isUserLogout = useSelector(
    (state: any) => state?.Login?.isUserLogout ?? false
  );

  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    setProfilePopupVisible(false);
    dispatch(logoutUser() as any);
  }, [dispatch]);

  useEffect(() => {
    if (isUserLogout && isLoggingOut) {
      try {
        router.replace("/login");
      } catch (error) {
        console.error("Error during logout:", error);
      }
      setIsLoggingOut(false);
    }
  }, [isUserLogout, isLoggingOut]);

  return (
    <>
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#ffffff"
          translucent={false}
        />
        <View style={styles.headerRow}>
          {/* Hamburger */}
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={styles.hamburger}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.6}
          >
            <Text style={styles.hamburgerText}>☰</Text>
          </TouchableOpacity>

          {/* Logo */}
          <TouchableOpacity
            onPress={() => router.push("/dashboard" as any)}
            activeOpacity={0.7}
          >
            <Image
              source={require("../assets/images/unfluke/UNFLUKE -09-New.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Right Icons */}
          <View style={styles.rightIcons}>
            <TouchableOpacity
              onPress={() => setIsDarkMode(!isDarkMode)}
              style={styles.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isDarkMode ? (
                <Sun size={20} color="#333" />
              ) : (
                <Moon size={20} color="#333" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Bell size={20} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setProfilePopupVisible((prev) => !prev)}
              style={styles.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={styles.profileCircle}>
                <User size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Popup */}
        {profilePopupVisible && !isLoggingOut && (
          <>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setProfilePopupVisible(false)}
            />
            <View style={styles.profilePopup}>
              <Text style={styles.profileName}>
                Welcome,{" "}
                <Text style={styles.nameHighlight}>
                  {user?.name || "User"}
                </Text>
              </Text>
              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={() => {
                  setProfilePopupVisible(false);
                  router.push("/profile" as any);
                }}
              >
                <Text style={styles.profileMenuText}>👤 Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={() => {
                  setProfilePopupVisible(false);
                  router.push("/leads" as any);
                }}
              >
                <Text style={styles.profileMenuText}>💰 My Earnings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={() => {
                  setProfilePopupVisible(false);
                  router.push("/pricing" as any);
                }}
              >
                <Text style={styles.profileMenuText}>💎 Pricing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                disabled={isLoggingOut}
              >
                <Text style={styles.logoutText}>
                  {isLoggingOut ? "Logging out..." : "🚪 Logout"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Sidebar — always rendered from the header, never duplicated */}
      <SidebarMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
};

/**
 * ScreenWithHeader — wraps any screen content with the shared AppHeader.
 * Use this as the root wrapper in every screen file.
 */
export const ScreenWithHeader: React.FC<{
  children: React.ReactNode;
  style?: any;
}> = ({ children, style }) => {
  return (
    <View style={[styles.screenContainer, style]}>
      <AppHeader />
      <View style={styles.screenContent}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    zIndex: 100,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    paddingHorizontal: 14,
    paddingTop: 4,
    backgroundColor: "#fff",
  },
  hamburger: {
    padding: 8,
    marginRight: 8,
  },
  hamburgerText: {
    fontSize: 22,
    color: "#333",
  },
  logo: {
    width: 80,
    height: 28,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    gap: 4,
  },
  iconBtn: {
    padding: 8,
    position: "relative",
  },
  profileCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  profilePopup: {
    position: "absolute",
    top: 60,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 1000,
    width: 200,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  profileName: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: "#374151",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  nameHighlight: {
    color: "#4f46e5",
    fontWeight: "700",
  },
  profileMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileMenuText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  logoutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
  },
  logoutText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 14,
  },
  // Screen wrapper styles
  screenContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  screenContent: {
    flex: 1,
  },
});

export default AppHeader;
