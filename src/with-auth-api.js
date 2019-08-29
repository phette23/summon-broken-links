#!/usr/bin/env node
// NOTE: after all this, I still can't get the HMAC-SHA1 auth to work
// https://developers.exlibrisgroup.com/summon/apis/SearchAPI/Authentication/
const request = require('request')
const jssha = require('jssha')
const secret = require('./auth.json').key

// all these parameters are used to construct the auth string
let accept = 'application/json'
let date = new Date().toUTCString()
let host = 'api.summon.serialssolutions.com'
let path = '/2.0.0/search'
let query = 'q=beyond+good+and+evil'

// join the 5 parameters, appending a newline to each (including the last)
let auth_string = [accept, date, host, path, query].join('\n') + '\n'
// https://www.npmjs.com/package/jssha#hmac
let shaObj = new jssha("SHA-1", "TEXT")
shaObj.setHMACKey(secret, "TEXT")
shaObj.update(auth_string)
let hmac = shaObj.getHMAC("HEX")
let hash = Buffer.from(hmac, 'binary').toString('base64')

let headers = {
    'Accept': accept,
    'Authorization': ' Summon cca;' + hash,
    'Host': host,
    'x-summon-date': date,
}
let opts = {
    url: `https://${host}${path}/?${query}`,
    headers: headers,
}

function handler (err, response, body) {
    if (err) throw err

    console.log(response)
    console.log(body)
}

request.get(opts, handler)
