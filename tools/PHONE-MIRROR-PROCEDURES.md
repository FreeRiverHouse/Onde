# 📱 PHONE MIRROR PROCEDURES - iPhone Mirroring

## ⛔ REGOLA ASSOLUTA
**POLYMARKET = SOLO PHONE MIRROR, MAI BROWSER!**

---

## 🔍 COS'È iPhone Mirroring

- **È un'app Apple** che gira sul Mac: `/System/Applications/iPhone Mirroring.app`
- **NON è un nodo Clawdbot**, NON è un device separato
- Permette di controllare l'iPhone dal Mac (click, scroll, screenshot)
- PID verificabile con: `pgrep -fl "iPhone Mirroring"`

## ✅ CHECKLIST PRE-OPERAZIONE

```bash
# 1. iPhone Mirroring è aperto?
pgrep -fl "iPhone Mirroring"
# Se NON gira → chiedere a Mattia di aprirlo (non possiamo lanciarlo noi)

# 2. Finestra visibile?
osascript -e 'tell app "iPhone Mirroring" to get bounds of front window' 2>/dev/null
# Se errore → la finestra potrebbe essere minimizzata

# 3. Screenshot funziona?
python3 scripts/polymarket-navigator.py screenshot
# Verifica che l'immagine mostri il contenuto dell'iPhone
```

## 📱 COME INTERAGIRE CON L'iPHONE

### Screenshot
```bash
python3 scripts/polymarket-navigator.py screenshot
# Output: /tmp/pm_screenshot_*.png
```

### Click su coordinate
```bash
# cliclick per click singoli (coordinate ASSOLUTE dello schermo)
cliclick c:X,Y

# Esempio: back button (quando window è a 252,71)
cliclick c:287,169
```

### Scroll (IMPORTANTE per conferma bet!)
```bash
# Scroll down (navigazione lista)
python3 scripts/polymarket-navigator.py scroll down -n 5

# Scroll up (CONFERMA BET - "swipe to confirm")
python3 scripts/polymarket-navigator.py scroll up -n 3
```

**⚠️ Per confermare una bet usare SCROLL UP, NON swipe/drag!**

### Navigazione tab
```bash
python3 scripts/polymarket-navigator.py today
python3 scripts/polymarket-navigator.py nba
python3 scripts/polymarket-navigator.py cbb
python3 scripts/polymarket-navigator.py nhl
```

### Piazzare una bet
```bash
# Seleziona game e lato (left=underdog, right=favorite)
python3 scripts/polymarket-navigator.py bet left -g 2   # underdog del game 2
python3 scripts/polymarket-navigator.py bet right -g 1  # favorite del game 1

# Dopo aver selezionato → scroll up per confermare
python3 scripts/polymarket-navigator.py scroll up -n 3
```

## 🎯 ALGORITMO BETTING (Log5 + Kelly)

File: `scripts/polymarket-sports.py`

### Come funziona
1. **Scarica odds** da PM API (Gamma API) o da screenshot
2. **Calcola probabilità reale** con modello Log5:
   - Record stagionale (win/loss)
   - Home/away advantage
   - Recent form
3. **Confronta** prob reale vs odds mercato
4. **Bet solo se edge > 10%** (Kelly criterion, fraction 0.25)
5. **Bet size**: micro ($1-5), MAI più del 10% bankroll

### Kelly Sizing
```
edge = (prob_reale - prob_mercato) / prob_mercato
kelly_fraction = edge / (1 - prob_mercato)
bet_size = bankroll * kelly_fraction * 0.25  # quarter Kelly = conservativo
```

## 📊 MERCATI DISPONIBILI (App iOS)

| Sport | Orari (PST) | Note |
|-------|-------------|------|
| NBA | 16:00-22:00 | Serate |
| NHL | 16:00-22:00 | Serate |
| CBB | 09:00-22:00 | Tutto il giorno |
| UFC | Sabato sera | Solo live events |

**⚠️ Esports/Soccer/Cricket = SOLO website (non app iOS)**

## 🔧 TROUBLESHOOTING

| Problema | Soluzione |
|----------|-----------|
| "iPhone Mirroring non gira" | `pgrep -fl "iPhone Mirroring"` — se vuoto, chiedere a Mattia |
| "Screenshot nero/vuoto" | iPhone potrebbe essere bloccato — chiedere a Mattia |
| "Click non funziona" | Verificare coordinate window con `osascript` |
| "Scroll non conferma bet" | Usare `scroll up -n 3` (non 1) |
| "Non trovo la finestra" | È un'app Mac, non un nodo — `pgrep` non `nodes list` |
| "Confondo con nodo Clawdbot" | **NON È UN NODO!** È /System/Applications/iPhone Mirroring.app |

## 📝 STORICO
- **$50 → $38 → $58**: L'algoritmo FUNZIONA, va solo usato
- **Scroll up = conferma bet**: Documentato e verificato
- **cliclick > CGEvent** per click singoli (CGEvent ha offset issues)

---

*Creato: 2026-02-15 08:30 PST*
*MAI DIMENTICARE: iPhone Mirroring = app Apple sul Mac, NON un nodo!*
