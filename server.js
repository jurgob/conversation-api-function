const express = require('express');
const dotenv = require('dotenv');
const bunyan = require('bunyan');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const logger = bunyan.createLogger({
  name: 'vapi_hello_world',
  streams: [{
      type: 'rotating-file',
      path: 'vapi_hello_world.log',
      period: '1d',   // daily rotation
  }]
});
const path = require('path');
const { base64encode } = require('nodejs-base64');

const bodyParser = require('body-parser');


function createApp(config) {

  const app = express()
  app.use(bodyParser.json())

  app.use((req, res, next) => {
    const { query, baseUrl, originalUrl, url, method, statusCode, body } = req
    logger.info({ query, baseUrl, originalUrl, url, method, statusCode, body }, "Request Logger:: ")
    next()
  })

  app.get('/ping', (req, res) => res.json({ success: true}))
  app.post('/voiceEvent', (req, res) => res.json({ body: req.body }))


  const nccoHandler = (req, res) => {
    const { server_url } = config;
    const { to = 'unknown', from = 'unknown', dtmf = -1 } = req.query;

    const ncco = [
      {
        "action": "talk",
        "text": `Hello There, your number is ${to.split("").join("  ")} and you are colling ${from.split("").join(" ")}`
      }
    ]
    return res.json(ncco)

  }

  app.get('/ncco', nccoHandler)

  return app;
}




function localDevSetup({ config }) {
  const { port, application_id, application_name, nexmo_account,isDev } = config;

  if(!isDev)
  return Promise.resolve({
    config
  });

  const ngrok = require('ngrok');
  let NGROK_URL;
  const {api_key, api_secret } = nexmo_account;
  const dev_api_token = base64encode(`${api_key}:${api_secret}`)
  return ngrok.connect(port)
    .then((ngrok_url) => {
      NGROK_URL = ngrok_url;
      return axios({
        method: "PUT",
        url: `https://api.nexmo.com/v2/applications/${application_id}`,
        data: {
          "name": application_name,
          "capabilities": {
            "voice": {
              "webhooks": {
                "answer_url": {
                  "address": `${ngrok_url}/ncco`,
                  "http_method": "GET"
                },
                "event_url": {
                  "address": `${ngrok_url}/voiceEvent`,
                  "http_method": "POST"
                }
              }
            }
          }
        },
        headers: { 'Authorization': `basic ${dev_api_token}` }
      })
        .then(({ data, status }) => {
          logger.info({ data, status })
        })
    })
    .then(() => ({
      config: {
        ...config,
        server_url: NGROK_URL
      }
    }))
}

function generateToken({ private_key, application_id, acl, sub }) {
  if (!acl) {
    acl = {
      "paths": {
        "/**": {}
      }
    }
  }

  const props = {
    "iat": 1556839380,
    "nbf": 1556839380,
    "exp": 1559839410,
    "jti": 1556839410008,
    application_id,
    acl,
    sub
  }

  return jwt.sign(
    props,
    {
      key: private_key,
    },
    {
      algorithm: 'RS256',
    }
  )
}

function generateUserToken({ config, user_name }) {
  const { private_key, application_id } = config;
  return generateToken({
    private_key,
    application_id,
    sub: user_name
  })
}

function generateBEToken({ config }) {
  const { private_key, application_id } = config;
  return generateToken({
    private_key,
    application_id
  })
}

function checkEnvVars(){
  const isDev = !process.env.NODE_ENV
  if(isDev)
    dotenv.config();

  let mandatoryEnvs = ["MY_NEXMO_APP_PRIVATE_KEY", "MY_NEXMO_APP_APPLICATION_ID", "MY_NEXMO_APP_APPLICATION_NAME", "MY_NEXMO_APP_API_KEY"]
  if(isDev)
    mandatoryEnvs = mandatoryEnvs.concat(["MY_NEXMO_APP_API_KEY", "MY_NEXMO_APP_API_SECRET"])


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

function getStaticConfig(env) {
  const isDev = !env.NODE_ENV
  if(isDev)
    dotenv.config();
  const { MY_NEXMO_APP_PRIVATE_KEY, MY_NEXMO_APP_APPLICATION_ID, MY_NEXMO_APP_APPLICATION_NAME, MY_NEXMO_APP_PHONE_NUMBER } = env
  const port = 5000

  let config = {
    port,
    isDev,
    phone_number: MY_NEXMO_APP_PHONE_NUMBER,
    server_url_internal: `http://localhost:${port}`,
    server_url: `http://localhost:${port}`,
    private_key: MY_NEXMO_APP_PRIVATE_KEY,
    application_id: MY_NEXMO_APP_APPLICATION_ID,
    application_name:MY_NEXMO_APP_APPLICATION_NAME
  }
  if(isDev) {
      const { MY_NEXMO_APP_API_KEY, MY_NEXMO_APP_API_SECRET } = env
      config = {
        ...config,
        nexmo_account: {
          api_key:MY_NEXMO_APP_API_KEY,
          api_secret: MY_NEXMO_APP_API_SECRET
        }
      }
  }


  return config
}

function listenServer({ app, config }) {
  const { port } = config;
  return new Promise((resolve) => {
    return app.listen(port, () => resolve({ config }))
  })
}

//
function bindLvnToApp({phone_number, application_id, api_key, api_secret}){
  //`msisdn=${phone_number}&voiceCallbackValue=${application_id}&api_key=${api_key}&api_secret=${api_secret}`
  const data = `country=GB&msisdn=${phone_number}&moHttpUrl=&voiceCallbackType=app&voiceCallbackValue=${application_id}&api_key=${api_key}&api_secret=${api_secret}`
  return axios({
        method: "POST",
        url: `https://rest.nexmo.com/number/update`,
        data,
        headers: { 'Content-Type': `application/x-www-form-urlencoded` }
      })
      .then(({ data, status }) => {
          logger.info({ data, status })
        })
}

function startServer() {
  dotenv.config();
  const staticConfig = getStaticConfig(process.env)
  const {phone_number, application_id, nexmo_account} = staticConfig;
  const {api_key, api_secret} = nexmo_account;
  console.log(staticConfig)
  return Promise.resolve()
    .then(() => bindLvnToApp({phone_number, application_id, api_key, api_secret}))
    .then(() => localDevSetup({ config: staticConfig }))
    .then(({ config }) => {
      const app = createApp(config)
      return { config, app }
    })
    .then(({ app, config }) => listenServer({ app, config }))
    .then(({ config }) => {
      const { port } = config;
      logger.info(`config`, config)
      logger.info(`Example app listening on port ${port}!`)
    })
}

const  emptyEnvs = checkEnvVars();
if(emptyEnvs.length)
  logger.error(`you need to configure the following vars`, emptyEnvs)
else
  startServer()
    .catch(err => console.error(err))
