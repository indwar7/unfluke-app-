import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { Row, Col, Alert, Card, CardBody, Container, FormFeedback, Input, Label, Form } from "reactstrap";

//redux
import { useSelector, useDispatch } from "react-redux";

import { Link, useNavigate } from "react-router-dom";
import withRouter from "../../../Components/Common/withRouter";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

// action
import { resetForgotPasswordFlag, resetPasswordRequest, } from "../../../Unfluke_slices/thunks";

// import images
// import profile from "../../assets/images/bg.png";
import logoLight from "../../../assets/images/unfluke/UNFLUKE -05.png";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { createSelector } from "reselect";

const ForgetPasswordPage = props => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            phone: '',
        },
        validationSchema: Yup.object({
            phone: Yup.string().required("Please Enter Your Registered Mobile Number"),
        }),
        onSubmit: (values) => {
            dispatch(resetPasswordRequest(values, props.history));
        }
    });


    const selectLayoutState = (state) => state.ForgetPassword;
    const selectLayoutProperties = createSelector(
        selectLayoutState,
        (state) => ({
            error: state.error,
            success: state.success,
        })
    );


    // Inside your component
    const {
        error, success
    } = useSelector(selectLayoutProperties);

    useEffect(() => {
        if (success) {
            console.log("success");
            setTimeout(() => {
                navigate("/otp-verification", { state: { phone: validation.values.phone } });
                dispatch(resetForgotPasswordFlag());
            }, 2000);
        }

        if (error) {
            setTimeout(() => {
                dispatch(resetForgotPasswordFlag());
            }, 3000);
        }
    }, [success, error, dispatch, navigate]);

    document.title = "Reset Password | unfluke";
    return (
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
                                        <h5 className="text-primary">Forgot Password?</h5>
                                        {/* <p className="text-muted">Reset password with velzon</p> */}

                                        <lord-icon
                                            src="https://cdn.lordicon.com/rhvddzym.json"
                                            trigger="loop"
                                            colors="primary:#0ab39c"
                                            className="avatar-xl"
                                            style={{ width: "120px", height: "120px" }}
                                        >
                                        </lord-icon>

                                    </div>

                                    <Alert className="border-0 alert-warning text-center mb-2 mx-2" role="alert">
                                        Enter your registered mobile number and OTP will be sent to you!
                                    </Alert>
                                    <div className="p-2">
                                        {error && error ? (
                                            <Alert color="danger" style={{ marginTop: "13px" }}>
                                                {error}
                                            </Alert>
                                        ) : null}
                                        {success ? (
                                            <Alert color="success" style={{ marginTop: "13px" }}>
                                                {success}
                                            </Alert>
                                        ) : null}
                                        <Form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                validation.handleSubmit();
                                                return false;
                                            }}
                                        >
                                            <div className="mb-4">
                                                <Label className="form-label">Phone</Label>
                                                <Input
                                                    name="phone"
                                                    className="form-control"
                                                    placeholder="Enter Mobile Number"
                                                    type="phone"
                                                    // onChange={validation.handleChange}
                                                    // onBlur={validation.handleBlur}
                                                    // value={validation.values.phone || ""}
                                                    // invalid={
                                                    //     validation.touched.phone && validation.errors.phone ? true : false
                                                    // }
                                                    pattern="[0-9]*"
                                                    maxLength={10}
                                                    onChange={(e) => {
                                                        const digitsOnly = e.target.value.replace(/\D+/g, '');
                                                        validation.setFieldValue('phone', digitsOnly);
                                                    }}
                                                    onBlur={validation.handleBlur}
                                                    value={validation.values.phone || ''}
                                                    invalid={Boolean(validation.touched.phone && validation.errors.phone)}
                                                />
                                                {validation.touched.phone && validation.errors.phone ? (
                                                    <FormFeedback type="invalid"><div>{validation.errors.phone}</div></FormFeedback>
                                                ) : null}
                                            </div>

                                            <div className="text-center mt-4">
                                                <button className="btn btn-success w-100" type="submit">Send OTP</button>
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
    );
};

ForgetPasswordPage.propTypes = {
    history: PropTypes.object,
};

export default withRouter(ForgetPasswordPage);
