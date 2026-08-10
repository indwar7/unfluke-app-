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
import { LinearGradient } from "expo-linear-gradient";
import { useSelector, useDispatch } from "react-redux";
import { Config } from "../../helpers/config";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import {
  ChevronRight,
  Trash2,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader,
  AlertTriangle,
} from "lucide-react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { Radius, Space, Shadow } from "@/constants/Theme";
import { ProBadge } from "@/components/ui/Premium";

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
import { useBottomGutter } from "../../utils/bottomGutter";
import {
  classifyToken,
  isExpressionSyntaxValid,
  type ExprToken,
} from "../../helpers/expressionSyntax";

// No brackets: this screen's expression builder never emitted a "(" branch.
const EXPR_TOKEN_SETS = {
  mathOperators,
  conditionalOperators,
  advOperators,
  binaryOperators,
  brackets: [] as string[],
};

const AdvancedBacktester = () => {
  const { colors: c, isDark } = useTheme();
  const bottomGutter = useBottomGutter();
  const dynamicStyles = makeStyles(c, isDark, bottomGutter);

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
    dispatch(handleAddLeg({ index: advancedState.totalLegs, market: subUrl }));
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
    const tokens: ExprToken[] = [];

    for (const subEquation of equation) {
      if (!lhsRhsValid(subEquation)) return false;
      for (const item of subEquation) {
        tokens.push(classifyToken(item.indicatorName, EXPR_TOKEN_SETS));
      }
    }

    return isExpressionSyntaxValid(tokens);
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
      const res = await axios.post(`${Config.BACKEND_URL}/api/stocks/advbacktest`, state);
      // Website parity: a 200 response can still carry `success:false` (e.g.
      // paywall/plan limit) — reading only network/HTTP errors left this
      // stuck on "Your results will be generated soon..." forever with no
      // explanation, since the request itself never failed.
      if (res?.data?.success === false) {
        setIsBacktesting(false);
        setErrorDialog(res.data.message || "Backtest could not be started.");
      }
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
        dispatch(handleAddLeg({ index: 0, market: globalState?.appType }));
      }
    } else {
      // Read straight from the Redux selector, not the locally-mirrored
      // `subUrl` state (set one tick later in the effect above) — this
      // effect runs on mount and must not seed the first leg with the
      // wrong market's instrument/hours if crypto is already selected.
      dispatch(handleAddLeg({ index: 0, market: globalState?.appType }));
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
        <View style={dynamicStyles.headerTopRow}>
          <Text style={dynamicStyles.headerTitle}>Advanced Backtester</Text>
          <ProBadge />
        </View>
        <View style={dynamicStyles.breadcrumb}>
          <Text style={dynamicStyles.breadcrumbText}>Pages</Text>
          <ChevronRight size={13} color={c.textMuted} />
          <Text style={dynamicStyles.breadcrumbActive}>Advanced Backtester</Text>
        </View>
      </View>

      <ScrollView
        style={dynamicStyles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={dynamicStyles.contentContainer}
      >
        {/* Strategy Name + Re-entries */}
        <View style={dynamicStyles.formCard}>
          <View style={dynamicStyles.formRow}>
            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>Strategy Name</Text>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Enter here"
                placeholderTextColor={c.textMuted}
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
                  dropdownIconColor={c.gold}
                >
                  {reEntriesGlobal.map((i) => (
                    <Picker.Item
                      key={i}
                      label={(i + 1).toString()}
                      value={i + 1}
                      color={isDark ? c.text : undefined}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Entry Section */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <View style={dynamicStyles.sectionTitleRow}>
              <View style={[dynamicStyles.sectionIcon, dynamicStyles.sectionIconEntry]}>
                <ArrowDownToLine size={15} color={c.profit} />
              </View>
              <Text style={dynamicStyles.sectionTitle}>Entry</Text>
            </View>
            <View style={dynamicStyles.buttonGroup}>
              <TouchableOpacity
                style={[dynamicStyles.button, dynamicStyles.buttonDanger]}
                onPress={removeLeg}
                activeOpacity={0.8}
              >
                <Trash2 size={16} color={c.loss} />
                <Text style={dynamicStyles.buttonDangerText}>Delete leg</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addLeg} activeOpacity={0.85}>
                <LinearGradient
                  colors={[c.goldBright, c.gold, c.goldDeep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[dynamicStyles.button, dynamicStyles.buttonPrimary]}
                >
                  <Plus size={16} color={c.onGold} />
                  <Text style={dynamicStyles.buttonText}>Add Leg</Text>
                </LinearGradient>
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
          <View style={dynamicStyles.sectionTitleRow}>
            <View style={[dynamicStyles.sectionIcon, dynamicStyles.sectionIconExit]}>
              <ArrowUpFromLine size={15} color={c.loss} />
            </View>
            <Text style={dynamicStyles.sectionTitle}>Exit</Text>
          </View>
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
          style={dynamicStyles.submitWrap}
          onPress={handleSubmit}
          disabled={isBacktesting}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[c.goldBright, c.gold, c.goldDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              dynamicStyles.submitButton,
              isBacktesting && dynamicStyles.submitButtonDisabled,
            ]}
          >
            {isBacktesting ? (
              <View style={dynamicStyles.submitRow}>
                <ActivityIndicator size="small" color={c.onGold} />
                <Text style={dynamicStyles.submitButtonText}> Processing...</Text>
              </View>
            ) : (
              <Text style={dynamicStyles.submitButtonText}>Save Strategy</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Alerts */}
        {isBacktesting && (
          <View style={dynamicStyles.alertSuccess}>
            <Loader size={18} color={c.gold} />
            <Text style={dynamicStyles.alertSuccessText}>
              Your results will be generated soon. Please wait...
            </Text>
          </View>
        )}

        {!!resultsMessage && (
          <View style={dynamicStyles.alertDanger}>
            <AlertTriangle size={18} color={c.loss} />
            <Text style={dynamicStyles.alertDangerText}>{resultsMessage}</Text>
          </View>
        )}

        {errorDialog.trim() !== "" && (
          <View style={dynamicStyles.alertDanger}>
            <AlertTriangle size={18} color={c.loss} />
            <Text style={dynamicStyles.alertDangerText}>{errorDialog}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (c: AppColors, isDark: boolean, bottomGutter = 0) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },

    /* ── Header ── */
    header: {
      backgroundColor: c.headerBg,
      paddingHorizontal: Space.lg,
      paddingVertical: Space.lg,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      ...Shadow.sm,
    },
    headerTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: -0.3,
      color: c.text,
    },
    breadcrumb: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      gap: 4,
    },
    breadcrumbText: { fontSize: 12, fontWeight: "500", color: c.textMuted },
    breadcrumbActive: { fontSize: 12, fontWeight: "700", color: c.gold },

    /* ── Scroll ── */
    scrollView: { flex: 1 },
    contentContainer: {
      padding: Space.lg,
      paddingBottom: 40 + bottomGutter,
      // ✅ NO paddingTop: 85
    },

    /* ── Form ── */
    formCard: {
      backgroundColor: c.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: Space.lg,
      marginBottom: Space.xxl,
      ...Shadow.sm,
    },
    formRow: { flexDirection: "column", gap: Space.lg },
    formGroup: { flex: 1 },
    label: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: c.textMuted,
      marginBottom: Space.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: Radius.md,
      paddingVertical: 13,
      paddingHorizontal: 14,
      fontSize: 15,
      color: c.text,
      backgroundColor: c.inputBg,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: Radius.md,
      backgroundColor: c.inputBg,
      overflow: "hidden",
    },
    picker: { color: c.text, height: 50 },

    /* ── Sections ── */
    section: { marginBottom: Space.xxl },
    sectionHeader: {
      flexDirection: "column",
      gap: Space.md,
      marginBottom: Space.lg,
    },
    sectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Space.sm,
      marginBottom: Space.md,
    },
    sectionIcon: {
      width: 28,
      height: 28,
      borderRadius: Radius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionIconEntry: { backgroundColor: c.profitBg },
    sectionIconExit: { backgroundColor: c.lossBg },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: -0.2,
      color: c.text,
    },
    buttonGroup: { flexDirection: "row", gap: Space.sm, flexWrap: "wrap" },
    button: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: Radius.md,
      gap: 8,
    },
    buttonPrimary: {
      ...Shadow.gold,
    },
    buttonDanger: {
      backgroundColor: c.lossBg,
      borderWidth: 1,
      borderColor: c.loss,
    },
    buttonText: { color: c.onGold, fontSize: 14, fontWeight: "700" },
    buttonDangerText: { color: c.loss, fontSize: 14, fontWeight: "700" },

    /* ── Submit ── */
    submitWrap: {
      alignSelf: "flex-start",
      marginBottom: Space.lg,
      ...Shadow.gold,
    },
    submitButton: {
      paddingVertical: 15,
      paddingHorizontal: 28,
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 170,
    },
    submitButtonDisabled: { opacity: 0.6 },
    submitButtonText: {
      color: c.onGold,
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    submitRow: { flexDirection: "row", alignItems: "center" },

    /* ── Alerts ── */
    alertSuccess: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.goldLight,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: c.gold,
      padding: Space.lg,
      gap: Space.md,
      marginBottom: Space.lg,
    },
    alertSuccessText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? c.gold : c.goldDeep,
    },
    alertDanger: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.lossBg,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: c.loss,
      padding: Space.lg,
      gap: Space.md,
      marginBottom: Space.lg,
    },
    alertDangerText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: c.loss,
    },
  });

export default AdvancedBacktester;