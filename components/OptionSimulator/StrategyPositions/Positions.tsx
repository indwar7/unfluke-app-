import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Checkbox } from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const PositionItem = ({ position, onToggle, onDelete, onEdit }) => {
  const { colors: c, isDark } = useTheme();

  const styles = getStyles(c, isDark);
  console.log("position is this",position)
  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <View style={styles.checkboxContainer}>
        <Checkbox
          value={position.isActive}
          onValueChange={() => onToggle(position.id)}
          style={styles.checkbox}
          color={position.isActive ? c.gold : undefined}
        />
      </View>

      {/* Buy/Sell Indicator */}
      <View style={styles.indicatorContainer}>
        <View style={[
          styles.indicator,
          position.type === "Buy" ? styles.buyIndicator : styles.sellIndicator
        ]}>
          <Text style={styles.indicatorText}>
            {position.type === "Buy" ? "B" : "S"}
          </Text>
        </View>
      </View>

      {/* Position Details */}
      <View style={styles.detailsContainer}>
        <Text 
          style={styles.positionText}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {position.lotQuantity}x {position.expiry} {position.strike}
          {position.cepe} - ₹{position.ltp}{` (${position.currentPrice || "-"})`}
        </Text>
      </View>

      {/* Delete Button */}
      <View style={styles.deleteContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(position.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="trash"
            size={16}
            color={c.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
    marginBottom: 8,
    backgroundColor: c.surface,
    borderRadius: 12,
    minHeight: 60,
  },
  checkboxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkbox: {
    width: 16,
    height: 16,
  },
  indicatorContainer: {
    marginRight: 12,
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyIndicator: {
    backgroundColor: c.profit,
  },
  sellIndicator: {
    backgroundColor: c.loss,
  },
  indicatorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsContainer: {
    flex: 1,
    marginRight: 12,
  },
  positionText: {
    fontSize: 14,
    fontWeight: '500',
    color: c.text,
    lineHeight: 18,
    fontVariant: ['tabular-nums'],
  },
  deleteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PositionItem;