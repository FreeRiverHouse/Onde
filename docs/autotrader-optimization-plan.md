# Kalshi AutoTrader v2 — Paper Trade Analysis & Optimization Plan

> Generated: 2026-02-15
> Data source: `scripts/kalshi-trades-dryrun.jsonl` (27 paper trades)
> Code: `scripts/kalshi-autotrader-v2.py` (~6900 LOC)

---

## 1. Stato Attuale

### Paper Trade Summary

| Metric | Value |
|--------|-------|
| Total trades | 27 |
| Date range | 2026-02-14 22:19 → 23:15 UTC (~56 min) |
| Unique tickers | 7 |
| Result status | **ALL PENDING** — nessun trade è stato verificato vs risultato reale |

### Asset Distribution

| Asset | Count | % |
|-------|-------|---|
| ETH | 17 | 63% |
| BTC | 10 | 37% |

### Side Distribution

| Side | Count | % |
|------|-------|---|
| NO | 15 | 56% |
| YES | 12 | 44% |

### Regime Distribution

| Regime | Count | % |
|--------|-------|---|
| choppy | 23 | 85% |
| sideways | 4 | 15% |
| trending_* | 0 | 0% |

### 🔴 Critical Finding: Zero Outcome Data

**Nessun trade ha un `result_status` diverso da `pending`**. Questo significa che il feedback loop (`update_trade_results()`) non ha mai aggiornato questi paper trades con il risultato reale. Senza outcome data, non possiamo calcolare:

- Win rate effettiva
- Calibrazione del modello probabilistico
- P&L reale
- Sharpe ratio

**Azione immediata**: Implementare retroactive settlement check per i paper trades (vedi Quick Wins).

---

## 2. Analisi del Modello Probabilistico

### Come funziona

Il modello usa un approccio **log-normal (Black-Scholes semplificato)**:

```
P(S_T > K) = N(d2)
d2 = ln(S/K) / σ√T - σ√T/2
```

Dove:
- `S` = prezzo corrente
- `K` = strike price
- `σ` = volatilità oraria × fat-tail multiplier (1.4x)
- `T` = tempo all'expiry in ore

### Volatilità dinamica

Il sistema calcola la realized volatility dagli ultimi 24h di dati OHLC, con:
- Fallback a default hardcoded (BTC: 0.5%/hr, ETH: 0.7%/hr, SOL: 1.2%/hr)
- Clamping tra 30% e 500% del default
- Fat-tail adjustment (`CRYPTO_FAT_TAIL_MULTIPLIER = 1.4`)

### Aggiustamenti alla probabilità base

1. **Momentum adjustment**: ±8% (senza alignment) o ±15% (con alignment)
2. **News sentiment bonus**: tipicamente ±0.63-1.26%
3. **Volatility rebalance bonus**: ±2% se vol ratio favorevole
4. **Divergence bonus**: ±1-2% se RSI diverge dal prezzo
5. **Composite signal scoring**: synergy bonus se 2+ segnali confermano

### Analisi Probabilità dai Paper Trades

| Metric | Min | Max | Avg |
|--------|-----|-----|-----|
| Our prob | 0.30 | 0.95 | 0.81 |
| Market prob | 0.06 | 0.85 | 0.69 |
| Edge | 9.1% | 26.9% | 12.4% |
| Edge + bonus | 9.1% | 28.9% | 13.6% |

**Osservazione critica**: La distribuzione delle nostre probabilità è sbilanciata verso l'alto (media 0.81), il che suggerisce che il modello tende a trovare edge principalmente su:
- **YES bets su strike lontani** (prezzo già sopra lo strike → alta probabilità)
- **NO bets su strike vicini** (prezzo appena sopra → probabilità NO alta)

Questo è un pattern tipico di **overconfidence sui lognormali per brevi periodi**: quando il prezzo è 2% sopra lo strike con 23 ore all'expiry, il modello assegna ~85%+ probabilità, ma in realtà la coda di volatilità crypto è più grassa di quanto il modello catturi anche col fat-tail adjustment.

### ⚠️ Calibrazione: Non Verificabile Senza Outcome

Senza dati di settlement, non possiamo rispondere alla domanda fondamentale: **"Quando il modello dice 85%, il mercato chiude davvero sopra lo strike 85% delle volte?"**

Il fat-tail multiplier a 1.4x è un buon tentativo empirico, ma potrebbe essere sotto/sovra-calibrato.

---

## 3. Edge Analysis

### Distribuzione degli Edge

```
Edge Range       | Count | % of Trades
0.09 - 0.10      |   4   | 15%
0.10 - 0.12      |  13   | 48%
0.12 - 0.15      |   4   | 15%
0.15 - 0.20      |   1   |  4%
0.20 - 0.30      |   5   | 19%
```

**Pattern chiave**:
- La maggior parte dei trades (63%) ha edge tra 9-12% — questo è il range "sweet spot" 
- I 5 trades con edge 20-30% sono tutti su ETH strike T2009.99 e T1969.99 (strike molto lontani, side NO)
- Gli edge altissimi (>20%) sono sospetti — possono indicare mispricing del modello piuttosto che vero edge

### Edge alti vs Edge moderati

Gli edge >20% sono tutti su:
- `KXETHD-26FEB1517-T2009.99` NO @ 11-12¢ (edge ~27%)
- `KXETHD-26FEB1517-T1969.99` NO @ 6¢ (edge ~24%)

Questi sono contratti deep OTM dove:
- Il prezzo di mercato è molto basso (6-12¢)
- Il nostro modello dice "probabilità NO molto alta"
- L'edge apparente è alto, ma il rischio è **tail risk puro** — se il prezzo crolla del 5%+ in 23 ore, perdiamo

**Raccomandazione**: Non fidarsi degli edge >20% senza conferma storica. Considerare un cap sull'edge massimo accettabile (es. 15%).

---

## 4. Timing Analysis

### Distribuzione Temporale

Tutti i 27 trades sono stati eseguiti in un **singolo periodo di 56 minuti** (22:19 - 23:15 UTC del 14 Feb 2026).

Questo non è sufficiente per fare analisi temporali significative. Servono:
- Almeno 7 giorni di paper trading continuo
- Distribuzione su diverse ore del giorno
- Diverse condizioni di mercato (weekend, sessioni US/EU/Asia)

### Minutes to Expiry

| Metric | Value |
|--------|-------|
| Min | 1364 min (~23h) |
| Max | 1420 min (~24h) |
| Avg | 1377 min (~23h) |

Tutti i trades hanno ~23 ore all'expiry. Il sistema non sta trovando opportunità su contratti a breve termine (<4h), probabilmente perché:
1. Il `MIN_TIME_TO_EXPIRY_MINUTES = 45` è ragionevole
2. Ma il momento di scan (tardo sera UTC) fa sì che i contratti a breve siano già chiusi
3. I contratti con 23h hanno prezzi più efficienti → l'edge trovato potrebbe non essere reale

**Raccomandazione**: Prioritizzare contratti con 1-8 ore all'expiry dove il modello ha meno incertezza e le probabilità sono più prevedibili.

---

## 5. Regime Analysis

### Performance per Regime

| Regime | Count | Avg Edge | Avg Price | Caratteristiche |
|--------|-------|----------|-----------|-----------------|
| choppy | 23 | 10.8% | 75.4¢ | dynamic_min_edge: 9% |
| sideways | 4 | 21.3% | 17.0¢ | dynamic_min_edge: 4% |

Il regime `sideways` produce edge apparenti più alti, ma questi sono su contratti OTM con prezzi molto bassi (6-12¢) dove l'edge può essere illusorio.

### Dynamic Edge Thresholds

Il sistema usa edge minimi diversi per regime:
- **trending**: 7% base (ragionevole per segnali puliti)
- **choppy**: 8% (era 15%, ridotto — troppo restrittivo)
- **sideways**: 6% (era 12%, ridotto)
- **DRY_RUN floor**: 3% (per raccogliere dati)

**Problema**: I thresholds sono stati tutti abbassati per generare trades, ma non sappiamo se gli edge più bassi sono realmente profittevoli senza outcome data.

### Regime Detection

Il sistema classifica regimi basandosi su:
- Price change 4h/24h
- Momentum direction/strength/alignment
- Candlestick range (volatility proxy)

Con solo choppy e sideways rilevati, il mercato il 14 Feb era probabilmente range-bound con movimenti oscillanti — condizione tipica per crypto nei weekend.

---

## 6. Cosa Ottimizzare (Priorità)

### 🔴 P0: Settlement Tracking & Feedback Loop (CRITICI)

**Impatto: 10/10 — Senza questo, tutto il resto è inutile**

Il paper trading è inutile se non verifichi mai i risultati. Il file `kalshi-trades-dryrun.jsonl` ha 27 trades tutti `pending`. Il sistema ha `update_trade_results()` ma funziona solo per il file di trade live, non per i paper trades.

**Azione**: Creare uno script che verifichi i paper trades contro i risultati reali di mercato (vedi Step 5).

### 🟡 P1: Calibrazione Probabilità

**Impatto: 8/10 — Il cuore del sistema**

Il fat-tail multiplier (1.4x) è una stima empirica. Per calibrarlo correttamente:

1. Raccogliere almeno 200+ paper trades con outcomes
2. Fare binning delle probabilità predette (es. 70-80%, 80-90%, etc.)
3. Calcolare la frequenza reale di vittoria per ogni bin
4. Se il modello dice 85% e vince il 75% → il fat-tail multiplier è troppo basso
5. Aggiustare iterativamente

**Target**: Diagramma di calibrazione dove la linea del modello è vicina alla diagonale y=x.

### 🟡 P2: Edge Thresholds Dinamici

**Impatto: 7/10**

I thresholds attuali sono stati regolati a mano. Con outcome data:
- Calcolare il win rate per range di edge
- Il threshold minimo dovrebbe essere il punto dove win rate × payout > loss rate × cost
- Thresholds diversi per asset (BTC vs ETH) e regime

### 🟢 P3: Position Sizing

**Impatto: 5/10 — Importa solo dopo che P0-P2 sono a posto**

Il sistema Kelly attuale è molto conservativo (multiplicatori 0.5-0.7x su base Kelly 5-10%). Questo è corretto per un sistema non calibrato, ma con calibrazione:
- Aumentare gradualmente il Kelly fraction
- Il regime multiplier potrebbe essere meno aggressivo (0.5x in choppy è molto conservativo)

### 🟢 P4: Timing delle Scansioni

**Impatto: 4/10**

Con dati temporali sufficienti:
- Identificare le ore con maggiore inefficienza di mercato
- Crypto su Kalshi è probabilmente più inefficiente durante ore US (le odds cambiano più lentamente di notte)
- Correlare win rate con ora del giorno e giorno della settimana

### ⚪ P5: Deduplicazione Trades

**Impatto: 3/10 ma immediato**

13 dei 27 paper trades sono sullo stesso ticker `KXETHD-26FEB1517-T2049.99`. In paper mode il sistema logga lo stesso trade ogni ciclo (~5 min). Questo non è un problema di performance ma rende l'analisi meno informativa.

**Azione**: In paper mode, non ri-loggare un trade se lo stesso ticker/side è già presente nelle ultime N entry.

---

## 7. Piano per Live Trading

### Criteri Oggettivi per il Go-Live

| Criterio | Threshold | Status Attuale | Note |
|----------|-----------|----------------|------|
| Paper trades con outcome | ≥200 | 0/200 ❌ | Nessun outcome verificato |
| Win rate (su 200+ trades) | ≥55% | N/A | Non verificabile |
| Profit factor | ≥1.2 | N/A | wins/losses in $ |
| Max consecutive losses | ≤8 | N/A | Circuit breaker a 5 |
| Max drawdown | ≤15% | N/A | Su capitale paper |
| Calibration error (Brier) | ≤0.08 | N/A | Prob predetta vs reale |
| Stable edge > threshold | ≥60 gg | 0 gg | 60 giorni di paper positivo |
| Diversità assets | ≥3 | 2 (BTC/ETH) | Aggiungere SOL/weather |

### Timeline Realistica

```
Settimana 1-2: Fixare settlement tracking, raccogliere dati
              → Obiettivo: 100+ paper trades con outcomes

Settimana 3-4: Prima analisi di calibrazione
              → Aggiustare fat-tail multiplier
              → Identificare edge ranges profittevoli

Settimana 5-8: Ottimizzazione iterativa
              → Fine-tune thresholds basati su dati
              → Target: 200+ trades con >55% WR

Settimana 9-12: Validazione out-of-sample
              → Paper trading con parametri fissi (no overfitting!)
              → Verificare che il WR si mantiene

Mese 4+: Go live con micro-posizioni
              → Iniziare con $50-100 capitale
              → Kelly fraction ultra-conservativo (2-3%)
              → Scalare solo dopo 100+ trade live profitable
```

### Rischi Principali

1. **Overfitting**: Con 27 trades è facilissimo ottimizzare per il passato. Serve disciplina nel non toccare i parametri dopo la fase di calibrazione.

2. **Regime change**: Il mercato crypto cambia costantemente. Un sistema calibrato su un regime potrebbe fallire in un altro.

3. **Execution risk**: Il paper trading non cattura slippage, fill rates, e latenza reale. In live, il prezzo potrebbe muoversi tra il momento di analisi e l'esecuzione dell'ordine.

4. **Illiquidità**: Mercati Kalshi crypto possono avere spread larghi e volume basso. Il paper trading assume fill istantaneo al prezzo bid/ask.

---

## 8. Analisi Dettagliata dei Trades

### Trades ETH (17 total)

- **T2049.99 YES** (9 trades): Tutti intorno a 76-78¢, edge 10-11%, choppy regime
  - Sono essenzialmente lo STESSO trade ripetuto ogni ~5 min
  - Prezzo ETH stabile a ~$2088-2092 → ~2% sopra lo strike $2050
  - Modello dice ~88% prob di restare sopra → edge ~11% vs mercato 77%
  
- **T2009.99 NO** (2 trades): @ 11-12¢, edge 26-27%, sideways regime
  - Deep OTM: ETH a $2088 vs strike $2010 (3.8% sotto)
  - Modello dice ~62-63% prob di restare SOPRA $2010 (NO che non scende sotto)
  - Edge altissimo ma rischio tail

- **T2049.99 NO** (1 trade): @ 33¢, edge 13.8%, sideways
  - Nota: lo STESSO ticker tradato YES a 77¢ in altri cicli!
  - In un ciclo il sistema vuole YES (prezzo salirà), nell'altro NO (scenderà)
  - Questo è un **red flag** — momentum/regime che cambiano tra scansioni

- **T2129.99 NO** (3 trades): @ 78-79¢, edge 9-10%, choppy
- **T1969.99 NO** (1 trade): @ 6¢, edge 24%, sideways

### Trades BTC (10 total)

- **T68999.99 YES** (2 trades): @ 71-74¢, edge 10%, choppy
  - BTC a ~$69,805-69,936 vs strike $69,000 (~1.2% sopra)
  
- **T70999.99 NO** (5 trades): @ 77¢, edge 10-11%, choppy
  - BTC sotto $71,000 → modello dice alta prob di restare sotto

- **T71499.99 NO** (3 trades): @ 85¢, edge 9.8-10%, choppy
  - BTC sotto $71,500 → very high prob di restare sotto

### Osservazioni

1. **Troppa ripetizione**: 9/27 trades sullo stesso ticker ETH T2049.99 YES
2. **Conflitto YES/NO**: Stesso ticker (ETH T2049.99) tradato sia YES che NO in cicli diversi
3. **Concentrazione temporale**: Tutto in 56 minuti
4. **Solo regime avversi**: Nessun trade in trending (dove le probabilità sono più prevedibili)

---

## 9. Quick Wins Implementati

### QW-1: Deduplication in Paper Mode
Aggiunto check per evitare di ri-loggare lo stesso ticker/side nelle ultime 10 entry del dryrun log.

### QW-2: Edge Cap
Aggiunto cap massimo sull'edge accettabile (25%) per evitare trade basati su edge probabilmente illusori.

### QW-3: Settlement Checker Script
Creato `scripts/analyze-paper-trades.py` che verifica i paper trades contro i risultati di mercato reali.

### QW-4: Metric Tracking Migliorato
Aggiunto tracking della distribuzione temporale e della calibrazione probabilities nel trade log.

---

## 10. Prossimi Step

1. **Settimana 1**: Runnare `analyze-paper-trades.py` quotidianamente per verificare outcomes
2. **Settimana 2**: Accumulare ≥100 paper trades con outcomes verificati
3. **Settimana 3**: Prima calibrazione del fat-tail multiplier basata su dati reali
4. **Ongoing**: Monitorare Brier score e calibration diagram per assicurare che il modello migliori

Il bot è impressionantemente complesso e ben strutturato. Il gap principale è **la mancanza totale di verifica dei risultati**. Una volta colmato questo, le ottimizzazioni saranno data-driven e il path verso live trading sarà chiaro.
