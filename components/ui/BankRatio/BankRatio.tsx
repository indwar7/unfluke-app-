import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRoute } from "@react-navigation/native";
import {
  getBankingData,
} from "../../../Unfluke_helpers/backend_helper";
import BankRatioCollapse from "./BankRatioCollapse";

const thickBorderRows = ["Operating Profit", "Profit Before Tax", "Net Profit"];

const BankRatio = ({ isConsolidated, company, onDataCheck }) => {
  const route = useRoute();
  const [headings, setHeadings] = useState([]);
  const [results, setResults] = useState({});
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    async function getData() {
      setLoading(true);
      try {
        const result = await getBankingData({
          type: isConsolidated ? "C" : "S",
          capcode: company,
        });

        console.log("bank data", result);

        const hasData = result && Object.keys(result.results || {}).length > 0;
        onDataCheck?.(hasData);

        setHeadings(result.headings || []);
        setResults(result.results || {});
        const yrs = Object.keys(result.results || {}).sort();
        setYears(yrs);
        if (yrs.length) setSelectedYear(yrs[yrs.length - 1]);
      } catch (error) {
        setHeadings([]);
        setResults({});
        setYears([]);
        onDataCheck?.(false);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, [company, isConsolidated]);

  const formatValue = (val) => {
    if (typeof val === "number") {
      return !Number.isInteger(val) ? val.toFixed(2) : val.toString();
    }
    return val || "-";
  };

  // Returns the value for a given row name and year, or "-" if not found
  const getValue = (year, rowName) => {
    const yearData = results[year];
    if (!yearData) return "-";
    for (const obj of yearData) {
      if (rowName in obj) return formatValue(obj[rowName]);
    }
    return "-";
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

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Bank Ratio ({selectedYear})</Text>

      <View style={styles.pickerContainer}>
        <RNPickerSelect
          onValueChange={(value) => setSelectedYear(value)}
          items={years.slice(-10).map((yr) => ({ label: yr, value: yr }))}
          value={selectedYear}
          style={styles}
          useNativeAndroidPickerStyle={false}
          placeholder={{}}
          Icon={() => {
            return (
              <View style={{ marginTop: 6 }}>
                <Icon name="arrow-drop-down" size={24} color="#6b7280" />
              </View>
            );
          }}
        />
      </View>

      <ScrollView style={styles.tableContainer}>
        {headings.map((item, index) => (
          <BankRatioCollapse
            key={index}
            item={item}
            yr={selectedYear}
            getValue={getValue}
            thickBorderRows={thickBorderRows}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 2,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  inputIOS: {
    fontSize: 13,
    paddingVertical: 8,
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
  placeholder: {
    color: "#9ca3af",
    fontSize: 13,
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: 8,
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
  },
});

export default BankRatio;