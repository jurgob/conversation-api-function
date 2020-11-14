import React, { useRef, useEffect } from 'react';

function Audio({ srcObject, ...props }) {
    const refAudio = useRef(null)

    useEffect(() => {
        if (!refAudio.current) return
        refAudio.current.srcObject = srcObject
    }, [srcObject])

    return <audio ref={refAudio} {...props} controls autoPlay />
}

export default Audio