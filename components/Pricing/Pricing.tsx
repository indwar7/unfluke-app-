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
import { LinearGradient } from "expo-linear-gradient";
import { Check, CheckCircle2, Crown, Sparkles } from "lucide-react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import Billing from "./Billing";

const Pricing = ({ navigation }) => {
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);

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

  const name = user?.name;
  const email = user?.email;
  const tier = user?.tier;
  const tierExpiry = user?.tierEnded?.split(" ");

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
          s.cardWrapper,
          { width: isTablet ? (width - 64) / 2 : "100%" },
        ]}
      >
        <View style={[s.card, isPopular && s.popularCard]}>
          {isPopular && (
            <LinearGradient
              colors={[c.goldBright, c.gold, c.goldDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.popularBadge}
            >
              <Crown size={11} color={c.onGold} strokeWidth={2.5} />
              <Text style={s.popularText}>POPULAR</Text>
            </LinearGradient>
          )}

          <View style={[s.cardBody, isPopular && s.cardBodyPopular]}>
            {/* Header */}
            <View style={s.cardHeader}>
              <View style={s.planTitleRow}>
                {isPopular && (
                  <Sparkles size={15} color={c.gold} strokeWidth={2.5} />
                )}
                <Text style={[s.planTitle, isPopular && s.planTitlePopular]}>
                  {planTitles[tierIndex]}
                </Text>
              </View>
              <View style={s.priceRow}>
                <Text style={[s.planPrice, isPopular && s.planPricePopular]}>
                  ₹{tierInfo.cost}
                </Text>
                <Text style={s.priceSubtext}> /mo</Text>
              </View>
            </View>

            {/* Image */}
            <View style={s.imageContainer}>
              <Image
                source={planImages[tierInfo.tier]}
                style={s.planImage}
                resizeMode="contain"
              />
            </View>

            {/* Features List */}
            <View style={s.featuresList}>
              {/* Historical Scans */}
              <View style={s.featureItem}>
                <View style={s.featureHeader}>
                  <View style={[s.checkBadge, isPopular && s.checkBadgePopular]}>
                    <Check
                      size={12}
                      color={isPopular ? c.onGold : c.profit}
                      strokeWidth={3}
                    />
                  </View>
                  <Text style={s.featureTitle}>Historical Scans</Text>
                </View>
                <Text style={s.featureDetail}>
                  Results from{" "}
                  <Text style={s.bold}>{tierInfo.scans_start_year}</Text>
                </Text>
                <Text style={s.featureDetail}>
                  Max{" "}
                  <Text style={s.bold}>{tierInfo.scans_max_results}</Text>{" "}
                  results
                </Text>
                <Text style={s.featureDetail}>
                  Unlimited number of scans
                </Text>
              </View>

              {/* Alerts */}
              <View style={s.featureItem}>
                <View style={s.featureHeader}>
                  <View style={[s.checkBadge, isPopular && s.checkBadgePopular]}>
                    <Check
                      size={12}
                      color={isPopular ? c.onGold : c.profit}
                      strokeWidth={3}
                    />
                  </View>
                  <Text style={s.featureTitle}>No of Alerts</Text>
                </View>
                <Text style={s.featureDetail}>
                  {tierInfo.live_scanner_telegrams}
                </Text>
              </View>

              {/* AI Bot */}
              <View style={s.featureItem}>
                <View style={s.featureHeader}>
                  <View style={[s.checkBadge, isPopular && s.checkBadgePopular]}>
                    <Check
                      size={12}
                      color={isPopular ? c.onGold : c.profit}
                      strokeWidth={3}
                    />
                  </View>
                  <Text style={s.featureTitle}>AI Bot</Text>
                </View>
                <Text style={s.featureDetail}>
                  {tierInfo.ai_bot_limit} msg/day
                </Text>
              </View>

              {/* Historical Charts */}
              <View style={s.featureItem}>
                <View style={s.featureHeader}>
                  <View style={[s.checkBadge, isPopular && s.checkBadgePopular]}>
                    <Check
                      size={12}
                      color={isPopular ? c.onGold : c.profit}
                      strokeWidth={3}
                    />
                  </View>
                  <Text style={s.featureTitle}>Historical Charts</Text>
                </View>
                <Text style={s.featureDetail}>
                  {tierInfo.charts_fno}-Onwards
                </Text>
              </View>

              {/* Backtests */}
              <View style={s.featureItem}>
                <View style={s.featureHeader}>
                  <View style={[s.checkBadge, isPopular && s.checkBadgePopular]}>
                    <Check
                      size={12}
                      color={isPopular ? c.onGold : c.profit}
                      strokeWidth={3}
                    />
                  </View>
                  <Text style={s.featureTitle}>Backtests</Text>
                </View>
                <Text style={s.featureDetail}>
                  Unlimited basic backtests
                </Text>
                <Text style={s.featureDetail}>
                  <Text style={s.bold}>{tierInfo.backtests}</Text>{" "}
                  advanced backtests
                </Text>
              </View>
            </View>

            {/* Action Button */}
            {tierIndex > 0 && (
              <View style={s.buttonContainer}>
                {isSubscribed ? (
                  <View style={[s.button, s.subscribedButton]}>
                    <CheckCircle2 size={16} color={c.success} strokeWidth={2.5} />
                    <Text style={s.subscribedButtonText}>
                      Already Subscribed
                      {tierExpiry
                        ? ` - Expires on ${tierExpiry[1]}/${tierExpiry[2]}/${tierExpiry[3]}`
                        : ""}
                    </Text>
                  </View>
                ) : isPopular ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      setBuyingTier(tierInfo);
                      toggleModal();
                    }}
                  >
                    <LinearGradient
                      colors={[c.goldBright, c.gold, c.goldDeep]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[s.button, s.buyButtonGold]}
                    >
                      <Text style={s.buyButtonGoldText}>Buy Now</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[s.button, s.buyButton]}
                    onPress={() => {
                      setBuyingTier(tierInfo);
                      toggleModal();
                    }}
                  >
                    <Text style={s.buyButtonText}>Buy Now</Text>
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
    <View style={s.container}>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={s.header}>
          <View style={s.eyebrowPill}>
            <Sparkles size={12} color={c.gold} strokeWidth={2.5} />
            <Text style={s.eyebrowText}>MEMBERSHIP</Text>
          </View>
          <Text style={s.title}>Plans & Pricing</Text>
          <Text style={s.subtitle}>
            Simple pricing. No hidden fees. Advanced features for your business.
          </Text>

          {/* Tab Navigation */}
          <View style={s.tabContainer}>
            <TouchableOpacity
              style={[s.tab, activeTab === "1" && s.activeTab]}
              onPress={() => setActiveTab("1")}
            >
              <Text
                style={[
                  s.tabText,
                  activeTab === "1" && s.activeTabText,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
        style={[s.tab, activeTab === "2" && s.activeTab]}
              onPress={() => setActiveTab("1")}
      >
        <Text
          style={[
            s.tabText,
            activeTab === "2" && s.activeTabText,
          ]}
        >
          Annually
        </Text>
        {activeTab === "2" && <View style={s.triangle} />}
      </TouchableOpacity> */}
          </View>
        </View>

        {/* Pricing Cards */}
        <View style={[s.cardsContainer, { flexDirection: isTablet ? "row" : "column" }]}>
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

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      paddingTop: 0,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    header: {
      alignItems: "center",
      marginBottom: 24,
      paddingTop: 16,
    },
    eyebrowPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 9999,
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: isDark ? c.goldMuted : c.gold,
      marginBottom: 12,
    },
    eyebrowText: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: c.gold,
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      marginBottom: 8,
      color: c.text,
      letterSpacing: -0.4,
    },
    subtitle: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      paddingHorizontal: 12,
    },
    tabContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 18,
      marginBottom: 12,
      backgroundColor: c.surfaceElevated,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 9999,
      padding: 4,
    },
    tab: {
      paddingVertical: 9,
      paddingHorizontal: 26,
      borderRadius: 9999,
      alignItems: "center",
      position: "relative",
    },
    activeTab: {
      backgroundColor: c.gold,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "700",
      color: c.textMuted,
    },
    activeTabText: {
      color: c.onGold,
    },
    triangle: {
      position: "absolute",
      bottom: -7,
      width: 0,
      height: 0,
      borderLeftWidth: 9,
      borderRightWidth: 9,
      borderTopWidth: 10,
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      borderTopColor: c.gold,
    },
    cardsContainer: {
      flexWrap: "wrap",
      gap: 16,
    },
    cardWrapper: {
      marginBottom: 16,
    },
    card: {
      backgroundColor: c.card,
      borderRadius: 22,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: c.border,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 16,
    },
    popularCard: {
      borderColor: c.gold,
      borderWidth: 1.5,
      shadowColor: c.gold,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.35 : 0.22,
      shadowRadius: 20,
      elevation: 6,
    },
    popularBadge: {
      position: "absolute",
      top: 18,
      right: -34,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 5,
      paddingHorizontal: 40,
      transform: [{ rotate: "45deg" }],
      zIndex: 10,
    },
    popularText: {
      color: c.onGold,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
    },
    cardBody: {
      backgroundColor: c.card,
      padding: 20,
      borderRadius: 22,
    },
    cardBodyPopular: {
      backgroundColor: c.goldLight,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    planTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    planTitle: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: c.textSecondary,
    },
    planTitlePopular: {
      color: c.gold,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    planPrice: {
      fontSize: 26,
      fontWeight: "800",
      color: c.text,
      fontVariant: ["tabular-nums"],
      letterSpacing: -0.5,
    },
    planPricePopular: {
      color: c.gold,
    },
    priceSubtext: {
      fontSize: 13,
      fontWeight: "600",
      color: c.textMuted,
    },
    period: {
      fontSize: 13,
      color: c.textMuted,
      marginTop: 8,
      marginLeft: 2,
    },
    imageContainer: {
      alignItems: "center",
      marginTop: 8,
      marginBottom: 16,
      height: 110,
    },
    planImage: {
      width: 120,
      height: 120,
      resizeMode: "contain",
    },
    featuresList: {
      marginTop: 8,
      gap: 14,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: c.borderLight,
    },
    featureItem: {
      marginBottom: 2,
    },
    featureHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    checkBadge: {
      width: 20,
      height: 20,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.profitBg,
    },
    checkBadgePopular: {
      backgroundColor: c.gold,
    },
    featureTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: c.text,
    },
    featureDetail: {
      fontSize: 12.5,
      color: c.textSecondary,
      fontWeight: "500",
      paddingLeft: 28,
      marginTop: 4,
      lineHeight: 17,
    },
    bold: {
      fontWeight: "800",
      color: c.text,
    },
    buttonContainer: {
      marginTop: 4,
      paddingTop: 20,
    },
    button: {
      borderRadius: 14,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    buyButton: {
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.border,
    },
    buyButtonText: {
      color: c.text,
      fontSize: 14,
      fontWeight: "700",
    },
    buyButtonGold: {
      shadowColor: c.gold,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 4,
    },
    buyButtonGoldText: {
      color: c.onGold,
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    subscribedButton: {
      backgroundColor: c.profitBg,
      borderWidth: 1,
      borderColor: c.success,
    },
    subscribedButtonText: {
      color: c.success,
      fontSize: 13,
      fontWeight: "700",
      textAlign: "center",
      flexShrink: 1,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: c.overlay,
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: c.card,
      borderRadius: 20,
      padding: 24,
      width: "85%",
      maxWidth: 400,
      borderWidth: 1,
      borderColor: c.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 16,
      textAlign: "center",
      color: c.text,
    },
    modalText: {
      fontSize: 16,
      marginBottom: 8,
      color: c.textSecondary,
    },
    closeButton: {
      backgroundColor: c.gold,
      borderRadius: 12,
      paddingVertical: 12,
      marginTop: 16,
    },
    closeButtonText: {
      color: c.onGold,
      fontSize: 16,
      fontWeight: "700",
      textAlign: "center",
    },
  });

export default Pricing;
