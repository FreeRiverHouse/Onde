#!/usr/bin/env python3
"""
Generate EPUB files for "Il Respiro Magico" (IT) and "The Magic Breath" (EN).
Uses ebooklib to produce EPUB 3.0 with embedded illustrations.
"""

import os
import re
import uuid
from pathlib import Path
from ebooklib import epub

BASE_DIR = Path(__file__).parent
ILLUSTRATIONS_DIR = BASE_DIR / "illustrations"

# ─── CSS ────────────────────────────────────────────────────────────────────────

BOOK_CSS = """\
@charset "UTF-8";

body {
    font-family: Georgia, "Times New Roman", serif;
    margin: 5% 8%;
    line-height: 1.7;
    color: #2c2c2c;
    font-size: 1.05em;
}

h1 {
    text-align: center;
    font-size: 2em;
    margin-top: 1.5em;
    margin-bottom: 0.3em;
    color: #3a3a3a;
    font-weight: 700;
}

h2 {
    text-align: center;
    font-size: 1.1em;
    font-weight: 400;
    font-style: italic;
    color: #666;
    margin-top: 0;
    margin-bottom: 2em;
}

h3 {
    font-size: 1.4em;
    margin-top: 1.5em;
    margin-bottom: 0.8em;
    color: #444;
}

p {
    margin: 0.6em 0;
    text-align: justify;
}

.credits {
    text-align: center;
    font-style: italic;
    color: #777;
    margin: 0.3em 0;
}

.separator {
    text-align: center;
    margin: 2em 0;
    color: #ccc;
    font-size: 1.5em;
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
}

.exercise {
    background-color: #f0f7ee;
    border-left: 4px solid #8bc34a;
    padding: 1em 1.2em;
    margin: 1.5em 0;
    border-radius: 6px;
    font-style: italic;
    color: #3a5a2a;
    line-height: 1.6;
}

.exercise-en {
    background-color: #eef4fa;
    border-left: 4px solid #64b5f6;
    padding: 1em 1.2em;
    margin: 1.5em 0;
    border-radius: 6px;
    font-style: italic;
    color: #2a4a6a;
    line-height: 1.6;
}

.ending {
    text-align: center;
    font-weight: bold;
    font-size: 1.3em;
    margin-top: 2em;
    color: #555;
}

.parents-note {
    font-style: italic;
    color: #888;
    font-size: 0.9em;
    margin-top: 2em;
    border-top: 1px solid #ddd;
    padding-top: 1em;
}

.colophon {
    text-align: center;
    font-style: italic;
    color: #999;
    margin-top: 1em;
}
"""

# ─── Chapter definitions ────────────────────────────────────────────────────────

CHAPTERS_IT = [
    {
        "id": "intro",
        "title": "Introduzione",
        "illustration": None,  # cover is used separately
        "illustration_file": "00-cover.png",
    },
    {"id": "ch01", "title": "Capitolo 1 - Il Soffio del Vento", "illustration_file": "01-soffio-del-vento.png"},
    {"id": "ch02", "title": "Capitolo 2 - La Pancia che Sale", "illustration_file": "02-pancia-che-sale.png"},
    {"id": "ch03", "title": "Capitolo 3 - Il Respiro che Conta", "illustration_file": "03-respiro-che-conta.png"},
    {"id": "ch04", "title": "Capitolo 4 - Il Respiro della Farfalla", "illustration_file": "04-respiro-farfalla.png"},
    {"id": "ch05", "title": "Capitolo 5 - Il Respiro che Scalda", "illustration_file": "05-respiro-che-scalda.png"},
    {"id": "ch06", "title": "Capitolo 6 - Il Gioco dei Cinque Sensi", "illustration_file": "06-gioco-cinque-sensi.png"},
    {"id": "ch07", "title": "Capitolo 7 - Il Respiro Prima di Dormire", "illustration_file": "07-respiro-prima-dormire.png"},
    {"id": "ch08", "title": "Capitolo 8 - Il Respiro che Condividiamo", "illustration_file": "08-respiro-condividiamo.png"},
    {"id": "ch09", "title": "Capitolo 9 - Il Tuo Respiro Magico", "illustration_file": "09-tuo-respiro-magico.png"},
]

CHAPTERS_EN = [
    {"id": "intro", "title": "Introduction", "illustration_file": "00-cover.png"},
    {"id": "ch01", "title": "Chapter 1 - The Puff of Wind", "illustration_file": "01-soffio-del-vento.png"},
    {"id": "ch02", "title": "Chapter 2 - The Tummy That Goes Up", "illustration_file": "02-pancia-che-sale.png"},
    {"id": "ch03", "title": "Chapter 3 - The Counting Breath", "illustration_file": "03-respiro-che-conta.png"},
    {"id": "ch04", "title": "Chapter 4 - The Butterfly Breath", "illustration_file": "04-respiro-farfalla.png"},
    {"id": "ch05", "title": "Chapter 5 - The Breath That Warms", "illustration_file": "05-respiro-che-scalda.png"},
    {"id": "ch06", "title": "Chapter 6 - The Five Senses Game", "illustration_file": "06-gioco-cinque-sensi.png"},
    {"id": "ch07", "title": "Chapter 7 - The Bedtime Breath", "illustration_file": "07-respiro-prima-dormire.png"},
    {"id": "ch08", "title": "Chapter 8 - The Breath We Share", "illustration_file": "08-respiro-condividiamo.png"},
    {"id": "ch09", "title": "Chapter 9 - Your Magic Breath", "illustration_file": "09-tuo-respiro-magico.png"},
]


# ─── Text parsing ───────────────────────────────────────────────────────────────

def parse_markdown(filepath: Path) -> list[str]:
    """Split the markdown file into chapter sections (split on ### headings)."""
    text = filepath.read_text(encoding="utf-8")
    # Remove [ILLUSTRAZIONE: ...] and [ILLUSTRATION: ...] annotations
    text = re.sub(r'\[ILLUSTRAZIONE:[^\]]*\]', '', text)
    text = re.sub(r'\[ILLUSTRATION:[^\]]*\]', '', text)
    
    # Split on --- separators (which divide chapters in the source)
    sections = re.split(r'\n---\n', text)
    return [s.strip() for s in sections if s.strip()]


def md_to_xhtml(md_text: str, exercise_class: str = "exercise") -> str:
    """Convert a markdown section to basic XHTML paragraphs."""
    lines = md_text.split('\n')
    html_parts = []
    in_exercise = False
    
    for line in lines:
        line = line.rstrip()
        
        # Skip empty lines between elements
        if not line:
            if in_exercise:
                html_parts.append('')
            continue
        
        # Headers
        if line.startswith('### '):
            html_parts.append(f'<h3>{line[4:]}</h3>')
            continue
        if line.startswith('## '):
            html_parts.append(f'<h2>{line[3:]}</h2>')
            continue
        if line.startswith('# '):
            html_parts.append(f'<h1>{line[2:]}</h1>')
            continue
        
        # Exercise blocks (italic paragraphs starting with *Prova anche tu / *Try it too / *Un ultimo / *One last / *Per i genitori / *For parents)
        if line.startswith('*Prova anche tu') or line.startswith('*Try it too') or \
           line.startswith('*Un ultimo') or line.startswith('*One last'):
            # Strip surrounding asterisks
            clean = line.strip('*').strip()
            html_parts.append(f'<div class="{exercise_class}"><p>{process_inline(clean)}</p></div>')
            continue
        
        # Parents note
        if line.startswith('*Per i genitori:') or line.startswith('*For parents:'):
            clean = line.strip('*').strip()
            html_parts.append(f'<p class="parents-note">{process_inline(clean)}</p>')
            continue
        
        # Colophon
        if line.startswith('*Collana') or line.startswith('*Onde Classics'):
            clean = line.strip('*').strip()
            html_parts.append(f'<p class="colophon">{process_inline(clean)}</p>')
            continue
        
        # Credits lines (italic with *)
        if line.startswith('*') and line.endswith('*') and len(line) > 2:
            clean = line.strip('*').strip()
            html_parts.append(f'<p class="credits">{clean}</p>')
            continue
        
        # Bold ending
        if line.startswith('**') and line.endswith('**'):
            clean = line.strip('*').strip()
            html_parts.append(f'<p class="ending">{clean}</p>')
            continue
        
        # Regular paragraph
        html_parts.append(f'<p>{process_inline(line)}</p>')
    
    return '\n'.join(html_parts)


def process_inline(text: str) -> str:
    """Process inline markdown formatting."""
    # Bold
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    # Italic
    text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
    # Quotes
    text = re.sub(r'"([^"]*)"', r'"\1"', text)
    return text


# ─── EPUB generation ────────────────────────────────────────────────────────────

def create_epub(
    title: str,
    language: str,
    chapters_def: list[dict],
    md_file: Path,
    output_file: Path,
    exercise_class: str = "exercise",
):
    book = epub.EpubBook()
    
    # Metadata
    uid = str(uuid.uuid4())
    book.set_identifier(uid)
    book.set_title(title)
    book.set_language(language)
    book.add_author("Gianni Parola")
    book.add_metadata("DC", "publisher", "Onde")
    book.add_metadata("DC", "date", "2026")
    book.add_metadata("DC", "contributor", "Pina Pennello")
    book.add_metadata(None, "meta", "Pina Pennello", {"name": "illustrator", "content": "Pina Pennello"})
    
    # Load all illustration images
    image_items = {}
    for img_file in sorted(ILLUSTRATIONS_DIR.glob("*.png")):
        img_content = img_file.read_bytes()
        img_name = img_file.name
        img_item = epub.EpubImage()
        img_item.file_name = f"images/{img_name}"
        img_item.media_type = "image/png"
        img_item.content = img_content
        book.add_item(img_item)
        image_items[img_name] = img_item
    
    # Set cover
    cover_data = (ILLUSTRATIONS_DIR / "00-cover.png").read_bytes()
    book.set_cover("images/cover.png", cover_data, create_page=True)
    
    # CSS
    style = epub.EpubItem(
        uid="book_style",
        file_name="style/book.css",
        media_type="text/css",
        content=BOOK_CSS.encode("utf-8"),
    )
    book.add_item(style)
    
    # Parse markdown
    sections = parse_markdown(md_file)
    
    # Build chapter XHTML files
    epub_chapters = []
    toc_entries = []
    
    for i, chapter_def in enumerate(chapters_def):
        if i >= len(sections):
            break
        
        section_md = sections[i]
        section_html = md_to_xhtml(section_md, exercise_class)
        
        # Build illustration HTML
        illust_html = ""
        illust_file = chapter_def.get("illustration_file")
        if illust_file and illust_file in image_items:
            # For intro, skip illustration (cover page is separate)
            if chapter_def["id"] != "intro":
                illust_html = f'''<div class="illustration">
    <img src="../images/{illust_file}" alt="{chapter_def['title']}" />
</div>
'''
        
        ch_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="{language}">
<head>
    <title>{chapter_def["title"]}</title>
    <link rel="stylesheet" type="text/css" href="../style/book.css" />
</head>
<body>
{illust_html}
{section_html}
</body>
</html>'''
        
        ch = epub.EpubHtml(
            title=chapter_def["title"],
            file_name=f'chapters/{chapter_def["id"]}.xhtml',
            lang=language,
        )
        ch.content = ch_content.encode("utf-8")
        ch.add_item(style)
        book.add_item(ch)
        epub_chapters.append(ch)
        toc_entries.append(ch)
    
    # Handle the ending sections (Fine/The End + parents note) if present
    # They're in the last parsed section alongside chapter 9, already included
    
    # Table of contents
    book.toc = toc_entries
    
    # Navigation
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())
    
    # Spine: cover + chapters
    book.spine = ["cover", "nav"] + epub_chapters
    
    # Write
    epub.write_epub(str(output_file), book, {})
    print(f"✅ Generated: {output_file}")


# ─── Main ───────────────────────────────────────────────────────────────────────

def main():
    # Italian version
    create_epub(
        title="Il Respiro Magico",
        language="it",
        chapters_def=CHAPTERS_IT,
        md_file=BASE_DIR / "testo-gianni.md",
        output_file=BASE_DIR / "Il-Respiro-Magico.epub",
        exercise_class="exercise",
    )
    
    # English version
    create_epub(
        title="The Magic Breath",
        language="en",
        chapters_def=CHAPTERS_EN,
        md_file=BASE_DIR / "text-english.md",
        output_file=BASE_DIR / "The-Magic-Breath.epub",
        exercise_class="exercise-en",
    )


if __name__ == "__main__":
    main()
