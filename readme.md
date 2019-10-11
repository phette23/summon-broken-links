# Broken Links in Summon

- select queries to study
- execute queries, save data
- check links of top ten results
- individually analyze/classify link breakages
- compile summary statistics

## select queries to study

Date range for queries data: August 1st, 2018 to July 31st, 2019.

We have Google Analytics configured for our discovery layer with a site search component that tracks the value of the `q` parameter in the query string. I downloaded all analytics data paging through 5,000 rows at a time, then removed the extraneous information Google adds that makes them invalid CSVs (a hash-surrounded box at the top, daily data after the selected data), and used `csvstack` to combine them into one complete list.

There were 17,715 searches over the time period in question and 12,098 distinct queries. Thus the median number of times each query was executed was one. The most popular search was executed only 154 times or a slightly less than 1% share of all queries, though a differing capitalization of the same query also was very popular and combining the two puts them at almost exactly 1%. I contemplated whether to select queries based on popularity (pros: most impactful results, cons: most popular queries tend to be short & do not represent all types of queries) versus randomly choosing from all possible queries (pros: most diverse queries represented, cons: some queries may be broken due to misspellings or return zero results for other reasons). Given the massive long-tail distribution of search terms, random selection seems suitable. Inspecting our top 10 queries also justifies this; they tend to be the names of major subscription resources or individual titles. These are unlikely to yield interesting or useful results, since our users will often utilize on a "best bet" link and not their search results.

Note that, by only inspecting search _terms_, we do lose the context of a complete query where facets may be employed. In practice, people rarely use facets, but this is a consideration that should not be ignored, particularly because we would be able to perfectly recreate faceted searches with the Summon API in the next step.

`node src/select-random-queries.js > data/queries.json`

## execute queries, save data

Summon has an official API that requires obtaining an API key and creating a specially formatted hash digest for use in an HTTP header. I spent a significant amount of time trying to get this to work, only to be ultimately informed by support that their documentation was outdated and, in some cases, simply wrong. Some pieces that needed to be noted: the query string must be sorted alphabetically when you construct the hash digest and you must use a `s.q` parameter for the query text and not "q" like some of their examples use (all query parameters seem to have a "s." prefix).

As I tested initially, a decent amount of results were links to our catalog and a very small number were citation-only links not intended to yield full text. For my purposes, I chose to remove these from my search results by adding both the "[holdings only](https://developers.exlibrisgroup.com/summon/apis/SearchAPI/Query/Parameters/HoldingsOnly/)" and "full text online" (a [facet value filter](https://developers.exlibrisgroup.com/summon/apis/SearchAPI/Query/Parameters/FacetValueFilter/) of "IsFullText,true,f") parameters. The script I wrote iterates over all search terms in data/queries.json and saves the result sets to data/analysis in numbered files starting from 0.

`node src/get-query-results.js`

## check links of top ten results

Once we have a series of search results, we can systematically review each to see if their links resolve. The search result records have a `link` field that seems to be what Summon uses itself, though there are other links in the record that one could use (e.g. a `URI` array). I chose to use `link` and wrote an interactive script which iterates over search results in a given JSON file, telling you some basic metadata while opening the `link` in a browser for review. The script then asks you a few questions:

- what URL did you end up on?
- was it the full text?
- if not, can you _eventually_ navigate to the full text? This might involve browsing from an index to a specific article or rephrasing a search query. It is hard to categorize or quantity these search efforts but my basic guideline was to try to locate full text _from where Summon took me_ e.g. not restarting with Google or another external search tool
- if you weren't taken directly to the full text, optionally fill in some notes on what happened

These data are embedded into the original search result record then saved to JSON files in data/analysis analogous to the results files.

`node src/check-links.js`

## individually analyze/classify link breakages

`node src/concat-json.js`

## compile summary statistics
