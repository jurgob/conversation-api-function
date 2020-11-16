#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const fs = require('fs');
const startServer = require('../src/server.js')

yargs(hideBin(process.argv))
    // .command('new [prj_dir]', 'create a new conversation function', (yargs) => {
    //     yargs
    //         .positional('prj_dir', {
    //             describe: 'port to bind on',
    //             default: ``
    //         })
    //         .check((argv, options) => {
    //             //throw new Error("Situ fora", argv)
    //         })
    // }, (argv) => {
    // })
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