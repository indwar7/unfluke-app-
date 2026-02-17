import React from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  useColorScheme 
} from "react-native";
import { Checkbox } from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';

const PositionItem = ({ position, onToggle, onDelete, onEdit }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const styles = getStyles(isDark);
  console.log("position is this",position)
  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <View style={styles.checkboxContainer}>
        <Checkbox
          value={position.isActive}
          onValueChange={() => onToggle(position.id)}
          style={styles.checkbox}
          color={position.isActive ? '#2563eb' : undefined}
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
            color={isDark ? '#9ca3af' : '#6b7280'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (isDark) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
    marginBottom: 8,
    backgroundColor: isDark ? '#111827' : '#eff6ff',
    borderRadius: 8,
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
    backgroundColor: '#10b981',
  },
  sellIndicator: {
    backgroundColor: '#ef4444',
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
    color: isDark ? '#f3f4f6' : '#1f2937',
    lineHeight: 18,
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