import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Modal, FlatList, Dimensions,
  RefreshControl, Alert,
} from "react-native";
import { ScreenWithHeader } from "@/components/AppHeader";
import { WebView } from "react-native-webview";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

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

// ─── Embedded TradingView Chart (always works) ─────────────────────────────
function StrategyTVChart({ symbol }: { symbol: string }) {
  const [loading, setLoading] = useState(true);
  const webRef = useRef<WebView>(null);
  const cleanSymbol = symbol || "NSE:NIFTY";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:100%; height:100%; background:#fff; overflow:hidden; }
    #tv_chart { width:100%; height:100%; }
    .tv-loading { display:flex; align-items:center; justify-content:center; height:100%; color:#666; font-family:sans-serif; font-size:14px; flex-direction:column; gap:10px; }
    .tv-dot { width:8px; height:8px; border-radius:50%; background:#4f46e5; display:inline-block; animation:bounce 1.2s infinite ease-in-out; }
    .tv-dot:nth-child(2) { animation-delay:0.2s; }
    .tv-dot:nth-child(3) { animation-delay:0.4s; }
    @keyframes bounce { 0%,80%,100% { transform:scale(0); } 40% { transform:scale(1); } }
  </style>
</head>
<body>
  <div id="tv_chart">
    <div class="tv-loading">
      <div style="display:flex;gap:6px">
        <span class="tv-dot"></span>
        <span class="tv-dot"></span>
        <span class="tv-dot"></span>
      </div>
      <span>Loading Chart...</span>
    </div>
  </div>
  <script>
    var sym = "${cleanSymbol.replace(/"/g, '\\"')}";
    var loaded = false;
    
    function loadTV() {
      var script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.onload = function() { initChart(); };
      script.onerror = function() {
        document.getElementById('tv_chart').innerHTML = '<div class="tv-loading" style="color:#ef4444;">⚠️ Chart library failed to load.<br>Check internet connection.</div>';
        if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage('ERROR');
      };
      document.head.appendChild(script);
    }

    function initChart() {
      if (typeof TradingView === 'undefined') { setTimeout(initChart, 300); return; }
      if (loaded) return;
      loaded = true;
      try {
        document.getElementById('tv_chart').innerHTML = '';
        new TradingView.widget({
          "autosize": true,
          "symbol": sym,
          "interval": "1",
          "timezone": "Asia/Kolkata",
          "theme": "light",
          "style": "1",
          "locale": "in",
          "toolbar_bg": "#f3f4f6",
          "enable_publishing": false,
          "allow_symbol_change": false,
          "container_id": "tv_chart",
          "hide_side_toolbar": false,
          "save_image": false,
          "hide_legend": false,
          "studies": [],
          "show_popup_button": false,
          "withdateranges": true
        });
        if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage('LOADED');
      } catch(e) {
        document.getElementById('tv_chart').innerHTML = '<div class="tv-loading" style="color:#ef4444;">⚠️ ' + e.message + '</div>';
        if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage('ERROR');
      }
    }

    loadTV();
  </script>
</body>
</html>`;

  return (
    <View style={{ flex: 1, minHeight: 380 }}>
      {loading && (
        <View style={styles.chartLoader}>
          <ActivityIndicator color="#4f46e5" size="large" />
          <Text style={styles.chartLoaderText}>Loading chart for {cleanSymbol}...</Text>
        </View>
      )}
      <WebView
        ref={webRef}
        source={{ html }}
        style={[{ flex: 1 }, loading && { opacity: 0 }]}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mixedContentMode="always"
        scalesPageToFit={false}
        scrollEnabled={false}
        androidLayerType="hardware"
        onMessage={(e) => {
          if (e.nativeEvent.data === "LOADED" || e.nativeEvent.data === "ERROR") {
            setLoading(false);
          }
        }}
        onLoadEnd={() => setTimeout(() => setLoading(false), 3000)}
        onError={() => setLoading(false)}
      />
    </View>
  );
}

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
  const [selectedInstrument, setSelectedInstrument] = useState("NIFTY");
  const [showInstrumentPicker, setShowInstrumentPicker] = useState(false);

  const [expiries, setExpiries] = useState<string[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [longExpiry, setLongExpiry] = useState("");
  const [shortExpiry, setShortExpiry] = useState("");

  const [optionType, setOptionType] = useState("CE - Call");

  const [strikes, setStrikes] = useState<string[]>([]);
  const [callStrikes, setCallStrikes] = useState<string[]>([]);
  const [putStrikes, setPutStrikes] = useState<string[]>([]);

  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [s3, setS3] = useState("");
  const [s4, setS4] = useState("");
  const [s5, setS5] = useState("");
  const [s6, setS6] = useState("");

  const [callLots, setCallLots] = useState("1");
  const [putLots, setPutLots] = useState("1");

  // The resolved TradingView symbol after submit
  const [tvSymbol, setTvSymbol] = useState("NSE:NIFTY");
  const [chartKey, setChartKey] = useState(0); // force re-render chart when symbol changes
  const [chartReady, setChartReady] = useState(true); // show chart immediately

  // @ts-ignore
  const globalSelectedStock = useSelector((s) => s.GlobalStock?.selectedStock);

  // Load token/userId
  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem("access");
        const userStr = await AsyncStorage.getItem("authUser");
        setToken(t);
        if (userStr) {
          const u = JSON.parse(userStr);
          setUserId(u._id || u.id || "");
        }
      } catch { }
    })();
  }, []);

  // Load instruments
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const uid = userId || "default";
        const data = await safeFetch(`${BASE}/api/historicalChart/getOptionNames?id=${uid}`, token);
        let names: string[] = [];
        if (Array.isArray(data)) names = data;
        else if (data?.optionNames && Array.isArray(data.optionNames)) names = data.optionNames;

        const FALLBACK = ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY", "RELIANCE", "TCS", "HDFCBANK", "INFY", "TATASTEEL", "WIPRO"];
        if (names.length === 0) names = FALLBACK;
        setOptionNames(names);

        let defaultSelect = names[0] || "NIFTY";
        if (globalSelectedStock?.symbol) {
          const clean = globalSelectedStock.symbol.replace(/^NSE:/, "").replace(/^BSE:/, "");
          const found = names.find((n) => n.toUpperCase() === clean.toUpperCase());
          if (found) defaultSelect = found;
        }
        setSelectedInstrument(defaultSelect);
      } catch {
        setOptionNames(["NIFTY", "BANKNIFTY", "FINNIFTY", "RELIANCE", "TCS"]);
        setSelectedInstrument("NIFTY");
      }
      setLoading(false);
    })();
  }, [token, userId, refreshKey]);

  const fetchStrikes = async (exp: string, type: string, instrument: string) => {
    const uid = userId || "default";
    const res = await safeFetch(
      `${BASE}/api/historicalChart/gitHistoricOptionsStikePrices?expiryDate=${encodeURIComponent(exp)}&optionName=${instrument}&optionType=${encodeURIComponent(type)}&id=${uid}`,
      token
    );
    return res?.strike_price || [];
  };

  const updateStrikesForExpiry = async (exp: string, instrument: string, ct: string) => {
    setChartLoading(true);
    const mStraddleTypes = ["Straddle Chart", "Iron Fly Chart", "Double Calendar Chart", "Straddle Combo Chart"];
    try {
      if (mStraddleTypes.includes(ct)) {
        const [calls, puts] = await Promise.all([
          fetchStrikes(exp, "CE - Call", instrument),
          fetchStrikes(exp, "PE - Put", instrument),
        ]);
        setCallStrikes(calls);
        setPutStrikes(puts);
        if (calls.length > 0) { setS1(calls[0]); setS2(calls[1] || calls[0]); setS3(calls[2] || calls[0]); }
        if (puts.length > 0) { setS4(puts[0]); setS5(puts[1] || puts[0]); setS6(puts[2] || puts[0]); }
      } else {
        const sts = await fetchStrikes(exp, optionType, instrument);
        setStrikes(sts);
        if (sts.length > 0) { setS1(sts[0]); setS2(sts[1] || sts[0]); setS3(sts[2] || sts[0]); }
      }
    } catch (e) { console.error("Strike fetch error", e); }
    setChartLoading(false);
  };

  // Fetch expiries when instrument / chartType / optionType changes
  useEffect(() => {
    if (!selectedInstrument) return;
    const uid = userId || "default";
    (async () => {
      setChartLoading(true);
      setS1(""); setS2(""); setS3(""); setS4(""); setS5(""); setS6("");
      try {
        let expiryData;
        const isStraddle = ["Straddle Chart", "Iron Fly Chart", "Double Calendar Chart", "Straddle Combo Chart"].includes(chartType);
        if (isStraddle) {
          expiryData = await safeFetch(
            `${BASE}/api/historicalChart/getStradleExpiryDate?optionName=${selectedInstrument}&id=${uid}`,
            token
          );
        } else {
          expiryData = await safeFetch(
            `${BASE}/api/option-simulator/getOptionsExpiryDates?optionName=${selectedInstrument}&optionType=${encodeURIComponent(optionType)}&id=${uid}`,
            token
          );
        }
        const dates: string[] = expiryData?.expiry_date || [];
        setExpiries(dates);
        if (dates.length > 0) {
          const first = dates[0];
          setSelectedExpiry(first);
          setLongExpiry(first);
          setShortExpiry(first);
          await updateStrikesForExpiry(first, selectedInstrument, chartType);
        } else {
          setExpiries([]);
          setStrikes([]);
          setCallStrikes([]);
          setPutStrikes([]);
        }
      } catch (e) { console.error("Expiry fetch error", e); }
      setChartLoading(false);
    })();
  }, [selectedInstrument, chartType, optionType, userId, token, refreshKey]);

  // When expiry changes manually, reload strikes
  const onExpiryChange = async (exp: string) => {
    setSelectedExpiry(exp);
    setLongExpiry(exp);
    setShortExpiry(exp);
    await updateStrikesForExpiry(exp, selectedInstrument, chartType);
  };

  const handleSubmit = async () => {
    const uid = userId || "default";
    if (!selectedInstrument) { Alert.alert("Error", "Please select an instrument"); return; }
    if (!selectedExpiry && chartType !== "None") { Alert.alert("Error", "Please wait for expiry dates to load"); return; }

    setChartLoading(true);
    setError(null);

    try {
      let url = "";
      switch (chartType) {
        case "Options Chart":
          if (!s1) { Alert.alert("Error", "Please select a Strike Price"); setChartLoading(false); return; }
          url = `${BASE}/api/historicalChart/getHistoricOptionsResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${encodeURIComponent(selectedExpiry)}&optionType=${encodeURIComponent(optionType)}&strikePrice=${s1}`;
          break;
        case "Straddle Chart":
          if (!s1 || !s4) { Alert.alert("Error", "Please select Call and Put strike prices"); setChartLoading(false); return; }
          url = `${BASE}/api/historicalChart/getStradleOptionResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${encodeURIComponent(selectedExpiry)}&callLots=${callLots}&putLots=${putLots}&callStrikePrice=${s1}&putStrikePrice=${s4}`;
          break;
        case "Spread Chart":
          if (!s1 || !s2) { Alert.alert("Error", "Please select Long and Short strike prices"); setChartLoading(false); return; }
          url = `${BASE}/api/historicalChart/getSpreadOptionResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&optionType=${encodeURIComponent(optionType)}&shortExpiryDate=${encodeURIComponent(shortExpiry || selectedExpiry)}&longExpiryDate=${encodeURIComponent(longExpiry || selectedExpiry)}&shortStrikePrice=${s2}&longStrikePrice=${s1}&shortLots=-1&longLots=1`;
          break;
        case "Butterfly Chart":
          if (!s1 || !s2 || !s3) { Alert.alert("Error", "Please select all 3 strike prices"); setChartLoading(false); return; }
          url = `${BASE}/api/historicalChart/getButterFlyResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${encodeURIComponent(selectedExpiry)}&optionType=${encodeURIComponent(optionType)}&s1=${s1}&s2=${s2}&s3=${s3}`;
          break;
        case "Iron Fly Chart":
          if (!s1 || !s2 || !s4 || !s5) { Alert.alert("Error", "Please select all strike prices"); setChartLoading(false); return; }
          url = `${BASE}/api/historicalChart/getIronFlyResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${encodeURIComponent(selectedExpiry)}&s1=${s1}&s2=${s2}&s3=${s4}&s4=${s5}`;
          break;
        case "Double Calendar Chart":
          if (!s1 || !s2 || !s4 || !s5) { Alert.alert("Error", "Please select all strike prices"); setChartLoading(false); return; }
          url = `${BASE}/api/historicalChart/getDCalResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&shortExpiryDate=${encodeURIComponent(shortExpiry)}&longExpiryDate=${encodeURIComponent(longExpiry)}&s1=${s1}&s2=${s2}&s3=${s4}&s4=${s5}`;
          break;
        case "Straddle Combo Chart":
          if (!s1 || !s2 || !s3 || !s4 || !s5 || !s6) { Alert.alert("Error", "Please select all 6 strike prices"); setChartLoading(false); return; }
          url = `${BASE}/api/historicalChart/getComboResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${encodeURIComponent(selectedExpiry)}&s1=${s1}&s2=${s2}&s3=${s3}&s4=${s4}&s5=${s5}&s6=${s6}`;
          break;
        default:
          setChartLoading(false);
          return;
      }

      console.log("[StrategyChart] Fetching:", url);
      const result = await safeFetch(url, token);
      console.log("[StrategyChart] Result:", JSON.stringify(result)?.slice(0, 200));

      if (!result || result?.Error) {
        setError(result?.Error || "No data found. Try different parameters.");
      } else {
        // Extract the TradingView symbol from result
        let resolvedSymbol: string = "";
        if (typeof result === "string") {
          resolvedSymbol = result;
        } else if (Array.isArray(result)) {
          resolvedSymbol = result[0];
        } else if (result?.option) {
          resolvedSymbol = Array.isArray(result.option) ? result.option[0] : result.option;
        } else if (result?.symbol) {
          resolvedSymbol = result.symbol;
        } else if (result?.data) {
          const d = Array.isArray(result.data) ? result.data : [result.data];
          resolvedSymbol = d[0]?.symbol || d[0] || "";
        }

        if (!resolvedSymbol) {
          setError("No chart symbol returned. Try different parameters.");
        } else {
          // Ensure NSE prefix
          const finalSymbol = resolvedSymbol.includes(":") ? resolvedSymbol : `NSE:${resolvedSymbol}`;
          setTvSymbol(finalSymbol);
          setChartKey((k) => k + 1);
          setError(null);
        }
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load chart data");
    }
    setChartLoading(false);
  };

  // ── Compact Picker Modal ───────────────────────────────────────────────────
  const PickerModal = ({ visible, onClose, data, selected, onSelect, title, searchable = false }: any) => {
    const [search, setSearch] = useState("");
    const filtered = searchable ? data.filter((i: string) => i.toLowerCase().includes(search.toLowerCase())) : data;
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            {searchable && (
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#9ca3af"
                autoFocus
              />
            )}
            <FlatList
              data={filtered}
              keyExtractor={(item, i) => `${item}-${i}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerItem, selected === item && styles.pickerItemActive]}
                  onPress={() => { onSelect(item); onClose(); }}
                >
                  <Text style={[styles.pickerItemText, selected === item && styles.pickerItemTextActive]}>{item}</Text>
                  {selected === item && <Ionicons name="checkmark" size={18} color="#4f46e5" />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ textAlign: "center", color: "#9ca3af", padding: 20 }}>No items found</Text>}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // ── Form Field ──────────────────────────────────────────────────────────────
  const FormField = ({ label, value, onPress, disabled = false }: any) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.fieldInput, disabled && { opacity: 0.45 }]}
        onPress={disabled ? undefined : onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.fieldValue} numberOfLines={1}>{value || "Select..."}</Text>
        <Ionicons name="chevron-down" size={16} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );

  // Strike selector via Alert
  const PickStrike = ({ label, value, list, onSet }: any) => {
    const [showModal, setShowModal] = useState(false);
    return (
      <>
        <FormField
          label={label}
          value={value || (list.length === 0 ? "Loading..." : "Select")}
          onPress={() => setShowModal(true)}
          disabled={list.length === 0}
        />
        <PickerModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          data={list}
          selected={value}
          onSelect={onSet}
          title={`Select ${label}`}
        />
      </>
    );
  };

  const PickExpiry = ({ label, value, onSet }: any) => {
    const [showModal, setShowModal] = useState(false);
    return (
      <>
        <FormField
          label={label}
          value={value || (expiries.length === 0 ? "Loading..." : "Select")}
          onPress={() => setShowModal(true)}
          disabled={expiries.length === 0}
        />
        <PickerModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          data={expiries}
          selected={value}
          onSelect={(v: string) => { onSet(v); if (onSet === setSelectedExpiry) onExpiryChange(v); }}
          title={`Select ${label}`}
        />
      </>
    );
  };

  if (loading) {
    return (
      <ScreenWithHeader>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={{ marginTop: 12, color: "#6b7280", fontWeight: "600" }}>Loading instruments...</Text>
        </View>
      </ScreenWithHeader>
    );
  }

  return (
    <ScreenWithHeader>
      {/* Header */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerTitle}>Strategy Charts</Text>
          <Text style={styles.headerSub}>{selectedInstrument} • {chartType}</Text>
        </View>
        <TouchableOpacity onPress={() => setRefreshKey((k) => k + 1)} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={18} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {/* Chart (always visible) */}
      <View style={styles.chartContainer}>
        <StrategyTVChart key={`chart-${chartKey}`} symbol={tvSymbol} />
      </View>

      {/* Form */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⚙️ Configure Strategy</Text>

          <FormField
            label="Chart Type"
            value={chartType}
            onPress={() => setShowChartTypePicker(true)}
          />

          <FormField
            label="Name"
            value={selectedInstrument}
            onPress={() => setShowInstrumentPicker(true)}
          />

          {/* Option Type */}
          {(chartType === "Options Chart" || chartType === "Spread Chart" || chartType === "Butterfly Chart") && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Type</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["CE - Call", "PE - Put"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.radioBtn, optionType === t && styles.radioBtnActive]}
                    onPress={() => setOptionType(t)}
                  >
                    <Text style={[styles.radioText, optionType === t && styles.radioTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Expiry */}
          {["Spread Chart", "Double Calendar Chart"].includes(chartType) ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <PickExpiry label="Long Expiry" value={longExpiry} onSet={setLongExpiry} />
              </View>
              <View style={{ flex: 1 }}>
                <PickExpiry label="Short Expiry" value={shortExpiry} onSet={setShortExpiry} />
              </View>
            </View>
          ) : (
            <PickExpiry label="Expiry" value={selectedExpiry} onSet={(v: string) => onExpiryChange(v)} />
          )}

          {/* Strikes */}
          {chartType === "Options Chart" && (
            <PickStrike label="StrikePrice" value={s1} list={strikes} onSet={setS1} />
          )}

          {chartType === "Straddle Chart" && (
            <>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}><PickStrike label="Call Strike" value={s1} list={callStrikes} onSet={setS1} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Put Strike" value={s4} list={putStrikes} onSet={setS4} /></View>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Call Lots</Text>
                  <TextInput style={styles.fieldInputText} value={callLots} onChangeText={setCallLots} keyboardType="numeric" />
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Put Lots</Text>
                  <TextInput style={styles.fieldInputText} value={putLots} onChangeText={setPutLots} keyboardType="numeric" />
                </View>
              </View>
            </>
          )}

          {chartType === "Butterfly Chart" && (
            <>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}><PickStrike label="Strike 1" value={s1} list={strikes} onSet={setS1} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Strike 2" value={s2} list={strikes} onSet={setS2} /></View>
              </View>
              <PickStrike label="Strike 3" value={s3} list={strikes} onSet={setS3} />
            </>
          )}

          {chartType === "Spread Chart" && (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}><PickStrike label="Long Strike" value={s1} list={strikes} onSet={setS1} /></View>
              <View style={{ flex: 1 }}><PickStrike label="Short Strike" value={s2} list={strikes} onSet={setS2} /></View>
            </View>
          )}

          {(chartType === "Iron Fly Chart" || chartType === "Double Calendar Chart") && (
            <>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}><PickStrike label="Call Strike 1" value={s1} list={callStrikes} onSet={setS1} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Call Strike 2" value={s2} list={callStrikes} onSet={setS2} /></View>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}><PickStrike label="Put Strike 1" value={s4} list={putStrikes} onSet={setS4} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Put Strike 2" value={s5} list={putStrikes} onSet={setS5} /></View>
              </View>
            </>
          )}

          {chartType === "Straddle Combo Chart" && (
            <>
              <Text style={{ fontWeight: "700", marginBottom: 6, color: "#374151", fontSize: 12 }}>Call Strikes</Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <View style={{ flex: 1 }}><PickStrike label="Call 1" value={s1} list={callStrikes} onSet={setS1} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Call 2" value={s2} list={callStrikes} onSet={setS2} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Call 3" value={s3} list={callStrikes} onSet={setS3} /></View>
              </View>
              <Text style={{ fontWeight: "700", marginBottom: 6, marginTop: 4, color: "#374151", fontSize: 12 }}>Put Strikes</Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <View style={{ flex: 1 }}><PickStrike label="Put 1" value={s4} list={putStrikes} onSet={setS4} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Put 2" value={s5} list={putStrikes} onSet={setS5} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Put 3" value={s6} list={putStrikes} onSet={setS6} /></View>
              </View>
            </>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, chartLoading && { opacity: 0.65 }]}
            onPress={handleSubmit}
            disabled={chartLoading}
            activeOpacity={0.8}
          >
            {chartLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Error banner */}
        {!!error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Current symbol info */}
        <View style={styles.symbolCard}>
          <Ionicons name="analytics-outline" size={16} color="#4f46e5" />
          <Text style={styles.symbolText}>Active symbol: <Text style={{ fontWeight: "700", color: "#4f46e5" }}>{tvSymbol}</Text></Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <PickerModal
        visible={showChartTypePicker}
        onClose={() => setShowChartTypePicker(false)}
        data={CHART_TYPES.map((c) => c.label)}
        selected={chartType}
        onSelect={(v: string) => {
          setChartType(v);
          setS1(""); setS2(""); setS3(""); setS4(""); setS5(""); setS6("");
        }}
        title="Select Chart Type"
      />
      <PickerModal
        visible={showInstrumentPicker}
        onClose={() => setShowInstrumentPicker(false)}
        data={optionNames}
        selected={selectedInstrument}
        onSelect={setSelectedInstrument}
        title="Select Instrument"
        searchable
      />
    </ScreenWithHeader>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },

  headerBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  headerSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#eef2ff",
    alignItems: "center", justifyContent: "center",
  },

  chartContainer: {
    height: 380,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    overflow: "hidden",
  },
  chartLoader: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    gap: 8,
  },
  chartLoaderText: { fontSize: 13, color: "#6b7280", marginTop: 4 },

  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 14,
    elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
    borderWidth: 1, borderColor: "#f3f4f6",
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 14 },

  fieldGroup: { marginBottom: 12 },
  fieldLabel: { fontSize: 11, fontWeight: "600", color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 },
  fieldInput: {
    backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  fieldInputText: {
    backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#111827", fontWeight: "600",
  },
  fieldValue: { fontSize: 14, color: "#111827", fontWeight: "600", flex: 1 },

  radioBtn: {
    flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8,
    borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#f9fafb", alignItems: "center",
  },
  radioBtnActive: { backgroundColor: "#eef2ff", borderColor: "#4f46e5" },
  radioText: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  radioTextActive: { color: "#4f46e5", fontWeight: "700" },

  primaryBtn: {
    backgroundColor: "#4f46e5", paddingVertical: 14, borderRadius: 10,
    alignItems: "center", marginTop: 12, flexDirection: "row", justifyContent: "center", gap: 8,
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  errorCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#fef2f2", borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: "#fecaca", marginBottom: 12,
  },
  errorText: { color: "#ef4444", fontWeight: "600", fontSize: 13, flex: 1 },

  symbolCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#eef2ff", borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: "#c7d2fe", marginBottom: 12,
  },
  symbolText: { color: "#374151", fontSize: 12, flex: 1 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: "75%",
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  searchInput: {
    backgroundColor: "#f3f4f6", borderRadius: 10, padding: 12,
    fontSize: 14, marginBottom: 12, color: "#111827",
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  pickerItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 14, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
  },
  pickerItemActive: { backgroundColor: "#eef2ff" },
  pickerItemText: { fontSize: 14, color: "#374151", fontWeight: "500" },
  pickerItemTextActive: { color: "#4f46e5", fontWeight: "700" },
});
