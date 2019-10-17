const fs = require("fs")

const stringify = require("./stringify.js")

const outfile = 'data/summary-statistics.json'

/**
 * for given boolean properties of items in array, what percent are true?
 * @param {string|function} property - either the property name to run a boolean
 * check on or a filter method to run over the array e.g. array.filter(property)
 * @param {array} array - array of items to check
 * @returns {string} percentage of array items for which item[property] is true
 * or (in the function form) property(item) returns true
 */
function percentTrue(property, array) {
    let filter = property
    if (typeof property === 'string') {
        filter = i => i[property]
    }
    let numTrue = array.filter(filter).length
    return ((numTrue / array.length) * 100).toFixed(2) + '%'
}

/**
 * a lot of record properties are arrays, this unpacks them to find all unique
 * values that their entries take on
 * @param {string} property - Summon record property name
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
 * Summarize a set of analysis documents.
 * @param {array} docs - Summon documents
 * @returns {object} a descriptive object summarizing the properties of the docs
 * with particular attention to their link_check.resolves_to_full_text field
 */
function summarize(docs) {
    // flatten link_check to make code below a little cleaner/easier
    docs = docs.map(d => {
        Object.keys(d.link_check).forEach(f => d[`link_check_${f}`] = d.link_check[f])
        return d
    })
    // subsets of just the docs with broken or working links
    let broken = docs.filter(d => !d.link_check_resolves_to_full_text)
    let working = docs.filter(d => d.link_check_resolves_to_full_text)
    let summary = {
        "All Documents": {
            "count": docs.length,
            "hasFullText": percentTrue("hasFullText", docs),
            "inHoldings": percentTrue("inHoldings", docs),
            "isFullTextHit": percentTrue("isFullTextHit", docs),
            // several record properties are these pseudo-booleans that are
            // actually single-entry arrays of strings (:rage:), like
            // "IsPeerReviewed": [ "false" ]
            "IsOpenAccess": percentTrue(d => d.IsOpenAccess && d.IsOpenAccess[0] === "true", docs),
            "IsPeerReviewed": percentTrue(d => d.IsPeerReviewed[0] === "true", docs),
            "isPrint": percentTrue("isPrint", docs),
            "IsScholarly": percentTrue(d => d.IsScholarly[0] === "true", docs),
            "Link Works": percentTrue("link_check_resolves_to_full_text", docs),
        },
        "Broken Links": {
            "count": broken.length,
            "hasFullText": percentTrue("hasFullText", broken),
            "inHoldings": percentTrue("inHoldings", broken),
            "isFullTextHit": percentTrue("isFullTextHit", broken),
            "IsOpenAccess": percentTrue(d => d.IsOpenAccess && d.IsOpenAccess[0] === "true", broken),
            "IsPeerReviewed": percentTrue(d => d.IsPeerReviewed[0] === "true", broken),
            "isPrint": percentTrue("isPrint", broken),
            "IsScholarly": percentTrue(d => d.IsScholarly[0] === "true", broken),
            "Can Find Full Text": percentTrue("link_check_full_text", broken),
        },
        "Working Links": {
            "count": working.length,
            "hasFullText": percentTrue("hasFullText", working),
            "inHoldings": percentTrue("inHoldings", working),
            "isFullTextHit": percentTrue("isFullTextHit", working),
            "IsOpenAccess": percentTrue(d => d.IsOpenAccess && d.IsOpenAccess[0] === "true", working),
            "IsPeerReviewed": percentTrue(d => d.IsPeerReviewed[0] === "true", working),
            "isPrint": percentTrue("isPrint", working),
            "IsScholarly": percentTrue(d => d.IsScholarly[0] === "true", working),
        },
    }
    // only 2 link models currently (DirectLink & OpenURL) but this will continue
    // to  work if a new one is introduced
    enumerate("LinkModel", docs).sort().forEach(model => {
        summary["All Documents"][`${model} Link`] = percentTrue(d => d.LinkModel[0] === model, docs)
        summary["Broken Links"][`${model} Link`] = percentTrue(d => d.LinkModel[0] === model, broken)
        summary["Working Links"][`${model} Link`] = percentTrue(d => d.LinkModel[0] === model, working)
    })
    // for these more descriptive fields, let's see what percent of links break
    // for each of their values using enumerate()
    let procValues = (field) => {
        summary[field] = {}
        enumerate(field, docs).sort().forEach(type => {
            typeDocs = docs.filter(doc => doc[field].includes(type))
            summary[field][type] = {
                count: typeDocs.length,
                "Link Works": percentTrue("link_check_resolves_to_full_text", typeDocs)
            }
        })
    }
    let fields = ["ContentType", "SourceID", "SourceType", "link_check_destination"]
    fields.forEach(f => procValues(f))
    return summary
}

fs.readFile('data/anonymized-analysis.json', 'utf8', (err, data) => {
    if (err) throw err
    let summary = summarize(JSON.parse(data))
    fs.writeFile(outfile, stringify(summary), (err) => {
        if (err) throw err
        console.log(`Wrote summary statistics to ${outfile}`)
        console.log('Summary statistics:')
        console.log(stringify(summary))
    })
})
