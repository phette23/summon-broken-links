const crypto = require('crypto')

const config = require('../config.json')
let accept = 'application/json'
let host = 'api.summon.serialssolutions.com'
let path = '/2.0.0/search'

/**
 * @param {array} q - an array of {key:value} parameter objects like
 * [ { "s.q": "nietzsche" }, { "s.fvf": "ContentType..." } ]
 * @returns {string} sorted but NOT URI-encoded query string
 * s.fvf=ContentType...&s.q=nietzsche
 */
function sortQuery(q) {
    return q.map(o => `${Object.keys(o)[0].toString()}=${Object.values(o)[0].toString()}`).sort().join('&')
}

/**
 * https://developers.exlibrisgroup.com/summon/apis/SearchAPI/Authentication/
 * @param {array} query - an array of {key:value} hashes of Summon search params
 * [ { "s.q": "nietzsche" }, { "s.fvf": "ContentType,Journals,false" } ]
 * @param {Date} current date in UTC time e.g. new Date().toUTCString()
 * Since this is also used in the HTTP request headers we need to make it a
 * parameter rather than just have this function calculate it.
 * @returns {string} auth digest string for use in Authorization HTTP header
 */
function makeAuthDigest(query, date) {
    // https://github.com/summon/summon-api-toolkit/blob/master/node.js/summonapidemo.js
    let qs = sortQuery(query)
    let idString = [accept, date, host, path, qs].join('\n') + '\n'
    let hmac = crypto.createHmac('sha1', config.key)
    let hash = hmac.update(idString)
    return hash.digest('base64')
}


/**
 * https://developers.exlibrisgroup.com/summon/apis/SearchAPI/Authentication/
 * @param {array} query - an array of {key:value} hashes of Summon search params
 * [ { "s.q": "nietzsche" }, { "s.fvf": "ContentType,Journals,false" } ]
 * @returns {object} key:value pairs representation of HTTP headers
 * for use in request({ url: url, headers: headers })
 */
function headers(query) {
    let date = new Date().toUTCString()
    let digest = makeAuthDigest(query, date)
    let headers = {
        'Accept': accept,
        'Authorization': `Summon ${config.org};${digest}`,
        'Host': host,
        'x-summon-date': date,
    }
    return headers
}

/**
 * https://developers.exlibrisgroup.com/summon/apis/SearchAPI/Authentication/
 * @param {array} query - an array of {key:value} hashes of Summon search params
 * [ { "s.q": "nietzsche" }, { "s.fvf": "ContentType,Journals,false" } ]
 * @returns {string} query string suitable for constructing a Summon API request
 * URL (sorted but not URI encoded)
 */
function url(query) {
    // we actually don't need the query string to be properly sorted in the URL
    // but it's easier to use the array=>string method we already wrote
    return `https://${host}${path}?${sortQuery(query)}`
}

module.exports = { makeAuthDigest, headers, url }
