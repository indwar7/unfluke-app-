import React, { useState, useRef, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/constants/ThemeContext';
import type { AppColors } from '@/constants/Colors';

interface OTPVerificationModalProps {
    isOpen: boolean;
    toggle: () => void;
    onVerify: (otp: string) => Promise<void>;
    digits?: number;
    title?: string;
    /**
     * Optional. When supplied, a "Resend" action is shown — needed by flows
     * where the OTP window can lapse ("Timeout please try again") and the user
     * must be able to request a fresh code without restarting signup.
     */
    onResend?: () => Promise<void>;
    subtitle?: string;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
    isOpen,
    toggle,
    onVerify,
    digits = 6,
    title = "Verify OTP",
    onResend,
    subtitle,
}) => {
    const { colors: c, isDark } = useTheme();
    const styles = makeStyles(c, isDark);
    const [otp, setOtp] = useState<string[]>(Array(digits).fill(''));
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setOtp(Array(digits).fill(''));
            setError('');
            setNotice('');
            setIsVerifying(false);
            setIsResending(false);
            // Focus first input when modal opens
            setTimeout(() => {
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
            }, 100);
        }
    }, [isOpen, digits]);

    const handleChange = (value: string, index: number) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        // Update OTP array
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        setError('');

        // Auto focus next input
        if (value && index < digits - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = async () => {
        try {
            const pastedData = await Clipboard.getString();
            
            if (!/^\d+$/.test(pastedData)) return;

            const newOtp = [...otp];

            for (let i = 0; i < Math.min(digits, pastedData.length); i++) {
                newOtp[i] = pastedData[i];
            }
            
            setOtp(newOtp);

            // Focus appropriate field after paste
            const focusIndex = Math.min(digits - 1, pastedData.length);
            if (inputRefs.current[focusIndex]) {
                inputRefs.current[focusIndex].focus();
            }
        } catch (error) {
            console.log('Paste error:', error);
        }
    };

    const handleVerify = async () => {
        const otpValue = otp.join('');

        if (otpValue.length !== digits) {
            setError(`Please enter all ${digits} digits`);
            return;
        }

        setIsVerifying(true);
        setNotice('');

        try {
            await onVerify(otpValue);
            toggle();
        } catch (err: any) {
            console.log("OTP__>", err);
            // The backend's messages ("Incorrect OTP", "Timeout please try
            // again") are written to be user-facing, so prefer them over a
            // generic string. The axios interceptor rejects with a plain string.
            const message =
                (typeof err === 'string' ? err : err?.message) ||
                'Invalid OTP. Please try again.';
            setError(message);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!onResend || isResending) return;

        setIsResending(true);
        setError('');
        setNotice('');

        try {
            await onResend();
            setOtp(Array(digits).fill(''));
            setNotice('A new code has been sent.');
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            const message =
                (typeof err === 'string' ? err : err?.message) ||
                'Could not resend the code. Please try again.';
            setError(message);
        } finally {
            setIsResending(false);
        }
    };

    const LockIcon = () => (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={c.gold} strokeWidth={2}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </Svg>
    );

    return (
        <Modal
            visible={isOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={toggle}
        >   
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.headerContainer}>
                        <View style={styles.iconContainer}>
                            <LockIcon />
                        </View>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>
                            {subtitle || "We've sent a verification code to your device"}
                        </Text>
                    </View>

                    <View style={styles.inputContainer}>
                        {Array.from({ length: digits }, (_, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                style={[
                                    styles.input,
                                    error ? styles.inputError : null
                                ]}
                                maxLength={1}
                                value={otp[index]}
                                onChangeText={(value) => handleChange(value, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="numeric"
                                textAlign="center"
                                selectTextOnFocus={true}
                                onFocus={() => setError('')}
                            />
                        ))}
                    </View>

                    {/* Paste button for convenience */}
                    <TouchableOpacity style={styles.pasteButton} onPress={handlePaste}>
                        <Text style={styles.pasteButtonText}>Paste from clipboard</Text>
                    </TouchableOpacity>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {notice ? (
                        <View style={styles.noticeContainer}>
                            <Text style={styles.noticeText}>{notice}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
                        onPress={handleVerify}
                        disabled={isVerifying}
                    >
                        {isVerifying ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={c.onGold} style={styles.spinner} />
                                <Text style={styles.verifyButtonText}>Verifying...</Text>
                            </View>
                        ) : (
                            <Text style={styles.verifyButtonText}>Verify OTP</Text>
                        )}
                    </TouchableOpacity>

                    {onResend ? (
                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={handleResend}
                            disabled={isResending || isVerifying}
                        >
                            <Text
                                style={[
                                    styles.resendButtonText,
                                    (isResending || isVerifying) && styles.resendButtonTextDisabled,
                                ]}
                            >
                                {isResending
                                    ? 'Sending a new code…'
                                    : "Didn't receive the code? Resend"}
                            </Text>
                        </TouchableOpacity>
                    ) : null}

                    {/* Close button */}
                    <TouchableOpacity style={styles.closeButton} onPress={toggle}>
                        <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: c.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
    },
    modalContainer: {
        backgroundColor: c.card,
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 64,
        height: 64,
        backgroundColor: c.goldLight,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        color: c.text,
    },
    subtitle: {
        color: c.textSecondary,
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    input: {
        width: 40,
        height: 48,
        borderWidth: 2,
        borderColor: c.inputBorder,
        borderRadius: 8,
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: c.inputBg,
        color: c.text,
        textAlign: 'center',
        flex: 1,
        marginHorizontal: 3,
    },
    inputError: {
        borderColor: c.error,
    },
    pasteButton: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    pasteButtonText: {
        color: c.gold,
        fontSize: 14,
        fontWeight: '500',
    },
    errorContainer: {
        backgroundColor: c.errorLight,
        borderColor: c.error,
        borderWidth: 1,
        borderRadius: 4,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: c.error,
        textAlign: 'center',
        fontSize: 14,
    },
    verifyButton: {
        backgroundColor: c.gold,
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 16,
    },
    verifyButtonDisabled: {
        backgroundColor: c.textMuted,
    },
    verifyButtonText: {
        color: c.onGold,
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinner: {
        marginRight: 8,
    },
    resendButton: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    resendButtonText: {
        color: c.gold,
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    resendButtonTextDisabled: {
        color: c.textMuted,
    },
    noticeContainer: {
        backgroundColor: c.goldLight,
        borderColor: c.gold,
        borderWidth: 1,
        borderRadius: 4,
        padding: 12,
        marginBottom: 16,
    },
    noticeText: {
        color: c.text,
        textAlign: 'center',
        fontSize: 14,
    },
    closeButton: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    closeButtonText: {
        color: c.textSecondary,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default OTPVerificationModal;









// import React, { useState, useRef, useEffect } from 'react';
// import {
//     Modal,
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     Alert,
//     StyleSheet,
//     ActivityIndicator,
//     Clipboard,
// } from 'react-native';
// import Toast from 'react-native-toast-message';
// import Svg, { Path } from 'react-native-svg';

// const OTPVerificationModal = ({ isOpen, toggle, onVerify, digits = 6, title = "Verify OTP" }) => {
//     const [otp, setOtp] = useState(Array(digits).fill(''));
//     const [isVerifying, setIsVerifying] = useState(false);
//     const [error, setError] = useState('');
//     const inputRefs = useRef([]);

//     // Reset when modal opens
//     useEffect(() => {
//         if (isOpen) {
//             setOtp(Array(digits).fill(''));
//             setError('');
//             setIsVerifying(false);
//             // Focus first input when modal opens
//             setTimeout(() => {
//                 if (inputRefs.current[0]) {
//                     inputRefs.current[0].focus();
//                 }
//             }, 100);
//         }
//     }, [isOpen, digits]);

//     const handleChange = (value, index) => {
//         // Only allow numbers
//         if (!/^\d*$/.test(value)) return;

//         // Update OTP array
//         const newOtp = [...otp];
//         newOtp[index] = value.substring(value.length - 1);
//         setOtp(newOtp);
//         setError('');

//         // Auto focus next input
//         if (value && index < digits - 1) {
//             inputRefs.current[index + 1].focus();
//         }
//     };

//     const handleKeyPress = (e, index) => {
//         // Handle backspace
//         if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
//             inputRefs.current[index - 1].focus();
//         }
//     };

//     const handlePaste = async () => {
//         try {
//             const pastedData = await Clipboard.getString();
            
//             if (!/^\d+$/.test(pastedData)) return;

//             const newOtp = [...otp];

//             for (let i = 0; i < Math.min(digits, pastedData.length); i++) {
//                 newOtp[i] = pastedData[i];
//             }
            
//             setOtp(newOtp);

//             // Focus appropriate field after paste
//             const focusIndex = Math.min(digits - 1, pastedData.length);
//             if (inputRefs.current[focusIndex]) {
//                 inputRefs.current[focusIndex].focus();
//             }
//         } catch (error) {
//             console.log('Paste error:', error);
//         }
//     };

//     const handleVerify = async () => {
//         const otpValue = otp.join('');

//         if (otpValue.length !== digits) {
//             setError(`Please enter all ${digits} digits`);
//             return;
//         }

//         setIsVerifying(true);

//         try {
//             await onVerify(otpValue);
//             toggle();
//         } catch (err) {
//             console.log("OTP__>", err);
//             setError('Invalid OTP. Please try again.');
//         } finally {
//             setIsVerifying(false);
//         }
//     };

//     const handleResend = () => {
//         // Implement your resend logic here
//         setOtp(Array(digits).fill(''));
//         setError('');
//         if (inputRefs.current[0]) {
//             inputRefs.current[0].focus();
//         }
//     };

//     const LockIcon = () => (
//         <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#0d6efd" strokeWidth={2}>
//             <Path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//         </Svg>
//     );

//     return (
//         <Modal
//             visible={isOpen}
//             transparent={true}
//             animationType="fade"
//             onRequestClose={toggle}
//         >   
//             <View style={styles.modalOverlay}>
//                 <View style={styles.modalContainer}>
//                     <View style={styles.headerContainer}>
//                         <View style={styles.iconContainer}>
//                             <LockIcon />
//                         </View>
//                         <Text style={styles.title}>{title}</Text>
//                         <Text style={styles.subtitle}>We've sent a verification code to your device</Text>
//                     </View>

//                     <View style={styles.inputContainer}>
//                         {Array.from({ length: digits }, (_, index) => (
//                             <TextInput
//                                 key={index}
//                                 ref={el => inputRefs.current[index] = el}
//                                 style={[
//                                     styles.input,
//                                     error ? styles.inputError : null
//                                 ]}
//                                 maxLength={1}
//                                 value={otp[index]}
//                                 onChangeText={(value) => handleChange(value, index)}
//                                 onKeyPress={(e) => handleKeyPress(e, index)}
//                                 keyboardType="numeric"
//                                 textAlign="center"
//                                 selectTextOnFocus={true}
//                                 onFocus={() => setError('')}
//                             />
//                         ))}
//                     </View>

//                     {/* Paste button for convenience */}
//                     <TouchableOpacity style={styles.pasteButton} onPress={handlePaste}>
//                         <Text style={styles.pasteButtonText}>Paste from clipboard</Text>
//                     </TouchableOpacity>

//                     {error ? (
//                         <View style={styles.errorContainer}>
//                             <Text style={styles.errorText}>{error}</Text>
//                         </View>
//                     ) : null}

//                     <TouchableOpacity
//                         style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
//                         onPress={handleVerify}
//                         disabled={isVerifying}
//                     >
//                         {isVerifying ? (
//                             <View style={styles.loadingContainer}>
//                                 <ActivityIndicator size="small" color="white" style={styles.spinner} />
//                                 <Text style={styles.verifyButtonText}>Verifying...</Text>
//                             </View>
//                         ) : (
//                             <Text style={styles.verifyButtonText}>Verify OTP</Text>
//                         )}
//                     </TouchableOpacity>

//                     {/* Uncomment if you want resend functionality */}
//                     {/*
//                     <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
//                         <Text style={styles.resendButtonText}>
//                             Didn't receive the code? Resend
//                         </Text>
//                     </TouchableOpacity>
//                     */}

//                     {/* Close button */}
//                     <TouchableOpacity style={styles.closeButton} onPress={toggle}>
//                         <Text style={styles.closeButtonText}>Cancel</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </Modal>
//     );
// };

// const styles = StyleSheet.create({
//     modalOverlay: {
//         flex: 1,
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 15,
//     },
//     modalContainer: {
//         backgroundColor: 'white',
//         borderRadius: 12,
//         padding: 24,
//         width: '100%',
//         maxWidth: 400,
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 2,
//         },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//         elevation: 5,
//     },
//     headerContainer: {
//         alignItems: 'center',
//         marginBottom: 24,
//     },
//     iconContainer: {
//         width: 64,
//         height: 64,
//         backgroundColor: '#e6f7ff',
//         borderRadius: 32,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 16,
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         marginBottom: 8,
//         textAlign: 'center',
//         color: '#333',
//     },
//     subtitle: {
//         color: '#6c757d',
//         marginBottom: 20,
//         textAlign: 'center',
//         fontSize: 16,
//     },
//     inputContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 16,
//     },
//     input: {
//         width: 40,
//         height: 48,
//         borderWidth: 2,
//         borderColor: '#ced4da',
//         borderRadius: 8,
//         fontSize: 18,
//         fontWeight: 'bold',
//         backgroundColor: 'white',
//         textAlign: 'center',
//         flex: 1,
//         marginHorizontal: 3,
//     },
//     inputError: {
//         borderColor: '#dc3545',
//     },
//     pasteButton: {
//         alignSelf: 'center',
//         paddingVertical: 8,
//         paddingHorizontal: 16,
//         marginBottom: 16,
//     },
//     pasteButtonText: {
//         color: '#0d6efd',
//         fontSize: 14,
//         fontWeight: '500',
//     },
//     errorContainer: {
//         backgroundColor: '#f8d7da',
//         borderColor: '#f5c6cb',
//         borderWidth: 1,
//         borderRadius: 4,
//         padding: 12,
//         marginBottom: 16,
//     },
//     errorText: {
//         color: '#721c24',
//         textAlign: 'center',
//         fontSize: 14,
//     },
//     verifyButton: {
//         backgroundColor: '#0d6efd',
//         borderRadius: 8,
//         paddingVertical: 15,
//         alignItems: 'center',
//         marginBottom: 16,
//     },
//     verifyButtonDisabled: {
//         backgroundColor: '#6c757d',
//     },
//     verifyButtonText: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: 'bold',
//     },
//     loadingContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     spinner: {
//         marginRight: 8,
//     },
//     resendButton: {
//         alignSelf: 'center',
//         paddingVertical: 8,
//         paddingHorizontal: 16,
//         marginBottom: 16,
//     },
//     resendButtonText: {
//         color: '#0d6efd',
//         fontSize: 14,
//         fontWeight: '500',
//         textAlign: 'center',
//     },
//     closeButton: {
//         alignSelf: 'center',
//         paddingVertical: 8,
//         paddingHorizontal: 16,
//     },
//     closeButtonText: {
//         color: '#6c757d',
//         fontSize: 16,
//         fontWeight: '500',
//     },
// });

// export default OTPVerificationModal;









// import React, { useState, useRef, useEffect } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   Dimensions,
//   Platform,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';

// const { width } = Dimensions.get('window');

// const OTPVerificationModal = ({ 
//   isOpen, 
//   toggle, 
//   onVerify, 
//   digits = 6, 
//   title = "Verify OTP" 
// }) => {
//   const [otp, setOtp] = useState(Array(digits).fill(''));
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [error, setError] = useState('');
//   const inputRefs = useRef([]);

//   // Reset when modal opens
//   useEffect(() => {
//     if (isOpen) {
//       setOtp(Array(digits).fill(''));
//       setError('');
//       setIsVerifying(false);
//       // Focus first input when modal opens
//       setTimeout(() => {
//         if (inputRefs.current[0]) {
//           inputRefs.current[0].focus();
//         }
//       }, 100);
//     }
//   }, [isOpen, digits]);

//   const handleChange = (value, index) => {
//     // Handle paste - if multiple digits are entered at once
//     if (value.length > 1) {
//       const pastedData = value.slice(0, digits);
//       if (!/^\d+$/.test(pastedData)) return;

//       const newOtp = [...otp];
//       for (let i = 0; i < Math.min(digits - index, pastedData.length); i++) {
//         newOtp[index + i] = pastedData[i];
//       }
//       setOtp(newOtp);
//       setError('');

//       // Focus appropriate field after paste
//       const focusIndex = Math.min(digits - 1, index + pastedData.length);
//       if (inputRefs.current[focusIndex]) {
//         inputRefs.current[focusIndex].focus();
//       }
//       return;
//     }

//     // Only allow numbers
//     if (!/^\d*$/.test(value)) return;

//     // Update OTP array
//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);
//     setError('');

//     // Auto focus next input
//     if (value && index < digits - 1) {
//       inputRefs.current[index + 1].focus();
//     }
//   };

//   const handleKeyPress = (e, index) => {
//     // Handle backspace
//     if (e.nativeEvent.key === 'Backspace') {
//       if (!otp[index] && index > 0) {
//         // Clear previous input and focus it
//         const newOtp = [...otp];
//         newOtp[index - 1] = '';
//         setOtp(newOtp);
//         inputRefs.current[index - 1].focus();
//       } else {
//         // Clear current input
//         const newOtp = [...otp];
//         newOtp[index] = '';
//         setOtp(newOtp);
//       }
//     }
//   };

//   const handleVerify = async () => {
//     const otpValue = otp.join('');

//     if (otpValue.length !== digits) {
//       setError(`Please enter all ${digits} digits`);
//       return;
//     }

//     setIsVerifying(true);

//     try {
//       await onVerify(otpValue);
//       toggle();
//     } catch (err) {
//       console.log("OTP__>", err);
//       setError('Invalid OTP. Please try again.');
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   const handleResend = () => {
//     setOtp(Array(digits).fill(''));
//     setError('');
//     if (inputRefs.current[0]) {
//       inputRefs.current[0].focus();
//     }
//   };

//   return (
//     <Modal
//       visible={isOpen}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={toggle}
//     >
//       <TouchableOpacity 
//         style={styles.modalOverlay} 
//         activeOpacity={1}
//         onPress={toggle}
//       >
//         <TouchableOpacity 
//           activeOpacity={1} 
//           style={styles.modalContainer}
//           onPress={(e) => e.stopPropagation()}
//         >
//           <View style={styles.modalBody}>
//             {/* Header Section */}
//             <View style={styles.headerContainer}>
//               <View style={styles.iconContainer}>
//                 <Ionicons name="lock-closed" size={32} color="#0d6efd" />
//               </View>
//               <Text style={styles.title}>{title}</Text>
//               <Text style={styles.subtitle}>
//                 We've sent a verification code to your device
//               </Text>
//             </View>

//             {/* OTP Input Section */}
//             <View style={styles.inputContainer}>
//               {Array.from({ length: digits }, (_, index) => (
//                 <TextInput
//                   key={index}
//                   ref={el => inputRefs.current[index] = el}
//                   style={[
//                     styles.input,
//                     otp[index] && styles.inputFilled
//                   ]}
//                   maxLength={1}
//                   keyboardType="number-pad"
//                   value={otp[index]}
//                   onChangeText={(value) => handleChange(value, index)}
//                   onKeyPress={(e) => handleKeyPress(e, index)}
//                   selectTextOnFocus
//                   textContentType="oneTimeCode"
//                   autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
//                 />
//               ))}
//             </View>

//             {/* Error Message */}
//             {error ? (
//               <View style={styles.errorContainer}>
//                 <Text style={styles.errorText}>{error}</Text>
//               </View>
//             ) : null}

//             {/* Verify Button */}
//             <TouchableOpacity
//               style={[
//                 styles.verifyButton,
//                 isVerifying && styles.verifyButtonDisabled
//               ]}
//               onPress={handleVerify}
//               disabled={isVerifying}
//               activeOpacity={0.8}
//             >
//               {isVerifying ? (
//                 <View style={styles.loadingContainer}>
//                   <ActivityIndicator color="#fff" size="small" />
//                   <Text style={styles.buttonText}>  Verifying...</Text>
//                 </View>
//               ) : (
//                 <Text style={styles.buttonText}>Verify OTP</Text>
//               )}
//             </TouchableOpacity>

//             {/* Resend Button (Uncomment if needed) */}
//             {/* <TouchableOpacity 
//               style={styles.resendButton}
//               onPress={handleResend}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.resendButtonText}>
//                 Didn't receive the code? Resend
//               </Text>
//             </TouchableOpacity> */}
//           </View>
//         </TouchableOpacity>
//       </TouchableOpacity>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: width * 0.9,
//     maxWidth: 400,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   modalBody: {
//     padding: 24,
//   },
//   headerContainer: {
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   iconContainer: {
//     width: 64,
//     height: 64,
//     backgroundColor: '#e6f7ff',
//     borderRadius: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: '#000',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#6c757d',
//     textAlign: 'center',
//     marginTop: 8,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   input: {
//     width: 48,
//     height: 48,
//     borderWidth: 1,
//     borderColor: '#ced4da',
//     borderRadius: 4,
//     textAlign: 'center',
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginHorizontal: 4,
//     backgroundColor: '#fff',
//   },
//   inputFilled: {
//     borderColor: '#0d6efd',
//     borderWidth: 2,
//   },
//   errorContainer: {
//     backgroundColor: '#f8d7da',
//     borderColor: '#f5c2c7',
//     borderWidth: 1,
//     borderRadius: 4,
//     padding: 12,
//     marginBottom: 16,
//   },
//   errorText: {
//     color: '#842029',
//     textAlign: 'center',
//     fontSize: 14,
//   },
//   verifyButton: {
//     backgroundColor: '#0d6efd',
//     paddingVertical: 14,
//     borderRadius: 4,
//     marginBottom: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   verifyButtonDisabled: {
//     backgroundColor: '#6c757d',
//     opacity: 0.6,
//   },
//   loadingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   resendButton: {
//     paddingVertical: 8,
//     alignItems: 'center',
//   },
//   resendButtonText: {
//     color: '#0d6efd',
//     fontSize: 14,
//     fontWeight: '500',
//   },
// });

// export default OTPVerificationModal;