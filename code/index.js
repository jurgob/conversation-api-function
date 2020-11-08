
const axios = require('axios');
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const createCallWithoutVAPI = async (channel, token) => {
    try {

        const convRes = await axios({
            url: "https://api.nexmo.com/beta/conversations",
            method: "post",
            data: {},
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        logger.info("Conversation Created", { data: convRes.data, status: convRes.status })

        const userRes = await axios({
            url: "https://api.nexmo.com/beta/users",
            method: "post",
            data: {},
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        logger.info("User Created", { data: userRes.data, status: userRes.status })

        const conversation_id = convRes.data.id
        const user_id = userRes.data.id

        await sleep(3000)

        const memberRes = await axios({
            url: `https://api.nexmo.com/beta/conversations/${conversation_id}/members`,
            method: "post",
            data: {
                user_id: user_id,
                action: "invite",
                channel: channel
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        logger.info("Member Voice Created", { data: memberRes.data, status: memberRes.status })
    } catch (err) {
        logger.info("Error", { err })
    }
}


const rtcEvent  = async (event, nexmo) => {
    const {
        generateBEToken,
        generateUserToken,
        logger,
        csClient
    } = nexmo;
    
    const type = event.type
    if (type === 'app:knocking') {
        const token = generateBEToken()
        await createCallWithoutVAPI(event.body.channel, token)
    }

}


const route = async (app) => {

    app.post('/subscribe', async (req, res) => {

        const {
            generateBEToken,
            generateUserToken,
            logger,
            csClient,
            storageClient
        } = req.nexmo;


        try {
            const { username } = req.body;
            const resNewUser = await csClient({
                url: "https://api.nexmo.com/beta/users",
                method: "post",
                data: {
                    name: username
                },
            })

            logger.error(" ---- 1 ---- My Log")
            await storageClient.set(`user:${username}`, resNewUser.data.id )
            logger.error(" ---- 2 ---- My Log")
            const storageUser = await storageClient.get(`user:${username}`)
            logger.error(" ---- 3 ---- My Log")

            return res.json({ username, resNewUser: resNewUser.data, storageUser })
        } catch (err){
            console.log(err)
            logger.error({err}, "ERROR")
            throw err;
        }
        
    })

    app.get('/users/:username', async (req, res) => {
        const {
            logger,
            csClient,
            storageClient
        } = req.nexmo;
        
        const { username } = req.params;

        const user = await storageClient.get(`user:${username}`)
        
        logger.error({ user}, "STORAGE")
        res.json({ user })

    })

    app.del('/users', async (req, res) => {
        const {
            generateBEToken,
            generateUserToken,
            logger,
            csClient,
            storageClient
        } = req.nexmo;

        const resUsers = await csClient({
            url: "https://api.nexmo.com/v0.3/users",
            method: "get"
        })
        const deleteUsers = resUsers.data._embedded.users.map(({ id }) => csClient({
            url: `https://api.nexmo.com/v0.3/users/${id}`,
            method: "delete"
        }) )

        return Promise.all(deleteUsers)


    })

}

/**
 * route()
 * 
 */

module.exports = {
    rtcEvent,
    route
}