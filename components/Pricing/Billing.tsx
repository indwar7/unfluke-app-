// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Modal,
//   Alert,
//   Linking,
//   } from 'react-native';
// import { useSelector } from "react-redux";
// import { postBuyMembership, postCheckCoupon } from '../../Unfluke_helpers/backend_helper';
// import { useWindowDimensions } from "react-native";

// function Billing({ tier, email, name, user, isOpenModal, toggleModal }) {
//   const { width, height } = useWindowDimensions()

//   const [message, setMessage] = useState({ status: 0, message: "" });
//   const [value, setValue] = useState("");
//   const [values, setValues] = useState({
//     amount: 0,
//     orderID: "",
//     error: "",
//     success: false,
//     accessCode: "",
//     encRequest: "",
//   });

//   const tierCost = parseInt(tier.cost);
//   const [totalPoints, setTotalPoints] = useState(parseInt(user.points));
//   const [open, setOpen] = useState(true);
//   const [usePoints, setUsePoints] = useState(0);
//   const [couponCode, setCouponCode] = useState("");
//   const [amountToBePaid, setAmountToBePaid] = useState(tierCost);
//   const [coupon, setCoupon] = useState(0);

//   const errornotify = (msg) => Alert.alert("Error", msg);
//   const successnotify = (msg) => Alert.alert("Success", msg);

//   useEffect(() => {
//     if (message.status !== 0) {
//       if (message.status !== 200) {
//         errornotify(message.message);
//       } else {
//         successnotify(message.message);
//       }
//     }
//   }, [message]);

//   const couponChecker = async () => {
//     try {
//       const res = await postCheckCoupon({ couponCode });
//       setCoupon(res[0].discount);
//       successnotify("Coupon applied successfully!");
//     } catch (err) {
//       errornotify("Invalid Coupon");
//     }
//   };

//   const pointsChecker = () => {
//     const inputValue = parseInt(usePoints);
//     if (inputValue > totalPoints) {
//       errornotify("You cannot use more points than you have.");
//       return;
//     }
//     if (tierCost - inputValue < 1) {
//       errornotify("The subscription amount must be at least ₹1.");
//       return;
//     }
//     setAmountToBePaid(tierCost - inputValue - coupon);
//     setTotalPoints(totalPoints - inputValue);
//   };

//   useEffect(() => {
//     setAmountToBePaid(tierCost - usePoints - coupon);
//   }, [coupon]);

//   useEffect(() => {
//     setAmountToBePaid(tier.cost);
//   }, [tier]);

//   const createOrder = async () => {
//     setMessage({ status: 0, message: "" });

//     try {
//       const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/hdfc-payment/createOrder`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           amount: amountToBePaid,
//           currency: "INR",
//           customerId: user._id,
//           returnUrl: `https://dfe12f024a91.ngrok-free.app/api/hdfc-payment/callback`
//         }),
//       });

//       const data = await res.json();

//       if (data.payment_links && data.payment_links.web) {
//         // Open payment URL in browser
//         Linking.openURL(data.payment_links.web);
//       } else {
//         errornotify("Failed to initiate payment. Please try again.");
//         console.error("Payment initiation error:", data);
//       }
//     } catch (err) {
//       console.error("Error creating HDFC order:", err);
//       errornotify("Something went wrong while creating order");
//     }
//   };

//   const plan = ["Free", "Basic", "Advanced", "Pro"];

//   return (
//     <Modal
//       visible={isOpenModal}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={toggleModal}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={[styles.modalContainer,{ width: width * 0.95,
//     maxHeight: height * 0.9}]}>
//           <ScrollView showsVerticalScrollIndicator={false}>
//             {/* Header */}
//             <View style={styles.header}>
//               <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
//                 <Text style={styles.closeButtonText}>×</Text>
//               </TouchableOpacity>
//               <Text style={styles.headerTitle}>
//                 Thank you for choosing the {plan[tier.tier]} plan. This subscription gives you access to more features and data.
//               </Text>
//             </View>

//             {/* Content */}
//             <View style={styles.content}>
//               {/* Features Card */}
//               <View style={styles.featuresCard}>
//                 <View style={styles.featuresList}>
//                   <View style={styles.featureItem}>
//                     <Text style={styles.checkmark}>✓</Text>
//                     <Text style={styles.featureText}> Historical Scans</Text>
//                   </View>
//                   <View style={styles.subFeature}>
//                     <Text style={styles.subFeatureText}>- Results from {tier.scans_start_year}</Text>
//                   </View>
//                   <View style={styles.subFeature}>
//                     <Text style={styles.subFeatureText}>- Max {tier.scans_max_results} results</Text>
//                   </View>
//                   <View style={[styles.subFeature, styles.marginBottom]}>
//                     <Text style={styles.subFeatureText}>- Unlimited number of scans</Text>
//                   </View>

//                   <View style={[styles.featureItem, styles.marginBottom]}>
//                     <Text style={styles.checkmark}>✓</Text>
//                     <Text style={styles.featureText}> {tier.live_scanner_telegrams} Alerts</Text>
//                   </View>

//                   <View style={[styles.featureItem, styles.marginBottom]}>
//                     <Text style={styles.checkmark}>✓</Text>
//                     <Text style={styles.featureText}> Historical Charts Onwards {tier.charts_fno}</Text>
//                   </View>

//                   <View style={[styles.featureItem, styles.marginBottom]}>
//                     <Text style={styles.checkmark}>✓</Text>
//                     <Text style={styles.featureText}> Unlimited Virtual Trading</Text>
//                   </View>

//                   <View style={styles.featureItem}>
//                     <Text style={styles.checkmark}>✓</Text>
//                     <Text style={styles.featureText}> Backtests</Text>
//                   </View>
//                   <View style={styles.subFeature}>
//                     <Text style={styles.subFeatureText}>- Unlimited basic backtests</Text>
//                   </View>
//                   <View style={styles.subFeature}>
//                     <Text style={styles.subFeatureText}>- {tier.backtests} advanced backtests</Text>
//                   </View>
//                 </View>
//               </View>

//               {/* Billing Card */}
//               <View style={styles.billingCard}>
//                 <Text style={styles.billingTitle}>Subscription Bill</Text>
//                 <View style={styles.dashedLine} />

//                 {/* Wallet Info */}
//                 <View style={styles.walletInfo}>
//                   <View style={styles.walletRow}>
//                     <Text style={styles.walletLabel}>
//                       <Text style={styles.walletText}>Wallet </Text>
//                       <Text style={styles.walletBalance}>Balance</Text>
//                     </Text>
//                     <Text style={styles.walletAmount}>₹{user.walletBalance}</Text>
//                   </View>
//                   <View style={styles.walletRow}>
//                     <Text style={styles.walletLabel}>
//                       <Text style={styles.walletText}>Points </Text>
//                       <Text style={styles.walletBalance}>Available</Text>
//                     </Text>
//                     <Text style={styles.walletAmount}>{user.points}</Text>
//                   </View>
//                 </View>

//                 <View style={styles.dashedLine} />

//                 {/* Coupon Section */}
//                 {open && (
//                   <>
//                     <View style={styles.inputGroup}>
//                       <TextInput
//                         style={styles.textInput}
//                         placeholder="Enter Coupon Code"
//                         value={couponCode}
//                         onChangeText={setCouponCode}
//                       />
//                       <TouchableOpacity style={styles.applyButton} onPress={couponChecker}>
//                         <Text style={styles.applyButtonText}>Apply Coupon</Text>
//                       </TouchableOpacity>
//                     </View>
//                     {coupon !== 0 && (
//                       <View style={styles.couponApplied}>
//                         <Text style={styles.couponAppliedText}>Coupon Applied</Text>
//                         <TouchableOpacity onPress={() => setCoupon(0)}>
//                           <Text style={styles.removeText}>Remove</Text>
//                         </TouchableOpacity>
//                       </View>
//                     )}
//                   </>
//                 )}

//                 <View style={styles.dashedLine} />

//                 {/* Points Section */}
//                 <View style={styles.inputGroup}>
//                   <TextInput
//                     style={styles.textInput}
//                     placeholder="Points to use"
//                     value={usePoints.toString()}
//                     onChangeText={(text) => setUsePoints(parseInt(text) || 0)}
//                     keyboardType="numeric"
//                   />
//                   <TouchableOpacity style={styles.applyButtonPrimary} onPress={pointsChecker}>
//                     <Text style={styles.applyButtonText}>Apply Points</Text>
//                   </TouchableOpacity>
//                 </View>

//                 <View style={styles.dashedLine} />

//                 {/* Bill Summary */}
//                 <View style={styles.billSummary}>
//                   <View style={styles.billRow}>
//                     <Text style={styles.billLabel}>Total:</Text>
//                     <Text style={styles.billAmount}>₹ {tierCost}</Text>
//                   </View>
//                   <View style={styles.billRow}>
//                     <Text style={styles.billLabel}>Coupon Discount:</Text>
//                     <Text style={styles.billAmount}>- ₹ {coupon}</Text>
//                   </View>
//                   <View style={styles.billRow}>
//                     <Text style={styles.billLabel}>Points Applied:</Text>
//                     <Text style={styles.billAmount}>- ₹ {usePoints}</Text>
//                   </View>
//                   <View style={styles.billRow}>
//                     <Text style={styles.billLabel}>Amount to be Paid:</Text>
//                     <Text style={styles.billAmount}>₹ {amountToBePaid}</Text>
//                   </View>
//                 </View>

//                 {/* Pay Button */}
//                 <TouchableOpacity style={styles.payButton} onPress={createOrder}>
//                   <Text style={styles.payButtonText}>Pay Rs {amountToBePaid}</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     overflow: 'hidden',
//   },
//   header: {
//     // background: 'linear-gradient(135deg, #d667cd, #6b97f5)',
//     backgroundColor: '#d667cd',
//     padding: 20,
//     position: 'relative',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 10,
//     right: 15,
//     zIndex: 1,
//   },
//   closeButtonText: {
//     fontSize: 30,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#251f57',
//     textAlign: 'center',
//     marginTop: 10,
//   },
//   content: {
//     padding: 20,
//   },
//   featuresCard: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 8,
//   },
//   featuresList: {
//     paddingLeft: 0,
//   },
//   featureItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   checkmark: {
//     color: '#22c55e',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   featureText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   subFeature: {
//     paddingLeft: 20,
//     marginBottom: 5,
//   },
//   subFeatureText: {
//     color: '#e2749a',
//     fontSize: 14,
//   },
//   marginBottom: {
//     marginBottom: 10,
//   },
//   billingCard: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 8,
//   },
//   billingTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 20,
//     color: '#4a5568',
//   },
//   dashedLine: {
//     borderBottomWidth: 3,
//     borderBottomColor: '#aaa',
//     borderStyle: 'dashed',
//     marginVertical: 15,
//   },
//   walletInfo: {
//     marginBottom: 20,
//   },
//   walletRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   walletLabel: {
//     fontSize: 16,
//   },
//   walletText: {
//     fontWeight: '600',
//     color: '#4a5568',
//   },
//   walletBalance: {
//     fontWeight: '600',
//     color: '#9f7aea',
//   },
//   walletAmount: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#4a5568',
//   },
//   inputGroup: {
//     flexDirection: 'row',
//     marginBottom: 10,
//   },
//   textInput: {
//     flex: 1,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: '#d1d5db',
//     borderRadius: 5,
//     marginRight: 10,
//   },
//   applyButton: {
//     backgroundColor: '#6c757d',
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     borderRadius: 5,
//     justifyContent: 'center',
//   },
//     applyButtonPrimary: {
//     backgroundColor: '#007bff',
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     borderRadius: 5,
//     justifyContent: 'center',
//   },
//   applyButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   couponApplied: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   couponAppliedText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   removeText: {
//     color: 'red',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   billSummary: {
//     marginBottom: 20,
//   },
//   billRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   billLabel: {
//     fontSize: 16,
//     color: '#333',
//   },
//   billAmount: {
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '500',
//   },
//   payButton: {
//     backgroundColor: '#28a745',
//     padding: 15,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   payButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// export default Billing;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Alert,
  Linking,
  ActivityIndicator,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import {
  postBuyMembership,
  postCheckCoupon,
} from "../../Unfluke_helpers/backend_helper";
import { Config } from "../../helpers/config";

function Billing({ tier, email, name, user, isOpenModal, toggleModal }) {

  if (!tier || Object.keys(tier).length === 0) {
    return null;
  }
  const [message, setMessage] = useState({ status: 0, message: "" });
  const [values, setValues] = useState({
    amount: 0,
    orderID: "",
    error: "",
    success: false,
    accessCode: "",
    encRequest: "",
  });

const {  height } = useWindowDimensions()

  const tierCost = parseInt(tier.cost) || 0;
  const [totalPoints, setTotalPoints] = useState(parseInt(user.points) || 0);
  const [usePoints, setUsePoints] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [amountToBePaid, setAmountToBePaid] = useState(tierCost);
  const [coupon, setCoupon] = useState(0);
  const [loading, setLoading] = useState(false);

  const plan = ["Free", "Basic", "Advanced", "Pro"];

  const showToast = (msg, type = "error") => {
    Alert.alert(type === "error" ? "Error" : "Success", msg, [{ text: "OK" }]);
  };

  useEffect(() => {
    if (message.status !== 0) {
      showToast(message.message, message.status === 200 ? "success" : "error");
    }
  }, [message]);

  const couponChecker = async () => {
    if (!couponCode.trim()) {
      showToast("Please enter a coupon code");
      return;
    }

    setLoading(true);
    try {
      const res = await postCheckCoupon({ couponCode });
      setCoupon(res[0].discount);
      showToast("Coupon applied successfully!", "success");
    } catch (err) {
      showToast("Invalid Coupon");
    } finally {
      setLoading(false);
    }
  };

  const pointsChecker = () => {
    const inputValue = parseInt(usePoints);

    if (isNaN(inputValue) || inputValue < 0) {
      showToast("Please enter a valid points value");
      return;
    }

    if (inputValue > totalPoints) {
      showToast("You cannot use more points than you have.");
      return;
    }

    if (tierCost - inputValue < 1) {
      showToast("The subscription amount must be at least ₹1.");
      return;
    }

    setAmountToBePaid(tierCost - inputValue - coupon);
    setTotalPoints(totalPoints - inputValue);
    showToast("Points applied successfully!", "success");
  };

  useEffect(() => {
    setAmountToBePaid(tierCost - usePoints - coupon);
  }, [coupon]);

  useEffect(() => {
    setAmountToBePaid(tier.cost || 0);
  }, [tier]);

  const createOrder = async () => {
    
    setMessage({ status: 0, message: "" });
    setLoading(true);

    try {
      const res = await fetch(
        `${Config.BACKEND_URL}/api/hdfc-payment/createOrder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amountToBePaid,
            currency: "INR",
            customerId: user._id,
            returnUrl: `${Config.BACKEND_URL}/api/hdfc-payment/callback`,
          }),
        }
      );

      const data = await res.json();
      console.log("data", data)
      if (data.payment_links && data.payment_links.web) {
        // Open payment link in browser
        const supported = await Linking.canOpenURL(data.payment_links.web);
        if (supported) {
          await Linking.openURL(data.payment_links.web);
        } else {
          showToast("Cannot open payment link");
        }
      } else {
        showToast("Failed to initiate payment. Please try again.");
        console.error("Payment initiation error:", data);
      }
    } catch (err) {
      console.error("Error creating HDFC order:", err);
      showToast("Something went wrong while creating order");
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(0);
    setCouponCode("");
    showToast("Coupon removed", "success");
  };

  return (
    <Modal
      visible={isOpenModal}
      animationType="slide"
      transparent={true}
      onRequestClose={toggleModal}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer,{    height:height*0.8 ,
}]}>
          <LinearGradient
            colors={["#d667cd", "#6b97f5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={toggleModal}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                Thank you for choosing the {plan[tier.tier] || "selected"} plan.
                This subscription gives you access to more features and data.
              </Text>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
  persistentScrollbar={true}
            >
              {/* Features Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Plan Features</Text>
                <View style={styles.featuresList}>
                  <View >
                    <View style={styles.featureItem}>
                      <Text style={styles.checkIcon}>✓</Text>
                      <Text style={styles.featureText}>Historical Scans</Text>
                    </View>
                    <Text style={styles.featureDetail}>
                      - Results from {tier.scans_start_year || "N/A"}
                    </Text>
                    <Text style={styles.featureDetail}>
                      - Max {tier.scans_max_results || "N/A"} results
                    </Text>
                    <Text style={styles.featureDetail}>
                      - Unlimited number of scans
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <Text style={styles.featureText}>
                      {tier.live_scanner_telegrams || 0} Alerts
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <Text style={styles.featureText}>
                      Historical Charts Onwards {tier.charts_fno || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <Text style={styles.featureText}>
                      Unlimited Virtual Trading
                    </Text>
                  </View>
                  <View >
                    <View style={styles.featureItem}>
                      <Text style={styles.checkIcon}>✓</Text>
                      <Text style={styles.featureText}>Backtests</Text>
                    </View>
                    <Text style={styles.featureDetail}>
                      - Unlimited basic backtests
                    </Text>
                    <Text style={styles.featureDetail}>
                      - {tier.backtests || 0} advanced backtests
                    </Text>
                  </View>
                </View>
              </View>

              {/* Billing Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Subscription Bill</Text>
                <View style={styles.dashedDivider} />

                {/* Wallet and Points Info */}
                <View>
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Text style={styles.infoLabel}>Wallet </Text>
                      <Text style={styles.infoLabelHighlight}>Balance</Text>
                    </View>
                    <Text style={styles.infoValue}>₹{user.walletBalance}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Text style={styles.infoLabel}>Points </Text>
                      <Text style={styles.infoLabelHighlight}>Available</Text>
                    </View>
                    <Text style={styles.infoValue}>{user.points}</Text>
                  </View>
                </View>

                <View style={styles.dashedDivider} />

                {/* Coupon Code Input */}
                <View style={styles.inputSection}>
                  <View style={styles.inputGroup}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Coupon Code"
                      value={couponCode}
                      onChangeText={setCouponCode}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.applyButton}
                      onPress={couponChecker}
                      disabled={loading}
                    >
                      
                        <Text style={styles.applyButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>

                  {coupon !== 0 && (
                    <View style={styles.couponApplied}>
                      <Text style={styles.couponAppliedText}>
                        Coupon Applied (₹{coupon} off)
                      </Text>
                      <TouchableOpacity onPress={removeCoupon}>
                        <Text style={styles.removeText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View style={styles.dashedDivider} />

                {/* Points Input */}
                <View style={styles.inputSection}>
                  <View style={styles.inputGroup}>
                    <TextInput
                      style={styles.input}
                      placeholder="Points to use"
                      value={usePoints.toString()}
                      onChangeText={(text) => setUsePoints(parseInt(text) || 0)}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={[styles.applyButton, styles.applyPointsButton]}
                      onPress={pointsChecker}
                      disabled={loading}
                    >
                      <Text style={styles.applyButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.dashedDivider} />

                {/* Bill Summary */}
                <View style={styles.billSummary}>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Total:</Text>
                    <Text style={styles.billValue}>₹ {tierCost}</Text>
                  </View>

                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Coupon Discount:</Text>
                    <Text style={styles.billValue}>- ₹ {coupon}</Text>
                  </View>

                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Points Applied:</Text>
                    <Text style={styles.billValue}>- ₹ {usePoints}</Text>
                  </View>

                  <View style={[styles.billRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Amount to be Paid:</Text>
                    <Text style={styles.totalValue}>₹ {amountToBePaid}</Text>
                  </View>
                </View>

                {/* Pay Button */}
                <TouchableOpacity
                  style={[
                    styles.payButton,
                    loading && styles.payButtonDisabled,
                  ]}
                  onPress={createOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.payButtonText}>
                      Pay ₹ {amountToBePaid}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "95%",
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#251f57",
    textAlign: "center",
    lineHeight: 28,
    marginTop:8
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4a5568",
    textAlign: "center",
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1,
  },
  checkIcon: {
    color: "#22c55e",
    fontSize: 13,
    fontWeight: "700",
    marginRight: 6,
  },
  featureText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  featureDetail: {
    fontSize: 13,
    color: "#e27498",
    fontWeight: "500",
    paddingLeft: 24,
    marginTop: 2,
  },
  dashedDivider: {
    borderBottomWidth: 2,
    borderBottomColor: "#aaa",
    borderStyle: "dashed",
    marginVertical: 16,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabelContainer: {
    flexDirection: "row",
  },
  infoLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#4a5568",
  },
  infoLabelHighlight: {
    fontSize: 17,
    fontWeight: "600",
    color: "#9f7aea",
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4a5568",
  },
  inputSection: {
    marginBottom: 8,
  },
  inputGroup: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#f9fafb",
  },
  applyButton: {
    backgroundColor: "#6b7280",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  applyPointsButton: {
    backgroundColor: "#3b82f6",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  couponApplied: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  couponAppliedText: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "500",
  },
  removeText: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "600",
  },
  billSummary: {
    marginBottom: 8,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 15,
    color: "#333",
  },
  billValue: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#333",
  },
  totalLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "700",
  },
  payButton: {
    backgroundColor: "#0AB39C",
    paddingVertical:11,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  payButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default Billing;
