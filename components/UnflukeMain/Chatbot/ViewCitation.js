import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

function ViewCitation({citeModalOpen, setCiteModalOpen, citeText, citePage}) {

    const canvasRefs = useRef([]);
    const pageContainer = useRef()
    const [children, setChildren] = useState([]);

    const toggle = () => setCiteModalOpen(!citeModalOpen);

    useEffect(()=>{
        const loadPageHighlights = () => {
            const canvasElement = (citePage)
            setChildren([...children, citePage]);
        };

        loadPageHighlights();
    }, [citeModalOpen, citeText, citePage, pageContainer])

    const highlightText = async (context, viewport) => {
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
            <Modal isOpen={citeModalOpen} toggle={toggle}>
                <ModalHeader>Citation</ModalHeader>
                <ModalBody>
                    <div id='pageContainer' className='w-100'>
                        {children}
                    </div>
                </ModalBody>
                <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    Cancel
                </Button>
                </ModalFooter>
            </Modal>
        </>
    );
}

export default ViewCitation;