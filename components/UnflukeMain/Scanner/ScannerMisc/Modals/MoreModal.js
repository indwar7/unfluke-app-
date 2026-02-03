import React from 'react'
import { ListGroup, ListGroupItem, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { moreElements } from '../../../Utils/common_vars';

const MoreModal = ({addElemDblClick, setMoreModalOpen}) => {
    
    const closeBtn = (
        <button className="close" type="button" onClick={()=>{
            setMoreModalOpen(false)
        }}>
            &times;
        </button>
    );

    return (
        <Modal
            isOpen={true}
        >
            <ModalHeader className="modal-title" close={closeBtn}>
                More
            </ModalHeader>
            <ModalBody>
                <div className="list mb-0" flush>
                    <ListGroup className='gap-3' horizontal>
                    {
                        moreElements.map((op, i)=>
                            <div data-id={i} data-indicatorname={op.indicatorName} draggable 
                                onDoubleClick={
                                    (e)=>{
                                        addElemDblClick(e)
                                    }
                                } className='draggable'>
                                <ListGroupItem disabled>
                                    <div className="d-flex align-items-start">
                                        <div className="flex-grow-1 overflow-hidden">
                                            <h5 className="contact-name fs-13 mb-1">{op.indicatorName}</h5>
                                        </div>
                                    </div>
                                </ListGroupItem>
                            </div>
                        )
                    }
                    </ListGroup>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default MoreModal