import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Alert,
  Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react-native";
import { range, setDeepObjProp as set } from "./utils";
import {
  TSLUnitTypes,
  initialLegPositions,
  legReentryTypes,
  legSLUnitTypes,
  legTPUnitTypes,
  legWaitTimeTypes,
} from "../../Utils/common_vars";
import {
  deleteLeg,
  updateLeg,
  setLegSummary,
} from "../../../../redux/slices/basicBacktester/reducer";
import { getInstrumentNames } from "../../../../Unfluke_helpers/backend_helper";

const Leg = (props) => {
  //////////////////// VARIABLES ////////////////////
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const index = props.index;

  const { legs, legOptions } = useSelector(
    (store) => store.BasicBacktester.positions
  );

  // Current market ("in" | "crypto"): drives which instruments a leg can pick.
  const appType = useSelector((store: any) => store?.Layout?.appType ?? "in");
  const isCrypto = appType === "crypto";

  const dispatch = useDispatch();

  const [options, setOptions] = useState("CE");

  const [expanded, setExpanded] = useState(
    props.expanded === false ? false : props.expanded === true ? true : false
  );

  // Stock legs use the NSE index list; crypto legs the bare-coin option
  // underlyings (BTC/ETH). Verified against the backend's own crypto strategies:
  // option legs key on "BTC", NOT the "BTCUSDT" futures pair. Default matches the
  // market so a crypto backtest never starts pinned to NIFTY.
  const [instrumentOptions, setInstrumentOptions] = useState(
    isCrypto ? [{ option: "BTC", multiple: 1 }] : [{ option: "NIFTY", multiple: 50 }]
  );

  // In crypto mode pull the option-underlying coins (BTC/ETH) — the same source
  // the Option Simulator uses. getAllFutures (USDT pairs) would list coins with
  // no option chain and produce legs the backtest engine can't price.
  useEffect(() => {
    let alive = true;
    if (isCrypto) {
      (async () => {
        try {
          const list = await getInstrumentNames("crypto");
          if (alive && Array.isArray(list) && list.length) {
            // Crypto options trade in units of 1; lot size isn't index-style.
            setInstrumentOptions(list.map((sym) => ({ option: sym, multiple: 1 })));
          }
        } catch { /* keep the BTC default on failure */ }
      })();
    } else {
      setInstrumentOptions([{ option: "NIFTY", multiple: 50 }]);
    }
    return () => { alive = false; };
  }, [isCrypto]);

  const lotPrices = {
    NIFTY: 50,
    BANKNIFTY: 25,
    FINNIFTY: 75,
    MIDCPNIFTY: 40,
  };

  const [positions, setPositions] = useState({
    ...initialLegPositions,
    // initialLegPositions defaults the instrument to NIFTY; in crypto mode a
    // new leg must default to the bare coin BTC (crypto option legs key on
    // "BTC"/"ETH", verified against the backend's own crypto strategies).
    ...(isCrypto ? { instrument: { option: "BTC", multiple: 1 } } : {}),
    legOptions: { ...legOptions },
  });

  //////////////////////HELPERS//////////////////////
  const decodeHtml = (str = "") => {
    return str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&uarr;/g, "↑")
      .replace(/&darr;/g, "↓");
  };


  const getLabel = (list, value) => {
    const found = list.find((i) => i.value === value);
    return decodeHtml(found ? found.string : value || "");
  };

  const getStrikeSummary = () => {
    if (props.strike === "based_on_premium") {
      return `Premium ${props.strikeDetails}`;
    }
    const d = props.strikeDetails || "";
    // format like ATM_0, ITM_2, OTM_3
    if (d.includes("_")) {
      const [type, num] = d.split("_");
      if (type === "ATM") return "ATM";
      if (type === "ITM") return `ITM -${num}`;
      if (type === "OTM") return `OTM +${num}`;
    }
    return d;
  };

  const summaryChips = () => {
    const chips = [];
    const instrument = positions?.instrument?.option;
    if (instrument) chips.push(instrument);

    if (props.buysell || props.options) {
      chips.push(
        `${(props.buysell || "").toUpperCase()} ${(
          props.options || ""
        ).toUpperCase()}`
      );
    }

    // Strike
    chips.push(getStrikeSummary());

    // Quantity
    if (props.quantity !== undefined) chips.push(`Qty ${props.quantity}`);

    // Target (TP)
    if (props.target?.value || props.target?.type) {
      const tpLabel = getLabel(legTPUnitTypes, props.target?.type);
      if (props.target?.value) {
        chips.push(`Target: ${tpLabel} - ${props.target.value}`);
      } else {
        chips.push(`Target: ${tpLabel}`);
      }
    }

    // Stop Loss
    if (props.stopLoss?.value || props.stopLoss?.type) {
      const slLabel = getLabel(legSLUnitTypes, props.stopLoss?.type);
      if (props.stopLoss?.value) {
        chips.push(`Stoploss: ${slLabel} - ${props.stopLoss.value}`);
      } else {
        chips.push(`Stoploss: ${slLabel}`);
      }
    }

    // Trailing SL X
    if (props.trailingStopLoss?.value?.x || props.trailingStopLoss?.type) {
      const tslLabel = getLabel(TSLUnitTypes, props.trailingStopLoss?.type);
      if (props.trailingStopLoss?.value?.x) {
        chips.push(
          `Trailing SL X: ${tslLabel} - ${props.trailingStopLoss.value.x}`
        );
      } else {
        chips.push(`Trailing SL X: ${tslLabel}`);
      }
    }

    // Trailing SL Y
    if (props.trailingStopLoss?.value?.y || props.trailingStopLoss?.type) {
      const tslLabel = getLabel(TSLUnitTypes, props.trailingStopLoss?.type);
      if (props.trailingStopLoss?.value?.y) {
        chips.push(
          `Trailing SL Y: ${tslLabel} - ${props.trailingStopLoss.value.y}`
        );
      } else {
        chips.push(`Trailing SL Y: ${tslLabel}`);
      }
    }

    // Wait Time
    if (props.waitTime?.type) {
      const wtLabel = getLabel(legWaitTimeTypes, props.waitTime.type);
      if (props.waitTime.type === "immediate") {
        chips.push(`Wait: ${wtLabel}`);
      } else if (props.waitTime?.value) {
        chips.push(`Wait Time: ${wtLabel} - ${props.waitTime.value}`);
      } else {
        chips.push(`Wait Time: ${wtLabel}`);
      }
    }

    // SL Re-entries
    if (props.reEntryCondition?.slType) {
      const slReType = getLabel(legReentryTypes, props.reEntryCondition.slType);
      if (props.reEntryCondition?.slReentries) {
        chips.push(
          `SL Re-entries: ${slReType} - ${props.reEntryCondition.slReentries}`
        );
      } else {
        chips.push(`SL Re-entries: ${slReType}`);
      }
    }

    // Target Re-entries
    if (props.reEntryCondition?.targetType) {
      const tReType = getLabel(
        legReentryTypes,
        props.reEntryCondition.targetType
      );
      if (props.reEntryCondition?.targetReentries) {
        chips.push(
          `Target Re-entries: ${tReType} - ${props.reEntryCondition.targetReentries}`
        );
      } else {
        chips.push(`Target Re-entries: ${tReType}`);
      }
    }

    return chips;
  };

  const summary = useMemo(
    () => summaryChips(),
    [
      // direction / option type
      props.buysell,
      props.options,
      // instrument (option inside instrument object)
      props.instrument?.option,
      // strike info
      props.strike,
      props.strikeDetails,
      // quantity
      props.quantity,
      // target
      props.target?.type,
      props.target?.value,
      // stop loss
      props.stopLoss?.type,
      props.stopLoss?.value,
      // trailing stop loss
      props.trailingStopLoss?.type,
      props.trailingStopLoss?.value?.x,
      props.trailingStopLoss?.value?.y,
      // wait time
      props.waitTime?.type,
      props.waitTime?.value,
      // re-entry condition (SL)
      props.reEntryCondition?.sl,
      props.reEntryCondition?.slType,
      props.reEntryCondition?.slReentries,
      // re-entry condition (Target)
      props.reEntryCondition?.target,
      props.reEntryCondition?.targetType,
      props.reEntryCondition?.targetReentries,
    ]
  );

  useEffect(() => {
    if (!summary) return;
    dispatch(
      setLegSummary({
        legId: props._id || props.id,
        summary,
      })
    );
  }, [dispatch, props._id, props.id, summary]);

  useEffect(() => {
    if (props.expanded !== undefined && props.expanded !== expanded) {
      setExpanded(props.expanded);
    }
  }, [props.expanded]);

  const strikeOptions = [
    ...range(1, 5, 1)
      .map((item) => {
        return { name: `ITM (-${item} Strike}`, value: `ITM_${item}` };
      })
      .reverse(),
    { name: "ATM (+0 Strike)", value: "ATM_0" },
    ...range(1, 25, 1).map((item) => {
      return { name: `OTM (+${item} Strike)`, value: `OTM_${item}` };
    }),
  ];

  //////////////////// FUNCTIONS ////////////////////

  function handleBuySell(e) {
    const payload = {
      id: props._id || props.id,
      name: "buysell",
      value: props.buysell,
    };
    if (props.buysell === "buy") {
      payload.value = "sell";
    } else {
      payload.value = "buy";
    }
    dispatch(updateLeg(payload));
  }

  function handleOptions(event) {
    setPositions((prev) => {
      return { ...prev, options: options };
    });

    const payload = {
      id: props._id || props.id,
      name: "options",
      value: props.options,
    };

    if (props.options === "CE") {
      payload.value = "PE";
    } else {
      payload.value = "CE";
    }

    dispatch(updateLeg(payload));
  }

  function handleChange(name, value) {
    if (name === "strike") {
      if (value === "based_on_premium") {
        handleChange("strikeDetails", "0");
      } else {
        handleChange("strikeDetails", "ATM_0");
      }
    }

    if (
      name.split(".")[0] === "quantity" ||
      (name.indexOf(".value") !== -1 &&
        (name.split(".")[0] === "target" ||
          name.split(".")[0] === "stopLoss" ||
          name.split(".")[0] === "trailingStopLoss" ||
          name.split(".")[0] === "waitTime")) ||
      (name.split(".")[0] === "strikeDetails" &&
        props.strike === "based_on_premium")
    ) {
      if (value < 0) {
        value = 0;
      }

      value = value
        .toString()
        .replace(/[^0-9.]/g, "") // remove non-numeric/non-dot
        .replace(/(\..*)\./g, "$1"); // prevent multiple dots
    }

    if (name === "instrument") {
      let option = value;
      // Stock indices have fixed lot sizes (lotPrices); crypto pairs don't —
      // fall back to the option's own `multiple` from instrumentOptions, then 1.
      let multiple =
        lotPrices[value] ??
        instrumentOptions.find((o) => o.option === value)?.multiple ??
        1;

      value = {
        multiple: multiple,
        option: option,
      };

      setPositions((prev) => {
        set(prev, name.split("."), value);
        return { ...prev, instrument: { option, multiple } };
      });
    }

    if (name === "reEntryCondition.sl" || name === "reEntryCondition.target") {
      value = typeof value == "string" ? value != "true" : value;
    }

    if (
      name === "reEntryCondition.slReentries" ||
      name === "reEntryCondition.targetReentries"
    ) {
      value = value > 10 ? 10 : value;
    }

    const payload = {
      id: props._id || props.id,
      name,
      value,
    };

    dispatch(updateLeg(payload));
  }

  function handleDelete() {
    Alert.alert("Delete Leg", "Are you sure you want to delete this leg?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          dispatch(deleteLeg(props._id || props.id));
        },
      },
    ]);
  }

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    card: {
      backgroundColor: isDark ? "#14161B" : "#ffffff",
      borderColor: isDark ? "#262A33" : "#d1d5db",
      borderWidth: 1,
      borderRadius: 12,
      overflow: "hidden",
      paddingTop: 6,
      paddingBottom: 6,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDark ? "#14161B" : "#ffffff",
    },
    headerLeft: {
      flexDirection: "row",
      gap: 16,
      flex: 1,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#f3f4f6" : "#1f2937",
    },
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 4,
      flex: 1,
    },
    chip: {
      fontSize: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      backgroundColor: "#dbeafe",
      color: "#1e3a8a",
      fontWeight: "500",
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    deleteButton: {
      padding: 4,
      borderRadius: 6,
    },
    expandButton: {
      padding: 4,
      borderRadius: 6,
    },
    body: {
      marginHorizontal: 16,
      marginTop: 8,
      gap: 16,
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      marginTop: 16,
    },
    inputContainer: {
      flex: 1,
      minWidth: 150,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#d1d5db" : "#374151",
      marginBottom: 4,
    },
    pickerContainer: {
      marginTop: 2,
      borderWidth: 1,
      borderColor: isDark ? "#262A33" : "#d1d5db",
      borderRadius: 8,
      backgroundColor: isDark ? "#14161B" : "#f4f8fd",
      fontSize: 12,
    },
    picker: {
      color: isDark ? "#ffffff" : "#000000",
    },
    input: {
      backgroundColor: isDark ? "#14161B" : "#f4f8fd",
      borderColor: isDark ? "#262A33" : "#d1d5db",
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: isDark ? "#f3f4f6" : "#1f2937",
      fontSize: 16,
      height: 44,
    },
    disabledInput: {
      color: "#9ca3af",
    },
    buttonRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 18,
    },
    button: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
    },
    ceButton: {
      backgroundColor: "#2563eb",
      borderColor: "#2563eb",
    },
    ceButtonInactive: {
      backgroundColor: isDark ? "#14161B" : "#ffffff",
      borderColor: isDark ? "#262A33" : "#d1d5db",
    },
    peButton: {
      backgroundColor: "#2563eb",
      borderColor: "#2563eb",
    },
    peButtonInactive: {
      backgroundColor: isDark ? "#14161B" : "#ffffff",
      borderColor: isDark ? "#262A33" : "#d1d5db",
    },
    buyButton: {
      backgroundColor: "#16a34a",
    },
    buyButtonInactive: {
      backgroundColor: isDark ? "#14161B" : "#f3f4f6",
    },
    sellButton: {
      backgroundColor: "#dc2626",
    },
    sellButtonInactive: {
      backgroundColor: isDark ? "#14161B" : "#f3f4f6",
    },
    buttonText: {
      fontSize: 14,
      fontWeight: "bold",
    },
    buttonTextActive: {
      color: "#ffffff",
    },
    buttonTextInactive: {
      color: isDark ? "#d1d5db" : "#374151",
    },
    doubleInputContainer: {
      gap: 8,
    },
    switches: {
      marginTop: 12,
    },
    switchContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    switchLabel: {
      fontSize: 13,
      color: isDark ? "#d1d5db" : "#374151",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header / Toggle */}
        <TouchableOpacity
          style={styles.header}
          onPress={() => setExpanded((p) => !p)}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Leg {index + 1}</Text>
            <View style={styles.chipsContainer}>
              {summaryChips().map((c, i) => (
                <Text key={i} style={styles.chip}>
                  {c}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              style={styles.deleteButton}
            >
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setExpanded((p) => !p);
              }}
              style={styles.expandButton}
            >
              {expanded ? (
                <ChevronUp size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
              ) : (
                <ChevronDown size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Body when expanded */}
        {expanded && (
          <ScrollView style={styles.body}>
            {/* Row 1: Instruments, Strike Type, Strike Details, Quantity */}
            <View style={styles.row}>
              {/* Instruments */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Instruments</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={positions.instrument.option}
                    style={styles.picker}
                    onValueChange={(value) => handleChange("instrument", value)}
                  >
                    {instrumentOptions.map((item, index) => (
                      <Picker.Item
                        key={index}
                        label={item.option}
                        value={item.option}
                        style={{ fontSize: 14 }}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Strike Type */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Strike Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={props.strike}
                    style={styles.picker}
                    onValueChange={(value) => handleChange("strike", value)}
                  >
                    <Picker.Item
                      style={{ fontSize: 14 }}
                      label="Based on ATM"
                      value="based_on_atm"
                    />
                    <Picker.Item
                      style={{ fontSize: 14 }}
                      label="Based on premium"
                      value="based_on_premium"
                    />
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              {/* Strike Details */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Strike Details</Text>

                {props.strike === "based_on_atm" ? (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={props.strikeDetails}
                      style={styles.picker}
                      onValueChange={(value) =>
                        handleChange("strikeDetails", value)
                      }
                    >
                      {strikeOptions.map((item, index) => (
                        <Picker.Item
                          style={{ fontSize: 14 }}
                          key={index}
                          label={item.name}
                          value={item.value}
                        />
                      ))}
                    </Picker>
                  </View>
                ) : (
                  <TextInput
                    value={props.strikeDetails?.toString()}
                    onChangeText={(value) =>
                      handleChange("strikeDetails", value)
                    }
                    style={styles.input}
                    placeholder="Closest"
                    placeholderTextColor="#9ca3af"
                  />
                )}
              </View>

              {/* Quantity */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  value={props.quantity?.toString()}
                  onChangeText={(value) => handleChange("quantity", value)}
                  style={styles.input}
                  placeholder="Quantity"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Row 2: CE/PE and Buy/Sell buttons */}
            <View style={styles.buttonRow}>
              {/* CE */}
              <TouchableOpacity
                onPress={handleOptions}
                style={[
                  styles.button,
                  props.options === "CE"
                    ? styles.ceButton
                    : styles.ceButtonInactive,
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    props.options === "CE"
                      ? styles.buttonTextActive
                      : styles.buttonTextInactive,
                  ]}
                >
                  CE
                </Text>
              </TouchableOpacity>

              {/* PE */}
              <TouchableOpacity
                onPress={handleOptions}
                style={[
                  styles.button,
                  props.options === "PE"
                    ? styles.peButton
                    : styles.peButtonInactive,
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    props.options === "PE"
                      ? styles.buttonTextActive
                      : styles.buttonTextInactive,
                  ]}
                >
                  PE
                </Text>
              </TouchableOpacity>

              {/* BUY */}
              <TouchableOpacity
                onPress={handleBuySell}
                style={[
                  styles.button,
                  props.buysell === "buy"
                    ? styles.buyButton
                    : styles.buyButtonInactive,
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    props.buysell === "buy"
                      ? styles.buttonTextActive
                      : styles.buttonTextInactive,
                  ]}
                >
                  BUY
                </Text>
              </TouchableOpacity>

              {/* SELL */}
              <TouchableOpacity
                onPress={handleBuySell}
                style={[
                  styles.button,
                  props.buysell === "sell"
                    ? styles.sellButton
                    : styles.sellButtonInactive,
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    props.buysell === "sell"
                      ? styles.buttonTextActive
                      : styles.buttonTextInactive,
                  ]}
                >
                  SELL
                </Text>
              </TouchableOpacity>
            </View>

            {/* Target, Stoploss, Trailing SL X/Y */}
            <View style={styles.row}>
              {/* Target */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Target</Text>
                <View style={styles.doubleInputContainer}>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={props.target.type}
                      style={styles.picker}
                      onValueChange={(value) =>
                        handleChange("target.type", value)
                      }
                    >
                      {legTPUnitTypes.map((item, index) => (
                        <Picker.Item
                          key={index}
                          style={{ fontSize: 14 }}
                          label={decodeHtml(item.string)}
                          value={item.value}
                        />
                      ))}
                    </Picker>
                  </View>
                  <TextInput
                    value={props.target.value?.toString()}
                    onChangeText={(value) =>
                      handleChange("target.value", value)
                    }
                    style={[
                      styles.input,
                      props.target.type === "None" && styles.disabledInput,
                    ]}
                    editable={props.target.type !== "None"}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Stoploss */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Stoploss</Text>
                <View style={styles.doubleInputContainer}>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={props.stopLoss.type}
                      style={styles.picker}
                      onValueChange={(value) =>
                        handleChange("stopLoss.type", value)
                      }
                    >
                      {legSLUnitTypes.map((item, index) => (
                        <Picker.Item
                          key={index}
                          style={{ fontSize: 14 }}
                          label={decodeHtml(item.string)}
                          value={item.value}
                        />
                      ))}
                    </Picker>
                  </View>
                  <TextInput
                    value={props.stopLoss.value?.toString()}
                    onChangeText={(value) =>
                      handleChange("stopLoss.value", value)
                    }
                    style={[
                      styles.input,
                      props.stopLoss.type === "None" && styles.disabledInput,
                    ]}
                    editable={props.stopLoss.type !== "None"}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              {/* Trailing SL X */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Trailing SL X</Text>
                <View style={styles.doubleInputContainer}>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={props.trailingStopLoss.type}
                      style={styles.picker}
                      onValueChange={(value) =>
                        handleChange("trailingStopLoss.type", value)
                      }
                    >
                      {TSLUnitTypes.map((item, index) => (
                        <Picker.Item
                          key={index}
                          style={{ fontSize: 14 }}
                          label={decodeHtml(item.string)}
                          value={item.value}
                        />
                      ))}
                    </Picker>
                  </View>
                  <TextInput
                    value={props.trailingStopLoss.value.x?.toString()}
                    onChangeText={(value) =>
                      handleChange("trailingStopLoss.value.x", value)
                    }
                    style={[
                      styles.input,
                      props.trailingStopLoss.type === "None" &&
                      styles.disabledInput,
                    ]}
                    editable={props.trailingStopLoss.type !== "None"}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Trailing SL Y */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Trailing SL Y</Text>
                <TextInput
                  value={props.trailingStopLoss.value.y?.toString()}
                  onChangeText={(value) =>
                    handleChange("trailingStopLoss.value.y", value)
                  }
                  style={[
                    styles.input,
                    props.trailingStopLoss.type === "None" &&
                    styles.disabledInput,
                  ]}
                  editable={props.trailingStopLoss.type !== "None"}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Row 4: Wait Time and Re-Entries */}
            <View style={styles.row}>
              {/* Wait Time */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Wait Time</Text>
                <View style={styles.doubleInputContainer}>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={props.waitTime.type}
                      style={styles.picker}
                      onValueChange={(value) =>
                        handleChange("waitTime.type", value)
                      }
                    >
                      {legWaitTimeTypes.map((item, index) => (
                        <Picker.Item
                          style={{ fontSize: 14 }}
                          key={index}
                          label={decodeHtml(item.string)}
                          value={item.value}
                        />
                      ))}
                    </Picker>
                  </View>
                  <TextInput
                    value={props.waitTime.value?.toString()}
                    onChangeText={(value) =>
                      handleChange("waitTime.value", value)
                    }
                    style={[
                      styles.input,
                      props.waitTime.type === "immediate" &&
                      styles.disabledInput,
                    ]}
                    editable={props.waitTime.type !== "immediate"}
                    placeholder="Wait Time"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              {/* SL Re-entries */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>SL Re-entries</Text>
                <View style={styles.doubleInputContainer}>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={props.reEntryCondition?.slType || "asap"}
                      style={styles.picker}
                      enabled={false}   // 👈 disables the picker
                      onValueChange={(value) =>
                        handleChange("reEntryCondition.slType", value)
                      }
                    >
                      {legReentryTypes.map((item, index) => (
                        <Picker.Item
                          style={{ fontSize: 14 }}
                          key={index}
                          label={decodeHtml(item.string)}
                          value={item.value}
                        />
                      ))}
                    </Picker>
                  </View>
                  <TextInput
                    value={
                      props.reEntryCondition?.slReentries?.toString() || "0"
                    }
                    onChangeText={(value) =>
                      handleChange("reEntryCondition.slReentries", value)
                    }
                    style={[
                      styles.input,
                      !props.reEntryCondition?.sl && styles.disabledInput,
                    ]}
                    editable={props.reEntryCondition?.sl}
                    placeholder="Total SL Re-entries"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Target Re-entries */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Target Re-entries</Text>
                <View style={styles.doubleInputContainer}>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={
                        props.reEntryCondition?.targetType || "asap"
                      }
                      style={styles.picker}
                      enabled={false}   // 👈 disables the picker
                      onValueChange={(value) =>
                        handleChange("reEntryCondition.targetType", value)
                      }
                    >
                      {legReentryTypes.map((item, index) => (
                        <Picker.Item
                          style={{ fontSize: 14 }}
                          key={index}
                          label={decodeHtml(item.string)}
                          value={item.value}
                        />
                      ))}
                    </Picker>
                  </View>
                  <TextInput
                    value={
                      props.reEntryCondition?.targetReentries?.toString() || "0"
                    }
                    onChangeText={(value) =>
                      handleChange("reEntryCondition.targetReentries", value)
                    }
                    style={[
                      styles.input,
                      !props.reEntryCondition?.target && styles.disabledInput,
                    ]}
                    editable={props.reEntryCondition?.target}
                    placeholder="Total Target Re-entries"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Row 5: Checkboxes */}
            <View style={styles.switches}>
              <View style={styles.switchContainer}>
                <Switch
                  value={
                    props.reEntryCondition ? props.reEntryCondition.sl : false
                  }
                  onValueChange={(value) =>
                    handleChange("reEntryCondition.sl", value)
                  }
                  trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                  thumbColor={
                    props.reEntryCondition?.sl ? "#ffffff" : "#f3f4f6"
                  }
                />
                <Text style={styles.switchLabel}>Re-enter on SL Exit</Text>
              </View>

              <View style={styles.switchContainer}>
                <Switch
                  value={
                    props.reEntryCondition
                      ? props.reEntryCondition.target
                      : false
                  }
                  onValueChange={(value) =>
                    handleChange("reEntryCondition.target", value)
                  }
                  trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                  thumbColor={
                    props.reEntryCondition?.target ? "#ffffff" : "#f3f4f6"
                  }
                />
                <Text style={styles.switchLabel}>Re-enter on Target Exit</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default Leg;
