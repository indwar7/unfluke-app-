import React, { useState, useEffect } from "react";
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Pressable, Modal, ScrollView,
} from "react-native";
import { Bell, Moon, Sun, User, X } from "lucide-react-native";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/Unfluke_slices/thunks";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SidebarMenu from "./SidebarMenu";
import { backendSocket } from "../socket/socket";

interface Notification {
  id: string; title: string; description?: string;
  time: Date; read: boolean; type: "backtest" | "alert" | "general";
}

/* ═══════════════════════════════════════════════════
   NOTIFICATION PANEL
═══════════════════════════════════════════════════ */
const NotificationPanel = ({
  visible, onClose, notifications, onMarkAllRead,
}: {
  visible: boolean; onClose: () => void;
  notifications: Notification[]; onMarkAllRead: () => void;
}) => {
  const typeColor: Record<string, { bg: string; text: string }> = {
    backtest: { bg: "#EEF2FF", text: "#4338CA" },
    alert:    { bg: "#FEF3C7", text: "#92400E" },
    general:  { bg: "#F3F4F6", text: "#374151" },
  };
  const fmtTime = (d: Date) => {
    try {
      return d.toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
      });
    } catch { return ""; }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.notifOverlay} onPress={onClose}>
        <Pressable style={s.notifPanel} onPress={e => e.stopPropagation()}>
          <View style={s.notifHeader}>
            <Text style={s.notifTitle}>Notifications</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {notifications.some(n => !n.read) && (
                <TouchableOpacity onPress={onMarkAllRead} style={s.markAllBtn}>
                  <Text style={s.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
          {notifications.length === 0 ? (
            <View style={s.notifEmpty}>
              <Text style={{ fontSize: 32, marginBottom: 10 }}>🔔</Text>
              <Text style={s.notifEmptyTitle}>No notifications yet</Text>
              <Text style={s.notifEmptySub}>Backtest results and alerts will appear here</Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {notifications.map(item => {
                const clr = typeColor[item.type] || typeColor.general;
                return (
                  <View key={item.id} style={[s.notifItem, !item.read && s.notifItemUnread]}>
                    {!item.read && <View style={s.notifDot} />}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <View style={[s.notifBadge, { backgroundColor: clr.bg }]}>
                          <Text style={[s.notifBadgeText, { color: clr.text }]}>
                            {item.type === "backtest" ? "Backtest" : item.type === "alert" ? "Alert" : "Info"}
                          </Text>
                        </View>
                        <Text style={s.notifTime}>{fmtTime(item.time)}</Text>
                      </View>
                      <Text style={s.notifItemTitle} numberOfLines={2}>{item.title}</Text>
                      {!!item.description && (
                        <Text style={s.notifItemDesc} numberOfLines={2}>{item.description}</Text>
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

/* ═══════════════════════════════════════════════════
   PROFILE POPUP — rendered as Modal so it ALWAYS
   appears above every screen element, no zIndex fights
═══════════════════════════════════════════════════ */
const ProfilePopup = ({
  visible, onClose, user, onLogout, isLoggingOut,
}: {
  visible: boolean; onClose: () => void;
  user: any; onLogout: () => void; isLoggingOut: boolean;
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Full-screen dismiss area */}
      <Pressable style={s.profileOverlay} onPress={onClose}>
        {/* Stop tap propagation on the popup itself */}
        <Pressable style={s.profilePopup} onPress={e => e.stopPropagation()}>
          {/* User info */}
          <View style={s.profileTop}>
            <View style={s.profileAvatar}><User size={20} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.profileName} numberOfLines={1}>{user?.name ?? "User"}</Text>
              <Text style={s.profileEmail} numberOfLines={1}>{user?.email ?? ""}</Text>
            </View>
          </View>

          <View style={s.divider} />

          {[
            { label: "Profile",     icon: "👤", route: "/profile" },
            { label: "My Earnings", icon: "💰", route: "/leads" },
            { label: "Pricing",     icon: "💎", route: "/pricing" },
          ].map(item => (
            <TouchableOpacity
              key={item.route}
              style={s.menuItem}
              activeOpacity={0.7}
              onPress={() => { onClose(); router.push(item.route as any); }}
            >
              <Text style={s.menuIcon}>{item.icon}</Text>
              <Text style={s.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}

          <View style={s.divider} />

          <TouchableOpacity
            style={s.menuItem}
            activeOpacity={0.7}
            onPress={onLogout}
            disabled={isLoggingOut}
          >
            <Text style={s.menuIcon}>🚪</Text>
            <Text style={[s.menuLabel, { color: "#ef4444" }]}>
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════
   APP HEADER
═══════════════════════════════════════════════════ */
export const AppHeader = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [menuVisible, setMenuVisible]     = useState(false);
  const [isDarkMode, setIsDarkMode]       = useState(false);
  const [profileOpen, setProfileOpen]     = useState(false);
  const [notifOpen, setNotifOpen]         = useState(false);
  const [isLoggingOut, setIsLoggingOut]   = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const user          = useSelector((state: any) => state?.Login?.user ?? null);
  const isUserLogout  = useSelector((state: any) => state?.Login?.isUserLogout ?? false);
  const unread        = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!backendSocket) return;
    const add = (id: string, title: string, desc?: string, type: Notification["type"] = "backtest") =>
      setNotifications(prev =>
        [{ id, title, description: desc, time: new Date(), read: false, type }, ...prev].slice(0, 50)
      );
    const onBT    = (d: any) => d && add(`bt-${Date.now()}`,  d.message || "Backtest completed",          d.strategyName ? `Strategy: ${d.strategyName}` : undefined);
    const onAdv   = (d: any) => d && add(`adv-${Date.now()}`, d.message || "Advanced backtest completed", d.strategyName ? `Strategy: ${d.strategyName}` : undefined);
    const onAlert = (d: any) => d && add(`alert-${Date.now()}`, d.message || d.alert || "Scanner alert",  d.symbol, "alert");
    backendSocket.on("backtest-results",    onBT);
    backendSocket.on("advbacktest-results", onAdv);
    backendSocket.on("scanner-alert",       onAlert);
    return () => {
      backendSocket.off("backtest-results",    onBT);
      backendSocket.off("advbacktest-results", onAdv);
      backendSocket.off("scanner-alert",       onAlert);
    };
  }, []);

  useEffect(() => {
    if (isUserLogout && isLoggingOut) {
      try { router.replace("/login"); } catch { }
      setIsLoggingOut(false);
    }
  }, [isUserLogout, isLoggingOut]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setProfileOpen(false);
    dispatch(logoutUser() as any);
  };

  return (
    <>
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.row}>
          {/* Hamburger */}
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={s.iconBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.6}
          >
            <Text style={s.hamburger}>☰</Text>
          </TouchableOpacity>

          {/* Logo */}
          <TouchableOpacity onPress={() => router.push("/dashboard" as any)} activeOpacity={0.8}>
            <Image
              source={require("../assets/images/unfluke/UNFLUKE -09-New.png")}
              style={s.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Right icons */}
          <View style={s.rightIcons}>
            {/* Dark mode toggle */}
            <TouchableOpacity
              onPress={() => setIsDarkMode(v => !v)}
              style={s.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isDarkMode ? <Sun size={20} color="#333" /> : <Moon size={20} color="#333" />}
            </TouchableOpacity>

            {/* Bell */}
            <TouchableOpacity
              style={s.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => { setProfileOpen(false); setNotifOpen(true); }}
            >
              <Bell size={20} color="#333" />
              {unread > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{unread > 9 ? "9+" : unread}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Profile avatar */}
            <TouchableOpacity
              style={s.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => { setNotifOpen(false); setProfileOpen(v => !v); }}
            >
              <View style={s.avatar}><User size={16} color="#fff" /></View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ✅ Profile popup as Modal — renders above EVERYTHING, zero zIndex issues */}
      <ProfilePopup
        visible={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Notification panel */}
      <NotificationPanel
        visible={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
      />

      {/* Sidebar */}
      <SidebarMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  );
};

/* ═══════════════════════════════════════════════════
   SCREEN WITH HEADER
═══════════════════════════════════════════════════ */
export const ScreenWithHeader: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[s.screen, style]}>
    <AppHeader />
    <View style={s.screenContent}>{children}</View>
  </View>
);

/* ═══════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════ */
const s = StyleSheet.create({
  // Header bar
  container: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    elevation: 4,
    zIndex: 10,
  },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingTop: 4, paddingBottom: 10,
  },
  hamburger: { fontSize: 22, color: "#333" },
  logo: { width: 80, height: 28 },
  rightIcons: { flexDirection: "row", alignItems: "center", marginLeft: "auto", gap: 4 },
  iconBtn: { padding: 8, position: "relative" },
  badge: {
    position: "absolute", top: 4, right: 4,
    backgroundColor: "#ef4444", borderRadius: 8,
    minWidth: 16, height: 16,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#4f46e5", alignItems: "center", justifyContent: "center",
  },

  // ✅ Profile popup — Modal-based, positioned top-right like a dropdown
  profileOverlay: {
    flex: 1,
    // transparent background — tapping outside closes it
    backgroundColor: "transparent",
    // align popup to top-right corner (where the avatar button is)
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,   // roughly below the header bar
    paddingRight: 10,
  },
  profilePopup: {
    backgroundColor: "#fff",
    borderRadius: 14,
    width: 230,
    paddingBottom: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
  },
  profileTop: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  profileAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#4f46e5", alignItems: "center", justifyContent: "center",
  },
  profileName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  profileEmail: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#f3f4f6" },
  menuItem: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 13, gap: 12,
  },
  menuIcon: { fontSize: 16 },
  menuLabel: { fontSize: 14, color: "#374151", fontWeight: "500" },

  // Notifications
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
    shadowOpacity: 0.15, shadowRadius: 10, overflow: "hidden",
  },
  notifHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#e5e7eb",
  },
  notifTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  markAllBtn: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#EEF2FF", borderRadius: 6 },
  markAllText: { fontSize: 11, color: "#4f46e5", fontWeight: "600" },
  notifEmpty: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 },
  notifEmptyTitle: { fontSize: 14, fontWeight: "600", color: "#374151" },
  notifEmptySub: { fontSize: 12, color: "#9ca3af", marginTop: 6, textAlign: "center", lineHeight: 18 },
  notifItem: {
    flexDirection: "row", alignItems: "flex-start",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
  },
  notifItemUnread: { backgroundColor: "#f0f4ff" },
  notifDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#4f46e5", marginTop: 6, marginRight: 10, flexShrink: 0,
  },
  notifBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  notifBadgeText: { fontSize: 10, fontWeight: "700" },
  notifItemTitle: { fontSize: 13, fontWeight: "600", color: "#111827", lineHeight: 18 },
  notifItemDesc: { fontSize: 12, color: "#6b7280", marginTop: 3, lineHeight: 17 },
  notifTime: { fontSize: 10, color: "#9ca3af" },

  // Screen wrapper
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  screenContent: { flex: 1 },
});

export default AppHeader;