import React, { useState, useEffect, Dispatch, SetStateAction, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
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
import { useOnboarding } from "@/redux/contextHelper";


interface NavbarLayoutProps {
  setMenuVisible: Dispatch<SetStateAction<boolean>>;
}

export const NavbarLayout = ({ setMenuVisible }: NavbarLayoutProps) => {
  const notificationRef = useRef(null);
  const [badgeCount, setBadgeCount] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const { height } = useWindowDimensions();

  // Update badge count periodically or when needed
  const updateBadgeInfo = () => {
    if (notificationRef.current) {
      const count = notificationRef.current.getBadgeCount();
      const hasBadge = notificationRef.current.hasBadge();
      setBadgeCount(count);
      setShowBadge(hasBadge);
    }
  };

  useEffect(() => {
    // Check badge info every few seconds or when component mounts
    const interval = setInterval(updateBadgeInfo, 2000);
    updateBadgeInfo(); // Initial check

    return () => clearInterval(interval);
  }, []);

  const handleBellPress = () => {
    notificationRef.current?.toggleDropdown();
    // Update badge after opening (it will be marked as read)
    setTimeout(updateBadgeInfo, 500);
  };

  const dispatch = useDispatch();
  const { restart, isLoggingOut, setIsLoggingOut } = useOnboarding(); // Get global logout state

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profilePopupVisible, setProfilePopupVisible] = useState(false);

  // Redux selector for logout state
  const logoutData = createSelector(
    (state) => state.Login,
    (isUserLogout) => isUserLogout.isUserLogout
  );
  const selectLayoutState = (state) => state;

  const loginpageData = createSelector(selectLayoutState, (state) => ({
    user: state.Login.user, // Make sure this path is correct
  }));

  const { user } =
    useSelector(loginpageData);

  const isUserLogout = useSelector(logoutData);

  // Handle logout process
  const handleLogout = () => {
    setIsLoggingOut(true); // Set global logout state
    setProfilePopupVisible(false);
    dispatch(logoutUser() as any);
  };

  // Effect to handle logout completion
  useEffect(() => {
    if (isUserLogout && isLoggingOut) {
      const performLogout = async () => {
        try {
          console.log("Logout successful");

          // Call restart to reset onboarding - this will automatically switch to login
          restart();
          router.replace("/login");
        } catch (error) {
          console.error("Error during logout:", error);
          setIsLoggingOut(false); // Reset on error
        }
      };

      performLogout();
    }
  }, [isUserLogout, isLoggingOut, restart, setIsLoggingOut]);

  return (
    <View style={{ width: "100%", backgroundColor: "#fff" }}>
      {/* Navbar */}
      <View style={[styles.navbar, { paddingTop: height * 0.035 }]}>
        <Link href="/dashboard">
          <Image
            source={require("../assets/images/unfluke/UNFLUKE -09-New.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Link>

        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.hamburger}
        >
          <Text style={styles.hamburgerText}>☰</Text>
        </TouchableOpacity>

        <View style={styles.rightIcons}>
          <TouchableOpacity
            onPress={() => setIsDarkMode(!isDarkMode)}
            style={styles.iconBtn}
          >
            {isDarkMode ? (
              <Sun size={20} color="black" />
            ) : (
              <Moon size={20} color="black" />
            )}
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.iconBtn}>
            <Bell size={20} color="black" />
          </TouchableOpacity> */}
          <View style={styles.bellContainer}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleBellPress}
            >
              <Bell size={20} color="black" />
              {showBadge && badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Notification Dropdown (invisible until opened) */}

          <View>
            <TouchableOpacity
              onPress={() => setProfilePopupVisible((prev) => !prev)}
              style={styles.iconBtn}
            >
              <User size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile Popup */}
      {profilePopupVisible && !isLoggingOut && ( // Hide popup when logging out
        <Pressable
          style={styles.profilePopup}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.profileName}>Welcome, <Text style={styles.name}>{user ? user["name"] : "New User"}</Text></Text>
          <TouchableOpacity>
            <Link href="/profile" onPress={() => setProfilePopupVisible(false)} style={styles.profileoption}>
              <Text>Profile</Text>
            </Link>
          </TouchableOpacity>
          <TouchableOpacity>
            <Link href="/leads" onPress={() => setProfilePopupVisible(false)} style={styles.profileoption}>
              <Text >My Earnings</Text>
            </Link>
          </TouchableOpacity>
          <TouchableOpacity>
            <Link href="/pricing" onPress={() => setProfilePopupVisible(false)} style={styles.profileName}>
              <Text>Pricing</Text>
            </Link>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <View style={styles.logoutContent}>
              {isLoggingOut && (
                <ActivityIndicator size="small" color="red" style={styles.logoutSpinner} />
              )}
              <Text style={[styles.logoutText, isLoggingOut && styles.logoutTextDisabled]}>
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Text>
            </View>
          </TouchableOpacity>
        </Pressable>
      )}
      <NotificationDropdown
        ref={notificationRef}
        onBadgeUpdate={updateBadgeInfo}
      />
    </View>
  );
};

// Keep your existing styles - remove the logoutOverlay styles since they're now in RootLayout
const styles = StyleSheet.create({
  // navbar: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   justifyContent: "space-between",
  //   paddingHorizontal: 16,
  //   paddingVertical: 12,
  //   backgroundColor: "#fff",
  //   // Add your existing navbar styles
  // },
  bellContainer: {
    position: "relative",
  },

  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 2,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 0.2,
    marginBottom: -80,
  },
  logo: {
    width: 70,
    height: 30,
  },
  hamburger: {
    marginLeft: -10,
  },
  hamburgerText: {
    fontSize: 20,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    marginRight: 8,
  },
  iconBtn: {
    marginHorizontal: 8,
    position: "relative",
  },
  profileName: {
    paddingHorizontal: 10,
    fontSize: 12,
    borderBottomWidth: 0.2,
    paddingTop: 8,
    paddingBottom: 9,
    borderColor: "gray",
  },
  name: {
    color: "#00008B",
    fontWeight: 500
  },
  profileoption: {
    paddingHorizontal: 10,
    fontSize: 12,
    marginBottom: 1,
    paddingTop: 8,
    paddingBottom: 3,
    borderColor: "gray",
  },
  logoutBtn: {
    paddingTop: 8,
    paddingBottom: 9,
    paddingHorizontal: 10,
    width: 130,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutSpinner: {
    marginRight: 5,
  },
  logoutText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 10,
  },
  logoutTextDisabled: {
    opacity: 0.7,
  },
  profilePopup: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 999,
    width: 150,
  },
});