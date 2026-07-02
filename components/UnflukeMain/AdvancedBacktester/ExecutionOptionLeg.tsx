import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSelector, useDispatch } from 'react-redux';
import { deepCopy } from '../BasicBacktester/StrategyLegs/utils';
import { handleUpdateExecutionLeg } from '../../../redux/slices/advancedBacktester/reducer';
import { advancedTPSLUnits, strikeOptions } from '../Utils/common_vars';

const ExecutionOptionLeg = ({ entryexit, parentLegIndex, legIndex }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const dynamicStyles = styles(isDark);

  const advancedState = useSelector((store) => store.AdvancedBacktester);
  const [legInfo, setLegInfo] = useState({});
  const dispatch = useDispatch();

  const handleExecutionLegChange = (e) => {
    const tmpState = deepCopy(legInfo);
    const name = e.target.name;
    const value = e.target.value;

    switch (name) {
      case 'buysell':
        tmpState.buysell = tmpState.buysell === 'Buy' ? 'Sell' : 'Buy';
        break;
      case 'direction':
        tmpState.direction = tmpState.direction === 'CE' ? 'PE' : 'CE';
        break;
      case 'target':
        tmpState.target = parseFloat(value);
        break;
      case 'sl':
        tmpState.sl = parseFloat(value);
        break;
      case 'trailing.x':
        tmpState.trailing.x = parseFloat(value);
        break;
      case 'trailing.y':
        tmpState.trailing.y = parseFloat(value);
        break;
      case 'strikeType':
        if (value === 'based_on_atm') {
          tmpState.strikeValue = tmpState.strikeAtm;
        } else {
          tmpState.strikeValue = tmpState.strikePremium;
        }
        tmpState[name] = value;
        break;
      case 'strikeAtm':
        tmpState.strikeAtm = value;
        tmpState.strikeValue = value;
        break;
      case 'strikePremium':
        tmpState.strikePremium = parseInt(value);
        tmpState.strikeValue = value;
        break;
      default:
        tmpState[name] = value;
    }

    dispatch(
      handleUpdateExecutionLeg({
        type: entryexit,
        parentIndex: parentLegIndex,
        subIndex: legIndex,
        legInfo: tmpState,
      })
    );
  };

  useEffect(() => {
    if (advancedState.legs) {
      const parentLegState = advancedState.legs[entryexit][parentLegIndex];

      if (parentLegState && parentLegState['optionLegs']) {
        const tmp = parentLegState['optionLegs'][legIndex];
        setLegInfo(tmp);
      }
    }
  }, [advancedState]);

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.divider} />
      <Text style={dynamicStyles.title}>Leg {legIndex + 1}</Text>

      {legInfo && (
        <View style={dynamicStyles.content}>
          {/* Direction & Buy/Sell Row */}
          <View style={dynamicStyles.row}>
            {/* Direction */}
            <View style={dynamicStyles.column}>
              <Text style={dynamicStyles.label}>Direction</Text>
              <TouchableOpacity
                style={[
                  dynamicStyles.toggleButton,
                  legInfo.direction === 'CE'
                    ? dynamicStyles.ceButton
                    : dynamicStyles.peButton,
                ]}
                onPress={() =>
                  handleExecutionLegChange({
                    target: { name: 'direction', value: legInfo.direction },
                  })
                }
              >
                <Text style={dynamicStyles.toggleButtonText}>
                  {legInfo.direction}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Buy/Sell */}
            <View style={dynamicStyles.column}>
              <Text style={dynamicStyles.label}>Buy/Sell</Text>
              <TouchableOpacity
                style={[
                  dynamicStyles.toggleButton,
                  legInfo.buysell === 'Sell'
                    ? dynamicStyles.sellButton
                    : dynamicStyles.buyButton,
                ]}
                onPress={() =>
                  handleExecutionLegChange({
                    target: { name: 'buysell', value: legInfo.buysell },
                  })
                }
              >
                <Text style={dynamicStyles.toggleButtonText}>
                  {legInfo.buysell}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Strike */}
          <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>Strike</Text>
            <View style={dynamicStyles.inputGroup}>
              <View style={dynamicStyles.pickerWrapper}>
                <Picker
                  selectedValue={legInfo.strikeType}
                  onValueChange={(value) =>
                    handleExecutionLegChange({
                      target: { name: 'strikeType', value },
                    })
                  }
                  style={dynamicStyles.picker}
                >
                  <Picker.Item label="Based on ATM" value="based_on_atm" />
                  <Picker.Item label="Based on premium" value="based_on_premium" />
                </Picker>
              </View>

              {legInfo.strikeType === 'based_on_premium' ? (
                <TextInput
                  style={dynamicStyles.inputGroupInput}
                  placeholder="Closest"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  keyboardType="numeric"
                  value={legInfo.strikePremium?.toString() || ''}
                  onChangeText={(text) =>
                    handleExecutionLegChange({
                      target: { name: 'strikePremium', value: text },
                    })
                  }
                />
              ) : (
                <View style={dynamicStyles.pickerWrapper}>
                  <Picker
                    selectedValue={legInfo.strikeAtm}
                    onValueChange={(value) =>
                      handleExecutionLegChange({
                        target: { name: 'strikeAtm', value },
                      })
                    }
                    style={dynamicStyles.picker}
                  >
                    {strikeOptions.map((item, index) => (
                      <Picker.Item
                        key={index}
                        label={item.name}
                        value={item.value}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>
          </View>

          {/* Target & SL Row */}
          <View style={dynamicStyles.row}>
            {/* Target */}
            <View style={dynamicStyles.column}>
              <Text style={dynamicStyles.label}>Target</Text>
              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.pickerWrapper}>
                  <Picker
                    selectedValue={legInfo.targetUnit}
                    onValueChange={(value) =>
                      handleExecutionLegChange({
                        target: { name: 'targetUnit', value },
                      })
                    }
                    style={dynamicStyles.picker}
                  >
                    {advancedTPSLUnits.map((item, i) => (
                      <Picker.Item key={i} label={item} value={item} />
                    ))}
                  </Picker>
                </View>
                <TextInput
                  style={dynamicStyles.inputGroupInput}
                  placeholder="Target"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  keyboardType="numeric"
                  value={legInfo.target?.toString() || ''}
                  onChangeText={(text) =>
                    handleExecutionLegChange({
                      target: { name: 'target', value: text },
                    })
                  }
                />
              </View>
            </View>

            {/* SL */}
            <View style={dynamicStyles.column}>
              <Text style={dynamicStyles.label}>SL</Text>
              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.pickerWrapper}>
                  <Picker
                    selectedValue={legInfo.slUnit}
                    onValueChange={(value) =>
                      handleExecutionLegChange({
                        target: { name: 'slUnit', value },
                      })
                    }
                    style={dynamicStyles.picker}
                  >
                    {advancedTPSLUnits.map((item, i) => (
                      <Picker.Item key={i} label={item} value={item} />
                    ))}
                  </Picker>
                </View>
                <TextInput
                  style={dynamicStyles.inputGroupInput}
                  placeholder="Stoploss"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  keyboardType="numeric"
                  value={legInfo.sl?.toString() || ''}
                  onChangeText={(text) =>
                    handleExecutionLegChange({
                      target: { name: 'sl', value: text },
                    })
                  }
                />
              </View>
            </View>
          </View>

          {/* Trailing SL Row */}
          <View style={dynamicStyles.row}>
            {/* Trailing X */}
            <View style={dynamicStyles.column}>
              <Text style={dynamicStyles.label}>Trailing SL X</Text>
              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.pickerWrapper}>
                  <Picker
                    selectedValue={legInfo.trailingUnit}
                    onValueChange={(value) =>
                      handleExecutionLegChange({
                        target: { name: 'trailingUnit', value },
                      })
                    }
                    style={dynamicStyles.picker}
                  >
                    {advancedTPSLUnits.map((item, i) => (
                      <Picker.Item key={i} label={item} value={item} />
                    ))}
                  </Picker>
                </View>
                <TextInput
                  style={dynamicStyles.inputGroupInput}
                  placeholder="Trailing X"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  keyboardType="numeric"
                  value={legInfo.trailing?.x?.toString() || ''}
                  onChangeText={(text) =>
                    handleExecutionLegChange({
                      target: { name: 'trailing.x', value: text },
                    })
                  }
                />
              </View>
            </View>

            {/* Trailing Y */}
            <View style={dynamicStyles.column}>
              <Text style={dynamicStyles.label}>Trailing SL Y</Text>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Trailing Y"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                keyboardType="numeric"
                value={legInfo.trailing?.y?.toString() || ''}
                onChangeText={(text) =>
                  handleExecutionLegChange({
                    target: { name: 'trailing.y', value: text },
                  })
                }
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = (isDark) =>
  StyleSheet.create({
    container: {
      marginTop: 16,
    },
    divider: {
      height: 1,
      backgroundColor: isDark ? '#374151' : '#E5E7EB',
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#FFFFFF' : '#111827',
      marginBottom: 16,
    },
    content: {
      gap: 16,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    column: {
      flex: 1,
    },
    formGroup: {
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? '#D1D5DB' : '#374151',
      marginBottom: 8,
    },
    toggleButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    ceButton: {
      backgroundColor: '#3B82F6',
      borderColor: '#3B82F6',
    },
    peButton: {
      backgroundColor: isDark ? '#14161B' : '#FFFFFF',
      borderColor: isDark ? '#262A33' : '#D1D5DB',
    },
    buyButton: {
      backgroundColor: '#10B981',
      borderColor: '#10B981',
    },
    sellButton: {
      backgroundColor: '#EF4444',
      borderColor: '#EF4444',
    },
    toggleButtonText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    inputGroup: {
      flexDirection: 'row',
      gap: 8,
    },
    pickerWrapper: {
      flex: 1,
      borderWidth: 1,
      borderColor: isDark ? '#262A33' : '#E5E7EB',
      borderRadius: 8,
      backgroundColor: isDark ? '#14161B' : '#FFFFFF',
      overflow: 'hidden',
    },
    picker: {
      color: isDark ? '#FFFFFF' : '#111827',
      height: 50,
    },
    inputGroupInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: isDark ? '#262A33' : '#E5E7EB',
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#111827',
      backgroundColor: isDark ? '#14161B' : '#FFFFFF',
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? '#262A33' : '#E5E7EB',
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#111827',
      backgroundColor: isDark ? '#14161B' : '#FFFFFF',
    },
  });

export default ExecutionOptionLeg;