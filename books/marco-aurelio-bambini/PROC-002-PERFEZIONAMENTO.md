# PROC-002: Perfezionamento Libro con Feedback Iterativo (Grok)

## Obiettivo
Portare "Marco Aurelio - L'Imperatore Filosofo" a qualità editoriale professionale attraverso cicli iterativi di revisione + feedback da Grok.

## Stato Attuale
- 10 capitoli, ~2 paragrafi ciascuno (TROPPO CORTI)
- Immagini Grok: 15 generate (stile watercolor Beatrix Potter)
- PDF base generato
- Template HTML funzionante

## Problemi da Risolvere
1. **Testo troppo scarno** — ogni capitolo ha solo 2 paragrafi (~50 parole). Per bambini 5-8 anni servono 200-300 parole/capitolo
2. **Narrazione piatta** — mancano dettagli sensoriali, dialoghi, emozioni
3. **Insegnamenti troppo diretti** — le morali sono esplicite, dovrebbero essere implicite
4. **Manca arco narrativo** — i capitoli sono vignette scollegate
5. **Manca voce narrante** — serve un tono caldo, rassicurante, musicale

## Procedura Iterativa

### CICLO 1: Espansione Testo
**Input:** book.html attuale
**Azione:** Riscrivere ogni capitolo espandendo a 200-300 parole
**Criteri:**
- [ ] Dettagli sensoriali (colori, suoni, odori)
- [ ] Almeno 1 dialogo per capitolo
- [ ] Emozioni del protagonista
- [ ] Linguaggio musicale (ritmo per lettura ad alta voce)
- [ ] Filo narrativo tra capitoli

**Output:** `drafts/draft_v2.md`
**Review:** Feedback da Grok → `drafts/feedback_v2.md`

### CICLO 2: Rifinitura Post-Feedback
**Input:** draft_v2.md + feedback_v2.md
**Azione:** Incorporare feedback, migliorare
**Criteri:**
- [ ] Feedback Grok incorporato
- [ ] Lettura fluida ad alta voce
- [ ] Vocabolario adatto 5-8 anni
- [ ] Ogni capitolo ha insegnamento IMPLICITO
- [ ] Coerenza personaggi

**Output:** `drafts/draft_v3.md`
**Review:** Feedback da Grok → `drafts/feedback_v3.md`

### CICLO N: Ripetere finché
- [ ] Grok dà voto ≥ 9/10
- [ ] Testo supera test lettura ad alta voce
- [ ] Ogni capitolo ha struttura: hook → sviluppo → insegnamento → bridge al prossimo
- [ ] Nessun feedback critico rimasto aperto

### CICLO FINALE: Assemblaggio
1. Testo finale → `marco-aurelio_FINAL.md`
2. Aggiornare `book.html` con testo nuovo
3. Rigenerare PDF con `generate_pdf.py`
4. Git commit + push

## Formato Feedback Grok
Per ogni iterazione, chiedere a Grok:
```
Sei un editor esperto di libri per bambini (5-8 anni).
Valuta questo testo su una scala 1-10 per ogni criterio:

1. LINGUAGGIO: adatto all'età? Musicale? Bello letto ad alta voce?
2. NARRAZIONE: arco narrativo? Coinvolgente? Il bambino vuole sapere cosa succede dopo?
3. INSEGNAMENTI: impliciti o predicatori? Naturali nel racconto?
4. EMOZIONI: il bambino si identifica con Marco? Prova emozioni?
5. ACCURATEZZA STORICA: i fatti sono corretti (adattati per bambini)?
6. ILLUSTRAZIONI: i marcatori [ILLUSTRAZIONE] descrivono scene visivamente ricche?

VOTO COMPLESSIVO: X/10

PROBLEMI SPECIFICI:
- [elenco]

SUGGERIMENTI:
- [elenco]
```

## Log Iterazioni
| Ciclo | Data | Voto Interno | Note |
|-------|------|-----------|------|
| v1 (originale) | 2026-02-16 | ~5/10 | Testo base, 2 paragrafi/capitolo, troppo corto |
| v2 | 2026-02-16 | 8/10 | Espansione completa a 200-300 parole/cap, dialoghi, emozioni |
| v3 | 2026-02-16 | 9/10 | Fix: vulnerabilità Marco, Cap6 riscritto, motif "rialzarsi", no lista predicatoria |
| v4 | | | Pending: feedback Grok esterno |

## File Generati
- `drafts/draft_v2.md` — prima espansione
- `drafts/draft_v3.md` — versione corrente (9/10)
- `drafts/feedback_v2_internal.md` — auto-review v2
- `drafts/feedback_v3_internal.md` — auto-review v3
- `drafts/prompt_grok_review.md` — prompt pronto per review Grok
