import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSelector } from "reselect";
import Watchlist from "./Watchlist";
import SidebarModal from "./WatchListModal";

const BASE = "https://api.unfluke.in";
const DEFAULT_SYMBOL = "NSE:NIFTY 50";

function sendToWebView(webRef: React.RefObject<WebView>, msgObj: any) {
  const json = JSON.stringify(JSON.stringify(msgObj));
  webRef.current?.injectJavaScript(`handleMsg(${json}); true;`);
}

function buildHistoricalChartHTML(): string {
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:100%;height:100%;overflow:hidden;background:#fff;}
#tv_chart_container{width:100%;height:100%;}
</style>
</head><body>
<div id="tv_chart_container"></div>
<script src="https://unfluke.in/charting_library/charting_library.standalone.js"><\/script>
<script>
var AUTH = { token: '', userId: '', mrkt: '' };
var HIST_STATE = { currentDateTime: '', symbol: '${DEFAULT_SYMBOL}' };
var tvWidget = null;
var chartCreated = false;
var fullName = undefined;
var cachedBars = [];
var data = false;
var data2 = undefined;
var timeframe = '1';
var description = 'NSE';
var prevDateTime = '';
var pendingRequests = {};
var reqCounter = 0;

function apiFetch(url) {
  return new Promise(function(resolve, reject) {
    var id = ++reqCounter;
    pendingRequests[id] = { resolve: resolve, reject: reject };
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'API_REQUEST', id: id, url: url
      }));
    } else {
      reject(new Error('No ReactNativeWebView'));
    }
    setTimeout(function() {
      if (pendingRequests[id]) {
        delete pendingRequests[id];
        reject(new Error('Request timeout'));
      }
    }, 30000);
  });
}

function handleApiResponse(id, responseData, error) {
  var pending = pendingRequests[id];
  if (!pending) return;
  delete pendingRequests[id];
  if (error) { pending.reject(new Error(error)); }
  else { pending.resolve(responseData); }
}

function reformatDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return '';
  var parts = dateString.split(', ');
  if (parts.length < 2) return dateString;
  var datePart = parts[0].split('/');
  if (datePart.length < 3) return dateString;
  return datePart[2] + '-' + datePart[1] + '-' + datePart[0] + ' ' + parts[1];
}

var Datafeed = {
  onReady: function(cb) {
    setTimeout(function() {
      cb({ supported_resolutions: ['1','3','5','15','30','60','120','240','1440'] });
    }, 0);
  },
  searchSymbols: function(input, exchange, type, cb) { cb([]); },
  resolveSymbol: function(symbolName, onResolve, onError) {
    var lookupName = symbolName;
    if (lookupName.indexOf(':') === -1) {
      lookupName = 'NSE:' + lookupName;
    }
    apiFetch('${BASE}/api/historicData/getInstrument?instrument=' + encodeURIComponent(lookupName))
    .then(function(item) {
      if (!item || item.Error) {
        onError('No symbol found'); return;
      }
      var name, ticker, type, exchange;
      if (item.type === 'EQ') { name=item.equity; type='equity'; exchange='NSE'; ticker=item.equity; }
      else if (item.type === 'IN') { name=item.index; type='index'; exchange='NSE'; ticker=item.index; }
      else if (item.type === 'OPT') { name=item.option; type='option'; exchange='NFO'; ticker=item.option; }
      else if (item.type === 'FUT') { name=item.future; type='future'; exchange='NFO'; ticker=item.future; }
      else {
        if (item.equity) { name=item.equity; type='equity'; exchange='NSE'; ticker=item.equity; }
        else if (item.index) { name=item.index; type='index'; exchange='NSE'; ticker=item.index; }
        else if (item.option) { name=item.option; type='option'; exchange='NFO'; ticker=item.option; }
        else if (item.future) { name=item.future; type='future'; exchange='NFO'; ticker=item.future; }
        else { onError('Unknown symbol type'); return; }
      }
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
        supported_resolutions: ['1','3','5','15','30','60','120','240','1440'],
        data_status: 'endofday',
      };
      setTimeout(function() { onResolve(stub); }, 0);
    })
    .catch(function(err) { onError(err.message); });
  },

  getBars: function(symbolInfo, resolution, periodParams, onResult, onError) {
    var first = periodParams.firstDataRequest;
    var from = periodParams.from;
    var to = periodParams.to;
    var id = AUTH.userId;

    var useCurrentTime = (fullName !== symbolInfo.full_name) || (prevDateTime === HIST_STATE.currentDateTime);
    var dateObj = useCurrentTime ? new Date() : (HIST_STATE.currentDateTime ? new Date(HIST_STATE.currentDateTime.replace(' ', 'T')) : new Date());
    var options = { timeZone:'Asia/Kolkata', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' };
    var currentDateTime = reformatDate(new Intl.DateTimeFormat('en-GB', options).format(dateObj));

    if (timeframe != resolution || description != symbolInfo.description || prevDateTime != currentDateTime) {
      timeframe = resolution;
      description = symbolInfo.description;
      data = false;
      fullName = undefined;
      data2 = undefined;
      prevDateTime = currentDateTime;
    }

    if (symbolInfo.type === 'option') {
      var currDate = Math.floor(new Date(currentDateTime).getTime()) / 1000;
      var someMonthsPrev = currDate - 8919000;
      if (from <= someMonthsPrev || to <= someMonthsPrev) {
        onResult([], { noData: true }); return;
      }
    } else {
      if (from <= 1220085397 || to <= 1220085397) {
        onResult([], { noData: true }); return;
      }
    }

    var url = '${BASE}/api/historicData/data/histoTradingminute';
    var params = 'i='+id+'&e='+encodeURIComponent(symbolInfo.instrument_token)
      +'&currentDateTime='+encodeURIComponent(currentDateTime)
      +'&type='+symbolInfo.type+'&name='+encodeURIComponent(symbolInfo.name)
      +'&resolution='+resolution;

    if (!(data && fullName === symbolInfo.full_name)) {
      fullName = symbolInfo.full_name;
      apiFetch(url + '?' + params + '&nxt=false')
      .then(function(result) {
        data = result;
        if (data && data.Response === 'Error') { onResult([], { noData: true }); return; }
        if (!data || !Array.isArray(data) || data.length === 0) { onResult([], { noData: true }); return; }
        cachedBars = data.map(function(el) {
          return { time: new Date(el.a).getTime(), low: Number(el.b), high: Number(el.c), open: Number(el.d), close: Number(el.e), volume: Number(el.f) };
        });
        onResult(cachedBars, { noData: false });
      })
      .catch(function(err) { onResult([], { noData: true }); });
    } else {
      if (symbolInfo.type === 'option') {
        onResult(cachedBars, { noData: false });
        return;
      }
      apiFetch(url + '?' + params + '&nxt=true')
      .then(function(result) {
        data2 = result;
        if (data2 && Array.isArray(data2) && data2.length > 0) {
          data = data2.concat(data);
          cachedBars = data.map(function(el) {
            return { time: new Date(el.a).getTime(), low: Number(el.b), high: Number(el.c), open: Number(el.d), close: Number(el.e), volume: Number(el.f) };
          });
          onResult(cachedBars, { noData: false });
        } else {
          onResult(cachedBars, { noData: false });
        }
      })
      .catch(function() { onResult(cachedBars, { noData: false }); });
    }
  },
  subscribeBars: function(symbolInfo, resolution, onTick, uid, onReset) {
    if (onReset) onReset();
  },
  unsubscribeBars: function(uid) {},
  calculateHistoryDepth: function() {},
  getMarks: function() {},
  getTimeScaleMarks: function() {},
  getServerTime: function() {},
};

function createChart() {
  if (chartCreated) return;
  if (typeof TradingView === 'undefined' || !TradingView.widget) {
    setTimeout(createChart, 500); return;
  }
  if (!AUTH.userId) {
    setTimeout(createChart, 500); return;
  }
  chartCreated = true;
  tvWidget = new TradingView.widget({
    symbol: HIST_STATE.symbol || '${DEFAULT_SYMBOL}',
    datafeed: Datafeed,
    interval: '1',
    container: 'tv_chart_container',
    library_path: 'https://unfluke.in/charting_library/',
    locale: 'en',
    disabled_features: ['use_localstorage_for_settings'],
    enabled_features: ['study_templates','fix_left_edge','side_toolbar_in_fullscreen_mode','header_in_fullscreen_mode'],
    charts_storage_url: 'https://saveload.tradingview.com',
    charts_storage_api_version: '1.1',
    client_id: 'tradingview.com',
    user_id: AUTH.userId || 'public_user_id',
    fullscreen: false,
    autosize: true,
    studies_overrides: {},
    timezone: 'Asia/Kolkata',
    theme: 'Light',
    debug: false,
  });

  tvWidget.onChartReady(function() {
    tvWidget.activeChart().setChartType(1);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOADED' }));
  });
}

function handleMsg(raw) {
  try {
    var msg = (typeof raw === 'string') ? JSON.parse(raw) : raw;
    if (msg.type === 'INIT') {
      AUTH.token = msg.token || '';
      AUTH.userId = msg.userId || '';
      AUTH.mrkt = msg.mrkt || '';
      HIST_STATE.symbol = msg.symbol || '${DEFAULT_SYMBOL}';
      createChart();
    } else if (msg.type === 'API_RESPONSE') {
      handleApiResponse(msg.id, msg.data, msg.error);
    } else if (msg.type === 'SET_SYMBOL') {
      HIST_STATE.symbol = msg.symbol || '${DEFAULT_SYMBOL}';
      data = false;
      fullName = undefined;
      data2 = undefined;
      prevDateTime = '';
      if (tvWidget && tvWidget.activeChart) {
        try {
          tvWidget.activeChart().setSymbol(msg.symbol, function() {
            tvWidget.activeChart().setChartType(1);
          });
        } catch(e) {}
      }
    } else if (msg.type === 'RESET_DATA') {
      data = false;
      fullName = undefined;
      data2 = undefined;
      prevDateTime = '';
      if (tvWidget && tvWidget._ready) {
        try {
          tvWidget.activeChart().resetData();
          tvWidget.activeChart().resetData();
        } catch(e) {}
      }
    }
  } catch(e) {}
}

document.addEventListener('message', function(e) { handleMsg(e.data); });
window.addEventListener('message', function(e) {
  if (typeof e.data === 'string') handleMsg(e.data);
});

if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
<\/script>
</body></html>`;
}

const authSelector = createSelector(
  (state: any) => state.Login,
  (data: any) => data.user,
);

const Trading = () => {
  const insets = useSafeAreaInsets();
  // @ts-ignore
  const selectedStock = useSelector((state) => state?.GlobalStock?.selectedStock);
  const user = useSelector(authSelector);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chartReady, setChartReady] = useState(false);

  const webRef = useRef<WebView>(null);
  const tokenRef = useRef<string | null>(null);
  const mrktRef = useRef<string | null>(null);
  const initSentRef = useRef(false);
  const lastSymbolSentRef = useRef(DEFAULT_SYMBOL);

  const [displaySymbol, setDisplaySymbol] = useState("NIFTY 50");

  useEffect(() => {
    (async () => {
      tokenRef.current = await AsyncStorage.getItem("access");
      mrktRef.current = await AsyncStorage.getItem("mkt");
    })();
  }, []);

  const handleApiRequest = useCallback(async (id: number, url: string) => {
    try {
      if (!tokenRef.current) tokenRef.current = await AsyncStorage.getItem("access");
      if (!mrktRef.current) mrktRef.current = await AsyncStorage.getItem("mkt");

      const headers: any = {};
      if (tokenRef.current) headers["Authorization"] = `Bearer ${tokenRef.current}`;
      if (mrktRef.current) headers["mrkt"] = mrktRef.current;

      const resp = await fetch(url, { headers });
      const data = await resp.json();
      sendToWebView(webRef, { type: "API_RESPONSE", id, data });
    } catch (e: any) {
      sendToWebView(webRef, { type: "API_RESPONSE", id, data: null, error: e.message });
    }
  }, []);

  const sendInit = useCallback(async () => {
    if (initSentRef.current) return;
    if (!webRef.current) return;

    let userId = user?._id;
    if (!userId) {
      try {
        const userStr = await AsyncStorage.getItem("authUser");
        if (userStr) {
          const u = JSON.parse(userStr);
          userId = u._id || u.id;
        }
      } catch {}
    }

    if (!userId) {
      setTimeout(() => sendInit(), 1000);
      return;
    }

    try {
      if (!tokenRef.current) tokenRef.current = await AsyncStorage.getItem("access");
      if (!mrktRef.current) mrktRef.current = await AsyncStorage.getItem("mkt");

      initSentRef.current = true;
      sendToWebView(webRef, {
        type: "INIT",
        token: tokenRef.current || "",
        userId: userId,
        mrkt: mrktRef.current || "",
        symbol: DEFAULT_SYMBOL,
      });
    } catch (e: any) {
      initSentRef.current = false;
    }
  }, [user?._id]);

  // When selected stock changes from watchlist, update chart
  useEffect(() => {
    if (!initSentRef.current || !webRef.current || !selectedStock?.symbol) return;
    const raw = selectedStock.symbol;
    const sym = raw.includes(":") ? raw : `NSE:${raw}`;
    if (sym === lastSymbolSentRef.current) return;
    lastSymbolSentRef.current = sym;
    setDisplaySymbol(sym.replace(/^NSE:/, "").replace(/^BSE:/, ""));
    sendToWebView(webRef, { type: "SET_SYMBOL", symbol: sym });
  }, [selectedStock?.symbol]);

  const chartHTML = buildHistoricalChartHTML();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerTitle}>Historical Charts</Text>
          <Text style={styles.headerSub}>{displaySymbol}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => {
              initSentRef.current = false;
              lastSymbolSentRef.current = "";
              setChartReady(false);
            }}
            style={styles.refreshBtn}
          >
            <Ionicons name="refresh" size={18} color="#4f46e5" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSidebarOpen(true)}
            style={styles.refreshBtn}
          >
            <Ionicons name="list" size={18} color="#4f46e5" />
          </TouchableOpacity>
        </View>
      </View>

      {/* TradingView Chart */}
      <View style={styles.chartContainer}>
        {!chartReady && (
          <View style={styles.chartLoader}>
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text style={styles.chartLoaderText}>Loading TradingView...</Text>
          </View>
        )}
        <WebView
          ref={webRef}
          source={{ html: chartHTML, baseUrl: "https://unfluke.in" }}
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
          onMessage={(e) => {
            try {
              const parsed = JSON.parse(e.nativeEvent.data);
              if (parsed.type === "READY") {
                sendInit();
              } else if (parsed.type === "LOADED") {
                setChartReady(true);
              } else if (parsed.type === "API_REQUEST") {
                handleApiRequest(parsed.id, parsed.url);
              }
            } catch {}
          }}
          onLoadEnd={() => {
            // Fallback if READY message wasn't received
            setTimeout(() => sendInit(), 3000);
            setTimeout(() => setChartReady(true), 15000);
          }}
          onError={() => setChartReady(true)}
        />
      </View>

      {/* Watchlist - commented out per manager request */}
      {/* <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Watchlist />
        </View>
      </ScrollView> */}

      <SidebarModal sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  headerSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  chartContainer: {
    flex: 1,
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
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
});

export default Trading;
