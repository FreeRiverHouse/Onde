# ONDE - Standard Operating Procedure: Book Production

**Versione**: 1.0
**Data**: 10 Gennaio 2026
**Status**: SCOLPITO NELLA PIETRA - Seguire SEMPRE

---

## OBIETTIVO

Produrre libri classici di qualità premium a velocità industriale.
**Target**: 1000 libri in 4 ore. Pim pim pim pim.

---

## PREREQUISITI

### Tool Richiesti
| Tool | Uso | Accesso |
|------|-----|---------|
| **Grok** | Immagini statiche, copertine | x.com/i/grok (via Chrome) |
| **Hedra** | Video, animazioni, lip sync | hedra.com |
| **Claude Code** | Orchestrazione, testi, assembly | `claude --chrome` |
| **Project Gutenberg** | Testi pubblico dominio | gutenberg.org |
| **Onde Portal** | Pubblicazione | onde.la / onde.surf |

### File Template
- `/templates/book-template-onde.html` - Template HTML base
- `/templates/cover-template.psd` - Template copertina (se serve)

---

## PROCESSO: CLASSICO PUBBLICO DOMINIO

### FASE 1: SELEZIONE (2 min)

1. **Scegli il libro** da Project Gutenberg Top 100
2. **Verifica**:
   - [ ] È in pubblico dominio?
   - [ ] Ha domanda su Amazon? (check download Gutenberg)
   - [ ] Rientra nelle categorie Onde? (Classics/Futures/Learn)
3. **Identifica la CATENA**:
   - Letteratura/Poesia/Spiritualità → **ONDE CLASSICS**
   - Tech/AI → **ONDE FUTURES**
   - Educazione bambini → **ONDE LEARN**

### FASE 2: TESTO (5 min)

1. **Scarica** il testo da Project Gutenberg (formato TXT o HTML)
2. **Pulisci**:
   - Rimuovi header/footer Gutenberg
   - Formatta capitoli
   - Verifica encoding UTF-8
3. **Salva** in `/books/[categoria]/[nome-libro]/text/`

```bash
# Struttura cartella
books/
└── classics/
    └── meditations/
        ├── text/
        │   └── meditations.txt
        ├── images/
        │   └── cover.jpg
        ├── book.html
        ├── metadata.json
        └── README.md
```

### FASE 3: COPERTINA (5 min)

1. **Identifica lo stile** dalla catena:

| Catena | Stile Copertina |
|--------|-----------------|
| CLASSICS | Typography-led, minimalista, serif elegante, colori sofisticati |
| FUTURES | Bold, digital-native, sans-serif, colori vivaci |
| LEARN | Friendly, illustrato, arrotondato, colori brillanti |

2. **Genera su Grok** (x.com/i/grok → Create Images):
   - Usa prompt dalla `/content/agents/VISUAL-IDENTITY-GUIDE.md`
   - Genera 4 varianti
   - Scegli la migliore
   - **FAI UPSCALE** (obbligatorio!)

3. **Download** e salva in `/books/[categoria]/[nome-libro]/images/cover.jpg`

4. **DOPPIO CHECK**:
   - [ ] Pina verifica (stile catena, qualità)
   - [ ] Editore Capo verifica (brand fit, ready for print)

### FASE 4: ILLUSTRAZIONI INTERNE (opzionale, 10-30 min)

**Per libri che richiedono illustrazioni:**

1. **Identifica scene chiave** (max 10-15 per libro)
2. **Crea prompt** seguendo stile catena
3. **Genera in batch** su Grok (apri 5-10 tab parallele)
4. **Tecnica coerenza**: Usa image-to-image per mantenere stile
5. **DOPPIO CHECK** ogni immagine

**Per classici adulti (Meditations, filosofia):**
- Spesso bastano copertina + typography
- NO illustrazioni interne = più veloce

### FASE 5: ASSEMBLY (5 min)

1. **Crea `book.html`** dal template:
```html
<!-- /templates/book-template-onde.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{TITLE}}</title>
    <style>
        /* Stile ONDE CLASSICS */
        body { font-family: 'Garamond', serif; }
        /* ... */
    </style>
</head>
<body>
    <div class="cover">
        <img src="images/cover.jpg" alt="Cover">
    </div>
    <div class="content">
        {{CONTENT}}
    </div>
</body>
</html>
```

2. **Crea `metadata.json`**:
```json
{
    "title": "Meditations",
    "author": "Marcus Aurelius",
    "translator": "George Long",
    "language": "en",
    "category": "classics",
    "chain": "ONDE_CLASSICS",
    "keywords": ["philosophy", "stoicism", "self-improvement"],
    "description": "...",
    "price": 0.99,
    "isbn": null
}
```

### FASE 6: CONVERSIONE (2 min)

```bash
# HTML → EPUB
pandoc book.html -o book.epub --metadata title="Meditations"

# Oppure con Calibre per più controllo
ebook-convert book.html book.epub --cover images/cover.jpg
```

### FASE 7: QC FINALE (2 min)

**Checklist obbligatoria:**
- [ ] Copertina bella e centrata?
- [ ] Testo formattato correttamente?
- [ ] Nessun errore di encoding?
- [ ] Metadata completi?
- [ ] File EPUB valido? (test con Calibre/Kindle Previewer)

### FASE 8: PUBBLICAZIONE (2 min)

**Onde Portal:**
```bash
# Upload su onde.la
cp book.epub /path/to/onde-portal/public/books/
# Aggiorna catalogo
node scripts/update-catalog.js
```

**Amazon KDP (se richiesto):**
- Upload EPUB
- NO DRM
- Prezzo $0.99 per catturare mercato

---

## TEMPO TOTALE PER LIBRO

| Tipo | Tempo |
|------|-------|
| Classico senza illustrazioni | **15-20 min** |
| Classico con copertina illustrata | **25-30 min** |
| Libro bambini illustrato | **45-60 min** |

**A regime con parallelizzazione:**
- 1 Claude Code può fare 3-4 libri/ora
- Con 10 tab Grok parallele per immagini
- **Target: 1000 libri = ~250 ore lavoro = fattibile con automazione**

---

## AUTOMAZIONE TSUNAMI

### Batch Processing Script

```bash
#!/bin/bash
# scripts/tsunami/process-classics.sh

GUTENBERG_IDS=(84 1342 11 98 1661 74 2542 1232)  # Top downloads

for ID in "${GUTENBERG_IDS[@]}"; do
    echo "Processing Gutenberg ID: $ID"

    # 1. Download
    node scripts/gutenberg/download.js $ID

    # 2. Clean text
    node scripts/gutenberg/clean.js $ID

    # 3. Generate cover (requires --chrome)
    # claude --chrome "Generate cover for book $ID"

    # 4. Assembly
    node scripts/books/assemble.js $ID

    # 5. Convert
    node scripts/books/convert-epub.js $ID

    # 6. Publish
    node scripts/portal/publish.js $ID
done
```

### Priorità Classici (dal research)

| # | Libro | Gutenberg ID | Catena |
|---|-------|--------------|--------|
| 1 | Meditations | 2680 | CLASSICS |
| 2 | Frankenstein | 84 | CLASSICS |
| 3 | Pride and Prejudice | 1342 | CLASSICS |
| 4 | The Prophet | 58585 | CLASSICS |
| 5 | Alice in Wonderland | 11 | CLASSICS |
| 6 | A Tale of Two Cities | 98 | CLASSICS |
| 7 | The Great Gatsby | 64317 | CLASSICS |
| 8 | Moby Dick | 2701 | CLASSICS |
| 9 | War and Peace | 2600 | CLASSICS |
| 10 | Divine Comedy | 8800 | CLASSICS |

---

## REGOLE D'ORO

1. **QUALITÀ > VELOCITÀ** - Ma possiamo avere entrambe
2. **DOPPIO CHECK SEMPRE** - Pina + Editore Capo
3. **COERENZA CATENA** - Ogni libro segue lo stile della sua catena
4. **NON DIMENTICARE HEDRA** - Per video/animazioni
5. **COMMIT FREQUENTI** - Salva il lavoro su GitHub
6. **METADATA COMPLETI** - Ogni libro ha il suo metadata.json

---

## ERRORI DA NON FARE

- ❌ Pubblicare senza QC
- ❌ Mischiare stili tra catene
- ❌ Dimenticare l'upscale delle immagini
- ❌ Copertine con testo AI illeggibile
- ❌ Saltare il doppio check
- ❌ Usare solo Grok (ricorda Hedra!)

---

## METRICHE SUCCESSO

| Metrica | Target Giornaliero |
|---------|-------------------|
| Libri completati | 20+ |
| Copertine generate | 50+ |
| Errori QC | <5% |
| Tempo medio/libro | <20 min |

---

*Questo documento è la BIBBIA della produzione libri Onde.*
*Aggiornare solo con approvazione Mattia.*

**Ultimo aggiornamento**: 10 Gennaio 2026
