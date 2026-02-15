# Polymarket Betting Playbook via iPhone Mirroring

> Aggiornato: 2026-02-15 15:35 PST
> Primo successo: 2026-02-15 — BET MURR confermata ($0.74 cost, 74¢ odds)

## ⛔ REGOLA ASSOLUTA
**MAI usare browser, API, o approcci programmatici per Polymarket.**
**SOLO iPhone Mirroring. Punto. Fine.**

## 🏆 Metodo Funzionante (Testato & Confermato)

### Stack Tecnico
| Componente | Tool | Stato |
|-----------|------|-------|
| Screenshot | `/usr/sbin/screencapture -R` | ✅ |
| Click | `cliclick c:X,Y` | ✅ |
| Scroll | CGEvent `kCGScrollEventUnitPixel` | ✅ |
| Swipe-to-Buy | `python3 scripts/iphone-mirror-actions.py swipe_confirm` | ✅ |
| Keep-alive | `scripts/iphone-keepalive.sh` | ✅ |

### Script Principali
- **`scripts/iphone-mirror-actions.py`** — Helper generico (click, scroll, screenshot, swipe_confirm)
- **`scripts/polymarket-navigator.py`** — Navigazione Polymarket + piazza bet
- **`scripts/polymarket-sports.py`** — Focus su mercati sportivi

## 📋 Workflow Completo: Piazzare una Bet

### Step 0: Pre-check
```bash
# 1. iPhone Mirroring connesso?
./scripts/check-iphone-mirror.sh  # → CONNECTED

# 2. Ottieni coordinate finestra
osascript -e 'tell application "System Events" to tell process "iPhone Mirroring" to get {position, size} of window 1'
# Output tipico: 879, 34, 348, 766

# 3. Screenshot stato attuale
/usr/sbin/screencapture -R "879,34,348,766" /tmp/pm-state.png
```

### Step 1: Naviga al mercato
```bash
# Click sulla categoria (Today, Sports, etc.)
cliclick c:X,Y  # coordinate del tab

# Scroll per trovare il mercato
python3 scripts/iphone-mirror-actions.py scroll_down 5 30

# Click sul mercato specifico
cliclick c:X,Y  # coordinate del mercato
```

### Step 2: Seleziona la posizione
```bash
# Click su "YES" o "NO" o nome del team
cliclick c:X,Y  # coordinate del bottone

# Screenshot per verificare
/usr/sbin/screencapture -R "879,34,348,766" /tmp/pm-pick.png
```

### Step 3: Inserisci importo
```bash
# Click sul campo importo
cliclick c:X,Y

# Digita importo (usa numpad dell'app)
cliclick c:X1,Y1  # cifra 1
cliclick c:X2,Y2  # cifra 2 (es. per $0.50)
```

### Step 4: Conferma con Swipe
```bash
# METODO TESTATO E FUNZIONANTE:
python3 scripts/iphone-mirror-actions.py swipe_confirm
```

### Step 5: Verifica
```bash
# Screenshot per conferma "You bought..."
/usr/sbin/screencapture -R "879,34,348,766" /tmp/pm-confirm.png
```

## 📐 Conversione Coordinate

### Formula
```
punto_x = window_x + (pixel_immagine_x / 2)
punto_y = window_y + (pixel_immagine_y / 2)
```
- Screenshot = 2x Retina (696×1532 pixel per finestra 348×766 punti)
- Dividere SEMPRE per 2 le coordinate pixel dell'immagine

### Esempio
```
Finestra: origin=(879, 34)
Pixel bottone nell'immagine: (400, 1200)
→ Punto assoluto: (879 + 200, 34 + 600) = (1079, 634)
```

## 🎯 Regole di Betting

### Bankroll Management
- **Max bet: 5% del bankroll** (hardcoded)
- Su ~$58 bankroll = **max $2.90 per bet**
- Micro-betting: tante piccole bet, non poche grosse
- Mai superare il cap anche se l'edge sembra enorme

### Edge Detection
- Confrontare odds Polymarket vs propria stima
- Edge minimo: +5% (differenza tra stima e prezzo)
- Preferire mercati sportivi con dati chiari
- Se edge incredibile → max 2x la bet standard, non di più

## ❌ Cosa NON Funziona

| Metodo | Risultato |
|--------|-----------|
| `cliclick dd/du` (drag) | ❌ Non simula swipe |
| CGEvent mouse drag | ❌ iPhone Mirroring lo ignora |
| `kCGScrollEventUnitLine` | ❌ Solo pixel funziona |
| Browser per Polymarket | ⛔ VIETATO |
| API Polymarket | ⛔ VIETATO |

## 🔄 Keep-Alive

L'iPhone si blocca dopo inattività. Per evitarlo:
```bash
# Avvia keep-alive in background
./scripts/iphone-keepalive.sh &
```
Fa movimenti periodici per mantenere la sessione attiva.

## 🐛 Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| "Swipe to buy" non conferma | Usa `swipe_confirm` dallo script helper |
| Click su elemento sbagliato | Ricalcola coordinate con formula pixel/2 + window_origin |
| Schermo bloccato | Mattia deve sbloccare manualmente, poi keep-alive |
| Finestra spostata | Ri-esegui `osascript` per nuove coordinate |
| `cliclick` WARNING | Aggiungere node a Accessibility settings |
| Screenshot nero | Verificare che iPhone Mirroring sia in foreground |

## 📊 Storico Bet

| Data | Mercato | Tipo | Cost | Odds | Risultato |
|------|---------|------|------|------|-----------|
| 2026-02-15 | MURR | BUY YES | $0.74 | 74¢ | ✅ Confermata |

---

*Primo workflow end-to-end completato con successo: 15 Feb 2026*
*Metodo swipe_confirm = golden path per conferma ordini*
