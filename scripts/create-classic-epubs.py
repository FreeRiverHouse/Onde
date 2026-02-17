#!/usr/bin/env python3
"""Create ePub files for classic public domain books from Project Gutenberg."""

import os
import re
import urllib.request
from ebooklib import epub

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'apps', 'onde-portal', 'public', 'books', 'epub')


def fetch_text(url):
    """Fetch text from URL."""
    req = urllib.request.Request(url, headers={'User-Agent': 'OndeSurfBot/1.0'})
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode('utf-8', errors='replace')


def extract_gutenberg_text(raw):
    """Strip Gutenberg header/footer and normalize line endings."""
    # Normalize line endings and smart quotes
    raw = raw.replace('\r\n', '\n').replace('\r', '\n')
    raw = raw.replace('\u2018', "'").replace('\u2019', "'")
    raw = raw.replace('\u201c', '"').replace('\u201d', '"')
    
    start_markers = ['*** START OF THE PROJECT GUTENBERG EBOOK', '*** START OF THIS PROJECT GUTENBERG EBOOK']
    end_markers = ['*** END OF THE PROJECT GUTENBERG EBOOK', '*** END OF THIS PROJECT GUTENBERG EBOOK',
                   'End of the Project Gutenberg', 'End of Project Gutenberg']
    
    text = raw
    for marker in start_markers:
        idx = text.find(marker)
        if idx != -1:
            text = text[idx:]
            nl = text.find('\n')
            text = text[nl+1:]
            break
    
    for marker in end_markers:
        idx = text.find(marker)
        if idx != -1:
            text = text[:idx]
            break
    
    return text.strip()


def text_to_html(text):
    """Convert plain text to HTML paragraphs."""
    paragraphs = re.split(r'\n\s*\n', text)
    html_parts = []
    for p in paragraphs:
        p = p.strip()
        if p:
            p = p.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            p = re.sub(r'\n', ' ', p)
            html_parts.append(f'<p>{p}</p>')
    return '\n'.join(html_parts)


def split_alice_chapters(text):
    """Split Alice in Wonderland into chapters using actual chapter breaks."""
    # Find actual chapter positions (pattern: CHAPTER X.\nTitle\n\n)
    chapter_pattern = re.compile(r'\n(CHAPTER [IVXLC]+\.)\n(.+?)\n\n\n', re.DOTALL)
    
    # Find all chapter starts
    matches = list(chapter_pattern.finditer(text))
    
    if not matches:
        return [{'title': "Alice's Adventures in Wonderland", 'text': text}]
    
    chapters = []
    for i, m in enumerate(matches):
        chapter_num = m.group(1).strip()
        chapter_title = m.group(2).strip()
        start = m.end()
        end = matches[i+1].start() if i+1 < len(matches) else len(text)
        body = text[start:end].strip()
        chapters.append({
            'title': f'{chapter_num} {chapter_title}',
            'text': body
        })
    
    return chapters


def split_jungle_chapters(text):
    """Split Jungle Book into stories using blank-line-surrounded titles."""
    # The Jungle Book stories are separated by titles on their own lines
    story_titles = [
        "Mowgli's Brothers",
        "Hunting-Song of the Seeonee Pack",
        "Kaa's Hunting",
        "Road-Song of the Bandar-Log",
        "\"Tiger! Tiger!\"",
        "Tiger! Tiger!",
        "Mowgli's Song",
        "The White Seal",
        "Lukannon",
        "\"Rikki-Tikki-Tavi\"",
        "Rikki-Tikki-Tavi",
        "Darzee's Chaunt",
        "Darzee's Chant",
        "Toomai of the Elephants",
        "Shiv and the Grasshopper",
        "Her Majesty's Servants",
        "Parade Song of the Camp Animals",
        "Parade-Song of the Camp-Animals",
    ]
    
    # Find title positions
    positions = []
    for title in story_titles:
        idx = text.find(f'\n{title}\n')
        if idx != -1:
            positions.append((idx, title))
    
    positions.sort(key=lambda x: x[0])
    
    if not positions:
        # Fallback: single chapter
        return [{'title': 'The Jungle Book', 'text': text}]
    
    chapters = []
    for i, (pos, title) in enumerate(positions):
        start = pos + len(title) + 2
        end = positions[i+1][0] if i+1 < len(positions) else len(text)
        body = text[start:end].strip()
        if body:
            chapters.append({'title': title.strip('"'), 'text': body})
    
    return chapters


def create_epub(book_id, title, author, lang, chapters):
    """Create an ePub from chapters."""
    book = epub.EpubBook()
    
    book.set_identifier(book_id)
    book.set_title(title)
    book.set_language(lang)
    book.add_author(author)
    book.add_metadata('DC', 'publisher', 'Onde Studio')
    book.add_metadata('DC', 'rights', 'Public Domain')
    
    style = '''
    body { font-family: Georgia, serif; line-height: 1.6; margin: 1em; }
    h1 { text-align: center; margin-bottom: 2em; }
    h2 { margin-top: 2em; margin-bottom: 1em; }
    p { text-indent: 1.5em; margin: 0.5em 0; }
    '''
    css = epub.EpubItem(uid='style', file_name='style/default.css', media_type='text/css', content=style.encode())
    book.add_item(css)
    
    epub_chapters = []
    spine = ['nav']
    toc = []
    
    for i, ch in enumerate(chapters):
        c = epub.EpubHtml(
            title=ch['title'],
            file_name=f'chapter_{i+1}.xhtml',
            lang=lang
        )
        html_content = f'<h2>{ch["title"]}</h2>\n{text_to_html(ch["text"])}'
        c.content = html_content.encode('utf-8')
        c.add_item(css)
        book.add_item(c)
        epub_chapters.append(c)
        spine.append(c)
        toc.append(c)
    
    book.toc = toc
    book.spine = spine
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())
    
    output_path = os.path.join(OUTPUT_DIR, f'{book_id}.epub')
    epub.write_epub(output_path, book, {})
    
    # Show stats
    total_chars = sum(len(ch['text']) for ch in chapters)
    print(f"✅ Created: {output_path}")
    print(f"   {len(chapters)} chapters, {total_chars:,} chars total, {os.path.getsize(output_path):,} bytes")
    return output_path


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 1. Alice in Wonderland
    print("\n📖 Alice's Adventures in Wonderland...")
    raw = fetch_text('https://www.gutenberg.org/files/11/11-0.txt')
    text = extract_gutenberg_text(raw)
    chapters = split_alice_chapters(text)
    create_epub('alice-wonderland-en', "Alice's Adventures in Wonderland", 'Lewis Carroll', 'en', chapters)
    
    # 2. The Jungle Book
    print("\n📖 The Jungle Book...")
    raw = fetch_text('https://www.gutenberg.org/cache/epub/236/pg236.txt')
    text = extract_gutenberg_text(raw)
    chapters = split_jungle_chapters(text)
    create_epub('jungle-book-en', 'The Jungle Book', 'Rudyard Kipling', 'en', chapters)
    
    # 3. Peter Rabbit
    print("\n📖 The Tale of Peter Rabbit...")
    raw = fetch_text('https://www.gutenberg.org/files/14838/14838-0.txt')
    text = extract_gutenberg_text(raw)
    # Short story - single chapter
    chapters = [{'title': 'The Tale of Peter Rabbit', 'text': text}]
    create_epub('peter-rabbit-en', 'The Tale of Peter Rabbit', 'Beatrix Potter', 'en', chapters)


if __name__ == '__main__':
    main()
