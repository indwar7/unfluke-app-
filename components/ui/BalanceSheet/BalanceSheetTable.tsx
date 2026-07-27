import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Collapsible from "react-native-collapsible";
import RNPickerSelect from "react-native-picker-select";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { getBalanceSheetData } from "../../../constants/Unfluke_helpers/backend_helper";
import MyCollapse from "./BalanceCollapse";

const BalanceSheetTable = ({ isConsolidated, company }) => {
  const route = useRoute();
  const [headings, setHeadings] = useState([]);
  const [results, setResults] = useState({});
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getBalanceSheetData({
          type: isConsolidated ? "C" : "S",
          capcode: company,
        });
        setHeadings(result.headings || []);
        setResults(result.results || {});
        const yrs = Object.keys(result.results || {}).sort();
        setYears(yrs);
        if (yrs.length) setSelectedYear(yrs[yrs.length - 1]);
      } catch {
        setHeadings([]);
        setResults({});
        setYears([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [company, isConsolidated]);

const formatValue = (val) => {
  if (typeof val === "number") {
    // Format with American numbering system
    const formatted = val.toLocaleString("en-US", {
      minimumFractionDigits: Number.isInteger(val) ? 0 : 2,
      maximumFractionDigits: 2,
    });
    return formatted;
  }
  return val || "-";
};



  const getValue = (year, name, parent) => {
    const arr = results[year] || [];
    if (!parent) {
      const obj = arr.find((o) => name in o);
      return obj ? formatValue(obj[name]) : "-";
    }
    let found = false;
    for (const o of arr) {
      if (parent in o) found = true;
      if (found && name in o) return formatValue(o[name]);
    }
    return "-";
  };

  const toggleSection = (name) => {
    setExpandedSections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
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
      <Text style={styles.headerText}>Balance Sheet ({selectedYear})</Text>

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
          <MyCollapse
            key={index}
            item={item}
            yr={selectedYear}
            getValue={getValue}
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
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 13,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    color: "#111827",
    paddingRight: 30, // to ensure the text is never behind the icon
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

export default BalanceSheetTable;
