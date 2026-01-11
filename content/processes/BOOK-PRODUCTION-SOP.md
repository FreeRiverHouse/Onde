# ONDE - Standard Operating Procedure: Book Production

**Versione**: 1.0
**Data**: 10 Gennaio 2026
**Status**: SCOLPITO NELLA PIETRA - Seguire SEMPRE

---

## OBIETTIVO

Produrre libri classici di qualità premium a velocità industriale.
**Target**: 1000 libri in 4 ore. Pim pim pim pim.

---

## 🌟 FILOSOFIA: ABBONDANZA AI

> "Con le AI tutti avranno quello che vogliono gratis." — Elon Musk

**Onde sta realizzando questa visione.**

I nostri libri devono essere:
- **Più belli** di quelli che esistevano prima
- **Più ricchi** di illustrazioni (perché possiamo)
- **Più accessibili** (prezzi bassi, poi gratis)
- **Luxury per tutti** - non economy class

### Regola Illustrazioni: ABBONDANZA

| Tipo Libro | Illustrazioni Minime |
|------------|---------------------|
| Classico filosofico (Meditations) | 8-12 |
| Romanzo (Frankenstein) | 12-15 |
| Poesia | 1 per poesia (min 10) |
| Bambini | 1 per pagina (20+) |

**Non lesinare.** L'AI genera. Usa l'abbondanza.

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

### FASE 2: TESTO (5-10 min)

1. **Scarica** il testo da Project Gutenberg (formato TXT o HTML)

2. **🔴 VERIFICA AUTENTICITÀ (OBBLIGATORIO)**:
   - [ ] Il testo proviene da fonte verificata (Gutenberg, Internet Archive, ecc.)?
   - [ ] La traduzione è quella indicata? (verifica traduttore)
   - [ ] Nessuna modifica al testo originale?
   - [ ] Per classici: confronta con edizione di riferimento
   - [ ] **MAI modificare/inventare testi e attribuirli ad autori reali**

3. **Pulisci**:
   - Rimuovi header/footer Gutenberg
   - Formatta capitoli
   - Verifica encoding UTF-8

4. **Salva** in `/books/[categoria]/[nome-libro]/text/`

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

#### IMAGE FORMAT REQUIREMENTS FOR PRINT

| Uso | Formato | Risoluzione | Note |
|-----|---------|-------------|------|
| Logo Onde | SVG (preferito) o PNG trasparente | Vettoriale o 1000x1000+ | Mai JPG per logo |
| Copertine | PNG o TIFF | 300dpi, 1600x2560px min | Per stampa |
| Illustrazioni interne | PNG trasparente | 300dpi | Per flessibilità layout |
| Web/ePub | JPG o PNG | 72-150dpi | Ottimizzato per dimensione file |

#### REGOLE GENERALI IMMAGINI:
- Logo: SEMPRE vettoriale (SVG) o PNG trasparente - MAI JPG
- Per stampa: SEMPRE 300dpi minimo
- Per digital: 150dpi sufficiente
- Preferire PNG a JPG per qualità (no compression artifacts)
- Copertine: mantenere versione print-ready (300dpi) E web-ready (72dpi)

#### MANTENIMENTO ASSET PRINT + DIGITAL
Per ogni libro, mantenere SEMPRE due versioni di tutti gli asset:

| Asset | Versione Print | Versione Digital |
|-------|---------------|------------------|
| Copertina | `cover-print.png` (300dpi, CMYK) | `cover-web.jpg` (72dpi, RGB) |
| Illustrazioni | `images/print/` (300dpi, PNG) | `images/web/` (150dpi, JPG/PNG) |
| Logo | `logo.svg` (vettoriale) | `logo.png` (trasparente) |

**Struttura cartella aggiornata:**
```
[nome-libro]/
├── images/
│   ├── print/          # 300dpi per stampa
│   │   ├── cover-print.png
│   │   └── illustration-01.png
│   └── web/            # 72-150dpi per digital
│       ├── cover-web.jpg
│       └── illustration-01.jpg
└── ...
```

1. **Identifica lo stile** dalla catena:

| Catena | Stile Copertina |
|--------|-----------------|
| CLASSICS | Typography-led, minimalista, serif elegante, colori sofisticati |
| FUTURES | Bold, digital-native, sans-serif, colori vivaci |
| LEARN | Friendly, illustrato, arrotondato, colori brillanti |

2. **🔴 ELEMENTI OBBLIGATORI SULLA COPERTINA:**

```
┌─────────────────────────────────┐
│                                 │
│      [LOGO ONDE]                │  ← Top: Logo Onde
│                                 │
│                                 │
│      [IMMAGINE/GRAFICA]         │  ← Centro: Visual principale
│                                 │
│                                 │
│      TITOLO LIBRO               │  ← Titolo in font catena
│      di Autore Nome             │  ← Autore sotto
│                                 │
│   ─────────────────────────     │
│   ONDE by FreeRiverHouse        │  ← Bottom: Branding cross
│                                 │
└─────────────────────────────────┘
```

**Specifiche:**
| Elemento | Specifica |
|----------|-----------|
| **Logo Onde** | `/assets/branding/onde-logo.jpg` - versione alta qualità |
| **Titolo** | Font dalla catena (Didot per CLASSICS, Montserrat per FUTURES) |
| **Autore** | Sotto il titolo, font più piccolo |
| **Branding** | "ONDE by FreeRiverHouse" oppure "Onde Classics" |
| **Formato** | 1600x2560px per Kindle, 300dpi |

3. **Genera su Grok** (x.com/i/grok → Create Images):
   - Includi nel prompt: "book cover with title [TITOLO] by [AUTORE]"
   - Specifica lo stile catena
   - Genera 4 varianti
   - Scegli la migliore
   - **FAI UPSCALE** (obbligatorio!)

4. **Post-processing (se serve):**
   - Aggiungi logo Onde in post-produzione
   - Aggiungi "ONDE by FreeRiverHouse" nel footer
   - Verifica leggibilità titolo/autore

5. **Download** e salva in `/books/[categoria]/[nome-libro]/images/cover.jpg`

6. **DOPPIO CHECK**:
   - [ ] Logo Onde presente?
   - [ ] Titolo leggibile?
   - [ ] Autore presente?
   - [ ] Branding FreeRiverHouse?
   - [ ] Pina verifica (stile catena, qualità)
   - [ ] Editore Capo verifica (brand fit, ready for print)

### FASE 4: ILLUSTRAZIONI INTERNE (RACCOMANDATO, 15-45 min)

**🎨 OBIETTIVO: Fare libri PIÙ BELLI del normale, non solo funzionali.**

**Anche per classici adulti**, aggiungi illustrazioni per elevare l'esperienza:

| Tipo Libro | Illustrazioni Suggerite |
|------------|------------------------|
| Filosofia (Meditations) | 5-8 illustrazioni simboliche (colonne romane, busti, paesaggi stoici) |
| Romanzo (Frankenstein) | 8-12 scene chiave (laboratorio, natura, momenti emotivi) |
| Poesia | 1 illustrazione per poesia o sezione |
| Spiritualità | 6-10 illustrazioni contemplative |

**Processo:**

1. **Identifica scene/temi chiave** - leggi il testo, scegli momenti iconici
2. **Crea prompt** seguendo stile catena (CLASSICS = elegante, simbolico)
3. **Genera in batch** su Grok (apri 5-10 tab parallele per velocità)
4. **Tecnica coerenza**: Usa image-to-image per mantenere stile uniforme
5. **DOPPIO CHECK** ogni immagine (Pina + Editore Capo)
6. **Posiziona** le illustrazioni nei punti giusti del testo

**Stili illustrazioni per ONDE CLASSICS:**
- Acquarello elegante, non infantile
- Colori sofisticati (blu, oro, seppia)
- Simbolico/evocativo, non letterale
- Stile "museo" - come litografie d'epoca

**Tool:**
- **Grok** per illustrazioni statiche
- **Hedra** se serve animazione (es. per versione enhanced/video)

### FASE 4.5: FORWARD DEL LIBRO (5 min)

**Ogni libro ONDE CLASSICS ha una forward personale.**

#### Workflow Forward

1. **Gianni Parola scrive** la forward:
   - Segue template in `/content/agents/gianni-parola.md`
   - Apertura evocativa (1 riga)
   - Sul libro specifico (2-3 righe) - perché è speciale, cosa può dare
   - Su Onde + @magmatic__ (2 righe)
   - Call to action gentile (1 riga)

2. **Grok rivede** via API:
   ```
   Prompt: "Review this book forward for tone, grammar, and emotional impact.
   It should feel warm, human, and specific to the book. Never corporate.
   Suggest improvements if needed."
   ```

3. **Gianni integra** feedback di Grok

4. **Editore Capo approva** - check brand fit

5. **Forward inclusa** nel libro (dopo copertina, prima del testo)

#### Esempio Forward (Meditations)

> *You found this. Or maybe it found you.*
>
> *A Roman emperor wrote these words two thousand years ago, alone in his tent, after long days of war. They were never meant to be read by anyone else. Just a man trying to stay sane, stay kind, stay human—while the weight of an empire pressed down on him.*
>
> *And somehow, here they are. In your hands.*
>
> *We're Onde, a small publishing house in Los Angeles. This edition was curated by [@magmatic__](https://x.com/magmatic__) with care—and yes, with the help of AI. The text is authentic. The price is fair. The rest is between you and Marcus.*
>
> *If it helps, we'd love to hear about it.*

#### Regole Tono Forward

- **Caldo**, mai corporate
- **Specifico** per ogni libro, mai copia-incolla
- **Umano** - deve sentirsi che c'è qualcuno dietro
- **Mai** dire esplicitamente "le AI sono buone" - farlo sentire
- **Sempre** menzionare @magmatic__ con link

#### 🔮 VISIONE FUTURA: Forward Personalizzate

In futuro (Onde = Spotify per libri):
- Forward personalizzata in base alla storia di lettura dell'utente
- "Visto che hai letto X, questo libro ti piacerà perché..."
- Suggerimenti "dopo questo, leggi anche..."
- Guidiamo il lettore nel suo percorso di crescita

---

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

### FASE 7: QC FINALE + DOPPIA REVISIONE (5 min)

**🚨 REGOLA: Quando il libro è pronto, MANDA AUTOMATICAMENTE SU TELEGRAM.**
**Non aspettare che Mattia lo chieda. Ma PRIMA passa la doppia revisione.**

#### Step 1: Checklist Tecnica (Pina/Gianni)

- [ ] Copertina bella e centrata?
- [ ] Logo Onde presente?
- [ ] Titolo + Autore leggibili?
- [ ] "ONDE by FreeRiverHouse" nel footer?
- [ ] Testo formattato correttamente?
- [ ] Forward presente e corretta?
- [ ] Nessun errore di encoding?
- [ ] Metadata completi?
- [ ] File EPUB valido? (test con Calibre/Kindle Previewer)
- [ ] **ANATOMIA OK?** (5 dita, 2 orecchie, proporzioni)
- [ ] Immagini coerenti con testo?

**SE FALLISCE** → Correggi e ripeti Step 1

#### Step 2: Review Grok API

```javascript
// Chiamata Grok per review
const prompt = `
Review this book for quality:
- Title: ${title}
- Author: ${author}
- Forward: [forward text]
- Sample chapter: [first 500 words]

Check:
1. Forward tone: warm, human, specific to the book?
2. Text quality: no errors, good formatting?
3. Brand fit: matches Onde Classics style?
4. Emotional impact: does it feel curated with care?

Respond with: APPROVED or NEEDS_REVISION + specific feedback
`;
```

**SE NEEDS_REVISION** → Applica feedback, ripeti Step 2
**SE APPROVED** → Procedi a Step 3

#### Step 3: Invio Automatico su Telegram

**QUANDO entrambe le revisioni passano → MANDA SUBITO A MATTIA**

```javascript
// Invio automatico
const message = `
📚 NUOVO LIBRO PRONTO PER REVIEW

📖 ${title} - ${author}
🏷️ Chain: ${chain}
🌍 Lingue: EN (altre in preparazione)

✅ QC Tecnico: PASSED
✅ Review Grok: APPROVED

File allegati:
- cover.jpg
- book.epub
- book.pdf
`;

// Manda su Telegram
await sendTelegram(chatId, message);
await sendFile(chatId, coverPath);
await sendFile(chatId, epubPath);
await sendFile(chatId, pdfPath);
```

**Bot Telegram:** @OndePR_bot
**Chat ID:** 7505631979
**Token:** (vedi .env)

#### Flusso Completo

```
LIBRO COMPLETATO
      ↓
[Step 1] QC Tecnico (Pina/Gianni)
      ↓ PASS
[Step 2] Review Grok API
      ↓ APPROVED
[Step 3] INVIO AUTOMATICO TELEGRAM
      ↓
MATTIA RICEVE E APPROVA/RICHIEDE MODIFICHE
      ↓
PUBBLICAZIONE
```

**⚠️ IMPORTANTE**: Non aspettare che Mattia chieda il libro. Quando è pronto e ha passato la doppia revisione, MANDA SUBITO.

---

### FASE 8: TRADUZIONI (10-15 min)

**Lingue obbligatorie:**
| Codice | Lingua | Mercato |
|--------|--------|---------|
| `en` | English | USA, UK, Global |
| `es` | Español | Spagna, Latino America |
| `de` | Deutsch | Germania, Austria, Svizzera |
| `fr` | Français | Francia, Canada, Belgio |
| `it` | Italiano | Italia |
| `pt` | Português | Brasile, Portogallo |

**Processo:**
1. Traduci il testo completo (usa Claude o DeepL)
2. Traduci metadata (titolo, descrizione, keywords)
3. Traduci Editor's Note
4. **NON tradurre** le citazioni originali dell'autore (es. Marcus Aurelius resta in inglese o latino)
5. Genera ePub e PDF per ogni lingua

**Struttura file per lingua:**
```
[nome-libro]/
├── en/
│   ├── book.epub
│   ├── book.pdf
│   └── metadata.json
├── es/
│   ├── book.epub
│   ├── book.pdf
│   └── metadata.json
├── de/ ...
├── fr/ ...
├── it/ ...
├── pt/ ...
└── cover.jpg  ← Cover unica per tutte le lingue
```

### FASE 9: ARCHIVIAZIONE ONDEPRDB (2 min)

**OBBLIGATORIO: Ogni libro va archiviato in OndePRDB!**

**Path:** `/Users/mattia/Projects/OndePRDB/clients/onde/books/`

**Struttura cartella libro:**
```
OndePRDB/clients/onde/books/[nome-libro]/
├── README.md           # Info libro, links, status
├── metadata.json       # Metadata multilingua
├── cover.jpg           # Copertina principale
├── en/
│   ├── book.epub
│   ├── book.pdf
│   └── metadata.json
├── es/
│   ├── book.epub
│   ├── book.pdf
│   └── metadata.json
├── [altre lingue...]
├── images/             # Illustrazioni interne (se presenti)
├── cartoons/           # Versioni animate (se presenti)
├── videos/             # Video promozionali
│   ├── short/          # Reels, TikTok
│   └── long/           # YouTube
└── podcast/            # Audio versions
```

**Checklist archiviazione:**
- [ ] Cartella creata in OndePRDB
- [ ] Cover.jpg copiata
- [ ] ePub per ogni lingua
- [ ] PDF per ogni lingua
- [ ] metadata.json aggiornato
- [ ] README.md con status
- [ ] Git commit + push

### FASE 10: PUBBLICAZIONE (2 min)

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
