const fs = require("fs")

const stringify = require("./stringify.js")

const outfile = 'data/anonymized-analysis.json'

function anonymize(doc) {
    adoc = {}
    // these fields we can copy over wholesale
    copyFields = [
        "ContentType",
        "hasFullText",
        "inHoldings",
        // it's pretty messed up that some of these are cap I & some lowercase
        "isFullTextHit",
        "IsOpenAccess",
        "IsPeerReviewed",
        "isPrint",
        "IsScholarly",
        "LinkModel",
        "PublicationCentury",
        "PublicationDecade",
        "SourceID",
        "SourceType",
    ]
    copyFields.forEach(f => adoc[f] = doc[f])
    // for our added "link_check" preserve only the domain of the URL
    adoc.link_check = doc.link_check
    // we use hostname because host includes the URL's port
    adoc.link_check.destination = new URL(adoc.link_check.destination).hostname
    return adoc
}

// "anonymize" analysis results by saving as much data as we can without
// referencing the specifics of the document
fs.readFile('data/analysis/all.json', 'utf8', (err, data) => {
    if (err) throw err
    data = JSON.parse(data).map(anonymize)
    fs.writeFile(outfile, stringify(data), (err) => {
        if (err) throw err
        console.log(`Wrote anonymized & shareable analysis results to ${outfile}`)
    })
})
