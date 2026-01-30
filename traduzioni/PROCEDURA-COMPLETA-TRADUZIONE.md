# 📚 PROCEDURA COMPLETA DI TRADUZIONE

**Owner:** Agente Editore Capo (@ondinho)
**Versione:** 1.0
**Data:** 2026-01-28

---

## ⛔ REGOLE ASSOLUTE

```
╔════════════════════════════════════════════════════════════════╗
║  1. MAI USARE TOKEN CLAUDE PER TRADUZIONI O REVISIONI          ║
║  2. OGNI MESSAGGIO MATTIA VA SU GIT (REGOLA ZERO)              ║
║  3. SAMPLE APPROVAZIONE OBBLIGATORIO PRIMA DI PRODUZIONE       ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🔄 PIPELINE COMPLETA

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   STEP 1     │ →   │   STEP 2     │ →   │   STEP 3     │
│  TRADUZIONE  │     │  REVISIONE   │     │   SAMPLE     │
│  (NLLB-200)  │     │  (2 cicli)   │     │  (3 pagine)  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 ↓
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   STEP 6     │ ←   │   STEP 5     │ ←   │   STEP 4     │
│  PUBBLICAZ.  │     │  PRODUZIONE  │     │ APPROVAZIONE │
│   (KDP)      │     │   FINALE     │     │  (Mattia)    │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 📋 STEP DETTAGLIATI

### STEP 1: TRADUZIONE
- **Tool:** NLLB-200 (locale su M4)
- **Script:** `~/clawd/translator.py`
- **Output:** `traduzioni/TITOLO-IT_nllb200-m4.md`
- **⛔ MAI Claude**

### STEP 2: REVISIONE (5+ CICLI)
- **Tool:** Ollama llama3:70b (locale)
- **Script:** `scripts/translation-pipeline.py`
- **⛔ MAI Claude per loop pesanti**

#### Cicli Obbligatori:
| Ciclo | Agente | Focus |
|-------|--------|-------|
| 1 | RILETTTORE | Errori grossolani, senso |
| 2 | REVISORE | Fedeltà all'originale |
| 3 | GRAMMATICO | Grammatica italiana perfetta |
| 4 | ANTI-SLOP | Naturalezza, no "AI-speak" |
| 5 | FORMATTATORE | Encoding UTF-8, punteggiatura |

#### Checklist Anti-Slop:
- [ ] Niente "inoltre", "pertanto" eccessivi
- [ ] Frasi naturali, come parlerebbe un italiano
- [ ] No traduzioni letterali goffe
- [ ] Apostrofi corretti (non â€™)
- [ ] Accenti corretti (à è ì ò ù)

**Output:** `traduzioni/revision-report-TITOLO.json`

### STEP 3: SAMPLE PER APPROVAZIONE ⭐
- **Formato:** PDF 3 pagine
- **Contenuto:**
  - Pag 1: 10 righe originale + 10 righe tradotte (Cap 1)
  - Pag 2: 10 righe originale + 10 righe tradotte (Cap 2)
  - Pag 3: 10 righe originale + 10 righe tradotte (Cap 3)
- **Output:** `traduzioni/samples/TITOLO-sample-approvazione.pdf`
- **Invio:** Telegram a Mattia

#### ⚠️ QA OBBLIGATORIO PRIMA DI INVIARE:
```
1. APRI il file e LEGGILO tu stesso
2. Controlla encoding (no â€™, no Ã)
3. Controlla naturalezza italiano
4. Controlla formattazione
5. SOLO SE TUTTO OK → invia a Mattia
```
**MAI inviare senza aver controllato!**

### STEP 4: APPROVAZIONE MATTIA
- **Decisore:** Mattia (SOLO LUI)
- **Opzioni:**
  - ✅ APPROVATO → Vai a Step 5
  - ❌ RIFIUTATO → Torna a Step 1 o 2
  - 🔄 MODIFICHE → Correggi e rifai Sample
- **Note:** Mattia può "licenziare" modelli che lavorano male

### STEP 5: PRODUZIONE FINALE
- **Solo dopo approvazione**
- **Output:** 
  - `traduzioni/TITOLO-IT_finale.md`
  - `traduzioni/TITOLO-IT_finale.pdf`
  - `traduzioni/TITOLO-IT_finale.epub`

### STEP 5B: QA COMPLETO (QUALITY ASSURANCE) ⭐ NUOVO

**Checklist obbligatoria prima di pubblicazione:**

#### A) COMPLETEZZA
```bash
# Verifica dimensioni
wc -l ORIGINALE.txt TRADUZIONE.txt
wc -c ORIGINALE.txt TRADUZIONE.txt
# Traduzione deve essere almeno 80% dell'originale in bytes
```
- [ ] Conteggio righe comparabile (±20%)
- [ ] Conteggio bytes comparabile (±20%)
- [ ] TUTTI i capitoli presenti
- [ ] Introduzione + Conclusione presenti
- [ ] Note/References gestite (tradotte o escluse consapevolmente)

#### B) STRUTTURA
- [ ] Titoli corrispondono all'originale
- [ ] Sottotitolo preservato
- [ ] Numerazione capitoli corretta
- [ ] Nessuna sezione tagliata a metà

#### C) FORMATTAZIONE
| Check | Comando |
|-------|---------|
| Encoding | `file TRADUZIONE.txt` → UTF-8 |
| Apostrofi | `grep "â€™" TRADUZIONE.txt` → 0 risultati |
| Accenti | `grep "Ã" TRADUZIONE.txt` → 0 risultati |
| Virgolette | Usare «» italiane |
| Markdown | Titoli ##, corsivi *, blockquote > |

#### D) QUALITÀ TRADUZIONE (3 campioni casuali)
Per ogni campione:
1. Estrarre 5-10 righe dall'originale
2. Trovare corrispondente nella traduzione
3. Verificare:
   - [ ] Fedeltà semantica (significato preservato)
   - [ ] Naturalezza italiano (suona nativo)
   - [ ] Citazioni corrette
   - [ ] Nomi propri preservati

#### E) REPORT QA
- **Output:** `traduzioni/QA-REPORT-TITOLO.md`
- **Contenuto:**
  - Metriche completezza
  - Risultati check formattazione
  - Campioni confrontati
  - Lista problemi trovati
  - Verdetto PASS/FAIL
- **Invio:** Telegram a Mattia con verdetto

**⛔ NON PUBBLICARE SE VERDETTO = FAIL**

### STEP 6: PUBBLICAZIONE
- **Piattaforma:** Amazon KDP
- **Prerequisiti:** Tutti gli step precedenti completati

---

## 📄 TEMPLATE SAMPLE (Step 3)

```markdown
# SAMPLE APPROVAZIONE TRADUZIONE

**Titolo:** [TITOLO LIBRO]
**Data:** [DATA]
**Traduttore:** NLLB-200
**Revisore:** llama3:70b (2 cicli)

---

## CAPITOLO 1

### Originale (EN)
[10 righe dal capitolo 1 inglese]

### Traduzione Revisionata (IT)
[10 righe corrispondenti in italiano]

---

## CAPITOLO 2
[stesso formato]

---

## CAPITOLO 3
[stesso formato]
```

---

## 📁 STRUTTURA FILE

```
traduzioni/
├── PROCEDURA-COMPLETA-TRADUZIONE.md  ← QUESTO FILE
├── PROCEDURE-TRADUZIONE.md           ← Dettagli tecnici
├── samples/
│   └── TITOLO-sample-approvazione.pdf
├── TITOLO-EN_originale.txt
├── TITOLO-IT_nllb200-m4.md
├── TITOLO-IT_revisionato.md
├── TITOLO-IT_finale.md
└── revision-report-TITOLO.json
```

---

## ✅ CHECKLIST TRADUZIONE

- [ ] Step 1: Traduzione NLLB-200 completata
- [ ] Step 2: Revisione 2 cicli completata
- [ ] Step 3: Sample 3 pagine creato
- [ ] Step 3b: Sample inviato a Mattia su TG
- [ ] Step 4: Approvazione ricevuta
- [ ] Step 5: Produzione finale completata
- [ ] Step 6: Pubblicato su KDP

---

*Documento creato da @ondinho | 2026-01-28*
*QUESTO FILE È LA FONTE DI VERITÀ PER LA PROCEDURA*
