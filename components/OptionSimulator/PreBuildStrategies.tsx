//Two Column code no horizontal scrolling

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Modal,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   Dimensions,
// } from "react-native";
// import { Image } from "expo-image";
// import { Picker } from "@react-native-picker/picker";
// import { useSelector } from "react-redux";
// import { getOptionChain } from "../../Unfluke_helpers/backend_helper";
// import { layoutModeTypes } from "../../components/UnflukeMain/constants/layout";
// import { createSelector } from "reselect";

// // ... (keep all your imports)

// import LongCall from "../../assets/images/svg/payoff-chart-svg/LongCall.svg";
// import Batman from "../../assets/images/svg/payoff-chart-svg/Batman.svg";
// import BearCallSpread from "../../assets/images/svg/payoff-chart-svg/BearCallSpread.svg";
// import BearishButterfly from "../../assets/images/svg/payoff-chart-svg/BearishButterfly.svg";
// import BearishCondor from "../../assets/images/svg/payoff-chart-svg/BearishCondor.svg";
// import BearPutSpread from "../../assets/images/svg/payoff-chart-svg/BearPutSpread.svg";
// import BullCallSpread from "../../assets/images/svg/payoff-chart-svg/BullCallSpread.svg";
// import BullishButterfly from "../../assets/images/svg/payoff-chart-svg/BullishButterfly.svg";
// import BullishCondor from "../../assets/images/svg/payoff-chart-svg/BullishCondor.svg";
// import BullPutSpread from "../../assets/images/svg/payoff-chart-svg/BullPutSpread.svg";
// import CallCalendar from "../../assets/images/svg/payoff-chart-svg/CallCalendar.svg";
// import CallRatioBackSpread from "../../assets/images/svg/payoff-chart-svg/CallRatioBackSpread.svg";
// import CallRatioSpread from "../../assets/images/svg/payoff-chart-svg/CallRatioSpread.svg";
// import DiagonalCalendarSpread from "../../assets/images/svg/payoff-chart-svg/DiagonalCalendarSpread.svg";
// import DoubleCondor from "../../assets/images/svg/payoff-chart-svg/DoubleCondor.svg";
// import DoubleFly from "../../assets/images/svg/payoff-chart-svg/DoubleFly.svg";
// import JadeLizard from "../../assets/images/svg/payoff-chart-svg/JadeLizard.svg";
// import LongIronCondor from "../../assets/images/svg/payoff-chart-svg/LongIronCondor.svg";
// import LongIronFly from "../../assets/images/svg/payoff-chart-svg/LongIronFly.svg";
// import LongPut from "../../assets/images/svg/payoff-chart-svg/LongPut.svg";
// import LongStraddle from "../../assets/images/svg/payoff-chart-svg/LongStraddle.svg";
// import LongStrangle from "../../assets/images/svg/payoff-chart-svg/LongStrangle.svg";
// import LongSyntheticFuture from "../../assets/images/svg/payoff-chart-svg/LongSyntheticFuture.svg";
// import PutCalendar from "../../assets/images/svg/payoff-chart-svg/PutCalendar.svg";
// import PutRatioBackSpread from "../../assets/images/svg/payoff-chart-svg/PutRatioBackSpread.svg";
// import PutRatioSpread from "../../assets/images/svg/payoff-chart-svg/PutRatioSpread.svg";
// import RangeForward from "../../assets/images/svg/payoff-chart-svg/RangeForward.svg";
// import ReverseJadeLizard from "../../assets/images/svg/payoff-chart-svg/ReverseJadeLizard.svg";
// import RiskReversal from "../../assets/images/svg/payoff-chart-svg/RiskReversal.svg";
// import ShortCall from "../../assets/images/svg/payoff-chart-svg/ShortCall.svg";
// import ShortIronCondor from "../../assets/images/svg/payoff-chart-svg/ShortIronCondor.svg";
// import ShortIronFly from "../../assets/images/svg/payoff-chart-svg/ShortIronFly.svg";
// import ShortPut from "../../assets/images/svg/payoff-chart-svg/ShortPut.svg";
// import ShortStraddle from "../../assets/images/svg/payoff-chart-svg/ShortStraddle.svg";
// import ShortStrangle from "../../assets/images/svg/payoff-chart-svg/ShortStrangle.svg";
// import ShortSyntheticFuture from "../../assets/images/svg/payoff-chart-svg/ShortSyntheticFuture.svg";

// const { width } = Dimensions.get("window");
// const cardWidth = (width - 64) / 2; // Adjust for padding and gap
// const cardHeight = 140;

// const PreBuildStrategies = ({
//   setPositions,
//   selectedExpiry,
//   selectedInstrument,
//   getOptionChain,
//   optionChain,
//   expiry,
// }) => {
//   // ... (keep all your state variables, useEffect, and functions)
// const [activeTab, setActiveTab] = useState("Bullish");
//   const [showModal, setShowModal] = useState(false);
//   const [modalTitle, setModalTitle] = useState("");
//   const [chainData, setChainData] = useState(optionChain);
//   const [draftPositions, setDraftPositions] = useState([]);
//   const [strikes, setStrikes] = useState([]);

//   const selectDashboardData = createSelector(
//     (state) => state.Layout,
//     (state) => ({
//       layoutMode: state.layoutModeType,
//     }),
//   );
  
//   const { layoutMode } = useSelector(selectDashboardData);
//   const isDarkMode = layoutMode === layoutModeTypes["DARKMODE"];

//   useEffect(() => {
//     async function getOptionChainData() {
//       const optionChainData = await getOptionChain();
//       setChainData(optionChainData);
//     }
//     getOptionChainData();
//   }, [selectedExpiry]);

//   const strategies = {
//     Bullish: [
//       { name: "Long Call", image: LongCall, id: "long-call" },
//       { name: "Short Put", image: ShortPut, id: "short-put" },
//       { name: "Bull Call Spread", image: BullCallSpread, id: "bull-call-spread" },
//       { name: "Bull Put Spread", image: BullPutSpread, id: "bull-put-spread" },
//       { name: "Call Ratio Back Spread", image: CallRatioBackSpread, id: "call-ratio-back-spread" },
//       { name: "Long Synthetic", image: LongSyntheticFuture, id: "long-synthetic" },
//       { name: "Range Forward", image: RangeForward, id: "range-forward" },
//       { name: "Bullish Butterfly", image: BullishButterfly, id: "bullish-butterfly" },
//       { name: "Bullish Condor", image: BullishCondor, id: "bullish-condor" },
//     ],
//     Bearish: [
//       { name: "Long Put", image: LongPut, id: "long-put" },
//       { name: "Short Call", image: ShortCall, id: "short-call" },
//       { name: "Bear Call Spread", image: BearCallSpread, id: "bear-call-spread" },
//       { name: "Bear Put Spread", image: BearPutSpread, id: "bear-put-spread" },
//       { name: "Put Ratio Back Spread", image: PutRatioBackSpread, id: "put-ratio-back-spread" },
//       { name: "Short Synthetic", image: ShortSyntheticFuture, id: "short-synthetic" },
//       { name: "Risk Reversal", image: RiskReversal, id: "risk-reversal" },
//       { name: "Bearish Butterfly", image: BearishButterfly, id: "bearish-butterfly" },
//       { name: "Bearish Condor", image: BearishCondor, id: "bearish-condor" },
//     ],
//     NonDirectional: [
//       { name: "Long Straddle", image: LongStraddle, id: "long-straddle" },
//       { name: "Short Straddle", image: ShortStraddle, id: "short-straddle" },
//       { name: "Long Strangle", image: LongStrangle, id: "long-strangle" },
//       { name: "Short Strangle", image: ShortStrangle, id: "short-strangle" },
//       { name: "Jade Lizard", image: JadeLizard, id: "jade-lizard" },
//       { name: "Reverse Jade Lizard", image: ReverseJadeLizard, id: "reverse-jade-lizard" },
//       { name: "Call Ratio Spread", image: CallRatioSpread, id: "call-ratio-spread" },
//       { name: "Put Ratio Spread", image: PutRatioSpread, id: "put-ratio-spread" },
//       { name: "Batman Strategy", image: Batman, id: "batman-strategy" },
//       { name: "Long Iron Fly", image: LongIronFly, id: "long-iron-fly" },
//       { name: "Short Iron Fly", image: ShortIronFly, id: "short-iron-fly" },
//       { name: "Double Fly", image: DoubleFly, id: "double-fly" },
//       { name: "Long Iron Condor", image: LongIronCondor, id: "long-iron-condor" },
//       { name: "Short Iron Condor", image: ShortIronCondor, id: "short-iron-condor" },
//       { name: "Double Condor", image: DoubleCondor, id: "double-condor" },
//       { name: "Call Calendar", image: CallCalendar, id: "call-calendar" },
//       { name: "Put Calendar", image: PutCalendar, id: "put-calendar" },
//       { name: "Diagonal Calendar Spread", image: DiagonalCalendarSpread, id: "diagonal-calendar-spread" },
//     ],
//   };

//   const generatePositionsForStrategy = (strategyId, expiry, selectedInstrument) => {
//     const spotPrice = selectedInstrument?.spotPrice;
//     const multiple = selectedInstrument?.multiple;
//     const lotSize = selectedInstrument?.lotSize;
//     const defaultExpiry = selectedExpiry.split("-").join("");

//     const strikes = [];
//     for (let i = -20; i <= 20; i++) {
//       const strike = parseInt(spotPrice / multiple) * multiple + i * multiple;
//       strikes.push(Math.round(strike));
//     }
//     setStrikes(strikes);
//     const midIndex = 20;

//     const pickStrike = (offset = 0) => {
//       const targetIndex = midIndex + offset;
//       if (targetIndex < 0) return strikes[0];
//       if (targetIndex >= strikes.length) return strikes[strikes.length - 1];
//       return strikes[targetIndex];
//     };

//     const buildLeg = ({ type = "Buy", cepe = "CE", strikeOffset = 0, lotQuantity = 1 }) => {
//       const row = optionChain.find((x) => x.strike == pickStrike(strikeOffset));
//       const ltp = cepe == "CE" ? row.callPrice : row.putPrice;
//       const iv = cepe == "CE" ? row.callIV : row.putIV;
//       const gamma = cepe == "CE" ? row.callGamma : row.putGamma;
//       const delta = cepe == "CE" ? row.callDelta : row.putDelta;
//       const vega = cepe == "CE" ? row.callVega : row.putVega;
//       const theta = cepe == "CE" ? row.callTheta : row.putTheta;

//       return {
//         id: new Date().getTime() + Math.floor(Math.random() * 100000),
//         type,
//         cepe,
//         strike: pickStrike(strikeOffset),
//         expiry: defaultExpiry,
//         lotSize,
//         ltp,
//         iv,
//         gamma,
//         delta,
//         vega,
//         theta,
//         lotQuantity,
//         isActive: true,
//       };
//     };

//     switch (strategyId) {
//       /* ------------------------- BULLISH STRATEGIES ------------------------- */
//       case "Long Call":
//         return [buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 2 })];
//       case "Short Put":
//         return [buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2 })];
//       case "Bull Call Spread":
//         return [
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 0 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 2 }),
//         ];
//       case "Bull Put Spread":
//         return [
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0 }),
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
//         ];
//       case "Call Ratio Back Spread":
//         return [
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0, lotQuantity: 1 }),
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 2, lotQuantity: 2 }),
//         ];
//       case "Long Synthetic":
//         return [
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 0 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0 }),
//         ];
//       case "Range Forward":
//         return [
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 2 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2 }),
//         ];
//       case "Bullish Butterfly":
//         return [
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 2, lotQuantity: 1 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0, lotQuantity: 2 }),
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: -2, lotQuantity: 1 }),
//         ];
//       case "Bullish Condor":
//         return [
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 2 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 1 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: -1 }),
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: -2 }),
//         ];

//       /* ------------------------- BEARISH STRATEGIES ------------------------- */
//       case "Long Put":
//         return [buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 })];
//       case "Short Call":
//         return [buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +2 })];
//       case "Bear Call Spread":
//         return [
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0 }),
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 2 }),
//         ];
//       case "Bear Put Spread":
//         return [
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 0 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2 }),
//         ];
//       case "Put Ratio Back Spread":
//         return [
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0, lotQuantity: 1 }),
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2, lotQuantity: 2 }),
//         ];
//       case "Short Synthetic":
//         return [
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 0 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0 }),
//         ];
//       case "Risk Reversal":
//         return [
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 2 }),
//         ];
//       case "Bearish Butterfly":
//         return [
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 2 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0, lotQuantity: 2 }),
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
//         ];
//       case "Bearish Condor":
//         return [
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 2 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 1 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -1 }),
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
//         ];

//       /* ------------------ NON-DIRECTIONAL STRATEGIES ------------------ */
//       case "Long Straddle":
//         return [
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 0 }),
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 0 }),
//         ];
//       case "Short Straddle":
//         return [
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0 }),
//         ];
//       case "Long Strangle":
//         return [
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +2 }),
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
//         ];
//       case "Short Strangle":
//         return [
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +2 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2 }),
//         ];
//       case "Jade Lizard":
//         return [
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +1 }),
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +2 }),
//         ];
//       case "Reverse Jade Lizard":
//         return [
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -1 }),
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0 }),
//         ];
//       case "Call Ratio Spread":
//         return [
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 0, lotQuantity: 1 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +2, lotQuantity: 2 }),
//         ];
//       case "Put Ratio Spread":
//         return [
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 0, lotQuantity: 1 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2, lotQuantity: 2 }),
//         ];
//       case "Batman Strategy":
//         return [
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +2, lotQuantity: 2 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2, lotQuantity: 2 }),
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +1, lotQuantity: 1 }),
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -1, lotQuantity: 1 }),
//         ];
//       case "Long Iron Fly":
//         return [
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0 }),
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 2 }),
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0 }),
//         ];
//       case "Short Iron Fly":
//         return [
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 0 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 2 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2 }),
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 0 }),
//         ];
//       case "Double Fly":
//         return [
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -1, lotQuantity: 1 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +2, lotQuantity: 2 }),
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +1, lotQuantity: 1 }),
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +3, lotQuantity: 1 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2, lotQuantity: 2 }),
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -3, lotQuantity: 1 }),
//         ];
//       case "Long Iron Condor":
//         return [
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -1 }),
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +2 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +1 }),
//         ];
//       case "Short Iron Condor":
//         return [
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -1 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +2 }),
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +1 }),
//         ];
//       case "Double Condor":
//         return [
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2 }),
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -3 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: -1 }),
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 0 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 1 }),
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 0 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +2 }),
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +3 }),
//         ];
//       case "Call Calendar":
//         return [
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 0 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0 }),
//         ].map((pos) => ({ ...pos, expiry: defaultExpiry }));
//       case "Put Calendar":
//         return [
//           buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 0 }),
//           buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0 }),
//         ].map((pos) => ({ ...pos, expiry: defaultExpiry }));
//       case "Diagonal Calendar Spread":
//         return [
//           buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +2 }),
//           buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0 }),
//         ].map((pos) => ({ ...pos, expiry: defaultExpiry }));

//       default:
//         return [];
//     }
//   };

//   const handleTabClick = (tab) => {
//     setActiveTab(tab);
//   };

//   const handleStrategyClick = (strategy) => {
//     const defaultPositions = generatePositionsForStrategy(
//       strategy.name,
//       selectedExpiry,
//       selectedInstrument,
//     );
//     setDraftPositions(defaultPositions);
//     setModalTitle(strategy.name);
//     setShowModal(true);
//   };

//   const handlePositionChange = (index, key, value) => {
//     const updated = [...draftPositions];

//     if (key === "expiry" || key === "lotQuantity") {
//       updated.forEach((pos) => {
//         pos[key] = value;
//       });
//     } else {
//       updated[index][key] = value;
//     }

//     if (key === "strike" || key === "lotQuantity") {
//       updated[index][key] = parseInt(value, 10) || 1;
//     }

//     if (key === "lotQuantity" && updated[index].lotQuantity < 1) {
//       updated[index].lotQuantity = 1;
//     }

//     setDraftPositions(updated);
//   };


//     const handleAddPositions = () => {
//     setPositions((prev) => [...draftPositions]);
//     setShowModal(false);
//   };



//   const renderStrategyCard = (item) => (
//     <TouchableOpacity
//       key={item.id}
//       style={[
//         styles.strategyCard,
//         isDarkMode ? styles.strategyCardDark : styles.strategyCardLight,
//         { width: cardWidth, height: cardHeight }
//       ]}
//       onPress={() => handleStrategyClick(item)}
//       activeOpacity={0.8}
//     >
//       <Image
//         source={item.image}
//         style={styles.strategyImage}
//         contentFit="contain"
//       />
//       <Text style={[
//         styles.strategyName,
//         isDarkMode ? styles.strategyNameDark : styles.strategyNameLight
//       ]}>
//         {item.name}
//       </Text>
//     </TouchableOpacity>
//   );

//   const renderStrategyGrid = () => {
//     const strategyList = strategies[activeTab];
//     const rows = [];
    
//     for (let i = 0; i < strategyList.length; i += 3) {
//       const row = (
//         <View key={i} style={styles.row}>
//           {renderStrategyCard(strategyList[i])}
//           {strategyList[i + 1] && renderStrategyCard(strategyList[i + 1])}
//         </View>
//       );
//       rows.push(row);
//     }
    
//     return rows;
//   };

//   return (
//     <View style={styles.container}>
//       {/* Strategy Type Tabs */}
//       <View style={styles.tabContainer}>
//         <Text style={[
//           styles.sectionLabel,
//           isDarkMode ? styles.sectionLabelDark : styles.sectionLabelLight
//         ]}>
//           Strategy Types
//         </Text>
//         <View style={[
//           styles.tabBar,
//           isDarkMode ? styles.tabBarDark : styles.tabBarLight
//         ]}>
//           {["Bullish", "Bearish", "NonDirectional"].map((tab) => (
//             <TouchableOpacity
//               key={tab}
//               style={[
//                 styles.tab,
//                 activeTab === tab && (isDarkMode ? styles.activeTabDark : styles.activeTabLight)
//               ]}
//               onPress={() => handleTabClick(tab)}
//             >
//               <Text style={[
//                 styles.tabText,
//                 activeTab === tab 
//                   ? (isDarkMode ? styles.activeTabTextDark : styles.activeTabTextLight)
//                   : (isDarkMode ? styles.inactiveTabTextDark : styles.inactiveTabTextLight)
//               ]}>
//                 {tab === "NonDirectional" ? "NON-DIRECTIONAL" : tab.toUpperCase()}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* Strategy Cards Grid */}
//       <ScrollView 
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.gridContainer}
//       >
//         {renderStrategyGrid()}
//       </ScrollView>

//       {/* Strategy Configuration Modal */}
//       {/* ... (keep your modal code as is) */}
//             <Modal
//         visible={showModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[
//             styles.modalContainer,
//             isDarkMode ? styles.modalContainerDark : styles.modalContainerLight
//           ]}>
//             <View style={styles.modalHeader}>
//               <Text style={[
//                 styles.modalTitle,
//                 isDarkMode ? styles.modalTitleDark : styles.modalTitleLight
//               ]}>
//                 {modalTitle}
//               </Text>
//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={() => setShowModal(false)}
//               >
//                 <Text style={styles.closeButtonText}>×</Text>
//               </TouchableOpacity>
//             </View>

//             <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
//               {draftPositions.length === 0 ? (
//                 <Text style={[
//                   styles.noPositionsText,
//                   isDarkMode ? styles.noPositionsTextDark : styles.noPositionsTextLight
//                 ]}>
//                   No default positions available for this strategy.
//                 </Text>
//               ) : (
//                 <>
//                   {draftPositions.map((pos, idx) => {
//                     const sign = pos.type === "Buy" ? "+" : "-";
//                     const plusMinusQty = `${sign}${pos.lotQuantity}x`;
                    
//                     return (
//                                               <View key={pos.id} style={styles.positionContainer}>
//                         <View style={styles.positionHeader}>
//                           <Text style={[
//                             styles.positionQuantity,
//                             isDarkMode ? styles.positionQuantityDark : styles.positionQuantityLight
//                           ]}>
//                             {plusMinusQty}
//                           </Text>
//                           <Text style={[
//                             styles.positionType,
//                             isDarkMode ? styles.positionTypeDark : styles.positionTypeLight
//                           ]}>
//                             {pos.cepe}
//                           </Text>
//                         </View>
                        
//                         <View style={styles.strikePickerContainer}>
//                           <Text style={[
//                             styles.strikeLabel,
//                             isDarkMode ? styles.strikeLabelDark : styles.strikeLabelLight
//                           ]}>
//                             Select {pos.cepe} Strike
//                           </Text>
//                           <View style={[
//                             styles.pickerWrapper,
//                             isDarkMode ? styles.pickerWrapperDark : styles.pickerWrapperLight
//                           ]}>
//                             <Picker
//                               selectedValue={pos.strike}
//                               style={[
//                                 styles.picker,
//                                 isDarkMode ? styles.pickerDark : styles.pickerLight
//                               ]}
//                               onValueChange={(value) =>
//                                 handlePositionChange(idx, "strike", value)
//                               }
//                             >
//                               {strikes.map((strike) => (
//                                 <Picker.Item
//                                   key={strike}
//                                   label={strike.toString()}
//                                   value={strike}
//                                   color={isDarkMode ? "#FFFFFF" : "#000000"}
//                                 />
//                               ))}
//                             </Picker>
//                           </View>
//                         </View>
//                       </View>
//                     );
//                   })}
//                 </>
//               )}
//             </ScrollView>

//             <View style={styles.modalFooter}>
//               <TouchableOpacity
//                 style={[
//                   styles.addButton,
//                   draftPositions.length === 0 && styles.addButtonDisabled
//                 ]}
//                 onPress={handleAddPositions}
//                 disabled={draftPositions.length === 0}
//               >
//                 <Text style={styles.addButtonText}>
//                   ADD {modalTitle.toUpperCase()}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#FFFFFF",
//     padding: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     marginBottom: 20,
//   },
//   gridContainer: {
//     paddingVertical: 10,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 12,
//   },
//   strategyCard: {
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     padding: 8,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   strategyCardLight: {
//     backgroundColor: "#FFFFFF",
//   },
//   strategyCardDark: {
//     backgroundColor: "#374151",
//   },
//   strategyImage: {
//     width: 50,
//     height: 50,
//     marginBottom: 8,
//   },
//   strategyName: {
//     fontSize: 10,
//     fontWeight: "500",
//     textAlign: "center",
//     lineHeight: 12,
//   },
//   strategyNameLight: {
//     color: "#111827",
//   },
//   strategyNameDark: {
//     color: "#FFFFFF",
//   },
//   horizontalScrollContainer: {
//     paddingVertical: 10,
//   },

//   tabContainer: {
//     marginBottom: 20,
//   },
//   sectionLabel: {
//     fontSize: 14,
//     fontWeight: "500",
//     marginBottom: 8,
//   },
//   sectionLabelLight: {
//     color: "#374151",
//   },
//   sectionLabelDark: {
//     color: "#E5E7EB",
//   },
//   tabBar: {
//     flexDirection: "row",
//     borderRadius: 8,
//     padding: 4,
//   },
//   tabBarLight: {
//     backgroundColor: "#F3F4F6",
//   },
//   tabBarDark: {
//     backgroundColor: "#374151",
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   activeTabLight: {
//     backgroundColor: "#FFFFFF",
//   },
//   activeTabDark: {
//     backgroundColor: "#1F2937",
//   },
//   tabText: {
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   activeTabTextLight: {
//     color: "#000000",
//   },
//   activeTabTextDark: {
//     color: "#FFFFFF",
//   },
//   inactiveTabTextLight: {
//     color: "#6B7280",
//   },
//   inactiveTabTextDark: {
//     color: "#9CA3AF",
//   },
//   strategyGrid: {
//     paddingHorizontal: 4,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContainer: {
//     width: "90%",
//     maxHeight: "80%",
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   modalContainerLight: {
//     backgroundColor: "#FFFFFF",
//   },
//   modalContainerDark: {
//     backgroundColor: "#1F2937",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E7EB",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   modalTitleLight: {
//     color: "#111827",
//   },
//   modalTitleDark: {
//     color: "#FFFFFF",
//   },
//   closeButton: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: "#F3F4F6",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   closeButtonText: {
//     fontSize: 20,
//     color: "#6B7280",
//     fontWeight: "bold",
//   },
//   modalBody: {
//     maxHeight: 400,
//     padding: 20,
//   },
//   noPositionsText: {
//     textAlign: "center",
//     fontSize: 16,
//     fontStyle: "italic",
//   },
//   noPositionsTextLight: {
//     color: "#6B7280",
//   },
//   noPositionsTextDark: {
//     color: "#9CA3AF",
//   },
//   positionContainer: {
//     marginBottom: 20,
//     padding: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   positionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   positionQuantity: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   positionQuantityLight: {
//     color: "#111827",
//   },
//   positionQuantityDark: {
//     color: "#FFFFFF",
//   },
//   positionType: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   positionTypeLight: {
//     color: "#6B7280",
//   },
//   positionTypeDark: {
//     color: "#9CA3AF",
//   },
//   strikePickerContainer: {
//     marginTop: 8,
//   },
//   strikeLabel: {
//     fontSize: 14,
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   strikeLabelLight: {
//     color: "#6B7280",
//   },
//   strikeLabelDark: {
//     color: "#9CA3AF",
//   },
//   pickerWrapper: {
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//   },
//   pickerWrapperLight: {
//     backgroundColor: "#F9FAFB",
//   },
//   pickerWrapperDark: {
//     backgroundColor: "#374151",
//   },
//   picker: {
//     height: 50,
//   },
//   pickerLight: {
//     color: "#111827",
//   },
//   pickerDark: {
//     color: "#FFFFFF",
//   },
//   modalFooter: {
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: "#E5E7EB",
//   },
//   addButton: {
//     backgroundColor: "#3B82F6",
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   addButtonDisabled: {
//     backgroundColor: "#9CA3AF",
//   },
//   addButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });

// export default PreBuildStrategies;






import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { Picker } from "@react-native-picker/picker";
import { useSelector } from "react-redux";
import { getOptionChain } from "../../Unfluke_helpers/backend_helper";
import { layoutModeTypes } from "../../components/UnflukeMain/constants/layout";
import { createSelector } from "reselect";

// Import all SVG files
import LongCall from "../../assets/images/svg/payoff-chart-svg/LongCall.svg";
import Batman from "../../assets/images/svg/payoff-chart-svg/Batman.svg";
import BearCallSpread from "../../assets/images/svg/payoff-chart-svg/BearCallSpread.svg";
import BearishButterfly from "../../assets/images/svg/payoff-chart-svg/BearishButterfly.svg";
import BearishCondor from "../../assets/images/svg/payoff-chart-svg/BearishCondor.svg";
import BearPutSpread from "../../assets/images/svg/payoff-chart-svg/BearPutSpread.svg";
import BullCallSpread from "../../assets/images/svg/payoff-chart-svg/BullCallSpread.svg";
import BullishButterfly from "../../assets/images/svg/payoff-chart-svg/BullishButterfly.svg";
import BullishCondor from "../../assets/images/svg/payoff-chart-svg/BullishCondor.svg";
import BullPutSpread from "../../assets/images/svg/payoff-chart-svg/BullPutSpread.svg";
import CallCalendar from "../../assets/images/svg/payoff-chart-svg/CallCalendar.svg";
import CallRatioBackSpread from "../../assets/images/svg/payoff-chart-svg/CallRatioBackSpread.svg";
import CallRatioSpread from "../../assets/images/svg/payoff-chart-svg/CallRatioSpread.svg";
import DiagonalCalendarSpread from "../../assets/images/svg/payoff-chart-svg/DiagonalCalendarSpread.svg";
import DoubleCondor from "../../assets/images/svg/payoff-chart-svg/DoubleCondor.svg";
import DoubleFly from "../../assets/images/svg/payoff-chart-svg/DoubleFly.svg";
import JadeLizard from "../../assets/images/svg/payoff-chart-svg/JadeLizard.svg";
import LongIronCondor from "../../assets/images/svg/payoff-chart-svg/LongIronCondor.svg";
import LongIronFly from "../../assets/images/svg/payoff-chart-svg/LongIronFly.svg";
import LongPut from "../../assets/images/svg/payoff-chart-svg/LongPut.svg";
import LongStraddle from "../../assets/images/svg/payoff-chart-svg/LongStraddle.svg";
import LongStrangle from "../../assets/images/svg/payoff-chart-svg/LongStrangle.svg";
import LongSyntheticFuture from "../../assets/images/svg/payoff-chart-svg/LongSyntheticFuture.svg";
import PutCalendar from "../../assets/images/svg/payoff-chart-svg/PutCalendar.svg";
import PutRatioBackSpread from "../../assets/images/svg/payoff-chart-svg/PutRatioBackSpread.svg";
import PutRatioSpread from "../../assets/images/svg/payoff-chart-svg/PutRatioSpread.svg";
import RangeForward from "../../assets/images/svg/payoff-chart-svg/RangeForward.svg";
import ReverseJadeLizard from "../../assets/images/svg/payoff-chart-svg/ReverseJadeLizard.svg";
import RiskReversal from "../../assets/images/svg/payoff-chart-svg/RiskReversal.svg";
import ShortCall from "../../assets/images/svg/payoff-chart-svg/ShortCall.svg";
import ShortIronCondor from "../../assets/images/svg/payoff-chart-svg/ShortIronCondor.svg";
import ShortIronFly from "../../assets/images/svg/payoff-chart-svg/ShortIronFly.svg";
import ShortPut from "../../assets/images/svg/payoff-chart-svg/ShortPut.svg";
import ShortStraddle from "../../assets/images/svg/payoff-chart-svg/ShortStraddle.svg";
import ShortStrangle from "../../assets/images/svg/payoff-chart-svg/ShortStrangle.svg";
import ShortSyntheticFuture from "../../assets/images/svg/payoff-chart-svg/ShortSyntheticFuture.svg";


const PreBuildStrategies = ({
  setPositions,
  selectedExpiry,
  selectedInstrument,
  getOptionChain,
  optionChain,
  expiry,
}) => {
  const [activeTab, setActiveTab] = useState("Bullish");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [chainData, setChainData] = useState(optionChain);
  const [draftPositions, setDraftPositions] = useState([]);
  const [strikes, setStrikes] = useState([]);
  
const { width } = useWindowDimensions();

  const selectDashboardData = createSelector(
    (state) => state.Layout,
    (state) => ({
      layoutMode: state.layoutModeType,
    }),
  );
  
  const { layoutMode } = useSelector(selectDashboardData);
  const isDarkMode = layoutMode === layoutModeTypes["DARKMODE"];

  useEffect(() => {
    async function getOptionChainData(){
      // console.log("GETTING OPTION CHAIN", selectedExpiry);
      const optionChainData = await getOptionChain();
      // console.log("OPTION CHAIN", optionChainData);
      setChainData(optionChainData);
    }
    getOptionChainData();
  }, [selectedExpiry]);

  const strategies = {
    Bullish: [
      { name: "Long Call", image: LongCall, id: "long-call" },
      { name: "Short Put", image: ShortPut, id: "short-put" },
      { name: "Bull Call Spread", image: BullCallSpread, id: "bull-call-spread" },
      { name: "Bull Put Spread", image: BullPutSpread, id: "bull-put-spread" },
      { name: "Call Ratio Back Spread", image: CallRatioBackSpread, id: "call-ratio-back-spread" },
      { name: "Long Synthetic", image: LongSyntheticFuture, id: "long-synthetic" },
      { name: "Range Forward", image: RangeForward, id: "range-forward" },
      { name: "Bullish Butterfly", image: BullishButterfly, id: "bullish-butterfly" },
      { name: "Bullish Condor", image: BullishCondor, id: "bullish-condor" },
    ],
    Bearish: [
      { name: "Long Put", image: LongPut, id: "long-put" },
      { name: "Short Call", image: ShortCall, id: "short-call" },
      { name: "Bear Call Spread", image: BearCallSpread, id: "bear-call-spread" },
      { name: "Bear Put Spread", image: BearPutSpread, id: "bear-put-spread" },
      { name: "Put Ratio Back Spread", image: PutRatioBackSpread, id: "put-ratio-back-spread" },
      { name: "Short Synthetic", image: ShortSyntheticFuture, id: "short-synthetic" },
      { name: "Risk Reversal", image: RiskReversal, id: "risk-reversal" },
      { name: "Bearish Butterfly", image: BearishButterfly, id: "bearish-butterfly" },
      { name: "Bearish Condor", image: BearishCondor, id: "bearish-condor" },
    ],
    NonDirectional: [
      { name: "Long Straddle", image: LongStraddle, id: "long-straddle" },
      { name: "Short Straddle", image: ShortStraddle, id: "short-straddle" },
      { name: "Long Strangle", image: LongStrangle, id: "long-strangle" },
      { name: "Short Strangle", image: ShortStrangle, id: "short-strangle" },
      { name: "Jade Lizard", image: JadeLizard, id: "jade-lizard" },
      { name: "Reverse Jade Lizard", image: ReverseJadeLizard, id: "reverse-jade-lizard" },
      { name: "Call Ratio Spread", image: CallRatioSpread, id: "call-ratio-spread" },
      { name: "Put Ratio Spread", image: PutRatioSpread, id: "put-ratio-spread" },
      { name: "Batman Strategy", image: Batman, id: "batman-strategy" },
      { name: "Long Iron Fly", image: LongIronFly, id: "long-iron-fly" },
      { name: "Short Iron Fly", image: ShortIronFly, id: "short-iron-fly" },
      { name: "Double Fly", image: DoubleFly, id: "double-fly" },
      { name: "Long Iron Condor", image: LongIronCondor, id: "long-iron-condor" },
      { name: "Short Iron Condor", image: ShortIronCondor, id: "short-iron-condor" },
      { name: "Double Condor", image: DoubleCondor, id: "double-condor" },
      { name: "Call Calendar", image: CallCalendar, id: "call-calendar" },
      { name: "Put Calendar", image: PutCalendar, id: "put-calendar" },
      { name: "Diagonal Calendar Spread", image: DiagonalCalendarSpread, id: "diagonal-calendar-spread" },
    ],
  };

  const generatePositionsForStrategy = (strategyId, expiry, selectedInstrument) => {
    const spotPrice = selectedInstrument?.spotPrice;
    const multiple = selectedInstrument?.multiple;
    const lotSize = selectedInstrument?.lotSize;
    const defaultExpiry = selectedExpiry.split("-").join("");
    console.log(strategyId, defaultExpiry, selectedInstrument);

    const strikes = [];
    for (let i = -20; i <= 20; i++) {
      const strike = parseInt(spotPrice / multiple) * multiple + i * multiple;
      strikes.push(Math.round(strike));
    }
    setStrikes(strikes);
    const midIndex = 20;

    const pickStrike = (offset = 0) => {
      const targetIndex = midIndex + offset;
      if (targetIndex < 0) return strikes[0];
      if (targetIndex >= strikes.length) return strikes[strikes.length - 1];
      return strikes[targetIndex];
    };

    const buildLeg = ({ type = "Buy", cepe = "CE", strikeOffset = 0, lotQuantity = 1 }) => {
      const row = optionChain.find((x) => x.strike == pickStrike(strikeOffset));
      const ltp = cepe == "CE" ? row.callPrice : row.putPrice;
      const iv = cepe == "CE" ? row.callIV : row.putIV;
      const gamma = cepe == "CE" ? row.callGamma : row.putGamma;
      const delta = cepe == "CE" ? row.callDelta : row.putDelta;
      const vega = cepe == "CE" ? row.callVega : row.putVega;
      const theta = cepe == "CE" ? row.callTheta : row.putTheta;

      return {
        id: new Date().getTime() + Math.floor(Math.random() * 100000),
        type,
        cepe,
        strike: pickStrike(strikeOffset),
        expiry: defaultExpiry,
        lotSize,
        ltp,
        iv,
        gamma,
        delta,
        vega,
        theta,
        lotQuantity,
        isActive: true,
      };
    };

    switch (strategyId) {
      /* ------------------------- BULLISH STRATEGIES ------------------------- */
      case "Long Call":
        return [buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 2 })];
      case "Short Put":
        return [buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2 })];
      case "Bull Call Spread":
        return [
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 0 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 2 }),
        ];
      case "Bull Put Spread":
        return [
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0 }),
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
        ];
      case "Call Ratio Back Spread":
        return [
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0, lotQuantity: 1 }),
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 2, lotQuantity: 2 }),
        ];
      case "Long Synthetic":
        return [
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 0 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0 }),
        ];
      case "Range Forward":
        return [
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 2 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2 }),
        ];
      case "Bullish Butterfly":
        return [
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 2, lotQuantity: 1 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0, lotQuantity: 2 }),
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: -2, lotQuantity: 1 }),
        ];
      case "Bullish Condor":
        return [
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 2 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 1 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: -1 }),
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: -2 }),
        ];

      /* ------------------------- BEARISH STRATEGIES ------------------------- */
      case "Long Put":
        return [buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 })];
      case "Short Call":
        return [buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +2 })];
      case "Bear Call Spread":
        return [
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0 }),
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 2 }),
        ];
      case "Bear Put Spread":
        return [
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 0 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2 }),
        ];
      case "Put Ratio Back Spread":
        return [
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0, lotQuantity: 1 }),
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2, lotQuantity: 2 }),
        ];
      case "Short Synthetic":
        return [
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 0 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0 }),
        ];
      case "Risk Reversal":
        return [
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 2 }),
        ];
      case "Bearish Butterfly":
        return [
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 2 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0, lotQuantity: 2 }),
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
        ];
      case "Bearish Condor":
        return [
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 2 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 1 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -1 }),
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
        ];

      /* ------------------ NON-DIRECTIONAL STRATEGIES ------------------ */
      case "Long Straddle":
        return [
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 0 }),
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 0 }),
        ];
      case "Short Straddle":
        return [
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0 }),
        ];
      case "Long Strangle":
        return [
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +2 }),
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
        ];
      case "Short Strangle":
        return [
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +2 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2 }),
        ];
      case "Jade Lizard":
        return [
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +1 }),
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +2 }),
        ];
      case "Reverse Jade Lizard":
        return [
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -1 }),
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0 }),
        ];
      case "Call Ratio Spread":
        return [
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 0, lotQuantity: 1 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +2, lotQuantity: 2 }),
        ];
      case "Put Ratio Spread":
        return [
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 0, lotQuantity: 1 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2, lotQuantity: 2 }),
        ];
      case "Batman Strategy":
        return [
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +2, lotQuantity: 2 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2, lotQuantity: 2 }),
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +1, lotQuantity: 1 }),
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -1, lotQuantity: 1 }),
        ];
      case "Long Iron Fly":
        return [
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0 }),
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 2 }),
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0 }),
        ];
      case "Short Iron Fly":
        return [
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 0 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 2 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2 }),
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 0 }),
        ];
      case "Double Fly":
        return [
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -1, lotQuantity: 1 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +2, lotQuantity: 2 }),
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +1, lotQuantity: 1 }),
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +3, lotQuantity: 1 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2, lotQuantity: 2 }),
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -3, lotQuantity: 1 }),
        ];
      case "Long Iron Condor":
        return [
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -1 }),
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -2 }),
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +2 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +1 }),
        ];
      case "Short Iron Condor":
        return [
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -1 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +2 }),
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +1 }),
        ];
      case "Double Condor":
        return [
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: -2 }),
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: -3 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: -1 }),
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 0 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 1 }),
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 0 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: +2 }),
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +3 }),
        ];
      case "Call Calendar":
        return [
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: 0 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0 }),
        ].map((pos) => ({ ...pos, expiry: defaultExpiry }));
      case "Put Calendar":
        return [
          buildLeg({ type: "Buy", cepe: "PE", strikeOffset: 0 }),
          buildLeg({ type: "Sell", cepe: "PE", strikeOffset: 0 }),
        ].map((pos) => ({ ...pos, expiry: defaultExpiry }));
      case "Diagonal Calendar Spread":
        return [
          buildLeg({ type: "Buy", cepe: "CE", strikeOffset: +2 }),
          buildLeg({ type: "Sell", cepe: "CE", strikeOffset: 0 }),
        ].map((pos) => ({ ...pos, expiry: defaultExpiry }));

      default:
        return [];
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleStrategyClick = (strategy) => {
    const defaultPositions = generatePositionsForStrategy(
      strategy.name,
      selectedExpiry,
      selectedInstrument,
    );
    setDraftPositions(defaultPositions);
    setModalTitle(strategy.name);
    setShowModal(true);
  };

  const handlePositionChange = (index, key, value) => {
    const updated = [...draftPositions];

    if (key === "expiry" || key === "lotQuantity") {
      updated.forEach((pos) => {
        pos[key] = value;
      });
    } else {
      updated[index][key] = value;
    }

    if (key === "strike" || key === "lotQuantity") {
      updated[index][key] = parseInt(value, 10) || 1;
    }

    if (key === "lotQuantity" && updated[index].lotQuantity < 1) {
      updated[index].lotQuantity = 1;
    }

    setDraftPositions(updated);
  };

  const handleAddPositions = () => {
    setPositions((prev) => [...draftPositions]);
    setShowModal(false);
  };

  // Calculate number of columns based on screen width
  const numColumns = Math.floor((width - 32) / 130); // 130px per card with margin
  
  const renderStrategyGrid = () => {
    const strategyList = strategies[activeTab];
    const rows = [];
    
    for (let i = 0; i < strategyList.length; i += numColumns) {
      const rowItems = strategyList.slice(i, i + numColumns);
      
      const row = (
        <View key={i} style={styles.row}>
          {rowItems.map((strategy, index) => (
            <View key={strategy.id} style={styles.cardContainer}>
              <TouchableOpacity
                style={[
                  styles.strategyCard,
                  isDarkMode ? styles.strategyCardDark : styles.strategyCardLight
                ]}
                onPress={() => handleStrategyClick(strategy)}
                activeOpacity={0.8}
              >
                <Image
                  source={strategy.image}
                  style={styles.strategyImage}
                  contentFit="contain"
                />
                <Text
                  style={[
                    styles.strategyName,
                    isDarkMode ? styles.strategyNameDark : styles.strategyNameLight
                  ]}
                  numberOfLines={2}
                >
                  {strategy.name}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      );
      rows.push(row);
    }
    
    return rows;
  };

  return (
    <View style={[
      styles.container,
      isDarkMode ? styles.containerDark : styles.containerLight
    ]}>
      {/* Strategy Type Tabs */}
      <View style={styles.tabContainer}>
        <Text style={[
          styles.sectionLabel,
          isDarkMode ? styles.sectionLabelDark : styles.sectionLabelLight
        ]}>
          Strategy Types
        </Text>
        <View style={[
          styles.tabBar,
          isDarkMode ? styles.tabBarDark : styles.tabBarLight
        ]}>
          {["Bullish", "Bearish", "NonDirectional"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && (isDarkMode ? styles.activeTabDark : styles.activeTabLight)
              ]}
              onPress={() => handleTabClick(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab 
                  ? (isDarkMode ? styles.activeTabTextDark : styles.activeTabTextLight)
                  : (isDarkMode ? styles.inactiveTabTextDark : styles.inactiveTabTextLight)
              ]}>
                {tab === "NonDirectional" ? "NON-DIRECTIONAL" : tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Strategy Cards Grid */}
      <ScrollView 
        horizontal
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      >
        {renderStrategyGrid()}
      </ScrollView>

      {/* Strategy Configuration Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContainer,
            isDarkMode ? styles.modalContainerDark : styles.modalContainerLight
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                isDarkMode ? styles.modalTitleDark : styles.modalTitleLight
              ]}>
                {modalTitle}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {draftPositions.length === 0 ? (
                <Text style={[
                  styles.noPositionsText,
                  isDarkMode ? styles.noPositionsTextDark : styles.noPositionsTextLight
                ]}>
                  No default positions available for this strategy.
                </Text>
              ) : (
                <>
                  {draftPositions.map((pos, idx) => {
                    const sign = pos.type === "Buy" ? "+" : "-";
                    const plusMinusQty = `${sign}${pos.lotQuantity}x`;
                    
                    return (
                      <View key={pos.id} style={styles.positionContainer}>
                        <View style={styles.positionHeader}>
                          <Text style={[
                            styles.positionQuantity,
                            isDarkMode ? styles.positionQuantityDark : styles.positionQuantityLight
                          ]}>
                            {plusMinusQty}
                          </Text>
                          <Text style={[
                            styles.positionType,
                            isDarkMode ? styles.positionTypeDark : styles.positionTypeLight
                          ]}>
                            {pos.cepe}
                          </Text>
                        </View>
                        
                        <View style={styles.strikePickerContainer}>
                          <Text style={[
                            styles.strikeLabel,
                            isDarkMode ? styles.strikeLabelDark : styles.strikeLabelLight
                          ]}>
                            Select {pos.cepe} Strike
                          </Text>
                          <View style={[
                            styles.pickerWrapper,
                            isDarkMode ? styles.pickerWrapperDark : styles.pickerWrapperLight
                          ]}>
                            <Picker
                              selectedValue={pos.strike}
                              style={[
                                styles.picker,
                                isDarkMode ? styles.pickerDark : styles.pickerLight
                              ]}
                              onValueChange={(value) =>
                                handlePositionChange(idx, "strike", value)
                              }
                            >
                              {strikes.map((strike) => (
                                <Picker.Item
                                  key={strike}
                                  label={strike.toString()}
                                  value={strike}
                                  color={isDarkMode ? "#FFFFFF" : "#000000"}
                                  style={{fontSize:14}}
                                />
                              ))}
                            </Picker>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  draftPositions.length === 0 && styles.addButtonDisabled
                ]}
                onPress={handleAddPositions}
                disabled={draftPositions.length === 0}
              >
                <Text style={styles.addButtonText}>
                  ADD {modalTitle.toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  containerLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  containerDark: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
  },
  gridContainer: {
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  cardContainer: {
    marginRight: 12,
    marginBottom: 4,
  },
  strategyCard: {
    width: 130,
    height: 110,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  strategyCardLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  strategyCardDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  strategyImage: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  strategyName: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 12,
    paddingBottom: 8,
  },
  strategyNameLight: {
    color: "#111827",
  },
  strategyNameDark: {
    color: "#FFFFFF",
  },
  tabContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 16,
  },
  sectionLabelLight: {
    color: "#374151",
  },
  sectionLabelDark: {
    color: "#E5E7EB",
  },
  tabBar: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 4,
  },
  tabBarLight: {
    backgroundColor: "#F3F4F6",
  },
  tabBarDark: {
    backgroundColor: "#374151",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent:"center"
  },
  activeTabLight: {
    backgroundColor: "#FFFFFF",
  },
  activeTabDark: {
    backgroundColor: "#1F2937",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
  },
  activeTabTextLight: {
    color: "#000000",
  },
  activeTabTextDark: {
    color: "#FFFFFF",
  },
  inactiveTabTextLight: {
    color: "#6B7280",
  },
  inactiveTabTextDark: {
    color: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalContainerLight: {
    backgroundColor: "#FFFFFF",
  },
  modalContainerDark: {
    backgroundColor: "#1F2937",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical:13,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalTitleLight: {
    color: "#111827",
  },
  modalTitleDark: {
    color: "#FFFFFF",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: "#6B7280",
    fontWeight: "bold",
  },
  modalBody: {
    maxHeight: 400,
    padding: 16,
  },
  noPositionsText: {
    textAlign: "center",
    fontSize: 16,
    fontStyle: "italic",
  },
  noPositionsTextLight: {
    color: "#6B7280",
  },
  noPositionsTextDark: {
    color: "#9CA3AF",
  },
  positionContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  positionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  positionQuantity: {
    fontSize: 16,
    fontWeight: "bold",
  },
  positionQuantityLight: {
    color: "#111827",
  },
  positionQuantityDark: {
    color: "#FFFFFF",
  },
  positionType: {
    fontSize: 15,
    fontWeight: "600",
  },
  positionTypeLight: {
    color: "#6B7280",
  },
  positionTypeDark: {
    color: "#9CA3AF",
  },
  strikePickerContainer: {
    marginTop: 8,
  },
  strikeLabel: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  strikeLabelLight: {
    color: "#6B7280",
  },
  strikeLabelDark: {
    color: "#9CA3AF",
  },
  pickerWrapper: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  pickerWrapperLight: {
    backgroundColor: "#F9FAFB",
  },
  pickerWrapperDark: {
    backgroundColor: "#374151",
  },
  picker: {
    height: 50,
  },
  pickerLight: {
    color: "#111827",
  },
  pickerDark: {
    color: "#FFFFFF",
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  addButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PreBuildStrategies;