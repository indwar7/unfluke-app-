import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Modal, FlatList, Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenWithHeader } from "@/components/AppHeader";
import { WebView } from "react-native-webview";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  X, Check, Search, ChevronDown, RefreshCw, AlertCircle, LineChart,
} from "lucide-react-native";
import { useBottomGutter } from "@/utils/bottomGutter";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

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

function formatNow(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

// Parse "DD-Mon-YY" format (e.g. "10-Mar-26") — Hermes can't parse this natively
const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};
function parseExpiry(s: string): Date | null {
  const parts = s.split("-");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const mon = MONTHS[parts[1]];
  const yr = parseInt(parts[2], 10);
  if (isNaN(day) || mon === undefined || isNaN(yr)) return null;
  return new Date(yr < 100 ? 2000 + yr : yr, mon, day);
}

// Find the expiry date closest to today (>= today)
function findNearestExpiry(dates: string[]): string {
  if (dates.length === 0) return "";
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nowMs = now.getTime();

  let bestIdx = 0;
  let bestDiff = Infinity;

  for (let i = 0; i < dates.length; i++) {
    const parsed = parseExpiry(dates[i]);
    if (!parsed) continue;
    const diff = parsed.getTime() - nowMs;
    if (diff >= 0 && diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  if (bestDiff === Infinity) return dates[0];
  return dates[bestIdx];
}

// Build the TradingView chart HTML with custom Unfluke datafeed
function buildChartHTML(isDark: boolean): string {
  const bg = isDark ? "#0A0B0E" : "#FFFFFF";
  const loadingColor = isDark ? "#8A8F98" : "#666";
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:100%;height:100%;overflow:hidden;background:${bg};}
#tv_chart_container{width:100%;height:100%;}
.tv-loading{display:flex;align-items:center;justify-content:center;height:100%;color:${loadingColor};font-family:sans-serif;font-size:14px;flex-direction:column;gap:10px;}
</style>
</head><body>
<div id="tv_chart_container">
  <div class="tv-loading" id="tv_loading_msg">Loading TradingView Chart...</div>
</div>
<script>
function dbg(msg) { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage('DBG:' + msg); }
window.onerror = function(msg, url, line) { dbg('JS_ERROR: ' + msg + ' at ' + url + ':' + line); };
dbg('HTML_LOADED');
<\/script>
<script src="https://unfluke.in/charting_library/charting_library.standalone.js" onload="dbg('TV_SCRIPT_LOADED')" onerror="dbg('TV_SCRIPT_LOAD_FAILED'); document.getElementById('tv_loading_msg').innerText='Failed to load TradingView library';" ><\/script>
<script>
var AUTH = { token: '', userId: '', mrkt: '' };
var CHART_STATE = { chartType: 'Options Chart', formData: null, symbolNames: '' };
var IS_DARK = ${isDark ? "true" : "false"};
var tvWidget = null;
var chartCreated = false;
var fullName = '';
var prevLots = '1,1';
var prevName = '';
var cachedBars = [];
var symbolCache = {};

function formatDate(date) {
  var y=date.getFullYear(), m=String(date.getMonth()+1).padStart(2,'0'),
      d=String(date.getDate()).padStart(2,'0'), h=String(date.getHours()).padStart(2,'0'),
      mi=String(date.getMinutes()).padStart(2,'0'), s=String(date.getSeconds()).padStart(2,'0');
  return y+'-'+m+'-'+d+' '+h+':'+mi+':'+s;
}

function apiFetch(url) {
  var headers = {};
  if (AUTH.token) headers['Authorization'] = 'Bearer ' + AUTH.token;
  if (AUTH.mrkt) headers['mrkt'] = AUTH.mrkt;
  return fetch(url, { headers: headers })
    .then(function(r) { return r.json(); })
    .catch(function(err) {
      dbg('FETCH ERROR: ' + (err.message || err));
      throw err;
    });
}

function getChartTypeLots() {
  if (!CHART_STATE.formData) return '1,1';
  var fd = CHART_STATE.formData;
  switch (CHART_STATE.chartType) {
    case 'Straddle Chart': return (fd.putLots||'1')+','+(fd.callLots||'1');
    case 'Spread Chart': return '-1,1';
    case 'Butterfly Chart': return '1,-2,1';
    case 'Iron Fly Chart': return '1,-1,-1,1';
    case 'Double Calendar Chart': return '1,-1,1,-1';
    default: return '0';
  }
}

var Datafeed = {
  onReady: function(cb) {
    setTimeout(function() {
      cb({ supported_resolutions: ['1','3','5','15','30','60','120','240'] });
    }, 0);
  },
  searchSymbols: function(input, exchange, type, cb) { cb([]); },
  resolveSymbol: function(symbolName, onResolve, onError) {
    if (symbolCache[symbolName]) {
      var cached = symbolCache[symbolName];
      delete symbolCache[symbolName];
      setTimeout(function() { onResolve(cached); }, 0);
      return;
    }
    apiFetch('${BASE}/api/historicData/getInstrument?instrument=' + encodeURIComponent(symbolName))
    .then(function(item) {
      if (!item || item.Error) { dbg('resolveSymbol error: ' + symbolName); onError('No symbol found'); return; }
      var name, ticker, type, exchange;
      if (item.type === 'EQ') { name=item.equity; type='equity'; exchange='NSE'; ticker=item.equity; }
      else if (item.type === 'IN') { name=item.index; type='index'; exchange='NSE'; ticker=item.index; }
      else if (item.type === 'OPT') { name=item.option; type='option'; exchange='NFO'; ticker=item.option; }
      else { name=item.future; type='future'; exchange='NFO'; ticker=item.future; }
      var stub = {
        name: name.split(':')[1] || name,
        full_name: name,
        description: ticker,
        type: type,
        session: '0915-1530',
        timezone: 'Asia/Kolkata',
        instrument_token: item.instrument_token,
        ticker: ticker,
        exchange: exchange,
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        has_daily: false,
        intraday_multipliers: ['1','60'],
        has_no_volume: true,
        supported_resolutions: ['1','3','5','15','30','60','120','240'],
        data_status: 'endofday',
      };
      setTimeout(function() { onResolve(stub); }, 0);
    })
    .catch(function(err) { onError(err.message || 'Resolve error'); });
  },
  getBars: function(symbolInfo, resolution, periodParams, onResult, onError) {
    var from = periodParams.from, to = periodParams.to, first = periodParams.firstDataRequest;
    var id = AUTH.userId;
    var chartType = CHART_STATE.chartType;
    var lots = getChartTypeLots();

    if ((fullName === symbolInfo.full_name) && lots === prevLots && cachedBars.length > 0) {
      onResult(cachedBars, { noData: false });
      return;
    }

    var url, params;
    if (symbolInfo.full_name === 'NSE:NIFTY 50' && symbolInfo.type === 'index') {
      url = '${BASE}/api/historicData/data/historicalChartIndexMinute';
      params = 'i='+id+'&e='+encodeURIComponent(symbolInfo.instrument_token)
        +'&currentDateTime='+encodeURIComponent(formatDate(new Date()))
        +'&type='+symbolInfo.type+'&name='+encodeURIComponent(symbolInfo.name)
        +'&resolution='+resolution+'&nxt='+(prevName===symbolInfo.full_name);
    } else if (symbolInfo.type === 'option' && CHART_STATE.formData) {
      var fd = CHART_STATE.formData;
      var symNames = fd.symbolNames || symbolInfo.name;
      var commonP = 'i='+id+'&name='+encodeURIComponent(symNames)+'&resolution='+resolution+'&nxt=false';
      switch (chartType) {
        case 'Options Chart':
          url = '${BASE}/api/historicData/data/historicalChartMinute';
          commonP = 'i='+id+'&name='+encodeURIComponent(symbolInfo.name)+'&type=option&resolution='+resolution+'&nxt=false';
          break;
        case 'Straddle Chart':
        case 'Spread Chart':
          url = '${BASE}/api/historicData/data/stradleChartMinute';
          var lotsArr = lots.split(',');
          commonP += '&putLots='+lotsArr[0]+'&callLots='+lotsArr[1];
          break;
        case 'Butterfly Chart':
          url = '${BASE}/api/historicData/data/butterFlyChartMinute';
          var bLots = lots.split(',');
          commonP += '&l1='+bLots[0]+'&l2='+bLots[1]+'&l3='+bLots[2];
          break;
        case 'Iron Fly Chart':
          url = '${BASE}/api/historicData/data/ironFlyChartMinute';
          var iLots = lots.split(',');
          commonP += '&l1='+iLots[0]+'&l2='+iLots[1]+'&l3='+iLots[2]+'&l4='+iLots[3];
          break;
        case 'Double Calendar Chart':
          url = '${BASE}/api/historicData/data/dCalChartMinute';
          var dLots = lots.split(',');
          commonP += '&l1='+dLots[0]+'&l2='+dLots[1]+'&l3='+dLots[2]+'&l4='+dLots[3];
          break;
        case 'Straddle Combo Chart':
          url = '${BASE}/api/historicData/data/comboChartMinute';
          break;
        default:
          onResult([], { noData: true }); return;
      }
      params = commonP;
    } else {
      onResult([], { noData: true }); return;
    }

    apiFetch(url + '?' + params)
    .then(function(data) {
      if (!data || data.Error || !Array.isArray(data) || data.length === 0) {
        onResult([], { noData: true }); return;
      }
      var bars = data.map(function(el) {
        return {
          time: new Date(el.a).getTime(),
          low: Number(el.b),
          high: Number(el.c),
          open: Number(el.d),
          close: Number(el.e),
          volume: Number(el.f),
        };
      });
      fullName = symbolInfo.full_name;
      prevLots = lots;
      prevName = symbolInfo.full_name;
      cachedBars = bars;
      onResult(bars, { noData: false });
    })
    .catch(function() { onResult([], { noData: true }); });
  },
  subscribeBars: function(symbolInfo, resolution, onTick, uid, onReset) {
    if (onReset) onReset();
  },
  unsubscribeBars: function(uid) {},
  calculateHistoryDepth: function(resolution) {},
  getMarks: function() {},
  getTimeScaleMarks: function() {},
  getServerTime: function() {},
};

function createChart() {
  if (chartCreated) return;
  if (typeof TradingView === 'undefined' || !TradingView.widget) {
    setTimeout(createChart, 500);
    return;
  }
  if (!AUTH.token && !AUTH.userId) {
    setTimeout(createChart, 500);
    return;
  }
  chartCreated = true;
  tvWidget = new TradingView.widget({
    symbol: 'NSE:NIFTY 50',
    datafeed: Datafeed,
    interval: '1',
    container: 'tv_chart_container',
    library_path: 'https://unfluke.in/charting_library/',
    locale: 'en',
    disabled_features: ['use_localstorage_for_settings','header_symbol_search'],
    enabled_features: ['study_templates','fix_left_edge','side_toolbar_in_fullscreen_mode','header_in_fullscreen_mode'],
    charts_storage_url: 'https://saveload.tradingview.com',
    charts_storage_api_version: '1.1',
    client_id: 'tradingview.com',
    user_id: AUTH.userId || 'public_user_id',
    fullscreen: false,
    autosize: true,
    studies_overrides: {},
    timezone: 'Asia/Kolkata',
    theme: IS_DARK ? 'Dark' : 'Light',
    debug: false,
  });

  tvWidget.onChartReady(function() {
    tvWidget.activeChart().setChartType(2); // line chart
    tvWidget.headerReady().then(function() {
      var button = tvWidget.createButton();
      button.setAttribute('title','Check API');
      button.textContent = 'Check API';
      button.addEventListener('click', function() {
        tvWidget.showNoticeDialog({
          title: 'API Status',
          body: 'Connected to Unfluke API',
          callback: function() {}
        });
      });
    });
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage('LOADED');
  });
}

// Listen for messages from React Native
function handleMsg(raw) {
  try {
    var msg = JSON.parse(raw);
    if (msg.type === 'INIT') {
      AUTH.token = msg.token || '';
      AUTH.userId = msg.userId || '';
      AUTH.mrkt = msg.mrkt || '';
      if (typeof msg.isDark !== 'undefined') IS_DARK = !!msg.isDark;
      try { document.body.style.background = IS_DARK ? '#0A0B0E' : '#FFFFFF'; } catch(e) {}
      createChart();
    } else if (msg.type === 'SET_SYMBOL') {
      CHART_STATE.chartType = msg.chartType || 'Options Chart';
      CHART_STATE.formData = msg.formData || null;
      cachedBars = [];
      fullName = '';
      prevLots = '';
      if (tvWidget && tvWidget.activeChart) {
        try {
          var sym = msg.symbol || 'NSE:NIFTY 50';
          var parts = sym.split(':');
          var exchange = parts.length > 1 ? parts[0] : 'NFO';
          var shortName = parts.length > 1 ? parts[1] : sym;
          var symType = 'option';
          if (exchange === 'NSE') symType = shortName.indexOf('NIFTY') >= 0 ? 'index' : 'equity';
          symbolCache[sym] = {
            name: shortName,
            full_name: sym,
            description: shortName,
            type: symType,
            session: '0915-1530',
            timezone: 'Asia/Kolkata',
            ticker: sym,
            exchange: exchange,
            minmov: 1,
            pricescale: 100,
            has_intraday: true,
            has_daily: false,
            intraday_multipliers: ['1','60'],
            has_no_volume: true,
            supported_resolutions: ['1','3','5','15','30','60','120','240'],
            data_status: 'endofday',
          };
          dbg('SET_SYMBOL: cached info for ' + sym + ' type=' + symType);
          tvWidget.activeChart().setSymbol(sym, function() {
            tvWidget.activeChart().setChartType(2);
          });
        } catch(e) { dbg('setSymbol error: ' + (e.message || e)); }
      }
    }
  } catch(e) { console.error('handleMsg error:', e); }
}

document.addEventListener('message', function(e) { handleMsg(e.data); });
window.addEventListener('message', function(e) { handleMsg(e.data); });

// Send READY signal
if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage('READY');
<\/script>
</body></html>`;
}

// ============================================================
// Main Screen
// ============================================================
export default function StrategyChartsScreen() {
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);
  const screenBottomGutter = useBottomGutter();
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [mrkt, setMrkt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartReady, setChartReady] = useState(false);
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

  const webRef = useRef<WebView>(null);
  const autoSubmittedRef = useRef(false);

  // @ts-ignore
  const globalSelectedStock = useSelector((s) => s.GlobalStock?.selectedStock);

  // Load token/userId
  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem("access");
        const userStr = await AsyncStorage.getItem("authUser");
        const m = await AsyncStorage.getItem("mkt");
        setToken(t);
        setMrkt(m);
        if (userStr) {
          const u = JSON.parse(userStr);
          setUserId(u._id || u.id || "");
        }
      } catch { }
    })();
  }, []);

  const initSentRef = useRef(false);
  const tokenRef = useRef(token);
  const userIdRef = useRef(userId);
  const mrktRef = useRef(mrkt);
  const isDarkRef = useRef(isDark);
  tokenRef.current = token;
  userIdRef.current = userId;
  mrktRef.current = mrkt;
  isDarkRef.current = isDark;

  // Send INIT to WebView — reads from refs so callers don't need to re-bind
  const sendInit = useCallback(() => {
    if (initSentRef.current) return;
    if (webRef.current && tokenRef.current) {
      initSentRef.current = true;
      const msg = JSON.stringify(JSON.stringify({
        type: "INIT",
        token: tokenRef.current,
        userId: userIdRef.current,
        mrkt: mrktRef.current || "",
        isDark: isDarkRef.current,
      }));
      webRef.current.injectJavaScript(`handleMsg(${msg}); true;`);
    }
  }, []); // stable — never changes

  // Retry sendInit when token loads (WebView may have loaded before token was available)
  useEffect(() => {
    if (token && !initSentRef.current) {
      sendInit();
    }
  }, [token, sendInit]);

  // Load instruments
  useEffect(() => {
    if (!token || !userId) return;
    (async () => {
      setLoading(true);
      try {
        const uid = userId;
        const data = await safeFetch(`${BASE}/api/historicalChart/getOptionNames?id=${uid}`, token);
        let names: string[] = [];
        if (Array.isArray(data)) names = data;
        else if (data?.optionNames && Array.isArray(data.optionNames)) names = data.optionNames;

        const FALLBACK = ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY", "RELIANCE", "TCS", "HDFCBANK", "INFY", "TATASTEEL", "WIPRO"];
        if (names.length === 0) names = FALLBACK;
        setOptionNames(names);

        const defaultSelect = names.includes("NIFTY") ? "NIFTY" : (names[0] || "NIFTY");
        setSelectedInstrument(defaultSelect);
      } catch {
        setOptionNames(["NIFTY", "BANKNIFTY", "FINNIFTY", "RELIANCE", "TCS"]);
        setSelectedInstrument("NIFTY");
      }
      setLoading(false);
    })();
  }, [token, userId, refreshKey]);

  const fetchStrikes = async (exp: string, type: string, instrument: string) => {
    const uid = userId || "";
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
    if (!selectedInstrument || !token || !userId) return;
    const uid = userId;
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
          const first = findNearestExpiry(dates);
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

  // Auto-submit when default values are ready (first load)
  useEffect(() => {
    if (autoSubmittedRef.current) return;
    if (!chartReady || !token || !selectedInstrument || !selectedExpiry || !s1) return;
    autoSubmittedRef.current = true;
    // Small delay to ensure WebView is fully ready; silent=true to suppress alerts
    setTimeout(() => handleSubmit(true), 500);
  }, [chartReady, token, selectedInstrument, selectedExpiry, s1]);

  const onExpiryChange = async (exp: string) => {
    setSelectedExpiry(exp);
    setLongExpiry(exp);
    setShortExpiry(exp);
    await updateStrikesForExpiry(exp, selectedInstrument, chartType);
  };

  const handleSubmit = async (silent = false) => {
    const uid = userId || "";
    if (!selectedInstrument) { if (!silent) Alert.alert("Error", "Please select an instrument"); return; }
    if (!selectedExpiry && chartType !== "None") { if (!silent) Alert.alert("Error", "Please wait for expiry dates to load"); return; }

    setChartLoading(true);
    setError(null);

    try {
      // Step 1: Get option symbols from strategy API
      let url = "";
      switch (chartType) {
        case "Options Chart":
          if (!s1) { if (!silent) Alert.alert("Error", "Please select a Strike Price"); setChartLoading(false); return; }
          url = `${BASE}/api/historicalChart/getHistoricOptionsResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${encodeURIComponent(selectedExpiry)}&optionType=${encodeURIComponent(optionType)}&strikePrice=${s1}`;
          break;
        case "Straddle Chart":
          if (!s1 || !s4) { if (!silent) Alert.alert("Error", "Please select Call and Put strike prices"); setChartLoading(false); return; }
          url = `${BASE}/api/historicalChart/getStradleOptionResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${encodeURIComponent(selectedExpiry)}&callLots=${callLots}&putLots=${putLots}&callStrikePrice=${s1}&putStrikePrice=${s4}`;
          break;
        case "Spread Chart":
          if (!s1 || !s2) { if (!silent) Alert.alert("Error", "Please select Long and Short strike prices"); setChartLoading(false); return; }
          url = `${BASE}/api/historicalChart/getSpreadOptionResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&optionType=${encodeURIComponent(optionType)}&shortExpiryDate=${encodeURIComponent(shortExpiry || selectedExpiry)}&longExpiryDate=${encodeURIComponent(longExpiry || selectedExpiry)}&shortStrikePrice=${s2}&longStrikePrice=${s1}&shortLots=-1&longLots=1`;
          break;
        case "Butterfly Chart":
          if (!s1 || !s2 || !s3) { if (!silent) Alert.alert("Error", "Please select all 3 strike prices"); setChartLoading(false); return; }
          url = `${BASE}/api/historicalChart/getButterFlyResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${encodeURIComponent(selectedExpiry)}&optionType=${encodeURIComponent(optionType)}&s1=${s1}&s2=${s2}&s3=${s3}`;
          break;
        case "Iron Fly Chart":
          if (!s1 || !s2 || !s4 || !s5) { if (!silent) Alert.alert("Error", "Please select all strike prices"); setChartLoading(false); return; }
          url = `${BASE}/api/historicalChart/getIronFlyResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${encodeURIComponent(selectedExpiry)}&s1=${s1}&s2=${s2}&s3=${s4}&s4=${s5}`;
          break;
        case "Double Calendar Chart":
          if (!s1 || !s2 || !s4 || !s5) { if (!silent) Alert.alert("Error", "Please select all strike prices"); setChartLoading(false); return; }
          url = `${BASE}/api/historicalChart/getDCalResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&shortExpiryDate=${encodeURIComponent(shortExpiry)}&longExpiryDate=${encodeURIComponent(longExpiry)}&s1=${s1}&s2=${s2}&s3=${s4}&s4=${s5}`;
          break;
        case "Straddle Combo Chart":
          if (!s1 || !s2 || !s3 || !s4 || !s5 || !s6) { if (!silent) Alert.alert("Error", "Please select all 6 strike prices"); setChartLoading(false); return; }
          url = `${BASE}/api/historicalChart/getComboResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${encodeURIComponent(selectedExpiry)}&s1=${s1}&s2=${s2}&s3=${s3}&s4=${s4}&s5=${s5}&s6=${s6}`;
          break;
        default:
          setChartLoading(false);
          return;
      }

      const result = await safeFetch(url, token);

      if (!result || result?.Error) {
        setError(result?.Error || "No data found. Try different parameters.");
      } else {
        let optionSymbols: string[] = [];
        if (result?.option) {
          optionSymbols = Array.isArray(result.option) ? result.option : [result.option];
        } else if (Array.isArray(result)) {
          optionSymbols = result;
        }

        if (optionSymbols.length === 0) {
          setError("No chart data returned. Try different parameters.");
        } else {
          // Step 2: Tell TradingView to switch symbol
          const symbolName = chartType === "Options Chart"
            ? optionSymbols[0]
            : optionSymbols[0]; // first symbol for resolve

          const formData = {
            chartType,
            symbolNames: optionSymbols.join(","),
            selectedSymbol: chartType === "Options Chart" ? optionSymbols[0] : optionSymbols,
            putLots, callLots,
          };

          if (webRef.current) {
            const setMsg = JSON.stringify(JSON.stringify({
              type: "SET_SYMBOL",
              symbol: symbolName,
              chartType,
              formData,
            }));
            webRef.current.injectJavaScript(`handleMsg(${setMsg}); true;`);
          }
          setError(null);
        }
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load chart data");
    }
    setChartLoading(false);
  };

  // ── Picker Modal ───────────────────────────────────────────
  const PickerModal = ({ visible, onClose, data, selected, onSelect, title, searchable = false }: any) => {
    const [search, setSearch] = useState("");
    const bottomGutter = useBottomGutter();
    const filtered = searchable ? data.filter((i: string) => i.toLowerCase().includes(search.toLowerCase())) : data;
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <TouchableOpacity style={[s.modalOverlay, { paddingBottom: bottomGutter }]} activeOpacity={1} onPress={onClose}>
          <View style={s.modalContent} onStartShouldSetResponder={() => true}>
            <View style={s.modalGrabber} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Text style={s.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={s.modalClose} activeOpacity={0.7}>
                <X size={20} color={c.textSecondary} />
              </TouchableOpacity>
            </View>
            {searchable && (
              <View style={s.searchWrap}>
                <Search size={18} color={c.textMuted} />
                <TextInput
                  style={s.searchInput}
                  placeholder="Search..."
                  value={search}
                  onChangeText={setSearch}
                  placeholderTextColor={c.textMuted}
                  autoFocus
                />
              </View>
            )}
            <FlatList
              data={filtered}
              keyExtractor={(item, i) => `${item}-${i}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[s.pickerItem, selected === item && s.pickerItemActive]}
                  onPress={() => { onSelect(item); onClose(); }}
                  activeOpacity={0.7}
                >
                  <Text style={[s.pickerItemText, selected === item && s.pickerItemTextActive]}>{item}</Text>
                  {selected === item && <Check size={18} color={c.gold} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={s.pickerEmpty}>No items found</Text>}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // ── Form Field ─────────────────────────────────────────────
  const FormField = ({ label, value, onPress, disabled = false }: any) => (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[s.fieldInput, disabled && { opacity: 0.45 }]}
        onPress={disabled ? undefined : onPress}
        activeOpacity={0.7}
      >
        <Text style={s.fieldValue} numberOfLines={1}>{value || "Select..."}</Text>
        <ChevronDown size={16} color={c.textMuted} />
      </TouchableOpacity>
    </View>
  );

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

  // Baked with the active theme so the widget builds Dark/Light correctly and
  // there is no white flash. Recomputing on isDark remounts the WebView, which
  // rebuilds the TradingView widget in the new theme.
  const chartHTML = useMemo(() => buildChartHTML(isDark), [isDark]);
  const chartSource = useMemo(() => ({ html: chartHTML, baseUrl: "https://unfluke.in" }), [chartHTML]);

  const handleWebViewMessage = useCallback((e: any) => {
    const msg = e.nativeEvent.data;
    if (msg === "READY") {
      initSentRef.current = false; // WebView reloaded — allow re-sending INIT
      sendInit();
    } else if (msg === "LOADED") {
      setChartReady(true);
    }
  }, [sendInit]);

  const handleWebViewLoadEnd = useCallback(() => {
    setTimeout(() => sendInit(), 3000);
    setTimeout(() => setChartReady(true), 15000);
  }, [sendInit]); // sendInit is stable, so this is stable too

  const handleWebViewError = useCallback(() => setChartReady(true), []);

  return (
    <ScreenWithHeader>
      {/* Header */}
      <View style={s.headerBar}>
        <View style={s.headerTitleRow}>
          <View style={s.headerIcon}>
            <LineChart size={18} color={c.gold} />
          </View>
          <View>
            <Text style={s.headerTitle}>Strategy Charts</Text>
            <Text style={s.headerSub}>{selectedInstrument} · {chartType}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setRefreshKey((k) => k + 1)} style={s.refreshBtn} activeOpacity={0.7}>
          <RefreshCw size={17} color={c.gold} />
        </TouchableOpacity>
      </View>

      {/* TradingView Chart */}
      <View style={s.chartContainer}>
        {!chartReady && (
          <View style={s.chartLoader}>
            <ActivityIndicator color={c.gold} size="large" />
            <Text style={s.chartLoaderText}>Loading TradingView...</Text>
          </View>
        )}
        {chartLoading && chartReady && (
          <View style={s.chartLoadingOverlay}>
            <View style={s.chartLoadingToast}>
              <ActivityIndicator color={c.gold} size="small" />
              <Text style={s.chartLoadingToastText}>Chart is loading...</Text>
            </View>
          </View>
        )}
        <WebView
          ref={webRef}
          source={chartSource}
          style={[{ flex: 1 }, !chartReady && { opacity: 0 }]}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          mixedContentMode="always"
          scalesPageToFit={false}
          scrollEnabled={false}
          androidLayerType="hardware"
          onMessage={handleWebViewMessage}
          onLoadEnd={handleWebViewLoadEnd}
          onError={handleWebViewError}
        />
      </View>

      {/* Form */}
      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 + screenBottomGutter }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.card}>
          <Text style={s.sectionTitle}>Configure Strategy</Text>

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
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>Type</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["CE - Call", "PE - Put"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[s.radioBtn, optionType === t && s.radioBtnActive]}
                    onPress={() => setOptionType(t)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.radioText, optionType === t && s.radioTextActive]}>{t}</Text>
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

          {/* Strikes per chart type */}
          {chartType === "Options Chart" && (
            <PickStrike label="Strike Price" value={s1} list={strikes} onSet={setS1} />
          )}

          {chartType === "Straddle Chart" && (
            <>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}><PickStrike label="Call Strike" value={s1} list={callStrikes} onSet={setS1} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Put Strike" value={s4} list={putStrikes} onSet={setS4} /></View>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={[s.fieldGroup, { flex: 1 }]}>
                  <Text style={s.fieldLabel}>Call Lots</Text>
                  <TextInput style={s.fieldInputText} value={callLots} onChangeText={setCallLots} keyboardType="numeric" placeholderTextColor={c.textMuted} />
                </View>
                <View style={[s.fieldGroup, { flex: 1 }]}>
                  <Text style={s.fieldLabel}>Put Lots</Text>
                  <TextInput style={s.fieldInputText} value={putLots} onChangeText={setPutLots} keyboardType="numeric" placeholderTextColor={c.textMuted} />
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
              <Text style={s.comboLabel}>Call Strikes</Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <View style={{ flex: 1 }}><PickStrike label="Call 1" value={s1} list={callStrikes} onSet={setS1} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Call 2" value={s2} list={callStrikes} onSet={setS2} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Call 3" value={s3} list={callStrikes} onSet={setS3} /></View>
              </View>
              <Text style={[s.comboLabel, { marginTop: 4 }]}>Put Strikes</Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <View style={{ flex: 1 }}><PickStrike label="Put 1" value={s4} list={putStrikes} onSet={setS4} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Put 2" value={s5} list={putStrikes} onSet={setS5} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Put 3" value={s6} list={putStrikes} onSet={setS6} /></View>
              </View>
            </>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[s.primaryBtn, chartLoading && { opacity: 0.65 }]}
            onPress={() => handleSubmit()}
            disabled={chartLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[c.goldBright, c.gold, c.goldDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.primaryBtnGradient}
            >
              {chartLoading ? (
                <ActivityIndicator color={c.onGold} size="small" />
              ) : (
                <Text style={s.primaryBtnText}>Submit</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Error banner */}
        {!!error && (
          <View style={s.errorCard}>
            <AlertCircle size={18} color={c.loss} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}
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

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  headerBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border,
  },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: c.goldLight,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: c.gold,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: c.text, letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: c.textMuted, marginTop: 2, fontWeight: "600" },
  refreshBtn: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: c.goldLight,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: c.border,
  },

  chartContainer: {
    height: 420,
    backgroundColor: c.surface,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    overflow: "hidden",
  },
  chartLoader: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: c.surface,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    gap: 8,
  },
  chartLoaderText: { fontSize: 13, color: c.textMuted, marginTop: 4, fontWeight: "600" },
  chartLoadingOverlay: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: c.overlay,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  chartLoadingToast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.surfaceElevated,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: c.border,
  },
  chartLoadingToastText: { color: c.text, fontSize: 14, fontWeight: "700" },

  card: {
    backgroundColor: c.card, borderRadius: 18, padding: 18, marginBottom: 14,
    elevation: 2, shadowColor: "#0B0D12", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.25 : 0.08, shadowRadius: 12,
    borderWidth: 1, borderColor: c.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: c.text, marginBottom: 16, letterSpacing: -0.2 },

  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontWeight: "700", color: c.textMuted, marginBottom: 7, textTransform: "uppercase", letterSpacing: 1 },
  fieldInput: {
    backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.inputBorder, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  fieldInputText: {
    backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.inputBorder, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: c.text, fontWeight: "700",
  },
  fieldValue: { fontSize: 14, color: c.text, fontWeight: "700", flex: 1 },

  radioBtn: {
    flex: 1, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 12,
    borderWidth: 1, borderColor: c.inputBorder, backgroundColor: c.inputBg, alignItems: "center",
  },
  radioBtnActive: { backgroundColor: c.goldLight, borderColor: c.gold },
  radioText: { fontSize: 12, color: c.textSecondary, fontWeight: "700" },
  radioTextActive: { color: c.gold, fontWeight: "800" },

  comboLabel: { fontWeight: "700", marginBottom: 8, color: c.textSecondary, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6 },

  primaryBtn: {
    borderRadius: 14, marginTop: 14, overflow: "hidden",
    shadowColor: c.goldDeep, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  primaryBtnGradient: {
    paddingVertical: 15, alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 8,
  },
  primaryBtnText: { color: c.onGold, fontSize: 15, fontWeight: "800", letterSpacing: 0.3 },

  errorCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: c.lossBg, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: c.loss, marginBottom: 12,
  },
  errorText: { color: c.loss, fontWeight: "700", fontSize: 13, flex: 1 },

  modalOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: c.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, paddingTop: 12, maxHeight: "75%",
    borderWidth: 1, borderColor: c.border,
  },
  modalGrabber: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: c.border,
    alignSelf: "center", marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: c.text, letterSpacing: -0.2 },
  modalClose: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: c.surfaceElevated,
    alignItems: "center", justifyContent: "center",
  },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: c.inputBg, borderRadius: 12, paddingHorizontal: 12,
    marginBottom: 12, borderWidth: 1, borderColor: c.inputBorder,
  },
  searchInput: {
    flex: 1, paddingVertical: 12,
    fontSize: 14, color: c.text,
  },
  pickerItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12,
    borderBottomWidth: 1, borderBottomColor: c.borderLight,
  },
  pickerItemActive: { backgroundColor: c.goldLight },
  pickerItemText: { fontSize: 14, color: c.text, fontWeight: "600" },
  pickerItemTextActive: { color: c.gold, fontWeight: "800" },
  pickerEmpty: { textAlign: "center", color: c.textMuted, padding: 20, fontWeight: "600" },
});
