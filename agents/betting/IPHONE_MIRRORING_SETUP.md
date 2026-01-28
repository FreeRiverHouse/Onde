# iPhone Mirroring Setup per Polymarket Betting

## ⚠️ PROBLEMA ATTUALE
cliclick non riesce a interagire con i pulsanti in iPhone Mirroring.
I click vengono registrati ma non attivano i tap sul phone.

## Configurazione Finestra (FISSA)
```bash
# Attiva e posiziona finestra
osascript -e 'tell application "iPhone Mirroring" to activate'
osascript -e 'tell application "System Events" to tell process "iPhone Mirroring" to set position of window 1 to {50, 50}'

# Verifica posizione
osascript -e 'tell application "System Events" to tell process "iPhone Mirroring" to get {position, size} of window 1'
# Output: 50, 50, 348, 766
```

## Coordinate Finestra
- **Posizione**: x:50, y:50
- **Size**: 348 x 766 points
- **Bounds**: x:50-398, y:50-816

## Layout Polymarket (stimato)
All'interno della finestra (offset da 50,50):
- Header iOS status bar: y:0-30
- Header Polymarket "Live": y:30-80
- Contenuto match: y:80-350
- "Pick a side" label: y:350-370
- **Pulsanti NWST/SFA**: y:370-420
  - NWST (sinistra): x:10-140
  - SFA (destra): x:150-280

## Coordinate ABSOLUTE (finestra a 50,50)
- **NWST button center**: ~(125, 445)
- **SFA button center**: ~(215, 445)

## Problema
cliclick c:215,445 non attiva il tap nel phone.
Possibili cause:
1. iPhone Mirroring richiede input diverso (non mouse click)
2. Coordinate sbagliate (scala retina?)
3. Serve focus specifico sulla finestra

## Tentativi Falliti
1. ❌ cliclick c:X,Y - non attiva tap
2. ❌ cliclick dc:X,Y (double click) - non funziona
3. ❌ AppleScript "click at {X,Y}" - restituisce elemento ma non clicka
4. ❌ PyAutoGUI - non installato

## TODO - Soluzioni da provare
1. [ ] Installare PyAutoGUI: `pip3 install pyautogui`
2. [ ] Verificare permessi Accessibility in System Preferences
3. [ ] Provare Keyboard Maestro o Automator
4. [ ] Usare cliclick con -r (restore mouse position)
5. [ ] Provare mouse move + click separati
6. [ ] Verificare se serve "Allow app to control computer" per Terminal/Claude

## Note Tecniche
iPhone Mirroring potrebbe usare un layer di rendering speciale (Metal/OpenGL)
che non risponde ai normali click events del window system.
Potrebbe essere necessario un tool di automazione specifico per iOS mirroring.

## Screenshot Path
Screenshots salvati in /tmp/phone_*.png per debug
