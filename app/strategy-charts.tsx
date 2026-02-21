import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Modal, FlatList, Dimensions,
  RefreshControl, Alert,
} from "react-native";
import { ScreenWithHeader } from "@/components/AppHeader";
import { router, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TVChartContainer from "../components/UnflukeMain/TradingViewChart/TradingViewChart";

const WIDTH = Dimensions.get("window").width;
const BASE = "https://api.unfluke.in";

const CHART_TYPES = [
  { label: "Options Chart", value: "Options Chart" },
  { label: "Straddle Chart", value: "Straddle Chart" },
  { label: "Spread Chart", value: "Spread Chart" },
  { label: "Butterfly Chart", value: "Butterfly Chart" },
  { label: "Iron Fly Chart", value: "Iron Fly Chart" },
  { label: "Double Calendar", value: "Double Calendar Chart" },
  { label: "Straddle Combo", value: "Straddle Combo Chart" },
] as const;

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

export default function StrategyChartsScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [chartType, setChartType] = useState("Options Chart");
  const [showChartTypePicker, setShowChartTypePicker] = useState(false);

  const [optionNames, setOptionNames] = useState<string[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState("");
  const [showInstrumentPicker, setShowInstrumentPicker] = useState(false);

  const [expiries, setExpiries] = useState<string[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [longExpiry, setLongExpiry] = useState("");
  const [shortExpiry, setShortExpiry] = useState("");

  const [optionType, setOptionType] = useState("CE - Call");

  // Strikes list
  const [strikes, setStrikes] = useState<string[]>([]);
  const [callStrikes, setCallStrikes] = useState<string[]>([]);
  const [putStrikes, setPutStrikes] = useState<string[]>([]);

  // Selected strikes (s1 to s6, reused based on chartType)
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [s3, setS3] = useState("");
  const [s4, setS4] = useState("");
  const [s5, setS5] = useState("");
  const [s6, setS6] = useState("");

  const [callLots, setCallLots] = useState("1");
  const [putLots, setPutLots] = useState("1");

  const [chartData, setChartData] = useState<any>(null);
  const [chartSymbols, setChartSymbols] = useState<string[]>([]);

  // @ts-ignore
  const globalSelectedStock = useSelector((s) => s.GlobalStock.selectedStock);

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem("access");
        const userStr = await AsyncStorage.getItem("authUser");
        setToken(t);
        if (userStr) setUserId(JSON.parse(userStr)._id || JSON.parse(userStr).id);
      } catch { }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await safeFetch(`${BASE}/api/historicalChart/getOptionNames?id=${userId || 'default'}`, token);
        let names: string[] = [];
        if (Array.isArray(data)) names = data;
        else if (data?.optionNames && Array.isArray(data.optionNames)) names = data.optionNames;

        const FALLBACK = ["NIFTY", "BANKNIFTY", "FINNIFTY", "RELIANCE", "TCS", "HDFCBANK", "INFY"];
        if (names.length === 0) names = FALLBACK;
        setOptionNames(names);

        let defaultSelect = names[0];
        if (globalSelectedStock?.symbol) {
          const cleanSymbol = globalSelectedStock.symbol.replace(/^NSE:/, '').replace(/^BSE:/, '');
          const found = names.find(n => n.toUpperCase() === cleanSymbol.toUpperCase());
          if (found) defaultSelect = found;
        }
        setSelectedInstrument(defaultSelect);
      } catch (e) {
        setOptionNames(["NIFTY", "BANKNIFTY", "FINNIFTY", "RELIANCE", "TCS", "HDFCBANK", "INFY"]);
        setSelectedInstrument("NIFTY");
      }
      setLoading(false);
    })();
  }, [token, userId, refreshKey, globalSelectedStock?.symbol]);

  const fetchStrikes = async (exp: string, type: string) => {
    const uid = userId || 'default';
    const res = await safeFetch(`${BASE}/api/historicalChart/gitHistoricOptionsStikePrices?expiryDate=${exp}&optionName=${selectedInstrument}&optionType=${encodeURIComponent(type)}&id=${uid}`, token);
    return res?.strike_price || [];
  };

  const updateStrikesForExpiry = async (exp: string) => {
    setChartLoading(true);
    const mStraddleTypes = ["Straddle Chart", "Iron Fly Chart", "Double Calendar Chart", "Straddle Combo Chart"];
    if (mStraddleTypes.includes(chartType)) {
      const calls = await fetchStrikes(exp, "CE - Call");
      const puts = await fetchStrikes(exp, "PE - Put");
      setCallStrikes(calls); setPutStrikes(puts);
      if (calls.length > 0) { setS1(calls[0]); setS2(calls[1] || calls[0]); setS3(calls[2] || calls[0]); }
      if (puts.length > 0) { setS4(puts[0]); setS5(puts[1] || puts[0]); setS6(puts[2] || puts[0]); }
    } else {
      const sts = await fetchStrikes(exp, optionType);
      setStrikes(sts);
      if (sts.length > 0) { setS1(sts[0]); setS2(sts[1] || sts[0]); setS3(sts[2] || sts[0]); }
    }
    setChartLoading(false);
  };

  useEffect(() => {
    if (!selectedInstrument) return;
    const uid = userId || 'default';
    (async () => {
      setChartLoading(true);
      try {
        let expiryData;
        if (["Straddle Chart", "Iron Fly Chart", "Double Calendar Chart", "Straddle Combo Chart"].includes(chartType)) {
          expiryData = await safeFetch(`${BASE}/api/historicalChart/getStradleExpiryDate?optionName=${selectedInstrument}&id=${uid}`, token);
        } else {
          expiryData = await safeFetch(`${BASE}/api/option-simulator/getOptionsExpiryDates?optionName=${selectedInstrument}&optionType=${encodeURIComponent(optionType)}&id=${uid}`, token);
        }
        if (expiryData?.expiry_date && expiryData.expiry_date.length > 0) {
          setExpiries(expiryData.expiry_date);
          const firstExp = expiryData.expiry_date[0];
          setSelectedExpiry(firstExp);
          setLongExpiry(firstExp);
          setShortExpiry(firstExp);
        } else {
          setExpiries([]);
        }
      } catch (e) { console.error(e); }
      setChartLoading(false);
    })();
  }, [selectedInstrument, chartType, optionType]);

  // When selectedExpiry changes, we load strikes for that expiry.
  // For Spread/DCal, we use shortExpiry to load the strikes list, but selectedExpiry handles the rest.
  useEffect(() => {
    if (!selectedExpiry && !shortExpiry) return;
    const expToUse = ["Spread Chart", "Double Calendar Chart"].includes(chartType) ? (shortExpiry || selectedExpiry) : selectedExpiry;
    if (expToUse) updateStrikesForExpiry(expToUse);
  }, [selectedExpiry, shortExpiry, chartType]);


  const handleSubmit = async () => {
    const uid = userId || 'default';
    if (!selectedInstrument) { Alert.alert("Error", "Please select an instrument"); return; }
    setChartLoading(true); setError(null); setChartData(null); setChartSymbols([]);

    try {
      let url = "";
      switch (chartType) {
        case "Options Chart":
          url = `${BASE}/api/historicalChart/getHistoricOptionsResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${selectedExpiry}&optionType=${encodeURIComponent(optionType)}&strikePrice=${s1}`;
          break;
        case "Straddle Chart":
          url = `${BASE}/api/historicalChart/getStradleOptionResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${selectedExpiry}&callLots=${callLots}&putLots=${putLots}&callStrikePrice=${s1}&putStrikePrice=${s4}`;
          break;
        case "Spread Chart":
          url = `${BASE}/api/historicalChart/getSpreadOptionResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&optionType=${encodeURIComponent(optionType)}&shortExpiryDate=${shortExpiry}&longExpiryDate=${longExpiry}&shortStrikePrice=${s2}&longStrikePrice=${s1}&shortLots=-1&longLots=1`;
          break;
        case "Butterfly Chart":
          url = `${BASE}/api/historicalChart/getButterFlyResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${selectedExpiry}&optionType=${encodeURIComponent(optionType)}&s1=${s1}&s2=${s2}&s3=${s3}`;
          break;
        case "Iron Fly Chart":
          url = `${BASE}/api/historicalChart/getIronFlyResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${selectedExpiry}&s1=${s1}&s2=${s2}&s3=${s4}&s4=${s5}`;
          break;
        case "Double Calendar Chart":
          url = `${BASE}/api/historicalChart/getDCalResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&shortExpiryDate=${shortExpiry}&longExpiryDate=${longExpiry}&s1=${s1}&s2=${s2}&s3=${s4}&s4=${s5}`;
          break;
        case "Straddle Combo Chart":
          url = `${BASE}/api/historicalChart/getComboResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${selectedExpiry}&s1=${s1}&s2=${s2}&s3=${s3}&s4=${s4}&s5=${s5}&s6=${s6}`;
          break;
      }

      const result = await safeFetch(url, token);
      if (result?.Error || !result) {
        setError("No data found for this selection");
      } else if (result?.option || result?.[0]) {
        setChartData(result);
        const symbols = Array.isArray(result.option) ? result.option : (result.option ? [result.option] : result);
        setChartSymbols(Array.isArray(symbols) ? symbols : [symbols]);
      } else {
        setError("No chart data available. Try different parameters.");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load chart");
    }
    setChartLoading(false);
  };

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
              ListEmptyComponent={<Text style={{ textAlign: "center", color: "#9ca3af", padding: 20 }}>No items</Text>}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const FormField = ({ label, value, onPress, disabled = false }: any) => (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TouchableOpacity style={[s.fieldInput, disabled && { opacity: 0.5 }]} onPress={disabled ? undefined : onPress} activeOpacity={0.7}>
        <Text style={s.fieldValue} numberOfLines={1}>{value || "Select..."}</Text>
        <Text style={{ color: "#6b7280" }}>▼</Text>
      </TouchableOpacity>
    </View>
  );

  const PickStrike = ({ label, value, list, onSet }: any) => (
    <FormField label={label} value={value || "Loading..."} onPress={() => {
      if (list.length > 0) {
        const buttons: any[] = list.slice(0, 15).map((st: any) => ({ text: String(st), onPress: () => onSet(st) }));
        buttons.push({ text: "Cancel", style: "cancel", onPress: () => { } });
        Alert.alert(`Select ${label}`, undefined, buttons);
      }
    }} disabled={list.length === 0} />
  );

  const PickExpiry = ({ label, value, onSet }: any) => (
    <FormField label={label} value={value || "Loading..."} onPress={() => {
      if (expiries.length > 0) {
        const buttons: any[] = expiries.slice(0, 10).map((e: any) => ({ text: e, onPress: () => onSet(e) }));
        buttons.push({ text: "Cancel", style: "cancel", onPress: () => { } });
        Alert.alert(`Select ${label}`, undefined, buttons);
      }
    }} disabled={expiries.length === 0} />
  );

  if (loading) {
    return (
      <ScreenWithHeader>
        <View style={s.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={{ marginTop: 12, color: "#6b7280" }}>Loading instruments...</Text>
        </View>
      </ScreenWithHeader>
    );
  }

  return (
    <ScreenWithHeader>
      <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
        <Text style={s.headerTitle}>Strategy Charts</Text>
        <Text style={s.headerSub}>{selectedInstrument ? `${selectedInstrument} • ${chartType}` : "Select an instrument"}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => setRefreshKey(prev => prev + 1)} tintColor="#4f46e5" />}>
        <View style={s.card}>
          <Text style={s.sectionTitle}>📈 Chart Configuration</Text>
          <FormField label="Chart Type" value={chartType} onPress={() => setShowChartTypePicker(true)} />
          <FormField label="Instrument" value={selectedInstrument || "Select instrument"} onPress={() => setShowInstrumentPicker(true)} />

          {(chartType === "Options Chart" || chartType === "Spread Chart" || chartType === "Butterfly Chart") && (
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>Option Type</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["CE - Call", "PE - Put"].map(t => (
                  <TouchableOpacity key={t} style={[s.radioBtn, optionType === t && s.radioBtnActive]} onPress={() => setOptionType(t)}>
                    <Text style={[s.radioText, optionType === t && s.radioTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Render Expiries */}
          {["Spread Chart", "Double Calendar Chart"].includes(chartType) ? (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}><PickExpiry label="Long Expiry" value={longExpiry} onSet={setLongExpiry} /></View>
              <View style={{ flex: 1 }}><PickExpiry label="Short Expiry" value={shortExpiry} onSet={setShortExpiry} /></View>
            </View>
          ) : (
            <PickExpiry label="Expiry Date" value={selectedExpiry} onSet={setSelectedExpiry} />
          )}

          {/* Render Strikes */}
          {chartType === "Options Chart" && <PickStrike label="Strike Price" value={s1} list={strikes} onSet={setS1} />}
          {chartType === "Butterfly Chart" && (
            <View>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}><PickStrike label="Strike 1" value={s1} list={strikes} onSet={setS1} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Strike 2" value={s2} list={strikes} onSet={setS2} /></View>
              </View>
              <PickStrike label="Strike 3" value={s3} list={strikes} onSet={setS3} />
            </View>
          )}
          {chartType === "Spread Chart" && (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}><PickStrike label="Long Strike" value={s1} list={strikes} onSet={setS1} /></View>
              <View style={{ flex: 1 }}><PickStrike label="Short Strike" value={s2} list={strikes} onSet={setS2} /></View>
            </View>
          )}
          {chartType === "Straddle Chart" && (
            <View>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}><PickStrike label="Call Strike" value={s1} list={callStrikes} onSet={setS1} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Put Strike" value={s4} list={putStrikes} onSet={setS4} /></View>
              </View>
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
            </View>
          )}
          {(chartType === "Iron Fly Chart" || chartType === "Double Calendar Chart") && (
            <View>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}><PickStrike label="Call Strike 1" value={s1} list={callStrikes} onSet={setS1} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Call Strike 2" value={s2} list={callStrikes} onSet={setS2} /></View>
              </View>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}><PickStrike label="Put Strike 1" value={s4} list={putStrikes} onSet={setS4} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Put Strike 2" value={s5} list={putStrikes} onSet={setS5} /></View>
              </View>
            </View>
          )}
          {chartType === "Straddle Combo Chart" && (
            <View>
              <Text style={{ fontWeight: "700", marginBottom: 6, color: "#111827" }}>Call Strikes</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}><PickStrike label="Call 1" value={s1} list={callStrikes} onSet={setS1} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Call 2" value={s2} list={callStrikes} onSet={setS2} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Call 3" value={s3} list={callStrikes} onSet={setS3} /></View>
              </View>
              <Text style={{ fontWeight: "700", marginBottom: 6, marginTop: 4, color: "#111827" }}>Put Strikes</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}><PickStrike label="Put 1" value={s4} list={putStrikes} onSet={setS4} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Put 2" value={s5} list={putStrikes} onSet={setS5} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Put 3" value={s6} list={putStrikes} onSet={setS6} /></View>
              </View>
            </View>
          )}

          <TouchableOpacity style={[s.primaryBtn, chartLoading && { opacity: 0.6 }]}
            onPress={handleSubmit} disabled={chartLoading} activeOpacity={0.8}>
            {chartLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.primaryBtnText}>🚀  Load Chart</Text>}
          </TouchableOpacity>
        </View>

        {error && (
          <View style={[s.card, { borderLeftWidth: 4, borderLeftColor: "#ef4444" }]}>
            <Text style={{ color: "#ef4444", fontWeight: "600" }}>⚠️ {error}</Text>
          </View>
        )}

        {chartData && chartSymbols.length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>📊 Chart Data Loaded</Text>
            <Text style={s.resultNote}>Strategy: {chartType}</Text>
            <View style={{ marginTop: 12, marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Resolved Symbol: {chartSymbols[0]}</Text>
              <View style={{ height: 350, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' }}>
                <TVChartContainer coinId={chartSymbols[0] ? (chartSymbols[0].startsWith('NSE:') ? chartSymbols[0] : `NSE:${chartSymbols[0]}`) : "NSE:NIFTY"} />
              </View>
            </View>
            <View style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 8, borderLeftWidth: 3, borderLeftColor: "#22c55e" }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#15803d" }}>✅ Chart successfully generated</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <PickerModal visible={showChartTypePicker} onClose={() => setShowChartTypePicker(false)}
        data={CHART_TYPES.map(c => c.label)} selected={chartType} onSelect={setChartType} title="Select Chart Type" />
      <PickerModal visible={showInstrumentPicker} onClose={() => setShowInstrumentPicker(false)}
        data={optionNames} selected={selectedInstrument} onSelect={setSelectedInstrument} title="Select Instrument" searchable />
    </ScreenWithHeader >
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  headerTitle: { color: "#111827", fontSize: 22, fontWeight: "700" },
  headerSub: { color: "#6b7280", fontSize: 13, marginTop: 2, fontWeight: "500" },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 14, elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 14 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#6b7280", marginBottom: 6 },
  fieldInput: { backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fieldValue: { fontSize: 14, color: "#111827", fontWeight: "600", flex: 1 },
  radioBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#f9fafb", alignItems: "center" },
  radioBtnActive: { backgroundColor: "#eef2ff", borderColor: "#4f46e5" },
  radioText: { fontSize: 13, color: "#6b7280", fontWeight: "600" },
  radioTextActive: { color: "#4f46e5", fontWeight: "700" },
  primaryBtn: { backgroundColor: "#4f46e5", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 8 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  resultNote: { fontSize: 13, color: "#6b7280", marginBottom: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "70%" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  searchInput: { backgroundColor: "#f3f4f6", borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 12, color: "#111827" },
  pickerItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  pickerItemActive: { backgroundColor: "#eef2ff" },
  pickerItemText: { fontSize: 15, color: "#374151", fontWeight: "500" },
  pickerItemTextActive: { color: "#4f46e5", fontWeight: "700" },
});
