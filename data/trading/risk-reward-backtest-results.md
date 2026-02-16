# Risk/Reward Filter Backtest Results
**Date:** 2026-02-15
**Data:** 132 settled trades from kalshi-v3-settlements.json

## Summary

| Metric | BUY_YES | BUY_NO | Total |
|--------|---------|--------|-------|
| Trades | 70 | 62 | 132 |
| Wins | 13 | 47 | 60 |
| Losses | 57 | 15 | 72 |
| Win Rate | 18.6% | 75.8% | 45.5% |
| PnL | -$1.31 | +$15.00 | +$13.69 |
| Avg Price | 20¢ | 54¢ | - |

## Key Finding: BUY_YES is the Problem

BUY_YES trades (mostly cheap multi-leg parlays at 10-25¢) have a catastrophic 18.6% win rate. The few wins (+$0.78 avg) can't offset the volume of losses (-$0.20 avg × 57 = -$11.40).

BUY_NO trades are the profit engine: 75.8% WR, +$15.00 total PnL.

## Filter Comparison

| Filter | N | WR | PnL | PnL/trade |
|--------|---|----|----|-----------|
| Baseline (no filters) | 132 | 45.5% | $13.69 | 10.4¢ |
| BUY_NO only | 62 | 75.8% | $15.00 | 24.2¢ |
| BUY_NO + R/R ≤ 1.5 | 42 | 76.2% | $12.78 | **30.4¢** |
| BUY_NO ≤ 65¢ only | 55 | 74.5% | $13.64 | 24.8¢ |
| BUY_YES ≥ 20¢ | 105 | 55.2% | $15.76 | 15.0¢ |
| Edge < 2% or 5-10% | 84 | 59.5% | $14.18 | 16.9¢ |

## BUY_YES by Price Bucket

| Price | Trades | WR | PnL |
|-------|--------|----|-----|
| 10-15¢ | 10 | **0.0%** | -$1.21 |
| 15-20¢ | 17 | 11.8% | -$0.86 |
| 20-25¢ | 24 | **37.5%** | +$3.78 |
| 25-30¢ | 19 | 10.5% | -$3.02 |

Interesting: 20-25¢ bucket has 37.5% WR — these might be 2-3 leg parlays, more reasonable.

## Edge Paradox

| Edge | Trades | WR | PnL |
|------|--------|----|-----|
| 0-2% | 53 | **69.8%** | +$7.64 |
| 2-5% | 17 | 29.4% | -$0.01 |
| 5-10% | 31 | 41.9% | +$6.54 |
| 10-15% | 19 | 15.8% | -$0.61 |
| 15-20% | 12 | 16.7% | +$0.13 |

Low edge = mostly BUY_NO at fair prices = high WR.
High edge = cheap BUY_YES parlays = terrible WR.

## Recommended Filters

1. **Eliminate BUY_YES < 20¢** — 0% and 11.8% WR, pure loss
2. **BUY_NO max price 65¢** — keeps 89% of BUY_NO trades, slightly better R/R
3. **Consider BUY_NO only mode** — simplest, 24.2¢/trade (2.3x baseline)
4. **Best capital efficiency**: BUY_NO + R/R ≤ 1.5 → 30.4¢/trade (2.9x baseline)

## Applied to Autotrader

Add to kalshi-autotrader.py:
- `MIN_BUY_YES_PRICE = 20` (filter cheap parlays)
- `MAX_BUY_NO_PRICE = 65` (limit downside on BUY_NO)
- `MAX_RISK_REWARD = 1.5` (price / (100 - price) ≤ 1.5)
