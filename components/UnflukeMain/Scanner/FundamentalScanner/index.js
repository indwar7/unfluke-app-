import React, { useState } from 'react'
import { Button, Col, Row } from 'reactstrap'
import IndicatorList from '../IndicatorList'
import ScannerFilters from '../ScannerFilters'
import ScannerMisc from '../ScannerMisc'
import ScannerExpression from '../ScannerExpression'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const FundamentalScanner = () => {

    const auth = useSelector((store) => store.Login);
    const scannerState = useSelector((store) => store.Scanner);

    const dispatch = useDispatch()
    const location = useLocation()
    const navigate = useNavigate()

    const [expression, setExpression] = useState([])
    const [indicators, setIndicators] = useState([])
    const [indicatorModalOpen, setIndicatorModalOpen] = useState(false)
    const [numberModalOpen, setNumberModalOpen] = useState(false)
    const [ltpModalOpen, setLTPModalOpen] = useState(false)
    const [offsetModalOpen, setOffsetModalOpen] = useState(false)

    const [lastElem, setLastElem] = useState({})

    const [lastElemCoords, setLastElemCoords] = useState({
        x: 0,
        y: 0
    })

    const [scannerResults, setScannerResults] = useState([])

    const [link, setLink] = useState("")
    const [loading, isLoading] = useState(false)

    return (
        <>
            <Row className='mt-3'>
                <Col md={3} className='mb-3'>
                    <IndicatorList indicators={indicators} />
                </Col>
                <Col md={5} className='mb-3'>
                    <ScannerFilters scannerState={scannerState} type={"scanner"} />
                </Col>
                <Col md={4} className='mb-3'>
                    <ScannerMisc />
                </Col>
            </Row>

            <Row>
                <div>
                    <ScannerExpression expression={expression} />
                </div>
            </Row>

            <Row className='mb-3'>
                <Col>
                    <Button className='w-100'>Submit</Button>
                </Col>
            </Row>
        </>
    )
}

export default FundamentalScanner