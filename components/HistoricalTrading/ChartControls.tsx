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
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#1E222D',
    borderRadius: 12,
    marginHorizontal: 'auto',
  },
  contentWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  contentContainer: {
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D1D4DC',
  },
  currentTime: {
    fontSize: 20,
    color: '#D1D4DC',
    fontWeight: '600',
  },
});

export default ChartControls;