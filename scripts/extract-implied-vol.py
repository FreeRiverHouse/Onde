#!/usr/bin/env python3
"""
Extract Implied Volatility from Kalshi Binary Option Prices

Reverse-engineers implied volatility from Kalshi market prices using a 
log-normal model. Compares to realized volatility to find potential mispricings.

High IV vs Low Realized = Overpriced options (sell premium via NO bets)
Low IV vs High Realized = Underpriced options (buy premium via YES bets)

Usage: python3 extract-implied-vol.py [--output JSON_FILE]
"""

import os
import sys
import json
import math
import argparse
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Add scripts dir for imports
sys.path.insert(0, str(Path(__file__).parent))

# We'll use scipy for optimization if available, else use binary search
try:
    from scipy.optimize import brentq
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False

import requests

# ============== CONFIG ==============
BASE_URL = "https://api.elections.kalshi.com"
BTC_TICKER_SERIES = "KXBTCD"
ETH_TICKER_SERIES = "KXETHD"

# Realized vol assumptions (from autotrader)
ASSUMED_HOURLY_VOL = {
    "BTC": 0.005,  # 0.5%
    "ETH": 0.007,  # 0.7%
}


def get_crypto_prices():
    """Fetch current BTC and ETH prices from CoinGecko."""
    try:
        resp = requests.get(
            "https://api.coingecko.com/api/v3/simple/price",
            params={"ids": "bitcoin,ethereum", "vs_currencies": "usd"},
            timeout=10
        )
        data = resp.json()
        prices = {
            "BTC": data.get("bitcoin", {}).get("usd", 100000),
            "ETH": data.get("ethereum", {}).get("usd", 3000),
        }
        return prices
    except Exception as e:
        print(f"⚠️ Failed to fetch prices from CoinGecko: {e}")
        # Fallback to Coinbase
        try:
            btc_resp = requests.get("https://api.coinbase.com/v2/prices/BTC-USD/spot", timeout=5)
            eth_resp = requests.get("https://api.coinbase.com/v2/prices/ETH-USD/spot", timeout=5)
            return {
                "BTC": float(btc_resp.json()["data"]["amount"]),
                "ETH": float(eth_resp.json()["data"]["amount"]),
            }
        except Exception as e2:
            print(f"⚠️ Coinbase fallback also failed: {e2}")
            return {"BTC": 100000, "ETH": 3000}  # Final fallback


def log_normal_prob(current_price, strike, vol, time_hours, side="above"):
    """
    Calculate probability of price being above/below strike.
    Uses log-normal model.
    """
    if time_hours <= 0:
        return 1.0 if current_price > strike else 0.0
    
    sigma_t = vol * math.sqrt(time_hours)
    if sigma_t <= 0:
        return 0.5
    
    d = math.log(current_price / strike) / sigma_t
    prob_above = 0.5 * (1 + math.erf(d / math.sqrt(2)))
    
    return prob_above if side == "above" else (1 - prob_above)


def implied_vol_from_price(current_price, strike, time_hours, market_prob, side="above"):
    """
    Reverse-engineer implied volatility from market price.
    
    market_prob: The market's YES price as probability (e.g., 0.65 for 65¢)
    """
    if time_hours <= 0 or market_prob <= 0 or market_prob >= 1:
        return None
    
    # Binary search for implied vol
    def objective(vol):
        model_prob = log_normal_prob(current_price, strike, vol, time_hours, side)
        return model_prob - market_prob
    
    # Try to find IV between 0.1% and 20% hourly
    try:
        if HAS_SCIPY:
            iv = brentq(objective, 0.0001, 0.20, xtol=1e-6)
        else:
            # Simple binary search
            low, high = 0.0001, 0.20
            for _ in range(50):
                mid = (low + high) / 2
                diff = objective(mid)
                if abs(diff) < 1e-6:
                    break
                if diff > 0:
                    high = mid
                else:
                    low = mid
            iv = (low + high) / 2
        return iv
    except (ValueError, RuntimeError):
        return None


def fetch_markets(asset="BTC"):
    """Fetch active Kalshi markets for asset."""
    ticker_series = BTC_TICKER_SERIES if asset == "BTC" else ETH_TICKER_SERIES
    now = datetime.now(timezone.utc)
    
    try:
        resp = requests.get(
            f"{BASE_URL}/trade-api/v2/markets",
            params={
                "series_ticker": ticker_series,
                "status": "open",
                "limit": 100,
            },
            timeout=10
        )
        resp.raise_for_status()
        markets = resp.json().get("markets", [])
        
        # Filter to active markets with reasonable time
        active = []
        for m in markets:
            close_time = datetime.fromisoformat(m["close_time"].replace("Z", "+00:00"))
            minutes_left = (close_time - now).total_seconds() / 60
            if minutes_left > 15 and minutes_left < 1500:  # 15min to 25h
                active.append({
                    "ticker": m["ticker"],
                    "strike": m.get("floor_strike", 0),
                    "yes_bid": m.get("yes_bid", 0) / 100 if m.get("yes_bid") else None,
                    "yes_ask": m.get("yes_ask", 0) / 100 if m.get("yes_ask") else None,
                    "no_bid": m.get("no_bid", 0) / 100 if m.get("no_bid") else None,
                    "no_ask": m.get("no_ask", 0) / 100 if m.get("no_ask") else None,
                    "last_price": m.get("last_price", 0) / 100 if m.get("last_price") else None,
                    "close_time": close_time,
                    "minutes_left": minutes_left,
                })
        return active
    except Exception as e:
        print(f"⚠️ Failed to fetch {asset} markets: {e}")
        return []


def calculate_realized_vol(asset="BTC", hours=24):
    """Calculate realized volatility from cached OHLC data."""
    cache_file = Path(__file__).parent.parent / "data" / "ohlc" / f"{asset.lower()}-ohlc.json"
    
    if not cache_file.exists():
        return ASSUMED_HOURLY_VOL.get(asset, 0.005)
    
    try:
        with open(cache_file) as f:
            data = json.load(f)
        
        candles = data.get("candles", [])
        if len(candles) < 2:
            return ASSUMED_HOURLY_VOL.get(asset, 0.005)
        
        # Get last N hours of returns
        returns = []
        for i in range(1, min(len(candles), hours + 1)):
            prev_close = candles[-(i+1)]["close"]
            curr_close = candles[-i]["close"]
            if prev_close > 0:
                ret = math.log(curr_close / prev_close)
                returns.append(ret)
        
        if len(returns) < 2:
            return ASSUMED_HOURLY_VOL.get(asset, 0.005)
        
        # Calculate std dev (hourly volatility)
        mean = sum(returns) / len(returns)
        variance = sum((r - mean) ** 2 for r in returns) / (len(returns) - 1)
        hourly_vol = math.sqrt(variance)
        
        return hourly_vol
    except Exception as e:
        print(f"⚠️ Failed to calculate realized vol for {asset}: {e}")
        return ASSUMED_HOURLY_VOL.get(asset, 0.005)


def analyze_implied_vol(asset="BTC"):
    """Analyze implied vol across all active markets for an asset."""
    current_prices = get_crypto_prices()
    current_price = current_prices.get(asset, 100000)
    
    markets = fetch_markets(asset)
    if not markets:
        print(f"No active {asset} markets found")
        return []
    
    realized_vol = calculate_realized_vol(asset, hours=24)
    print(f"\n📊 {asset} Analysis")
    print(f"   Current price: ${current_price:,.2f}")
    print(f"   Realized vol (24h): {realized_vol*100:.3f}%/hour")
    print(f"   Assumed vol: {ASSUMED_HOURLY_VOL[asset]*100:.3f}%/hour")
    print(f"   Active markets: {len(markets)}")
    
    results = []
    for m in markets:
        strike = m["strike"]
        if strike <= 0:
            continue
            
        time_hours = m["minutes_left"] / 60
        
        # Use midpoint of bid-ask if available, else last price
        if m["yes_bid"] and m["yes_ask"]:
            market_yes_prob = (m["yes_bid"] + m["yes_ask"]) / 2
        elif m["last_price"]:
            market_yes_prob = m["last_price"]
        else:
            continue
        
        # Skip extreme prices
        if market_yes_prob <= 0.05 or market_yes_prob >= 0.95:
            continue
        
        # Extract implied vol
        iv = implied_vol_from_price(
            current_price, strike, time_hours, market_yes_prob, side="above"
        )
        
        if iv is None:
            continue
        
        # Calculate edge signal
        vol_ratio = iv / realized_vol if realized_vol > 0 else 1.0
        
        # High IV vs realized = overpriced YES (sell via NO)
        # Low IV vs realized = underpriced YES (buy via YES)
        if vol_ratio > 1.2:
            signal = "SELL_YES"  # Options overpriced
            edge_pct = (vol_ratio - 1) * 100
        elif vol_ratio < 0.8:
            signal = "BUY_YES"  # Options underpriced
            edge_pct = (1 - vol_ratio) * 100
        else:
            signal = "NEUTRAL"
            edge_pct = 0
        
        results.append({
            "ticker": m["ticker"],
            "asset": asset,
            "strike": strike,
            "current_price": current_price,
            "time_hours": round(time_hours, 2),
            "market_yes_prob": round(market_yes_prob, 4),
            "implied_vol_hourly": round(iv, 6),
            "implied_vol_pct": round(iv * 100, 3),
            "realized_vol_hourly": round(realized_vol, 6),
            "realized_vol_pct": round(realized_vol * 100, 3),
            "vol_ratio": round(vol_ratio, 3),
            "signal": signal,
            "edge_pct": round(edge_pct, 1),
        })
    
    # Sort by vol_ratio deviation from 1.0
    results.sort(key=lambda x: abs(x["vol_ratio"] - 1.0), reverse=True)
    
    return results


def print_results(results, top_n=15):
    """Pretty-print IV analysis results."""
    if not results:
        print("No results to display")
        return
    
    print(f"\n{'Ticker':<30} {'Strike':>10} {'Time':>6} {'MktP':>6} "
          f"{'IV%':>8} {'RV%':>8} {'Ratio':>7} {'Signal':>10} {'Edge':>6}")
    print("-" * 110)
    
    for r in results[:top_n]:
        ticker_short = r["ticker"][-25:] if len(r["ticker"]) > 25 else r["ticker"]
        signal_color = ""
        if r["signal"] == "SELL_YES":
            signal_color = "🔴"
        elif r["signal"] == "BUY_YES":
            signal_color = "🟢"
        else:
            signal_color = "⚪"
        
        print(f"{ticker_short:<30} ${r['strike']:>8,.0f} {r['time_hours']:>5.1f}h "
              f"{r['market_yes_prob']*100:>5.1f}% {r['implied_vol_pct']:>7.3f}% "
              f"{r['realized_vol_pct']:>7.3f}% {r['vol_ratio']:>6.2f}x "
              f"{signal_color} {r['signal']:<8} {r['edge_pct']:>5.1f}%")


def main():
    parser = argparse.ArgumentParser(description="Extract implied volatility from Kalshi prices")
    parser.add_argument("--output", "-o", help="Output JSON file")
    parser.add_argument("--asset", "-a", choices=["BTC", "ETH", "ALL"], default="ALL",
                       help="Asset to analyze")
    args = parser.parse_args()
    
    print(f"=== Kalshi Implied Volatility Analysis - {datetime.now(timezone.utc).isoformat()} ===")
    print(f"Using scipy: {HAS_SCIPY}")
    
    all_results = []
    
    if args.asset in ["BTC", "ALL"]:
        btc_results = analyze_implied_vol("BTC")
        print_results(btc_results)
        all_results.extend(btc_results)
        
        # Stats
        if btc_results:
            avg_iv = sum(r["implied_vol_pct"] for r in btc_results) / len(btc_results)
            avg_ratio = sum(r["vol_ratio"] for r in btc_results) / len(btc_results)
            sell_count = len([r for r in btc_results if r["signal"] == "SELL_YES"])
            buy_count = len([r for r in btc_results if r["signal"] == "BUY_YES"])
            print(f"\n📈 BTC Summary: Avg IV={avg_iv:.3f}%, Avg Ratio={avg_ratio:.2f}x, "
                  f"Sell signals: {sell_count}, Buy signals: {buy_count}")
    
    if args.asset in ["ETH", "ALL"]:
        eth_results = analyze_implied_vol("ETH")
        print_results(eth_results)
        all_results.extend(eth_results)
        
        if eth_results:
            avg_iv = sum(r["implied_vol_pct"] for r in eth_results) / len(eth_results)
            avg_ratio = sum(r["vol_ratio"] for r in eth_results) / len(eth_results)
            sell_count = len([r for r in eth_results if r["signal"] == "SELL_YES"])
            buy_count = len([r for r in eth_results if r["signal"] == "BUY_YES"])
            print(f"\n📈 ETH Summary: Avg IV={avg_iv:.3f}%, Avg Ratio={avg_ratio:.2f}x, "
                  f"Sell signals: {sell_count}, Buy signals: {buy_count}")
    
    # Save output
    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w") as f:
            json.dump({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "results": all_results,
            }, f, indent=2)
        print(f"\n✅ Saved to {args.output}")
    
    print("\n💡 Interpretation:")
    print("   - SELL_YES: IV > Realized (options overpriced) → Consider NO bets")
    print("   - BUY_YES: IV < Realized (options underpriced) → Consider YES bets")
    print("   - Ratio > 1.2 or < 0.8 suggests potential mispricing")


if __name__ == "__main__":
    main()
