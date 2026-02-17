import React, { useState, useEffect } from "react";
import { Collapse, Container, NavbarToggler, NavLink } from "reactstrap";
import Scrollspy from "react-scrollspy";
import { Link } from "react-router-dom";
import "./nav.css"

// Import Images
import logodark from "../../../assets/images/unfluke/UNFLUKE -01.png";
import logolight from "../../../assets/images/unfluke/UNFLUKE -05.png";

const Navbar = () => {
    const [isOpenMenu, setisOpenMenu] = useState(false);
    const [navClass, setnavClass] = useState("");

    const toggle = () => setisOpenMenu(!isOpenMenu);

    useEffect(() => {
        window.addEventListener("scroll", scrollNavigation, true);
    });

    const scrollNavigation = () => {
        var scrollup = document.documentElement.scrollTop;
        if (scrollup > 50) {
            setnavClass("is-sticky");
        } else {
            setnavClass("");
        }
    }

    const [activeLink, setActiveLink] = useState();
    useEffect(() => {
        const activation = (event) => {
            const target = event.target;
            if (target) {
                target.classList.add('active');
                setActiveLink(target);
                if (activeLink && activeLink !== target) {
                    activeLink.classList.remove('active');
                }
            }
        };
        const defaultLink = document.querySelector('.navbar li.a.active');
        if (defaultLink) {
            defaultLink?.classList.add("active")
            setActiveLink(defaultLink)
        }
        const links = document.querySelectorAll('.navbar a');
        links.forEach((link) => {
            link.addEventListener('click', activation);
        });
        return () => {
            links.forEach((link) => {
                link.removeEventListener('click', activation);
            });
        };
    }, [activeLink]);

    return (
        <React.Fragment>
            <nav className={"navbar navbar-expand-lg navbar-landing fixed-top justify-content-end " + navClass} id="navbar">
                <Container>
                    <Link className="navbar-brand" to="/">
                        <img src={logodark} className="card-logo nav-img-height card-logo-dark" alt="logo dark" />
                        <img src={logolight} className="card-logo nav-img-height card-logo-light" alt="logo light" />
                    </Link>

                    <NavbarToggler className="navbar-toggler py-0 fs-20 text-body" onClick={toggle} type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <i className="mdi mdi-menu"></i>
                    </NavbarToggler>

                    <Collapse
                        isOpen={isOpenMenu}
                        className="navbar-collapse justify-content-end"
                        id="navbarSupportedContent"
                    >
                        <Scrollspy
                            offset={-18}
                            items={[
                                "hero",
                                "features",
                                "services",
                                "plans",
                                "faq",
                                "team",
                                "contact",
                            ]}
                            currentClassName="active"
                            className="navbar-nav mx-auto mt-2 mt-lg-0"
                            id="navbar-example"
                        >
                            <li className="nav-item" onClick={toggle}>
                                 <Link className="nav-link" to="/#hero">Home</Link>
                            </li>
                            <li className="nav-item" onClick={toggle}>
                                 <Link className="nav-link" to="/#services">Features</Link>
                            </li>
                            <li className="nav-item" onClick={toggle}>
                                 <Link className="nav-link" to="/#features">Services</Link>
                            </li>
                            <li className="nav-item" onClick={toggle}>
                                 <Link className="nav-link" to="/#plans">Plans</Link>
                            </li>
                            <li className="nav-item" onClick={toggle}>
                                 <Link className="nav-link" to="/#faq">FAQ</Link>
                            </li>
                            <li className="nav-item" onClick={toggle}>
                                 <Link className="nav-link" to="/#team">Team</Link>
                            </li>
                            <li className="nav-item" onClick={toggle}>
                                 <Link className="nav-link" to="/#contact">Contact</Link>
                            </li>
                            <li className="nav-item" onClick={toggle}>
                              <Link className="nav-link" to="/test-my-strategy">BacktestMyStrategy</Link>
                            </li>
                        </Scrollspy>

                        <div className="">
                            <Link to="/login" className="btn btn-outline-danger fw-medium text-decoration-none text-body mx-1">Sign
                                in</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                        </div>
                    </Collapse>
                </Container>
            </nav>
        </React.Fragment>
    );
};

export default Navbar;
