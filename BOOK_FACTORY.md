# Onde Book Factory - Guida per Claude

**Questo documento permette a QUALSIASI istanza di Claude di continuare il lavoro sui libri Onde.**

Leggi TUTTO questo file prima di iniziare qualsiasi task.

---

## Proprietario

**Mattia Petrucciani** - Gusto: eleganza, minimalismo, stile europeo.

**VIETATO:**
- Stile Pixar/americano
- Colori plasticosi
- Illustrazioni "sputtanate"
- Qualsiasi cosa cheap o kitch

**APPROVATO:**
- Acquarello elegante
- Stile vintage europeo (anni '50 italiano, Beatrix Potter inglese)
- Minimalismo raffinato
- Colori morbidi, sfumati
- SEMPRE luce calda presente

---

## Architettura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                     ONDE BOOK FACTORY                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. SCRITTURA (Gianni Parola)                                   │
│     └── Prima bozza → Revisione 1 → Revisione 2 → TESTO FINALE │
│                                                                 │
│  2. ILLUSTRAZIONI (Pino Pennello)                               │
│     └── Prompt → Generazione Grok → Selezione → IMMAGINI FINALI│
│                                                                 │
│  3. MANOSCRITTO                                                 │
│     └── Testo + Immagini → Layout → Review → MANOSCRITTO FINALE│
│                                                                 │
│  4. APPROVAZIONE                                                │
│     └── Telegram a Mattia → Feedback → Iterazione o Pubblicare │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Workflow Agentico - Revisioni Multiple

### Fase 1: Scrittura Testo

**Bozza 1** - Scrivi il libro seguendo lo stile Gianni Parola:
- 8-15 capitoli brevi
- Età target specificata
- Marcatori `[ILLUSTRAZIONE: descrizione]`
- Salva in: `books/[collana]/[nome]_draft1.md`

**Revisione 1** - Rileggi e migliora:
- Ritmo delle frasi (leggi ad alta voce mentalmente)
- Vocabolario adatto all'età
- Coerenza narrativa
- Salva in: `books/[collana]/[nome]_draft2.md`

**Revisione 2** - Rifinitura finale:
- Elimina parole superflue
- Verifica marcatori illustrazione
- Controlla morale/insegnamento
- Salva in: `books/[collana]/[nome]_FINAL.md`

**Notifica Telegram**: "📖 Testo FINALE pronto: [titolo]"

### Fase 2: Illustrazioni

**Genera Prompt** - Per ogni `[ILLUSTRAZIONE:]`:
- Stile: Acquarello elegante europeo
- NO: Pixar, plasticoso, cartoonish americano
- SI: Beatrix Potter, vintage italiano, minimalismo
- Salva prompt in: `books/[collana]/[nome]_prompts.txt`

**Genera con Grok** (usa Claude for Chrome):
1. Vai su `x.com/i/grok`
2. Clicca "Create Images"
3. Genera 2-3 varianti per immagine
4. Scarica le migliori

**Selezione**:
- Scegli la più elegante
- Se nessuna è adatta, rigenera con prompt modificato
- Salva in: `books/[collana]/images/[nome]/`

**Notifica Telegram**: "🎨 Immagini pronte: [titolo] - [N] illustrazioni"

### Fase 3: Manoscritto

**Assembla**:
- Combina testo finale + immagini
- Crea PDF/ePub con script esistenti
- Verifica layout

**Review finale**:
- Controlla ogni pagina
- Verifica alt text per accessibilità
- Controlla copertina

**Notifica Telegram**: "📚 MANOSCRITTO PRONTO: [titolo]" + allega PDF

### Fase 4: Approvazione

Aspetta risposta di Mattia:
- ✅ "Vai" / "OK" / "Pubblica" → Procedi con pubblicazione
- ❌ Feedback specifico → Itera sulla parte indicata
- Salva versione finale in: `books/[collana]/[nome]/`
- Commit su GitHub

---

## Collane Editoriali

| Collana | Path | Stile | Note |
|---------|------|-------|------|
| **Spiritualità** | `books/spirituality/` | Acquarello pastorale | Luce divina |
| **Tech** | `books/tech/` | Moderno ma caldo | LED glow soft |
| **Poetry IT** | `books/poetry/italian/` | Vintage '50 italiano | Luzzati-inspired |
| **Poetry EN** | `books/poetry/english/` | Beatrix Potter | Vintage inglese |
| **Arte** | `books/arte/` | Minimal elegante | Da definire |

---

## Notifiche Telegram

**Bot**: @OndePR_bot
**Token**: Nel file `.env` (variabile `TELEGRAM_BOT_TOKEN_ONDE`)
**Chat ID Mattia**: `7505631979`

### Come Inviare

```bash
curl -s "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -d "chat_id=7505631979" \
  -d "text=📖 Messaggio" \
  -d "parse_mode=Markdown"
```

### Formato Messaggi

**Inizio task**: `🔄 Inizio: [descrizione]`
**Testo pronto**: `📖 TESTO FINALE: [titolo] - [N] capitoli`
**Immagini pronte**: `🎨 IMMAGINI: [titolo] - [N] illustrazioni`
**Manoscritto**: `📚 MANOSCRITTO PRONTO: [titolo]` + PDF allegato
**Completato**: `✅ PUBBLICATO: [titolo]`
**Errore**: `❌ ERRORE: [descrizione]`

---

## Stile Visivo - IMPORTANTE

### Riferimenti Approvati
- **Emanuele Luzzati** - Illustratore italiano, eleganza teatrale
- **Beatrix Potter** - Delicatezza inglese, acquarello naturalistico
- **Vintage italiano anni '50** - Colori caldi, nostalgia elegante

### Prompt Template Approvato

```
Elegant watercolor children's book illustration, [scena], [soggetti],
European vintage style, soft muted colors, delicate brushstrokes,
warm golden light, NOT Pixar NOT cartoon NOT plastic,
award-winning illustration quality, 4k
```

### Parole Chiave da Usare
- `elegant watercolor`
- `European vintage style`
- `soft muted colors`
- `delicate brushstrokes`
- `warm golden light`
- `refined minimalist`

### Parole da EVITARE
- `cartoon`
- `Pixar`
- `3D`
- `plastic`
- `bright saturated colors`
- `American style`

---

## File Structure

```
Onde/
├── books/
│   ├── spirituality/
│   │   ├── legge-attrazione/
│   │   │   ├── legge_attrazione_draft1.md
│   │   │   ├── legge_attrazione_draft2.md
│   │   │   ├── legge_attrazione_FINAL.md
│   │   │   ├── legge_attrazione_prompts.txt
│   │   │   ├── images/
│   │   │   └── legge_attrazione.pdf
│   │   └── mindfulness/
│   ├── poetry/
│   │   ├── italian/
│   │   └── english/
│   └── tech/
├── scripts/
│   └── create-*.js (script per PDF/ePub)
├── BOOK_FACTORY.md (questo file)
├── CLAUDE.md (contesto progetto)
└── PROGRESS.md (stato avanzamento)
```

---

## GitHub Workflow

### Prima di Iniziare
1. `git pull origin main` - Sincronizza
2. Leggi `PROGRESS.md` per stato attuale
3. Leggi `BOOK_FACTORY.md` (questo file)

### Durante il Lavoro
- Commit frequenti con messaggi chiari
- Format: `[collana] tipo: descrizione`
- Esempio: `[spirituality] draft: legge attrazione bozza 1`

### Dopo Ogni Milestone
```bash
git add .
git commit -m "[collana] milestone: descrizione"
git push origin main
```

### Milestones da Committare
- ✍️ `draft1` - Prima bozza testo
- ✍️ `draft2` - Seconda bozza testo
- ✍️ `final-text` - Testo finale
- 🎨 `prompts` - Prompt illustrazioni
- 🎨 `images` - Immagini generate
- 📚 `manuscript` - Manoscritto completo
- ✅ `published` - Approvato e pubblicato

---

## Stato Libri (Progress Tracking)

Aggiorna `PROGRESS.md` con:

| Libro | Testo | Immagini | Manoscritto | Pubblicato |
|-------|-------|----------|-------------|------------|
| Nome  | 25%   | 50%      | 75%         | 100%       |

Percentuali:
- **25%** = Solo testo (almeno draft1)
- **50%** = Testo + Immagini generate
- **75%** = Manoscritto pronto per review
- **100%** = Approvato e pubblicato

---

## Passaggio Consegne tra Claude

Se sei un NUOVO Claude che si collega:

1. **Leggi** `CLAUDE.md` per contesto generale
2. **Leggi** `BOOK_FACTORY.md` (questo file) per workflow libri
3. **Leggi** `PROGRESS.md` per stato attuale
4. **Controlla** `books/` per vedere lavori in corso
5. **Continua** da dove si era fermato il Claude precedente

**IMPORTANTE**: Notifica sempre su Telegram quando inizi e quando finisci.

---

## Credenziali e Accessi

- **GitHub**: `github.com/FreeRiverHouse/Onde` (private)
- **X/Grok**: Usa Claude for Chrome (account già loggato)
- **Telegram**: Token in `.env`

---

## Troubleshooting

**Grok non genera bene?**
- Aggiungi "NOT Pixar NOT cartoon" al prompt
- Specifica "European vintage watercolor"
- Prova "Beatrix Potter style" o "Luzzati style"

**Testo troppo lungo/corto?**
- Target: 200-400 parole per capitolo
- 8-15 capitoli totali
- Adatta all'età target

**Immagine non elegante?**
- Rigenera con "elegant refined delicate"
- Aggiungi "soft muted colors"
- Rimuovi qualsiasi termine "cartoon" o "bright"

---

*Ultimo aggiornamento: 2026-01-06*
*Questo file è la fonte di verità per il workflow libri Onde.*
