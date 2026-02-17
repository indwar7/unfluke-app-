import { Col, Container, Row } from "reactstrap";
import React from "react";
import profile from "../../../assets/images/avatars/about_pic.jpg";

const About = () => {
    return (
        <section className="py-5 mt-5 career-service position-relative">
            <Container>
                <Row>
                    <Col style={{ textAlign: 'center' }}>
                        <h4 style={{ fontWeight: '600', marginBottom: '20px' }}>About Us</h4>
                    </Col>
                </Row>
                <Row data-aos="fade-up">
                    <Col lg={3}>
                        <div className="img-content" style={{ position: 'relative' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <img
                                // className=""
                                    src={profile}
                                    alt="app img"
                                    style={{ borderRadius: '0.25rem',height:"20%",width:"100%" }}
                                />
                                <strong style={{ textAlign: 'center', margin: '8px 0', display: 'block' }}>
                                    <p>Aseem Singhal, Founder</p>
                                </strong>
                            </div>
                        </div>
                    </Col>
                    <Col lg={9} >
                        <p style={{ color: '#6c757d', marginBottom: '16px' }}>
                            Welcome to Unfluke! We are passionate about empowering traders and
                            investors like you with the tools and resources needed to test and
                            refine your trading ideas and strategies. Our platform provides a
                            comprehensive suite of features that enable you to make informed
                            decisions based on historical data, receive timely alerts,
                            leverage powerful scanners, and perform accurate backtesting.
                        </p>
                        <p style={{ color: '#6c757d' }}>
                            At Unfluke, we understand the challenges traders face in today's
                            dynamic and ever-evolving markets. It can be daunting to navigate
                            the complexities of the financial world, interpret market trends,
                            and identify profitable opportunities. That's why we have built a
                            user-friendly and intuitive platform that caters to traders of all
                            experience levels, from beginners to seasoned professionals.
                        </p>
                        <p style={{ color: '#6c757d' }}>
                            Our primary goal is to make testing accessible and efficient for
                            everyone. We believe that by providing robust tools and valuable
                            insights, we can help you gain a competitive edge in the market.
                            Whether you are a day trader, swing trader, or long-term investor,
                            our platform equips you with the necessary resources to make
                            smarter decisions and maximize your potential for success.
                        </p>
                        <p style={{ color: '#6c757d' }}>
                            Key Features of Unfluke:
                            <ol>
                                <li>
                                    <b>Historical Data Analysis</b>: Leverage our
                                    vast historical database to analyze past market trends, price
                                    movements, and trading patterns. Uncover valuable insights that
                                    can guide your future trading decisions.
                                </li>
                                <li>
                                    <b>Strategy Testing and Optimization</b>: Test out your trading ideas and strategies using our
                                    advanced backtesting capabilities. Identify strengths and
                                    weaknesses, refine your approach, and improve your overall trading
                                    performance.
                                </li>
                                <li>
                                    <b>Real-time Alerts</b>: Stay informed with timely alerts
                                    that notify you about significant market events, price movements,
                                    and potential trading opportunities. Customize alerts based on
                                    your specific preferences and trading style.
                                </li>
                                <li>
                                    <b>Powerful Scanners</b>: Discover potential trades and investments efficiently with our
                                    comprehensive scanning tools. Filter stocks, currencies, or other
                                    financial instruments based on your desired criteria, such as
                                    price, volume, volatility, and technical indicators.
                                </li>
                            </ol>
                        </p>
                        <p style={{ color: '#6c757d' }}>
                            We are dedicated to providing you with a seamless and enriching trading
                            experience. Our team of experts is committed to continuous
                            improvement and innovation, ensuring that our platform remains at
                            the forefront of trading technology. We value your feedback and
                            are always open to suggestions on how we can enhance our services
                            to better meet your needs. Join Unfluke today and unlock the full
                            potential of your trading journey. Empower yourself with the
                            tools, knowledge, and support you need to achieve your financial
                            goals.
                        </p>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default About;
