

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';
// import { PanGestureHandler } from 'react-native-gesture-handler';
// import Animated, {
//   useAnimatedGestureHandler,
//   useAnimatedStyle,
//   useSharedValue,
//   runOnJS,
//   withSpring,
// } from 'react-native-reanimated';

// import { 
//   mathOperators, 
//   advOperators, 
//   advOperatorTitles, 
//   conditionalOperators, 
//   fundaBinaryOperators, 
//   binaryOperators, 
//   numericalOperandsFunda, 
//   numericalOperands, 
//   brackets, 
//   moreElements 
// } from '../../Utils/common_vars';

// const {width,height} = Dimensions.get('window')

// const ScannerMisc = ({ 
//   addElemTap, 
//   onDragStart, 
//   onDragEnd, 
//   isDragging, 
//   type 
// }) => {
//   const [moreModalOpen, setMoreModalOpen] = useState(false);

//   const handleTap = (item) => {
//     const data = {
//       indicatorName: typeof item === "string" ? item : item.indicatorName,
//       displayName: typeof item === "string" ? item : item.displayName,
//       ...item,
//     };
//     addElemTap(data);
//   };

//   const renderItems = (items, category, extra = {}) =>
//     items.map((item, i) => {
//             const name = typeof item === "string" ? item : item.displayName || item.indicatorName;
//       const dataName = typeof item === "string" ? item : item.indicatorName;

//       return (
//         <DraggableMiscItem
//           key={i}
//           item={item}
//           displayName={name}
//           category={category}
//           onTap={() => handleTap(item)}
//           onDragStart={onDragStart}
//           onDragEnd={onDragEnd}
//           isDragging={isDragging}
//           title={extra.title ? extra.title(i) : ""}
//         />
//       );
//     });

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Misc</Text>

//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         <View style={styles.content}>

//           {/* Math Operators */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Math Operators</Text>
//             <View style={styles.itemsGrid}>
//               {renderItems(mathOperators, "math")}
//             </View>
//           </View>

//           {/* Conditional Operators */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Conditional Operators</Text>
//             <View style={styles.itemsGrid}>
//               {renderItems(conditionalOperators, "conditional")}
//               {type !== "fundamental" &&
//                 renderItems(advOperators, "conditional", {
//                   title: (i) => advOperatorTitles[i],
//                 })}
//             </View>
//           </View>

//           {/* Binary Operators */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Binary Operators</Text>
//             <View style={styles.itemsGrid}>
//               {renderItems(
//                 type === "fundamental" ? fundaBinaryOperators : binaryOperators,
//                 "binary"
//               )}
//             </View>
//           </View>

//           {/* Others */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Other</Text>
//             <View style={styles.itemsGrid}>
//               {renderItems(
//                 type === "fundamental" ? numericalOperandsFunda : numericalOperands,
//                 "other"
//               )}
//               {type !== "fundamental" && renderItems(brackets, "other")}
//             </View>
//           </View>

//           {/* More */}
//           {type !== "fundamental" && (
//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>More</Text>
//               <View style={styles.itemsGrid}>
//                 {renderItems(moreElements, "other")}
//               </View>
//             </View>
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const DraggableMiscItem = ({
//   item,
//   displayName,
//   category,
//   onTap,
//   onDragStart,
//   onDragEnd,
//   isDragging,
//   title,
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
//         indicatorName: typeof item === "string" ? item : item.indicatorName,
//         displayName: typeof item === "string" ? item : item.displayName,
//         ...item,
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

//   const getCategoryStyle = (category) => {
//     switch (category) {
//       case "math":
//         return styles.mathItem;
//       case "conditional":
//         return styles.conditionalItem;
//       case "binary":
//         return styles.binaryItem;
//       default:
//         return styles.otherItem;
//     }
//   };

//   return (
//     <PanGestureHandler onGestureEvent={gestureHandler}>
//       <Animated.View style={[animatedStyle]}>      
//         <TouchableOpacity
//           style={[
//             styles.miscItem,
//             getCategoryStyle(category),
//             isDragging && styles.miscItemDragging,
//           ]}
//           onPress={onTap}
//           activeOpacity={0.7}
//         >
//           <Text style={[styles.miscText, getCategoryTextStyle(category)]}>
//             {displayName}
//           </Text>
//         </TouchableOpacity>
//       </Animated.View>
//     </PanGestureHandler>
//   );
// };

// const getCategoryTextStyle = (category) => {
//   switch (category) {
//     case "math":
//       return styles.mathText;
//     case "conditional":
//       return styles.conditionalText;
//     case "binary":
//       return styles.binaryText;
//     default:
//       return styles.otherText;
//   }
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
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 16,
//   },
//   scrollView: {
//     maxHeight: 400,
//   },
//   content: {
//     paddingBottom: 16,
//   },
//   section: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#374151',
//     marginBottom: 8,
//   },
//   itemsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   miscItem: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//     marginBottom: 4,
//     borderWidth: 1,
//     borderColor: 'transparent',
//   },
//   miscItemDragging: {
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   miscText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   mathItem: {
//     backgroundColor: '#DCFCE7',
//   },
//   mathText: {
//     color: '#166534',
//   },
//   conditionalItem: {
//     backgroundColor: '#FEF3C7',
//   },
//   conditionalText: {
//     color: '#92400E',
//   },
//   binaryItem: {
//     backgroundColor: '#E9D5FF',
//   },
//   binaryText: {
//     color: '#7C2D12',
//   },
//   otherItem: {
//     backgroundColor: '#F3F4F6',
//   },
//   otherText: {
//     color: '#374151',
//   },
// });

// export default ScannerMisc;





import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native";
import {
  mathOperators,
  advOperators,
  advOperatorTitles,
  conditionalOperators,
  fundaBinaryOperators,
  binaryOperators,
  numericalOperandsFunda,
  numericalOperands,
  brackets,
  moreElements,
} from "../../Utils/common_vars";

const ScannerMisc = ({ onItemTap, type }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dynamicStyles = styles(isDark);

  // Handle tap - replaces drag functionality
  const handleItemTap = (item, index) => {
    const name = typeof item === "string" ? item : item.indicatorName;
    const data = {
      index: index,
      indicatorName: name,
      displayName: typeof item === "string" ? item : item.displayName,
    };

    if (onItemTap) {
      onItemTap(data);
    }
  };

  // Render items with category-based styling
  const renderItems = (items, category, extraProps = {}) => {
    return items.map((item, i) => {
      const name =
        typeof item === "string"
          ? item
          : item.displayName || item.indicatorName;
      const dataName = typeof item === "string" ? item : item.indicatorName;

      // Get title if provided
      const title =
        typeof extraProps.title === "function"
          ? extraProps.title(i)
          : extraProps.title || "";

      return (
        <TouchableOpacity
          key={`${category}-${i}`}
          style={[
            dynamicStyles.chip,
            category === "math" && dynamicStyles.chipMath,
            category === "conditional" && dynamicStyles.chipConditional,
            category === "binary" && dynamicStyles.chipBinary,
            category === "other" && dynamicStyles.chipOther,
          ]}
          onPress={() => handleItemTap(item, i)}
          activeOpacity={0.6}
        >
          <Text
            style={[
              dynamicStyles.chipText,
              category === "math" && dynamicStyles.chipTextMath,
              category === "conditional" && dynamicStyles.chipTextConditional,
              category === "binary" && dynamicStyles.chipTextBinary,
              category === "other" && dynamicStyles.chipTextOther,
            ]}
          >
            {name}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <Text style={dynamicStyles.title}>Misc</Text>

      {/* Scrollable Content */}
      <ScrollView
        style={dynamicStyles.scrollView}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        <View style={dynamicStyles.sectionsContainer}>
          {/* Math Operators */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Math Operators</Text>
            <View style={dynamicStyles.chipContainer}>
              {renderItems(mathOperators, "math")}
            </View>
          </View>

          {/* Conditional Operators */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>
              Conditional Operators
            </Text>
            <View style={dynamicStyles.chipContainer}>
              {renderItems(conditionalOperators, "conditional")}
              {type !== "fundamental" &&
                renderItems(advOperators, "conditional", {
                  title: (i) => advOperatorTitles[i],
                })}
            </View>
          </View>

          {/* Binary Operators */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Binary Operators</Text>
            <View style={dynamicStyles.chipContainer}>
              {renderItems(
                type === "fundamental" ? fundaBinaryOperators : binaryOperators,
                "binary"
              )}
            </View>
          </View>

          {/* Other */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Other</Text>
            <View style={dynamicStyles.chipContainer}>
              {renderItems(
                type === "fundamental"
                  ? numericalOperandsFunda
                  : numericalOperands,
                "other"
              )}
              {type !== "fundamental" && renderItems(brackets, "other")}
            </View>
          </View>

          {/* More */}
          {type !== "fundamental" && (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>More</Text>
              <View style={dynamicStyles.chipContainer}>
                {renderItems(moreElements, "other")}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = (isDark) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? "#14161B" : "#FFFFFF",
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
    // scrollView: {
    //   // maxHeight: 300,
    // },
    sectionsContainer: {
      gap: 2,
    },
    section: {
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#D1D5DB" : "#374151",
      marginBottom: 8,
    },
    chipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 6,
      marginRight: 4,
      marginBottom: 4,
    },
    chipText: {
      fontSize: 14,
    },

    // Math Operators (Green)
    chipMath: {
      backgroundColor: isDark ? "#065F46" : "#D1FAE5",
    },
    chipTextMath: {
      color: isDark ? "#A7F3D0" : "#065F46",
    },

    // Conditional Operators (Yellow)
    chipConditional: {
      backgroundColor: isDark ? "#78350F" : "#FEF3C7",
    },
    chipTextConditional: {
      color: isDark ? "#FDE68A" : "#78350F",
    },

    // Binary Operators (Purple)
    chipBinary: {
      backgroundColor: isDark ? "#581C87" : "#E9D5FF",
    },
    chipTextBinary: {
      color: isDark ? "#D8B4FE" : "#581C87",
    },

    // Other Elements (Gray)
    chipOther: {
      backgroundColor: isDark ? "#374151" : "#F3F4F6",
    },
    chipTextOther: {
      color: isDark ? "#D1D5DB" : "#1F2937",
    },
  });

export default ScannerMisc;