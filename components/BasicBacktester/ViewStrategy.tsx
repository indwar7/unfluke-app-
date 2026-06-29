import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

import { Ionicons } from '@expo/vector-icons';

// import BreadCrumb from "../../components/Common/BreadCrumb";
import GraphicBlocks from "../../components/UnflukeMain/BasicBacktester/StrategyView";
import { useSelector } from "react-redux";
import queryString from "query-string";
import GraphicalInfo from "../../components/UnflukeMain/BasicBacktester/StrategyView/GraphicalInfo";
import { getCsvUrl } from "../../apis/BasicBacktester";

import { store } from "../../redux/store";
import { useDispatch } from "react-redux";
import { setEditStrategy } from "../../redux/slices/basicBacktester/reducer";
import {
  ChevronRight,
  Pencil,
  Clock,
  RefreshCw,
  Activity,
} from 'lucide-react-native';

import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { GoldButton } from "@/components/ui/Premium";

const ViewStrategy = () => {

  // State management
  const [NewstrategyDataFromCSV, setNewstrategyDataFromCSV] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [slippage, setSlippage] = useState("0");
  const [downloadUrl, setdownloadUrl] = useState("");
  const [downloadUrl1, setdownloadUrl1] = useState("");
  const [downloadUrl2, setdownloadUrl2] = useState("");
  const [numberOfTrade, setnumberOfTrade] = useState(0);
  const [csvFilename, setcsvFilename] = useState("");
  const [csvFilename1, setcsvFilename1] = useState("");
  const [csvFilename2, setcsvFilename2] = useState("");

  const [analysis0, setAnalysis0] = useState({});
  const [analysis1, setAnalysis1] = useState({});
  const [analysis2, setAnalysis2] = useState({});

  // Redux and Navigation
  const auth = useSelector((state: any) => state.Login);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  // Get strategy data from Redux store
  const legSummaries = useSelector(
    (store: any) => store.BasicBacktester.positions.legSummaries
  );

  const { name, strategySettings, positions } = useSelector(
    (state: any) => state.BasicBacktester
  );

  // Parse route params (equivalent to query string parsing)
  const {
    advanced,
    strategyName,
    reEntry,
    sid,
    uid,
    filename
  } = route.params || {};

  const isAdvanced = advanced === "yes";

  let reEntryParsed = reEntry;
  try {
    reEntryParsed = JSON.parse(reEntry);
  } catch (e) {
    // leave as string if not JSON
  }

  // Theme
  const { colors: c, isDark } = useTheme();
  const styles = createStyles(c, isDark);

  // Save strategy to AsyncStorage (localStorage equivalent)
  useEffect(() => {
    if (isAdvanced) return; // only basic
    if (name && name !== "strategy_name") {
      const payload = { name, strategySettings, positions };
      try {
        const key = `basicView:lastStrategy:${csvFilename || "default"}`;
        AsyncStorage.setItem(key, JSON.stringify(payload));
        AsyncStorage.setItem("basicView:lastStrategy", JSON.stringify(payload)); // generic fallback
      } catch (error) {
        console.error('Error saving strategy:', error);
      }
    }
  }, [isAdvanced, name, strategySettings, positions, csvFilename]);

  // Load strategy from AsyncStorage
  useEffect(() => {
    if (isAdvanced) return;
    const isPlaceholder =
      name === "strategy_name" &&
      (!positions?.legs || positions.legs.length === 0);

    if (isPlaceholder) {
      const loadStoredStrategy = async () => {
        try {
          const key = `basicView:lastStrategy:${csvFilename || "default"}`;
          let stored = await AsyncStorage.getItem(key);
          if (!stored) {
            stored = await AsyncStorage.getItem("basicView:lastStrategy");
          }
          if (stored) {
            dispatch(setEditStrategy(JSON.parse(stored)));
          }
        } catch (error) {
          console.error('Error loading strategy:', error);
        }
      };
      loadStoredStrategy();
    }
  }, [isAdvanced, name, positions?.legs, csvFilename, dispatch]);

  // Set CSV filenames from route params
  useEffect(() => {
    if (typeof filename !== "string" || filename.length === 0) {
      setLoading(false);
      return;
    }

    setcsvFilename(filename);
    const normalFilename = filename.length > 2 ? filename.substring(2) : filename;
    setcsvFilename1("0.5_" + normalFilename);
    setcsvFilename2("1_" + normalFilename);
  }, [filename]);

  // Load CSV data and analysis
  useEffect(() => {
    async function csvToJson() {
      const ID = auth?.user?._id;
      try {
        if (ID && csvFilename && csvFilename1 && csvFilename2) {
          const data = await getCsvUrl(axios, {
            fileName: csvFilename,
            fileName1: csvFilename1,
            fileName2: csvFilename2,
            ID: ID,
            advancedBacktester: advanced ? true : false,
          });

          setLoading(false);

          if (!data || typeof data !== "object") {
            setNewstrategyDataFromCSV([]);
            return;
          }

          setNewstrategyDataFromCSV(Array.isArray(data.csvData) ? data.csvData : []);
          setdownloadUrl(data.link || "");
          setdownloadUrl1(data.link1 || "");
          setdownloadUrl2(data.link2 || "");

          if (Array.isArray(data.csvData)) {
            setnumberOfTrade(data.csvData.length);
          } else {
            setnumberOfTrade(0);
          }

          const analysis = data.analysis && data.analysis.analysis;
          if (analysis) {
            setAnalysis0(analysis.analysis0 || {});
            setAnalysis1(analysis.analysis1 || {});
            setAnalysis2(analysis.analysis2 || {});
          }
        }
      } catch (error) {
        console.error('Error loading CSV data:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to load strategy data. Please try again.');
      }
    }

    csvToJson();
  }, [auth?.user?._id, csvFilename, csvFilename1, csvFilename2, advanced]);

  // Handle edit navigation
  function handleEdit() {
    try {
      // Get current state - you'll need to adapt this based on your Redux store structure
      const slice = store.getState?.()?.BasicBacktester || {};

      const strategyForEdit = {
        ...slice,
        isEditing: true,
        editStrategyId: sid || slice.editStrategyId || slice._id || null,
      };

      navigation.navigate('basic-backtester', {
        strategyData: strategyForEdit
      });

    } catch (error) {
      console.error('Error navigating to edit:', error);
      Alert.alert('Error', 'Failed to open strategy editor.');
    }
  }

  // Helper functions
  const getAnalysis = () => {
    if (slippage === "0") return analysis0;
    if (slippage === "0.5") return analysis1;
    return analysis2;
  };

  const renderIcon = (name, size = 16, color) => {
    const iconColor = color || c.textMuted;
    const iconMap = {
      'chevron-right': ChevronRight,
      'edit': Pencil,
      'clock': Clock,
      'refresh': RefreshCw,
      'activity': Activity,
    };

    const IconComponent = iconMap[name];
    if (IconComponent) {
      return <IconComponent size={size} color={iconColor} />;
    }
    return <Ionicons name={name} size={size} color={iconColor} />;
  };

  const formatTime = (timeObj) => {
    if (!timeObj) return "—";
    return `${timeObj.hour}:${timeObj.minute}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.pageContent}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          {/* Left section: Title + breadcrumb */}
          <View>
            <Text style={styles.title}>Strategy</Text>
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText}>Strategy</Text>
              <ChevronRight size={13} color={c.textMuted} />
              <Text style={styles.breadcrumbText}>view Strategy</Text>
            </View>
          </View>
          {!isAdvanced && (
            <GoldButton
              label="Edit Strategy"
              onPress={handleEdit}
              icon={<Pencil size={15} color={c.onGold} />}
              style={styles.editButton}
            />
          )}

        </View>



        {/* Main Card */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderContent}>
              {/* Strategy Name */}
              <Text style={styles.strategyName}>
                {isAdvanced ? strategyName : name || "Strategy"}
              </Text>

              {/* Summary Section */}
              {isAdvanced ? (
                // Advanced Mode Summary
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryItem}>
                    {renderIcon('refresh', 16)}
                    <Text style={styles.summaryText}>
                      Entries: {Array.isArray(reEntryParsed)
                        ? reEntryParsed.join(", ")
                        : reEntryParsed || "—"}
                    </Text>
                  </View>
                </View>
              ) : (
                // Basic Mode Summary
                <View style={styles.basicSummaryGrid}>
                  <View style={styles.summaryItem}>
                    {renderIcon('clock', 16)}
                    <Text style={styles.summaryText}>
                      {formatTime(strategySettings?.startTime)}
                    </Text>
                  </View>

                  <View style={styles.summaryItem}>
                    {renderIcon('clock', 16)}
                    <Text style={styles.summaryText}>
                      {formatTime(strategySettings?.endTime)}
                    </Text>
                  </View>

                  <View style={styles.summaryItem}>
                    {renderIcon('refresh', 16)}
                    <Text style={styles.summaryText}>
                      Re-entry: {positions?.reEntry ?? "—"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Leg Summaries - Only if not Advanced */}
          {!isAdvanced &&
            legSummaries &&
            typeof legSummaries === "object" &&
            Object.keys(legSummaries).length > 0 && (
            <View style={styles.legSummariesContainer}>
              <View style={styles.legSummariesHeader}>
                <View style={styles.legSummariesIcon}>
                  {renderIcon('activity', 18, c.gold)}
                </View>
                <Text style={styles.legSummariesTitle}>Leg Summaries</Text>
              </View>

              <View style={styles.legSummariesList}>
                {Object.entries(legSummaries).map(
                  ([legId, summary], idx) => (
                    <View key={legId} style={styles.legSummaryItem}>
                      <Text style={styles.legNumber}>Leg {idx + 1}</Text>
                      <View style={styles.tagsContainer}>
                        {(Array.isArray(summary) ? summary : []).map((s, i) => (
                          <View key={i} style={styles.tag}>
                            <Text style={styles.tagText}>{s}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )
                )}
              </View>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {!Loading && analysis0 && analysis1 && analysis2 ? (
            <GraphicBlocks
              NewstrategyDataFromCSV={NewstrategyDataFromCSV}
              Loading={Loading}
              downloadUrl={downloadUrl}
              downloadUrl1={downloadUrl1}
              downloadUrl2={downloadUrl2}
              numberOfTrade={numberOfTrade}
              advancedBacktester={false}
              analysis={getAnalysis()}
              slippage={slippage}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={c.gold} />
              <Text style={styles.loadingText}>Loading the strategy...</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  pageContent: {
    paddingTop: 4,
    paddingHorizontal: 14,
    paddingBottom: 28,
  },
  headerLeft: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 6,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    marginTop: 5,
    gap: 2,
  },
  breadcrumbText: {
    fontSize: 12,
    fontWeight: "600",
    color: c.textMuted,
  },
  editButton: {
    minWidth: 130,
  },
  mainCard: {
    backgroundColor: c.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.border,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 22,
  },
  cardHeaderContent: {
    gap: 12,
  },
  strategyName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
    color: c.text,
    marginBottom: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  basicSummaryGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surfaceElevated,
    borderWidth: 1,
    borderColor: c.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    minWidth: 100,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: c.textSecondary,
    marginLeft: 8,
    flex: 1,
    fontVariant: ['tabular-nums'],
  },
  legSummariesContainer: {
    backgroundColor: c.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    padding: 16,
  },
  legSummariesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  legSummariesIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.goldLight,
    borderWidth: 1,
    borderColor: c.gold + '55',
  },
  legSummariesTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: c.textMuted,
  },
  legSummariesList: {
    gap: 10,
  },
  legSummaryItem: {
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    padding: 14,
  },
  legNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: c.goldLight,
    borderWidth: 1,
    borderColor: c.gold + '40',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: isDark ? c.gold : c.goldDeep,
  },
  contentSection: {
    marginTop: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 48,
    backgroundColor: c.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.border,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
    color: c.textSecondary,
  },
});

export default ViewStrategy;
