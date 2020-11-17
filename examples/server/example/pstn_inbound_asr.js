
/** we use cs in europe as far as the LVN is in UK */
//const DATACENTER = `https://api.nexmo.com`
const DATACENTER = `https://api-eu-1.nexmo.com`


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const pstnTextToSpeech = async (event, { logger, csClient, storageClient, generateBEToken }) => {
    try {
        const type = event.type
        const legId = event.body.channel && event.body.channel.id

        const isAsrInProgress = await storageClient.get(`leg_asr:${legId}`)

        logger.info(`leg_asr:${legId} - isAsrInProgress: ${isAsrInProgress} : ${typeof isAsrInProgress }  - event-type: ${type} ` ) 

        if (type === 'app:knocking') {
            logger.info("STEP 1, establish the call")
            const knocking_id = event.from

            // const user = await storageClient.get(`user:${username}`)
            const channel = event.body.channel
            const convRes = await csClient({
                url: `${DATACENTER}/beta/conversations`,
                method: "post",
                data: {},
            })

            // await axios({
            //     url: `${DATACENTER}/beta/conversations`,
            //     method: "post",
            //     data: {},
            //     headers: {
            //         "Authorizaion": `Bearer ${generateBEToken()}`
            //     }
            // })

            

            // const convRes = await csClient({
            //     url: `${DATACENTER}/v0.1/messages`,
            //     method: "post",
            //     data: {},
            // })

            const conversation_id = convRes.data.id
            const user_id = event.body.user.id

            await sleep(1000)

            const memberRes = await csClient({
                url: `${DATACENTER}/beta/conversations/${conversation_id}/members`,
                method: "post",
                data: {
                    user_id: user_id,
                    knocking_id: knocking_id,
                    action: "join",
                    channel: {
                        type: channel.type,
                        id: channel.id,
                        to: channel.to,
                        from: channel.from,
                        "preanswer": false
                    },
                    "media": {
                        "audio": {
                            "earmuffed": false,
                            "muted": false
                        }
                    }

                }
            })
        } else if (type === 'member:media' && (event.body.media && event.body.media.audio === true)) {
            logger.info("STEP 2, ask customer to say some random number")
            await sleep(1000)

            await csClient({
                url: `${DATACENTER}/v0.1/legs/${legId}/talk`,
                method: "put",
                data: { "loop": 1, "text": "Hello, please say some random number  ", "level": 0, "voice_name": "Kimberly" },
            })

        } else if (type === 'audio:say:done' && isAsrInProgress !== "inprogress") {
            logger.info("STEP 3, transcribing what the customer is saying")
            await storageClient.set(`leg_asr:${legId}`, "inprogress")
            await csClient({
                url: `${DATACENTER}/v0.1/legs/${legId}/asr`,
                method: "put",
                data: {
                    "active": true,
                    "language": "en-gb",
                    "end_on_silence_timeout": 1,
                    "start_timeout": 4,
                    "speech_context": ["1", "one", "2", "two", "3", "three", "4", "four", "5", "five", "6", "six", "7", "seven", "8", "eight", "9", "nine", "0", "star"],
                    "max_duration": 5
                },
            })
        
        } else if (type === 'audio:asr:done' ) {
            logger.info("STEP 4, repeat what the customer sait ")
            const asrResult = event.body.asr.results && event.body.asr.results[0]
            
            if (asrResult){
                await csClient({
                    url: `${DATACENTER}/v0.1/legs/${legId}/talk`,
                    method: "put",
                    data: { "loop": 1, "text": `you have just said: ${asrResult.word} `, "level": 0, "voice_name": "Kimberly" },
                })
            }

        } else if (type === 'audio:say:done' && isAsrInProgress === "inprogress" ){
            logger.info("STEP 5, hangup the call")
            await csClient({
                url: `${DATACENTER}/v0.1/legs/${legId}`,
                method: "put",
                data: { "action": "hangup", "uuid": legId }
            })
        }


    } catch (err) {
        logger.error("Error on pstnTextToSpeech", err)
    }
}


module.exports = {
    rtcEvent: pstnTextToSpeech
}