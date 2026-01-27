# 📚 Trading Resources & Ideas

## 🔗 GitHub Repositories

### Top Trading Bots
| Repo | Stars | Link | Note |
|------|-------|------|------|
| freqtrade | 46.3k | github.com/freqtrade/freqtrade | ML integrato, backtesting |
| ccxt | 40.7k | github.com/ccxt/ccxt | API per 100+ exchange |
| hummingbot | 15.7k | github.com/hummingbot/hummingbot | High-frequency trading |
| jesse-ai | 7.4k | github.com/jesse-ai/jesse | Python puro, avanzato |
| OctoBot | 5.2k | github.com/Drakkar-Software/OctoBot | **Supporta Hyperliquid!** |
| blankly | 2.4k | github.com/blankly-finance/blankly | Deploy semplice |

### GMX Specifici
- `github.com/arbitrum-api/GMX-Arbitrum-Trading-Bot` (Python)
- `github.com/GushALKDev/gmx-v2-ai-agent` (AI agent per GMX v2)

---

## 🧮 Metodi Matematici/Statistici

### Kelly Criterion
```python
# Optimal position sizing
f* = (bp - q) / b
# b = win/loss ratio
# p = win probability
# q = loss probability (1-p)

# Fractional Kelly (safer)
position = capital * f* * 0.5
```

### Independent Component Analysis (ICA)
- Separa segnali misti in componenti indipendenti
- Uso: estrarre "segnale" dal "rumore" nei prezzi
- Libreria: `sklearn.decomposition.FastICA`

### Bayesian Optimization
- Ottimizza funzioni black-box
- Uso: trovare parametri ottimali (stop loss, take profit, etc.)
- Libreria: `optuna` o `scikit-optimize`

---

## 🤖 AI/ML Approaches

### Sentiment Analysis
- Twitter API per crypto sentiment
- News scraping + NLP
- Fear & Greed Index

### Pattern Recognition
- CNN per chart patterns
- LSTM per time series
- Transformer models

### Reinforcement Learning
- Q-learning per trading decisions
- PPO per continuous actions
- Libreria: `stable-baselines3`

---

## 📊 On-Chain Analytics

### Data Sources
- **Glassnode** - on-chain metrics
- **Nansen** - wallet tracking
- **Dune Analytics** - custom queries
- **DefiLlama** - TVL, fees, yields

### Key Metrics
- Whale movements
- Exchange inflows/outflows
- Funding rates
- Open interest

---

## 🎯 Strategie da Implementare

### 1. Momentum Following
```
IF 24h_change > 2% AND 7d_change > 5%:
    LONG with trend
ELIF 24h_change < -2% AND 7d_change < -5%:
    SHORT with trend
ELSE:
    WAIT
```

### 2. Mean Reversion
```
IF price < lower_bollinger AND RSI < 30:
    LONG (oversold bounce)
IF price > upper_bollinger AND RSI > 70:
    SHORT (overbought pullback)
```

### 3. Funding Rate Arbitrage
```
IF funding_rate > 0.1%:
    SHORT (longs paying shorts)
IF funding_rate < -0.1%:
    LONG (shorts paying longs)
```

### 4. Breakout Trading
```
IF price breaks resistance with volume:
    LONG with tight stop
IF price breaks support with volume:
    SHORT with tight stop
```

---

## 💡 Ideas to Explore

### Polymarket Workaround
- Setup: Mac A (iPhone Mirror) ← Chrome Remote ← Mac B (fuori USA)
- Teoria: geo-check potrebbe usare IP di Mac B
- Test necessario con Mac/VPS estero

### Multi-Exchange Arbitrage
- CCXT per connettere più exchange
- Cercare price discrepancies
- Richiede capitale maggiore per essere profittevole

### AI Agent Autonomo
- Combina: sentiment + on-chain + technical
- Decision tree o neural net
- Self-learning da risultati

---

## 🔧 Tools Installati

```bash
pip3 install:
- web3              # Blockchain interaction
- hyperliquid-python-sdk  # Hyperliquid API
- scikit-learn      # ML basics
- scipy             # Optimization
- optuna            # Bayesian optimization
```

---

*Documento creato: 27 Gen 2026*
*Aggiornare man mano che si scoprono nuove risorse*
