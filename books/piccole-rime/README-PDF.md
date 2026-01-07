# Piccole Rime - PDF Generation

## Setup

Dal repository root:

```bash
cd ~/CascadeProjects/Onde
npm install
```

## Generate PDF

```bash
node books/piccole-rime/create-complete-pdf.js
```

Il PDF sarà creato in: `books/piccole-rime/output/Piccole-Rime-Complete.pdf`

## Metodo Alternativo (Browser)

Se puppeteer ha problemi:

```bash
cd books/piccole-rime
open output/piccole-rime-complete.html
```

Nel browser: ⌘+P → Save as PDF → Nome: "Piccole-Rime-Complete.pdf"

## Contenuto

- 10 poesie complete con illustrazioni Luzzati
- Autori: Lina Schwarz, A.S. Novaro, Guido Gozzano, Renzo Pezzani, Trilussa
- Tutte le immagini embedded nell'HTML
- Stile: Folk Art Luzzati con colori vivaci

## Files

- `output/piccole-rime-complete.html` - HTML pronto per stampa
- `create-complete-pdf.js` - Script generazione PDF
- `images/01-10-*.jpg` - Tutte le 10 illustrazioni
