import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useSelector, useDispatch } from "react-redux";
import { Config } from "../../helpers/config";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { ChevronRight, Trash2, Plus } from "lucide-react-native";

import {
  clearValues,
  handleAddLeg,
  handleChange,
  handleMTMChange,
  handleRemoveLeg,
  setBacktester,
} from "../../redux/slices/advancedBacktester/reducer";

import LegTabs from "../../components/UnflukeMain/AdvancedBacktester/LegTabs";
import AdvancedMTM from "../../components/UnflukeMain/AdvancedBacktester/MTM";

import {
  advBacktestLegs,
  advOperators,
  binaryOperators,
  conditionalOperators,
  mathOperators,
  reEntriesGlobal,
} from "../../components/UnflukeMain/Utils/common_vars";

import { deepCopy } from "../../components/UnflukeMain/BasicBacktester/StrategyLegs/utils";
import { backendSocket } from "../../socket/socket";

const AdvancedBacktester = () => {
  const isDark = false;
  const dynamicStyles = createStyles(isDark);

  const advancedState = useSelector((store: any) => store.AdvancedBacktester);
  const auth = useSelector((store: any) => store.Login);
  const globalState = useSelector((store: any) => store.Layout);

  const dispatch = useDispatch();
  const params = useLocalSearchParams<{ state?: string }>();

  const [indicators, setIndicators] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [errorDialog, setErrorDialog] = useState("");
  const [resultsMessage, setResultsMessage] = useState("");
  const [subUrl, setSubUrl] = useState("");

  const windowId = useRef(new Date().getMilliseconds());

  useEffect(() => {
    if (globalState?.appType) setSubUrl(globalState.appType);
  }, [globalState]);

  useEffect(() => {
    axios
      .get(`${Config.BACKEND_URL}/api/scanner/overlap-studies`)
      .then((res) => {
        // ✅ Fixed: handle axios response wrapper
        const data = res?.data ?? res;
        setIndicators(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err));
  }, []);

  // ✅ Fixed: React Native dispatch helpers (no e.target pattern)
  const dispatchChange = (name: string, value: any) => {
    switch (name) {
      case "mtm.target":
        dispatch(handleMTMChange({ name: "target", value: parseFloat(value) || 0 }));
        return;
      case "mtm.stoploss":
        dispatch(handleMTMChange({ name: "stoploss", value: parseFloat(value) || 0 }));
        return;
      case "mtm.trailX":
        dispatch(handleMTMChange({ name: "trailX", value: parseFloat(value) || 0 }));
        return;
      case "mtm.trailY":
        dispatch(handleMTMChange({ name: "trailY", value: parseFloat(value) || 0 }));
        return;
      case "entries":
        dispatch(handleChange({ name, value: parseInt(value) || 1 }));
        return;
      default:
        dispatch(handleChange({ name, value }));
    }
  };

  // ✅ Wrapper so LegTabs / AdvancedMTM still work if they pass e.target style
  function handleAllChanges(e: any) {
    if (e && e.target) {
      dispatchChange(e.target.name, e.target.value);
    } else if (e && e.name !== undefined) {
      dispatchChange(e.name, e.value);
    }
  }

  function addLeg() {
    dispatch(handleAddLeg({ index: advancedState.totalLegs }));
  }

  function removeLeg() {
    Alert.alert("Delete Leg", "Are you sure you want to delete the current leg?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          dispatch(handleRemoveLeg({ index: activeTab }));
          const next = parseInt(activeTab) - 1;
          if (next >= 1) setActiveTab(next.toString());
        },
      },
    ]);
  }

  const lhsRhsValid = (subEquation: any[]) => {
    let op = "";
    const LHS: string[] = [];
    const RHS: string[] = [];

    for (const item of subEquation) {
      const indicName = item.indicatorName;
      if (binaryOperators.indexOf(indicName) !== -1) return true;
      if (conditionalOperators.indexOf(indicName) !== -1) {
        if (op === "") op = indicName;
        else return false;
      } else {
        if (op !== "") LHS.push(indicName);
        else RHS.push(indicName);
      }
    }
    return LHS.length > 0 && RHS.length > 0;
  };

  const checkEquation = (equation: any[][]) => {
    let pseudoEquation = "";
    let totalLength = 0;

    for (const subEquation of equation) {
      if (!lhsRhsValid(subEquation)) return false;
      for (const item of subEquation) {
        const indicName = item.indicatorName;
        if (mathOperators.indexOf(indicName) !== -1 || conditionalOperators.indexOf(indicName) !== -1) {
          pseudoEquation += " " + indicName + " ";
        } else if (advOperators.indexOf(indicName) !== -1) {
          pseudoEquation += " > ";
        } else if (binaryOperators.indexOf(indicName) !== -1) {
          pseudoEquation += " || ";
        } else {
          pseudoEquation += " 1 ";
        }
        totalLength += 1;
      }
    }

    if (totalLength <= 1) return false;

    try {
      const evalVal = eval(pseudoEquation.trim()) + "";
      return evalVal !== "";
    } catch {
      return false;
    }
  };

  function checkIsBacktesterValid() {
    for (let i = 0; i < advancedState.totalLegs; i++) {
      const leg = advancedState.legs["entry"][i];
      if (!leg.scannerExpr.length || !checkEquation(leg.scannerExpr)) {
        setErrorDialog(`Please create a valid expression in entry leg ${i + 1}`);
        return false;
      }
    }
    for (let i = 0; i < advancedState.totalLegs; i++) {
      const leg = advancedState.legs["exit"][i];
      if (!leg.scannerExpr.length || !checkEquation(leg.scannerExpr)) {
        setErrorDialog(`Please create a valid expression in exit leg ${i + 1}`);
        return false;
      }
    }
    return true;
  }

  async function handleSubmit() {
    if (advancedState.strategyName.trim() === "") {
      Alert.alert("Error", "Please enter a strategy name");
      return;
    }

    if (!checkIsBacktesterValid()) return;

    setIsBacktesting(true);
    setErrorDialog("");

    const state = deepCopy(advancedState);
    state.market = subUrl;
    state.windowId = windowId.current.toString();

    try {
      await axios.post(`${Config.BACKEND_URL}/api/stocks/advbacktest`, state);
    } catch (error) {
      setIsBacktesting(false);
      Alert.alert("Error", "Failed to submit backtest. Please try again.");
      console.error(error);
    }
  }

  useEffect(() => {
    dispatch(clearValues());
    if (params?.state) {
      try {
        const parsed = typeof params.state === "string" ? JSON.parse(params.state) : params.state;
        dispatch(setBacktester(parsed));
      } catch {
        dispatch(handleAddLeg({ index: 0 }));
      }
    } else {
      dispatch(handleAddLeg({ index: 0 }));
    }
  }, [params?.state]);

  useEffect(() => {
    if (auth?.user) {
      const user = auth.user;
      dispatchChange("user", {
        backtests: parseInt(user.backtests),
        _id: user._id,
        tier: user.tier,
      });
    }
  }, [auth]);

  useEffect(() => {
    if (auth.user?._id && backendSocket) {
      const handleAdvancedResults = (data: any) => {
        if (
          data?.userId === auth.user._id &&
          data.windowId == windowId.current
        ) {
          setIsBacktesting(false);
          if (data.message && data.message !== "") {
            setResultsMessage(data.message);
          } else {
            Alert.alert("Success", "Results have been sent to your email!");
          }
        }
      };
      backendSocket.on("advbacktest-results", handleAdvancedResults);
      return () => {
        backendSocket.off("advbacktest-results", handleAdvancedResults);
      };
    }
  }, [auth.user?._id]);

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      {/* ✅ Single clean header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>Advanced Backtester</Text>
        <View style={dynamicStyles.breadcrumb}>
          <Text style={dynamicStyles.breadcrumbText}>Pages</Text>
          <ChevronRight size={13} color="#9ca3af" />
          <Text style={dynamicStyles.breadcrumbText}>Advanced Backtester</Text>
        </View>
      </View>

      <ScrollView
        style={dynamicStyles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={dynamicStyles.contentContainer}
      >
        {/* Strategy Name + Re-entries */}
        <View style={dynamicStyles.formRow}>
          <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>Strategy Name</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Enter here"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={advancedState.strategyName}
              onChangeText={(text) => dispatchChange("strategyName", text)}
            />
          </View>

          <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>Re-entries</Text>
            <View style={dynamicStyles.pickerContainer}>
              <Picker
                selectedValue={advancedState.entries}
                onValueChange={(val) => dispatchChange("entries", val)}
                style={dynamicStyles.picker}
                dropdownIconColor={isDark ? "#FFFFFF" : "#111827"}
              >
                {reEntriesGlobal.map((i) => (
                  <Picker.Item
                    key={i}
                    label={(i + 1).toString()}
                    value={i + 1}
                    color={isDark ? "#FFFFFF" : "#111827"}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Entry Section */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Text style={dynamicStyles.sectionTitle}>Entry</Text>
            <View style={dynamicStyles.buttonGroup}>
              <TouchableOpacity
                style={[dynamicStyles.button, dynamicStyles.buttonDanger]}
                onPress={removeLeg}
              >
                <Trash2 size={16} color="#FFFFFF" />
                <Text style={dynamicStyles.buttonText}>Delete leg</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.button, dynamicStyles.buttonPrimary]}
                onPress={addLeg}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={dynamicStyles.buttonText}>Add Leg</Text>
              </TouchableOpacity>
            </View>
          </View>

          <LegTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            indicators={indicators}
            entryexit="entry"
          />
        </View>

        {/* Exit Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Exit</Text>
          <LegTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            indicators={indicators}
            entryexit="exit"
          />
        </View>

        {/* MTM */}
        <AdvancedMTM handleChange={handleAllChanges} />

        {/* Submit */}
        <TouchableOpacity
          style={[
            dynamicStyles.submitButton,
            isBacktesting && dynamicStyles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isBacktesting}
        >
          {isBacktesting ? (
            <View style={dynamicStyles.submitRow}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={dynamicStyles.submitButtonText}> Processing...</Text>
            </View>
          ) : (
            <Text style={dynamicStyles.submitButtonText}>Save Strategy</Text>
          )}
        </TouchableOpacity>

        {/* Alerts */}
        {isBacktesting && (
          <View style={dynamicStyles.alertSuccess}>
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={dynamicStyles.alertSuccessText}>
              Your results will be generated soon. Please wait...
            </Text>
          </View>
        )}

        {!!resultsMessage && (
          <View style={dynamicStyles.alertDanger}>
            <Text style={dynamicStyles.alertDangerText}>{resultsMessage}</Text>
          </View>
        )}

        {errorDialog.trim() !== "" && (
          <View style={dynamicStyles.alertDanger}>
            <Text style={dynamicStyles.alertDangerText}>{errorDialog}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? "#111827" : "#F9FAFB",
    },

    /* ── Header ── */
    header: {
      backgroundColor: "#ffffff",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#111827",
    },
    breadcrumb: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 3,
      gap: 4,
    },
    breadcrumbText: { fontSize: 12, color: "#9ca3af" },

    /* ── Scroll ── */
    scrollView: { flex: 1 },
    contentContainer: {
      padding: 12,
      paddingBottom: 40,
      // ✅ NO paddingTop: 85
    },

    /* ── Form ── */
    formRow: { flexDirection: "column", gap: 16, marginBottom: 24 },
    formGroup: { flex: 1 },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#D1D5DB" : "#374151",
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#E5E7EB",
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: isDark ? "#FFFFFF" : "#111827",
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#E5E7EB",
      borderRadius: 8,
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
      overflow: "hidden",
    },
    picker: { color: isDark ? "#FFFFFF" : "#111827", height: 50 },

    /* ── Sections ── */
    section: { marginBottom: 24 },
    sectionHeader: {
      flexDirection: "column",
      gap: 12,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#111827",
    },
    buttonGroup: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    button: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 8,
    },
    buttonPrimary: { backgroundColor: "#3B82F6" },
    buttonDanger: { backgroundColor: "#EF4444" },
    buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },

    /* ── Submit ── */
    submitButton: {
      backgroundColor: "#3B82F6",
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 16,
      alignSelf: "flex-start",
      minWidth: 160,
    },
    submitButtonDisabled: { backgroundColor: "#9CA3AF" },
    submitButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
    submitRow: { flexDirection: "row", alignItems: "center" },

    /* ── Alerts ── */
    alertSuccess: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#064E3B" : "#D1FAE5",
      borderRadius: 12,
      padding: 16,
      gap: 12,
      marginBottom: 16,
    },
    alertSuccessText: {
      flex: 1,
      fontSize: 15,
      color: isDark ? "#FFFFFF" : "#065F46",
    },
    alertDanger: {
      backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    alertDangerText: {
      fontSize: 15,
      color: isDark ? "#FFFFFF" : "#991B1B",
    },
  });

export default AdvancedBacktester;