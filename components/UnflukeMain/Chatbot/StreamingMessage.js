import React, { useEffect, useRef, useState } from 'react'

const StreamingMessage = ({socket}) => {

    const [currMessage, setCurrMessage] = useState("")

    useEffect(()=>{
        socket.on('response', (token) => {
            setCurrMessage((prev) => prev + token)
            console.log(currMessage)
        });

        return () => {
            socket.off('response');
        };
    })

    useEffect(()=>{
        socket.on('docs', (data) => {
            console.log("DOCS DATA", data)
        })

        socket.on('stream_complete', () => {
        });

        return () => {
            socket.off('docs');
            socket.off('stream_complete');
        };
    }, [])

    return (
        <div>
            StreamingMessage
            {currMessage}
        </div>
    )
}

export default StreamingMessage