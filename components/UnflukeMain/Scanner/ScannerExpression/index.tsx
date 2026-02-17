// import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
// } from "react-native";
// import SubExpression from "./SubExpression";

// const { width } = Dimensions.get('window');

// const ScannerExpression = forwardRef(({ 
//   expression, 
//   addElem, 
//   removeElem, 
//   editElem, 
//   onRegisterDropZone,
//   isDragging,
//   draggedItem,
// }, ref) => {
//   const containerRef = useRef(null);

//   useImperativeHandle(ref, () => ({
//     measureContainer: () => {
//       if (containerRef.current) {
//         containerRef.current.measure((x, y, width, height, pageX, pageY) => {
//           return { x: pageX, y: pageY, width, height };
//         });
//       }
//     },
//   }));

//   useEffect(() => {
//     // Register the main drop zone
//     if (containerRef.current && onRegisterDropZone) {
//       containerRef.current.measure((x, y, width, height, pageX, pageY) => {
//         const bounds = { x: pageX, y: pageY, width, height };
        
//         if (expression.length <= 0) {
//           onRegisterDropZone(bounds, 0, 0);
//         } else {
//           onRegisterDropZone(
//             bounds, 
//             expression.length - 1, 
//             expression[expression.length - 1].length
//           );
//         }
//       });
//     }
//   }, [expression, onRegisterDropZone]);

//   const handleLayout = (event) => {
//     const { x, y, width, height } = event.nativeEvent.layout;
//     if (onRegisterDropZone) {
//       const bounds = { x, y, width, height };
      
//       if (expression.length <= 0) {
//         onRegisterDropZone(bounds, 0, 0);
//       } else {
//         onRegisterDropZone(
//           bounds, 
//           expression.length - 1, 
//           expression[expression.length - 1].length
//         );
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Expression</Text>
//       </View>
      
//       <View 
//         ref={containerRef}
//         style={[
//           styles.expressionArea,
//           isDragging && styles.expressionAreaDragActive,
//         ]}
//         onLayout={handleLayout}
//       >
//         {expression.length <= 0 ||
//         (expression.length > 0 && expression[0].length <= 0) ? (
//           <View style={styles.emptyState}>
//             <Text style={styles.emptyText}>
//               {isDragging ? "Drop here!" : "Drag something here!"}
//             </Text>
//           </View>
//         ) : (
//           <View style={styles.expressionContent}>
//             {/* {expression.map((subexpr, i) => (
//               <SubExpression
//                 key={i}
//                 subexpr={subexpr}
//                 addElem={addElem}
//                 removeElem={removeElem}
//                 x={i}
//                 editElem={editElem}
//                 onRegisterDropZone={onRegisterDropZone}
//                 isDragging={isDragging}
//                 draggedItem={draggedItem}
//               />
//             ))} */}
//           </View>
//         )}
        
//         {/* Visual feedback during drag */}
//         {isDragging && (
//           <View style={styles.dragOverlay}>
//             <Text style={styles.dragOverlayText}>Drop here</Text>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// });

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   header: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   expressionArea: {
//     borderWidth: 4,
//     borderColor: '#E5E7EB',
//     borderStyle: 'dashed',
//     backgroundColor: 'white',
//     borderRadius: 16,
//     margin: 16,
//     paddingVertical: 40,
//     paddingHorizontal: 16,
//     minHeight: 120,
//     position: 'relative',
//   },
//   expressionAreaDragActive: {
//     borderColor: '#3B82F6',
//     backgroundColor: '#EBF8FF',
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyText: {
//     color: '#9CA3AF',
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   expressionContent: {
//     flex: 1,
//   },
//   dragOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(59, 130, 246, 0.1)',
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#3B82F6',
//     borderStyle: 'dashed',
//   },
//   dragOverlayText: {
//     color: '#3B82F6',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

// export default ScannerExpression;




import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import SubExpression from "./SubExpression";

const ScannerExpression = ({
  expression,
  cursorPosition,
  onCursorChange,
  onRemoveAt,
  onEditAt,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dynamicStyles = styles(isDark);

  // Flatten 2D expression to 1D for cursor tracking
  const flattenExpression = () => {
    const flattened = [];
    expression.forEach((subexpr, x) => {
      subexpr.forEach((item, y) => {
        flattened.push({
          ...item,
          _coords: { x, y }, // Store original coordinates
          _flatIndex: flattened.length,
        });
      });
    });
    return flattened;
  };

  const flatExpression = flattenExpression();

  // Handle remove by converting flat index to x,y
  const handleRemove = (flatIndex) => {
    const item = flatExpression[flatIndex];
    if (item && item._coords) {
      onRemoveAt(item._coords.x, item._coords.y);
      
      // Adjust cursor if needed
      if (cursorPosition > flatIndex) {
        onCursorChange(cursorPosition - 1);
      } else if (cursorPosition === flatIndex) {
        onCursorChange(Math.max(0, flatIndex - 1));
      }
    }
  };

  // Handle edit
  const handleEdit = (flatIndex) => {
    const item = flatExpression[flatIndex];
    if (item && item._coords) {
      onEditAt(item._coords.x, item._coords.y);
    }
  };

  // Handle cursor positioning
  const handleSetCursor = (position) => {
    onCursorChange(Math.max(0, Math.min(position, flatExpression.length)));
  };

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>Expression</Text>
      </View>

      {/* Expression Body */}
      <View style={dynamicStyles.body}>
        {flatExpression.length === 0 ? (
          // Empty state with cursor at position 0
          <View style={dynamicStyles.emptyContainer}>
            <TouchableOpacity
              style={dynamicStyles.cursorTapArea}
              onPress={() => handleSetCursor(0)}
            >
              {cursorPosition === 0 && (
                <View style={dynamicStyles.cursorIndicator} />
              )}
              <Text style={dynamicStyles.emptyText}>
                Tap an indicator or operator to start
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Render expression with SubExpression components
          <View>
            {expression.map((subexpr, x) => (
              <SubExpression
                key={x}
                subexpr={subexpr}
                subexprIndex={x}
                flatExpression={flatExpression}
                cursorPosition={cursorPosition}
                onSetCursor={handleSetCursor}
                onRemove={handleRemove}
                onEdit={handleEdit}
              />
            ))}
            
            {/* Cursor at the end */}
            <TouchableOpacity
              style={dynamicStyles.endCursorArea}
              onPress={() => handleSetCursor(flatExpression.length)}
            >
              {cursorPosition === flatExpression.length && (
                <View style={dynamicStyles.cursorIndicator} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Helper Text */}
      <Text style={dynamicStyles.helperText}>
        Tap between items to position cursor • Tap item to edit • Tap ✕ to remove
      </Text>
    </View>
  );
};

const styles = (isDark) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
      flex: 1,
    },
    header: {
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#111827",
      marginBottom: 8,
    },
    body: {
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: isDark ? "#374151" : "#E5E7EB",
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
      borderRadius: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      paddingVertical: 24,
      paddingHorizontal: 12,
      minHeight: 120,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    cursorTapArea: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      minHeight: 40,
    },
    emptyText: {
      color: isDark ? "#9CA3AF" : "#6B7280",
      textAlign: "center",
      fontSize: 14,
    },
    cursorIndicator: {
      width: 2,
      height: 24,
      backgroundColor: "#3B82F6",
      marginRight: 4,
      // Blinking animation would need Animated API
    },
    endCursorArea: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 8,
      minHeight: 30,
    },
    helperText: {
      fontSize: 12,
      color: isDark ? "#9CA3AF" : "#6B7280",
      textAlign: "center",
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
  });

export default ScannerExpression;