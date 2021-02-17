# Broken Links in Summon

This repository contains software to study linking in the Summon discovery layer. In the "data" directory, it also contains the results of two studies—one from October 2019 and one from April 2020 (post-Central Discovery Index)—using California College of the Arts' Summon instance.

It should be possible to execute a study yourself by following the steps below. To obtain data from the Summon API, you need to ask their support team for an API key, then copy the example.config.json file to config.json while filling in your authorization key and organizational access code (final subdomain of your Summon instance). To run these scripts, install [node](https://nodejs.org/en/) and then add the dependencies by running `npm install` inside this project's directory.

## Select queries to study

Date range for queries data: August 1st, 2018 to July 31st, 2019.

We have Google Analytics configured for our discovery layer with a site search component that tracks the value of the `q` parameter in the query string. I downloaded all analytics data, paging through 5,000 rows at a time, removed the extraneous information Google adds that makes them invalid CSVs (a hash-surrounded box at the top, daily data after the selected data), and used the `csvstack` python utility to combine them into one complete list.

There were 17,715 searches over the time period in question and 12,098 distinct queries. Thus the median number of times each query was executed was once. The most popular search was executed only 154 times, less than a 1% share of all queries, though a differing capitalization of the same query also was very popular and combining the two puts them at almost exactly 1%. I contemplated whether to select queries based on popularity (pros: most impactful results, cons: most popular queries tend to be short & do not represent all types of queries) versus randomly choosing from all possible queries (pros: most diverse queries represented, cons: some queries may be broken due to misspellings or return zero results for other reasons). Given the massive long-tail distribution of search terms, random selection was suitable. Inspecting our top ten queries also justifies this; they tend to be the names of major subscription resources or individual titles. These are unlikely to yield interesting or useful results, since our users will often utilize a "best bet" link and not their search results.

Note that, by only inspecting search _terms_, we do lose the context of a complete query where facets may be employed. In practice, people rarely use facets, but this is a consideration that should not be ignored, particularly because we would be able to perfectly recreate faceted searches with the Summon API in the next step.

`node src/select-random-queries.js data/all-search-terms.csv > data/queries.json`

## Execute queries, save results data

Date query data was collected: October 10, 2019.

Summon has an official API that requires obtaining an API key and creating a specially formatted hash digest for use in an HTTP header. I spent a significant amount of time trying to create authenticated API requests, only to be ultimately informed by support that their documentation was outdated and, in some cases, simply wrong. Some pieces that needed to be noted: the query string must be sorted alphabetically when you construct the hash digest and you must use a `s.q` parameter for the query text, not "q" like some of the documentation's examples use (all query parameters appear to have a "s." prefix).

As I tested initially, a decent amount of results were links to our catalog and a very small number were citation-only links not intended to yield full text. For my purposes, I chose to remove these from my search results by adding both the "[holdings only](https://developers.exlibrisgroup.com/summon/apis/SearchAPI/Query/Parameters/HoldingsOnly/)" and "full text online" (a [facet value filter](https://developers.exlibrisgroup.com/summon/apis/SearchAPI/Query/Parameters/FacetValueFilter/) of "IsFullText,true,f") parameters. The script I wrote iterates over all search terms in data/queries.json and saves the result sets to data/results in numbered files starting from 0.

`node src/get-query-results.js`

## Check links of top ten results

Date links were checked: October 14-17, 2019.

Once we have a series of search results, we can systematically review them to see if their links resolve successfully. The search result records contain `link` fields that seem to be what Summon uses itself, though there are other URLs in the records which one could use (e.g. a `URI` array and an `openUrl` that can be passed to a link resolver). I chose to use `link` and wrote an interactive script which iterates over the search results in a given JSON file, printing some basic metadata while opening the `link` in a web browser for review. The script then asks a few questions:

- what URL did you end up on?
- was it the full text?
- if not, can you _eventually_ navigate to the full text?
- is this item a duplicate of another in the same search?
- if you weren't taken directly to the full text, optionally fill in some notes on what happened

These data are embedded into the original search result record then saved to JSON files in data/analysis, analogous to the results files.

For all but the first (URL) question, there is a subjective element. Even answering "is this the full text?" is not so straightforward. Often, an OpenURL link will resolve not directly to a single article but to a query within a database. If there was only one result and it was the desired article, I counted these sorts of links as successfully retrieving full text, even if in actuality users must take one additional step to read the resource. In some cases, this meant that a link to a query which retrieves three or even two results, with the correct resource amongst them, was marked broken, but I find it better to have a hard criteria than to make exceptions. After all, the promise is that links yield the full text and nothing else.

"Eventually navigating to the full text" is obviously even more subjective and might vary from easily browsing from a journal's index page to a specific article, to repeatedly rephrasing a search query until it yields the desired document. It is hard to categorize or quantify these search efforts but my guiding principle was to try to locate full text _from where Summon took me_, e.g. not restarting with Google or another external search tool, while spending no more than five minutes looking. I suspect that most library users would not put even that much effort into locating a source, but alas that is for a separate study to determine.

`node src/check-links.js`

Alternatively, to let people unfamiliar with the command line perform link checks, I wrote utilities to translate JSON results data to and from a CSV, which could be annotated in spreadsheet software by adding five additional columns (in the same order listed above: destination URL, resolves to full text boolean, eventual full text boolean, duplicate boolean, and notes) and then filling in their values for each row. The names of the new columns do not matter, as long as they are the last (right-most) five columns. In Google Spreadsheets, I used "checkbox" data validation (select the range > Data > Data Validation > Criteria: Checkbox) which fills in a checked cell with the string "TRUE". Once you're finished checking all links, the results can be downloaded/saved as a CSV, converted back to JSON, and processed by the final steps described in the next section.

```sh
> node src/concat-json.js data/results
> node src/to-csv.js data/results/all.json > data/results/all.csv
> # edit CSV, check all links, download it e.g. as "data/analysis/analysis.csv"
> node src/merge-analysis-csv-and-results-json.js data/analysis/analysis.csv > data/analysis/all.json
```

## Aggregate data & compile summary statistics

Chunking up analysis makes it easier to review the hundreds of links ten at a time but also leads to data spread across several files. We can concatenate, anonymize, and summarize these with a series of scripts that can be run in sequence:

`node src/concat-json.js && node src/anonymize.js && node src/summary-stats.js`

Since these all operate on files created by previous scripts in predictable locations, they do not need to take any parameters. They produce a file data/anonymized-analysis.json that contains generic record information modified with the outcome of our investigation from the last section stored in a `link_check` property. Summary statistics are printed to the screen as well as recorded in a file data/summary-statistics.json. These figures show the nature of all documents across all queries, the nature of documents with broken links, and the nature of documents with functional links. Finally, the broken link percentage of several record properties are calculated.

## LICENSE

[ECL Version 2.0](https://opensource.org/licenses/ECL-2.0)
