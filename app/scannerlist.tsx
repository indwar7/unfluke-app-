import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronRight, Eye, Plus } from "lucide-react-native";
import axios from "axios";
import { Config } from "../helpers/config";
import { ScreenWithHeader } from "../components/AppHeader";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { Radius, Space, Shadow } from "@/constants/Theme";

const ScannerList = () => {
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);
  const navigation = useNavigation();
  const route = useRoute();
  const {
    category,
    scanners: fallbackScanners,
    type,
    alerts,
  } = route.params || {};

  console.log(alerts);

  const [scanners, setScanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const totalItems = scanners.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const fetchScanners = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${Config.BACKEND_URL}/api/scanner/getAdminScannersByCategory`,
        {
          params: {
            category,
            limit: 1000,
            page: 1,
          },
        }
      );
      // axios interceptor unwraps response.data; tolerate either shape
      const payload = (response as any)?.data ?? response;
      setScanners(
        Array.isArray(payload) ? payload : fallbackScanners || []
      );
    } catch (error) {
      console.error("fetchScanners error:", error);
      setScanners(fallbackScanners || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScanners();
  }, [category]);

  const getInitials = (name) => {
    const words = name?.split(" ") || [];
    return words
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderScannerItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={s.scannerItem}
      onPress={() =>
        navigation.navigate(alerts ? "alert" : "scanner", {
          state: item,
          type:
            type === "technical"
              ? "scanner"
              : type === "fundamental"
                ? "fundamental"
                : "alerts",
        })
      }
    >
      <View style={s.avatar}>
        <Text style={s.avatarText}>{getInitials(item.name)}</Text>
      </View>
      <View style={s.scannerInfo}>
        <Text style={s.scannerName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={s.scannerDescription} numberOfLines={3}>
          {item.description || "No description"}
        </Text>
      </View>
      <View style={s.chevronWrap}>
        <ChevronRight size={16} color={c.gold} />
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={s.pagination}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          style={[
            s.pageButton,
            currentPage === 1 && s.disabledButton,
          ]}
        >
          <Text style={s.pageButtonText}>Previous</Text>
        </TouchableOpacity>

        <Text style={s.pageInfo}>
          Page {currentPage} of {totalPages}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={[
            s.pageButton,
            currentPage === totalPages && s.disabledButton,
          ]}
        >
          <Text style={s.pageButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenWithHeader>
      {/* Original Header Container - Kept exactly as you had it */}
      <View style={s.headerContainer}>
        <View>
          <Text style={s.title}>{category || "Scanners"}</Text>
          <View style={s.breadcrumb}>
            <Text style={s.breadcrumbText}>Pages</Text>
            <ChevronRight size={13} color={c.textMuted} />
            <Text style={s.breadcrumbCurrent}>Scanners</Text>
          </View>
        </View>

        <View style={s.buttonGroup}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={s.viewSavedButton}
            onPress={() =>
              navigation.navigate(alerts ? "alerts" : "scannerhome")
            }
          >
            <Eye color={c.textSecondary} size={13} />
            <Text style={s.viewSavedButtonText}>View saved</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={s.createNewButton}
            onPress={() =>
              navigation.navigate("scanner", {
                type:
                  type === "technical"
                    ? "scanner"
                    : type === "fundamental"
                      ? "fundamental"
                      : "alerts",
              })
            }
          >
            <Plus color={c.onGold} size={13} strokeWidth={3} />
            <Text style={s.createNewButtonText}>Create new</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Improved List and Pagination */}
      {loading ? (
        <View>
          {[...Array(8)].map((_, i) => (
            <View key={i} style={s.skeletonItem}>
              <View style={s.skeletonAvatar} />
              <View style={s.skeletonText}>
                <View style={s.skeletonLine} />
                <View style={[s.skeletonLine, { width: "70%" }]} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={scanners.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          )}
          renderItem={renderScannerItem}
          keyExtractor={(item, index) => item?._id ?? String(index)}
          contentContainerStyle={s.listContent}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWithHeader>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      padding: 12,
      paddingBottom: 10,
    },
    // Header
    headerContainer: {
      paddingBottom: Space.xl,
      flexDirection: "column",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.3,
      color: c.text,
    },
    breadcrumb: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
      gap: 3,
    },
    breadcrumbText: {
      fontSize: 12,
      fontWeight: "600",
      color: c.textMuted,
    },
    breadcrumbCurrent: {
      fontSize: 12,
      fontWeight: "700",
      color: c.textSecondary,
    },
    buttonGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    viewSavedButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: Radius.md,
      paddingHorizontal: 14,
      paddingVertical: 9,
      backgroundColor: c.surface,
    },
    viewSavedButtonText: {
      fontWeight: "700",
      color: c.textSecondary,
      fontSize: 12,
    },
    createNewButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: Radius.md,
      paddingHorizontal: 14,
      paddingVertical: 9,
      backgroundColor: c.gold,
      ...Shadow.gold,
    },
    createNewButtonText: {
      fontWeight: "800",
      color: c.onGold,
      fontSize: 12,
      letterSpacing: 0.2,
    },
    // Skeleton
    skeletonItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: c.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 10,
    },
    skeletonAvatar: {
      width: 46,
      height: 46,
      borderRadius: Radius.md,
      backgroundColor: c.surfaceElevated,
    },
    skeletonText: {
      marginLeft: 16,
      flex: 1,
    },
    skeletonLine: {
      height: 14,
      backgroundColor: c.surfaceElevated,
      borderRadius: Radius.xs,
      marginBottom: 9,
      width: "60%",
    },
    listContent: {
      padding: 1,
      paddingBottom: 105,
    },
    // List row
    scannerItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: c.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 12,
      ...Shadow.sm,
    },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: Radius.md,
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: isDark ? c.goldMuted : c.gold,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    avatarText: {
      color: isDark ? c.gold : c.goldDeep,
      fontWeight: "800",
      fontSize: 15,
      letterSpacing: 0.4,
    },
    scannerInfo: {
      flex: 1,
    },
    scannerName: {
      fontSize: 15,
      fontWeight: "700",
      color: c.text,
      marginBottom: 4,
      letterSpacing: -0.1,
    },
    scannerDescription: {
      fontSize: 13,
      lineHeight: 18,
      color: c.textMuted,
    },
    chevronWrap: {
      width: 28,
      height: 28,
      borderRadius: Radius.sm,
      backgroundColor: c.goldLight,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 10,
    },
    // Pagination
    pagination: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: c.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      marginTop: 4,
    },
    pageButton: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: Radius.md,
    },
    disabledButton: {
      opacity: 0.45,
    },
    pageButtonText: {
      color: c.text,
      fontWeight: "700",
      fontSize: 13,
    },
    pageInfo: {
      color: c.textMuted,
      fontWeight: "700",
      fontSize: 12,
      letterSpacing: 0.2,
    },
  });

export default ScannerList;
