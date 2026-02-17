import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import HistoricalDateTime from "../../components/UnflukeMain/Common/HistoricalDateTime";

const ChartControls = () => {
  //const [selectedDate, setSelectedDate] = useState(null);

  // const formatDateTime = (date) => {
  //   const options = {
  //     day: "2-digit",
  //     month: "short",
  //     year: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //   };
  //   return date
  //     ? date.toLocaleDateString("en-GB", options).replace(/,/g, "")
  //     : "";
  // };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.contentContainer}>
          {/* Title + DateTime Picker in one row */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>
              Historical Charts
            </Text>
            {/* <HistoricalDateTime
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            /> */}
          </View>
          {/* <View>
            <Text
              style={styles.currentTime}
              id="currentHistoricalTime"
            >
              {formatDateTime(selectedDate)}
            </Text>
          </View> */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D1D5DB', // border-gray-300, dark mode will be handled separately
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 'auto',
    // Note: Dark mode styles would need to be handled with a theme context or state
  },
  contentWrapper: {
    paddingHorizontal: 16, // px-4 (4 * 4 = 16)
    paddingVertical: 16,   // py-4 (4 * 4 = 16)
    borderRadius: 8,
    // For md screens and up, paddingHorizontal would be 24 (px-6)
  },
  contentContainer: {
    gap: 16, // space-y-4 equivalent
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,        // text-xl
    fontWeight: 'bold',  // font-bold
    color: '#1F2937',    // text-gray-800
    // Dark mode: color: '#E5E7EB' (text-gray-200)
  },
  currentTime: {
    fontSize: 20,        // text-xl
    color: '#000000',    // text-black
    fontWeight: '600',   // font-semibold
    // Dark mode: color: '#9CA3AF' (text-gray-400)
  },
});

export default ChartControls;