#!/usr/bin/env node
const fs = require("fs")

const request = require('request')

const api = require("./api.js")

let getResults = (query, index) => {
    // query is an array of key:value param hashes
    // https://developers.exlibrisgroup.com/summon/apis/searchapi/query/
    let q = {
        "s.q": query,
        "s.fvf": "DatabaseName,Unpaywall,f",
        "s.ho": "t",
        "s.ebooks.only": "true",
        "s.include.ft.matches": "t",
    }
    let options = {
        url: `${api.url(q)}`,
        headers: api.headers(q),
    }
    request(options).pipe(fs.createWriteStream(`data/results/${index}.json`))
}

fs.readFile('data/queries.json', 'utf8', (err, data) => {
    if (err) throw err
    JSON.parse(data).forEach(getResults)
})
