import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface TradingViewChartProps {
  coinId: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ coinId }) => {
  const tradingViewWidgetHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            background: #ffffff;
            overflow: hidden;
          }
          #tradingview_chart { 
            width: 100vw; 
            height: 100vh; 
          }
        </style>
      </head>
      <body>
        <div id="tradingview_chart"></div>
        <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
        <script type="text/javascript">
          function initChart() {
            try {
              new TradingView.widget({
                "width": "100%",
                "height": "100vh",
                "symbol": "${coinId}:IND",
                "interval": "1D",
                "timezone": "Asia/Kolkata",
                "theme": "light",
                "style": "1",
                "locale": "en",
                "toolbar_bg": "#f1f3f6",
                "enable_publishing": false,
                "allow_symbol_change": true,
                "container_id": "tradingview_chart",
                "hide_side_toolbar": false,
                "hide_top_toolbar": false,
                "studies": [],
                "show_popup_button": true,
                "popup_width": "1000",
                "popup_height": "650",
                "autosize": true
              });
            } catch (error) {
              console.error('TradingView initialization error:', error);
            }
          }
          
          // Wait for TradingView library to load
          if (typeof TradingView !== 'undefined') {
            initChart();
          } else {
            window.addEventListener('load', initChart);
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: tradingViewWidgetHtml }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        bounces={false}
        allowsInlineMediaPlayback={true}
        mixedContentMode="compatibility"
        onError={(error) => console.error('WebView Error:', error)}
        onLoad={() => console.log('WebView loaded')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webView: {
    flex: 1,
  },
});

export default TradingViewChart;

