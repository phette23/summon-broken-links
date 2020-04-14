// take analysis results from a CSV and merge them with the results JSON records
// also un-proxy destination URLs along the way
const fs = require('fs')
const csv = require('csv')
const unproxyDomain = require('./unproxy-domain.js')
const stringify = require("./stringify.js")
const csvfile = process.argv[2] || 'data/2020-04-results.csv'
const jsonfile = process.argv[3] || 'data/results/all.json'
let docs = [] // we'll compile the output here

const addLinkCheckToDoc = (row) => {
    // (unanswered) question of whether ID or MergedId is a better identifier
    // this value will change depending on the structure of the results CSV
    const rowIdIndex = 7
    let len = row.length
    // find document with an ID matching the CSV row
    doc = docs.find(d => row[rowIdIndex] === d.ID[0])
    // create the link_check annotation, last 5 columns of the CSV are the
    // link_check, in this order, easiest to just get them by position
    doc.link_check = {
        // unproxy destination URLs
        destination: unproxyDomain(row[len - 5]),
        resolves_to_full_text: CSVBoolean(row[len - 4]),
        full_text: CSVBoolean(row[len - 3]),
        duplicate: CSVBoolean(row[len - 2]),
        notes: row[len - 1]
    }
}
// boolean values CSV export from a Google spreadsheet are either  "TRUE",
// "FALSE", or empty (implies false)
const CSVBoolean = (str) => str === "TRUE" ? true : false
const print = (obj) => console.log(stringify(obj))

fs.readFile(jsonfile, (err, data) => {
    if (err) throw err
    docs = JSON.parse(data)
    fs.createReadStream(csvfile)
        .pipe(csv.parse({ from_line: 2 })) // skip header
        .pipe(csv.transform(addLinkCheckToDoc))
        .on('finish', () => print(docs))
})
