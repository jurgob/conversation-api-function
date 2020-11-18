#!/usr/bin/env node

const nodeVer = process.versions.node.split('.')
const supportdVersion = '13.14.0'.split('.')
if (nodeVer[0] < supportdVersion[0] || nodeVer[1] < supportdVersion[1] ) {
    console.log("Unsupported node version. version required:  >=v13.14.0. Please update your node installation")
    process.exit(1)
}

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const fs = require('fs');
var path = require('path')
const startServer = require('../src/server.js');
const { argv } = require('process');
const { createAppAndEnv } = require('../src/utils');
const shell = require('shelljs');
const os = require('os');
const { v4 } = require('uuid');
const open = require('open');


//< -a account-key > < -s account-secret > < -an application-name> 

//  <-s account-secret> <-lvn long-virtual-number> <-an application-name>



const dashboard_cred_url = "https://dashboard.nexmo.com/"

const config_dir = path.resolve(`${os.homedir()}/.capi_config`)
const config_file = `${config_dir}/.env`
require('dotenv').config({ path: config_file })


const { CONV_API_FUNC_API_KEY, CONV_API_FUNC_API_SECRET, CONV_API_FUNC_PHONE_NUMBER,} = process.env



function createAppArgs(yargs){
    return yargs.option('api-key', {
        alias: 'a',
        type: 'string',
        description: `api-key - check here: ${dashboard_cred_url}`,
        default: CONV_API_FUNC_API_KEY
        })
        .check((argv, options) => {
            const { "api-key": api_key } = argv
            if (!api_key)
                throw Error(`api-key is mandatory, check: ${dashboard_cred_url}`)
            if (api_key.length != 8)
                throw Error(`${api_key} is not a valid api-key, check: ${dashboard_cred_url}`)

            return true
        })
        .option('api-secret', {
            alias: 's',
            type: 'string',
            description: `api-secret - check here: ${dashboard_cred_url}`,
            default: CONV_API_FUNC_API_SECRET
        })
        .check((argv, options) => {
            const { "api-secret": api_secret } = argv
            if (!api_secret)
                throw Error(`api_secret can't be empy, check: ${dashboard_cred_url}`)
            return true

        })
        .option('lvn', {
            alias: 'l',
            type: 'string',
            description: `lvn - check here: https://dashboard.nexmo.com/your-numbers OR buy one here: https://dashboard.nexmo.com/your-numbers`,
            default: CONV_API_FUNC_API_SECRET
        })
        .check((argv, options) => {
            const { lvn } = argv
            if (!lvn)
                throw Error(`lvn can't be empty - check here: https://dashboard.nexmo.com/your-numbers OR buy one here: https://dashboard.nexmo.com/your-numbers`)
            return true
        })
}

yargs(hideBin(process.argv))
    .command('new <prj_dir>', 'create a new conversation function', (yargs) => {
        return yargs
            .example('conversation-api-function template-new prj_dir')
            .positional('prj_dir', {
                describe: 'directory of the project',
            })
    }, (argv) => {
            const {
                "prj_dir": prj_dir,
            } = argv

            const prj_dir_full = path.resolve(prj_dir)
            shell.mkdir('-p', prj_dir_full)
            shell.cd(prj_dir_full)
            const from_dir = `${__dirname}/../template`
            const from = `${from_dir}/*`
            const to = `${prj_dir_full}`
            shell.cp(from, to)
            shell.cp(`${from_dir}/.nvmrc`, to)
            shell.cp(`${from_dir}/.gitignore`, to)

    })
    .command('config', 'open existing config file', (yargs) => {
        return yargs
            .example('conversation-api-function config')


    }, (argv) => {
        const {
            "api-key": api_key,
            "api-secret": api_secret,
            lvn,
        } = argv
            open(config_file, { wait: false })
        

    })
    .command('config-new', 'first-time config setup, it s gonna crete a nexmo application for dev porpouse and is gonna configure it for the cli', (yargs) => {
        return createAppArgs(yargs)
            .example('conversation-api-function config-new -a a698c860 -s 6eb37419d0f6c497 -l 447418999066')
            

    }, (argv) => {
        const {
            "api-key": api_key,
            "api-secret": api_secret,
            lvn,
        } = argv

        shell.mkdir('-p',config_dir)
        shell.cd(config_dir)
        shell.touch('.env')
        createAppAndEnv([api_key, api_secret, lvn, `local-test-capi-fn-${v4()}`])

    })
    // .command('new <prj_dir>', 'create a new conversation function', (yargs) => {
    //     return createAppArgs (yargs)
    //         .example('conversation-api-function new prj_dir -a a698c860 -s 6eb37419d0f6c497 -l 447418999066')
    //         .positional('prj_dir', {
    //             describe: 'directory of the project',
    //         })
    // }, (argv) => {
    //         const {
    //             "prj_dir": fn_name,
    //             "api-key": api_key,
    //             "api-secret": api_secret,
    //             lvn,
    //         } = argv

    //         const fn_name_full = path.resolve(fn_name)
    //         shell.mkdir('p', fn_name_full)
    //         shell.cd(fn_name_full)
    //         const from = `${__dirname}/../template/*`
    //         const to = `${fn_name_full}`
    //         shell.cp(from, to)
    //         createAppAndEnv([api_key, api_secret, lvn, `app-${fn_name}-dev`])


    // })
    .command('run [prj_dir]', 'run a conversation function', (yargs) => {
        yargs
            .positional('prj_dir', {
                describe: 'js file where you are exporting your handlers',
                default: `./index.js`
            })
            .check((argv, options) => {
                const { prj_dir } = argv;
                const dir = prj_dir ? prj_dir : process.cwd();
                const fileName = './index.js'

                const filePath = path.resolve(prj_dir, fileName);

                const isFile = fs.lstatSync(filePath).isFile() 
                return isFile
            })
    }, (argv) => {
        const { prj_dir } = argv;
        const dir = prj_dir ? prj_dir : process.cwd();
        const fileName = './index.js'

        const filePath = path.resolve(prj_dir, fileName);
        
        const userModule = require(filePath)
        startServer(userModule)

    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging'
    })
    .strict()
    .strictCommands()
    .demandCommand(1)
    .wrap(null)
    .argv