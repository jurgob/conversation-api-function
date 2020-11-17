# conversation-service-functions


## what is this app?
this will allow you to write simple application for conversation service in your local env with minimal configuration.
check the internal conversations api here: https://jurgob.github.io/conversation-service-docs/#/openapiui
and the possible events here: https://jurgob.github.io/conversation-service-docs/#/custom

# HOW TO USE IT

Before you try thise, be sure you have readed the `INSTALL` seciong

You just have to write your code in this file https://github.com/jurgob/conversation-service-functions/blob/main/hosted_code/server/index.js .
You need to export an object with two functions: `rtcEvent` and `route`.
Read further instruction in that file


# INSTALL

## prerequisites
To make this app running, you need 
 - a nexmo api key, api secret : https://dashboard.nexmo.com
 - a nexmo lvn (you are gonna put it in NEXMO_LVN) : https://dashboard.nexmo.com/buy-numbers


once you have the necessary data ,you need to create a `.env` file in the project root directory with the following variables:


## how to install the dependencies
install nvm (https://github.com/nvm-sh/nvm)
from the root directory of this project run:
`nvm install` (only the first time)

`nvm use`

`npm install`

## first run / create the .env config file.
now you need to configure the .env file. you can run: 

`npm run first_config <API_KEY> <API_SECRET> <NEXMO_LVN> <APP_NAME>`

you can find those values here:
 - <API_KEY>, <API_SECRET>: go there https://dashboard.nexmo.com/voice/create-application
 - <NEXMO_LVN>:  this is the one you boughth there: https://dashboard.nexmo.com/buy-numbers
 - APP_NAME: you can put any string you want there

`npm run first_config a508b666 6ea37679e0d6a666 447520660591 vapi_ivr_hello_world`


what is this doing? 
this command is creating a nexmo application for you and saving the needed information in a .env file.
You should now see a .env file created in your project directory with the following content:

```
CONV_API_FUNC_API_KEY=[API_KEY]
CONV_API_FUNC_API_SECRET=[API_SECRET]
CONV_API_FUNC_PHONE_NUMBER=[NEXMO_VN]
CONV_API_FUNC_APPLICATION_NAME=[APP_NAME]
CONV_API_FUNC_APPLICATION_ID=[APPLICATION_ID]
CONV_API_FUNC_PRIVATE_KEY=[PRIVATE_KEY]

```

## how to run it
once everything is configured, you can run the following command:

`npm start`


note: 
this is a dev app, so every time 
 - connect your lvn to your application: https://dashboard.nexmo.com/your-numbers


## how to read the logs
This project use a logging library called `bunyan` whitch is producing json logs.
You may struggle in reading row logs. The logs are printed in the starndard output but also written in the `vapi_hello_world.log` file. so my suggestion is: 
1. install the bunyan cli: `npm install -g bunyan` (you must to this just once)
2. run the app
3. open another terminal on the same directory
4. run `tail -f vapi_hello_world.log | bunyan`. you will now see a formatted log. 

p.s. bunyan is producing standard json, so you can also use standard unix tools like jq to format the logs: `tail -f vapi_hello_world.log | jq`




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


