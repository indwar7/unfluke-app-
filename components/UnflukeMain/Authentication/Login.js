import React, { useEffect, useState } from 'react';
import { Card, CardBody, Col, Container, Input, Label, Row, Button, Form, FormFeedback, Alert, Spinner } from 'reactstrap';
import ParticlesAuth from "../../AuthenticationInner/ParticlesAuth";
//redux
import { useSelector, useDispatch } from "react-redux";

import { Link } from "react-router-dom";
import withRouter from "../../../Components/Common/withRouter";
// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";

// actions
import { loginUser, socialLogin, resetLoginFlag } from "../../../Unfluke_slices/thunks";

import logoLight from "../../../assets/images/unfluke/UNFLUKE -05.png";
import { createSelector } from 'reselect';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import images

const UnflukeLogin = (props) => {
    const dispatch = useDispatch();

    const selectLayoutState = (state) => state;
    const loginpageData = createSelector(
        selectLayoutState,
        (state) => ({
            user: state.Account.user,
            error: state.Login.error,
            loading: state.Login.loading,
            errorMsg: state.Login.errorMsg,
        })
    );
    // Inside your component
    const {
        user, error, loading, errorMsg
    } = useSelector(loginpageData);

    const [userLogin, setUserLogin] = useState([]);
    const [passwordShow, setPasswordShow] = useState(false);

    if (AsyncStorage.getItem("authUser")) {
        props.router.navigate("/in/dashboard");
    }

    useEffect(() => {
        if (user && user) {
            const updatedUserData = process.env.REACT_APP_DEFAULTAUTH === "firebase" ? user.multiFactor.user.phone : user.phone;
            const updatedUserPassword = process.env.REACT_APP_DEFAULTAUTH === "firebase" ? "" : user.confirm_password;
            setUserLogin({
                phone: updatedUserData,
                password: updatedUserPassword
            });

            console.log(user)
        }
    }, [user]);

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            phone: userLogin.phone || '',
            password: userLogin.password || '',
        },
        validationSchema: Yup.object({
            phone: Yup.number().required("Please Enter Your Mobile Number"),
            password: Yup.string().required("Please Enter Your Password"),
        }),
        onSubmit: (values) => {
            console.log("YES LOGINNG", values);
            values.phone = values.phone.toString();
            dispatch(loginUser(values, props.router.navigate));
        }
    });

    const signIn = type => {
        dispatch(socialLogin(type, props.router.navigate));
    };

    //handleTwitterLoginResponse
    // const twitterResponse = e => {}

    //for facebook and google authentication
    const socialResponse = type => {
        signIn(type);
    };


    useEffect(() => {
        if (errorMsg) {
            setTimeout(() => {
                dispatch(resetLoginFlag());
            }, 3000);
        }
    }, [dispatch, errorMsg]);
    document.title = "SignIn | Unfluke";
    return (
        <React.Fragment>
            <ParticlesAuth>
                <div className="auth-page-content mt-lg-5">
                    <Container>
                        <Row>
                            {/* <Col lg={12}>
                                <div className="text-center mt-sm-5 mb-4 text-white-50">
                                    <div>
                                        <Link to="/" className="d-inline-block auth-logo">
                                            <img src={logoLight} alt="" height="100" />
                                        </Link>
                                    </div>
                                </div>
                            </Col> */}
                        </Row>
                        <div className = "flex justify-center items-center mb-20">
                        <Link to="/" className="d-inline-block auth-logo  w-48 ">
                                            <img src={logoLight} alt="logo" />
                                        </Link>
                        </div>

                        <Row className="flex justify-center items-center ">
                            <Col md={8} lg={6} xl={5}>
                                <Card className="mt-4 card-bg-fill">
                                    <CardBody className="p-4">
                                        <div className="text-center mt-2">
                                            <h5 className="text-primary">Welcome Back !</h5>
                                            <p className="text-muted">Sign in to continue to Unfluke.</p>
                                        </div>
                                        {error && error ? (<Alert color="danger"> {error} </Alert>) : null}
                                        <div className="p-2 mt-4">
                                            <Form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    validation.handleSubmit();
                                                    return false;
                                                }}
                                                action="#">

                                                <div className="mb-3">
                                                    <Label htmlFor="phone" className="form-label">Mobile Number</Label>
                                                    <Input
                                                        name="phone"
                                                        type="tel"
                                                        className="form-control"
                                                        placeholder="Enter phone"
                                                        inputMode="numeric"
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
                                                        <FormFeedback type="invalid">{validation.errors.phone}</FormFeedback>
                                                    ) : null}
                                                </div>

                                                <div className="mb-3">
                                                    <div className="float-end">
                                                        <Link to="/forgot-password" className="text-muted">Forgot password?</Link>
                                                    </div>
                                                    <Label className="form-label" htmlFor="password-input">Password</Label>
                                                    <div className="position-relative auth-pass-inputgroup mb-3">
                                                        <Input
                                                            name="password"
                                                            value={validation.values.password || ""}
                                                            type={passwordShow ? "text" : "password"}
                                                            className="form-control pe-5"
                                                            placeholder="Enter Password"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            invalid={
                                                                validation.touched.password && validation.errors.password ? true : false
                                                            }
                                                        />
                                                        {validation.touched.password && validation.errors.password ? (
                                                            <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                                                        ) : null}
                                                        <button className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted material-shadow-none" type="button" id="password-addon" onClick={() => setPasswordShow(!passwordShow)}><i className="ri-eye-fill align-middle"></i></button>
                                                    </div>
                                                </div>

                                                <div className="form-check">
                                                    <Input className="form-check-input" type="checkbox" value="" id="auth-remember-check" />
                                                    <Label className="form-check-label" htmlFor="auth-remember-check">Remember me</Label>
                                                </div>

                                                <div className="mt-4">
                                                    <Button color="success" disabled={error ? null : loading ? true : false} className="btn btn-success w-100" type="submit">
                                                        {loading ? <Spinner size="sm" className='me-2'> Loading... </Spinner> : null}
                                                        Sign In
                                                    </Button>
                                                </div>

                                                {/* <div className="mt-4 text-center">
                                                    <div className="signin-other-title">
                                                        <h5 className="fs-13 mb-4 title">Sign In with</h5>
                                                    </div>
                                                    <div>
                                                        <Link
                                                            to="#"
                                                            className="btn btn-primary btn-icon me-1"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                socialResponse("facebook");
                                                            }}
                                                        >
                                                            <i className="ri-facebook-fill fs-16" />
                                                        </Link>
                                                        <Link
                                                            to="#"
                                                            className="btn btn-danger btn-icon me-1"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                socialResponse("google");
                                                            }}
                                                        >
                                                            <i className="ri-google-fill fs-16" />
                                                        </Link>
                                                        <Button color="dark" className="btn-icon"><i className="ri-github-fill fs-16"></i></Button>{" "}
                                                        <Button color="info" className="btn-icon"><i className="ri-twitter-fill fs-16"></i></Button>
                                                    </div>
                                                </div> */}
                                            </Form>
                                        </div>
                                    </CardBody>
                                </Card>

                                <div className="mt-4 text-center">
                                    <p className="mb-0">Don't have an account ? <Link to="/register" className="fw-semibold text-primary text-decoration-underline"> Signup </Link> </p>
                                </div>

                            </Col>
                        </Row>
                    </Container>
                </div>
            </ParticlesAuth>
        </React.Fragment>
    );
};

export default withRouter(UnflukeLogin);
