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


// const conversationApiFunctionModule = require('../hosted_code/server');

const bodyParser = require('body-parser');

const handlerCapabilitiesConfig = {
  rtcEvent: { group: "rtc", name: "event_url" },
  voiceAnswer: { group: "voice", name: "answer_url" },
  voiceEvent: { group: "voice", name: "event_url" },
  messagesInbound: { group: "messages", name: "inbound_url" },
  messagesStatus: { group: "messages", name: "status_url" }
}

const webhookUrlPrefix = 'webhook'


function createExpressApp(config, conversationApiFunctionModule) {

  
  const app = express()
  app.use(bodyParser.json())
  app.use(cors())
  const {application_id, redis_url} = config
  const storageClient = new StorageClient({ application_id, redis_url});

  app.use((req, res, next) => {
    const { query, baseUrl, originalUrl, url, method, statusCode, body } = req

    const csClient = async (request) => {
      try {
        const token = generateBEToken({ config});
        request.headers = {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
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
  
  app.get('/ping', (req, res) => res.json({ success: true }))

  if (typeof conversationApiFunctionModule.route ==='function' ){
    conversationApiFunctionModule.route(app, express)
  }

  //application hanler register application webhooks 
  Object.keys(conversationApiFunctionModule)
    .filter((funcName) => !['route', 'rtcEvent'].includes(funcName))
    .forEach((funcName) => {
      app.post(`/${webhookUrlPrefix}/${funcName}`, async (req, res, next) => conversationApiFunctionModule[funcName](req, res, next) )
    })

  //application hanler register rtcEvent
  if (typeof conversationApiFunctionModule.rtcEvent === 'function'){
    app.post(`/${webhookUrlPrefix}/rtcEvent`, async (req, res) => {
      const { query, baseUrl, originalUrl, url, method, statusCode, body } = req

      logger.info({ query, baseUrl, originalUrl, url, method, statusCode, body }, `Webhook Event for rtcEvent Received <-`)

      res.json({ body: req.body })

      const event = req.body
      const response = await conversationApiFunctionModule.rtcEvent(event, req.nexmo)

    })
  }

  return app;
}



async function configureNexmoApplication({ config, conversationApiFunctionModule }) {
  const { port, application_id, application_name, nexmo_account,isDev, server_url } = config;


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

  const capabilities = Object.keys(conversationApiFunctionModule).reduce((acc, handlerName) => {
    const handlerConfig = handlerCapabilitiesConfig[handlerName]
    if (!handlerConfig)
      return acc
    else {
      if (typeof acc[handlerConfig.group] !== 'object') {
        acc[handlerConfig.group] = {"webhooks": {}}
      }
      acc[handlerConfig.group]["webhooks"][handlerConfig.name] = {
        "address": `${webhooks_url}/${webhookUrlPrefix}/${handlerName}`,
        "http_method": "POST"
      }
      return acc
    }
  }, {})
  
  logger.info("start configureNexmoApplication App Registration*", { capabilities: JSON.stringify(capabilities) })

  const { data, status } =  await axios({
    method: "PUT",
    url: `https://api.nexmo.com/v2/applications/${application_id}`,
    data: {
      "name": application_name,
      capabilities
    },
    headers: { 'Authorization': `basic ${dev_api_token}` }
  }).catch(err => {
    logger.error("configureNexmoApplication App Registration Error", { err: JSON.stringify(err.response.data, '  ', '  ')});
    throw err;
  } )
  
  logger.info("configureNexmoApplication App Registration*", { data, status, capabilities: data.capabilities })
      
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

  // const allowedModuleMethods = ['route', ]

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
    .then(() => configureNexmoApplication({ config: staticConfig, conversationApiFunctionModule }))
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
