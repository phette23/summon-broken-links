// identify articles that look like dupes (have identical titles)
const fs = require("fs")
const path = require("path")

const async = require("async")

const stringify = require("./stringify.js")
const dir = 'data/results'

// only does a naive check for identical titles
function checkDupes(docs) {
    let dupes = []
    while (docs.length > 0) {
        let doc = docs.shift()
        let title = doc.Title[0]
        // title is included in other documents' titles
        if (docs.map(d => d.Title[0]).includes(title)) {
            // add this doc to dupes
            dupes.push(doc)
            // iterate & find other matching docs, splicing them off
            while (docs.map(d => d.Title[0]).indexOf(title) > -1) {
                let index = docs.map(d => d.Title[0]).indexOf(title)
                dupes.push(docs[index])
                docs.splice(index, 1)
            }
        }
    }
    return dupes
}

function readFiles(filename, callback) {
    fs.readFile(path.join(dir, filename), (err, data) => {
        data = JSON.parse(data)
        var results = checkDupes(data.documents)
        return callback(err, results)
    })
}

fs.readdir(dir, (err, files) => {
    if (err) throw err
    async.map(files, readFiles, (err, results) => {
        // results is array of arrays
        fs.writeFile('data/duplicates.json', stringify(results.flat()), (err) => {
            if (err) throw err
            console.log('Wrote potential list of duplicate records to data/duplicates.json.')
        })
    })
})
