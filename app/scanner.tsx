import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import * as Clipboard from "expo-clipboard";
import { Config } from "../helpers/config";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenWithHeader } from "../components/AppHeader";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { Search, Save, Share2, ScanLine, AlertTriangle } from "lucide-react-native";

// Import converted components
import IndicatorList from "../components/UnflukeMain/Scanner/IndicatorList";
import ScannerExpression from "../components/UnflukeMain/Scanner/ScannerExpression";
import ScannerFilters from "../components/UnflukeMain/Scanner/ScannerFilters";
import ScannerMisc from "../components/UnflukeMain/Scanner/ScannerMisc";
import ScannerResults from "../components/UnflukeMain/Scanner/ScannerResults";

// Import modals
import IndicatorModal from "../components/UnflukeMain/Scanner/ScannerExpression/Modals/IndicatorModal";
import LTPModal from "../components/UnflukeMain/Scanner/ScannerExpression/Modals/LTPModal";
import NumberOpModal from "../components/UnflukeMain/Scanner/ScannerExpression/Modals/NumberOpModal";
import OffsetModal from "../components/UnflukeMain/Scanner/ScannerMisc/Modals/OffsetModal";

import {
  advOperators,
  binaryOperators,
  brackets,
  conditionalOperators,
  elemsWithNoDialog,
  mathOperators,
} from "../components/UnflukeMain/Utils/common_vars";

import {
  handleChange,
  handleSetState,
  resetState,
} from "../redux/slices/scanner/reducer";

import { deepCopy } from "../components/UnflukeMain/BasicBacktester/StrategyLegs/utils";
import { backendSocket } from "../socket/socket";

const Scanner = ({ shared }) => {

  const { colors: c, isDark } = useTheme();
  const dynamicStyles = makeStyles(c, isDark);

  const [type, setType] = useState();

  const auth = useSelector((store) => store.Login);
  const scannerState = useSelector((store) => store.Scanner);
  const globalState = useSelector((store) => store.Layout);

  const dispatch = useDispatch();
  const route = useRoute();
  const navigation = useNavigation();

  const [expression, setExpression] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [indicators, setIndicators] = useState([]);
  const [scannerIndicators, setScannerIndicators] = useState([]);

  // Modal states
  const [indicatorModalOpen, setIndicatorModalOpen] = useState(false);
  const [numberModalOpen, setNumberModalOpen] = useState(false);
  const [ltpModalOpen, setLTPModalOpen] = useState(false);
  const [offsetModalOpen, setOffsetModalOpen] = useState(false);

  // Results states
  const [statusMessage, setStatusMessage] = useState("Loading results...");
  const [resultsMessage, setResultsMessage] = useState("");
  const [scannerResults, setScannerResults] = useState([]);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [headers, setHeaders] = useState([]);

  const [lastElem, setLastElem] = useState({});
  const [lastElemFlatIndex, setLastElemFlatIndex] = useState(0);

  const windowId = useRef(new Date().getMilliseconds());
  const [subUrl, setSubUrl] = useState("");

  useEffect(() => {
    setType(route?.params?.type);
  }, []);

  useEffect(() => {
    if (globalState && globalState.appType) {
      setSubUrl(globalState.appType);
    }
  }, [globalState]);

  /***** HELPER FUNCTIONS *****/

  // Flatten 2D expression to 1D for cursor tracking
  const flattenExpression = (expr) => {
    const flattened = [];
    expr.forEach((subexpr, x) => {
      subexpr.forEach((item, y) => {
        flattened.push({
          ...item,
          _coords: { x, y },
          _flatIndex: flattened.length,
        });
      });
    });
    return flattened;
  };
  console.log("state this is", route?.params?.state)
  // Convert flat index to x,y coordinates
  const flatIndexToCoords = (flatIndex) => {
    let count = 0;
    for (let x = 0; x < expression.length; x++) {
      for (let y = 0; y < expression[x].length; y++) {
        if (count === flatIndex) {
          return { x, y };
        }
        count++;
      }
    }
    // If cursor is at end
    if (expression.length === 0) {
      return { x: 0, y: 0 };
    }
    return {
      x: expression.length - 1,
      y: expression[expression.length - 1].length,
    };
  };

  /***** VALIDATION FUNCTIONS *****/
  const lhsRhsValid = (subEquation) => {
    const LHS = [];
    const RHS = [];
    let op = "";

    for (let item of subEquation) {
      const indicName = item.indicatorName;

      if (binaryOperators.indexOf(indicName) !== -1) return true;

      if (
        conditionalOperators.indexOf(indicName) !== -1 ||
        advOperators.indexOf(indicName) !== -1
      ) {
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
          conditionalOperators.indexOf(indicName) !== -1 ||
          brackets.indexOf(indicName) !== -1
        ) {
          pseudoEquation += indicName === "(" ? " * ( " : ` ${indicName} `;
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
      return evalVal !== "";
    } catch (err) {
      return false;
    }
  };

  /***** EXPRESSION MANIPULATION *****/

  // Add element at cursor position
  const addElemAtCursor = (parsedData) => {
    const tmpExpr = JSON.parse(JSON.stringify(expression));
    const indicatorName = parsedData.indicatorName;

    setLastElem(parsedData);
    setLastElemFlatIndex(cursorPosition);

    // Handle modals
    if (indicatorName === "number") {
      setNumberModalOpen(true);
      return;
    } else if (indicatorName === "ltp") {
      setLTPModalOpen(true);
      return;
    } else if (indicatorName === "offset") {
      setOffsetModalOpen(true);
      return;
    } else if (
      binaryOperators.indexOf(indicatorName) === -1 &&
      mathOperators.indexOf(indicatorName) === -1 &&
      conditionalOperators.indexOf(indicatorName) === -1 &&
      advOperators.indexOf(indicatorName) === -1 &&
      brackets.indexOf(indicatorName) === -1 &&
      elemsWithNoDialog.indexOf(indicatorName) === -1
    ) {
      setIndicatorModalOpen(true);
      return;
    }

    // If expression is empty
    if (tmpExpr.length <= 0) {
      tmpExpr.push([parsedData]);
      setExpression(tmpExpr);
      setCursorPosition(1); // Move cursor after inserted item
      return;
    }

    // Get x,y coordinates from cursor position
    const { x, y } = flatIndexToCoords(cursorPosition);

    // Check if we need to create new sub-expression for binary operators
    if (binaryOperators.indexOf(indicatorName) !== -1) {
      // Binary operator creates new line
      tmpExpr.splice(x + 1, 0, [parsedData]);
      setCursorPosition(cursorPosition + 1);
    } else if (
      tmpExpr[x] &&
      binaryOperators.indexOf(tmpExpr[x][0]?.indicatorName) !== -1
    ) {
      // If current line is a binary operator, create new line
      tmpExpr.splice(x + 1, 0, [parsedData]);
      setCursorPosition(cursorPosition + 1);
    } else {
      // Insert into current sub-expression
      if (!tmpExpr[x]) tmpExpr[x] = [];
      tmpExpr[x].splice(y, 0, parsedData);
      setCursorPosition(cursorPosition + 1);
    }

    setExpression(tmpExpr);
  };

  // Remove element at flat index
  const removeElemAt = (x, y) => {
    const tmpExpr = JSON.parse(JSON.stringify(expression));
    tmpExpr[x].splice(y, 1);

    if (tmpExpr[x].length <= 0) {
      tmpExpr.splice(x, 1);
    }

    setExpression(tmpExpr);

    // Adjust cursor if needed
    const flatExpr = flattenExpression(tmpExpr);
    if (cursorPosition > flatExpr.length) {
      setCursorPosition(flatExpr.length);
    }
  };

  // Edit element at flat index
  const editElemAt = (x, y) => {
    const tmpExpr = JSON.parse(JSON.stringify(expression));
    const elem = tmpExpr[x][y];
    const indicatorName = elem.indicatorName;

    const flatExpr = flattenExpression(tmpExpr);
    const flatIndex = flatExpr.findIndex(
      (item) => item._coords.x === x && item._coords.y === y
    );

    setLastElem(elem);
    setLastElemFlatIndex(flatIndex);

    if (indicatorName === "number") {
      setNumberModalOpen(true);
    } else if (indicatorName === "ltp") {
      setLTPModalOpen(true);
    } else if (indicatorName === "offset") {
      setOffsetModalOpen(true);
    } else if (
      binaryOperators.indexOf(indicatorName) === -1 &&
      mathOperators.indexOf(indicatorName) === -1 &&
      conditionalOperators.indexOf(indicatorName) === -1 &&
      advOperators.indexOf(indicatorName) === -1 &&
      brackets.indexOf(indicatorName) === -1
    ) {
      setIndicatorModalOpen(true);
    }
  };

  // Close modal and update expression
  const closeModal = (output) => {
    setNumberModalOpen(false);
    setIndicatorModalOpen(false);
    setLTPModalOpen(false);
    setOffsetModalOpen(false);

    if (output) {
      const tmpExpr = JSON.parse(JSON.stringify(expression));
      const coords = flatIndexToCoords(lastElemFlatIndex);

      // Check if we're adding new or editing existing
      if (tmpExpr[coords.x] && tmpExpr[coords.x][coords.y]) {
        // Edit existing
        tmpExpr[coords.x][coords.y] = output;
      } else {
        // Add new at cursor
        const { x, y } = flatIndexToCoords(cursorPosition);
        if (!tmpExpr[x]) tmpExpr[x] = [];
        tmpExpr[x].splice(y, 0, output);
        setCursorPosition(cursorPosition + 1);
      }

      setExpression(tmpExpr);
    }
  };

  /***** HANDLERS *****/

  const handleIndicatorTap = (indicatorData) => {
    addElemAtCursor(indicatorData);
  };

  const handleMiscTap = (itemData) => {
    addElemAtCursor(itemData);
  };

  const handleSaving = async () => {
    const scannerType =
      type === "scanner"
        ? "technical"
        : type === "fundamental"
          ? "fundamental"
          : "alert";

    if (checkEquation(expression)) {
      if (scannerState.name.trim() === "") {
        Toast.show({
          type: "error",
          text1: "Please enter the name of the scanner",
          position: "top",
          visibilityTime: 3000,
        });
        return;
      }

      // Show loading state
      setSaving(true);

      try {
        let date = new Date();
        let todaysDate = `${date.getDate()}/${date.getMonth() + 1
          }/${date.getFullYear()}`;
        let timeAdded = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

        if (route?.params?.state && scannerState._id) {
          const scannerId = scannerState._id;

          if (auth?.user?._id !== scannerState.owner) {
            setSaving(false);
            Alert.alert(
              "Confirmation",
              "This scanner will be saved as your own.",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "OK",
                  onPress: async () => {
                    setSaving(true);
                    try {
                      handleAllChanges({
                        target: { name: "categories", value: [] },
                      });

                      const tmp = deepCopy(scannerState);
                      delete tmp._id;
                      tmp.owner = auth.user._id;
                      tmp.date = todaysDate;
                      tmp.time = timeAdded;
                      tmp.scannerType = scannerType;

                      // The axios response interceptor in Unfluke_helpers/api_helper.js
                      // unwraps `.data` before we see it, so `res` may be the raw payload
                      // (string/object) or the AxiosResponse depending on what the server
                      // returned. If the call didn't throw, the server accepted the save.
                      const res: any = await axios.post(
                        `${Config.BACKEND_URL}/api/scanner/setScanner`,
                        { tmp }
                      );

                      setSaving(false);

                      const okMsg =
                        res?.msg ||
                        res?.data?.msg ||
                        (typeof res === "string" ? res : null) ||
                        "Scanner saved";

                      Toast.show({
                        type: "success",
                        text1: "Success",
                        text2: okMsg,
                        position: "top",
                        visibilityTime: 4000,
                      });

                      setTimeout(() => {
                        scannerType === "alert"
                          ? navigation.navigate("scannerhome", { alertsScanner: "true" })
                          : navigation.navigate("scannerhome");
                      }, 500);
                    } catch (error: any) {
                      setSaving(false);
                      console.error("Save error:", error);
                      Alert.alert(
                        "Error",
                        error?.response?.data?.msg ||
                          error?.message ||
                          "Failed to save scanner"
                      );
                    }
                  },
                },
              ]
            );
          } else {
            const res: any = await axios.post(
              `${Config.BACKEND_URL}/api/scanner/updateScanner`,
              { scannerId, tmp: scannerState }
            );

            setSaving(false);

            const okMsg =
              res?.msg ||
              res?.data?.msg ||
              (typeof res === "string" ? res : null) ||
              "Scanner updated";

            Toast.show({
              type: "success",
              text1: "Success",
              text2: okMsg,
              position: "top",
              visibilityTime: 4000,
            });

            setTimeout(() => {
              scannerType === "alert"
                ? navigation.navigate("scannerhome", { alertsScanner: "true" })
                : navigation.navigate("scannerhome");
            }, 500);
          }
        } else {
          const tmp = deepCopy(scannerState);
          delete tmp._id;
          tmp.date = todaysDate;
          tmp.time = timeAdded;
          tmp.scannerType = scannerType;

          const res: any = await axios.post(
            `${Config.BACKEND_URL}/api/scanner/setScanner`,
            { tmp }
          );

          setSaving(false);

          const okMsg =
            res?.msg ||
            res?.data?.msg ||
            (typeof res === "string" ? res : null) ||
            "Scanner saved";

          Toast.show({
            type: "success",
            text1: "Success",
            text2: okMsg,
            position: "top",
            visibilityTime: 4000,
          });

          setTimeout(() => {
            scannerType === "alert"
              ? navigation.navigate("scannerhome", { alertsScanner: "true" })
              : navigation.navigate("scannerhome");
          }, 500);
        }
      } catch (error) {
        setSaving(false);
        console.error("Save error:", error);
        Alert.alert("Error", "Failed to save scanner. Please try again.");
      }
    } else {
      Alert.alert("Error", "Please create a valid expression");
    }
  };



  const handleShare = async () => {
    try {
      const res = await axios.post(
        `${Config.BACKEND_URL}/api/scanner/generateSharingUrl`,
        { scannerState }
      );

      if (res?.sharingCode) {
        const link = `${Config.PUBLIC_URL}/scanner-sharing?code=${res.sharingCode}&alert=false&type=${type}&market=in`;

        await Clipboard.setStringAsync(link);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Link copied to clipboard",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not generate share link",
        });
      }
    } catch (err) {
      console.error("Share error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not generate share link",
      });
    }
  };

  const handleSubmit = async () => {

    if (checkEquation(expression) && auth.user) {
      setLoading(true);

      const res = await axios
        .get(`${Config.BACKEND_URL}/api/stocks/`, {
          params: {
            ...scannerState,
            windowId: windowId.current,
            scanner_type: type,
            market: subUrl,
          },
        })
        .then((res) => {
          Toast.show({
            type: "success",
            text1: "Result is Generating",
            text2: "Please scroll down to view results",
            position: "top",
            visibilityTime: 4000,
          });
          if (res) {
            setStatusMessage(res.message);
          }
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to submit scanner",
            position: "top",
            visibilityTime: 4000,
          });
        });
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please create a valid expression",
        position: "top",
        visibilityTime: 4000,
      });
    }
  };

  const handleAllChanges = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    console.log("asdfs", name)
    console.log("asdfs", value)
    if (name === "segment") {
      dispatch(handleChange({ name, value: parseInt(value) }));
    } else if (name === "duplicate" || name === "showLatestRes") {
      dispatch(handleChange({ name, value: e.target.checked }));
    } else {
      dispatch(handleChange({ name, value }));
    }
  };

  const handleSharedPress = () => {
    if (shared) {
      if (auth && auth.user._id) {
        Alert.alert(
          "Edit Scanner",
          "To edit, you'll be redirected to the scanner page...",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "OK",
              onPress: () =>
                navigation.navigate("scanner", { state: scannerState }),
            },
          ]
        );
      } else {
        Alert.alert("Login Required", "Please login to edit/create a scanner", [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => navigation.navigate("login") },
        ]);
      }
    }
  };

  /***** EFFECTS *****/

  useEffect(() => {
    if (type === "fundamental") {
      axios
        .get(
          `${Config.BACKEND_URL}/api/scanner/getFundamentalIndicatorsNew`
        )
        .then((res) => {
          if (res) {
            if (res["indicator_values"] && res["scanner_indicators"]) {
              const indic_values = Object.values(res["indicator_values"]);

              indic_values.forEach((element, i) => {
                indic_values[i].index = i;
              });

              setIndicators(indic_values);
              setScannerIndicators(res["scanner_indicators"]);
            }
          }
        })
        .catch((err) => {
          console.log("❌ Fundamental Indicators Error:", err);
        });
    } else {
      axios
        .get(
          `${Config.BACKEND_URL}/api/scanner/overlap-studies?type=${type}`
        )
        .then((res) => {
          // console.log("📈 Overlap Studies Response:", res);
          setIndicators(res);
        })
        .catch((err) => {
          console.log("❌ Overlap Studies Error:", err);
        });
    }
  }, [type]);

  // Sync expression with redux
  useEffect(() => {
    const currentExpression = JSON.stringify(expression);
    const stateExpression = JSON.stringify(scannerState.expression);

    if (currentExpression !== stateExpression) {
      dispatch(handleChange({ name: "expression", value: expression }));
    }
  }, [expression]);

  // Update local expression when redux changes
  useEffect(() => {
    const currentExpression = JSON.stringify(expression);
    const stateExpression = JSON.stringify(scannerState.expression);

    if (currentExpression !== stateExpression) {
      setExpression(scannerState.expression);
      // Reset cursor to end
      const flatExpr = flattenExpression(scannerState.expression);
      setCursorPosition(flatExpr.length);
    }
  }, [scannerState.expression]);

  // Socket listener for results
  useEffect(() => {
    if (backendSocket) {
      const handleScannerResults = (data) => {
        if (data) {
          const isValidResult = shared
            ? data.windowId == windowId.current
            : data.userId === auth?.user?._id &&
            data.windowId == windowId.current;

          if (isValidResult) {
            setLoading(false);

            if (Array.isArray(data.results) && data.results.length > 0) {
              setLink(data.link);
              setScannerResults(data.results);
              setResultsMessage(data.message);
              if (data.headers) setHeaders(data.headers);
            } else {
              Alert.alert("Info", data.message || "No results");
            }
          }
        }
      };

      backendSocket.on("scanner-results", handleScannerResults);
      return () => {
        backendSocket.off("scanner-results", handleScannerResults);
      };
    }
  }, [auth.user?._id, shared]);

  // Initialize scanner state from route params
  useEffect(() => {
    if (route.params?.state) {
      const scannerDetails = route.params.state;
      const newState = {};

      const isPublicScanner =
        auth.user?._id &&
        scannerDetails.owner &&
        scannerDetails.owner !== auth.user._id;

      for (let prop in scannerDetails) {
        if (scannerState[prop] !== undefined) {
          newState[prop] =
            prop === "segment"
              ? parseInt(scannerDetails[prop])
              : scannerDetails[prop];
        }
      }

      if (isPublicScanner) {
        // Public/admin scanner opened by a different user — treat as a fresh copy:
        // strip the source _id so save creates a new document, and reassign
        // ownership so result emails/alerts go to the current user.
        newState.owner = auth.user._id;
        newState._id = undefined;
      }

      dispatch(handleSetState(newState));
    } else {
      dispatch(resetState());
    }

    if (auth.user) {
      if (!route.params?.state) {
        dispatch(handleChange({ name: "owner", value: auth.user._id }));
      }

      dispatch(handleChange({ name: "user", value: auth.user }));

      if (type === "alerts") {
        dispatch(handleChange({ name: "alerts", value: true }));
        if (!route.params?.state) {
          dispatch(handleChange({ name: "segment1a", value: "360ONE" }));
        }
      }
    }
  }, [route.params, auth, type]);

  /***** RENDER *****/
  return (
    <ScreenWithHeader>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={dynamicStyles.keyboardView}
      >
        <ScrollView
          style={dynamicStyles.container}
          contentContainerStyle={dynamicStyles.contentContainer}
        >
          <View style={dynamicStyles.mainContent}>
            {/* Header */}
            {!shared && (
              <View style={dynamicStyles.header}>
                <View style={dynamicStyles.headerIconWrap}>
                  {type === "alerts" ? (
                    <AlertTriangle size={18} color={c.gold} strokeWidth={2.4} />
                  ) : (
                    <ScanLine size={18} color={c.gold} strokeWidth={2.4} />
                  )}
                </View>
                <Text style={dynamicStyles.headerTitle}>
                  {!type
                    ? ""
                    : type === "scanner"
                      ? "SCANNER HOME"
                      : type === "fundamental"
                        ? "Fundamental Scanner"
                        : "ALERTS HOME"}
                </Text>

              </View>
            )}

            {/* Scanner Name & Description */}
            <TouchableOpacity
              activeOpacity={shared ? 0.7 : 1}
              onPress={handleSharedPress}
            >
              <View style={dynamicStyles.inputContainer}>
                <Text style={dynamicStyles.label}>
                  {type !== "alerts" ? "Scanner Name" : "Alert Name"}
                </Text>
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="Enter scanner name"
                  placeholderTextColor={c.textMuted}
                  value={scannerState.name}
                  onChangeText={(text) =>
                    handleAllChanges({ target: { name: "name", value: text } })
                  }
                  editable={!shared}
                />
              </View>

              <View style={dynamicStyles.inputContainer}>
                <Text style={dynamicStyles.label}>
                  {type !== "alerts"
                    ? "Scanner Description"
                    : "Alert Description"}
                </Text>
                <TextInput
                  style={[dynamicStyles.input, dynamicStyles.textArea]}
                  placeholder="Enter scanner description"
                  placeholderTextColor={c.textMuted}
                  value={scannerState.description}
                  onChangeText={(text) =>
                    handleAllChanges({
                      target: { name: "description", value: text },
                    })
                  }
                  multiline
                  numberOfLines={4}
                  editable={!shared}
                />
              </View>
            </TouchableOpacity>

            {/* Three Column Layout: Indicators | Filters | Misc */}
            <TouchableOpacity
              activeOpacity={shared ? 0.7 : 1}
              onPress={handleSharedPress}
            >
              <View style={dynamicStyles.threeColumnContainer}>
                {type !== "fundamental" ? (
                  <>
                    <View style={dynamicStyles.column}>
                      <IndicatorList
                        indicators={indicators}
                        onIndicatorTap={handleIndicatorTap}
                        type={type}
                      />
                    </View>
                    <View style={dynamicStyles.column}>
                      <ScannerFilters
                        scannerState={scannerState}
                        handleChange={handleAllChanges}
                        type={type}
                      />
                    </View>
                    <View style={dynamicStyles.column}>
                      <ScannerMisc onItemTap={handleMiscTap} type={type} />
                    </View>
                  </>
                ) : (
                  <>
                    <View style={dynamicStyles.column}>
                      <IndicatorList
                        indicators={indicators}
                        onIndicatorTap={handleIndicatorTap}
                        type={type}
                      />
                    </View>
                    <View style={dynamicStyles.column}>
                      <IndicatorList
                        indicators={scannerIndicators}
                        onIndicatorTap={handleIndicatorTap}
                        type={""}
                      />
                    </View>
                    <View style={dynamicStyles.column}>
                      <ScannerMisc onItemTap={handleMiscTap} type={type} />
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Expression - AT BOTTOM */}
            <TouchableOpacity
              activeOpacity={shared ? 0.7 : 1}
              onPress={handleSharedPress}
            >
              <ScannerExpression
                expression={expression}
                cursorPosition={cursorPosition}
                onCursorChange={setCursorPosition}
                onRemoveAt={removeElemAt}
                onEditAt={editElemAt}
              />
            </TouchableOpacity>
            {/* Action Buttons - MOVED HERE (BEFORE EXPRESSION) */}
            <View style={dynamicStyles.buttonContainer}>
              {!shared && (
                <TouchableOpacity
                  style={[dynamicStyles.button, dynamicStyles.buttonSecondary]}
                  onPress={handleSaving}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <View style={dynamicStyles.buttonInner}>
                    <Save size={15} color={c.text} strokeWidth={2.2} />
                    <Text style={dynamicStyles.buttonTextSecondary}>Save</Text>
                  </View>
                </TouchableOpacity>
              )}

              {(type === "scanner" || type === "alerts") &&
                auth &&
                scannerState &&
                auth?.user?._id !== scannerState.owner &&
                !shared && (
                  <TouchableOpacity
                    style={[dynamicStyles.button, dynamicStyles.buttonSecondary]}
                    onPress={handleShare}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <View style={dynamicStyles.buttonInner}>
                      <Share2 size={15} color={c.text} strokeWidth={2.2} />
                      <Text style={dynamicStyles.buttonTextSecondary}>Share</Text>
                    </View>
                  </TouchableOpacity>
                )}

              {(type === "scanner" || type === "fundamental") && (
                <TouchableOpacity
                  style={[dynamicStyles.button, dynamicStyles.buttonPrimary]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[c.goldBright, c.gold, c.goldDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={dynamicStyles.buttonGradient}
                  >
                    <View style={dynamicStyles.buttonInner}>
                      <Search size={15} color={c.onGold} strokeWidth={2.4} />
                      <Text style={dynamicStyles.buttonTextPrimary}>Submit</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
            {/* Loading Spinner */}
            {loading && (
              <View style={dynamicStyles.loadingCard}>
                <ActivityIndicator size="large" color={c.gold} />
                <Text style={dynamicStyles.loadingText}>{statusMessage}</Text>
              </View>
            )}

            {/* Results */}
            {scannerResults.length > 0 && (
              <View>
                {resultsMessage ? (
                  <View style={dynamicStyles.warningCard}>
                    <AlertTriangle size={16} color={c.loss} strokeWidth={2.2} />
                    <Text style={dynamicStyles.warningText}>
                      {resultsMessage}
                    </Text>
                  </View>
                ) : null}

                <Text style={dynamicStyles.resultsInfo}>
                  The results are based on a {scannerState.timeframe} timeframe.
                </Text>

                <ScannerResults
                  results={scannerResults}
                  downloadUrl={link}
                  type={type}
                  headers={headers}
                />
              </View>
            )}
          </View>

          {/* Modals */}
          {indicatorModalOpen && (
            <IndicatorModal
              closeModal={closeModal}
              settings={lastElem}
              type={type}
              stock_symbol={scannerState.segment1a || "Unknown"}
            />
          )}
          {numberModalOpen && (
            <NumberOpModal closeModal={closeModal} settings={lastElem} />
          )}
          {ltpModalOpen && (
            <LTPModal closeModal={closeModal} settings={lastElem} />
          )}
          {offsetModalOpen && (
            <OffsetModal
              closeModal={closeModal}
              settings={lastElem}
              indicators={indicators}
            />
          )}

          {/* Toast Container */}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWithHeader>
  );
};

// Styles
const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    keyboardView: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    contentContainer: {
      padding: 16,
    },
    mainContent: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
    },
    headerIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: isDark ? c.goldDeep : c.goldMuted,
    },
    headerTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: c.text,
      letterSpacing: 0.2,
    },
    inputContainer: {
      marginBottom: 16,
      backgroundColor: c.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 10,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    label: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: c.textMuted,
      marginBottom: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      fontSize: 14,
      color: c.text,
      backgroundColor: c.inputBg,
    },
    textArea: {
      textAlignVertical: "top",
      minHeight: 100,
    },

    threeColumnContainer: {
      flexDirection: "column",
      gap: 12,
      marginBottom: 16,
    },
    column: {
      flex: 1,
      minHeight: 400,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 12,
      marginTop: 12,
      marginBottom: 12,
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    button: {
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      overflow: "hidden",
    },
    buttonInner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },
    buttonGradient: {
      paddingVertical: 14,
      paddingHorizontal: 14,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonPrimary: {
      ...Platform.select({
        ios: {
          shadowColor: c.gold,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    buttonSecondary: {
      backgroundColor: c.surfaceElevated,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 14,
      paddingHorizontal: 14,
    },
    buttonTextPrimary: {
      color: c.onGold,
      fontWeight: "800",
      fontSize: 13,
      letterSpacing: 0.3,
    },
    buttonTextSecondary: {
      color: c.text,
      fontWeight: "700",
      fontSize: 13,
      letterSpacing: 0.3,
    },
    loadingCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.border,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.35 : 0.08,
          shadowRadius: 12,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    loadingText: {
      fontSize: 15,
      color: c.textSecondary,
      flex: 1,
    },
    warningCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      backgroundColor: c.lossBg,
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "rgba(242,97,87,0.35)" : "rgba(224,72,59,0.25)",
    },
    warningText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      color: c.loss,
    },
    resultsInfo: {
      fontSize: 13,
      color: c.textSecondary,
      marginBottom: 12,
    },
  });

export default Scanner;
