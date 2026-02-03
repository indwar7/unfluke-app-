import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';


const LoadingModal = ({title, description}) => {
    return (
        <Modal
            isOpen={true}
            backdrop={'static'}
            id="staticBackdrop"
            centered
        >
            <ModalBody className="text-center p-5">
                <lord-icon
                    src="https://cdn.lordicon.com/qvyppzqz.json"
                    trigger="loop"
                    colors="primary:#121331,secondary:#08a88a"
                    style={{ width: "120px", height: "120px" }}>
                </lord-icon>

                <div className="mt-4">
                    <h4 className="mb-3">{title}</h4>
                    <p className="text-muted mb-4">{description}</p>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default LoadingModal