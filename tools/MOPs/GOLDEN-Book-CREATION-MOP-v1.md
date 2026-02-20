# 📖 GOLDEN Book Creation MOP v1

## Method of Procedure — Da Idea a Libro Finito

> **Input:** Le tue indicazioni (titolo, tema, stile, età target, n° capitoli)
> **Output:** PDF luxury, EPUB, HTML — pronti per stampa/distribuzione

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  1.BRIEF │───▶│ 2.DRAFT  │───▶│ 3.REVIEW │───▶│ 4.IMAGES │───▶│ 5.BUILD  │
│  (input) │    │(scrittura│    │(iterativo│    │  (Grok)  │    │(PDF/EPUB)│
│          │    │ + setup)  │    │ feedback)│    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

## FASE 0: Quick Reference — Struttura Progetto

```
books/<book-slug>/
├── drafts/                  # Tutte le versioni del testo
│   ├── draft_v1.md          # Prima bozza
│   ├── draft_v2.md          # Revisione 1
│   ├── feedback_v1.md       # Feedback review
│   └── changelog_vN.md      # Cosa è cambiato per versione
├── images/                  # Illustrazioni (da Grok o altro)
├── scripts/                 # Build scripts (copiati dal template)
│   ├── build-luxury-html.js # MD → HTML luxury
│   ├── generate-pdf.js      # HTML → PDF (Puppeteer)
│   └── generate-epub.js     # MD → EPUB
├── luxury-edition.html      # HTML generato (non editare a mano)
├── <BookName>.pdf           # PDF finale
├── <BookName>.epub          # EPUB finale
└── PROC.md                  # Log iterazioni e note di processo
```

---

## FASE 1: BRIEF — Raccogliere l'Input

### Cosa serve dall'utente

| Campo | Obbligatorio | Esempio |
|-------|:---:|---------|
| **Titolo** | ✅ | "Marco Aurelio — L'Imperatore Filosofo" |
| **Tema/Descrizione** | ✅ | "La vita di Marco Aurelio raccontata ai bambini" |
| **Età target** | ✅ | 5-8 anni |
| **Lingua** | ✅ | Italiano |
| **N° capitoli** | ⚡ | 10-12 (default: 10) |
| **Stile narrativo** | ⚡ | Caldo, musicale, bello letto ad alta voce |
| **Stile illustrazioni** | ⚡ | Watercolor Beatrix Potter (default) |
| **Dedica** | 💎 | "A tutti i bambini che cadono e si rialzano" |
| **Citazione finale** | 💎 | Una frase significativa per chiudere il libro |
| **Publisher** | 💎 | Onde LA 🫧 (default) |

✅ = obbligatorio | ⚡ = consigliato | 💎 = opzionale

### Setup Progetto

```bash
# Crea struttura
BOOK_SLUG="mio-nuovo-libro"
mkdir -p books/$BOOK_SLUG/{drafts,images,scripts}

# Copia build scripts dal template di riferimento
cp books/marco-aurelio-bambini/scripts/*.js books/$BOOK_SLUG/scripts/

# Crea PROC.md per tracking
cat > books/$BOOK_SLUG/PROC.md << 'EOF'
# PROC — [TITOLO LIBRO]

## Parametri
- Titolo: 
- Età: 
- Capitoli: 
- Stile immagini: 

## Log Iterazioni
| Ciclo | Data | Voto | Note |
|-------|------|------|------|
EOF
```

---

## FASE 2: DRAFT — Scrittura

### 2.1 Formato Markdown Richiesto

```markdown
# Titolo Libro — Sottotitolo
### Tagline
**Publisher**

---

## Capitolo 1: Titolo del Capitolo

[ILLUSTRAZIONE: descrizione dettagliata della scena per l'illustratore]

Primo paragrafo del capitolo. Testo narrativo fluido.

Secondo paragrafo. Dettagli sensoriali, dialoghi, emozioni.

"Frasi tra virgolette doppie diventano diary-entry con stile speciale."

---

## Capitolo 2: Titolo Successivo
...
```

### 2.2 Regole di Scrittura

**Per bambini (5-8 anni):**
- 200-300 parole per capitolo
- Almeno 1 dialogo per capitolo
- Dettagli sensoriali (colori, suoni, odori)
- Vocabolario semplice ma non banale
- Ritmo musicale (deve suonare bene letto ad alta voce)
- Insegnamenti IMPLICITI (mai predicatori)
- Filo narrativo tra capitoli (hook → sviluppo → lezione → bridge)

**Per adulti/YA:**
- 500-1500 parole per capitolo
- Stesse regole di coerenza e arco narrativo

### 2.3 Prima Bozza

Salvare come `drafts/draft_v1.md`.

---

## FASE 3: REVIEW — Ciclo Iterativo di Feedback

### 3.1 Prompt di Review (per Grok o altro reviewer)

```
Sei un editor esperto di libri per bambini ([ETÀ] anni).
Valuta questo testo su scala 1-10 per ogni criterio:

1. LINGUAGGIO: adatto all'età? Musicale? Bello letto ad alta voce?
2. NARRAZIONE: arco narrativo? Coinvolgente? Il bambino vuole continuare?
3. INSEGNAMENTI: impliciti o predicatori? Naturali nel racconto?
4. EMOZIONI: il bambino si identifica col protagonista?
5. ACCURATEZZA: fatti corretti (adattati per il target)?
6. ILLUSTRAZIONI: i marcatori descrivono scene visivamente ricche?

VOTO COMPLESSIVO: X/10

PROBLEMI SPECIFICI:
- [elenco]

SUGGERIMENTI:
- [elenco]
```

### 3.2 Ciclo

```
draft_v1.md → review → feedback_v1.md → draft_v2.md → review → ... → draft_vN_FINAL.md
```

**Criteri di uscita:**
- [ ] Voto ≥ 9/10
- [ ] Nessun feedback critico aperto
- [ ] Testo supera test lettura ad alta voce
- [ ] Ogni capitolo: hook → sviluppo → insegnamento → bridge
- [ ] Almeno 3 cicli di revisione

### 3.3 Tracking in PROC.md

Aggiornare la tabella ad ogni iterazione:

```markdown
| v1 | 2026-02-16 | 5/10 | Prima bozza, troppo corto |
| v2 | 2026-02-16 | 8/10 | Espanso a 250 parole/cap, dialoghi aggiunti |
| v3 | 2026-02-17 | 9/10 | Incorporato feedback, cap 6 riscritto |
```

---

## FASE 4: IMMAGINI — Generazione con Grok

### 4.1 Setup

- Chrome aperto e loggato su **grok.com**
- JavaScript da Apple Events abilitato: Chrome → View → Developer → Allow JavaScript from Apple Events
- Cartella `books/<book-slug>/images/` creata

### 4.2 Stile Consistente — Template Prompt

Definire UNO stile e usarlo per TUTTE le immagini:

**Stile Default — Beatrix Potter Watercolor:**
```
Watercolor children's book illustration, Beatrix Potter style,
warm earthy palette (terracotta, olive green, warm gold, soft blue).

[SCENA]: [descrizione dalla tag ILLUSTRAZIONE nel draft]
[PERSONAGGIO]: [nome], [età], [descrizione fisica], [azione]
[AMBIENTE]: [setting dettagliato]
```

**⚠️ REGOLE IMMAGINI:**
- NO "Italian Renaissance" — solo lo stile scelto
- Stile IDENTICO per ogni immagine (copia/incolla il preambolo)
- Risoluzione alta (almeno 2000px) per stampa
- Naming: `cap01-descrizione.jpg`, `cap02-descrizione.png`
- URL pattern Grok: `https://imagine-public.x.ai/imagine-public/images/{uuid}.jpg`

### 4.3 Metodo: JavaScript + osascript + curl (✅ RACCOMANDATO)

Il metodo più affidabile. Estrae gli URL delle immagini via JS e scarica con curl.

**Passo 1 — Genera l'immagine su Grok:**
- Vai su https://grok.com/imagine (o nella chat)
- Inserisci il prompt
- Aspetta 20-30 secondi per la generazione

**Passo 2 — Estrai URL immagini:**

```bash
# Lista tutte le immagini generate (filtra per imagine-public.x.ai)
osascript -e 'tell application "Google Chrome" to execute front window'\''s active tab javascript "Array.from(document.images).filter(i => i.src.includes(\"imagine-public\") && !i.src.includes(\"thumbnail\")).map(i => i.src).join(\"\\n\")"'
```

**Passo 3 — Scarica con curl:**

```bash
curl -o "cap01-descrizione.jpg" "URL_IMMAGINE"
```

**Script batch completo (`scripts/grok-download.sh`):**

```bash
#!/bin/bash
# grok-download.sh - Scarica tutte le immagini generate da Grok
SAVE_PATH="${1:-./images}"
FILENAME="${2:-cap}"

mkdir -p "$SAVE_PATH"

# Ottieni URL dalla pagina corrente di Chrome
URLS=$(osascript -e 'tell application "Google Chrome" to execute front window'\''s active tab javascript "Array.from(document.images).filter(i => i.src.includes(\"imagine-public\") && !i.src.includes(\"thumbnail\") && !i.src.includes(\"width=500\")).map(i => i.src).join(\"\\n\")"')

# Scarica ogni immagine
COUNT=1
echo "$URLS" | while read -r URL; do
    if [ -n "$URL" ]; then
        OUTPUT="${SAVE_PATH}/${FILENAME}$(printf '%02d' $COUNT).jpg"
        echo "⬇️  $OUTPUT"
        curl -s -o "$OUTPUT" "$URL"
        ((COUNT++))
    fi
done

echo "✅ Done! Files in $SAVE_PATH"
```

**Uso:**
```bash
cd books/<book-slug>
bash scripts/grok-download.sh ./images cap
```

### 4.4 Metodo DevTools Console (alternativo)

Direttamente dalla console Chrome (F12):

```javascript
// Scarica tutte le immagini Grok dalla pagina
async function downloadAllGrokImages(prefix = 'cap') {
  const imgs = Array.from(document.images)
    .filter(i => i.src.includes('imagine-public') && !i.src.includes('thumbnail'));
  let count = 0;
  for (const img of imgs) {
    count++;
    const a = document.createElement('a');
    a.href = img.src;
    a.download = `${prefix}${String(count).padStart(2, '0')}.jpg`;
    a.click();
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`✅ ${count} immagini scaricate`);
}

downloadAllGrokImages('cap');
```

### 4.5 Mappa Immagini → Capitoli

Dopo aver generato tutte le immagini, aggiornare `CHAPTER_IMAGES` in `build-luxury-html.js`:

```javascript
const CHAPTER_IMAGES = {
  1: { src: 'images/cap01-descrizione.jpg', alt: 'Descrizione scena' },
  2: { src: 'images/cap02-descrizione.png', alt: 'Descrizione scena' },
  // ... per ogni capitolo
};
```

E in `generate-epub.js`:
```javascript
const chapterImages = {
  1: 'cap01-descrizione.jpg',
  2: 'cap02-descrizione.png',
  // ...
};
```

---

## FASE 5: BUILD — Generazione PDF / HTML / EPUB

### 5.1 Prerequisiti

```bash
# Verifica dipendenze (dal root del progetto)
npm ls puppeteer epub-gen 2>/dev/null || npm install puppeteer epub-gen
```

### 5.2 Configurazione Scripts

Editare la sezione `═══ CONFIGURAZIONE ═══` in `scripts/build-luxury-html.js`:

```javascript
const BOOK_TITLE = 'Titolo';
const BOOK_SUBTITLE = 'Sottotitolo';
const BOOK_TAGLINE = 'Una tagline accattivante';
const BOOK_AGE = '5–8 anni';
const PUBLISHER = 'Onde LA 🫧';
const YEAR = '2026';
const WEBSITE = 'onde.la';

const DEDICATION = `La tua dedica...`;
const FINAL_QUOTE = `"La citazione finale..."`;
const FINAL_QUOTE_AUTHOR = '— Autore —';

const CHAPTER_IMAGES = { /* ... */ };
const PAGE_NUMBERS = [ /* ... */ ];
```

Editare metadata in `scripts/generate-epub.js`:
```javascript
const option = {
  title: "Titolo Completo",
  author: 'Onde LA',
  publisher: 'Onde LA',
  lang: 'it',
  // ...
};
```

### 5.3 Build Pipeline

```bash
cd books/<book-slug>

# Step 1: Markdown → HTML Luxury Edition
node scripts/build-luxury-html.js --input drafts/draft_vN.md --output luxury-edition.html

# Step 2: HTML → PDF (Puppeteer / Chrome headless)
node scripts/generate-pdf.js --input luxury-edition.html --output <BookName>.pdf

# Step 3: Markdown → EPUB
node scripts/generate-epub.js --input drafts/draft_vN.md --output <BookName>.epub
```

**One-liner:**
```bash
node scripts/build-luxury-html.js --input drafts/draft_vN.md && \
node scripts/generate-pdf.js && \
node scripts/generate-epub.js --input drafts/draft_vN.md
```

### 5.4 Design del Luxury HTML

Il template usa:
- **Font:** Cinzel Decorative (copertina), Cinzel (titoli), EB Garamond / Cormorant Garamond (corpo)
- **Colori:** `#2C1810` (testo), `#8B4513` (titoli), `#C4963C` (oro accenti), `#FDF8F0` (sfondo crema)
- **Layout:** Pagine A4 con `page-break-after: always`
- **Elementi speciali:**
  - `.cover` — Copertina con ornamenti ✦
  - `.dedication` — Pagina dedica
  - `.toc` — Indice con numeri romani (I, II, III...)
  - `.chapter` — Pagine capitolo con illustrazione + testo
  - `.diary-entry` — Citazioni/riflessioni (corsivo, bordo oro a sinistra)
  - `.illustration-frame` — Cornice decorativa per immagini
  - `.quote-page` — Citazione finale
  - `.colophon` — Colophon (editore, anno, crediti)

### 5.5 Output Finale

| Formato | Uso | Generato da |
|---------|-----|-------------|
| **HTML** | Preview browser, base per PDF | `build-luxury-html.js` |
| **PDF** | Stampa, distribuzione, visualizzazione | `generate-pdf.js` (Puppeteer) |
| **EPUB** | E-reader (Kindle, Kobo, Apple Books) | `generate-epub.js` (epub-gen) |

---

## FASE 6: COMMIT E DISTRIBUZIONE

```bash
cd /Users/mattia/Projects/Onde
git add books/<book-slug>/
git commit -m "📚 Nuovo libro: <Titolo> — v1 (PDF + EPUB + HTML)"
git push origin main
```

---

## 📋 CHECKLIST COMPLETA

```
□ BRIEF
  □ Titolo, tema, età, lingua definiti
  □ Struttura progetto creata
  □ Scripts copiati dal template

□ DRAFT
  □ draft_v1.md scritto in formato markdown corretto
  □ [ILLUSTRAZIONE] tags per ogni capitolo

□ REVIEW
  □ Almeno 3 cicli di revisione
  □ Voto finale ≥ 9/10
  □ PROC.md aggiornato con log iterazioni

□ IMMAGINI
  □ Stile definito e consistente
  □ 1 immagine per capitolo (minimo)
  □ Naming: cap01-desc.jpg, cap02-desc.png, ...
  □ CHAPTER_IMAGES aggiornato nei build scripts

□ BUILD
  □ Configurazione aggiornata (titolo, dedica, citazioni, metadata)
  □ HTML generato e verificato nel browser
  □ PDF generato — verificato layout e font
  □ EPUB generato — verificato su e-reader

□ RELEASE
  □ Git commit + push
  □ File distribuiti dove serve
```

---

## 🔧 TROUBLESHOOTING

| Problema | Soluzione |
|----------|-----------|
| Font non si caricano nel PDF | `generate-pdf.js` aspetta `document.fonts.ready` + 2s. Se non basta, aumentare timeout |
| Immagini non compaiono in EPUB | Verificare path in `chapterImages` → file esistenti nella cartella `images/` |
| Layout HTML sballato | Controllare CSS nel file HTML (prima build può avere CSS minimo — riusare da `marco-aurelio-bambini`) |
| Grok non genera immagini | Verificare login su grok.com con account che ha accesso a generazione immagini |
| osascript JS non funziona | Abilitare: Chrome → View → Developer → Allow JavaScript from Apple Events |
| `imagine-public` non trovato | L'URL pattern può cambiare — ispezionare manualmente gli `<img>` nella pagina |
| Markdown non parsato | Verificare formato: `## Capitolo N: Titolo` (spazio dopo `##`, "Capitolo" con C maiuscola) |
| PDF troppo grande | Le immagini sono embed nell'HTML. Ottimizzare con `imagemagick` prima del build |

---

## 📚 Riferimento

- **Template completo funzionante:** `books/marco-aurelio-bambini/` (scripts, drafts, immagini, PDF, EPUB)
- **Procedura immagini Grok:** `PROCEDURE-GROK-IMAGE-GEN.md`
- **Book creation guide:** `books/BOOK-CREATION-GUIDE.md`

---

*GOLDEN Book Creation MOP v1 — Onde LA 🫧 — 2026-02-16*
*Consolidamento: PROCEDURE-GROK-IMAGE-GEN.md (Bubble 🫧) + BOOK-CREATION-GUIDE.md (Clawd)*
