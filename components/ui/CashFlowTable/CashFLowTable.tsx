// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Dimensions,
//   FlatList,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import { getCashFlowData } from "../../../constants/Unfluke_helpers/backend_helper";
// import RNPickerSelect from "react-native-picker-select";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { useWindowDimensions } from "react-native";

// const thickBorderRows = [
//   "Net Cash from Operating Activities",
//   "Net Cash Used in Investing Activities",
//   "Net Cash Used in Financing Activities",
//   "Net Increase in Cash and Cash Equivalents",
//   "Net Cash Flow"
// ];

// const CashFlowTable = ({ isConsolidated, company }) => {
//   const [headers, setHeaders] = useState([]);
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedYear, setSelectedYear] = useState("");
//   const [expandedSections, setExpandedSections] = useState({});

//   useEffect(() => {
//     async function getData() {
//       setLoading(true);
//       try {
//          const result = await getCashFlowData({
//           type: isConsolidated ? "C" : "S",
//           capcode: company,
//         });

//         // const result = await getCashFlow({
//         //   params: {
//         //     instrument: company,
//         //     mode: isConsolidated ? "C" : "S",
//         //   },
//         // });
//             console.log("sfkahskdfsaf",result)
//         if (result?.headers && result?.rows) {
//           // Filter out empty headers and clean the rows data
//           const filteredHeaders = result.headers.filter(header => header !== " ");
//           const filteredRows = result.rows.map(row => {
//             // First element is the title, skip first empty value if exists
//             const title = row[0];
//             const values = row.slice(1).filter((val, i) => i !== 0 || (val !== " " && val !== ""));
//             return [title, ...values];
//           });

//           setHeaders(filteredHeaders);
//           setRows(filteredRows);

//           // Auto-select the latest year
//           if (filteredHeaders.length > 1) {
//             setSelectedYear(filteredHeaders[filteredHeaders.length - 1].toString());
//           }
//         } else {
//           setHeaders([]);
//           setRows([]);
//         }
//       } catch (error) {
//         console.error("Error fetching cash flow data:", error);
//         setHeaders([]);
//         setRows([]);
//       } finally {
//         setLoading(false);
//       }
//     }

//     getData();
//   }, [company, isConsolidated]);

//   const toggleSection = (sectionName) => {
//     setExpandedSections((prev) => ({
//       ...prev,
//       [sectionName]: !prev[sectionName],
//     }));
//   };

// const formatValue = (val) => {
//   if (val === undefined || val === null || val === " ") return "-";
  
//   if (typeof val === "number") {
//     // Use Math.trunc() to ignore decimal values
//     const intVal = Math.trunc(val);
//     return intVal.toLocaleString("en-IN");
//   }

//   return val;
// };

//   const yearOptions = headers.slice(1).map((header) => {
//     const y = header.toString().slice(0, 4);
//     const m = parseInt(header.toString().slice(-2)) - 1;
//     return {
//       label: `${y}`,
//       value: header.toString(),
//     };
//   });

//   // Add 1 to selectedIndex to account for title column
//   const selectedIndex = headers.findIndex((h) => h === Number(selectedYear)) + 1;

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#3b82f6" />
//       </View>
//     );
//   }

//   if (!headers.length || !rows.length) {
//     return (
//       <View style={styles.noDataContainer}>
//         <Text style={styles.noDataText}>No data available</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.headerText}>Cash Flow</Text>

//       <View style={styles.pickerContainer}>
//         <RNPickerSelect
//           value={selectedYear}
//           onValueChange={(value) => setSelectedYear(value)}
//           items={yearOptions.map((opt) => ({
//             label: opt.label,
//             value: opt.value,
//           }))}
//           useNativeAndroidPickerStyle={false}
//           placeholder={{}}
//           style={pickerSelectStyles}
//           Icon={() => {
//             return (
//               <View style={{ marginTop: 6 }}>
//                 <Icon name="arrow-drop-down" size={24} color="#6b7280" />
//               </View>
//             );
//           }}
//         />
//       </View>

//       {selectedYear && selectedIndex !== 0 ? (
//         <View style={styles.mobileTableContainer}>
//           <View style={styles.mobileTableHeader}>
//             <Text style={styles.mobileHeaderText}>FINANCIAL METRICS</Text>
//             <Text style={styles.mobileHeaderText}>
//               {selectedYear.toString().slice(0, 4)}
//             </Text>
//           </View>

//           <FlatList
//             data={rows}
//             keyExtractor={(item, index) => index.toString()}
//             scrollEnabled={false}
//             renderItem={({ item, index }) => {
//               const isThick = thickBorderRows.includes(item[0]);
//               return (
//                 <View
//                   style={[
//                     index === rows.length - 1
//                       ? styles.lastRow
//                       : styles.mobileTableRow,
//                     index % 2 === 0 ? styles.evenRow : styles.oddRow,
//                   ]}
//                 >
//                   <Text
//                     style={[
//                       styles.mobileRowTitle,
//                       isThick && styles.boldText,
//                     ]}
//                   >
//                     {item[0].trim()}
//                   </Text>
//                   <Text
//                     style={[
//                       styles.mobileRowValue,
//                       isThick && styles.boldText,
//                     ]}
//                   >
//                     {formatValue(item[selectedIndex])}
//                   </Text>
//                 </View>
//               );
//             }}
//           />
//         </View>
//       ) : (
//         <View style={styles.noYearSelected}>
//           <Text style={styles.noYearText}>Select a year to view data</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 2,
//     borderRadius: 8,
//   },
//  loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     height: 200,
//   },
//   noDataContainer: {
//     padding: 16,
//     alignItems: "center",
//   },
//   noDataText: {
//     color: "#6b7280",
//   },
//   headerText: {
//     fontSize: 13,
//     fontWeight: "bold",
//     color: "#111827",
//     marginBottom: 16,
//   },
//   pickerContainer: {
//     backgroundColor: "white",
//     borderRadius: 8,
//     marginBottom: 16,
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//   },
//   mobileTableContainer: {
//     backgroundColor: "white",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     overflow: "hidden",
//   },
//   mobileTableHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 15,
//     paddingHorizontal: 10,
//     backgroundColor: "#f3f4f6",
//   },
//   mobileHeaderText: {
//     fontWeight: "bold",
//     fontSize: 12,
//     color: "#6b7280",
//   },
//   mobileTableRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 13,
//     paddingHorizontal: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//   },
//   lastRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 13,
//     paddingHorizontal: 10,
//   },
//   evenRow: {
//     backgroundColor: "white",
//   },
//   oddRow: {
//     backgroundColor: "#f9fafb",
//   },
//   mobileRowTitle: {
//     color: "#111827",
//     flex: 1,
//     fontSize: 12,
//   },
//   mobileRowValue: {
//     color: "#6b7280",
//     textAlign: "right",
//     fontSize: 12,
//   },
//   boldText: {
//     fontWeight: "bold",
//     color: "#111827",
//   },
//   noYearSelected: {
//     padding: 16,
//     alignItems: "center",
//   },
//   noYearText: {
//     color: "#6b7280",
//   },
// });

// const pickerSelectStyles = StyleSheet.create({
//   inputIOS: {
//     fontSize: 13,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     borderRadius: 8,
//     color: "#111827",
//     paddingRight: 30,
//   },
//   inputAndroid: {
//     fontSize: 13,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     borderRadius: 8,
//     color: "#111827",
//     paddingRight: 30,
//   },
//   placeholder: {
//     color: "#9ca3af",
//     fontSize: 13,
//   },
// });

// export default CashFlowTable;


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getCashFlowData } from "../../../constants/Unfluke_helpers/backend_helper";
import { formatNumberUS } from "../../../Unfluke_helpers/numberFormat";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const thickBorderRows = [
  "Net Cash from Operating Activities",
  "Net Cash Used in Investing Activities",
  "Net Cash Used in Financing Activities",
  "Net Increase in Cash and Cash Equivalents",
];

const CashFlowTable = ({ isConsolidated, company }) => {
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedYear, setSelectedYear] = useState(null);
  const { width } = useWindowDimensions();
  const route = useRoute();
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);
  const pickerSelectStyles = makePickerSelectStyles(c, isDark);

  const isMobile = width < 768;

  useEffect(() => {
    async function getData() {
      setLoading(true);

      try {
        const result = await getCashFlowData({
          type: isConsolidated ? "C" : "S",
          capcode: company,
        });

        // If backend already gives headers/rows, use them
        if (result?.headers && result?.rows) {
          setHeaders(result.headers);
          setRows(result.rows);
          const latestYear = result.headers[result.headers.length - 1];
          if (latestYear !== undefined) setSelectedYear(String(latestYear));
        }
        // Otherwise, adapt from { headings, results } shape
        else if (result?.headings && result?.results) {
          const years = Object.keys(result.results)
            .map(String)
            .sort((a, b) => Number(a) - Number(b));

          const titles = (result.headings || []).map((h) => h.title);

          // Helper to pull a value for a given title and year
          const getYearValue = (yr, title) => {
            const arr = result.results[yr] || [];
            for (const obj of arr) {
              if (Object.prototype.hasOwnProperty.call(obj, title)) {
                return obj[title];
              }
            }
            return "-";
          };

          const builtRows = titles.map((title) => [
            title,
            ...years.map((yr) => getYearValue(yr, title)),
          ]);

          const builtHeaders = ["Metric", ...years];

          setHeaders(builtHeaders);
          setRows(builtRows);
          if (years.length) setSelectedYear(years[years.length - 1]);
        } else {
          setHeaders([]);
          setRows([]);
        }
      } catch (error) {
        console.error("Error fetching cash flow data:", error);
        setHeaders([]);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    getData();
  }, [company, isConsolidated]);

  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const formatValue = (val) =>
    typeof val === "number" && !Number.isInteger(val) ? val.toFixed(2) : val;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={c.gold} />
      </View>
    );
  }

  if (!headers.length || !rows.length) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const yearOptions = headers
    .slice(1)
    .slice(-10)
    .map((year) => ({
      label: String(year),
      value: String(year),
    }));

  const renderMobileView = () => (
    <View style={styles.mobileContainer}>
      <Text style={styles.mobileTitle}>Cash Flow</Text>

      {headers.length > 1 && (
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            value={selectedYear}
            onValueChange={(value) => setSelectedYear(value)}
            items={yearOptions}
            useNativeAndroidPickerStyle={false}
            placeholder={{}}
            style={pickerSelectStyles}
            Icon={() => (
              <View style={{ marginTop: 6 }}>
                <Icon name="arrow-drop-down" size={24} color={c.textSecondary} />
              </View>
            )}
          />
        </View>
      )}

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Financial Metrics</Text>
          <Text style={styles.headerText}>{selectedYear}</Text>
        </View>

        <ScrollView style={styles.tableBody}>
          {selectedYear &&
            rows.map((row, idx) => {
              const yearIndex = headers.findIndex(
                (h) => String(h) === String(selectedYear)
              );
              
              const isThick = thickBorderRows.includes(row[0]);
              const isBoldOnly = row[0] === "Net cash flow";

              return (
                <View
                  key={idx}
                  style={[
                    styles.tableRow,
                    idx % 2 === 0 ? styles.evenRow : styles.oddRow,
                    isThick && styles.thickBorderRow,
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      styles.metricCell,
                      (isThick || isBoldOnly) && styles.boldText,
                      isThick && styles.uppercaseText,
                    ]}
                  >
                    {row[0]}
                  </Text>
                  <Text
                    style={[
                      styles.cellText,
                      styles.valueCell,
                      (isThick || isBoldOnly) && styles.boldText,
                    ]}
                  >
                    {formatNumberUS(row[yearIndex])}
                  </Text>
                </View>
              );
            })}
        </ScrollView>
      </View>
    </View>
  );

  const renderDesktopView = () => (
    <View style={styles.desktopContainer}>
      <Text style={styles.desktopTitle}>Cash Flow</Text>

      <View style={styles.desktopTableContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
            {/* Table Header */}
            <View style={styles.desktopTableHeader}>
              <View style={[styles.desktopHeaderCell, styles.stickyColumn]}>
                <Text style={styles.desktopHeaderText}>Financial Metrics</Text>
              </View>
              {headers
                .slice(1)
                .slice(-10)
                .map((header, index) => (
                  <View key={index} style={styles.desktopHeaderCell}>
                    <Text style={styles.desktopHeaderText}>{header}</Text>
                  </View>
                ))}
            </View>

            {/* Table Body */}
            <ScrollView style={styles.desktopTableBody}>
              {rows.map((row, index) => {
                const isThick = thickBorderRows.includes(row[0]);
                const isBoldOnly = row[0] === "Net cash flow";

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.desktopTableRow,
                      index % 2 === 0 ? styles.evenRow : styles.oddRow,
                      isThick && styles.thickBorderRow,
                    ]}
                    onPress={() => toggleSection(row[0])}
                  >
                    <View style={[styles.desktopCell, styles.stickyColumn]}>
                      <Text
                        style={[
                          styles.desktopCellText,
                          (isThick || isBoldOnly) && styles.boldText,
                          isThick && styles.uppercaseText,
                        ]}
                      >
                        {row[0]}
                      </Text>
                    </View>
                    {row
                      .slice(1)
                      .slice(-10)
                      .map((cell, cellIndex) => (
                        <View key={cellIndex} style={styles.desktopCell}>
                          <Text
                            style={[
                              styles.desktopCellText,
                              styles.centerText,
                              (isThick || isBoldOnly) && styles.boldText,
                            ]}
                          >
                            {formatNumberUS(cell)}
                          </Text>
                        </View>
                      ))}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isMobile ? renderMobileView() : renderDesktopView()}
    </View>
  );
};

const makePickerSelectStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  inputIOS: {
    fontSize: 13,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: 8,
    color: c.text,
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 13,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: 8,
    color: c.text,
    paddingRight: 30,
  },
});

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    // marginTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 128,
    backgroundColor: "transparent",
  },
  noDataContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  noDataText: {
    color: c.textSecondary,
    fontSize: 14,
  },

  // Mobile styles
  mobileContainer: {
    flex: 1,
  },
  mobileTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: c.text,
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: c.inputBg,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: c.inputBorder,
  },
  tableContainer: {
    backgroundColor: c.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: c.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: c.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "bold",
    color: c.textSecondary,
    textTransform: "uppercase",
  },
  tableBody: {
    maxHeight: 600,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  thickBorderRow: {
    borderTopWidth: 2,
    borderTopColor: c.border,
  },
  evenRow: {
    backgroundColor: c.card,
  },
  oddRow: {
    backgroundColor: c.surface,
  },
  cellText: {
    fontSize: 13,
    color: c.textSecondary,
  },
  metricCell: {
    flex: 1,
    paddingRight: 8,
  },
  valueCell: {
    textAlign: "right",
    fontWeight: "500",
  },
  boldText: {
    fontWeight: "bold",
    color: c.text,
  },
  uppercaseText: {
    textTransform: "uppercase",
  },

  // Desktop styles
  desktopContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  desktopTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: c.text,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  desktopTableContainer: {
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  desktopTableHeader: {
    flexDirection: "row",
    backgroundColor: c.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  desktopHeaderCell: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 100,
    borderRightWidth: 1,
    borderRightColor: c.border,
  },
  desktopHeaderText: {
    fontSize: 12,
    fontWeight: "bold",
    color: c.textSecondary,
    textTransform: "uppercase",
    textAlign: "center",
  },
  desktopTableBody: {
    maxHeight: 600,
  },
  desktopTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  desktopCell: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    minWidth: 100,
    borderRightWidth: 1,
    borderRightColor: c.border,
  },
  stickyColumn: {
    minWidth: 200,
    backgroundColor: c.card,
  },
  desktopCellText: {
    fontSize: 13,
    color: c.textSecondary,
  },
  centerText: {
    textAlign: "center",
  },
});

export default CashFlowTable;