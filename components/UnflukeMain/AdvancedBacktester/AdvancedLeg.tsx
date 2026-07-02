import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch, useSelector } from 'react-redux';

import IndicatorList from '../Scanner/IndicatorList';
import ScannerFilters from '../Scanner/ScannerFilters';
import ScannerMisc from '../Scanner/ScannerMisc';
import ScannerExpression from '../Scanner/ScannerExpression';
import ExecutionOptionLeg from './ExecutionOptionLeg';

// Import modals
import IndicatorModal from '../Scanner/ScannerExpression/Modals/IndicatorModal';
import NumberOpModal from '../Scanner/ScannerExpression/Modals/NumberOpModal';
import LTPModal from '../Scanner/ScannerExpression/Modals/LTPModal';
import OffsetModal from '../Scanner/ScannerMisc/Modals/OffsetModal';

import {
  advOperators,
  advancedExecutions,
  advancedTPSLUnits,
  binaryOperators,
  brackets,
  conditionalOperators,
  createAdvancedOptionExecutionLeg,
  deepCopy,
  elemsWithNoDialog,
  mathOperators,
  
} from '../Utils/common_vars';

import { handleUpdateLeg } from '../../../redux/slices/advancedBacktester/reducer';

const AdvancedLeg = ({ indicators, initialState, entryexit }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const dynamicStyles = styles(isDark);

  const advancedState = useSelector((store) => store.AdvancedBacktester);
  const dispatch = useDispatch();

  // Modal states
  const [indicatorModalOpen, setIndicatorModalOpen] = useState(false);
  const [numberModalOpen, setNumberModalOpen] = useState(false);
  const [ltpModalOpen, setLTPModalOpen] = useState(false);
  const [offsetModalOpen, setOffsetModalOpen] = useState(false);

  const [lastElem, setLastElem] = useState({});
  const [cursorPosition, setCursorPosition] = useState(0);
  const [scannerState, setScannerState] = useState({});

  // Flatten 2D expression to 1D for cursor tracking
  const flattenExpression = (expr) => {
    if(expr.length === 0) return [];
    const flattened = [];
    expr.forEach((subexpr, x) => {
      subexpr.forEach((item, y) => {
        flattened.push({
          ...item,
          _coords: { x, y },
          _flatIndex: flattened.length,
        });
      });
    });
    return flattened;
  };

  // Convert flat index to x,y coordinates
  const flatIndexToCoords = (flatIndex, expression) => {
    let count = 0;
    for (let x = 0; x < expression.length; x++) {
      for (let y = 0; y < expression[x].length; y++) {
        if (count === flatIndex) {
          return { x, y };
        }
        count++;
      }
    }
    if (expression.length === 0) {
      return { x: 0, y: 0 };
    }
    return {
      x: expression.length - 1,
      y: expression[expression.length - 1].length,
    };
  };

  // Add element at cursor position
  const addElemAtCursor = (parsedData) => {
    const tmpExpr = deepCopy(
      advancedState.legs[initialState.type][initialState.index]['scannerExpr']
    );
    const indicatorName = parsedData.indicatorName;

    setLastElem(parsedData);

    // Handle modals
    if (indicatorName === 'number') {
      setNumberModalOpen(true);
      return;
    } else if (indicatorName === 'ltp') {
      setLTPModalOpen(true);
      return;
    } else if (indicatorName === 'offset') {
      setOffsetModalOpen(true);
      return;
    } else if (
      binaryOperators.indexOf(indicatorName) === -1 &&
      mathOperators.indexOf(indicatorName) === -1 &&
      conditionalOperators.indexOf(indicatorName) === -1 &&
      advOperators.indexOf(indicatorName) === -1 &&
      brackets.indexOf(indicatorName) === -1 &&
      elemsWithNoDialog.indexOf(indicatorName) === -1
    ) {
      setIndicatorModalOpen(true);
      return;
    }

    // If expression is empty
    if (tmpExpr.length <= 0) {
      tmpExpr.push([parsedData]);
      handleLegChange({
        target: {
          name: 'expression',
          value: tmpExpr,
        },
      });
      setCursorPosition(1);
      return;
    }

    // Get x,y coordinates from cursor position
    const { x, y } = flatIndexToCoords(cursorPosition, tmpExpr);

    // Check if we need to create new sub-expression for binary operators
    if (binaryOperators.indexOf(indicatorName) !== -1) {
      tmpExpr.splice(x + 1, 0, [parsedData]);
      setCursorPosition(cursorPosition + 1);
    } else if (
      tmpExpr[x] &&
      binaryOperators.indexOf(tmpExpr[x][0]?.indicatorName) !== -1
    ) {
      tmpExpr.splice(x + 1, 0, [parsedData]);
      setCursorPosition(cursorPosition + 1);
    } else {
      if (!tmpExpr[x]) tmpExpr[x] = [];
      tmpExpr[x].splice(y, 0, parsedData);
      setCursorPosition(cursorPosition + 1);
    }

    handleLegChange({
      target: {
        name: 'expression',
        value: tmpExpr,
      },
    });
  };

  const removeElem = (x, y) => {
    const tmpExpr = deepCopy(
      advancedState.legs[initialState.type][initialState.index]['scannerExpr']
    );
    tmpExpr[x].splice(y, 1);

    if (tmpExpr[x].length <= 0) {
      tmpExpr.splice(x, 1);
    }

    handleLegChange({
      target: {
        name: 'expression',
        value: tmpExpr,
      },
    });

    // Adjust cursor
    const flatExpr = flattenExpression(tmpExpr);
    if (cursorPosition > flatExpr.length) {
      setCursorPosition(flatExpr.length);
    }
  };

  const editElem = (x, y) => {
    const tmpExpr = deepCopy(
      advancedState.legs[initialState.type][initialState.index]['scannerExpr']
    );
    const elem = tmpExpr[x][y];
    const indicatorName = elem.indicatorName;

    setLastElem(elem);

    if (indicatorName === 'number') {
      setNumberModalOpen(true);
    } else if (indicatorName === 'ltp') {
      setLTPModalOpen(true);
    } else if (indicatorName === 'offset') {
      setOffsetModalOpen(true);
    } else if (
      binaryOperators.indexOf(indicatorName) === -1 &&
      mathOperators.indexOf(indicatorName) === -1 &&
      conditionalOperators.indexOf(indicatorName) === -1 &&
      advOperators.indexOf(indicatorName) === -1 &&
      !indicatorName.startsWith('CDL') &&
      brackets.indexOf(indicatorName) === -1
    ) {
      setIndicatorModalOpen(true);
    }
  };

  const closeModal = (output) => {
    if (numberModalOpen) setNumberModalOpen(false);
    if (indicatorModalOpen) setIndicatorModalOpen(false);
    if (ltpModalOpen) setLTPModalOpen(false);
    if (offsetModalOpen) setOffsetModalOpen(false);

    if (output) {
      const tmpExpr = deepCopy(
        advancedState.legs[initialState.type][initialState.index]['scannerExpr']
      );
      const coords = flatIndexToCoords(cursorPosition, tmpExpr);

      if (tmpExpr[coords.x] && tmpExpr[coords.x][coords.y]) {
        tmpExpr[coords.x][coords.y] = output;
      } else {
        const { x, y } = flatIndexToCoords(cursorPosition, tmpExpr);
        if (!tmpExpr[x]) tmpExpr[x] = [];
        tmpExpr[x].splice(y, 0, output);
        setCursorPosition(cursorPosition + 1);
      }

      handleLegChange({
        target: {
          name: 'expression',
          value: tmpExpr,
        },
      });
    }
  };

  const handleIndicatorTap = (indicatorData) => {
    addElemAtCursor(indicatorData);
  };

  const handleMiscTap = (itemData) => {
    addElemAtCursor(itemData);
  };

  const handleLegChange = (e) => {
    const tmp = deepCopy(
      advancedState.legs[initialState.type][initialState.index]
    );

    const name = e.target.name;
    const value = e.target.value;

    switch (name) {
      case 'expression':
        tmp['scannerExpr'] = value;
        break;
      case 'segment':
        const segment1a = e.target.segment1a;
        const segment2a = e.target.segment2a;

        tmp['scannerSegment'] = parseInt(value);
        tmp['scannerSegment1a'] = segment1a;
        tmp['scannerSegment2a'] = segment2a;
        break;
      case 'segment1a':
        tmp['scannerSegment1a'] = value;
        if (e.target.segment2a) {
          tmp['scannerSegment2a'] = e.target.segment2a;
        }
        break;
      case 'segment2a':
        tmp['scannerSegment2a'] = value;
        break;
      case 'starttime':
        tmp['startTime'] = value;
        break;
      case 'endtime':
        tmp['endTime'] = value;
        break;
      case 'buysell':
        tmp['buysell'] = tmp['buysell'] === 'Buy' ? 'Sell' : 'Buy';
        break;
      case 'tp':
        tmp['tp'] = parseFloat(value);
        break;
      case 'sl':
        tmp['sl'] = parseFloat(value);
        break;
      case 'trailX':
        tmp['trailX'] = parseFloat(value);
        break;
      case 'trailY':
        tmp['trailY'] = parseFloat(value);
        break;
      case 'noOfLots':
        tmp['noOfLots'] = parseInt(value);
        break;
      case 'tradeLegs':
        let old_legs = tmp['tradeLegs'];
        const new_legs = parseInt(value);
        tmp['tradeLegs'] = new_legs;

        if (new_legs > old_legs) {
          while (old_legs < new_legs) {
            tmp['optionLegs'].push(createAdvancedOptionExecutionLeg(old_legs));
            old_legs += 1;
          }
        } else {
          while (old_legs > new_legs) {
            tmp['optionLegs'].pop();
            old_legs -= 1;
          }
        }
        break;
      default:
        tmp[name] = value;
    }

    if (initialState.type === 'entry') {
      const tmpExit = deepCopy(
        advancedState.legs['exit'][initialState.index]
      );
      tmpExit['scannerSegment'] = tmp['scannerSegment'];
      tmpExit['scannerSegment1a'] = tmp['scannerSegment1a'];
      tmpExit['scannerSegment2a'] = tmp['scannerSegment2a'];
      tmpExit['startTime'] = tmp['startTime'];
      tmpExit['endTime'] = tmp['endTime'];

      tmpExit['buysell'] = tmp['buysell'] === 'Buy' ? 'Sell' : 'Buy';

      dispatch(handleUpdateLeg(tmpExit));
    } else {
      const tmpEntry = deepCopy(
        advancedState.legs['entry'][initialState.index]
      );

      tmpEntry['buysell'] = tmp['buysell'] === 'Buy' ? 'Sell' : 'Buy';

      dispatch(handleUpdateLeg(tmpEntry));
    }

    dispatch(handleUpdateLeg(tmp));
  };

  useEffect(() => {
    const tmp = advancedState.legs[initialState.type][initialState.index];
    const newState = {};

    Object.keys(tmp).forEach((key) => {
      switch (key) {
        case 'scannerExpr':
          newState['expression'] = tmp['scannerExpr'];
          break;
        case 'scannerSegment':
          newState['segment'] = tmp['scannerSegment'];
          break;
        case 'scannerSegment1a':
          newState['segment1a'] = tmp['scannerSegment1a'];
          break;
        case 'scannerSegment2a':
          newState['segment2a'] = tmp['scannerSegment2a'];
          break;
        case 'startTime':
          newState['starttime'] = tmp['startTime'];
          break;
        case 'endTime':
          newState['endtime'] = tmp['endTime'];
          break;
        case 'buysell':
          newState['buysell'] = tmp['buysell'];
          break;
        default:
          newState[key] = tmp[key];
      }
    });

    setScannerState(newState);

    // Update cursor to end of expression
    if (newState.expression) {
      const flatExpr = flattenExpression(newState.expression);
      setCursorPosition(flatExpr.length);
    }
  }, [advancedState]);


  return (
    <ScrollView style={dynamicStyles.container}>
      <View style={[dynamicStyles.content, { backgroundColor: initialState.color }]}>
        {/* Three Columns */}
        <View style={dynamicStyles.threeColumns}>
          <View style={dynamicStyles.column}>
            <IndicatorList
              indicators={indicators}
              onIndicatorTap={handleIndicatorTap}
              type="advanced"
            />
          </View>
          <View style={dynamicStyles.column}>
            <ScannerFilters
              scannerState={scannerState}
              handleChange={handleLegChange}
              type="advanced"
              entryexit={initialState.type}
            />
          </View>
          <View style={dynamicStyles.column}>
            <ScannerMisc onItemTap={handleMiscTap} type="advanced" />
          </View>
        </View>

        {/* Expression */}
        <View style={dynamicStyles.expressionSection}>
          {scannerState.expression && (
            <ScannerExpression
              expression={scannerState.expression}
              cursorPosition={cursorPosition}
              onCursorChange={setCursorPosition}
              onRemoveAt={removeElem}
              onEditAt={editElem}
            />
          )}
        </View>

        {/* Entry/Exit Specific Controls */}
        <View style={dynamicStyles.controlsSection}>
          {/* Buy/Sell Button (Entry only) */}
          {initialState.type === 'entry' && (
            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>Buy/Sell</Text>
              <TouchableOpacity
                style={[
                  dynamicStyles.buySellButton,
                  scannerState.buysell === 'Buy'
                    ? dynamicStyles.buyButton
                    : dynamicStyles.sellButton,
                ]}
                onPress={() =>
                  handleLegChange({
                    target: { name: 'buysell', value: scannerState.buysell },
                  })
                }
              >
                <Text style={dynamicStyles.buySellButtonText}>
                  {scannerState.buysell}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Exit Controls */}
          {initialState.type === 'exit' && (
            <>
              {/* Target & SL Row */}
              <View style={dynamicStyles.row}>
                {/* Target */}
                <View style={dynamicStyles.halfColumn}>
                  <Text style={dynamicStyles.label}>Target</Text>
                  <View style={dynamicStyles.inputGroup}>
                    <View style={dynamicStyles.pickerWrapper}>
                      <Picker
                        selectedValue={scannerState.tpUnit}
                        onValueChange={(value) =>
                          handleLegChange({
                            target: { name: 'tpUnit', value },
                          })
                        }
                        style={dynamicStyles.picker}
                      >
                        {advancedTPSLUnits.map((item, i) => (
                          <Picker.Item key={i} label={item} value={item}                         style={{ fontSize: 14 }}
/>
                        ))}
                      </Picker>
                    </View>
                    <TextInput
                      style={dynamicStyles.inputGroupInput}
                      placeholder="Target"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      keyboardType="numeric"
                      value={scannerState.tp?.toString() || ''}
                      onChangeText={(text) =>
                        handleLegChange({
                          target: { name: 'tp', value: text },
                        })
                      }
                    />
                  </View>
                </View>

                {/* SL */}
                <View style={dynamicStyles.halfColumn}>
                  <Text style={dynamicStyles.label}>SL</Text>
                  <View style={dynamicStyles.inputGroup}>
                    <View style={dynamicStyles.pickerWrapper}>
                      <Picker
                        selectedValue={scannerState.slUnit}
                        onValueChange={(value) =>
                          handleLegChange({
                            target: { name: 'slUnit', value },
                          })
                        }
                        style={dynamicStyles.picker}
                      >
                        {advancedTPSLUnits.map((item, i) => (
                          <Picker.Item key={i} label={item} value={item}                         style={{ fontSize: 14 }}
/>
                        ))}
                      </Picker>
                    </View>
                    <TextInput
                      style={dynamicStyles.inputGroupInput}
                      placeholder="SL"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      keyboardType="numeric"
                      value={scannerState.sl?.toString() || ''}
                      onChangeText={(text) =>
                        handleLegChange({
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
                <View style={dynamicStyles.halfColumn}>
                  <Text style={dynamicStyles.label}>Trailing SL X</Text>
                  <View style={dynamicStyles.inputGroup}>
                    <View style={dynamicStyles.pickerWrapper}>
                      <Picker
                        selectedValue={scannerState.trailXUnit}
                        onValueChange={(value) =>
                          handleLegChange({
                            target: { name: 'trailXUnit', value },
                          })
                        }
                        style={dynamicStyles.picker}
                      >
                        {advancedTPSLUnits.map((item, i) => (
                          <Picker.Item key={i} label={item} value={item}                         style={{ fontSize: 14 }}
/>
                        ))}
                      </Picker>
                    </View>
                    <TextInput
                      style={dynamicStyles.inputGroupInput}
                      placeholder="Trailing SL X"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      keyboardType="numeric"
                      value={scannerState.trailX?.toString() || ''}
                      onChangeText={(text) =>
                        handleLegChange({
                          target: { name: 'trailX', value: text },
                        })
                      }
                    />
                  </View>
                </View>

                {/* Trailing Y */}
                <View style={dynamicStyles.halfColumn}>
                  <Text style={dynamicStyles.label}>Trailing SL Y</Text>
                  <View style={dynamicStyles.inputGroup}>
                    <View style={dynamicStyles.pickerWrapper}>
                      <Picker
                        selectedValue={scannerState.trailYUnit}
                        onValueChange={(value) =>
                          handleLegChange({
                            target: { name: 'trailYUnit', value },
                          })
                        }
                        style={dynamicStyles.picker}
                      >
                        {advancedTPSLUnits.map((item, i) => (
                          <Picker.Item key={i} label={item} value={item}                         style={{ fontSize: 14 }}
 />
                        ))}
                      </Picker>
                    </View>
                    <TextInput
                      style={dynamicStyles.inputGroupInput}
                      placeholder="Trailing SL Y"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      keyboardType="numeric"
                      value={scannerState.trailY?.toString() || ''}
                      onChangeText={(text) =>
                        handleLegChange({
                          target: { name: 'trailY', value: text },
                        })
                      }
                    />
                  </View>
                </View>
              </View>

              {/* Lots */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Lots</Text>
                <View style={dynamicStyles.pickerContainer}>
                  <Picker
                    selectedValue={scannerState.noOfLots || 1}
                    onValueChange={(value) =>
                      handleLegChange({
                        target: { name: 'noOfLots', value },
                      })
                    }
                    style={dynamicStyles.picker}
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((item) => (
                      <Picker.Item
                        key={item}
                        label={item.toString()}
                        value={item}
                                                style={{ fontSize: 14 }}

                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Advanced Features (not for FNO) */}
              {scannerState.segment !== 2 && (
                <>
                  {/* Execution */}
                  <View style={dynamicStyles.formGroup}>
                    <Text style={dynamicStyles.label}>Execution</Text>
                    <View style={dynamicStyles.pickerContainer}>
                      <Picker
                        selectedValue={scannerState.execution}
                        onValueChange={(value) =>
                          handleLegChange({
                            target: { name: 'execution', value },
                          })
                        }
                        style={dynamicStyles.picker}
                      >
                        {advancedExecutions.map((obj) => (
                          <Picker.Item
                            key={obj.value}
                            label={obj.name}
                            value={obj.value}
                                                    style={{ fontSize: 14 }}

                          />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  {/* Number of legs (if options) */}
                  {scannerState.execution === 'options' && (
                    <View style={dynamicStyles.formGroup}>
                      <Text style={dynamicStyles.label}>
                        Number of legs to trade
                      </Text>
                      <View style={dynamicStyles.pickerContainer}>
                        <Picker
                          selectedValue={scannerState.tradeLegs}
                          onValueChange={(value) =>
                            handleLegChange({
                              target: { name: 'tradeLegs', value },
                            })
                          }
                          style={dynamicStyles.picker}
                        >
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(
                            (item) => (
                              <Picker.Item
                                key={item}
                                label={item.toString()}
                                value={item}
                                                        style={{ fontSize: 14 }}

                              />
                            )
                          )}
                        </Picker>
                      </View>
                    </View>
                  )}

                  {/* Option Legs */}
                  {scannerState.execution === 'options' &&
                    scannerState.optionLegs &&
                    scannerState.optionLegs.map((leg, i) => (
                      <ExecutionOptionLeg
                        key={i}
                        entryexit={initialState.type}
                        parentLegIndex={scannerState.index}
                        legIndex={i}
                      />
                    ))}
                </>
              )}
            </>
          )}
        </View>
      </View>

      {/* Modals */}
      {indicatorModalOpen && (
        <IndicatorModal
          closeModal={closeModal}
          settings={lastElem}
          type="advanced"
          stock_symbol={scannerState.segment1a || 'Unknown'}
        />
      )}
      {numberModalOpen && (
        <NumberOpModal closeModal={closeModal} settings={lastElem} />
      )}
      {ltpModalOpen && (
        <LTPModal closeModal={closeModal} settings={lastElem} />
      )}
      {offsetModalOpen && (
        <OffsetModal
          closeModal={closeModal}
          settings={lastElem}
          indicators={indicators}
        />
      )}
    </ScrollView>
  );
};

const styles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 1,
    },
    threeColumns: {
      flexDirection: 'column',
      gap: 12,
      marginBottom: 16,
    },
    column: {
      flex: 1,
    },
    expressionSection: {
      marginBottom: 16,
    },
    controlsSection: {
      gap: 16,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? '#D1D5DB' : '#374151',
      marginBottom: 8,
    },
    buySellButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buyButton: {
      backgroundColor: '#10B981',
    },
    sellButton: {
      backgroundColor: '#EF4444',
    },
    buySellButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    row: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    halfColumn: {
      flex: 1,
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
            paddingVertical: -6,

    },
    inputGroupInput: {
      flex: 1/2,
      borderWidth: 1,
      borderColor: isDark ? '#262A33' : '#E5E7EB',
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#111827',
      backgroundColor: isDark ? '#14161B' : '#FFFFFF',
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: isDark ? '#262A33' : '#E5E7EB',
      borderRadius: 8,
      backgroundColor: isDark ? '#14161B' : '#FFFFFF',
      overflow: 'hidden',
    },
  });

export default AdvancedLeg;