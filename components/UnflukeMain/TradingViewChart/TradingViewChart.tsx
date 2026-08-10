import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { isAllowedChartNavigation } from '@/helpers/externalLinks';

interface TradingViewChartProps {
  coinId: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ coinId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const symbol = coinId || "NSE:NIFTY";

  const tradingViewWidgetHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            width: 100%;
            height: 100%;
            background: #ffffff;
            overflow: hidden;
          }
          #tradingview_chart {
            width: 100%;
            height: 100%;
          }
          .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #666;
            font-family: sans-serif;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div id="tradingview_chart"><div class="loading">Loading chart...</div></div>
        <script type="text/javascript">
          var scriptTag = document.createElement('script');
          scriptTag.src = 'https://s3.tradingview.com/tv.js';
          scriptTag.onload = function() { initChart(); };
          scriptTag.onerror = function() {
            document.getElementById('tradingview_chart').innerHTML =
              '<div class="loading" style="color:red">Failed to load chart library</div>';
          };
          document.head.appendChild(scriptTag);

          function initChart() {
            if (typeof TradingView === 'undefined') {
              setTimeout(initChart, 300);
              return;
            }
            try {
              new TradingView.widget({
                "width": "100%",
                "height": "100%",
                "symbol": "${symbol}",
                "interval": "D",
                "timezone": "Asia/Kolkata",
                "theme": "light",
                "style": "1",
                "locale": "en",
                "toolbar_bg": "#f1f3f6",
                "enable_publishing": false,
                "allow_symbol_change": true,
                "container_id": "tradingview_chart",
                "hide_side_toolbar": true,
                "hide_top_toolbar": false,
                "save_image": false,
                "studies": []
              });
              // Signal to RN that chart loaded
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('CHART_LOADED');
              }
            } catch (error) {
              document.getElementById('tradingview_chart').innerHTML =
                '<div class="loading" style="color:red">Error loading chart: ' + error.message + '</div>';
            }
          }
        </script>
      </body>
    </html>
  `;

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ Chart failed to load</Text>
        <Text style={styles.errorSub}>Symbol: {symbol}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading chart...</Text>
        </View>
      )}
      <WebView
        originWhitelist={['https://*']}
        source={{ html: tradingViewWidgetHtml }}
        onShouldStartLoadWithRequest={isAllowedChartNavigation}
        style={[styles.webView, isLoading && { opacity: 0 }]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
        allowsInlineMediaPlayback={true}
        allowUniversalAccessFromFileURLs={false}
        allowFileAccessFromFileURLs={false}
        mixedContentMode="never"
        androidLayerType="hardware"
        onMessage={(event) => {
          if (event.nativeEvent.data === 'CHART_LOADED') {
            setIsLoading(false);
          }
        }}
        onLoadEnd={() => {
          // Fallback: hide loader after WebView finishes loading HTML
          setTimeout(() => setIsLoading(false), 2000);
        }}
        onError={(syntheticEvent) => {
          console.error('WebView Error:', syntheticEvent.nativeEvent);
          setHasError(true);
        }}
        onHttpError={(syntheticEvent) => {
          console.error('WebView HTTP Error:', syntheticEvent.nativeEvent);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 340,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 20,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
  errorSub: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});

export default TradingViewChart;
