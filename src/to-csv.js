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
    SourceType: 'SourceType',
    Source: 'SourceID',
    PublicationDecade: 'PublicationDecade',
    Scholarly: 'IsScholarly',
    PeerReviewed: 'IsPeerReviewed',
    OpenAccess: 'IsOpenAccess',
    FullTextHit: 'isFullTextHit',
}
let fieldNames = Object.keys(fields)
let linkCheckFields = [
    "destination",
    "resolves_to_full_text",
    "duplicate",
    "full_text",
    "notes",
]
let escape = (s) => s.replace(/"/g,'""')

// flatterns & stringifies arrays while not choking on other input
// this DOES choke on arrays of objects e.g. PublicationDate_xml, Publisher_xml
// str(true) => "true", str([1, 2]) => "1, 2", str({}) => ''
function str(arg) {
    // return comma-separated string, skipping over empty entries
    if (Array.isArray(arg)) return escape(arg.filter(i => i != '').join(', '))
    if (typeof arg === 'string') return escape(arg)
    if (typeof arg === 'boolean') return arg.toString()
    return ''
}

fs.readFile(filename, 'utf8', (err, data) => {
    if (err) throw err
    let docs = JSON.parse(data)
    // abstract over analysis vs results files
    if (docs.documents) docs = docs.documents

    // print header row
    process.stdout.write(`"${fieldNames.join('","')}"`)

    // if we have link_check data include that in CSV as well
    if (docs[0].link_check) process.stdout.write(`,"${linkCheckFields.join('","')}"`)
    process.stdout.write('\n')

    docs.forEach(d => {
        let strings = fieldNames.map(field => str(d[fields[field]]))
        if (d.link_check) linkCheckFields.forEach(f => {
            // convert nulls to empty string
            if (d["link_check"][f] !== null) return strings.push(d["link_check"][f].toString())
            return strings.push("")
        })
        console.log(`"${strings.join('","')}"`)
    })
})
