import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from "react-native";
import { useSelector } from "react-redux";
import {Image} from "expo-image"
import { useWindowDimensions } from "react-native";


// Custom CountUp component
const AnimatedCounter = ({ value, decimals, duration = 1500, style }) => {


  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    // Clear any existing animation
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    const startValue = displayValue;
    const endValue = value;
    const startTime = Date.now();
    startTimeRef.current = startTime;

    const updateValue = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTimeRef.current;
      
      if (elapsedTime >= duration) {
        setDisplayValue(endValue);
        return;
      }
      
      const progress = elapsedTime / duration;
      const nextValue = startValue + (endValue - startValue) * progress;
      setDisplayValue(nextValue);
      
      frameRef.current = requestAnimationFrame(updateValue);
    };
    
    frameRef.current = requestAnimationFrame(updateValue);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  return (
    <Text style={style}>
      {displayValue.toFixed(decimals)}
    </Text>
  );
};

// Your GIF imports remain the same
const layers_gif = require("../../assets/gifs/layers-hover-slide.gif");
const barChart_gif = require("../../assets/gifs/bar-chart-hover-growth.gif");
const globe_gif = require("../../assets/gifs/globe-hover-rotate.gif");
const coins_gif = require("../../assets/gifs/coins-hover-jump.gif");

const Widgets = () => {
    const { width } = useWindowDimensions();

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Selectors
  const wallet = useSelector(state => state.Wallet || {});
  const user = useSelector(state => state.Login?.user || {});

  const [cardWidgets, setCardWidgets] = useState([]);

  useEffect(() => {
    setCardWidgets([
      {
        id: 1,
        label: "STRATEGY EARNINGS",
        iconUrl: barChart_gif,
        counter: wallet.strategyEarnings || 0,
        caption: "Earned by selling Strategies",
        suffix: "₹",
        decimals: 2,
      },
      {
        id: 2,
        label: "BROKERAGE EARNINGS",
        iconUrl: layers_gif,
        counter: wallet.myEarnings || 0,
        caption: "Earned by referring others",
        suffix: "₹",
        decimals: 2,
      },
      {
        id: 3,
        label: "CURRENT SHARE",
        iconUrl: globe_gif,
        counter: user?.percentageShare || 0,
        caption: "My Percentage Share",
        suffix: "%",
        decimals: 2,
      },
      {
        id: 4,
        label: "TOTAL",
        iconUrl: coins_gif,
        counter: (wallet.strategyEarnings || 0) + (wallet.myEarnings || 0),
        caption: "My Total Earnings",
        suffix: "₹",
        decimals: 2,
      },
    ]);
  }, [wallet, user]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
      {cardWidgets.map((item) => (
        <View
          key={item.id}
          style={[
            styles.card, 
            isDarkMode ? styles.darkCard : styles.lightCard,{width: width * 0.7}
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[
              styles.label,
              isDarkMode ? styles.darkText : styles.lightText
            ]}>
              {item.label}
            </Text>
            <Image 
              source={item.iconUrl} 
              style={styles.icon} 
              contentFit="contain" 
            />
            
          </View>
          <View style={styles.cardContent}>
            <View style={styles.counterContainer}>
              {/* Use our custom AnimatedCounter */}
              <AnimatedCounter
                value={parseFloat(item.counter)}
                decimals={item.decimals}
                style={[
                  styles.counter,
                  isDarkMode ? styles.darkText : styles.lightText
                ]}
              />
              <Text style={[
                styles.suffix,
                isDarkMode ? styles.darkText : styles.lightText
              ]}>
                {item.suffix}
              </Text>
            </View>
            <Text style={[
              styles.caption,
              isDarkMode ? styles.darkCaption : styles.lightCaption
            ]}>
              {item.caption}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// Your styles remain the same
const styles = StyleSheet.create({
  scrollViewContent: {
    marginTop:10,
    paddingHorizontal: 2,
    paddingVertical: 8,
  },
  card: {
    borderRadius: 7,
    paddingHorizontal: 16,
    paddingVertical:14,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
    justifyContent: "space-between",
  },
  lightCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  darkCard: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    flex: 1,
    marginRight: 8,
  },
  lightText: {
    color: "#4B5563",
  },
  darkText: {
    color: "#D1D5DB",
  },
  icon: {
    width: 24,
    height: 24,
  },
  cardContent: {
    // Content styles
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  counter: {
    fontSize: 24,
    fontWeight: "bold",
  },
  suffix: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 2,
  },
  caption: {
    fontSize: 12,
  },
  lightCaption: {
    color: "#6B7280",
  },
  darkCaption: {
    color: "#9CA3AF",
  },
});

export default Widgets;