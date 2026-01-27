#!/usr/bin/env python3
"""
Market Monitor - Check for trading opportunities
Run periodically to find setups
"""

import requests
import json
from datetime import datetime

def get_prices():
    """Get current crypto prices"""
    try:
        resp = requests.get(
            "https://api.coingecko.com/api/v3/simple/price",
            params={
                "ids": "bitcoin,ethereum",
                "vs_currencies": "usd",
                "include_24hr_change": "true",
                "include_24hr_high": "true",
                "include_24hr_low": "true"
            },
            timeout=10
        )
        return resp.json()
    except:
        return None

def analyze_opportunity(data):
    """Analyze if there's a trading opportunity"""
    signals = []
    
    for coin, info in [("bitcoin", "BTC"), ("ethereum", "ETH")]:
        price = data[coin]['usd']
        change = data[coin]['usd_24h_change']
        high = data[coin].get('usd_24h_high', price)
        low = data[coin].get('usd_24h_low', price)
        
        # Calculate position in range
        range_size = high - low if high > low else 1
        position_in_range = (price - low) / range_size
        
        signal = {
            "symbol": info,
            "price": price,
            "change_24h": change,
            "high_24h": high,
            "low_24h": low,
            "range_position": position_in_range,
            "action": "WAIT"
        }
        
        # Strong trend signals
        if change > 3:
            signal["action"] = "LONG_MOMENTUM"
            signal["reason"] = f"Strong bullish momentum (+{change:.1f}%)"
        elif change < -3:
            signal["action"] = "SHORT_MOMENTUM"
            signal["reason"] = f"Strong bearish momentum ({change:.1f}%)"
        
        # Mean reversion signals
        elif position_in_range < 0.2 and change < 0:
            signal["action"] = "LONG_REVERSAL"
            signal["reason"] = "Near 24h low, potential bounce"
        elif position_in_range > 0.8 and change > 0:
            signal["action"] = "SHORT_REVERSAL"
            signal["reason"] = "Near 24h high, potential pullback"
        
        # Ranging
        else:
            signal["action"] = "WAIT"
            signal["reason"] = "No clear setup"
        
        signals.append(signal)
    
    return signals

def main():
    print(f"\n{'='*50}")
    print(f"MARKET MONITOR - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*50}")
    
    data = get_prices()
    if not data:
        print("❌ Failed to get prices")
        return
    
    signals = analyze_opportunity(data)
    
    for sig in signals:
        emoji = "🟢" if "LONG" in sig["action"] else "🔴" if "SHORT" in sig["action"] else "⚪"
        
        print(f"""
{emoji} {sig['symbol']}
   Price: ${sig['price']:,.2f}
   24h: {sig['change_24h']:+.2f}%
   Range: {sig['range_position']*100:.0f}% (L: ${sig['low_24h']:,.0f} / H: ${sig['high_24h']:,.0f})
   Signal: {sig['action']}
   Reason: {sig['reason']}
""")
    
    # Check for actionable signals
    actionable = [s for s in signals if s['action'] != 'WAIT']
    if actionable:
        print("🎯 ACTIONABLE SIGNALS FOUND!")
        for s in actionable:
            print(f"   → {s['symbol']}: {s['action']}")
    else:
        print("⏳ No clear setups right now. Continue monitoring.")

if __name__ == "__main__":
    main()
