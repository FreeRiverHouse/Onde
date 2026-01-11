# ROLLBACK - Procedura Ripristino da Snapshot

## Obiettivo
Ripristinare rapidamente il sito a uno stato precedente funzionante usando gli snapshot esistenti.

---

## Ambienti

| Ambiente | URL | Priorita Rollback |
|----------|-----|-------------------|
| TEST | localhost:8888 | NORMALE |
| PREPROD | onde.surf | ALTA |
| PROD | onde.la | CRITICA - Massima priorita |

---

## Directory Snapshot

**Path**: `/Users/mattia/Projects/Onde/apps/onde-portal/snapshots/`

**Formato nome**: `master-snapshot-YYYYMMDD-HHMMSS/`

Ogni snapshot contiene la build completa del sito (output statico HTML/CSS/JS).

---

## Quando Eseguire Rollback

**Esegui IMMEDIATAMENTE rollback se:**
- Sito non raggiungibile (errore 500, 502, 503)
- Pagina bianca o contenuto mancante
- Errori JavaScript critici visibili
- Funzionalita core rotte (checkout, navigazione)
- Dati corrotti o mancanti

**Valuta rollback se:**
- Performance degradate significativamente
- Errori minori ma frequenti
- Feedback utenti negativi immediati

---

## 1. Rollback da Snapshot Esistente

### Step 1: Lista Snapshot Disponibili

```bash
# Elenca tutti gli snapshot ordinati per data (piu recenti prima)
ls -lt /Users/mattia/Projects/Onde/apps/onde-portal/snapshots/

# Con dettagli dimensione e data
for dir in /Users/mattia/Projects/Onde/apps/onde-portal/snapshots/master-snapshot-*/; do
    name=$(basename "$dir")
    date_str=$(stat -f '%Sm' -t '%Y-%m-%d %H:%M' "$dir")
    size=$(du -sh "$dir" 2>/dev/null | cut -f1)
    files=$(find "$dir" -type f 2>/dev/null | wc -l | tr -d ' ')
    echo "${name} | ${date_str} | ${size} | ${files} files"
done
```

### Step 2: Verifica Integrita Snapshot

```bash
# Sostituisci con il timestamp desiderato
SNAPSHOT="/Users/mattia/Projects/Onde/apps/onde-portal/snapshots/master-snapshot-20260111-131121"

# Verifica esistenza file critici
echo "=== VERIFICA SNAPSHOT ==="

# Homepage
if [ -f "${SNAPSHOT}/index.html" ]; then
    echo "[OK] index.html presente"
else
    echo "[ERROR] index.html MANCANTE!"
fi

# Directory _next (assets)
if [ -d "${SNAPSHOT}/_next" ]; then
    echo "[OK] _next/ presente"
else
    echo "[ERROR] _next/ MANCANTE!"
fi

# Conta file totali
FILES=$(find "${SNAPSHOT}" -type f | wc -l | tr -d ' ')
echo "[INFO] File totali: ${FILES}"

# Verifica HTML valido
if grep -q "<html" "${SNAPSHOT}/index.html" 2>/dev/null; then
    echo "[OK] HTML valido"
else
    echo "[ERROR] HTML non valido"
fi
```

---

## 2. Rollback per Ambiente

### A) Rollback TEST (localhost:8888)

Il rollback su TEST serve per verificare che lo snapshot funzioni prima di applicarlo a PREPROD/PROD.

```bash
SNAPSHOT="/Users/mattia/Projects/Onde/apps/onde-portal/snapshots/master-snapshot-YYYYMMDD-HHMMSS"
OUT_DIR="/Users/mattia/Projects/Onde/apps/onde-portal/out"

# 1. Ferma eventuale server in esecuzione
pkill -f "serve.*8888" 2>/dev/null || true
pkill -f "next.*8888" 2>/dev/null || true

# 2. Backup stato attuale (opzionale ma consigliato)
if [ -d "${OUT_DIR}" ]; then
    BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    cp -r "${OUT_DIR}" "${OUT_DIR}_backup_${BACKUP_TIMESTAMP}"
    echo "[OK] Backup creato: ${OUT_DIR}_backup_${BACKUP_TIMESTAMP}"
fi

# 3. Rimuovi build corrente
rm -rf "${OUT_DIR}"

# 4. Copia snapshot
cp -r "${SNAPSHOT}" "${OUT_DIR}"
echo "[OK] Snapshot copiato in out/"

# 5. Avvia server di test (serve la build statica)
cd /Users/mattia/Projects/Onde/apps/onde-portal
npx serve out -p 8888 &
echo "[OK] Server TEST avviato su http://localhost:8888"

# 6. Attendi avvio server
sleep 3

# 7. Verifica
curl -s --head http://localhost:8888 | head -n 1
```

**Verifica TEST:**
```bash
# Verifica completa
echo "=== VERIFICA TEST localhost:8888 ==="

# Raggiungibilita
if curl -s --head http://localhost:8888 | head -n 1 | grep -q "200\|304"; then
    echo "[OK] Server raggiungibile"
else
    echo "[ERROR] Server non raggiungibile"
fi

# HTML valido
if curl -s http://localhost:8888 | grep -q "<html"; then
    echo "[OK] HTML valido"
else
    echo "[ERROR] HTML non valido"
fi

# Assets
if curl -s http://localhost:8888 | grep -q "_next"; then
    echo "[OK] Assets presenti"
else
    echo "[WARN] Assets potrebbero mancare"
fi

echo "==================================="
```

---

### B) Rollback PREPROD (onde.surf)

**ATTENZIONE**: Questo modifica il sito visibile su onde.surf!

```bash
SNAPSHOT="/Users/mattia/Projects/Onde/apps/onde-portal/snapshots/master-snapshot-YYYYMMDD-HHMMSS"
PROJECT_DIR="/Users/mattia/Projects/Onde/apps/onde-portal"

# 1. Naviga nel progetto
cd "${PROJECT_DIR}"

# 2. Verifica stato git
git status
git branch --show-current

# 3. Salva eventuali modifiche locali
git stash

# 4. Crea branch di rollback
ROLLBACK_BRANCH="rollback/preprod-$(date +%Y%m%d-%H%M%S)"
git checkout -b "${ROLLBACK_BRANCH}"

# 5. Rimuovi build corrente e copia snapshot
rm -rf out
cp -r "${SNAPSHOT}" out

# 6. Commit del rollback
git add out/
git commit -m "rollback PREPROD: ripristino da $(basename ${SNAPSHOT})"

# 7. Push su staging (trigger deploy PREPROD)
git push origin "${ROLLBACK_BRANCH}":staging --force

echo "[OK] Rollback PREPROD pushato. Attendo deploy..."
```

**Verifica PREPROD:**
```bash
# Attendi 60-90 secondi per il deploy
echo "Attendo deploy PREPROD..."
sleep 90

# Verifica completa
echo "=== VERIFICA PREPROD onde.surf ==="

if curl -s --head https://onde.surf | head -n 1 | grep -q "200\|301\|302"; then
    echo "[OK] PREPROD raggiungibile"
else
    echo "[ERROR] PREPROD non raggiungibile!"
fi

if curl -s https://onde.surf | grep -q "<html"; then
    echo "[OK] HTML valido"
else
    echo "[ERROR] HTML non valido"
fi

RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" https://onde.surf)
echo "[INFO] Tempo risposta: ${RESPONSE_TIME}s"

echo "==================================="
```

---

### C) Rollback PROD (onde.la)

**ATTENZIONE CRITICA**: Questo modifica il sito LIVE visibile al pubblico!

```bash
SNAPSHOT="/Users/mattia/Projects/Onde/apps/onde-portal/snapshots/master-snapshot-YYYYMMDD-HHMMSS"
PROJECT_DIR="/Users/mattia/Projects/Onde/apps/onde-portal"

# 0. CONFERMA ESPLICITA
echo ""
echo "=============================================="
echo "  ROLLBACK PROD (onde.la) - CONFERMA RICHIESTA"
echo "=============================================="
echo ""
echo "Snapshot: $(basename ${SNAPSHOT})"
echo "Target: PROD (onde.la)"
echo ""
echo "ATTENZIONE: Stai per modificare il sito LIVE!"
echo ""
echo "Hai verificato lo snapshot su TEST/PREPROD? (yes/no)"
read -r CONFIRM
if [ "${CONFIRM}" != "yes" ]; then
    echo "[ABORT] Rollback PROD annullato"
    exit 0
fi

# 1. Naviga nel progetto
cd "${PROJECT_DIR}"

# 2. Assicurati di essere su main e aggiornato
git checkout main
git pull origin main

# 3. Salva eventuali modifiche locali
git stash

# 4. Crea branch di rollback
ROLLBACK_BRANCH="rollback/prod-$(date +%Y%m%d-%H%M%S)"
git checkout -b "${ROLLBACK_BRANCH}"

# 5. Applica snapshot
rm -rf out
cp -r "${SNAPSHOT}" out

# 6. Commit
git add out/
git commit -m "ROLLBACK PROD: ripristino da $(basename ${SNAPSHOT})"

# 7. Merge in main
git checkout main
git merge "${ROLLBACK_BRANCH}" -m "Merge rollback PROD"

# 8. Push (trigger deploy)
git push origin main

echo "[OK] Rollback PROD pushato. Attendo deploy..."
```

**Verifica PROD:**
```bash
# Attendi 90-120 secondi per il deploy
echo "Attendo deploy PROD..."
sleep 120

# Verifica completa
echo "=== VERIFICA POST-ROLLBACK PROD ==="

# 1. Raggiungibilita
if curl -s --head https://onde.la | head -n 1 | grep -q "200\|301\|302"; then
    echo "[OK] Sito raggiungibile"
else
    echo "[CRITICAL] Sito NON raggiungibile!"
fi

# 2. Contenuto HTML
if curl -s https://onde.la | grep -q "<html"; then
    echo "[OK] HTML valido"
else
    echo "[CRITICAL] HTML non valido!"
fi

# 3. Assets Next.js
if curl -s https://onde.la | grep -q "_next"; then
    echo "[OK] Assets Next.js presenti"
else
    echo "[WARN] Assets potrebbero mancare"
fi

# 4. Tempo risposta
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" https://onde.la)
echo "[INFO] Tempo risposta: ${RESPONSE_TIME}s"

# 5. Pagine critiche
echo "[INFO] Verifica pagine critiche:"
for page in "" "catalogo" "about"; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://onde.la/${page}")
    if [ "$CODE" == "200" ] || [ "$CODE" == "301" ]; then
        echo "  /${page}: OK (${CODE})"
    else
        echo "  /${page}: FAIL (${CODE})"
    fi
done

echo "==================================="
```

---

## 3. Script Bash Completo

Salva come `/Users/mattia/Projects/Onde/apps/onde-portal/procedures/scripts/rollback.sh`:

```bash
#!/bin/bash
set -e

# ==============================================
# ROLLBACK SCRIPT - Onde Portal
# ==============================================
# Uso: ./rollback.sh
# Questo script:
# 1. Lista snapshot disponibili
# 2. Permette di scegliere quale usare
# 3. Esegue rollback sull'ambiente scelto
# 4. Verifica il risultato
# ==============================================

SNAPSHOTS_DIR="/Users/mattia/Projects/Onde/apps/onde-portal/snapshots"
PROJECT_DIR="/Users/mattia/Projects/Onde/apps/onde-portal"
LOG_DIR="${PROJECT_DIR}/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="${LOG_DIR}/rollback_${TIMESTAMP}.log"

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione log
log() {
    local msg="[$(date +"%H:%M:%S")] $1"
    echo -e "$msg" | tee -a "${LOG_FILE}"
}

# Crea directory log se non esiste
mkdir -p "${LOG_DIR}"

# ==============================================
# HEADER
# ==============================================
clear
echo -e "${BLUE}"
echo "=============================================="
echo "       ROLLBACK SCRIPT - Onde Portal         "
echo "=============================================="
echo -e "${NC}"
log "Inizio procedura rollback"

# ==============================================
# STEP 1: LISTA SNAPSHOT DISPONIBILI
# ==============================================
echo -e "${YELLOW}STEP 1: Snapshot Disponibili${NC}"
echo ""

# Array per memorizzare snapshot
declare -a SNAPSHOTS
i=1

# Cerca snapshot nel formato richiesto
for dir in ${SNAPSHOTS_DIR}/master-snapshot-*/; do
    if [ -d "$dir" ]; then
        SNAPSHOTS+=("$dir")
        name=$(basename "$dir")
        date_str=$(stat -f '%Sm' -t '%Y-%m-%d %H:%M' "$dir" 2>/dev/null || stat -c '%y' "$dir" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1)
        size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        files=$(find "$dir" -type f 2>/dev/null | wc -l | tr -d ' ')

        echo -e "  ${GREEN}[$i]${NC} $name"
        echo "      Data: $date_str | Dimensione: $size | File: $files"
        echo ""
        ((i++))
    fi
done

# Verifica se ci sono snapshot
if [ ${#SNAPSHOTS[@]} -eq 0 ]; then
    log "${RED}[ERROR] Nessuno snapshot trovato in ${SNAPSHOTS_DIR}${NC}"
    echo -e "${RED}Nessuno snapshot trovato!${NC}"
    echo "Crea prima uno snapshot con: ./procedures/scripts/snapshot.sh"
    exit 1
fi

# ==============================================
# STEP 2: SELEZIONE SNAPSHOT
# ==============================================
echo -e "${YELLOW}STEP 2: Seleziona Snapshot${NC}"
echo ""
echo -n "Inserisci numero snapshot (1-${#SNAPSHOTS[@]}): "
read -r CHOICE

# Valida input
if ! [[ "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt ${#SNAPSHOTS[@]} ]; then
    log "[ERROR] Selezione non valida: ${CHOICE}"
    echo -e "${RED}Selezione non valida!${NC}"
    exit 1
fi

SELECTED_SNAPSHOT="${SNAPSHOTS[$((CHOICE-1))]}"
SNAPSHOT_NAME=$(basename "${SELECTED_SNAPSHOT}")
log "Snapshot selezionato: ${SNAPSHOT_NAME}"
echo -e "${GREEN}[OK] Selezionato: ${SNAPSHOT_NAME}${NC}"
echo ""

# ==============================================
# STEP 3: VERIFICA INTEGRITA SNAPSHOT
# ==============================================
echo -e "${YELLOW}STEP 3: Verifica Integrita Snapshot${NC}"
echo ""

INTEGRITY_OK=true

# Verifica index.html
if [ -f "${SELECTED_SNAPSHOT}/index.html" ]; then
    echo -e "  ${GREEN}[OK]${NC} index.html presente"
else
    echo -e "  ${RED}[ERROR]${NC} index.html MANCANTE!"
    INTEGRITY_OK=false
fi

# Verifica _next
if [ -d "${SELECTED_SNAPSHOT}/_next" ]; then
    echo -e "  ${GREEN}[OK]${NC} _next/ presente"
else
    echo -e "  ${RED}[ERROR]${NC} _next/ MANCANTE!"
    INTEGRITY_OK=false
fi

# Verifica HTML valido
if grep -q "<html" "${SELECTED_SNAPSHOT}/index.html" 2>/dev/null; then
    echo -e "  ${GREEN}[OK]${NC} HTML valido"
else
    echo -e "  ${RED}[ERROR]${NC} HTML non valido"
    INTEGRITY_OK=false
fi

if [ "$INTEGRITY_OK" = false ]; then
    echo ""
    echo -e "${RED}Snapshot corrotto! Seleziona un altro snapshot.${NC}"
    exit 1
fi

echo ""

# ==============================================
# STEP 4: SELEZIONE AMBIENTE
# ==============================================
echo -e "${YELLOW}STEP 4: Seleziona Ambiente Target${NC}"
echo ""
echo "  [1] TEST (localhost:8888)"
echo "  [2] PREPROD (onde.surf)"
echo "  [3] PROD (onde.la) - ATTENZIONE: SITO LIVE!"
echo ""
echo -n "Scelta (1-3): "
read -r ENV_CHOICE

case $ENV_CHOICE in
    1)
        TARGET="TEST"
        TARGET_URL="http://localhost:8888"
        ;;
    2)
        TARGET="PREPROD"
        TARGET_URL="https://onde.surf"
        ;;
    3)
        TARGET="PROD"
        TARGET_URL="https://onde.la"
        ;;
    *)
        log "[ERROR] Ambiente non valido: ${ENV_CHOICE}"
        echo -e "${RED}Ambiente non valido!${NC}"
        exit 1
        ;;
esac

log "Target selezionato: ${TARGET} (${TARGET_URL})"
echo ""

# ==============================================
# STEP 5: CONFERMA
# ==============================================
echo -e "${YELLOW}STEP 5: Conferma Rollback${NC}"
echo ""
echo "=============================================="
echo "              RIEPILOGO ROLLBACK              "
echo "=============================================="
echo ""
echo "  Snapshot: ${SNAPSHOT_NAME}"
echo "  Ambiente: ${TARGET}"
echo "  URL: ${TARGET_URL}"
echo ""

if [ "$TARGET" == "PROD" ]; then
    echo -e "${RED}  *** ATTENZIONE: Stai per modificare il sito LIVE! ***${NC}"
    echo ""
fi

echo -n "Confermi il rollback? (yes/no): "
read -r CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    log "[ABORT] Rollback annullato dall'utente"
    echo -e "${YELLOW}Rollback annullato.${NC}"
    exit 0
fi

log "Conferma ricevuta. Inizio rollback..."
echo ""

# ==============================================
# STEP 6: ESECUZIONE ROLLBACK
# ==============================================
echo -e "${YELLOW}STEP 6: Esecuzione Rollback${NC}"
echo ""

case $TARGET in
    TEST)
        log "Esecuzione rollback TEST..."

        # Ferma server esistente
        pkill -f "serve.*8888" 2>/dev/null || true
        pkill -f "next.*8888" 2>/dev/null || true
        sleep 2

        OUT_DIR="${PROJECT_DIR}/out"

        # Backup se esiste
        if [ -d "${OUT_DIR}" ]; then
            BACKUP="${OUT_DIR}_backup_${TIMESTAMP}"
            cp -r "${OUT_DIR}" "${BACKUP}"
            log "Backup creato: ${BACKUP}"
            echo -e "  ${GREEN}[OK]${NC} Backup creato"
        fi

        # Copia snapshot
        rm -rf "${OUT_DIR}"
        cp -r "${SELECTED_SNAPSHOT}" "${OUT_DIR}"
        log "Snapshot copiato in out/"
        echo -e "  ${GREEN}[OK]${NC} Snapshot copiato"

        # Avvia server
        cd "${PROJECT_DIR}"
        npx serve out -p 8888 &
        SERVER_PID=$!
        log "Server avviato con PID: ${SERVER_PID}"
        echo -e "  ${GREEN}[OK]${NC} Server avviato su porta 8888"

        sleep 3
        ;;

    PREPROD)
        log "Esecuzione rollback PREPROD..."
        cd "${PROJECT_DIR}"

        # Salva modifiche locali
        git stash 2>/dev/null || true

        ROLLBACK_BRANCH="rollback/preprod-${TIMESTAMP}"
        git checkout -b "${ROLLBACK_BRANCH}"
        echo -e "  ${GREEN}[OK]${NC} Branch creato: ${ROLLBACK_BRANCH}"

        rm -rf out
        cp -r "${SELECTED_SNAPSHOT}" out
        echo -e "  ${GREEN}[OK]${NC} Snapshot copiato"

        git add out/
        git commit -m "rollback PREPROD: ${SNAPSHOT_NAME}"
        echo -e "  ${GREEN}[OK]${NC} Commit creato"

        git push origin "${ROLLBACK_BRANCH}":staging --force
        log "Push completato su staging"
        echo -e "  ${GREEN}[OK]${NC} Push su staging completato"

        echo ""
        echo "Attendo deploy PREPROD (90 secondi)..."
        sleep 90
        ;;

    PROD)
        log "Esecuzione rollback PROD..."
        cd "${PROJECT_DIR}"

        # Salva modifiche locali
        git stash 2>/dev/null || true

        git checkout main
        git pull origin main
        echo -e "  ${GREEN}[OK]${NC} Branch main aggiornato"

        ROLLBACK_BRANCH="rollback/prod-${TIMESTAMP}"
        git checkout -b "${ROLLBACK_BRANCH}"
        echo -e "  ${GREEN}[OK]${NC} Branch creato: ${ROLLBACK_BRANCH}"

        rm -rf out
        cp -r "${SELECTED_SNAPSHOT}" out
        echo -e "  ${GREEN}[OK]${NC} Snapshot copiato"

        git add out/
        git commit -m "ROLLBACK PROD: ${SNAPSHOT_NAME}"
        echo -e "  ${GREEN}[OK]${NC} Commit creato"

        git checkout main
        git merge "${ROLLBACK_BRANCH}" -m "Merge rollback PROD"
        echo -e "  ${GREEN}[OK]${NC} Merge in main completato"

        git push origin main
        log "Push completato su main"
        echo -e "  ${GREEN}[OK]${NC} Push su main completato"

        echo ""
        echo "Attendo deploy PROD (120 secondi)..."
        sleep 120
        ;;
esac

echo ""

# ==============================================
# STEP 7: VERIFICA POST-ROLLBACK
# ==============================================
echo -e "${YELLOW}STEP 7: Verifica Post-Rollback${NC}"
echo ""
echo "=============================================="
echo "          VERIFICA ${TARGET}                 "
echo "=============================================="
echo ""

ERRORS=0

# 1. Raggiungibilita (NOTA: usa curl -sf per rilevare errori correttamente)
echo -n "  [1] Raggiungibilita: "
# IMPORTANTE: curl -s da solo NON fallisce se il server e' down!
RESPONSE_CODE=$(curl -sf -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 "${TARGET_URL}" 2>/dev/null || echo "000")
if [ "$RESPONSE_CODE" == "200" ] || [ "$RESPONSE_CODE" == "301" ] || [ "$RESPONSE_CODE" == "302" ]; then
    echo -e "${GREEN}OK (${RESPONSE_CODE})${NC}"
else
    echo -e "${RED}FAIL (${RESPONSE_CODE})${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 2. HTML valido
echo -n "  [2] HTML valido: "
if curl -s "${TARGET_URL}" 2>/dev/null | grep -q "<html"; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAIL${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Assets
echo -n "  [3] Assets: "
if curl -s "${TARGET_URL}" 2>/dev/null | grep -q "_next"; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}WARN${NC}"
fi

# 4. Tempo risposta
echo -n "  [4] Tempo risposta: "
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "${TARGET_URL}" 2>/dev/null)
if (( $(echo "${RESPONSE_TIME} < 5" | bc -l 2>/dev/null || echo "1") )); then
    echo -e "${GREEN}${RESPONSE_TIME}s${NC}"
else
    echo -e "${YELLOW}${RESPONSE_TIME}s (lento)${NC}"
fi

echo ""
echo "=============================================="

if [ $ERRORS -eq 0 ]; then
    log "Rollback completato con successo"
    echo -e "${GREEN}[SUCCESS] Rollback completato con successo!${NC}"
else
    log "Rollback completato con ${ERRORS} errori"
    echo -e "${YELLOW}[WARNING] Rollback completato con ${ERRORS} errori${NC}"
    echo "Verifica manualmente: ${TARGET_URL}"
fi

echo ""
echo "Log salvato in: ${LOG_FILE}"
log "=== FINE ROLLBACK ==="
```

---

## 4. Verifica Post-Rollback

### Script Verifica Standalone

Salva come `/Users/mattia/Projects/Onde/apps/onde-portal/procedures/scripts/verifica-rollback.sh`:

```bash
#!/bin/bash
# Uso: ./verifica-rollback.sh [URL]
# Esempio: ./verifica-rollback.sh https://onde.la

URL=${1:-"https://onde.la"}

echo "=== VERIFICA ROLLBACK: ${URL} ==="
echo ""
ERRORS=0

# 1. Raggiungibilita
echo -n "[1] Raggiungibilita: "
RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${URL}")
if [ "$RESPONSE_CODE" == "200" ] || [ "$RESPONSE_CODE" == "301" ] || [ "$RESPONSE_CODE" == "302" ]; then
    echo "OK (${RESPONSE_CODE})"
else
    echo "FAIL (${RESPONSE_CODE})"
    ERRORS=$((ERRORS + 1))
fi

# 2. HTML valido
echo -n "[2] HTML valido: "
if curl -s "${URL}" | grep -q "<html"; then
    echo "OK"
else
    echo "FAIL"
    ERRORS=$((ERRORS + 1))
fi

# 3. Assets Next.js
echo -n "[3] Assets Next.js: "
if curl -s "${URL}" | grep -q "_next"; then
    echo "OK"
else
    echo "WARN (potrebbe essere OK)"
fi

# 4. HTTPS valido (solo per URL https)
if [[ "${URL}" == https://* ]]; then
    echo -n "[4] HTTPS: "
    if curl -sI "${URL}" 2>&1 | grep -q "SSL certificate problem"; then
        echo "FAIL (errore SSL)"
        ERRORS=$((ERRORS + 1))
    else
        echo "OK"
    fi
fi

# 5. Tempo risposta
echo -n "[5] Tempo risposta: "
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "${URL}")
if (( $(echo "${RESPONSE_TIME} < 5" | bc -l) )); then
    echo "${RESPONSE_TIME}s - OK"
else
    echo "${RESPONSE_TIME}s - SLOW"
fi

# 6. Pagine critiche
echo "[6] Pagine critiche:"
for page in "" "catalogo" "about" "libri"; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "${URL}/${page}")
    if [ "$CODE" == "200" ] || [ "$CODE" == "301" ]; then
        echo "    /${page}: OK (${CODE})"
    else
        echo "    /${page}: FAIL (${CODE})"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo "==================================="
if [ $ERRORS -eq 0 ]; then
    echo "[SUCCESS] Tutte le verifiche passate!"
    exit 0
else
    echo "[WARNING] ${ERRORS} errori rilevati"
    exit 1
fi
```

---

## 5. Cosa Fare se il Rollback Fallisce

### Scenario 1: Snapshot Corrotto

| Problema | Causa | Soluzione |
|----------|-------|-----------|
| index.html mancante | Snapshot incompleto | Usa snapshot precedente |
| _next/ mancante | Assets non copiati | Usa snapshot precedente |
| HTML non valido | File corrotto | Usa snapshot precedente |

```bash
# Lista altri snapshot disponibili
ls -lt /Users/mattia/Projects/Onde/apps/onde-portal/snapshots/ | head -10

# Prova il secondo piu recente
```

### Scenario 2: Deploy Non Parte

| Problema | Causa | Soluzione |
|----------|-------|-----------|
| Git push rifiutato | Conflitti | `git pull --rebase` e riprova |
| CI/CD bloccato | Build fallita | Controlla GitHub Actions |
| Timeout | Rete lenta | Riprova dopo 5 minuti |

```bash
# Verifica stato GitHub Actions
gh run list --limit 5

# Forza re-run se necessario
gh run rerun <run-id>
```

### Scenario 3: Sito Non Risponde Dopo Rollback

```bash
# 1. Verifica DNS
dig onde.la

# 2. Verifica certificato SSL
curl -vI https://onde.la 2>&1 | grep -i ssl

# 3. Verifica stato hosting
# Controlla status page di Cloudflare/Vercel

# 4. Prova con altro snapshot
./procedures/scripts/rollback.sh

# 5. Come ULTIMA risorsa: git reset hard
cd /Users/mattia/Projects/Onde
git log --oneline -20
git reset --hard <commit-funzionante>
git push origin main --force
```

### Scenario 4: Rollback Fallisce Completamente

**PROCEDURA DI EMERGENZA:**

1. **MANTIENI LA CALMA** - Ogni minuto di panico e' un minuto di downtime
2. **Documenta** cosa hai fatto e cosa e' successo
3. **Prova snapshot diverso** - Vai indietro nel tempo
4. **Contatta Mattia** - Telegram: 7505631979
5. **Ultimo resort**: Ripristino da backup hosting

```bash
# Trova ultimo commit sicuramente funzionante
git log --oneline -50

# Reset forzato (SOLO EMERGENZA)
git reset --hard <commit-sicuro>
git push origin main --force
```

---

## Checklist Pre-Rollback

- [ ] Problema confermato e documentato
- [ ] Snapshot target identificato e verificato
- [ ] Ambiente target scelto (TEST prima, poi PREPROD/PROD)
- [ ] Pronto a verificare post-rollback

## Checklist Post-Rollback

- [ ] Sito raggiungibile
- [ ] HTML caricato correttamente
- [ ] Pagine critiche funzionanti
- [ ] Tempo risposta accettabile
- [ ] Log rollback salvato
- [ ] Causa problema documentata per analisi

---

## Tempo Stimato Rollback

| Ambiente | Tempo Rollback | Tempo Deploy | Tempo Verifica | Totale |
|----------|---------------|--------------|----------------|--------|
| TEST | 30 sec | 3 sec | 30 sec | ~1 min |
| PREPROD | 1 min | 90 sec | 1 min | ~4 min |
| PROD | 2 min | 2 min | 2 min | ~6 min |

---

## Manutenzione Snapshot

```bash
# Elenca tutti gli snapshot con dimensioni
du -sh /Users/mattia/Projects/Onde/apps/onde-portal/snapshots/*/

# Spazio totale occupato
du -sh /Users/mattia/Projects/Onde/apps/onde-portal/snapshots/

# Mantieni solo ultimi 10 snapshot
cd /Users/mattia/Projects/Onde/apps/onde-portal/snapshots/
ls -dt master-snapshot-*/ | tail -n +11 | xargs rm -rf

# Elimina snapshot piu vecchi di 30 giorni
find /Users/mattia/Projects/Onde/apps/onde-portal/snapshots/ -type d -name "master-snapshot-*" -mtime +30 -exec rm -rf {} \;
```

---

## Riferimenti

- **SNAPSHOT.md** - Procedura creazione snapshot
- **DEPLOY.md** - Procedura deploy normale
- **MODIFICA.md** - Procedura modifica sito

---

*Ultima modifica: 2026-01-11*
