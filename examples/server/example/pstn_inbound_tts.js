
/** we use cs in europe as far as the LVN is in UK */
const DATACENTER = `https://api-eu-1.nexmo.com`
//const DATACENTER = `https://api.nexmo.com`

/**
 * Explaination
 * 1 <- someone is calling your LVN   -> you receive an app:knocking event. cs has already created a leg and a user.
 * 2    -> you create a conversation (and so a mixer) for the call -> POST /conversations
 * 3    -> you create a member for that conversation with the using the user and the leg of the knocker. -> POST /conversation/:cid/members {user_id, knocking_id , channel.id
 * 4 <- the leg is succesfully transfered in the conversation -> you receve member:media with body.media.audio == true
 * 5    -> you send a talk action to the leg
 * 6    -> then you close the call (TODO: you should execute this when you receive a talk:done )
 */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const pstnTextToSpeech = async (event, { logger, csClient, storageClient }) => {
    try {
        const type = event.type
        if (type === 'app:knocking') {

            const knocking_id = event.from
            const knockerAlreadyProgress = await storageClient.get(`knocker:${knocking_id}`)
            if (knockerAlreadyProgress !== null) {
                logger.error({ knocking_id }, "Knoking not processed, already in progress")
                return true
            }


            await storageClient.set(`knocker:${knocking_id}`, knocking_id)
            // const user = await storageClient.get(`user:${username}`)
            const channel = event.body.channel
            const convRes = await csClient({
                url: `${DATACENTER}/beta/conversations`,
                method: "post",
                data: {},
            })

            const conversation_id = convRes.data.id
            const user_id = event.body.user.id

            await sleep(000)

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
        } else if (type === 'member:media' && (event.body.media && event.body.media.audio === true ) ) {
            const legId = event.body.channel.id
            
            await sleep(1000)
            
            await csClient({
                url: `${DATACENTER}/v0.1/legs/${legId}/talk`,
                method: "put",
                data: { "loop": 1, "text": "Hello World! ", "level": 0, "voice_name": "Kimberly" },
            })

            await sleep(1000)

            await csClient({
                url: `${DATACENTER}/v0.1/legs/${legId}`,
                method: "put",
                data: { "action": "hangup", "uuid": legId }
            })

        } else if (type === 'audio:say:done') { /* the text to speech is finished */

        }


    } catch (err) {
        logger.error("Error on pstnTextToSpeech", err)
    }
}


module.exports = {
    rtcEvent: pstnTextToSpeech
}