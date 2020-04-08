let proxyDomain = '.proxy.cca.edu'

function unproxyDomain(str) {
    /* turn proxied domain www-db-com.proxy.cca.edu into www.db.com
    * args: proxied URL (str)
    * returns: URL with original domain (str)
    */
    let u = new URL(str)
    let domain = u.hostname
    // un-proxied domains stay the same
    if (!domain.match(proxyDomain)) return str
    u.hostname = domain.match(/^(.*?)\./)[1].replace(/-/g, '.')
    return u.toString()
}

module.exports = unproxyDomain

// if we're being run on command line, unproxy the command's first arg
if (require.main == module) {
    console.log(unproxyDomain(process.argv[2]))
}
