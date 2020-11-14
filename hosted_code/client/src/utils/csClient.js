
import axios from 'axios';
// import io from 'socket.io-client';
const socket_io = require('socket.io-client');


// const CAPI_URL = `https://ws-eu-1.nexmo.com`
// const CAPI_URL = `https://ws.nexmo.com`
// const CS_URL = `https://api-eu-1.nexmo.com`

const logger = {
    info: (...args) => {
        console.log(...args)
    },
    error: (...args) => {
        console.error(...args)
    }, 
}


export default async function createCSClient({ token, cs_url, ws_url}){
    // const userData ={
    //     token,
    // }

    let sessionData = {}

    let onEventCallback = () => {}
    let onRequestStartCallback = () => {}
    let onRequestEndCallback = () => { }

    const onEvent = (callback) => {
        onEventCallback = callback
    }
    const onRequestStart = (callback) => {
        onRequestStartCallback = callback
    }

    const onRequestEnd = (callback) => {
        onRequestEndCallback = callback
    }

    const request = async (request) => {
        try {
            request.headers = {
                'Authorization': `Bearer ${token}`,
                // 'x-nexmo-sessionid': session_id
            }
            // request.baseUrl = cs_url
            // cs_url = `https://api.nexmo.com`
            request.url = `${cs_url}${request.url}`
            if(request.data)
                request.data = {
                    originating_session: sessionData.session_id,
                    ...request.data
                }

            logger.info({ request }, "CSClient request -> ")
            onRequestStartCallback({ request})
            const axiosResponse = await axios(request)
            onRequestEndCallback({ 
                request, 
                response: { 
                    data: axiosResponse.data, 
                    status: axiosResponse.status,
                    headers: axiosResponse.headers
                }
            })

            logger.info({ request, data: axiosResponse.data, status: axiosResponse.status }, "CSClient reponse <-")
            return axiosResponse
        } catch (err) {
            const requestError = {
                request: request
            }
            if (err.response) {
                requestError.response = {
                    data: err.response.data,
                    status: err.response.status,
                    headers: err.response.headers,
                }
            }
            if (err.message) {
                requestError.message = err.message
            }

            logger.error({ ...requestError }, "CSClient error <-")
            onRequestEndCallback(requestError)
            throw err;
        }
    }
    // const onEvent = () => 
    const getSessionData = () => sessionData

    return new Promise(resolve => {

        const capi_client = socket_io.connect(ws_url, {
            path: "/rtc",
            transports: ['websocket'],
            forceNew: false,
            reconnection: false,
            autoConnect: true,
        });

        
        require('socketio-wildcard')(socket_io.Manager)(capi_client)

        capi_client.on('connect', function () {

            capi_client.on('*', function (packet) {
                const [type, body] = packet.data;
                const event = { type, body };
                onEventCallback(event)

            })
            const loginData = {
                "device_id": "666666666666666", // TODO: use https://github.com/Valve/fingerprintjs2
                "device_type": "js",
                token
            }

            capi_client.emit("session:login", { body: loginData} )

            capi_client.on("session:success", (event) => {
                const {id, name, user_id} = event.body
                sessionData = {
                    session_id: id,
                    user_name: name,
                    user_id: user_id
                }
                //sessionData
                resolve({
                    request,
                    getSessionData,
                    onEvent,
                    onRequestStart,
                    onRequestEnd
                })

            })
        })


        
    });

    

}