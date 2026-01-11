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

**Verifica (METODO ROBUSTO):**
```bash
# IMPORTANTE: curl -s da solo NON rileva server down!
# Usa SEMPRE uno di questi metodi:

# Metodo 1: curl con -sf (fail silently on error)
curl -sf http://localhost:8888 > /dev/null && echo "Server OK" || echo "Server DOWN"

# Metodo 2: Verifica processo sulla porta
lsof -i :8888 > /dev/null 2>&1 && echo "Processo attivo" || echo "Nessun processo"

# Metodo 3: Verifica HTTP status code esplicito
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8888 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    echo "[OK] Server risponde con HTTP $HTTP_CODE"
else
    echo "[ERROR] Server non risponde (HTTP $HTTP_CODE)"
    echo "        Avvia con: npm run dev"
fi
```

**Se il server non parte:**
```bash
# Verifica se la porta e' gia' occupata
lsof -i :8888

# Uccidi processi zombie sulla porta
kill $(lsof -t -i:8888) 2>/dev/null || true

# Riprova
npm run dev
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

| Problema | Causa Probabile | Soluzione |
|----------|-----------------|-----------|
| Server non parte | Porta occupata o dipendenze | `lsof -i :8888` per vedere chi usa la porta, poi `npm install` |
| `curl -s` dice OK ma server e' down | Bug di curl -s | Usa `curl -sf` con flag `-f` oppure `lsof -i :8888` |
| Pagina bianca | Errore JavaScript | Controlla console browser (F12), cerca errore rosso |
| Modifica non appare | Cache browser | Ricarica forzato (Cmd+Shift+R), o svuota cache |
| Modifica non appare | Server non ricompilato | Riavvia server (`npm run dev`) |
| Build fallisce | Errore sintassi | Leggi messaggio errore, correggi, riprova |
| Build fallisce | Dipendenze mancanti | `npm install` e riprova |
| Sito rotto completamente | Modifica errata | `git checkout -- .` per annullare TUTTO |
| Non trovo il file | Nome diverso | Usa `grep -r "contenuto"` per cercare nel contenuto |
| Permessi negati | File protetto | `chmod 644 [file]` o controlla owner |

---

## Rollback Automatico

Se la modifica rompe qualcosa, ecco come annullare rapidamente:

```bash
# Opzione 1: Annulla modifiche non committate (SICURO)
git checkout -- .

# Opzione 2: Ripristina da backup (se hai fatto backup)
cp /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html.bak /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html

# Opzione 3: Torna al commit precedente (ATTENZIONE: perdi modifiche!)
git reset --hard HEAD~1

# Opzione 4: Usa snapshot pre-modifica
LAST_SNAPSHOT=$(ls -t /Users/mattia/Projects/Onde/apps/onde-portal/snapshots/ | head -1)
cp -r "/Users/mattia/Projects/Onde/apps/onde-portal/snapshots/${LAST_SNAPSHOT}/test/src" .
```

---

## Log Modifiche

Ogni modifica dovrebbe essere loggata:

```bash
# Aggiungi entry al log
echo "[$(date)] MODIFICA: [descrizione] - FILE: [percorso]" >> /Users/mattia/Projects/Onde/apps/onde-portal/logs/modifiche.log
```
