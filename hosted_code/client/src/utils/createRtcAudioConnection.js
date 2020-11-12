function createRtcAudioConnection() {
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
                    credential: 'bar',
                    username: 'foo2',
                },
            ]
            // const iceServers = [
            //   {
            //     urls: 'stun:stun.l.google.com:19302'
            //   }
            // ]

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