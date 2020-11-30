# conversation-service-functions


## what is this project?
this is a cli tool that will allow you to write simple application for the Vonage conversation api https://developer.nexmo.com/conversation in your local env with minimal configuration.







## install prerequisites


### nexmo credentials
To make this app running, you need 
 - a nexmo api key, api secret : https://dashboard.nexmo.com
 - a nexmo phone number (also known as LVN, Long Virtual Number) : https://dashboard.nexmo.com/buy-numbers

### install node 14+
suggested way to install node is via nvm (https://github.com/nvm-sh/nvm/pulls). so: 

```  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.0/install.sh | bash ```

then run: 

``` nvm install 14 ```

# install

```npm install -g conversation-api-function ```

## first time config

```conversation-api-function config-new -a a698c860 -s 6eb37419d0f6c497 -l 447418999066```

## create a new conversation function

``` conversation-api-function new my_capi_fn ```

## run it

``` conversation-api-function run my_capi_fn ```

now call you lvn, you should hear an "hello world" mesage


open the following file ``` my_capi_fn/index.js ``` for more info


## further docs:
check the internal conversations api here: https://jurgob.github.io/conversation-service-docs/#/openapiui
and the possible events here: https://jurgob.github.io/conversation-service-docs/#/custom



## some tricks
This project use a logging library called `bunyan` whitch is producing json logs.
if you install bunyan ( ```npm install -g bunyan ``` ) then you can run: 
`conversation-api-function run my_capi_fn | bunyan`. you will now see a formatted log. 

p.s. bunyan is producing standard json, so you can also use standard unix tools like jq to format the logs: `tail -f vapi_hello_world.log | jq`


## deploy in production

### create deployment credentials
from the project directory, run the following command: 
```conversation-api-function run .  ```

this is gonna create a `.env.prod` file with the credential to go live

### deploy in heroku. 
after you have created a deployment credentials, for the first thing you need to init your project on git: 
```
git init
git add -A
git commit -m 'first commit'

```

then you can create an heroku app (be sure you have an heroku account:  https://dashboard.heroku.com/apps)

```
npm install -g heroku
heroku login
heroku apps:create my_capi_heroku_app
```

now you can finally push the app live.
```
git push heroku main
```

if you look the app logs with ```heroku logs``` you will see that's the app is failing. that's becouse you need to configure the env vars. An easy way is the following: 

```

cat .env.prod | grep -v PRIVATE_KEY | xargs heroku config:set

# set private key
PRIVATE_KEY="`cat .env.prod | grep PRIVATE_KEY | cut -c 27-`"
echo -e $PRIVATE_KEY > private.key
heroku config:set CONV_API_FUNC_PRIVATE_KEY="$PRIVATE_KEY"

# set webhook url
heroku config:set CONV_API_FUNC_SERVER_URL="https://my_capi_heroku_app.herokuapp.com"

now go to `https://my_capi_heroku_app.herokuapp.com/hello` to check is working

```










