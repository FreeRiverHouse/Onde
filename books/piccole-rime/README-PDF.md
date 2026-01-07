# Piccole Rime - PDF Generation

## Setup

Dal repository root:

```bash
cd ~/CascadeProjects/Onde
npm install
```

## Edizioni Disponibili

### 1. Solo Italiano

```bash
node books/piccole-rime/create-complete-pdf.js
```

Output: `books/piccole-rime/output/Piccole-Rime-Complete.pdf`

### 2. Bilingue Italiano-Inglese (testo a fronte)

```bash
node books/piccole-rime/create-bilingual-pdf.js
```

Output: `books/piccole-rime/output/Piccole-Rime-Bilingual-IT-EN.pdf`

## Metodo Alternativo (Browser)

Se puppeteer ha problemi, apri l'HTML nel browser:

**Solo Italiano:**
```bash
cd books/piccole-rime
open output/piccole-rime-complete.html
```

**Bilingue IT-EN:**
```bash
cd books/piccole-rime
open output/piccole-rime-bilingual.html
```

Nel browser: ⌘+P → Save as PDF

## Contenuto

**Edizione Italiana:**
- 10 poesie complete con illustrazioni Luzzati
- Solo testo italiano

**Edizione Bilingue:**
- 10 poesie con testo a fronte (IT-EN)
- Layout a due colonne
- Stesse illustrazioni Luzzati
- Traduzioni inglesi che mantengono metro e ritmo

**Autori:** Lina Schwarz, A.S. Novaro, Guido Gozzano, Renzo Pezzani, Trilussa

**Stile:** Folk Art Luzzati con colori vivaci

## Files

- `output/piccole-rime-complete.html` - Solo italiano
- `output/piccole-rime-bilingual.html` - Bilingue IT-EN
- `poesie-bilingue.md` - Traduzioni inglesi complete
- `create-complete-pdf.js` - Script PDF italiano
- `create-bilingual-pdf.js` - Script PDF bilingue
- `images/01-10-*.jpg` - Tutte le 10 illustrazioni
