import React from "react";
import { Row, Col, Container, Accordion, Badge } from "reactstrap";
import FeaturesList from "./featureList";
// types
// import { Feature } from './types';

// images
import f1 from "../../../assets/images/hero/f1.jpg";
import f2 from "../../../assets/images/hero/f2.jpg";
import f3 from "../../../assets/images/hero/f3.jpg";
// import f1 from "../../../assets/images/hero/f1.jpg";

const Features1 = ({ features, containerClass }) => {
    return (
        <section className={containerClass}>
            <Container>
                <Row className="justify-content-center">
                    <Col className="text-center">
                        <Badge
                            pill
                            bg=""
                            className="badge-soft-primary px-2 py-1 border-0 "
                        >
                            Features
                        </Badge>
                        <h5 className="fs-2 fw-medium m-2">
                            Excellent Features. Excellent Results
                        </h5>
                        <p className="text-muted mx-auto">
                            Start working with{" "}
                            <span className="text-primary fw-bold">Unfluke</span> to manage
                            all your strategies  {/*TO BE CHANGED--> "trading needs" changed to strategies */}
                        </p>
                    </Col>
                </Row>

                <Row className="pt-5 align-items-center features-1">
                    <Col lg={6} className="d-flex justify-content-center">
                        <div className="img-content position-relative">
                            <div className="img-up mb-lg-0 mb-6">
                                <img
                                    src={f1}
                                    alt=""
                                    className="img-fluid d-block rounded"
                                    data-aos="fade-right"
                                    data-aos-duration="200"
                                    style={{ maxWidth: '100%' }}
                                />
                            </div>
                        </div>
                    </Col>
                    <Col lg={5} className="d-flex flex-column justify-content-center">
                        <div id="features3-list" data-aos="fade-up" data-aos-duration="300">
                            <h3 className="text-dark">HISTORICAL INTRADAY CHARTS</h3>
                            <Accordion defaultActiveKey="0">
                                {(features || []).map((item, index) => {
                                    return (
                                        <FeaturesList
                                            key={index.toString()}
                                            item={item}
                                            index={index}
                                        />
                                    );
                                })}
                            </Accordion>
                        </div>
                    </Col>
                </Row>

            </Container>
        </section>
    );
};

export default Features1;
