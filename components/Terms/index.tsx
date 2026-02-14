import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, ScrollView, Image, Text, Dimensions, TouchableOpacity, useWindowDimensions } from "react-native";
import Hero from "./Hero";
import Conditions from "./TermsConditions/Conditions";
import { policy } from "./data"; // dummy data
import Refund from "./Refund/Refund";
import Privacy from "./Privacy/Privacy";

const logo = require("../../assets/images/unfluke/UNFLUKE -01.png");


const Terms = () => {
  const [activePage, setActivePage] = useState("terms"); // default: terms
  const scrollRef = useRef(null);
const { width, height } = useWindowDimensions()

  const renderPage = () => {
    switch (activePage) {
      case "terms":
        return <Conditions policy={policy} />;
      case "refund":
        return <Refund />;
      case "privacy":
        return <Privacy />;
      default:
        return null;
    }
  };

  // Dynamic title for Hero
  const getHeroTitle = () => {
    switch (activePage) {
      case "terms":
        return "Terms and Conditions";
      case "refund":
        return "Refund Policy";
      case "privacy":
        return "Privacy Policy";
      default:
        return "";
    }
  };

  // Scroll to top whenever activePage changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [activePage]);

  return (
    <View style={[styles.container,{        paddingTop: height * 0.09,
}]}>
      {/* Navbar */}
      {/* <View style={styles.navbar}>
        <Image source={logo} style={styles.logo} />
      </View> */}
      {/* Body with Footer */}
      <ScrollView
        ref={scrollRef}
        style={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Hero title={getHeroTitle()} />
        {renderPage()}
        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => setActivePage("terms")}>
            <Text style={styles.footerLink}>Terms and Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActivePage("refund")}>
            <Text style={styles.footerLink}>Refund Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActivePage("privacy")}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  logo: {
    width: 130,
    height: 70,
    resizeMode: "contain",
  },
  body: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    paddingBottom: 28,
    backgroundColor: "#2563eb", // Blue footer
  },
  footerLink: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Terms;
