import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { getCFRatiosData } from "../../../constants/Unfluke_helpers/backend_helper";
import LineChartComponent from "./LineChart";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const RATIO_CATEGORIES = {
  "Activity Ratios": {
    sections: ["KeyFinancial", "Calculated"],
    fields: [
      "Fixed Assets Turnover Ratio",
      "Inventory Turnover Ratio",
      "Debtors Turnover Ratio",
      "Total Asset Turnover Ratio",
      "Sales/Net Assets"
    ]
  },
  "Efficiency Ratios": {
    sections: ["KeyFinancial", "Calculated"],
    fields: [
      "Debtors Velocity (Days)",
      "Creditors Velocity (Days)",
      "Inventory Velocity (Days)"
    ]
  },
  "Leverage Ratios": {
    sections: ["KeyFinancial", "DuPont", "Calculated"],
    fields: [
      "Debt-Equity Ratio",
      "Long Term Debt-Equity Ratio",
      "Interest Cover Ratio",
      "Net Assets/Net Worth",
      "Financial Leverage",
      "Return on Invested Capital (ROIC)"
    ]
  },
  "Liquidity Ratios": {
    sections: ["KeyFinancial", "Calculated"],
    fields: [
      "Current Ratio",
      "Quick Ratio",
      "Cash Conversion Cycle",
      "Working Capital Days"
    ]
  },
  "Profitability Ratios": {
    sections: ["KeyFinancial", "DuPont", "Calculated"],
    fields: [
      "PBIDTM (%)",
      "PBITM (%)",
      "PBDTM (%)",
      "CPM (%)",
      "APATM (%)",
      "ROCE (%)",
      "RONW (%)",
      "Payout (%)",
      "PBIDT/Sales(%)",
      "PBDIT/Net Assets",
      "PAT/PBIDT(%)",
      "ROE(%)",
      "Return on Assets (ROA)",
      "Earning Power"
    ]
  },
  "Valuation Ratios": {
    sections: ["Valuation1", "Valuation2", "ValuationCalculated"],
    fields: [
      "Price Earning (P/E)",
      "Price to Book Value ( P/BV)",
      "Price/Cash EPS (P/CEPS)",
      "EV/EBIDTA",
      "Market Cap/Sales",
      "Price to Free Cash Flows to Equity",
      "Price to Free Cash Flows to the Firm",
      "Dividend Yield",
      "Graham Number",
      "Industry PE",
      "Industry PBV"
    ]
  }
};

// MobRatioTable component without accordion
const MobRatioTable = ({ category, items, selectedYear, formatValue }) => {
  const importantRatios = [
    "ROCE (%)", 
    "ROE(%)", 
    "Debt-Equity Ratio",
    "Current Ratio",
    "Quick Ratio",
    "Price Earning (P/E)"
  ];

  return (
    <View style={styles.categoryContent}>
      <View style={styles.categoryTableHeader}>
        <Text style={styles.categoryTableHeaderText}>Ratio</Text>
        <Text style={styles.categoryTableHeaderText}>Value</Text>
      </View>
      
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${category}-${index}`}
        scrollEnabled={false}
        renderItem={({ item, index }) => {
          const isImportant = importantRatios.includes(item.title);
          
          return (
            <View
              style={[
                styles.categoryTableRow,
                index % 2 === 0 ? styles.evenRow : styles.oddRow,
              ]}
            >
              <Text style={[
                styles.categoryRowTitle,
                isImportant && styles.boldText
              ]}>
                {item.title}
              </Text>
              <Text style={[
                styles.categoryRowValue,
                isImportant && styles.boldText
              ]}>
                {formatValue(item.values[selectedYear])}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};

const RatiosTable = ({ isConsolidated, company }) => {
  const route = useRoute();
  const [categoryData, setCategoryData] = useState({});
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        // Load data for all required sections
        const sectionPromises = Object.values(RATIO_CATEGORIES)
          .flatMap(category => category.sections)
          .filter((value, index, self) => self.indexOf(value) === index)
          .map(section => 
            getCFRatiosData({
              type: isConsolidated ? "C" : "S",
              capcode: company,
              section: section
            })
          );

        const allResults = await Promise.all(sectionPromises);
        
        const combinedData = {};
        const allYears = new Set();
        
        allResults.forEach(result => {
          if (!result || !result.results) return;
          
          Object.entries(result.results).forEach(([year, yearData]) => {
            allYears.add(year);
            if (!combinedData[year]) combinedData[year] = [];
            combinedData[year].push(...yearData);
          });
        });

        const sortedYears = Array.from(allYears).sort();
        setYears(sortedYears);
        
        if (sortedYears.length > 0) {
          setSelectedYear(sortedYears[sortedYears.length - 1]);
        }

        const organizedData = {};
        Object.entries(RATIO_CATEGORIES).forEach(([category, { fields }]) => {
          organizedData[category] = fields.map(field => ({
            title: field,
            values: {}
          }));
        });

        Object.entries(combinedData).forEach(([year, yearData]) => {
          yearData.forEach(item => {
            Object.entries(RATIO_CATEGORIES).forEach(([category, { fields }]) => {
              fields.forEach(field => {
                if (item[field] !== undefined) {
                  const categoryItem = organizedData[category].find(i => i.title === field);
                  if (categoryItem) {
                    categoryItem.values[year] = item[field];
                  }
                }
              });
            });
          });
        });

        setCategoryData(organizedData);

        // Prepare chart data for key ratios
        const chartFields = ["ROCE (%)", "ROE(%)", "PBIDT/Sales(%)"];
        const processed = chartFields.map(field => {
          const data = sortedYears.map(year => {
            for (const category in organizedData) {
              const item = organizedData[category].find(i => i.title === field);
              if (item && item.values[year] !== undefined) {
                return item.values[year];
              }
            }
            return null;
          });
          
          return {
            title: field,
            categories: sortedYears.map(year => {
              const y = year.toString().slice(0, 4);
              const m = parseInt(year.toString().slice(4, 6)) - 1;
              return `${monthNames[m]} ${y}`;
            }),
            data: data
          };
        });

        setChartData(processed);
      } catch (error) {
        console.error("Error loading ratio data:", error);
        setCategoryData({});
        setYears([]);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, [company, isConsolidated]);

  const formatValue = (val) => {
    if (val === undefined || val === null) return "-";
    return typeof val === "number" ? val.toFixed(2) : val;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (years.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const yearOptions = years.slice(-10).map(year => {
    const y = year.toString().slice(0, 4);
    const m = parseInt(year.toString().slice(4, 6)) - 1;
    return {
      label: `${monthNames[m]} ${y}`,
      value: year.toString(),
    };
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Key Ratios</Text>

      {/* Chart Section */}
      <View style={styles.chartContainer}>
        {chartData.map((chart, index) => (
          <View key={index} style={styles.chartItem}>
            <LineChartComponent
              title={chart.title}
              categories={chart.categories}
              data={chart.data}
            />
          </View>
        ))}
      </View>

      {/* Year Picker */}
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
              <Icon name="arrow-drop-down" size={24} color="#6b7280" />
            </View>
          )}
        />
      </View>

      {/* Categories without Accordion */}
      <View style={styles.categoriesContainer}>
        {Object.entries(categoryData).map(([category, items]) => (
          <View key={category} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category}</Text>
            </View>
            
            <MobRatioTable 
              category={category}
              items={items}
              selectedYear={selectedYear}
              formatValue={formatValue}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 13,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    color: "#111827",
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 13,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    color: "#111827",
    paddingRight: 30,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
  noDataContainer: {
    padding: 16,
    alignItems: "center",
  },
  noDataText: {
    color: "#6b7280",
    fontSize: 14,
  },
  headerText: {
  fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  
  // Chart styles
  chartContainer: {
    marginBottom: 16,
  },
  chartItem: {
    width: '100%',
    marginBottom: 12,
  },

  // Picker styles
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  // Category styles (no accordion)
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // elevation: 1,
  },
  categoryHeader: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#f3f4f6",
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },

  // Category content table styles
  categoryContent: {
    backgroundColor: "white",
  },
  categoryTableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  categoryTableHeaderText: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#6b7280",
    textTransform: "uppercase",
  },
  categoryTableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  evenRow: {
    backgroundColor: "white",
  },
  oddRow: {
    backgroundColor: "#f9fafb",
  },
  categoryRowTitle: {
    color: "#374151",
    flex: 1,
    fontSize: 13,
    paddingRight: 8,
  },
  categoryRowValue: {
    color: "#6b7280",
    textAlign: "right",
    fontSize: 13,
    fontWeight: "500",
  },
  boldText: {
    fontWeight: "bold",
    color: "#111827",
  },
});

export default RatiosTable;