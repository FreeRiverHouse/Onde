# MODIFICA - Procedura Modifica Sito

## Obiettivo
Guidare le modifiche chirurgiche al sito onde.la attraverso l'ambiente TEST locale.

---

## Ambienti

| Ambiente | URL | Scopo |
|----------|-----|-------|
| TEST | localhost:8888 | Sviluppo e test modifiche |
| PREPROD | onde.surf | Verifica pre-produzione |
| PROD | onde.la | Sito live |

---

## Procedura Principale

### Step 1: Avvia Ambiente TEST

```bash
# Naviga nella cartella del progetto
cd /Users/mattia/Projects/Onde/apps/onde-portal

# Installa dipendenze (se necessario)
npm install

# Avvia server di sviluppo
npm run dev

# Oppure con porta specifica
npm run dev -- --port 3333
```

**Verifica:**
```bash
# In un altro terminale, verifica che il server sia attivo
curl -s --head http://localhost:8888 | head -n 1
# Deve restituire: HTTP/1.1 200 OK
```

### Step 2: Crea Snapshot Pre-Modifica

```bash
# IMPORTANTE: Prima di ogni modifica, crea uno snapshot
/Users/mattia/Projects/Onde/apps/onde-portal/procedures/scripts/snapshot.sh

# Oppure manualmente
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
cp -r src "snapshots/pre_modifica_${TIMESTAMP}"
```

### Step 3: Identifica File da Modificare

```bash
# Struttura tipica del progetto
ls -la /Users/mattia/Projects/Onde/apps/onde-portal/src/

# Cerca file per contenuto
grep -r "testo da cercare" /Users/mattia/Projects/Onde/apps/onde-portal/src/

# Cerca file per nome
find /Users/mattia/Projects/Onde/apps/onde-portal/src -name "*.tsx" -o -name "*.ts"
```

### Step 4: Effettua Modifica Chirurgica

**Regole per modifiche sicure:**

1. **Modifica un file alla volta**
2. **Salva dopo ogni modifica**
3. **Verifica nel browser immediatamente**
4. **Se qualcosa si rompe, annulla subito**

```bash
# Apri file con editor preferito
code /Users/mattia/Projects/Onde/apps/onde-portal/src/[percorso-file]

# Oppure con vim
vim /Users/mattia/Projects/Onde/apps/onde-portal/src/[percorso-file]
```

### Step 5: Testa la Modifica

```bash
# 1. Verifica nel browser
open http://localhost:8888

# 2. Verifica build (nessun errore)
npm run build

# 3. Verifica lint (nessun warning critico)
npm run lint 2>/dev/null || true

# 4. Esegui test (se presenti)
npm test 2>/dev/null || true
```

### Step 6: Verifica Visiva

**Checklist manuale:**
- [ ] La modifica appare correttamente
- [ ] Nessun elemento rotto visivamente
- [ ] Link funzionanti
- [ ] Responsive (testa su mobile)
- [ ] Nessun errore in console browser (F12)

### Step 7: Commit Modifica

```bash
cd /Users/mattia/Projects/Onde

# Verifica modifiche
git status
git diff

# Commit con messaggio descrittivo
git add apps/onde-portal/src/[file-modificato]
git commit -m "fix: [descrizione breve della modifica]"
```

---

## Sotto-Procedure (Da Creare)

Le seguenti sotto-procedure dettagliate saranno create in `/procedures/sub/`:

### 1. `AGGIUNGI_LIBRO.md`
- Dove aggiungere dati del libro
- Formato dati richiesto (titolo, autore, prezzo, link, immagine)
- Come aggiungere immagine copertina
- Verifica visualizzazione

### 2. `CAMBIA_PREZZO_LIBRO.md`
- Come trovare il libro nel codice
- Formato prezzo (euro, centesimi)
- Aggiornare prezzo in tutti i punti necessari
- Verifica carrello/checkout

### 3. `CAMBIA_LINK_LIBRO.md`
- Identificare link attuali
- Sostituire con nuovi link
- Verificare redirect
- Testare acquisto

### 4. `MODIFICA_BIO.md`
- Localizzare sezione bio
- Formattazione testo (markdown/html)
- Aggiornare foto profilo
- Verifica responsive

### 5. `AGGIUNGI_PAGINA.md`
- Creare nuovo file pagina
- Aggiungere route
- Collegare nel menu/navigazione
- SEO meta tags

---

## Comandi Utili

### Ricerca nel Codice

```bash
# Cerca testo in tutti i file
grep -r "testo" /Users/mattia/Projects/Onde/apps/onde-portal/src/

# Cerca solo in file TypeScript/React
grep -r "testo" /Users/mattia/Projects/Onde/apps/onde-portal/src/ --include="*.tsx" --include="*.ts"

# Cerca file che contengono "libro" o "book"
grep -rl "libro\|book" /Users/mattia/Projects/Onde/apps/onde-portal/src/
```

### Gestione Server

```bash
# Ferma server (Ctrl+C nel terminale) oppure
pkill -f "node.*onde-portal"

# Riavvia server
npm run dev

# Pulisci cache e riavvia
rm -rf .next node_modules/.cache
npm run dev
```

### Annulla Modifiche

```bash
# Annulla modifiche non committate a un file
git checkout -- src/[file]

# Annulla tutte le modifiche non committate
git checkout -- .

# Torna a commit precedente (ATTENZIONE: perdi modifiche)
git reset --hard HEAD~1
```

---

## Checklist Pre-Modifica

- [ ] Ambiente TEST attivo su localhost:8888
- [ ] Snapshot creato
- [ ] File da modificare identificato
- [ ] Backup mentale del contenuto originale

## Checklist Post-Modifica

- [ ] Modifica visibile nel browser
- [ ] Build completa senza errori
- [ ] Nessun errore in console browser
- [ ] Test responsive superato
- [ ] Commit effettuato con messaggio chiaro

---

## Cosa Fare se Fallisce

| Problema | Soluzione |
|----------|-----------|
| Server non parte | Verifica `npm install`, controlla errori |
| Pagina bianca | Controlla console browser (F12), cerca errore |
| Modifica non appare | Ricarica pagina (Cmd+Shift+R), riavvia server |
| Build fallisce | Leggi errore, correggi sintassi, annulla se necessario |
| Sito rotto | `git checkout -- .` per annullare tutto |
| Non trovo il file | Usa `grep -r` per cercare contenuto |

---

## Log Modifiche

Ogni modifica dovrebbe essere loggata:

```bash
# Aggiungi entry al log
echo "[$(date)] MODIFICA: [descrizione] - FILE: [percorso]" >> /Users/mattia/Projects/Onde/apps/onde-portal/logs/modifiche.log
```
