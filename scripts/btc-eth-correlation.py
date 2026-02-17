#!/usr/bin/env python3
"""
BTC/ETH Correlation Tracker

Calculates rolling correlation between Bitcoin and Ethereum prices.
Used to dynamically adjust crypto concentration limits:
- High correlation (>0.9): Treat BTC+ETH as single asset, lower combined limit
- Low correlation (<0.5): Allow higher combined exposure

Output: data/trading/asset-correlation.json
"""

import json
import os
import time
from datetime import datetime, timedelta
from pathlib import Path
import urllib.request
import urllib.error
from typing import Optional

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "trading"
OUTPUT_FILE = DATA_DIR / "asset-correlation.json"
CACHE_FILE = DATA_DIR / "price-history-cache.json"
HISTORY_FILE = DATA_DIR / "correlation-history.jsonl"  # T723 - track over time
ALERT_FILE = PROJECT_ROOT / "scripts" / "kalshi-correlation-change.alert"  # T724

# API settings
COINGECKO_BASE = "https://api.coingecko.com/api/v3"
BINANCE_BASE = "https://api.binance.com/api/v3"


def fetch_json(url: str, timeout: int = 10) -> Optional[dict]:
    """Fetch JSON from URL with error handling."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CorrelationTracker/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"⚠️ Error fetching {url}: {e}")
        return None


def get_historical_prices_coingecko(days: int = 7) -> Optional[dict]:
    """
    Fetch historical prices from CoinGecko.
    Returns dict with 'btc' and 'eth' lists of (timestamp, price) tuples.
    """
    result = {"btc": [], "eth": [], "source": "coingecko"}
    
    for coin_id, key in [("bitcoin", "btc"), ("ethereum", "eth")]:
        url = f"{COINGECKO_BASE}/coins/{coin_id}/market_chart?vs_currency=usd&days={days}"
        data = fetch_json(url)
        
        if not data or "prices" not in data:
            print(f"⚠️ Failed to fetch {coin_id} prices")
            return None
        
        # CoinGecko returns [[timestamp_ms, price], ...]
        result[key] = [(p[0] / 1000, p[1]) for p in data["prices"]]
        time.sleep(0.5)  # Rate limiting
    
    return result


def get_historical_prices_binance(days: int = 7) -> Optional[dict]:
    """
    Fetch historical prices from Binance Klines API.
    More reliable and doesn't require API key for public endpoints.
    """
    result = {"btc": [], "eth": [], "source": "binance"}
    
    end_time = int(time.time() * 1000)
    start_time = end_time - (days * 24 * 60 * 60 * 1000)
    
    for symbol, key in [("BTCUSDT", "btc"), ("ETHUSDT", "eth")]:
        # 1h klines for the past 7 days = ~168 data points
        url = f"{BINANCE_BASE}/klines?symbol={symbol}&interval=1h&startTime={start_time}&endTime={end_time}"
        data = fetch_json(url)
        
        if not data:
            print(f"⚠️ Failed to fetch {symbol} klines")
            return None
        
        # Binance klines: [open_time, open, high, low, close, volume, ...]
        # Use close price
        result[key] = [(k[0] / 1000, float(k[4])) for k in data]
        time.sleep(0.1)  # Binance is more lenient
    
    return result


def get_historical_prices(days: int = 7) -> Optional[dict]:
    """Try Binance first, fall back to CoinGecko."""
    
    # Check cache first
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r") as f:
                cache = json.load(f)
            
            cache_age = time.time() - cache.get("fetched_at", 0)
            if cache_age < 3600:  # Cache valid for 1 hour
                print(f"📦 Using cached price data ({cache_age/60:.0f}m old)")
                return cache
        except:
            pass
    
    print("📡 Fetching historical prices...")
    
    # Try Binance first (more reliable)
    data = get_historical_prices_binance(days)
    if not data:
        print("   Trying CoinGecko fallback...")
        data = get_historical_prices_coingecko(days)
    
    if data:
        data["fetched_at"] = time.time()
        data["days"] = days
        
        # Cache the data
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(CACHE_FILE, "w") as f:
            json.dump(data, f)
    
    return data


def calculate_correlation(btc_prices: list, eth_prices: list) -> float:
    """
    Calculate Pearson correlation coefficient between BTC and ETH prices.
    
    Returns value between -1 and 1:
    - 1.0: Perfect positive correlation
    - 0.0: No correlation
    - -1.0: Perfect negative correlation
    """
    if len(btc_prices) < 3 or len(eth_prices) < 3:
        return 0.0
    
    # Align timestamps - find common timestamps
    btc_dict = {int(t): p for t, p in btc_prices}
    eth_dict = {int(t): p for t, p in eth_prices}
    
    common_ts = sorted(set(btc_dict.keys()) & set(eth_dict.keys()))
    
    if len(common_ts) < 3:
        # No common timestamps, interpolate
        btc_ts = sorted(btc_dict.keys())
        eth_ts = sorted(eth_dict.keys())
        
        # Use overlapping time range
        start = max(btc_ts[0], eth_ts[0])
        end = min(btc_ts[-1], eth_ts[-1])
        
        # Sample at hourly intervals
        btc_vals = []
        eth_vals = []
        
        for ts in btc_ts:
            if start <= ts <= end:
                btc_vals.append(btc_dict[ts])
        
        for ts in eth_ts:
            if start <= ts <= end:
                eth_vals.append(eth_dict[ts])
        
        # Ensure same length
        min_len = min(len(btc_vals), len(eth_vals))
        btc_vals = btc_vals[:min_len]
        eth_vals = eth_vals[:min_len]
    else:
        btc_vals = [btc_dict[ts] for ts in common_ts]
        eth_vals = [eth_dict[ts] for ts in common_ts]
    
    if len(btc_vals) < 3:
        return 0.0
    
    # Calculate returns (percentage change)
    btc_returns = [(btc_vals[i] - btc_vals[i-1]) / btc_vals[i-1] 
                   for i in range(1, len(btc_vals))]
    eth_returns = [(eth_vals[i] - eth_vals[i-1]) / eth_vals[i-1] 
                   for i in range(1, len(eth_vals))]
    
    if len(btc_returns) < 2:
        return 0.0
    
    # Pearson correlation
    n = len(btc_returns)
    
    mean_btc = sum(btc_returns) / n
    mean_eth = sum(eth_returns) / n
    
    # Covariance
    cov = sum((btc_returns[i] - mean_btc) * (eth_returns[i] - mean_eth) 
              for i in range(n)) / n
    
    # Standard deviations
    std_btc = (sum((r - mean_btc) ** 2 for r in btc_returns) / n) ** 0.5
    std_eth = (sum((r - mean_eth) ** 2 for r in eth_returns) / n) ** 0.5
    
    if std_btc == 0 or std_eth == 0:
        return 0.0
    
    correlation = cov / (std_btc * std_eth)
    return max(-1.0, min(1.0, correlation))  # Clamp to [-1, 1]


def get_correlation_adjustment(correlation: float) -> dict:
    """
    Determine concentration limit adjustment based on correlation.
    
    Returns dict with:
    - crypto_group_limit: Max % for combined BTC+ETH
    - adjustment_reason: Human-readable explanation
    """
    if correlation >= 0.9:
        return {
            "crypto_group_limit": 30,  # Very correlated - treat as single asset
            "adjustment_reason": "Very high correlation (≥0.9) - BTC and ETH move together, reduce combined exposure",
            "risk_level": "high"
        }
    elif correlation >= 0.7:
        return {
            "crypto_group_limit": 40,  # Moderately correlated
            "adjustment_reason": "High correlation (0.7-0.9) - Some diversification benefit but still correlated",
            "risk_level": "medium"
        }
    elif correlation >= 0.5:
        return {
            "crypto_group_limit": 50,  # Default limit
            "adjustment_reason": "Moderate correlation (0.5-0.7) - Standard diversification rules apply",
            "risk_level": "normal"
        }
    else:
        return {
            "crypto_group_limit": 60,  # Low correlation - can have more exposure
            "adjustment_reason": "Low correlation (<0.5) - Good diversification between BTC/ETH, allow higher combined exposure",
            "risk_level": "low"
        }


def analyze_correlation(days: int = 7) -> dict:
    """Main analysis function."""
    
    prices = get_historical_prices(days)
    
    if not prices:
        return {
            "status": "error",
            "message": "Failed to fetch price data",
            "generated_at": datetime.now().isoformat()
        }
    
    btc_prices = prices.get("btc", [])
    eth_prices = prices.get("eth", [])
    
    print(f"   BTC data points: {len(btc_prices)}")
    print(f"   ETH data points: {len(eth_prices)}")
    
    # Calculate correlation
    correlation = calculate_correlation(btc_prices, eth_prices)
    adjustment = get_correlation_adjustment(correlation)
    
    # Get current prices for reference
    btc_current = btc_prices[-1][1] if btc_prices else None
    eth_current = eth_prices[-1][1] if eth_prices else None
    
    # Calculate price changes
    btc_change_7d = None
    eth_change_7d = None
    
    if btc_prices and len(btc_prices) > 1:
        btc_change_7d = ((btc_prices[-1][1] - btc_prices[0][1]) / btc_prices[0][1]) * 100
    
    if eth_prices and len(eth_prices) > 1:
        eth_change_7d = ((eth_prices[-1][1] - eth_prices[0][1]) / eth_prices[0][1]) * 100
    
    result = {
        "generated_at": datetime.now().isoformat(),
        "status": "success",
        "correlation": {
            "value": round(correlation, 4),
            "period_days": days,
            "interpretation": (
                "very_high" if correlation >= 0.9 else
                "high" if correlation >= 0.7 else
                "moderate" if correlation >= 0.5 else
                "low"
            ),
            "data_points": min(len(btc_prices), len(eth_prices))
        },
        "adjustment": adjustment,
        "current_prices": {
            "btc": round(btc_current, 2) if btc_current else None,
            "eth": round(eth_current, 2) if eth_current else None,
            "btc_7d_change_pct": round(btc_change_7d, 2) if btc_change_7d else None,
            "eth_7d_change_pct": round(eth_change_7d, 2) if eth_change_7d else None
        },
        "data_source": prices.get("source", "unknown")
    }
    
    return result


def load_previous_correlation() -> Optional[float]:
    """Load the most recent correlation from history to detect changes."""
    if not HISTORY_FILE.exists():
        return None
    
    try:
        # Read last line
        with open(HISTORY_FILE, 'r') as f:
            last_line = None
            for line in f:
                if line.strip():
                    last_line = line
            
            if last_line:
                data = json.loads(last_line)
                return data.get('correlation', {}).get('value')
    except Exception as e:
        print(f"Warning: Could not read previous correlation: {e}")
    
    return None


def log_to_history(result: dict):
    """Append correlation snapshot to history file (T723)."""
    try:
        history_entry = {
            "timestamp": result.get("generated_at"),
            "correlation": result.get("correlation", {}),
            "adjustment": result.get("adjustment", {}),
            "prices": result.get("current_prices", {}),
            "source": result.get("data_source")
        }
        
        with open(HISTORY_FILE, 'a') as f:
            f.write(json.dumps(history_entry) + '\n')
        
        print(f"   📝 Logged to history: {HISTORY_FILE}")
    except Exception as e:
        print(f"Warning: Could not log to history: {e}")


def check_and_alert_change(new_corr: float, old_corr: Optional[float]):
    """Create alert if correlation changed significantly (T724).
    
    Alert triggers if:
    - Crossed from <0.7 to ≥0.9 (became very correlated)
    - Crossed from ≥0.9 to <0.7 (became less correlated)
    """
    if old_corr is None:
        return  # No previous data to compare
    
    # Define thresholds
    significant_change = False
    message = ""
    
    # Check for regime change
    if old_corr < 0.7 and new_corr >= 0.9:
        significant_change = True
        message = f"⚠️ CORRELATION SPIKE: BTC/ETH correlation jumped from {old_corr:.2%} to {new_corr:.2%}. Crypto assets now highly correlated - reduce combined exposure to 30%!"
    elif old_corr >= 0.9 and new_corr < 0.7:
        significant_change = True
        message = f"📉 CORRELATION DROP: BTC/ETH correlation fell from {old_corr:.2%} to {new_corr:.2%}. Better diversification now - can increase combined crypto exposure."
    elif abs(new_corr - old_corr) >= 0.15:
        # Also alert on any large change (15%+)
        direction = "increased" if new_corr > old_corr else "decreased"
        message = f"📊 Correlation {direction}: BTC/ETH correlation changed from {old_corr:.2%} to {new_corr:.2%} ({abs(new_corr - old_corr):.2%} change)."
        significant_change = True
    
    if significant_change:
        try:
            alert_data = {
                "timestamp": datetime.now().isoformat(),
                "type": "correlation_change",
                "old_value": old_corr,
                "new_value": new_corr,
                "change": new_corr - old_corr,
                "message": message
            }
            with open(ALERT_FILE, 'w') as f:
                json.dump(alert_data, f, indent=2)
            print(f"\n🚨 Alert created: {ALERT_FILE}")
            print(f"   {message}")
        except Exception as e:
            print(f"Warning: Could not create alert: {e}")


def main():
    print("📊 Calculating BTC/ETH correlation...")
    
    # Load previous correlation for comparison (T724)
    previous_corr = load_previous_correlation()
    if previous_corr is not None:
        print(f"   Previous correlation: {previous_corr:.4f}")
    
    result = analyze_correlation(days=7)
    
    # Save output
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(result, f, indent=2)
    
    print(f"\n✅ Analysis saved to: {OUTPUT_FILE}")
    
    # Log to history (T723)
    if result["status"] == "success":
        log_to_history(result)
        
        # Check for significant changes and alert (T724)
        new_corr = result["correlation"]["value"]
        check_and_alert_change(new_corr, previous_corr)
    
    if result["status"] == "success":
        corr = result["correlation"]
        adj = result["adjustment"]
        prices = result["current_prices"]
        
        print(f"\n📈 Results (7-day rolling):")
        print(f"   Correlation: {corr['value']:.4f} ({corr['interpretation']})")
        print(f"   Data points: {corr['data_points']}")
        
        if prices["btc"]:
            print(f"\n💰 Current prices:")
            print(f"   BTC: ${prices['btc']:,.2f} ({prices['btc_7d_change_pct']:+.2f}% 7d)")
            print(f"   ETH: ${prices['eth']:,.2f} ({prices['eth_7d_change_pct']:+.2f}% 7d)")
        
        print(f"\n🎯 Concentration adjustment:")
        print(f"   Crypto group limit: {adj['crypto_group_limit']}%")
        print(f"   Risk level: {adj['risk_level']}")
        print(f"   Reason: {adj['adjustment_reason']}")
    else:
        print(f"\n⚠️ Error: {result.get('message', 'Unknown error')}")
    
    return result


if __name__ == "__main__":
    main()
