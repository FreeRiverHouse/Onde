#!/usr/bin/env python3
"""
T376 - Volatility Preference Alert (Multi-day Divergence)

Alerts when one asset's volatility ratio stays >1.2 for 3+ consecutive cycles.
This indicates sustained edge opportunities for that asset.

Usage:
    python3 volatility-preference-alert.py          # Check and alert if needed
    python3 volatility-preference-alert.py --status # Show current tracking state
    python3 volatility-preference-alert.py --reset  # Reset tracking state

Author: Clawd
Created: 2026-02-01 (T376)
"""

import os
import json
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Configuration
VOL_RATIO_THRESHOLD = 1.2       # Alert when vol_ratio > this
CONSECUTIVE_CYCLES_NEEDED = 3   # Alert after this many consecutive cycles
ALERT_COOLDOWN_HOURS = 6        # Don't re-alert for same asset within this window

# Files
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data" / "trading"
STATE_FILE = DATA_DIR / "vol-preference-state.json"
ALERT_FILE = SCRIPT_DIR / "kalshi-vol-preference.alert"
TRADE_LOG_DIR = SCRIPT_DIR

def load_state():
    """Load tracking state from file."""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE) as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    
    return {
        "btc": {"consecutive_high": 0, "ratios": [], "last_alert": None},
        "eth": {"consecutive_high": 0, "ratios": [], "last_alert": None},
        "last_check": None
    }

def save_state(state):
    """Save tracking state to file."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    state["last_check"] = datetime.now(timezone.utc).isoformat()
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def get_latest_vol_ratios():
    """Extract latest vol ratios from recent trade logs or autotrader output."""
    ratios = {"btc": None, "eth": None}
    
    # Method 1: Check volatility calibration file (updated by autotrader)
    vol_cal_file = DATA_DIR / "volatility-calibration.json"
    if vol_cal_file.exists():
        try:
            with open(vol_cal_file) as f:
                data = json.load(f)
            
            checks = data.get("checks", {})
            for asset in ["btc", "eth"]:
                if asset in checks:
                    assumed = checks[asset].get("assumed_hourly_vol", 0)
                    realized = checks[asset].get("realized_hourly_vol", 0)
                    if assumed > 0:
                        ratios[asset] = realized / assumed
        except (json.JSONDecodeError, IOError) as e:
            print(f"⚠️ Error reading volatility calibration: {e}")
    
    # Method 2: Check recent trades for vol_ratio field
    if ratios["btc"] is None or ratios["eth"] is None:
        today = datetime.now().strftime("%Y-%m-%d")
        trade_files = [
            TRADE_LOG_DIR / f"kalshi-trades-{today}.jsonl",
            TRADE_LOG_DIR / f"kalshi-trades-v2-{today}.jsonl",
        ]
        
        for trade_file in trade_files:
            if trade_file.exists():
                try:
                    with open(trade_file) as f:
                        lines = f.readlines()
                    
                    for line in reversed(lines[-50:]):  # Check last 50 trades
                        try:
                            trade = json.loads(line.strip())
                            asset = trade.get("asset", "").lower()
                            vol_ratio = trade.get("vol_ratio")
                            
                            if asset in ratios and vol_ratio is not None and ratios[asset] is None:
                                ratios[asset] = vol_ratio
                        except json.JSONDecodeError:
                            continue
                    
                except IOError:
                    continue
    
    return ratios

def update_tracking(state, ratios):
    """Update consecutive tracking based on current ratios."""
    now = datetime.now(timezone.utc)
    
    for asset in ["btc", "eth"]:
        ratio = ratios.get(asset)
        if ratio is None:
            continue
        
        asset_state = state[asset]
        
        # Keep history of last 10 ratios
        asset_state["ratios"].append({
            "ratio": round(ratio, 3),
            "timestamp": now.isoformat()
        })
        asset_state["ratios"] = asset_state["ratios"][-10:]  # Keep last 10
        
        if ratio > VOL_RATIO_THRESHOLD:
            asset_state["consecutive_high"] += 1
        else:
            # Reset consecutive count when ratio drops below threshold
            asset_state["consecutive_high"] = 0
    
    return state

def check_and_alert(state):
    """Check if any asset needs alerting and create alert file."""
    now = datetime.now(timezone.utc)
    alerts = []
    
    for asset in ["btc", "eth"]:
        asset_state = state[asset]
        consecutive = asset_state["consecutive_high"]
        
        if consecutive < CONSECUTIVE_CYCLES_NEEDED:
            continue
        
        # Check cooldown
        last_alert = asset_state.get("last_alert")
        if last_alert:
            try:
                last_alert_time = datetime.fromisoformat(last_alert)
                if now - last_alert_time < timedelta(hours=ALERT_COOLDOWN_HOURS):
                    print(f"⏳ {asset.upper()} in cooldown (alert sent {(now - last_alert_time).total_seconds() / 3600:.1f}h ago)")
                    continue
            except (ValueError, TypeError):
                pass
        
        # Get recent ratio for alert
        recent_ratios = asset_state.get("ratios", [])
        current_ratio = recent_ratios[-1]["ratio"] if recent_ratios else 1.0
        
        alert_msg = (
            f"📊 VOLATILITY PREFERENCE ALERT: {asset.upper()}\n\n"
            f"Vol ratio has stayed above {VOL_RATIO_THRESHOLD}x for {consecutive} consecutive cycles!\n"
            f"Current vol ratio: {current_ratio:.2f}x\n\n"
            f"💡 Recommendation: Consider focusing trades on {asset.upper()} - "
            f"realized volatility is significantly higher than model assumptions, "
            f"creating sustained edge opportunities.\n\n"
            f"Recent ratios: {', '.join([f'{r['ratio']:.2f}' for r in recent_ratios[-5:]])}"
        )
        
        alerts.append({
            "asset": asset.upper(),
            "consecutive_cycles": consecutive,
            "current_ratio": current_ratio,
            "message": alert_msg
        })
        
        # Update last alert time
        state[asset]["last_alert"] = now.isoformat()
    
    if alerts:
        # Write alert file for heartbeat pickup
        with open(ALERT_FILE, "w") as f:
            f.write("\n\n---\n\n".join([a["message"] for a in alerts]))
        print(f"🚨 Created alert for: {', '.join([a['asset'] for a in alerts])}")
        return alerts
    
    return []

def show_status(state):
    """Display current tracking status."""
    print("\n📊 VOLATILITY PREFERENCE TRACKING STATUS")
    print("=" * 50)
    
    last_check = state.get("last_check", "Never")
    print(f"Last check: {last_check}")
    print(f"Threshold: vol_ratio > {VOL_RATIO_THRESHOLD}x for {CONSECUTIVE_CYCLES_NEEDED}+ cycles")
    print()
    
    for asset in ["btc", "eth"]:
        asset_state = state.get(asset, {})
        consecutive = asset_state.get("consecutive_high", 0)
        ratios = asset_state.get("ratios", [])
        last_alert = asset_state.get("last_alert", "Never")
        
        status_emoji = "🔥" if consecutive >= CONSECUTIVE_CYCLES_NEEDED else "✅" if consecutive > 0 else "➖"
        
        print(f"{status_emoji} {asset.upper()}:")
        print(f"   Consecutive high: {consecutive} / {CONSECUTIVE_CYCLES_NEEDED} needed")
        if ratios:
            recent = [f"{r['ratio']:.2f}" for r in ratios[-5:]]
            print(f"   Recent ratios: {', '.join(recent)}")
        print(f"   Last alert: {last_alert}")
        print()

def main():
    # Parse arguments
    if "--status" in sys.argv:
        state = load_state()
        show_status(state)
        return
    
    if "--reset" in sys.argv:
        state = {
            "btc": {"consecutive_high": 0, "ratios": [], "last_alert": None},
            "eth": {"consecutive_high": 0, "ratios": [], "last_alert": None},
            "last_check": None
        }
        save_state(state)
        print("✅ Volatility preference tracking state reset")
        return
    
    # Normal operation: check and update
    print("📊 Checking volatility preference...")
    
    state = load_state()
    ratios = get_latest_vol_ratios()
    
    print(f"   BTC vol ratio: {ratios['btc']:.2f}x" if ratios["btc"] else "   BTC: no data")
    print(f"   ETH vol ratio: {ratios['eth']:.2f}x" if ratios["eth"] else "   ETH: no data")
    
    # Update tracking
    state = update_tracking(state, ratios)
    
    # Check for alerts
    alerts = check_and_alert(state)
    
    # Save state
    save_state(state)
    
    # Show status
    for asset in ["btc", "eth"]:
        consecutive = state[asset]["consecutive_high"]
        if consecutive > 0:
            print(f"   {asset.upper()} consecutive high cycles: {consecutive}/{CONSECUTIVE_CYCLES_NEEDED}")
    
    if not alerts:
        print("✅ No volatility preference alerts")

if __name__ == "__main__":
    main()
