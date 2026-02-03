// import React, { useState } from "react";
// import { Col, Row, Table } from "reactstrap";

// const GreeksTable = ({ positions }) => {
//     const [positionalGreeks, setPositionalGreeks] = useState({})
//     console.log("Positions", positions);
//     if (!positions.length || positions.length===0) return <h3>No positions available</h3>;
//     let positionalGamma=0
//     let positionalVega=0
//     let positionalTheta=0
//     let positionalDelta=0

//     positions.forEach(position => {
//         positionalDelta += position.lotQuantity * position.delta
//         positionalGamma += position.lotQuantity * position.gamma
//         positionalTheta += position.lotQuantity * position.theta
//         positionalVega += position.lotQuantity * position.vega
//     });

//     return (
//         <React.Fragment>
//             <Row>
//                 <Col lg={12}>
//                     <div className="table-responsive mt-4 mt-xl-0">
//                         <Table className="table-hover table-striped align-middle table-nowrap mb-0">
//                             <thead>
//                                 <tr>
//                                     <th >Position</th>
//                                     <th >IV</th>
//                                     <th >Theta</th>
//                                     <th>Delta</th>
//                                     <th>Gamma</th>
//                                     <th>Vega</th>

//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {positions?.map((position, index) => (
//                                     <tr key={index}>
//                                         <td>{position.type=="Buy"?"+":"-"}{position.lotQuantity}x  {position.expiry} {position.strike}{position.cepe}</td>
//                                         <td>{(position.lotQuantity * position.iv).toFixed(4)}</td>
//                                         <td>{(position.lotQuantity * position.theta).toFixed(4)}</td>
//                                         <td>{(position.lotQuantity * position.delta).toFixed(4)}</td>
//                                         <td>{(position.lotQuantity * position.gamma).toFixed(4)}</td>
//                                         <td>{(position.lotQuantity * position.vega).toFixed(4)}</td>
//                                     </tr>
//                                 ))}
//                                 <tr>
//                                     <td></td>
//                                     <td>Positional Greeks:</td>
//                                     <td>{positionalTheta.toFixed(4)}</td>
//                                     <td>{positionalDelta.toFixed(4)}</td>
//                                     <td>{positionalGamma.toFixed(4)}</td>
//                                     <td>{positionalVega.toFixed(4)}</td>

//                                 </tr>
//                             </tbody>
//                         </Table>

//                     </div>
//                 </Col>
//             </Row>
//         </React.Fragment>
//     )
// }

// export default GreeksTable

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native";

const GreeksTable = ({ positions }) => {
  const [positionalGreeks, setPositionalGreeks] = useState({});
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  console.log("Positions", positions);

  if (!positions.length || positions.length === 0) {
    return (
      <View style={styles.noPositionsContainer}>
        <Text
          style={[
            styles.noPositionsText,
            { color: isDark ? "#ffffff" : "#000000" },
          ]}
        >
          No positions available
        </Text>
      </View>
    );
  }

  let positionalGamma = 0;
  let positionalVega = 0;
  let positionalTheta = 0;
  let positionalDelta = 0;

  positions.forEach((position) => {
    positionalDelta += position.lotQuantity * position.delta;
    positionalGamma += position.lotQuantity * position.gamma;
    positionalTheta += position.lotQuantity * position.theta;
    positionalVega += position.lotQuantity * position.vega;
  });

  const styles = getStyles(isDark);

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.positionHeader]}>Position</Text>
      <View style={styles.greeksCont}>
        <Text style={[styles.headerCell, styles.numberHeader]}>IV</Text>
        <Text style={[styles.headerCell, styles.numberHeader]}>Theta</Text>
        <Text style={[styles.headerCell, styles.numberHeader]}>Delta</Text>
        <Text style={[styles.headerCell, styles.numberHeader]}>Gamma</Text>
        <Text style={[styles.headerCell, styles.numberHeader]}>Vega</Text>
      </View>
    </View>
  );

  const TableRow = ({ position, index }) => (
    <View
      style={[
        styles.tableRow,
        index % 2 === 0 ? styles.evenRow : styles.oddRow,
      ]}
    >
      <Text style={[styles.tableCell, styles.positionCell]}>
        {position.type === "Buy" ? "+" : "-"}
        {position.lotQuantity}x {position.expiry} {position.strike}
        {position.cepe}
      </Text>
      <View style={styles.greeksCont}>
        <Text style={[styles.tableCell, styles.numberCell]}>
          {(position.lotQuantity * position.iv).toFixed(4)}
        </Text>
        <Text style={[styles.tableCell, styles.numberCell]}>
          {(position.lotQuantity * position.theta).toFixed(4)}
        </Text>
        <Text style={[styles.tableCell, styles.numberCell]}>
          {(position.lotQuantity * position.delta).toFixed(4)}
        </Text>
        <Text style={[styles.tableCell, styles.numberCell]}>
          {(position.lotQuantity * position.gamma).toFixed(4)}
        </Text>
        <Text style={[styles.tableCell, styles.numberCell]}>
          {(position.lotQuantity * position.vega).toFixed(4)}
        </Text>
      </View>
    </View>
  );

  const PositionalGreeksRow = () => (
    <View style={[styles.tableRow, styles.summaryRow]}>
      {/* <Text style={[styles.tableCell, styles.positionCell]}></Text> */}
      <Text style={[styles.tableCell, styles.positionCell2]}>
        Positional Greeks:
      </Text>
      <View style={styles.greeksCont}>
        <Text
          style={[styles.tableCell, styles.numberCell2, styles.summaryValue]}
        >
          {/* {positionalTheta.toFixed(4)} */}
        </Text>
        <Text
          style={[styles.tableCell, styles.numberCell2, styles.summaryValue]}
        >
          {positionalTheta.toFixed(4)}
        </Text>
        <Text
          style={[styles.tableCell, styles.numberCell2, styles.summaryValue]}
        >
          {positionalDelta.toFixed(4)}
        </Text>
        <Text
          style={[styles.tableCell, styles.numberCell2, styles.summaryValue]}
        >
          {positionalGamma.toFixed(4)}
        </Text>
        <Text
          style={[styles.tableCell, styles.numberCell2, styles.summaryValue]}
        >
          {positionalVega.toFixed(4)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          <TableHeader />

          <ScrollView
            style={styles.tableBody}
            showsVerticalScrollIndicator={false}
          >
            {positions?.map((position, index) => (
              <TableRow key={index} position={position} index={index} />
            ))}
            <PositionalGreeksRow />
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 16,
    },
    noPositionsContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    noPositionsText: {
      fontSize: 18,
      fontWeight: "bold",
    },
    tableContainer: {
      minWidth: 800, // Ensure table doesn't get too cramped
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#e5e7eb",
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: isDark ? "#374151" : "#f8f9fa",
      borderBottomWidth: 2,
      borderBottomColor: isDark ? "#4b5563" : "#dee2e6",
      paddingVertical: 12,
      paddingHorizontal: 8,
    },
    headerCell: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#f3f4f6" : "#495057",
      textAlign: "center",
    },
    positionHeader: {
      textAlign: "left",
      paddingLeft: 8,
      flex:1
    },
    numberHeader: {
      // flex: 1,
    },
    tableBody: {
      maxHeight: 400, // Limit height for scrolling
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#374151" : "#e5e7eb",
      minHeight: 50,
      alignItems: "center",
    },
    evenRow: {
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
    },
    oddRow: {
      backgroundColor: isDark ? "#111827" : "#f8f9fa",
    },
    summaryRow: {
      backgroundColor: isDark ? "#374151" : "#e9ecef",
      borderTopWidth: 2,
      borderTopColor: isDark ? "#4b5563" : "#dee2e6",
    },
    tableCell: {
      fontSize: 13,
      color: isDark ? "#e5e7eb" : "#495057",
      textAlign: "center",
    },
    positionCell: {
      flex: 0.75,
      textAlign: "left",
      paddingLeft: 7,
      fontWeight: "500",
    },
    positionCell2: {
      flex: 1.1,
      textAlign: "left",
      paddingLeft: 7,
      fontWeight: "500",
    },
    numberCell: {
      // flex: 1,
      fontFamily: "monospace", // For better number alignment
    },
    greeksCont: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingRight: 30,
    },
    numberCell2: {
      // flex: 1,
      fontFamily: "monospace", // For better number alignment
    },
    summaryLabel: {
      fontWeight: "600",
      color: isDark ? "#f3f4f6" : "#343a40",
    },
    summaryValue: {
      fontWeight: "600",
      color: isDark ? "#60a5fa" : "#0056b3",
    },
  });

export default GreeksTable;
