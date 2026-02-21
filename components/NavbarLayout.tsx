import React, { useState, useEffect, Dispatch, SetStateAction, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import {
  Bell,
  Moon,
  Sun,
  User,
} from "lucide-react-native";
import { Link, router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/Unfluke_slices/thunks";
import { createSelector } from "reselect";

import NotificationDropdown from "./ui/NotificationDropdown";

interface NavbarLayoutProps {
  setMenuVisible: Dispatch<SetStateAction<boolean>>;
}

// Safe status bar height
const STATUS_BAR_HEIGHT = Platform.OS === "android" ? (StatusBar.currentHeight || 24) : 44;

export const NavbarLayout = ({ setMenuVisible }: NavbarLayoutProps) => {
  const notificationRef = useRef<any>(null);
  const [badgeCount, setBadgeCount] = useState(0);
  const [showBadge, setShowBadge] = useState(false);

  const updateBadgeInfo = () => {
    if (notificationRef.current) {
      try {
        const count = notificationRef.current.getBadgeCount?.() ?? 0;
        const hasBadge = notificationRef.current.hasBadge?.() ?? false;
        setBadgeCount(count);
        setShowBadge(hasBadge);
      } catch { }
    }
  };

  useEffect(() => {
    const interval = setInterval(updateBadgeInfo, 5000);
    updateBadgeInfo();
    return () => clearInterval(interval);
  }, []);

  const handleBellPress = () => {
    notificationRef.current?.toggleDropdown();
    setTimeout(updateBadgeInfo, 500);
  };

  const dispatch = useDispatch();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profilePopupVisible, setProfilePopupVisible] = useState(false);

  // Redux selectors - safe access
  const user = useSelector((state: any) => state?.Login?.user ?? null);
  const isUserLogout = useSelector((state: any) => state?.Login?.isUserLogout ?? false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setProfilePopupVisible(false);
    dispatch(logoutUser() as any);
  };

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
    <View style={styles.navbarWrapper}>
      {/* Navbar Row */}
      <View style={styles.navbar}>
        {/* Hamburger */}
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.hamburger}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.hamburgerText}>☰</Text>
        </TouchableOpacity>

        {/* Logo */}
        <TouchableOpacity onPress={() => router.push("/dashboard" as any)} activeOpacity={0.7}>
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
            {isDarkMode ? <Sun size={20} color="#333" /> : <Moon size={20} color="#333" />}
          </TouchableOpacity>

          <View style={styles.bellContainer}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleBellPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Bell size={20} color="#333" />
              {showBadge && badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

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

      {/* Profile Popup - rendered INSIDE wrapper with correct zIndex */}
      {profilePopupVisible && !isLoggingOut && (
        <>
          {/* Backdrop to dismiss */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setProfilePopupVisible(false)}
          />
          <View style={styles.profilePopup}>
            <Text style={styles.profileName}>
              Welcome, <Text style={styles.nameHighlight}>{user?.name || "User"}</Text>
            </Text>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => { setProfilePopupVisible(false); router.push("/profile" as any); }}
            >
              <Text style={styles.profileMenuText}>👤 Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => { setProfilePopupVisible(false); router.push("/leads" as any); }}
            >
              <Text style={styles.profileMenuText}>💰 My Earnings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => { setProfilePopupVisible(false); router.push("/pricing" as any); }}
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

      <NotificationDropdown
        ref={notificationRef}
        onBadgeUpdate={updateBadgeInfo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  navbarWrapper: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    zIndex: 100,
    elevation: 4,
    // NO marginBottom: -80! That was the main layout-breaking bug.
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: STATUS_BAR_HEIGHT + 4,
    paddingBottom: 10,
    paddingHorizontal: 14,
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
  bellContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
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
    top: STATUS_BAR_HEIGHT + 50,
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
});