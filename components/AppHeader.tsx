import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Pressable, Modal, ScrollView, Platform, Keyboard,
} from "react-native";
import { Bell, X, Menu, LogOut, User as UserIcon, Crown, Gem, Wallet } from "lucide-react-native";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/Unfluke_slices/thunks";
import { changeAppType } from "../redux/Unfluke_slices/layouts/thunk";
import { appTypes } from "./UnflukeMain/constants/layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SidebarMenu from "./SidebarMenu";
import { io } from "socket.io-client";
import { Config } from "../helpers/config";
import {
  getNotifications,
  postReadNotifications,
} from "../Unfluke_helpers/backend_helper";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import BottomNav from "@/components/ui/BottomNav";

interface NotifItem {
  _id?: string;
  content: string;
  is_read: boolean;
  createdAt: string;
  userID?: string;
}

const initials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "U";
};

/* ═══════════════════════════════════════════════════
   NOTIFICATION PANEL
═══════════════════════════════════════════════════ */
const NotificationPanel = ({
  visible, onClose, notifications, totalCount, hasMore,
  onMarkAllRead, onLoadMore, loading, top,
}: {
  visible: boolean; onClose: () => void;
  notifications: NotifItem[]; totalCount: number; hasMore: boolean;
  onMarkAllRead: () => void; onLoadMore: () => void; loading: boolean; top: number;
}) => {
  const { colors: c } = useTheme();
  const s = makeStyles(c);
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
        <Pressable style={[s.notifPanel, { marginTop: top }]} onPress={e => e.stopPropagation()}>
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
                <X size={18} color={c.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          {notifications.length === 0 && !loading ? (
            <View style={s.notifEmpty}>
              <View style={s.notifEmptyIcon}>
                <Bell size={22} color={c.gold} />
              </View>
              <Text style={s.notifEmptyTitle}>No new notifications</Text>
              <Text style={s.notifEmptySub}>Backtest results and alerts will appear here</Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {notifications.map((item, idx) => {
                const isAlert = item.content?.includes("Alert");
                return (
                  <View key={item._id || `n-${idx}`} style={[s.notifItem, !item.is_read && s.notifItemUnread]}>
                    {!item.is_read && <View style={s.notifDot} />}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <View style={[s.notifBadge, { backgroundColor: isAlert ? c.warningLight : c.goldLight }]}>
                          <Text style={[s.notifBadgeText, { color: isAlert ? c.warning : c.gold }]}>
                            {isAlert ? "Alert" : "Message"}
                          </Text>
                        </View>
                        <Text style={s.notifTime}>{fmtTime(item.createdAt)}</Text>
                      </View>
                      <Text style={s.notifItemTitle} numberOfLines={3}>
                        {stripHtml(item.content)}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {hasMore && !loading && (
                <TouchableOpacity onPress={onLoadMore} style={{ paddingVertical: 12 }}>
                  <Text style={{ textAlign: "center", fontSize: 12, fontWeight: "700", color: c.gold }}>
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
  visible, onClose, user, onLogout, isLoggingOut, top,
}: {
  visible: boolean; onClose: () => void;
  user: any; onLogout: () => void; isLoggingOut: boolean; top: number;
}) => {
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  const menu = [
    { label: "Profile", Icon: UserIcon, route: "/profile" },
    { label: "My Earnings", Icon: Wallet, route: "/leads" },
    { label: "Pricing", Icon: Gem, route: "/pricing" },
  ];
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={s.profileOverlay} onPress={onClose}>
        <Pressable style={[s.profilePopup, { marginTop: top }]} onPress={e => e.stopPropagation()}>
          {/* User info */}
          <View style={s.profileTop}>
            <View style={s.profileAvatar}>
              <Text style={s.profileAvatarText}>{initials(user?.name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={s.profileName} numberOfLines={1}>{user?.name ?? "User"}</Text>
                <View style={s.proPill}>
                  <Crown size={9} color={c.onGold} />
                  <Text style={s.proPillText}>PRO</Text>
                </View>
              </View>
              <Text style={s.profileEmail} numberOfLines={1}>{user?.email ?? ""}</Text>
            </View>
          </View>

          <View style={s.divider} />

          {menu.map(item => (
            <TouchableOpacity
              key={item.route}
              style={s.menuItem}
              activeOpacity={0.7}
              onPress={() => { onClose(); router.push(item.route as any); }}
            >
              <View style={s.menuIconWrap}>
                <item.Icon size={16} color={c.textSecondary} />
              </View>
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
            <View style={[s.menuIconWrap, { backgroundColor: c.lossBg }]}>
              <LogOut size={16} color={c.loss} />
            </View>
            <Text style={[s.menuLabel, { color: c.loss }]}>
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
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c);
  const [menuVisible, setMenuVisible] = useState(false);
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

  // Market toggle (India <-> Crypto), mirrors the website's WebAppsDropdown.
  // Reads the selected market from the Layout slice; switching dispatches
  // changeAppType which persists "mkt" so every API call returns that market's
  // data. Screens that read appType (scanner, etc.) refetch automatically.
  const appType = useSelector((state: any) => state?.Layout?.appType ?? appTypes.IND);
  const isCrypto = appType === appTypes.CRYPTO;
  const switchMarket = (nextIsCrypto: boolean) => {
    const next = nextIsCrypto ? appTypes.CRYPTO : appTypes.IND;
    if (next === appType) return;
    dispatch(changeAppType(next) as any);
  };

  const socketRef = useRef<any>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
        if (!mountedRef.current) return;
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
        if (!mountedRef.current) return;
        console.error("[Notifications] API error:", err?.message || err);
        setLoading(false);
      });
  };

  // Mark all as read
  const markAllRead = () => {
    if (!user?._id) return;
    postReadNotifications({ userID: user._id })
      .then(() => {
        setBadge(false);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      })
      .catch((err: any) => {
        console.error("markAllRead error:", err);
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

  // Dropdowns sit just under the header bar.
  const dropdownTop = insets.top + 52;

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
            <Menu size={22} color={c.text} />
          </TouchableOpacity>

          {/* Logo */}
          <TouchableOpacity onPress={() => router.push("/dashboard" as any)} activeOpacity={0.8}>
            <Image
              source={
                isDark
                  ? require("../assets/images/unfluke/UNFLUKE -05-NEW.png")
                  : require("../assets/images/unfluke/UNFLUKE -01-NEW.png")
              }
              style={s.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Right icons */}
          <View style={s.rightIcons}>
            {/* Market toggle: India <-> Crypto (same functioning as website) */}
            <View style={s.marketToggle}>
              <TouchableOpacity
                style={[s.marketSeg, !isCrypto && s.marketSegActive]}
                onPress={() => switchMarket(false)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Switch to India market"
              >
                <Text style={[s.marketSegText, !isCrypto && s.marketSegTextActive]}>IND</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.marketSeg, isCrypto && s.marketSegActive]}
                onPress={() => switchMarket(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Switch to Crypto market"
              >
                <Text style={[s.marketSegText, isCrypto && s.marketSegTextActive]}>₿</Text>
              </TouchableOpacity>
            </View>

            {/* Bell */}
            <TouchableOpacity
              style={s.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={handleBellPress}
            >
              <Bell size={20} color={c.text} />
              {(unread > 0 || badge) && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{unread > 9 ? "9+" : unread > 0 ? unread : "•"}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Profile avatar */}
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => { setNotifOpen(false); setProfileOpen(v => !v); }}
              activeOpacity={0.8}
            >
              <View style={s.avatar}>
                <Text style={s.avatarText}>{initials(user?.name)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile popup as Modal — renders above EVERYTHING */}
      <ProfilePopup
        visible={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        top={dropdownTop}
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
        top={dropdownTop}
      />

      {/* Sidebar */}
      <SidebarMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  );
};

/* ═══════════════════════════════════════════════════
   SCREEN WITH HEADER
═══════════════════════════════════════════════════ */
export const ScreenWithHeader: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  // Auth guard: every protected screen wraps with ScreenWithHeader, so
  // redirect to /login from one place instead of guarding each screen.
  const user = useSelector((state: any) => state?.Login?.user ?? null);
  const isUserLogout = useSelector((state: any) => state?.Login?.isUserLogout ?? false);

  useEffect(() => {
    if (!user?._id && !isUserLogout) {
      try { router.replace("/login"); } catch { }
    }
  }, [user, isUserLogout]);

  // Hide the bottom nav while the keyboard is open so it doesn't ride up
  // into the middle of the screen (edge-to-edge breaks native adjustResize).
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvt, () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener(hideEvt, () => setKeyboardOpen(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  if (!user?._id) {
    return <View style={[s.screen, style]} />;
  }

  return (
    <View style={[s.screen, style]}>
      <AppHeader />
      {/*
        Keyboard handling is done per-screen with react-native-keyboard-
        controller's KeyboardAwareScrollView / KeyboardStickyView (works on
        edge-to-edge, where the native adjustResize and RN's KeyboardAvoidingView
        fail). Here we only need to hide the BottomNav while the keyboard is open
        so it never covers the typing box (e.g. AI Bot, Fundamentals).
      */}
      <View style={s.screenContent}>{children}</View>
      {!keyboardOpen && <BottomNav />}
    </View>
  );
};

/* ═══════════════════════════════════════════════════
   STYLES (theme-aware)
═══════════════════════════════════════════════════ */
const makeStyles = (c: AppColors) => StyleSheet.create({
  // Header bar
  container: {
    backgroundColor: c.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    zIndex: 10,
  },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingTop: 6, paddingBottom: 10,
  },
  logo: { width: 104, height: 30 },
  rightIcons: { flexDirection: "row", alignItems: "center", marginLeft: "auto", gap: 6 },
  iconBtn: { padding: 8, position: "relative" },

  // Market toggle (IND | ₿) — segmented pill
  marketToggle: {
    flexDirection: "row",
    backgroundColor: c.inputBg,
    borderRadius: 999,
    padding: 2,
    borderWidth: 1,
    borderColor: c.border,
    marginRight: 2,
  },
  marketSeg: {
    minWidth: 30,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  marketSegActive: {
    backgroundColor: c.gold,
  },
  marketSegText: {
    fontSize: 12,
    fontWeight: "800",
    color: c.textMuted,
    letterSpacing: 0.3,
  },
  marketSegTextActive: {
    color: c.onGold,
  },
  badge: {
    position: "absolute", top: 4, right: 4,
    backgroundColor: c.loss, borderRadius: 8,
    minWidth: 16, height: 16,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: c.headerBg,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: c.gold, alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: c.onGold, fontSize: 13, fontWeight: "800" },

  // Profile popup
  profileOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingRight: 10,
  },
  profilePopup: {
    backgroundColor: c.surfaceElevated,
    borderRadius: 16,
    width: 244,
    paddingBottom: 6,
    borderWidth: 1,
    borderColor: c.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 24,
  },
  profileTop: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  profileAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: c.gold, alignItems: "center", justifyContent: "center",
  },
  profileAvatarText: { color: c.onGold, fontSize: 15, fontWeight: "800" },
  profileName: { fontSize: 14, fontWeight: "700", color: c.text, maxWidth: 110 },
  profileEmail: { fontSize: 11, color: c.textMuted, marginTop: 2 },
  proPill: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: c.gold, borderRadius: 999,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  proPillText: { fontSize: 9, fontWeight: "800", color: c.onGold, letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: c.borderLight, marginHorizontal: 4 },
  menuItem: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 11, gap: 12,
  },
  menuIconWrap: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: c.inputBg, alignItems: "center", justifyContent: "center",
  },
  menuLabel: { fontSize: 14, color: c.text, fontWeight: "600" },

  // Notifications
  notifOverlay: {
    flex: 1, backgroundColor: c.overlay,
    justifyContent: "flex-start", alignItems: "flex-end",
    paddingRight: 10,
  },
  notifPanel: {
    backgroundColor: c.surfaceElevated, borderRadius: 16,
    width: 304, maxHeight: 440,
    borderWidth: 1, borderColor: c.border,
    elevation: 12, shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22, shadowRadius: 16, overflow: "hidden",
  },
  notifHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: c.borderLight,
  },
  notifTitle: { fontSize: 12, fontWeight: "800", color: c.text, letterSpacing: 0.8 },
  markAllBtn: { paddingHorizontal: 9, paddingVertical: 4, backgroundColor: c.goldLight, borderRadius: 8 },
  markAllText: { fontSize: 11, color: c.gold, fontWeight: "700" },
  notifEmpty: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 },
  notifEmptyIcon: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: c.goldLight,
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  notifEmptyTitle: { fontSize: 14, fontWeight: "700", color: c.text },
  notifEmptySub: { fontSize: 12, color: c.textMuted, marginTop: 6, textAlign: "center", lineHeight: 18 },
  notifItem: {
    flexDirection: "row", alignItems: "flex-start",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: c.borderLight,
  },
  notifItemUnread: { backgroundColor: c.goldLight },
  notifDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: c.gold, marginTop: 6, marginRight: 10, flexShrink: 0,
  },
  notifBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  notifBadgeText: { fontSize: 10, fontWeight: "800" },
  notifItemTitle: { fontSize: 13, fontWeight: "600", color: c.text, lineHeight: 18 },
  notifTime: { fontSize: 10, color: c.textMuted },

  // Screen wrapper
  screen: { flex: 1, backgroundColor: c.background },
  screenContent: { flex: 1 },
});

export default AppHeader;
