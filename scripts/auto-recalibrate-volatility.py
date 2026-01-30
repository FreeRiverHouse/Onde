#!/usr/bin/env python3
"""
Auto-Recalibrate Volatility Constants (T638)

When historical volatility deviates >20% from model assumptions for 2+ weeks,
this script proposes and applies recalibration to autotrader-v2.py.

Usage:
  python auto-recalibrate-volatility.py           # Check and alert if needed
  python auto-recalibrate-volatility.py --apply   # Apply suggested values
  python auto-recalibrate-volatility.py --status  # Show current calibration status
  python auto-recalibrate-volatility.py --revert  # Revert to backup values
"""

import json
import re
import sys
import shutil
from datetime import datetime, timezone
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
AUTOTRADER_PATH = SCRIPT_DIR / "kalshi-autotrader-v2.py"
AUTOTRADER_BACKUP = SCRIPT_DIR / "kalshi-autotrader-v2.py.vol-backup"
VOLATILITY_STATS = SCRIPT_DIR.parent / "data" / "ohlc" / "volatility-stats.json"
RECALIBRATION_HISTORY = SCRIPT_DIR.parent / "data" / "trading" / "volatility-recalibration-history.jsonl"
ALERT_FILE = SCRIPT_DIR / "kalshi-vol-recalibration.alert"

# Thresholds
DEVIATION_THRESHOLD = 0.20  # 20%
MIN_CONSECUTIVE_WEEKS = 2


def load_volatility_stats():
    """Load current volatility statistics."""
    if not VOLATILITY_STATS.exists():
        print(f"❌ Volatility stats not found: {VOLATILITY_STATS}")
        print("   Run: python scripts/calculate-historical-volatility.py")
        return None
    
    with open(VOLATILITY_STATS) as f:
        return json.load(f)


def get_current_constants():
    """Extract current volatility constants from autotrader."""
    content = AUTOTRADER_PATH.read_text()
    
    constants = {}
    
    # Find BTC_HOURLY_VOL
    match = re.search(r'BTC_HOURLY_VOL\s*=\s*([\d.]+)', content)
    if match:
        constants['btc'] = float(match.group(1))
    
    # Find ETH_HOURLY_VOL  
    match = re.search(r'ETH_HOURLY_VOL\s*=\s*([\d.]+)', content)
    if match:
        constants['eth'] = float(match.group(1))
    
    # Find SOL_HOURLY_VOL
    match = re.search(r'SOL_HOURLY_VOL\s*=\s*([\d.]+)', content)
    if match:
        constants['sol'] = float(match.group(1))
    
    return constants


def check_needs_recalibration(stats):
    """Check if recalibration is needed based on deviation thresholds."""
    needs_recalibration = {}
    
    assets = stats.get('assets', {})
    
    for asset_key in ['BTC', 'ETH']:
        asset_lower = asset_key.lower()
        
        if asset_key not in assets:
            continue
        
        asset_data = assets[asset_key]
        periods = asset_data.get('periods', {})
        
        # Check 30d deviation (primary) and 14d (secondary)
        period_30d = periods.get('30d', {})
        period_14d = periods.get('14d', {})
        
        dev_30d = period_30d.get('deviation_from_model_pct')
        dev_14d = period_14d.get('deviation_from_model_pct')
        
        if dev_30d is None:
            continue
        
        # Convert from percentage to decimal
        dev_30d_decimal = dev_30d / 100
        
        if abs(dev_30d_decimal) > DEVIATION_THRESHOLD:
            # Also check 14d is consistent
            if dev_14d is not None:
                dev_14d_decimal = dev_14d / 100
                
                # Both periods show consistent deviation
                if abs(dev_14d_decimal) > DEVIATION_THRESHOLD * 0.8:  # 80% of threshold
                    needs_recalibration[asset_lower] = {
                        'current': asset_data.get('model_assumption_hourly'),
                        'suggested': period_30d.get('vol_hourly_decimal'),
                        'realized_30d': period_30d.get('vol_hourly_decimal'),
                        'deviation_30d': dev_30d_decimal,
                        'deviation_14d': dev_14d_decimal,
                    }
    
    return needs_recalibration


def create_recalibration_alert(needs_recal, current_constants):
    """Create alert for recalibration proposal."""
    lines = ["📊 VOLATILITY RECALIBRATION SUGGESTED\n"]
    
    for asset, data in needs_recal.items():
        current = current_constants.get(asset, 'N/A')
        suggested = data.get('suggested')
        realized = data.get('realized_30d')
        dev = data.get('deviation_30d', 0) * 100
        
        direction = "⬇️ DECREASE" if dev < 0 else "⬆️ INCREASE"
        
        lines.append(f"\n{asset.upper()}:")
        lines.append(f"  Current model: {current*100:.3f}% hourly")
        lines.append(f"  Realized (30d): {realized*100:.4f}% hourly")
        lines.append(f"  Deviation: {dev:+.1f}%")
        lines.append(f"  Suggested: {suggested*100:.4f}% hourly ({direction})")
    
    lines.append(f"\n\nTo apply recalibration:")
    lines.append(f"  python scripts/auto-recalibrate-volatility.py --apply")
    lines.append(f"\nTo revert:")
    lines.append(f"  python scripts/auto-recalibrate-volatility.py --revert")
    
    alert_content = '\n'.join(lines)
    ALERT_FILE.write_text(alert_content)
    print(f"⚠️ Alert created: {ALERT_FILE}")
    return alert_content


def apply_recalibration(needs_recal):
    """Apply suggested volatility values to autotrader."""
    if not needs_recal:
        print("❌ No recalibration needed")
        return False
    
    # Create backup
    print(f"📦 Creating backup: {AUTOTRADER_BACKUP}")
    shutil.copy2(AUTOTRADER_PATH, AUTOTRADER_BACKUP)
    
    content = AUTOTRADER_PATH.read_text()
    original_content = content
    
    for asset, data in needs_recal.items():
        suggested = data.get('suggested')
        if suggested is None:
            continue
        
        const_name = f"{asset.upper()}_HOURLY_VOL"
        
        # Replace the constant
        pattern = rf'({const_name}\s*=\s*)([\d.]+)(\s*#.*)?'
        
        def replacer(m):
            comment = f"  # Auto-recalibrated {datetime.now().strftime('%Y-%m-%d')} (was {m.group(2)})"
            return f"{m.group(1)}{suggested:.6f}{comment}"
        
        content = re.sub(pattern, replacer, content)
    
    if content == original_content:
        print("⚠️ No changes made (constants not found)")
        return False
    
    # Write updated file
    AUTOTRADER_PATH.write_text(content)
    print(f"✅ Updated: {AUTOTRADER_PATH}")
    
    # Log to history
    log_recalibration(needs_recal)
    
    # Remove alert if exists
    if ALERT_FILE.exists():
        ALERT_FILE.unlink()
        print("✅ Cleared recalibration alert")
    
    return True


def log_recalibration(changes):
    """Log recalibration to history file."""
    RECALIBRATION_HISTORY.parent.mkdir(parents=True, exist_ok=True)
    
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "changes": changes,
        "action": "applied"
    }
    
    with open(RECALIBRATION_HISTORY, "a") as f:
        f.write(json.dumps(entry) + "\n")


def revert_recalibration():
    """Revert to backup volatility values."""
    if not AUTOTRADER_BACKUP.exists():
        print(f"❌ No backup found: {AUTOTRADER_BACKUP}")
        return False
    
    print(f"🔄 Reverting from backup: {AUTOTRADER_BACKUP}")
    shutil.copy2(AUTOTRADER_BACKUP, AUTOTRADER_PATH)
    
    # Log revert
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "action": "reverted"
    }
    
    with open(RECALIBRATION_HISTORY, "a") as f:
        f.write(json.dumps(entry) + "\n")
    
    print(f"✅ Reverted to backup values")
    return True


def show_status():
    """Show current calibration status."""
    print("=" * 60)
    print("Volatility Calibration Status")
    print("=" * 60)
    
    current = get_current_constants()
    print("\n📊 Current Model Constants:")
    for asset, val in current.items():
        print(f"  {asset.upper()}_HOURLY_VOL = {val*100:.4f}%")
    
    stats = load_volatility_stats()
    if stats:
        assets = stats.get('assets', {})
        print("\n📈 Realized Volatility (30d):")
        for asset_key in ['BTC', 'ETH']:
            if asset_key in assets:
                period_30d = assets[asset_key].get('periods', {}).get('30d', {})
                realized = period_30d.get('vol_hourly_decimal')
                dev = period_30d.get('deviation_from_model_pct')
                if realized:
                    print(f"  {asset_key}: {realized*100:.4f}% (deviation: {dev:+.1f}%)")
    
    # Check if backup exists
    if AUTOTRADER_BACKUP.exists():
        mtime = datetime.fromtimestamp(AUTOTRADER_BACKUP.stat().st_mtime)
        print(f"\n📦 Backup exists from: {mtime.strftime('%Y-%m-%d %H:%M')}")
    
    # Check recalibration history
    if RECALIBRATION_HISTORY.exists():
        with open(RECALIBRATION_HISTORY) as f:
            lines = f.readlines()
        if lines:
            last = json.loads(lines[-1])
            print(f"\n📝 Last recalibration: {last.get('timestamp', 'unknown')}")
            print(f"   Action: {last.get('action', 'unknown')}")
    
    print("=" * 60)


def main():
    args = sys.argv[1:]
    
    if '--status' in args:
        show_status()
        return
    
    if '--revert' in args:
        revert_recalibration()
        return
    
    if '--apply' in args:
        stats = load_volatility_stats()
        if not stats:
            return
        
        needs_recal = check_needs_recalibration(stats)
        if apply_recalibration(needs_recal):
            print("\n✅ Recalibration applied successfully!")
            print("   Autotrader will use new values on next restart.")
        return
    
    # Default: check and alert
    print("=" * 60)
    print("Auto-Recalibrate Volatility (T638)")
    print("=" * 60)
    
    stats = load_volatility_stats()
    if not stats:
        return
    
    current = get_current_constants()
    print(f"\n📊 Current constants:")
    for asset, val in current.items():
        print(f"   {asset.upper()}_HOURLY_VOL = {val}")
    
    needs_recal = check_needs_recalibration(stats)
    
    if needs_recal:
        print(f"\n⚠️ RECALIBRATION NEEDED for: {', '.join(needs_recal.keys()).upper()}")
        alert = create_recalibration_alert(needs_recal, current)
        print("\nAlert content:")
        print("-" * 40)
        print(alert)
    else:
        print("\n✅ Volatility constants are within acceptable range")
        # Clean up old alert if exists
        if ALERT_FILE.exists():
            ALERT_FILE.unlink()
            print("✅ Cleared old recalibration alert")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
