const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const axios = require('axios');
const { base64encode } = require('nodejs-base64');
const fs = require('fs').promises;



function generateToken({ private_key, application_id, acl, sub }) {
  if (!acl) {
    acl = {
      "paths": {
        "/**": {}
      }
    }
  }


  const now = (Date.now() / 1000) 
  const ext = now + (((60 * 60)  * 60 ) * 24 )
  const props = {
    "iat": now,
    "nbf": now,
    "exp": ext,
    "jti": now,
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


function getStaticConfig(env) {
  const isDev = !env.NODE_ENV
  if(isDev)
    dotenv.config();
  const { CONV_API_FUNC_PRIVATE_KEY, CONV_API_FUNC_APPLICATION_ID, CONV_API_FUNC_APPLICATION_NAME, CONV_API_FUNC_PHONE_NUMBER, CONV_API_FUNC_SERVER_URL, CONV_API_FUNC_PORT, CONV_API_FUNC_REDIS_URL } = env
  
  let port = 5001
  if (CONV_API_FUNC_PORT) {
    port = CONV_API_FUNC_PORT
  } else if(process.env.PORT) {
    port = process.env.PORT
  }

  let config = {
    port,
    isDev,
    phone_number: CONV_API_FUNC_PHONE_NUMBER,
    server_url: CONV_API_FUNC_SERVER_URL,
    private_key: CONV_API_FUNC_PRIVATE_KEY,
    application_id: CONV_API_FUNC_APPLICATION_ID,
    application_name:CONV_API_FUNC_APPLICATION_NAME,
    redis_url: CONV_API_FUNC_REDIS_URL
  }
  const { CONV_API_FUNC_API_KEY, CONV_API_FUNC_API_SECRET } = env
  config = {
    ...config,
    nexmo_account: {
      api_key:CONV_API_FUNC_API_KEY,
      api_secret: CONV_API_FUNC_API_SECRET
    }
  }


  return config
}

function createApp({ api_key, api_secret, application_name }) {
  const dev_api_token = base64encode(`${api_key}:${api_secret}`)
  return axios({
    method: "POST",
    url: `https://api.nexmo.com/v2/applications`,
    data: {
      "name": application_name,
      "capabilities": {
        "voice": {
          "webhooks": {
            "answer_url": {
              "address": `https://foo.com/ncco`,
              "http_method": "GET"
            },
            "event_url": {
              "address": `https://foo.com/voiceEvent`,
              "http_method": "POST"
            }
          }
        }
      }
    },
    headers: { 'Authorization': `basic ${dev_api_token}` }
  })
}

//cli stuff...
function createEnvFile({ applicationData, cliParams, fileName }) {
  fileName = fileName ? fileName : ".env"
  const [CONV_API_FUNC_API_KEY, CONV_API_FUNC_API_SECRET, CONV_API_FUNC_PHONE_NUMBER, CONV_API_FUNC_APPLICATION_NAME] = cliParams
  const envFileContent = `
CONV_API_FUNC_API_KEY="${CONV_API_FUNC_API_KEY}"
CONV_API_FUNC_API_SECRET="${CONV_API_FUNC_API_SECRET}"
CONV_API_FUNC_PHONE_NUMBER="${CONV_API_FUNC_PHONE_NUMBER}"
CONV_API_FUNC_APPLICATION_NAME="${CONV_API_FUNC_APPLICATION_NAME}"
CONV_API_FUNC_APPLICATION_ID="${applicationData.id}"
CONV_API_FUNC_PRIVATE_KEY="${applicationData.keys.private_key.split("\n").join('\\n')}"
`
  return fs.writeFile(fileName, envFileContent)

}

function createAppAndEnv(cliParams, fileName) {
  const [CONV_API_FUNC_API_KEY, CONV_API_FUNC_API_SECRET, CONV_API_FUNC_PHONE_NUMBER, CONV_API_FUNC_APPLICATION_NAME] = cliParams;

  return createApp({ api_key: CONV_API_FUNC_API_KEY, api_secret: CONV_API_FUNC_API_SECRET, application_name: CONV_API_FUNC_APPLICATION_NAME })
    .then(({ data, status }) => createEnvFile({ applicationData: data, cliParams, fileName }))
}

module.exports = {
	generateBEToken,
	generateUserToken,
  getStaticConfig,
  createApp,
  createAppAndEnv
}