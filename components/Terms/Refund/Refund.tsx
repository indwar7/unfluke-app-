import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, useWindowDimensions } from "react-native";


const Refund = () => {

  const { height } = useWindowDimensions()

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer,{    minHeight: height * 0.67, 
}]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.paragraph}>
          Please read the subscription terms and conditions carefully before
          subscribing to any of the subscription plans, as once you have
          subscribed you cannot change, cancel your subscription plan. Once you
          subscribe and make the required payment, it shall be final and there
          cannot be any changes or modifications to the same and neither will
          there be any refund.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  paragraph: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 20,
  },
});

export default Refund;
