#!/usr/bin/env python3
"""
Settlement Price Accuracy Validator (T354/T619)
Compares our CoinGecko-based settlement prices against other sources.

Since we can't easily get Kalshi's official settlement prices via API,
we validate by comparing our prices against multiple exchange sources
at the same timestamps.
"""

import json
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
import urllib.request
import urllib.error

SETTLEMENTS_FILE = Path(__file__).parent / "kalshi-settlements.json"
SETTLEMENTS_FILE_V2 = Path(__file__).parent / "kalshi-settlements-v2.json"
OUTPUT_FILE = Path(__file__).parent.parent / "data/trading/settlement-validation.json"


def get_historical_price_coinbase(asset: str, timestamp: datetime) -> float | None:
    """Get historical price from Coinbase at specific timestamp."""
    product_id = f"{asset}-USD"
    
    # Coinbase candles endpoint with 1-minute granularity
    start_time = (timestamp - timedelta(minutes=1)).isoformat()
    end_time = (timestamp + timedelta(minutes=1)).isoformat()
    
    url = f"https://api.exchange.coinbase.com/products/{product_id}/candles?start={start_time}&end={end_time}&granularity=60"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.load(resp)
            if data:
                # Candles format: [timestamp, low, high, open, close, volume]
                # Return the close price of the nearest candle
                return float(data[0][4])  # Close price
    except Exception as e:
        print(f"Coinbase error for {asset}: {e}", file=sys.stderr)
    return None


def get_historical_price_coingecko(asset: str, timestamp: datetime) -> float | None:
    """Get historical price from CoinGecko at specific date."""
    coin_id = "bitcoin" if asset == "BTC" else "ethereum"
    date_str = timestamp.strftime("%d-%m-%Y")
    
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/history?date={date_str}&localization=false"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.load(resp)
            return data.get("market_data", {}).get("current_price", {}).get("usd")
    except Exception as e:
        print(f"CoinGecko error for {asset}: {e}", file=sys.stderr)
    return None


def load_settlements() -> dict:
    """Load settlements from both v1 and v2 files."""
    settlements = {}
    
    for path in [SETTLEMENTS_FILE, SETTLEMENTS_FILE_V2]:
        if path.exists():
            with open(path) as f:
                data = json.load(f)
                trades = data.get("trades", {})
                for ticker, info in trades.items():
                    if info.get("status") == "settled":
                        settlements[ticker] = {
                            "our_price": info.get("settlement_price"),
                            "expiry_time": info.get("expiry_time"),
                            "won": info.get("won"),
                            "source": "v2" if "v2" in str(path) else "v1",
                        }
    
    return settlements


def validate_settlements(limit: int = 10) -> dict:
    """Validate settlement prices against multiple sources."""
    settlements = load_settlements()
    
    if not settlements:
        print("No settled trades found to validate.")
        return {}
    
    results = {
        "validated_count": 0,
        "errors": [],
        "by_ticker": {},
        "summary": {
            "mean_absolute_error_coinbase": None,
            "max_error_coinbase": None,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    
    errors_coinbase = []
    
    # Sample a subset to avoid rate limits
    sample = list(settlements.items())[:limit]
    
    print(f"Validating {len(sample)} settlements...")
    
    for ticker, info in sample:
        our_price = info.get("our_price")
        expiry_time_str = info.get("expiry_time")
        
        if not our_price or not expiry_time_str:
            continue
        
        # Parse expiry time
        try:
            expiry_dt = datetime.fromisoformat(expiry_time_str.replace("Z", "+00:00"))
        except:
            continue
        
        # Determine asset from ticker
        asset = "BTC" if "KXBTCD" in ticker else "ETH"
        
        # Get comparison prices from Coinbase
        coinbase_price = get_historical_price_coinbase(asset, expiry_dt)
        time.sleep(0.3)  # Rate limit
        
        # Calculate errors
        result = {
            "our_price": our_price,
            "expiry_time": expiry_time_str,
            "asset": asset,
        }
        
        if coinbase_price:
            error_coinbase = abs(our_price - coinbase_price)
            error_pct_coinbase = (error_coinbase / coinbase_price) * 100
            result["coinbase_price"] = coinbase_price
            result["error_coinbase"] = error_coinbase
            result["error_pct_coinbase"] = error_pct_coinbase
            errors_coinbase.append(error_pct_coinbase)
        
        results["by_ticker"][ticker] = result
        results["validated_count"] += 1
        
        print(f"  {ticker}: our=${our_price:.2f}, coinbase=${coinbase_price or 'N/A'}")
    
    # Calculate summary stats
    if errors_coinbase:
        results["summary"]["mean_absolute_error_coinbase"] = sum(errors_coinbase) / len(errors_coinbase)
        results["summary"]["max_error_coinbase"] = max(errors_coinbase)
    
    return results


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Validate settlement price accuracy")
    parser.add_argument("--limit", type=int, default=10, help="Number of settlements to validate")
    parser.add_argument("--save", action="store_true", help="Save results to file")
    args = parser.parse_args()
    
    results = validate_settlements(limit=args.limit)
    
    if not results:
        return
    
    print("\n" + "="*60)
    print("VALIDATION SUMMARY")
    print("="*60)
    
    summary = results.get("summary", {})
    
    mae_coinbase = summary.get("mean_absolute_error_coinbase")
    max_coinbase = summary.get("max_error_coinbase")
    
    if mae_coinbase is not None:
        status = "✅ GOOD" if mae_coinbase < 0.5 else "⚠️ CHECK" if mae_coinbase < 1.0 else "❌ BAD"
        print(f"\nCoinbase Comparison:")
        print(f"  Mean Absolute Error: {mae_coinbase:.4f}%")
        print(f"  Max Error: {max_coinbase:.4f}%")
        print(f"  Status: {status}")
        
        if mae_coinbase >= 0.5:
            print("\n⚠️ WARNING: Settlement prices differ from Coinbase by >0.5%")
            print("   This could affect win/loss calculations.")
    else:
        print("\n❌ Could not validate against Coinbase (API error)")
    
    print(f"\nValidated {results['validated_count']} settlements.")
    
    if args.save:
        OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\nResults saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
