#!/usr/bin/env python3
"""
T434: Weekly OHLC Volatility Summary Report

Generates a comprehensive weekly volatility report:
- 7d/30d realized volatility from cached OHLC
- Comparison to model assumptions
- Flags divergence >20%
- Outputs to data/reports/volatility-week-YYYY-WW.json

Cron: Sunday 08:00 UTC (0 8 * * 0)
Usage: python3 weekly-volatility-report.py [--verbose] [--alert]
"""

import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
import argparse
import math

# === Configuration ===
OHLC_DIR = Path(__file__).parent.parent / "data/ohlc"
REPORTS_DIR = Path(__file__).parent.parent / "data/reports"
ALERT_FILE = Path(__file__).parent / "kalshi-vol-weekly-report.alert"

# Model assumptions (from kalshi-autotrader-v2.py)
MODEL_ASSUMPTIONS = {
    "BTC": {"hourly_vol": 0.005, "label": "Bitcoin"},
    "ETH": {"hourly_vol": 0.007, "label": "Ethereum"},
}

# Divergence threshold for alerts
DIVERGENCE_THRESHOLD = 0.20  # 20%


def load_ohlc_data(asset: str) -> list:
    """Load OHLC data from cache file."""
    filepath = OHLC_DIR / f"{asset.lower()}-ohlc.json"
    
    if not filepath.exists():
        return []
    
    with open(filepath) as f:
        data = json.load(f)
    
    return data.get("candles", data) if isinstance(data, dict) else data


def detect_candle_interval(candles: list) -> int:
    """Detect the interval between candles in hours."""
    if len(candles) < 2:
        return 4  # Default to 4h
    
    try:
        # Check timestamps
        ts1 = candles[0].get("timestamp", 0)
        ts2 = candles[1].get("timestamp", 0)
        
        if ts1 and ts2:
            diff_hours = abs(ts2 - ts1) / 1000 / 3600
            # Round to common intervals: 1, 4, 6, 12, 24, 96 (4-day)
            if diff_hours < 3:
                return 1
            elif diff_hours < 8:
                return 4
            elif diff_hours < 18:
                return 12
            elif diff_hours < 72:
                return 24
            else:
                return 96  # 4-day intervals
    except (KeyError, TypeError):
        pass
    
    return 4  # Default


def calculate_realized_volatility(candles: list, days: int = 7) -> dict:
    """Calculate realized volatility from OHLC candles.
    
    Args:
        candles: List of OHLC candles (auto-detects interval)
        days: Number of days to analyze
        
    Returns:
        Dict with volatility stats
    """
    if not candles:
        return {"error": "No data"}
    
    # Detect candle interval
    interval_hours = detect_candle_interval(candles)
    candles_per_day = 24 / interval_hours
    
    # Filter to requested timeframe
    # For coarse data (4-day candles), use minimum 5 candles for meaningful stats
    min_candles = 5
    candles_needed = max(min_candles, int(days * candles_per_day))
    recent_candles = candles[-candles_needed:] if len(candles) > candles_needed else candles
    
    if len(recent_candles) < min_candles:
        return {"error": f"Insufficient data (need {min_candles}, have {len(candles)})", "candles_available": len(candles)}
    
    # Calculate actual period covered
    actual_days = len(recent_candles) * interval_hours / 24
    
    # Calculate log returns
    returns = []
    for i in range(1, len(recent_candles)):
        try:
            prev_close = float(recent_candles[i-1].get("close", recent_candles[i-1].get("c", 0)))
            curr_close = float(recent_candles[i].get("close", recent_candles[i].get("c", 0)))
            
            if prev_close > 0 and curr_close > 0:
                log_return = math.log(curr_close / prev_close)
                returns.append(log_return)
        except (ValueError, KeyError, TypeError):
            continue
    
    if not returns:
        return {"error": "No valid returns"}
    
    # Calculate volatility (std dev of returns)
    mean_return = sum(returns) / len(returns)
    variance = sum((r - mean_return) ** 2 for r in returns) / len(returns)
    vol_candle = math.sqrt(variance)
    
    # Convert to hourly volatility
    vol_hourly = vol_candle / math.sqrt(interval_hours)
    
    # Annualized volatility (for reference)
    vol_annual = vol_hourly * math.sqrt(24 * 365)
    
    return {
        "period_requested_days": days,
        "period_actual_days": actual_days,
        "candle_interval_hours": interval_hours,
        "candles_used": len(recent_candles),
        "returns_calculated": len(returns),
        "volatility_candle": vol_candle,
        "volatility_hourly": vol_hourly,
        "volatility_annual": vol_annual,
        "mean_return": mean_return,
    }


def compare_to_model(realized_vol: float, model_vol: float) -> dict:
    """Compare realized volatility to model assumption."""
    if realized_vol <= 0 or model_vol <= 0:
        return {"error": "Invalid volatility values"}
    
    ratio = realized_vol / model_vol
    deviation = abs(ratio - 1.0)
    
    return {
        "realized": realized_vol,
        "model": model_vol,
        "ratio": ratio,
        "deviation_pct": deviation * 100,
        "status": "MATCH" if deviation < DIVERGENCE_THRESHOLD else "DIVERGENT",
        "direction": "HIGHER" if ratio > 1.0 else "LOWER",
    }


def generate_weekly_report(verbose: bool = False) -> dict:
    """Generate the weekly volatility report."""
    now = datetime.now(timezone.utc)
    week_number = now.isocalendar()[1]
    year = now.year
    
    report = {
        "generated_at": now.isoformat(),
        "week": f"{year}-W{week_number:02d}",
        "year": year,
        "week_number": week_number,
        "assets": {},
        "summary": {
            "total_assets": 0,
            "divergent_assets": [],
            "alerts_triggered": 0,
        },
    }
    
    for asset, config in MODEL_ASSUMPTIONS.items():
        if verbose:
            print(f"\n📊 Processing {asset}...")
        
        candles = load_ohlc_data(asset)
        
        if not candles:
            report["assets"][asset] = {"error": "No OHLC data available"}
            continue
        
        # Calculate volatility for different periods
        vol_7d = calculate_realized_volatility(candles, days=7)
        vol_30d = calculate_realized_volatility(candles, days=30)
        
        if "error" in vol_7d:
            report["assets"][asset] = {"error": vol_7d["error"]}
            continue
        
        # Compare to model
        comparison_7d = compare_to_model(vol_7d["volatility_hourly"], config["hourly_vol"])
        comparison_30d = compare_to_model(
            vol_30d.get("volatility_hourly", 0) if "error" not in vol_30d else 0,
            config["hourly_vol"]
        ) if "error" not in vol_30d else {"error": "30d data unavailable"}
        
        asset_report = {
            "label": config["label"],
            "model_assumption_hourly": config["hourly_vol"],
            "realized_7d": {
                "volatility_hourly": vol_7d["volatility_hourly"],
                "volatility_annual_pct": vol_7d["volatility_annual"] * 100,
                "candles_used": vol_7d["candles_used"],
                "comparison": comparison_7d,
            },
            "realized_30d": vol_30d if "error" not in vol_30d else {"error": vol_30d.get("error")},
        }
        
        if "error" not in vol_30d:
            asset_report["realized_30d"]["comparison"] = comparison_30d
        
        # Check for divergence
        if comparison_7d.get("status") == "DIVERGENT":
            report["summary"]["divergent_assets"].append({
                "asset": asset,
                "deviation_pct": comparison_7d["deviation_pct"],
                "direction": comparison_7d["direction"],
            })
            report["summary"]["alerts_triggered"] += 1
        
        report["assets"][asset] = asset_report
        report["summary"]["total_assets"] += 1
        
        if verbose:
            print(f"   7d vol: {vol_7d['volatility_hourly']*100:.4f}% hourly (model: {config['hourly_vol']*100:.2f}%)")
            print(f"   Status: {comparison_7d.get('status', 'N/A')} ({comparison_7d.get('deviation_pct', 0):.1f}% deviation)")
    
    # Generate recommendations
    recommendations = []
    for asset_info in report["summary"]["divergent_assets"]:
        asset = asset_info["asset"]
        direction = asset_info["direction"]
        deviation = asset_info["deviation_pct"]
        
        if direction == "HIGHER":
            recommendations.append(
                f"⚠️ {asset}: Realized vol {deviation:.1f}% HIGHER than model. "
                "Consider increasing model assumption or widening position sizes."
            )
        else:
            recommendations.append(
                f"⚠️ {asset}: Realized vol {deviation:.1f}% LOWER than model. "
                "Model may be too conservative - consider tightening assumptions."
            )
    
    report["recommendations"] = recommendations if recommendations else ["✅ All assets within tolerance"]
    
    return report


def save_report(report: dict) -> Path:
    """Save report to file."""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    
    filename = f"volatility-week-{report['week']}.json"
    filepath = REPORTS_DIR / filename
    
    with open(filepath, 'w') as f:
        json.dump(report, f, indent=2)
    
    return filepath


def create_alert(report: dict) -> bool:
    """Create alert file if divergence detected."""
    if not report["summary"]["divergent_assets"]:
        return False
    
    alert_text = f"""📊 Weekly Volatility Report - {report['week']}

⚠️ VOLATILITY DIVERGENCE DETECTED!

Divergent assets:
"""
    
    for asset in report["summary"]["divergent_assets"]:
        alert_text += f"  • {asset['asset']}: {asset['deviation_pct']:.1f}% {asset['direction']}\n"
    
    alert_text += f"\nRecommendations:\n"
    for rec in report["recommendations"]:
        alert_text += f"  {rec}\n"
    
    alert_text += f"\nFull report: data/reports/volatility-week-{report['week']}.json"
    
    with open(ALERT_FILE, 'w') as f:
        f.write(alert_text)
    
    return True


def main():
    parser = argparse.ArgumentParser(description="Generate weekly volatility report")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--alert", "-a", action="store_true", help="Create alert file if divergence detected")
    parser.add_argument("--dry-run", action="store_true", help="Print report without saving")
    args = parser.parse_args()
    
    print("📊 Generating Weekly Volatility Report...")
    
    report = generate_weekly_report(verbose=args.verbose)
    
    if args.dry_run:
        print("\n" + json.dumps(report, indent=2))
        return
    
    # Save report
    filepath = save_report(report)
    print(f"\n✅ Report saved to: {filepath}")
    
    # Print summary
    print(f"\n📈 Summary for {report['week']}:")
    print(f"   Assets analyzed: {report['summary']['total_assets']}")
    print(f"   Divergent: {len(report['summary']['divergent_assets'])}")
    
    for rec in report["recommendations"]:
        print(f"   {rec}")
    
    # Create alert if needed
    if args.alert and report["summary"]["divergent_assets"]:
        if create_alert(report):
            print(f"\n🚨 Alert file created: {ALERT_FILE}")


if __name__ == "__main__":
    main()
