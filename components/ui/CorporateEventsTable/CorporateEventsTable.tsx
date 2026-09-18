// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Pressable,
//   TouchableOpacity,
// } from "react-native";
// import { getEventsData } from "../../../constants/Unfluke_helpers/backend_helper";
// import Icon from "react-native-vector-icons/MaterialIcons";

// const CorporateEventsTable = ({ isConsolidated, company }) => {
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("dividend");
//   const [dividendData, setDividendData] = useState([]);
//   const [bonusData, setBonusData] = useState([]);
//   const [splitData, setSplitData] = useState([]);
//   const [insiderTradingData, setInsiderTradingData] = useState([]);
//   const [showDropdown, setShowDropdown] = useState(false);

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         setLoading(true);
//         const result = await getEventsData({
//           instrument: company,
//           mode: isConsolidated ? "C" : "S",
//         });

//         if (result) {
//           setDividendData(result.dividend || []);
//           setBonusData(result.bonus || []);
//           setSplitData(result.split || []);
//           setInsiderTradingData(result.insiderTrading || []);
//         } else {
//           setDividendData([]);
//           setBonusData([]);
//           setSplitData([]);
//           setInsiderTradingData([]);
//         }
//       } catch (error) {
//         console.error("Error fetching events data:", error);
//         setDividendData([]);
//         setBonusData([]);
//         setSplitData([]);
//         setInsiderTradingData([]);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchData();
//   }, [company, isConsolidated]);

//   const formatDate = (dateString) => {
//     if (!dateString) return "";

//     const months = [
//       "JAN",
//       "FEB",
//       "MAR",
//       "APR",
//       "MAY",
//       "JUN",
//       "JUL",
//       "AUG",
//       "SEP",
//       "OCT",
//       "NOV",
//       "DEC",
//     ];

//     const parts = dateString.split("/");
//     if (parts.length !== 3) return dateString;

//     const monthIndex = parseInt(parts[0], 10) - 1;
//     const day = parts[1];
//     const year = parts[2];
//     const monthName = months[monthIndex] || "";

//     return `${day} ${monthName} ${year}`;
//   };

// const formatValue = (value) => {
//   if (!value) return "0";
  
//   // Remove any extra spaces and convert to number
//   const numericValue = Number(String(value).trim());
  
//   // Format without decimals and with commas
//   return `${Math.floor(numericValue).toLocaleString('en-IN')}`;
// };
//   const tabs = [
//     { id: "dividend", label: "Dividends" },
//     { id: "bonus", label: "Bonus" },
//     { id: "split", label: "Split" },
//     { id: "insider", label: "Insider Trading" },
//   ];

//   const toggleDropdown = () => {
//     setShowDropdown(!showDropdown);
//   };

//   const handleTabSelect = (tabId) => {
//     setActiveTab(tabId);
//     setShowDropdown(false);
//   };

//   const getActiveTabLabel = () => {
//     const tab = tabs.find((t) => t.id === activeTab);
//     return tab ? tab.label : "Select";
//   };

//   const renderDividendItem = (item) => (
//     <View style={styles.dealCard} key={item._id}>
//       <Text style={styles.dateText}>{formatDate(item["Source Date"])}</Text>
//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Type:</Text>
//         <Text style={styles.typeText}>{item.Type}</Text>
//       </View>

//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Ex-Date:</Text>
//         <Text style={styles.value}>{formatDate(item["Ex-Date"])}</Text>
//       </View>

//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Dividend Per Share:</Text>
//         <Text style={styles.priceValue}>₹{item["Dividend Per Share"]}</Text>
//       </View>
//     </View>
//   );

//   const renderBonusItem = (item) => (
//     <View style={styles.dealCard} key={item._id}>
//       <Text style={styles.dateText}>{formatDate(item["Source Date"])}</Text>

//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Ex Bonus Date:</Text>
//         <Text style={styles.value}>{formatDate(item["Ex Bonus Date"])}</Text>
//       </View>

//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Record Date:</Text>
//         <Text style={styles.value}>{formatDate(item["Record Date"])}</Text>
//       </View>

//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Ratio:</Text>
//         <Text style={styles.value}>
//           {item["Ratio(Numerator)"]}:{item["Ratio(Denominator)"]}
//         </Text>
//       </View>
//     </View>
//   );

//   const renderSplitItem = (item) => (
//     <View style={styles.dealCard} key={item._id}>
//       <Text style={styles.dateText}>{formatDate(item["Source Date"])}</Text>

//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Stock Split Date:</Text>
//         <Text style={styles.value}>{formatDate(item["Stock Split Date"])}</Text>
//       </View>

//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Record Date:</Text>
//         <Text style={styles.value}>{formatDate(item["Record Date"])}</Text>
//       </View>

//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Ratio:</Text>
//         <Text style={styles.value}>{item.Ratio}</Text>
//       </View>
//     </View>
//   );

//   const renderInsiderTradingItem = (item) => (
//     <View style={styles.dealCard} key={item._id}>
//       <Text style={styles.dateText}>{item["Name of Acquirer/Seller"]}</Text>
//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Trade Date:</Text>
//         <Text style={styles.value}>
//           {" "}
//           {formatDate(
//             item[
//               "Date of acquisition of shares/sale of shares/Date of Allotment(From date)"
//             ]
//           )}
//         </Text>
//       </View>

//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Category:</Text>
//         <Text style={styles.value}>{item["Category of person"]}</Text>
//       </View>

//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Prior Trade:</Text>
//         <Text style={styles.value}>
//           {formatValue(item["Number of Securities held Prior to acquisition/Disposed"])} (
//           {item["%   of  Securities held Prior to acquisition/Disposed"]}%)
//         </Text>
//       </View>
//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Transaction Type:</Text>
//         <Text style={[styles.typeText]}>
//           {item["Transaction Type ( Buy/Sale/Pledge/Revoke/Invoke)"]}
//         </Text>
//       </View>

//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Quantity:</Text>
//         <Text style={styles.value}>
//           {formatValue(item["Number of Securities Acquired/Disposed/Pledge etc"])}
//         </Text>
//       </View>

//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Value:</Text>
//         <Text style={styles.value}>
//   ₹{formatValue(item["Value  of Securities Acquired/Disposed/Pledge etc"])}
//         </Text>
//       </View>

//       <View style={styles.dataRow}>
//         <Text style={styles.label}>Post Trade:</Text>
//         <Text style={styles.value}>
//           {formatValue(
//             item[
//               "Number of Securities held Post  acquisition/Disposed/Pledge etc"
//             ])
//           }{" "}
//           ({item["Post-Transaction % of Shareholding"]}%)
//         </Text>
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   const noData =
//     dividendData.length === 0 &&
//     bonusData.length === 0 &&
//     splitData.length === 0 &&
//     insiderTradingData.length === 0;

//   const getActiveData = () => {
//     switch (activeTab) {
//       case "dividend":
//         return dividendData;
//       case "bonus":
//         return bonusData;
//       case "split":
//         return splitData;
//       case "insider":
//         return insiderTradingData;
//       default:
//         return [];
//     }
//   };

//   const renderActiveItems = () => {
//     const data = getActiveData();
//     if (data.length === 0) {
//       return <Text style={styles.noDataText}>No data available</Text>;
//     }

//     switch (activeTab) {
//       case "dividend":
//         return data.map(renderDividendItem);
//       case "bonus":
//         return data.map(renderBonusItem);
//       case "split":
//         return data.map(renderSplitItem);
//       case "insider":
//         return data.map(renderInsiderTradingItem);
//       default:
//         return null;
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Dropdown Selector */}
//       <View style={styles.dropdownWrapper}>
//         <View style={styles.dropdownContainer}>
//           <Pressable style={styles.dropdownSelector} onPress={toggleDropdown}>
//             <Text style={styles.dropdownText}>{getActiveTabLabel()}</Text>
//             <Icon
//               name={showDropdown ? "arrow-drop-up" : "arrow-drop-down"}
//               size={24}
//               color="#2441F0"
//             />
//           </Pressable>
//         </View>

//         {/* Dropdown Options */}
//         {showDropdown && (
//           <View style={styles.dropdownOptions}>
//             {tabs.map((tab) => (
//               <Pressable
//                 key={tab.id}
//                 style={[
//                   styles.dropdownItem,
//                   activeTab === tab.id && styles.activeDropdownItem,
//                 ]}
//                 onPress={() => handleTabSelect(tab.id)}
//               >
//                 <Text
//                   style={[
//                     styles.dropdownItemText,
//                     activeTab === tab.id && styles.activeDropdownItemText,
//                   ]}
//                 >
//                   {tab.label}
//                 </Text>
//               </Pressable>
//             ))}
//           </View>
//         )}
//       </View>

//       {/* Content Area */}
//       {noData ? (
//         <Text style={styles.noDataText}>No data available</Text>
//       ) : (
//         <ScrollView style={styles.dataContainer}>
//           {renderActiveItems()}
//         </ScrollView>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   dropdownWrapper: {
//     marginBottom: 26,
//     marginTop: 20,
//   },
//   dropdownContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f0f0f0",
//     borderRadius: 8,
//     overflow: "hidden",
//   },
//   dropdownSelector: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 7,
//   },
//   dropdownText: {
//     fontSize: 13,
//     color: "#2441F0",
//     fontWeight: "500",
//   },

//   dropdownOptions: {
//     backgroundColor: "white",
//     borderRadius: 8,
//     marginTop: 4,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//     overflow: "hidden",
//   },
//   dropdownItem: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   activeDropdownItem: {
//     backgroundColor: "#d0f0fd",
//   },
//   dropdownItemText: {
//     fontSize: 14,
//     color: "#333",
//   },
//   activeDropdownItemText: {
//     color: "#2441F0",
//     fontWeight: "bold",
//   },
//  loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     height: 200,
//   },
//   dataContainer: {
//     flex: 1,
//   },
//   dealCard: {
//     backgroundColor: "white",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//     marginBottom: 14,
//     paddingBottom: 20,
//   },
//   dateText: {
//     fontSize: 13,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     color: "#A0A0A0",
//     marginBottom: 6,
//     borderBottomWidth: 0.5,
//     borderColor: "#E0E0E0",
//     backgroundColor: "#fcfcfc",
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//   },
//   typeText: {
//     color: "#004d00", // More dark green than #006400
//     paddingVertical: 4,
//     paddingHorizontal: 13,
//     backgroundColor: "#EEFFEE", // More light green than #DFFFE0
//     borderRadius: 20,
//     fontSize: 13,
//   },
//   dataRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 13,
//     paddingHorizontal: 16,
//   },
//   label: {
//     fontSize: 13,
//     color: "#999",
//     flex: 1,
//   },
//   value: {
//     fontSize: 13,
//     fontWeight: "500",
//     color: "#000",
//     flex: 1,
//     textAlign: "right",
//   },
//   priceValue: {
//     fontSize: 13,
//     fontWeight: "500",
//     color: "#008000", // More dark green than #006400
//     flex: 1,
//     textAlign: "right",
//   },
//   nameText: {
//     fontSize: 13,
//     fontWeight: "500",
//     color: "#000",
//     flex: 1,
//     textAlign: "right",
//   },
//   buyText: {
//     color: "#006400",
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     backgroundColor: "#DFFFE0",
//     borderRadius: 4,
//   },
//   sellText: {
//     color: "#8B0000",
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     backgroundColor: "#FFE0E0",
//     borderRadius: 4,
//   },
//   noDataText: {
//     textAlign: "center",
//     marginVertical: 20,
//     color: "#666",
//   },
// });

// export default CorporateEventsTable;


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { getCorporateEvents } from "../../../constants/Unfluke_helpers/backend_helper";
import { MaterialIcons as Icon } from "@expo/vector-icons";

const CorporateEventsTable = ({ isConsolidated, company }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dividend");
  const [dividendData, setDividendData] = useState([]);
  const [bonusData, setBonusData] = useState([]);
  const [splitData, setSplitData] = useState([]);
  const [insiderTradingData, setInsiderTradingData] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch all pages for a corporate event type
  const fetchAllCorporateEventData = async (type) => {
    try {
      const first = await getCorporateEvents({
        capcode: company,
        type,
        page: 1,
      });
      const totalPages = first?.pages || 0;
      let allResults = first?.results || [];
      
      if (totalPages > 1) {
        for (let p = 2; p <= totalPages; p++) {
          try {
            const next = await getCorporateEvents({
              capcode: company,
              type,
              page: p,
            });
            if (next?.results?.length)
              allResults = allResults.concat(next.results);
          } catch (err) {
            console.warn(`Partial fetch failed for ${type} page ${p}`, err);
          }
        }
      }
      return allResults;
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
      return [];
    }
  };

  // Helper: find a date key in an object
  const findDateKey = (obj) => {
    if (!obj) return null;
    return (
      Object.keys(obj).find((k) => k.toLowerCase().includes("date")) || null
    );
  };

  // Helper: sort rows so newest date first
  const sortByLatestDate = (rows) => {
    if (!rows || rows.length === 0) return rows;
    const dateKey = findDateKey(rows[0]);
    if (!dateKey) return rows;
    return [...rows].sort((a, b) => {
      const aTime = new Date(a[dateKey]).getTime();
      const bTime = new Date(b[dateKey]).getTime();
      if (isNaN(aTime) && isNaN(bTime)) return 0;
      if (isNaN(aTime)) return 1;
      if (isNaN(bTime)) return -1;
      return bTime - aTime;
    });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch dividends
        const dividends = await fetchAllCorporateEventData("Dividends");
        setDividendData(sortByLatestDate(dividends));
        console.log("dividned done")
        // Fetch bonus
        const bonus = await fetchAllCorporateEventData("Bonus");
        setBonusData(sortByLatestDate(bonus));
        console.log("bonus done")

        // Fetch stock split
        const split = await fetchAllCorporateEventData("StockSplit");
        setSplitData(sortByLatestDate(split));
        console.log("StockSplit done")

        // Fetch insider trading with variants
        const insiderTypeVariants = [
          "InsiderTrading",
          "Insider Trading",
          "Insider_Trading",
          "Insider",
        ];

        let insiderData = [];
        for (const variant of insiderTypeVariants) {
          try {
            const attempt = await fetchAllCorporateEventData(variant);
            if (attempt && attempt.length > 0) {
              insiderData = attempt;
              break;
            }
          } catch (e) {
            console.warn(`Insider variant failed: ${variant}`, e);
          }
        }
                console.log("INSIDer done")

        setInsiderTradingData(sortByLatestDate(insiderData));

      } catch (error) {
        console.error("Error fetching events data:", error);
        setDividendData([]);
        setBonusData([]);
        setSplitData([]);
        setInsiderTradingData([]);
      } finally {
        setLoading(false);
      }
    }
    
    if (company) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [company]); // Removed isConsolidated from dependencies

  console.log(loading, "asdfksgfsafds");

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const months = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  const formatValue = (value) => {
    if (!value || value === null || value === undefined) return "-";
    
    if (typeof value === "number") {
      return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    
    const numericValue = Number(String(value).trim());
    if (!isNaN(numericValue)) {
      return numericValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    
    return value.toString();
  };

  const tabs = [
    { id: "dividend", label: "Dividends" },
    { id: "bonus", label: "Bonus" },
    { id: "split", label: "Stock Split" },
    { id: "insider", label: "Insider Trading" },
  ];

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    setShowDropdown(false);
  };

  const getActiveTabLabel = () => {
    const tab = tabs.find((t) => t.id === activeTab);
    return tab ? tab.label : "Select";
  };

  const getFieldValue = (item, fieldNames) => {
    for (const fieldName of fieldNames) {
      if (item[fieldName] !== undefined && item[fieldName] !== null) {
        return item[fieldName];
      }
    }
    return "-";
  };

  const renderDividendItem = (item, index) => (
    <View style={styles.dealCard} key={index}>
      <Text style={styles.dateText}>
        Ex-Date: {formatDate(getFieldValue(item, ["Ex Dividend Date"]))}
      </Text>
      
      <View style={styles.dataRow}>
        <Text style={styles.label}>Security Type:</Text>
        <Text style={styles.value}>
          {getFieldValue(item, ["Security Type", "SecurityType", "Type"])}
        </Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Type:</Text>
        <Text style={styles.typeText}>
          {getFieldValue(item, ["Type", "Dividend Type", "DividendType"])}
        </Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Dividend %:</Text>
        <Text style={styles.value}>
          {formatValue(getFieldValue(item, ["Dividend %", "Dividend Percentage", "DividendPercentage"]))}%
        </Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Dividend Per Share:</Text>
        <Text style={styles.priceValue}>
          ₹{formatValue(getFieldValue(item, ["Dividend Per Share", "DividendPerShare", "Amount"]))}
        </Text>
      </View>
    </View>
  );

  const renderBonusItem = (item, index) => (
    <View style={styles.dealCard} key={index}>
      <Text style={styles.dateText}>
        Ex-Date: {formatDate(getFieldValue(item, ["Ex Bonus Date", "ExBonusDate", "Ex-Date"]))}
      </Text>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Record Date:</Text>
        <Text style={styles.value}>
          {formatDate(getFieldValue(item, ["Record Date", "RecordDate"]))}
        </Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Ratio:</Text>
        <Text style={styles.value}>
          {getFieldValue(item, ["Ratio", "Bonus Ratio", "BonusRatio"])}
        </Text>
      </View>
    </View>
  );

  const renderSplitItem = (item, index) => (
    <View style={styles.dealCard} key={index}>
      <Text style={styles.dateText}>
        {formatDate(getFieldValue(item, ["Source Date", "SourceDate", "Date"]))}
      </Text>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Stock Split Date:</Text>
        <Text style={styles.value}>
          {formatDate(getFieldValue(item, ["Stock Split Date", "StockSplitDate", "Split Date"]))}
        </Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Record Date:</Text>
        <Text style={styles.value}>
          {formatDate(getFieldValue(item, ["Record Date", "RecordDate"]))}
        </Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Ratio:</Text>
        <Text style={styles.value}>
          {getFieldValue(item, ["Ratio", "Split Ratio", "SplitRatio"])}
        </Text>
      </View>
    </View>
  );

  const renderInsiderTradingItem = (item, index) => (
    <View style={styles.dealCard} key={index}>
      <Text style={styles.dateText}>
       {getFieldValue(item, ["Buyer/Seller", "Name", "Acquirer/Seller", "Person Name"])}
      </Text>
      
      <View style={styles.dataRow}>
        <Text style={styles.label}>Trade Date:</Text>
        <Text style={styles.value}>
          {formatDate(getFieldValue(item, ["Trade Date", "TradeDate", "Date", "Transaction Date"]))}
        </Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Category:</Text>
        <Text style={styles.value}>
          {getFieldValue(item, ["Category", "Category of person", "Person Category"])}
        </Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Prior Trade Quantity:</Text>
        <Text style={styles.value}>
          {formatValue(getFieldValue(item, ["Prior trade Quantity", "Prior Quantity", "Pre-Transaction Quantity"]))}
        </Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Prior Trade %:</Text>
        <Text style={styles.value}>
          {formatValue(getFieldValue(item, ["Prior trade %", "Prior Percentage", "Pre-Transaction %"]))}%
        </Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Transaction Type:</Text>
        <Text style={styles.typeText}>
          {getFieldValue(item, ["Transaction Type", "Type", "Buy/Sale"])}
        </Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Total Value:</Text>
        <Text style={styles.priceValue}>
          ₹{formatValue(getFieldValue(item, ["Total Value", "Value", "Transaction Value"]))}
        </Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Post Trade Quantity:</Text>
        <Text style={styles.value}>
          {formatValue(getFieldValue(item, ["Post trade Quantity", "Post Quantity", "Post-Transaction Quantity"]))}
        </Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Post Trade %:</Text>
        <Text style={styles.value}>
          {formatValue(getFieldValue(item, ["Post trade %", "Post Percentage", "Post-Transaction %"]))}%
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const noData =
    dividendData.length === 0 &&
    bonusData.length === 0 &&
    splitData.length === 0 &&
    insiderTradingData.length === 0;

  const getActiveData = () => {
    switch (activeTab) {
      case "dividend":
        return dividendData;
      case "bonus":
        return bonusData;
      case "split":
        return splitData;
      case "insider":
        return insiderTradingData;
      default:
        return [];
    }
  };

  const renderActiveItems = () => {
    const data = getActiveData();
    if (data.length === 0) {
      return <Text style={styles.noDataText}>No data available</Text>;
    }

    switch (activeTab) {
      case "dividend":
        return data.map(renderDividendItem);
      case "bonus":
        return data.map(renderBonusItem);
      case "split":
        return data.map(renderSplitItem);
      case "insider":
        return data.map(renderInsiderTradingItem);
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Dropdown Selector */}
      <View style={styles.dropdownWrapper}>
        <View style={styles.dropdownContainer}>
          <Pressable style={styles.dropdownSelector} onPress={toggleDropdown}>
            <Text style={styles.dropdownText}>{getActiveTabLabel()}</Text>
            <Icon
              name={showDropdown ? "arrow-drop-up" : "arrow-drop-down"}
              size={24}
              color="#2441F0"
            />
          </Pressable>
        </View>

        {/* Dropdown Options */}
        {showDropdown && (
          <View style={styles.dropdownOptions}>
            {tabs.map((tab) => (
              <Pressable
                key={tab.id}
                style={[
                  styles.dropdownItem,
                  activeTab === tab.id && styles.activeDropdownItem,
                ]}
                onPress={() => handleTabSelect(tab.id)}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    activeTab === tab.id && styles.activeDropdownItemText,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Content Area */}
      {noData ? (
        <Text style={styles.noDataText}>No data available</Text>
      ) : (
        <ScrollView style={styles.dataContainer}>
          {renderActiveItems()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dropdownWrapper: {
    marginBottom: 26,
    marginTop: 20,
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  dropdownSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  dropdownText: {
    fontSize: 13,
    color: "#2441F0",
    fontWeight: "500",
  },
  dropdownOptions: {
    backgroundColor: "white",
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeDropdownItem: {
    backgroundColor: "#d0f0fd",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#333",
  },
  activeDropdownItemText: {
    color: "#2441F0",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
  dataContainer: {
    flex: 1,
  },
  dealCard: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 14,
    paddingBottom: 20,
  },
  dateText: {
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#A0A0A0",
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#fcfcfc",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  typeText: {
    color: "#004d00",
    paddingVertical: 4,
    paddingHorizontal: 13,
    backgroundColor: "#EEFFEE",
    borderRadius: 20,
    fontSize: 13,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 13,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 13,
    color: "#999",
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: "500",
    color: "#000",
    flex: 1,
    textAlign: "right",
  },
  priceValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#008000",
    flex: 1,
    textAlign: "right",
  },
  nameText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#000",
    flex: 1,
    textAlign: "right",
  },
  buyText: {
    color: "#006400",
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#DFFFE0",
    borderRadius: 4,
  },
  sellText: {
    color: "#8B0000",
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#FFE0E0",
    borderRadius: 4,
  },
  noDataText: {
    textAlign: "center",
    marginVertical: 20,
    color: "#666",
  },
});

export default CorporateEventsTable;
