# 🎨 Procedura Generazione Immagini con Grok

## Metodo JavaScript (FUNZIONANTE ✅)

### Prerequisiti
- macOS con Chrome
- Chrome loggato su grok.com
- JavaScript abilitato per AppleScript: Chrome > View > Developer > Allow JavaScript from Apple Events

### Step 1: Genera immagine manualmente
1. Vai su https://grok.com/imagine
2. Inserisci prompt
3. Aspetta generazione (~20-30 sec)

### Step 2: Estrai URL immagini via JS
```bash
# Lista tutte le immagini generate (filtra per imagine-public.x.ai)
osascript -e 'tell application "Google Chrome" to execute front window'\''s active tab javascript "Array.from(document.images).filter(i => i.src.includes(\"imagine-public\") && !i.src.includes(\"thumbnail\")).map(i => i.src).join(\"\\n\")"'
```

### Step 3: Scarica con curl
```bash
# Scarica immagine direttamente
curl -o "nome-file.jpg" "URL_IMMAGINE"
```

### Script Completo
```bash
#!/bin/bash
# grok-download.sh - Scarica immagini generate da Grok

SAVE_PATH="${1:-~/Downloads}"
FILENAME="${2:-grok-image}"

# Ottieni URL immagini dalla pagina corrente
URLS=$(osascript -e 'tell application "Google Chrome" to execute front window'\''s active tab javascript "Array.from(document.images).filter(i => i.src.includes(\"imagine-public\") && !i.src.includes(\"thumbnail\") && !i.src.includes(\"width=500\")).map(i => i.src).join(\"\\n\")"')

# Scarica ogni immagine
COUNT=1
echo "$URLS" | while read -r URL; do
    if [ -n "$URL" ]; then
        OUTPUT="${SAVE_PATH}/${FILENAME}-${COUNT}.jpg"
        echo "Downloading: $OUTPUT"
        curl -s -o "$OUTPUT" "$URL"
        ((COUNT++))
    fi
done

echo "Done!"
```

---

## Metodo AppleScript (DEPRECATO ⚠️)

> **NOTA:** Questo metodo ha problemi con le coordinate - spesso salva immagini sbagliate dal feed invece delle generate.

### Requisiti
- cliclick installato (`brew install cliclick`)

### Problema Noto
Le coordinate click dipendono da:
- Dimensione finestra Chrome
- Presenza/assenza sidebar Grok
- Posizione scroll della pagina

Le immagini generate appaiono nell'area risposta, ma il feed laterale mostra altre immagini che vengono clickate per errore.

---

## Prompt Template (Beatrix Potter Style)

```
Watercolor children's book illustration, Beatrix Potter style, 
warm earthy palette (terracotta, olive green, warm gold, soft blue).

[SCENA]: [descrizione]
[PERSONAGGIO]: [nome], [età], [descrizione fisica], [azione]
[AMBIENTE]: [setting]
```

### Esempio
```
Watercolor children's book, Beatrix Potter style. 
Young Roman boy Marcus, 8 years old, curly brown hair, 
wrestling playfully with his teacher in a sunny villa courtyard 
with cypress trees and a marble fountain.
```

---

## Note Importanti

1. **NO "Italian Renaissance"** - solo Beatrix Potter watercolor
2. **Usa metodo JS** - più affidabile delle coordinate
3. URL pattern: `https://imagine-public.x.ai/imagine-public/images/{uuid}.jpg`
4. Grok genera anche VIDEO (URL: `.../share-videos/{uuid}.mp4`)
5. Aspettare 20-30 sec per generazione completa

---
*Aggiornato: 2026-02-16 - Bubble Bot 🫧*
