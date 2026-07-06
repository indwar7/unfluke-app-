import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronRight, Eye, Plus, ScanLine } from "lucide-react-native";
import { ScreenWithHeader } from "@/components/AppHeader";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { SectionLabel } from "@/components/ui/Premium";

const ScannerMain = () => {
  const [defaultScanners, setDefaultScanners] = useState({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [appType, setAppType] = useState("default");

  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c);

  useEffect(() => {
    const fetchScanners = async () => {
      try {
        setLoading(true);
        // Market-scoped via ?market= query param — this endpoint ignores the
        // mrkt header; the website (verified against its live bundle) passes
        // the market as a param and the API returns a crypto-specific list.
        const mkt = (await AsyncStorage.getItem("mkt")) || "in";
        const response = await fetch(
          `https://api.unfluke.in/api/scanner/getAdminScanners?type=technical&market=${mkt}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data) {
          setDefaultScanners(data);
        } else {
          console.warn("Received empty data from API");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScanners();
  }, []);

  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const ScannerCard = ({ title, items }) => {
    const displayItems = items.slice(0, 6);

    return (
      <View style={s.cardContainer}>
        <View style={s.cardHeader}>
          <View style={s.cardTitleWrap}>
            <View style={s.cardTitleIcon}>
              <ScanLine size={15} color={c.gold} strokeWidth={2.4} />
            </View>
            <Text style={s.cardTitle} numberOfLines={1}>
              {capitalizeFirstLetter(title.replace("-", " "))}
            </Text>
          </View>
          <TouchableOpacity
            style={s.showAllButton}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("scannerlist", {
                category: title,
                scanners: items,
                type: "technical",
                // alerts: true,
              })
            }
          >
            <Text style={s.showAllButtonText}>Show All</Text>
            <ChevronRight size={13} color={c.gold} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={s.scannerList}
          contentContainerStyle={s.scannerListContent}
          showsVerticalScrollIndicator={false}
        >
          {displayItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={s.scannerItem}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate("scanner", {
                  state: item,
                  type: "scanner",
                  // shared: false,
                })
              }
            >
              <View style={s.scannerItemContent}>
                <View style={s.scannerDot} />
                <Text
                  style={s.scannerName}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {/* Add fallback for undefined names */}
                  {item?.name || "Unnamed Scanner"}
                </Text>
                <ChevronRight size={16} color={c.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <ScreenWithHeader>
      <View style={s.container}>
        <View style={s.headerContainer}>
          {/* Left section: Title + breadcrumb */}
          <View>
            <Text style={s.title}>Scanner Home</Text>
            <View style={s.breadcrumb}>
              <Text style={s.breadcrumbText}>Pages</Text>
              <ChevronRight size={13} color={c.textMuted} />
              <Text style={s.breadcrumbActive}>Technical Scanner</Text>
            </View>
          </View>

          {/* Right section: Buttons */}
          <View style={s.buttonGroup}>
            <TouchableOpacity
              style={s.viewSavedButton}
              activeOpacity={0.8}
              onPress={() => {
                console.log("View saved pressed");
                navigation.navigate("scannerhome")
              }}
            >
              <Eye color={c.text} size={13} />
              <Text style={s.viewSavedButtonText}>View saved</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.createNewButton}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("scanner", {
                  type: "scanner",
                })
              }
            >
              <Plus color={c.onGold} size={13} strokeWidth={3} />
              <Text style={s.createNewButtonText}>Create new</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={c.gold} />
            <Text style={s.loadingText}>Loading scanners...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={s.scannerGrid}
            showsVerticalScrollIndicator={false}
          >
            {Object.keys(defaultScanners).length === 0 ? (
              <View style={s.emptyState}>
                <View style={s.emptyIcon}>
                  <ScanLine size={26} color={c.textMuted} strokeWidth={1.8} />
                </View>
                <Text style={s.emptyStateText}>No scanners available</Text>
              </View>
            ) : (
              Object.keys(defaultScanners).map((category) => (
                <ScannerCard
                  key={category}
                  title={category}
                  items={defaultScanners[category] || []}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </ScreenWithHeader>
  );
};

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      padding: 12,
      paddingTop: 12,
      paddingBottom: 20,
      backgroundColor: c.background,
      flexGrow: 1,
    },
    headerContainer: {
      paddingBottom: 18,
      flexDirection: "column",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.4,
      color: c.text,
    },
    breadcrumb: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
      gap: 2,
    },
    breadcrumbText: {
      fontSize: 12,
      fontWeight: "600",
      color: c.textMuted,
    },
    breadcrumbActive: {
      fontSize: 12,
      fontWeight: "700",
      color: c.gold,
    },
    buttonGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    viewSavedButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: c.surface,
    },
    viewSavedButtonText: {
      fontWeight: "700",
      color: c.text,
      fontSize: 12,
    },
    createNewButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: c.gold,
    },
    createNewButtonText: {
      fontWeight: "800",
      color: c.onGold,
      fontSize: 12,
      letterSpacing: 0.2,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 28,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 18,
      backgroundColor: c.card,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 13,
      fontWeight: "600",
      color: c.textSecondary,
    },
    emptyState: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 48,
      paddingHorizontal: 24,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 18,
      backgroundColor: c.card,
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.surfaceElevated,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 14,
    },
    emptyStateText: {
      color: c.textSecondary,
      fontSize: 15,
      fontWeight: "600",
    },
    scannerGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 14,
      paddingBottom: 110,
    },
    cardContainer: {
      width: "100%",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      paddingHorizontal: 16,
      paddingVertical: 16,
      shadowColor: "#0B0D12",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
      gap: 8,
    },
    cardTitleWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      flex: 1,
      marginRight: 8,
    },
    cardTitleIcon: {
      width: 30,
      height: 30,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: -0.2,
      color: c.text,
      flexShrink: 1,
    },
    showAllButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      alignSelf: "flex-end",
    },
    showAllButtonText: {
      color: c.gold,
      fontWeight: "800",
      fontSize: 11,
      letterSpacing: 0.2,
    },
    scannerList: {
      maxHeight: 320,
    },
    scannerListContent: {
      paddingRight: 8,
    },
    scannerItem: {
      backgroundColor: c.surfaceElevated,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.borderLight,
      paddingVertical: 13,
      paddingHorizontal: 13,
      marginBottom: 8,
    },
    scannerItemContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flex: 1,
      gap: 10,
    },
    scannerDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.gold,
    },
    scannerName: {
      fontSize: 13,
      fontWeight: "600",
      color: c.text,
      flex: 1,
      // Removed flexWrap as it's not valid for Text components
      // Text wrapping is handled by numberOfLines and ellipsizeMode props
    },
  });

export default ScannerMain;
