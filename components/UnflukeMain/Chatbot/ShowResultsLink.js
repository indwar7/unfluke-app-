import React, { useState } from 'react'

const ShowResultsLink = ({title, link, clickAction}) => {
    return (
        <>
            <a href="#" onClick={(e) => { 
                e.preventDefault();
                window.open(link, "_blank")
            }}>
                {title}
            </a>
        </>
    )
}

export default ShowResultsLink