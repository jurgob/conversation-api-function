#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const fs = require('fs');
var path = require('path')
const startServer = require('../src/server.js');
const { argv } = require('process');
const { createAppAndEnv } = require('../src/utils');
const shell = require('shelljs');

//< -a account-key > < -s account-secret > < -an application-name> 

    //  <-s account-secret> <-lvn long-virtual-number> <-an application-name>



const dashboard_cred_url = "https://dashboard.nexmo.com/"

const { CONV_API_FUNC_API_KEY, CONV_API_FUNC_API_SECRET, CONV_API_FUNC_PHONE_NUMBER,} = process.env
yargs(hideBin(process.argv))
    .command('new <prj_dir>', 'create a new conversation function', (yargs) => {
        return yargs
            .example('conversation-js-function new prj_dir -a a698c860 -s 6eb37419d0f6c497 -l 447418999066')
            .positional('prj_dir', {
                describe: 'directory of the project',
            })
            // .coerce('prj_dir', path.resolve)
            .option('api-key', {
                alias: 'a',
                type: 'string',
                description: `api-key - check here: ${dashboard_cred_url}`,
                default: CONV_API_FUNC_API_KEY
            })
            .option('api-secret', {
                alias: 's',
                type: 'string',
                description: `api-secret - check here: ${dashboard_cred_url}`,
                default: CONV_API_FUNC_API_SECRET
            })
            .option('lvn', {
                alias: 'l',
                type: 'string',
                description: `lvn - check here: https://dashboard.nexmo.com/your-numbers OR buy one here: https://dashboard.nexmo.com/your-numbers`,
                default: CONV_API_FUNC_API_SECRET
            })
            .check((argv, options) => {
                const { 
                    "api-key": api_key,
                    "api-secret": api_secret,
                    lvn,
                } = argv

                if (!api_key)
                    throw Error(`api-key is mandatory, check: ${dashboard_cred_url}`)
                
                if (api_key.length != 8)
                    throw Error(`${api_key} is not a valid api-key, check: ${dashboard_cred_url}`)
                
                if (!api_secret)
                    throw Error(`api_secret can't be empy, check: ${dashboard_cred_url}`)

                if (!lvn)
                    throw Error(`lvn can't be empty - check here: https://dashboard.nexmo.com/your-numbers OR buy one here: https://dashboard.nexmo.com/your-numbers`)

                
                return true
                
            })

    }, (argv) => {
            const {
                "prj_dir": fn_name,
                "api-key": api_key,
                "api-secret": api_secret,
                lvn,
            } = argv

            const fn_name_full = path.resolve(fn_name)
            shell.mkdir('p', fn_name_full)
            shell.cd(fn_name_full)
            const from = `${__dirname}/../template/*`
            const to = `${fn_name_full}`
            shell.cp(from, to)
            createAppAndEnv([api_key, api_secret, lvn, `app-${fn_name}-dev`])


    })
    .command('run [file]', 'run a conversation function', (yargs) => {
        yargs
            .positional('file', {
                describe: 'js file where you are exporting your handlers',
                default: `./index.js`
            })
            .check((argv, options) => {
                const filePath = `${process.cwd()}/${argv.file}`
                const isFile = fs.lstatSync(filePath).isFile() 
                return isFile
            })
    }, (argv) => {
        const filePath = `${process.cwd()}/${argv.file}`
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
    .argv