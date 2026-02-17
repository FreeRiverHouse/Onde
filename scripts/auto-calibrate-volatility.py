#!/usr/bin/env python3
"""
Auto-calibrate volatility assumptions for Kalshi autotrader.

Compares 30-day realized volatility vs model assumptions.
If divergence exceeds threshold, suggests or applies new values.

Usage:
    python3 scripts/auto-calibrate-volatility.py [--apply] [--threshold 25]

Options:
    --apply         Actually update the autotrader script (otherwise just suggest)
    --threshold     Divergence threshold % to trigger recalibration (default: 25)
    --dry-run       Alias for not using --apply (default behavior)
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

# Configuration
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
VOLATILITY_STATS = PROJECT_ROOT / "data" / "ohlc" / "volatility-stats.json"
AUTOTRADER_SCRIPT = SCRIPT_DIR / "kalshi-autotrader-v2.py"
CALIBRATION_LOG = SCRIPT_DIR / "volatility-calibration.log"
ALERT_FILE = SCRIPT_DIR / "kalshi-vol-recalibration.alert"

# Defaults
DEFAULT_THRESHOLD = 25  # 25% divergence triggers recalibration
MIN_VOL = 0.002  # 0.2% minimum (prevent extreme values)
MAX_VOL = 0.015  # 1.5% maximum


def load_volatility_stats():
    """Load current volatility statistics from cache."""
    if not VOLATILITY_STATS.exists():
        print(f"❌ Volatility stats not found: {VOLATILITY_STATS}")
        print("   Run: python3 scripts/calculate-historical-volatility.py")
        return None
    
    with open(VOLATILITY_STATS, "r") as f:
        return json.load(f)


def get_current_model_values():
    """Extract current BTC_HOURLY_VOL and ETH_HOURLY_VOL from autotrader script."""
    if not AUTOTRADER_SCRIPT.exists():
        return None, None
    
    content = AUTOTRADER_SCRIPT.read_text()
    
    btc_match = re.search(r'BTC_HOURLY_VOL\s*=\s*([\d.]+)', content)
    eth_match = re.search(r'ETH_HOURLY_VOL\s*=\s*([\d.]+)', content)
    
    btc_vol = float(btc_match.group(1)) if btc_match else None
    eth_vol = float(eth_match.group(1)) if eth_match else None
    
    return btc_vol, eth_vol


def calculate_new_values(stats, threshold):
    """Calculate recommended new volatility values based on realized data."""
    recommendations = {}
    
    for asset in ["BTC", "ETH"]:
        if asset not in stats.get("assets", {}):
            continue
        
        asset_data = stats["assets"][asset]
        periods = asset_data.get("periods", {})
        
        # Use 30d data if available, otherwise 14d, otherwise 7d
        period_key = None
        for p in ["30d", "14d", "7d"]:
            if p in periods:
                period_key = p
                break
        
        if not period_key:
            continue
        
        period_data = periods[period_key]
        realized_hourly = period_data.get("vol_hourly_decimal", 0)
        model_assumption = asset_data.get("model_assumption_hourly", 0)
        deviation_pct = period_data.get("deviation_from_model_pct", 0)
        
        # Check if recalibration needed
        needs_recalibration = abs(deviation_pct) > threshold
        
        # Calculate recommended value (use realized vol with small safety margin)
        # Add 10% buffer above realized vol to avoid underestimating
        recommended = min(MAX_VOL, max(MIN_VOL, realized_hourly * 1.1))
        
        recommendations[asset] = {
            "current": model_assumption,
            "realized_30d": realized_hourly,
            "deviation_pct": deviation_pct,
            "recommended": recommended,
            "needs_recalibration": needs_recalibration,
            "period_used": period_key,
        }
    
    return recommendations


def update_autotrader_script(recommendations):
    """Update the autotrader script with new volatility values."""
    if not AUTOTRADER_SCRIPT.exists():
        return False, "Autotrader script not found"
    
    content = AUTOTRADER_SCRIPT.read_text()
    original_content = content
    
    updates = []
    
    for asset in ["BTC", "ETH"]:
        if asset not in recommendations:
            continue
        
        rec = recommendations[asset]
        if not rec["needs_recalibration"]:
            continue
        
        var_name = f"{asset}_HOURLY_VOL"
        new_value = rec["recommended"]
        old_value = rec["current"]
        
        # Pattern to match the variable assignment
        pattern = rf'({var_name}\s*=\s*)([\d.]+)(\s*#.*)?'
        
        def replacement(match):
            comment = f"  # ~{new_value*100:.2f}% hourly volatility (auto-calibrated {datetime.now().strftime('%Y-%m-%d')})"
            return f"{match.group(1)}{new_value}{comment}"
        
        new_content = re.sub(pattern, replacement, content)
        
        if new_content != content:
            content = new_content
            updates.append(f"{var_name}: {old_value*100:.3f}% → {new_value*100:.3f}%")
    
    if not updates:
        return False, "No updates needed"
    
    # Write updated content
    AUTOTRADER_SCRIPT.write_text(content)
    
    return True, updates


def log_calibration(recommendations, applied):
    """Log the calibration event."""
    timestamp = datetime.now().isoformat()
    
    log_entry = {
        "timestamp": timestamp,
        "applied": applied,
        "recommendations": recommendations,
    }
    
    # Append to log file
    with open(CALIBRATION_LOG, "a") as f:
        f.write(json.dumps(log_entry) + "\n")


def write_alert(recommendations):
    """Write alert file for heartbeat pickup if recalibration is recommended."""
    needs_action = any(r["needs_recalibration"] for r in recommendations.values())
    
    if not needs_action:
        return
    
    alert_lines = ["⚠️ VOLATILITY RECALIBRATION RECOMMENDED\n"]
    
    for asset, rec in recommendations.items():
        if rec["needs_recalibration"]:
            direction = "OVERESTIMATING" if rec["deviation_pct"] < 0 else "UNDERESTIMATING"
            alert_lines.append(
                f"{asset}: Model {direction} by {abs(rec['deviation_pct']):.1f}%\n"
                f"  Current: {rec['current']*100:.2f}%\n"
                f"  Realized ({rec['period_used']}): {rec['realized_30d']*100:.2f}%\n"
                f"  Recommended: {rec['recommended']*100:.2f}%\n"
            )
    
    alert_lines.append("\nRun with --apply to update automatically:\n")
    alert_lines.append("python3 scripts/auto-calibrate-volatility.py --apply\n")
    
    ALERT_FILE.write_text("\n".join(alert_lines))
    print(f"📋 Alert written to {ALERT_FILE}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Auto-calibrate volatility assumptions")
    parser.add_argument("--apply", action="store_true", help="Actually update the autotrader script")
    parser.add_argument("--threshold", type=float, default=DEFAULT_THRESHOLD, 
                        help=f"Divergence threshold %% (default: {DEFAULT_THRESHOLD})")
    parser.add_argument("--dry-run", action="store_true", help="Just show recommendations (default)")
    parser.add_argument("--no-alert", action="store_true", help="Don't write alert file")
    args = parser.parse_args()
    
    print("=" * 60)
    print("🔧 VOLATILITY AUTO-CALIBRATION")
    print("=" * 60)
    
    # Load current stats
    stats = load_volatility_stats()
    if not stats:
        sys.exit(1)
    
    print(f"\n📊 Stats generated: {stats.get('generated_at', 'unknown')}")
    
    # Get current model values
    btc_current, eth_current = get_current_model_values()
    print(f"\n📈 Current model assumptions:")
    print(f"   BTC_HOURLY_VOL = {btc_current*100:.2f}%" if btc_current else "   BTC: not found")
    print(f"   ETH_HOURLY_VOL = {eth_current*100:.2f}%" if eth_current else "   ETH: not found")
    
    # Calculate recommendations
    recommendations = calculate_new_values(stats, args.threshold)
    
    print(f"\n🎯 Recommendations (threshold: {args.threshold}% divergence):")
    print("-" * 50)
    
    any_needs_recalibration = False
    
    for asset, rec in recommendations.items():
        status = "🔴 RECALIBRATE" if rec["needs_recalibration"] else "🟢 OK"
        any_needs_recalibration = any_needs_recalibration or rec["needs_recalibration"]
        
        print(f"\n{asset} ({rec['period_used']} data):")
        print(f"   Current assumption: {rec['current']*100:.3f}%")
        print(f"   Realized volatility: {rec['realized_30d']*100:.3f}%")
        print(f"   Deviation: {rec['deviation_pct']:+.1f}%")
        print(f"   Recommended value: {rec['recommended']*100:.3f}%")
        print(f"   Status: {status}")
    
    # Write alert if needed
    if not args.no_alert:
        write_alert(recommendations)
    
    # Apply changes if requested
    if args.apply and any_needs_recalibration:
        print("\n" + "=" * 50)
        print("📝 APPLYING CHANGES...")
        
        success, result = update_autotrader_script(recommendations)
        
        if success:
            print("✅ Autotrader script updated:")
            for update in result:
                print(f"   • {update}")
            print("\n⚠️  RESTART REQUIRED: Kill and restart kalshi-autotrader-v2.py")
            
            # Remove alert file since we applied the fix
            if ALERT_FILE.exists():
                ALERT_FILE.unlink()
        else:
            print(f"❌ Update failed: {result}")
        
        log_calibration(recommendations, applied=success)
    elif any_needs_recalibration:
        print("\n" + "-" * 50)
        print("ℹ️  Run with --apply to update the autotrader script")
        log_calibration(recommendations, applied=False)
    else:
        print("\n✅ No recalibration needed - model assumptions are within tolerance")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
