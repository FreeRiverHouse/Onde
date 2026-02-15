# iPhone Mirroring - Documentazione Completa

> Aggiornato: 2026-02-15 15:10 PST

## 📋 Overview

iPhone Mirroring permette di controllare l'iPhone da macOS tramite una finestra desktop. L'agente può interagire con l'iPhone programmaticamente usando `cliclick` per click e `CGEvent` per scroll.

**Use case principale:** Polymarket app (⚠️ MAI usare browser per Polymarket!)

## 🔧 Setup Prerequisiti

### 1. Permessi Accessibility
`cliclick` richiede permessi Accessibility in System Settings:
- **System Settings → Privacy & Security → Accessibility**
- Aggiungere **Terminal** (che eredita permessi a node/launchd)
- Verificare: `cliclick p` (non deve dare WARNING)

### 2. iPhone Mirroring Connesso
```bash
./scripts/check-iphone-mirror.sh
# Output: CONNECTED | DISCONNECTED | NOT_RUNNING
```

### 3. Window Info
```bash
osascript -e 'tell application "System Events" to tell process "iPhone Mirroring" to get {position, size} of window 1'
# Tipico: 879, 34, 348, 766
```

## 📐 Sistema di Coordinate

### Struttura
- **Window origin:** `(wx, wy)` — posizione della finestra (es. 879, 34)
- **Window size:** `(width, height)` — dimensioni (es. 348, 766 punti)
- **Screenshot:** 2x Retina → 696×1532 pixel
- **Conversione pixel→punti:** `pixel / 2`

### Formula Coordinate
```
punto_assoluto_x = window_x + (pixel_x / 2)
punto_assoluto_y = window_y + (pixel_y / 2)
```

### Esempio
Bottone "1" nel numpad Polymarket:
- Pixel nell'immagine: x=120, y=960
- Punti relativi: x=60, y=480
- Assoluti: x=879+60=939, y=34+480=514

## ✅ Operazioni Funzionanti

### 1. Click (cliclick)
```bash
cliclick c:X,Y
```
- **Stato:** ✅ FUNZIONANTE
- **Tool:** `cliclick` (Homebrew)
- **Note:** Coordinate in punti macOS assoluti

### 2. Scroll (CGEvent pixel scroll)
```python
import Quartz, time

x, y = 1053, 500  # Coordinate assolute dove scrollare

# Scroll DOWN (valori negativi)
for i in range(10):
    ev = Quartz.CGEventCreateScrollWheelEvent(
        None, Quartz.kCGScrollEventUnitPixel, 1, -30)
    Quartz.CGEventSetLocation(ev, Quartz.CGPointMake(x, y))
    Quartz.CGEventPost(Quartz.kCGHIDEventTap, ev)
    time.sleep(0.03)

# Scroll UP (valori positivi)
for i in range(10):
    ev = Quartz.CGEventCreateScrollWheelEvent(
        None, Quartz.kCGScrollEventUnitPixel, 1, 30)
    Quartz.CGEventSetLocation(ev, Quartz.CGPointMake(x, y))
    Quartz.CGEventPost(Quartz.kCGHIDEventTap, ev)
    time.sleep(0.03)
```
- **Stato:** ✅ FUNZIONANTE
- **Tool:** Python + Quartz (CGEvent)
- **IMPORTANTE:** Usare `kCGScrollEventUnitPixel` (NON `kCGScrollEventUnitLine`)
- **Parametri:** -30 per step, 10 steps = uno scroll decente
- **Note:** `kCGScrollEventUnitLine` NON funziona su iPhone Mirroring

### 3. Screenshot
```bash
/usr/sbin/screencapture -R "879,34,348,766" /tmp/screenshot.png
```
- **Stato:** ✅ FUNZIONANTE
- **Tool:** `/usr/sbin/screencapture` (path completo!)
- **Note:** `-R "x,y,w,h"` per catturare solo la regione della finestra

### 4. Move Mouse
```bash
cliclick m:X,Y
```
- **Stato:** ✅ FUNZIONANTE

### 5. Get Mouse Position
```bash
cliclick p
```
- **Stato:** ✅ FUNZIONANTE

## ❌ Operazioni NON Funzionanti

### Scroll con kCGScrollEventUnitLine
- **NON funziona** su iPhone Mirroring
- iPhone Mirroring ignora scroll wheel line-based
- Usare sempre `kCGScrollEventUnitPixel`

### Drag (cliclick dd/du)
- **NON funziona** per scrollare
- iPhone Mirroring non interpreta CGEvent drag come swipe
- Il drag NON simula un touch drag sull'iPhone

### CGEvent Mouse Drag (Python)
- **NON funziona** per scrollare
- Anche con step interpolati, iPhone Mirroring non lo interpreta come swipe

## 🎮 Swipe-to-Buy (Polymarket)

Per la conferma "Swipe to buy" su Polymarket, usare **pixel scroll** sul bottone:

```python
import Quartz, time

# Coordinate del bottone "Swipe to buy" (bottom of screen)
# Aggiustare in base alla posizione della finestra
swipe_x = 1053  # centro orizzontale della finestra
swipe_y = 754   # bottom area (circa 94% della finestra)

# Swipe up = scroll con valori negativi
for i in range(15):
    ev = Quartz.CGEventCreateScrollWheelEvent(
        None, Quartz.kCGScrollEventUnitPixel, 1, -50)
    Quartz.CGEventSetLocation(ev, Quartz.CGPointMake(swipe_x, swipe_y))
    Quartz.CGEventPost(Quartz.kCGHIDEventTap, ev)
    time.sleep(0.02)
```

## 🔄 Workflow Trading Completo

### 1. Verifica connessione
```bash
./scripts/check-iphone-mirror.sh  # → CONNECTED
```

### 2. Screenshot stato attuale
```bash
/usr/sbin/screencapture -R "879,34,348,766" /tmp/iphone-state.png
```

### 3. Naviga al mercato
- Click su categoria (Today, NBA, etc.)
- Scroll per trovare il mercato
- Click sul mercato specifico

### 4. Piazza ordine
- Click su bottone "TEAM XX¢" (Pick a side)
- Inserisci importo con numpad
- Scroll/swipe per confermare "Swipe to buy"

### 5. Verifica ordine
- Screenshot per conferma

## 🐛 Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| `cliclick` dà WARNING Accessibility | Aggiungere Terminal in System Settings → Accessibility |
| `screencapture` not found | Usare `/usr/sbin/screencapture` (path completo) |
| Click non registra | Ricalcolare coordinate: `pixel_img / 2 + window_origin` |
| Scroll non funziona | Usare `kCGScrollEventUnitPixel`, NON `kCGScrollEventUnitLine` |
| Drag non scrolla | Normale — usare pixel scroll al suo posto |
| iPhone Mirroring DISCONNECTED | L'iPhone deve essere bloccato e vicino al Mac |

## 📁 Script Helper

### check-iphone-mirror.sh
```bash
./scripts/check-iphone-mirror.sh
```

### Coordinate dinamiche
```bash
# Ottieni posizione/dimensioni attuali della finestra
osascript -e 'tell application "System Events" to tell process "iPhone Mirroring" to get {position, size} of window 1'
```

---

*Testato e verificato: 2026-02-15 su M1 Pro, macOS 15.x*
