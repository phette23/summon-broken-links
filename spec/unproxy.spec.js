describe("test unproxyDomain function", function() {
    const unproxyDomain = require('../src/unproxy-domain')
    it("removes the proxied domain & replaces with the original", function() {
        // JSTOR
        expect(unproxyDomain('https://www-jstor-org.proxy.cca.edu/openurl?issn=0012-9658&volume=96&date=2015&issue=12&spage=3394&aulast=ESA')).toBe('https://www.jstor.org/openurl?issn=0012-9658&volume=96&date=2015&issue=12&spage=3394&aulast=ESA');

        // ProQuest
        expect(unproxyDomain('https://search-proquest-com.proxy.cca.edu/docview/2213162471?pq-origsite=summon')).toBe('https://search.proquest.com/docview/2213162471?pq-origsite=summon')
        // should stay the same
        let u = 'https://doaj.org/article/9e8d70917da24a48822e000a164e8407'
        expect(unproxyDomain(u)).toBe(u)

        // Nexis Uni
        expect(unproxyDomain('https://advance-lexis-com.proxy.cca.edu/search?crid=44728160-4027-410f-8aba-0edfadf4e2f3&pdsearchterms=Title(Electric+Ladyland+in+the+Army+The+Story+of+Private+First+Class+Jimi+Hendrix+in+the+101st+Airborne+Division)&pdtypeofsearch=urlapi&pdfiltertext=urn%3Ahlct%3A3&pdstartin=urn%3Ahlct%3A3&pdsearchtype=bool&pdpost=%2CMTA2MjE4NQ%5Esource%5EArmy+Lawyer%5ESource%5EFalse%5Eanalytical-materials&pdmfid=1516831&pdisurlapi=true')).toBe('https://advance.lexis.com/search?crid=44728160-4027-410f-8aba-0edfadf4e2f3&pdsearchterms=Title(Electric+Ladyland+in+the+Army+The+Story+of+Private+First+Class+Jimi+Hendrix+in+the+101st+Airborne+Division)&pdtypeofsearch=urlapi&pdfiltertext=urn%3Ahlct%3A3&pdstartin=urn%3Ahlct%3A3&pdsearchtype=bool&pdpost=%2CMTA2MjE4NQ%5Esource%5EArmy+Lawyer%5ESource%5EFalse%5Eanalytical-materials&pdmfid=1516831&pdisurlapi=true')

        // edge case that naively deleting the proxy domain & then converting
        // '-' into '.' won't work on
        u = 'http://unproxied-domain.using-hyphens.com'
        expect(unproxyDomain(u)).toBe(u)

        // TODO what does EZproxy do to a domain with hyphens in it originally?
    })
})
