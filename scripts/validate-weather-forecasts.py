#!/usr/bin/env python3
"""
Weather Forecast Accuracy Validator

Compares NWS forecasts used at trade time vs actual temperatures.
Identifies forecast bias and accuracy issues.

Calculates:
- MAE (Mean Absolute Error) overall and by city
- Bias (systematic over/under-prediction)
- Accuracy by forecast horizon (hours before settlement)

Usage: python3 scripts/validate-weather-forecasts.py [--verbose] [--json]
"""

import json
import re
import os
import sys
import glob
from datetime import datetime, timezone, timedelta
from pathlib import Path
import urllib.request
from collections import defaultdict

SCRIPTS_DIR = Path(__file__).parent
DATA_DIR = SCRIPTS_DIR.parent / "data/trading"
OUTPUT_FILE = DATA_DIR / "weather-forecast-accuracy.json"

# City coordinate mapping for Open-Meteo historical API
CITY_COORDS = {
    "NYC": (40.7829, -73.9654),
    "NY": (40.7829, -73.9654),
    "CHI": (41.8781, -87.6298),
    "MIA": (25.7617, -80.1918),
    "DEN": (39.7392, -104.9903),
    "LAX": (34.0522, -118.2437),
    "HOU": (29.7604, -95.3698),
    "AUS": (30.2672, -97.7431),
    "PHI": (39.9526, -75.1652),
    "SFO": (37.7749, -122.4194),
}


def parse_weather_ticker(ticker: str) -> dict:
    """Parse Kalshi weather ticker to extract city, date, type, threshold."""
    # High temp: KXHIGHCHI-26JAN29-B16.5
    high_match = re.match(r'KXHIGH([A-Z]+)-(\d{2})([A-Z]{3})(\d{2})-B([\d.]+)', ticker)
    # Low temp: KXLOWCHI-26JAN29-B5
    low_match = re.match(r'KXLOW([A-Z]+)-(\d{2})([A-Z]{3})(\d{2})-B([\d.]+)', ticker)
    # Alternative low format: KXLOWTNYC-26JAN30-B9.5
    low_t_match = re.match(r'KXLOWT([A-Z]+)-(\d{2})([A-Z]{3})(\d{2})-B([\d.]+)', ticker)
    
    match = high_match or low_match or low_t_match
    if not match:
        return None
    
    city = match.group(1)
    year_short = match.group(2)
    month_str = match.group(3)
    day = match.group(4)
    threshold = match.group(5)
    
    is_high = high_match is not None
    
    month_map = {
        'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
        'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
    }
    
    year = 2000 + int(year_short)
    month = month_map.get(month_str, 1)
    
    settlement_date = datetime(year, month, int(day), 23, 59, 0, tzinfo=timezone.utc)
    
    return {
        "city": city,
        "is_high": is_high,
        "threshold": float(threshold),
        "settlement_date": settlement_date,
    }


def get_actual_temp_open_meteo(city: str, date: datetime, is_high: bool = True) -> float:
    """Fetch actual temperature from Open-Meteo historical archive."""
    if city not in CITY_COORDS:
        return None
    
    lat, lon = CITY_COORDS[city]
    date_str = date.strftime("%Y-%m-%d")
    
    # Check if date is in the past (historical data available)
    now = datetime.now(timezone.utc)
    if date > now:
        return None
    
    url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={date_str}&end_date={date_str}&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FNew_York&temperature_unit=fahrenheit"
    
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read().decode())
        
        daily = data.get("daily", {})
        key = "temperature_2m_max" if is_high else "temperature_2m_min"
        temps = daily.get(key, [])
        
        if temps and temps[0] is not None:
            return round(temps[0], 1)
    except Exception as e:
        print(f"  ⚠️ Open-Meteo error for {city} {date_str}: {e}")
    
    return None


def load_weather_trades():
    """Load all weather trades from trade files."""
    trades = []
    
    # Check dated trade files
    pattern = str(DATA_DIR / "kalshi-trades-*.jsonl")
    files = glob.glob(pattern)
    
    # Also check scripts dir for legacy files
    legacy_pattern = str(SCRIPTS_DIR / "kalshi-trades*.jsonl")
    files.extend(glob.glob(legacy_pattern))
    
    for filepath in files:
        try:
            with open(filepath) as f:
                for line in f:
                    try:
                        entry = json.loads(line.strip())
                        # Only trades with weather tickers
                        if entry.get("type") != "trade":
                            continue
                        ticker = entry.get("ticker", "")
                        if "KXHIGH" in ticker or "KXLOW" in ticker:
                            trades.append(entry)
                    except json.JSONDecodeError:
                        continue
        except Exception as e:
            print(f"Warning: Could not read {filepath}: {e}")
    
    return trades


def validate_forecasts(trades, verbose=False):
    """Compare forecast temperatures vs actual outcomes."""
    validations = []
    by_city = defaultdict(list)
    by_horizon = defaultdict(list)
    
    for trade in trades:
        ticker = trade.get("ticker", "")
        parsed = parse_weather_ticker(ticker)
        
        if not parsed:
            continue
        
        forecast_temp = trade.get("forecast_temp")
        if forecast_temp is None:
            # Try to extract from reason string
            reason = trade.get("reason", "")
            match = re.search(r'forecast ([\d.]+)°F', reason)
            if match:
                forecast_temp = float(match.group(1))
            else:
                continue
        
        # Get actual temperature
        city = parsed["city"]
        settlement_date = parsed["settlement_date"]
        is_high = parsed["is_high"]
        
        if verbose:
            print(f"  Validating {ticker}: forecast {forecast_temp}°F...")
        
        actual_temp = get_actual_temp_open_meteo(city, settlement_date, is_high)
        
        if actual_temp is None:
            if verbose:
                print(f"    ⚠️ Could not get actual temp")
            continue
        
        # Calculate error
        error = forecast_temp - actual_temp
        abs_error = abs(error)
        
        # Determine forecast horizon (hours before settlement)
        trade_time = trade.get("timestamp")
        if trade_time:
            trade_dt = datetime.fromisoformat(trade_time.replace('Z', '+00:00'))
            hours_before = (settlement_date - trade_dt).total_seconds() / 3600
        else:
            hours_before = None
        
        validation = {
            "ticker": ticker,
            "city": city,
            "is_high_temp": is_high,
            "settlement_date": settlement_date.isoformat(),
            "forecast_temp": forecast_temp,
            "actual_temp": actual_temp,
            "error": round(error, 1),
            "abs_error": round(abs_error, 1),
            "hours_before_settlement": round(hours_before, 1) if hours_before else None,
            "result": trade.get("result_status"),
        }
        
        validations.append(validation)
        by_city[city].append(validation)
        
        if hours_before:
            if hours_before < 12:
                horizon = "<12h"
            elif hours_before < 24:
                horizon = "12-24h"
            elif hours_before < 48:
                horizon = "24-48h"
            else:
                horizon = ">48h"
            by_horizon[horizon].append(validation)
        
        if verbose:
            sign = "+" if error > 0 else ""
            print(f"    ✅ Actual: {actual_temp}°F | Error: {sign}{error:.1f}°F")
    
    return validations, by_city, by_horizon


def calculate_metrics(validations):
    """Calculate aggregate accuracy metrics."""
    if not validations:
        return None
    
    errors = [v["error"] for v in validations]
    abs_errors = [v["abs_error"] for v in validations]
    
    mae = sum(abs_errors) / len(abs_errors)
    mean_bias = sum(errors) / len(errors)
    
    # Root Mean Square Error
    rmse = (sum(e**2 for e in errors) / len(errors)) ** 0.5
    
    # Accuracy within thresholds
    within_1 = sum(1 for e in abs_errors if e <= 1) / len(abs_errors)
    within_2 = sum(1 for e in abs_errors if e <= 2) / len(abs_errors)
    within_3 = sum(1 for e in abs_errors if e <= 3) / len(abs_errors)
    
    return {
        "count": len(validations),
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "mean_bias": round(mean_bias, 2),
        "bias_direction": "over-predicting" if mean_bias > 0 else "under-predicting",
        "within_1F": f"{within_1*100:.1f}%",
        "within_2F": f"{within_2*100:.1f}%",
        "within_3F": f"{within_3*100:.1f}%",
    }


def print_report(validations, by_city, by_horizon):
    """Print formatted accuracy report."""
    print("\n" + "="*60)
    print("🌡️ WEATHER FORECAST ACCURACY VALIDATION")
    print("="*60)
    
    overall = calculate_metrics(validations)
    if not overall:
        print("\n❌ No weather trades with forecast data found")
        return None
    
    print(f"\n📊 Overall Metrics ({overall['count']} trades):")
    print(f"  MAE (Mean Absolute Error): {overall['mae']}°F")
    print(f"  RMSE: {overall['rmse']}°F")
    print(f"  Mean Bias: {overall['mean_bias']:+.2f}°F ({overall['bias_direction']})")
    print(f"  Within ±1°F: {overall['within_1F']}")
    print(f"  Within ±2°F: {overall['within_2F']}")
    print(f"  Within ±3°F: {overall['within_3F']}")
    
    # By city
    print("\n📍 Accuracy by City:")
    print("-"*60)
    print(f"{'City':<8} {'Count':<8} {'MAE':<8} {'Bias':<10} {'Within 2°F':<12}")
    print("-"*60)
    
    city_metrics = {}
    for city, city_vals in sorted(by_city.items()):
        metrics = calculate_metrics(city_vals)
        city_metrics[city] = metrics
        if metrics:
            print(f"{city:<8} {metrics['count']:<8} {metrics['mae']:<8.2f} "
                  f"{metrics['mean_bias']:+.2f}{'°F':^5} {metrics['within_2F']:<12}")
    
    # By horizon
    print("\n⏱️ Accuracy by Forecast Horizon:")
    print("-"*60)
    print(f"{'Horizon':<10} {'Count':<8} {'MAE':<8} {'Bias':<10}")
    print("-"*60)
    
    horizon_metrics = {}
    for horizon in ["<12h", "12-24h", "24-48h", ">48h"]:
        if horizon in by_horizon:
            metrics = calculate_metrics(by_horizon[horizon])
            horizon_metrics[horizon] = metrics
            if metrics:
                print(f"{horizon:<10} {metrics['count']:<8} {metrics['mae']:<8.2f} "
                      f"{metrics['mean_bias']:+.2f}°F")
    
    # Recommendations
    print("\n📝 Analysis:")
    if overall['mae'] < 2:
        print("  ✅ Forecasts are accurate (MAE < 2°F)")
    elif overall['mae'] < 3:
        print("  ⚠️ Forecasts are reasonable but not ideal (MAE 2-3°F)")
    else:
        print("  ❌ Forecasts have significant errors (MAE > 3°F)")
    
    if abs(overall['mean_bias']) > 1:
        direction = "high" if overall['mean_bias'] > 0 else "low"
        print(f"  ⚠️ Systematic bias detected: forecasts are consistently too {direction}")
        print(f"     → Consider adjusting forecast by {abs(overall['mean_bias']):.1f}°F")
    
    return {
        "overall": overall,
        "by_city": city_metrics,
        "by_horizon": horizon_metrics,
    }


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Validate weather forecast accuracy")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show detailed output")
    parser.add_argument("--json", action="store_true", help="Output JSON only")
    args = parser.parse_args()
    
    # Load weather trades
    trades = load_weather_trades()
    print(f"Found {len(trades)} weather trades")
    
    if not trades:
        print("No weather trades found in trade files")
        return
    
    # Validate forecasts
    print("Fetching actual temperatures from Open-Meteo...")
    validations, by_city, by_horizon = validate_forecasts(trades, args.verbose)
    
    if not validations:
        print("❌ Could not validate any trades (missing forecast or actual data)")
        return
    
    # Print or output report
    if args.json:
        output = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_validated": len(validations),
            "overall": calculate_metrics(validations),
            "by_city": {city: calculate_metrics(vals) for city, vals in by_city.items()},
            "by_horizon": {h: calculate_metrics(vals) for h, vals in by_horizon.items()},
            "validations": validations[:20],  # First 20 detailed records
        }
        print(json.dumps(output, indent=2))
    else:
        metrics = print_report(validations, by_city, by_horizon)
        
        # Save to file
        if metrics:
            output = {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "total_validated": len(validations),
                **metrics,
                "sample_validations": validations[:10],
            }
            DATA_DIR.mkdir(parents=True, exist_ok=True)
            with open(OUTPUT_FILE, "w") as f:
                json.dump(output, f, indent=2)
            print(f"\n💾 Saved analysis to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
