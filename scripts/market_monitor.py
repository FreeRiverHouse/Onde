#!/usr/bin/env python3
"""
Real-Time Market Monitor
========================
Fetches live data from Kalshi API and runs optimizer.
"""

import requests
import json
import math
from datetime import datetime
from typing import Dict, List, Optional

# =============================================================================
# KALSHI API
# =============================================================================

KALSHI_BASE = "https://api.elections.kalshi.com"

def get_markets(series_ticker: str) -> List[Dict]:
    """Fetch markets for a series"""
    try:
        resp = requests.get(
            f"{KALSHI_BASE}/trade-api/v2/markets",
            params={"series_ticker": series_ticker},
            timeout=10
        )
        return resp.json().get("markets", [])
    except Exception as e:
        print(f"Error fetching {series_ticker}: {e}")
        return []

def get_live_markets() -> List[Dict]:
    """Fetch currently live markets"""
    try:
        resp = requests.get(
            f"{KALSHI_BASE}/trade-api/v2/markets",
            params={"limit": 100},
            timeout=10
        )
        markets = resp.json().get("markets", [])
        # Filter for interesting markets
        return [m for m in markets if m.get("status") == "active"]
    except Exception as e:
        print(f"Error fetching live: {e}")
        return []

# =============================================================================
# SIGNAL ANALYSIS (from optimizer)
# =============================================================================

NEWS_CONTEXT = {
    "KXNOEMOUT": {
        "news": "Trump said will not step down, blunt no, very good job",
        "signal": -0.7,  # Bearish for "out" market
    },
    "KXFEDCHAIRNOM": {
        "news": "Trump down to one candidate, praised Rick Rieder",
        "signal": 0.5,
        "ticker_boost": {"RREI": 0.3}  # Boost for Rieder specifically
    },
    "KXGOVSHUT": {
        "news": "Democrats block DHS bill, chaos, deadline looming",
        "signal": 0.3,  # Slightly bullish for shutdown
    }
}

def calculate_edge(est_prob: float, market_price: float) -> float:
    return est_prob - market_price

def calculate_kelly(edge: float, price: float, fraction: float = 0.25) -> float:
    if edge <= 0 or price >= 0.99:
        return 0
    kelly = edge / (1 - price)
    return min(kelly * fraction, 0.15)

# =============================================================================
# MAIN MONITOR
# =============================================================================

def monitor_markets():
    """Monitor and analyze markets"""
    bankroll = 15.0
    
    print("\n" + "=" * 70)
    print(f"🎯 MARKET MONITOR - {datetime.now().strftime('%H:%M:%S')}")
    print("=" * 70)
    
    # Define series to monitor
    series_list = [
        "KXNOEMOUT",
        "KXFEDCHAIRNOM", 
        "KXGOVSHUT",
        "KXSB",  # Super Bowl
        "KXOSCARPIC",  # Oscars
    ]
    
    all_recommendations = []
    
    for series in series_list:
        markets = get_markets(series)
        context = NEWS_CONTEXT.get(series, {})
        base_signal = context.get("signal", 0)
        ticker_boosts = context.get("ticker_boost", {})
        
        for m in markets:
            if m.get("status") != "active":
                continue
                
            ticker = m.get("ticker", "")
            yes_bid = m.get("yes_bid", 0) / 100
            yes_ask = m.get("yes_ask", 0) / 100
            no_bid = m.get("no_bid", 0) / 100
            no_ask = m.get("no_ask", 0) / 100
            volume = m.get("volume", 0)
            
            # Calculate mid prices
            yes_mid = (yes_bid + yes_ask) / 2
            no_mid = (no_bid + no_ask) / 2
            
            # Apply signal
            signal = base_signal
            for suffix, boost in ticker_boosts.items():
                if suffix in ticker:
                    signal += boost
            
            if signal == 0:
                continue
            
            # Determine side
            if signal > 0:
                # Bullish on YES
                est_prob = min(0.99, yes_mid + signal * 0.1)
                edge = calculate_edge(est_prob, yes_ask)
                if edge > 0.02:
                    kelly = calculate_kelly(edge, yes_ask)
                    bet = kelly * bankroll
                    ev = edge * bet
                    all_recommendations.append({
                        "ticker": ticker,
                        "series": series,
                        "side": "YES",
                        "price": yes_ask,
                        "edge": edge,
                        "kelly": kelly,
                        "bet": bet,
                        "ev": ev,
                        "volume": volume
                    })
            else:
                # Bearish (bullish on NO)
                est_no_prob = min(0.99, no_mid + abs(signal) * 0.1)
                edge = calculate_edge(est_no_prob, no_ask)
                if edge > 0.02:
                    kelly = calculate_kelly(edge, no_ask)
                    bet = kelly * bankroll
                    ev = edge * bet
                    all_recommendations.append({
                        "ticker": ticker,
                        "series": series,
                        "side": "NO",
                        "price": no_ask,
                        "edge": edge,
                        "kelly": kelly,
                        "bet": bet,
                        "ev": ev,
                        "volume": volume
                    })
    
    # Sort by EV
    all_recommendations.sort(key=lambda x: x["ev"], reverse=True)
    
    print(f"\n📊 Found {len(all_recommendations)} opportunities\n")
    
    total_bet = 0
    total_ev = 0
    
    for i, rec in enumerate(all_recommendations[:10], 1):
        total_bet += rec["bet"]
        total_ev += rec["ev"]
        
        print(f"{i}. {rec['ticker']}")
        print(f"   {rec['side']} @ {rec['price']:.0%} | Edge: {rec['edge']*100:.1f}%")
        print(f"   Bet: ${rec['bet']:.2f} | EV: ${rec['ev']:.3f}")
        print()
    
    print("=" * 70)
    print(f"💰 Total Bets: ${total_bet:.2f}")
    print(f"💎 Total EV: ${total_ev:.3f}")
    if total_bet > 0:
        print(f"📈 ROI: {total_ev/total_bet*100:.1f}%")
    print("=" * 70)
    
    return all_recommendations

if __name__ == "__main__":
    monitor_markets()
