
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Dimensions,
// } from "react-native";
// import { PanGestureHandler } from "react-native-gesture-handler";
// import Animated, {
//   useAnimatedGestureHandler,
//   useAnimatedStyle,
//   useSharedValue,
//   runOnJS,
//   withSpring,
// } from "react-native-reanimated";

// const {width,height} = Dimensions.get('window')

// const IndicatorList = ({ 
//   indicators, 
//   addElemTap, 
//   onDragStart, 
//   onDragEnd, 
//   isDragging, 
//   type 
// }) => {
//   const [indicatorResults, setIndicatorResults] = useState([]);
//   const [groupedIndicators, setGroupedIndicators] = useState([]);
//   const [searchText, setSearchText] = useState("");

//   const typeToDisplayName = {
//     indicator: "Indicators",
//     cdlstick: "Candlestick Patterns",
//     chart: "Chart Patterns",
//   };

//   const groupBySection = (items) => {
//     if (items) {
//       return items.reduce((acc, item) => {
//         const initial = item.section ? item.section : "Other";
//         if (!acc[initial]) acc[initial] = [];
//         acc[initial].push(item);
//         return acc;
//       }, {});
//     }
//   };

//   const groupByType = (items) => {
//     if (items) {
//       return items.reduce((acc, item) => {
//         const initial = item.type;
//         if (!acc[initial]) acc[initial] = [];
//         acc[initial].push(item);
//         return acc;
//       }, {});
//     }
//   };

//   const groupedItems =
//     type === "fundamental" ? groupBySection(indicatorResults) : {};

//   const handleTap = (indicator, groupType = null) => {
//     const data = {
//       index: indicator.index || 0,
//       indicatorName: indicator.id,
//       settings: indicator.settings || [
//         { name: "Length", value: 14 },
//         { name: "Source", value: "Close" },
//       ],
//       ...indicator,
//     };

//     addElemTap(data);
//   };

//   const handleDoubleTap = (indicator, groupType = null) => {
//     handleTap(indicator, groupType);
//   };

//   useEffect(() => {
//     if (searchText.length > 0) {
//       const searchTextLowered = searchText.toLowerCase();

//       setIndicatorResults(
//         indicators.filter(
//           (x) =>
//             x.id.toLowerCase().search(new RegExp(searchTextLowered)) !== -1 ||
//             x.name.toLowerCase().search(new RegExp(searchTextLowered)) !== -1,
//         ),
//       );
//     } else {
//       setIndicatorResults(indicators);
//     }
//   }, [searchText]);

//   useEffect(() => {
//     if (indicators) {
//       setIndicatorResults(indicators);
//     }
//   }, [indicators]);

//   useEffect(() => {
//     const groupedItemsScanner = indicatorResults
//       ? groupByType(indicatorResults)
//       : {};
//     setGroupedIndicators(groupedItemsScanner);
//   }, [indicatorResults]);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Indicators</Text>

//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search"
//           placeholderTextColor="#9CA3AF"
//           value={searchText}
//           onChangeText={setSearchText}
//         />
//       </View>

//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         <View style={styles.content}>
//           {type === "fundamental"
//             ? Object.keys(groupedItems).map((section) => (
//                 <View key={section} style={styles.section}>
//                   <Text style={styles.sectionTitle}>{section}</Text>
//                   <View style={styles.itemsContainer}>
//                     {groupedItems[section].map((indicator, i) => (
//                       <DraggableIndicatorItem
//                         key={i}
//                         indicator={indicator}
//                         onTap={() => handleTap(indicator)}
//                         onDoubleTap={() => handleDoubleTap(indicator)}
//                         onDragStart={onDragStart}
//                         onDragEnd={onDragEnd}
//                         isDragging={isDragging}
//                         displayText={`${indicator.id} ${
//                           indicator.type !== "fundamental" 
//                             ? `(${indicator.name})` 
//                             : ""
//                         }`}
//                       />
//                     ))}
//                   </View>
//                 </View>
//               ))
//             : Object.keys(groupedIndicators).map((groupType) => (
//                 <View key={groupType} style={styles.section}>
//                   <Text style={styles.sectionTitle}>
//                     {typeToDisplayName[groupType]}
//                   </Text>
//                   <View style={styles.itemsContainer}>
//                     {groupedIndicators[groupType].map((indicator, i) => (
//                       <DraggableIndicatorItem
//                         key={i}
//                         indicator={indicator}
//                         onTap={() => handleTap(indicator, groupType)}
//                         onDoubleTap={() => handleDoubleTap(indicator, groupType)}
//                         onDragStart={onDragStart}
//                         onDragEnd={onDragEnd}
//                         isDragging={isDragging}
//                         displayText={indicator.name}
//                       />
//                     ))}
//                   </View>
//                 </View>
//               ))}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const DraggableIndicatorItem = ({
//   indicator,
//   onTap,
//   onDoubleTap,
//   onDragStart,
//   onDragEnd,
//   isDragging,
//   displayText,
// }) => {
//   const translateX = useSharedValue(0);
//   const translateY = useSharedValue(0);
//   const scale = useSharedValue(1);

//   const gestureHandler = useAnimatedGestureHandler({
//     onStart: (_, context) => {
//       context.startX = translateX.value;
//       context.startY = translateY.value;
//       scale.value = withSpring(1.1);
      
//       const data = {
//         index: indicator.index || 0,
//         indicatorName: indicator.id,
//         settings: indicator.settings || [
//           { name: "Length", value: 14 },
//           { name: "Source", value: "Close" },
//         ],
//         ...indicator,
//       };
      
//       runOnJS(onDragStart)(data);
//     },
//     onActive: (event, context) => {
//       translateX.value = context.startX + event.translationX;
//       translateY.value = context.startY + event.translationY;
//     },
//     onEnd: (event) => {
//       const dropCoordinates = {
//         x: event.absoluteX,
//         y: event.absoluteY,
//       };
      
//       runOnJS(onDragEnd)(dropCoordinates);
      
//       // Reset position and scale
//       translateX.value = withSpring(0);
//       translateY.value = withSpring(0);
//       scale.value = withSpring(1);
//     },
//   });

//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [
//         { translateX: translateX.value },
//         { translateY: translateY.value },
//         { scale: scale.value },
//       ],
//       zIndex: isDragging ? 1000 : 1,
//     };
//   });

//   return (
//     <PanGestureHandler onGestureEvent={gestureHandler}>
//       <Animated.View style={[animatedStyle]}>
//         <TouchableOpacity
//           style={[
//             styles.indicatorItem,
//             isDragging && styles.indicatorItemDragging,
//           ]}
//           onPress={onTap}
//           activeOpacity={0.7}
//         >
//           <Text style={styles.indicatorText}>{displayText}</Text>
//         </TouchableOpacity>
//       </Animated.View>
//     </PanGestureHandler>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//     height:height * 0.5,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 16,
//   },
//   searchContainer: {
//     marginBottom: 16,
//   },
//   searchInput: {
//     backgroundColor: '#F3F4F6',
//     borderRadius: 6,
//     padding: 12,
//     fontSize: 14,
//     color: '#1F2937',
//   },
//   scrollView: {
//     maxHeight: 370,
//   },
//   content: {
//     paddingBottom: 16,
//   },
//   section: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 8,
//   },
//   itemsContainer: {
//     gap: 4,
//   },
//   indicatorItem: {
//     backgroundColor: '#F9FAFB',
//     padding: 12,
//     borderRadius: 6,
//     marginBottom: 4,
//     borderWidth: 1,
//     borderColor: 'transparent',
//   },
//   indicatorItemDragging: {
//     backgroundColor: '#EBF8FF',
//     borderColor: '#3B82F6',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   indicatorText: {
//     fontSize: 14,
//     color: '#374151',
//   },
// });

// export default IndicatorList;





// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   useColorScheme,
// } from "react-native";

// const IndicatorList = ({ indicators = [], onIndicatorTap, type }) => {
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === "dark";
//   const dynamicStyles = styles(isDark);

//   const [indicatorResults, setIndicatorResults] = useState([]);
//   const [groupedIndicators, setGroupedIndicators] = useState({});
//   const [searchText, setSearchText] = useState("");

//   const typeToDisplayName = {
//     indicator: "Indicators",
//     cdlstick: "Candlestick Patterns",
//     chart: "Chart Patterns",
//   };

//   // Group by section (for fundamental)
//   const groupBySection = (items) => {
//     if (!items) return {};
//     return items.reduce((acc, item) => {
//       const section = item.section || "Other";
//       if (!acc[section]) acc[section] = [];
//       acc[section].push(item);
//       return acc;
//     }, {});
//   };

//   // Group by type (for technical)
//   const groupByType = (items) => {
//     if (!items) return {};
//     return items.reduce((acc, item) => {
//       const itemType = item.type;
//       if (!acc[itemType]) acc[itemType] = [];
//       acc[itemType].push(item);
//       return acc;
//     }, {});
//   };

//   const groupedItems =
//     type === "fundamental" ? groupBySection(indicatorResults) : {};

//   // Handle tap - replaces drag functionality
//   const handleIndicatorTap = (indicator) => {
//     // Build the data object (same structure as dragStart)
//     const data = {
//       index: indicator.index,
//       indicatorName: indicator.id,
//       settings: indicator.settings || [
//         { name: "Length", value: 14 },
//         { name: "Source", value: "Close" },
//       ],
//       ...indicator,
//     };

//     // Call parent callback
//     if (onIndicatorTap) {
//       onIndicatorTap(data);
//     }
//   };

//   // Search filtering
//   useEffect(() => {
//     if (searchText.length > 0) {
//       const searchTextLowered = searchText.toLowerCase();

//       setIndicatorResults(
//         indicators.filter(
//           (x) =>
//             x.id?.toLowerCase().includes(searchTextLowered) ||
//             x.name?.toLowerCase().includes(searchTextLowered)
//         )
//       );
//     } else {
//       setIndicatorResults(indicators);
//     }
//   }, [searchText, indicators]);

//   // Initialize results
//   useEffect(() => {
//     if (indicators) {
//       setIndicatorResults(indicators);
//     }
//   }, [indicators]);

//   // Update grouped indicators
//   useEffect(() => {
//     const grouped = indicatorResults ? groupByType(indicatorResults) : {};
//     setGroupedIndicators(grouped);
//   }, [indicatorResults]);

//   return (
//     <View style={dynamicStyles.container}>
//       {/* Header */}
//       <Text style={dynamicStyles.title}>Indicators</Text>

//       {/* Search Input */}
//       <View style={dynamicStyles.searchContainer}>
//         <Text style={dynamicStyles.searchIcon}>🔍</Text>
//         <TextInput
//           style={dynamicStyles.searchInput}
//           placeholder="Search"
//           placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
//           value={searchText}
//           onChangeText={setSearchText}
//         />
//       </View>

//       {/* Scrollable List */}
//       <ScrollView
//         style={dynamicStyles.scrollView}
//         showsVerticalScrollIndicator={true}
//         nestedScrollEnabled={true}
//       >
//         {type === "fundamental" ? (
//           // FUNDAMENTAL INDICATORS - Grouped by Section
//           Object.keys(groupedItems).map((section) => (
//             <View key={section} style={dynamicStyles.group}>
//               <Text style={dynamicStyles.groupTitle}>{section}</Text>
//               {groupedItems[section].map((indicator, i) => (
//                 <TouchableOpacity
//                   key={`${section}-${i}`}
//                   style={dynamicStyles.item}
//                   onPress={() => handleIndicatorTap(indicator)}
//                   activeOpacity={0.6}
//                 >
//                   <Text style={dynamicStyles.itemText}>
//                     {indicator.id}{" "}
//                     {indicator.type !== "fundamental" && `(${indicator.name})`}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           ))
//         ) : (
//           // TECHNICAL INDICATORS - Grouped by Type
//           Object.keys(groupedIndicators).map((groupType) => (
//             <View key={groupType} style={dynamicStyles.group}>
//               <Text style={dynamicStyles.groupTitle}>
//                 {typeToDisplayName[groupType] || groupType}
//               </Text>
//               {groupedIndicators[groupType].map((indicator, i) => (
//                 <TouchableOpacity
//                   key={`${groupType}-${i}`}
//                   style={dynamicStyles.item}
//                   onPress={() => handleIndicatorTap(indicator)}
//                   activeOpacity={0.6}
//                 >
//                   <Text style={dynamicStyles.itemText}>{indicator.name}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           ))
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = (isDark) =>
//   StyleSheet.create({
//     container: {
//       backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
//       borderRadius: 12,
//       padding: 16,
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 1 },
//       shadowOpacity: 0.05,
//       shadowRadius: 2,
//       elevation: 2,
//       flex: 1,
//     },
//     title: {
//       fontSize: 18,
//       fontWeight: "600",
//       color: isDark ? "#FFFFFF" : "#111827",
//       marginBottom: 16,
//     },
//     searchContainer: {
//       position: "relative",
//       marginBottom: 16,
//     },
//     searchIcon: {
//       position: "absolute",
//       left: 12,
//       top: 10,
//       fontSize: 16,
//       zIndex: 1,
//       color: "#9CA3AF",
//     },
//     searchInput: {
//       backgroundColor: isDark ? "#374151" : "#F3F4F6",
//       borderRadius: 8,
//       paddingLeft: 40,
//       paddingRight: 12,
//       paddingVertical: 10,
//       fontSize: 14,
//       color: isDark ? "#FFFFFF" : "#111827",
//       borderWidth: 0,
//     },
//     scrollView: {
//       maxHeight: 370,
//     },
//     group: {
//       marginBottom: 16,
//     },
//     groupTitle: {
//       fontSize: 14,
//       fontWeight: "600",
//       color: isDark ? "#D1D5DB" : "#374151",
//       marginBottom: 8,
//     },
//     item: {
//       paddingVertical: 8,
//       paddingHorizontal: 8,
//       borderRadius: 6,
//       marginBottom: 4,
//       backgroundColor: isDark ? "transparent" : "transparent",
//     },
//     itemText: {
//       fontSize: 14,
//       color: isDark ? "#D1D5DB" : "#4B5563",
//     },
//   });

// export default IndicatorList;

















import { Search, SearchCode, SearchIcon, SearchX } from "lucide-react-native";
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native";

const IndicatorList = ({ indicators = [], onIndicatorTap, type }) => {

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dynamicStyles = styles(isDark);

  const [searchText, setSearchText] = useState("");

  const typeToDisplayName = {
    indicator: "Indicators",
    cdlstick: "Candlestick Patterns",
    chart: "Chart Patterns",
  };

  // Group by section (for fundamental)
  const groupBySection = (items) => {
    if (!items) return {};

    console.log("fasdfsdf sd fas d f sadf sd",items)
    return items.reduce((acc, item) => {
      const section = item.section || "Other";
      if (!acc[section]) acc[section] = [];
      acc[section].push(item);
      return acc;
    }, {});
  };

  // Group by type (for technical)
  const groupByType = (items) => {
    if (!items) return {};
    return items.reduce((acc, item) => {
      const itemType = item.type;
      if (!acc[itemType]) acc[itemType] = [];
      acc[itemType].push(item);
      return acc;
    }, {});
  };

  // Filter indicators based on search - using useMemo to avoid recalculation
  const indicatorResults = useMemo(() => {
    if (!indicators || indicators.length === 0) return [];
    
    if (searchText.length > 0) {
      const searchTextLowered = searchText.toLowerCase();
      return indicators.filter(
        (x) =>
          x.id?.toLowerCase().includes(searchTextLowered) ||
          x.name?.toLowerCase().includes(searchTextLowered)
      );
    }
    
    return indicators;
  }, [searchText, indicators]);

  // Group indicators - using useMemo to avoid recalculation
  const groupedIndicators = useMemo(() => {
    if (type === "fundamental") {
      return groupBySection(indicatorResults);
    } else {
      return groupByType(indicatorResults);
    }
  }, [indicatorResults, type]);

  // Handle tap - replaces drag functionality
  const handleIndicatorTap = (indicator) => {
    // Build the data object (same structure as dragStart)
    const data = {
      index: indicator.index,
      indicatorName: indicator.id,
      settings: indicator.settings || [
        { name: "Length", value: 14 },
        { name: "Source", value: "Close" },
      ],
      ...indicator,
    };

    // Call parent callback
    if (onIndicatorTap) {
      onIndicatorTap(data);
    }
  };

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <Text style={dynamicStyles.title}>Indicators</Text>

      {/* Search Input */}
      <View style={dynamicStyles.searchContainer}>
        <Search style={dynamicStyles.searchIcon} size={16}/>
        <TextInput
          style={dynamicStyles.searchInput}
          placeholder="Search"
          placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Scrollable List */}
      <ScrollView
        style={dynamicStyles.scrollView}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {type === "fundamental" ? (
          // FUNDAMENTAL INDICATORS - Grouped by Section
          Object.keys(groupedIndicators).length > 0 ? (
            Object.keys(groupedIndicators).map((section) => (
              <View key={section} style={dynamicStyles.group}>
                <Text style={dynamicStyles.groupTitle}>{section}</Text>
                {groupedIndicators[section].map((indicator, i) => (
                  <TouchableOpacity
                    key={`${section}-${i}`}
                    style={dynamicStyles.item}
                    onPress={() => handleIndicatorTap(indicator)}
                    activeOpacity={0.6}
                  >
                    <Text style={dynamicStyles.itemText}>
                      {indicator.id}{" "}
                      {indicator.type !== "fundamental" &&
                        `(${indicator.name})`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          ) : (
            <View style={dynamicStyles.emptyContainer}>
              <Text style={dynamicStyles.emptyText}>
                {searchText
                  ? "No indicators found"
                  : "Loading indicators..."}
              </Text>
            </View>
          )
        ) : (
          // TECHNICAL INDICATORS - Grouped by Type
          Object.keys(groupedIndicators).length > 0 ? (
            Object.keys(groupedIndicators).map((groupType) => (
              <View key={groupType} style={dynamicStyles.group}>
                <Text style={dynamicStyles.groupTitle}>
                  {typeToDisplayName[groupType] || groupType}
                </Text>
                {groupedIndicators[groupType].map((indicator, i) => (
                  <TouchableOpacity
                    key={`${groupType}-${i}`}
                    style={dynamicStyles.item}
                    onPress={() => handleIndicatorTap(indicator)}
                    activeOpacity={0.6}
                  >
                    <Text style={dynamicStyles.itemText}>
                      {indicator.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          ) : (
            <View style={dynamicStyles.emptyContainer}>
              <Text style={dynamicStyles.emptyText}>
                {searchText
                  ? "No indicators found"
                  : "Loading indicators..."}
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles = (isDark) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#111827",
      marginBottom: 16,
    },
    searchContainer: {
      position: "relative",
      marginBottom: 16,
    },
    searchIcon: {
      position: "absolute",
      left: 12,
      top: 12,
      zIndex: 1,
      color: "#9CA3AF",
    },
    searchInput: {
      backgroundColor: isDark ? "#374151" : "#F3F4F6",
      borderRadius: 8,
      paddingLeft: 35,
      paddingRight: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: isDark ? "#FFFFFF" : "#111827",
      borderWidth: 0,
    },
    scrollView: {
      maxHeight: 300,
    },
    group: {
      marginBottom: 16,
    },
    groupTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#D1D5DB" : "#374151",
      marginBottom: 8,
    },
    item: {
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderRadius: 6,
      marginBottom: 4,
      backgroundColor: isDark ? "transparent" : "transparent",
    },
    itemText: {
      fontSize: 14,
      color: isDark ? "#D1D5DB" : "#4B5563",
    },
    emptyContainer: {
      paddingVertical: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      fontSize: 14,
      color: isDark ? "#9CA3AF" : "#6B7280",
      textAlign: "center",
    },
  });

export default IndicatorList;