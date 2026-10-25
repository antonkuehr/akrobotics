# Anton Kühr — Robotics & Mechanical Engineering

Personal portfolio with education, experience and seven engineering case studies: humanoid tactile skin for Project Echo, a BSc textile tactile sensor, microphone implementation, a robot backpack, a rotating robot base, a voice-controlled cobot and an autonomous harvesting robot.

[Visit the portfolio](https://antonkuehr.github.io/akrobotics/)

The website uses plain HTML, CSS and JavaScript. GitHub Pages serves it directly from `main`; there is no build step or application framework.

## Repository layout

```text
index.html                 Portfolio homepage
*.html                     Project pages, error page and ownership verification
assets/
  css/                     Shared styling and responsive layouts
  js/                      Navigation, disclosures and date labels
  organizations/           Organisation and technology logos
  projects/                Media and technical figures, grouped by project
  site/                    Portraits, icons and public documents
docs/                      Maintenance, content sources and asset attribution
scripts/check_site.py      Local link, fragment and metadata checks
robots.txt                Crawl guidance; pages carry noindex metadata
```

## Local preview

With Python 3.9 or newer installed, run from the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open [localhost:8765](http://127.0.0.1:8765/). The preview uses the same static files as the published site.

## Checks and formatting

Check local links, section IDs, structured data and search restrictions without installing dependencies:

```sh
python3 scripts/check_site.py
```

Optional development tooling uses a pinned Prettier version. With Node.js and npm installed:

```sh
npm ci
npm run check:js
npm run format:check
npm run format
```

GitHub Actions runs these checks on pushes and pull requests to `main`. These tools do not generate or bundle the website.

## Maintenance notes

- [Development guide](docs/DEVELOPMENT.md): page structure, asset updates and publishing.
- [Content sources](docs/CONTENT.md): the basis and limits of project claims.
- [Asset attribution](docs/ASSETS.md): visual inspiration and logo sources.
- [Search visibility](docs/SEO.md): search exclusion, direct access and verification.

Project media and documents retain their original ownership. Organisation names and logos identify the relevant institutions, employers and technologies.
