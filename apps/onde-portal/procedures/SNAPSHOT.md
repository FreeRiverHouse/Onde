# SNAPSHOT - Procedura Backup

## Obiettivo
Salvare lo stato completo di tutti e 3 gli ambienti (TEST, PREPROD, PROD) in una cartella con timestamp.

---

## Ambienti

| Ambiente | URL |
|----------|-----|
| TEST | localhost:8888 |
| PREPROD | onde.surf |
| PROD | onde.la |

---

## Procedura

### Step 1: Preparazione

```bash
# Definisci timestamp e cartella snapshot
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SNAPSHOT_DIR="/Users/mattia/Projects/Onde/apps/onde-portal/snapshots/${TIMESTAMP}"

# Crea struttura cartelle
mkdir -p "${SNAPSHOT_DIR}/test"
mkdir -p "${SNAPSHOT_DIR}/preprod"
mkdir -p "${SNAPSHOT_DIR}/prod"
mkdir -p "${SNAPSHOT_DIR}/metadata"

echo "Snapshot directory creata: ${SNAPSHOT_DIR}"
```

### Step 2: Snapshot TEST (localhost:8888)

```bash
# Verifica che il server TEST sia attivo
if curl -s --head http://localhost:8888 | head -n 1 | grep -q "200\|301\|302"; then
    echo "[OK] TEST server attivo"
else
    echo "[WARN] TEST server non raggiungibile - potrebbe essere spento"
fi

# Copia file sorgente (ambiente locale)
cp -r /Users/mattia/Projects/Onde/apps/onde-portal/src "${SNAPSHOT_DIR}/test/"
cp -r /Users/mattia/Projects/Onde/apps/onde-portal/public "${SNAPSHOT_DIR}/test/" 2>/dev/null || true
cp /Users/mattia/Projects/Onde/apps/onde-portal/package.json "${SNAPSHOT_DIR}/test/"
cp /Users/mattia/Projects/Onde/apps/onde-portal/*.config.* "${SNAPSHOT_DIR}/test/" 2>/dev/null || true

echo "[OK] Snapshot TEST completato"
```

### Step 3: Snapshot PREPROD (onde.surf)

```bash
# Verifica raggiungibilita PREPROD
if curl -s --head https://onde.surf | head -n 1 | grep -q "200\|301\|302"; then
    echo "[OK] PREPROD raggiungibile"
else
    echo "[ERROR] PREPROD non raggiungibile"
    exit 1
fi

# Scarica homepage e pagine principali
curl -s https://onde.surf -o "${SNAPSHOT_DIR}/preprod/index.html"
curl -s https://onde.surf/robots.txt -o "${SNAPSHOT_DIR}/preprod/robots.txt" 2>/dev/null || true
curl -s https://onde.surf/sitemap.xml -o "${SNAPSHOT_DIR}/preprod/sitemap.xml" 2>/dev/null || true

# Screenshot con headless browser (richiede puppeteer o playwright)
# npx playwright screenshot https://onde.surf "${SNAPSHOT_DIR}/preprod/screenshot.png" 2>/dev/null || true

echo "[OK] Snapshot PREPROD completato"
```

### Step 4: Snapshot PROD (onde.la)

```bash
# Verifica raggiungibilita PROD
if curl -s --head https://onde.la | head -n 1 | grep -q "200\|301\|302"; then
    echo "[OK] PROD raggiungibile"
else
    echo "[ERROR] PROD non raggiungibile"
    exit 1
fi

# Scarica homepage e pagine principali
curl -s https://onde.la -o "${SNAPSHOT_DIR}/prod/index.html"
curl -s https://onde.la/robots.txt -o "${SNAPSHOT_DIR}/prod/robots.txt" 2>/dev/null || true
curl -s https://onde.la/sitemap.xml -o "${SNAPSHOT_DIR}/prod/sitemap.xml" 2>/dev/null || true

# Screenshot con headless browser
# npx playwright screenshot https://onde.la "${SNAPSHOT_DIR}/prod/screenshot.png" 2>/dev/null || true

echo "[OK] Snapshot PROD completato"
```

### Step 5: Genera Metadata

```bash
# Crea file metadata
cat > "${SNAPSHOT_DIR}/metadata/info.json" << EOF
{
    "timestamp": "${TIMESTAMP}",
    "created_at": "$(date -Iseconds)",
    "created_by": "$(whoami)",
    "environments": {
        "test": "localhost:8888",
        "preprod": "onde.surf",
        "prod": "onde.la"
    },
    "git_commit": "$(cd /Users/mattia/Projects/Onde && git rev-parse HEAD 2>/dev/null || echo 'N/A')",
    "git_branch": "$(cd /Users/mattia/Projects/Onde && git branch --show-current 2>/dev/null || echo 'N/A')"
}
EOF

# Calcola hash dei file per verifica integrita
find "${SNAPSHOT_DIR}" -type f -exec md5 {} \; > "${SNAPSHOT_DIR}/metadata/checksums.md5"

echo "[OK] Metadata generato"
```

### Step 6: Verifica Finale

```bash
# Verifica che tutti i file siano stati creati
echo ""
echo "=== VERIFICA SNAPSHOT ==="
echo "Directory: ${SNAPSHOT_DIR}"
echo ""
echo "Contenuto:"
ls -la "${SNAPSHOT_DIR}/"
echo ""
echo "Dimensione totale:"
du -sh "${SNAPSHOT_DIR}"
echo ""
echo "[OK] Snapshot completato con successo"
```

---

## Script Completo Eseguibile

Salva come `snapshot.sh` nella cartella `procedures/scripts/`:

```bash
#!/bin/bash
set -e

# ==============================================
# SNAPSHOT SCRIPT - onde.la
# ==============================================

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SNAPSHOT_DIR="/Users/mattia/Projects/Onde/apps/onde-portal/snapshots/${TIMESTAMP}"
LOG_FILE="/Users/mattia/Projects/Onde/apps/onde-portal/logs/snapshot_${TIMESTAMP}.log"

log() {
    echo "[$(date +"%H:%M:%S")] $1" | tee -a "${LOG_FILE}"
}

# Crea struttura
mkdir -p "${SNAPSHOT_DIR}/test"
mkdir -p "${SNAPSHOT_DIR}/preprod"
mkdir -p "${SNAPSHOT_DIR}/prod"
mkdir -p "${SNAPSHOT_DIR}/metadata"
mkdir -p "$(dirname ${LOG_FILE})"

log "Inizio snapshot..."

# TEST
log "Snapshot TEST..."
cp -r /Users/mattia/Projects/Onde/apps/onde-portal/src "${SNAPSHOT_DIR}/test/"
cp -r /Users/mattia/Projects/Onde/apps/onde-portal/public "${SNAPSHOT_DIR}/test/" 2>/dev/null || true
cp /Users/mattia/Projects/Onde/apps/onde-portal/package.json "${SNAPSHOT_DIR}/test/"
log "[OK] TEST completato"

# PREPROD
log "Snapshot PREPROD..."
if curl -s --head https://onde.surf | head -n 1 | grep -q "200\|301\|302"; then
    curl -s https://onde.surf -o "${SNAPSHOT_DIR}/preprod/index.html"
    curl -s https://onde.surf/robots.txt -o "${SNAPSHOT_DIR}/preprod/robots.txt" 2>/dev/null || true
    log "[OK] PREPROD completato"
else
    log "[WARN] PREPROD non raggiungibile"
fi

# PROD
log "Snapshot PROD..."
if curl -s --head https://onde.la | head -n 1 | grep -q "200\|301\|302"; then
    curl -s https://onde.la -o "${SNAPSHOT_DIR}/prod/index.html"
    curl -s https://onde.la/robots.txt -o "${SNAPSHOT_DIR}/prod/robots.txt" 2>/dev/null || true
    log "[OK] PROD completato"
else
    log "[ERROR] PROD non raggiungibile"
    exit 1
fi

# Metadata
cat > "${SNAPSHOT_DIR}/metadata/info.json" << EOF
{
    "timestamp": "${TIMESTAMP}",
    "created_at": "$(date -Iseconds)",
    "created_by": "$(whoami)",
    "git_commit": "$(cd /Users/mattia/Projects/Onde && git rev-parse HEAD 2>/dev/null || echo 'N/A')"
}
EOF

log "[OK] Snapshot completato: ${SNAPSHOT_DIR}"
echo "${SNAPSHOT_DIR}"
```

---

## Checklist Verifiche

- [ ] Directory snapshot creata con timestamp corretto
- [ ] File sorgente TEST copiati
- [ ] Homepage PREPROD scaricata
- [ ] Homepage PROD scaricata
- [ ] File metadata/info.json creato
- [ ] Checksums generati
- [ ] Log file creato

---

## Cosa Fare se Fallisce

| Errore | Causa | Soluzione |
|--------|-------|-----------|
| `PREPROD non raggiungibile` | Server down o DNS | Verifica connessione, riprova dopo 5 min |
| `PROD non raggiungibile` | Server down o DNS | Verifica connessione, contatta hosting |
| `Permission denied` | Permessi file | Esegui con `sudo` o correggi permessi |
| `No space left` | Disco pieno | Libera spazio, elimina vecchi snapshot |
| `git: command not found` | Git non installato | Installa git o ignora metadata git |

---

## Manutenzione Snapshot

```bash
# Elenca tutti gli snapshot
ls -la /Users/mattia/Projects/Onde/apps/onde-portal/snapshots/

# Elimina snapshot piu vecchi di 30 giorni
find /Users/mattia/Projects/Onde/apps/onde-portal/snapshots/ -type d -mtime +30 -exec rm -rf {} \;

# Spazio occupato da tutti gli snapshot
du -sh /Users/mattia/Projects/Onde/apps/onde-portal/snapshots/
```
