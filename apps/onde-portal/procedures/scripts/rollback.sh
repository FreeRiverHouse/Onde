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

# 1. Raggiungibilita
echo -n "  [1] Raggiungibilita: "
RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${TARGET_URL}" 2>/dev/null)
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
