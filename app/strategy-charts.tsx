import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  FlatList,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TVChartContainer from "../components/UnflukeMain/TradingViewChart/TradingViewChart";

const WIDTH = Dimensions.get("window").width;
const BASE = "https://api.unfluke.in";

/* ─── Chart Types ─── */
const CHART_TYPES = [
  { label: "Options Chart", value: "Options Chart" },
  { label: "Straddle Chart", value: "Straddle Chart" },
  { label: "Spread Chart", value: "Spread Chart" },
  { label: "Butterfly Chart", value: "Butterfly Chart" },
  { label: "Iron Fly Chart", value: "Iron Fly Chart" },
  { label: "Double Calendar", value: "Double Calendar Chart" },
  { label: "Straddle Combo", value: "Straddle Combo Chart" },
] as const;

/* ─── Helpers ─── */
const safeFetch = async (url: string, token?: string | null) => {
  try {
    const headers: any = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const mrkt = await AsyncStorage.getItem("mkt");
    if (mrkt) headers.mrkt = mrkt;
    const r = await fetch(url, { headers });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
};

/* ═══════════════════ COMPONENT ═══════════════════ */
export default function StrategyChartsScreen() {
  const params = useLocalSearchParams();

  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [chartType, setChartType] = useState("Options Chart");
  const [showChartTypePicker, setShowChartTypePicker] = useState(false);

  // Instrument state
  const [optionNames, setOptionNames] = useState<string[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState("");
  const [instrumentSearch, setInstrumentSearch] = useState("");
  const [showInstrumentPicker, setShowInstrumentPicker] = useState(false);

  // Expiry & Strike state
  const [expiries, setExpiries] = useState<string[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [strikes, setStrikes] = useState<string[]>([]);
  const [selectedStrike, setSelectedStrike] = useState("");

  // Option type
  const [optionType, setOptionType] = useState("CE - Call");

  // Straddle specific
  const [callStrikes, setCallStrikes] = useState<string[]>([]);
  const [putStrikes, setPutStrikes] = useState<string[]>([]);
  const [selectedCallStrike, setSelectedCallStrike] = useState("");
  const [selectedPutStrike, setSelectedPutStrike] = useState("");
  const [callLots, setCallLots] = useState("1");
  const [putLots, setPutLots] = useState("1");

  // Spread specific
  const [longStrike, setLongStrike] = useState("");
  const [shortStrike, setShortStrike] = useState("");
  const [longExpiry, setLongExpiry] = useState("");
  const [shortExpiry, setShortExpiry] = useState("");

  // Chart result
  const [chartData, setChartData] = useState<any>(null);
  const [chartSymbols, setChartSymbols] = useState<string[]>([]);

  /* ─── Auth ─── */
  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem("access");
        const userStr = await AsyncStorage.getItem("authUser");
        setToken(t);
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserId(user._id || user.id);
        }
      } catch { }
    })();
  }, []);

  /* ─── Load option names ─── */
  useEffect(() => {
    if (!token || !userId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const data = await safeFetch(`${BASE}/api/historicalChart/getOptionNames?id=${userId}`, token);
      if (data?.optionNames && data.optionNames.length > 0) {
        setOptionNames(data.optionNames);
        setSelectedInstrument(data.optionNames[0]);
        setError(null);
      } else {
        // Fallback to major indices if API fails
        const FALLBACK = ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"];
        setOptionNames(FALLBACK);
        setSelectedInstrument(FALLBACK[0]);
        setError(null);
      }
      setLoading(false);
    })();
  }, [token, userId, refreshKey]);

  /* ─── Load expiries when instrument changes ─── */
  useEffect(() => {
    if (!selectedInstrument || !token || !userId) return;
    (async () => {
      setChartLoading(true);
      try {
        if (chartType === "Straddle Chart" || chartType === "Iron Fly Chart" || chartType === "Double Calendar Chart" || chartType === "Straddle Combo Chart") {
          // For straddle-type charts, get separate call/put strikes
          const expiryData = await safeFetch(`${BASE}/api/historicalChart/getStradleExpiryDate?optionName=${selectedInstrument}&id=${userId}`, token);
          if (expiryData?.expiry_date) {
            setExpiries(expiryData.expiry_date);
            setSelectedExpiry(expiryData.expiry_date[0] || "");
            setLongExpiry(expiryData.expiry_date[0] || "");
            setShortExpiry(expiryData.expiry_date[0] || "");
            // Get call strikes
            const callSt = await safeFetch(`${BASE}/api/historicalChart/gitHistoricOptionsStikePrices?expiryDate=${expiryData.expiry_date[0]}&optionName=${selectedInstrument}&optionType=CE - Call&id=${userId}`, token);
            if (callSt?.strike_price) { setCallStrikes(callSt.strike_price); setSelectedCallStrike(callSt.strike_price[0] || ""); }
            // Get put strikes
            const putSt = await safeFetch(`${BASE}/api/historicalChart/gitHistoricOptionsStikePrices?expiryDate=${expiryData.expiry_date[0]}&optionName=${selectedInstrument}&optionType=PE - Put&id=${userId}`, token);
            if (putSt?.strike_price) { setPutStrikes(putSt.strike_price); setSelectedPutStrike(putSt.strike_price[0] || ""); }
          }
        } else {
          // For single option charts
          const expiryData = await safeFetch(`${BASE}/api/option-simulator/getOptionsExpiryDates?optionName=${selectedInstrument}&optionType=${encodeURIComponent(optionType)}&id=${userId}`, token);
          if (expiryData?.expiry_date) {
            setExpiries(expiryData.expiry_date);
            setSelectedExpiry(expiryData.expiry_date[0] || "");
            setLongExpiry(expiryData.expiry_date[0] || "");
            setShortExpiry(expiryData.expiry_date[0] || "");
            // Get strikes for first expiry
            const strikeData = await safeFetch(`${BASE}/api/historicalChart/gitHistoricOptionsStikePrices?expiryDate=${expiryData.expiry_date[0]}&optionName=${selectedInstrument}&optionType=${encodeURIComponent(optionType)}&id=${userId}`, token);
            if (strikeData?.strike_price) {
              setStrikes(strikeData.strike_price);
              setSelectedStrike(strikeData.strike_price[0] || "");
              setLongStrike(strikeData.strike_price[0] || "");
              setShortStrike(strikeData.strike_price[0] || "");
            }
          }
        }
      } catch (e) { console.error(e); }
      setChartLoading(false);
    })();
  }, [selectedInstrument, chartType, optionType]);

  /* ─── Update strikes on expiry change ─── */
  const handleExpiryChange = async (exp: string) => {
    setSelectedExpiry(exp);
    if (!token || !userId) return;
    setChartLoading(true);
    try {
      const strikeData = await safeFetch(`${BASE}/api/historicalChart/gitHistoricOptionsStikePrices?expiryDate=${exp}&optionName=${selectedInstrument}&optionType=${encodeURIComponent(optionType)}&id=${userId}`, token);
      if (strikeData?.strike_price) {
        setStrikes(strikeData.strike_price);
        setSelectedStrike(strikeData.strike_price[0] || "");
      }
    } catch { }
    setChartLoading(false);
  };

  /* ─── Submit chart request ─── */
  const handleSubmit = async () => {
    if (!token || !userId) { Alert.alert("Error", "Please login first. User ID not found."); return; }
    if (!selectedInstrument) { Alert.alert("Error", "Please select an instrument"); return; }
    if (!selectedExpiry && (chartType !== "Options Chart" || expiries.length > 0)) {
      // Only require expiry if strictly needed or available
      Alert.alert("Error", "Please select an expiry date");
      return;
    }
    setChartLoading(true);
    setError(null);
    setChartData(null);
    setChartSymbols([]);

    try {
      let url = "";
      console.log("Submitting chart request for", chartType, selectedInstrument, selectedExpiry);

      switch (chartType) {
        case "Options Chart":
          if (!selectedStrike) { Alert.alert("Error", "Select strike price"); setChartLoading(false); return; }
          url = `${BASE}/api/historicalChart/getHistoricOptionsResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${userId}&expiryDate=${selectedExpiry}&optionType=${encodeURIComponent(optionType)}&strikePrice=${selectedStrike}`;
          break;

        case "Straddle Chart":
          url = `${BASE}/api/historicalChart/getStradleOptionResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${userId}&expiryDate=${selectedExpiry}&callLots=${callLots}&putLots=${putLots}&callStrikePrice=${selectedCallStrike}&putStrikePrice=${selectedPutStrike}`;
          break;
        case "Spread Chart":
          url = `${BASE}/api/historicalChart/getSpreadOptionResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${userId}&optionType=${encodeURIComponent(optionType)}&shortExpiryDate=${shortExpiry}&longExpiryDate=${longExpiry}&shortStrikePrice=${shortStrike}&longStrikePrice=${longStrike}&shortLots=-1&longLots=1`;
          break;
        case "Butterfly Chart":
          url = `${BASE}/api/historicalChart/getButterFlyResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${userId}&expiryDate=${selectedExpiry}&optionType=${encodeURIComponent(optionType)}&s1=${selectedStrike}&s2=${strikes[1] || selectedStrike}&s3=${strikes[2] || selectedStrike}`;
          break;
        case "Iron Fly Chart":
          url = `${BASE}/api/historicalChart/getIronFlyResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${userId}&expiryDate=${selectedExpiry}&s1=${selectedCallStrike}&s2=${callStrikes[1] || selectedCallStrike}&s3=${selectedPutStrike}&s4=${putStrikes[1] || selectedPutStrike}`;
          break;
        case "Double Calendar Chart":
          url = `${BASE}/api/historicalChart/getDCalResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${userId}&shortExpiryDate=${shortExpiry}&longExpiryDate=${longExpiry}&s1=${selectedCallStrike}&s2=${callStrikes[1] || selectedCallStrike}&s3=${selectedPutStrike}&s4=${putStrikes[1] || selectedPutStrike}`;
          break;
        case "Straddle Combo Chart":
          url = `${BASE}/api/historicalChart/getComboResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${userId}&expiryDate=${selectedExpiry}&s1=${selectedCallStrike}&s2=${callStrikes[1] || selectedCallStrike}&s3=${callStrikes[2] || selectedCallStrike}&s4=${selectedPutStrike}&s5=${putStrikes[1] || selectedPutStrike}&s6=${putStrikes[2] || selectedPutStrike}`;
          break;
      }

      const result = await safeFetch(url, token);
      if (result?.Error) {
        setError("No data found for this selection");
      } else if (result?.option) {
        setChartData(result);
        const symbols = Array.isArray(result.option) ? result.option : [result.option];
        setChartSymbols(symbols);
      } else {
        setError("No chart data available. Try different parameters.");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load chart");
    }
    setChartLoading(false);
  };

  /* ─── Result display ─── */
  const renderChartResult = () => {
    if (!chartData || chartSymbols.length === 0) return null;
    return (
      <View style={s.card}>
        <Text style={s.sectionTitle}>📊 Chart Data Loaded</Text>
        <Text style={s.resultNote}>Strategy: {chartType}</Text>
        <Text style={s.resultNote}>Instrument: {selectedInstrument}</Text>
        {chartType === "Options Chart" && (
          <Text style={s.resultNote}>Strike: {selectedStrike} ({optionType})</Text>
        )}

        <View style={{ marginTop: 12, marginBottom: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Resolved Symbol: {chartSymbols[0]}</Text>
          <View style={{ height: 350, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' }}>
            <TVChartContainer coinId={chartSymbols[0]} />
          </View>
        </View>

        <View style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 8, borderLeftWidth: 3, borderLeftColor: "#22c55e" }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#15803d" }}>✅ Chart successfully generated</Text>
        </View>
      </View>
    );
  };

  /* ─── Picker Modal ─── */
  const PickerModal = ({ visible, onClose, data, selected, onSelect, title, searchable = false }: any) => {
    const [search, setSearch] = useState("");
    const filtered = searchable ? data.filter((i: string) => i.toLowerCase().includes(search.toLowerCase())) : data;
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={onClose}>
          <View style={s.modalContent} onStartShouldSetResponder={() => true}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={s.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 26, color: "#6b7280" }}>✕</Text></TouchableOpacity>
            </View>
            {searchable && (
              <TextInput style={s.searchInput} placeholder="Search..." value={search} onChangeText={setSearch} placeholderTextColor="#9ca3af" />
            )}
            <FlatList data={filtered} keyExtractor={(item, i) => `${item}-${i}`}
              renderItem={({ item }) => (
                <TouchableOpacity style={[s.pickerItem, selected === item && s.pickerItemActive]}
                  onPress={() => { onSelect(item); onClose(); }}>
                  <Text style={[s.pickerItemText, selected === item && s.pickerItemTextActive]}>{item}</Text>
                  {selected === item && <Text style={{ color: "#4f46e5", fontSize: 18, fontWeight: "700" }}>✓</Text>}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchable && search.length > 0 ? (
                  <TouchableOpacity style={s.pickerItem} onPress={() => { onSelect(search.toUpperCase()); onClose(); }}>
                    <Text style={s.pickerItemText}>Use "{search.toUpperCase()}"</Text>
                    <Text style={{ color: "#4f46e5", fontSize: 14, fontWeight: "600" }}>SELECT</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ textAlign: "center", color: "#9ca3af", padding: 20 }}>No items</Text>
                )
              }
              ListHeaderComponent={
                searchable && search.length > 0 && filtered.length > 0 ? (
                  <TouchableOpacity style={[s.pickerItem, { borderBottomWidth: 4, borderBottomColor: "#f3f4f6" }]} onPress={() => { onSelect(search.toUpperCase()); onClose(); }}>
                    <Text style={s.pickerItemText}>Use "{search.toUpperCase()}"</Text>
                    <Text style={{ color: "#4f46e5", fontSize: 14, fontWeight: "600" }}>SELECT</Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  /* ─── Field Component ─── */
  const FormField = ({ label, value, onPress, disabled = false }: any) => (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TouchableOpacity style={[s.fieldInput, disabled && { opacity: 0.5 }]} onPress={disabled ? undefined : onPress} activeOpacity={0.7}>
        <Text style={s.fieldValue} numberOfLines={1}>{value || "Select..."}</Text>
        <Text style={{ color: "#6b7280" }}>▼</Text>
      </TouchableOpacity>
    </View>
  );

  /* ─── No auth state ─── */
  if (!token || !userId) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Text style={{ color: "#fff", fontSize: 18 }}>← </Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Strategy Charts</Text>
        </View>
        <View style={s.center}>
          <Text style={{ fontSize: 48 }}>🔒</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#374151", marginTop: 12 }}>Login Required</Text>
          <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 6, textAlign: "center" }}>Strategy Charts requires authentication to access historical options data.</Text>
          <TouchableOpacity style={s.primaryBtn} onPress={() => router.push("/login" as any)}>
            <Text style={s.primaryBtnText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Text style={{ color: "#fff", fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Strategy Charts</Text>
        </View>
        <View style={s.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={{ marginTop: 12, color: "#6b7280" }}>Loading instruments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ═══ MAIN RENDER ═══ */
  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ color: "#fff", fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Strategy Charts</Text>
          <Text style={s.headerSub}>{selectedInstrument ? `${selectedInstrument} • ${chartType}` : "Select an instrument"}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => setRefreshKey(prev => prev + 1)} tintColor="#4f46e5" />
        }>
        {/* Chart Type Selector */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>📈 Chart Configuration</Text>

          {/* Chart Type */}
          <FormField label="Chart Type" value={chartType} onPress={() => setShowChartTypePicker(true)} />

          {/* Instrument */}
          <FormField label="Instrument" value={selectedInstrument || "Select instrument"} onPress={() => setShowInstrumentPicker(true)} />

          {/* Option Type (for Options/Spread/Butterfly) */}
          {(chartType === "Options Chart" || chartType === "Spread Chart" || chartType === "Butterfly Chart") && (
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>Option Type</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["CE - Call", "PE - Put"].map(t => (
                  <TouchableOpacity key={t} style={[s.radioBtn, optionType === t && s.radioBtnActive]}
                    onPress={() => setOptionType(t)}>
                    <Text style={[s.radioText, optionType === t && s.radioTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Expiry */}
          <FormField label="Expiry Date" value={selectedExpiry || "Loading..."} onPress={() => {
            if (expiries.length > 0) {
              Alert.alert("Select Expiry", undefined, expiries.slice(0, 10).map(e => ({ text: e, onPress: () => handleExpiryChange(e) })).concat([{ text: "Cancel", style: "cancel" as any, onPress: () => { } }]));
            }
          }} disabled={expiries.length === 0} />

          {/* Strike selection based on chart type */}
          {chartType === "Options Chart" && (
            <FormField label="Strike Price" value={selectedStrike || "Loading..."} onPress={() => {
              if (strikes.length > 0) {
                Alert.alert("Select Strike", undefined, strikes.slice(0, 15).map(st => ({ text: String(st), onPress: () => setSelectedStrike(st) })).concat([{ text: "Cancel", style: "cancel" as any, onPress: () => { } }]));
              }
            }} disabled={strikes.length === 0} />
          )}

          {(chartType === "Straddle Chart" || chartType === "Iron Fly Chart" || chartType === "Straddle Combo Chart") && (
            <>
              <FormField label="Call Strike" value={selectedCallStrike || "Loading..."} onPress={() => {
                if (callStrikes.length > 0) {
                  Alert.alert("Select Call Strike", undefined, callStrikes.slice(0, 15).map(st => ({ text: String(st), onPress: () => setSelectedCallStrike(st) })).concat([{ text: "Cancel", style: "cancel" as any, onPress: () => { } }]));
                }
              }} disabled={callStrikes.length === 0} />
              <FormField label="Put Strike" value={selectedPutStrike || "Loading..."} onPress={() => {
                if (putStrikes.length > 0) {
                  Alert.alert("Select Put Strike", undefined, putStrikes.slice(0, 15).map(st => ({ text: String(st), onPress: () => setSelectedPutStrike(st) })).concat([{ text: "Cancel", style: "cancel" as any, onPress: () => { } }]));
                }
              }} disabled={putStrikes.length === 0} />
              {chartType === "Straddle Chart" && (
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={[s.fieldGroup, { flex: 1 }]}>
                    <Text style={s.fieldLabel}>Call Lots</Text>
                    <TextInput style={s.fieldInput} value={callLots} onChangeText={setCallLots} keyboardType="numeric" />
                  </View>
                  <View style={[s.fieldGroup, { flex: 1 }]}>
                    <Text style={s.fieldLabel}>Put Lots</Text>
                    <TextInput style={s.fieldInput} value={putLots} onChangeText={setPutLots} keyboardType="numeric" />
                  </View>
                </View>
              )}
            </>
          )}

          {(chartType === "Spread Chart" || chartType === "Double Calendar Chart") && (
            <>
              <FormField label="Long Strike" value={longStrike || "Loading..."} onPress={() => {
                const list = chartType === "Double Calendar Chart" ? callStrikes : strikes;
                if (list.length > 0) {
                  Alert.alert("Select Long Strike", undefined, list.slice(0, 15).map(st => ({ text: String(st), onPress: () => setLongStrike(st) })).concat([{ text: "Cancel", style: "cancel" as any, onPress: () => { } }]));
                }
              }} />
              <FormField label="Short Strike" value={shortStrike || "Loading..."} onPress={() => {
                const list = chartType === "Double Calendar Chart" ? callStrikes : strikes;
                if (list.length > 0) {
                  Alert.alert("Select Short Strike", undefined, list.slice(0, 15).map(st => ({ text: String(st), onPress: () => setShortStrike(st) })).concat([{ text: "Cancel", style: "cancel" as any, onPress: () => { } }]));
                }
              }} />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={[s.fieldGroup, { flex: 1 }]}>
                  <Text style={s.fieldLabel}>Long Expiry</Text>
                  <TouchableOpacity style={s.fieldInput} onPress={() => {
                    if (expiries.length > 0) {
                      Alert.alert("Long Expiry", undefined, expiries.slice(0, 10).map(e => ({ text: e, onPress: () => setLongExpiry(e) })).concat([{ text: "Cancel", style: "cancel" as any, onPress: () => { } }]));
                    }
                  }}>
                    <Text style={s.fieldValue} numberOfLines={1}>{longExpiry || "Select"}</Text>
                  </TouchableOpacity>
                </View>
                <View style={[s.fieldGroup, { flex: 1 }]}>
                  <Text style={s.fieldLabel}>Short Expiry</Text>
                  <TouchableOpacity style={s.fieldInput} onPress={() => {
                    if (expiries.length > 0) {
                      Alert.alert("Short Expiry", undefined, expiries.slice(0, 10).map(e => ({ text: e, onPress: () => setShortExpiry(e) })).concat([{ text: "Cancel", style: "cancel" as any, onPress: () => { } }]));
                    }
                  }}>
                    <Text style={s.fieldValue} numberOfLines={1}>{shortExpiry || "Select"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* Submit */}
          <TouchableOpacity style={[s.primaryBtn, chartLoading && { opacity: 0.6 }]}
            onPress={handleSubmit} disabled={chartLoading} activeOpacity={0.8}>
            {chartLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={s.primaryBtnText}>🚀  Load Chart</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Error */}
        {error && (
          <View style={[s.card, { borderLeftWidth: 4, borderLeftColor: "#ef4444" }]}>
            <Text style={{ color: "#ef4444", fontWeight: "600" }}>⚠️ {error}</Text>
          </View>
        )}

        {/* Chart Result */}
        {renderChartResult()}

        {/* Strategy Info */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>💡 About Strategy Charts</Text>
          <View style={{ gap: 8 }}>
            {[
              { type: "Options Chart", desc: "View historical options data for a single option contract" },
              { type: "Straddle Chart", desc: "Analyze straddle strategies with simultaneous call and put positions" },
              { type: "Spread Chart", desc: "Compare long and short options at different strikes/expiries" },
              { type: "Butterfly Chart", desc: "Three-strike strategy for range-bound markets" },
              { type: "Iron Fly Chart", desc: "Four-legged strategy combining puts and calls" },
              { type: "Double Calendar", desc: "Multi-expiry strategy for time decay analysis" },
              { type: "Straddle Combo", desc: "Advanced six-legged strategy analysis" },
            ].map((info, i) => (
              <View key={i} style={{ flexDirection: "row", paddingVertical: 6 }}>
                <Text style={{ fontSize: 13, color: "#4f46e5", fontWeight: "700", width: 140 }}>{info.type}</Text>
                <Text style={{ fontSize: 13, color: "#6b7280", flex: 1 }}>{info.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <PickerModal visible={showChartTypePicker} onClose={() => setShowChartTypePicker(false)}
        data={CHART_TYPES.map(c => c.label)} selected={chartType} onSelect={setChartType} title="Select Chart Type" />
      <PickerModal visible={showInstrumentPicker} onClose={() => setShowInstrumentPicker(false)}
        data={optionNames} selected={selectedInstrument} onSelect={setSelectedInstrument} title="Select Instrument" searchable />
    </SafeAreaView>
  );
}

/* ═══ STYLES ═══ */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },

  header: { backgroundColor: "#4f46e5", paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", elevation: 4 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "#c7d2fe", fontSize: 12, marginTop: 2 },

  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 14, elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 14 },

  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  fieldInput: { backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fieldValue: { fontSize: 15, color: "#111827", fontWeight: "500", flex: 1 },

  radioBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#f9fafb", alignItems: "center" },
  radioBtnActive: { backgroundColor: "#eef2ff", borderColor: "#4f46e5" },
  radioText: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  radioTextActive: { color: "#4f46e5", fontWeight: "700" },

  primaryBtn: { backgroundColor: "#4f46e5", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 8 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  resultNote: { fontSize: 13, color: "#6b7280", marginBottom: 4 },
  symbolCard: { backgroundColor: "#f0f9ff", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 6, borderWidth: 1, borderColor: "#bae6fd" },
  symbolText: { fontSize: 14, color: "#0369a1", fontWeight: "600", fontFamily: "monospace" },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "70%" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  searchInput: { backgroundColor: "#f3f4f6", borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 12, color: "#111827" },
  pickerItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  pickerItemActive: { backgroundColor: "#eef2ff" },
  pickerItemText: { fontSize: 15, color: "#374151", fontWeight: "500" },
  pickerItemTextActive: { color: "#4f46e5", fontWeight: "700" },
});