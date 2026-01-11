# ROLLBACK - Procedura Rollback

## Obiettivo
Ripristinare rapidamente uno degli ambienti a uno stato precedente funzionante.

---

## Ambienti

| Ambiente | URL | Priorita Rollback |
|----------|-----|-------------------|
| PROD | onde.la | CRITICA - Massima priorita |
| PREPROD | onde.surf | ALTA |
| TEST | localhost:8888 | NORMALE |

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

## Rollback PROD (onde.la) - PRIORITA MASSIMA

### Metodo 1: Git Revert (Preferito)

```bash
cd /Users/mattia/Projects/Onde

# Identifica commit problematico
git log --oneline -10

# Trova ultimo commit funzionante
LAST_GOOD_COMMIT="abc1234"  # Sostituisci con hash reale

# Revert del commit problematico
git revert HEAD --no-edit

# Oppure revert a commit specifico
git revert ${LAST_GOOD_COMMIT}..HEAD --no-edit

# Push immediato
git push origin main

echo "[ROLLBACK] Push completato. Attendo deploy..."
```

### Metodo 2: Reset Hard (Emergenza)

```bash
cd /Users/mattia/Projects/Onde

# ATTENZIONE: Questo cancella commit recenti
# Usa solo se revert non funziona

# Trova commit funzionante
git log --oneline -20
LAST_GOOD_COMMIT="abc1234"

# Reset
git reset --hard ${LAST_GOOD_COMMIT}

# Force push (PERICOLOSO ma necessario in emergenza)
git push origin main --force

echo "[ROLLBACK EMERGENZA] Completato"
```

### Metodo 3: Ripristino da Snapshot

```bash
# Trova snapshot piu recente
ls -lt /Users/mattia/Projects/Onde/apps/onde-portal/snapshots/ | head -5

# Seleziona snapshot
SNAPSHOT_DIR="/Users/mattia/Projects/Onde/apps/onde-portal/snapshots/[TIMESTAMP]"

# Ripristina file sorgente
cp -r "${SNAPSHOT_DIR}/test/src" /Users/mattia/Projects/Onde/apps/onde-portal/

# Commit e push
cd /Users/mattia/Projects/Onde
git add apps/onde-portal/src
git commit -m "rollback: ripristino da snapshot [TIMESTAMP]"
git push origin main
```

### Verifica Post-Rollback PROD

```bash
# Attendi deploy (tipicamente 1-2 minuti)
sleep 120

# Verifica raggiungibilita
if curl -s --head https://onde.la | head -n 1 | grep -q "200"; then
    echo "[OK] PROD raggiungibile"
else
    echo "[CRITICAL] PROD ancora non raggiungibile"
    echo "AZIONE: Contatta hosting/supporto tecnico"
fi

# Verifica contenuto
curl -s https://onde.la | head -20
```

---

## Rollback PREPROD (onde.surf)

### Metodo 1: Git Reset Branch Staging

```bash
cd /Users/mattia/Projects/Onde

git checkout staging

# Trova commit funzionante
git log --oneline -10
LAST_GOOD_COMMIT="abc1234"

# Reset
git reset --hard ${LAST_GOOD_COMMIT}
git push origin staging --force

echo "[ROLLBACK PREPROD] Completato"
```

### Metodo 2: Merge da Main

```bash
cd /Users/mattia/Projects/Onde

# Se main e stabile, usa quello
git checkout staging
git reset --hard origin/main
git push origin staging --force
```

### Verifica Post-Rollback PREPROD

```bash
sleep 60

if curl -s --head https://onde.surf | head -n 1 | grep -q "200"; then
    echo "[OK] PREPROD ripristinato"
else
    echo "[ERROR] PREPROD non raggiungibile"
fi
```

---

## Rollback TEST (localhost:8888)

### Metodo 1: Git Checkout

```bash
cd /Users/mattia/Projects/Onde/apps/onde-portal

# Annulla tutte le modifiche non committate
git checkout -- .

# Torna a commit precedente
git checkout HEAD~1

# Riavvia server
pkill -f "node.*onde-portal" 2>/dev/null || true
npm run dev
```

### Metodo 2: Ripristino da Snapshot

```bash
# Trova snapshot
ls -lt /Users/mattia/Projects/Onde/apps/onde-portal/snapshots/

# Ripristina
SNAPSHOT_DIR="/Users/mattia/Projects/Onde/apps/onde-portal/snapshots/[TIMESTAMP]"
rm -rf /Users/mattia/Projects/Onde/apps/onde-portal/src
cp -r "${SNAPSHOT_DIR}/test/src" /Users/mattia/Projects/Onde/apps/onde-portal/

# Riavvia
npm run dev
```

### Metodo 3: Fresh Clone

```bash
# Se tutto e corrotto, ricomincia da zero
cd /Users/mattia/Projects
rm -rf Onde
git clone [URL_REPOSITORY] Onde
cd Onde/apps/onde-portal
npm install
npm run dev
```

---

## Script Rollback Rapido

Salva come `rollback.sh` in `/procedures/scripts/`:

```bash
#!/bin/bash
set -e

# ==============================================
# ROLLBACK SCRIPT - onde.la
# ==============================================

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="/Users/mattia/Projects/Onde/apps/onde-portal/logs/rollback_${TIMESTAMP}.log"

log() {
    echo "[$(date +"%H:%M:%S")] $1" | tee -a "${LOG_FILE}"
}

mkdir -p "$(dirname ${LOG_FILE})"

echo ""
echo "=============================================="
echo "           ROLLBACK PROCEDURE                "
echo "=============================================="
echo ""
echo "Quale ambiente vuoi ripristinare?"
echo "1) PROD (onde.la) - CRITICO"
echo "2) PREPROD (onde.surf)"
echo "3) TEST (localhost:8888)"
echo ""
read -p "Scegli (1/2/3): " ENV_CHOICE

case ${ENV_CHOICE} in
    1)
        ENV="PROD"
        BRANCH="main"
        URL="https://onde.la"
        ;;
    2)
        ENV="PREPROD"
        BRANCH="staging"
        URL="https://onde.surf"
        ;;
    3)
        ENV="TEST"
        BRANCH=""
        URL="http://localhost:8888"
        ;;
    *)
        echo "Scelta non valida"
        exit 1
        ;;
esac

log "=== ROLLBACK ${ENV} ==="

if [ "${ENV}" = "TEST" ]; then
    log "Ripristino TEST locale..."
    cd /Users/mattia/Projects/Onde/apps/onde-portal
    git checkout -- .
    pkill -f "node.*onde-portal" 2>/dev/null || true
    npm run dev &
    log "[OK] TEST ripristinato"
    exit 0
fi

cd /Users/mattia/Projects/Onde

# Mostra ultimi commit
log "Ultimi commit su ${BRANCH}:"
git log --oneline -5 ${BRANCH}

echo ""
read -p "Inserisci hash commit da ripristinare: " COMMIT_HASH

if [ -z "${COMMIT_HASH}" ]; then
    echo "Hash non fornito. Uso commit precedente (HEAD~1)"
    COMMIT_HASH="HEAD~1"
fi

log "Ripristino a: ${COMMIT_HASH}"

# Conferma
echo ""
echo "ATTENZIONE: Stai per fare rollback di ${ENV} a ${COMMIT_HASH}"
read -p "Confermi? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    log "[ABORT] Rollback annullato"
    exit 0
fi

# Esegui rollback
git checkout ${BRANCH}
git reset --hard ${COMMIT_HASH}
git push origin ${BRANCH} --force

log "Push completato. Attendo deploy..."
sleep 60

# Verifica
if curl -s --head "${URL}" | head -n 1 | grep -q "200"; then
    log "[OK] ${ENV} ripristinato e raggiungibile"
else
    log "[ERROR] ${ENV} non raggiungibile dopo rollback"
    log "AZIONE: Verifica manualmente o contatta supporto"
fi

log "=== ROLLBACK COMPLETATO ==="
```

---

## Checklist Pre-Rollback

- [ ] Confermato che c'e un problema reale
- [ ] Identificato commit/snapshot funzionante
- [ ] Comunicato al team (se applicabile)
- [ ] Pronto a verificare post-rollback

## Checklist Post-Rollback

- [ ] Ambiente raggiungibile
- [ ] Contenuto visualizzato correttamente
- [ ] Funzionalita core testate
- [ ] Log rollback salvato
- [ ] Analisi causa problema pianificata

---

## Cosa Fare se Rollback Fallisce

| Problema | Azione |
|----------|--------|
| Git push rifiutato | Usa `--force` (solo emergenza) |
| Commit non trovato | Cerca in `git reflog` |
| Snapshot corrotto | Usa snapshot precedente |
| Nessuno snapshot | Usa `git log` per trovare commit |
| Server non risponde | Contatta hosting provider |
| Tutto fallisce | Ripristina da backup hosting |

### Contatti Emergenza

```
Hosting Provider: [INSERIRE CONTATTO]
DevOps/SysAdmin: [INSERIRE CONTATTO]
Repository Backup: [INSERIRE URL]
```

---

## Tempo Stimato Rollback

| Ambiente | Tempo Rollback | Tempo Verifica |
|----------|---------------|----------------|
| TEST | 1 min | 1 min |
| PREPROD | 2-3 min | 2 min |
| PROD | 2-5 min | 2 min |

**Tempo totale massimo: 10 minuti**

---

## Prevenzione

Per ridurre necessita di rollback:

1. **Sempre creare snapshot prima di deploy**
2. **Testare su PREPROD prima di PROD**
3. **Deploy incrementali piccoli**
4. **Verifiche automatiche post-deploy**
5. **Mantenere almeno 5 snapshot recenti**
