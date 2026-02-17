# 🎨 Procedura Generazione Immagini con Grok

## Automazione con AppleScript + cliclick

### Requisiti
- macOS con cliclick installato (`brew install cliclick`)
- Chrome aperto e loggato su grok.com
- Cartella destinazione creata

### Script Automazione

```bash
#!/bin/bash
# grok-generate.sh - Genera e salva immagine da Grok

PROMPT="$1"
FILENAME="$2"
SAVE_PATH="${3:-~/Downloads}"

# 1. Copia prompt in clipboard
echo "$PROMPT" | pbcopy

# 2. Click su input area e paste
osascript << 'APPLESCRIPT'
tell application "Google Chrome" to activate
tell application "System Events"
    tell process "Google Chrome"
        set theWindow to front window
        set {winX, winY} to position of theWindow
        set {winW, winH} to size of theWindow
        
        # Click input area (bottom center)
        set clickX to winX + (winW / 2)
        set clickY to winY + winH - 120
        do shell script "cliclick c:" & (clickX as integer) & "," & (clickY as integer)
        delay 0.5
        
        keystroke "v" using command down
        delay 0.3
        keystroke return
    end tell
end tell
APPLESCRIPT

# 3. Aspetta generazione (15-20 sec)
sleep 18

# 4. Scroll up e right-click su immagine
osascript << 'APPLESCRIPT'
tell application "Google Chrome" to activate
tell application "System Events"
    key code 126 using command down
    delay 0.5
    
    tell process "Google Chrome"
        set theWindow to front window
        set {winX, winY} to position of theWindow
        set {winW, winH} to size of theWindow
        
        # Right-click su area immagine (center-left)
        set imgX to winX + (winW / 2) - 150
        set imgY to winY + 380
        do shell script "cliclick rc:" & (imgX as integer) & "," & (imgY as integer)
    end tell
end tell
APPLESCRIPT

sleep 0.5

# 5. Seleziona "Salva immagine" (tasto S)
osascript -e 'tell application "System Events" to keystroke "s"'
sleep 0.2
osascript -e 'tell application "System Events" to keystroke return'
sleep 0.5

# 6. Naviga a cartella e salva
osascript << APPLESCRIPT
tell application "System Events"
    keystroke "$FILENAME"
    delay 0.3
    keystroke "g" using {command down, shift down}
    delay 0.5
    keystroke "$SAVE_PATH"
    delay 0.3
    keystroke return
    delay 0.5
    keystroke return
end tell
APPLESCRIPT

echo "Salvato: $SAVE_PATH/$FILENAME"
```

### Prompt Template (Beatrix Potter Style)

```
Watercolor children's book illustration, Beatrix Potter style, 
warm earthy palette (terracotta, olive green, warm gold, soft blue).

[SCENA]: [descrizione]
[PERSONAGGIO]: [nome], [età], [descrizione fisica], [azione]
[AMBIENTE]: [setting]
```

### Note Importanti

1. **NO "Italian Renaissance"** - solo Beatrix Potter watercolor
2. **cliclick** è essenziale per click precisi
3. Le coordinate dipendono dalla dimensione finestra
4. File salvati come "videoframe_*.png" vanno rinominati
5. Aspettare 18+ secondi per generazione

---
*Procedura testata e funzionante - Bubble Bot 🫧 - 2026-02-16*
