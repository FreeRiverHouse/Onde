#!/usr/bin/env python3
"""
AI-Enhanced Trading Signals
- Kelly Criterion for optimal sizing
- Volatility regime detection
- Statistical edge calculation
"""

import requests
import math
from datetime import datetime

def get_market_data():
    """Get comprehensive market data"""
    try:
        # Price data
        resp = requests.get(
            "https://api.coingecko.com/api/v3/coins/bitcoin",
            params={"localization": "false", "tickers": "false", "community_data": "false", "developer_data": "false"},
            timeout=10
        )
        btc = resp.json()
        
        resp2 = requests.get(
            "https://api.coingecko.com/api/v3/coins/ethereum", 
            params={"localization": "false", "tickers": "false", "community_data": "false", "developer_data": "false"},
            timeout=10
        )
        eth = resp2.json()
        
        return {
            "btc": {
                "price": btc["market_data"]["current_price"]["usd"],
                "change_24h": btc["market_data"]["price_change_percentage_24h"],
                "change_7d": btc["market_data"]["price_change_percentage_7d"],
                "change_30d": btc["market_data"]["price_change_percentage_30d"],
                "high_24h": btc["market_data"]["high_24h"]["usd"],
                "low_24h": btc["market_data"]["low_24h"]["usd"],
                "volume": btc["market_data"]["total_volume"]["usd"],
                "market_cap": btc["market_data"]["market_cap"]["usd"],
            },
            "eth": {
                "price": eth["market_data"]["current_price"]["usd"],
                "change_24h": eth["market_data"]["price_change_percentage_24h"],
                "change_7d": eth["market_data"]["price_change_percentage_7d"],
                "change_30d": eth["market_data"]["price_change_percentage_30d"],
                "high_24h": eth["market_data"]["high_24h"]["usd"],
                "low_24h": eth["market_data"]["low_24h"]["usd"],
                "volume": eth["market_data"]["total_volume"]["usd"],
            }
        }
    except Exception as e:
        print(f"Error getting data: {e}")
        return None

def calculate_volatility(high, low, current):
    """Calculate normalized volatility"""
    if high == low:
        return 0
    range_pct = (high - low) / current * 100
    return range_pct

def detect_regime(change_24h, change_7d, change_30d):
    """Detect market regime"""
    # Trending up
    if change_24h > 2 and change_7d > 5 and change_30d > 10:
        return "STRONG_UPTREND", 0.9
    elif change_24h > 1 and change_7d > 2:
        return "UPTREND", 0.7
    
    # Trending down
    elif change_24h < -2 and change_7d < -5 and change_30d < -10:
        return "STRONG_DOWNTREND", 0.9
    elif change_24h < -1 and change_7d < -2:
        return "DOWNTREND", 0.7
    
    # Ranging
    else:
        return "RANGING", 0.5

def kelly_criterion(win_rate, win_loss_ratio):
    """
    Calculate optimal bet size using Kelly Criterion
    f* = (bp - q) / b
    where:
    - b = win/loss ratio
    - p = probability of winning
    - q = probability of losing (1-p)
    """
    p = win_rate
    q = 1 - p
    b = win_loss_ratio
    
    kelly = (b * p - q) / b
    
    # Use fractional Kelly (half) for safety
    return max(0, kelly * 0.5)

def calculate_edge(data, symbol):
    """Calculate statistical edge for a trade"""
    d = data[symbol]
    
    # Volatility
    volatility = calculate_volatility(d["high_24h"], d["low_24h"], d["price"])
    
    # Regime
    regime, confidence = detect_regime(d["change_24h"], d["change_7d"], d["change_30d"])
    
    # Position in range
    range_size = d["high_24h"] - d["low_24h"]
    if range_size > 0:
        position = (d["price"] - d["low_24h"]) / range_size
    else:
        position = 0.5
    
    # Calculate edge based on regime
    edge = 0
    direction = None
    
    if regime in ["STRONG_UPTREND", "UPTREND"]:
        # Long bias
        if position < 0.4:  # Near support
            edge = confidence * 0.6
            direction = "LONG"
        elif position > 0.8:  # Extended
            edge = -0.1  # Slight negative edge for new longs
            direction = "WAIT"
    
    elif regime in ["STRONG_DOWNTREND", "DOWNTREND"]:
        # Short bias
        if position > 0.6:  # Near resistance
            edge = confidence * 0.6
            direction = "SHORT"
        elif position < 0.2:  # Extended
            edge = -0.1
            direction = "WAIT"
    
    else:  # RANGING
        # Mean reversion
        if position < 0.2:
            edge = 0.4
            direction = "LONG"
        elif position > 0.8:
            edge = 0.4
            direction = "SHORT"
        else:
            edge = 0
            direction = "WAIT"
    
    return {
        "symbol": symbol.upper(),
        "price": d["price"],
        "regime": regime,
        "confidence": confidence,
        "volatility": volatility,
        "range_position": position,
        "edge": edge,
        "direction": direction,
        "change_24h": d["change_24h"],
        "change_7d": d["change_7d"],
    }

def generate_signals(capital=12.80):
    """Generate trading signals with position sizing"""
    print(f"\n{'='*60}")
    print(f"🤖 AI TRADING SIGNALS - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"💰 Capital: ${capital:.2f}")
    print(f"{'='*60}")
    
    data = get_market_data()
    if not data:
        print("❌ Failed to get market data")
        return
    
    signals = []
    for symbol in ["btc", "eth"]:
        analysis = calculate_edge(data, symbol)
        signals.append(analysis)
        
        # Print analysis
        regime_emoji = "📈" if "UP" in analysis["regime"] else "📉" if "DOWN" in analysis["regime"] else "↔️"
        direction_emoji = "🟢" if analysis["direction"] == "LONG" else "🔴" if analysis["direction"] == "SHORT" else "⚪"
        
        print(f"""
{direction_emoji} {analysis['symbol']}
   Price: ${analysis['price']:,.2f}
   24h: {analysis['change_24h']:+.2f}% | 7d: {analysis['change_7d']:+.2f}%
   Regime: {regime_emoji} {analysis['regime']} (conf: {analysis['confidence']:.0%})
   Volatility: {analysis['volatility']:.2f}%
   Range Position: {analysis['range_position']:.0%}
   Edge: {analysis['edge']:+.2f}
   Direction: {analysis['direction']}
""")
    
    # Find best signal
    actionable = [s for s in signals if s['direction'] != 'WAIT' and s['edge'] > 0.2]
    
    if actionable:
        best = max(actionable, key=lambda x: x['edge'])
        
        # Kelly sizing
        win_rate = 0.45 + best['edge'] * 0.2  # Base 45% + edge bonus
        win_loss_ratio = 2.0  # 2:1 R:R
        kelly_pct = kelly_criterion(win_rate, win_loss_ratio)
        
        position_size = capital * kelly_pct
        position_size = min(position_size, capital * 0.25)  # Max 25% of capital
        position_size = max(position_size, 1.0)  # Min $1
        
        print(f"""
{'='*60}
🎯 BEST OPPORTUNITY
{'='*60}
Symbol: {best['symbol']}
Direction: {best['direction']}
Edge: {best['edge']:+.2f}
Win Rate Est: {win_rate:.0%}
Kelly %: {kelly_pct:.1%}
Position Size: ${position_size:.2f}

📋 TRADE PLAN:
   Entry: ${best['price']:,.2f}
   Stop Loss: ${best['price'] * (0.97 if best['direction']=='LONG' else 1.03):,.2f} (3%)
   Take Profit: ${best['price'] * (1.06 if best['direction']=='LONG' else 0.94):,.2f} (6%)
   Risk: ${position_size * 0.03:.2f}
   Reward: ${position_size * 0.06:.2f}
{'='*60}
""")
    else:
        print(f"""
{'='*60}
⏳ NO CLEAR OPPORTUNITY
{'='*60}
All signals show WAIT or low edge.
Continue monitoring. Don't force trades.
{'='*60}
""")

if __name__ == "__main__":
    generate_signals(capital=12.80)
