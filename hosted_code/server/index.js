// const handler = require('./example/pstn_inbound_tts');
const handler = require('./example/pstn_inbound_asr');


/** const {
        generateBEToken,
        generateUserToken,
        logger,
        csClient,
        storageClient
} = nexmo;

generateBEToken, generateUserToken,// those methods can generate a valid token for application
csClient: this is just a wrapper on https://github.com/axios/axios who is already authenticated and it is  automatically logging requests 
logger: this is an integrated logger
storageClient: this is a simple key/value inmemory-storage client 

*/

const rtcEvent = async () => {}

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
        
        // const { username } = req.params;

        // const user = await storageClient.get(`user:${username}`)
        
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

        await Promise.all(deleteUsers)
        res.json({})


    })

}

/**
 * route()
 * 
 */

module.exports = {
    rtcEvent: handler.rtcEvent ? handler.rtcEvent : rtcEvent,
    route: handler.route ? handler.route : route
}