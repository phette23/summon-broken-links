const fs = require("fs")

const stringify = require("./stringify.js")

const outfile = 'data/summary-statistics.json'

/**
 * for given boolean properties of items in array, what percent are true?
 * @param {string|function} property - either the property name to run a boolean
 * check on or a filter method to run over the array e.g. array.filter(property)
 * @param {array} array - array of items to check
 * @returns {float} percentage of array items for which item[property] is true
 * or (in the function form) property(item) returns true
 */
function percentTrue(property, array) {
    let filter = property
    if (typeof property === 'string') {
        filter = i => !!i[property]
    }
    let numTrue = array.filter(filter).length
    return ((numTrue / array.length) * 100).toFixed(2)
}

/**
 * a lot of record properties are arrays, this unpacks them & find all the unique
 * values that each array takes on
 * @param {string} property - property name
 * @param {array} array - array of items where i[property] _is also an array_
 * @returns {array} list of all the unique values that the array's items[property]
 * arrays contain
 */
function enumerate(property, array) {
    // map array to the property arrays, then flatten
    let proplist = array
        .map(i => i[property]).flat()
        // this filters to unique values (if a value has already appeared its
        // index will be > indexOf)
        .filter((value, idx, arr) => arr.indexOf(value) === idx)
    return proplist
}

/**
 * @TODO summaries for these data points:
 - ContentType
 - LinkModel
 - PublicationDecade (don't need to do PublicationCentury)
 - SourceID
 - SourceType
 - link_check.destination (domain of result URL)
 */
function summarize(docs) {
    let broken = docs.filter(d => !d.link_check.resolves_to_full_text)
    let working = docs.filter(d => d.link_check.resolves_to_full_text)
    let summary = {
        "All Documents": {
            "hasFullText": percentTrue("hasFullText", docs),
            "inHoldings": percentTrue("inHoldings", docs),
            "isFullTextHit": percentTrue("isFullTextHit", docs),
            "IsOpenAccess": percentTrue("IsOpenAccess", docs),
            "IsPeerReviewed": percentTrue("IsPeerReviewed", docs),
            "isPrint": percentTrue("isPrint", docs),
            "IsScholarly": percentTrue("IsScholarly", docs),
            "Link Works": percentTrue(d => d.link_check.resolves_to_full_text, docs),
        },
        "Broken Links": {
            "hasFullText": percentTrue("hasFullText", broken),
            "inHoldings": percentTrue("inHoldings", broken),
            "isFullTextHit": percentTrue("isFullTextHit", broken),
            "IsOpenAccess": percentTrue("IsOpenAccess", broken),
            "IsPeerReviewed": percentTrue("IsPeerReviewed", broken),
            "isPrint": percentTrue("isPrint", broken),
            "IsScholarly": percentTrue("IsScholarly", broken),
            "Can Find Full Text": percentTrue(d => d.link_check.full_text, broken),
        },
        "Working Links": {
            "hasFullText": percentTrue("hasFullText", working),
            "inHoldings": percentTrue("inHoldings", working),
            "isFullTextHit": percentTrue("isFullTextHit", working),
            "IsOpenAccess": percentTrue("IsOpenAccess", working),
            "IsPeerReviewed": percentTrue("IsPeerReviewed", working),
            "isPrint": percentTrue("isPrint", working),
            "IsScholarly": percentTrue("IsScholarly", working),
        },
    }
    // console.log(enumerate("ContentType", docs))
    // console.log(enumerate("LinkModel", docs))
    // console.log(enumerate("PublicationDecade", docs))
    // console.log(enumerate("SourceID", docs))
    // console.log(enumerate("SourceType", docs))
    return summary
}

fs.readFile('data/anonymized-analysis.json', 'utf8', (err, data) => {
    if (err) throw err
    let summary = summarize(JSON.parse(data))
    fs.writeFile(outfile, stringify(data), (err) => {
        if (err) throw err
        console.log('Summary statistics:')
        console.log(stringify(summary))
        console.log(`Wrote summary statistics to ${outfile}`)
    })
})
