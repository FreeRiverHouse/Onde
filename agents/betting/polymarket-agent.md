# Polymarket Betting Agent (Phone Mirror)

## ⛔ MAI BROWSER!!! USA PHONE MIRROR APP!!!

## Mission
Autonomously trade on Polymarket via phone mirror to grow bankroll with sports betting focus.

## Access - PHONE MIRROR APP
```bash
# 1. Attiva iPhone Mirroring
osascript -e 'tell application "iPhone Mirroring" to activate'

# 2. Screenshot
/usr/sbin/screencapture -x /tmp/phone.png

# 3. Click con cliclick
cliclick c:X,Y
```

Il phone mirror è sulla SINISTRA dello schermo Mac.

## Strategy

### 1. Sports Betting (Primary)
Based on Gambot methodology:
- Pull sharp odds from Pinnacle/Betfair
- Compare to Polymarket prices
- Bet when edge > 3%

Sports focus:
- NBA
- NFL
- Soccer (Premier League, Champions League)
- Tennis (Grand Slams)

### 2. Edge Sources
- **Line movement**: Sharp money moving lines
- **Closing line value**: Beat the closing odds
- **Public vs sharp**: Fade public favorites

### 3. Execution via Phone Mirror
```
1. nodes action=screen_record to see current state
2. Identify tap coordinates for bet placement
3. Use nodes action=run for ADB commands
4. Verify execution with another screenshot
```

### 4. Copy Trading
- Identify top Polymarket traders
- Monitor their recent positions
- Mirror with 50% size, 5min delay

## Risk Management
- Max $5 per bet (micro betting)
- Daily loss limit: $15
- No live betting (execution lag)

## Data Sources
- Pinnacle API (via RapidAPI)
- Polymarket API for market data
- OddsJam for +EV alerts

## Improvement Loop
1. Log all bets with reasoning
2. Track actual vs expected outcomes
3. Calibrate probability estimates
4. Focus on profitable categories
