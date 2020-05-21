const axios = require('axios');
const { base64encode } = require('nodejs-base64');
const fs = require('fs').promises;;

const cliParams = process.argv.slice(2);
const [MY_NEXMO_APP_API_KEY, MY_NEXMO_APP_API_SECRET, MY_NEXMO_APP_PHONE_NUMBER,MY_NEXMO_APP_APPLICATION_NAME] = cliParams;



function createApp({api_key, api_secret, application_name }){
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


function createEnvFile({applicationData, cliParams}){
	const [MY_NEXMO_APP_API_KEY,MY_NEXMO_APP_API_SECRET,MY_NEXMO_APP_PHONE_NUMBER,MY_NEXMO_APP_APPLICATION_NAME] = cliParams
	const envFileContent = `
MY_NEXMO_APP_API_KEY="${MY_NEXMO_APP_API_KEY}"
MY_NEXMO_APP_API_SECRET="${MY_NEXMO_APP_API_SECRET}"
MY_NEXMO_APP_PHONE_NUMBER="${MY_NEXMO_APP_PHONE_NUMBER}"
MY_NEXMO_APP_APPLICATION_NAME="${MY_NEXMO_APP_APPLICATION_NAME}"
MY_NEXMO_APP_APPLICATION_ID="${applicationData.id}"
MY_NEXMO_APP_PRIVATE_KEY="${applicationData.keys.private_key.split("\n").join('\\n')}"
`
	return fs.writeFile(".env", envFileContent)

}


createApp({api_key:MY_NEXMO_APP_API_KEY, api_secret:MY_NEXMO_APP_API_SECRET,application_name:MY_NEXMO_APP_APPLICATION_NAME })
	.then(({data, status}) => createEnvFile({applicationData: data, cliParams}))
