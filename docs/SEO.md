# Search maintenance

Canonical website: <https://antonkuehr.github.io/akrobotics/>.

## Files to preserve

- Each content page has its own title, description, absolute canonical URL and social preview metadata.
- The homepage contains `ProfilePage` and `Person` structured data. Project pages contain `WebPage` and `BreadcrumbList` data.
- `sitemap.xml` lists the seven public content pages. Update `lastmod` only when the corresponding page materially changes.
- `404.html` uses `noindex, follow` and is excluded from the sitemap.
- `googlebdaa3890157682d4.html` is the existing Google ownership-verification file. Keep its filename and contents unchanged.

Metadata is delivered in HTML and does not depend on JavaScript.

## Homepage description and preferred portrait

Keep this description consistent in the homepage meta description, Open Graph and Twitter descriptions, and the existing `ProfilePage` and `Person` descriptions:

> Anton Kühr is an MSc Robotics student at TU Delft with a background in mechanical engineering. Hands-on project experience spanning computer vision, auditory perception and tactile sensing for humanoid robots.

The hero’s credential paragraph names the same focus: computer vision, auditory perception and tactile sensing for humanoid robots. The homepage sitemap `lastmod` is 19 October 2026 for this copy and metadata update. Google chooses snippets for each query and may still select visible page text rather than the meta description; do not add snippet or indexing restrictions to force the wording.

The preferred portrait is `assets/site/anton-kuehr-profile-portrait.jpeg?v=46` (2479 × 2475 pixels). Its absolute URL is shared by `og:image`, `twitter:image`, `Person.image` and `ProfilePage.primaryImageOfPage`. Open Graph also records the image dimensions and JPEG type. Descriptive alt text identifies the professional portrait. The Furhat workbench photograph remains in its existing place. These are preference signals, not a guarantee of Google’s thumbnail selection.

## Search Console

Use the URL-prefix property `https://antonkuehr.github.io/akrobotics/` in [Google Search Console](https://search.google.com/search-console). Submit `sitemap.xml` under that property, then use URL inspection to check live page accessibility and indexing status.

The existing verification file and sitemap submission do not guarantee indexing or ranking. Keep the canonical URL consistent across the site, GitHub repository website field and public profiles.

### Public check on 18 October 2026

The published sitemap returned HTTP 200 with `Content-Type: application/xml`, valid XML and seven URLs. All seven pages returned HTTP 200 with matching canonical URLs and no `noindex` directives or `X-Robots-Tag` restrictions. The professional portrait returned HTTP 200 as `image/jpeg`. A separate Googlebot user-agent probe also fetched the sitemap successfully; this does not reproduce a request from Google’s actual crawler network.

No current technical sitemap fault was found. Only the homepage `lastmod` is advanced to 18 October for its content and structured-data updates; project dates are retained because shared branding changes do not justify resetting every content date. Recheck that date when publishing if the content changes further before release.

For the reported “Couldn’t fetch” status:

1. Select the exact URL-prefix property `https://antonkuehr.github.io/akrobotics/`.
2. Open the failed sitemap entry and check its full submitted URL, last attempt and detailed error. The URL should be `https://antonkuehr.github.io/akrobotics/sitemap.xml`.
3. Inspect that exact sitemap URL with **Test live URL**. Under Page availability, check that crawling is allowed and fetching succeeds. A sitemap itself does not need to be indexed as a search result.
4. Resubmit `sitemap.xml` under that property if the failed submission remains stale after the successful live test. Do not invent alternate URLs or query-string workarounds.
5. After the approved site update is published, inspect the homepage and request indexing. Inspect the reported non-indexed page separately to see its actual exclusion reason; do not assume every exclusion is an error. Check Manual actions if Google still cannot read the sitemap.

The report reflects Google’s last fetch attempt. A historical transient fetch error, an incorrect submitted URL/property or low crawl demand are possible explanations, but the public checks cannot establish which one applies to the account.

## robots.txt scope

Crawlers read `robots.txt` at the host root. This repository serves a project site under `/akrobotics/`, so its `robots.txt` is not the host-wide crawler configuration. Preserve its sitemap reference, and submit the sitemap directly through Search Console. Changes to the host-root file belong in the separate `antonkuehr.github.io` repository.

The host-root `https://antonkuehr.github.io/robots.txt` returned 404 during the public check. Google treats that response as no crawl restrictions; it does not explain a blocked sitemap by itself. The project-local robots file returned 200 and permits crawling.

## Search-result favicon scope

All portfolio pages reference the supplied final favicon consistently, including SVG, PNG, ICO and Apple Touch Icon versions. Browser favicon behaviour is separate from Google’s search-result favicon selection. Google supports one search favicon per hostname, not a separate favicon for each subdirectory. The hostname root currently returns a GitHub Pages 404 page, so any host-root homepage/favicon setup would be separate work in the root repository. Do not move or rename `/akrobotics/` to address this.

## References

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [ProfilePage structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [robots.txt scope](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)
- [Verify site ownership](https://support.google.com/webmasters/answer/9008080)
- [URL inspection](https://support.google.com/webmasters/answer/9012289)
- [Search snippets](https://developers.google.com/search/docs/appearance/snippet)
- [Preferred images and image SEO](https://developers.google.com/search/docs/appearance/google-images)
- [Search-result favicons](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [Sitemap fetch troubleshooting](https://support.google.com/webmasters/answer/7451001)
