const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');



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
  const { MY_NEXMO_APP_PRIVATE_KEY, MY_NEXMO_APP_APPLICATION_ID, MY_NEXMO_APP_APPLICATION_NAME, MY_NEXMO_APP_PHONE_NUMBER } = env
  const port = 5001

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

module.exports = {
	generateBEToken,
	generateUserToken,
	getStaticConfig
}