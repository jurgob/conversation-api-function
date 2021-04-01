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

the first time you run this, you need to have your api-key, api-secret and an lvn (look the prerequisites section above):

```conversation-api-function config-new -a <api-key> -s <api-secret> -l <lvn>```

if you struggle with this, run: 
```conversation-api-function config-new -h```

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

## Examples

Once you have configured conversation-api-functions, you can run every project without configuring this tools again. 
Here are some examples you can run just coloning it and executing it with the following commans: 

downloding / installing the repo:
```
git clone <GIT_REPO> <MY_DIR>
cd <MY_DIR>
nvm use
npm install
```
then run it with: 

```  conversation-api-function run <MY_DIR>```


e.g: 
```
git clone https://github.com/jurgob/phone_inbound_asr my_capi_fn
cd my_capi_fn
nvm use
npm install
conversation-api-function run .

```

### Examples 

- **Automatic Speech Recognition**

  git_repo: https://github.com/jurgob/phone_inbound_asr
  
  description: Call a number and trascribe your voice

- **UI react example**

  git_repo: https://github.com/jurgob/react_client_example

  description: a very ugly react interface (genereated using react-create-app) for debuging ip calls. (aka calls from your browser). There's also simple login/subscribe mechanism.

- **NCCO talk action - hello world**

  git_repo: https://github.com/jurgob/capi-fn_ncco_hello_world

  description: NCCO stands for Nexmo Call Control Object. Is an easy way to script your calls




## Use a Real Redis

by default the storage client is saving your data in-memory, so every time you restart you loose al your data. 
To use a real redis server instead, you just need to set the env var CONV_API_FUNC_REDIS_URL.
See the example below for more details

### use a docker redis for local deployment

be sure you have installed docker
to install redis in your local host, you just need to run: 
```docker run --name capifn-redis -p 6379:6379 -d redis```


now open your config runnig ```conversation-api-function config```
this is gonna open an editor with your configs. Add this line: 
``` 
CONV_API_FUNC_REDIS_URL="redis://localhost:6379"
```
 



## deploy in production

### create deployment credentials
0) from the project directory, run the following command: 
```conversation-api-function run .  ```

this is gonna create a `.env.prod` file with the credential to go live

### deploy in heroku. 
1) after you have created a deployment credentials, for the first thing you need to init your project on git: 
```
git init
git add -A
git commit -m 'first commit'

```

2) be sure you have an heroku account:  https://dashboard.heroku.com/apps

3) insatall the heroku cli with ```npm install -g heroku```

4) then you can create an heroku app :

```
heroku login
heroku apps:create my_capi_heroku_app
```

5) now you can finally push the app live.
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
```

6) now go to `https://my_capi_heroku_app.herokuapp.com/hello` to check is working












