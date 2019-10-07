// given CSV, return X random entries
// usage: node select-random-queries.js data.csv > queries.json
const fs = require('fs')

const csv = require('csv')

const stringify = require("./stringify.js")
let file = process.argv[2] || 'data/all-search-terms.csv'
let queries = []
let selectNAtRandom = (array, n) => {
    let randos = new Array(n)
    let len = array.length
    for (var i = 0; i < n; i++) {
        randos[i] = array.splice(Math.floor(Math.random()*(len-i)), 1)[0]
    }
    return randos
}

let addToQueries = (record) => {
    queries.push(record[0])
}

let print = (obj) => {
    console.log(stringify(obj))
}

fs.createReadStream(file)
    .pipe(csv.parse({ from_line: 2 })) // skip header
    .pipe(csv.transform(addToQueries))
    .on('finish', () => {
        print(selectNAtRandom(queries, 50))
    })
