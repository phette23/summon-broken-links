const fs = require('fs')
const qs = require('querystring')
const request = require('request')
const queries = JSON.parse(fs.readFileSync('data/queries.json').toString())
// ho=t -> "holdings only" mode e.g. don't show results outside our collection
const baseUrl = 'https://cca.summon.serialssolutions.com/api/search?ho=t&q='

let getResults = (q, index) => {
    let url = baseUrl + qs.escape(q)
    // one second delay between each request or some come back "Retry later"
    setTimeout(()=>{
        request(url).pipe(fs.createWriteStream('data/results/' + index + '.json'))
    }, index * 1000)
}

queries.forEach(getResults)
