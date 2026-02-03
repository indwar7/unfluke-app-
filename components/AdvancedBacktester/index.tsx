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
  useColorScheme,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useSelector, useDispatch } from "react-redux";
import { Config } from "../../helpers/config";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dynamicStyles = styles(isDark);

  const advancedState = useSelector((store) => store.AdvancedBacktester);
  const auth = useSelector((store) => store.Login);
  const globalState = useSelector((store) => store.Layout);

  const dispatch = useDispatch();
  const route = useRoute();
  const navigation = useNavigation();

  const [indicators, setIndicators] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [errorDialog, setErrorDialog] = useState("");
  const [resultsMessage, setResultsMessage] = useState("");
  const [subUrl, setSubUrl] = useState("");

  const windowId = useRef(new Date().getMilliseconds());

  // Set subUrl from global state
  useEffect(() => {
    if (globalState && globalState.appType) {
      setSubUrl(globalState.appType);
    }
  }, [globalState]);

  // Fetch indicators
  useEffect(() => {
    axios
      .get(
        `${Config.BACKEND_URL}/api/scanner/overlap-studies`
      )
      .then((res) => {
        setIndicators(res);
      })
      .catch((err) => console.log(err));
  }, []);

  // Handle all input changes
  function handleAllChanges(e) {
    const name = e.target.name;
    let value = e.target.value;

    switch (name) {
      case "mtm.target":
        dispatch(
          handleMTMChange({
            name: "target",
            value: parseFloat(value),
          })
        );
        return;
      case "mtm.stoploss":
        dispatch(
          handleMTMChange({
            name: "stoploss",
            value: parseFloat(value),
          })
        );
        return;
      case "mtm.trailX":
        dispatch(
          handleMTMChange({
            name: "trailX",
            value: parseFloat(value),
          })
        );
        return;
      case "mtm.trailY":
        dispatch(
          handleMTMChange({
            name: "trailY",
            value: parseFloat(value),
          })
        );
        return;
      case "entries":
        value = parseInt(value);
        break;
    }

    dispatch(handleChange({ name, value }));
  }

  // Add leg
  function addLeg() {
    dispatch(
      handleAddLeg({
        index: advancedState.totalLegs,
      })
    );
  }

  // Remove leg
  function removeLeg() {
    Alert.alert(
      "Delete Leg",
      "Are you sure you want to delete the current leg?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            dispatch(
              handleRemoveLeg({
                index: activeTab,
              })
            );

            const nextActiveTab = parseInt(activeTab) - 1;
            if (nextActiveTab >= 1) {
              setActiveTab(nextActiveTab.toString());
            }
          },
        },
      ]
    );
  }

  // Validation functions
  const lhsRhsValid = (subEquation) => {
    const LHS = [];
    const RHS = [];
    let op = "";

    for (let item of subEquation) {
      const indicName = item.indicatorName;

      if (binaryOperators.indexOf(indicName) !== -1) return true;

      if (conditionalOperators.indexOf(indicName) !== -1) {
        if (op === "") {
          op = indicName;
        } else {
          return false;
        }
      } else {
        if (op !== "") {
          LHS.push(indicName);
        } else {
          RHS.push(indicName);
        }
      }
    }

    return LHS.length > 0 && RHS.length > 0;
  };

  const checkEquation = (equation) => {
    let pseudoEquation = "";
    let totalLength = 0;

    for (let subEquation of equation) {
      if (!lhsRhsValid(subEquation)) return false;

      for (let item of subEquation) {
        const indicName = item.indicatorName;

        if (
          mathOperators.indexOf(indicName) !== -1 ||
          conditionalOperators.indexOf(indicName) !== -1
        ) {
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

    pseudoEquation = pseudoEquation.trim();

    if (totalLength <= 1) return false;

    try {
      let evalVal = eval(pseudoEquation) + "";
      if (evalVal !== "") {
        return true;
      }
    } catch (err) {
      return false;
    }

    return false;
  };

  // Validate backtester
  function checkIsBacktesterValid() {
    let invalidBacktesterDialog = "";

    for (let i = 0; i < advancedState.totalLegs; i++) {
      const backtesterLegs = advancedState.legs;
      const leg = backtesterLegs["entry"][i];

      if (leg.scannerExpr.length <= 0 || !checkEquation(leg.scannerExpr)) {
        invalidBacktesterDialog =
          "Please create a valid expression in entry leg " + (i + 1);
        setErrorDialog(invalidBacktesterDialog);
        return false;
      }
    }

    for (let i = 0; i < advancedState.totalLegs; i++) {
      const backtesterLegs = advancedState.legs;
      const leg = backtesterLegs["exit"][i];

      if (leg.scannerExpr.length <= 0 || !checkEquation(leg.scannerExpr)) {
        invalidBacktesterDialog =
          "Please create a valid expression in exit leg " + (i + 1);
        setErrorDialog(invalidBacktesterDialog);
        return false;
      }
    }

    return true;
  }

  // Submit handler
  async function handleSubmit() {
    if (advancedState.strategyName.trim() === "") {
      Alert.alert("Error", "Please enter a strategy name");
      return;
    }

    let validBacktester = checkIsBacktesterValid();

    if (validBacktester) {
      setIsBacktesting(true);
      setErrorDialog("");

      const state = deepCopy(advancedState);
      state.market = subUrl;
      state.windowId = windowId.current.toString();

      try {
        const response = await axios.post(
          `${Config.BACKEND_URL}/api/stocks/advbacktest`,
          state
        );

        // if (response) {
        //   console.log("Response", response);
        // }
      } catch (error) {
        setIsBacktesting(false);
        Alert.alert("Error", "Failed to submit backtest");
        console.error(error);
      }
    }
  }

  // Initialize from route params
  useEffect(() => {
    dispatch(clearValues());

    if (route.params?.state) {
      dispatch(setBacktester(route.params.state));
    } else {
      dispatch(
        handleAddLeg({
          index: 0,
        })
      );
    }
  }, [route.params]);

  // Set user info
  useEffect(() => {
    if (auth?.user) {
      const user = auth.user;

      handleAllChanges({
        target: {
          name: "user",
          value: {
            backtests: parseInt(user.backtests),
            _id: user._id,
            tier: user.tier,
          },
        },
      });
    }
  }, [auth]);

  // Socket listener for results
  useEffect(() => {
    if (auth.user?._id && backendSocket) {
      const handleAdvancedResults = (data) => {
        if (data) {
          if (
            data.userId === auth.user._id &&
            data.windowId == windowId.current
          ) {
            setIsBacktesting(false);
            if (data.message && data.message !== "") {
              setResultsMessage(data.message);
            } else {
              Alert.alert("Success", "Results have been sent to your email!");
            }
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
    <ScrollView
      style={dynamicStyles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={dynamicStyles.contentContainer}
    >
      {/* Header */}
      <View style={dynamicStyles.headerContent}>
        <Text style={dynamicStyles.headerTitle}>Advanced Backtester</Text>
        <View style={dynamicStyles.breadcrumb}>
          <Text style={dynamicStyles.breadcrumbText}>Pages</Text>
          <ChevronRight size={13} color="#6B7280" />
          <Text style={dynamicStyles.breadcrumbText}>Advanced Backtester</Text>
        </View>
      </View>

      {/* Strategy Name and Re-entries */}
      <View style={dynamicStyles.formRow}>
        {/* Strategy Name */}
        <View style={dynamicStyles.formGroup}>
          <Text style={dynamicStyles.label}>Strategy Name</Text>
          <TextInput
            style={dynamicStyles.input}
            placeholder="Enter here"
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            value={advancedState.strategyName}
            onChangeText={(text) =>
              handleAllChanges({
                target: { name: "strategyName", value: text },
              })
            }
          />
        </View>

        {/* Re-entries */}
        <View style={dynamicStyles.formGroup}>
          <Text style={dynamicStyles.label}>Re-entries</Text>
          <View style={dynamicStyles.pickerContainer}>
            <Picker
              selectedValue={advancedState.entries}
              onValueChange={(itemValue) =>
                handleAllChanges({
                  target: { name: "entries", value: itemValue },
                })
              }
              style={dynamicStyles.picker}
              dropdownIconColor={isDark ? "#FFFFFF" : "#111827"}
            >
              {reEntriesGlobal.map((i) => (
                <Picker.Item
                  key={i + 1}
                  label={(i + 1).toString()}
                  value={i + 1}
                  color={isDark ? "#FFFFFF" : "#111827"}
                  style={{fontSize:14,borderWidth:1, borderColor:"red"}}
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
              <Text style={dynamicStyles.buttonText}>Delete current leg</Text>
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

      {/* MTM Section */}
      <AdvancedMTM handleChange={handleAllChanges} />

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          dynamicStyles.submitButton,
          isBacktesting && dynamicStyles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isBacktesting}
      >
        <Text style={dynamicStyles.submitButtonText}>
          {isBacktesting ? "Processing..." : "Save Strategy"}
        </Text>
      </TouchableOpacity>

      {/* Loading State */}
      {isBacktesting && (
        <View style={dynamicStyles.alertSuccess}>
          <ActivityIndicator size="small" color="#10B981" />
          <Text style={dynamicStyles.alertSuccessText}>
            Your results will be generated soon and you will be notified, please
            wait...
          </Text>
        </View>
      )}

      {/* Results Message */}
      {resultsMessage && (
        <View style={dynamicStyles.alertDanger}>
          <Text style={dynamicStyles.alertDangerText}>{resultsMessage}</Text>
        </View>
      )}

      {/* Error Dialog */}
      {errorDialog.trim() !== "" && (
        <View style={dynamicStyles.alertDanger}>
          <Text style={dynamicStyles.alertDangerText}>{errorDialog}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#111827" : "#F9FAFB",
    },
    contentContainer: {
      padding: 12,
      paddingTop: 85,
    },
    // Header
    header: {
      marginBottom: 24,
    },
    headerContent: {
      paddingBottom: 16,
    },
    headerTitle: {
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

    // Form
    formRow: {
      flexDirection: "column",
      gap: 16,
      marginBottom: 24,
    },
    formGroup: {
      flex: 1,
    },
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
    picker: {
      color: isDark ? "#FFFFFF" : "#111827",
      height: 50,
    },

    // Section
    section: {
      // marginBottom: 16,
    },
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
    buttonGroup: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
    },

    // Buttons
    button: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 8,
    },
    buttonPrimary: {
      backgroundColor: "#3B82F6",
    },
    buttonDanger: {
      backgroundColor: "#EF4444",
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
    },

    // Submit Button
    submitButton: {
      backgroundColor: "#3B82F6",
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 24,
      maxWidth: 256,
    },
    submitButtonDisabled: {
      backgroundColor: "#9CA3AF",
    },
    submitButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },

    // Alerts
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
