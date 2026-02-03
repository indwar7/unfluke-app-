
// import React, { useEffect, useRef } from "react";
// import { postPayOffChartData } from "../../../Unfluke_helpers/backend_helper";
// import { Chart, registerables } from "chart.js";
// import zoomPlugin from "chartjs-plugin-zoom";
// import { layoutModeTypes } from "../../../components/UnflukeMain/constants/layout";
// import { createSelector } from "reselect";
// import { useSelector } from "react-redux";

// // Register Chart.js components
// Chart.register(...registerables, zoomPlugin);

// const PayoffChart = ({
//     selectedInstrument,
//     currentPrice,
//     positions,
//     updatePNLData,
// }) => {
//     const chartRef = useRef(null);
//     const chartInstance = useRef(null);
//     const originalData = useRef(null);

//     const { layoutMode } = useSelector(
//         createSelector(
//             (state) => state.Layout,
//             (layout) => ({ layoutMode: layout.layoutModeType })
//         )
//     );

//     useEffect(() => {
//         if (!chartRef.current) return;

//         const ctx = chartRef.current.getContext("2d");

//         // Destroy previous chart instance if exists
//         if (chartInstance.current) {
//             chartInstance.current.destroy();
//         }

//         // Create new chart instance
//         chartInstance.current = new Chart(ctx, {
//             type: "line",
//             data: { datasets: [] },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 interaction: {
//                     mode: "index",
//                     intersect: false,
//                 },
//                 plugins: {
//                     legend: {
//                         position: "top",
//                         labels: {
//                             color: layoutMode === layoutModeTypes.LIGHTMODE ? "#333" : "#fff",
//                         },
//                     },
//                     tooltip: {
//                         mode: "index",
//                         intersect: false,
//                         callbacks: {
//                             label: function (context) {
//                                 return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
//                             },
//                         },
//                     },
//                     zoom: {
//                         limits: {
//                             x: { min: 'original', max: 'original' },
//                             y: { min: 'original', max: 'original' },
//                         },
//                         zoom: {
//                             wheel: {
//                                 enabled: true,
//                                 speed: 0.1,
//                             },
//                             pinch: {
//                                 enabled: true,
//                             },
//                             mode: "xy",
//                         },
//                         pan: {
//                             enabled: true,
//                             mode: "xy",
//                             threshold: 10,
//                         },
//                     },
//                 },
//                 scales: {
//                     x: {
//                         type: 'linear',
//                         title: {
//                             display: true,
//                             text: "Underlying Price",
//                             color: layoutMode === layoutModeTypes.LIGHTMODE ? "#333" : "#fff",
//                         },
//                         grid: {
//                             color:
//                                 layoutMode === layoutModeTypes.LIGHTMODE
//                                     ? "rgba(0,0,0,0.1)"
//                                     : "rgba(255,255,255,0.1)",
//                         },
//                         ticks: {
//                             color: layoutMode === layoutModeTypes.LIGHTMODE ? "#333" : "#fff",
//                         },
//                     },
//                     y: {
//                         title: {
//                             display: true,
//                             text: "Profit/Loss",
//                             color: layoutMode === layoutModeTypes.LIGHTMODE ? "#333" : "#fff",
//                         },
//                         grid: {
//                             color:
//                                 layoutMode === layoutModeTypes.LIGHTMODE
//                                     ? "rgba(0,0,0,0.1)"
//                                     : "rgba(255,255,255,0.1)",
//                         },
//                         ticks: {
//                             color: layoutMode === layoutModeTypes.LIGHTMODE ? "#333" : "#fff",
//                         },
//                     },
//                 },
//                 onClick: (e) => {
//                     // Double click reset zoom
//                     if (e.native.detail === 2) {
//                         resetZoom();
//                     }
//                 },
//             },
//         });

//         const fetchChartData = async () => {
//             const minPrice = parseInt(currentPrice - selectedInstrument.multiple * 30);
//             const maxPrice = parseInt(currentPrice + selectedInstrument.multiple * 30);

//             const data = await postPayOffChartData({
//                 minPrice,
//                 maxPrice,
//                 optionsPositions: positions.filter((x) => x.isActive),
//             });

//             if (data) {
//                 originalData.current = data;
//                 if (!chartInstance.current || !data) return;

//                 const prices = data.map((item) => item.price);
//                 const positivePayoffs = data.map((item) =>
//                     item.totalPayoff > 0 ? item.totalPayoff : null
//                 );
//                 const negativePayoffs = data.map((item) =>
//                     item.totalPayoff < 0 ? item.totalPayoff : null
//                 );
//                 const totalPayoffs = data.map((item) => item.totalPayoff);

//                 chartInstance.current.data = {
//                     labels: prices,
//                     datasets: [
//                         {
//                             label: "Positive Payoff",
//                             data: positivePayoffs,
//                             borderColor: "#4CAF50",
//                             backgroundColor: "rgba(76, 175, 80, 0.1)",
//                             borderWidth: 2,
//                             pointRadius: 0,
//                             fill: true,
//                             tension: 0.1,
//                         },
//                         {
//                             label: "Negative Payoff",
//                             data: negativePayoffs,
//                             borderColor: "#F44336",
//                             backgroundColor: "rgba(244, 67, 54, 0.1)",
//                             borderWidth: 2,
//                             pointRadius: 0,
//                             fill: true,
//                             tension: 0.1,
//                         },
//                         {
//                             label: "Total Payoff",
//                             data: totalPayoffs,
//                             borderColor: "#2196F3",
//                             backgroundColor: "transparent",
//                             borderWidth: 2,
//                             borderDash: [5, 5],
//                             pointRadius: 0,
//                             tension: 0.1,
//                         },
//                     ],
//                 };

//                 chartInstance.current.update();

//                 let maxProfit = 0
//                 let maxLoss = 0
//                 let breakevensList = []

//                 if (data) {
//                     const sortedNumbers = [...data].sort((a, b) => a.totalPayoff - b.totalPayoff);
//                     const preparedData = data.map(item => {

//                         if (item.totalPayoff <= positions[0].lotSize && item.totalPayoff > 0) {
//                             breakevensList.push(item.price)
//                         }

//                         if (item.totalPayoff > maxProfit) {
//                             maxProfit = item.totalPayoff
//                         } else if (item.totalPayoff < maxLoss) {
//                             maxLoss = item.totalPayoff
//                         }
//                         return {
//                             price: item.price,
//                             payoff: item.totalPayoff,
//                             positivePayoff: item.totalPayoff > 0 ? item.totalPayoff : 0,
//                             negativePayoff: item.totalPayoff < 0 ? item.totalPayoff : 0,
//                         }
//                     });

//                     const minNumbers = sortedNumbers.slice(0, 2);
//                     const maxNumbers = sortedNumbers.slice(-2);
//                     console.log(minNumbers, maxNumbers);

//                     // Set Max Loss
//                     if (data[0].totalPayoff === data[1].totalPayoff && data[0].totalPayoff < 0 || data[data.length - 1].totalPayoff === data[data.length - 2].totalPayoff && data[data.length - 1].totalPayoff < 0) {
//                         maxLoss = minNumbers[0].totalPayoff
//                     }
//                     if (data[0].totalPayoff !== data[1].totalPayoff && data[0].totalPayoff < 0 || data[data.length - 1].totalPayoff !== data[data.length - 2].totalPayoff && data[data.length - 1].totalPayoff < 0) {
//                         maxLoss = "Unlimited"
//                     }

//                     // Set Max Profit
//                     if (data[0].totalPayoff === data[1].totalPayoff && data[0].totalPayoff > 0 || data[data.length - 1].totalPayoff === data[data.length - 2].totalPayoff && data[data.length - 1].totalPayoff > 0) {
//                         maxProfit = maxNumbers[0].totalPayoff
//                     }
//                     if (data[0].totalPayoff !== data[1].totalPayoff && data[0].totalPayoff > 0 || data[data.length - 1].totalPayoff !== data[data.length - 2].totalPayoff && data[data.length - 1].totalPayoff > 0) {
//                         maxProfit = "Unlimited"
//                     }
//                 }
//                 console.log("asdfsdf",maxLoss)
//                 updatePNLData(maxLoss, maxProfit, breakevensList);
//             }
//         };

//         fetchChartData();

//         return () => {
//             if (chartInstance.current) {
//                 chartInstance.current.destroy();
//             }
//         };
//     }, [positions, currentPrice, layoutMode]);


//     const resetZoom = () => {
//         if (chartInstance.current) {
//             chartInstance.current.resetZoom();
//             // Force update to ensure proper rendering
//             setTimeout(() => {
//                 chartInstance.current.update();
//             }, 100);
//         }
//     };

//     return (
//         <div
//             className={`relative w-full h-[500px] p-4 rounded-lg border ${layoutMode === layoutModeTypes.LIGHTMODE
//                 ? 'bg-white border-gray-200'
//                 : 'bg-gray-900 border-gray-700'
//                 }`}
//         >
//             <button
//                 onClick={resetZoom}
//                 className={`absolute right-5 top-5 z-10 px-3 py-2 text-sm font-medium rounded-md shadow ${layoutMode === layoutModeTypes.LIGHTMODE
//                     ? 'bg-blue-500 text-white'
//                     : 'bg-gray-600 text-white'
//                     }`}
//             >
//                 Reset Zoom
//             </button>

//             <canvas
//                 ref={chartRef}
//                 className="w-full h-full cursor-default"
//             />
//         </div>
//     );

// };

// export default PayoffChart;





















import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTheme,
  VictoryZoomContainer,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryLabel,
  VictoryLegend,
} from "victory-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { postPayOffChartData } from "../../../Unfluke_helpers/backend_helper";
import { layoutModeTypes } from "../../../components/UnflukeMain/constants/layout";


const PayoffChart = ({
  selectedInstrument,
  currentPrice,
  positions,
  updatePNLData,
}) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomDomain, setZoomDomain] = useState(null);
  const originalDomain = useRef(null);

const { width: screenWidth } = useWindowDimensions();

  const { layoutMode } = useSelector(
    createSelector(
      (state) => state.Layout,
      (layout) => ({ layoutMode: layout.layoutModeType })
    )
  );

  const isDarkMode = layoutMode === layoutModeTypes.DARKMODE;

  // Theme colors
  const colors = {
    background: isDarkMode ? "#1F2937" : "#FFFFFF",
    border: isDarkMode ? "#374151" : "#E5E7EB",
    text: isDarkMode ? "#FFFFFF" : "#333333",
    grid: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    positive: "#4CAF50",
    negative: "#F44336",
    total: "#2196F3",
    buttonBg: isDarkMode ? "#4B5563" : "#3B82F6",
    buttonText: "#FFFFFF",
  };

  useEffect(() => {
    fetchChartData();
  }, [positions, currentPrice, selectedInstrument]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const minPrice = parseInt(
        currentPrice - selectedInstrument.multiple * 30
      );
      const maxPrice = parseInt(
        currentPrice + selectedInstrument.multiple * 30
      );

      const data = await postPayOffChartData({
        minPrice,
        maxPrice,
        optionsPositions: positions.filter((x) => x.isActive),
      });

      if (data && data.length > 0) {
        processChartData(data);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data) => {
    let maxProfit = 0;
    let maxLoss = 0;
    let breakevensList = [];

    const positiveData = [];
    const negativeData = [];
    const totalData = [];

    data.forEach((item) => {
      const point = { x: item.price, y: item.totalPayoff };

      // Check for breakeven points
      if (
        item.totalPayoff <= positions[0].lotSize &&
        item.totalPayoff > 0
      ) {
        breakevensList.push(item.price);
      }

      // Track max profit/loss
      if (item.totalPayoff > maxProfit) {
        maxProfit = item.totalPayoff;
      } else if (item.totalPayoff < maxLoss) {
        maxLoss = item.totalPayoff;
      }

      // Separate positive and negative payoffs
      if (item.totalPayoff > 0) {
        positiveData.push(point);
        negativeData.push({ x: item.price, y: null });
      } else if (item.totalPayoff < 0) {
        negativeData.push(point);
        positiveData.push({ x: item.price, y: null });
      } else {
        positiveData.push({ x: item.price, y: 0 });
        negativeData.push({ x: item.price, y: 0 });
      }

      totalData.push(point);
    });

    // Calculate unlimited profit/loss
    const sortedNumbers = [...data].sort(
      (a, b) => a.totalPayoff - b.totalPayoff
    );
    const minNumbers = sortedNumbers.slice(0, 2);
    const maxNumbers = sortedNumbers.slice(-2);

    // Set Max Loss
    if (
      (data[0].totalPayoff === data[1].totalPayoff &&
        data[0].totalPayoff < 0) ||
      (data[data.length - 1].totalPayoff === data[data.length - 2].totalPayoff &&
        data[data.length - 1].totalPayoff < 0)
    ) {
      maxLoss = minNumbers[0].totalPayoff;
    }
    if (
      (data[0].totalPayoff !== data[1].totalPayoff &&
        data[0].totalPayoff < 0) ||
      (data[data.length - 1].totalPayoff !== data[data.length - 2].totalPayoff &&
        data[data.length - 1].totalPayoff < 0)
    ) {
      maxLoss = "Unlimited";
    }

    // Set Max Profit
    if (
      (data[0].totalPayoff === data[1].totalPayoff &&
        data[0].totalPayoff > 0) ||
      (data[data.length - 1].totalPayoff === data[data.length - 2].totalPayoff &&
        data[data.length - 1].totalPayoff > 0)
    ) {
      maxProfit = maxNumbers[0].totalPayoff;
    }
    if (
      (data[0].totalPayoff !== data[1].totalPayoff &&
        data[0].totalPayoff > 0) ||
      (data[data.length - 1].totalPayoff !== data[data.length - 2].totalPayoff &&
        data[data.length - 1].totalPayoff > 0)
    ) {
      maxProfit = "Unlimited";
    }

    // Set initial domain
    const xMin = Math.min(...data.map((d) => d.price));
    const xMax = Math.max(...data.map((d) => d.price));
    const yMin = Math.min(...data.map((d) => d.totalPayoff));
    const yMax = Math.max(...data.map((d) => d.totalPayoff));

    originalDomain.current = {
      x: [xMin, xMax],
      y: [yMin * 1.1, yMax * 1.1], // Add 10% padding
    };

    setZoomDomain(originalDomain.current);

    setChartData({
      positiveData,
      negativeData,
      totalData,
    });

    updatePNLData(maxLoss, maxProfit, breakevensList);
  };

  const resetZoom = () => {
    setZoomDomain({ ...originalDomain.current });
  };

  const handleZoom = (domain) => {
    setZoomDomain(domain);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.total} />
      </View>
    );
  }

  if (!chartData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          No data available
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Reset Zoom Button */}
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.buttonBg }]}
          onPress={resetZoom}
        >
          <Text style={[styles.resetButtonText, { color: colors.buttonText }]}>
            Reset Zoom
          </Text>
        </TouchableOpacity>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: colors.positive }]}
            />
            <Text style={[styles.legendText, { color: colors.text }]}>
              Positive Payoff
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: colors.negative }]}
            />
            <Text style={[styles.legendText, { color: colors.text }]}>
              Negative Payoff
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: colors.total, borderStyle: "dashed" },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.text }]}>
              Total Payoff
            </Text>
          </View>
        </View>

        {/* Chart */}
        <VictoryChart
          theme={VictoryTheme.material}
          width={screenWidth - 32}
          height={450}
          domain={zoomDomain}
          padding={{ top: 20, bottom: 60, left: 60, right: 40 }}
          containerComponent={
            <VictoryZoomContainer
              responsive={false}
              zoomDimension="xy"
              zoomDomain={zoomDomain}
              onZoomDomainChange={handleZoom}
              minimumZoom={{ x: 10, y: 10 }}
            />
          }
        >
          {/* X Axis */}
          <VictoryAxis
            label="Underlying Price"
            style={{
              axis: { stroke: colors.grid },
              axisLabel: {
                fontSize: 14,
                padding: 35,
                fill: colors.text,
              },
              ticks: { stroke: colors.grid, size: 5 },
              tickLabels: {
                fontSize: 12,
                padding: 5,
                fill: colors.text,
              },
              grid: { stroke: colors.grid, strokeWidth: 0.5 },
            }}
          />

          {/* Y Axis */}
          <VictoryAxis
            dependentAxis
            label="Profit/Loss"
            style={{
              axis: { stroke: colors.grid },
              axisLabel: {
                fontSize: 14,
                padding: 45,
                fill: colors.text,
              },
              ticks: { stroke: colors.grid, size: 5 },
              tickLabels: {
                fontSize: 12,
                padding: 5,
                fill: colors.text,
              },
              grid: { stroke: colors.grid, strokeWidth: 0.5 },
            }}
          />

          {/* Positive Payoff Area */}
          <VictoryArea
            data={chartData.positiveData}
            style={{
              data: {
                fill: colors.positive,
                fillOpacity: 0.1,
                stroke: colors.positive,
                strokeWidth: 2,
              },
            }}
            interpolation="linear"
          />

          {/* Negative Payoff Area */}
          <VictoryArea
            data={chartData.negativeData}
            style={{
              data: {
                fill: colors.negative,
                fillOpacity: 0.1,
                stroke: colors.negative,
                strokeWidth: 2,
              },
            }}
            interpolation="linear"
          />

          {/* Total Payoff Line (Dashed) */}
          <VictoryLine
            data={chartData.totalData}
            style={{
              data: {
                stroke: colors.total,
                strokeWidth: 2,
                strokeDasharray: "5,5",
              },
            }}
            interpolation="linear"
            labels={({ datum }) => `${datum.y.toFixed(2)}`}
            labelComponent={
              <VictoryTooltip
                renderInPortal={false}
                flyoutStyle={{
                  fill: isDarkMode ? "#374151" : "#FFFFFF",
                  stroke: colors.border,
                }}
                style={{
                  fill: colors.text,
                  fontSize: 10,
                }}
              />
            }
          />

          {/* Zero line */}
          <VictoryLine
            data={[
              { x: zoomDomain?.x?.[0] || 0, y: 0 },
              { x: zoomDomain?.x?.[1] || 0, y: 0 },
            ]}
            style={{
              data: {
                stroke: colors.text,
                strokeWidth: 1,
                strokeDasharray: "2,2",
                opacity: 0.5,
              },
            }}
          />
        </VictoryChart>

        {/* Instructions */}
        <Text style={[styles.instructionText, { color: colors.text }]}>
          Pinch to zoom • Drag to pan • Double tap to reset
        </Text>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    minHeight: 500,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  resetButton: {
    position: "absolute",
    right: 20,
    top: 20,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 40,
    marginBottom: 10,
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  legendColor: {
    width: 20,
    height: 3,
    marginRight: 6,
    borderRadius: 1,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
  },
  instructionText: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 8,
    opacity: 0.7,
    fontStyle: "italic",
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
  },
});

export default PayoffChart;