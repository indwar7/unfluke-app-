import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { Bell, Moon, Sun, User, X } from "lucide-react-native";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/Unfluke_slices/thunks";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SidebarMenu from "./SidebarMenu";
import { backendSocket } from "../socket/socket";

/* ─────────────────────────────────────────────────────────
   NOTIFICATION PANEL
   ✅ No API call — listens to socket events only
   Stores backtest results + alerts in local state
───────────────────────────────────────────────────────── */
interface Notification {
  id: string;
  title: string;
  description?: string;
  time: Date;
  read: boolean;
  type: "backtest" | "alert" | "general";
}

const NotificationPanel = ({
  visible,
  onClose,
  notifications,
  onMarkAllRead,
}: {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
}) => {
  if (!visible) return null;

  const formatTime = (date: Date) => {
    try {
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const typeColor: Record<string, { bg: string; text: string }> = {
    backtest: { bg: "#EEF2FF", text: "#4338CA" },
    alert:    { bg: "#FEF3C7", text: "#92400E" },
    general:  { bg: "#F3F4F6", text: "#374151" },
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.notifOverlay} onPress={onClose}>
        <Pressable style={styles.notifPanel} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.notifHeader}>
            <Text style={styles.notifTitle}>Notifications</Text>
            <View style={styles.notifHeaderRight}>
              {notifications.some(n => !n.read) && (
                <TouchableOpacity onPress={onMarkAllRead} style={styles.markAllBtn}>
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          {notifications.length === 0 ? (
            <View style={styles.notifCenter}>
              <Text style={styles.notifBellEmoji}>🔔</Text>
              <Text style={styles.notifEmptyText}>No notifications yet</Text>
              <Text style={styles.notifEmptySubText}>
                Backtest results and alerts will appear here
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.notifScroll} showsVerticalScrollIndicator={false}>
              {notifications.map((item) => {
                const clr = typeColor[item.type] || typeColor.general;
                return (
                  <View
                    key={item.id}
                    style={[styles.notifItem, !item.read && styles.notifItemUnread]}
                  >
                    {!item.read && <View style={styles.notifDot} />}
                    <View style={styles.notifBody}>
                      <View style={styles.notifTopRow}>
                        <View style={[styles.notifTypeBadge, { backgroundColor: clr.bg }]}>
                          <Text style={[styles.notifTypeText, { color: clr.text }]}>
                            {item.type === "backtest" ? "Backtest" :
                             item.type === "alert" ? "Alert" : "Info"}
                          </Text>
                        </View>
                        <Text style={styles.notifItemTime}>{formatTime(item.time)}</Text>
                      </View>
                      <Text style={styles.notifItemTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      {!!item.description && (
                        <Text style={styles.notifItemDesc} numberOfLines={2}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

/* ─────────────────────────────────────────────────────────
   APP HEADER
───────────────────────────────────────────────────────── */
export const AppHeader = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [menuVisible, setMenuVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profilePopupVisible, setProfilePopupVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const user = useSelector((state: any) => state?.Login?.user ?? null);
  const isUserLogout = useSelector((state: any) => state?.Login?.isUserLogout ?? false);

  // ✅ Unread count derived from state — no API needed
  const unreadCount = notifications.filter(n => !n.read).length;

  // ✅ Listen to socket events for notifications
  useEffect(() => {
    if (!backendSocket) return;

    // Backtest completed
    const onBacktestResult = (data: any) => {
      if (!data) return;
      const notif: Notification = {
        id: `bt-${Date.now()}`,
        title: data.message || "Backtest completed",
        description: data.strategyName ? `Strategy: ${data.strategyName}` : undefined,
        time: new Date(),
        read: false,
        type: "backtest",
      };
      setNotifications(prev => [notif, ...prev].slice(0, 50));
    };

    // Advanced backtest completed
    const onAdvBacktestResult = (data: any) => {
      if (!data) return;
      const notif: Notification = {
        id: `adv-${Date.now()}`,
        title: data.message || "Advanced backtest completed",
        description: data.strategyName ? `Strategy: ${data.strategyName}` : undefined,
        time: new Date(),
        read: false,
        type: "backtest",
      };
      setNotifications(prev => [notif, ...prev].slice(0, 50));
    };

    // Scanner alert triggered
    const onScannerAlert = (data: any) => {
      if (!data) return;
      const notif: Notification = {
        id: `alert-${Date.now()}`,
        title: data.message || data.alert || "Scanner alert triggered",
        description: data.symbol || data.stockName,
        time: new Date(),
        read: false,
        type: "alert",
      };
      setNotifications(prev => [notif, ...prev].slice(0, 50));
    };

    backendSocket.on("backtest-results", onBacktestResult);
    backendSocket.on("advbacktest-results", onAdvBacktestResult);
    backendSocket.on("scanner-alert", onScannerAlert);

    return () => {
      backendSocket.off("backtest-results", onBacktestResult);
      backendSocket.off("advbacktest-results", onAdvBacktestResult);
      backendSocket.off("scanner-alert", onScannerAlert);
    };
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    setProfilePopupVisible(false);
    dispatch(logoutUser() as any);
  }, [dispatch]);

  useEffect(() => {
    if (isUserLogout && isLoggingOut) {
      try { router.replace("/login"); } catch (e) { console.error(e); }
      setIsLoggingOut(false);
    }
  }, [isUserLogout, isLoggingOut]);

  return (
    <>
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
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
          <TouchableOpacity onPress={() => router.push("/dashboard" as any)} activeOpacity={0.7}>
            <Image
              source={require("../assets/images/unfluke/UNFLUKE -09-New.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Right Icons */}
          <View style={styles.rightIcons}>
            {/* Dark mode */}
            <TouchableOpacity
              onPress={() => setIsDarkMode(!isDarkMode)}
              style={styles.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isDarkMode ? <Sun size={20} color="#333" /> : <Moon size={20} color="#333" />}
            </TouchableOpacity>

            {/* Bell — opens notification panel */}
            <TouchableOpacity
              style={styles.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => {
                setProfilePopupVisible(false);
                setNotifVisible(true);
              }}
            >
              <Bell size={20} color="#333" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity
              onPress={() => {
                setNotifVisible(false);
                setProfilePopupVisible(prev => !prev);
              }}
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
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setProfilePopupVisible(false)} />
            <View style={styles.profilePopup}>
              <Text style={styles.profileName}>
                Welcome, <Text style={styles.nameHighlight}>{user?.name ?? "User"}</Text>
              </Text>
              {[
                { label: "👤 Profile",     route: "/profile" },
                { label: "💰 My Earnings", route: "/leads" },
                { label: "💎 Pricing",     route: "/pricing" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.route}
                  style={styles.profileMenuItem}
                  onPress={() => { setProfilePopupVisible(false); router.push(item.route as any); }}
                >
                  <Text style={styles.profileMenuText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={isLoggingOut}>
                <Text style={styles.logoutText}>
                  {isLoggingOut ? "Logging out..." : "🚪 Logout"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Sidebar */}
      <SidebarMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

      {/* Notification Panel */}
      <NotificationPanel
        visible={notifVisible}
        onClose={() => setNotifVisible(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />
    </>
  );
};

/* ─────────────────────────────────────────────────────────
   SCREEN WITH HEADER WRAPPER
───────────────────────────────────────────────────────── */
export const ScreenWithHeader: React.FC<{
  children: React.ReactNode;
  style?: any;
}> = ({ children, style }) => (
  <View style={[styles.screenContainer, style]}>
    <AppHeader />
    <View style={styles.screenContent}>{children}</View>
  </View>
);

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
  hamburger: { padding: 8, marginRight: 8 },
  hamburgerText: { fontSize: 22, color: "#333" },
  logo: { width: 80, height: 28 },
  rightIcons: { flexDirection: "row", alignItems: "center", marginLeft: "auto", gap: 4 },
  iconBtn: { padding: 8, position: "relative" },

  // Badge
  badge: {
    position: "absolute", top: 4, right: 4,
    backgroundColor: "#ef4444", borderRadius: 8,
    minWidth: 16, height: 16,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },

  profileCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#4f46e5", alignItems: "center", justifyContent: "center",
  },
  profilePopup: {
    position: "absolute", top: 60, right: 12,
    backgroundColor: "#fff", borderRadius: 12,
    elevation: 8, shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8,
    zIndex: 1000, width: 200, paddingVertical: 8,
    borderWidth: 1, borderColor: "#f0f0f0",
  },
  profileName: {
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 13, color: "#374151",
    borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
  },
  nameHighlight: { color: "#4f46e5", fontWeight: "700" },
  profileMenuItem: { paddingHorizontal: 16, paddingVertical: 12 },
  profileMenuText: { fontSize: 14, color: "#374151", fontWeight: "500" },
  logoutBtn: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: "#f3f4f6", marginTop: 4,
  },
  logoutText: { color: "#ef4444", fontWeight: "600", fontSize: 14 },

  // Notification Panel
  notifOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start", alignItems: "flex-end",
    paddingTop: 60, paddingRight: 10,
  },
  notifPanel: {
    backgroundColor: "#fff", borderRadius: 14,
    width: 300, maxHeight: 440,
    elevation: 10, shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 10,
    overflow: "hidden",
  },
  notifHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 16,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e5e7eb",
  },
  notifTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  notifHeaderRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  markAllBtn: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#EEF2FF", borderRadius: 6 },
  markAllText: { fontSize: 11, color: "#4f46e5", fontWeight: "600" },
  notifScroll: { maxHeight: 360 },
  notifCenter: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 },
  notifBellEmoji: { fontSize: 32, marginBottom: 10 },
  notifEmptyText: { fontSize: 14, fontWeight: "600", color: "#374151", marginTop: 4 },
  notifEmptySubText: { fontSize: 12, color: "#9ca3af", marginTop: 6, textAlign: "center", lineHeight: 18 },
  notifItem: {
    flexDirection: "row", alignItems: "flex-start",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
  },
  notifItemUnread: { backgroundColor: "#f0f4ff" },
  notifDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#4f46e5", marginTop: 6,
    marginRight: 10, flexShrink: 0,
  },
  notifBody: { flex: 1 },
  notifTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  notifTypeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  notifTypeText: { fontSize: 10, fontWeight: "700" },
  notifItemTitle: { fontSize: 13, fontWeight: "600", color: "#111827", lineHeight: 18 },
  notifItemDesc: { fontSize: 12, color: "#6b7280", marginTop: 3, lineHeight: 17 },
  notifItemTime: { fontSize: 10, color: "#9ca3af" },

  // Screen wrapper
  screenContainer: { flex: 1, backgroundColor: "#f9fafb" },
  screenContent: { flex: 1 },
});

export default AppHeader;