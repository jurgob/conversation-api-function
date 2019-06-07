# vapi_hello_world

## what is this app?
this is an hello world for the nexmo voice API https://developer.nexmo.com/voice/voice-api/overview.


## prerequisites
To make this app running, you need 
 - a nexmo api key, api secret ( for MY_NEXMO_APP_API_KEY, MY_NEXMO_APP_API_SECRET ) : https://dashboard.nexmo.com
 - a nexmo Application (you are gonna put private_key and application_id, application_name in MY_NEXMO_APP_PRIVATE_KEY, MY_NEXMO_APP_APPLICATION_ID, MY_NEXMO_APP_APPLICATION_NAME ): https://dashboard.nexmo.com/voice/create-application
 - a nexmo lvn (you are gonna put it in MY_NEXMO_APP_PHONE_NUMBER) : https://dashboard.nexmo.com/buy-numbers
 - connect your lvn to your application: https://dashboard.nexmo.com/your-numbers


once you have the necessary data ,you need to create a `.env` file in the project root directory with the following variables:
```
MY_NEXMO_APP_PRIVATE_KEY=[API_KEY]
MY_NEXMO_APP_APPLICATION_ID=[APPLICATION_ID]
MY_NEXMO_APP_APPLICATION_NAME=[APPLICATION_NAME]
MY_NEXMO_APP_API_KEY=[API_KEY]
MY_NEXMO_APP_API_SECRET=[API_SECRET]
MY_NEXMO_APP_PHONE_NUMBER=[LVN]
```


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

## the first exercise you should do:
Take the current app and ask the question: 
"What do you prefer, fish and chips or potato?"
"If you prefer fish and chips press 1, of you prefer potatos is 2"

if the user press one it should hear:
"you have selected fish and chips, you should drink it with beer"

if the user press two it should hear:
"glad you selected potatos, have a coke with them"


