import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
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
import { ChevronRight } from 'lucide-react-native';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

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
    setcsvFilename(filename);

    if (filename) {
      const normalFilename = filename.substring(2);
      setcsvFilename1("0.5_" + normalFilename);
      setcsvFilename2("1_" + normalFilename);
    }
  }, [filename]);

  // Load CSV data and analysis
  useEffect(() => {
    async function csvToJson() {
      const ID = auth.user._id;
      try {
        if (ID && csvFilename && csvFilename1 && csvFilename2) {
          const data = await getCsvUrl(axios, {
            fileName: csvFilename,
            fileName1: csvFilename1,
            fileName2: csvFilename2,
            ID: ID,
            advancedBacktester: advanced ? true : false,
          });

          // console.log("RECEIVED ANALYSIS FOR THIS STRATEGY", data);
          setLoading(false);

          console.log("setting csv data...");
          setNewstrategyDataFromCSV(data.csvData);

          console.log("setting download URLs...");
          setdownloadUrl(data.link);
          setdownloadUrl1(data.link1);
          setdownloadUrl2(data.link2);

          if (data.csvData) {
            console.log("setting number of trades...");
            setnumberOfTrade(data.csvData.length);
          }

          if (data.analysis && data.analysis.analysis) {
            const analysis = data.analysis.analysis;

            // console.log("setting analysis...", analysis.analysis0);
            setAnalysis0(analysis.analysis0);
            setAnalysis1(analysis.analysis1);
            setAnalysis2(analysis.analysis2);
          }

          console.log("analysis set...");
        }
      } catch (error) {
        console.error('Error loading CSV data:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to load strategy data. Please try again.');
      }
    }

    csvToJson();
  }, [auth.user._id, csvFilename, csvFilename1, csvFilename2, advanced]);

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
    const iconMap = {
      'chevron-right': 'chevron-forward',
      'edit': 'create-outline',
      'clock': 'time-outline',
      'refresh': 'refresh-outline',
      'activity': 'pulse-outline',
    };

    return (
      <Ionicons
        name={iconMap[name] || name}
        size={size}
        color={color || (isDark ? '#9CA3AF' : '#6B7280')}
      />
    );
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
              <ChevronRight size={13} color="#6B7280" />
              <Text style={styles.breadcrumbText}>view Strategy</Text>
            </View>
          </View>
          {!isAdvanced && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEdit}
            >
              {renderIcon('edit', 16, '#FFFFFF')}
              <Text style={styles.editButtonText}>Edit Strategy</Text>
            </TouchableOpacity>
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
          {!isAdvanced && legSummaries && Object.keys(legSummaries).length > 0 && (
            <View style={styles.legSummariesContainer}>
              <View style={styles.legSummariesHeader}>
                {renderIcon('activity', 20, isDark ? '#60A5FA' : '#2563EB')}
                <Text style={styles.legSummariesTitle}>Leg Summaries</Text>
              </View>

              <View style={styles.legSummariesList}>
                {Object.entries(legSummaries).map(
                  ([legId, summary], idx) => (
                    <View key={legId} style={styles.legSummaryItem}>
                      <Text style={styles.legNumber}>Leg {idx + 1}</Text>
                      <View style={styles.tagsContainer}>
                        {(summary || []).map((s, i) => (
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
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Loading the strategy...</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#111827' : '#F9FAFB',
  },
  pageContent: {
    paddingTop: 85,
    paddingHorizontal: 12,
    paddingBottom: 20
  },
  headerLeft: {
    flex: 1,
  },
  headerContainer: {
    paddingBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  breadcrumbText: {
    fontSize: 12,
    color: "#6B7280",
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 12,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  mainCard: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#E5E7EB',
    padding: 16,
    marginBottom: 15,
  },
  cardHeader: {
    marginBottom: 24,
  },
  cardHeaderContent: {
    gap: 8,
  },
  strategyName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: isDark ? '#F1F5F9' : '#0F172A',
    marginBottom: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  basicSummaryGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#111827' : '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    minWidth: 100,
  },
  summaryText: {
    fontSize: 12,
    color: isDark ? '#9CA3AF' : '#475569',
    marginLeft: 8,
    flex: 1,
  },
  legSummariesContainer: {
    backgroundColor: isDark ? '#111827' : '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#E5E7EB',
    padding: 16,
  },
  legSummariesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legSummariesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: isDark ? '#F1F5F9' : '#0F172A',
    marginLeft: 8,
  },
  legSummariesList: {
    gap: 12,
  },
  legSummaryItem: {
    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.4)',
    padding: 12,
  },
  legNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: isDark ? '#CBD5E1' : '#334155',
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: isDark ? 'rgba(29, 78, 216, 0.4)' : '#DBEAFE',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(30, 64, 175, 0.5)' : 'rgba(191, 219, 254, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: isDark ? '#BFDBFE' : '#000000',
  },
  contentSection: {
    marginTop: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: 'bold',
    color: isDark ? '#FFFFFF' : '#111827',
  },
});

export default ViewStrategy;
