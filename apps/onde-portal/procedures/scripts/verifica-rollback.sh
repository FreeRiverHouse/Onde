#!/bin/bash
# ==============================================
# VERIFICA ROLLBACK - Onde Portal
# ==============================================
# Uso: ./verifica-rollback.sh [URL]
# Esempio: ./verifica-rollback.sh https://onde.la
# Default: https://onde.la
# ==============================================

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
