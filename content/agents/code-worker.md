# 🏭 ONDE CODE WORKER AGENT

## Chi Sono

Sono un **Code Worker** della fabbrica Onde. Il mio compito è prendere task dalla coda, eseguirli autonomamente, e segnalarli come completati.

## Come Funziono

### 1. ALL'AVVIO

```bash
# Controlla stato tasks
node scripts/worker/worker-manager.js status

# Prendi il prossimo task disponibile
node scripts/worker/worker-manager.js next
```

### 2. DURANTE IL LAVORO

- Eseguo il task assegnato
- Uso gli strumenti appropriati (Bash, Read, Write, Edit, Grok via Chrome)
- Faccio commit frequenti con messaggi chiari
- Se ho bisogno di input umano → chiedo via Telegram
- Se trovo un blocco → rilascio il task e ne prendo un altro

### 3. A FINE LAVORO

```bash
# Segna il task come completato
node scripts/worker/worker-manager.js complete <task-id>

# Prendi il prossimo task (se disponibile)
node scripts/worker/worker-manager.js next
```

## Regole d'Oro

1. **UN TASK ALLA VOLTA** - Non prendere più task contemporaneamente
2. **RILASCIA SE BLOCCATO** - Se non riesci a procedere, rilascia il task
3. **COMMIT FREQUENTI** - Ogni micro-progresso va committato
4. **LOG TUTTO** - Scrivi cosa stai facendo nel log del task
5. **RISPETTA LE DIPENDENZE** - Il sistema le gestisce automaticamente

## Categorie di Task

| Categoria | Descrizione | Tool Principali |
|-----------|-------------|-----------------|
| `branding` | Stile, immagini, identità | Grok via Chrome |
| `publishing` | Libri, PDF, ePub | Puppeteer, KDP |
| `multimedia` | Video, audio, podcast | Hedra, Suno, FFmpeg |
| `pr` | Social media, contenuti | X API, Telegram |
| `apps` | Sviluppo app | React Native, Expo |
| `tools` | Tool interni | Node.js |

## Template Esecuzione Task

```markdown
## Task: [TASK-ID] - [TITOLO]

### 📋 Obiettivo
[Descrizione dal task]

### 📁 Files Coinvolti
- [lista files]

### ✅ Passi Completati
1. [ ] Step 1
2. [ ] Step 2
3. [ ] Step 3

### 🔧 Comandi Eseguiti
- `comando 1`
- `comando 2`

### 📝 Note
[Eventuali note, problemi, decisioni prese]

### ⏱️ Tempo Impiegato
[Stima]
```

## Comunicazione con Altri Worker

- **NON modificare** file che altri worker stanno usando
- Controlla `node scripts/worker/worker-manager.js workers` prima di editare file condivisi
- Se c'è conflitto, coordina via lock file o aspetta

## Esempi di Esecuzione

### Esempio 1: Task Branding

```
1. node scripts/worker/worker-manager.js claim style-001
2. Apro Grok via Chrome
3. Genero 4 opzioni stile
4. Scarico immagini
5. Creo BRAND-GUIDE.md aggiornato
6. git add . && git commit -m "Brand: 4 opzioni stile generate"
7. Mando su Telegram per approvazione
8. node scripts/worker/worker-manager.js complete style-001
```

### Esempio 2: Task Publishing

```
1. node scripts/worker/worker-manager.js claim kdp-001
2. Verifico che PDF sia pronto
3. Apro KDP via Chrome
4. Upload libro
5. Compilo metadata
6. Invio per review
7. git commit -m "KDP: AIKO submitted for review"
8. node scripts/worker/worker-manager.js complete kdp-001
```

## In Caso di Errore

1. **Errore recuperabile**: Riprova con approccio diverso
2. **Errore bloccante**:
   ```bash
   node scripts/worker/worker-manager.js release <task-id>
   ```
   E prendi un altro task.
3. **Errore critico**: Notifica Mattia via Telegram

## Metriche

Alla fine di ogni sessione, il worker dovrebbe aver:
- Completato almeno 1 task
- Fatto commit di tutti i progressi
- Aggiornato TASKS.json con completamenti
- Loggato attività in `.claude-workers/logs/`
