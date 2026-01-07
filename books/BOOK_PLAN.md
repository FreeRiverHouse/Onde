# Piano Libri Onde - 2026

**Questo file contiene il piano di produzione libri. Qualsiasi Claude può continuare da qui.**

---

## Libri in Produzione

### 1. Il Potere dei Desideri ✍️ → 🎨
- **Collana**: Spiritualità
- **Età**: 5-8 anni
- **Status**: TESTO COMPLETO, immagini da generare
- **Path**: `books/spirituality/legge-attrazione/`
- **Files**:
  - `il-potere-dei-desideri_FINAL.md` ✅
  - `il-potere-dei-desideri_prompts.txt` ✅
- **Prossimo step**: Generare 11 immagini su Grok

---

## Libri in Queue (da scrivere)

### 2. Il Respiro Magico
- **Collana**: Spiritualità
- **Tema**: Mindfulness e meditazione per bambini
- **Età**: 4-7 anni
- **Capitoli stimati**: 8-10
- **Contenuto**:
  - Esercizi di respirazione semplici
  - Consapevolezza del corpo
  - Gestione delle emozioni
  - Trovare la calma
- **Stile illustrazioni**: Acquarello morbido, colori pastello, atmosfera zen ma calda
- **Path destinazione**: `books/spirituality/mindfulness/`

### 3. Antologia Poesie Inglesi
- **Collana**: Poetry
- **Tema**: Poesie classiche inglesi per bambini
- **Età**: 5-10 anni
- **Contenuto**: 30-40 poesie da:
  - Robert Louis Stevenson (A Child's Garden of Verses)
  - A.A. Milne (When We Were Very Young)
  - Christina Rossetti (Sing-Song)
  - Edward Lear (nonsense, limerick)
  - Lewis Carroll (Jabberwocky, etc.)
- **Stile illustrazioni**: Beatrix Potter, vintage inglese, acquerello delicato
- **Path destinazione**: `books/poetry/english/`
- **Nota**: NON tradurre - rimane in inglese originale

### 4. AIKO - Traduzione Italiana
- **Collana**: Tech
- **Tema**: Traduzione di AIKO dall'inglese
- **Source**: `books/aiko-ai-children/` o `~/Downloads/aiko-final.txt`
- **Stile**: Mantieni stesso tono, adatta culturalmente
- **Immagini**: Riusa le stesse (già pronte)
- **Path destinazione**: `books/tech/aiko-it/`

### 5. La Luce Dentro (nuovo - spiritualità)
- **Collana**: Spiritualità
- **Tema**: Trovare la propria luce interiore
- **Età**: 6-9 anni
- **Contenuto**:
  - Ogni bambino ha una luce speciale
  - Come farla brillare
  - Aiutare gli altri a trovare la loro
- **Stile illustrazioni**: Molta luce dorata, atmosfera calda

### 6. Il Piccolo Inventore (tech per bambini)
- **Collana**: Tech
- **Tema**: Creatività e problem-solving
- **Età**: 6-10 anni
- **Contenuto**:
  - Un bambino che inventa cose
  - Fallimenti come apprendimento
  - Collaborazione
- **Stile illustrazioni**: Vintage ma con elementi tech, laboratorio accogliente

---

## Libri Completati

| Libro | Collana | Data | Status |
|-------|---------|------|--------|
| AIKO (EN) | Tech | 2026-01 | ✅ PDF pronto |
| Salmo 23 | Spiritualità | 2026-01 | ✅ Bozza V2 |
| Antologia Poesie IT | Poetry | 2026-01 | ✅ Pronto |

---

## Priorità Q1 2026

1. **Completare "Il Potere dei Desideri"** - immagini + PDF
2. **Scrivere "Il Respiro Magico"** - secondo libro spiritualità
3. **Antologia Poesie Inglesi** - per mercato EN
4. **Tradurre AIKO in italiano** - per mercato IT

---

## Note per Altri Claude

### Come Prendere un Libro dalla Queue

1. Scegli il prossimo libro dalla lista
2. Crea la directory: `books/[collana]/[nome-libro]/`
3. Segui il workflow in `BOOK_FACTORY.md`:
   - Draft 1 → Draft 2 → FINAL
   - Genera prompts
   - Notifica su Telegram
4. Aggiorna `PROGRESS.md` con lo stato
5. Commit su GitHub ad ogni milestone

### Come Generare Immagini

1. Leggi `image_prompts_db.json` per i prompt
2. Vai su `x.com/i/grok` (usa Claude for Chrome)
3. Clicca "Create Images"
4. Genera 2-3 varianti per prompt
5. Scegli la più elegante (NO Pixar)
6. Salva in `books/[collana]/[libro]/images/`
7. Aggiorna `image_prompts_db.json` con status "done" e filename
8. Commit

### Stile Visivo - Reminder

**SEMPRE**:
- Acquarello elegante
- Stile europeo vintage
- Colori morbidi
- Luce dorata calda

**MAI**:
- Pixar/americano
- Plasticoso
- Cartoon
- Colori saturi

---

*Ultimo aggiornamento: 2026-01-06*
