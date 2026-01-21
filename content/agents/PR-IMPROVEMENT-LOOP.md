# PR Improvement Loop - Sistema Agentico di Miglioramento Continuo

**Supervisore:** Editore Capo
**Target:** OndePR Agent (posting X/social)
**Obiettivo:** Zero errori, qualità eccellente, engagement crescente

---

## ARCHITETTURA DEL LOOP

```
┌─────────────────────────────────────────────────────────────┐
│                    EDITORE CAPO                              │
│                  (Supervisore Loop)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  1. PLANNING PHASE                                           │
│  - Legge calendario contenuti                                │
│  - Verifica risorse (immagini, quote)                        │
│  - Assegna task a OndePR                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  2. CREATION PHASE (OndePR)                                  │
│  - Draft contenuto                                           │
│  - Consulta Grok se qualità insufficiente                    │
│  - Seleziona immagine da assets esistenti                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  3. REVIEW PHASE (Editore Capo)                              │
│  - Checklist ONDE-PR-LESSONS.md                              │
│  - Verifica duplicati                                        │
│  - Quality score (1-10)                                      │
│  - APPROVE / REJECT / IMPROVE                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
    [APPROVED]            [REJECTED]
          │                     │
          ▼                     ▼
┌─────────────────┐   ┌─────────────────────────────────────┐
│  4. POSTING     │   │  5. IMPROVEMENT CYCLE                │
│  - Posta via    │   │  - Feedback specifico                │
│    Chrome/API   │   │  - Richiedi nuovo draft              │
│  - Cross-engage │   │  - Loop finché quality >= 7          │
└────────┬────────┘   └─────────────────┬───────────────────┘
         │                              │
         ▼                              │
┌─────────────────────────────────────────────────────────────┐
│  6. LEARNING PHASE                                           │
│  - Aggiorna ONDE-PR-LESSONS.md                               │
│  - Traccia errori ricorrenti                                 │
│  - Migliora prompt/istruzioni                                │
└─────────────────────────────────────────────────────────────┘
```

---

## CHECKLIST REVIEW (Editore Capo)

### Gate 1: Blockers (se fallisce = REJECT immediato)
- [ ] Non è duplicato di post esistente
- [ ] Nessun hashtag
- [ ] Link corretto (onde.la)
- [ ] Grammatica/spelling OK

### Gate 2: Quality (punteggio 1-10)
- [ ] Tono genuino (non marketing) → +2
- [ ] Ha personalità → +2
- [ ] Passa "Scroll Stop Test" → +2
- [ ] Immagine appropriata allegata → +2
- [ ] Call-to-action naturale → +2

**Soglia minima: 7/10**
- < 7: REJECT, richiedi improvement
- 7-8: APPROVE con note
- 9-10: APPROVE, salva come template

### Gate 3: Strategy (Enzo PR check)
- [ ] Allineato con brand voice
- [ ] Timing appropriato
- [ ] Non cannibalizza altri post recenti

---

## IMPROVEMENT PROMPT TEMPLATE

Quando Editore Capo rigetta un post:

```
FEEDBACK ONDEPRE - POST RIGETTATO

Account: @[account]
Draft originale: "[testo]"

PROBLEMI IDENTIFICATI:
1. [problema specifico]
2. [problema specifico]

COSA MANCA:
- [elemento mancante]

RIFERIMENTI:
- Vedi ONDE-PR-LESSONS.md sezione [X]
- Esempio post buono: "[esempio]"

AZIONE RICHIESTA:
Riscrivi seguendo questi criteri. Se non sei sicuro,
consulta Grok con questo prompt: "[prompt suggerito]"
```

---

## ASSETS MAPPING - Cosa usare per ogni tipo di post

### Post Quote Filosofiche (@Onde_FRH)

| Autore | Immagini disponibili | Path |
|--------|---------------------|------|
| Marcus Aurelius | 12 (book1-12) + cover | `/books/meditations/images/` |
| Seneca | DA GENERARE | - |
| Epicteto | DA GENERARE | - |

### Post Libri (@Onde_FRH)

| Libro | Immagini | Path |
|-------|----------|------|
| Meditations | 13 immagini | `/books/meditations/images/` |
| MILO Internet | 10 immagini | `/books/milo-internet/images-nanob/` |
| Shepherd's Promise | 7 immagini | `/OndePRDB/.../the-shepherds-promise/images/` |

### Post Building in Public (@FreeRiverHouse)

| Tipo | Immagini | Azione |
|------|----------|--------|
| Dev update | Screenshot codice | Genera live |
| Milestone | Celebration graphic | Genera su Grok |
| Lesson learned | Quote card | Template |

---

## SCHEDULE AUTOMATICO CON ASSETS

### Settimana Tipo @Onde_FRH

| Giorno | 8:08 | 11:11 | 22:22 |
|--------|------|-------|-------|
| Lun | Marcus quote + book1.jpg | Behind scenes | Riflessione |
| Mar | Seneca quote | MILO preview | Spiritualità |
| Mer | Marcus quote + book2.jpg | Processo creativo | Poesia |
| Gio | Filosofia | Nuovo libro tease | Gratitudine |
| Ven | Marcus quote + book3.jpg | Team spotlight | Weekend vibes |
| Sab | Light content | - | - |
| Dom | Spiritualità | - | - |

---

## METRICHE DA TRACCIARE

### Per Post
- Engagement rate (like + reply / impressions)
- Click-through (se link)
- Quality score assegnato

### Per Settimana
- Post pubblicati vs pianificati
- Rejection rate (% post rigettati)
- Tempo medio per approvazione
- Errori ricorrenti

### Per Mese
- Follower growth
- Top performing post
- Pattern di engagement
- Lessons learned aggiunte

---

## TRIGGER ESCALATION

### Quando coinvolgere Mattia
- 3+ rejection consecutive dello stesso tipo di errore
- Quality score medio < 6 per 5 post
- Dubbio su brand voice/strategia
- Contenuto potenzialmente controverso

### Quando coinvolgere Enzo PR
- Cambio strategia necessario
- Nuovo tipo di contenuto da introdurre
- Performance sotto aspettative per 2+ settimane

---

## COMANDI LOOP

### Per Editore Capo
```
/review-post [draft] - Valuta un post
/approve [id] - Approva per posting
/reject [id] [feedback] - Rigetta con feedback
/quality-report - Report qualità settimana
```

### Per OndePR
```
/draft [account] [tipo] - Crea bozza
/improve [id] - Migliora post rigettato
/assets [libro] - Lista immagini disponibili
/check-duplicates [account] - Verifica post esistenti
```

---

## EVOLUZIONE DEL LOOP

### Fase 1 (Attuale)
- Review manuale Editore Capo
- Checklist base
- Asset mapping statico

### Fase 2 (Prossimo)
- Pre-screening automatico (duplicati, hashtag)
- Template library con score
- Suggerimenti Grok integrati

### Fase 3 (Futuro)
- Quality prediction pre-posting
- A/B testing automatico
- Personalized timing per engagement

---

*Loop creato: 2026-01-20*
*Supervisore: Editore Capo*
*Target: Qualità eccellente, zero errori, engagement crescente*
