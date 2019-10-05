// given "analyis" dir with list of JSON files, combine them all into one
const fs = require("fs")
const path = require("path")

const async = require("async")

let outfile = 'all.json'
let dir = 'data/analysis'

// async function, must return callback(err, result)
function readJSON (file, callback) {
    fs.readFile(path.join(dir, file), (err, data) => {
        data = JSON.parse(data)
        return callback(err, data)
    })
}

function combineAndWrite (err, result) {
    let output = []
    // result is an array of arrays
    result.forEach(arr => output.push(...arr))
    // write JSON data to outfile
    fs.writeFile(path.join(dir, outfile), JSON.stringify(output, null, 2), (err) => {
        if (err) throw err
        console.log(`Combined all JSON files in ${dir} into ${outfile}`)
    })
}

fs.readdir(dir, (err, files) => {
    if (err) throw err
    // don't add the output file to itself & infinitely recurse
    files = files.filter(name => !name.match(outfile))
    async.map(files, readJSON, combineAndWrite)
})
