// to consistently format JSON output the same
module.exports = (obj) => {
    return JSON.stringify(obj, null, '\t')
}
