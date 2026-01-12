# PROCEDURE MASTER REGISTRY

## REGOLA FONDAMENTALE

**PRIMA DI OGNI TASK:**
1. ✅ Controllare se esiste una procedura
2. ✅ Se esiste → USARLA
3. ✅ Se NON esiste → Proporre di crearla

**QUESTO VALE PER TUTTI GLI AGENTI AI (Cursor, Windsurf, Claude, ecc.)**

---

## PROCEDURE GLOBALI (Root Level)

### 1. PROCEDURA INVIO TELEGRAM
- **File:** `/Users/mattia/Projects/Onde/PROCEDURA-INVIO-TELEGRAM.md`
- **Agente:** Tutti
- **Scopo:** Inviare file/messaggi su Telegram
- **Quando usare:** Ogni volta che devi mandare qualcosa a Mattia su Telegram
- **Credenziali:** Bot token e chat ID inclusi nel file

### 2. PROCEDURA CONTENUTI SOCIAL
- **File:** `/Users/mattia/Projects/Onde/PROCEDURA-CONTENUTI-SOCIAL.md`
- **Agente:** PR Agent / Editore Capo
- **Scopo:** Creare contenuti social da zero
- **Quando usare:** Quando devi creare nuovi post social
- **Output:** HTML/PDF stile ONDE con post raggruppati per libro
- **Regole chiave:**
  - NESSUN HASHTAG MAI
  - Raggruppare per LIBRO (non piattaforma)
  - Check duplicati obbligatorio
  - Testi in inglese (agente PR)

### 3. PROCEDURA REVISIONE CONTENUTI SOCIAL
- **File:** `/Users/mattia/Projects/Onde/PROCEDURA-REVISIONE-CONTENUTI-SOCIAL.md`
- **Agente:** PR Agent / Editore Capo
- **Scopo:** Modificare contenuti social esistenti secondo commenti utente
- **Quando usare:** Quando Mattia chiede modifiche ai post social esistenti
- **Steps:**
  1. Backup obbligatorio (con timestamp)
  2. Analisi commenti
  3. Applicazione modifiche (SOLO quelle richieste)
  4. Verifica differenze
  5. Report finale

### 4. PROCEDURA UPGRADE CONTENUTI SOCIAL
- **File:** `/Users/mattia/Projects/Onde/PROCEDURA-UPGRADE-CONTENUTI-SOCIAL.md`
- **Agente:** PR Agent / Editore Capo
- **Scopo:** Migliorare contenuti social esistenti (es. aggiungere immagini)
- **Quando usare:** Quando devi arricchire post social con elementi extra
- **Steps:**
  1. Backup obbligatorio
  2. Analisi contenuti attuali
  3. Ricerca risorse (es. immagini dai libri)
  4. Selezione post da upgradare
  5. Applicazione upgrade
  6. Verifica e report

---

## PROCEDURE AGENTE: EDITORE CAPO

**File agente:** `/Users/mattia/Projects/Onde/content/agents/editore-capo.md`

### 5. PROCEDURA NUOVO LIBRO
- **Trigger:** "Procedura nuovo libro per [Titolo]"
- **Scopo:** Creare libro completo da zero fino a PDF su Telegram
- **Output finale:** PDF su Telegram (se non arriva, procedura NON finita)
- **Steps:**
  1. Genera illustrazioni (stile ONDE)
  2. Scrivi testo (Gianni Parola)
  3. Assembla libro
  4. Genera PDF
  5. Invia su Telegram

### 6. PROCEDURA SLIDE SOCIAL STRATEGY
- **Trigger:** "Slide strategy"
- **Scopo:** Creare presentazione strategica
- **Output finale:** Presentazione su Telegram + aggiornamento GitHub
- **Fasi:**
  1. Preparazione
  2. Creazione slide
  3. Presentazione
  4. Strategia social
  5. Review e approvazione

### 7. PROCEDURA PUBBLICA LIBRO
- **Trigger:** "Editore Capo pubblica libro [Titolo]"
- **Scopo:** Distribuire libro su tutti i canali
- **Canali:**
  - Amazon KDP
  - Apple Books
  - Kobo
  - Audible
  - Spotify
  - TikTok
  - Social media
  - PR
- **Fasi:**
  1. Preparazione file
  2. Upload piattaforme
  3. Configurazione metadata
  4. Pubblicazione
  5. Promozione

### 8. PROCEDURA CORREZIONE/UPGRADE LIBRO (BLINDATA)
- **Scopo:** Correzioni chirurgiche senza riscrivere tutto
- **Regola:** Mai riscrivere da zero, solo modifiche mirate
- **⚠️ OBBLIGATORIO:** Eseguire verify-upgrade.sh PRIMA e DOPO
- **Steps:**
  1. **FASE 1 - SNAPSHOT PRE-UPGRADE:**
     - Esegui `./verify-upgrade.sh` per salvare stato attuale
     - Annota: pagine, forward, bio notes, immagini
  2. **FASE 2 - MODIFICA CHIRURGICA:**
     - Modifica SOLO il file HTML esistente
     - USA SOLO `html-to-pdf.js` (MAI generate-*.js!)
  3. **FASE 3 - VERIFICA POST-UPGRADE:**
     - Esegui `./verify-upgrade.sh` per confrontare
     - Se ERRORI → STOP! Non inviare!
  4. **FASE 4 - SOLO SE CHECK OK:**
     - Confronto visivo PDF
     - Invio Telegram
- **FAIL-SAFE:** Se pagine/forward/bio/immagini diminuiscono → STOP AUTOMATICO

### 9. PROCEDURA CORREZIONE ERRORI
- **Scopo:** Gestire contenuto corrotto o errato
- **Quando:** Trovato contenuto corrotto, encoding sbagliato, etc.
- **Steps:**
  1. Identifica errore
  2. Trova fonte corretta
  3. Correggi
  4. Verifica

---

## PROCEDURE AGENTE: GIANNI PAROLA

**File agente:** `/Users/mattia/Projects/Onde/content/agents/gianni-parola.md`

### 10. PROCEDURA REVISIONE TESTO (OBBLIGATORIA)
- **Quando:** PRIMA che testo vada all'Editore Capo per assembly
- **Steps:**
  1. Revisione Gianni (autenticità, grammatica, ordine, encoding)
  2. Revisione Grok (via API o browser)
  3. Solo dopo → passa all'Editore Capo
- **Regola:** NON passare testi che non hanno superato step 1 e 2

---

## PROCEDURE AGENTE: PINA PENNELLO

**File agente:** `/Users/mattia/Projects/Onde/content/agents/pina-pennello.md`

### 11. PROCEDURA ILLUSTRAZIONI
- **Scopo:** Creare illustrazioni stile ONDE
- **Tool:** Grok AI
- **Stile:** Acquarello europeo, palette ONDE
- **Steps:**
  1. Ricevi brief da Gianni
  2. Genera con Grok
  3. Verifica qualità
  4. Consegna all'Editore Capo

---

## COME USARE QUESTO REGISTRY

### Workflow Standard

```
RICEVI TASK DA MATTIA
    ↓
CONTROLLA PROCEDURE-MASTER-REGISTRY.md
    ↓
PROCEDURA ESISTE?
    ├─ SÌ → USA LA PROCEDURA
    │         ↓
    │      ESEGUI TUTTI GLI STEP
    │         ↓
    │      VERIFICA COMPLETAMENTO
    │
    └─ NO → PROPONI DI CREARLA
              ↓
           "Non ho procedura per [TASK]"
           "Vuoi che ne creiamo una?"
              ↓
           SE SÌ → CREA PROCEDURA
                   ↓
                AGGIUNGI A QUESTO REGISTRY
```

### Esempio Pratico

**Task:** "Mandami il file su Telegram"
1. ✅ Controllo registry → Esiste PROCEDURA INVIO TELEGRAM
2. ✅ Apro `/Users/mattia/Projects/Onde/PROCEDURA-INVIO-TELEGRAM.md`
3. ✅ Uso bot token e chat ID dal file
4. ✅ Eseguo comando curl come da procedura
5. ✅ Verifico risposta API

**Task:** "Crea post social per nuovo libro"
1. ✅ Controllo registry → Esiste PROCEDURA CONTENUTI SOCIAL
2. ✅ Apro `/Users/mattia/Projects/Onde/PROCEDURA-CONTENUTI-SOCIAL.md`
3. ✅ Seguo tutti gli step (raccolta, creazione, formato, check duplicati)
4. ✅ Output: HTML stile ONDE senza hashtag
5. ✅ Invio su Telegram con PROCEDURA INVIO TELEGRAM

**Task:** "Ottimizza il database"
1. ❌ Controllo registry → NON esiste procedura
2. ✅ Comunico: "Non ho procedura per ottimizzazione database. Vuoi che ne creiamo una?"
3. ✅ Se sì → Creo procedura
4. ✅ Aggiungo a questo registry
5. ✅ Eseguo task

---

## REGOLE PER CREARE NUOVE PROCEDURE

### Quando Creare una Procedura

Crea procedura se:
- ✅ Task ripetitivo
- ✅ Task con step specifici
- ✅ Task che richiede credenziali/configurazione
- ✅ Task che altri agenti AI dovranno fare
- ✅ Task con regole specifiche

NON creare procedura se:
- ❌ Task una-tantum
- ❌ Task troppo semplice (1-2 comandi)
- ❌ Task troppo variabile

### Template Nuova Procedura

```markdown
# PROCEDURA [NOME]

## OBIETTIVO
[Cosa fa questa procedura]

## QUANDO USARE
[Trigger/situazioni in cui usarla]

## PROCESSO

### 1. [STEP 1]
[Dettagli]

### 2. [STEP 2]
[Dettagli]

...

## REGOLE
- ✅ [Cosa fare]
- ❌ [Cosa NON fare]

## CHECKLIST
- [ ] Step 1
- [ ] Step 2
...

## OUTPUT RICHIESTO
[Cosa deve produrre]
```

### Dopo Aver Creato Procedura

1. ✅ Salva in `/Users/mattia/Projects/Onde/PROCEDURA-[NOME].md`
2. ✅ Aggiungi a questo PROCEDURE-MASTER-REGISTRY.md
3. ✅ Se è specifica di un agente, aggiungi anche al file agente
4. ✅ Testa la procedura
5. ✅ Informa Mattia

---

## MAINTENANCE

### Aggiornare Registry

Quando aggiungi/modifichi procedure:
1. Aggiorna questo file
2. Commit con messaggio chiaro
3. Informa Mattia se è procedura critica

### Review Periodica

Ogni mese:
- Verifica procedure ancora valide
- Rimuovi procedure obsolete
- Aggiorna procedure cambiate
- Consolida procedure simili

---

## VERSIONE

**Versione:** 1.0
**Data creazione:** 2026-01-11
**Ultimo aggiornamento:** 2026-01-11
**Procedure totali:** 11

---

## QUICK REFERENCE

| Task | Procedura | File |
|------|-----------|------|
| Inviare su Telegram | PROCEDURA INVIO TELEGRAM | PROCEDURA-INVIO-TELEGRAM.md |
| Creare post social | PROCEDURA CONTENUTI SOCIAL | PROCEDURA-CONTENUTI-SOCIAL.md |
| Modificare post social | PROCEDURA REVISIONE CONTENUTI SOCIAL | PROCEDURA-REVISIONE-CONTENUTI-SOCIAL.md |
| Arricchire post social | PROCEDURA UPGRADE CONTENUTI SOCIAL | PROCEDURA-UPGRADE-CONTENUTI-SOCIAL.md |
| Creare libro | PROCEDURA NUOVO LIBRO | content/agents/editore-capo.md |
| Pubblicare libro | PROCEDURA PUBBLICA LIBRO | content/agents/editore-capo.md |
| Creare slide strategy | PROCEDURA SLIDE SOCIAL STRATEGY | content/agents/editore-capo.md |
| Correggere testo | PROCEDURA CORREZIONE | content/agents/editore-capo.md |
| Revisionare testo | PROCEDURA REVISIONE TESTO | content/agents/gianni-parola.md |
| Creare illustrazioni | PROCEDURA ILLUSTRAZIONI | content/agents/pina-pennello.md |
| Correggere errori | PROCEDURA CORREZIONE ERRORI | content/agents/editore-capo.md |
