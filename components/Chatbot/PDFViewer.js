import React, { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/webpack';
import ViewCitation from '../../../Components/UnflukeMain/Chatbot/ViewCitation';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

// Set the workerSrc to the location of the PDF.js worker
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.js`;

const PdfViewer = ({ pdfUrl, textByPage }) => {
    const canvasRefs = useRef([]);
    const pdfPage = useRef()
    const [citationModalOpen, openCitationModal] = useState(false)
    const [citeText, setCiteText] = useState(null)

    const toggle = () => openCitationModal(!citationModalOpen);

    useEffect(() => {
        const loadPdf = async () => {
            console.log("PDF", pdfUrl)

            const loadingTask = getDocument(pdfUrl);
            const pdf = await loadingTask.promise;

            let i = 0;

            // Render each specified page
            for (let obj of textByPage) {
                const fnPageNo = obj.page_number + 1;

                console.log("HEY", fnPageNo)

                const page = await pdf.getPage(fnPageNo);
                const viewport = page.getViewport({ scale: 1 });

                // Create a new canvas for each page
                const canvas = document.createElement('canvas');
                canvasRefs.current.push(canvas);
                const context = canvas.getContext('2d');

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page into canvas context
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };
                await page.render(renderContext).promise;

                // Highlight text if provided
                if (obj) {
                    const snippet = obj.content
                    const broken = snippet.split(" ")

                    if(broken.length > 0){
                        const sliced = broken.slice(0, 4)

                        for(let snip of sliced){
                            highlightText(page, context, snip, viewport);
                        }
                    }
                }

                // Append the canvas to the DOM
                document.getElementById('pdfContainer').appendChild(canvas);

                i+=1;
            }
        };

        if(pdfUrl) loadPdf();

    }, [pdfUrl, textByPage]);

    const highlightText = async (page, context, text, viewport) => {
        const textContent = await page.getTextContent();
        
        // Loop through each item in text content to find matches
        textContent.items.forEach((item) => {
            if (item.str.includes(text)) {
                const textWidth = item.width * viewport.scale; // width of the text item
                const textHeight = item.height * viewport.scale; // height of the text item

                // Calculate the position to draw the highlight
                const x = item.transform[4]; // x position
                const y = item.transform[5] + textHeight; // y position (y needs adjustment based on baseline)

                // Set the highlight color and draw the rectangle
                context.fillStyle = 'yellow'; // Highlight color
                context.globalAlpha = 0.3
                context.fillRect(x, viewport.height - y, textWidth, textHeight); // Draw the highlight rectangle
            }
        });
    };

    return (
        <>
            <h3 className='mt-2 mb-3'>Highlighted PDF</h3>
            <div id="pdfContainer" style={{ display: 'flex', flexDirection: 'row', gap: '20px', overflowX: "scroll" }} />
            <h3 className='mt-4 mb-3'>Citations</h3>
            {
                textByPage && textByPage.map((text, i)=>
                    text.content !== "" && <>
                        <p key={i}>
                            <a href='' onClick={(e)=>{
                                e.preventDefault();
                                e.stopPropagation();
                            }}>{text.content.slice(0, 100)}</a>...
                        </p>
                    </>
                )
            }
        </>
    );
};

export default PdfViewer;