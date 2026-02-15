# ⚡ POLYMARKET GOLDEN CONFIG

**Unica fonte di verità per il trading Polymarket. LEGGI QUESTO E BASTA.**

---

## ⛔ REGOLA ASSOLUTA

```
POLYMARKET = SOLO PHONE MIRROR APP
MAI BROWSER. MAI API (geo-blocked USA). MAI ALTRE STRADE.
```

---

## 📱 1. SETUP PHONE MIRROR

### Attivare iPhone Mirroring
```bash
# 1. Apri iPhone Mirroring
osascript -e 'tell application "iPhone Mirroring" to activate'

# 2. Pinnalo in posizione fissa (0, 25) — coordinate calibrate su questa posizione
# (fatto automaticamente da polymarket-navigator.py)

# 3. Verifica che sia attivo
pgrep -f "iPhone Mirroring" || echo "NON ATTIVO!"
```

### Prevenire sleep/lock
```bash
# Caffeinate: impedisce display sleep
caffeinate -d -i -s &

# Verifica
pgrep caffeinate && echo "OK"
```

### Dove si trova la finestra
- **Posizione fissa**: x=0, y=25 (sotto menu bar macOS)
- **Size**: ~348 x 766 punti logici
- **Title bar**: 28px — le coordinate phone partono sotto
- Il phone mirror è sulla **SINISTRA** dello schermo Mac

---

## 🎮 2. NAVIGAZIONE (polymarket-navigator.py)

Script principale: `scripts/polymarket-navigator.py`

### Comandi
```bash
# Screenshot
python3 scripts/polymarket-navigator.py screenshot

# Navigazione tab sport
python3 scripts/polymarket-navigator.py nba
python3 scripts/polymarket-navigator.py nhl
python3 scripts/polymarket-navigator.py cbb
python3 scripts/polymarket-navigator.py ufc
python3 scripts/polymarket-navigator.py politics
python3 scripts/polymarket-navigator.py today

# Scroll (per navigare lista partite)
python3 scripts/polymarket-navigator.py scroll down -n 5
python3 scripts/polymarket-navigator.py scroll up -n 3

# Click su un match / bet button
python3 scripts/polymarket-navigator.py bet left -g 1   # underdog game 1
python3 scripts/polymarket-navigator.py bet right -g 2  # favorite game 2

# Swipe (per confirm bet = SCROLL UP!)
python3 scripts/polymarket-navigator.py swipe up --distance long

# Back
python3 scripts/polymarket-navigator.py back

# Info (mostra coordinate e stato finestra)
python3 scripts/polymarket-navigator.py info
```

### Coordinate UI (phone-relative, posizione fissa 0,25)

| Elemento | X | Y | Note |
|----------|---|---|------|
| Back button | 20 | 48 | iOS back chevron |
| Today tab | 64 | 89 | Prima tab |
| NBA tab | 100 | 89 | |
| NHL tab | 132 | 89 | |
| CBB tab | 165 | 89 | |
| UFC tab | 197 | 89 | |
| Politics tab | 231 | 89 | |
| Bet left game 1 | 106 | 184 | Underdog/Team A |
| Bet right game 1 | 219 | 184 | Favorite/Team B |
| Bet left game 2 | 106 | 328 | +144px per game |
| Bet right game 2 | 219 | 328 | |
| Scroll center | 174 | 400 | Punto scroll |
| Home button | 123 | 611 | Bottom nav |
| Search button | 212 | 611 | Bottom nav |
| Deposit button | 265 | 55 | Top-right |

### Formula coordinate per game N
```
Y = 184 + (N-1) * 144
X = 106 (left/underdog) | 219 (right/favorite)
```

---

## 🎯 3. PROCEDURA PIAZZARE BET

### Step-by-step
```
1. Screenshot → verifica schermata attuale
2. Naviga al tab sport giusto (nba/nhl/cbb/etc)
3. Scroll per trovare la partita target
4. Screenshot → identifica coordinate del game
5. Click sul bet button (left o right)
6. Screenshot → verifica che si apra la schermata bet
7. (Se serve) Seleziona importo
8. **SCROLL UP per confermare** (= swipe to buy)
9. Screenshot → verifica conferma
10. Log risultato in data/trading/polymarket-bets.jsonl
```

### ⚠️ CONFERMA BET = QUARTZ CGEVENT SWIPE (NON cliclick!)

**IMPORTANTE:** `cliclick` e `polymarket-navigator.py swipe` NON funzionano per il "Swipe to Buy".
Solo Quartz CGEvent a basso livello viene riconosciuto come touch swipe da iPhone Mirroring.

```python
# METODO FUNZIONANTE - Quartz CGEvent drag
import Quartz, time

# Coordinate: centro del bottone "Swipe to buy" (in basso)
# NOTA: aggiusta in base a posizione finestra (usa `info` per coordinate)
start_x, start_y = 529, 770  # Centro bottone swipe (screen coords)
end_x, end_y = 529, 350      # Destinazione (più in alto)

# Move to start
move = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventMouseMoved, (start_x, start_y), Quartz.kCGMouseButtonLeft)
Quartz.CGEventPost(Quartz.kCGHIDEventTap, move)
time.sleep(0.1)

# Mouse down
down = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseDown, (start_x, start_y), Quartz.kCGMouseButtonLeft)
Quartz.CGEventPost(Quartz.kCGHIDEventTap, down)
time.sleep(0.05)

# Smooth drag upward (40 steps, 8ms each = fast swipe)
steps = 40
for i in range(1, steps + 1):
    frac = i / steps
    cur_y = start_y + (end_y - start_y) * frac
    drag = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseDragged, (start_x, cur_y), Quartz.kCGMouseButtonLeft)
    Quartz.CGEventPost(Quartz.kCGHIDEventTap, drag)
    time.sleep(0.008)

# Mouse up
up = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseUp, (end_x, end_y), Quartz.kCGMouseButtonLeft)
Quartz.CGEventPost(Quartz.kCGHIDEventTap, up)
```

**Perché funziona:** Quartz CGEvent simula a livello HID (hardware input device), 
che iPhone Mirroring traduce correttamente in touch gesture.
cliclick e AppleScript usano API di livello superiore che non vengono mappate come swipe.

**Prima bet confermata con questo metodo:** 2026-02-15, RUTG $9.87 at 71¢ → $14

---

## 🧮 4. ALGORITMO EDGE DETECTION (PolyRoborto)

### Modello: Log5 + Home Advantage + Kelly Sizing

File: `scripts/polymarket-sports.py`

#### Step 1: Stima probabilità reale (Log5 method - Bill James)
```python
# P(A batte B) = (pA - pA*pB) / (pA + pB - 2*pA*pB)
# pA = win% team A, pB = win% team B

def estimate_win_prob(team1_wpct, team2_wpct, team1_home=True):
    p_a = team1_wpct
    p_b = team2_wpct
    base_prob = (p_a - p_a * p_b) / (p_a + p_b - 2 * p_a * p_b)
    
    # Home court advantage: +3.5%
    HOME_ADVANTAGE = 0.035
    if team1_home:
        prob = base_prob + HOME_ADVANTAGE
    else:
        prob = base_prob - HOME_ADVANTAGE
    
    return max(0.05, min(0.95, prob))
```

#### Step 2: Calcola edge
```python
edge = nostra_probabilità - probabilità_mercato
# Edge > 10% → BET
# Edge < 10% → SKIP
```

#### Step 3: Kelly Criterion (position sizing)
```python
def kelly_bet_size(edge, odds_price, bankroll, fraction=0.1):
    """
    edge: nostro edge (es. 0.10 = 10%)
    odds_price: prezzo mercato in centesimi (es. 40 = 40¢)
    bankroll: soldi disponibili
    fraction: Kelly fraction (0.1 = 10% Kelly per sicurezza)
    """
    decimal_odds = 100 / odds_price
    b = decimal_odds - 1
    p = odds_price/100 + edge  # nostra prob stimata
    q = 1 - p
    kelly = (b * p - q) / b if b > 0 else 0
    bet = bankroll * kelly * fraction
    return min(bet, bankroll * 0.10)  # max 10% bankroll
```

#### Step 4: Fonti dati per record/stats
```bash
# NBA/NHL/CBB records: scraping web o API gratuite
# Pinnacle/sharp odds: per confronto con PM prices
# News recenti: per fattori non nei record
```

---

## 📊 5. REGOLE DI TRADING

### Entry Rules
- ✅ Edge > 10% (prob_stimata - prob_mercato)
- ✅ Liquidità > $1000 nel mercato
- ✅ Max 3 posizioni correlate (stesso sport/evento)
- ✅ Max 4% bankroll per singola bet
- ✅ Non tradare ultimi 2 minuti (slippage alto)
- ✅ Micro-bet ($1-5) finché non abbiamo abbastanza dati

### Exit Rules
- ✅ Cash out se profit > 50% del potenziale
- ✅ Cash out se loss > 30%
- ✅ MAI average down

### Risk Management
- Max daily loss: 15% bankroll
- Max posizioni aperte: 5 contemporanee
- Max correlazione: 60% portfolio su stesso sport
- Stop trading se 3 loss consecutive
- **Bet sizing CONSERVATIVO** — andare piano

### Bankroll
- Partenza: $50
- Picco raggiunto: $58.83 (+17.7% ROI)
- Approccio: micro-bet per raccogliere dati
- Obiettivo realistico: $100-200/mese

---

## 🏗️ 6. ARCHITETTURA MULTI-AGENTE

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  SCANNER AGENT   │    │  ANALYZER AGENT  │    │  EXECUTOR (Main) │
│  • Scan mercati  │───▶│  • Valuta edge   │───▶│  • iPhone Mirror │
│  • News search   │    │  • Kelly sizing  │    │  • Piazza bet    │
│  • Find opps     │    │  • Risk check    │    │  • Log risultato │
└──────────────────┘    └──────────────────┘    └──────────────────┘
                                                        │
                                                        ▼
                                              ┌──────────────────┐
                                              │  SHARED STATE    │
                                              │  • positions.json│
                                              │  • opportunities │
                                              │  • bets.jsonl    │
                                              └──────────────────┘
```

### Spawn Scanner
```
sessions_spawn:
  task: "Scansiona Polymarket per sport opportunities. Cerca mispricing NBA/NHL/CBB.
         Scrivi in memory/polymarket-opportunities.md"
  label: market-scanner
```

### Spawn Analyzer
```
sessions_spawn:
  task: "Leggi memory/polymarket-opportunities.md.
         Per ogni opportunity: stima prob reale (Log5), calcola edge, Kelly sizing.
         Marca APPROVED (edge>10%) o REJECTED."
  label: market-analyzer
```

---

## 🖥️ 7. DASHBOARD (onde.surf)

### PolyRoborto Panel
- File: `apps/surfboard/src/components/PolyRobortoPanel.tsx`
- Lib: `apps/surfboard/src/lib/polyroborto.ts`
- Stato: dati simulati — TODO: collegare a positions.json reale

### Push dati a Gist
```bash
python3 scripts/push-stats-to-gist.py --polymarket
```

---

## 📁 8. FILE DI RIFERIMENTO

| File | Cosa contiene |
|------|---------------|
| `POLYMARKET-GOLDEN-CONFIG.md` | **QUESTO FILE** - unica fonte di verità |
| `scripts/polymarket-navigator.py` | CLI navigazione phone mirror |
| `scripts/polymarket-sports.py` | Algo edge detection (Log5 + Kelly) |
| `memory/polymarket-positions.json` | Posizioni aperte |
| `memory/polymarket-opportunities.md` | Analisi mercati |
| `data/trading/polymarket-bets.jsonl` | Log bet piazzate |
| `agents/betting/polymarket-agent.md` | Config agente betting |
| `agents/betting/RULES.md` | Regole assolute |
| `agents/betting/STRATEGY.md` | Strategia dettagliata |
| `agents/betting/ALGO_IMPROVEMENT.md` | Miglioramenti algo |
| `POLYMARKET-SYSTEM.md` | Architettura sistema completo |
| `docs/POLYMARKET-AUTOBET.md` | Documentazione autobet |

---

## ⚠️ 9. LEZIONI APPRESE (NON RIPETERE!)

1. **API Polymarket NON DISPONIBILI in USA** — geo-blocked. MAI suggerire API.
2. **Browser NON FUNZIONA** — MAI usare browser per PM.
3. **Phone Mirror è l'UNICO metodo** — documentato e funzionante.
4. **Scroll up = Swipe to Buy** — conferma bet.
5. **Finestra va pinnata a (0, 25)** — altrimenti coordinate sballano.
6. **TinyGPU.app non c'entra** — iPhone Mirroring ≠ GPU.
7. **iPhone Mirroring ≠ nodo Clawdbot** — è un'app Apple nativa sul Mac.
8. **caffeinate necessario** — previene screen lock.
9. **Micro-bet** — $1-5 per acquisire dati, NON bruciare bankroll.
10. **Algoritmo funziona** — $50 → $58.83, NON cambiare senza motivo.
11. **CERCARE nei file PRIMA di rispondere** — la documentazione esiste già.

---

## 🔄 10. SPORT DISPONIBILI

| Sport | Dove | Orari (PST) |
|-------|------|-------------|
| NBA | App iOS | 16:00-22:00 |
| NHL | App iOS | 16:00-22:00 |
| CBB | App iOS | 09:00-22:00 |
| UFC | App iOS | Sabato sera |
| La Liga | Solo website | 06:00-12:00 |
| Serie A | Solo website | 06:00-12:00 |
| Esports | Solo website | 24/7 |

**⚠️ L'app iOS NON mostra esports — solo sul website.**

---

*Consolidato: 2026-02-15 09:25 PST*
*Da: POLYMARKET-SYSTEM.md, POLYMARKET-AUTOBET.md, polymarket-agent.md, polymarket-navigator.py, polymarket-sports.py, RULES.md, STRATEGY.md, ALGO_IMPROVEMENT.md, memory files*
*MAI MODIFICARE SENZA MOTIVO. QUESTO FILE È LEGGE.*
