const express = require('express')
const app = express()

const PORT = process.env.PORT || 8080

app.get('/', (req, res) => {
    res.send('Hi')
})

app.post('/new-message', express.json(), (req, res) => {
    const body = req.body
    const text = body.text
    const name = body.name
    console.log(body)
    res.send(body)
    if (text == '!ping') {
      console.log('in')
        bot.sendMessage('pong')
            .catch(err => {
                res.send(err)
            })
    }
    if (text == '!hi') {
        bot.sendMessage(`Hi ${name}`)
            .catch(err => {
                res.send(err)
            })
    }
    if (text == '!latestpost') {
        sendToGroupMe()
    }
})

module.exports = function startServer() {
    app.listen(PORT, ()=>{console.log(`App listening at port ${PORT}`)})
}