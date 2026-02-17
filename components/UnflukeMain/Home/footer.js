import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Container, Row } from 'reactstrap';

// Import Images
import logolight from "../../../assets/images/logo-light.png";
import SectionTen from '../../../pages/UnflukeMain/OnePage/NewLanding/SectionTen/SectionTen';
import '../../../pages/UnflukeMain/OnePage/NewLanding/SectionTen/SectionTen.scss';

const Footer = () => {
    return (

        
        // <React.Fragment>
        //     <footer className="custom-footer bg-dark py-2 position-relative ">
        //         <Container className='container-fluid' style={{minWidth:"80vw"}}>

        //             <Row className="text-center text-sm-start align-items-center mt-2 mb-2">
        //                 <Col sm={4}>
        //                     <div>
        //                         <p className="copy-rights mb-0">
        //                             {new Date().getFullYear()} © Unfluke. All rights reserved.
        //                         </p>
        //                     </div>
        //                 </Col>
        //                 <Col sm={4}>
        //                     <div className="text-sm-end mt-3 mt-sm-0">
        //                         <ul className="list-inline mb-0 footer-social-link">
        //                             <li className="list-inline-item">
        //                                 <Link to="https://wa.me/+918800683154" className="avatar-xs d-block">
        //                                     <div className="avatar-title rounded-circle">
        //                                         <i className=" ri-whatsapp-fill"></i>
        //                                     </div>
        //                                 </Link>
        //                             </li>
        //                             <li className="list-inline-item">
        //                                 <Link to="https://twitter.com/aseem_singhal" className="avatar-xs d-block">
        //                                     <div className="avatar-title rounded-circle">
        //                                         <i className="ri-twitter-fill"></i>
        //                                     </div>
        //                                 </Link>
        //                             </li>
        //                             <li className="list-inline-item">
        //                                 <Link to="https://www.linkedin.com/in/singhalaseem/" className="avatar-xs d-block">
        //                                     <div className="avatar-title rounded-circle">
        //                                         <i className="ri-linkedin-fill"></i>
        //                                     </div>
        //                                 </Link>
        //                             </li>
        //                         </ul>
        //                     </div>
        //                 </Col>
        //                 <Col sm={4}>
        //                     <div className="text-sm-end mt-3 mt-sm-0">
        //                         <ul className="list-inline mb-0 footer-social-link">
        //                             <li className="d-inline-block me-4 text-muted">
        //                                 <Link to="/terms">
        //                                     Terms and Conditions
        //                                 </Link>
        //                             </li>
        //                             <li className="d-inline-block me-4 text-muted">
        //                                 <Link to="/refund">
        //                                     Refund Policy
        //                                 </Link>
        //                             </li>
        //                             <li className="d-inline-block me-4 text-muted">
        //                                 <Link to="/privacy-policy">
        //                                     Privacy policy
        //                                 </Link>
        //                             </li> 
        //                         </ul>
        //                     </div>
        //                 </Col>
        //             </Row>
        //         </Container>
        //     </footer>
        // </React.Fragment >


        <>

        <SectionTen/>
        </>


    );
};

export default Footer;