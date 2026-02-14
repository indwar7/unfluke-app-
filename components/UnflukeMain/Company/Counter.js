import { Badge, Col, Container, Row } from 'reactstrap';
import CountUp from 'react-countup';
import React from 'react';

const Counter = () => {
    return (
        <section style={{
            paddingTop: '3rem',
            paddingBottom: '1.5rem',
            marginBottom: '1rem',
            marginTop: '1rem',
            backgroundColor: '#f8f9fa',
            position: 'relative'
        }}>
            {/* Divider element (hidden on small screens) */}
            <div className="divider top" style={{ display: 'none' }}></div>
            <Container>
                <Row>
                    <Col className="text-center">
                        <Badge pill bg="" style={{
                            backgroundColor: '#e9ecef', 
                            padding: '0.25rem 0.5rem',
                            borderWidth: 0,
                            fontWeight: 'bold'
                        }}>
                            STATS
                        </Badge>
                        <h4 style={{
                            margin: '0.5rem 0',
                            fontWeight: '500' 
                        }}>Unfluke In Numbers</h4>
                    </Col>
                </Row>
                <Row className="mt-5 text-center" style={{ marginTop: '3rem' }}>
                    <Col xs={6} md={3} style={{ marginBottom: '1rem' }}>
                        <div style={{
                            fontSize: '2.5rem', 
                            fontWeight: '400' 
                        }}>
                            <CountUp duration={5} start={10} end={100} suffix="+" />
                        </div>
                        <p style={{
                            marginTop: '0.5rem',
                            marginBottom: '0',
                            fontWeight: '600' 
                        }}>Indicators</p>
                        <p>To help you get best scanners</p>
                    </Col>
                    <Col xs={6} md={3} style={{ marginBottom: '1rem' }}>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: '400'
                        }}>
                            <CountUp duration={5} start={5} end={1} suffix="TB+" />
                        </div>
                        <p style={{
                            marginTop: '0.5rem',
                            marginBottom: '0',
                            fontWeight: '600'
                        }}>Market Data</p>
                        <p>To computer scan results and alerts</p>
                    </Col>
                    <Col xs={6} md={3} style={{ marginBottom: '1rem' }}>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: '400'
                        }}>
                            <CountUp duration={5} start={10} end={7} />
                        </div>
                        <p style={{
                            marginTop: '0.5rem',
                            marginBottom: '0',
                            fontWeight: '600'
                        }}>Years of Market Data</p>
                        <p>In equity, Futures and Options</p>
                    </Col>
                    <Col xs={6} md={3} style={{ marginBottom: '1rem' }}>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: '400'
                        }}>
                            <CountUp duration={5} start={1} end={1000} suffix="+" />
                        </div>
                        <p style={{
                            marginTop: '0.5rem',
                            marginBottom: '0',
                            fontWeight: '600'
                        }}>Potential option strategies</p>
                        <p>By using indicators and your ideas!</p>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Counter;
