import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronDown, Plus } from "react-native-feather";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const QuaterlyResultsCollapse = ({ item, getValue, yr }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { title, children, isThick } = item;
  const { colors: c } = useTheme();
  const styles = makeStyles(c);


  const toggleCollapse = () => {
    if (children?.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <View style={[styles.container, isThick]}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleCollapse}
        activeOpacity={0.8}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Plus width={13} height={13} color={c.info} style={styles.plusIcon} />
            <Text style={[styles.titleText, isThick && styles.boldText]}>
              {title}
            </Text>
          </View>

          <View style={styles.valueContainer}>
            <Text style={[styles.valueText, isThick && styles.boldText]}>
              {getValue(yr, title)}
            </Text>
            {children?.length > 0 && (
              <ChevronDown
                width={16}
                height={16}
                color={c.textMuted}
                style={[styles.chevron, isOpen && styles.chevronOpen]}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {isOpen && children?.length > 0 && (
        <View style={styles.childrenContainer}>
          {children.map((child, index) => (
            <View key={index} style={styles.childItem}>
              <Text style={styles.childText}>{child}</Text>
              <Text style={styles.childValue}>
                {getValue(yr, child, title)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const makeStyles = (c: AppColors) => StyleSheet.create({
  container: {
    marginBottom: 13,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.card,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusIcon: {
    marginLeft: 12,
  },
  titleText: {
    fontSize: 12,
    color: c.textSecondary,
    marginLeft: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 12,
  },
  valueText: {
    fontSize: 12,
    color: c.text,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  childrenContainer: {
    marginTop: -7,
    marginBottom: -4,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: c.border,
    paddingBottom: 8,
    paddingTop: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  childItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginTop: -2,
    paddingHorizontal: 24,
  },
  childText: {
    fontSize: 12,
    color: c.text,
  },
  childValue: {
    fontSize: 12,
    color: c.text,
  },


  boldText: {
    fontWeight: "bold",
    color: c.text,
  },

});

export default QuaterlyResultsCollapse;
