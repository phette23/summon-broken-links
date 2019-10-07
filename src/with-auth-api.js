#!/usr/bin/env node
// NOTE: after all this, I still can't get the HMAC-SHA1 auth to work
// https://developers.exlibrisgroup.com/summon/apis/SearchAPI/Authentication/
const crypto = require('crypto')

const request = require('request')

const key = require('./auth.json').key

// all these parameters are used to construct the auth string
let accept = 'application/json'
let date = new Date().toUTCString()
let host = 'api.summon.serialssolutions.com'
let path = '/2.0.0/search'
let query = 's.q=beyond good and evil'

// join the 5 parameters, appending a newline to each (including the last)
let idString = [accept, date, host, path, query].join('\n') + '\n'
// https://github.com/summon/summon-api-toolkit/blob/master/node.js/summonapidemo.js
let hmac = crypto.createHmac('sha1', key)
let hash = hmac.update(idString)
let digest = hash.digest('base64')

let headers = {
    'Accept': accept,
    'Authorization': 'Summon cca;' + digest,
    'Host': host,
    'x-summon-date': date,
}
let opts = {
    url: `https://${host}${path}?${query}`,
    headers: headers,
}

function handler (err, response, body) {
    if (err) throw err

    console.log(body)
}

request.get(opts, handler)
