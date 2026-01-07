# AIKO - RAW Materials

This folder contains all raw materials needed to create the AIKO children's book.

## Contents

### Images (`/images/`)
- `00-cover.jpg` - Cover image (Sofia + Luca + AIKO reading together)
- `chapter-01.jpg` through `chapter-08.jpg` - Chapter illustrations

**IMPORTANT: These images are FINAL and should NOT be replaced.**

### Text
- `aiko-full-text.txt` - Complete book text with all chapters
- `text-content.md` - Structured text content (partial extraction)
- `image-mapping.json` - Mapping of images to chapters

## Book Structure

| Chapter | Title | Image |
|---------|-------|-------|
| Cover | AIKO: AI Explained to Children | 00-cover.jpg |
| 1 | A Strange New Friend | chapter-01.jpg |
| 2 | What Is Artificial Intelligence? | chapter-02.jpg |
| 3 | How AIKO Learned to See | chapter-03.jpg |
| 4 | How AIKO Learned to Talk | chapter-04.jpg |
| 5 | What AIKO Can Do | chapter-05.jpg |
| 6 | What AIKO Cannot Do | chapter-06.jpg |
| 7 | Using AI Safely | chapter-07.jpg |
| 8 | The Future We Build Together | chapter-08.jpg |

## Layout Requirements

The book must be laid out for **Letter size (8.5 x 11 inches)** with the following constraints:

### Current Issues (to fix)
1. **Text overlapping images** in chapters 3-7
2. **Images too small** - need to be prominent

### Recommended Layout
- Each chapter on its own page
- Image should be **large and prominent** (at least 50% of page height)
- Text should be **below** the image with proper margins
- Use page breaks to prevent overflow
- Font: Georgia or similar serif, 14-16px
- Line height: 1.6-1.8

### Page Structure per Chapter
```
┌─────────────────────────┐
│  Chapter X: Title       │  <- Header (small)
│  ───────────────────    │
│                         │
│    ┌───────────────┐    │
│    │               │    │
│    │    IMAGE      │    │  <- 4-5 inches tall
│    │               │    │
│    └───────────────┘    │
│                         │
│  [Text paragraph 1]     │  <- Text below image
│  [Text paragraph 2]     │
│  [...]                  │
│                         │
└─────────────────────────┘
```

## How to Rebuild

1. Read `aiko-full-text.txt` for complete chapter text
2. Use images from `/images/` folder
3. Create HTML with proper CSS for print layout
4. Generate PDF using Puppeteer or similar
5. Generate ePub using Pandoc

## Author & Publisher

- **Author**: Gianni Parola
- **Illustrator**: Pino Pennello
- **Publisher**: Onde - Free River House

## Output Formats Needed

1. **PDF** - For print and digital distribution (Letter size)
2. **ePub** - For e-readers
3. **HTML** - Source format

---

*Created: 2026-01-06*
