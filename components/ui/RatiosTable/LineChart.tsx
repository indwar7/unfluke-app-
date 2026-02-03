// import React from 'react';
// import { View, StyleSheet, Text } from 'react-native';
// import { LineChart } from 'react-native-chart-kit';
// import { Dimensions } from 'react-native';
// import { useWindowDimensions } from "react-native";

// const LineChartComponent = ({ title, categories, data }) => {
//   const lineColor = '#4285F4'; // Main line color (blue)
//   const patternColor = '#ADD8E6'; // Pattern color (light blue)
  
//   console.log("data is here aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",data, categories)
// //   const maxValue = Math.ceil(Math.max(...data));
// //   const minValue = Math.floor(Math.min(...data));
//   // Convert data to format expected by react-native-chart-kit
//   const chartData = {
//     labels: categories.map(val => String(val).slice(-4)),
//     datasets: [
//       {
//         data: data,
//         color: (opacity = 1) => lineColor,
//         strokeWidth: 2
//       }
//     ],
//     legend: [title]
//   };

//   const chartConfig = {
//     backgroundColor: '#ffffff',
//     backgroundGradientFrom: '#ffffff',
//     backgroundGradientTo: '#ffffff',
//     decimalPlaces: 2,
//     color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//     labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//     style: {
//       borderRadius: 16
//     },
//     propsForDots: {
//       r: '3',
//       strokeWidth: '2',
//       stroke: lineColor
//     },
//     fillShadowGradient: lineColor,
//     fillShadowGradientOpacity: 0.2,
//     propsForBackgroundLines: {
//       strokeWidth: 0.5,
//       strokeDasharray: '5,5',
//       stroke: '#e0e0e0'
//     },
//     propsForLabels: {
//       fontSize: 9, // Smaller font size for labels
//       fontWeight: 'bold'
//     },
//     propsForVerticalLabels: {
//       rotation: -45, // Tilt labels 45 degrees to the left
//       fontSize: 9,
//       fontWeight: 'bold'
//     },
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.chartTitle}>{title}</Text>
//       <LineChart
//         data={chartData}
//         width={useWindowDimensions().width-68}
//         height={220} // Reduced height
//         chartConfig={chartConfig}
//         bezier
//         style={styles.chart}
//         withVerticalLines={false}
//         withHorizontalLines={false}
//         withDots={true}
//         withShadow={true}
//         withInnerLines={false}
//         withOuterLines={false}
//         fromZero={false}
//         segments={4} // Control number of horizontal lines
//         formatYLabel={(value) => `${value}%`} // Add % sign to Y values
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: 'white',
//     marginBottom: 10,
//     paddingVertical:10,
//     borderRadius: 12,
//     borderWidth:1,
//     borderColor:"#E0E0E0",
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 3,
//     flexDirection:"column",
//     alignItems:"center",
//     justifyContent:"center",
//   },
//   chart: {
//     borderRadius: 12,
//   },
//   chartTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: '#333',
//     textAlign: 'center'
//   }
// });

// export default LineChartComponent;









import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useWindowDimensions } from "react-native";

const LineChartComponent = ({ title, categories, data }) => {
  const lineColor = '#4285F4';

  console.log("data is here", data, categories);

  // Calculate equally spaced indices for max 10 labels
  const getEquallySpacedIndices = (totalItems, maxLabels = 10) => {
    const labelsToShow = Math.min(maxLabels, totalItems);
    const indices = [];
    
    if (labelsToShow === totalItems) {
      // Show all if total items <= maxLabels
      for (let i = 0; i < totalItems; i++) {
        indices.push(i);
      }
    } else {
      // Calculate equal spacing
      const step = (totalItems - 1) / (labelsToShow - 1);
      for (let i = 0; i < labelsToShow; i++) {
        indices.push(Math.round(i * step));
      }
    }
    
    return indices;
  };

  const selectedIndices = getEquallySpacedIndices(categories.length, 10);

  // Create labels array with empty strings except for selected indices
  const getFilteredLabels = (categories, selectedIndices) => {
    return categories.map((val, index) => {
      if (selectedIndices.includes(index)) {
        return String(val).slice(-4); // Show year (last 4 characters)
      }
      return ''; // Empty string for non-selected
    });
  };

  const chartData = {
    labels: getFilteredLabels(categories, selectedIndices),
    datasets: [
      {
        data: data,
        color: (opacity = 1) => lineColor,
        strokeWidth: 2
      }
    ],
    legend: [title]
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '3',
      strokeWidth: '2',
      stroke: lineColor
    },
    fillShadowGradient: lineColor,
    fillShadowGradientOpacity: 0.2,
    propsForBackgroundLines: {
      strokeWidth: 0.5,
      strokeDasharray: '5,5',
      stroke: '#e0e0e0'
    },
    propsForLabels: {
      fontSize: 9,
      fontWeight: 'bold'
    },
    propsForVerticalLabels: {
      rotation: -45,
      fontSize: 9,
      fontWeight: 'bold'
    },
  };

  // Custom function to hide dots except for selected indices
  const getDotProps = (dataPoint, index) => {
    if (selectedIndices.includes(index)) {
      return {
        r: '4',
        strokeWidth: '2',
        stroke: lineColor,
        fill: '#ffffff'
      };
    }
    // Hide dot by making it transparent and very small
    return {
      r: '0',
      strokeWidth: '0',
      stroke: 'transparent',
      fill: 'transparent'
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>{title}</Text>
      <LineChart
        data={chartData}
        width={useWindowDimensions().width - 68}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withVerticalLines={false}
        withHorizontalLines={false}
        withDots={true}
        withShadow={true}
        withInnerLines={false}
        withOuterLines={false}
        fromZero={false}
        segments={4}
        formatYLabel={(value) => `${value}%`}
        getDotProps={getDotProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginBottom: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  chart: {
    borderRadius: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center'
  }
});

export default LineChartComponent;
