import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react-native";
import { menuItems } from "../datas/navbar";
import { Link } from "expo-router";
import { useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const SideBar = ({
  setExpandedMenu,
  setMenuVisible,
  slideAnim,
  expandedMenu,
}) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);
  return (
    <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
      <Animated.View
        style={[
          styles.menu,
          {
            transform: [{ translateX: slideAnim }],
          },
          { width: width - 150 },
        ]}
      >
        {menuItems.map((item, index) => {
          const hasSubItems = !!item.subItems;
          const isExpanded = expandedMenu === index;

          return (
            <View key={index}>
              {hasSubItems ? (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setExpandedMenu(isExpanded ? null : index);
                  }}
                >
                  <Text style={styles.menuText}>{item.label}</Text>
                  <View style={styles.arrowIcon}>
                    {isExpanded ? (
                      <ArrowUp color={c.textSecondary} size={18} />
                    ) : (
                      <ArrowDown color={c.textSecondary} size={18} />
                    )}
                  </View>
                </TouchableOpacity>
              ) : item?.link === "/alerts" ? (
                // Special handling for alerts - use navigation instead of Link
                <Link
                  href="/scannerhome?alertsSideBar=true"
                  asChild
                  onPress={() => setMenuVisible(false)}
                >
                  <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>{item.label}</Text>
                  </TouchableOpacity>
                </Link>
              ) : (
                // Regular Link for other items
                <Link
                  href={item?.link ?? "/"}
                  asChild
                  onPress={() => setMenuVisible(false)}
                >
                  <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>{item.label}</Text>
                  </TouchableOpacity>
                </Link>
              )}

              {hasSubItems && isExpanded && (
                <View style={styles.subMenu}>
                  {item?.subItems?.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      href={subItem?.link ?? "/"}
                      asChild
                      onPress={() => setMenuVisible(false)}
                    >
                      <TouchableOpacity style={styles.subMenuItem}>
                        <Text style={styles.subMenuText}>{subItem.label}</Text>
                      </TouchableOpacity>
                    </Link>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </Animated.View>
    </Pressable>
  );
};

export default SideBar;

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: c.overlay,
      flexDirection: "row",
      zIndex: 999,
      elevation: 10,
    },
    menu: {
      height: "100%",
      backgroundColor: c.card,
      paddingVertical: 24,
      paddingTop: 60, // Matches typical status bar + header height
      paddingHorizontal: 16,
      elevation: 15,
      zIndex: 1000,
      shadowColor: "#000",
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    menuItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.borderLight,
      borderRadius: 8,
      marginVertical: 2,
    },
    menuText: {
      fontSize: 16,
      color: c.text,
      fontWeight: "500",
    },
    arrowIcon: {
      padding: 4,
    },
    subMenu: {
      paddingLeft: 16,
      backgroundColor: c.surface,
      borderRadius: 8,
      marginVertical: 4,
      paddingVertical: 4,
    },
    subMenuItem: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      marginVertical: 2,
    },
    subMenuText: {
      fontSize: 14,
      color: c.textSecondary,
      fontWeight: "400",
    },
  });
