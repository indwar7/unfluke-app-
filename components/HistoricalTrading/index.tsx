import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  useWindowDimensions,
} from "react-native";
import { createSelector } from "reselect";
import { useSelector } from "react-redux";
import { Menu, X } from "lucide-react-native";
import Watchlist from "./Watchlist";
import ChartControls from "./ChartControls";
import TVChartContainer from "../../components/UnflukeMain/TradingViewChart/TradingViewChart";
import SidebarModal from "./WatchListModal";


const Trading = () => {
  const auth = createSelector(
    (state) => state.Login,
    (auth) => auth.user,
  );
  const historicaldata = createSelector(
    (state) => state.Historical,
    (data) => data.selectedSymbol,
  );
  const dateData = createSelector(
    (state) => state.Historical,
    (data) => data.historicalDateTime,
  );
  const selectDashboardData = createSelector(
    (state) => state.Layout,
    (state) => ({
      layoutModeType: state.layoutModeType,
    }),
  );

  const { layoutModeType } = useSelector(selectDashboardData);
  const user = useSelector(auth);
  const selectedSymbol = useSelector(historicaldata);
  const currentDatetime = useSelector(dateData);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { width } = useWindowDimensions()
  console.log("Historic Trading View Props:", {
    containerId: "historic-trading-view-chart",
    fullScreen: false,
    layoutMode: layoutModeType,
    symbol: selectedSymbol,
    currentDate: currentDatetime,
    userID: user?._id,
    maxYear: user?.charts_fno,
  });

  return (
    <SafeAreaView style={styles.container}>

      {/* Mobile sidebar toggle button */}
      <View style={[styles.mobileToggleContainer, {
        display: width >= 768 ? 'none' : 'flex',
      }]}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X size={20} color="#6b7280" />
          ) : (
            <Menu size={20} color="#6b7280" />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Container */}
      <View style={[styles.mainContainer, {
        paddingHorizontal: width >= 1280 ? 96 : width >= 1024 ? 40 : width >= 768 ? 32 : 0,
      }]}>
        <View style={[styles.contentContainer, {
          flexDirection: width >= 768 ? 'row' : 'column',
        }]}>

          {/* Desktop Sidebar - Always visible on larger screens */}
          {width >= 768 && (
            <View style={styles.desktopSidebar}>
              <View style={styles.sidebarContent}>
                <Watchlist />
              </View>
            </View>
          )}

          {/* RIGHT SECTION - ChartControls + Chart */}
          <View style={[
            styles.rightSection,
            width >= 768 && styles.rightSectionDesktop
          ]}>
            {/* Controls */}
            <View style={styles.controlsContainer}>
              <ChartControls />
            </View>

            <View style={styles.chartContainer}>
              <View style={styles.chartWrapper}>
                <TVChartContainer coinId={selectedSymbol ? (selectedSymbol.startsWith('NSE:') ? selectedSymbol : `NSE:${selectedSymbol}`) : "NSE:NIFTY"} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Mobile Sidebar Modal */}
      {/* <Modal
        visible={sidebarOpen && width < 768}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSidebarOpen(false)}
      >
       <View style={styles.modalOverlay}>
  <View style={styles.mobileSidebar}>
    <View style={styles.mobileSidebarHeader}>
      <Text style={styles.sidebarTitle}>Watchlist</Text>
      <TouchableOpacity
        onPress={() => setSidebarOpen(false)}
        style={styles.closeButton}
      >
        <X size={24} color="#6b7280" />
      </TouchableOpacity>
    </View>
    <View style={styles.mobileSidebarContent}>
      <Watchlist />
    </View>
  </View>

  <TouchableOpacity
    style={styles.modalBackdrop}
    activeOpacity={1}
    onPress={() => setSidebarOpen(false)}
  />
</View>
      </Modal> */}
      <SidebarModal sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 1,
  },
  mobileToggleContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 100,
    right: 12,
    zIndex: 50,
    // Only show on mobile
  },
  toggleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mainContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 80 : 100,
  },
  contentContainer: {
    flex: 1,
    gap: 16,
  },
  desktopSidebar: {
    width: 400,
    height: '100%',
  },
  sidebarContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
  },
  rightSection: {
    flex: 1,
    flexDirection: 'column',
  },
  rightSectionDesktop: {
    marginLeft: 0, // No margin needed as we use gap in contentContainer
  },
  controlsContainer: {
    marginTop: 2,
    marginBottom: 3,
    marginHorizontal: 12,
  },
  chartContainer: {
    flex: 1,
    marginTop: 10
  },
  chartWrapper: {
    flex: 1,
    // borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  emptyChart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  emptyChartText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Modal styles for mobile sidebar
  // modalOverlay: {
  //   flex: 1,
  //   flexDirection: 'row',
  // },
  //   modalBackdrop: {
  //     flex: 1,
  //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
  //   },
  //   mobileSidebar: {
  //     width: Math.min(400, width * 0.85),
  //     backgroundColor: '#ffffff',
  //     shadowColor: '#000',
  //     shadowOffset: {
  //       width: 2,
  //       height: 0,
  //     },
  //     shadowOpacity: 0.25,
  //     shadowRadius: 10,
  //     elevation: 10,
  //   },
  //   mobileSidebarHeader: {
  //     flexDirection: 'row',
  //     justifyContent: 'space-between',
  //     alignItems: 'center',
  //     padding: 16,
  //     borderBottomWidth: 1,
  //     borderBottomColor: '#e5e7eb',
  //     backgroundColor: '#f9fafb',
  //   },
  //   closeButton: {
  //     padding: 4,
  //   },
  //   mobileSidebarContent: {
  //     flex: 1,
  //     padding: 16,
  //     maxHeight: height * 0.8,
  //   },
});

export default Trading;