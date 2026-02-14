import React from "react";
import { Row, Col, Container, Accordion, Badge } from "reactstrap";
import FeaturesList from "./featureList";
// types
// import { Feature } from './types';

// images
import f5 from "../../../assets/images/hero/f5.jpg";

const Features1 = ({ features, containerClass }) => {
  return (
    <section className={containerClass}>
      <Container>
        <Row className="pt-5 align-items-center features-3">
      <Col lg={6} className="d-flex justify-content-center">
        <div className="img-content position-relative">
          <div className="img-up mb-lg-0 mb-6">
            <img
              src={f5}
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
          <h3 className="text-dark">BACKTEST STRATEGIES</h3>
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
