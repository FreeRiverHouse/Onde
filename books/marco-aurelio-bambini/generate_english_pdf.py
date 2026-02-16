#!/usr/bin/env python3
"""
Generate professional English PDF for "The Wise Emperor - The Adventures of Marcus Aurelius"
Matching the Italian "Il-Saggio-Imperatore-Professional.pdf" layout.
"""

import re
import os
from fpdf import FPDF

# ─── Paths ───
BASE = os.path.expanduser("~/Onde/books/marco-aurelio-bambini")
TEXT_FILE = os.path.join(BASE, "text-english.md")
COVER_IMG = os.path.join(BASE, "images", "00-copertina.png")
ILLUST_DIR = os.path.join(BASE, "illustrations-v2-final")
OUTPUT_PDF = os.path.join(BASE, "The-Wise-Emperor-Professional.pdf")

# Illustration files in order
ILLUSTRATIONS = [
    "01-wrestling-courtyard.png",
    "02-adoption-palace.png",
    "03-dawn-meditations.png",
    "04-plague-sacrifice.png",
    "05-tent-writing.png",
    "06-horseback-messenger.png",
    "07-chaos-vs-peace.png",
    "08-teachers-portico.png",
    "09-winter-farewell.png",
    "10-book-past-present.png",
]

# ─── Fonts ───
GEORGIA = "/System/Library/Fonts/Supplemental/Georgia.ttf"
GEORGIA_BOLD = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
GEORGIA_ITALIC = "/System/Library/Fonts/Supplemental/Georgia Italic.ttf"
GEORGIA_BI = "/System/Library/Fonts/Supplemental/Georgia Bold Italic.ttf"

# ─── Colours ───
GOLD = (139, 101, 42)        # Roman gold
TERRACOTTA = (166, 80, 46)   # Terracotta for dialogues/accents
DARK_BROWN = (60, 40, 20)    # Main body text
OLIVE_GREEN = (107, 120, 63) # Page numbers
CREAM_BG = (252, 248, 240)   # Cream page background
IVORY = (245, 240, 228)      # Slightly darker ivory for boxes
WARM_GREY = (120, 100, 80)   # Subtitle text


class WiseEmperorPDF(FPDF):
    """Professional children's book PDF with Roman aesthetic."""

    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_auto_page_break(auto=True, margin=30)

        # Register Georgia fonts
        self.add_font("Georgia", "", GEORGIA, uni=True)
        self.add_font("Georgia", "B", GEORGIA_BOLD, uni=True)
        self.add_font("Georgia", "I", GEORGIA_ITALIC, uni=True)
        self.add_font("Georgia", "BI", GEORGIA_BI, uni=True)

        self.page_numbering_active = False
        self.current_chapter = 0

    def header(self):
        pass

    def footer(self):
        if self.page_numbering_active and self.page_no() > 5:
            self.set_y(-20)
            self.set_font("Georgia", "I", 9)
            self.set_text_color(*OLIVE_GREEN)
            self.cell(0, 10, str(self.page_no()), align="C")

    def _cream_background(self):
        """Fill page with cream colour."""
        self.set_fill_color(*CREAM_BG)
        self.rect(0, 0, 210, 297, "F")

    def _decorative_line(self, y, width=60):
        """Draw a centred decorative gold line."""
        x = (210 - width) / 2
        self.set_draw_color(*GOLD)
        self.set_line_width(0.5)
        self.line(x, y, x + width, y)

    def _ornamental_divider(self, y):
        """Draw an ornamental divider with dots and line."""
        cx = 105
        self.set_draw_color(*GOLD)
        self.set_line_width(0.4)
        # Centre dot
        self.set_fill_color(*GOLD)
        self.ellipse(cx - 1.5, y - 1.5, 3, 3, "F")
        # Side lines
        self.line(cx - 30, y, cx - 5, y)
        self.line(cx + 5, y, cx + 30, y)
        # Small side dots
        self.ellipse(cx - 32, y - 1, 2, 2, "F")
        self.ellipse(cx + 30, y - 1, 2, 2, "F")

    # ─── COVER PAGE ───
    def add_cover(self):
        self.add_page()
        # Full cover image
        self.image(COVER_IMG, 0, 0, 210, 297)

    # ─── HALF-TITLE PAGE ───
    def add_half_title(self):
        self.add_page()
        self._cream_background()

        self.ln(80)
        self.set_font("Georgia", "I", 22)
        self.set_text_color(*GOLD)
        self.cell(0, 12, "The Wise Emperor", align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(5)
        self._decorative_line(self.get_y())
        self.ln(10)

        self.set_font("Georgia", "I", 14)
        self.set_text_color(*WARM_GREY)
        self.cell(0, 10, "The Adventures of Marcus Aurelius", align="C")

    # ─── TITLE PAGE ───
    def add_title_page(self):
        self.add_page()
        self._cream_background()

        self.ln(50)

        # Main title
        self.set_font("Georgia", "B", 32)
        self.set_text_color(*DARK_BROWN)
        self.cell(0, 16, "The Wise Emperor", align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(4)
        self._ornamental_divider(self.get_y())
        self.ln(10)

        # Subtitle
        self.set_font("Georgia", "I", 18)
        self.set_text_color(*TERRACOTTA)
        self.cell(0, 12, "The Adventures of Marcus Aurelius", align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(20)

        # Author & illustrator
        self.set_font("Georgia", "", 13)
        self.set_text_color(*WARM_GREY)
        self.cell(0, 8, "Text by Gianni Parola", align="C", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 8, "Illustrations by Pina Pennello", align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(30)

        # Publisher
        self._decorative_line(self.get_y(), 40)
        self.ln(8)
        self.set_font("Georgia", "B", 14)
        self.set_text_color(*GOLD)
        self.cell(0, 10, "ONDE CLASSICS", align="C")

    # ─── COLOPHON ───
    def add_colophon(self):
        self.add_page()
        self._cream_background()

        self.ln(180)

        self.set_font("Georgia", "", 9)
        self.set_text_color(*WARM_GREY)

        lines = [
            "The Wise Emperor — The Adventures of Marcus Aurelius",
            "",
            "Text by Gianni Parola",
            "Illustrations by Pina Pennello",
            "",
            "Onde Classics",
            "© 2026 Onde. All rights reserved.",
            "",
            "No part of this publication may be reproduced",
            "without the prior written permission of the publisher.",
            "",
            "First English edition — 2026",
        ]
        for line in lines:
            self.cell(0, 5, line, align="C", new_x="LMARGIN", new_y="NEXT")

    # ─── DEDICATION ───
    def add_dedication(self):
        self.add_page()
        self._cream_background()

        self.ln(100)

        self.set_font("Georgia", "I", 16)
        self.set_text_color(*TERRACOTTA)
        self.cell(0, 12, "For all the children who ask questions...", align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(4)
        self.set_font("Georgia", "I", 13)
        self.set_text_color(*WARM_GREY)
        self.cell(0, 10, "...and for those who seek the answers.", align="C")

    # ─── CHAPTER ───
    def add_chapter(self, number, title, body_text, illustration_path):
        self.current_chapter = number
        self.add_page()
        self._cream_background()

        margin_left = 25
        margin_right = 25
        text_width = 210 - margin_left - margin_right

        # Chapter number
        self.ln(15)
        self.set_font("Georgia", "I", 12)
        self.set_text_color(*OLIVE_GREEN)
        self.cell(0, 8, f"Chapter {number}", align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(3)

        # Chapter title
        self.set_font("Georgia", "B", 24)
        self.set_text_color(*DARK_BROWN)
        self.cell(0, 14, title, align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(3)
        self._ornamental_divider(self.get_y())
        self.ln(10)

        # Illustration — centred, with rounded border effect
        if illustration_path and os.path.exists(illustration_path):
            img_w = 130
            img_x = (210 - img_w) / 2
            # Light border box behind image
            self.set_fill_color(*IVORY)
            self.set_draw_color(*GOLD)
            self.set_line_width(0.6)
            img_y = self.get_y()
            # We'll compute height from aspect ratio
            from PIL import Image as PILImage
            try:
                with PILImage.open(illustration_path) as pimg:
                    w_px, h_px = pimg.size
                    img_h = img_w * (h_px / w_px)
            except Exception:
                img_h = img_w * 0.65  # fallback

            # Clamp image height
            if img_h > 100:
                img_h = 100
                img_w = img_h * (w_px / h_px) if 'w_px' in dir() else img_w

            img_x = (210 - img_w) / 2
            padding = 3
            self.rect(img_x - padding, img_y - padding,
                      img_w + 2 * padding, img_h + 2 * padding, "FD")
            self.image(illustration_path, img_x, img_y, img_w)
            self.set_y(img_y + img_h + 10)

        # Body text with drop cap and dialogue styling
        self._render_body(body_text, margin_left, text_width)

    def _render_body(self, text, margin_left, text_width):
        """Render body text with drop caps and terracotta dialogues."""
        paragraphs = text.strip().split("\n\n")
        first_para = True

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            # Check if we need a new page
            if self.get_y() > 255:
                self.add_page()
                self._cream_background()
                self.ln(20)

            # Bullet list items
            if para.startswith("- "):
                items = para.split("\n")
                for item in items:
                    item = item.strip()
                    if item.startswith("- "):
                        item_text = item[2:]
                        self.set_x(margin_left + 8)
                        self.set_font("Georgia", "", 11)
                        self.set_text_color(*DARK_BROWN)

                        # Gold bullet
                        bullet_x = margin_left + 3
                        bullet_y = self.get_y() + 2.5
                        self.set_fill_color(*GOLD)
                        self.ellipse(bullet_x, bullet_y, 2, 2, "F")

                        self.set_x(margin_left + 10)
                        self.multi_cell(text_width - 10, 6.5, item_text, align="L")
                        self.ln(1)
                self.ln(3)
                continue

            # Sound effects / exclamations (short uppercase lines)
            if para.isupper() and len(para) < 30:
                self.set_font("Georgia", "B", 16)
                self.set_text_color(*TERRACOTTA)
                self.set_x(margin_left)
                self.cell(text_width, 12, para, align="C", new_x="LMARGIN", new_y="NEXT")
                self.ln(4)
                continue

            # Check if it's dialogue (starts with ")
            is_dialogue = para.startswith('"') or para.startswith('\u201c')

            # Check if it's a multi-line dialogue/poem block
            lines = para.split("\n")
            if len(lines) > 1 and all(
                l.strip().startswith('"') or l.strip().startswith('\u201c') or
                l.strip().startswith('"') or l.strip().startswith('\u201d') or
                not l.strip()
                for l in lines if l.strip()
            ):
                # Multi-line dialogue block
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    self.set_font("Georgia", "I", 11.5)
                    self.set_text_color(*TERRACOTTA)
                    self.set_x(margin_left + 5)
                    self.multi_cell(text_width - 10, 6.5, line, align="L")
                    self.ln(1)
                self.ln(3)
                continue

            # Short italic/poetic lines (e.g., "Not to count..." blocks)
            if len(lines) > 1 and all(len(l.strip()) < 60 for l in lines if l.strip()):
                all_start_pattern = all(
                    l.strip().startswith("Not ") or l.strip().startswith("But ") or
                    l.strip().startswith("He ") or l.strip().startswith("They ") or
                    l.strip().startswith("Whether ") or l.strip().startswith("How ") or
                    l.strip().startswith("Flowers ") or l.strip().startswith("Autumn ") or
                    l.strip().startswith("Night ") or l.strip().startswith("If ") or
                    l.strip().startswith("Alone") or l.strip().startswith("\"") or
                    l.strip().startswith('"') or l.strip().startswith('\u201c')
                    for l in lines if l.strip()
                )
                if all_start_pattern:
                    for line in lines:
                        line = line.strip()
                        if not line:
                            continue
                        self.set_font("Georgia", "I", 11)
                        self.set_text_color(*WARM_GREY)
                        self.set_x(margin_left + 10)
                        self.multi_cell(text_width - 20, 6.5, line, align="L")
                        self.ln(0.5)
                    self.ln(4)
                    continue

            # Regular paragraph
            if first_para and not is_dialogue:
                # Drop cap
                self._render_drop_cap_paragraph(para, margin_left, text_width)
                first_para = False
            elif is_dialogue:
                # Dialogue in terracotta italic
                self.set_font("Georgia", "I", 11.5)
                self.set_text_color(*TERRACOTTA)
                self.set_x(margin_left)
                self.multi_cell(text_width, 7, para, align="L")
                self.ln(3)
            else:
                # Normal paragraph
                self.set_font("Georgia", "", 11.5)
                self.set_text_color(*DARK_BROWN)
                self.set_x(margin_left)
                self.multi_cell(text_width, 7, para, align="L")
                self.ln(3)

    def _render_drop_cap_paragraph(self, text, margin_left, text_width):
        """Render paragraph with a decorative drop cap."""
        if len(text) < 2:
            self.set_font("Georgia", "", 11.5)
            self.set_text_color(*DARK_BROWN)
            self.set_x(margin_left)
            self.multi_cell(text_width, 7, text, align="L")
            self.ln(3)
            return

        drop_letter = text[0]
        rest = text[1:]

        y_start = self.get_y()

        # Draw drop cap
        self.set_font("Georgia", "B", 38)
        self.set_text_color(*TERRACOTTA)
        self.set_xy(margin_left, y_start - 2)
        drop_w = self.get_string_width(drop_letter) + 3
        self.cell(drop_w, 18, drop_letter)

        # Text beside drop cap (first few lines)
        self.set_font("Georgia", "", 11.5)
        self.set_text_color(*DARK_BROWN)

        # First portion next to drop cap
        indent_x = margin_left + drop_w + 1
        indent_w = text_width - drop_w - 1

        self.set_xy(indent_x, y_start + 1)
        # Split rest into words and fill lines next to drop cap
        words = rest.split()
        line = ""
        lines_beside = 0
        remaining_words = []

        for i, word in enumerate(words):
            test = line + (" " if line else "") + word
            if self.get_string_width(test) < indent_w:
                line = test
            else:
                if lines_beside < 2:
                    self.set_x(indent_x)
                    self.cell(indent_w, 7, line, new_x="LMARGIN", new_y="NEXT")
                    lines_beside += 1
                    line = word
                else:
                    remaining_words = [word] + words[i + 1:]
                    break
        else:
            remaining_words = []

        # Print last accumulated line beside drop cap
        if line and lines_beside < 3:
            self.set_x(indent_x)
            self.cell(indent_w, 7, line, new_x="LMARGIN", new_y="NEXT")
            line = ""

        # Remaining text at full width
        if remaining_words:
            remaining = (" ".join([line] + remaining_words)).strip() if line else " ".join(remaining_words)
            if remaining:
                self.set_x(margin_left)
                self.multi_cell(text_width, 7, remaining, align="L")

        self.ln(3)

    # ─── END PAGE ───
    def add_end_page(self):
        self.add_page()
        self._cream_background()

        self.ln(90)

        self.set_font("Georgia", "B", 20)
        self.set_text_color(*DARK_BROWN)
        self.cell(0, 12, "The End", align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(8)
        self._ornamental_divider(self.get_y())
        self.ln(15)

        self.set_font("Georgia", "I", 11)
        self.set_text_color(*WARM_GREY)
        self.cell(0, 7, "To learn more about the philosophy of Marcus Aurelius:", align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Georgia", "I", 12)
        self.set_text_color(*TERRACOTTA)
        self.cell(0, 8, '"Meditations" (Onde illustrated edition)', align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(30)
        self._decorative_line(self.get_y(), 40)
        self.ln(8)
        self.set_font("Georgia", "B", 12)
        self.set_text_color(*GOLD)
        self.cell(0, 10, "ONDE CLASSICS", align="C")


def parse_chapters(text):
    """Parse the markdown text into chapters."""
    chapters = []

    # Split by chapter headers
    chapter_pattern = r'###\s+Chapter\s+(\d+)\s*[—–-]\s*(.+?)(?:\n|$)'
    matches = list(re.finditer(chapter_pattern, text))

    for i, match in enumerate(matches):
        num = int(match.group(1))
        title = match.group(2).strip()

        # Get body text between this chapter and next
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()

        # Remove [ILLUSTRATION: ...] blocks
        body = re.sub(r'\[ILLUSTRATION:.*?\]', '', body, flags=re.DOTALL)

        # Remove trailing ---
        body = re.sub(r'\n---\s*$', '', body.strip())
        body = body.strip()

        chapters.append((num, title, body))

    return chapters


def main():
    # Read text
    with open(TEXT_FILE, "r", encoding="utf-8") as f:
        text = f.read()

    chapters = parse_chapters(text)
    print(f"Parsed {len(chapters)} chapters")

    # Create PDF
    pdf = WiseEmperorPDF()
    pdf.set_title("The Wise Emperor - The Adventures of Marcus Aurelius")
    pdf.set_author("Gianni Parola")
    pdf.set_subject("Children's book about Marcus Aurelius and Stoic philosophy")

    # Front matter
    pdf.add_cover()
    pdf.add_half_title()
    pdf.add_title_page()
    pdf.add_colophon()
    pdf.add_dedication()

    # Enable page numbering from here
    pdf.page_numbering_active = True

    # Chapters
    for num, title, body in chapters:
        illust_idx = num - 1
        if illust_idx < len(ILLUSTRATIONS):
            illust_path = os.path.join(ILLUST_DIR, ILLUSTRATIONS[illust_idx])
        else:
            illust_path = None
        print(f"  Chapter {num}: {title}")
        pdf.add_chapter(num, title, body, illust_path)

    # End page
    pdf.add_end_page()

    # Save
    pdf.output(OUTPUT_PDF)
    print(f"\n✅ PDF saved to: {OUTPUT_PDF}")
    print(f"   Pages: {pdf.pages_count}")


if __name__ == "__main__":
    main()
