#!/usr/bin/env python3
"""
Generate EPUB from Recursive Reconciliation Master Complete Book markdown.

Produces a mobile-optimized EPUB 3.0 file suitable for e-readers and
mobile reading apps (Apple Books, Google Play Books, Kindle, etc.).
"""

import re
import os
import markdown
from ebooklib import epub


# --- Configuration ---

BOOK_TITLE = "Recursive Reconciliation: The Narrative of the Universe"
BOOK_AUTHOR = "Scientific Canon"
BOOK_LANGUAGE = "en"
BOOK_ID = "recursive-reconciliation-2026"
BOOK_YEAR = "2026"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SOURCE_MD = os.path.join(SCRIPT_DIR, "Recursive_Reconciliation_Master_Complete_Book.md")
OUTPUT_EPUB = os.path.join(SCRIPT_DIR, "Recursive_Reconciliation_Master_Complete.epub")

# --- Mobile-optimised CSS ---

BOOK_CSS = """\
/* Base typography – optimised for mobile screens */
body {
    font-family: Georgia, "Times New Roman", serif;
    line-height: 1.8;
    margin: 1em;
    padding: 0;
    color: #1a1a1a;
    text-align: justify;
    -webkit-hyphens: auto;
    hyphens: auto;
}

h1 {
    font-size: 1.6em;
    text-align: center;
    margin-top: 2em;
    margin-bottom: 1em;
    line-height: 1.3;
    page-break-before: always;
    color: #2c2c2c;
}

h2 {
    font-size: 1.3em;
    margin-top: 1.8em;
    margin-bottom: 0.8em;
    line-height: 1.3;
    color: #333;
}

h3 {
    font-size: 1.1em;
    margin-top: 1.5em;
    margin-bottom: 0.6em;
    line-height: 1.3;
    color: #444;
}

p {
    margin-top: 0.4em;
    margin-bottom: 0.8em;
    text-indent: 1.2em;
    orphans: 2;
    widows: 2;
}

/* First paragraph after a heading – no indent */
h1 + p, h2 + p, h3 + p {
    text-indent: 0;
}

blockquote {
    margin: 1em 1.5em;
    padding-left: 0.8em;
    border-left: 3px solid #999;
    font-style: italic;
    color: #555;
}

em {
    font-style: italic;
}

strong {
    font-weight: bold;
}

/* Title page */
.title-page {
    text-align: center;
    margin-top: 30%;
    page-break-after: always;
}

.title-page h1 {
    font-size: 2em;
    margin-bottom: 0.3em;
    page-break-before: avoid;
}

.title-page .subtitle {
    font-size: 1.3em;
    font-style: italic;
    color: #555;
    margin-bottom: 2em;
}

.title-page .year {
    font-size: 1em;
    color: #777;
}

/* Copyright page */
.copyright-page {
    margin-top: 60%;
    text-align: center;
    font-size: 0.85em;
    color: #777;
    page-break-after: always;
}

.copyright-page p {
    text-indent: 0;
    text-align: center;
}

/* Chapter opener */
.chapter-opener {
    margin-top: 3em;
}

hr {
    border: none;
    border-top: 1px solid #ccc;
    margin: 2em auto;
    width: 40%;
}

/* Responsive adjustments for small screens */
@media screen and (max-width: 600px) {
    body {
        margin: 0.5em;
        font-size: 1em;
    }
    h1 { font-size: 1.4em; }
    h2 { font-size: 1.2em; }
    h3 { font-size: 1.05em; }
}
"""


def read_source():
    """Read the markdown source file."""
    with open(SOURCE_MD, "r", encoding="utf-8") as f:
        return f.read()


def split_into_chapters(md_text):
    """
    Split the markdown into chapters based on top-level headings (# ...).
    Returns a list of (title, markdown_body) tuples.
    """
    # Split on lines that start with '# ' (top-level heading)
    chapter_pattern = re.compile(r'^# (.+)$', re.MULTILINE)
    splits = chapter_pattern.split(md_text)

    # splits[0] is text before the first heading (front-matter)
    # Then alternating: heading_text, body, heading_text, body, ...
    chapters = []
    front_matter = splits[0].strip()
    if front_matter:
        chapters.append(("Front Matter", front_matter))

    for i in range(1, len(splits), 2):
        title = splits[i].strip()
        body = splits[i + 1].strip() if i + 1 < len(splits) else ""
        chapters.append((title, body))

    return chapters


def md_to_html(md_text):
    """Convert markdown text to HTML."""
    return markdown.markdown(
        md_text,
        extensions=["extra", "smarty"],
        output_format="html5",
    )


def make_chapter_filename(index, title):
    """Generate a safe filename for a chapter."""
    safe = re.sub(r'[^a-z0-9]+', '_', title.lower()).strip('_')
    return f"ch{index:02d}_{safe[:40]}.xhtml"


def make_epub_chapter(title, body_html, filename, css_item):
    """Create an EpubHtml chapter using set_content for proper parsing."""
    chapter = epub.EpubHtml(
        title=title,
        file_name=filename,
        lang="en",
    )
    # Use set_content with well-formed XHTML so ebooklib can parse it
    full_html = (
        '<html xmlns="http://www.w3.org/1999/xhtml">'
        f"<head><title>{title}</title></head>"
        f"<body>{body_html}</body>"
        "</html>"
    )
    chapter.set_content(full_html.encode("utf-8"))
    chapter.add_item(css_item)
    return chapter


def build_epub(chapters):
    """Build the EPUB book from parsed chapters."""
    book = epub.EpubBook()

    # --- Metadata ---
    book.set_identifier(BOOK_ID)
    book.set_title(BOOK_TITLE)
    book.set_language(BOOK_LANGUAGE)
    book.add_author(BOOK_AUTHOR)
    book.add_metadata("DC", "date", BOOK_YEAR)
    book.add_metadata("DC", "description",
        "A 20-chapter exploration of recursive reconciliation as the "
        "structural narrative of the universe — from emergence and symmetry "
        "through suffering, love, and silence.")
    book.add_metadata("DC", "subject", "Philosophy")
    book.add_metadata("DC", "subject", "Science")
    book.add_metadata("DC", "subject", "Recursion")
    book.add_metadata("DC", "rights",
        f"Copyright (c) {BOOK_YEAR}. All rights reserved.")

    # --- Stylesheet ---
    css_item = epub.EpubItem(
        uid="style",
        file_name="style/book.css",
        media_type="text/css",
        content=BOOK_CSS.encode("utf-8"),
    )
    book.add_item(css_item)

    # --- Title Page ---
    title_body = (
        '<div class="title-page">'
        "<h1>Recursive Reconciliation</h1>"
        '<p class="subtitle">The Narrative of the Universe</p>'
        f'<p class="year">{BOOK_YEAR}</p>'
        "</div>"
    )
    title_page = make_epub_chapter(
        "Title Page", title_body, "title.xhtml", css_item
    )
    book.add_item(title_page)

    # --- Copyright Page ---
    copyright_body = (
        '<div class="copyright-page">'
        f"<p>Copyright \u00a9 {BOOK_YEAR}</p>"
        "<p>All rights reserved.</p>"
        "<p>No part of this work may be reproduced or transmitted in any form "
        "or by any means, electronic or mechanical, including photocopying, "
        "recording, or by any information storage and retrieval system, "
        "without permission in writing from the author, except for brief "
        "quotations in reviews.</p>"
        f"<p>First edition {BOOK_YEAR}</p>"
        "</div>"
    )
    copyright_page = make_epub_chapter(
        "Copyright", copyright_body, "copyright.xhtml", css_item
    )
    book.add_item(copyright_page)

    # --- Chapter pages ---
    epub_chapters = []
    toc_entries = []

    for idx, (title, body) in enumerate(chapters):
        # Skip front matter that's just YAML or LaTeX artifacts
        if title == "Front Matter":
            continue

        filename = make_chapter_filename(idx, title)
        body_html = md_to_html(body)

        display_title = title
        chapter_body = (
            f'<div class="chapter-opener"><h1>{display_title}</h1></div>'
            f"{body_html}"
        )

        chapter = make_epub_chapter(
            display_title, chapter_body, filename, css_item
        )
        book.add_item(chapter)
        epub_chapters.append(chapter)
        toc_entries.append(chapter)

    # --- Table of Contents ---
    book.toc = toc_entries

    # --- Navigation files (required by EPUB 3) ---
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())

    # Add nav CSS
    nav_css = epub.EpubItem(
        uid="style_nav",
        file_name="style/nav.css",
        media_type="text/css",
        content=b"ol { list-style-type: none; padding-left: 0; }"
                b" li { margin: 0.5em 0; }",
    )
    book.add_item(nav_css)

    # --- Spine (reading order) ---
    book.spine = [title_page, copyright_page, "nav"] + epub_chapters

    return book


def main():
    print(f"Reading source: {SOURCE_MD}")
    md_text = read_source()

    print("Splitting into chapters...")
    chapters = split_into_chapters(md_text)
    print(f"  Found {len(chapters)} sections")

    for title, _ in chapters:
        print(f"    - {title}")

    print("Building EPUB...")
    book = build_epub(chapters)

    print(f"Writing EPUB: {OUTPUT_EPUB}")
    epub.write_epub(OUTPUT_EPUB, book, {})

    size_kb = os.path.getsize(OUTPUT_EPUB) / 1024
    print(f"Done! EPUB size: {size_kb:.1f} KB")
    print(f"Output: {OUTPUT_EPUB}")


if __name__ == "__main__":
    main()
