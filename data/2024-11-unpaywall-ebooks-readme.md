# Unpaywall Ebooks

Based on reports that Unpaywall ebook links weren't going to full text, I fixed some issues with this old project and edited [get-query-results.js](../src/get-query-results.js) to search for them with these parameters:

- Database = Unpaywall (fvf=DatabaseName,Unpaywall,f)
- eBook Full Text Online (ebooks.only=true)
- Include matches in full text (include.ft.matches=true)

I looked at our web analytics and downloaded all the queries executed over the last 90 days. I randomly selected 25 queries before retreiving results. A few searches retrieved no results (e.g. "Queer punk 80's", sadly). I reviewed up to the first ten results for each query. The [check-links.js](../src/check-links.js) script opens the record's `link` field; this may not necessarily be the link Unpaywall provides, it may come from another metadata source.

General findings: 36% of links failed to retrieve the full text. This is much higher than I'd expect given my previous results, especially since they're all Direct Links and not OpenURL. Records which included metadata from non-Unpaywall sources worked at much higher rates, visible in the higher percentages under SourceID and SourceType. You can also see the domains for DOAB and Worldbank work well but many smaller sources with only one or a few records can fail.

| Type | Total | Percent |
|------|-------|---------|
| Working link | 91 | 64.08% |
| Broken link | 51 | 35.92% |
| Frontmatter only | 28 | 19.72% |
| Single chapter/article | 5 | 3.52% |
| Paywalled | 5 | 3.52% |
| Clarivate ad | 3 | 2.11% |

The most common problem was that links went only to some portion of frontmatter (title page, colophon, table of contents, preface, etc.) but not the complete work. Three links went to the exact same advertisement for a Clarivate demand-driven acquisition product, completed unrelated to the record. The worst link, though, lead to a domain that's since been taken over by a gambling site.
