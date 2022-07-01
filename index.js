const axios = require("axios")
const open = require('open');
const SchoologyAPI = require('./schoologyAPI')
const express = require('express')
const fs = require('fs')

app = express()

app.get('/authorized', express.json(), (req, res) => {
    res.send('Authorized')
})

app.get('/', (req, res) => {
    res.send('Hi')
})

app.listen(8080, ()=>{console.log(`App listening at port 8080`)})


const clientKey = 'b59371e5bd37771e4896a0a89259a0d6062ba49a9'
const clientSecret = 'b8a95ab02e5b1b435c625207b651bd93'

client = new SchoologyAPI(clientKey, clientSecret)

;(async () => {
    const cool = await client.getRequestToken()
    console.log(cool)
    open(client.approveTokenWebsite('tolocalhost.com'))
    process.stdout.write("Once you are finished authorizing enter any key in terminal.")
    await new Promise(resolve => { process.stdin.once("data", data  => resolve(data)) })
    const cool2 = await client.getAccessToken()
    console.log(cool2)
})()
/*
https://app.schoology.com/oauth/authorize?oauth_token=51dc65e8e7d708a003e5be29eced8eec062bcf410&oauth_callback=bobbyhadz.com/blog/javascript-error-err-require-esm-require-of-es-module-not-supported
https://app.schoology.com/oauth/authorize?oauth_token=33cb258c68726c0473707542adaad297062bcdb80&oauth_callback=schoologyweb.vercel.app*/