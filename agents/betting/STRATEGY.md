# 🎰 Betting Agents Strategy

## Core Principles

### 1. Kelly Criterion
```
f* = (bp - q) / b
where:
  f* = fraction of bankroll to bet
  b = odds received (decimal - 1)
  p = probability of winning
  q = 1 - p (probability of losing)
```

Use **fractional Kelly** (25-50%) to reduce variance.

### 2. Expected Value (+EV)
Only bet when: `EV = (prob × payout) - stake > 0`

### 3. Sharp vs Soft Lines
- **Sharp books** (Pinnacle, Betfair) = true odds
- **Soft books** (Polymarket, Kalshi) = potential mispricing
- Edge = sharp_prob - soft_prob

## Kalshi Strategy

### Short-term Markets (< 24h)
- Crypto price ranges (BTC, ETH, SOL)
- Weather events
- Daily politics

### Edge Sources
1. **Momentum**: If BTC trending up, YES on higher ranges
2. **Volatility**: High vol = wider ranges more likely
3. **News catalyst**: Events that move prices

### Position Sizing
- Max 10% bankroll per bet
- Scale with confidence (Kelly fraction)

## Polymarket Strategy

### Sports Betting
1. Pull odds from Pinnacle/sharp books
2. Compare to Polymarket prices
3. Bet when edge > 3%

### Copy Trading
- Identify top traders by ROI
- Mirror their positions with delay
- Use smaller size (50% of their %)

## Risk Management

- **Max drawdown**: 30% of bankroll = stop
- **Daily loss limit**: 15%
- **Correlation**: Don't overload same event
- **Liquidity**: Check order book depth

## Improvement Loop

After each bet:
1. Log outcome
2. Compare predicted vs actual prob
3. Adjust model weights
4. Track by category (sports, crypto, politics)
