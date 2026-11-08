#!/usr/bin/env python3
"""Inline assets/styles.css into every page's <head>.

PageSpeed flags an external stylesheet as render-blocking, so each page
carries the site CSS inline. assets/styles.css stays the one source of
truth: edit it, then run `python3 scripts/inline-css.py` and commit the
updated HTML files.
"""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
css = (root / "assets" / "styles.css").read_text()

# light minification: comments, whitespace around punctuation, blank space
css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
css = re.sub(r"\s+", " ", css)
css = re.sub(r"\s*([{};,>])\s*", r"\1", css)
css = css.replace(";}", "}").strip()

block = f'<style id="site-css">{css}</style>'
link = '<link rel="stylesheet" href="/assets/styles.css">'
pat = re.compile(r'<style id="site-css">.*?</style>', re.S)

for page in sorted(root.rglob("index.html")):
    html = page.read_text()
    if pat.search(html):
        new = pat.sub(lambda m: block, html)
    elif link in html:
        new = html.replace(link, block)
    else:
        continue
    if new != html:
        page.write_text(new)
        print("updated", page.relative_to(root))
