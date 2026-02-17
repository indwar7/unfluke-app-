import React, { useEffect, useState } from "react";
import { Row, Col, CardBody, Card, Alert, Container, Input, Label, Form, FormFeedback, Button } from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// action
import { registerUser, apiError, resetRegisterFlag } from "../../../Unfluke_slices/thunks";

//redux
import { useSelector, useDispatch } from "react-redux";

import { Link, useNavigate } from "react-router-dom";

//import images
import logoLight from "../../../assets/images/unfluke/UNFLUKE -05.png";
import ParticlesAuth from "../../AuthenticationInner/ParticlesAuth";
import { createSelector } from "reselect";
import withRouter from "../../../Components/Common/withRouter";

import OTPVerificationModal from "./OtpVerification";
import { postPhoneSendOtp, postVerifyPhoneOtp } from "../../../Unfluke_helpers/backend_helper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Unflukeregister = (props) => {
    const history = useNavigate();
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const handleVerify = async (otpValue) => {
        // Implement your verification logic here
        console.log("Verifying OTP:", otpValue);
        const otpResponse = JSON.parse(AsyncStorage.getItem('response'));
        // Example: API call to verify OTP
        otpResponse["otp"] = otpValue
        const response = await postVerifyPhoneOtp(otpResponse);
        if (!response.msg) throw new Error('Invalid OTP');
        AsyncStorage.removeItem('response')
        toast(response.msg, { position: "top-right", hideProgressBar: false, className: 'bg-success text-white' })

    };

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            name: '',
            phone: '',
            email: '',
            password: '',
            confirm_password: '',
            referral: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Please Enter Your Name"),
            phone: Yup.string().matches(/^\d{10}$/, "Please enter 10 digit phone number").required("Please Enter Your Phone number"),
            email: Yup.string().optional()
                .matches(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Invalid emails."),
            referral: Yup.string(),
            password: Yup.string().required("Please enter your password")
                .min(7, "Password must be more than 6 characters")
            ,
            confirm_password: Yup.string()
                .oneOf([Yup.ref("password")], "Passwords do not match")
                .required("Please confirm your password"),
        }),
        onSubmit: (values) => {
            values.email = values.email.toLowerCase();
            dispatch(registerUser(values));
        }
    });

    const selectLayoutState = (state) => state.Account;
    const registerdatatype = createSelector(
        selectLayoutState,
        (account) => ({
            mailSent: account.verificationMailSent,
            otpSent:account.verificationOtpSent,
            success: account.success,
            error: account.error
        })
    );
    // Inside your component
    const {
        error, success, mailSent, otpSent
    } = useSelector(registerdatatype);

    if (AsyncStorage.getItem("authUser")) {
        props.router.navigate("/in/dashboard");
    }

    useEffect(() => {
        dispatch(apiError(""));
    }, [dispatch]);

    useEffect(()=>{
        otpSent && toggleModal()

    },[otpSent])

    useEffect(() => {
        if (success) {
            setTimeout(() => history("/login"), 3000);
        }

        setTimeout(() => {
            dispatch(resetRegisterFlag());
        }, 3000);

    }, [dispatch, success, error, history]);

    document.title = " Register Page | Unfluke";

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
                                    {/* <p className="mt-3 fs-15 fw-medium">Premium Admin & Dashboard Template</p> */}
                                </div>
                            </Col>
                        </Row>

                        <Row className="justify-content-center">
                            <Col md={8} lg={6} xl={5}>
                                <Card className="mt-4">

                                    <CardBody className="p-4">
                                        <div className="text-center mt-2">
                                            <h5 className="text-primary">Create New Account</h5>
                                            <p className="text-muted">Get your free Unfluke account now</p>
                                        </div>
                                        <div className="p-2 mt-4">
                                            <Form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    validation.handleSubmit();
                                                    return false;
                                                }}
                                                className="needs-validation" action="#">

                                                {mailSent && mailSent ? (
                                                    <>
                                                        {toast("Please verify your email...", { position: "top-right", hideProgressBar: false, className: 'bg-success text-white', progress: undefined, toastId: "" })}
                                                        <ToastContainer autoClose={2000} limit={1} />
                                                        <Alert color="success">
                                                            Verify your email
                                                        </Alert>
                                                    </>
                                                ) : null}

                                                {error && error ? (
                                                    <Alert color="danger"><div>
                                                        Mobile Number has been Register Before, Please Use Another Mobile Number ... </div></Alert>
                                                ) : null}

                                                <div className="mb-3">
                                                    <Label htmlFor="name" className="form-label">Name <span className="text-danger">*</span></Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        className="form-control"
                                                        placeholder="Enter name"
                                                        type="text"
                                                        onChange={validation.handleChange}
                                                        value={validation.values.name || ""}
                                                        onBlur={validation.handleBlur}
                                                        invalid={
                                                            validation.touched.name && validation.errors.name ? true : false
                                                        }
                                                    />
                                                    {validation.touched.name && validation.errors.name ? (
                                                        <FormFeedback type="invalid"><div>{validation.errors.name}</div></FormFeedback>
                                                    ) : null}

                                                </div>
                                                <div className="mb-3">
                                                    <Label htmlFor="phone" className="form-label">Phone Number <span className="text-danger">*</span></Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        type="tel"
                                                        className="form-control"
                                                        placeholder="Enter phone number"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        maxLength={10}
                                                        onChange={(e) => {
                                                            const digitsOnly = e.target.value.replace(/\D+/g, '');
                                                            validation.setFieldValue('phone', digitsOnly);
                                                        }}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.phone || ""}
                                                        invalid={
                                                            validation.touched.phone && validation.errors.phone ? true : false
                                                        }
                                                    />
                                                    {validation.touched.phone && validation.errors.phone ? (
                                                        <FormFeedback type="invalid"><div>{validation.errors.phone}</div></FormFeedback>
                                                    ) : null}

                                                </div>
                                                <div className="mb-3">
                                                    <Label htmlFor="useremail" className="form-label">Email </Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        className="form-control"
                                                        placeholder="Enter email address"
                                                        type="email"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.email || ""}
                                                        invalid={
                                                            validation.touched.email && validation.errors.email ? true : false
                                                        }
                                                    />
                                                    {validation.touched.email && validation.errors.email ? (
                                                        <FormFeedback type="invalid"><div>{validation.errors.email}</div></FormFeedback>
                                                    ) : null}

                                                </div>

                                                <div className="mb-3">
                                                    <Label htmlFor="userpassword" className="form-label">Password <span className="text-danger">*</span></Label>
                                                    <Input
                                                        name="password"
                                                        type="password"
                                                        placeholder="Enter Password"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.password || ""}
                                                        invalid={
                                                            validation.touched.password && validation.errors.password ? true : false
                                                        }
                                                    />
                                                    {validation.touched.password && validation.errors.password ? (
                                                        <FormFeedback type="invalid"><div>{validation.errors.password}</div></FormFeedback>
                                                    ) : null}

                                                </div>

                                                <div className="mb-2">
                                                    <Label htmlFor="confirmPassword" className="form-label">Confirm Password <span className="text-danger">*</span></Label>
                                                    <Input
                                                        name="confirm_password"
                                                        type="password"
                                                        placeholder="Confirm Password"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.confirm_password || ""}
                                                        invalid={
                                                            validation.touched.confirm_password && validation.errors.confirm_password ? true : false
                                                        }
                                                    />
                                                    {validation.touched.confirm_password && validation.errors.confirm_password ? (
                                                        <FormFeedback type="invalid"><div>{validation.errors.confirm_password}</div></FormFeedback>
                                                    ) : null}

                                                </div>

                                                <div className="mb-3">
                                                    <Label htmlFor="username" className="form-label">Referral Code  (<span style={{ color: "grey", fontSize: "12px" }}>Optional</span>)</Label>
                                                    <Input
                                                        name="referral"
                                                        type="text"
                                                        placeholder="Enter referral code"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.referral || ""}
                                                        invalid={
                                                            validation.touched.referral && validation.errors.referral ? true : false
                                                        }
                                                    />
                                                    {validation.touched.referral && validation.errors.referral ? (
                                                        <FormFeedback type="invalid"><div>{validation.errors.referral}</div></FormFeedback>
                                                    ) : null}

                                                </div>

                                                <div className="mb-4">
                                                    <p className="mb-0 fs-12 text-muted fst-italic">By registering you agree to the Unfluke
                                                        <Link to="/terms" className="text-primary text-decoration-underline fst-normal fw-medium">Terms of Use</Link></p>
                                                </div>

                                                <div className="mt-4">
                                                    <button className="btn btn-success w-100" type="submit">Sign Up</button>
                                                </div>
                                                {/* <Button color="primary" onClick={toggleModal}>
                                                    Verify Account
                                                </Button> */}

                                                <OTPVerificationModal
                                                    isOpen={isModalOpen}
                                                    toggle={toggleModal}
                                                    onVerify={handleVerify}
                                                    digits={6} // Optional: customize number of digits
                                                    title="Verify Your Account" // Optional: customize title
                                                />
                                                {/*
                                                <div className="mt-4 text-center">
                                                    <div className="signin-other-title">
                                                        <h5 className="fs-13 mb-4 title text-muted">Create account with</h5>
                                                    </div>

                                                    <div>
                                                        <button type="button" className="btn btn-primary btn-icon waves-effect waves-light"><i className="ri-facebook-fill fs-16"></i></button>{" "}
                                                        <button type="button" className="btn btn-danger btn-icon waves-effect waves-light"><i className="ri-google-fill fs-16"></i></button>{" "}
                                                        <button type="button" className="btn btn-dark btn-icon waves-effect waves-light"><i className="ri-github-fill fs-16"></i></button>{" "}
                                                        <button type="button" className="btn btn-info btn-icon waves-effect waves-light"><i className="ri-twitter-fill fs-16"></i></button>
                                                    </div>
                                                </div> */}
                                            </Form>
                                        </div>
                                    </CardBody>
                                </Card>
                                <div className="mt-4 text-center">
                                    <p className="mb-0">Already have an account ? <Link to="/login" className="fw-semibold text-primary text-decoration-underline"> Signin </Link> </p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </ParticlesAuth>
        </React.Fragment>
    );
};

export default withRouter(Unflukeregister);
