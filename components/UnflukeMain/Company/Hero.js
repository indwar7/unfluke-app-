import { Button, Col, Container, Row } from 'reactstrap';
import React from 'react'
import { Link } from 'react-router-dom';
import ParallaxComponent from '../Parallax/ParallaxComponent';

const Hero = () => {
    return (
        <section style={{ marginTop: "5%" }} className="position-relative hero-9">
            <div className="hero-top">
                <Container>
                    <Row style={{ padding: "4rem 0rem" }}>
                        <Col>
                            <h1 className="hero-title fw-bold">
                                We are on a mission to{' '}
                                <span className="highlight highlight-info d-inline-block">revolutionize </span>
                                trading
                            </h1>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className="position-relative">
                <div className="hero-cta">
                    <Button variant="info" className="btn-cta">
                        <Link to="/contact" className='text-light'>
                            Let's Have Talk
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="hero-bottom">
                <ParallaxComponent />
            </div>
        </section>
    );
};

export default Hero;
