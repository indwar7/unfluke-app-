import React from "react";
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from "react-native";

const Conditions = ({ policy }) => {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768; // Rough breakpoint for lg

  return (
    <ScrollView contentContainerStyle={styles.section}>
      <View style={styles.container}>
        {(policy || []).map((pol, index) => (
          <View
            key={index.toString()}
            style={[
              styles.row,
              isLargeScreen ? styles.rowLarge : styles.rowSmall,
            ]}
          >
            <View style={styles.cardContent}>
              <Text style={styles.title}>{pol.title}</Text>
              <Text style={styles.description}>{pol.discription}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: 20,
    marginTop: 10,
    backgroundColor: "#fff",
  },
  container: {
    paddingHorizontal: 16,
    width: "100%",
  },
  row: {
    width: "100%",
    marginBottom: 20,
  },
  rowLarge: {
    alignItems: "flex-start",
    paddingRight: 20,
    marginTop: 30,
  },
  rowSmall: {
    marginTop: 16,
  },
  cardContent: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#6c757d", // muted text
    textAlign: "center",
  },
});

export default Conditions;
