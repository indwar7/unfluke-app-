import React from 'react';
import { Row, Col, Container, Badge } from 'reactstrap';
import TradingView from '../../../assets/images/brands/TradingView.jpg';

const Partners = () => {
    return (
        <section className="section pt-8 pb-6 bg-gradient6 position-relative">
            <div className="divider top d-none d-sm-block"></div>
            <Container>
                <Row data-aos="fade-up" data-aos-duration="200">
                    <Col className="text-center">
                        <h4 className="m-2 fw-medium">In partnership with</h4>

                        <ul className="list-inline mt-5">
                            <li className="list-inline-item mx-4 mx-xl-5 mb-3">
                                <img src={TradingView} alt="" height="64" />
                            </li>
                        </ul>
                        <span>
                            TradingView is a widely recognized and highly regarded platform among traders and investors, with a vast user base spanning the globe.
                            It offers state-of-the-art charting tools that allow market enthusiasts to engage, analyze data, and prepare for <a href='https://www.tradingview.com/symbols/BTCUSD/' target='_blank'> btc usd</a>, <a href='https://www.tradingview.com/symbols/ETHUSD/' target='_blank'>eth usd</a> trading and various other assets.
                        </span>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Partners;