# DEPLOY - Procedura Deploy

## Obiettivo
Gestire il flusso di deploy da TEST a PREPROD a PROD con verifiche automatiche e diff programmatici.

---

## Flusso Deploy

```
TEST (localhost:8888) → PREPROD (onde.surf) → PROD (onde.la)
     [auto]                 [auto]              [APPROVAZIONE RICHIESTA]
```

---

## Ambienti

| Ambiente | URL | Branch | Deploy |
|----------|-----|--------|--------|
| TEST | localhost:8888 | feature/* | Locale |
| PREPROD | onde.surf | develop/staging | Automatico |
| PROD | onde.la | main/master | Manuale con approvazione |

---

## Procedura Completa

### Step 1: Verifica Stato TEST

```bash
cd /Users/mattia/Projects/Onde/apps/onde-portal

# Verifica che non ci siano modifiche non committate
git status

# Se ci sono modifiche, committale prima
git add .
git commit -m "feat: [descrizione modifiche]"

# Verifica build locale
npm run build

# Se build fallisce, NON procedere
if [ $? -ne 0 ]; then
    echo "[ERROR] Build fallita. Correggi errori prima di procedere."
    exit 1
fi

echo "[OK] TEST pronto per deploy"
```

### Step 2: Crea Snapshot Pre-Deploy

```bash
# Snapshot di sicurezza prima del deploy
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SNAPSHOT_DIR="/Users/mattia/Projects/Onde/apps/onde-portal/snapshots/pre_deploy_${TIMESTAMP}"

mkdir -p "${SNAPSHOT_DIR}"

# Salva stato attuale PREPROD e PROD
curl -s https://onde.surf -o "${SNAPSHOT_DIR}/preprod_before.html"
curl -s https://onde.la -o "${SNAPSHOT_DIR}/prod_before.html"

# Salva hash commit corrente
git rev-parse HEAD > "${SNAPSHOT_DIR}/commit_hash.txt"

echo "[OK] Snapshot pre-deploy creato: ${SNAPSHOT_DIR}"
```

### Step 3: Deploy su PREPROD

```bash
# Push su branch staging/develop
git push origin develop

# Oppure merge in staging
git checkout staging
git merge develop
git push origin staging

# Attendi deploy automatico (dipende da CI/CD)
echo "Attendo deploy PREPROD..."
sleep 30

# Verifica che PREPROD sia aggiornato
curl -s --head https://onde.surf | head -n 1
```

### Step 4: Diff Programmatico PREPROD

```bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DIFF_DIR="/Users/mattia/Projects/Onde/apps/onde-portal/diffs/${TIMESTAMP}"
mkdir -p "${DIFF_DIR}"

# Scarica nuovo stato PREPROD
curl -s https://onde.surf -o "${DIFF_DIR}/preprod_after.html"

# Confronta con stato precedente
diff "${SNAPSHOT_DIR}/preprod_before.html" "${DIFF_DIR}/preprod_after.html" > "${DIFF_DIR}/preprod_diff.txt" || true

# Mostra differenze
echo "=== DIFFERENZE PREPROD ==="
cat "${DIFF_DIR}/preprod_diff.txt"
echo "=========================="

# Conta linee cambiate
CHANGES=$(wc -l < "${DIFF_DIR}/preprod_diff.txt")
echo "Linee cambiate: ${CHANGES}"
```

### Step 5: Verifica Automatica PREPROD

```bash
#!/bin/bash
# Script verifica automatica con timeout e retry

PREPROD_URL="https://onde.surf"
ERRORS=0
MAX_RETRIES=3
RETRY_DELAY=10

echo "=== VERIFICA AUTOMATICA PREPROD ==="

# Funzione per verificare con retry
verify_url() {
    local url=$1
    local retries=0

    while [ $retries -lt $MAX_RETRIES ]; do
        # Usa curl -sf per fallire correttamente su errori
        HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 "${url}" 2>/dev/null || echo "000")

        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
            return 0
        fi

        retries=$((retries + 1))
        if [ $retries -lt $MAX_RETRIES ]; then
            echo "       Retry $retries/$MAX_RETRIES in ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        fi
    done
    return 1
}

# 1. Verifica raggiungibilita (con retry)
echo "[CHECK] Verifica raggiungibilita..."
if verify_url "${PREPROD_URL}"; then
    echo "[OK] Sito raggiungibile"
else
    echo "[ERROR] Sito non raggiungibile dopo $MAX_RETRIES tentativi"
    ERRORS=$((ERRORS + 1))
fi

# 2. Verifica contenuto homepage
if curl -s "${PREPROD_URL}" | grep -q "<html"; then
    echo "[OK] HTML valido"
else
    echo "[ERROR] HTML non valido"
    ERRORS=$((ERRORS + 1))
fi

# 3. Verifica assets (CSS/JS)
if curl -s "${PREPROD_URL}" | grep -q "stylesheet\|script"; then
    echo "[OK] Assets presenti"
else
    echo "[WARN] Assets potrebbero mancare"
fi

# 4. Verifica HTTPS
if curl -s --head "${PREPROD_URL}" | grep -q "HTTP/2\|HTTP/1.1"; then
    echo "[OK] HTTPS funzionante"
else
    echo "[ERROR] Problema HTTPS"
    ERRORS=$((ERRORS + 1))
fi

# 5. Verifica tempo risposta
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "${PREPROD_URL}")
if (( $(echo "${RESPONSE_TIME} < 3" | bc -l) )); then
    echo "[OK] Tempo risposta: ${RESPONSE_TIME}s"
else
    echo "[WARN] Risposta lenta: ${RESPONSE_TIME}s"
fi

echo "=================================="
echo "Errori totali: ${ERRORS}"

if [ ${ERRORS} -gt 0 ]; then
    echo "[STOP] Correggere errori prima di procedere a PROD"
    exit 1
fi
```

### Step 6: Richiesta Approvazione PROD

```bash
echo ""
echo "=============================================="
echo "       APPROVAZIONE DEPLOY PROD RICHIESTA    "
echo "=============================================="
echo ""
echo "Ambiente: PROD (onde.la)"
echo "Branch: main"
echo "Commit: $(git rev-parse --short HEAD)"
echo "Modifiche: $(git log --oneline -1)"
echo ""
echo "Verifiche PREPROD:"
echo "  - Sito raggiungibile: OK"
echo "  - Build completata: OK"
echo "  - Diff verificato: OK"
echo ""
echo "Confermi il deploy su PROD? (yes/no)"
read -r APPROVAL

if [ "${APPROVAL}" != "yes" ]; then
    echo "[ABORT] Deploy PROD annullato"
    exit 0
fi

echo "[OK] Approvazione ricevuta. Procedo con deploy PROD..."
```

### Step 7: Deploy su PROD

```bash
# Merge in main
git checkout main
git merge staging
git push origin main

# Oppure con tag versione
VERSION=$(date +"%Y.%m.%d")
git tag -a "v${VERSION}" -m "Release ${VERSION}"
git push origin "v${VERSION}"

echo "Deploy PROD avviato..."
sleep 60  # Attendi CI/CD
```

### Step 8: Verifica Post-Deploy PROD

```bash
PROD_URL="https://onde.la"

echo "=== VERIFICA POST-DEPLOY PROD ==="

# Scarica nuovo stato
curl -s "${PROD_URL}" -o "${DIFF_DIR}/prod_after.html"

# Confronta
diff "${SNAPSHOT_DIR}/prod_before.html" "${DIFF_DIR}/prod_after.html" > "${DIFF_DIR}/prod_diff.txt" || true

# Verifica raggiungibilita
if curl -s --head "${PROD_URL}" | head -n 1 | grep -q "200"; then
    echo "[OK] PROD raggiungibile"
else
    echo "[CRITICAL] PROD non raggiungibile - AVVIA ROLLBACK"
    exit 1
fi

# Verifica contenuto
if curl -s "${PROD_URL}" | grep -q "<html"; then
    echo "[OK] Contenuto valido"
else
    echo "[CRITICAL] Contenuto non valido - AVVIA ROLLBACK"
    exit 1
fi

echo "[OK] Deploy PROD completato con successo"
```

---

## Script Deploy Completo

Salva come `deploy.sh` in `/procedures/scripts/`:

```bash
#!/bin/bash
set -e

# ==============================================
# DEPLOY SCRIPT - onde.la
# ==============================================

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="/Users/mattia/Projects/Onde/apps/onde-portal/logs/deploy_${TIMESTAMP}.log"
SNAPSHOT_DIR="/Users/mattia/Projects/Onde/apps/onde-portal/snapshots/deploy_${TIMESTAMP}"

log() {
    echo "[$(date +"%H:%M:%S")] $1" | tee -a "${LOG_FILE}"
}

mkdir -p "${SNAPSHOT_DIR}" "$(dirname ${LOG_FILE})"

log "=== INIZIO DEPLOY ==="

# Verifica stato
log "Verifico stato locale..."
cd /Users/mattia/Projects/Onde/apps/onde-portal

if ! npm run build > /dev/null 2>&1; then
    log "[ERROR] Build fallita"
    exit 1
fi
log "[OK] Build locale"

# Snapshot pre-deploy
log "Creo snapshot pre-deploy..."
curl -s https://onde.surf -o "${SNAPSHOT_DIR}/preprod_before.html"
curl -s https://onde.la -o "${SNAPSHOT_DIR}/prod_before.html"
log "[OK] Snapshot creato"

# Deploy PREPROD
log "Deploy PREPROD..."
git push origin develop 2>&1 | tee -a "${LOG_FILE}"
sleep 30

# Verifica PREPROD
log "Verifico PREPROD..."
if ! curl -s --head https://onde.surf | head -n 1 | grep -q "200"; then
    log "[ERROR] PREPROD non raggiungibile"
    exit 1
fi
log "[OK] PREPROD verificato"

# Richiedi approvazione
echo ""
log "=== APPROVAZIONE RICHIESTA PER PROD ==="
echo "Confermi deploy su PROD (onde.la)? (yes/no)"
read -r APPROVAL

if [ "${APPROVAL}" != "yes" ]; then
    log "[ABORT] Deploy annullato dall'utente"
    exit 0
fi

# Deploy PROD
log "Deploy PROD..."
git checkout main
git merge develop
git push origin main 2>&1 | tee -a "${LOG_FILE}"
sleep 60

# Verifica PROD
log "Verifico PROD..."
if ! curl -s --head https://onde.la | head -n 1 | grep -q "200"; then
    log "[CRITICAL] PROD non raggiungibile - ROLLBACK NECESSARIO"
    exit 1
fi

log "[OK] Deploy completato con successo"
log "=== FINE DEPLOY ==="
```

---

## Checklist Pre-Deploy

- [ ] Tutte le modifiche committate
- [ ] Build locale senza errori
- [ ] Test passati (se presenti)
- [ ] Snapshot pre-deploy creato
- [ ] Branch corretto selezionato

## Checklist Post-Deploy

- [ ] PREPROD raggiungibile
- [ ] Diff PREPROD verificato
- [ ] Verifica automatica passata
- [ ] Approvazione PROD ottenuta
- [ ] PROD raggiungibile
- [ ] Diff PROD verificato
- [ ] Log deploy salvato

---

## Cosa Fare se Fallisce

| Fase | Errore | Azione Immediata | Comando |
|------|--------|------------------|---------|
| Build | Errori compilazione | Correggi codice, non deployare | `npm run build 2>&1 \| head -50` |
| Build | Dipendenze mancanti | Reinstalla dipendenze | `rm -rf node_modules && npm install` |
| Push | Conflitti git | Risolvi conflitti, ripeti | `git status` per vedere conflitti |
| Push | Autenticazione fallita | Verifica credenziali | `git remote -v` e configura token |
| PREPROD | Non raggiungibile | Verifica CI/CD, log deploy | Controlla dashboard Vercel/Netlify |
| PREPROD | Contenuto errato | Verifica branch, ripeti deploy | `git log --oneline -5` |
| PREPROD | Deploy lento | Attendi o verifica build queue | Dashboard CI/CD |
| PROD | Non raggiungibile | **ROLLBACK IMMEDIATO** | `./procedures/scripts/rollback.sh` |
| PROD | Contenuto errato | **ROLLBACK IMMEDIATO** | `git revert HEAD --no-edit && git push` |
| PROD | Performance degradate | Valuta rollback | Controlla metriche prima di decidere |

---

## Rollback Automatico in Caso di Errore PROD

```bash
#!/bin/bash
# ESEGUI QUESTO SE PROD E' ROTTO

echo "=== ROLLBACK EMERGENZA PROD ==="

cd /Users/mattia/Projects/Onde

# Salva il commit problematico per analisi
BAD_COMMIT=$(git rev-parse HEAD)
echo "Commit problematico: ${BAD_COMMIT}"

# Opzione 1: Revert (crea nuovo commit, piu' sicuro)
git revert HEAD --no-edit
git push origin main

echo "Rollback completato. Attendo propagazione..."
sleep 60

# Verifica
if curl -sf https://onde.la > /dev/null 2>&1; then
    echo "[OK] PROD ripristinato"
else
    echo "[CRITICAL] PROD ancora down - escalation necessaria"
    echo "Contatta: [INSERIRE CONTATTI EMERGENZA]"
fi
```

**In caso di problema PROD, esegui subito:** `./procedures/scripts/rollback.sh`

---

## Tempi Tipici

| Fase | Tempo Stimato |
|------|---------------|
| Build locale | 1-2 min |
| Deploy PREPROD | 2-5 min |
| Verifica PREPROD | 1 min |
| Deploy PROD | 2-5 min |
| Verifica PROD | 1 min |
| **Totale** | **7-15 min** |
