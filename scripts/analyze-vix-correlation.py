#!/usr/bin/env python3
"""
T332: Analyze correlation between VIX and crypto volatility.
VIX (CBOE Volatility Index) is a macro fear indicator that may improve
regime detection for crypto trading.

Usage:
    python3 scripts/analyze-vix-correlation.py [--days N]
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
import argparse

# Add scripts to path for imports
sys.path.insert(0, str(Path(__file__).parent))

try:
    import requests
except ImportError:
    print("Installing requests...")
    os.system("pip3 install requests -q")
    import requests

CACHE_DIR = Path(__file__).parent.parent / "data" / "trading"
VIX_CACHE = CACHE_DIR / "vix-history.json"
CORRELATION_OUTPUT = CACHE_DIR / "vix-correlation.json"


def get_vix_data(days: int = 30) -> list:
    """Fetch VIX historical data from Yahoo Finance via yfinance or API."""
    # Try to load from cache first
    if VIX_CACHE.exists():
        try:
            with open(VIX_CACHE) as f:
                cached = json.load(f)
            cache_age = datetime.now() - datetime.fromisoformat(cached.get("timestamp", "2000-01-01"))
            if cache_age.total_seconds() < 3600:  # 1 hour cache
                print(f"Using cached VIX data ({len(cached['data'])} points)")
                return cached["data"]
        except Exception as e:
            print(f"Cache read error: {e}")
    
    # Fetch from Yahoo Finance API (free, no auth needed)
    # Using query1.finance.yahoo.com
    end = int(datetime.now().timestamp())
    start = int((datetime.now() - timedelta(days=days)).timestamp())
    
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX"
    params = {
        "period1": start,
        "period2": end,
        "interval": "1d",
        "events": "history"
    }
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
    
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        result = data.get("chart", {}).get("result", [])
        if not result:
            print("No VIX data returned from Yahoo Finance")
            return []
        
        timestamps = result[0].get("timestamp", [])
        quotes = result[0].get("indicators", {}).get("quote", [{}])[0]
        closes = quotes.get("close", [])
        
        vix_data = []
        for i, ts in enumerate(timestamps):
            if closes[i] is not None:
                vix_data.append({
                    "date": datetime.fromtimestamp(ts).strftime("%Y-%m-%d"),
                    "close": round(closes[i], 2)
                })
        
        # Cache the data
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        with open(VIX_CACHE, "w") as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "data": vix_data
            }, f, indent=2)
        
        print(f"Fetched {len(vix_data)} days of VIX data")
        return vix_data
        
    except Exception as e:
        print(f"Error fetching VIX: {e}")
        return []


def get_crypto_volatility(asset: str = "btc", days: int = 30) -> dict:
    """Load crypto OHLC data and calculate daily volatility."""
    ohlc_file = CACHE_DIR.parent / "ohlc" / f"{asset}-ohlc.json"
    
    if not ohlc_file.exists():
        print(f"OHLC file not found: {ohlc_file}")
        return {}
    
    with open(ohlc_file) as f:
        ohlc = json.load(f)
    
    candles = ohlc.get("candles", [])
    if not candles:
        print(f"No candles in {ohlc_file}")
        return {}
    
    # Calculate daily volatility (high-low range / close)
    # Group candles by date and compute daily range
    daily_data = {}
    for candle in candles:
        # Handle both "date" and "datetime" formats
        date_str = candle.get("datetime", candle.get("date", ""))[:10]
        if not date_str:
            continue
        
        high = candle.get("high", 0)
        low = candle.get("low", 0)
        close = candle.get("close", 1)
        
        if date_str not in daily_data:
            daily_data[date_str] = {"high": high, "low": low, "close": close}
        else:
            # Update high/low for the day
            daily_data[date_str]["high"] = max(daily_data[date_str]["high"], high)
            daily_data[date_str]["low"] = min(daily_data[date_str]["low"], low)
            daily_data[date_str]["close"] = close  # Use last close
    
    # Calculate daily volatility
    volatility = {}
    for date, data in sorted(daily_data.items())[-days:]:
        if data["close"] > 0:
            daily_vol = ((data["high"] - data["low"]) / data["close"]) * 100
            volatility[date] = round(daily_vol, 2)
    
    return volatility


def calculate_correlation(vix_data: list, crypto_vol: dict) -> dict:
    """Calculate Pearson correlation between VIX and crypto volatility."""
    # Match dates
    matched_pairs = []
    for vix_point in vix_data:
        date = vix_point["date"]
        if date in crypto_vol:
            matched_pairs.append({
                "date": date,
                "vix": vix_point["close"],
                "crypto_vol": crypto_vol[date]
            })
    
    if len(matched_pairs) < 5:
        return {"error": "Not enough matched data points", "count": len(matched_pairs)}
    
    # Calculate means
    vix_values = [p["vix"] for p in matched_pairs]
    vol_values = [p["crypto_vol"] for p in matched_pairs]
    
    vix_mean = sum(vix_values) / len(vix_values)
    vol_mean = sum(vol_values) / len(vol_values)
    
    # Calculate Pearson correlation coefficient
    numerator = sum((v - vix_mean) * (c - vol_mean) for v, c in zip(vix_values, vol_values))
    
    vix_std = (sum((v - vix_mean) ** 2 for v in vix_values)) ** 0.5
    vol_std = (sum((c - vol_mean) ** 2 for c in vol_values)) ** 0.5
    
    if vix_std == 0 or vol_std == 0:
        correlation = 0
    else:
        correlation = numerator / (vix_std * vol_std)
    
    # VIX levels interpretation
    vix_current = vix_values[-1] if vix_values else 0
    if vix_current < 15:
        vix_regime = "low_fear"
    elif vix_current < 20:
        vix_regime = "moderate"
    elif vix_current < 30:
        vix_regime = "elevated"
    else:
        vix_regime = "high_fear"
    
    return {
        "correlation": round(correlation, 4),
        "data_points": len(matched_pairs),
        "vix_current": vix_current,
        "vix_mean": round(vix_mean, 2),
        "vix_std": round(vix_std / vix_mean * 100, 2) if vix_mean else 0,  # CV%
        "crypto_vol_mean": round(vol_mean, 2),
        "vix_regime": vix_regime,
        "matched_data": matched_pairs[-7:],  # Last 7 days for display
        "interpretation": interpret_correlation(correlation, vix_regime)
    }


def interpret_correlation(corr: float, vix_regime: str) -> str:
    """Interpret the correlation and provide trading insights."""
    insights = []
    
    # Correlation strength
    abs_corr = abs(corr)
    if abs_corr > 0.7:
        strength = "strong"
    elif abs_corr > 0.4:
        strength = "moderate"
    elif abs_corr > 0.2:
        strength = "weak"
    else:
        strength = "negligible"
    
    direction = "positive" if corr > 0 else "negative"
    
    insights.append(f"{strength.title()} {direction} correlation ({corr:.2f})")
    
    # Trading implications
    if corr > 0.4:
        insights.append("VIX spikes may precede crypto vol spikes - consider reducing position sizes when VIX rises")
    elif corr < -0.4:
        insights.append("Inverse relationship - crypto may rally when VIX spikes (risk-on for crypto)")
    else:
        insights.append("Weak correlation - VIX not strongly predictive of crypto vol")
    
    # Current regime advice
    if vix_regime == "high_fear":
        insights.append("⚠️ HIGH VIX: Consider wider stop-losses, smaller positions")
    elif vix_regime == "elevated":
        insights.append("📊 ELEVATED VIX: Market uncertainty, stay cautious")
    elif vix_regime == "low_fear":
        insights.append("✅ LOW VIX: Calm markets, normal position sizing")
    
    return " | ".join(insights)


def main():
    parser = argparse.ArgumentParser(description="Analyze VIX correlation with crypto volatility")
    parser.add_argument("--days", type=int, default=30, help="Number of days to analyze")
    parser.add_argument("--asset", choices=["btc", "eth"], default="btc", help="Crypto asset")
    args = parser.parse_args()
    
    print(f"\n{'='*60}")
    print(f"VIX-Crypto Correlation Analysis")
    print(f"Asset: {args.asset.upper()} | Days: {args.days}")
    print(f"{'='*60}\n")
    
    # Fetch VIX data
    vix_data = get_vix_data(args.days)
    if not vix_data:
        print("❌ Could not fetch VIX data")
        return
    
    # Get crypto volatility
    crypto_vol = get_crypto_volatility(args.asset, args.days)
    if not crypto_vol:
        print("❌ Could not load crypto volatility data")
        return
    
    # Calculate correlation
    result = calculate_correlation(vix_data, crypto_vol)
    
    if "error" in result:
        print(f"❌ {result['error']}")
        return
    
    # Display results
    print(f"📊 Results:")
    print(f"   Correlation coefficient: {result['correlation']}")
    print(f"   Data points matched: {result['data_points']}")
    print(f"   VIX current: {result['vix_current']} ({result['vix_regime'].replace('_', ' ')})")
    print(f"   VIX mean (30d): {result['vix_mean']} (±{result['vix_std']}%)")
    print(f"   {args.asset.upper()} vol mean: {result['crypto_vol_mean']}%")
    print()
    print(f"💡 Interpretation:")
    for insight in result['interpretation'].split(" | "):
        print(f"   • {insight}")
    print()
    
    # Show recent data
    print(f"📅 Last 7 days:")
    print(f"   {'Date':<12} {'VIX':<8} {f'{args.asset.upper()} Vol%':<10}")
    print(f"   {'-'*30}")
    for point in result['matched_data']:
        print(f"   {point['date']:<12} {point['vix']:<8} {point['crypto_vol']:<10}")
    
    # Save results
    CORRELATION_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    result["asset"] = args.asset
    result["timestamp"] = datetime.now().isoformat()
    with open(CORRELATION_OUTPUT, "w") as f:
        json.dump(result, f, indent=2)
    print(f"\n✅ Results saved to {CORRELATION_OUTPUT}")


if __name__ == "__main__":
    main()
