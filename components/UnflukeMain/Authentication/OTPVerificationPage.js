import React, { useState, useEffect } from 'react';
import { Card, CardBody, Col, Container, Input, Label, Row, Button, Form, FormFeedback, Alert, Spinner } from 'reactstrap';
import ParticlesAuth from "../../AuthenticationInner/ParticlesAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import withRouter from "../../../Components/Common/withRouter";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp, resetOtpVerificationFlag, resendOtp } from "../../../Unfluke_slices/thunks";
import { createSelector } from 'reselect';

import logoLight from "../../../assets/images/unfluke/UNFLUKE -05.png";
import AsyncStorage from '@react-native-async-storage/async-storage';

const OtpVerification = (props) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const phoneNumber = location.state?.phone;
    console.log("PHONE NUMBER", phoneNumber);
    // Redirect if no phone number is provided
    useEffect(() => {
        if (!phoneNumber) {
            navigate('/forgot-password');
        }
    }, [phoneNumber, navigate]);

    // Countdown timer for OTP resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const selectLayoutState = (state) => state;
    const otpVerificationSelector = createSelector(
        selectLayoutState,
        (state) => ({
            loading: state.OtpVerification?.loading || false,
            error: state.OtpVerification?.error || null,
            message: state.OtpVerification?.message || null,
            success: state.OtpVerification?.success || false,
            resendLoading: state.OtpVerification?.resendLoading || false,
            resendSuccess: state.OtpVerification?.resendSuccess || false,
            resendError: state.OtpVerification?.resendError || null,
        })
    );

    const { loading, error, message, success, resendLoading, resendSuccess, resendError } = useSelector(otpVerificationSelector);

    useEffect(() => {
        if (success) {
            setTimeout(() => {
                navigate("/reset-password", { state: { phone: phoneNumber, token: validation.values.otp } });
                dispatch(resetOtpVerificationFlag());
            }, 2000);
        }

        if (error) {
            setTimeout(() => {
                dispatch(resetOtpVerificationFlag());
            }, 3000);
        }

        if (resendSuccess) {
            setCountdown(60);
            setCanResend(false);
            setTimeout(() => {
                dispatch(resetOtpVerificationFlag());
            }, 3000);
        }
    }, [success, error, resendSuccess, dispatch, navigate, phoneNumber]);

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            phone: phoneNumber || '',
            otp: '',
        },
        validationSchema: Yup.object({
            otp: Yup.string()
                .matches(/^[0-9]{6}$/, "OTP must be 6 digits")
                .required("Please Enter OTP"),
        }),
        onSubmit: (values) => {
            const res = JSON.parse(AsyncStorage.getItem("forgotPasswordResponse"));
            res["otp"] = values.otp;
            dispatch(verifyOtp(res));
        }
    });

    const handleResendOtp = () => {
        if (canResend) {
            dispatch(resendOtp({ phone: phoneNumber }));
        }
    };

    document.title = "OTP Verification | Unfluke";

    return (
        <React.Fragment>
            <ParticlesAuth>
                <div className="auth-page-content mt-lg-5">
                    <Container>
                        <Row>
                            <Col lg={12}>
                                <div className="text-center mt-sm-5 mb-4 text-white-50">
                                    <div>
                                        <Link to="/" className="d-inline-block auth-logo">
                                            <img src={logoLight} alt="" height="100" />
                                        </Link>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row className="justify-content-center">
                            <Col md={8} lg={6} xl={5}>
                                <Card className="mt-4 card-bg-fill">
                                    <CardBody className="p-4">
                                        <div className="text-center mt-2">
                                            <h5 className="text-primary">OTP Verification</h5>
                                            <p className="text-muted">
                                                Please enter the 6-digit OTP sent to {phoneNumber && phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}
                                            </p>
                                        </div>

                                        {error && <Alert color="danger">{error}</Alert>}
                                        {success && <Alert color="success">{message}</Alert>}
                                        {resendSuccess && <Alert color="success">OTP resent successfully!</Alert>}
                                        {resendError && <Alert color="danger">{resendError}</Alert>}

                                        <div className="p-2">
                                            <Form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    validation.handleSubmit();
                                                    return false;
                                                }}
                                                className="form-horizontal"
                                            >
                                                <div className="mb-3">
                                                    <Label className="form-label" htmlFor="otp">Enter OTP</Label>
                                                    <Input
                                                        name="otp"
                                                        className="form-control"
                                                        placeholder="Enter 6-digit OTP"
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        maxLength={6}
                                                        onChange={(e) => {
                                                            const digitsOnly = e.target.value.replace(/\D+/g, '');
                                                            validation.setFieldValue('otp', digitsOnly);
                                                        }}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.otp || ''}
                                                        invalid={Boolean(validation.touched.otp && validation.errors.otp)}
                                                    />
                                                    {validation.touched.otp && validation.errors.otp ? (
                                                        <FormFeedback type="invalid">{validation.errors.otp}</FormFeedback>
                                                    ) : null}
                                                </div>

                                                <div className="text-center mt-4">
                                                    <Button color="success" className="w-100" type="submit" disabled={loading}>
                                                        {loading ? <Spinner size="sm" className="me-2" /> : null}
                                                        Verify OTP
                                                    </Button>
                                                </div>

                                                <div className="mt-3 text-center">
                                                    <Button
                                                        color="link"
                                                        className="text-decoration-underline"
                                                        onClick={handleResendOtp}
                                                        disabled={!canResend || resendLoading}
                                                    >
                                                        {resendLoading ? (
                                                            <Spinner size="sm" className="me-1" />
                                                        ) : !canResend ? (
                                                            `Resend OTP in ${countdown}s`
                                                        ) : (
                                                            "Resend OTP"
                                                        )}
                                                    </Button>
                                                </div>
                                            </Form>
                                        </div>
                                    </CardBody>
                                </Card>

                                <div className="mt-4 text-center">
                                    <p className="mb-0">
                                        <Link to="/forgot-password" className="fw-semibold text-primary text-decoration-underline">
                                            Back to Forgot Password
                                        </Link>
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </ParticlesAuth>
        </React.Fragment>
    );
};

export default withRouter(OtpVerification);
