#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# VERIFY-UPGRADE.SH - Script di verifica BLINDATA per upgrade libro
# Esegui PRIMA e DOPO ogni upgrade per confrontare
# ═══════════════════════════════════════════════════════════════

HTML_FILE="${1:-meditations-george-long.html}"
PDF_FILE="${2:-Meditations-Marcus-Aurelius-George-Long.pdf}"
SNAPSHOT_FILE=".upgrade-snapshot.txt"

echo "═══════════════════════════════════════════════════════════════"
echo "VERIFICA UPGRADE - $HTML_FILE"
echo "═══════════════════════════════════════════════════════════════"

# Conta pagine PDF
if [ -f "$PDF_FILE" ]; then
    PAGES=$(mdls -name kMDItemNumberOfPages "$PDF_FILE" | awk '{print $3}')
    echo "📄 Pagine PDF: $PAGES"
else
    PAGES=0
    echo "⚠️  PDF non trovato: $PDF_FILE"
fi

# Verifica forward
FORWARD=$(grep -c "forward\|You found this" "$HTML_FILE" 2>/dev/null || echo 0)
echo "📝 Forward check: $FORWARD occorrenze"

# Verifica bio notes
BIO=$(grep -c "bio-page\|ABOUT MARCUS\|biographical" "$HTML_FILE" 2>/dev/null || echo 0)
echo "📖 Bio notes check: $BIO occorrenze"

# Conta immagini
IMAGES=$(grep -c '<img' "$HTML_FILE" 2>/dev/null || echo 0)
echo "🖼️  Immagini: $IMAGES"

# Verifica FINIS
FINIS=$(grep -c "FINIS\|finis" "$HTML_FILE" 2>/dev/null || echo 0)
echo "🏁 FINIS page: $FINIS"

echo ""

# Se esiste snapshot precedente, confronta
if [ -f "$SNAPSHOT_FILE" ]; then
    echo "═══════════════════════════════════════════════════════════════"
    echo "CONFRONTO CON SNAPSHOT PRECEDENTE"
    echo "═══════════════════════════════════════════════════════════════"
    
    source "$SNAPSHOT_FILE"
    
    ERRORS=0
    
    # Check pagine
    if [ "$PAGES" -lt "$((PREV_PAGES - 5))" ]; then
        echo "⛔ ERRORE: Pagine diminuite! $PREV_PAGES → $PAGES"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Pagine OK: $PREV_PAGES → $PAGES"
    fi
    
    # Check forward
    if [ "$FORWARD" -lt "$PREV_FORWARD" ]; then
        echo "⛔ ERRORE: Forward persa! $PREV_FORWARD → $FORWARD"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Forward OK: $PREV_FORWARD → $FORWARD"
    fi
    
    # Check bio
    if [ "$BIO" -lt "$PREV_BIO" ]; then
        echo "⛔ ERRORE: Bio notes perse! $PREV_BIO → $BIO"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Bio notes OK: $PREV_BIO → $BIO"
    fi
    
    # Check immagini
    if [ "$IMAGES" -lt "$PREV_IMAGES" ]; then
        echo "⛔ ERRORE: Immagini perse! $PREV_IMAGES → $IMAGES"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Immagini OK: $PREV_IMAGES → $IMAGES"
    fi
    
    echo ""
    if [ "$ERRORS" -gt 0 ]; then
        echo "═══════════════════════════════════════════════════════════════"
        echo "⛔⛔⛔ $ERRORS ERRORI TROVATI! NON INVIARE SU TELEGRAM! ⛔⛔⛔"
        echo "═══════════════════════════════════════════════════════════════"
        exit 1
    else
        echo "═══════════════════════════════════════════════════════════════"
        echo "✅✅✅ TUTTI I CHECK PASSATI - OK PER INVIO ✅✅✅"
        echo "═══════════════════════════════════════════════════════════════"
    fi
else
    echo "📸 Nessuno snapshot precedente. Salvo snapshot attuale..."
fi

# Salva snapshot attuale
cat > "$SNAPSHOT_FILE" << EOF
PREV_PAGES=$PAGES
PREV_FORWARD=$FORWARD
PREV_BIO=$BIO
PREV_IMAGES=$IMAGES
PREV_FINIS=$FINIS
EOF

echo "💾 Snapshot salvato in $SNAPSHOT_FILE"
echo ""
echo "USAGE:"
echo "  1. Esegui PRIMA dell'upgrade per salvare snapshot"
echo "  2. Fai le modifiche"
echo "  3. Esegui DOPO l'upgrade per verificare"
echo "  4. Se errori → NON inviare, ripristina backup"
