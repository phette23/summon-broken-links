const fs = require("fs")

const chalk = require("chalk")
const opn = require("opn")
const prompt = require("prompt")
const striptags = require("striptags")

const stringify = require("./stringify.js")
const print = console.log

// striptags only strips valid HTML tags & Summon uses <h> as a "highlight" tag
let striphtml = (str) => {
    str = striptags(str)
    return str.replace(/<\/?h>/g, '')
}
// make prompt properties such that typing y/n -> true/false values
let yn_regex = /^[yn]$/
let convertYNToBoolean = (value) => {
    return value === 'n' ? false : true
}
let results = []
let filename = ''

// prompt questions - JSON filename
let filename_schema = {
    properties: {
        filename: {
            description: 'What numbered JSON file in data/results would you like to check?',
            type: 'string',
            message: 'Please type only the integer, not the path or ".json" extension.',
            pattern: /^\d*$/,
            before: (value) => `data/results/${value}.json`,
            required: true
        }
    }
}

// prompt questions - continue analyzing files or stop
let continue_schema = {
    properties: {
        continue: {
            description: 'Do you want to analyze another file?',
            type: 'string',
            message: 'Please type "y" for "yes" or "n" for "no".',
            pattern: yn_regex,
            before: convertYNToBoolean,
            required: true
        }
    }
}

// prompt questions - was link broken
let link_check_schema = {
    properties: {
        destination: {
            description: 'Final URL that you end up on: ',
            type: 'string',
            required: true
        },
        resolves_to_full_text: {
            description: 'Do you end up with the full text? (y/n) ',
            type: 'string',
            message: 'please type "y" for "yes" or "n" for "no"',
            pattern: yn_regex,
            before: convertYNToBoolean,
            required: true
        },
        full_text: {
            description: 'Can you eventually get to the full text? (y/n) ',
            type: 'string',
            message: 'please type "y" for "yes" or "n" for "no"',
            pattern: yn_regex,
            before: convertYNToBoolean,
            required: true,
            // only ask if we didn't already get full text
            ask: () => !prompt.history('resolves_to_full_text').value
        },
        notes: {
            description: 'Notes (optional): ',
            type: 'string',
            // don't ask for notes when the link just works as intended
            ask: () => !prompt.history('resolves_to_full_text').value
        }
    }
};

function getData() {
    // clear out previous global values
    results = []
    filename = ''
    // ask what file we're analyzing
    prompt.get(filename_schema, (err, answers) => {
        if (err) throw err
        filename = answers.filename
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) throw err
            data = JSON.parse(data)
            print(`Received ${data.documents.length} results for query [ ${data.query.textQueries[0].textQuery} ]`)
            return askQuestions(data.documents)
        })
    })
}

function askQuestions(documents, index=0) {
    // we're done; write results to file & ask if we should continue
    if (index === documents.length) {
        let analysis_file = filename.replace('results', 'analysis')
        print(chalk.bold(`Finished checking documents in ${filename}`))
        print(`${results.filter(d => !d.link_check.resolves_to_full_text).length} of ${results.length} links were broken.`)
        fs.writeFile(analysis_file, stringify(results), (err) => {
            if (err) throw err
            print(`Wrote results to ${analysis_file}`)
            prompt.get(continue_schema, (err, answers) => {
                if (!answers.continue) process.exit(0)
                return getData()
            })
        })
    } else {
        // ask questions about document
        doc = documents[index]
        print(`Document no. ${index + 1} of ${documents.length}`)
        print(chalk.cyan.bold(striphtml(doc.Title)))
        if (doc.Author) print(chalk.cyan.bold(`Author(s): ${striphtml(doc.Author.join('; '))}.`))
        print(chalk.blue((`https://cca.summon.serialssolutions.com/#!/search?bookMark=${doc.BookMark[0]}`)))
        // give user two seconds to read document title, then open its Summon link
        setTimeout(() => opn(doc.link), 2000)
        prompt.get(link_check_schema, (err, answers) => {
            // once we have answers, record in results
            doc.link_check = answers
            results.push(doc)
            return askQuestions(documents, ++index)
        })
    }
}

prompt.message = ''
prompt.delimiter = ''
prompt.start()
getData()
