// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Linking,
//   Alert
// } from 'react-native';
// import { DataTable, Card, Button } from 'react-native-paper';

// const ScannerResults = ({ results, downloadUrl, type, headers }) => {
//   const [sortedResults, setSortedResults] = useState(results);
//   const [sortedState, setSortedState] = useState({
//     by: "",
//     order: "asc"
//   });

//   const scannerHeaders = [
//     "Instrument",
//     "Open",
//     "High",
//     "Low",
//     "Close",
//     "Date",
//     "Time",
//   ];

//   const corrKeys = {
//     Instrument: "ticker",
//     Open: "open",
//     High: "high",
//     Low: "low",
//     Close: "close",
//     Date: "date",
//     Time: "time"
//   };

//   const sortAlgo = (arr, header, asc) => {
//     const isArrOfNumbers = !isNaN(arr[0][header]);

//     if (isArrOfNumbers) {
//       if (asc) {
//         arr.sort((a, b) => a[header] - b[header]);
//       } else {
//         arr.sort((a, b) => b[header] - a[header]);
//       }
//     } else {
//       if (asc) {
//         arr.sort((a, b) => a[header].localeCompare(b[header]));
//       } else {
//         arr.sort((a, b) => b[header].localeCompare(a[header]));
//       }
//     }
//   };

//   const sortBy = (header) => {
//     const tempArr = JSON.parse(JSON.stringify(results));
//     const tempState = JSON.parse(JSON.stringify(sortedState));

//     if (tempState.header !== header) {
//       tempState.header = header;
//       tempState.order = "asc";
//     }

//     if (type === "fundamental") {
//       if (tempState.order === "desc") {
//         sortAlgo(tempArr, header, true);
//         tempState.order = "asc";
//       } else {
//         sortAlgo(tempArr, header, false);
//         tempState.order = "desc";
//       }
//       setSortedResults(tempArr);
//     } else {
//       let rowkey = corrKeys[header];

//       if (!rowkey) rowkey = header;

//       if (rowkey !== "") {
//         if (tempState.order === "desc") {
//           sortAlgo(tempArr, rowkey, true);
//           tempState.order = "asc";
//         } else {
//           sortAlgo(tempArr, rowkey, false);
//           tempState.order = "desc";
//         }
//         setSortedResults(tempArr);
//       }
//     }

//     setSortedState(tempState);
//   };

//   const handleDownload = async () => {
//     const supported = await Linking.canOpenURL(downloadUrl);

//     if (supported) {
//       await Linking.openURL(downloadUrl);
//     } else {
//       Alert.alert('Error', 'Cannot open download URL');
//     }
//   };

//   useEffect(() => {
//     setSortedResults(results);
//   }, [results, headers]);

//   const renderSortIcon = (header) => {
//     if (sortedState.header === header) {
//       return sortedState.order === 'asc' ? '↑' : '↓';
//     }
//     return '↕';
//   };

//   const RenderTableHeader = ({ headers, isFundamental }) => (
//     <DataTable.Header>
//       <DataTable.Title style={styles.snoHeader}>S.No.</DataTable.Title>
//       {!isFundamental && scannerHeaders.map((header) => (
//         <DataTable.Title
//           key={header}
//           style={styles.header}
//           onPress={() => sortBy(header)}
//         >
//           <View style={styles.headerContent}>
//             <Text>{header}</Text>
//             <Text style={styles.sortIcon}>{renderSortIcon(header)}</Text>
//           </View>
//         </DataTable.Title>
//       ))}
//       {headers.map((header) => (
//         <DataTable.Title
//           key={header}
//           style={styles.header}
//           onPress={() => sortBy(header)}
//         >
//           <View style={styles.headerContent}>
//             <Text>{header}</Text>
//             <Text style={styles.sortIcon}>{renderSortIcon(header)}</Text>
//           </View>
//         </DataTable.Title>
//       ))}
//     </DataTable.Header>
//   );

//   const RenderTableRow = ({ item, index, isFundamental }) => (
//     <DataTable.Row>
//       <DataTable.Cell style={styles.snoCell}>{index + 1}</DataTable.Cell>

//       {!isFundamental && (
//         <>
//           <DataTable.Cell>{item.ticker}</DataTable.Cell>
//           <DataTable.Cell>{item.open}</DataTable.Cell>
//           <DataTable.Cell>{item.high}</DataTable.Cell>
//           <DataTable.Cell>{item.low}</DataTable.Cell>
//           <DataTable.Cell>{item.close}</DataTable.Cell>
//           <DataTable.Cell>{item.date}</DataTable.Cell>
//           <DataTable.Cell>{item.time}</DataTable.Cell>
//         </>
//       )}

//       {headers.map((header) => (
//         <DataTable.Cell key={header}>{item[header]}</DataTable.Cell>
//       ))}
//     </DataTable.Row>
//   );

//   return (
//     <Card style={styles.card}>
//       <Card.Title
//         title="Results"
//         right={(props) => (
//           <Button 
//             {...props} 
//             mode="contained" 
//             onPress={handleDownload}
//             style={styles.downloadButton}
//           >
//             Download
//           </Button>
//         )}
//       />
//       <Card.Content>
//         <ScrollView horizontal>
//           <DataTable style={styles.table}>
//             <RenderTableHeader headers={headers} isFundamental={type === "fundamental"} />

//             <ScrollView>
//               {sortedResults.map((row, i) => (
//                 <RenderTableRow
//                   key={i}
//                   item={row}
//                   index={i}
//                   isFundamental={type === "fundamental"}
//                 />
//               ))}
//             </ScrollView>
//           </DataTable>
//         </ScrollView>
//       </Card.Content>
//     </Card>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     margin: 10,
//     backgroundColor: '#f8f9fa'
//   },
//   downloadButton: {
//     marginRight: 10,
//     backgroundColor: '#198754'
//   },
//   table: {
//     width: '100%'
//   },
//   header: {
//     justifyContent: 'center',
//     minWidth: 100
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center'
//   },
//   sortIcon: {
//     marginLeft: 5,
//     fontSize: 12
//   },
//   snoHeader: {
//     width: 60
//   },
//   snoCell: {
//     width: 60,
//     justifyContent: 'center'
//   }
// });

// export default ScannerResults;






import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Linking,
  Alert,
  Platform,
  FlatList,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { setSelectedStock } from "../../../../redux/Unfluke_slices/globalStock/reducer";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const ScannerResults = ({ results, downloadUrl, type, headers }) => {
  const { colors: c, isDark } = useTheme();
  const dynamicStyles = styles(c, isDark);

  // Navigation Logic
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleRowPress = (item) => {
    // Only if we have a valid ticker/symbol
    if (item.ticker || item.Instrument) {
      const symbol = item.ticker || item.Instrument;
      dispatch(setSelectedStock({
        symbol: symbol,
        name: symbol, // Fallback name
      }));

      if (type === "fundamental") {
        // @ts-ignore
        navigation.navigate("fundamental");
      } else {
        // @ts-ignore
        navigation.navigate("historical");
      }
    }
  };

  const [sortedResults, setSortedResults] = useState(results);

  const [sortedState, setSortedState] = useState({
    by: "",
    order: "asc",
  });
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'

  const scannerHeaders = [
    "Instrument",
    "Open",
    "High",
    "Low",
    "Close",
    "Date",
    "Time",
  ];

  const corrKeys = {
    Instrument: "ticker",
    Open: "open",
    High: "high",
    Low: "low",
    Close: "close",
    Date: "date",
    Time: "time",
  };

  const sortAlgo = (arr, header, asc) => {
    const isArrOfNumbers = !isNaN(arr[0]?.[header]);

    if (isArrOfNumbers) {
      if (asc) {
        arr.sort((a, b) => a[header] - b[header]);
      } else {
        arr.sort((a, b) => b[header] - a[header]);
      }
    } else {
      if (asc) {
        arr.sort((a, b) => String(a[header]).localeCompare(String(b[header])));
      } else {
        arr.sort((a, b) => String(b[header]).localeCompare(String(a[header])));
      }
    }
  };

  const sortBy = (header) => {
    const tempArr = JSON.parse(JSON.stringify(results));
    const tempState = JSON.parse(JSON.stringify(sortedState));

    if (tempState.header !== header) {
      tempState.header = header;
      tempState.order = "asc";
    }

    if (type === "fundamental") {
      if (tempState.order === "desc") {
        sortAlgo(tempArr, header, true);
        tempState.order = "asc";
      } else {
        sortAlgo(tempArr, header, false);
        tempState.order = "desc";
      }
      setSortedResults(tempArr);
    } else {
      let rowkey = corrKeys[header];

      if (!rowkey) rowkey = header;

      if (rowkey !== "") {
        if (tempState.order === "desc") {
          sortAlgo(tempArr, rowkey, true);
          tempState.order = "asc";
        } else {
          sortAlgo(tempArr, rowkey, false);
          tempState.order = "desc";
        }
        setSortedResults(tempArr);
      }
    }

    setSortedState(tempState);
  };

  const handleDownload = async () => {
    if (!downloadUrl) {
      Alert.alert("Error", "Download URL not available");
      return;
    }

    try {
      if (Platform.OS === "web") {
        Linking.openURL(downloadUrl);
      } else {
        const filename = `scanner_results_${Date.now()}.csv`;
        const fileUri = FileSystem.documentDirectory + filename;

        const downloadResumable = FileSystem.createDownloadResumable(
          downloadUrl,
          fileUri
        );

        const { uri } = await downloadResumable.downloadAsync();

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert("Success", `File saved to ${uri}`);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to download file");
      console.error(error);
    }
  };

  useEffect(() => {
    setSortedResults(results);
  }, [results, headers]);

  // Card View Renderer
  // const renderCardItem = ({ item, index }) => (
  //   <View style={dynamicStyles.card}>
  //     <View style={dynamicStyles.cardNumber}>
  //       <Text style={dynamicStyles.cardNumberText}>{index + 1}</Text>
  //     </View>

  //     {type !== "fundamental" ? (
  //       <View style={dynamicStyles.cardContent}>
  //         <Text style={dynamicStyles.cardTitle}>{item.ticker}</Text>
  //         <View style={dynamicStyles.cardGrid}>
  //           <View style={dynamicStyles.cardField}>
  //             <Text style={dynamicStyles.cardLabel}>Open:</Text>
  //             <Text style={dynamicStyles.cardValue}>{item.open}</Text>
  //           </View>
  //           <View style={dynamicStyles.cardField}>
  //             <Text style={dynamicStyles.cardLabel}>High:</Text>
  //             <Text style={dynamicStyles.cardValue}>{item.high}</Text>
  //           </View>
  //           <View style={dynamicStyles.cardField}>
  //             <Text style={dynamicStyles.cardLabel}>Low:</Text>
  //             <Text style={dynamicStyles.cardValue}>{item.low}</Text>
  //           </View>
  //           <View style={dynamicStyles.cardField}>
  //             <Text style={dynamicStyles.cardLabel}>Close:</Text>
  //             <Text style={dynamicStyles.cardValue}>{item.close}</Text>
  //           </View>
  //         </View>
  //         <View style={dynamicStyles.cardFooter}>
  //           <Text style={dynamicStyles.cardDate}>
  //             {item.date} {item.time}
  //           </Text>
  //         </View>
  //         {headers && headers.length > 0 && (
  //           <View style={dynamicStyles.cardIndicators}>
  //             {headers.map((header, idx) => (
  //               <View key={idx} style={dynamicStyles.cardField}>
  //                 <Text style={dynamicStyles.cardLabel}>{header}:</Text>
  //                 <Text style={dynamicStyles.cardValue}>{item[header]}</Text>
  //               </View>
  //             ))}
  //           </View>
  //         )}
  //       </View>
  //     ) : (
  //       <View style={dynamicStyles.cardContent}>
  //         {headers &&
  //           headers.map((header, idx) => (
  //             <View key={idx} style={dynamicStyles.cardField}>
  //               <Text style={dynamicStyles.cardLabel}>{header}:</Text>
  //               <Text style={dynamicStyles.cardValue}>{item[header]}</Text>
  //             </View>
  //           ))}
  //       </View>
  //     )}
  //   </View>
  // );


  // Table View Renderer
  const renderTableView = () => {
    const allHeaders =
      type !== "fundamental"
        ? ["S.No.", ...scannerHeaders, ...(headers || [])]
        : ["S.No.", ...(headers || [])];

    return (
      <View style={dynamicStyles.tableContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
            {/* Table Header */}
            <View style={dynamicStyles.tableHeader}>
              {allHeaders.map((header, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    dynamicStyles.headerCell,
                    index === 0 && dynamicStyles.firstCell,
                  ]}
                  onPress={() => header !== "S.No." && sortBy(header)}
                  activeOpacity={0.7}
                >
                  <Text style={dynamicStyles.headerText} numberOfLines={1}>
                    {header}
                  </Text>
                  {header !== "S.No." && (
                    <Text
                      style={[
                        dynamicStyles.sortIcon,
                        sortedState.header === header &&
                        dynamicStyles.sortIconActive,
                      ]}
                    >
                      {sortedState.header === header &&
                        sortedState.order === "desc"
                        ? "▼"
                        : "▲"}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Table Body */}
            {/* Rendered as a plain View (not a nested vertical ScrollView) so
                every row flows into the page's outer ScrollView and ALL results
                are reachable — matching the Cards view. A nested vertical
                ScrollView here previously clipped the body to ~10 visible rows
                and swallowed scroll gestures, so the rest were unreachable. */}
            <View style={dynamicStyles.tableBody}>
              {sortedResults.map((row, rowIndex) => (
                <TouchableOpacity
                  key={rowIndex}
                  onPress={() => handleRowPress(row)}
                  style={[
                    dynamicStyles.tableRow,
                    rowIndex % 2 === 0 && dynamicStyles.tableRowEven,
                  ]}
                >
                  {/* S.No. */}
                  <View style={[dynamicStyles.cell, dynamicStyles.firstCell]}>
                    <Text style={dynamicStyles.cellText}>{rowIndex + 1}</Text>
                  </View>

                  {type !== "fundamental" ? (
                    <>
                      <View style={dynamicStyles.cell}>
                        <Text style={dynamicStyles.cellText}>{row.ticker}</Text>
                      </View>
                      <View style={dynamicStyles.cell}>
                        <Text style={dynamicStyles.cellText}>{row.open}</Text>
                      </View>
                      <View style={dynamicStyles.cell}>
                        <Text style={dynamicStyles.cellText}>{row.high}</Text>
                      </View>
                      <View style={dynamicStyles.cell}>
                        <Text style={dynamicStyles.cellText}>{row.low}</Text>
                      </View>
                      <View style={dynamicStyles.cell}>
                        <Text style={dynamicStyles.cellText}>{row.close}</Text>
                      </View>
                      <View style={dynamicStyles.cell}>
                        <Text style={dynamicStyles.cellText}>{row.date}</Text>
                      </View>
                      <View style={dynamicStyles.cell}>
                        <Text style={dynamicStyles.cellText}>{row.time}</Text>
                      </View>
                      {headers &&
                        headers.map((header, index) => (
                          <View key={index} style={dynamicStyles.cell}>
                            <Text style={dynamicStyles.cellText}>
                              {row[header] !== null && row[header] !== undefined
                                ? String(row[header])
                                : "-"}
                            </Text>
                          </View>
                        ))}
                    </>
                  ) : (
                    <>
                      {headers &&
                        headers.map((header, index) => (
                          <View key={index} style={dynamicStyles.cell}>
                            <Text style={dynamicStyles.cellText}>
                              {row[header] !== null && row[header] !== undefined
                                ? String(row[header])
                                : "-"}
                            </Text>
                          </View>
                        ))}
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.cardHeader}>
        <Text style={dynamicStyles.cardTitle}>Results</Text>
        <View style={dynamicStyles.headerActions}>
          {/* View Toggle */}
          <View style={dynamicStyles.viewToggle}>
            <TouchableOpacity
              style={[
                dynamicStyles.toggleButton,
                viewMode === "table" && dynamicStyles.toggleButtonActive,
              ]}
              onPress={() => setViewMode("table")}
            >
              <Text
                style={[
                  dynamicStyles.toggleButtonText,
                  viewMode === "table" && dynamicStyles.toggleButtonTextActive,
                ]}
              >
                Table
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                dynamicStyles.toggleButton,
                viewMode === "card" && dynamicStyles.toggleButtonActive,
              ]}
              onPress={() => setViewMode("card")}
            >
              <Text
                style={[
                  dynamicStyles.toggleButtonText,
                  viewMode === "card" && dynamicStyles.toggleButtonTextActive,
                ]}
              >
                Cards
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      {viewMode === "table" ? (
        renderTableView()
      ) : (
        <View style={dynamicStyles.cardList}>
          {sortedResults.map((item, index) => (
            <TouchableOpacity key={index} style={dynamicStyles.card} onPress={() => handleRowPress(item)}>
              <View style={dynamicStyles.cardNumber}>
                <Text style={dynamicStyles.cardNumberText}>{index + 1}</Text>
              </View>

              {type !== "fundamental" ? (
                <View style={dynamicStyles.cardContent}>
                  <Text style={dynamicStyles.cardItemTitle}>{item.ticker}</Text>
                  <View style={dynamicStyles.cardGrid}>
                    <View style={dynamicStyles.cardField}>
                      <Text style={dynamicStyles.cardLabel}>Open:</Text>
                      <Text style={dynamicStyles.cardValue}>{item.open}</Text>
                    </View>
                    <View style={dynamicStyles.cardField}>
                      <Text style={dynamicStyles.cardLabel}>High:</Text>
                      <Text style={dynamicStyles.cardValue}>{item.high}</Text>
                    </View>
                    <View style={dynamicStyles.cardField}>
                      <Text style={dynamicStyles.cardLabel}>Low:</Text>
                      <Text style={dynamicStyles.cardValue}>{item.low}</Text>
                    </View>
                    <View style={dynamicStyles.cardField}>
                      <Text style={dynamicStyles.cardLabel}>Close:</Text>
                      <Text style={dynamicStyles.cardValue}>{item.close}</Text>
                    </View>
                  </View>
                  <View style={dynamicStyles.cardFooter}>
                    <Text style={dynamicStyles.cardDate}>
                      {item.date} {item.time}
                    </Text>
                  </View>
                  {headers && headers.length > 0 && (
                    <View style={dynamicStyles.cardIndicators}>
                      {headers.map((header, idx) => (
                        <View key={idx} style={dynamicStyles.cardField}>
                          <Text style={dynamicStyles.cardLabel}>{header}:</Text>
                          <Text style={dynamicStyles.cardValue}>{item[header]}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={dynamicStyles.cardContent}>
                  {headers &&
                    headers.map((header, idx) => (
                      <View key={idx} style={dynamicStyles.cardField}>
                        <Text style={dynamicStyles.cardLabel}>{header}:</Text>
                        <Text style={dynamicStyles.cardValue}>{item[header]}</Text>
                      </View>
                    ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={dynamicStyles.footer}>
        <Text style={dynamicStyles.footerText}>
          Total Results: {sortedResults.length}
        </Text>
      </View>
    </View>
  );
};

const styles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: c.card,
      borderRadius: 12,
      marginVertical: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      flexWrap: "wrap",
      gap: 8,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: c.text,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    viewToggle: {
      flexDirection: "row",
      backgroundColor: c.surfaceElevated,
      borderRadius: 8,
      padding: 2,
    },
    toggleButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
    },
    toggleButtonActive: {
      backgroundColor: isDark ? c.goldBright : c.gold,
    },
    toggleButtonText: {
      fontSize: 13,
      fontWeight: "500",
      color: c.textSecondary,
    },
    toggleButtonTextActive: {
      color: c.onGold,
    },
    downloadButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.success,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      gap: 6,
    },
    downloadIcon: {
      fontSize: 16,
      color: "#FFFFFF",
    },
    downloadText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#FFFFFF",
    },

    // Table Styles
    // No maxHeight cap: the table body renders inline and scrolls with the
    // page's outer ScrollView so all results are reachable (like Cards view).
    tableContainer: {},
    tableHeader: {
      flexDirection: "row",
      backgroundColor: c.surfaceElevated,
      borderBottomWidth: 2,
      borderBottomColor: c.border,
    },
    headerCell: {
      width: 120,
      paddingVertical: 12,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRightWidth: 1,
      borderRightColor: c.border,
    },
    firstCell: {
      width: 60,
    },
    headerText: {
      fontSize: 14,
      fontWeight: "600",
      color: c.text,
      flex: 1,
    },
    sortIcon: {
      fontSize: 12,
      color: c.textMuted,
      marginLeft: 4,
    },
    sortIconActive: {
      color: isDark ? c.goldBright : c.gold,
    },
    tableBody: {},
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    tableRowEven: {
      backgroundColor: c.surface,
    },
    cell: {
      width: 120,
      paddingVertical: 12,
      paddingHorizontal: 12,
      justifyContent: "center",
      borderRightWidth: 1,
      borderRightColor: c.border,
    },
    cellText: {
      fontSize: 14,
      color: c.textSecondary,
    },

    // Card Styles
    cardList: {
      padding: 16,
      gap: 12,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: c.border,
      flexDirection: "row",
    },
    cardNumber: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? c.goldBright : c.gold,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    cardNumberText: {
      fontSize: 16,
      fontWeight: "700",
      color: c.onGold,
    },
    cardContent: {
      flex: 1,
    },
    cardItemTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: c.text,
      marginBottom: 12,
    },
    cardGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 8,
    },
    cardField: {
      flexDirection: "row",
      alignItems: "center",
      minWidth: "45%",
      marginBottom: 6,
    },
    cardLabel: {
      fontSize: 13,
      fontWeight: "500",
      color: c.textSecondary,
      marginRight: 6,
    },
    cardValue: {
      fontSize: 14,
      fontWeight: "600",
      color: c.text,
    },
    cardFooter: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    cardDate: {
      fontSize: 12,
      color: c.textSecondary,
    },
    cardIndicators: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },

    // Footer
    footer: {
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.surface,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    },
    footerText: {
      fontSize: 14,
      fontWeight: "500",
      color: c.textSecondary,
      textAlign: "center",
    },
  });

export default ScannerResults;