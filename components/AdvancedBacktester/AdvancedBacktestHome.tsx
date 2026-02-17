import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { useSelector } from "react-redux";
import axios from "axios";
import { ChevronRight } from "lucide-react-native";

import {
  fetchAdvancedStrategyDetails,
  goToAdvancedStrategyPage,
  toggleStrategyMonetize,
  toggleStrategyVisibility,
} from "../../apis/BasicBacktester";
import { deepCopy } from "../../components/UnflukeMain/Utils/common_vars";
import { Config } from "../../helpers/config";


const AdvancedBacktesterHome = () => {
  const navigation = useNavigation();

  // State variables
  const [savedStrategies, setSavedStrategies] = useState([]);
  const [purchasedStrats, setPurchasedStrats] = useState([]);
  const [strategy, setStrategy] = useState({});
  const [listStrategies, setListStrategies] = useState([]);
  const [publicScanners, setPublicScanners] = useState({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const [subUrl, setSubUrl] = useState("");

  const auth = useSelector((state) => state.Login);
  const globalState = useSelector((store) => store.Layout);

  // Set subUrl effect
  useEffect(() => {
    if (globalState && globalState.appType) {
      setSubUrl(globalState.appType);
    }
  }, [globalState]);

  // Toggle tab
  const toggleTab = (tab, type) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      let tmp = deepCopy(savedStrategies);

      if (type === "purchased") {
        tmp = tmp.filter((strat) => strat.monetize === true);
      }

      setListStrategies(tmp);
    }
  };

  // Handle delete strategy
  const handleDeleteStrategy = (strategyId) => {
    Alert.alert(
      "Delete Strategy",
      "Are you sure you want to delete this strategy? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (auth.user && auth.user._id) {
              axios
                .delete(
                  `${Config.BACKEND_URL}/api/stocks/deleteStrategy`,
                  {
                    params: {
                      user: auth.user._id,
                      id: strategyId,
                    },
                  },
                )
                .then((res) => {
                  const tmp = deepCopy(listStrategies);
                  const tmp1 = deepCopy(savedStrategies);
                  setListStrategies(tmp.filter((x) => x._id !== strategyId));
                  setSavedStrategies(tmp1.filter((x) => x._id !== strategyId));
                  Alert.alert("Success", "Strategy deleted successfully");
                })
                .catch((err) => {
                  console.log(err);
                  Alert.alert("Error", "Failed to delete strategy");
                });
            }
          }
        }
      ]
    );
  };

  // Handle private toggle
  const handlePrivate = async (index, isChecked) => {
    const newFiles = [...savedStrategies];
    newFiles[index].isPrivate = isChecked;
    setSavedStrategies(newFiles);
    
    try {
      await toggleStrategyVisibility(
        axios,
        newFiles[index].fileName.split(".")[0],
        true,
      );
    } catch (error) {
      console.error("Error toggling private status:", error);
      Alert.alert("Error", "Failed to update privacy settings");
    }
  };

  // Handle monetize toggle
  const handleMonetize = async (index, isChecked) => {
    const newFiles = [...savedStrategies];
    newFiles[index].monetize = isChecked;
    setSavedStrategies(newFiles);

    try {
      await toggleStrategyMonetize(
        axios,
        newFiles[index].fileName.split(".")[0],
        true,
      );
      if (newFiles[index].monetize) {
        setStrategy(newFiles[index]);
        setShow(true);
      }
    } catch (error) {
      console.error("Error toggling monetize status:", error);
      Alert.alert("Error", "Failed to update monetization settings");
    }
  };

  // Share backtester
  const shareBacktester = async (fileName) => {
    if (fileName) {
      const link = `${Config.PUBLIC_URL}/basic-backtester-view?filename=${fileName.split(".")[0]}&advanced=yes`;
      
      try {
        await Share.share({
          message: link,
          url: link,
        });
      } catch (error) {
        Alert.alert("Error", "Could not share link");
      }
    } else {
      Alert.alert("Error", "Could not generate share link");
    }
  };

  // Navigate to strategy view
  const navigateToStrategyView = (fileName) => {
    navigation.navigate('basic-backtester-view', {
      filename: fileName.replace(".csv", ""),
      advanced: "yes"
    });
  };

  // Navigate to strategy page
  const navigateToStrategyPage = async (userId, strategyId) => {
     const stratDetails = await fetchAdvancedStrategyDetails(axios, userId, strategyId)
    
        console.log("stratDetails", stratDetails)
    
        if(stratDetails){
            navigation.navigate(`advanced-backtester`, {
                state: stratDetails
            })
        }
  };

  // Format number for display
  const formatNumber = (raw) => {
    const num = typeof raw === "number" ? raw : Number(raw);
    const intVal = Number.isFinite(num) ? Math.trunc(num) : null;
    return intVal !== null ? intVal.toLocaleString("en-IN") : "-";
  };

  // Strategy Table Component
  const StrategyTable = ({ strategies }) => {
    return (
      <View style={styles.tableContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tableScrollContent}
        >
          <View style={styles.tableWrapper}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.headerText, styles.strategyNameCell]}>Strategy Name</Text>
              <Text style={[styles.tableCell, styles.headerText, styles.switchCell]}>Private</Text>
              <Text style={[styles.tableCell, styles.headerText, styles.switchCell]}>Monetize</Text>
              <Text style={[styles.tableCell, styles.headerText, styles.actionCell]}>Actions</Text>
            </View>

            {/* Data Rows */}
            {strategies.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow2,
                  index % 2 === 0 ? styles.evenRow : styles.oddRow,
                ]}
              >
                <TouchableOpacity 
                  style={[styles.tableCell, styles.strategyNameCell]}
                  onPress={() => navigateToStrategyPage(item.user, item._id)}
                >
                  <Text style={styles.strategyNameText}>{item.strategyName}</Text>
                </TouchableOpacity>

                {/* Private Switch */}
                <View style={[styles.tableCell, styles.switchCell]}>
                  <Switch
                    value={item.isPrivate}
                    onValueChange={(val) => handlePrivate(index, val)}
                  />
                </View>

                {/* Monetize Switch */}
                <View style={[styles.tableCell, styles.switchCell]}>
                  <Switch
                    value={item.monetize}
                    disabled={item.isPrivate}
                    onValueChange={(val) => handleMonetize(index, val)}
                  />
                </View>

                {/* Actions */}
                <View style={[styles.tableCell, styles.actionCell]}>
                  <TouchableOpacity onPress={() => shareBacktester(item.fileName)}>
                    <Ionicons name="share-outline" size={18} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigateToStrategyView(item.fileName)}>
                    <Ionicons name="eye" size={18} color="#16a34a" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteStrategy(item._id)}
                  >
                    <Ionicons name="trash" size={18} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const TabButton = ({ title, tabId, filterType, isActive, onPress }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        isActive ? styles.activeTabButton : styles.inactiveTabButton
      ]}
      onPress={() => onPress(tabId, filterType)}
    >
      <Text style={[
        styles.tabText,
        isActive ? styles.activeTabText : styles.inactiveTabText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const EmptyState = ({ message }) => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  const LoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={styles.loadingText}>Loading strategies...</Text>
    </View>
  );

  // Fetch strategies effect
  useEffect(() => {
    if (auth && auth.user) {
      axios
        .get(
          `${Config.BACKEND_URL}/api/stocks/getSavedStrategies?user=${auth.user._id}`,
        )
        .then((res) => {
          if (res) {
            setSavedStrategies(res);
            setListStrategies(res);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });

      axios
        .get(
          `${Config.BACKEND_URL}/api/strategy/basic/purchased/?i=${auth.user._id}`,
        )
        .then((res) => {
          if (res && res.data) {
            const allPurchasedStrategies = res.data;
            setPurchasedStrats(allPurchasedStrategies);
          }
        })
        .catch((err) => console.log(err));
    }
  }, [auth]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Backtester Home</Text>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>Pages</Text>
            <ChevronRight size={13} color="#6B7280" />
            <Text style={styles.breadcrumbText}>Advanced Backtester</Text>
          </View>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeaderSection}>
            <Text style={styles.cardTitle}>Home</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('advanced-backtester')}
            >
              <Ionicons name="add" size={15} color="white" />
              <Text style={styles.createButtonText}>Create new</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Container */}
          <View style={styles.tabContainer}>
            <TabButton
              title="Your strategies"
              tabId="1"
              filterType="all"
              isActive={activeTab === "1"}
              onPress={toggleTab}
            />
            <TabButton
              title="Purchased strategies"
              tabId="2"
              filterType="purchased"
              isActive={activeTab === "2"}
              onPress={toggleTab}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {!loading ? (
              <>
                {listStrategies.length > 0 ? (
                  <StrategyTable strategies={listStrategies} />
                ) : (
                  <EmptyState message="No strategies found." />
                )}
              </>
            ) : (
              <LoadingState />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 85,
    paddingHorizontal: 12,
  },
  scrollView: {
    flex: 1,
    padding: 1,
  },
  headerContainer: {
    paddingBottom: 16,
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
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 16
  },
  cardHeaderSection: {
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  createButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    margin: 20,
    marginBottom: 0,
    borderRadius: 6,
    padding: 4,
  },
   tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: "center"
  },
  activeTabButton: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inactiveTabButton: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: "center"
  },
  activeTabText: {
    color: '#111827',
  },
  inactiveTabText: {
    color: '#64748b',
  },
  content: {
    padding: 20,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableScrollContent: {
    minWidth: '100%',
  },
  tableWrapper: {
    minWidth: 700, // Adjust based on your content
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRow2: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeader: {
    backgroundColor: "#f5f7fa",
  },
  evenRow: {
    backgroundColor: "#fff",
  },
  oddRow: {
    backgroundColor: "#f9fafb",
  },
  tableCell: {
    textAlign: "center",
    fontSize: 13,
    color: "#374151",
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
    color: "#374151",
  },
  // Specific cell width styles
  strategyNameCell: {
    width: 200,
    flex: 0,
    alignItems: 'flex-start',
  },
  switchCell: {
    width: 80,
    flex: 0,
    alignItems: 'center',
  },
  actionCell: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: 120,
    flex: 0,
    gap: 8,
  },
  strategyNameText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default AdvancedBacktesterHome;