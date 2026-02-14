import React, { useState } from 'react';
import { Collapse } from 'reactstrap';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import FeatherIcon from 'feather-icons-react';

const CustomToggle = ({ children, targetId, linkClass, isOpen, setIsOpen }) => {
    const toggleCollapse = () => setIsOpen(prevState => ({
        ...prevState,
        [targetId]: !prevState[targetId]
    }));

    return (
        <Link
            to="#"
            className={classNames(linkClass, {
                collapsed: !isOpen[targetId],
            })}
            onClick={toggleCollapse}
        >
            {children}
        </Link>
    );
};

const FeaturesList = ({ item, index }) => {
    const [isOpen, setIsOpen] = useState({});

    return (
        <div className={item.containerClass}>
            <span

                className={classNames(
                    'bx',
                    'avatar',
                    'avatar-sm',
                    'rounded-lg',
                    'icon',
                    'icon-with-bg',
                    'icon-xm',
                    'text-' + item.variant,
                    'me-3',
                    'flex-shrink-0'
                )}
            >
                {/* Use HTML icon or alternative React icon library */}
                <FeatherIcon icon={item.avatar} className={classNames('icon-dual-' + item.variant)} />
                {/* <i className={"bx bx-"+item.avatar}></i> */}
            </span>
            <div className="flex-grow-1">
                <CustomToggle
                    targetId={`toggle-${index}`}
                    linkClass="text-dark h5"
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                >
                    {item.title}
                </CustomToggle>

                    <div>
                        <p className="text-muted mt-1 mb-4">{item.description}</p>
                    </div>
  
            </div>
        </div>
    );
};

export default FeaturesList;
