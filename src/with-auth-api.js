#!/usr/bin/env node
const fs = require("fs")

const request = require('request')

const api = require("./api.js")

// query is an array of key:value param hashes
// https://developers.exlibrisgroup.com/summon/apis/searchapi/query/
let query = [ { "s.q": "latinx"}, { "s.fvf": "IsFullText,true,f"}, { "s.ho": "t"} ]

let options = {
    url: `${api.url(query)}`,
    headers: api.headers(query),
}

console.log(options)

request(options).pipe(fs.createWriteStream("api.json"))
