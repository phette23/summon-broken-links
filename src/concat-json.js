// givendir with list of JSON files, combine them all into one
// defaults to data/analysis dir but you can pass it data/results & it'll work
// puts the combined "all.json" file in the directory you target
const fs = require("fs")
const path = require("path")

const async = require("async")

const stringify = require("./stringify.js")
let outfile = 'all.json'
let dir = process.argv[2] || 'data/analysis'

// async function, must return callback(err, result)
function readJSON (file, callback) {
    fs.readFile(path.join(dir, file), (err, data) => {
        data = JSON.parse(data)
        if (data.documents) data = data.documents
        return callback(err, data)
    })
}

function combineAndWrite (err, result) {
    if (err) throw err
    let output = []
    // result is an array of arrays
    result.forEach(arr => output.push(...arr))
    // write JSON data to outfile
    fs.writeFile(path.join(dir, outfile), stringify(output), (err) => {
        if (err) throw err
        console.log(`Combined all JSON files in ${dir} into ${dir}${path.sep}${outfile}`)
    })
}

fs.readdir(dir, (err, files) => {
    if (err) throw err
    // don't add the output file to itself & infinitely recurse, skip non-JSON files
    files = files.filter(name => !name.match(outfile) && name.match(/\.json$/))
    async.map(files, readJSON, combineAndWrite)
})
