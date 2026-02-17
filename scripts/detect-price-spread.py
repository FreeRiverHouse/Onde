#!/usr/bin/env python3
"""
Price Spread Anomaly Detection

Detects when BTC/ETH price spread between exchanges exceeds threshold.
Could indicate exchange issues, arbitrage opportunity, or manipulation.

Usage:
    python3 scripts/detect-price-spread.py [--threshold 1.0] [--continuous] [--interval 60]

Options:
    --threshold   Price spread % to trigger alert (default: 1.0)
    --continuous  Keep running and checking periodically
    --interval    Seconds between checks in continuous mode (default: 60)
"""

import os
import sys
import json
import time
import argparse
import requests
from datetime import datetime, timezone
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
ANOMALY_LOG = SCRIPT_DIR / "price-anomalies.jsonl"
ALERT_FILE = SCRIPT_DIR / "kalshi-price-spread.alert"
COOLDOWN_FILE = SCRIPT_DIR / "price-spread-cooldown.json"

# Config
DEFAULT_THRESHOLD = 1.0  # 1% spread
COOLDOWN_MINUTES = 30


def get_price_binance(asset: str) -> float | None:
    """Fetch price from Binance."""
    try:
        symbol = f"{asset}USDT"
        resp = requests.get(
            f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}",
            timeout=5
        )
        if resp.ok:
            return float(resp.json()["price"])
    except Exception as e:
        print(f"  ⚠️  Binance {asset}: {e}")
    return None


def get_price_coingecko(asset: str) -> float | None:
    """Fetch price from CoinGecko."""
    try:
        coin_id = "bitcoin" if asset == "BTC" else "ethereum"
        resp = requests.get(
            f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=usd",
            timeout=10
        )
        if resp.ok:
            return resp.json()[coin_id]["usd"]
    except Exception as e:
        print(f"  ⚠️  CoinGecko {asset}: {e}")
    return None


def get_price_coinbase(asset: str) -> float | None:
    """Fetch price from Coinbase."""
    try:
        resp = requests.get(
            f"https://api.coinbase.com/v2/prices/{asset}-USD/spot",
            timeout=5
        )
        if resp.ok:
            return float(resp.json()["data"]["amount"])
    except Exception as e:
        print(f"  ⚠️  Coinbase {asset}: {e}")
    return None


def get_all_prices(asset: str) -> dict:
    """Get prices from all exchanges."""
    prices = {}
    
    p = get_price_binance(asset)
    if p:
        prices["binance"] = p
    
    p = get_price_coingecko(asset)
    if p:
        prices["coingecko"] = p
    
    p = get_price_coinbase(asset)
    if p:
        prices["coinbase"] = p
    
    return prices


def calculate_spread(prices: dict) -> tuple[float, str, str]:
    """
    Calculate max spread between exchanges.
    Returns: (spread_pct, high_exchange, low_exchange)
    """
    if len(prices) < 2:
        return 0.0, "", ""
    
    exchanges = list(prices.keys())
    max_spread = 0.0
    high_ex = ""
    low_ex = ""
    
    for i, ex1 in enumerate(exchanges):
        for ex2 in exchanges[i+1:]:
            p1 = prices[ex1]
            p2 = prices[ex2]
            spread = abs(p1 - p2) / min(p1, p2) * 100
            if spread > max_spread:
                max_spread = spread
                if p1 > p2:
                    high_ex, low_ex = ex1, ex2
                else:
                    high_ex, low_ex = ex2, ex1
    
    return max_spread, high_ex, low_ex


def check_cooldown() -> bool:
    """Check if we're in cooldown period."""
    if not COOLDOWN_FILE.exists():
        return False
    
    try:
        data = json.loads(COOLDOWN_FILE.read_text())
        last_alert = datetime.fromisoformat(data["last_alert"])
        elapsed = (datetime.now(timezone.utc) - last_alert).total_seconds() / 60
        return elapsed < COOLDOWN_MINUTES
    except:
        return False


def set_cooldown():
    """Set cooldown timestamp."""
    COOLDOWN_FILE.write_text(json.dumps({
        "last_alert": datetime.now(timezone.utc).isoformat()
    }))


def log_anomaly(asset: str, spread: float, prices: dict, high_ex: str, low_ex: str):
    """Log anomaly to JSONL file."""
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "asset": asset,
        "spread_pct": round(spread, 4),
        "prices": prices,
        "high_exchange": high_ex,
        "low_exchange": low_ex
    }
    
    with open(ANOMALY_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")
    
    print(f"  📝 Logged anomaly to {ANOMALY_LOG.name}")


def write_alert(asset: str, spread: float, prices: dict, high_ex: str, low_ex: str):
    """Write alert file for heartbeat pickup."""
    if check_cooldown():
        print(f"  ⏳ In cooldown, skipping alert")
        return
    
    alert_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "asset": asset,
        "spread_pct": round(spread, 4),
        "prices": prices,
        "high_exchange": high_ex,
        "low_exchange": low_ex,
        "message": f"⚠️ PRICE SPREAD ANOMALY: {asset} shows {spread:.2f}% spread!\n"
                   f"• {high_ex.title()}: ${prices[high_ex]:,.2f}\n"
                   f"• {low_ex.title()}: ${prices[low_ex]:,.2f}\n"
                   f"Possible: exchange issue, arbitrage opportunity, or manipulation."
    }
    
    ALERT_FILE.write_text(json.dumps(alert_data, indent=2))
    set_cooldown()
    print(f"  🚨 Alert written to {ALERT_FILE.name}")


def check_prices(threshold: float, alert: bool = True):
    """Check prices for all assets."""
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    print(f"\n🔍 Checking prices at {now}")
    
    anomalies = []
    
    for asset in ["BTC", "ETH"]:
        print(f"\n  {asset}:")
        prices = get_all_prices(asset)
        
        if len(prices) < 2:
            print(f"    ⚠️  Only {len(prices)} source(s), cannot compare")
            continue
        
        # Show all prices
        for ex, price in sorted(prices.items()):
            print(f"    • {ex.title()}: ${price:,.2f}")
        
        spread, high_ex, low_ex = calculate_spread(prices)
        print(f"    → Spread: {spread:.4f}%")
        
        if spread >= threshold:
            print(f"    🚨 ANOMALY DETECTED! ({spread:.2f}% >= {threshold}%)")
            log_anomaly(asset, spread, prices, high_ex, low_ex)
            
            if alert:
                write_alert(asset, spread, prices, high_ex, low_ex)
            
            anomalies.append({
                "asset": asset,
                "spread": spread,
                "prices": prices,
                "high_ex": high_ex,
                "low_ex": low_ex
            })
        else:
            print(f"    ✅ Normal spread")
    
    return anomalies


def show_history():
    """Show recent anomaly history."""
    if not ANOMALY_LOG.exists():
        print("📊 No anomaly history yet")
        return
    
    lines = ANOMALY_LOG.read_text().strip().split("\n")
    entries = [json.loads(line) for line in lines[-20:]]
    
    print(f"\n📊 Recent Anomalies (last {len(entries)}):\n")
    
    for entry in entries:
        ts = entry["timestamp"][:16].replace("T", " ")
        asset = entry["asset"]
        spread = entry["spread_pct"]
        high = entry["high_exchange"]
        low = entry["low_exchange"]
        print(f"  {ts} | {asset} | {spread:.2f}% | {high} > {low}")


def main():
    parser = argparse.ArgumentParser(description="Detect price spread anomalies")
    parser.add_argument("--threshold", type=float, default=DEFAULT_THRESHOLD,
                        help=f"Spread %% threshold (default: {DEFAULT_THRESHOLD})")
    parser.add_argument("--continuous", action="store_true",
                        help="Run continuously")
    parser.add_argument("--interval", type=int, default=60,
                        help="Seconds between checks (default: 60)")
    parser.add_argument("--history", action="store_true",
                        help="Show anomaly history")
    parser.add_argument("--no-alert", action="store_true",
                        help="Don't write alert file")
    
    args = parser.parse_args()
    
    if args.history:
        show_history()
        return
    
    print(f"🔎 Price Spread Anomaly Detector")
    print(f"   Threshold: {args.threshold}%")
    print(f"   Mode: {'continuous' if args.continuous else 'single check'}")
    
    if args.continuous:
        print(f"   Interval: {args.interval}s")
        print("\n   Press Ctrl+C to stop\n")
        
        try:
            while True:
                check_prices(args.threshold, alert=not args.no_alert)
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\n\n👋 Stopped")
    else:
        anomalies = check_prices(args.threshold, alert=not args.no_alert)
        
        if anomalies:
            print(f"\n⚠️  Found {len(anomalies)} anomaly(ies)")
            sys.exit(1)
        else:
            print(f"\n✅ All spreads normal")


if __name__ == "__main__":
    main()
