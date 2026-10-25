# Search visibility

Website: <https://antonkuehr.github.io/akrobotics/>.

## Policy

From 25 October 2026, the portfolio is intended to be reached through shared links, including applications and LinkedIn, rather than general search results. Keep all existing page and document URLs stable. Visitors do not need an account or password.

Every content page, the error page and the wordmark preview contain this static HTML metadata:

```html
<meta name="robots" content="noindex, follow, noimageindex" />
```

`noindex` asks supporting search engines to exclude the page from results. `follow` allows crawlers to discover the other pages and read their exclusion instructions. `noimageindex` additionally asks Google not to index images from these pages; images discovered elsewhere may still appear.

Keep crawling allowed: blocking crawlers in `robots.txt` would prevent them from reading `noindex`. Crawlers read robots files at the hostname root; this project’s `/akrobotics/robots.txt` is not a host-wide configuration. Page metadata is the exclusion mechanism.

The previous sitemap and its robots-file advertisement have been removed. Do not submit new sitemaps or request indexing. Canonical URLs, descriptions, structured data and social preview metadata remain so links and shared previews still describe the portfolio correctly.

Keep `googlebdaa3890157682d4.html` unchanged. It verifies ownership for Google Search Console and contains no portfolio content.

## Publishing and removal

Local changes do not affect the published site until deployed. After publication:

1. Verify that the homepage and every project URL still return HTTP 200 and include the exclusion metadata in the delivered HTML.
2. In the [Google Search Console](https://search.google.com/search-console) property for `https://antonkuehr.github.io/akrobotics/`, use URL inspection to test the live page and confirm that `noindex` is detected. Exclusion from indexing is now expected.
3. For faster removal of existing Google results, use **Removals → New request → Temporarily remove URL**, enter `https://antonkuehr.github.io/akrobotics/`, and select **Remove all URLs with this prefix**. This affects Google results, not visitor access. The temporary request lasts about six months; the deployed `noindex` tags provide the ongoing page exclusion.
4. Remove any old sitemap submission from Search Console. Monitor exclusion status separately from the submission status; a submitted request does not prove that results have disappeared.

Search engines must revisit and process the pages before existing results disappear. Timing varies and immediate removal is not guaranteed. This configuration does not control how LinkedIn ranks.

## Limits

The site remains public: anyone who obtains its URL can visit, share or copy it. Search exclusion is not access control, and crawlers that ignore these instructions can still index it.

HTML metadata does not apply to linked PDFs or other files served independently. Permanent search exclusion of those resources requires an `X-Robots-Tag: noindex` HTTP response header or another hosting/access arrangement. GitHub Pages does not provide per-file custom response-header configuration in this repository. This change preserves all document downloads and does not claim to deindex them. The prefix removal request can temporarily hide matching file URLs from Google, but does not provide permanent file exclusion.

## References

- [Google: block indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google: robots metadata, including noimageindex](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Google: temporary removals](https://support.google.com/webmasters/answer/9689846)
- [Bing: noindex and indexing](https://www.bing.com/webmasters/help/why-is-my-site-not-in-the-index-2141dfab)
