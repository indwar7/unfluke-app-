import React, { useState, useEffect, useRef } from "react";
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
import { io } from "socket.io-client";
import { Config } from "../helpers/config";
import {
  getNotifications,
  postReadNotifications,
} from "../Unfluke_helpers/backend_helper";

interface NotifItem {
  _id?: string;
  content: string;
  is_read: boolean;
  createdAt: string;
  userID?: string;
}

/* ═══════════════════════════════════════════════════
   NOTIFICATION PANEL
═══════════════════════════════════════════════════ */
const NotificationPanel = ({
  visible, onClose, notifications, totalCount, hasMore,
  onMarkAllRead, onLoadMore, loading,
}: {
  visible: boolean; onClose: () => void;
  notifications: NotifItem[]; totalCount: number; hasMore: boolean;
  onMarkAllRead: () => void; onLoadMore: () => void; loading: boolean;
}) => {
  const fmtTime = (d: string) => {
    try {
      const date = new Date(d);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString("en-IN", {
        day: "2-digit", month: "short",
      });
    } catch { return ""; }
  };

  const stripHtml = (html: string) => {
    return html?.replace(/<[^>]*>/g, "")?.trim() || "";
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.notifOverlay} onPress={onClose}>
        <Pressable style={s.notifPanel} onPress={e => e.stopPropagation()}>
          <View style={s.notifHeader}>
            <Text style={s.notifTitle}>
              NOTIFICATIONS {totalCount > 0 ? `(${totalCount})` : ""}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={onMarkAllRead} style={s.markAllBtn}>
                  <Text style={s.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
          {notifications.length === 0 && !loading ? (
            <View style={s.notifEmpty}>
              <Text style={{ fontSize: 32, marginBottom: 10 }}>🔔</Text>
              <Text style={s.notifEmptyTitle}>No new notifications</Text>
              <Text style={s.notifEmptySub}>Backtest results and alerts will appear here</Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {notifications.map((item, idx) => (
                <View key={item._id || `n-${idx}`} style={[s.notifItem, !item.is_read && s.notifItemUnread]}>
                  {!item.is_read && <View style={s.notifDot} />}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <View style={[s.notifBadge, {
                        backgroundColor: item.content?.includes("Alert") ? "#FEF3C7" : "#EEF2FF"
                      }]}>
                        <Text style={[s.notifBadgeText, {
                          color: item.content?.includes("Alert") ? "#92400E" : "#4338CA"
                        }]}>
                          {item.content?.includes("Alert") ? "Alert" : "Message"}
                        </Text>
                      </View>
                      <Text style={s.notifTime}>{fmtTime(item.createdAt)}</Text>
                    </View>
                    <Text style={s.notifItemTitle} numberOfLines={3}>
                      {stripHtml(item.content)}
                    </Text>
                  </View>
                </View>
              ))}

              {hasMore && !loading && (
                <TouchableOpacity onPress={onLoadMore} style={{ paddingVertical: 12 }}>
                  <Text style={{ textAlign: "center", fontSize: 12, fontWeight: "700", color: "#4f46e5" }}>
                    Load More ({totalCount - notifications.length} remaining)
                  </Text>
                </TouchableOpacity>
              )}
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
            { label: "Profile", icon: "👤", route: "/profile" },
            { label: "My Earnings", icon: "💰", route: "/leads" },
            { label: "Pricing", icon: "💎", route: "/pricing" },
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
  const [menuVisible, setMenuVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Notification state — matches web version
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [badge, setBadge] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalNotifications, setTotalNotifications] = useState(0);

  const user = useSelector((state: any) => state?.Login?.user ?? null);
  const isUserLogout = useSelector((state: any) => state?.Login?.isUserLogout ?? false);
  const unread = notifications.filter(n => !n.is_read).length;

  const socketRef = useRef<any>(null);

  // Load notifications from API
  const loadNotifications = (pageNum = 1, isInitial = false) => {
    if (!user?._id) return;
    // Skip guard for initial/refresh loads so bell tap always works
    if (!isInitial && loading) return;
    setLoading(true);

    getNotifications({
      userID: user._id,
      page: pageNum,
      limit: 50,
    })
      .then((response: any) => {
        const data = response?.data ?? response;
        const list = data?.notifications ?? (Array.isArray(data) ? data : []);
        if (list.length > 0) {
          if (isInitial) {
            setNotifications(list);
          } else {
            setNotifications(prev => [...prev, ...list]);
          }
          setTotalNotifications(data?.total || list.length);
          setHasMore(!!data?.hasMore || (data?.total > list.length));
          setPage(pageNum);
          if (list.some((n: any) => !n.is_read)) {
            setBadge(true);
          }
        } else if (isInitial) {
          setNotifications([]);
          setTotalNotifications(0);
        }
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("[Notifications] API error:", err?.message || err);
        setLoading(false);
      });
  };

  // Mark all as read
  const markAllRead = () => {
    if (!user?._id) return;
    postReadNotifications({ userID: user._id }).then(() => {
      setBadge(false);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    });
  };

  // Load more notifications
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(page + 1, false);
    }
  };

  // Fetch notifications + setup socket when user is available
  useEffect(() => {
    if (!user?._id) return;

    // Load persisted notifications from API
    loadNotifications(1, true);

    // Setup dedicated socket connection with userID query param
    const socket = io(Config.BACKEND_URL, {
      transports: ["websocket"],
      query: { userID: user._id },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      // Bind user ID on every connect/reconnect
      socket.emit("setSocketId", user._id);
    });

    socket.emit("setSocketId", user._id);

    socket.on("new-notification", (data: any) => {
      const notif = data?.notification ?? data;
      if (notif && (notif.userID === user._id || !notif.userID)) {
        setNotifications(prev => [notif, ...prev]);
        setTotalNotifications(prev => prev + 1);
        setBadge(true);
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id]);

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

  const handleBellPress = () => {
    setProfileOpen(false);
    setNotifOpen(true);
    // Always re-fetch latest notifications when bell is tapped
    loadNotifications(1, true);
    if (badge) {
      markAllRead();
    }
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
              onPress={handleBellPress}
            >
              <Bell size={20} color="#333" />
              {(unread > 0 || badge) && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{unread > 9 ? "9+" : unread > 0 ? unread : "•"}</Text>
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
        totalCount={totalNotifications}
        hasMore={hasMore}
        onMarkAllRead={markAllRead}
        onLoadMore={handleLoadMore}
        loading={loading}
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