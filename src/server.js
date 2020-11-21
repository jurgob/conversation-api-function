const express = require('express');
const dotenv = require('dotenv');
const bunyan = require('bunyan');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const logger = bunyan.createLogger({ name: 'conversation-api-function' });
const path = require('path');
const { base64encode } = require('nodejs-base64');
const {generateBEToken,generateUserToken,getStaticConfig} = require('./utils');
var cors = require('cors');

//const redis = require("redis");
const StorageClient = require('./storageClient');
const storageClient = new StorageClient();

// const conversationApiFunctionModule = require('../hosted_code/server');

const bodyParser = require('body-parser');


function createExpressApp(config, conversationApiFunctionModule) {

  
  const app = express()
  app.use(bodyParser.json())
  app.use(cors())


  app.use((req, res, next) => {
    const { query, baseUrl, originalUrl, url, method, statusCode, body } = req

    const csClient = async (request) => {
      try {
        const token = generateBEToken({ config});
        request.headers = {
          'Authorization': `Bearer ${token}`
        }
        logger.info({request}, "CSClient request -> ")
        const axiosResponse = await axios(request)
        logger.info({ request, data: axiosResponse.data ,status: axiosResponse.status   }, "CSClient reponse <-")
        return axiosResponse
      }catch(err) {
        const requestError = {
          request: request
        }
        if (err.response){
          requestError.response = {
            data: err.response.data,
            status: err.response.status,
            status: err.response.headers,
          }
        } 
        if (err.message) {
          requestError.message = err.message
        }

        logger.error({ ...requestError }, "CSClient error <-")
        throw err;
      }
    } 
    req.nexmo = {
      generateBEToken: () => generateBEToken({config}), 
      generateUserToken: (username) => generateUserToken({ config, user_name: username }),
      logger,
      csClient,
      storageClient
    }
    next()
  })
  
  conversationApiFunctionModule.route(app)

  app.get('/ping', (req, res) => res.json({ success: true}))
  app.post('/voiceEvent', (req, res) => res.json({ body: req.body }))
  app.post('/rtcEvent', async (req, res) => {
    const { query, baseUrl, originalUrl, url, method, statusCode, body } = req
    
    logger.info({ query, baseUrl, originalUrl, url, method, statusCode, body }, "RTC Event Received <-")
    res.json({ body: req.body })

    const event = req.body
    await conversationApiFunctionModule.rtcEvent(event, req.nexmo)
  })

  return app;
}



async function localDevSetup ({ config }) {
  const { port, application_id, application_name, nexmo_account,isDev, server_url } = config;

  // if(!isDev)
  // return Promise.resolve({
  //   config
  // });

  const ngrok = require('ngrok');
  const {api_key, api_secret } = nexmo_account;
  const dev_api_token = base64encode(`${api_key}:${api_secret}`)
  logger.info("start application registration")
  
  let webhooks_url = server_url 

  if (!server_url){
    webhooks_url = await ngrok.connect(port)
    logger.info("ngrok spinned up locally", { ngrok_url: webhooks_url })
  } else {
    webhooks_url = server_url
  }

  const { data, status } =  await axios({
    method: "PUT",
    url: `https://api.nexmo.com/v2/applications/${application_id}`,
    data: {
      "name": application_name,
      "capabilities": {
        // "voice": {
        //   "webhooks": {
        //     "answer_url": {
        //       "address": `${ngrok_url}/ncco`,
        //       "http_method": "GET"
        //     },
        //     "event_url": {
        //       "address": `${ngrok_url}/voiceEvent`,
        //       "http_method": "POST"
        //     }
        //   }
        // },
        "rtc": {
          "webhooks": {
            "event_url": {
              "address": `${webhooks_url}/rtcEvent`,
              "http_method": "POST"
            }
          }
        }
      }
    },
    headers: { 'Authorization': `basic ${dev_api_token}` }
  })
  
  logger.info("localDevSetup App Registration*", { data, status, capabilities: data.capabilities })
      
  return {
    config: {
      ...config,
      server_url: webhooks_url
    }
  }
}


function checkEnvVars(){
  const isDev = !process.env.NODE_ENV
  if(isDev)
    dotenv.config();

  let mandatoryEnvs = ["CONV_API_FUNC_PRIVATE_KEY", "CONV_API_FUNC_APPLICATION_ID", "CONV_API_FUNC_APPLICATION_NAME", "CONV_API_FUNC_API_KEY"]
  // if(isDev)
  mandatoryEnvs = mandatoryEnvs.concat(["CONV_API_FUNC_API_KEY", "CONV_API_FUNC_API_SECRET"])


  const getEmpty = (acc, cur) => {
    if(!process.env[cur]) {
      return [...acc, cur]
    } else {
      return acc
    }
  }
  const emptyEnvs = mandatoryEnvs
  .reduce(getEmpty, [])


  return emptyEnvs


}


function listenServer({ app, config }) {
  const { port } = config;
  return new Promise((resolve) => {
    return app.listen(port, () => resolve({ config }))
  })
}

//
async function bindLvnToApp({phone_number, application_id, api_key, api_secret}){
  //`msisdn=${phone_number}&voiceCallbackValue=${application_id}&api_key=${api_key}&api_secret=${api_secret}`
  const reqData = `country=GB&msisdn=${phone_number}&moHttpUrl=&voiceCallbackType=app&voiceCallbackValue=${application_id}&api_key=${api_key}&api_secret=${api_secret}`
  const {data, status } = await axios({
        method: "POST",
        url: `https://rest.nexmo.com/number/update`,
        data: reqData,
        headers: { 'Content-Type': `application/x-www-form-urlencoded` }
      })
      .catch(err => {
        logger.error({ err }, "LVN to Application bind failed")
        throw err;
      })

  logger.info({ data, status })
}

function startServer(conversationApiFunctionModule) {
  dotenv.config();

  const emptyEnvs = checkEnvVars();
  if (emptyEnvs.length) {
    logger.error(`you need to configure the following vars`, emptyEnvs)
    return Promise.reject(`you need to configure the following vars`, emptyEnvs)
  }

  const staticConfig = getStaticConfig(process.env)
  const {phone_number, application_id, nexmo_account} = staticConfig;
  const {api_key, api_secret} = nexmo_account;
  return Promise.resolve()
    .then(() => bindLvnToApp({phone_number, application_id, api_key, api_secret}))
    .then(() => localDevSetup({ config: staticConfig }))
    .then(({ config }) => {
      const app = createExpressApp(config, conversationApiFunctionModule)
      return { config, app }
    })
    .then(({ app, config }) => listenServer({ app, config }))
    .then(({ config }) => {
      const { port } = config;
      logger.info(`config`, config)
      logger.info(`Example app listening on port ${port}!`)
    })
}

module.exports = startServer
// startServer(conversationApiFunctionModule)
