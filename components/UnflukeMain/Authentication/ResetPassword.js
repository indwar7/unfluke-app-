import React, { useState, useEffect } from 'react';
import { Card, CardBody, Col, Container, Input, Label, Row, Button, Form, FormFeedback, Alert, Spinner } from 'reactstrap';
import ParticlesAuth from "../../AuthenticationInner/ParticlesAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import withRouter from "../../../Components/Common/withRouter";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, resetPasswordFlag } from "../../../Unfluke_slices/thunks";
import { createSelector } from 'reselect';

import logoLight from "../../../assets/images/unfluke/UNFLUKE -05.png";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ResetPassword = (props) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [passwordShow, setPasswordShow] = useState(false);
    const [confirmPasswordShow, setConfirmPasswordShow] = useState(false);

    const phoneNumber = location.state?.phone;
    const token = location.state?.token;

    // Redirect if token or phone number is not provided
    useEffect(() => {
        if (!token || !phoneNumber) {
            navigate('/forgot-password');
        }
    }, [token, phoneNumber, navigate]);

    const selectLayoutState = (state) => state;
    const resetPasswordSelector = createSelector(
        selectLayoutState,
        (state) => ({
            loading: state.ResetPassword?.loading || false,
            error: state.ResetPassword?.error || null,
            message: state.ResetPassword?.message || null,
            success: state.ResetPassword?.success || false,
        })
    );

    const { loading, error, message, success } = useSelector(resetPasswordSelector);

    useEffect(() => {
        if (success) {
            setTimeout(() => {
                navigate("/login");
                AsyncStorage.removeItem("forgotPasswordResponse");
                dispatch(resetPasswordFlag());
            }, 3000);
        }

        if (error) {
            setTimeout(() => {
                dispatch(resetPasswordFlag());
            }, 3000);
        }
    }, [success, error, dispatch, navigate]);

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            phone: phoneNumber || '',
            token: token || '',
            password: '',
            confirm_password: '',
        },
        validationSchema: Yup.object({
            password: Yup.string()
                .min(7, "Password must be at least 7 characters")
                .required("Please Enter New Password"),
            confirm_password: Yup.string()
                .oneOf([Yup.ref('password'), null], "Passwords must match")
                .required("Please Confirm New Password"),
        }),
        onSubmit: (values) => {
            dispatch(resetPassword(values));
        }
    });

    document.title = "Reset Password | Unfluke";

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
                                            <h5 className="text-primary">Create New Password</h5>
                                            <p className="text-muted">Your new password must be different from previous used passwords.</p>
                                        </div>

                                        {error && <Alert color="danger">{error}</Alert>}
                                        {success && <Alert color="success">{message}</Alert>}

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
                                                    <Label className="form-label" htmlFor="password-input">Password</Label>
                                                    <div className="position-relative auth-pass-inputgroup">
                                                        <Input
                                                            name="password"
                                                            type={passwordShow ? "text" : "password"}
                                                            className="form-control pe-5"
                                                            placeholder="Enter Password"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.password || ""}
                                                            invalid={
                                                                validation.touched.password && validation.errors.password ? true : false
                                                            }
                                                        />
                                                        {validation.touched.password && validation.errors.password ? (
                                                            <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                                                        ) : null}
                                                        <button
                                                            className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted material-shadow-none"
                                                            type="button"
                                                            onClick={() => setPasswordShow(!passwordShow)}
                                                        >
                                                            <i className="ri-eye-fill align-middle"></i>
                                                        </button>
                                                    </div>
                                                    <div id="passwordInput" className="form-text">
                                                        Must be at least 8 characters with uppercase, lowercase, number and special character.
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <Label className="form-label" htmlFor="confirm-password-input">Confirm Password</Label>
                                                    <div className="position-relative auth-pass-inputgroup mb-3">
                                                        <Input
                                                            name="confirm_password"
                                                            type={confirmPasswordShow ? "text" : "password"}
                                                            className="form-control pe-5"
                                                            placeholder="Confirm Password"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.confirm_password || ""}
                                                            invalid={
                                                                validation.touched.confirm_password && validation.errors.confirm_password ? true : false
                                                            }
                                                        />
                                                        {validation.touched.confirm_password && validation.errors.confirm_password ? (
                                                            <FormFeedback type="invalid">{validation.errors.confirm_password}</FormFeedback>
                                                        ) : null}
                                                        <button
                                                            className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted material-shadow-none"
                                                            type="button"
                                                            onClick={() => setConfirmPasswordShow(!confirmPasswordShow)}
                                                        >
                                                            <i className="ri-eye-fill align-middle"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="text-center mt-4">
                                                    <Button color="success" className="w-100" type="submit" disabled={loading}>
                                                        {loading ? <Spinner size="sm" className="me-2" /> : null}
                                                        Reset Password
                                                    </Button>
                                                </div>
                                            </Form>
                                        </div>
                                    </CardBody>
                                </Card>

                                <div className="mt-4 text-center">
                                    <p className="mb-0">Wait, I remember my password... <Link to="/login" className="fw-semibold text-primary text-decoration-underline"> Click here </Link> </p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </ParticlesAuth>
        </React.Fragment>
    );
};

export default withRouter(ResetPassword);
