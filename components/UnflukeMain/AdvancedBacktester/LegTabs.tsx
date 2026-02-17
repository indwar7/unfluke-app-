import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AdvancedLeg from './AdvancedLeg';

const LegTabs = ({ activeTab, setActiveTab, indicators, entryexit }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const dynamicStyles = styles(isDark);

  const advancedState = useSelector((store) => store.AdvancedBacktester);
  const dispatch = useDispatch();
  
  const [activeColor, setActiveColor] = useState('#FFFFFF');

  useEffect(() => {
    if (activeTab) {
      const activeTabIndex = parseInt(activeTab) - 1;

      if (advancedState.legs[entryexit][activeTabIndex]) {
        const legColor = advancedState.legs[entryexit][activeTabIndex].color;
        setActiveColor(legColor || (isDark ? '#1F2937' : '#FFFFFF'));
      }
    }
  }, [activeTab, advancedState, isDark]);

  return (
    <View style={dynamicStyles.card}>
      <View style={[dynamicStyles.cardBody]}>
        {/* Tabs Navigation - Only show for entry */}
        {entryexit === 'entry' && (
          <View style={dynamicStyles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={dynamicStyles.tabsScrollContent}
            >
              {Array.from(
                { length: advancedState.totalLegs },
                (_, i) => i + 1
              ).map((i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setActiveTab(i.toString())}
                  style={[
                    dynamicStyles.tab,
                    activeTab === i.toString() && dynamicStyles.tabActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      dynamicStyles.tabText,
                      activeTab === i.toString() && dynamicStyles.tabTextActive,
                    ]}
                  >
                    Leg {i}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tab Content */}
        <View style={dynamicStyles.tabContent}>
          {advancedState.legs[entryexit].map((leg) => {
            // Only render the active tab content
            if ((leg.index + 1).toString() !== activeTab) {
              return null;
            }

            return (
              <View key={leg.index} style={dynamicStyles.tabPane}>
                <AdvancedLeg
                  indicators={indicators}
                  initialState={leg}
                  entryexit={entryexit}
                />
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = (isDark) =>
  StyleSheet.create({
    card: {
     
      marginBottom: 16,
     
      overflow: 'hidden',
    },
    cardBody: {
    //   padding: 16,
    },

    // Tabs Navigation
    tabsContainer: {
      marginBottom: 16,
    },
    tabsScrollContent: {
      gap: 8,
    //   paddingHorizontal: 4,
    },
    tab: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: isDark ? '#374151' : '#F3F4F6',
      minWidth: 80,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabActive: {
      backgroundColor: '#3B82F6',
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#111827',
    },
    tabTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },

    // Tab Content
    tabContent: {
      marginTop: 16,
    },
    tabPane: {
      width: '100%',
    },
  });

export default LegTabs;