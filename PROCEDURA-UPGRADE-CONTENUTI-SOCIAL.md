# PROCEDURA UPGRADE CONTENUTI SOCIAL

## OBIETTIVO
Migliorare contenuti social esistenti aggiungendo elementi visivi (immagini) dai libri corrispondenti, mantenendo traccia delle modifiche.

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
**Seguire PROCEDURA-REVISIONE-CONTENUTI-SOCIAL.md - Step 1**

1. Creare backup con timestamp
2. Verificare backup creato
3. Salvare file corrente come base

### 2. ANALISI CONTENUTI ATTUALI
**Identificare struttura e opportunità:**

1. Contare totale post
2. Misurare lunghezza di ogni post (caratteri)
3. Identificare post più corti (candidati per immagini)
4. Identificare libri di riferimento per ogni post

**OUTPUT:** Lista post con lunghezza e libro di riferimento

### 3. RICERCA IMMAGINI
**Trovare immagini dai libri:**

1. Identificare cartelle libri:
   - Meditations: `/Users/mattia/Projects/Onde/books/meditations/`
   - Psalm 23: `/Users/mattia/Projects/Onde/books/psalm-23/`
   
2. Cercare immagini in:
   - `images/` o `illustrations/`
   - `covers/`
   - File `.jpg`, `.png`, `.webp`

3. Selezionare immagini appropriate per ogni post

**REGOLA:** Usare solo immagini esistenti dai libri, non inventare path.

### 4. SELEZIONE POST PER IMMAGINI
**Criterio: ~50% dei post con immagini**

**PRIORITÀ:**
1. Post più corti (meno testo = più impatto visivo)
2. Distribuzione equa tra libri
3. Varietà di contenuto

**FORMULA:**
- Se totale post = 12 → 6 post con immagini
- Selezionare i 6 post più corti
- Verificare distribuzione tra Meditations e Psalm 23

### 5. APPLICAZIONE UPGRADE
**Aggiungere immagini ai post selezionati:**

1. Per ogni post selezionato:
   - Aggiungere tag `<img>` con path immagine
   - Aggiungere styling appropriato
   - Mantenere tutto il testo esistente
   
2. Template immagine:
```html
<div class="post-image">
    <img src="[PATH_IMMAGINE]" alt="[DESCRIZIONE]">
</div>
```

3. Aggiungere CSS se necessario per styling immagini

**REGOLA:** NON modificare testo esistente, SOLO aggiungere immagini.

### 6. VERIFICA UPGRADE
**Controllare modifiche applicate:**

1. Confrontare con backup
2. Verificare che:
   - Numero corretto di immagini aggiunte (~50%)
   - Path immagini esistono
   - Testo originale intatto
   - Styling funziona
   
3. Testare che HTML sia valido

### 7. REPORT UPGRADE
**Comunicare modifiche:**

```
# REPORT UPGRADE CONTENUTI SOCIAL

**Data:** [YYYY-MM-DD HH:MM]
**Tipo upgrade:** Aggiunta immagini
**Backup:** [path]

## Statistiche
- Totale post: [N]
- Post con immagini aggiunte: [N] (~50%)
- Post solo testo: [N]

## Post Modificati
1. [LIBRO] - [NUMERO]: Aggiunta immagine [nome file]
2. [LIBRO] - [NUMERO]: Aggiunta immagine [nome file]
...

## Immagini Utilizzate
- Meditations: [N immagini]
- Psalm 23: [N immagini]

## Verifica
✅ Backup creato
✅ Immagini esistono
✅ HTML valido
✅ Testo originale intatto
✅ ~50% post con immagini

## Path Immagini
- [path 1]
- [path 2]
...
```

## REGOLE UPGRADE

### Selezione Immagini
- ✅ Usare solo immagini dai libri
- ✅ Verificare che file esista
- ✅ Preferire immagini di qualità
- ❌ Non usare placeholder
- ❌ Non inventare path

### Distribuzione
- ✅ ~50% post con immagini
- ✅ Post più corti prioritari
- ✅ Distribuzione equa tra libri
- ❌ Non tutti con immagini
- ❌ Non solo un libro

### Modifiche
- ✅ SOLO aggiungere immagini
- ✅ Mantenere tutto il testo
- ✅ Mantenere formattazione
- ❌ Non modificare testo
- ❌ Non riordinare post

## CHECKLIST UPGRADE

### Pre-Upgrade
- [ ] Backup creato e verificato
- [ ] Contenuti attuali analizzati
- [ ] Immagini trovate nelle cartelle libri
- [ ] Post selezionati (~50%)
- [ ] Path immagini verificati

### Durante Upgrade
- [ ] Immagini aggiunte ai post selezionati
- [ ] HTML valido
- [ ] Styling applicato
- [ ] Testo originale intatto

### Post-Upgrade
- [ ] Verifica vs backup completata
- [ ] Solo immagini aggiunte (nessun'altra modifica)
- [ ] ~50% post con immagini
- [ ] Report creato
- [ ] File salvato

## ESEMPIO WORKFLOW

**Input:** "Aggiungi immagini a ~50% dei post dai libri"

**Procedura:**
1. ✅ Backup: `CONTENUTI-SOCIAL-BACKUP-2026-01-11-17-40.html`
2. ✅ Analisi: 12 post totali, selezionare 6 più corti
3. ✅ Ricerca: Trovate 5 immagini Meditations, 2 Psalm 23
4. ✅ Selezione: Post 1,2,4,6,8,10 (più corti)
5. ✅ Upgrade: Immagini aggiunte ai 6 post
6. ✅ Verifica: Solo immagini aggiunte, testo intatto
7. ✅ Report: 6/12 post con immagini (50%)

**Output:** File upgraded + Report + Backup salvato
