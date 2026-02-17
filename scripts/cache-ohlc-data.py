#!/usr/bin/env python3
"""
Cache historical OHLC data from CoinGecko.
Reduces API calls and enables faster backtesting.

Usage: python cache-ohlc-data.py [--days N]

Cron: Run daily at 00:30 UTC
0 30 * * * cd /Users/mattia/Projects/Onde && python scripts/cache-ohlc-data.py >> scripts/ohlc-cache.log 2>&1
"""

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
import urllib.request
import urllib.error

# Config
CACHE_DIR = Path(__file__).parent.parent / "data" / "ohlc"
ASSETS = {
    "bitcoin": "BTC",
    "ethereum": "ETH"
}
DAYS_TO_CACHE = 90  # Default days of history
API_DELAY = 1.2  # Rate limit: ~50 calls/min

def fetch_ohlc(coin_id: str, days: int = 90) -> list:
    """Fetch OHLC data from CoinGecko."""
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/ohlc?vs_currency=usd&days={days}"
    
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": "Onde-OHLC-Cache/1.0",
                "Accept": "application/json"
            })
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
                return data
        except urllib.error.HTTPError as e:
            if e.code == 429:  # Rate limited
                wait = 2 ** (attempt + 1)
                print(f"  Rate limited, waiting {wait}s...")
                time.sleep(wait)
            else:
                raise
        except Exception as e:
            if attempt < 2:
                time.sleep(2)
            else:
                raise
    return []

def save_cache(symbol: str, data: list):
    """Save OHLC data to cache file."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    
    # Convert to more useful format
    formatted = []
    for candle in data:
        ts, o, h, l, c = candle
        formatted.append({
            "timestamp": ts,
            "datetime": datetime.fromtimestamp(ts/1000, tz=timezone.utc).isoformat(),
            "open": o,
            "high": h,
            "low": l,
            "close": c
        })
    
    cache_file = CACHE_DIR / f"{symbol.lower()}-ohlc.json"
    with open(cache_file, "w") as f:
        json.dump({
            "symbol": symbol,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "count": len(formatted),
            "candles": formatted
        }, f, indent=2)
    
    print(f"  Saved {len(formatted)} candles to {cache_file}")
    return cache_file

def load_cache(symbol: str) -> dict | None:
    """Load cached OHLC data."""
    cache_file = CACHE_DIR / f"{symbol.lower()}-ohlc.json"
    if cache_file.exists():
        with open(cache_file) as f:
            return json.load(f)
    return None

def is_cache_stale(symbol: str, max_age_hours: int = 24) -> bool:
    """Check if cache needs refresh."""
    cache = load_cache(symbol)
    if not cache:
        return True
    
    updated = datetime.fromisoformat(cache["updated_at"].replace("Z", "+00:00"))
    age = datetime.now(timezone.utc) - updated
    return age.total_seconds() > max_age_hours * 3600

def main():
    days = DAYS_TO_CACHE
    if "--days" in sys.argv:
        idx = sys.argv.index("--days")
        if idx + 1 < len(sys.argv):
            days = int(sys.argv[idx + 1])
    
    force = "--force" in sys.argv
    
    print(f"=== OHLC Cache Update - {datetime.now(timezone.utc).isoformat()} ===")
    print(f"Caching {days} days of data")
    
    for coin_id, symbol in ASSETS.items():
        print(f"\n{symbol}:")
        
        if not force and not is_cache_stale(symbol):
            print("  Cache is fresh, skipping")
            continue
        
        print(f"  Fetching {days} days from CoinGecko...")
        data = fetch_ohlc(coin_id, days)
        
        if data:
            save_cache(symbol, data)
        else:
            print(f"  ERROR: No data received")
        
        time.sleep(API_DELAY)  # Rate limit between assets
    
    print(f"\n✅ Cache update complete")

if __name__ == "__main__":
    main()
