#!/usr/bin/env python3
"""
Weekly Volatility Calibration Check (T417)

Compares realized 7-day volatility vs model assumptions:
- BTC_HOURLY_VOL = 0.005 (0.5%)
- ETH_HOURLY_VOL = 0.007 (0.7%)

Alerts if off by >20%. Helps keep model calibrated.

Usage: python3 scripts/check-volatility-calibration.py
Cron: 0 8 * * 0 (Sundays at 8 AM UTC)
"""

import json
import os
from pathlib import Path
from datetime import datetime, timezone
import math

# Model assumptions (from autotrader)
BTC_HOURLY_VOL = 0.005  # 0.5%
ETH_HOURLY_VOL = 0.007  # 0.7%

OHLC_DIR = Path("data/ohlc")
ALERT_FILE = Path("scripts/kalshi-vol-calibration.alert")
CALIBRATION_LOG = Path("data/trading/volatility-calibration.json")

CALIBRATION_THRESHOLD = 0.20  # Alert if >20% off


def load_cached_ohlc(asset: str) -> list:
    """Load cached OHLC data"""
    # Try both naming conventions
    cache_file = OHLC_DIR / f"{asset}-ohlc.json"
    if not cache_file.exists():
        cache_file = OHLC_DIR / f"{asset}_ohlc.json"
    if not cache_file.exists():
        return []
    
    with open(cache_file) as f:
        data = json.load(f)
    
    # Try both key names
    return data.get("candles", data.get("ohlc", []))


def calculate_realized_volatility(ohlc: list, days: int = 7) -> float:
    """
    Calculate realized hourly volatility from OHLC data.
    
    Uses log returns: vol = std(ln(close[t]/close[t-1]))
    Annualized vol = daily vol * sqrt(365)
    Hourly vol = daily vol / sqrt(24)
    """
    if len(ohlc) < 2:
        return None
    
    # Take last N days of hourly candles (24 candles per day)
    candles_needed = days * 24
    recent = ohlc[-candles_needed:] if len(ohlc) >= candles_needed else ohlc
    
    # Calculate hourly log returns
    log_returns = []
    for i in range(1, len(recent)):
        close_prev = recent[i-1].get("close", 0)
        close_curr = recent[i].get("close", 0)
        
        if close_prev > 0 and close_curr > 0:
            log_return = math.log(close_curr / close_prev)
            log_returns.append(log_return)
    
    if len(log_returns) < 10:
        return None
    
    # Calculate standard deviation of hourly returns
    mean_return = sum(log_returns) / len(log_returns)
    variance = sum((r - mean_return) ** 2 for r in log_returns) / len(log_returns)
    hourly_vol = math.sqrt(variance)
    
    return hourly_vol


def check_calibration():
    """Check if model volatility assumptions match realized volatility"""
    results = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": {},
        "alerts": []
    }
    
    assets = {
        "btc": {"assumed": BTC_HOURLY_VOL, "name": "Bitcoin"},
        "eth": {"assumed": ETH_HOURLY_VOL, "name": "Ethereum"}
    }
    
    for asset, config in assets.items():
        ohlc = load_cached_ohlc(asset)
        
        if not ohlc:
            results["checks"][asset] = {
                "status": "no_data",
                "message": f"No OHLC cache for {asset.upper()}"
            }
            continue
        
        realized = calculate_realized_volatility(ohlc, days=7)
        
        if realized is None:
            results["checks"][asset] = {
                "status": "insufficient_data",
                "message": f"Insufficient OHLC data for {asset.upper()}"
            }
            continue
        
        assumed = config["assumed"]
        deviation = (realized - assumed) / assumed
        
        results["checks"][asset] = {
            "status": "checked",
            "assumed_hourly_vol": assumed,
            "realized_hourly_vol": realized,
            "deviation_pct": deviation,
            "deviation_abs": abs(deviation),
            "samples": len(ohlc)
        }
        
        # Check for significant deviation
        if abs(deviation) > CALIBRATION_THRESHOLD:
            direction = "higher" if deviation > 0 else "lower"
            results["alerts"].append({
                "asset": asset.upper(),
                "message": f"{config['name']} realized vol ({realized*100:.2f}%) is {abs(deviation)*100:.0f}% {direction} than assumed ({assumed*100:.2f}%)",
                "assumed": assumed,
                "realized": realized,
                "recommendation": f"Consider updating {asset.upper()}_HOURLY_VOL to {realized:.4f}"
            })
    
    return results


def write_alert(results):
    """Write alert file if calibration issues found"""
    if not results["alerts"]:
        return
    
    lines = ["⚠️ VOLATILITY CALIBRATION ALERT\n"]
    
    for alert in results["alerts"]:
        lines.append(f"📊 {alert['asset']}: {alert['message']}")
        lines.append(f"   💡 {alert['recommendation']}")
        lines.append("")
    
    lines.append("This may affect model accuracy. Consider updating volatility assumptions.")
    lines.append(f"\nTime: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    
    with open(ALERT_FILE, "w") as f:
        f.write("\n".join(lines))
    
    print(f"⚠️ Alert written to {ALERT_FILE}")


def main():
    print("="*60)
    print("VOLATILITY CALIBRATION CHECK (T417)")
    print("="*60)
    
    results = check_calibration()
    
    print(f"\nTimestamp: {results['timestamp']}")
    print(f"Threshold: ±{CALIBRATION_THRESHOLD*100:.0f}%")
    
    print("\n" + "-"*60)
    print(f"{'Asset':<8} {'Assumed':>12} {'Realized':>12} {'Deviation':>12} {'Status':>12}")
    print("-"*60)
    
    for asset, check in results["checks"].items():
        if check["status"] != "checked":
            print(f"{asset.upper():<8} {'--':>12} {'--':>12} {'--':>12} {check['status']:>12}")
            continue
        
        assumed = check["assumed_hourly_vol"]
        realized = check["realized_hourly_vol"]
        deviation = check["deviation_pct"]
        
        status = "✅ OK" if abs(deviation) <= CALIBRATION_THRESHOLD else "⚠️ ALERT"
        dev_str = f"{deviation:+.0%}"
        
        print(f"{asset.upper():<8} {assumed*100:>11.2f}% {realized*100:>11.2f}% {dev_str:>12} {status:>12}")
    
    print("-"*60)
    
    # Save results
    CALIBRATION_LOG.parent.mkdir(parents=True, exist_ok=True)
    with open(CALIBRATION_LOG, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n💾 Results saved to {CALIBRATION_LOG}")
    
    # Write alert if needed
    if results["alerts"]:
        print(f"\n⚠️ {len(results['alerts'])} calibration issue(s) found!")
        write_alert(results)
    else:
        print("\n✅ All volatility assumptions within tolerance")

if __name__ == "__main__":
    main()
