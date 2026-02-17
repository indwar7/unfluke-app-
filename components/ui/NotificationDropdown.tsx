import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Animated,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import moment from "moment";
import RenderHtml from "react-native-render-html";
import { createSelector } from "reselect";
import {
  getNotifications,
  postReadNotifications,
} from "../../Unfluke_helpers/backend_helper";

type NotificationDropdownRef = {
  toggleDropdown: () => void;
  getBadgeCount: () => number;
  hasBadge: () => boolean;
};

const NotificationDropdown = forwardRef<
  NotificationDropdownRef,
  { onBadgeUpdate?: () => void }
>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [displayedNotifications, setDisplayedNotifications] = useState<any[]>(
    []
  );
  const [badge, setBadge] = useState(false);
  const [page, setPage] = useState(1);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();

  const auth = createSelector(
    (state: any) => state.Login,
    (data) => data.user
  );
  const user = useSelector(auth);

  /* --------------------------------------------------
     FUNCTIONS (MUST BE DEFINED BEFORE useImperativeHandle)
  -------------------------------------------------- */

  const readNotifications = () => {
    if (!user?._id) return;
    postReadNotifications({ userID: user._id }).then(() => {
      setBadge(false);
    });
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => {
      if (!prev) {
        readNotifications();
      }
      return !prev;
    });
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setDisplayedNotifications(notifications.slice(0, nextPage * 10));
    setPage(nextPage);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  /* --------------------------------------------------
     EXPOSE METHODS TO PARENT
  -------------------------------------------------- */

  useImperativeHandle(ref, () => ({
    toggleDropdown,
    getBadgeCount: () => unreadCount,
    hasBadge: () => badge,
  }));

  /* --------------------------------------------------
     LOAD NOTIFICATIONS + SOCKET
  -------------------------------------------------- */

  useEffect(() => {
    if (!user?._id) return;

    getNotifications({ userID: user._id }).then((response) => {
      if (!response?.data) return;
      const data = response.data;
      setNotifications(data);
      const initial = data.filter((n: any) => !n.is_read).slice(0, 10);
      setDisplayedNotifications(initial.length ? initial : data.slice(0, 10));
      setBadge(data.some((n: any) => !n.is_read));
    });

    const socket = io(process.env.REACT_APP_BACKEND_URL as string, {
      transports: ["websocket"],
      query: { userID: user._id },
    });

    socket.emit("setSocketId", user._id);

    socket.on("new-notification", (data: any) => {
      if (data?.notification?.userID !== user._id) return;

      setNotifications((prev) => {
        const updated = [data.notification, ...prev];
        setDisplayedNotifications(updated.slice(0, 10));
        return updated;
      });

      setBadge(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  /* --------------------------------------------------
     ANIMATION
  -------------------------------------------------- */

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen, slideAnim]);

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  const modalOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  /* --------------------------------------------------
     RENDER
  -------------------------------------------------- */

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={toggleDropdown}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={toggleDropdown} />

        <Animated.View
          style={[
            styles.modalContent,
            styles.modalLight,
            {
              opacity: modalOpacity,
              transform: [{ translateY: modalTranslateY }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {badge && (
              <View style={styles.newBadge}>
                <Text>{unreadCount} New</Text>
              </View>
            )}
          </View>

          <ScrollView
            style={{ maxHeight: height * 0.7 }}
            contentContainerStyle={styles.scrollContent}
          >
            {displayedNotifications.map((notification, idx) => (
              <View key={idx} style={styles.notificationItem}>
                <RenderHtml
                  contentWidth={width - 100}
                  source={{ html: notification.content }}
                />
                <Text style={styles.timestamp}>
                  {moment(notification.createdAt).fromNow()}
                </Text>
              </View>
            ))}

            {notifications.length > displayedNotifications.length && (
              <TouchableOpacity onPress={loadMore}>
                <Text style={styles.loadMoreText}>View More →</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
});

export default NotificationDropdown;

/* --------------------------------------------------
   STYLES
-------------------------------------------------- */

const styles = StyleSheet.create({
  modalContent: {
    position: "absolute",
    top: 60,
    right: 16,
    width: 320,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 8,
    overflow: "hidden",
  },
  modalLight: {
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  newBadge: {
    marginTop: 8,
    padding: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  scrollContent: {
    padding: 16,
  },
  notificationItem: {
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  loadMoreText: {
    textAlign: "center",
    marginTop: 12,
    color: "#2563EB",
    fontWeight: "500",
  },
});
