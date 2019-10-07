#!/usr/bin/env node
const fs = require("fs")

const request = require('request')

const api = require("./api.js")

// query is an array of key:value param hashes
let query = [ { "s.q": "beyond good or evil"}, { "s.ho": "t"} ]

let options = {
    url: `${api.url(query)}`,
    headers: api.headers(query),
}

console.log(options)

request(options).pipe(fs.createWriteStream("api.json"))
