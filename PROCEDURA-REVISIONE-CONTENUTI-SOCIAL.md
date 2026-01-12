# PROCEDURA REVISIONE CONTENUTI SOCIAL

## OBIETTIVO
Modificare contenuti social esistenti secondo i commenti dell'utente, mantenendo traccia delle modifiche e verificando che solo le modifiche richieste siano state applicate.

## PROCESSO

### 0. SCRIPT VERIFICA (OBBLIGATORIO)

```bash
# ESEGUI PRIMA di iniziare:
./scripts/backup-manager.sh create social [file.html]
./scripts/verify-social-content.sh [file.html]

# ESEGUI DOPO aver finito:
./scripts/verify-social-content.sh [file.html]

# Se errori → STOP! Non procedere!
```

### 1. BACKUP (OBBLIGATORIO)
**PRIMA di qualsiasi modifica:**

1. Identificare il file corrente dei contenuti social
2. Creare backup completo con timestamp:
   - Nome: `CONTENUTI-SOCIAL-BACKUP-[YYYY-MM-DD-HH-MM].html`
   - Salvare in `/Users/mattia/Projects/Onde/backups/social/`
3. Salvare anche versione raw/markdown se esiste
4. Verificare che il backup sia stato creato correttamente

**REGOLA:** Mai modificare senza backup. Se il backup fallisce, FERMARSI.

### 2. ANALISI COMMENTI
**Leggere e comprendere i commenti dell'utente:**

1. Estrarre le modifiche richieste
2. Identificare quali post sono coinvolti
3. Capire esattamente cosa cambiare (es. "elimina hashtag", "cambia post 3", "aggiungi CTA")
4. Creare lista modifiche da applicare

**OUTPUT:** Lista chiara di modifiche da fare

### 3. APPLICAZIONE MODIFICHE
**Modificare il file secondo le richieste:**

1. Aprire il file corrente
2. Applicare SOLO le modifiche richieste
3. NON fare modifiche extra "per migliorare"
4. NON cambiare formattazione se non richiesto
5. Salvare il file modificato

**REGOLA:** Modificare SOLO ciò che è stato richiesto esplicitamente.

### 4. VERIFICA MODIFICHE (OBBLIGATORIO)
**Confrontare vecchio vs nuovo:**

1. Aprire file backup
2. Aprire file modificato
3. Identificare TUTTE le differenze
4. Verificare che ogni differenza corrisponda a una modifica richiesta
5. Se ci sono differenze NON richieste → ROLLBACK e rifare

**METODO VERIFICA:**
```bash
# Estrarre testo da entrambi i file
# Confrontare riga per riga
# Segnalare differenze
```

**OUTPUT:** Report delle modifiche applicate

### 5. REPORT FINALE
**Comunicare all'utente:**

1. Modifiche applicate (lista)
2. File backup creato (path)
3. Verifica completata (OK/FAIL)
4. Eventuali problemi riscontrati

## NAMING CONVENTION FILE

### File Contenuti Social
- **In lavorazione:** `CONTENUTI-SOCIAL-DRAFT-[DATA].html`
- **Pronti per revisione:** `CONTENUTI-SOCIAL-REVIEW-[DATA].html`
- **Approvati:** `CONTENUTI-SOCIAL-APPROVED-[DATA].html`
- **Corrente (sempre):** `CONTENUTI-SOCIAL-CURRENT.html`

### File Backup
- **Path:** `/Users/mattia/Projects/Onde/backups/social/`
- **Nome:** `CONTENUTI-SOCIAL-BACKUP-[YYYY-MM-DD-HH-MM].html`
- **Retention:** Mantenere ultimi 10 backup

## CHECKLIST REVISIONE

### Pre-Modifica
- [ ] Backup creato
- [ ] Backup verificato
- [ ] Commenti analizzati
- [ ] Lista modifiche pronta

### Post-Modifica
- [ ] Modifiche applicate
- [ ] File salvato
- [ ] Verifica differenze completata
- [ ] Solo modifiche richieste presenti
- [ ] Report creato

### Rollback (se necessario)
- [ ] Identificato problema
- [ ] Ripristinato backup
- [ ] Analizzato errore
- [ ] Riprovato con correzioni

## DIVIETI

- ❌ Mai modificare senza backup
- ❌ Mai fare modifiche non richieste
- ❌ Mai saltare la verifica
- ❌ Mai eliminare i backup
- ❌ Mai modificare più di quanto richiesto

## TEMPLATE REPORT

```
# REPORT REVISIONE CONTENUTI SOCIAL

**Data:** [YYYY-MM-DD HH:MM]
**File modificato:** [nome file]
**Backup creato:** [path backup]

## Modifiche Richieste
1. [Modifica 1]
2. [Modifica 2]
...

## Modifiche Applicate
✅ [Modifica 1] - Applicata
✅ [Modifica 2] - Applicata
...

## Verifica
- Differenze trovate: [numero]
- Differenze richieste: [numero]
- Differenze NON richieste: [numero]
- Status: ✅ OK / ❌ FAIL

## Note
[Eventuali note o problemi]
```

## ESEMPIO WORKFLOW

**Input utente:** "Elimina tutti gli hashtag dal post 3"

**Procedura:**
1. ✅ Backup: `CONTENUTI-SOCIAL-BACKUP-2026-01-11-17-30.html`
2. ✅ Analisi: Eliminare hashtag solo da post 3
3. ✅ Modifica: Rimossi hashtag da post 3
4. ✅ Verifica: Solo post 3 modificato, resto invariato
5. ✅ Report: Modifiche applicate correttamente

**Output:** File modificato + Report + Backup salvato
