// import React, { useEffect, useState } from "react";
// import { Col, Row, Table } from "reactstrap";
// import { postTickerPrice } from "../../../Unfluke_helpers/backend_helper";

// const ProfitAndLoss = ({ instrument, positions, minute, updateTotalPnlData }) => {
//     const [positionList, setPositionList] = useState(positions);
//     const [totalPnl, setTotalPnl] = useState("0.00");

//     useEffect(() => {
//         const fetchDataAndCalculatePnL = async () => {
//             let list = positions.filter(x => x.isActive);
//             let totalPnl = 0;

//             // Use Promise.all to handle asynchronous map properly
//             const updatedList = await Promise.all(
//                 list.map(async (x) => {
//                     let data = await postTickerPrice({
//                         instrument,
//                         expiry: x.expiry,
//                         cepe: x.cepe,
//                         strike: x.strike,
//                         minute
//                     });

//                     if (data) {
//                         x["currentPrice"] = data.close;

//                         // Calculate individual position PnL
//                         let positionPnl = 0;

//                         if (x.cepe == "CE" && x.type == "Buy") {
//                             positionPnl = (x.currentPrice - x.ltp) * x.lotQuantity;
//                         } else if (x.cepe == "PE" && x.type == "Sell") {
//                             positionPnl = (x.ltp - x.currentPrice) * x.lotQuantity;
//                         } else if (x.cepe == "PE" && x.type == "Buy") {
//                             positionPnl = (x.currentPrice - x.ltp) * x.lotQuantity;
//                         } else if (x.cepe == "CE" && x.type == "Sell") {
//                             positionPnl = (x.ltp - x.currentPrice) * x.lotQuantity; // Fixed: was using = instead of calculating
//                         }

//                         // Add to total PnL
//                         totalPnl += positionPnl;

//                         // Store individual position profit (convert to actual currency amount)
//                         x["profit"] = parseFloat(positionPnl * x.lotSize).toFixed(2);
//                     }
//                     return x;
//                 })
//             );

//             // Update total PnL (convert to actual currency amount)
//             const finalTotalPnl = (totalPnl * positions[0].lotSize).toFixed(2);
//             setTotalPnl(finalTotalPnl);
//             updateTotalPnlData(finalTotalPnl);
//             setPositionList(updatedList);
//         };


//         fetchDataAndCalculatePnL();
//     }, [positions, minute]);

//     return (
//         <React.Fragment>
//             <Row>
//                 <Col lg={12}>
//                     <div className="table-responsive mt-4 mt-xl-0">
//                         <Table className="table-hover table-striped align-middle table-nowrap mb-0">
//                             <thead>
//                                 <tr>
//                                     <th className="w-50">Position</th>
//                                     <th>Entry Price</th>
//                                     <th>Current Price</th>
//                                     <th>Exit Price</th>
//                                     <th>P&L</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {positionList?.map((position, index) => (
//                                     <tr key={index}>
//                                         <td>{position.type == "Buy" ? "+" : "-"}{position.lotQuantity}x {position.expiry} {position.strike}{position.cepe}</td>
//                                         <td>{position.ltp}</td>
//                                         <td>{position.currentPrice || "-"}</td> {/* Avoid showing undefined */}
//                                         <td>0</td>
//                                         <td>{position.profit}</td>
//                                     </tr>
//                                 ))}
//                                 <tr>
//                                     <td>Total P&L</td>
//                                     <td></td>
//                                     <td></td>
//                                     <td></td>
//                                     <td>{totalPnl}</td>
//                                 </tr>
//                             </tbody>
//                         </Table>
//                     </div>
//                 </Col>
//             </Row>
//         </React.Fragment>
//     );
// };

// export default ProfitAndLoss;




import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  useColorScheme,
  ActivityIndicator 
} from "react-native";
import { postTickerPrice } from "../../../Unfluke_helpers/backend_helper";

const ProfitAndLoss = ({ instrument, positions, minute, updateTotalPnlData }) => {
  const [positionList, setPositionList] = useState(positions);
  const [totalPnl, setTotalPnl] = useState("0.00");
  const [loading, setLoading] = useState(false);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const styles = getStyles(isDark);

  useEffect(() => {
    const fetchDataAndCalculatePnL = async () => {
      setLoading(true);
      
      let list = positions.filter(x => x.isActive);
      let totalPnl = 0;

      // Use Promise.all to handle asynchronous map properly
      const updatedList = await Promise.all(
        list.map(async (x) => {
          let data = await postTickerPrice({
            instrument,
            expiry: x.expiry,
            cepe: x.cepe,
            strike: x.strike,
            minute
          });

          if (data) {
            // Build a NEW object — never mutate the parent's position state.
            const currentPrice = data.close;
            let positionPnl = 0;

            if (x.cepe == "CE" && x.type == "Buy") {
              positionPnl = (currentPrice - x.ltp) * x.lotQuantity;
            } else if (x.cepe == "PE" && x.type == "Sell") {
              positionPnl = (x.ltp - currentPrice) * x.lotQuantity;
            } else if (x.cepe == "PE" && x.type == "Buy") {
              positionPnl = (currentPrice - x.ltp) * x.lotQuantity;
            } else if (x.cepe == "CE" && x.type == "Sell") {
              positionPnl = (x.ltp - currentPrice) * x.lotQuantity;
            }

            // Add to total PnL
            totalPnl += positionPnl;

            return {
              ...x,
              currentPrice,
              profit: parseFloat(positionPnl * x.lotSize).toFixed(2),
            };
          }
          return x;
        })
      );

      // Update total PnL (convert to actual currency amount)
      const lotSize = list[0]?.lotSize ?? positions[0]?.lotSize ?? 1;
      const finalTotalPnl = (totalPnl * lotSize).toFixed(2);
      setTotalPnl(finalTotalPnl);
      updateTotalPnlData(finalTotalPnl);
      setPositionList(updatedList);
      setLoading(false);
    };

    fetchDataAndCalculatePnL();
  }, [positions, minute]);

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.positionHeader]}>Position</Text>
      <Text style={[styles.headerCell, styles.priceHeader]}>Entry Price</Text>
      <Text style={[styles.headerCell, styles.priceHeader]}>Current Price</Text>
      <Text style={[styles.headerCell, styles.priceHeader]}>Exit Price</Text>
      <Text style={[styles.headerCell, styles.pnlHeader]}>P&L</Text>
    </View>
  );

  const PositionRow = ({ position, index }) => {
    const profit = parseFloat(position.profit || 0);
    const isProfit = profit >= 0;
    
    return (
      <View style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
        <Text style={[styles.tableCell, styles.positionCell]}>
          {position.type === "Buy" ? "+" : "-"}{position.lotQuantity}x {position.expiry} {position.strike}{position.cepe}
        </Text>
        <Text style={[styles.tableCell, styles.priceCell]}>
          {position.ltp}
        </Text>
        <Text style={[styles.tableCell, styles.priceCell]}>
          {position.currentPrice || "-"}
        </Text>
        <Text style={[styles.tableCell, styles.priceCell]}>
          0
        </Text>
        <Text style={[styles.tableCell, styles.pnlCell, isProfit ? styles.profitText : styles.lossText]}>
          {position.profit}
        </Text>
      </View>
    );
  };

  const TotalPnLRow = () => {
    const total = parseFloat(totalPnl);
    const isProfit = total >= 0;
    
    return (
      <View style={[styles.tableRow, styles.totalRow]}>
        <Text style={[styles.tableCell, styles.positionCell, styles.totalLabel]}>
          Total P&L
        </Text>
        <Text style={[styles.tableCell, styles.priceCell]}></Text>
        <Text style={[styles.tableCell, styles.priceCell]}></Text>
        <Text style={[styles.tableCell, styles.priceCell]}></Text>
        <Text style={[styles.tableCell, styles.pnlCell, styles.totalValue, isProfit ? styles.profitText : styles.lossText]}>
          {totalPnl}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={'#2962FF'} />
        <Text style={styles.loadingText}>Calculating P&L...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          <TableHeader />
          
          <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={false}>
            {positionList?.map((position, index) => (
              <PositionRow key={index} position={position} index={index} />
            ))}
            <TotalPnLRow />
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (isDark) => StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#787B86',
  },
  tableContainer: {
    minWidth: 800,
    backgroundColor: '#1E222D',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2A2E39',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  headerCell: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D4DC',
    textAlign: 'center',
  },
  positionHeader: {
    flex: 3,
    textAlign: 'left',
  },
  priceHeader: {
    flex: 1.2,
  },
  pnlHeader: {
    flex: 1.2,
  },
  tableBody: {
    maxHeight: 400,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    minHeight: 52,
    alignItems: 'center',
  },
  evenRow: {
    backgroundColor: '#1E222D',
  },
  oddRow: {
    backgroundColor: '#131722',
  },
  totalRow: {
    backgroundColor: '#2A2E39',
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  tableCell: {
    fontSize: 13,
    color: '#D1D4DC',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  positionCell: {
    flex: 3,
    textAlign: 'left',
    fontWeight: '500',
  },
  priceCell: {
    flex: 1.2,
    fontFamily: 'monospace',
    fontVariant: ['tabular-nums'],
  },
  pnlCell: {
    flex: 1.2,
    fontFamily: 'monospace',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  totalLabel: {
    fontWeight: '700',
    fontSize: 14,
    color: '#D1D4DC',
  },
  totalValue: {
    fontWeight: '700',
    fontSize: 14,
  },
  profitText: {
    color: '#089981',
  },
  lossText: {
    color: '#F23645',
  },
});

export default ProfitAndLoss;