import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const AdvancedMTM = ({ handleChange }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const dynamicStyles = styles(isDark);

  const advancedState = useSelector((store) => store.AdvancedBacktester);
  const dispatch = useDispatch();

  return (
    <View style={dynamicStyles.card}>
      {/* Card Header */}
      <View style={dynamicStyles.cardHeader}>
        <Text style={dynamicStyles.headerTitle}>MTM</Text>
      </View>

      {/* Card Body */}
      <View style={dynamicStyles.cardBody}>
        <View style={dynamicStyles.formRow}>
          {/* MTM Target */}
          <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>MTM Target</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Target"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              keyboardType="numeric"
              value={
                advancedState.mtm.target !== null &&
                advancedState.mtm.target !== undefined
                  ? advancedState.mtm.target.toString()
                  : ''
              }
              onChangeText={(text) =>
                handleChange({
                  target: {
                    name: 'mtm.target',
                    value: text,
                  },
                })
              }
            />
          </View>

          {/* MTM Stoploss */}
          <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>MTM Stoploss</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="SL"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              keyboardType="numeric"
              value={
                advancedState.mtm.stoploss !== null &&
                advancedState.mtm.stoploss !== undefined
                  ? advancedState.mtm.stoploss.toString()
                  : ''
              }
              onChangeText={(text) =>
                handleChange({
                  target: {
                    name: 'mtm.stoploss',
                    value: text,
                  },
                })
              }
            />
          </View>

          {/* MTM Trailing SL */}
          <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>MTM Trailing SL</Text>
            <View style={dynamicStyles.trailingContainer}>
              <TextInput
                style={[dynamicStyles.input, dynamicStyles.trailingInput]}
                placeholder="Trailing SL X"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                keyboardType="numeric"
                value={
                  advancedState.mtm.trailX !== null &&
                  advancedState.mtm.trailX !== undefined
                    ? advancedState.mtm.trailX.toString()
                    : ''
                }
                onChangeText={(text) =>
                  handleChange({
                    target: {
                      name: 'mtm.trailX',
                      value: text,
                    },
                  })
                }
              />

              <TextInput
                style={[dynamicStyles.input, dynamicStyles.trailingInput]}
                placeholder="Trailing SL Y"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                keyboardType="numeric"
                value={
                  advancedState.mtm.trailY !== null &&
                  advancedState.mtm.trailY !== undefined
                    ? advancedState.mtm.trailY.toString()
                    : ''
                }
                onChangeText={(text) =>
                  handleChange({
                    target: {
                      name: 'mtm.trailY',
                      value: text,
                    },
                  })
                }
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = (isDark) =>
  StyleSheet.create({
    card: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#E5E7EB',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#111827',
    },
    cardBody: {
      padding: 16,
    },
    formRow: {
      flexDirection: 'column',
      gap: 16,
    },
    formGroup: {
      flex: 1,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? '#D1D5DB' : '#374151',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#111827',
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    },
    trailingContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    trailingInput: {
      flex: 1,
    },
  });

export default AdvancedMTM;