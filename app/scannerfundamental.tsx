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
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, Eye, Plus } from "lucide-react-native";
import { ScreenWithHeader } from "../components/AppHeader";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const ScannerFundamental = () => {
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c);
  const [defaultScanners, setDefaultScanners] = useState({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [appType, setAppType] = useState("default"); // You can set a default value or get it from props

  useEffect(() => {
    const fetchScanners = async () => {

      console.log("Asdfsaf")
      try {
        setLoading(true);
        const response = await fetch(
          "https://api.unfluke.in/api/scanner/getAdminScanners?type=fundamental"
          // "http://10.184.31.9:80/api/scanner/getAdminScanners?type=fundamental"
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
          <Text style={s.cardTitle}>
            {capitalizeFirstLetter(title.replace("-", " "))}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={s.showAllButton}
            onPress={() =>
              navigation.navigate("scannerlist", {
                category: title,
                scanners: items,
                type: "fundamental",
                // alerts:true
              })
            }
          >
            <Text style={s.showAllButtonText}>Show All Scans</Text>
            <ChevronRight size={13} color={c.gold} strokeWidth={2.5} />
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
              activeOpacity={0.75}
              style={s.scannerItem}
              onPress={() =>
                navigation.navigate("scanner", {
                  state: item,
                  type: "fundamental",
                  // shared: false,
                })
              }
            >
              <View style={s.scannerItemContent}>
                <Text
                  style={s.scannerName}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.name}
                </Text>
                <View style={s.scannerItemChevron}>
                  <ChevronRight size={16} color={c.textMuted} />
                </View>
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
              <Text style={s.breadcrumbActive}>Fundamental Scanner</Text>
            </View>
          </View>

          {/* Right section: Buttons */}
          <View style={s.buttonGroup}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={s.viewSavedButton}
              onPress={() => navigation.navigate("scannerhome")}
            >
              <Eye color={c.textSecondary} size={14} />
              <Text style={s.viewSavedButtonText}>View saved</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("scanner", {
                  type: "fundamental",
                })
              }
            >
              <LinearGradient
                colors={[c.goldBright, c.gold, c.goldDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.createNewButton}
              >
                <Plus color={c.onGold} size={14} strokeWidth={3} />
                <Text style={s.createNewButtonText}>Create new</Text>
              </LinearGradient>
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
            {Object.keys(defaultScanners).map((category) => (
              <ScannerCard
                key={category}
                title={category}
                items={defaultScanners[category] || []}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </ScreenWithHeader>
  );
};

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: c.background,
      padding: 16,
      paddingBottom: 20,
    },
    headerContainer: {
      paddingBottom: 20,
      flexDirection: "column",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 14,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: c.text,
      letterSpacing: -0.4,
    },
    breadcrumb: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
      gap: 2,
    },
    breadcrumbText: {
      fontSize: 12,
      fontWeight: "500",
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
      gap: 6,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: c.surface,
    },
    viewSavedButtonText: {
      fontWeight: "700",
      color: c.textSecondary,
      fontSize: 13,
    },
    createNewButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    createNewButtonText: {
      fontWeight: "800",
      color: c.onGold,
      fontSize: 13,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 18,
      backgroundColor: c.card,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 13,
      fontWeight: "600",
      color: c.textMuted,
    },
    scannerGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 18,
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
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: c.text,
      flex: 1,
      marginRight: 10,
      flexWrap: "wrap",
      letterSpacing: -0.2,
    },
    showAllButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: c.gold,
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
      paddingRight: 4,
    },
    scannerItem: {
      backgroundColor: c.surfaceElevated,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.borderLight,
      padding: 14,
      marginBottom: 10,
    },
    scannerItemContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flex: 1,
    },
    scannerName: {
      fontSize: 13,
      fontWeight: "600",
      color: c.text,
      flex: 1,
      marginRight: 8,
      flexWrap: "wrap",
    },
    scannerItemChevron: {
      width: 26,
      height: 26,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.goldLight,
    },
  });

export default ScannerFundamental;
