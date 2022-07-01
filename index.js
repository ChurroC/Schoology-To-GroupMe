const puppeteer = require("puppeteer");
const SchoologyAPI = require('./schoologyAPI')
const groupmeAPI = require('./groupmeAPI')

const clientKey = process.env.clientKey
const clientSecret = process.env.clientSecret
const oauthTokenKey = process.env.oauthTokenKey
const oauthTokenSecret = process.env.oauthTokenSecret
const schoologyUsername = process.env.schoologyUsername
const schoologyPassword = process.env.schoologyPassword
const course = process.env.course
const district = process.env.district

client = new SchoologyAPI(clientKey, clientSecret)

async function grabUpdate() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage()
    await page.setViewport({ width: 816, height: 619 })  

    await page.goto(`https://${district}.schoology.com/login`)
    await page.type('#edit-mail', schoologyUsername)
    await page.type('#edit-pass', schoologyPassword)
    await page.click('#edit-submit')

    
    await new Promise(resolve => { setTimeout(resolve, 500) });
    await page.goto(`https://${district}.schoology.com/course/${course}/updates`)
    await page.waitForXPath('//li[@class][@timestamp]')
    const update = await page.$x('//li[@class][@timestamp]')

    await update[0].screenshot({path: 'update.png'})
    await browser.close()
    sendToGroupMe()
}

async function sendToGroupMe() {
    try {
        const imageLink = await groupmeAPI.imageService('./update.png')
        await groupmeAPI.sendMessage('', imageLink.payload.url)
    }
    catch(err) {
        console.log(err.response ? err.response.data : err)
    }
}

;(async () => {
    client.oauthTokenKey = oauthTokenKey
    client.oauthTokenSecret = oauthTokenSecret

    const updateLink = `/sections/${course}/updates?start=0&limit=1`
    const updates = await client.request(updateLink)
    let updateId = updates.update[0].id

    while(true) {
        const updates = await client.request(`/sections/${course}/updates?start=0&limit=1`)
        if (updateId  !== updates.update[0].id) {
            updateId = updates.update[0].id
            grabUpdate()
        }
    }
})()