
const waitFirstICEGatheringComplete = async (peerConnection) => {
    return new Promise((resolve, reject) => {
        peerConnection.onicegatheringstatechange = () => {
            console.log("onicegatheringstatechange ", peerConnection.iceGatheringState);
            if (peerConnection.iceGatheringState === 'complete') {
                resolve()
            }
        }
    })

}


const createRtcAudioConnection = async() => {
    const localStream = await navigator.mediaDevices
        .getUserMedia({
            video: false,
            audio: true,
        })
    
    const peerConnection = new RTCPeerConnection(
        {
            iceServers: [
                { urls: "stun:stun.l.google.com:19302", }
            ],
            'iceTransportPolicy': 'all',
            'bundlePolicy': 'balanced',
            'rtcpMuxPolicy': 'require',
            'iceCandidatePoolSize': '0',
        }, 
        {
            optional: [{
                'DtlsSrtpKeyAgreement': 'true',
            }],
        }
    );    

    peerConnection.addStream(localStream)
    
    const offerDescription = await peerConnection.createOffer()
    
    peerConnection.setLocalDescription(offerDescription)
    
    await waitFirstICEGatheringComplete(peerConnection)

    return peerConnection

}


function _createRtcAudioConnection(){
    return navigator.mediaDevices
        .getUserMedia({
            video: false,
            audio: true,
        })
        .then((localStream) => {
            console.log("RTCPeerConnection init", localStream)
            const iceServers = [
                {
                    urls: "stun:stun.l.google.com:19302",
                    // urls: 'turn:138.68.169.35:3478?transport=tcp',
                    // credential: 'bar',
                    // username: 'foo2',
                },
            ]

            var pc = new RTCPeerConnection({
                iceServers,
                'iceTransportPolicy': 'all',
                'bundlePolicy': 'balanced',
                'rtcpMuxPolicy': 'require',
                'iceCandidatePoolSize': '0',
            }, {
                optional: [{
                    'DtlsSrtpKeyAgreement': 'true',
                }],
            });

            pc.addStream(localStream)

            return pc
        })
        .then((pc) => {
            console.log("create offer init")
            return pc.createOffer()
                .then(offerDescription => pc.setLocalDescription(offerDescription))
                .then(() => pc)
        })
        .then((pc) => {
            console.log("onicegatheringstatechange init")
            return new Promise((resolve, reject) => {
                pc.onicegatheringstatechange = () => {
                    console.log("onicegatheringstatechange ", pc.iceGatheringState);
                    if (pc.iceGatheringState === 'complete') {
                        resolve(pc)
                    }
                }
            })
        })
}

export default createRtcAudioConnection