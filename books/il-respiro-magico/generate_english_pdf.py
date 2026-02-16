#!/usr/bin/env python3
"""
Generate professional PDF for "The Magic Breath" (English edition)
A children's book about breathing and calm — ages 4-7.
"""

import re
import os
from fpdf import FPDF
from PIL import Image as PILImage

# ─── Paths ───
BASE = os.path.expanduser("~/Onde/books/il-respiro-magico")
TEXT_FILE = os.path.join(BASE, "text-english.md")
ILLUST_DIR = os.path.join(BASE, "illustrations")
OUTPUT_PDF = os.path.join(BASE, "The-Magic-Breath-Professional.pdf")

COVER_IMG = os.path.join(ILLUST_DIR, "00-cover.png")

ILLUSTRATIONS = [
    "01-soffio-del-vento.png",
    "02-pancia-che-sale.png",
    "03-respiro-che-conta.png",
    "04-respiro-farfalla.png",
    "05-respiro-che-scalda.png",
    "06-gioco-cinque-sensi.png",
    "07-respiro-prima-dormire.png",
    "08-respiro-condividiamo.png",
    "09-tuo-respiro-magico.png",
]

# ─── Fonts ───
GEORGIA = "/System/Library/Fonts/Supplemental/Georgia.ttf"
GEORGIA_BOLD = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
GEORGIA_ITALIC = "/System/Library/Fonts/Supplemental/Georgia Italic.ttf"
GEORGIA_BI = "/System/Library/Fonts/Supplemental/Georgia Bold Italic.ttf"

# ─── Palette (warm watercolour for children) ───
SKY_BLUE = (135, 206, 235)       # #87CEEB
MEADOW_GREEN = (124, 179, 66)    # #7CB342
WARM_YELLOW = (255, 213, 79)     # #FFD54F
CREAM_BG = (255, 248, 231)       # #FFF8E7
SOFT_BROWN = (100, 75, 50)       # Body text
LIGHT_BROWN = (140, 110, 80)     # Page numbers / subtle text
CORAL = (220, 120, 100)          # Drop caps & dialogues
SOFT_TEAL = (100, 170, 170)      # Chapter numbers
IVORY = (248, 242, 228)          # Slightly darker cream for boxes
WHITE = (255, 255, 255)


class MagicBreathPDF(FPDF):
    """Professional children's book PDF with warm watercolour aesthetic."""

    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_auto_page_break(auto=True, margin=30)

        # Register Georgia fonts
        self.add_font("Georgia", "", GEORGIA)
        self.add_font("Georgia", "B", GEORGIA_BOLD)
        self.add_font("Georgia", "I", GEORGIA_ITALIC)
        self.add_font("Georgia", "BI", GEORGIA_BI)

        self.page_numbering_active = False
        self.current_chapter = 0

    def header(self):
        pass

    def footer(self):
        if self.page_numbering_active and self.page_no() > 4:
            self.set_y(-18)
            self.set_font("Georgia", "I", 9)
            self.set_text_color(*LIGHT_BROWN)
            self.cell(0, 10, str(self.page_no()), align="C")

    def _cream_background(self):
        """Fill page with warm cream."""
        self.set_fill_color(*CREAM_BG)
        self.rect(0, 0, 210, 297, "F")

    def _decorative_line(self, y, width=50):
        """Draw a centred decorative line."""
        x = (210 - width) / 2
        self.set_draw_color(*WARM_YELLOW)
        self.set_line_width(0.6)
        self.line(x, y, x + width, y)

    def _ornamental_divider(self, y):
        """Draw a soft ornamental divider with a dot and side lines."""
        cx = 105
        self.set_draw_color(*WARM_YELLOW)
        self.set_line_width(0.4)
        # Centre dot
        self.set_fill_color(*WARM_YELLOW)
        self.ellipse(cx - 2, y - 2, 4, 4, "F")
        # Side lines
        self.line(cx - 30, y, cx - 6, y)
        self.line(cx + 6, y, cx + 30, y)
        # Small dots
        self.set_fill_color(*SKY_BLUE)
        self.ellipse(cx - 33, y - 1.5, 3, 3, "F")
        self.ellipse(cx + 30, y - 1.5, 3, 3, "F")

    def _star_divider(self, y):
        """Draw a cute star-like divider for end of exercise blocks."""
        cx = 105
        self.set_fill_color(*WARM_YELLOW)
        for dx in [-12, 0, 12]:
            self.ellipse(cx + dx - 1.5, y - 1.5, 3, 3, "F")

    # ─── COVER PAGE ───
    def add_cover(self):
        self.add_page()
        self.image(COVER_IMG, 0, 0, 210, 297)

    # ─── HALF-TITLE PAGE ───
    def add_half_title(self):
        self.add_page()
        self._cream_background()

        self.ln(90)
        self.set_font("Georgia", "I", 24)
        self.set_text_color(*SOFT_TEAL)
        self.cell(0, 14, "The Magic Breath", align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(6)
        self._decorative_line(self.get_y())
        self.ln(12)

        self.set_font("Georgia", "I", 13)
        self.set_text_color(*LIGHT_BROWN)
        self.cell(0, 10, "A Book About Inner Calm for Little Ones", align="C")

    # ─── TITLE PAGE ───
    def add_title_page(self):
        self.add_page()
        self._cream_background()

        self.ln(55)

        # Main title
        self.set_font("Georgia", "B", 34)
        self.set_text_color(*SOFT_BROWN)
        self.cell(0, 18, "The Magic Breath", align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(5)
        self._ornamental_divider(self.get_y())
        self.ln(12)

        # Subtitle
        self.set_font("Georgia", "I", 16)
        self.set_text_color(*CORAL)
        self.cell(0, 10, "A Book About Inner Calm", align="C", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 10, "for Little Ones", align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(25)

        # Author & illustrator
        self.set_font("Georgia", "", 13)
        self.set_text_color(*LIGHT_BROWN)
        self.cell(0, 8, "Text by Gianni Parola", align="C", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 8, "Illustrations by Pina Pennello", align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(35)

        # Publisher
        self._decorative_line(self.get_y(), 40)
        self.ln(8)
        self.set_font("Georgia", "B", 14)
        self.set_text_color(*MEADOW_GREEN)
        self.cell(0, 10, "ONDE CLASSICS", align="C")

    # ─── DEDICATION PAGE ───
    def add_dedication(self):
        self.add_page()
        self._cream_background()

        self.ln(120)
        self.set_font("Georgia", "I", 14)
        self.set_text_color(*LIGHT_BROWN)
        self.cell(0, 10, "For all the children who breathe\u2026", align="C")

    # ─── COLOPHON ───
    def add_colophon(self):
        self.add_page()
        self._cream_background()

        self.ln(190)

        self.set_font("Georgia", "", 9)
        self.set_text_color(*LIGHT_BROWN)

        lines = [
            "The Magic Breath",
            "A Book About Inner Calm for Little Ones",
            "",
            "Onde Classics",
            "",
            "Text by Gianni Parola",
            "Illustrations by Pina Pennello",
            "",
            "\u00a9 2026 Onde. All rights reserved.",
            "",
            "No part of this publication may be reproduced",
            "without the written consent of the publisher.",
            "",
            "First edition \u2014 2026",
        ]
        for line in lines:
            self.cell(0, 5, line, align="C", new_x="LMARGIN", new_y="NEXT")

    # ─── ILLUSTRATION PAGE (full-page illustration for each chapter) ───
    def add_illustration_page(self, illustration_path, chapter_num, chapter_title):
        """Full-page illustration with chapter number and title at top."""
        self.add_page()
        self._cream_background()

        # Chapter heading at top
        self.ln(12)
        self.set_font("Georgia", "I", 11)
        self.set_text_color(*SOFT_TEAL)
        self.cell(0, 7, f"Chapter {chapter_num}", align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(2)
        self.set_font("Georgia", "B", 20)
        self.set_text_color(*SOFT_BROWN)
        self.cell(0, 12, chapter_title, align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(3)
        self._ornamental_divider(self.get_y())
        self.ln(8)

        # Large centred illustration
        if illustration_path and os.path.exists(illustration_path):
            try:
                with PILImage.open(illustration_path) as pimg:
                    w_px, h_px = pimg.size
                    aspect = h_px / w_px
            except Exception:
                aspect = 0.65

            available_h = 260 - self.get_y()
            img_w = 160
            img_h = img_w * aspect

            if img_h > available_h:
                img_h = available_h
                img_w = img_h / aspect

            img_x = (210 - img_w) / 2
            img_y = self.get_y()

            # Soft border behind image
            padding = 3
            self.set_fill_color(*IVORY)
            self.set_draw_color(*SKY_BLUE)
            self.set_line_width(0.5)
            self.rect(img_x - padding, img_y - padding,
                      img_w + 2 * padding, img_h + 2 * padding, "FD")

            self.image(illustration_path, img_x, img_y, img_w)

    # ─── CHAPTER TEXT PAGE ───
    def add_chapter_text_page(self, body_text):
        """Chapter text page with drop cap and generous margins."""
        self.add_page()
        self._cream_background()

        margin_left = 28
        margin_right = 28
        text_width = 210 - margin_left - margin_right

        self.ln(18)

        self._render_body(body_text, margin_left, text_width)

    def _render_body(self, text, margin_left, text_width):
        """Render body text with drop caps, dialogue styling, exercise blocks."""
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

            # Exercise block (starts with *Try it too!* or similar italic)
            if para.startswith("*") and para.endswith("*"):
                inner = para[1:-1]
                self._render_exercise_block(inner, margin_left, text_width)
                continue

            # Sound effects (short uppercase, like FFFFFFF! or HAAAA.)
            clean = para.strip().rstrip("!.").strip()
            if clean.isupper() and len(clean) < 30 and not any(c == ',' for c in clean):
                self.set_font("Georgia", "B", 18)
                self.set_text_color(*CORAL)
                self.set_x(margin_left)
                self.cell(text_width, 14, para, align="C", new_x="LMARGIN", new_y="NEXT")
                self.ln(3)
                continue

            # Check if paragraph is dialogue (starts with ")
            is_dialogue = para.startswith('"') or para.startswith('\u201c')

            # Multi-line verse/breathing pattern blocks
            lines = para.split("\n")
            if len(lines) > 1:
                is_breathing = all(len(l.strip()) < 50 for l in lines if l.strip())
                if is_breathing:
                    self._render_breathing_block(lines, margin_left, text_width)
                    continue

            # Regular paragraph
            if first_para and not is_dialogue:
                self._render_drop_cap_paragraph(para, margin_left, text_width)
                first_para = False
            elif is_dialogue:
                self.set_font("Georgia", "I", 13)
                self.set_text_color(*CORAL)
                self.set_x(margin_left)
                self.multi_cell(text_width, 8, para, align="L")
                self.ln(4)
            else:
                self.set_font("Georgia", "", 13)
                self.set_text_color(*SOFT_BROWN)
                self.set_x(margin_left)
                self.multi_cell(text_width, 8, para, align="L")
                self.ln(4)

    def _render_exercise_block(self, text, margin_left, text_width):
        """Render an exercise/activity block with a colored background."""
        if self.get_y() > 230:
            self.add_page()
            self._cream_background()
            self.ln(20)

        box_x = margin_left - 4
        box_w = text_width + 8
        y_start = self.get_y()

        # Estimate height
        self.set_font("Georgia", "I", 12)
        lines_count = len(text) / (text_width / self.get_string_width("m"))
        est_height = max(lines_count * 7.5 + 20, 35)

        # Draw box (sky blue tint)
        self.set_fill_color(220, 240, 250)
        self.set_draw_color(*SKY_BLUE)
        self.set_line_width(0.5)
        self.rect(box_x, y_start, box_w, est_height, "FD")

        # Label
        self.set_xy(margin_left, y_start + 5)
        self.set_font("Georgia", "B", 11)
        self.set_text_color(*SOFT_TEAL)
        self.cell(text_width, 6, "~ Try it too! ~", align="L", new_x="LMARGIN", new_y="NEXT")

        self.ln(2)
        self.set_font("Georgia", "I", 12)
        self.set_text_color(*SOFT_BROWN)
        self.set_x(margin_left)

        # Extract the prefix if present
        exercise_text = text
        if exercise_text.startswith("Try it too!"):
            exercise_text = exercise_text[len("Try it too!"):].strip()
        elif exercise_text.startswith("One last exercise:"):
            exercise_text = exercise_text.strip()

        self.multi_cell(text_width, 7.5, exercise_text, align="L")

        # Adjust box height to actual content
        y_end = self.get_y() + 5
        actual_height = y_end - y_start

        # Redraw box with correct height
        self.set_fill_color(220, 240, 250)
        self.set_draw_color(*SKY_BLUE)
        self.rect(box_x, y_start, box_w, actual_height, "FD")

        # Re-render text inside box
        self.set_xy(margin_left, y_start + 5)
        self.set_font("Georgia", "B", 11)
        self.set_text_color(*SOFT_TEAL)
        self.cell(text_width, 6, "~ Try it too! ~", align="L", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)
        self.set_font("Georgia", "I", 12)
        self.set_text_color(*SOFT_BROWN)
        self.set_x(margin_left)
        self.multi_cell(text_width, 7.5, exercise_text, align="L")

        self.ln(8)

    def _render_breathing_block(self, lines, margin_left, text_width):
        """Render breathing pattern lines (centred, with soft colour)."""
        for line in lines:
            line = line.strip()
            if not line:
                self.ln(2)
                continue
            self.set_font("Georgia", "I", 13)
            self.set_text_color(*SOFT_TEAL)
            self.set_x(margin_left)
            self.cell(text_width, 8, line, align="C", new_x="LMARGIN", new_y="NEXT")
            self.ln(1)
        self.ln(4)

    def _render_drop_cap_paragraph(self, text, margin_left, text_width):
        """Render paragraph with a decorative large drop cap."""
        if len(text) < 2:
            self.set_font("Georgia", "", 13)
            self.set_text_color(*SOFT_BROWN)
            self.set_x(margin_left)
            self.multi_cell(text_width, 8, text, align="L")
            self.ln(4)
            return

        drop_letter = text[0]
        rest = text[1:]

        y_start = self.get_y()

        # Draw large drop cap letter
        self.set_font("Georgia", "B", 44)
        self.set_text_color(*CORAL)
        self.set_xy(margin_left, y_start - 3)
        drop_w = self.get_string_width(drop_letter) + 4
        self.cell(drop_w, 22, drop_letter)

        # Text beside drop cap
        self.set_font("Georgia", "", 13)
        self.set_text_color(*SOFT_BROWN)

        indent_x = margin_left + drop_w + 2
        indent_w = text_width - drop_w - 2

        self.set_xy(indent_x, y_start + 1)
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
                    self.cell(indent_w, 8, line, new_x="LMARGIN", new_y="NEXT")
                    lines_beside += 1
                    line = word
                else:
                    remaining_words = [word] + words[i + 1:]
                    break
        else:
            remaining_words = []

        if line and lines_beside < 3:
            self.set_x(indent_x)
            self.cell(indent_w, 8, line, new_x="LMARGIN", new_y="NEXT")
            line = ""

        if self.get_y() < y_start + 22:
            self.set_y(y_start + 22)

        if remaining_words:
            remaining_text = (" ".join([line] + remaining_words)).strip() if line else " ".join(remaining_words)
            if remaining_text:
                self.set_x(margin_left)
                self.multi_cell(text_width, 8, remaining_text, align="L")

        self.ln(4)

    # ─── END PAGE ───
    def add_end_page(self):
        self.add_page()
        self._cream_background()

        self.ln(70)

        self.set_font("Georgia", "B", 24)
        self.set_text_color(*SOFT_BROWN)
        self.cell(0, 14, "The End", align="C", new_x="LMARGIN", new_y="NEXT")

        self.ln(10)
        self._ornamental_divider(self.get_y())
        self.ln(15)

        self.set_font("Georgia", "I", 11)
        self.set_text_color(*LIGHT_BROWN)
        self.multi_cell(0, 7,
            "For parents: the breathing exercises in this book\n"
            "are suitable for children aged 4 and above.\n"
            "Practise them together with your children, with patience and joy.\n"
            "Calm can be learned. One breath at a time.",
            align="C")

        self.ln(30)
        self._star_divider(self.get_y())
        self.ln(12)

        self._decorative_line(self.get_y(), 40)
        self.ln(8)
        self.set_font("Georgia", "B", 12)
        self.set_text_color(*MEADOW_GREEN)
        self.cell(0, 10, "ONDE CLASSICS", align="C", new_x="LMARGIN", new_y="NEXT")

        self.set_font("Georgia", "I", 10)
        self.set_text_color(*LIGHT_BROWN)
        self.cell(0, 7, "Books to grow with heart", align="C")


def parse_chapters(text):
    """Parse the markdown text into introduction + 9 chapters."""
    chapters = []

    # Extract introduction
    intro_match = re.search(r'### Introduction\s*\n(.*?)(?=### Chapter)', text, re.DOTALL)
    intro_text = ""
    if intro_match:
        intro_text = intro_match.group(1).strip()
        # Remove [ILLUSTRATION: ...] blocks
        intro_text = re.sub(r'\[ILLUSTRATION:.*?\]', '', intro_text, flags=re.DOTALL)
        intro_text = re.sub(r'\n---\s*$', '', intro_text.strip())
        intro_text = intro_text.strip()

    # Split by chapter headers
    chapter_pattern = r'###\s+Chapter\s+(\d+)\s*[-\u2014\u2013]\s*(.+?)(?:\n|$)'
    matches = list(re.finditer(chapter_pattern, text))

    for i, match in enumerate(matches):
        num = int(match.group(1))
        title = match.group(2).strip()

        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()

        # Remove [ILLUSTRATION: ...] blocks
        body = re.sub(r'\[ILLUSTRATION:.*?\]', '', body, flags=re.DOTALL)
        # Remove trailing ---
        body = re.sub(r'\n---\s*$', '', body.strip())
        # Remove **The End** at the end
        body = re.sub(r'\n\*\*The End\*\*\s*$', '', body.strip())
        # Remove the "For parents" note at the end
        body = re.sub(r'\n\*For parents:.*$', '', body.strip(), flags=re.DOTALL)
        # Remove trailing "Onde Classics" note
        body = re.sub(r'\n\*Onde Classics.*$', '', body.strip(), flags=re.DOTALL)
        body = body.strip()

        chapters.append((num, title, body))

    return intro_text, chapters


def main():
    # Read text
    with open(TEXT_FILE, "r", encoding="utf-8") as f:
        text = f.read()

    intro_text, chapters = parse_chapters(text)
    print(f"Parsed introduction + {len(chapters)} chapters")

    # Create PDF
    pdf = MagicBreathPDF()
    pdf.set_title("The Magic Breath")
    pdf.set_author("Gianni Parola")
    pdf.set_subject("A children's book about inner calm and breathing")

    # ─── Front matter ───
    pdf.add_cover()
    pdf.add_half_title()
    pdf.add_title_page()
    pdf.add_dedication()
    pdf.add_colophon()

    # Enable page numbering from here
    pdf.page_numbering_active = True

    # ─── Introduction ───
    if intro_text:
        pdf.add_page()
        pdf._cream_background()

        margin_left = 28
        text_width = 210 - margin_left - 28

        pdf.ln(20)
        pdf.set_font("Georgia", "I", 11)
        pdf.set_text_color(*SOFT_TEAL)
        pdf.cell(0, 7, "Introduction", align="C", new_x="LMARGIN", new_y="NEXT")

        pdf.ln(5)
        pdf._ornamental_divider(pdf.get_y())
        pdf.ln(12)

        pdf._render_body(intro_text, margin_left, text_width)

    # ─── Chapters ───
    for num, title, body in chapters:
        print(f"  Chapter {num}: {title}")

        # Illustration page
        illust_idx = num - 1
        if illust_idx < len(ILLUSTRATIONS):
            illust_path = os.path.join(ILLUST_DIR, ILLUSTRATIONS[illust_idx])
        else:
            illust_path = None

        pdf.add_illustration_page(illust_path, num, title)

        # Text page
        pdf.add_chapter_text_page(body)

    # ─── End page ───
    pdf.add_end_page()

    # Save
    pdf.output(OUTPUT_PDF)
    print(f"\n\u2705 PDF saved to: {OUTPUT_PDF}")
    print(f"   Pages: {pdf.pages_count}")


if __name__ == "__main__":
    main()
