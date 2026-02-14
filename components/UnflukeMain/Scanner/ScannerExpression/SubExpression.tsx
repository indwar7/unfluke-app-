// import React from 'react'
// import { ListGroup, ListGroupItem } from 'reactstrap'
// import ExpressionItem from './ExpressionItem'

// const SubExpression = ({subexpr, addElem, removeElem, editElem, x}) => {
//     return (
//         <div onDrop={(e)=>{
//             e.stopPropagation()
//             addElem(e, x, subexpr.length)
//         }} className='mb-2'>
//             <ListGroup horizontal className='gap-2'>
//                 {
//                     subexpr.map((indicator, y)=>
//                         <ExpressionItem x={x} y={y} indicator={indicator} addElem={addElem} removeElem={removeElem}
//                             editElem={editElem} />
//                     )
//                 }
//             </ListGroup>
//         </div>
//     )
// }

// export default SubExpression





import React from "react";
import { View, StyleSheet } from "react-native";
import ExpressionItem from "./ExpressionItem";

const SubExpression = ({
  subexpr,
  subexprIndex,
  flatExpression,
  cursorPosition,
  onSetCursor,
  onRemove,
  onEdit,
}) => {
  // Find the flat indices for items in this subexpression
  const getItemsWithIndices = () => {
    return subexpr.map((item, y) => {
      const flatItem = flatExpression.find(
        (fi) => fi._coords.x === subexprIndex && fi._coords.y === y
      );
      return {
        item,
        flatIndex: flatItem ? flatItem._flatIndex : -1,
        y,
      };
    });
  };

  const itemsWithIndices = getItemsWithIndices();

  return (
    <View style={styles.container}>
      <View style={styles.itemsRow}>
        {itemsWithIndices.map(({ item, flatIndex, y }) => (
          <ExpressionItem
            key={`${subexprIndex}-${y}`}
            item={item}
            flatIndex={flatIndex}
            cursorPosition={cursorPosition}
            onSetCursor={onSetCursor}
            onRemove={onRemove}
            onEdit={onEdit}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  itemsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
});

export default SubExpression;