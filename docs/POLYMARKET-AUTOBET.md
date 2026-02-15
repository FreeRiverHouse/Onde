# POLYMARKET AUTOBET - Documentazione Completa

## ⚡ Overview

Sistema di betting automatico su Polymarket via iPhone Mirroring.
Bankroll: $58.83 | Target: micro-bet ($1-5) per massimizzare volume dati.

## 🎯 Strategia

### Edge Detection
1. Scaricare odds da PM (API o screen scraping via phone mirror)
2. Calcolare probabilità reale usando:
   - Record stagionale (win/loss ratio)
   - Elo rating / power ranking
   - Home/Away advantage
   - Recent form (ultime 10 partite)
3. Confrontare prob reale vs odds PM
4. Bet solo se edge > 10% (Kelly criterion con fraction 0.25)

### Sport Disponibili
| Sport | Dove | Orari disponibili (PST) |
|-------|------|------------------------|
| NBA | App iOS | Serate (16:00-22:00) |
| NHL | App iOS | Serate (16:00-22:00) |
| CBB | App iOS | Tutto il giorno (09:00-22:00) |
| UFC | App iOS | Sabato sera |
| La Liga | Website | Mattina (06:00-12:00) |
| Serie A | Website | Mattina (06:00-12:00) |
| Bundesliga | Website | Mattina (06:00-12:00) |
| LoL/CS2/Valorant | Website | 24/7 (esports Asia/EU) |
| Cricket | Website | Notte/mattina |
| Tennis | Website | 24/7 |

**⚠️ L'app iOS NON mostra esports. Sono solo sul website.**

## 📱 Phone Mirror Setup

### Prerequisiti
- iPhone Mirroring attivo su Mac
- Polymarket app aperta su iPhone
- `cliclick` installato (`brew install cliclick`)

### Script Navigator
```bash
# Tutti i comandi disponibili
python3 scripts/polymarket-navigator.py --help

# Screenshot
python3 scripts/polymarket-navigator.py screenshot

# Navigazione tab
python3 scripts/polymarket-navigator.py nba
python3 scripts/polymarket-navigator.py cbb
python3 scripts/polymarket-navigator.py today

# Scroll
python3 scripts/polymarket-navigator.py scroll down -n 5
python3 scripts/polymarket-navigator.py scroll up -n 3

# Puntare (game N, left=underdog, right=favorite)
python3 scripts/polymarket-navigator.py bet left -g 2  # underdog game 2

# Back
python3 scripts/polymarket-navigator.py back
```

### Coordinate Mapping (window at 252,71)
- Back button: `cliclick c:287,169`
- Tab bar Y: ~280 absolute
- Scroll: CGEvent scroll wheel (vedi polymarket-navigator.py)
- **cliclick** funziona meglio di CGEvent per click singoli

## 🔌 API Access

### Polymarket Gamma API
```bash
# Lista eventi sport attivi
curl "https://gamma-api.polymarket.com/events?active=true&closed=false&tag=sports&limit=50"

# Mercati live (website, include esports)
curl "https://polymarket.com/sports/live"  # scrape HTML

# Odds singolo mercato (serve condition_id o CLOB token)
curl "https://clob.polymarket.com/book?token_id=<TOKEN_ID>"
```

### Kalshi API
```bash
# Mercati aperti
curl "https://api.elections.kalshi.com/trade-api/v2/markets?status=open&limit=50"

# Eventi sport
curl "https://api.elections.kalshi.com/trade-api/v2/events?status=open&series_ticker=KXCBB&with_nested_markets=true"
```

## 📊 Risultati

### Performance
- **$8 profit** in poche ore con micro-bet (prima sessione)
- Win rate: TBD (in fase raccolta dati)
- Bankroll: $50 → $58.83 (+17.7%)

### Lezioni Apprese
1. **Scroll wheel** funziona per navigare PM su iPhone Mirror
2. **cliclick** è più affidabile di CGEvent per click
3. Tab bar richiede coordinate precise — facile finire nelle game card
4. Esports hanno mercati 24/7 ma solo su website
5. Kalshi ha solo combo markets con zero liquidità di notte

## 🔄 Workflow Automatico (target)

```
1. Sub-agent riceve lista giochi disponibili
2. Per ogni gioco: calcola edge
3. Se edge > 10%: naviga su PM, piazza bet
4. Screenshot conferma
5. Log risultato in data/trading/pm-bets.jsonl
6. Report a Mattia ogni ora
```

## 📁 File Correlati
- `scripts/polymarket-navigator.py` — CLI navigazione phone mirror
- `scripts/polymarket-sports.py` — Analisi odds/edge
- `scripts/iphone-click.py` — Click base (legacy, usa navigator)
- `memory/polymarket-opportunities.md` — Analisi mercati
- `data/trading/pm-bets.jsonl` — Log bet (da creare)

---

*Ultimo aggiornamento: 2026-02-15 00:20 PST*
