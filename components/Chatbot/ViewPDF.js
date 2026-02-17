import React, { useEffect, useState } from 'react'
import PdfViewer from './PDFViewer'
import { Container, Spinner } from 'reactstrap';
import { object } from 'yup';

const ViewPDF = () => {
    const [url, setUrl] = useState(null);
    const [textByPage, setTextByPage] = useState({});

    useEffect(() => {

        const localStorage = window.localStorage.getItem('source')

        if(localStorage){
            const source = JSON.parse(localStorage)

            if(source){
                setUrl(source["filelink"])
                setTextByPage(source["data"])
            }        
        }

    }, []);

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    {
                        (url && textByPage != {}) ? <PdfViewer pdfUrl={url} textByPage={textByPage} /> :
                        <>
                            <div className='hstack justify-content-center align-items-center mt-5'>
                                <Spinner />
                                <h3 className='ms-3 mt-1'>Loading sources...</h3>
                            </div>
                        </>
                    }
                </Container>
            </div>
        </React.Fragment>
    )
}

export default ViewPDF