#!/usr/bin/env python3
"""
Calculate historical volatility from cached OHLC data.
Computes 7d/30d volatility and compares to model assumptions.

Task: T383
Output: data/ohlc/volatility-stats.json
"""

import json
import os
import math
from datetime import datetime, timezone
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
OHLC_DIR = PROJECT_ROOT / "data" / "ohlc"
OUTPUT_FILE = OHLC_DIR / "volatility-stats.json"

# Model assumptions (from autotrader-v2)
MODEL_ASSUMPTIONS = {
    "BTC": 0.005,  # 0.5% hourly volatility
    "ETH": 0.007,  # 0.7% hourly volatility
}

def load_ohlc(symbol: str) -> dict | None:
    """Load cached OHLC data for a symbol."""
    filepath = OHLC_DIR / f"{symbol.lower()}-ohlc.json"
    if not filepath.exists():
        print(f"⚠️  OHLC cache not found: {filepath}")
        return None
    
    with open(filepath, 'r') as f:
        return json.load(f)

def calculate_log_returns(candles: list) -> list:
    """Calculate log returns from candle close prices."""
    returns = []
    for i in range(1, len(candles)):
        prev_close = candles[i-1]["close"]
        curr_close = candles[i]["close"]
        if prev_close > 0:
            log_return = math.log(curr_close / prev_close)
            returns.append(log_return)
    return returns

def calculate_volatility(returns: list) -> float:
    """Calculate standard deviation of returns."""
    if len(returns) < 2:
        return 0.0
    
    mean = sum(returns) / len(returns)
    variance = sum((r - mean) ** 2 for r in returns) / (len(returns) - 1)
    return math.sqrt(variance)

def convert_4h_to_hourly_vol(vol_4h: float) -> float:
    """
    Convert 4-hour volatility to hourly.
    Volatility scales with sqrt of time, so:
    vol_1h = vol_4h / sqrt(4) = vol_4h / 2
    """
    return vol_4h / 2.0

def analyze_symbol(symbol: str, periods: dict) -> dict | None:
    """Analyze volatility for a symbol over different periods."""
    data = load_ohlc(symbol)
    if not data or not data.get("candles"):
        return None
    
    candles = data["candles"]
    total_candles = len(candles)
    
    # Each candle is 4 hours
    candles_per_day = 6  # 24h / 4h
    
    results = {
        "symbol": symbol,
        "model_assumption_hourly": MODEL_ASSUMPTIONS.get(symbol, 0),
        "total_candles": total_candles,
        "cache_updated": data.get("updated_at"),
        "periods": {},
    }
    
    for period_name, days in periods.items():
        candles_needed = days * candles_per_day
        
        if total_candles < candles_needed:
            results["periods"][period_name] = {
                "days": days,
                "error": f"Not enough data ({total_candles} candles, need {candles_needed})"
            }
            continue
        
        # Get most recent candles for this period
        recent_candles = candles[-candles_needed:]
        
        # Calculate returns and volatility
        returns = calculate_log_returns(recent_candles)
        vol_4h = calculate_volatility(returns)
        vol_hourly = convert_4h_to_hourly_vol(vol_4h)
        
        # Compare to model assumption
        model_vol = MODEL_ASSUMPTIONS.get(symbol, 0)
        deviation_pct = ((vol_hourly - model_vol) / model_vol * 100) if model_vol > 0 else 0
        
        # Price range for context
        prices = [c["close"] for c in recent_candles]
        price_min = min(prices)
        price_max = max(prices)
        price_range_pct = (price_max - price_min) / price_min * 100 if price_min > 0 else 0
        
        results["periods"][period_name] = {
            "days": days,
            "candles_used": len(recent_candles),
            "returns_count": len(returns),
            "vol_4h": round(vol_4h * 100, 4),  # As percentage
            "vol_hourly": round(vol_hourly * 100, 4),  # As percentage
            "vol_hourly_decimal": round(vol_hourly, 6),
            "model_assumption_pct": round(model_vol * 100, 2),
            "deviation_from_model_pct": round(deviation_pct, 1),
            "price_min": round(price_min, 2),
            "price_max": round(price_max, 2),
            "price_range_pct": round(price_range_pct, 2),
            "recommendation": get_recommendation(deviation_pct),
        }
    
    return results

def get_recommendation(deviation_pct: float) -> str:
    """Get recommendation based on deviation from model."""
    if abs(deviation_pct) <= 10:
        return "✅ Model assumption is accurate"
    elif abs(deviation_pct) <= 20:
        return "⚠️ Minor deviation - monitor"
    elif deviation_pct > 20:
        return "🔴 Model UNDERESTIMATES volatility - consider increasing"
    else:
        return "🟡 Model OVERESTIMATES volatility - consider decreasing"

def main():
    print("📊 Calculating Historical Volatility from Cached OHLC")
    print("=" * 60)
    
    # Periods to analyze
    periods = {
        "7d": 7,
        "14d": 14,
        "30d": 30,
        "60d": 60,
    }
    
    results = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "model_assumptions": {k: f"{v*100}%" for k, v in MODEL_ASSUMPTIONS.items()},
        "assets": {},
    }
    
    for symbol in ["BTC", "ETH"]:
        print(f"\n🔍 Analyzing {symbol}...")
        analysis = analyze_symbol(symbol, periods)
        
        if analysis:
            results["assets"][symbol] = analysis
            
            # Print summary
            print(f"  Model assumption: {MODEL_ASSUMPTIONS[symbol]*100}% hourly")
            for period_name, period_data in analysis["periods"].items():
                if "error" in period_data:
                    print(f"  {period_name}: {period_data['error']}")
                else:
                    print(f"  {period_name}: {period_data['vol_hourly']:.4f}% hourly "
                          f"(deviation: {period_data['deviation_from_model_pct']:+.1f}%)")
        else:
            print(f"  ❌ Could not analyze {symbol}")
    
    # Save results
    os.makedirs(OHLC_DIR, exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ Results saved to: {OUTPUT_FILE}")
    
    # Print recommendations
    print("\n" + "=" * 60)
    print("📋 RECOMMENDATIONS:")
    for symbol, data in results["assets"].items():
        if data and "periods" in data:
            period_30d = data["periods"].get("30d", {})
            if "recommendation" in period_30d:
                print(f"  {symbol} (30d): {period_30d['recommendation']}")
                if abs(period_30d.get("deviation_from_model_pct", 0)) > 20:
                    suggested = period_30d.get("vol_hourly_decimal", MODEL_ASSUMPTIONS[symbol])
                    print(f"    → Suggested {symbol}_HOURLY_VOL: {suggested}")

if __name__ == "__main__":
    main()
