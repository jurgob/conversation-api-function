# conversation-service-functions


## what is this project?
this is a cli tool that will allow you to write simple application for the Vonage conversation api https://developer.nexmo.com/conversation in your local env with minimal configuration.



# INSTALL



## prerequisites

To make this app running, you need 
 - a nexmo api key, api secret : https://dashboard.nexmo.com
 - a nexmo lvn (you are gonna put it in NEXMO_LVN) : https://dashboard.nexmo.com/buy-numbers




## first time config

```conversation-api-function config-new -a a698c860 -s 6eb37419d0f6c497 -l 447418999066```

## create a new conversation function

``` conversation-api-function new my_capi_fn ```

## run it

``` conversation-api-function run my_capi_fn ```

open the following file ``` my_capi_fn/index.js ```


## further docs:
check the internal conversations api here: https://jurgob.github.io/conversation-service-docs/#/openapiui
and the possible events here: https://jurgob.github.io/conversation-service-docs/#/custom



## some tricks
This project use a logging library called `bunyan` whitch is producing json logs.
if you install bunyan ( ```npm install -g bunyan ``` ) then you can run: 
`conversation-api-function run my_capi_fn | bunyan`. you will now see a formatted log. 

p.s. bunyan is producing standard json, so you can also use standard unix tools like jq to format the logs: `tail -f vapi_hello_world.log | jq`





