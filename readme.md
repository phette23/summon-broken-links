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

`node src/select-random-queries.js`

## execute queries, save data

Summon has an official API that requires obtaining an API key and creating a specially formatted hash digest for use in an HTTP header. I spent hours trying to get this to work in JavaScript, my preferred language, while all of ProQuest's examples were in PHP or Java, languages that seem neither suitable for this work nor popular in my field enough to bother learning.

Luckily, Summon also seems to have an easy-to-use, undocumented API that does not require authorization. One can simply fill a query into the `q` parameter of the URL https://cca.summon.serialssolutions.com/api/search?ho=f&q= and receive a detailed JSON response. It appears that the limitation of this API is that it will reply "Retry later" if used too many times in succession; I was able to work around this by adding a one second delay between each HTTP request.

`node src/get-query-results.js`

## check links of top ten results

`node src/check-links.js`

## individually analyze/classify link breakages

## compile summary statistics
