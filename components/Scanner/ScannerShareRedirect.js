import React from 'react'
import {useLocation} from 'react-router-dom'
import Scanner from '.';
import { Col } from 'reactstrap';

const ScannerShareRedirect = () => {
    document.title = "Unfluke | Scanner";

    const location = useLocation()

    return (
        <>
            <React.Fragment>
                <Col className='ms-5 me-5 mt-2'>
                    {location && <Scanner type={"scanner"} shared={true} />}
                </Col>
            </React.Fragment>
        </>
    )
}

export default ScannerShareRedirect