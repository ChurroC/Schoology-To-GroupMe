const puppeteer = require("puppeteer");
const SchoologyAPI = require('./schoologyAPI')

const clientKey = process.env.clientKey
const clientSecret = process.env.clientSecret
const oauthTokenKey = process.env.oauthTokenKey
const oauthTokenSecret = process.env.oauthTokenSecret
const schoologyUsername = process.env.schoologyUsername
const schoologyPassword = process.env.schoologyPassword

client = new SchoologyAPI(clientKey, clientSecret)

async function grabUpdate() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage()
    await page.setViewport({ width: 816, height: 619 })  

    await page.goto('https://app.schoology.com/login')
    await page.type('#edit-mail', schoologyUsername)
    await page.type('#edit-pass', schoologyPassword)
    await page.click('#edit-submit')

    await page.goto('https://app.schoology.com/course/5003999147/updates')
    const update = await page.$x('//li[@class][@timestamp]')

    await update[0].screenshot({path: 'update.png'})
}

async function sendToGroupMe() {

}

;(async () => {
    client.oauthTokenKey = oauthTokenKey
    client.oauthTokenSecret = oauthTokenSecret

    const updateLink = '/sections/5003999147/updates?start=0&limit=1'
    const updates = await client.request(updateLink)
    let updateId = updates.update[0].id
    console.log(';hji')
    await grabUpdate()
    console.log(';hji')

    /*
    while(true) {
        const updates = await client.request(updateLink)
        console.log(updateId)
        if (updateId  = updates.update[0].id) {
            updateId = updates.update[0].id
        }
        grabUpdate()
    }*/
})()