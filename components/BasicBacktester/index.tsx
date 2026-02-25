import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
} from "react-native";
import { ChevronRight } from "lucide-react-native"; // or your preferred icon library
// import BreadCrumb from "../../../../components/Common/BreadCrumb";
import StrategyFilters from "../UnflukeMain/BasicBacktester/StrategyFilters";
import StrategyLegs from "../../components/UnflukeMain/BasicBacktester/StrategyLegs";
import MTM from "../../components/UnflukeMain/BasicBacktester/MTM";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  clearValues,
  onChange,
  setEditStrategy,
} from "../../redux/slices/basicBacktester/reducer";
import ProgressBarBacktest from "../UnflukeMain/BasicBacktester/ProgressBarBacktest";
import { addStrategy } from "../../apis/BasicBacktester";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import MessageModal from "./MessageModal";

const BasicBacktester = () => {

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = createStyles(isDark);
  const [subUrl, setSubUrl] = useState("");
  const globalState = useSelector((store: any) => store.Layout);
  const backtester = useSelector((store: any) => store.BasicBacktester);
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useLocalSearchParams<{ state?: string }>();
  const [isBacktesting, setIsBacktesting] = useState(false);
  const auth = useSelector((store: any) => store.Login);
  const [stratId, setStratId] = useState(new Date().getMilliseconds());
  const [csvFilename, setCsvFilename] = useState("");

  const [resultsMessage, setResultsMessage] = useState("");

  const {
    name,
    strategySettings: {
      underlying,
      tradeType,
      duration,
      weekDays,
      startTime,
      endTime,
      nextDayEndTime,
      checkConditionNextDayAfter,
      daysBeforeExpiry,
    },
  } = backtester;

  useEffect(() => {
    if (globalState && globalState.appType) {
      setSubUrl(globalState.appType);
    }
  }, [globalState]);

  function handleChange(name, value) {
    // Since we don't have event.target in React Native, we pass field name and value directly
    console.log(name, value)
    dispatch(onChange({ name, value }));
  }

  function handleSubmit() {
    const legs = backtester.positions.legs;

    if (isBacktesting) return;

    if (name.trim() === "") {
      Alert.alert("Error", "Please enter a strategy name");
      return;
    }

    if (legs.length <= 0 || weekDays.length <= 0) {
      let errorToastMessage = "";

      if (legs.length <= 0) {
        errorToastMessage = "Please add at least one leg.";
      } else if (weekDays.length <= 0) {
        errorToastMessage = "Please select at least one weekday.";
      }

      Alert.alert("Error", errorToastMessage);
      return;
    }

    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];

      if (leg.quantity <= 0) {
        Alert.alert("Error", `Please enter a valid quantity for leg ${i + 1}`);
        return;
      }

      if (leg.target.type !== "None" && leg.target.value <= 0) {
        Alert.alert("Error", `Leg ${i + 1}: Target value as 0 is not allowed`);
        return;
      }

      if (leg.stopLoss.type !== "None" && leg.stopLoss.value <= 0) {
        Alert.alert(
          "Error",
          `Leg ${i + 1}: Stop Loss value as 0 is not allowed`
        );
        return;
      }
    }

    console.log("Entry hua hai")

    const { isEditing, editStrategyId, ...newState } = backtester;
    const ID = auth.user._id;
    console.log("aaya HamIcon", ID)
    console.log("This is the new state", newState)

    if (isEditing) {
      newState._id = editStrategyId;
    }
    const res = addStrategy(
      axios,
      newState,
      router,
      stratId,
      ID,
      isBacktesting,
      subUrl,
    );
    console.log("result aaya hai", res)

    if (res) {
      setIsBacktesting(true);
    }
  }

  useEffect(() => {
    if (params?.state) {
      try {
        const backtestDetails = typeof params.state === "string"
          ? JSON.parse(params.state)
          : params.state;
        const newState: any = {};
        for (let prop in backtestDetails) {
          if (backtester[prop] !== undefined) {
            newState[prop] = backtestDetails[prop];
          }
        }
        dispatch(setEditStrategy(newState));
      } catch (e) {
        console.error("Failed to parse state param", e);
      }
    }
  }, [params?.state]);

  useEffect(() => {
    if (resultsMessage === "") {
      if (csvFilename.trim() !== "") {
        router.push({
          pathname: "/basic-backtester-view",
          params: { filename: csvFilename.replace(".csv", "") },
        });
      }
    }
  }, [csvFilename, resultsMessage]);

  useEffect(() => {
    //console.log("BASIC BACKTESTER", backtester);
  }, [backtester]);

  console.log()

  return (
    <SafeAreaView style={styles.container}>
      {/* Message Modal */}
      {/* {resultsMessage && (
        <MessageModal
          message={resultsMessage}
          setResultsMessage={setResultsMessage}
        />
      )} */}

      {/* Main Content */}
      <View style={styles.pageContent}>
        <View style={styles.headerContainer}>
          {/* Left section: Title + breadcrumb */}
          <View>
            <Text style={styles.title}>Backtester Main</Text>
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText}>Pages</Text>
              <ChevronRight size={13} color="#6B7280" />
              <Text style={styles.breadcrumbText}>Basic Backtester</Text>
            </View>
          </View>
          {/* Right section: Buttons */}
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}

          {/* Main Content Container */}
          <View style={styles.mainContent}>
            {/* Strategy Filters */}
            <StrategyFilters
              {...backtester}
              name={name}
              handleNameChange={handleChange}
            />

            {/* Strategy Legs */}
            <StrategyLegs />

            {/* MTM */}
            <MTM />

            {/* Progress Bar Section */}
            {isBacktesting && (
              <ProgressBarBacktest
                auth={auth}
                setIsBacktesting={setIsBacktesting}
                stratId={stratId}
                setCsvFilename={setCsvFilename}
                setResultsMessage={setResultsMessage}
              />
            )}

            {/* Save Strategy Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                isBacktesting && styles.saveButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isBacktesting}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  isBacktesting && styles.saveButtonTextDisabled,
                ]}
              >
                Save Strategy
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F9FAFB",
    },
    pageContent: {
      flex: 1,
      paddingHorizontal: 12,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    headerContainer: {
      paddingBottom: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10,
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
    breadcrumbIcon: {
      marginHorizontal: 4,
    },
    mainContent: {
      flex: 1,
    },
    saveButton: {
      backgroundColor: "#2563EB", // bg-blue-600
      paddingVertical: 12,
      // paddingHorizontal: 16,
      borderRadius: 6,
      alignSelf: "flex-end", // float-end equivalent
      marginTop: 16,
      minWidth: 130, // w-lg equivalent
      elevation: 2, // Android shadow
      shadowColor: "#000", // iOS shadow
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
    },
    saveButtonDisabled: {
      backgroundColor: isDark ? "#374151" : "#6D97F1",
      elevation: 0,
      shadowOpacity: 0,
    },
    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },
    saveButtonTextDisabled: {
      color: isDark ? "#6B7280" : "#FFFFFF",
    },
  });

// Responsive styles for different screen sizes
// You can implement these using Dimensions or a responsive library
const getResponsiveStyles = () => {
  // This would typically use Dimensions.get('window').width
  // to apply different padding based on screen size
  // sm:px-8 md:px-16 lg:px-6 equivalent
  return {};
};

export default BasicBacktester;
