import React, { useEffect, useState, } from 'react';
import { Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';

// Import images
import Bitcoin from "../../../assets/images/svg/crypto-icons/btc.svg";
import Forex from "../../../assets/images/svg/crypto-icons/usdc.svg";
import India from "../../../assets/images/indices/NSE_Logo.svg";
import USA from "../../../assets/images/flags/us.svg";
import dropbox from "../../../assets/images/brands/dropbox.png";
import mail_chimp from "../../../assets/images/brands/mail_chimp.png";
import slack from "../../../assets/images/brands/slack.png";
import { Link } from 'react-router-dom';
import { changeAppType } from '../../../Unfluke_slices/thunks';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { appTypes } from '../constants/layout';
import { get } from "lodash";
import { useNavigate } from 'react-router-dom';

// Countries constants
import countries from '../constants/countries';

const WebAppsDropdown = () => {
    const dispatch = useDispatch();
    const history = useNavigate();
    const [isWebAppDropdown, setIsWebAppDropdown] = useState(false);

    const selectLayoutState = (state) => state.Layout;
    const selectLayoutProperties = createSelector(
        selectLayoutState,
        (layout) => ({
            appType: layout.appType
        })
    );
    const { appType } = useSelector(selectLayoutProperties);

    const toggleWebAppDropdown = () => {
        setIsWebAppDropdown(!isWebAppDropdown);
    };

    const handleAppTypeChange = (newAppType) => {
        dispatch(changeAppType(newAppType));
        setIsWebAppDropdown(false); // Collapse dropdown after selection
    };

    useEffect(() => {
        // setting theme for different apps
        localStorage.setItem("mkt", appType);
        if (appType === appTypes.IND) {
            document.documentElement.style.setProperty('--vz-header-bg', '#9e6231');
            document.documentElement.style.setProperty('--vz-header-border', '#9e6231');
            document.documentElement.style.setProperty('--vz-header-item-color', '#9e6231');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#9e6231');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#9e6231');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#9e6231');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#9e6231');
        } else if (appType === appTypes.CRYPTO) {
            document.documentElement.style.setProperty('--vz-header-bg', '#ff69b4');
            document.documentElement.style.setProperty('--vz-header-border', '#ff69b4');
            document.documentElement.style.setProperty('--vz-header-item-color', '#ff69b4');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#ff69b4');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#ff69b4');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#ff69b4');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#ff69b4');
        } else if (appType === appTypes.USA) {
            document.documentElement.style.setProperty('--vz-header-bg', '#337ab7');
            document.documentElement.style.setProperty('--vz-header-border', '#337ab7');
            document.documentElement.style.setProperty('--vz-header-item-color', '#337ab7');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#337ab7');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#337ab7');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#337ab7');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#337ab7');
        } else if (appType === appTypes.FOREX) {
            document.documentElement.style.setProperty('--vz-header-bg', '#e67e73');
            document.documentElement.style.setProperty('--vz-header-border', '#e67e73');
            document.documentElement.style.setProperty('--vz-header-item-color', '#e67e73');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#e67e73');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#e67e73');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#e67e73');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#e67e73');
        } else if (appType === appTypes.AUSTRIA) {
            document.documentElement.style.setProperty('--vz-header-bg', '#f39c12');
            document.documentElement.style.setProperty('--vz-header-border', '#f39c12');
            document.documentElement.style.setProperty('--vz-header-item-color', '#f39c12');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#f39c12');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#f39c12');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#f39c12');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#f39c12');
        } else if (appType === appTypes.BELGIUM) {
            document.documentElement.style.setProperty('--vz-header-bg', '#d35400');
            document.documentElement.style.setProperty('--vz-header-border', '#d35400');
            document.documentElement.style.setProperty('--vz-header-item-color', '#d35400');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#d35400');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#d35400');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#d35400');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#d35400');
        } else if (appType === appTypes.DENMARK) {
            document.documentElement.style.setProperty('--vz-header-bg', '#c0392b');
            document.documentElement.style.setProperty('--vz-header-border', '#c0392b');
            document.documentElement.style.setProperty('--vz-header-item-color', '#c0392b');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#c0392b');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#c0392b');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#c0392b');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#c0392b');
        } else if (appType === appTypes.FINLAND) {
            document.documentElement.style.setProperty('--vz-header-bg', '#2980b9');
            document.documentElement.style.setProperty('--vz-header-border', '#2980b9');
            document.documentElement.style.setProperty('--vz-header-item-color', '#2980b9');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#2980b9');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#2980b9');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#2980b9');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#2980b9');
        } else if (appType === appTypes.FRANCE) {
            document.documentElement.style.setProperty('--vz-header-bg', '#8e44ad');
            document.documentElement.style.setProperty('--vz-header-border', '#8e44ad');
            document.documentElement.style.setProperty('--vz-header-item-color', '#8e44ad');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#8e44ad');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#8e44ad');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#8e44ad');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#8e44ad');
        } else if (appType === appTypes.GERMANY) {
            document.documentElement.style.setProperty('--vz-header-bg', '#27ae60');
            document.documentElement.style.setProperty('--vz-header-border', '#27ae60');
            document.documentElement.style.setProperty('--vz-header-item-color', '#27ae60');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#27ae60');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#27ae60');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#27ae60');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#27ae60');
        } else if (appType === appTypes.HONGKONG) {
            document.documentElement.style.setProperty('--vz-header-bg', '#e74c3c');
            document.documentElement.style.setProperty('--vz-header-border', '#e74c3c');
            document.documentElement.style.setProperty('--vz-header-item-color', '#e74c3c');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#e74c3c');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#e74c3c');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#e74c3c');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#e74c3c');
        } else if (appType === appTypes.IRELAND) {
            document.documentElement.style.setProperty('--vz-header-bg', '#2ecc71');
            document.documentElement.style.setProperty('--vz-header-border', '#2ecc71');
            document.documentElement.style.setProperty('--vz-header-item-color', '#2ecc71');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#2ecc71');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#2ecc71');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#2ecc71');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#2ecc71');
        } else if (appType === appTypes.ITALY) {
            document.documentElement.style.setProperty('--vz-header-bg', '#3498db');
            document.documentElement.style.setProperty('--vz-header-border', '#3498db');
            document.documentElement.style.setProperty('--vz-header-item-color', '#3498db');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#3498db');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#3498db');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#3498db');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#3498db');
        } else if (appType === appTypes.JAPAN) {
            document.documentElement.style.setProperty('--vz-header-bg', '#9b59b6');
            document.documentElement.style.setProperty('--vz-header-border', '#9b59b6');
            document.documentElement.style.setProperty('--vz-header-item-color', '#9b59b6');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#9b59b6');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#9b59b6');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#9b59b6');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#9b59b6');
        } else if (appType === appTypes.MEXICO) {
            document.documentElement.style.setProperty('--vz-header-bg', '#f1c40f');
            document.documentElement.style.setProperty('--vz-header-border', '#f1c40f');
            document.documentElement.style.setProperty('--vz-header-item-color', '#f1c40f');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#f1c40f');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#f1c40f');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#f1c40f');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#f1c40f');
        } else if (appType === appTypes.NETHERLANDS) {
            document.documentElement.style.setProperty('--vz-header-bg', '#e67e22');
            document.documentElement.style.setProperty('--vz-header-border', '#e67e22');
            document.documentElement.style.setProperty('--vz-header-item-color', '#e67e22');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#e67e22');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#e67e22');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#e67e22');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#e67e22');
        } else if (appType === appTypes.NORWAY) {
            document.documentElement.style.setProperty('--vz-header-bg', '#16a085');
            document.documentElement.style.setProperty('--vz-header-border', '#16a085');
            document.documentElement.style.setProperty('--vz-header-item-color', '#16a085');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#16a085');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#16a085');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#16a085');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#16a085');
        } else if (appType === appTypes.PORTUGAL) {
            document.documentElement.style.setProperty('--vz-header-bg', '#f39c12');
            document.documentElement.style.setProperty('--vz-header-border', '#f39c12');
            document.documentElement.style.setProperty('--vz-header-item-color', '#f39c12');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#f39c12');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#f39c12');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#f39c12');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#f39c12');
        } else if (appType === appTypes.SPAIN) {
            document.documentElement.style.setProperty('--vz-header-bg', '#e74c3c');
            document.documentElement.style.setProperty('--vz-header-border', '#e74c3c');
            document.documentElement.style.setProperty('--vz-header-item-color', '#e74c3c');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#e74c3c');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#e74c3c');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#e74c3c');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#e74c3c');
        } else if (appType === appTypes.SWEDEN) {
            document.documentElement.style.setProperty('--vz-header-bg', '#3498db');
            document.documentElement.style.setProperty('--vz-header-border', '#3498db');
            document.documentElement.style.setProperty('--vz-header-item-color', '#3498db');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#3498db');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#3498db');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#3498db');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#3498db');
        } else if (appType === appTypes.SWITZERLAND) {
            document.documentElement.style.setProperty('--vz-header-bg', '#8e44ad');
            document.documentElement.style.setProperty('--vz-header-border', '#8e44ad');
            document.documentElement.style.setProperty('--vz-header-item-color', '#8e44ad');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#8e44ad');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#8e44ad');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#8e44ad');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#8e44ad');
        } else if (appType === appTypes.UK) {
            document.documentElement.style.setProperty('--vz-header-bg', '#99567b');
            document.documentElement.style.setProperty('--vz-header-border', '#99567b');
            document.documentElement.style.setProperty('--vz-header-item-color', '#99567b');
            document.documentElement.style.setProperty('--vz-header-item-bg', '#99567b');
            document.documentElement.style.setProperty('--vz-header-item-sub-color', '#ffffff');
            document.documentElement.style.setProperty('--vz-topbar-search-bg', '#99567b');
            document.documentElement.style.setProperty('--vz-topbar-user-bg', '#99567b');
            document.documentElement.style.setProperty('--vz-topbar-search-color', '#99567b');
        }
        // goto /{appType}/dashboard
        history(`/${appType}/dashboard`);
    }, [appType]);

    return (
        <React.Fragment>
            <Dropdown isOpen={isWebAppDropdown} toggle={toggleWebAppDropdown} className="topbar-head-dropdown ms-1 header-item">
                <DropdownToggle tag="button" type="button" className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle">
                    <img
                        src={get(countries, `${appType}.flag`)}
                        alt="Header Language"
                        height="20"
                        className="rounded"
                    />

                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-lg p-0 dropdown-menu-end">
                    <div className="p-3 border-top-0 border-start-0 border-end-0 border-dashed border">
                        <Row className="align-items-center">
                            <Col>
                                <h6 className="m-0 fw-semibold fs-15">Select Market Apps </h6>
                            </Col>
                        </Row>
                    </div>

                    {Object.keys(countries).map(key => (
                        // <Link to={`/${key}/dashboard`}>
                            <DropdownItem
                                key={key}
                                onClick={() => handleAppTypeChange(key)}
                                className={`notify-item ${appType === key ? "active" : "none"
                                    }`}
                            >
                                <img
                                    src={get(countries, `${key}.flag`)}
                                    alt="Skote"
                                    className="me-2 rounded"
                                    height="18"
                                />
                                <span className="align-middle">
                                    {get(countries, `${key}.label`)}
                                </span>
                            </DropdownItem>
                        // </Link>
                    ))}
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
};

export default WebAppsDropdown;
