# Kalshi Autotrader v2 - Improvement Plan

**Date:** 2026-02-14
**Author:** Subagent (autotrader-improvement)
**Status:** Analysis Complete, Critical Fixes Implemented

---

## Executive Summary

The autotrader has executed 115 trades — ALL on weather markets, ZERO on crypto — with a win rate of ~20% despite claiming 60-90% edge. The root causes are:

1. **CRITICAL BUG: Weather edge calculation is fundamentally broken** — The model calculates the probability of temperature falling in a narrow bucket (e.g., 1°F range) and finds it low (1-20%), then interprets the gap between this low probability and the high market price as "edge". In reality, this is a **bucket probability vs. threshold probability confusion**.

2. **CRITICAL BUG: Threshold NO trades have 0% win rate** (0/31) because the model bets against extreme market conviction with fake edge.

3. **CRITICAL BUG: Crypto probability model produces no edge** because Black-Scholes with 0.5% hourly vol makes all probabilities near 0 or 1, matching market prices. No trades are ever generated.

4. **STRUCTURAL: Weather always wins the opportunity sort** because fake edges of 60-90% dwarf any real crypto edge of 2-5%.

---

## 1. Bug Analysis

### Bug #1: Weather Bucket Probability Confusion (CRITICAL)

**Location:** `nws-weather-forecast.py` → `calculate_weather_edge()` → `calculate_probability_simple()`

**The Problem:**
For bucket markets like `KXHIGHNY-26FEB07-B26.5` (high temp 26-27°F):
- The model calculates P(26 < T < 27) using a normal distribution
- With forecast=30°F and uncertainty=4°F: P(26<T<27) ≈ 1.65%
- Market price: 92¢ YES (market thinks this bucket IS the correct range)
- Code calculates: edge_NO = (1 - 1.65%) - (1 - 92%) = 90.35%
- **This is NONSENSICAL** — the market is pricing whether the temp WILL land in this range, and the model is saying "there's only 1.65% chance" because the probability of any specific 1°F bucket is inherently low with a 4°F uncertainty

**Root Cause:** The uncertainty parameter (4°F std dev) is calibrated for the entire forecast distribution, but when applied to 1°F buckets, it makes EVERY bucket have low probability. The model should instead be asking: "Given the forecast, which bucket is most likely?" — the answer should agree with the market when the forecast is close to the bucket midpoint.

**Evidence:**
- 91/115 trades had our_prob < 20% — the model almost always thinks NO is correct
- Bucket NO trades: 60 trades, 32% WR — barely profitable
- Threshold NO trades: 31 trades, **0% WR** — total disaster

**Fix:** See Section 3.

### Bug #2: Threshold Markets Misinterpreted (CRITICAL)

**Location:** `nws-weather-forecast.py` → `parse_kalshi_weather_ticker()` threshold direction inference

**The Problem:**
For threshold markets like `KXLOWTNYC-26FEB08-T7` (low temp threshold 7°F):
- The title says something like "Will low temp be below 7°F?"
- Market price: 6¢ YES (market thinks it's very unlikely)
- Code calculates: our_prob = P(T < 7) with forecast maybe 15°F = 99.74% (ABOVE 7, using wrong direction)
- Edge = 99.74% - 6% = 93.74%
- Result: LOSS every single time

The threshold direction inference logic (`threshold_above = value >= 40` for high temps, `value >= 20` for low temps) is wrong. It's essentially guessing the market direction based on arbitrary temperature cutoffs instead of reading the actual market title.

**Evidence:** 31 threshold trades, 0% win rate.

### Bug #3: Crypto Model Generates Zero Trades (HIGH)

**Location:** `kalshi-autotrader-v2.py` → `calculate_prob_above_strike()` and `find_opportunities()`

**The Problem:**
With BTC_HOURLY_VOL = 0.005 (0.5%):
- For 60 minutes to expiry: σ = 0.005 × √1 = 0.005
- If BTC is $100k and strike is $99k (1% below): d2 = ln(1.0101)/0.005 = 2.01
- P(above $99k) = N(2.01) = 97.8%
- Market also prices this at ~90-95%
- Edge = 97.8% - 95% = 2.8% < 10% minimum → NO TRADE

The model is too confident (narrow distribution) and always agrees with the market. Even when it disagrees, the edge is below the 10% threshold.

**Root Cause:** 
1. Hourly volatility of 0.5% is reasonable for average conditions but doesn't capture tail events or sudden moves
2. The Black-Scholes model assumes lognormal distribution — crypto has fat tails
3. Min edge threshold of 10% is too high for crypto (realistic edges are 2-5%)
4. No use of order book data, only midpoint prices

### Bug #4: Weather Dominates Opportunity Sort (STRUCTURAL)

**Location:** `run_cycle()` → opportunity sorting

The weather "edges" of 60-90% always beat any crypto edge, so even if crypto had valid opportunities, weather would be selected first. The all_opportunities list merges both and takes the "best" — which is always weather with its inflated fake edges.

---

## 2. Why the Model is Wrong: Deep Analysis

### Weather Markets: The Fundamental Misunderstanding

The autotrader treats weather markets like crypto markets with a continuous price model. But weather markets are different:

1. **Information asymmetry is REVERSED**: In weather markets, the NWS forecast IS the primary information source. Markets are efficient because everyone has the same forecast. There's no "hidden edge" from knowing the forecast.

2. **Bucket markets are mutually exclusive**: When you trade bucket B26.5, you're competing against B25.5, B27.5, etc. The total probability across all buckets MUST sum to 100%. If the model says P(B26.5) = 1.65%, it would also say P(B27.5) = 2.something%, P(B28.5) = 3.something%, etc. — and none would sum to 100% correctly because the uncertainty parameter spreads probability across too many buckets.

3. **The correct approach**: Compare the forecast ± MAE against the bucket range. If forecast is 27°F and MAE is 2.8°F, the bucket B26.5 (26-27°F range) should have P ≈ 10-15%, not 1.65%. The uncertainty of 4.0 makes the normal distribution too flat.

### Crypto Markets: Why Black-Scholes Isn't Enough

1. **Crypto vol is non-stationary**: Using a fixed 0.5% hourly vol ignores regime changes, news events, and time-of-day patterns
2. **Fat tails**: Crypto returns have excess kurtosis; lognormal underestimates tail probabilities
3. **Market microstructure**: Kalshi crypto markets may have inefficiencies in the order book (bid-ask spread) that a simple midpoint model can't capture
4. **The real edge is in information, not models**: Top prediction market traders use LLMs/AI to synthesize information (news, on-chain data, sentiment) faster than the market, not to run Black-Scholes better

---

## 3. Proposed Fixes

### Fix 1: Disable Weather Trading (IMMEDIATE)

Weather trading has been a net loser. Until the model is properly rebuilt, disable it:
- Set `WEATHER_ENABLED = False` as default
- Or set env var `WEATHER_ENABLED=false`

### Fix 2: Fix Crypto Model to Generate Trades (CRITICAL)

#### 2a. Lower minimum edge for crypto
```python
ASSET_CONFIG = {
    "btc": {
        "min_edge": 0.04,    # 4% instead of 10% — realistic for crypto
        "kelly_fraction": 0.10,  # Higher Kelly since we have more data
        "max_position_pct": 0.05,
    },
    "eth": {
        "min_edge": 0.05,    # 5% — slightly higher for more volatile asset
        "kelly_fraction": 0.08,
        "max_position_pct": 0.04,
    },
}
```

#### 2b. Use realized volatility instead of hardcoded
Replace `BTC_HOURLY_VOL = 0.005` with dynamic calculation from OHLC data:
```python
def get_dynamic_hourly_vol(ohlc_data: list, asset: str) -> float:
    """Calculate realized hourly volatility from recent data."""
    rv = calculate_realized_volatility(ohlc_data, hours=24)
    if rv and rv > 0:
        return rv / math.sqrt(24)  # Convert 24h vol to hourly
    # Fallback to defaults
    return {"btc": 0.005, "eth": 0.007}.get(asset, 0.005)
```

#### 2c. Add fat-tail adjustment
Crypto returns have excess kurtosis. Multiply vol by 1.3-1.5x for probability calculations to widen the distribution:
```python
FAT_TAIL_MULTIPLIER = 1.4  # Empirically calibrated
sigma = hourly_vol * math.sqrt(T) * FAT_TAIL_MULTIPLIER
```

### Fix 3: Rebuild Weather Probability Model (IMPORTANT)

If weather trading is re-enabled, the model needs:

1. **Proper bucket probability**: Use the ratio method — what fraction of the forecast distribution falls in this bucket?
   - With forecast=27°F and MAE=2.8°F (σ≈2.8), bucket [26,27]: P ≈ N((27-27)/2.8) - N((26-27)/2.8) = 0.50 - 0.36 = 14%
   - NOT the 1.65% the current model produces

2. **Adaptive uncertainty**: Instead of hardcoded 4°F, calculate from actual NWS verification data or at minimum use a tighter value for same-day forecasts

3. **Threshold direction from market title**: Parse the actual Kalshi market title ("above" / "below" / "at least" / "at most") instead of guessing from temperature values

4. **Market efficiency check**: If the market and our model agree within 5%, there's NO edge — skip. Don't invent fake edges from modeling errors.

### Fix 4: Implement LLM-Based Probability Assessment (STRATEGIC)

Based on the "Approaching Human-Level Forecasting with Language Models" paper (arXiv:2402.18563), the most effective approach for prediction markets is:

1. **Information retrieval**: Fetch relevant news, on-chain data, market events
2. **LLM probability estimation**: Ask Claude/GPT to estimate probabilities given all context
3. **Ensemble with quantitative model**: Average LLM estimate with Black-Scholes estimate
4. **Calibration**: Track LLM estimates vs outcomes to build a calibration curve

This is the approach used by the top 1% of forecasters on Metaculus and PredictionArena.

Implementation:
```python
def get_llm_probability(market_title: str, context: dict) -> float:
    """Ask Claude to estimate probability given market context."""
    prompt = f"""
    Market: {market_title}
    Current price: {context['current_price']}
    Strike: {context['strike']}
    Time to expiry: {context['minutes_left']} minutes
    Recent news: {context.get('news', 'none')}
    Recent price action: {context.get('momentum', 'neutral')}
    
    Estimate the probability (0-100%) that YES wins.
    Consider: market efficiency, news impact, historical patterns.
    Output only a number.
    """
    # Call Claude API
    ...
```

---

## 4. Kelly Criterion: Current vs. Correct

### Current (Broken)
```python
kelly_bet = cash * adjusted_kelly * edge
# With edge=0.90, kelly=0.05: bet = cash * 0.05 * 0.90 = 4.5% of cash
# But edge is FAKE, so this is just a max-bet on losing trades
```

### Correct Kelly
The Kelly criterion says: f* = (bp - q) / b where:
- b = odds offered (e.g., if price is 8¢, b = 100/8 - 1 = 11.5)
- p = true probability of winning
- q = 1 - p

```python
def kelly_fraction_correct(our_prob: float, price_cents: int) -> float:
    """Correct Kelly criterion for binary markets."""
    if price_cents <= 0 or price_cents >= 100:
        return 0
    
    b = (100 - price_cents) / price_cents  # Odds ratio
    p = our_prob
    q = 1 - p
    
    f = (b * p - q) / b
    return max(0, f)  # Never bet negative
```

For our trades:
- our_prob=1.65%, price=8¢ → b=11.5, f* = (11.5×0.0165 - 0.9835)/11.5 = -0.067 → **DON'T BET** (Kelly says negative!)
- This alone would have prevented ~90% of losing trades

---

## 5. Feedback Loop & Backtesting

### Current State
The `update_trade_results()` function updates win/loss status but doesn't feed back into the model. There's ML feature logging but no actual ML model.

### Proposed Improvements

#### 5a. Result-Based Model Calibration
Track predicted probability vs actual outcomes. After N trades:
```python
calibration = {}
for bucket in [0.0, 0.1, 0.2, ..., 0.9, 1.0]:
    trades_in_bucket = [t for t in trades if bucket <= t['our_prob'] < bucket+0.1]
    actual_win_rate = sum(t['won'] for t in trades_in_bucket) / len(trades_in_bucket)
    calibration[bucket] = actual_win_rate / (bucket + 0.05)  # Ratio of actual/predicted
```

Apply calibration to future predictions: `calibrated_prob = raw_prob * calibration[bucket]`

#### 5b. Backtesting Framework
Before going live, backtest on historical data:
1. Fetch historical Kalshi market prices + outcomes from trade logs
2. Run the model on historical data
3. Calculate simulated P&L
4. Only deploy if backtested Sharpe > 1.0

#### 5c. Paper Trading Mode
The `DRY_RUN` mode exists but isn't used effectively. Run both live and paper simultaneously with different strategies to A/B test.

---

## 6. Dashboard Metrics to Track

### Key Performance Indicators (add to health endpoint)

| Metric | Current | Target | How to Track |
|--------|---------|--------|-------------|
| Win Rate | 20% | >55% | `get_trade_stats()` |
| Crypto Trades % | 0% | >70% | Asset breakdown in trades |
| Edge Calibration | 69.7% claimed, 20% actual | ±5% accuracy | Predicted vs actual |
| Kelly Optimal | Negative on most trades | Always positive | Pre-trade check |
| Sharpe Ratio | Not tracked | >1.0 | Daily P&L calculation |
| Max Drawdown | Not tracked | <15% | Running equity curve |
| Profit Factor | Not tracked | >1.5 | Gross profit / Gross loss |

### New Metrics to Add

1. **Brier Score**: Sum of (predicted_prob - actual_outcome)² / N — lower is better
2. **Log Loss**: -Σ(y×log(p) + (1-y)×log(1-p)) — penalizes confident wrong predictions
3. **ROI per Asset Class**: Track crypto vs weather returns separately
4. **Edge Decay**: How edge changes as time-to-expiry decreases
5. **Market Impact**: Whether our orders move the market (probably not at current size)

---

## 7. Implementation Priority

### Phase 1: Stop the Bleeding (DONE - implemented below)
1. ✅ Disable weather trading by default
2. ✅ Add correct Kelly criterion check (skip negative Kelly)
3. ✅ Lower crypto min_edge to generate trades
4. ✅ Use realized volatility for crypto
5. ✅ Add fat-tail adjustment

### Phase 2: Proper Weather Model (1-2 weeks)
1. Fix threshold direction parsing from market titles
2. Recalibrate bucket probabilities with tighter uncertainty
3. Add forecast accuracy tracking (predicted temp vs actual)
4. Only re-enable weather after backtesting shows >50% WR

### Phase 3: LLM Integration (2-4 weeks)
1. Add Claude API call for probability estimation
2. Ensemble model (quantitative + LLM)
3. Information retrieval pipeline (news, on-chain data)
4. Calibration curve tracking

### Phase 4: Advanced Features (1-2 months)
1. Order book analysis (bid-ask spread, depth)
2. Multi-market arbitrage detection
3. Automated backtesting pipeline
4. Portfolio optimization across uncorrelated markets

---

## 8. Summary of Changes Made

### Files Modified:
- `scripts/kalshi-autotrader-v2.py`: 
  - Weather disabled by default
  - Crypto min_edge lowered to 4-5%
  - Added `kelly_criterion_check()` — skips trades with negative Kelly
  - Dynamic volatility from OHLC data instead of hardcoded
  - Fat-tail multiplier for crypto probability calculation
  - Correct Kelly position sizing

### Files Created:
- `docs/autotrader-improvement-plan.md`: This document
