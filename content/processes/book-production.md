# Processo di Produzione Libri - Casa Editrice Onde

## Overview

Questo documento descrive il processo completo per creare un libro illustrato per bambini, dalla commissione alla pubblicazione.

**Primo libro prodotto**: "Il Salmo 23 per Bambini" (Gennaio 2026)

---

## 0. FASE CHECK1 - APPROVAZIONE STILE (OBBLIGATORIO)

**Prima di iniziare la produzione di QUALSIASI libro, serve l'approvazione CHECK1 di Magmatic.**

### 0.1 Cos'è CHECK1

CHECK1 è il momento in cui Magmatic sceglie lo stile visivo e testuale per ogni libro.
Senza CHECK1 approvato, NON si procede alla produzione.

### 0.2 Cosa mandare su Telegram per CHECK1

| Tipo Libro | Testo | Immagini |
|------------|-------|----------|
| **PUBBLICO DOMINIO** (autori senza copyright) | 1 esempio di formatting | 2 varianti stile |
| **ORIGINALE ONDE** (testi nostri) | 2 esempi di testo | 2 varianti stile |

### 0.3 Formato PDF CHECK1

Per ogni libro nel batch (es. 10 libri):
```
PAGINA 1: Titolo + Info
- Titolo libro
- Autore originale (se pubblico dominio)
- Categoria Onde (Classics/Futures/Learn)
- Perché pubblicarlo (domanda, gap Amazon)

PAGINA 2-3: Opzioni Stile
- [Se pubblico dominio] 1 pagina testo formattato + 2 immagini stile
- [Se originale] 2 pagine testo + 2 immagini stile

PAGINA 4: Scelta
- [ ] Opzione A (descrivi)
- [ ] Opzione B (descrivi)
- [ ] Nessuna, rigenerare
```

### 0.4 Workflow CHECK1

1. **Sally CRO** fornisce lista 10 libri prioritizzati
2. **Editore Capo** coordina produzione sample
3. **Pina Pennello** genera 2 varianti immagine per libro
4. **Gianni Parola** prepara sample testo (se originale)
5. **Editore Capo** assembla PDF CHECK1
6. **PDF mandato su Telegram** a Magmatic
7. **Magmatic risponde** con scelte (via Telegram)
8. **Solo dopo CHECK1 approvato** → si procede a produzione completa

### 0.5 Comando per Editore Capo

Quando Magmatic dice:
> "Capo, segui procedura di creazione libro per N"

L'Editore Capo deve:
1. Consultare Sally per lista N libri priorità
2. Preparare CHECK1 per tutti N
3. Mandare PDF su Telegram
4. Attendere risposta Magmatic
5. Procedere con produzione dopo approvazione

---

## 1. FASE PREPARAZIONE

### 1.1 Struttura Cartelle
```
/Onde/books/[nome-libro]/
├── images/               # Illustrazioni
│   ├── 00-copertina.jpg
│   ├── 01-[nome-capitolo].jpg
│   └── ...
├── libro.md              # Testo markdown originale
├── libro.html            # Template HTML per PDF
├── libro-v2.html         # Template iterato
├── libro-v2.pdf          # PDF finale
└── create-pdf.js         # Script generazione PDF
```

### 1.2 Dipendenze
```bash
# Nel progetto Onde
npm install puppeteer --save
```

---

## 2. FASE TESTI (Gianni Parola)

### 2.1 Brief al Writer
Passare a Gianni Parola:
- Testo di riferimento (es. Salmo 23)
- Target età (es. 5-8 anni)
- Numero capitoli desiderato
- Tono (poetico, giocoso, rassicurante)

### 2.2 Output Atteso
Gianni produce un file markdown con:
- Titolo e sottotitolo
- Capitoli con titoli evocativi
- Testo narrativo + dialoghi
- Marcatori `[ILLUSTRAZIONE: descrizione]` per ogni immagine

### 2.3 Struttura Capitolo
```markdown
## Capitolo X: [Titolo Evocativo]

[ILLUSTRAZIONE: descrizione scena]

[Narrazione poetica]

"[Dialogo del protagonista]"

[Chiusura narrativa]
```

---

## 3. FASE ILLUSTRAZIONI (Pina Pennello + Grok)

### 3.1 Prompt Template per Grok

```
Create a children's book illustration in warm watercolor style.

Scene: [descrizione dalla [ILLUSTRAZIONE]]
Style: Richard Scarry meets Dr. Seuss with Italian sensibility
Colors: Warm, inviting palette
Lighting: Soft, golden light (always present - "quel raggio che dice ci sono anch'io")
Mood: [emozione del capitolo]

Technical: High resolution, suitable for print, no text in image
```

### 3.2 Generazione Immagini con Grok

1. Aprire X/Twitter → Grok
2. Per ogni illustrazione:
   - Incollare prompt
   - Richiedere 4 varianti
   - Selezionare la migliore
   - Click destro → "Save Image"

### 3.3 Selezione Immagini
Criteri di selezione:
- Coerenza stilistica con le altre
- Luminosità (sempre presente luce)
- Espressività personaggi
- Composizione bilanciata

### 3.4 Organizzazione File
```
00-copertina.jpg  # Scena d'insieme
01-[capitolo].jpg # Prima scena
02-[capitolo].jpg # Seconda scena
...
```

---

## 4. FASE IMPAGINAZIONE

### 4.1 Template HTML

Struttura base:
```html
<!DOCTYPE html>
<html lang="it">
<head>
    <style>
        @page { size: A4; margin: 0; }
        .page {
            width: 210mm;
            height: 297mm;
            page-break-after: always;
        }
        /* Vedi libro-v2.html per CSS completo */
    </style>
</head>
<body>
    <div class="page cover">...</div>
    <div class="page dedication">...</div>
    <div class="page chapter">...</div>
    <!-- Un capitolo per pagina -->
    <div class="page end-page">...</div>
</body>
</html>
```

### 4.2 Elementi Obbligatori

**Copertina**
- Immagine principale
- Titolo
- Sottotitolo
- Autore/Illustratore

**Dedica** (opzionale ma consigliata)
- Testo breve e universale
- Decorazioni ornamentali

**Capitoli**
- Numero capitolo (CAPITOLO UNO, DUE...)
- Titolo capitolo
- Immagine (170mm larghezza)
- Testo centrato
- Citazioni evidenziate (bordo colorato)
- Numero pagina

**Pagina Finale**
- "Fine"
- Credits completi
- Editore
- Anno

### 4.3 Font Consigliati
```css
/* Titoli */
font-family: 'Libre Baskerville', serif;

/* Testo corpo */
font-family: 'Quicksand', sans-serif;

/* Dimensioni per bambini */
font-size: 14pt;  /* corpo */
font-size: 20pt;  /* titoli capitolo */
line-height: 1.9;
```

### 4.4 Palette Colori
```css
/* Verde pastorale */
#3d6b41  /* titoli */
#4a7c59  /* citazioni */
#8bc49a  /* decorazioni */

/* Neutri caldi */
#fffef5  /* sfondo pagine */
#333     /* testo */
#666     /* credits */
```

---

## 5. FASE GENERAZIONE PDF

### 5.1 Script create-pdf.js

```javascript
const puppeteer = require('puppeteer');
const path = require('path');

async function createPDF() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto(`file://${path.join(__dirname, 'libro-v2.html')}`, {
        waitUntil: 'networkidle0'
    });

    await page.waitForSelector('img');
    await new Promise(r => setTimeout(r, 3000)); // Wait for images

    await page.pdf({
        path: path.join(__dirname, 'libro-v2.pdf'),
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        preferCSSPageSize: true
    });

    await browser.close();
}

createPDF();
```

### 5.2 Esecuzione
```bash
cd /path/to/book
node create-pdf.js
```

---

## 6. FASE REVISIONE

### 6.1 Checklist Pre-Telegram
- [ ] Tutte le immagini caricate correttamente
- [ ] Testo leggibile e senza errori
- [ ] Numeri di pagina corretti
- [ ] Credits completi
- [ ] PDF dimensione ragionevole (< 5MB per Telegram)

### 6.2 Invio su Telegram
```bash
curl -X POST "https://api.telegram.org/bot[TOKEN]/sendDocument" \
  -F chat_id="[CHAT_ID]" \
  -F document=@"libro-v2.pdf" \
  -F caption="[TITOLO] - Bozza VX. Pronto per KDP?"
```

---

## 7. FASE PUBBLICAZIONE KDP

### 7.1 Requisiti KDP
- Formato: PDF o ePub
- Copertina: 2560x1600px (separata)
- ISBN: opzionale per versione gratuita

### 7.2 Metadata
- Titolo
- Sottotitolo
- Descrizione (2-3 frasi)
- Keywords (7 max)
- Categorie
- Prezzo (default: gratis o €0.99)

---

## 8. MEMORIA AGENTI

### 8.1 Dopo Ogni Libro
Aggiornare i file `.memory.json`:

**pino-pennello.memory.json**
```json
{
  "learnedPreferences": {
    "style": ["Nuove preferenze scoperte"]
  },
  "conversationInsights": [
    {
      "date": "YYYY-MM-DD",
      "insight": "Cosa ha funzionato",
      "details": "Dettagli specifici"
    }
  ]
}
```

**gianni-parola.memory.json**
```json
{
  "learnedPreferences": {
    "themes": ["Temi che funzionano"],
    "writingStyle": ["Stili preferiti"]
  }
}
```

---

## Appendice: Libri Prodotti

| Titolo | Data | Pagine | Status |
|--------|------|--------|--------|
| Il Salmo 23 per Bambini | 2026-01-05 | 10 | Bozza V2 pronta |

---

*Documento creato: 2026-01-05*
*Casa Editrice Onde*
