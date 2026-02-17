import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { postBuyBasicStrategy, postCheckCoupon } from '../../Unfluke_helpers/backend_helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWindowDimensions } from "react-native";


function Billing({ price, fileName, strategyName, isAdvance, isOpenModal, toggleModal }) {
    const{width,height} = useWindowDimensions()
    const [user, setUser] = useState(null);
    const strategyCost = parseFloat(price);
    const [message, setMessage] = useState({ status: 0, message: "" });
    const [totalPoints, setTotalPoints] = useState(0);
    const [couponCode, setCouponCode] = useState("");
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [usePoints, setUsePoints] = useState(0);
    const [amountToBePaid, setAmountToBePaid] = useState(strategyCost);
    const [isLoading, setIsLoading] = useState(false);

    // Get user data from AsyncStorage
    useEffect(() => {
        const getUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('authUser');
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    setTotalPoints(parsedUser?.points || 0);
                }
            } catch (error) {
                console.error('Error getting user data:', error);
            }
        };
        getUserData();
    }, []);

    const showToast = (message, type = "success") => {
        Toast.show({
            type: type,
            text1: type === "success" ? "Success" : "Error",
            text2: message,
            position: 'top',
            visibilityTime: 3000,
        });
    };

    // Recalculate amount to be paid whenever dependencies change
    useEffect(() => {
        let totalDiscount = couponDiscount + usePoints;
        if (totalDiscount > strategyCost) totalDiscount = strategyCost;
        setAmountToBePaid((strategyCost - totalDiscount).toFixed(2));
    }, [strategyCost, couponDiscount, usePoints]);

    const applyCoupon = async () => {
        if (!couponCode) {
            showToast("Please enter a coupon code.", "error");
            return;
        }
        try {
            setIsLoading(true);
            const res = await postCheckCoupon({ couponCode });
            const discount = parseFloat(res[0]?.discount || 0);
            if (discount <= 0 || discount > strategyCost) {
                showToast("Invalid or excessive coupon discount.", "error");
                setCouponDiscount(0);
            } else {
                setCouponDiscount(discount);
                showToast("Coupon applied successfully!");
            }
        } catch (err) {
            showToast("Invalid Coupon Code.", "error");
            setCouponDiscount(0);
        } finally {
            setIsLoading(false);
        }
    };

    const pointsChecker = () => {
        const inputValue = parseInt(usePoints);
        if (inputValue > totalPoints) {
            showToast("You cannot use more points than you have.", "error");
            return;
        }
        if (strategyCost - inputValue < 1) {
            showToast("The subscription amount must be at least ₹1.", "error");
            return;
        }
        // Points are already applied through useEffect
        showToast("Points applied successfully!");
    };

    const createOrder = async () => {
        try {
            setIsLoading(true);
            const amount = amountToBePaid;
            const userId = user?._id;
            const payload = {
                amount,
                userId,
                totalAmount: strategyCost,
                isAdvance,
                usePoints,
                couponCode,
                fileName
            };
            const res = await postBuyBasicStrategy(payload);
            setMessage(res.data);
            if (res.status === 200) {
                showToast("Payment successful!");
                setTimeout(() => {
                    toggleModal();
                    // You might want to navigate or refresh data here
                }, 2000);
            } else {
                showToast(res.message || "Payment failed.", "error");
            }
        } catch (err) {
            if (err.response?.status === 402) {
                showToast("Insufficient Wallet Balance.", "error");
                setTimeout(() => {
                    // Navigate to funds page
                    // navigation.navigate('Funds');
                }, 2500);
            } else {
                showToast("An error occurred during payment.", "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const benefitsList = [
        "Validates strategy before real-world application.",
        "Reduces risk through historical performance analysis.",
        "Helps optimize strategy for better results.",
        "Provides insights into potential profitability.",
        "Increases confidence in strategy effectiveness."
    ];

    return (
        <>
            <Modal
                visible={isOpenModal}
                animationType="slide"
                transparent={true}
                onRequestClose={toggleModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer,{width: width * 0.95,
        maxHeight: height * 0.9}]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Header */}
                            <View style={styles.header}>
                                <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
                                    <Text style={styles.closeButtonText}>×</Text>
                                </TouchableOpacity>
                                <Text style={styles.headerTitle}>
                                    Thank you for choosing the {strategyName} Strategy. A well-implemented backtested strategy is essential for maximizing financial success.
                                </Text>
                            </View>

                            {/* Content */}
                            <View style={styles.content}>
                                {/* Benefits Card */}
                                <View style={styles.benefitsCard}>
                                    <View style={styles.benefitsList}>
                                        {benefitsList.map((text, index) => (
                                            <View key={index} style={styles.benefitItem}>
                                                <Text style={styles.checkmark}>✓</Text>
                                                <Text style={styles.benefitText}>{text}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {/* Billing Card */}
                                <View style={styles.billingCard}>
                                    <Text style={styles.billingTitle}>Subscription Bill</Text>
                                    <View style={styles.dashedLine} />

                                    {/* Wallet Info */}
                                    <View style={styles.walletInfo}>
                                        <View style={styles.walletRow}>
                                            <Text style={styles.walletLabel}>Wallet Balance:</Text>
                                            <Text style={styles.walletAmount}>₹ {user?.walletBalance || 0}</Text>
                                        </View>
                                        <View style={styles.walletRow}>
                                            <Text style={styles.walletLabel}>Points Available:</Text>
                                            <Text style={styles.walletAmount}>{totalPoints}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.dashedLine} />

                                    {/* Coupon Section */}
                                    <View style={styles.inputGroup}>
                                        <TextInput
                                            style={[
                                                styles.textInput,
                                                (couponDiscount > 0 || isLoading) && styles.disabledInput
                                            ]}
                                            placeholder="Enter Coupon Code"
                                            value={couponCode}
                                            onChangeText={setCouponCode}
                                            editable={!(couponDiscount > 0 || isLoading)}
                                        />
                                        <TouchableOpacity
                                            style={[
                                                styles.applyButton,
                                                (couponDiscount > 0 || isLoading) && styles.disabledButton
                                            ]}
                                            onPress={applyCoupon}
                                            disabled={couponDiscount > 0 || isLoading}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Text style={styles.applyButtonText}>Apply Coupon</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    {couponDiscount > 0 && (
                                        <View style={styles.couponApplied}>
                                            <Text style={styles.couponAppliedText}>
                                                Coupon Applied: ₹{couponDiscount.toFixed(2)}
                                            </Text>
                                            <TouchableOpacity onPress={() => setCouponDiscount(0)}>
                                                <Text style={styles.removeText}>Remove</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    <View style={styles.dashedLine} />

                                    {/* Points Section */}
                                    <View style={styles.inputGroup}>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Points to use"
                                            value={usePoints.toString()}
                                            onChangeText={(text) => setUsePoints(parseInt(text) || 0)}
                                            keyboardType="numeric"
                                        />
                                        <TouchableOpacity style={styles.applyButtonPrimary} onPress={pointsChecker}>
                                            <Text style={styles.applyButtonText}>Apply Points</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.dashedLine} />

                                    {/* Bill Summary */}
                                    <View style={styles.billSummary}>
                                        <View style={styles.billRow}>
                                            <Text style={styles.billLabel}>Strategy Cost:</Text>
                                            <Text style={styles.billAmount}>₹ {strategyCost.toFixed(2)}</Text>
                                        </View>
                                        <View style={styles.billRow}>
                                            <Text style={styles.billLabel}>Coupon Discount:</Text>
                                            <Text style={styles.billAmount}>- ₹ {couponDiscount.toFixed(2)}</Text>
                                        </View>
                                        <View style={styles.billRow}>
                                            <Text style={styles.billLabel}>Points Applied:</Text>
                                            <Text style={styles.billAmount}>- ₹ {usePoints.toFixed(2)}</Text>
                                        </View>
                                        <View style={styles.separator} />
                                        <View style={styles.billRow}>
                                            <Text style={styles.billLabelBold}>Amount to be Paid:</Text>
                                            <Text style={styles.billAmountBold}>₹ {amountToBePaid}</Text>
                                        </View>
                                    </View>

                                    {/* Pay Button */}
                                    <TouchableOpacity
                                        style={[
                                            styles.payButton,
                                            (amountToBePaid <= 0 || isLoading) && styles.disabledButton
                                        ]}
                                        onPress={createOrder}
                                        disabled={amountToBePaid <= 0 || isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.payButtonText}>Pay ₹ {amountToBePaid}</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <Toast />
        </>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
    },
    header: {
        backgroundColor: '#d667cd',
        padding: 20,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 15,
        zIndex: 1,
    },
    closeButtonText: {
        fontSize: 30,
        color: '#fff',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#251f57',
        textAlign: 'center',
        marginTop: 10,
    },
    content: {
        padding: 20,
    },
    benefitsCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    benefitsList: {
        paddingLeft: 0,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    checkmark: {
        color: '#22c55e',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    benefitText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        lineHeight: 20,
    },
    billingCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    billingTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#4a5568',
    },
    dashedLine: {
        borderBottomWidth: 2,
        borderBottomColor: '#aaa',
        borderStyle: 'dashed',
        marginVertical: 15,
    },
    walletInfo: {
        marginBottom: 10,
    },
    walletRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    walletLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4a5568',
    },
    walletAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4a5568',
    },
    inputGroup: {
        flexDirection: 'row',
        marginBottom: 10,
    },
        textInput: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 5,
        marginRight: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    disabledInput: {
        backgroundColor: '#f3f4f6',
        color: '#9ca3af',
    },
    applyButton: {
        backgroundColor: '#6c757d',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 120,
    },
    applyButtonPrimary: {
        backgroundColor: '#007bff',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 120,
    },
    disabledButton: {
        backgroundColor: '#9ca3af',
        opacity: 0.6,
    },
    applyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    couponApplied: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#d1f2eb',
        borderRadius: 5,
    },
    couponAppliedText: {
        fontSize: 14,
        color: '#22c55e',
        fontWeight: '600',
    },
    removeText: {
        color: '#dc3545',
        fontSize: 14,
        fontWeight: 'bold',
    },
    billSummary: {
        marginBottom: 20,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    billLabel: {
        fontSize: 16,
        color: '#333',
    },
    billLabelBold: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    billAmount: {
        fontSize: 16,
        color: '#333',
    },
    billAmountBold: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        marginVertical: 10,
    },
    payButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    payButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Billing;