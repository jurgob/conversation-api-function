
import axios from 'axios';
// import io from 'socket.io-client';
const socket_io = require('socket.io-client');
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}


const logger = {
    info: (...args) => {
        console.log(...args)
    },
    error: (...args) => {
        console.error(...args)
    }, 
}


export default function CSClient(){
    let sessionData = {}
    let onEventCallbacks = []
    let onRequestStartCallbacks = []
    let onRequestEndCallbacks = []

    const onEvent = (callback) => {
        const id = uuidv4()
        onEventCallbacks.push({
            id,
            callback
        }) 
        return id
    }
    const onRequestStart = (callback) => {
        const id = uuidv4()
        onRequestStartCallbacks.push({
            id,
            callback
        })
        return id
    }

    const onRequestEnd = (callback) => {
        const id = uuidv4()
        onRequestEndCallbacks.push({
            id,
            callback
        })
        return id
    }

    const request = async (request) => {
        const { token, session_id, cs_url} = sessionData
        try {
            request.headers = {
                'Authorization': `Bearer ${token}`,
                // 'x-nexmo-sessionid': session_id
            }
            
            request.url = `${cs_url}${request.url}`
            if(request.data)
                request.data = {
                    originating_session: session_id,
                    ...request.data
                }

            logger.info({ request }, "CSClient request -> ")
            onRequestStartCallbacks
                .forEach(({ callback }) => callback({ request }))
            const axiosResponse = await axios(request)
            onRequestEndCallbacks
                .forEach(({ callback }) => callback({
                    request,
                    response: {
                        data: axiosResponse.data,
                        status: axiosResponse.status,
                        headers: axiosResponse.headers
                    }
                }))

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
            onRequestEndCallbacks
                .forEach(({ callback }) => callback(requestError))

            throw err;
        }
    }
    // const onEvent = () => 
    const getSessionData = () => sessionData

    const connect = async ({ token, cs_url, ws_url }) =>  new Promise(resolve => {

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
                const event = { type, ...body };
                // onEventCallback(event)
                onEventCallbacks
                    .forEach(({callback}) => callback(event) )

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
                    user_id: user_id,
                    token,
                    cs_url, 
                    ws_url

                }
                resolve()

            })
        })


        
    });

    
    return {
        connect,
        request,
        getSessionData,
        onEvent,
        onRequestStart,
        onRequestEnd
    }

}