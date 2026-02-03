import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const OTPVerificationModal = ({ 
  isOpen, 
  toggle, 
  onVerify, 
  digits = 6, 
  title = "Verify OTP" 
}) => {
  const { width } = useWindowDimensions()

  const [otp, setOtp] = useState(Array(digits).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(Array(digits).fill(''));
      setError('');
      setIsVerifying(false);
      // Focus first input when modal opens
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen, digits]);

  const handleChange = (value, index) => {
    // Handle paste - if multiple digits are entered at once
    if (value.length > 1) {
      const pastedData = value.slice(0, digits);
      if (!/^\d+$/.test(pastedData)) return;

      const newOtp = [...otp];
      for (let i = 0; i < Math.min(digits - index, pastedData.length); i++) {
        newOtp[index + i] = pastedData[i];
      }
      setOtp(newOtp);
      setError('');

      // Focus appropriate field after paste
      const focusIndex = Math.min(digits - 1, index + pastedData.length);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
      }
      return;
    }

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto focus next input
    if (value && index < digits - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Clear previous input and focus it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');

    if (otpValue.length !== digits) {
      setError(`Please enter all ${digits} digits`);
      return;
    }

    setIsVerifying(true);

    try {
      await onVerify(otpValue);
      toggle();
    } catch (err) {
      console.log("OTP__>", err);
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    setOtp(Array(digits).fill(''));
    setError('');
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={toggle}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1}
        onPress={toggle}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={[styles.modalContainer,{    width: width * 0.9,
}]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalBody}>
            {/* Header Section */}
            <View style={styles.headerContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed" size={32} color="#0d6efd" />
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>
                We've sent a verification code to your email
              </Text>
            </View>

            {/* OTP Input Section */}
            <View style={styles.inputContainer}>
              {Array.from({ length: digits }, (_, index) => (
                <TextInput
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  style={[
                    styles.input,
                    otp[index] && styles.inputFilled
                  ]}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={otp[index]}
                  onChangeText={(value) => handleChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  selectTextOnFocus
                  textContentType="oneTimeCode"
                  autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                />
              ))}
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                isVerifying && styles.verifyButtonDisabled
              ]}
              onPress={handleVerify}
              disabled={isVerifying}
              activeOpacity={0.8}
            >
              {isVerifying ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.buttonText}>  Verifying...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            {/* Resend Button (Uncomment if needed) */}
            {/* <TouchableOpacity 
              style={styles.resendButton}
              onPress={handleResend}
              activeOpacity={0.7}
            >
              <Text style={styles.resendButtonText}>
                Didn't receive the code? Resend
              </Text>
            </TouchableOpacity> */}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalBody: {
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#e6f7ff',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  input: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  inputFilled: {
    borderColor: '#0d6efd',
    borderWidth: 2,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c2c7',
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#842029',
    textAlign: 'center',
    fontSize: 14,
  },
  verifyButton: {
    backgroundColor: '#0d6efd',
    paddingVertical: 14,
    borderRadius: 4,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#0d6efd',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OTPVerificationModal;