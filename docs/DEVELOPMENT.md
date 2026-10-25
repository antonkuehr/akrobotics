# Development guide

## Pages and shared assets

Each project has a standalone root HTML page. Keep those filenames and the homepage section IDs stable so existing links continue to work. Shared styles live in `assets/css/styles.css`; shared behaviour lives in `assets/js/site.js`.

HTML contains the content, search metadata, inline diagrams and structured data. JavaScript enhances native disclosures and navigation, and updates ongoing duration labels. Keep essential content available when JavaScript is disabled.

The CSS groups the theme, shared layout, homepage components, project components and responsive rules. Keep comments that explain constraints or browser behaviour. Avoid appending repeated overrides when the existing component rule can be updated safely.

## Changing content or media

1. Edit the relevant page and check the factual scope against [Content sources](CONTENT.md).
2. Store project media in its project directory and general documents under `assets/site/certificates/`. Use descriptive lowercase filenames separated by hyphens.
3. Update every reference when an asset is renamed. Preserve the content of technical figures and document downloads.
4. When replacing a linked PDF, update its `?v=` value using the first 12 characters of its SHA-256 digest. Use the same value wherever that document is linked. Shared CSS and JavaScript references also have version queries; advance them across all pages when the corresponding file changes.
5. Keep `noindex, follow, noimageindex` metadata on every content page, including new pages. The site is intended for access through shared links rather than search results; do not recreate a sitemap.

Documents intended for public download should have permanent redactions of private details and reviewed metadata. A visual overlay alone does not remove the underlying text or image data. Review photos for location metadata before adding them.

## Verification

Run:

```sh
python3 scripts/check_site.py
npm run check:js
npm run format:check
```

The Python check requires Python 3.9 or newer and uses the standard library. It validates local HTML/CSS asset references, IDs and link fragments, JSON-LD syntax, search restrictions and documented Markdown links. It does not test remote services, PDF contents or rendered layout. The same checks run in `.github/workflows/site-checks.yml` for pushes and pull requests to `main`.

Preview changed pages at narrow phone and desktop widths. Check headings, text wrapping, media, disclosure open/close behaviour, keyboard navigation and horizontal overflow. External video playback and third-party destinations need manual review.

## Commits and publishing

Make focused commits with a concrete description, such as `docs: clarify local preview instructions` or `fix: align mobile CV descriptions`. Keep unrelated content and layout work separate. Do not commit generated dependencies, operating-system metadata, temporary previews or private editing notes.

GitHub Pages publishes `main` from the repository root. `.nojekyll` keeps the site static. After pushing, verify the Pages deployment and the affected live pages. Preserve the root Google verification file and public URLs.

The repository's earlier privacy cleanup changed historical commit IDs. Continue from the cleaned history; importing an older clone can reintroduce removed versions of documents and images.
