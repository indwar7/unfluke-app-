import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Modal, FlatList,
  Alert, Animated, useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenWithHeader } from "@/components/AppHeader";
import { WebView } from "react-native-webview";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  X, Check, Search, ChevronDown, RefreshCw, AlertCircle, LineChart,
  SlidersHorizontal,
} from "lucide-react-native";
import { useBottomGutter } from "@/utils/bottomGutter";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { CHART_ORIGIN_WHITELIST, isAllowedChartNavigation } from "@/helpers/externalLinks";

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

// Failures resolve to { Error } (never throw): callers reading a field
// (expiry_date/strike_price/optionNames) fall through to their empty-state,
// while handleSubmit surfaces the real backend message instead of a generic
// "no data" — a 4xx/timeout used to be indistinguishable from empty data.
const safeFetch = async (url: string, token?: string | null) => {
  const controller = new AbortController();
  // getStradleExpiryDate is known to hang server-side (Cloudflare 524 after
  // ~100s); don't let the UI spin that long.
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const headers: any = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const mrkt = await AsyncStorage.getItem("mkt");
    // Backend scopes market by `appType` header; keep `mrkt` for compatibility.
    if (mrkt) { headers.appType = mrkt; headers.mrkt = mrkt; }
    const r = await fetch(url, { headers, signal: controller.signal });
    if (!r.ok) {
      let msg = `Server error (${r.status})`;
      try {
        const body = await r.json();
        if (body?.Error) msg = `${body.Error} (${r.status})`;
      } catch {}
      return { Error: msg };
    }
    return await r.json();
  } catch (e: any) {
    return { Error: e?.name === "AbortError" ? "Request timed out" : (e?.message || "Network error") };
  } finally {
    clearTimeout(timer);
  }
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
  // Defensive: a hung/erroring endpoint can surface non-string entries —
  // never crash the screen over a malformed expiry.
  if (typeof s !== "string") return null;
  const parts = s.split("-");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const mon = MONTHS[parts[1]];
  const yr = parseInt(parts[2], 10);
  if (isNaN(day) || mon === undefined || isNaN(yr)) return null;
  return new Date(yr < 100 ? 2000 + yr : yr, mon, day);
}

// Website parity (bundle fn `Q`): the expiry dropdown lists dates sorted
// ASCENDING (oldest → newest). The API serves them newest-first, so sort a
// copy — order elsewhere (default pick) is order-independent.
function sortExpiriesAscending(dates: string[]): string[] {
  return [...dates].sort((a, b) => {
    const pa = parseExpiry(a)?.getTime() ?? 0;
    const pb = parseExpiry(b)?.getTime() ?? 0;
    return pa - pb;
  });
}

// Website parity (bundle fn `W`): default = nearest expiry >= today; when
// every expiry is in the past (crypto series frozen at 03-Jul), fall back to
// the LATEST one — not element [0], which after ascending sort is the OLDEST.
function findNearestExpiry(dates: string[]): string {
  if (dates.length === 0) return "";
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nowMs = now.getTime();

  let bestIdx = -1;
  let bestDiff = Infinity;
  let latestIdx = 0;
  let latestMs = -Infinity;

  for (let i = 0; i < dates.length; i++) {
    const parsed = parseExpiry(dates[i]);
    if (!parsed) continue;
    const ms = parsed.getTime();
    if (ms > latestMs) { latestMs = ms; latestIdx = i; }
    const diff = ms - nowMs;
    if (diff >= 0 && diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  if (bestIdx === -1) return dates[latestIdx];
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
  // Backend scopes market by appType header; keep mrkt for compatibility.
  if (AUTH.mrkt) { headers['appType'] = AUTH.mrkt; headers['mrkt'] = AUTH.mrkt; }
  return fetch(url, { headers: headers })
    .then(function(r) { return r.json(); })
    .catch(function(err) {
      dbg('FETCH ERROR: ' + (err.message || err));
      throw err;
    });
}

// Website parity (bundle fn cVe): compose the lots CSV from the submitted
// form values — order matters and matches the website exactly.
function getChartTypeLots() {
  if (!CHART_STATE.formData) return '1,1';
  var fd = CHART_STATE.formData;
  switch (CHART_STATE.chartType) {
    case 'Straddle Chart': return (fd.putLots||'1')+','+(fd.callLots||'1');
    case 'Spread Chart': return (fd.shortLots||'-1')+','+(fd.longLots||'1');
    case 'Butterfly Chart': return (fd.lotOne||'1')+','+(fd.lotTwo||'-2')+','+(fd.lotThree||'1');
    case 'Iron Fly Chart': return (fd.callLotOne||'1')+','+(fd.callLotTwo||'-1')+','+(fd.putLotOne||'-1')+','+(fd.putLotTwo||'1');
    case 'Double Calendar Chart': return (fd.longCallLot||'1')+','+(fd.shortCallLot||'-1')+','+(fd.longPutLot||'1')+','+(fd.shortPutLot||'-1');
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
    var isCryptoMkt = AUTH.mrkt === 'crypto';
    // Prefix bare crypto symbols with the CRYPTO: exchange so getInstrument
    // resolves them (a bare/NSE-prefixed crypto symbol 404s).
    var lookup = symbolName;
    if (isCryptoMkt && lookup.indexOf(':') === -1) lookup = 'CRYPTO:' + lookup;
    apiFetch('${BASE}/api/historicData/getInstrument?instrument=' + encodeURIComponent(lookup) + '&market=' + (AUTH.mrkt || 'in'))
    .then(function(item) {
      if (!item || item.Error) { dbg('resolveSymbol error: ' + symbolName); onError('No symbol found'); return; }
      var name, ticker, type, exchange, tokenForBars, displayName;
      if (isCryptoMkt || item.type === 'CRYPTO') {
        if (item.option || String(item.tablename || '').indexOf('op_') === 0) {
          // Crypto OPTION (verified live): historicalChartMinute only returns
          // bars when name keeps the FULL "CRYPTO:C-BTC-60000-030726" string —
          // the bare symbol yields []. Must be typed 'option' so getBars uses
          // the strategy endpoints, not the spot-candles one.
          name = item.option;
          type = 'option'; exchange = 'CRYPTO'; ticker = item.option;
          tokenForBars = item.instrument_token || name;
          displayName = name; // keep prefix — the bars request uses symbolInfo.name
        } else {
          // Crypto SPOT (verified): e = instrument_token ("BTCUSDT"), type = "spot".
          var idx = item.index || lookup;
          name = item.instrument_token || (idx.split(':')[1]) || idx;
          type = 'spot'; exchange = 'CRYPTO'; ticker = name;
          tokenForBars = item.instrument_token || name;
        }
      }
      else if (item.type === 'EQ') { name=item.equity; type='equity'; exchange='NSE'; ticker=item.equity; tokenForBars=item.instrument_token; }
      else if (item.type === 'IN') { name=item.index; type='index'; exchange='NSE'; ticker=item.index; tokenForBars=item.instrument_token; }
      else if (item.type === 'OPT') { name=item.option; type='option'; exchange='NFO'; ticker=item.option; tokenForBars=item.instrument_token; }
      else { name=item.future; type='future'; exchange='NFO'; ticker=item.future; tokenForBars=item.instrument_token; }
      var isCryptoSym = exchange === 'CRYPTO';
      var stub = {
        name: displayName || name.split(':')[1] || name,
        full_name: name,
        description: ticker,
        type: type,
        session: (isCryptoSym || type === 'spot') ? '24x7' : '0915-1530',
        // Website uses IST for both markets; backend converts.
        timezone: 'Asia/Kolkata',
        instrument_token: tokenForBars,
        ticker: ticker,
        exchange: exchange,
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        has_daily: false,
        // Website's strategy datafeed declares only 1-minute data for every
        // symbol (options/index/crypto) and lets TradingView aggregate; the
        // strategy endpoints only serve 1-minute series.
        intraday_multipliers: ['1'],
        has_no_volume: true,
        supported_resolutions: ['1','3','5','15','30','60','120','240'],
        data_status: 'endofday',
      };
      setTimeout(function() { onResolve(stub); }, 0);
    })
    .catch(function(err) { onError(err.message || 'Resolve error'); });
  },
  getBars: function(symbolInfo, resolution, periodParams, onResult, onError) {
    var first = periodParams.firstDataRequest;
    var id = AUTH.userId;
    var chartType = CHART_STATE.chartType;
    var lots = getChartTypeLots();

    // Website parity: strategy series are a single chunk — pagination requests
    // (firstDataRequest=false) always end the series. Re-serving the cached
    // bars for an older range fed TradingView overlapping bars and broke the
    // chart with a time-order violation.
    if (!first) {
      onResult([], { noData: true });
      return;
    }
    var cacheKey = symbolInfo.full_name + '|' + (CHART_STATE.formData ? (CHART_STATE.formData.symbolNames || '') : '') + '|' + lots + '|' + chartType;
    if (cacheKey === prevName && cachedBars.length > 0) {
      onResult(cachedBars, { noData: false });
      return;
    }

    var url, params;
    // Options must be checked BEFORE the CRYPTO/spot branch: crypto option
    // symbols carry exchange CRYPTO too, but their bars come from the strategy
    // endpoints — the spot-candles endpoint returns [] for them.
    if (symbolInfo.type === 'option' && CHART_STATE.formData) {
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
    } else if (symbolInfo.exchange === 'CRYPTO' || symbolInfo.type === 'spot') {
      // Crypto spot underlying (verified): histoTradingminute with
      // e=instrument_token, type=spot, appType header.
      url = '${BASE}/api/historicData/data/histoTradingminute';
      params = 'i='+id+'&e='+encodeURIComponent(symbolInfo.instrument_token)
        +'&currentDateTime='+encodeURIComponent(formatDate(new Date()))
        +'&type=spot&name='+encodeURIComponent(symbolInfo.name)
        +'&resolution='+resolution+'&nxt=false';
    } else if (symbolInfo.full_name === 'NSE:NIFTY 50' && symbolInfo.type === 'index') {
      url = '${BASE}/api/historicData/data/historicalChartIndexMinute';
      params = 'i='+id+'&e='+encodeURIComponent(symbolInfo.instrument_token)
        +'&currentDateTime='+encodeURIComponent(formatDate(new Date()))
        +'&type='+symbolInfo.type+'&name='+encodeURIComponent(symbolInfo.name)
        +'&resolution='+resolution+'&nxt=false';
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
      prevName = cacheKey;
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
    symbol: AUTH.mrkt === 'crypto' ? 'CRYPTO:BTCUSDT' : 'NSE:NIFTY 50',
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
      prevName = '';
      if (tvWidget && tvWidget.activeChart) {
        try {
          var sym = msg.symbol || (AUTH.mrkt === 'crypto' ? 'CRYPTO:BTCUSDT' : 'NSE:NIFTY 50');
          // For crypto, do NOT pre-seed the cache stub: it would guess an
          // NFO/option/IST shape with no instrument_token and short-circuit
          // resolveSymbol's live getInstrument path (which correctly returns
          // the _id, CRYPTO exchange and 24x7/UTC). Let resolveSymbol run.
          if (AUTH.mrkt !== 'crypto') {
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
              // Match resolveSymbol: strategy endpoints only serve 1-minute series.
              intraday_multipliers: ['1'],
              has_no_volume: true,
              supported_resolutions: ['1','3','5','15','30','60','120','240'],
              data_status: 'endofday',
            };
          }
          dbg('SET_SYMBOL: ' + sym + ' (mrkt=' + AUTH.mrkt + ')');
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
  const insets = useSafeAreaInsets();
  const { width: winWidth } = useWindowDimensions();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Website-parity lot inputs (defaults from the website's form state):
  // Spread: Lot (Long)=1, Lot (Short)=-1
  const [longLots, setLongLots] = useState("1");
  const [shortLots, setShortLots] = useState("-1");
  // Butterfly: Lots 1..3 = 1, -2, 1
  const [bLot1, setBLot1] = useState("1");
  const [bLot2, setBLot2] = useState("-2");
  const [bLot3, setBLot3] = useState("1");
  // Iron Fly: Lots 1..4 = 1, -1, -1, 1 (CE1, CE2, PE1, PE2)
  const [ifLot1, setIfLot1] = useState("1");
  const [ifLot2, setIfLot2] = useState("-1");
  const [ifLot3, setIfLot3] = useState("-1");
  const [ifLot4, setIfLot4] = useState("1");
  // Double Calendar: CE Long=1, CE Short=-1, PE Long=1, PE Short=-1
  const [dcLongCallLot, setDcLongCallLot] = useState("1");
  const [dcShortCallLot, setDcShortCallLot] = useState("-1");
  const [dcLongPutLot, setDcLongPutLot] = useState("1");
  const [dcShortPutLot, setDcShortPutLot] = useState("-1");

  const webRef = useRef<WebView>(null);
  const autoSubmittedRef = useRef(false);
  // Rotates which leg SET_SYMBOL resolves so identical re-submits still
  // refresh the chart (website's `(g+1)%option.length` behaviour).
  const submitCountRef = useRef(0);

  // Sidebar slide-in animation (matches Historical Charts pattern)
  const sidebarWidth = Math.min(400, winWidth * 0.9);
  const slideAnim = useRef(new Animated.Value(sidebarWidth)).current; // hidden off-screen (right)
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: sidebarOpen ? 0 : sidebarWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sidebarOpen, sidebarWidth, slideAnim]);

  // @ts-ignore
  const globalSelectedStock = useSelector((s: any) => s.GlobalStock?.selectedStock);
  // Current market ("in" | "crypto") — instrument list must follow it.
  const appType = useSelector((s: any) => s?.Layout?.appType ?? "in");
  const isCrypto = appType === "crypto";

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

  // Load instruments for the current market. getOptionNames returns NSE names
  // for both markets, so in crypto mode pull the OPTION underlyings
  // (getAllOptions?market=crypto → ["BTC","ETH"]) — strategy charts build
  // option strategies, so they key on the bare coin like the Option Simulator,
  // NOT the USDT futures pair.
  useEffect(() => {
    if (!token || !userId) return;
    (async () => {
      setLoading(true);
      try {
        const uid = userId;
        const url = isCrypto
          ? `${BASE}/api/getAllOptions?scanner=false&market=crypto`
          : `${BASE}/api/historicalChart/getOptionNames?id=${uid}`;
        const data = await safeFetch(url, token);
        let names: string[] = [];
        if (Array.isArray(data)) names = data;
        else if (data?.optionNames && Array.isArray(data.optionNames)) names = data.optionNames;

        const FALLBACK = isCrypto
          ? ["BTC", "ETH"]
          : ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY", "RELIANCE", "TCS", "HDFCBANK", "INFY", "TATASTEEL", "WIPRO"];
        if (names.length === 0) names = FALLBACK;
        setOptionNames(names);

        const preferred = isCrypto ? "BTC" : "NIFTY";
        const defaultSelect = names.includes(preferred) ? preferred : (names[0] || preferred);
        setSelectedInstrument(defaultSelect);
      } catch {
        if (isCrypto) {
          setOptionNames(["BTC", "ETH"]);
          setSelectedInstrument("BTC");
        } else {
          setOptionNames(["NIFTY", "BANKNIFTY", "FINNIFTY", "RELIANCE", "TCS"]);
          setSelectedInstrument("NIFTY");
        }
      }
      setLoading(false);
    })();
  }, [token, userId, refreshKey, isCrypto]);

  const fetchStrikes = async (exp: string, type: string, instrument: string) => {
    const uid = userId || "";
    const res = await safeFetch(
      `${BASE}/api/historicalChart/gitHistoricOptionsStikePrices?expiryDate=${encodeURIComponent(exp)}&optionName=${instrument}&optionType=${encodeURIComponent(type)}&id=${uid}`,
      token
    );
    if (res?.Error) throw new Error(res.Error);
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
    } catch (e: any) {
      console.error("Strike fetch error", e);
      setError(`Couldn't load strike prices: ${e?.message || "unknown error"}`);
    }
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
        // getStradleExpiryDate HANGS server-side for BOTH markets (re-verified
        // live 2026-07-09: NSE NIFTY AND crypto BTC time out — no response,
        // Cloudflare 524s) — it's what broke the straddle-family charts
        // (Straddle / Iron Fly / Double Calendar / Straddle Combo) in NSE mode
        // after the crypto-only reroute shipped. getOptionsExpiryDates serves
        // the SAME list for every chart type in <1s, so ALL chart types in
        // BOTH markets now use it (the website's split exists only because its
        // client sits behind a logged-in session where the legacy route still
        // answers). optionType doesn't change the list; default CE.
        const expiryData = await safeFetch(
          `${BASE}/api/option-simulator/getOptionsExpiryDates?optionName=${selectedInstrument}&optionType=${encodeURIComponent(optionType || "CE - Call")}&id=${uid}`,
          token
        );
        // safeFetch never throws — a hung/timed-out backend call (e.g.
        // getStradleExpiryDate, known to 524 after ~100s server-side)
        // resolves to { Error }. Surface that instead of silently treating
        // it as "this instrument has no expiries".
        if (expiryData?.Error) {
          setError(`Couldn't load expiry dates: ${expiryData.Error}`);
          setExpiries([]);
          setStrikes([]);
          setCallStrikes([]);
          setPutStrikes([]);
        } else {
          // Ascending like the website's dropdown; default pick = website's W.
          const dates: string[] = sortExpiriesAscending(expiryData?.expiry_date || []);
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

  // Website parity: changing ONE side's expiry refetches the strike lists for
  // that expiry and resets only that side's defaults —
  //  · Double Calendar (bundle fns ee/te): short → Short CE/PE strikes (s1/s4),
  //    long → Long CE/PE strikes (s2/s5); CE+PE lists refreshed.
  //  · Spread (bundle fns Z/J): refetch for the active option type; long →
  //    Long Strike (s1), short → Short Strike (s2).
  const onSideExpiryChange = async (side: "long" | "short", exp: string) => {
    if (side === "long") setLongExpiry(exp); else setShortExpiry(exp);
    setChartLoading(true);
    try {
      if (chartType === "Double Calendar Chart") {
        const [calls, puts] = await Promise.all([
          fetchStrikes(exp, "CE - Call", selectedInstrument),
          fetchStrikes(exp, "PE - Put", selectedInstrument),
        ]);
        setCallStrikes(calls);
        setPutStrikes(puts);
        if (side === "short") {
          if (calls.length > 0) setS1(calls[0]);
          if (puts.length > 0) setS4(puts[0]);
        } else {
          if (calls.length > 0) setS2(calls[1] || calls[0]);
          if (puts.length > 0) setS5(puts[1] || puts[0]);
        }
      } else {
        const sts = await fetchStrikes(exp, optionType, selectedInstrument);
        setStrikes(sts);
        if (sts.length > 0) {
          if (side === "long") setS1(sts[0]);
          else setS2(sts[1] || sts[0]);
        }
      }
    } catch (e: any) {
      setError(`Couldn't load strike prices: ${e?.message || "unknown error"}`);
    }
    setChartLoading(false);
  };

  // A lot field mid-edit can be "", "-" or garbage — never let that reach the
  // API URL / chart math; fall back to that leg's default.
  const numLot = (v: string, dflt: string) =>
    /^-?\d+$/.test(String(v).trim()) ? String(v).trim() : dflt;

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
          url = `${BASE}/api/historicalChart/getStradleOptionResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&expiryDate=${encodeURIComponent(selectedExpiry)}&callLots=${numLot(callLots, "1")}&putLots=${numLot(putLots, "1")}&callStrikePrice=${s1}&putStrikePrice=${s4}`;
          break;
        case "Spread Chart":
          if (!s1 || !s2) { if (!silent) Alert.alert("Error", "Please select Long and Short strike prices"); setChartLoading(false); return; }
          // Website parity: a spread of the identical leg is rejected up front.
          if ((shortExpiry || selectedExpiry) === (longExpiry || selectedExpiry) && s1 === s2) {
            if (!silent) Alert.alert("Error", "Please select different Strikes or Expiries");
            setChartLoading(false); return;
          }
          url = `${BASE}/api/historicalChart/getSpreadOptionResults?chartType=${encodeURIComponent(chartType)}&optionName=${selectedInstrument}&id=${uid}&optionType=${encodeURIComponent(optionType)}&shortExpiryDate=${encodeURIComponent(shortExpiry || selectedExpiry)}&longExpiryDate=${encodeURIComponent(longExpiry || selectedExpiry)}&shortStrikePrice=${s2}&longStrikePrice=${s1}&shortLots=${numLot(shortLots, "-1")}&longLots=${numLot(longLots, "1")}`;
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
          // Step 2: Tell TradingView to switch symbol. Website parity: rotate
          // which leg is used as the resolve symbol on every submit — TV's
          // setSymbol no-ops when the string is unchanged, so re-submitting
          // with new lots/strikes that share the first leg showed a STALE
          // chart. Cycling legs (the website's `(g+1)%option.length` index)
          // forces a re-resolve + fresh getBars each time.
          const idx = optionSymbols.length > 1
            ? submitCountRef.current % optionSymbols.length
            : 0;
          submitCountRef.current += 1;
          const symbolName = optionSymbols[idx];

          // Field names mirror the website's per-chart form state so the
          // WebView's getChartTypeLots (cVe) reads them 1:1.
          const formData = {
            chartType,
            symbolNames: optionSymbols.join(","),
            selectedSymbol: chartType === "Options Chart" ? optionSymbols[0] : optionSymbols,
            putLots: numLot(putLots, "1"), callLots: numLot(callLots, "1"),
            shortLots: numLot(shortLots, "-1"), longLots: numLot(longLots, "1"),
            lotOne: numLot(bLot1, "1"), lotTwo: numLot(bLot2, "-2"), lotThree: numLot(bLot3, "1"),
            callLotOne: numLot(ifLot1, "1"), callLotTwo: numLot(ifLot2, "-1"),
            putLotOne: numLot(ifLot3, "-1"), putLotTwo: numLot(ifLot4, "1"),
            longCallLot: numLot(dcLongCallLot, "1"), shortCallLot: numLot(dcShortCallLot, "-1"),
            longPutLot: numLot(dcLongPutLot, "1"), shortPutLot: numLot(dcShortPutLot, "-1"),
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
          // Close the config sidebar so the user sees the chart
          if (!silent) setSidebarOpen(false);
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
    // String() guards: strike lists are numbers, and a defensive cast keeps a
    // malformed API entry from crashing the picker.
    const safeData = Array.isArray(data) ? data : [];
    const filtered = searchable
      ? safeData.filter((i: any) => String(i).toLowerCase().includes(search.toLowerCase()))
      : safeData;
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
                  style={[s.pickerItem, String(selected) === String(item) && s.pickerItemActive]}
                  onPress={() => { onSelect(item); onClose(); }}
                  activeOpacity={0.7}
                >
                  {/* String(): strikes arrive as numbers; strict === against the
                      string state missed the checkmark, and rendering is safest
                      through an explicit cast. */}
                  <Text style={[s.pickerItemText, String(selected) === String(item) && s.pickerItemTextActive]}>{String(item)}</Text>
                  {String(selected) === String(item) && <Check size={18} color={c.gold} />}
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

  // Numeric lot field — mirrors the website's per-leg "Lot (...)" inputs.
  const LotInput = ({ label, value, onSet }: any) => (
    <View style={[s.fieldGroup, { flex: 1 }]}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={s.fieldInputText}
        value={value}
        onChangeText={onSet}
        keyboardType="numbers-and-punctuation"
        placeholderTextColor={c.textMuted}
      />
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
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity onPress={() => setRefreshKey((k) => k + 1)} style={s.refreshBtn} activeOpacity={0.7}>
            <RefreshCw size={17} color={c.gold} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSidebarOpen(true)} style={s.configBtn} activeOpacity={0.7}>
            <SlidersHorizontal size={17} color={c.onGold} />
          </TouchableOpacity>
        </View>
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
          // Locked down deliberately. The previous combination — originWhitelist
          // "*", allowUniversalAccessFromFileURLs, allowFileAccessFromFileURLs
          // and mixedContentMode "always", with a native bridge over onMessage —
          // is the WebView misconfiguration pattern Android security scanners
          // flag on sight. None of it was needed: this WebView renders inline
          // HTML under an https baseUrl (never file://), and every resource it
          // loads is HTTPS.
          originWhitelist={CHART_ORIGIN_WHITELIST}
          allowUniversalAccessFromFileURLs={false}
          allowFileAccessFromFileURLs={false}
          mixedContentMode="never"
          onShouldStartLoadWithRequest={isAllowedChartNavigation}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          scalesPageToFit={false}
          scrollEnabled={false}
          androidLayerType="hardware"
          onMessage={handleWebViewMessage}
          onLoadEnd={handleWebViewLoadEnd}
          onError={handleWebViewError}
          // iOS kills the WKWebView content process under memory pressure;
          // without this the chart stays permanently blank. READY handshake
          // re-sends INIT after reload, so recovery is self-healing.
          onContentProcessDidTerminate={() => webRef.current?.reload()}
          onRenderProcessGone={() => webRef.current?.reload()}
        />

        {/* Error toast — shown over the chart when the sidebar is closed */}
        {!!error && !sidebarOpen && (
          <TouchableOpacity
            style={s.chartErrorToast}
            activeOpacity={0.85}
            onPress={() => setSidebarOpen(true)}
          >
            <AlertCircle size={16} color={c.loss} />
            <Text style={s.chartErrorToastText} numberOfLines={2}>{error}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Configure Strategy — slide-in sidebar (like Historical Charts) */}
      <Modal
        visible={sidebarOpen}
        transparent
        animationType="none"
        onRequestClose={() => setSidebarOpen(false)}
      >
        <View style={s.sidebarOverlay}>
          {/* Backdrop (tap to close) */}
          <TouchableOpacity
            style={s.sidebarBackdrop}
            activeOpacity={1}
            onPress={() => setSidebarOpen(false)}
          />
          {/* Sidebar panel */}
          <Animated.View
            style={[
              s.sidebar,
              { width: sidebarWidth, transform: [{ translateX: slideAnim }] },
            ]}
          >
            <View style={[s.sidebarHeader, { paddingTop: insets.top + 14 }]}>
              <Text style={s.sidebarHeaderTitle}>Configure Strategy</Text>
              <TouchableOpacity onPress={() => setSidebarOpen(false)} style={s.modalClose} activeOpacity={0.7}>
                <X size={22} color={c.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ flex: 1, backgroundColor: c.card }}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 + screenBottomGutter }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={s.card}>

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

          {/* Expiry — long/short pickers refetch that side's strikes (website ee/te/Z/J) */}
          {["Spread Chart", "Double Calendar Chart"].includes(chartType) ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <PickExpiry label="Long Expiry" value={longExpiry} onSet={(v: string) => onSideExpiryChange("long", v)} />
              </View>
              <View style={{ flex: 1 }}>
                <PickExpiry label="Short Expiry" value={shortExpiry} onSet={(v: string) => onSideExpiryChange("short", v)} />
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
              {/* Website: StrikePrice 1/Lots 1(+1), 2/Lots 2(-2), 3/Lots 3(+1) */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}><PickStrike label="Strike 1" value={s1} list={strikes} onSet={setS1} /></View>
                <LotInput label="Lots 1" value={bLot1} onSet={setBLot1} />
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}><PickStrike label="Strike 2" value={s2} list={strikes} onSet={setS2} /></View>
                <LotInput label="Lots 2" value={bLot2} onSet={setBLot2} />
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}><PickStrike label="Strike 3" value={s3} list={strikes} onSet={setS3} /></View>
                <LotInput label="Lots 3" value={bLot3} onSet={setBLot3} />
              </View>
            </>
          )}

          {chartType === "Spread Chart" && (
            <>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}><PickStrike label="Long Strike" value={s1} list={strikes} onSet={setS1} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Short Strike" value={s2} list={strikes} onSet={setS2} /></View>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <LotInput label="Lot (Long)" value={longLots} onSet={setLongLots} />
                <LotInput label="Lot (Short)" value={shortLots} onSet={setShortLots} />
              </View>
            </>
          )}

          {chartType === "Iron Fly Chart" && (
            <>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}><PickStrike label="Call Strike 1" value={s1} list={callStrikes} onSet={setS1} /></View>
                <LotInput label="Lots 1" value={ifLot1} onSet={setIfLot1} />
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}><PickStrike label="Call Strike 2" value={s2} list={callStrikes} onSet={setS2} /></View>
                <LotInput label="Lots 2" value={ifLot2} onSet={setIfLot2} />
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}><PickStrike label="Put Strike 1" value={s4} list={putStrikes} onSet={setS4} /></View>
                <LotInput label="Lots 3" value={ifLot3} onSet={setIfLot3} />
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}><PickStrike label="Put Strike 2" value={s5} list={putStrikes} onSet={setS5} /></View>
                <LotInput label="Lots 4" value={ifLot4} onSet={setIfLot4} />
              </View>
            </>
          )}

          {chartType === "Double Calendar Chart" && (
            <>
              {/* Website labels: Short/Long CE Strike, Short/Long PE Strike
                  (s1=short CE, s2=long CE, s4=short PE, s5=long PE) */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}><PickStrike label="Short CE Strike" value={s1} list={callStrikes} onSet={setS1} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Long CE Strike" value={s2} list={callStrikes} onSet={setS2} /></View>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}><PickStrike label="Short PE Strike" value={s4} list={putStrikes} onSet={setS4} /></View>
                <View style={{ flex: 1 }}><PickStrike label="Long PE Strike" value={s5} list={putStrikes} onSet={setS5} /></View>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <LotInput label="Lot (CE Short)" value={dcShortCallLot} onSet={setDcShortCallLot} />
                <LotInput label="Lot (CE Long)" value={dcLongCallLot} onSet={setDcLongCallLot} />
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <LotInput label="Lot (PE Short)" value={dcShortPutLot} onSet={setDcShortPutLot} />
                <LotInput label="Lot (PE Long)" value={dcLongPutLot} onSet={setDcLongPutLot} />
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
          </Animated.View>
        </View>
      </Modal>

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
  configBtn: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: c.gold,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: c.gold,
  },

  // Slide-in sidebar (Configure Strategy)
  sidebarOverlay: {
    flex: 1,
    backgroundColor: c.overlay,
    flexDirection: "row",
  },
  sidebarBackdrop: { flex: 1 },
  sidebar: {
    backgroundColor: c.card,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    backgroundColor: c.surfaceElevated,
  },
  sidebarHeaderTitle: { fontSize: 18, fontWeight: "800", color: c.text, letterSpacing: -0.2 },

  chartContainer: {
    flex: 1,
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
  chartErrorToast: {
    position: "absolute", left: 16, right: 16, bottom: 16, zIndex: 30,
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: c.lossBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: c.loss,
  },
  chartErrorToastText: { color: c.loss, fontWeight: "700", fontSize: 13, flex: 1 },

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
