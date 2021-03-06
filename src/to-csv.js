// a naive JSON-to-CSV writer that prints to stdout, usage:
// node src/to-csv.js data.json > data.csv
const fs = require("fs")

let filename = process.argv[2]
// a map of CSV header:Summon record field pairings
// it doesn't matter if the Summon field is array, string, or boolean
let fields = {
    Title: 'Title',
    Author: 'Author',
    Link: 'link',
    Summon: 'BookMark',
    Type: 'ContentType',
    Publication: 'PublicationTitle',
    Year: 'PublicationYear',
    ID: 'ID',
    MergedId: 'MergedId',
    LinkModel: 'LinkModel',
}
let fieldNames = Object.keys(fields)
let escape = (s) => s.replace(/"/g,'""')

// flatterns & stringifies arrays while not choking on other input
// this DOES choke on arrays of objects e.g. PublicationDate_xml, Publisher_xml
function str(arg) {
    // return comma-separated string, skipping over empty entries
    if (Array.isArray(arg)) return escape(arg.filter(i => i != '').join(', '))
    if (typeof arg === 'string') return escape(arg)
    return ''
}

fs.readFile(filename, 'utf8', (err, data) => {
    if (err) throw err
    let docs = JSON.parse(data)
    // abstract over analysis vs results files
    if (docs.documents) docs = docs.documents
    // print header row
    console.log(`"${fieldNames.join('","')}"`)
    docs.forEach(d => {
        let strings = fieldNames.map(field => str(d[fields[field]]))
        console.log(`"${strings.join('","')}"`)
    })
})
