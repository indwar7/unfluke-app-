import React from "react";
import { View, Text, StyleSheet, Image, useWindowDimensions } from "react-native";
import Svg, { G, Path } from 'react-native-svg';

const Hero = ({title}) => {

  return (
    <View style={styles.section}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingTop:50,
    paddingBottom: 32,
    backgroundColor: "#f8f9fa",
    marginTop:3
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#000",
  },
  shapeBottom: {
    alignSelf: "center",
  },
});

export default Hero;
