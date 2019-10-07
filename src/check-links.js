const fs = require("fs")

const chalk = require("chalk")
const opn = require("opn")
const prompt = require("prompt")
const striptags = require("striptags")

const stringify = require("./stringify.js")
const print = console.log
// the help make prompt properties such that typing y/n -> true/false values
let yn_regex = /^[yn]$/
let convertYNToBoolean = (value) => {
    return value === 'n' ? false : true
}
let results = []
let filename = ''

// prompt questions - continue analying files or stop
let continue_schema = {
    properties: {
        continue: {
            description: 'Do you want to analyze another file?',
            type: 'string',
            message: 'please type "y" for "yes" or "n" for "no"',
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
            // required: true
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
        // notes: {
        //     description: 'Notes (optional): ',
        //     type: 'string'
        // }
    }
};

function getData() {
    // clear out previous global values
    results = []
    filename = ''
    let data = {}
    // ask what file we're analyzing
    prompt.get(['filename'], (err, answers) => {
        if (err) throw err
        filename = answers.filename
        try {
            data = JSON.parse(fs.readFileSync(filename))
        } catch (e) {
            print(`Error opening file "${filename}". Check that the path is correct.`)
            throw e;
        }
        print(`Received ${data.documents.length} results for query [ ${data.query.original_query} ]`)
        return askQuestions(data.documents)
    })
}

function askQuestions(documents, index) {
    // start at the top if we don't know where we are
    if (index === undefined) index = 0
    // we're done; write results to file & ask if we should continue
    if (index === documents.length) {
        print(chalk.bold(`Finished checking documents in ${filename}`))
        fs.writeFile(`${filename.replace('results', 'analysis')}`, stringify(results), (err) => {
            if (err) throw err
            print(`wrote results to ${filename.replace('results', 'analysis')}`)
            prompt.get(continue_schema, (err, answers) => {
                if (!answers.continue) process.exit(0)
                results = []
                return getData()
            })
        })
    } else {
        // ask questions about document
        doc = documents[index]
        print(`Document no. ${index + 1} of ${documents.length}`)
        print(chalk.cyan.bold(striptags(doc.full_title)))
        if (doc.authors && doc.authors.length) {
            print(chalk.cyan.bold(`Authors: ${doc.authors.map(author => author.fullname).join(', ')}.`))
        }
        // give user two seconds to read document title, then open its URL
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
print('What file do you want to start with? (e.g. data/results/1.json)')
getData()
