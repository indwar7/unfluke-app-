// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Modal,
//   TouchableWithoutFeedback,
//   Dimensions,
// } from "react-native";
// import { useSelector, useDispatch } from "react-redux";
// import { createSelector } from "reselect";
// import { useNavigation } from "@react-navigation/native";

// // Replace these with actual image imports
// const PaperPlane = require("../../assets/images/paper-plane.png");
// const Plane = require("../../assets/images/plane.png");
// const SpaceShip = require("../../assets/images/space-ship.png");
// const Ufo = require("../../assets/images/ufo.png");

// import Billing from "./Billing";
// import { MembershipPlansList } from "../../redux/Unfluke_slices/thunks";
// import Icon from "react-native-vector-icons/Ionicons"; // or FontAwesome
// import { useWindowDimensions } from "react-native";

// const Pricing = () => {
//   const { width } = useWindowDimensions();

//   const dispatch = useDispatch();
//   const navigation = useNavigation();

//   const auth = createSelector(
//     (state) => state.Login,
//     (data) => data.user
//   );

//   const membershipPlans = createSelector(
//     (state) => state.MemebershipPlans,
//     (tiers) => tiers.tiers
//   );

//   const user = useSelector(auth);
//   const tiers = useSelector(membershipPlans);

//   const [activeTab, setActiveTab] = useState("1");
//   const [buyingTier, setBuyingTier] = useState({});
//   const [isOpenModal, setIsOpenModal] = useState(false);
//   const [planTitles] = useState(["FREE", "BASIC", "ADVANCED", "PRO"]);

//   const name = user.name;
//   const email = user.email;
//   const tier = user.tier;
//   const tierExpiry = user.tierEnded?.split(" ");

//   useEffect(() => {
//     if (tiers.length === 0) {
//       dispatch(MembershipPlansList());
//     }
//   }, [dispatch]);

//   const toggleModal = () => {
//     setIsOpenModal(!isOpenModal);
//   };

//   const toggleTab = (tab) => {
//     if (activeTab !== tab) {
//       setActiveTab(tab);
//     }
//   };

//   return (
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={styles.scrollContent}
//       showsVerticalScrollIndicator={false}
//     >
//       <View style={styles.header}>
//         <Text style={styles.title}>Plans & Pricing</Text>
//         <Text style={styles.subtitle}>
//           Simple pricing. No hidden fees. Advanced features for your business.
//         </Text>
//       </View>

//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === "1" && styles.activeTab]}
//           onPress={() => toggleTab("1")}
//         >
//           <Text
//             style={[styles.tabText, activeTab === "1" && styles.activeTabText]}
//           >
//             Monthly
//           </Text>
//           {activeTab === "1" && <View style={styles.triangle} />}
//         </TouchableOpacity>

//         {/* <TouchableOpacity
//         style={[styles.tab, activeTab === "2" && styles.activeTab]}
//         onPress={() => toggleTab("2")}
//       >
//         <Text
//           style={[
//             styles.tabText,
//             activeTab === "2" && styles.activeTabText,
//           ]}
//         >
//           Annually
//         </Text>
//         {activeTab === "2" && <View style={styles.triangle} />}
//       </TouchableOpacity> */}
//       </View>

//       <View style={styles.plansContainer}>
//         {(tiers || []).map((tierInfo, tierIndex) => (
//           <View key={tierIndex} style={styles.planCard}>
//             <View style={{ margin: 7, backgroundColor: "#F1F4F7" }}>
//               {tierIndex === 2 && (
//                 <View style={styles.ribbon}>
//                   <Text style={styles.ribbonText}>Popular</Text>
//                 </View>
//               )}

//               <View style={styles.cardBody}>
//                 <View style={styles.cardHeader}>
//                   <Text style={styles.planTitle}>{planTitles[tierIndex]}</Text>
//                   <Text style={styles.planPrice}>
//                     ₹{tierInfo.cost}{" "}
//                     <Text style={styles.priceSubtext}>/Month</Text>
//                   </Text>
//                 </View>

//                 <View style={styles.imageContainer}>
//                   {tierInfo.tier === 0 && (
//                     <Image source={PaperPlane} style={styles.planImage} />
//                   )}
//                   {tierInfo.tier === 1 && (
//                     <Image source={Plane} style={styles.planImage} />
//                   )}
//                   {tierInfo.tier === 2 && (
//                     <Image source={SpaceShip} style={styles.planImage} />
//                   )}
//                   {tierInfo.tier === 3 && (
//                     <Image source={Ufo} style={styles.planImage} />
//                   )}
//                 </View>

//                 <View style={styles.featuresList}>
//                   <View style={styles.featureItem}>
//                     <View style={{ marginTop: 2 }}>
//                       <Icon name="checkmark-circle" size={18} color="#0AB39C" />
//                     </View>
//                     <View style={styles.featureContent}>
//                       <Text style={styles.featureTitle}>Historical Scans</Text>
//                       <Text style={styles.featureDetail}>
//                         - Results from{" "}
//                         <Text style={styles.featureHighlight}>
//                           {tierInfo.scans_start_year}
//                         </Text>
//                       </Text>
//                       <Text style={styles.featureDetail}>
//                         - Max{" "}
//                         <Text style={styles.featureHighlight}>
//                           {tierInfo.scans_max_results}
//                         </Text>{" "}
//                         results
//                       </Text>
//                       <Text style={styles.featureDetail}>
//                         - Unlimited number of scans
//                       </Text>
//                     </View>
//                   </View>

//                   <View style={styles.featureItem}>
//                     <View style={{ marginTop: 2 }}>
//                       <Icon name="checkmark-circle" size={18} color="#0AB39C" />
//                     </View>
//                     <View style={styles.featureContent}>
//                       <Text style={styles.featureTitle}>No of Alerts</Text>
//                       <Text style={styles.featureDetail}>
//                         - {tierInfo.live_scanner_telegrams}
//                       </Text>
//                     </View>
//                   </View>

//                   <View style={styles.featureItem}>
//                     <View style={{ marginTop: 2 }}>
//                       <Icon name="checkmark-circle" size={18} color="#0AB39C" />
//                     </View>
//                     <View style={styles.featureContent}>
//                       <Text style={styles.featureTitle}>AI Bot</Text>
//                       <Text style={styles.featureDetail}>
//                         - {tierInfo.ai_bot_limit} msg/day
//                       </Text>
//                     </View>
//                   </View>

//                   <View style={styles.featureItem}>
//                     <View style={{ marginTop: 2 }}>
//                       <Icon name="checkmark-circle" size={18} color="#0AB39C" />
//                     </View>
//                     <View style={styles.featureContent}>
//                       <Text style={styles.featureTitle}>Historical Charts</Text>
//                       <Text style={styles.featureDetail}>
//                         - {tierInfo.charts_fno}-Onwards
//                       </Text>
//                     </View>
//                   </View>

//                   <View style={styles.featureItem}>
//                     <View style={{ marginTop: 2 }}>
//                       <Icon name="checkmark-circle" size={18} color="#0AB39C" />
//                     </View>
//                     <View style={styles.featureContent}>
//                       <Text style={styles.featureTitle}>Backtests</Text>
//                       <Text style={styles.featureDetail}>
//                         - Unlimited basic backtests
//                       </Text>
//                       <Text style={styles.featureDetail}>
//                         -{" "}
//                         <Text style={styles.featureHighlight}>
//                           {tierInfo.backtests}
//                         </Text>{" "}
//                         advanced backtests
//                       </Text>
//                     </View>
//                   </View>
//                 </View>

//                 {tierIndex > 0 &&
//                   (tier === tierIndex ? (
//                     <TouchableOpacity
//                       style={[styles.button, styles.subscribedButton]}
//                     >
//                       <Text style={styles.buttonText}>
//                         Already Subscribed - Expires on{" "}
//                         {tierExpiry &&
//                           `${tierExpiry[1]}/${tierExpiry[2]}/${tierExpiry[3]}`}
//                       </Text>
//                     </TouchableOpacity>
//                   ) : (
//                     <TouchableOpacity
//                       style={[styles.button, styles.primaryButton]}
//                       onPress={() => {
//                         setBuyingTier(tierInfo);
//                         toggleModal();
//                       }}
//                     >
//                       <Text style={styles.buttonText}>Buy Now</Text>
//                     </TouchableOpacity>
//                   ))}
//               </View>
//             </View>
//           </View>
//         ))}
//       </View>

//       <Modal
//         visible={isOpenModal}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={toggleModal}
//       >
//         <TouchableWithoutFeedback onPress={toggleModal}>
//           <View style={styles.modalOverlay}>
//             <TouchableWithoutFeedback>
//               <View style={[styles.modalContent, { width: width * 0.9 }]}>
//                 <Billing
//                   tier={buyingTier}
//                   email={email}
//                   name={name}
//                   user={user}
//                   isOpenModal={isOpenModal}
//                   toggleModal={toggleModal}
//                 />
//               </View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f9fafb",
//     paddingTop: 108,
//   },
//   scrollContent: {
//     paddingBottom: 110, // Move paddingBottom here
//   },
//   header: {
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "600",
//     marginBottom: 8,
//     color: "#2F3E62",
//   },
//   subtitle: {
//     fontSize: 15,
//     color: "#405189",
//     textAlign: "center",
//   },
//   tabContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 10,
//     marginBottom: 20,
//   },
//   tab: {
//     paddingVertical: 9,
//     paddingHorizontal: 18,
//     marginHorizontal: 10,
//     borderRadius: 4,
//     backgroundColor: "#E9ECEF", // inactive bg
//     alignItems: "center",
//     position: "relative",
//   },
//   activeTab: {
//     backgroundColor: "#405189", // active bg
//   },
//   tabText: {
//     fontSize: 15,
//     fontWeight: "500",
//     color: "#495057", // inactive text
//   },
//   activeTabText: {
//     color: "#fff", // active text
//   },
//   triangle: {
//     position: "absolute",
//     bottom: -7, // pushes below tab
//     // left: "50%",
//     // marginLeft: 50,
//     width: 0,
//     height: 0,
//     borderLeftWidth: 9,
//     borderRightWidth: 9,
//     borderTopWidth: 10,
//     borderLeftColor: "transparent",
//     borderRightColor: "transparent",
//     borderTopColor: "#405189", // same as activeTab background
//   },
//   badge: {
//     backgroundColor: "#28a745",
//     borderRadius: 10,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     marginLeft: 4,
//   },
//   badgeText: {
//     color: "#fff",
//     fontSize: 10,
//   },
//   plansContainer: {
//     padding: 12,
//   },
//   planCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 4,
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     position: "relative",
//   },
//   ribbon: {
//     position: "absolute",
//     top: 12,
//     right: -40, // pushes outward
//     backgroundColor: "#e74c3c", // a nicer red shade
//     paddingVertical: 4,
//     paddingHorizontal: 40,
//     transform: [{ rotate: "45deg" }],
//     zIndex: 2,
//   },
//   ribbonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 12,
//     textAlign: "center",
//   },

//   cardBody: {
//     padding: 16,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   planTitle: {
//     fontSize: 15,
//     fontWeight: "bold",
//     color: "#49506C",
//   },
//   planPrice: {
//     fontSize: 15,
//     fontWeight: "bold",
//     color: "#49506C",
//   },
//   priceSubtext: {
//     fontSize: 14,
//     color: "#6c757d",
//   },
//   imageContainer: {
//     alignItems: "center",
//     marginTop: 4,
//     marginBottom: 30,
//   },
//   planImage: {
//     width: 160,
//     height: 160,
//     resizeMode: "contain",
//   },
//   featuresList: {
//     marginBottom: 20,
//   },
//   featureItem: {
//     flexDirection: "row",
//     marginBottom: 16,
//     gap: 6,
//   },

//   featureContent: {
//     flex: 1,
//   },
//   featureTitle: {
//     fontSize: 16,
//     marginBottom: 4,
//   },
//   featureDetail: {
//     fontSize: 12,
//     color: "#e27498",
//     marginBottom: 2,
//   },
//   featureHighlight: {
//     fontWeight: "bold",
//   },
//   button: {
//     padding: 12,
//     borderRadius: 4,
//     alignItems: "center",
//   },
//   primaryButton: {
//     backgroundColor: "#405189",
//   },
//   subscribedButton: {
//     backgroundColor: "#28a745",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "500",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//   },
// });

// export default Pricing;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  useWindowDimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { MembershipPlansList } from "../../redux/Unfluke_slices/thunks";
import Icon from "react-native-vector-icons/Ionicons"; // or FontAwesome
import Billing from "./Billing";

const Pricing = ({ navigation }) => {
  const { width } = useWindowDimensions();

  const [isTablet, setIsTablet] = useState(width >= 768);

  const dispatch = useDispatch();

  const auth = createSelector(
    (state) => state.Login,
    (data) => data.user
  );

  const membershipPlans = createSelector(
    (state) => state.MemebershipPlans,
    (tiers) => tiers.tiers
  );

  const user = useSelector(auth);
  const tiers = useSelector(membershipPlans);

  const [activeTab, setActiveTab] = useState("1");
  const [buyingTier, setBuyingTier] = useState({});
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [planTitles] = useState(["FREE", "BASIC", "ADVANCED", "PRO"]);

  const name = user.name;
  const email = user.email;
  const tier = user.tier;
  const tierExpiry = user.tierEnded?.split(" ");

  // Image mappings (you'll need to import these from your assets)
  const planImages = {
    0: require("../../assets/images/paper-plane.png"),
    1: require("../../assets/images/plane.png"),
    2: require("../../assets/images/space-ship.png"),
    3: require("../../assets/images/ufo.png"),
  };

  useEffect(() => {
    if (tiers.length === 0) {
      dispatch(MembershipPlansList());
    }
  }, [dispatch]);

  const toggleModal = () => {
    setIsOpenModal(!isOpenModal);
  };

  const renderPricingCard = (tierInfo, tierIndex) => {
    const isPopular = tierIndex === 2;
    const isSubscribed = tier === tierIndex;

    return (
      <View
        key={tierIndex}
        style={[
          styles.cardWrapper,
          { width: isTablet ? (width - 64) / 2 : "100%" },
        ]}
      >
        <View style={[styles.card, isPopular && styles.popularCard]}>
          {isPopular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}

          <View style={styles.cardBody}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.planTitle}>{planTitles[tierIndex]}</Text>
              <Text style={styles.planPrice}>
                ₹{tierInfo.cost} <Text style={styles.priceSubtext}>/Month</Text>
              </Text>
            </View>

            {/* Image */}
            <View style={styles.imageContainer}>
              <Image
                source={planImages[tierInfo.tier]}
                style={styles.planImage}
                resizeMode="contain"
              />
            </View>

            {/* Features List */}
            <View style={styles.featuresList}>
              {/* Historical Scans */}
              <View style={styles.featureItem}>
                <View style={styles.featureHeader}>
                  <View style={{ marginTop: 2, marginRight: 6 }}>
                    <Icon name="checkmark-circle" size={17} color="#0AB39C" />
                  </View>
                  <Text style={styles.featureTitle}>Historical Scans</Text>
                </View>
                <Text style={styles.featureDetail}>
                  - Results from{" "}
                  <Text style={styles.bold}>{tierInfo.scans_start_year}</Text>
                </Text>
                <Text style={styles.featureDetail}>
                  - Max{" "}
                  <Text style={styles.bold}>{tierInfo.scans_max_results}</Text>{" "}
                  results
                </Text>
                <Text style={styles.featureDetail}>
                  - Unlimited number of scans
                </Text>
              </View>

              {/* Alerts */}
              <View style={styles.featureItem}>
                <View style={styles.featureHeader}>
                  <View style={{ marginTop: 2, marginRight: 6 }}>
                    <Icon name="checkmark-circle" size={17} color="#0AB39C" />
                  </View>
                  <Text style={styles.featureTitle}>No of Alerts</Text>
                </View>
                <Text style={styles.featureDetail}>
                  - {tierInfo.live_scanner_telegrams}
                </Text>
              </View>

              {/* AI Bot */}
              <View style={styles.featureItem}>
                <View style={styles.featureHeader}>
                  <View style={{ marginTop: 2, marginRight: 6 }}>
                    <Icon name="checkmark-circle" size={17} color="#0AB39C" />
                  </View>
                  <Text style={styles.featureTitle}>AI Bot</Text>
                </View>
                <Text style={styles.featureDetail}>
                  - {tierInfo.ai_bot_limit} msg/day
                </Text>
              </View>

              {/* Historical Charts */}
              <View style={styles.featureItem}>
                <View style={styles.featureHeader}>
                  <View style={{ marginTop: 2, marginRight: 6 }}>
                    <Icon name="checkmark-circle" size={17} color="#0AB39C" />
                  </View>
                  <Text style={styles.featureTitle}>Historical Charts</Text>
                </View>
                <Text style={styles.featureDetail}>
                  - {tierInfo.charts_fno}-Onwards
                </Text>
              </View>

              {/* Backtests */}
              <View style={styles.featureItem}>
                <View style={styles.featureHeader}>
                  <View style={{ marginTop: 2, marginRight: 6 }}>
                    <Icon name="checkmark-circle" size={17} color="#0AB39C" />
                  </View>
                  <Text style={styles.featureTitle}>Backtests</Text>
                </View>
                <Text style={styles.featureDetail}>
                  - Unlimited basic backtests
                </Text>
                <Text style={styles.featureDetail}>
                  - <Text style={styles.bold}>{tierInfo.backtests}</Text>{" "}
                  advanced backtests
                </Text>
              </View>
            </View>

            {/* Action Button */}
            {tierIndex > 0 && (
              <View style={styles.buttonContainer}>
                {isSubscribed ? (
                  <View style={[styles.button, styles.subscribedButton]}>
                    <Text style={styles.subscribedButtonText}>
                      Already Subscribed - Expires on {tierExpiry[1]}/
                      {tierExpiry[2]}/{tierExpiry[3]}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.button, styles.buyButton]}
                    onPress={() => {
                      setBuyingTier(tierInfo);
                      toggleModal();
                    }}
                  >
                    <Text style={styles.buyButtonText}>Buy Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Plans & Pricing</Text>
          <Text style={styles.subtitle}>
            Simple pricing. No hidden fees. Advanced features for your business.
          </Text>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "1" && styles.activeTab]}
              onPress={() => setActiveTab("1")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "1" && styles.activeTabText,
                ]}
              >
                Monthly
              </Text>
              {activeTab === "1" && <View style={styles.triangle} />}
            </TouchableOpacity>

            {/* <TouchableOpacity
        style={[styles.tab, activeTab === "2" && styles.activeTab]}
              onPress={() => setActiveTab("1")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "2" && styles.activeTabText,
          ]}
        >
          Annually
        </Text>
        {activeTab === "2" && <View style={styles.triangle} />}
      </TouchableOpacity> */}
          </View>
        </View>

        {/* Pricing Cards */}
        <View style={[styles.cardsContainer,{    flexDirection: isTablet ? "row" : "column",
}]}>
          {(tiers || []).map((tierInfo, tierIndex) =>
            renderPricingCard(tierInfo, tierIndex)
          )}
        </View>
      </ScrollView>

      {Object.keys(buyingTier).length > 0 && (
        <Billing
          tier={buyingTier}
          email={email}
          name={name}
          user={user}
          isOpenModal={isOpenModal}
          toggleModal={toggleModal}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: 65,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
    color: "#2F3E62",
  },
  subtitle: {
    fontSize: 15,
    color: "#405189",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    marginHorizontal: 10,
    borderRadius: 4,
    backgroundColor: "#E9ECEF", // inactive bg
    alignItems: "center",
    position: "relative",
  },
  activeTab: {
    backgroundColor: "#405189", // active bg
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#495057", // inactive text
  },
  activeTabText: {
    color: "#fff", // active text
  },
  triangle: {
    position: "absolute",
    bottom: -7, // pushes below tab
    // left: "50%",
    // marginLeft: 50,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#405189", // same as activeTab background
  },
  cardsContainer: {
    flexWrap: "wrap",
    gap: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  popularCard: {
    borderColor: "#dc3545",
    borderWidth: 2,
  },
  popularBadge: {
    position: "absolute",
    top: 12,
    right: -30,
    backgroundColor: "#dc3545",
    paddingVertical: 4,
    paddingHorizontal: 40,
    transform: [{ rotate: "45deg" }],
    zIndex: 10,
  },
  popularText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  cardBody: {
    backgroundColor: "#F1F4F7",
    margin: 8,
    padding: 16,
    borderRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#49506C",
  },
  planPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#49506C",
  },
  priceSubtext: {
    fontSize: 14,
    color: "#6c757d",
  },
  period: {
    fontSize: 13,
    color: "#6c757d",
    marginTop: 8,
    marginLeft: 2,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
    height: 80,
  },
  planImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  featuresList: {
    marginTop: 35,
    gap: 8,
  },
  featureItem: {
    marginBottom: 8,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureTitle: {
    fontSize: 15,
    color: "#000",
  },
  featureDetail: {
    fontSize: 12,
    color: "#e27498",
    fontWeight: "500",
    paddingLeft: 24,
    marginTop: 2,
  },
  bold: {
    fontWeight: "700",
  },
  buttonContainer: {
    marginTop: 1,
    paddingTop: 16,
  },
  button: {
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  buyButton: {
    backgroundColor: "#405189",
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  subscribedButton: {
    backgroundColor: "#198754",
  },
  subscribedButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  closeButton: {
    backgroundColor: "#0d6efd",
    borderRadius: 6,
    paddingVertical: 12,
    marginTop: 16,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default Pricing;
