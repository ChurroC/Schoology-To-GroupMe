const axios = require('axios')
const crypto = require('crypto')
const OAuth = require('oauth-1.0a')

module.exports = class SchoologyAPI {
    constructor(key, secret, oauthTokenKey = '', oauthTokenSecret = '') {
        this.consumerKey = key
        this.consumerSecret = secret
        this.oauthTokenKey = oauthTokenKey
        this.oauthTokenSecret = oauthTokenSecret
    }

    get oauth() {
        //this.oauth gets a base string and uses sha1 on it.
        return OAuth({
            consumer: { key: this.consumerKey, secret: this.consumerSecret },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string, key) {
                return crypto
                    .createHmac('sha1', key)
                    .update(base_string)
                    .digest('base64')
            },
        })

    }

    async getRequestToken() {
        try {
            //const plainAuth = { Authorization: `OAuth realm="Schoology API",oauth_consumer_key="${this.key}",oauth_token="",oauth_nonce="${crypto.randomBytes(32).toString('base64')}",oauth_timestamp="${Math.floor(Date.now()/1000)}",oauth_signature_method="PLAINTEXT",oauth_version="1.0",oauth_signature="${this.secret}%26"` }
            
            //Calls the funtion to create a oauth header based of my data
            const hashAuth = this.oauth.toHeader(this.oauth.authorize({
                url: 'https://api.schoology.com/v1/oauth/request_token',
                method: 'GET',
                data: {
                    oauth_consumer_key: this.consumerKey,
                    oauth_token: "",
                }
            }))

            const res = await axios.get('https://api.schoology.com/v1/oauth/request_token', {
                headers: hashAuth
            })

            this.requestToken = res.data
            this.requestTokenKey = this.parseToken(this.requestToken).key
            this.requestTokenSecret = this.parseToken(this.requestToken).secret

            return res.data
        }
        catch(err) {
            return err.response ? err.response.data : err
        }
    }

    parseToken(token) {
        const key = token.slice(12, 53)
        const secret = token.slice(73, 105)
        return { key, secret }
    }

    approveTokenWebsite(callback = '') {
        //Use open to open it in the default browser
        return `https://app.schoology.com/oauth/authorize?oauth_token=${this.requestTokenKey}${callback ? `&oauth_callback=${callback}` : ''}`
    }

    async getAccessToken() {
        try {
            const hashAuth = this.oauth.toHeader(this.oauth.authorize({
                url: 'https://api.schoology.com/v1/oauth/access_token',
                method: 'GET',
                data: {
                    oauth_consumer_key: this.consumerKey,
                    oauth_token: this.requestTokenKey,
                }
            }, {secret: this.requestTokenSecret}))

            const res = await axios.get('https://api.schoology.com/v1/oauth/access_token', {
                headers: hashAuth
            })

            this.oauthToken = res.data
            this.oauthTokenKey = this.parseToken(this.oauthToken).key
            this.oauthTokenSecret = this.parseToken(this.oauthToken).secret

            return res.data
        }
        catch(err) {
            return (err.response ? err.response.data : err)
        }
    }
    
    async request(path) {
        try {
            const url = `https://api.schoology.com/v1${path}`

            const hashAuth = this.oauth.toHeader(this.oauth.authorize({
                url: url,
                method: 'GET',
                data: {
                    oauth_consumer_key: this.consumerKey,
                    oauth_token: this.oauthTokenKey,
                }
            }, {secret: this.oauthTokenSecret}))

            const res = await axios.get(url, {
                headers: hashAuth
            })
            
            return res.data
        }
        catch(err) {
            return (err.response ? err.response.data : err)
        }
    }
}