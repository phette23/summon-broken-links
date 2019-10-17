# Broken Links in Summon

- select queries to study
- execute queries, save data
- check links of top ten results
- classify link breakages & compile summary statistics

## select queries to study

Date range for queries data: August 1st, 2018 to July 31st, 2019.

We have Google Analytics configured for our discovery layer with a site search component that tracks the value of the `q` parameter in the query string. I downloaded all analytics data paging through 5,000 rows at a time, then removed the extraneous information Google adds that makes them invalid CSVs (a hash-surrounded box at the top, daily data after the selected data), and used `csvstack` to combine them into one complete list.

There were 17,715 searches over the time period in question and 12,098 distinct queries. Thus the median number of times each query was executed was one. The most popular search was executed only 154 times or a slightly less than 1% share of all queries, though a differing capitalization of the same query also was very popular and combining the two puts them at almost exactly 1%. I contemplated whether to select queries based on popularity (pros: most impactful results, cons: most popular queries tend to be short & do not represent all types of queries) versus randomly choosing from all possible queries (pros: most diverse queries represented, cons: some queries may be broken due to misspellings or return zero results for other reasons). Given the massive long-tail distribution of search terms, random selection seems suitable. Inspecting our top 10 queries also justifies this; they tend to be the names of major subscription resources or individual titles. These are unlikely to yield interesting or useful results, since our users will often utilize on a "best bet" link and not their search results.

Note that, by only inspecting search _terms_, we do lose the context of a complete query where facets may be employed. In practice, people rarely use facets, but this is a consideration that should not be ignored, particularly because we would be able to perfectly recreate faceted searches with the Summon API in the next step.

`node src/select-random-queries.js > data/queries.json`

## execute queries, save data

Date query data was collected: October 10, 2019.

Summon has an official API that requires obtaining an API key and creating a specially formatted hash digest for use in an HTTP header. I spent a significant amount of time trying to create authenticated API requests, only to be ultimately informed by support that their documentation was outdated and, in some cases, simply wrong. Some pieces that needed to be noted: the query string must be sorted alphabetically when you construct the hash digest and you must use a `s.q` parameter for the query text and not "q" like some of the documentation's examples use (all query parameters appear to have a "s." prefix).

As I tested initially, a decent amount of results were links to our catalog and a very small number were citation-only links not intended to yield full text. For my purposes, I chose to remove these from my search results by adding both the "[holdings only](https://developers.exlibrisgroup.com/summon/apis/SearchAPI/Query/Parameters/HoldingsOnly/)" and "full text online" (a [facet value filter](https://developers.exlibrisgroup.com/summon/apis/SearchAPI/Query/Parameters/FacetValueFilter/) of "IsFullText,true,f") parameters. The script I wrote iterates over all search terms in data/queries.json and saves the result sets to data/analysis in numbered files starting from 0.

`node src/get-query-results.js`

## check links of top ten results

Once we have a series of search results, we can systematically review each to see if their links resolve successfully. The search result records contain `link` fields that seem to be what Summon uses itself, though there are other URLs in the records which one could use (e.g. a `URI` array and an `openUrl` that can be passed to our link resolver). I chose to use `link` and wrote an interactive script which iterates over search results in a given JSON file, printing some basic metadata while opening the `link` in a web browser for review. The script then asks a few questions:

- what URL did you end up on?
- was it the full text?
- if not, can you _eventually_ navigate to the full text?
- if you weren't taken directly to the full text, optionally fill in some notes on what happened

These data are embedded into the original search result record then saved to JSON files in data/analysis analogous to the results files.

For all but the first (URL) question, there is an aspect of judgment. Even answering "is this the full text?" is not so straightforward. Often, an OpenURL link will resolve not directly to a single article but to a query within a database. If there was only one result and it was the desired article, I counted these sorts of links as successfully retrieving full text, even if in actuality users must take one additional step to read the resource. "Eventually navigating to the full text" is obviously even more subjective and might vary from easily browsing from an index to a specific article to repeatedly rephrasing a search query until it yields useful results. It is hard to categorize or quantity these search efforts but my basic guideline was to try to locate full text _from where Summon took me_, e.g. not restarting with Google or another external search tool, while spending no more than five minutes editing my queries. I suspect that most library users would not put even that much effort into locating a source but that is a separate study.

`node src/check-links.js`

## classify link breakages & compile summary statistics

Chunking up analysis by different files makes it easier to review the hundreds of links ten at a time but also leads to our data spread across several files. We can concatenate these with

`node src/concat-json.js`

and then remove specific publication data to anonymize them

`node src/anonymize.js`

resulting in a file data/anonymized-analysis.json that contains generic record information and the outcome of our link check. One last step is to generate summary statistics **(WIP)**:

`node src/summary-stats.js`
