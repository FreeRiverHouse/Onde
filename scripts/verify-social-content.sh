#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# VERIFY-SOCIAL-CONTENT.SH - Verifica contenuti social BLINDATA
# ═══════════════════════════════════════════════════════════════

FILE="${1:-CONTENUTI-SOCIAL-CURRENT.html}"
SNAPSHOT_FILE=".social-snapshot.txt"

echo "═══════════════════════════════════════════════════════════════"
echo "🔍 VERIFICA CONTENUTI SOCIAL - $FILE"
echo "═══════════════════════════════════════════════════════════════"

if [ ! -f "$FILE" ]; then
    echo "⛔ File non trovato: $FILE"
    exit 1
fi

ERRORS=0

# 1. Check HASHTAG (devono essere ZERO!)
# Ignora colori CSS (#fff, #e6f3ff, etc.) - cerca solo hashtag social tipo #Stoicism
HASHTAGS=$(grep -oE '#[A-Za-z][A-Za-z0-9]{2,}' "$FILE" | grep -vE '^#[0-9a-fA-F]{3,6}$' | wc -l)
echo ""
echo "📌 CHECK HASHTAG:"
if [ "$HASHTAGS" -gt 0 ]; then
    echo "⛔ ERRORE: Trovati $HASHTAGS hashtag! DEVONO ESSERE ZERO!"
    grep -oE '#[A-Za-z][A-Za-z0-9]{2,}' "$FILE" | grep -vE '^#[0-9a-fA-F]{3,6}$' | head -5
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Nessun hashtag trovato - OK"
fi

# 2. Conta post totali
POSTS=$(grep -c 'class="post"' "$FILE" 2>/dev/null || echo 0)
echo ""
echo "📝 POST TOTALI: $POSTS"

# 3. Check duplicati citazioni
echo ""
echo "🔄 CHECK DUPLICATI:"
QUOTES=$(grep -oE '"[^"]{30,100}"' "$FILE" | sort | uniq -d)
if [ -n "$QUOTES" ]; then
    echo "⛔ ERRORE: Trovate citazioni duplicate!"
    echo "$QUOTES"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Nessuna citazione duplicata - OK"
fi

# 4. Check immagini (se presenti)
IMAGES=$(grep -c '<img' "$FILE" 2>/dev/null || echo 0)
echo ""
echo "🖼️  IMMAGINI: $IMAGES"

# 5. Check organizzazione per libro
MEDITATIONS=$(grep -c 'MEDITATIONS' "$FILE" 2>/dev/null || echo 0)
PSALM=$(grep -c 'PSALM' "$FILE" 2>/dev/null || echo 0)
echo ""
echo "📚 ORGANIZZAZIONE PER LIBRO:"
echo "   - Meditations: $MEDITATIONS riferimenti"
echo "   - Psalm 23: $PSALM riferimenti"

# 6. Check CTA onde.la
CTA=$(grep -c 'onde.la' "$FILE" 2>/dev/null || echo 0)
echo ""
echo "🔗 CALL TO ACTION (onde.la): $CTA"

# Confronta con snapshot se esiste
if [ -f "$SNAPSHOT_FILE" ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "📊 CONFRONTO CON SNAPSHOT PRECEDENTE"
    echo "═══════════════════════════════════════════════════════════════"
    source "$SNAPSHOT_FILE"
    
    if [ "$POSTS" -lt "$PREV_POSTS" ]; then
        echo "⚠️  Post diminuiti: $PREV_POSTS → $POSTS"
    else
        echo "✅ Post: $PREV_POSTS → $POSTS"
    fi
    
    if [ "$IMAGES" -lt "$PREV_IMAGES" ]; then
        echo "⚠️  Immagini diminuite: $PREV_IMAGES → $IMAGES"
    else
        echo "✅ Immagini: $PREV_IMAGES → $IMAGES"
    fi
fi

# Salva snapshot
cat > "$SNAPSHOT_FILE" << EOF
PREV_POSTS=$POSTS
PREV_IMAGES=$IMAGES
PREV_HASHTAGS=$HASHTAGS
PREV_CTA=$CTA
EOF

echo ""
echo "═══════════════════════════════════════════════════════════════"
if [ "$ERRORS" -gt 0 ]; then
    echo "⛔⛔⛔ $ERRORS ERRORI TROVATI! CORREGGI PRIMA DI PROCEDERE! ⛔⛔⛔"
    exit 1
else
    echo "✅✅✅ TUTTI I CHECK PASSATI ✅✅✅"
    exit 0
fi
