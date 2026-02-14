// import React from 'react'
// import { ListGroupItem } from 'reactstrap'

// const ExpressionItem = ({x, y, indicator, addElem, removeElem, editElem, indicators}) => {

//     const displayItemString = (indicator) => {
//         if(indicator.displayName) return indicator.displayName

//         if(indicator.indicatorName === "number" && (indicator.value || indicator.value === 0)){
//             return indicator.value
//         }if(indicator.indicatorName === "offset" && indicator.value && indicator.source){
//             return indicator.value+" "+indicator.source
//         }else{
//             if(indicator.settings)
//             {
//                 const lengthObj = indicator.settings.find((setting) => setting.name === "Length")

//                 if(lengthObj && lengthObj.value)
//                 {
//                     return indicator.indicatorName+"("+lengthObj.value+")"
//                 }
//             }

//             return indicator.indicatorName
//         }
//     }

//     return (
//         <div key={y}
//             onDrop={(e)=>{
//                 e.stopPropagation()
//                 addElem(e, x, y)
//             }}>
//             <ListGroupItem className = "rounded-lg bg-blue-200 dark:bg-blue-400 p-2 mx-1 mb-1 d-flex flex-column justify-content-between">
//                 <div className="d-flex align-items-start cursor-drag">
//                     <div
//                         style={{
//                             position: "absolute",
//                             right: -12,
//                             top: -14,
//                             cursor: "pointer"
//                     }} onClick={()=>{
//                         removeElem(x, y)
//                     }}><i className="mdi mdi-close-circle text-red-500 dark:text-white" style={{
//                         fontSize: 18
//                     }}></i></div>

//                     <div className="flex-grow-1 overflow-hidden" onDoubleClick={()=>{
//                         editElem(x, y)
//                     }}>
//                         <h5 className="contact-name dark:text-black fs-13">{
//                             displayItemString(indicator)
//                         }</h5>
//                     </div>
//                 </div>
//             </ListGroupItem>
//         </div>
//     )
// }

// export default ExpressionItem




import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";

const ExpressionItem = ({
  item,
  flatIndex,
  cursorPosition,
  onSetCursor,
  onRemove,
  onEdit,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dynamicStyles = styles(isDark);

  // Display logic (same as original)
  const displayItemString = (indicator) => {
    if (indicator.displayName) return indicator.displayName;

    if (
      indicator.indicatorName === "number" &&
      (indicator.value || indicator.value === 0)
    ) {
      return indicator.value.toString();
    }
    
    if (
      indicator.indicatorName === "offset" &&
      indicator.value &&
      indicator.source
    ) {
      return `${indicator.value} ${indicator.source}`;
    }

    if (indicator.settings) {
      const lengthObj = indicator.settings.find(
        (setting) => setting.name === "Length"
      );

      if (lengthObj && lengthObj.value) {
        return `${indicator.indicatorName}(${lengthObj.value})`;
      }
    }

    return indicator.indicatorName;
  };

  const showCursorBefore = cursorPosition === flatIndex;
  const showCursorAfter = cursorPosition === flatIndex + 1;

  return (
    <View style={dynamicStyles.itemContainer}>
      {/* Cursor BEFORE this item */}
      <TouchableOpacity
        style={dynamicStyles.cursorZone}
        onPress={() => onSetCursor(flatIndex)}
        activeOpacity={0.7}
      >
        {showCursorBefore && <View style={dynamicStyles.cursorLine} />}
      </TouchableOpacity>

      {/* The Item Chip */}
      <View style={dynamicStyles.chip}>
        {/* Remove Button */}
        <TouchableOpacity
          style={dynamicStyles.removeButton}
          onPress={() => onRemove(flatIndex)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={dynamicStyles.removeIcon}>✕</Text>
        </TouchableOpacity>

        {/* Item Content - Tap to Edit */}
        <TouchableOpacity
          onPress={() => onEdit(flatIndex)}
          activeOpacity={0.7}
          style={dynamicStyles.chipContent}
        >
          <Text style={dynamicStyles.chipText}>
            {displayItemString(item)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cursor AFTER this item */}
      <TouchableOpacity
        style={dynamicStyles.cursorZone}
        onPress={() => onSetCursor(flatIndex + 1)}
        activeOpacity={0.7}
      >
        {showCursorAfter && <View style={dynamicStyles.cursorLine} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = (isDark) =>
  StyleSheet.create({
    itemContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    cursorZone: {
      width: 12,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    cursorLine: {
      width: 2,
      height: 28,
      backgroundColor: "#3B82F6",
      // For blinking, you'd use Animated.loop with opacity
    },
    chip: {
      backgroundColor: isDark ? "#60A5FA" : "#BFDBFE",
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      paddingRight: 8,
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      minHeight: 36,
    },
    removeButton: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: isDark ? "#FFFFFF" : "#EF4444",
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },
    removeIcon: {
      color: isDark ? "#EF4444" : "#FFFFFF",
      fontSize: 12,
      fontWeight: "bold",
    },
    chipContent: {
      paddingRight: 4,
    },
    chipText: {
      color: isDark ? "#000000" : "#1E40AF",
      fontSize: 13,
      fontWeight: "500",
    },
  });

export default ExpressionItem;