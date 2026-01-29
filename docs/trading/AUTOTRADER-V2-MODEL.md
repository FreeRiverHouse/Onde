# Autotrader V2 Trading Model Documentation

> **Author:** Clawd  
> **Created:** 2026-01-31  
> **Location:** `scripts/kalshi-autotrader-v2.py`

## Overview

Autotrader V2 is a cryptocurrency prediction market trading bot for Kalshi's hourly BTC/ETH contracts. It was built after V1 achieved a catastrophic 0% win rate due to a broken probability model.

### Key Improvements Over V1
- ✅ Proper log-normal probability model (Black-Scholes inspired)
- ✅ Correct time-to-expiry handling for hourly contracts
- ✅ Multi-timeframe momentum integration
- ✅ Dynamic market regime detection
- ✅ Volatility-adjusted position sizing
- ✅ Circuit breaker for consecutive losses
- ✅ Stop-loss monitoring

---

## 1. Probability Model (Black-Scholes Inspired)

The core probability calculation uses a log-normal price model, a simplified version of Black-Scholes option pricing.

### Formula

```
P(S_T > K) = N(d₂)

where:
d₂ = (ln(S/K) - σ²T/2) / (σ√T)

S = current price
K = strike price
T = time to expiry (in hours)
σ = hourly volatility (scaled by √T)
N() = cumulative normal distribution
```

### Key Assumptions
- **Zero drift (r ≈ 0):** For hourly contracts, we assume no expected directional move
- **Log-normal distribution:** Prices follow geometric Brownian motion
- **Volatility constants:**
  - BTC: `BTC_HOURLY_VOL = 0.005` (~0.5% hourly)
  - ETH: `ETH_HOURLY_VOL = 0.007` (~0.7% hourly)

### Implementation
```python
def calculate_prob_above_strike(current_price, strike, minutes_to_expiry, hourly_vol):
    T = minutes_to_expiry / 60.0  # Hours
    sigma = hourly_vol * math.sqrt(T)  # Vol for period
    log_ratio = math.log(current_price / strike)
    d2 = log_ratio / sigma - sigma / 2
    prob_above = norm_cdf(d2)
    return max(0.01, min(0.99, prob_above))
```

### Edge Calculation
```
edge = |market_implied_prob - model_prob|
```
- **Market implied probability:** Derived from contract price (price/100)
- **Model probability:** Our calculated probability
- **Minimum edge:** 10% (dynamic based on regime)

---

## 2. Multi-Timeframe Momentum

Momentum is calculated across three timeframes and combined into a composite signal.

### Timeframes & Weights
| Timeframe | Weight | Rationale |
|-----------|--------|-----------|
| 1h | 0.50 | Short-term matters most for hourly contracts |
| 4h | 0.30 | Medium-term trend |
| 24h | 0.20 | Overall market direction |

### Momentum Calculation
For each timeframe:
1. Calculate price change over period
2. Determine **direction**: +1 (bullish), -1 (bearish), 0 (neutral)
3. Determine **strength**: 0-1 based on magnitude of change

### Composite Score
```python
composite_direction = Σ(direction × strength × weight) / Σ(weight)
composite_strength = Σ(strength × weight) / Σ(weight)
alignment = True if all timeframes agree on direction
```

### Probability Adjustment
Momentum adjusts the model probability:
- **Max adjustment:** ±15% with full alignment, ±8% without
- **YES bets:** Bullish momentum increases probability
- **NO bets:** Bearish momentum increases probability (flipped sign)

---

## 3. Market Regime Detection

The autotrader classifies market conditions into four regimes, each with different trading parameters.

### Regime Types

| Regime | Criteria | MIN_EDGE | Description |
|--------|----------|----------|-------------|
| `trending_bullish` | 24h change > +3%, strong positive momentum | 7% | Predictable uptrend |
| `trending_bearish` | 24h change < -3%, strong negative momentum | 7% | Predictable downtrend |
| `sideways` | Small changes, weak momentum | 12% | Range-bound |
| `choppy` | High volatility, conflicting signals | 15% | Hardest to trade |

### Detection Algorithm
1. Calculate 4h and 24h price changes
2. Calculate average candle range (volatility proxy)
3. Combine with momentum direction and alignment
4. Classify into regime

### Volatility Classification (T285)
| Bucket | Range | Classification |
|--------|-------|----------------|
| very_low | <0.3% | Quiet market |
| low | 0.3-0.5% | Below average |
| normal | 0.5-1.0% | Typical |
| high | 1-2% | Elevated |
| very_high | >2% | Extreme |

---

## 4. Position Sizing (Kelly Criterion)

Position sizes are calculated using a modified Kelly criterion with multiple adjustment factors.

### Base Formula
```
kelly_fraction = 0.05  # Very conservative (5% of Kelly optimal)
bet_size = balance × kelly_fraction × (edge / implied_odds)
```

### Adjustment Multipliers

| Factor | Condition | Multiplier | Task |
|--------|-----------|------------|------|
| Regime | Choppy | 0.5x | T293 |
| Regime | Sideways | 0.75x | T293 |
| Regime | Trending | 1.1x | T293 |
| Volatility | Aligned | 1.15x | T293 |
| Volatility | High, not aligned | 0.8x | T293 |

### Final Size Calculation
```python
final_kelly = base_kelly × regime_multiplier × vol_multiplier
bet_size = balance × final_kelly × (edge / implied_odds)
bet_size = max(MIN_BET_CENTS, min(balance × MAX_POSITION_PCT, bet_size))
```

### Constraints
- `MIN_BET_CENTS = 5` (minimum $0.05)
- `MAX_POSITION_PCT = 0.03` (max 3% of balance per position)
- `MAX_POSITIONS = 30` (portfolio limit)

---

## 5. Stop-Loss Mechanics (T234)

The autotrader monitors open positions and exits if value drops significantly.

### Configuration
```python
STOP_LOSS_THRESHOLD = 0.50  # Exit at 50% loss (env configurable)
MIN_STOP_LOSS_VALUE = 5     # Minimum $0.05 position to monitor
```

### Implementation
1. Every cycle, `check_stop_losses()` reviews all open positions
2. Calculates current position value vs entry cost
3. If loss exceeds threshold, executes market sell
4. Creates alert file for Telegram notification

### Alert Format
```json
{
  "ticker": "KXBTCD-26JAN30-B100250",
  "side": "NO",
  "entry_price_cents": 45,
  "exit_price_cents": 22,
  "loss_percent": 51.1,
  "timestamp": "2026-01-31T15:30:00Z"
}
```

---

## 6. Circuit Breaker Logic (T289)

Automatic trading pause after consecutive losses to prevent tilt-driven decisions.

### Configuration
```python
CIRCUIT_BREAKER_THRESHOLD = 5     # Pause after N consecutive losses
CIRCUIT_BREAKER_COOLDOWN_HOURS = 4  # Required cooldown period
```

### State Machine
```
ACTIVE → (N consecutive losses) → TRIGGERED
TRIGGERED → (win OR cooldown elapsed) → ACTIVE
```

### Implementation
1. Track `consecutive_losses` counter
2. When counter ≥ threshold, write state file and alert
3. Skip all new trades while triggered
4. Resume on first win OR after cooldown period

### Alert File
`kalshi-circuit-breaker.alert` - picked up by heartbeat for Telegram notification

---

## 7. Data Sources

### Price Feeds (T246)
Multiple sources for robustness, using median price:
- **Binance:** Primary (geo-restricted in some regions)
- **CoinGecko:** Reliable fallback
- **Coinbase:** Additional validation

### OHLC Data (T278, T381)
- **Cache:** `data/ohlc/btc-ohlc.json`, `data/ohlc/eth-ohlc.json`
- **Source:** CoinGecko API (90 days of 4h candles)
- **Refresh:** Daily via cron, with live API fallback

### Market Data
- **Fear & Greed Index:** Used for extreme sentiment detection
- **Kalshi API:** Order book, positions, balance

---

## 8. Alert System

The autotrader generates various alert files for heartbeat pickup:

| Alert File | Trigger | Cooldown |
|------------|---------|----------|
| `kalshi-circuit-breaker.alert` | 5 consecutive losses | Until cleared |
| `kalshi-regime-change.alert` | Regime transition | 1h |
| `kalshi-momentum-change.alert` | Bullish↔Bearish flip | 30min |
| `kalshi-whipsaw.alert` | 2+ flips in 24h | 2h |
| `kalshi-extreme-vol.alert` | Trade during >2% hourly vol | 1h |
| `kalshi-momentum-aligned.alert` | All timeframes agree strongly | 2h |
| `kalshi-stop-loss.alert` | Stop-loss triggered | Per event |
| `kalshi-rate-limit.alert` | API at >80% rate limit | 1h |
| `kalshi-latency.alert` | Avg latency >2s | 1h |

---

## 9. Trade Logging

### Trade Log Format (`kalshi-trades-v2.jsonl`)
```json
{
  "timestamp": "2026-01-31T15:30:00.000Z",
  "ticker": "KXBTCD-26JAN30-B100250",
  "asset": "BTC",
  "side": "NO",
  "price_cents": 45,
  "contracts": 2,
  "total_cents": 90,
  "edge": 0.12,
  "reason": "12% edge, bullish momentum, normal vol",
  "momentum": {"composite_direction": 0.6, "composite_strength": 0.4, "alignment": true},
  "regime": "trending_bullish",
  "volatility": "normal",
  "vol_aligned": true,
  "vol_bonus": 0.02,
  "kelly_fraction_base": 0.05,
  "kelly_fraction_used": 0.055,
  "latency_ms": 234,
  "result_status": "pending"
}
```

### Skip Log Format (`kalshi-skips.jsonl`)
```json
{
  "timestamp": "2026-01-31T15:30:00.000Z",
  "ticker": "KXBTCD-26JAN30-B100500",
  "reason": "insufficient_edge_no",
  "edge": 0.08,
  "edge_needed": 0.12,
  "edge_gap": 0.04,
  "asset": "BTC"
}
```

---

## 10. Dry Run Mode (T305)

For testing strategies without risking capital:

```bash
DRY_RUN=true python3 scripts/kalshi-autotrader-v2.py
```

- Logs trades to `kalshi-trades-dryrun.jsonl` instead of executing
- Shows 🧪 indicator in console
- All calculations performed normally
- Useful for backtesting new parameters

---

## 11. Health Status (T472)

Writes health status to `data/trading/autotrader-health.json` every cycle:

```json
{
  "is_running": true,
  "last_cycle_time": "2026-01-31T15:30:00Z",
  "cycle_count": 42,
  "trades_today": 3,
  "won_today": 2,
  "lost_today": 1,
  "pending_today": 0,
  "win_rate_today": 66.7,
  "pnl_today_cents": 45,
  "positions_count": 5,
  "cash_cents": 1250,
  "circuit_breaker_active": false,
  "consecutive_losses": 0
}
```

---

## 12. Configuration Reference

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `DRY_RUN` | false | Enable paper trading mode |
| `CIRCUIT_BREAKER_THRESHOLD` | 5 | Losses before pause |
| `CIRCUIT_BREAKER_COOLDOWN_HOURS` | 4 | Cooldown duration |
| `STOP_LOSS_THRESHOLD` | 0.50 | Exit at X% loss |
| `LATENCY_THRESHOLD_MS` | 2000 | Alert above this latency |

### Constants (In-Code)
| Constant | Value | Description |
|----------|-------|-------------|
| `MIN_EDGE` | 0.10 | Base minimum edge (10%) |
| `KELLY_FRACTION` | 0.05 | Base Kelly fraction (5%) |
| `MIN_BET_CENTS` | 5 | Minimum bet size |
| `MAX_POSITION_PCT` | 0.03 | Max 3% per position |
| `MAX_POSITIONS` | 30 | Max concurrent positions |
| `MIN_TIME_TO_EXPIRY_MINUTES` | 45 | Skip contracts expiring soon |
| `BTC_HOURLY_VOL` | 0.005 | BTC volatility assumption |
| `ETH_HOURLY_VOL` | 0.007 | ETH volatility assumption |

---

## 13. Known Limitations

1. **Volatility assumptions:** Static values may diverge from realized vol (see T417, T439)
2. **No order book depth analysis:** Uses mid-price, ignores spread
3. **Single exchange pricing:** Kalshi only (no cross-exchange arbitrage)
4. **Hourly contracts only:** Model not tested on daily or weekly
5. **Position correlation:** Doesn't consider BTC/ETH correlation for portfolio risk

---

## 14. Related Scripts

| Script | Purpose |
|--------|---------|
| `kalshi-settlement-tracker.py` | Update trade results from settlements |
| `kalshi-daily-summary.py` | Generate daily trading report |
| `kalshi-weekly-report.py` | Generate PDF weekly summary |
| `analyze-winrate-by-regime.py` | Analyze performance by regime |
| `analyze-edge-calibration.py` | Check model calibration |
| `auto-calibrate-volatility.py` | Recommend vol adjustments |
| `push-stats-to-gist.py` | Publish stats to GitHub Gist |

---

## 15. Monitoring

### Cron Jobs
- **Watchdog:** Every 5 min - restart if crashed
- **Settlement tracker:** Every hour - update results
- **Daily summary:** 07:00 UTC - send report
- **Weekly report:** Sunday 08:00 UTC - PDF summary
- **Stats to Gist:** Hourly at :45 - dashboard data

### Dashboard
- `/betting` on onde.surf - real-time stats from Gist
- `/health` on onde.la - cron job status, autotrader health

---

*Last updated: 2026-01-31*
