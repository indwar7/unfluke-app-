import React, { useState, useRef, useEffect } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Alert
} from 'reactstrap';
import { postVerifyEmailOtp } from '../../../Unfluke_helpers/backend_helper';
import { toast } from 'react-toastify';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OTPVerificationModal = ({ isOpen, toggle, onVerify, digits = 6, title = "Verify OTP" }) => {
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

    const handleChange = (e, index) => {
        const value = e.target.value;

        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        // Update OTP array
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        setError('');

        // Auto focus next input
        if (value && index < digits - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }

        // Handle left/right arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
        if (e.key === 'ArrowRight' && index < digits - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');

        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];

        for (let i = 0; i < Math.min(digits, pastedData.length); i++) {
            newOtp[i] = pastedData[i];
        }
        // 123456
        setOtp(newOtp);

        // Focus appropriate field after paste
        const focusIndex = Math.min(digits - 1, pastedData.length);
        inputRefs.current[focusIndex].focus();
    };

    const handleVerify = async () => {
        const otpValue = otp.join('');

        if (otpValue.length !== digits) {
            setError(`Please enter all ${digits} digits`);
            return;
        }

        setIsVerifying(true);

        try {
            const data = JSON.parse(AsyncStorage.getItem('response'));
            data.email = AsyncStorage.getItem('email');
            data.otp = otpValue;
            const resp = await postVerifyEmailOtp(data);
            AsyncStorage.setItem('authUser', JSON.stringify(resp.data));
            toggle();
            toast.success('Email verified successfully');
        } catch (err) {
            console.log("OTP__>", err);

            setError('Invalid OTP. Please try again.');

        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = () => {
        // Implement your resend logic here
        setOtp(Array(digits).fill(''));
        setError('');
        inputRefs.current[0].focus();
    };

    const modalStyles = {
        maxWidth: '400px',
        margin: '1.75rem auto'
    };

    const iconContainerStyle = {
        width: '64px',
        height: '64px',
        backgroundColor: '#e6f7ff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto'
    };

    const iconStyle = {
        width: '32px',
        height: '32px',
        color: '#0d6efd'
    };

    const headerContainerStyle = {
        textAlign: 'center',
        marginBottom: '24px'
    };

    const titleStyle = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '8px'
    };

    const subtitleStyle = {
        color: '#6c757d',
        marginBottom: '20px'
    };

    const inputContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '24px'
    };

    const inputStyle = {
        width: '48px',
        height: '48px',
        textAlign: 'center',
        fontSize: '1.25rem',
        fontWeight: 'bold',
        padding: '0',
        margin: '0 4px'
    };

    const resendButtonStyle = {
        color: '#0d6efd',
        backgroundColor: 'transparent',
        border: 'none',
        padding: '8px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500'
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered style={modalStyles}>
            <ModalBody>
                <div style={headerContainerStyle}>
                    <div style={iconContainerStyle}>
                        <svg xmlns="http://www.w3.org/2000/svg" style={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 style={titleStyle}>{title}</h3>
                    <p style={subtitleStyle}>We've sent a verification code to your Email Id</p>
                </div>

                <div style={inputContainerStyle}>
                    {Array.from({ length: digits }, (_, index) => (
                        <Input
                            key={index}
                            innerRef={el => inputRefs.current[index] = el}
                            type="text"
                            maxLength={1}
                            value={otp[index]}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={index === 0 ? handlePaste : null}
                            style={inputStyle}
                        />
                    ))}
                </div>

                {error && (
                    <Alert color="danger" style={{ marginBottom: '16px', textAlign: 'center' }}>
                        {error}
                    </Alert>
                )}

                <Button
                    color="primary"
                    block
                    onClick={handleVerify}
                    disabled={isVerifying}
                    style={{ marginBottom: '16px' }}
                >
                    {isVerifying ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Verifying...
                        </span>
                    ) : (
                        'Verify OTP'
                    )}
                </Button>

                {/* <div style={{ textAlign: 'center' }}>
                    <button
                        style={resendButtonStyle}
                        onClick={handleResend}
                    >
                        Didn't receive the code? Resend
                    </button>
                </div> */}
            </ModalBody>
        </Modal>
    );
};

export default OTPVerificationModal;
