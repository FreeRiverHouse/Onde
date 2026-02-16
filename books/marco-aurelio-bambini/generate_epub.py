#!/usr/bin/env python3
"""
Generate EPUB files for "Il Saggio Imperatore" (IT) and "The Wise Emperor" (EN).
Uses ebooklib to create EPUB 3.0 books with embedded illustrations.
"""

import os
import re
import glob
from ebooklib import epub

# --- Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IT_TEXT = os.path.join(os.path.expanduser("~"), "Onde/apps/corde/books/marco-aurelio-bambini/testo-gianni.md")
EN_TEXT = os.path.join(BASE_DIR, "text-english.md")
COVER_PATH = os.path.join(BASE_DIR, "images/00-copertina.png")
ILLUS_DIR = os.path.join(BASE_DIR, "illustrations-v2-final")

# --- CSS ---
BOOK_CSS = """\
@charset "UTF-8";

body {
    font-family: Georgia, "Times New Roman", "Palatino Linotype", serif;
    margin: 5% 8%;
    line-height: 1.7;
    color: #2c2c2c;
    background: #fefefe;
}

h1 {
    font-size: 2em;
    text-align: center;
    margin: 1.5em 0 0.3em;
    color: #5a3e1b;
    font-weight: bold;
    letter-spacing: 0.02em;
}

h2 {
    font-size: 1.4em;
    text-align: center;
    margin: 0 0 1.5em;
    color: #7a5c3a;
    font-weight: normal;
    font-style: italic;
}

h3 {
    font-size: 1.3em;
    text-align: center;
    margin: 1.5em 0 1em;
    color: #5a3e1b;
    font-weight: bold;
}

p {
    text-align: left;
    text-indent: 0;
    margin: 0.6em 0;
    font-size: 1.05em;
}

blockquote, .quote {
    margin: 1em 2em;
    font-style: italic;
    color: #555;
}

ul, ol {
    margin: 0.8em 1.5em;
    padding-left: 1em;
}

li {
    margin: 0.3em 0;
    font-size: 1.05em;
}

.illustration {
    text-align: center;
    margin: 1.5em 0;
    page-break-inside: avoid;
}

.illustration img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.10);
}

.title-page {
    text-align: center;
    margin-top: 20%;
    page-break-after: always;
}

.title-page h1 {
    font-size: 2.4em;
    margin-bottom: 0.2em;
}

.title-page h2 {
    font-size: 1.5em;
    margin-bottom: 1.5em;
}

.title-page .author {
    font-size: 1.15em;
    color: #7a5c3a;
    margin: 0.3em 0;
}

.title-page .publisher {
    font-size: 1em;
    color: #999;
    margin-top: 2em;
}

.ending {
    text-align: center;
    margin-top: 2em;
    font-size: 1.2em;
    font-weight: bold;
    color: #5a3e1b;
}

.colophon {
    text-align: center;
    font-size: 0.9em;
    color: #888;
    margin-top: 1em;
}

hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 2em 4em;
}
"""


def xhtml(body_content, lang="it"):
    """Wrap body content in a minimal XHTML page (no XML declaration — ebooklib adds its own)."""
    return (
        f'<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="{lang}">'
        f'<head><link rel="stylesheet" href="style/book.css" type="text/css"/></head>'
        f'<body>{body_content}</body></html>'
    )


def get_illustration_files():
    """Get sorted illustration files from the illustrations directory."""
    return sorted(glob.glob(os.path.join(ILLUS_DIR, "*.png")))


def parse_chapters(text):
    """Parse markdown text into chapters. Returns list of {title, body_lines}."""
    lines = text.strip().split('\n')
    chapters = []
    current = None
    hdr = re.compile(r'^###\s+(Capitolo|Chapter)\s+\d+\s*[-—]\s*(.*)', re.I)

    for line in lines:
        if hdr.match(line):
            if current:
                chapters.append(current)
            current = {'title': line.lstrip('#').strip(), 'body_lines': []}
        elif current is not None:
            current['body_lines'].append(line)

    if current:
        chapters.append(current)
    return chapters


def clean_body(lines):
    """Convert markdown body lines to XHTML fragment, stripping illustration annotations."""
    text = '\n'.join(lines).strip()
    text = re.sub(r'\[ILLUSTRAZIONE:.*?\]', '', text, flags=re.DOTALL)
    text = re.sub(r'\[ILLUSTRATION:.*?\]', '', text, flags=re.DOTALL)
    text = re.sub(r'^---+\s*$', '', text, flags=re.MULTILINE)

    parts = []
    in_list = False

    for line in text.split('\n'):
        s = line.strip()
        if not s:
            if in_list:
                parts.append('</ul>')
                in_list = False
            continue

        if s.startswith('- '):
            if not in_list:
                parts.append('<ul>')
                in_list = True
            parts.append(f'<li>{s[2:]}</li>')
            continue

        if in_list:
            parts.append('</ul>')
            in_list = False

        if s.startswith('*') and s.endswith('*') and not s.startswith('**'):
            parts.append(f'<p><em>{s.strip("*").strip()}</em></p>')
        else:
            parts.append(f'<p>{s}</p>')

    if in_list:
        parts.append('</ul>')
    return '\n'.join(parts)


def create_epub(lang="it"):
    """Create an EPUB book for the given language."""
    is_it = (lang == "it")

    src_path = IT_TEXT if is_it else EN_TEXT
    with open(src_path, 'r', encoding='utf-8') as f:
        full_text = f.read()

    if is_it:
        title, subtitle = "Il Saggio Imperatore", "Le Avventure di Marco Aurelio"
        filename, language = "Il-Saggio-Imperatore.epub", "it"
    else:
        title, subtitle = "The Wise Emperor", "The Adventures of Marcus Aurelius"
        filename, language = "The-Wise-Emperor.epub", "en"

    book = epub.EpubBook()
    book.set_identifier(f'onde-{lang}-saggio-imperatore-2026')
    book.set_title(title)
    book.set_language(language)
    book.add_author('Gianni Parola')
    book.add_metadata('DC', 'publisher', 'Onde')
    book.add_metadata('DC', 'date', '2026')
    book.add_metadata('DC', 'contributor', 'Pina Pennello')
    book.add_metadata(None, 'meta', '', {'name': 'illustrator', 'content': 'Pina Pennello'})

    # --- CSS ---
    css = epub.EpubItem(uid='style', file_name='style/book.css',
                        media_type='text/css', content=BOOK_CSS.encode('utf-8'))
    book.add_item(css)

    # --- Cover image ---
    with open(COVER_PATH, 'rb') as f:
        cover_data = f.read()
    book.set_cover('images/cover.png', cover_data, create_page=False)

    # Cover page
    cover_page = epub.EpubHtml(title='Cover', file_name='cover.xhtml', lang=language)
    cover_page.content = xhtml(
        f'<div style="text-align:center;margin:0;padding:0;">'
        f'<img src="images/cover.png" alt="{title}" style="max-width:100%;max-height:100vh;"/>'
        f'</div>', language
    )
    cover_page.add_item(css)
    book.add_item(cover_page)

    # --- Illustrations ---
    illus_files = get_illustration_files()
    illus_items = []
    for i, fpath in enumerate(illus_files):
        fname = os.path.basename(fpath)
        with open(fpath, 'rb') as f:
            img_data = f.read()
        item = epub.EpubItem(uid=f'illus_{i+1:02d}', file_name=f'images/{fname}',
                             media_type='image/png', content=img_data)
        book.add_item(item)
        illus_items.append(item)

    # --- Title page ---
    a_lbl = "Testo di" if is_it else "Text by"
    i_lbl = "Illustrazioni di" if is_it else "Illustrations by"
    c_lbl = "Collana Onde Classics" if is_it else "Onde Classics"

    title_page = epub.EpubHtml(title=title, file_name='title.xhtml', lang=language)
    title_page.content = xhtml(f'''
<div class="title-page">
  <h1>{title}</h1>
  <h2>{subtitle}</h2>
  <p class="author">{a_lbl} <strong>Gianni Parola</strong></p>
  <p class="author">{i_lbl} <strong>Pina Pennello</strong></p>
  <p class="publisher">{c_lbl}</p>
  <p class="publisher">Onde · 2026</p>
</div>
''', language)
    title_page.add_item(css)
    book.add_item(title_page)

    # --- Chapters ---
    chapters = parse_chapters(full_text)
    chapter_items = []

    for i, ch in enumerate(chapters):
        body_html = clean_body(ch['body_lines'])

        illus_html = ""
        if i < len(illus_items):
            img_fname = os.path.basename(illus_files[i])
            illus_html = (
                f'<div class="illustration">'
                f'<img src="images/{img_fname}" alt="{ch["title"]}"/>'
                f'</div>'
            )

        ch_item = epub.EpubHtml(title=ch['title'],
                                file_name=f'chapter_{i+1:02d}.xhtml', lang=language)
        ch_item.content = xhtml(
            f'<h3>{ch["title"]}</h3>\n{illus_html}\n{body_html}', language
        )
        ch_item.add_item(css)
        book.add_item(ch_item)
        chapter_items.append(ch_item)

    # --- Ending ---
    end_label = "Fine" if is_it else "The End"
    more = ('Per saperne di più sulla filosofia di Marco Aurelio: '
            '<em>"Meditazioni"</em> (edizione illustrata Onde)') if is_it else (
           'To learn more about the philosophy of Marcus Aurelius: '
           '<em>"Meditations"</em> (Onde illustrated edition)')

    ending = epub.EpubHtml(title=end_label, file_name='ending.xhtml', lang=language)
    ending.content = xhtml(f'''
<div class="ending">
  <p>✦</p>
  <p><strong>{end_label}</strong></p>
</div>
<hr/>
<div class="colophon">
  <p>{more}</p>
  <p style="margin-top:1.5em;">© 2026 Onde</p>
</div>
''', language)
    ending.add_item(css)
    book.add_item(ending)

    # --- TOC + Spine + Nav ---
    book.toc = [title_page] + chapter_items + [ending]
    book.spine = ['nav', cover_page, title_page] + chapter_items + [ending]
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())

    # --- Write ---
    out_path = os.path.join(BASE_DIR, filename)
    epub.write_epub(out_path, book, {})
    print(f"✅ Created: {out_path}")
    return out_path


if __name__ == '__main__':
    print("=" * 60)
    print("  EPUB Generator — Il Saggio Imperatore / The Wise Emperor")
    print("=" * 60)
    print()

    it_path = create_epub("it")
    en_path = create_epub("en")

    print()
    print("Done! Files created:")
    for p in [it_path, en_path]:
        size_mb = os.path.getsize(p) / (1024 * 1024)
        print(f"  📖 {os.path.basename(p)} ({size_mb:.1f} MB)")
