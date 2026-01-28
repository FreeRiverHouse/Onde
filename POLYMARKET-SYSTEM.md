# 🎰 Polymarket Autonomous Trading System

Sistema multi-agente per trading automatico su Polymarket.

## 🏗️ Architettura

```
┌──────────────────────────────────────────────────────────────────┐
│                        MAIN AGENT (Tu)                           │
│  - Coordina tutto                                                │
│  - Approva trade rischiosi                                       │
│  - Monitora performance                                          │
└──────────────────────────────────────────────────────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ SCANNER      │    │ ANALYZER     │    │ EXECUTOR     │
│ Agent        │    │ Agent        │    │ (Main)       │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ • Scan mercati│    │ • Valuta edge│    │ • iPhone     │
│ • News search │    │ • Kelly size │    │   Mirroring  │
│ • Find opps   │    │ • Risk check │    │ • Place bets │
└──────────────┘    └──────────────┘    └──────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                    SHARED STATE (Files)                          │
│  memory/polymarket-opportunities.md                              │
│  memory/polymarket-positions.json                                │
│  memory/polymarket-history.json                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 🤖 Agenti

### 1. Market Scanner Agent
**Trigger:** Ogni 15 minuti via heartbeat o manuale
**Task:**
```
Scansiona Polymarket per opportunità:
1. Sport live (NBA, NHL, CBB, NFL)
2. Mercati con alta liquidità
3. News recenti non ancora prezzate
4. Arbitrage cross-market

Output: memory/polymarket-opportunities.md
```

### 2. Analyzer Agent  
**Trigger:** Quando scanner trova opportunità
**Task:**
```
Per ogni opportunità:
1. Stima probabilità reale (usa web search, stats, news)
2. Calcola edge: P(AI) - P(Market)
3. Se edge > 10%: calcola Kelly fraction
4. Risk check: max 4% bankroll, max 3 posizioni correlate

Output: Aggiungi "APPROVED" o "REJECTED" a opportunities.md
```

### 3. Position Monitor Agent
**Trigger:** Ogni 5 minuti quando ci sono posizioni aperte
**Task:**
```
Per ogni posizione:
1. Check current odds vs entry odds
2. Se profit > 50% del potenziale: suggerisci cash out
3. Se loss > 30%: alert
4. Aggiorna positions.json

Output: Alert se azione necessaria
```

## 📋 Procedure

### Spawn Scanner
```
sessions_spawn:
  task: "Scansiona mercati Polymarket. Trova 5+ opportunità con edge >10%. 
         Scrivi in memory/polymarket-opportunities.md.
         Focus: NBA, NHL, CBB live. Cerca mispricing."
  label: market-scanner
```

### Spawn Analyzer
```
sessions_spawn:
  task: "Leggi memory/polymarket-opportunities.md.
         Per ogni opportunità, valuta:
         1. Probabilità reale (cerca stats, news)
         2. Edge = P(stimata) - P(mercato)
         3. Kelly: (b*p - q) / b dove b=payout, p=prob, q=1-p
         Aggiungi APPROVED (edge>10%) o REJECTED con reasoning."
  label: market-analyzer
```

### Execute Trade (Main Agent)
```python
# 1. Screenshot
/usr/sbin/screencapture -x -R500,200,393,852 /tmp/pm.png

# 2. Leggi e decidi
# 3. Click su match → team → importo → swipe

# 4. Log trade
# Aggiorna positions.json
```

## 🎯 Regole di Trading

### Entry Rules
- [ ] Edge > 10% (P_stimata - P_mercato)
- [ ] Liquidità > $1000
- [ ] Max 3 posizioni correlate (stesso sport/evento)
- [ ] Max 4% bankroll per trade ($2 su $50)
- [ ] Non tradare ultimi 2 minuti (slippage alto)

### Exit Rules
- [ ] Cash out se profit > 50% del potenziale
- [ ] Cash out se match sta andando male e loss > 30%
- [ ] MAI average down su posizioni perdenti

### Risk Management
- Max daily loss: 15% ($7.50)
- Max positions: 5 contemporanee
- Max correlation: 60% portfolio su stesso sport
- Stop trading se 3 loss consecutive

## 📊 Metriche da Trackare

| Metrica | Target | Formula |
|---------|--------|---------|
| Win Rate | >55% | wins / total |
| ROI | >5%/week | profit / capital |
| Avg Edge | >12% | avg(P_est - P_mkt) |
| Sharpe | >1.5 | (ret - rf) / std |
| Max DD | <20% | max peak-to-trough |

## 🔄 Ciclo Operativo

### Morning (9am)
1. Check overnight results
2. Update positions.json
3. Scan mercati del giorno
4. Plan trades

### During Day (ogni 30 min)
1. Heartbeat check posizioni
2. Spawn scanner se mercati live interessanti
3. Execute approved trades

### Evening (10pm)
1. Close day summary
2. Update memory/YYYY-MM-DD.md
3. Review performance

## 📁 File Structure

```
memory/
├── polymarket-opportunities.md   # Opportunità trovate
├── polymarket-positions.json     # Posizioni aperte
├── polymarket-history.json       # Storico completo
├── grok-predictionarena-research.md  # Research
└── YYYY-MM-DD.md                 # Daily logs

~/.clawdbot/skills/polymarket-trader/
└── SKILL.md                      # Execution procedures
```

## 🚀 Quick Start

```bash
# 1. Spawn scanner
sessions_spawn task="Scan Polymarket opportunities" label="scanner"

# 2. Monitor bet
/usr/sbin/screencapture -x -R500,200,393,852 /tmp/pm.png

# 3. Execute (se approved)
cliclick c:674,600  # click match
cliclick c:595,893  # click team
cliclick c:560,685  # click $1
# scroll up per confirm
```

## ⚠️ Importante

1. **Non tradare senza edge** - Mai bet per noia
2. **Rispetta i limiti** - Max loss giornaliero è sacro
3. **Log tutto** - Ogni trade deve essere documentato
4. **Review settimanale** - Analizza cosa funziona e cosa no
