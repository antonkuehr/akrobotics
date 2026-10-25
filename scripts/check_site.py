#!/usr/bin/env python3
"""Validate static-site references using only the Python standard library."""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://antonkuehr.github.io/akrobotics/"
CSS_URL = re.compile(r"url\(\s*['\"]?([^'\"\s)]+)['\"]?\s*\)")
MARKDOWN_LINK = re.compile(r"!?\[[^\]]*\]\(([^\s)]+)(?:\s+['\"][^)]*)?\)")


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids = set()
        self.references = []
        self.errors = []
        self.robots = set()
        self.capture = None
        self.buffer = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "meta" and attrs.get("name", "").lower() == "robots":
            self.robots.update(
                rule.strip().lower() for rule in attrs.get("content", "").split(",")
            )
        identifier = attrs.get("id")
        if identifier:
            if identifier in self.ids:
                self.errors.append(f"duplicate ID: {identifier}")
            self.ids.add(identifier)
        for name in ("href", "src", "poster"):
            if attrs.get(name):
                self.references.append(attrs[name])
        if attrs.get("srcset"):
            self.references.extend(
                item.strip().split()[0]
                for item in attrs["srcset"].split(",")
                if item.strip()
            )
        self.references.extend(CSS_URL.findall(attrs.get("style", "")))
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.capture = "json"
            self.buffer = []
        elif tag == "style":
            self.capture = "css"
            self.buffer = []

    def handle_data(self, data):
        if self.capture:
            self.buffer.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self.capture == "json":
            try:
                json.loads("".join(self.buffer))
            except json.JSONDecodeError as error:
                self.errors.append(f"invalid JSON-LD: {error}")
            self.capture = None
        elif tag == "style" and self.capture == "css":
            self.references.extend(CSS_URL.findall("".join(self.buffer)))
            self.capture = None


def check_reference(source, reference, pages):
    if reference.startswith(SITE):
        reference = "/" + reference[len(SITE) :]
    url = urlsplit(reference)
    if url.scheme or url.netloc:
        return None
    path = unquote(url.path)
    if not path:
        target = source
    else:
        target = (ROOT / path.lstrip("/") if path.startswith("/") else source.parent / path).resolve()
    if not target.is_relative_to(ROOT):
        return f"reference leaves the repository: {reference}"
    if target.is_dir():
        target /= "index.html"
    if not target.is_file():
        return f"missing target: {reference}"
    fragment = unquote(url.fragment)
    # Text fragments and PDF page selectors are interpreted by the viewer.
    if fragment and not fragment.startswith(":~:text=") and target in pages:
        if fragment not in pages[target].ids:
            return f"missing fragment: {reference}"
    return None


def main():
    pages = {}
    errors = []
    references = []
    for path in sorted(ROOT.glob("*.html")):
        page = Page(path)
        page.feed(path.read_text())
        if path.name != "googlebdaa3890157682d4.html":
            if not {"noindex", "noimageindex"}.issubset(page.robots):
                page.errors.append("missing noindex or noimageindex search restriction")
            if "index" in page.robots:
                page.errors.append("unexpected index directive")
        pages[path] = page
        errors.extend(f"{path.name}: {error}" for error in page.errors)
        references.extend((path, ref) for ref in page.references)

    for path in sorted((ROOT / "assets/css").glob("*.css")):
        references.extend((path, ref) for ref in CSS_URL.findall(path.read_text()))

    for path in [ROOT / "README.md", *sorted((ROOT / "docs").glob("*.md"))]:
        references.extend((path, ref) for ref in MARKDOWN_LINK.findall(path.read_text()))

    for source, reference in references:
        error = check_reference(source, reference, pages)
        if error:
            errors.append(f"{source.relative_to(ROOT)}: {error}")

    if errors:
        for error in sorted(set(errors)):
            print(f"ERROR {error}", file=sys.stderr)
        return 1
    print(
        f"Checked {len(pages)} HTML files, {len(references)} references, "
        "section IDs, JSON-LD and search restrictions."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
