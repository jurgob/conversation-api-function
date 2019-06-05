# vapi_hello_world

## what is this app?
this is an hello world for the nexmo voice API https://developer.nexmo.com/voice/voice-api/overview.


## prerequisites
To make this app running, you need 
 - a nexmo api key, api secret : https://dashboard.nexmo.com
 - a nexmo Application: https://dashboard.nexmo.com/voice/create-application
 - a nexmo lvn: https://dashboard.nexmo.com/buy-numbers
 - connect your lvn to your application: https://dashboard.nexmo.com/your-numbers


## once you have those, create a .env file in the project root directory with the following variables
`
MY_NEXMO_APP_PRIVATE_KEY=
MY_NEXMO_APP_APPLICATION_ID=
MY_NEXMO_APP_API_KEY=
MY_NEXMO_APP_API_SECRET=
MY_NEXMO_APP_PHONE_NUMBER=
`


## how to install it
install nvm (https://github.com/nvm-sh/nvm)
from the root directory of this project run:
`nvm install` (only the first time)
`nvm use`
`npm install`
## how to run it
run
`npm start`


## how should I use it?
Once your server is running, just call from your phone the LVN number you bougth from nexmo
