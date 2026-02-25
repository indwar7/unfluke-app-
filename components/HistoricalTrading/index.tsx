import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
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
  const dateData = createSelector(
    (state) => state.Historical,
    (data) => data.historicalDateTime,
  );
  const selectDashboardData = createSelector(
    (state) => state.Layout,
    (state) => ({ layoutModeType: state.layoutModeType }),
  );

  const { layoutModeType } = useSelector(selectDashboardData);
  const user = useSelector(auth);
  // @ts-ignore
  const selectedStock = useSelector((state) => state.GlobalStock.selectedStock);
  const currentDatetime = useSelector(dateData);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.container}>

      {/* Mobile hamburger - only on small screens, no title (title comes from nav) */}
      {width < 768 && (
        <TouchableOpacity
          style={styles.hamburger}
          onPress={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X size={20} color="#6b7280" />
          ) : (
            <Menu size={20} color="#6b7280" />
          )}
        </TouchableOpacity>
      )}

      {/* Main Container */}
      <View style={[styles.mainContainer, {
        paddingHorizontal:
          width >= 1280 ? 96 :
            width >= 1024 ? 40 :
              width >= 768 ? 32 : 0,
      }]}>
        <View style={[styles.contentContainer, {
          flexDirection: width >= 768 ? 'row' : 'column',
        }]}>

          {/* Desktop Sidebar */}
          {width >= 768 && (
            <View style={styles.desktopSidebar}>
              <View style={styles.sidebarContent}>
                <Watchlist />
              </View>
            </View>
          )}

          {/* Right Section */}
          <View style={[styles.rightSection, width >= 768 && styles.rightSectionDesktop]}>
            <View style={styles.controlsContainer}>
              <ChartControls />
            </View>
            <View style={styles.chartContainer}>
              <View style={styles.chartWrapper}>
                <TVChartContainer
                  coinId={
                    selectedStock?.symbol
                      ? selectedStock.symbol.startsWith('NSE:')
                        ? selectedStock.symbol
                        : `NSE:${selectedStock.symbol}`
                      : "NSE:NIFTY"
                  }
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      <SidebarModal sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  /* Floating hamburger for mobile - no header bar, just the icon */
  hamburger: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 100,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  mainContainer: {
    flex: 1,
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
    marginLeft: 0,
  },
  controlsContainer: {
    marginTop: 2,
    marginBottom: 3,
    marginHorizontal: 12,
  },
  chartContainer: {
    flex: 1,
    marginTop: 10,
  },
  chartWrapper: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
});

export default Trading;