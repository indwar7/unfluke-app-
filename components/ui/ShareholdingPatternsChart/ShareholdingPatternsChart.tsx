// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import { getShareholdingData } from '../../../constants/Unfluke_helpers/backend_helper';
// import { useWindowDimensions } from "react-native";

// const ShareholdingPatternsChart = ({ company }) => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isConsolidated, setIsConsolidated] = useState(false);

//   useEffect(() => {
//     async function fetchData() {
//       setLoading(true);
//       try {
//         const result = await getShareholdingData({
//           params: {
//             instrument: company,
//             mode: isConsolidated ? 'C' : 'S',
//           },
//         });
//         setData(result || null);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setData(null);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchData();
//   }, [company]);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   if (!data || !data.chart || !data.chart[0]) {
//     return (
//       <View style={styles.noDataContainer}>
//         <Text style={styles.noDataText}>No data available.</Text>
//       </View>
//     );
//   }

//   const tableData = data.table.map((row) => {
//     const date = row['Year & Month'].toString();
//     const month:any = {
//       '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
//       '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
//     }[date.slice(4, 6)];
//     return {
//       date: `${month} ${date.slice(0, 4)}`,
//       promoter: row['PROMOTER %'].toFixed(2),
//       pledge: row['PLEDGE %'].toFixed(2),
//     };
//   });

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.heading}>Promoter Pledging (%)</Text>

//       {tableData.map((item, index) => (
//         <View key={index} style={styles.dataCard}>
//           <Text style={styles.dataDate}>{item.date}</Text>
//           <View style={styles.dataRow}>
//             <Text style={styles.dataLabel}>PROMOTER (%):</Text>
//             <Text style={styles.dataValue}>{item.promoter}</Text>
//           </View>
//           <View style={styles.dataRow}>
//             <Text style={styles.dataLabel}>PLEDGE (%):</Text>
//             <Text style={styles.dataValue}>{item.pledge}</Text>
//           </View>
//         </View>
//       ))}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: 200,
//   },
//   noDataContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   noDataText: {
//     fontSize: 16,
//     color: '#666',
//   },
//   heading: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#333',
//     marginTop:12
//   },
//   dataCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 10,
//     paddingHorizontal: 16,
//     paddingTop:14,
//     paddingBottom:10,
//     marginBottom: 12,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   dataDate: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 10,
//     color: '#0066cc',
//   },
//   dataRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 6,
//   },
//   dataLabel: {
//     fontSize: 12,
//     color: '#333',
//   },
//   dataValue: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#000',
//   },
// });

// export default ShareholdingPatternsChart;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { getShareholdingData } from "../../../constants/Unfluke_helpers/backend_helper";


const ShareholdingPattern = ({ company }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
const { width, height } = useWindowDimensions()

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getShareholdingData({
          params: { capcode: company },
        });
        setData(result || null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [company]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!data || !data["Shareholding Pattern"] || !data["Promoter Pledging %"]) {
    return <Text style={styles.noData}>No data available.</Text>;
  }

  const pieData = data["Shareholding Pattern"];
  const colors = ["#007bff", "#00c0ef", "#3c8dbc", "#f39c12", "#d2d6de"];

  const total =
    (pieData.Promoters || 0) +
    (pieData.FII || 0) +
    (pieData.DII || 0) +
    (pieData["Public & Others"] || 0) +
    (pieData.Others || 0);

  const pieChartData = [
    { name: "Promoters", value: pieData.Promoters, color: colors[0] },
    { name: "FII", value: pieData.FII, color: colors[1] },
    { name: "DII", value: pieData.DII, color: colors[2] },
    {
      name: "Public & Others",
      value: pieData["Public & Others"],
      color: colors[3],
    },
    { name: "Others", value: pieData.Others || 0, color: colors[4] },
  ];

  const formattedPieData = pieChartData.map((item) => ({
    name: item.name,
    population: item.value,
    color: item.color,
    legendFontColor: "#333",
    legendFontSize: 13,
  }));

  const pledgeData = data["Promoter Pledging %"];

  return (
    <ScrollView style={styles.container}>
      {/* Pie Chart */}
      <View style={styles.card}>
        <Text style={styles.title}>Shareholding Pattern</Text>

        <PieChart
          data={formattedPieData}
          width={width + 140}
          height={240}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"10"}
          hasLegend={false}
          center={[0, 0]}
          absolute
        />

        {/* Custom legend below chart */}
        <View style={styles.legendContainer}>
          {formattedPieData.map((item, index) => {
            const percentage = ((item.population / total) * 100).toFixed(1);
            return (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: item.color }]}
                />
                <Text style={styles.legendText}>
                  {item.name} ({percentage}%)
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Table */}
      <View style={styles.card}>
        <Text style={styles.title}>Promoter Pledging %</Text>

        {/* Header Row */}
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, styles.headerCell]}>Date</Text>
          <Text style={[styles.cell, styles.headerCell]}>PROMOTER %</Text>
          <Text style={[styles.cell, styles.headerCell]}>PLEDGE %</Text>
        </View>

        {/* Data Rows */}
        {pledgeData.Date.map((date, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.cell}>{date}</Text>
            <Text style={styles.cell}>
              {pledgeData["PROMOTER %"][index].toFixed(2)}
            </Text>
            <Text style={styles.cell}>
              {pledgeData["PLEDGE %"][index].toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ShareholdingPattern;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
  noData: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#555",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 8,
    marginBottom: 12,
    color: "#111",
  },
  legendContainer: {
    marginTop: 12,
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 6,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: "#333",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 6,
  },
  cell: {
    flex: 1, // ✅ Ensures equal width for all columns
    fontSize: 14,
    color: "#333",
    textAlign: "center", // ✅ Centers text horizontally
  },
  headerCell: {
    fontWeight: "bold",
    color: "#555",
  },
});
