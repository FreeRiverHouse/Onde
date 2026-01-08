# Claude for Chrome - Workflow Generazione Immagini

**Data creazione**: 2026-01-07
**Per**: Tutte le future istanze di Claude Code

---

## ⚡ IMPORTANTE - Claude Code HA ACCESSO AL BROWSER

Quando Claude Code viene lanciato con il flag `--chrome`, ho accesso completo a:
- **Claude for Chrome extension** installata
- Tutti i siti web che Mattia può vedere
- Account già loggati (X/Twitter, Instagram, etc.)
- Posso navigare, cliccare, compilare form, scaricare file

**NON DEVO CHIEDERE A MATTIA DI FARE QUESTE COSE - LE FACCIO IO DIRETTAMENTE!**

---

## 🎨 Workflow: Generazione Immagini con Grok

### Step 1: Verifica che Claude Code sia lanciato con --chrome

Se Mattia ha appena riaperto la sessione e ha menzionato `--chrome`, significa che posso usare il browser.

### Step 2: Aprire Multiple Tab di Grok (5-10 tab in parallelo)

**URL**: `https://x.com/i/grok`

**Perché multiple tab?**
- Ogni tab può generare 4 varianti alla volta
- Mentre una tab genera, passo alla successiva
- 20+ immagini in 1 minuto invece di 5 minuti

**Come**:
```
1. Apri prima tab: navigate to https://x.com/i/grok
2. Aspetta che carichi
3. Apri seconda tab in parallelo
4. Apri terza tab in parallelo
... fino a 5-10 tab
```

### Step 3: In ogni tab, cliccare su "Create Images"

Grok ha due modalità:
- Chat (default)
- **Create Images** (quello che ci serve)

Cliccare sul pulsante/link "Create Images"

### Step 4: Inserire il prompt in ogni tab

Ogni tab = 1 prompt diverso

**Per lo stile Onde (task attuale)**:
- Tab 1: Opzione A - Acquarello Morbido Italiano
- Tab 2: Opzione B - Scarry-Seuss Vivace
- Tab 3: Opzione C - Vintage Italiano Anni '50
- Tab 4: Opzione D - Moderno Flat Contemporaneo

**Prompt pronti in**: `CLAUDE.md` righe 24-42

### Step 5: Lanciare le generazioni

Click sul pulsante "Generate" in ogni tab

**IMPORTANTE**: Non aspettare che finisca una prima di lanciare le altre!
- Lancia tutte e 4 in parallelo
- Poi fai il giro per controllare quali hanno finito

### Step 6: Salvare le immagini

Grok genera **4 varianti per ogni prompt** = 16 immagini totali

**Come scaricare**:
- Click destro su immagine
- "Save image as..."
- Salvare in `~/Downloads/` con nome descrittivo

**Naming convention**:
```
onde-style-A-acquarello-variant1.jpg
onde-style-A-acquarello-variant2.jpg
onde-style-A-acquarello-variant3.jpg
onde-style-A-acquarello-variant4.jpg
onde-style-B-scarry-variant1.jpg
...
```

### Step 7: Organizzare e mostrare a Mattia

Creare un collage o organizzarle per categoria:
```
~/Downloads/onde-style-options/
├── A-acquarello/
│   ├── variant1.jpg
│   ├── variant2.jpg
│   ├── variant3.jpg
│   └── variant4.jpg
├── B-scarry/
├── C-vintage/
└── D-flat/
```

Inviare su Telegram o mostrare direttamente

### Step 8: Mattia sceglie → Aggiornare memoria

Una volta che Mattia sceglie (es. "Opzione A variant 2"), salvare in memoria:

**File da aggiornare**:
- `CLAUDE.md` → sezione "Stile Approvato"
- `PROGRESS.md` → sbloccare generazione immagini
- Creare `STYLE_GUIDE.md` con il prompt esatto approvato

---

## 🔄 Workflow per Libri (dopo che lo stile è scelto)

### Esempio: Generare 11 immagini per "Il Potere dei Desideri"

**File con prompt**: `books/image_prompts_db.json`

**Processo**:
1. Aprire 10 tab di Grok
2. Ogni tab = 1 capitolo del libro
3. Inserire prompt (già preparato in JSON)
4. Lanciare tutte le generazioni in parallelo
5. Scaricare le immagini migliori (1 per capitolo)
6. Salvarle in `books/spirituality/legge-attrazione/images/`
7. Rinominare: `chapter-01.jpg`, `chapter-02.jpg`, etc.
8. Aggiornare `image_prompts_db.json` → status: "done"

**Tempo stimato**: 5-10 minuti per 11 immagini (vs 30+ minuti una alla volta)

---

## 🚨 Regole Importanti

### 1. SEMPRE via Web - MAI via API
L'API Grok costa denaro. Il web è gratis con X Premium di Mattia.

### 2. Workflow Parallelo
Non generare 1 immagine alla volta. Sempre multiple tab in parallelo.

### 3. Image-to-Image
Posso fare drag & drop di un'immagine in Grok per dire "fai qualcosa di simile".
Utile per mantenere coerenza stilistica.

### 4. 4 Varianti = Scelta
Grok genera sempre 4 varianti. Scegliere la migliore (o chiedere a Mattia).

### 5. Backup Prompt
Salvare SEMPRE il prompt esatto usato per generare un'immagine.
Se serve rigenerare → stesso prompt = stile coerente.

---

## 📋 Checklist per Ogni Sessione con --chrome

Quando Mattia riapre con `--chrome`:

- [ ] Verificare che X sia loggato (dovrebbe esserlo)
- [ ] Aprire `x.com/i/grok` per test
- [ ] Controllare `CLAUDE.md` per task corrente
- [ ] Leggere `books/image_prompts_db.json` per immagini pending
- [ ] Aprire multiple tab (5-10)
- [ ] Generare in parallelo
- [ ] Salvare immagini
- [ ] Aggiornare status in JSON
- [ ] Commit su GitHub
- [ ] Notificare su Telegram

---

## 🎯 Task Attuale (2026-01-07)

**PRIORITÀ ASSOLUTA**: Generare 4 opzioni stilistiche Onde

**Quando Mattia riapre con --chrome**:
1. Aprire 4 tab di Grok
2. Generare le 4 opzioni (prompt in CLAUDE.md righe 24-42)
3. Salvare 16 immagini totali (4 opzioni × 4 varianti)
4. Organizzare per mostrare a Mattia
5. Mattia sceglie → SBLOCCO di tutte le generazioni future

**Dopo la scelta**:
- Creare `STYLE_GUIDE.md` con prompt template approvato
- Generare 11 immagini per "Il Potere dei Desideri"
- Rigenerare immagini AIKO se necessario
- Completare tutti i libri in queue

---

## 🔗 MCP Commands Reference (Claude for Chrome)

**Navigate**:
```
mcp__claude-in-chrome__navigate
URL: https://x.com/i/grok
```

**Click elemento**:
```
mcp__claude-in-chrome__computer
action: left_click
coordinate: [x, y]
```

**Form input**:
```
mcp__claude-in-chrome__form_input
element_ref: [ref]
value: "prompt text"
```

**Screenshot**:
```
mcp__claude-in-chrome__computer
action: screenshot
```

**Wait**:
```
mcp__claude-in-chrome__computer
action: wait
duration: 3000
```

---

*Ultimo aggiornamento: 2026-01-07*
*Questo workflow è FONDAMENTALE per la produzione rapida di libri Onde.*
