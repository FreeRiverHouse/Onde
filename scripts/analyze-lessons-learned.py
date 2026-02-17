#!/usr/bin/env python3
"""
T787 - Trading Lessons Learned Analysis

Analyze losing trades to find patterns and extract actionable lessons.

Usage:
    python3 analyze-lessons-learned.py          # Analyze all trades
    python3 analyze-lessons-learned.py --days 7 # Last 7 days only
    python3 analyze-lessons-learned.py --v2     # Use v2 log only
    python3 analyze-lessons-learned.py --verbose # Show detailed output

Author: Clawd
Created: 2026-02-01 (T787)
"""

import os
import json
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from collections import defaultdict, Counter

# Configuration
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data" / "trading"
OUTPUT_FILE = DATA_DIR / "lessons-learned.json"

# Trade log files
TRADE_FILES = [
    SCRIPT_DIR / "kalshi-trades-v2.jsonl",
    SCRIPT_DIR / "kalshi-trades-v1-migrated.jsonl",
    SCRIPT_DIR / "kalshi-trades.jsonl",
]

def load_trades(v2_only=False, days=None):
    """Load trades from JSONL files."""
    trades = []
    cutoff = None
    if days:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    
    files_to_check = [TRADE_FILES[0]] if v2_only else TRADE_FILES
    
    for trade_file in files_to_check:
        if not trade_file.exists():
            continue
        
        try:
            with open(trade_file) as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        trade = json.loads(line)
                        # Skip non-trade entries
                        if trade.get("type") not in [None, "trade"]:
                            continue
                        
                        # Parse timestamp
                        ts_str = trade.get("timestamp", "")
                        if ts_str:
                            try:
                                ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                                if cutoff and ts < cutoff:
                                    continue
                            except ValueError:
                                pass
                        
                        trades.append(trade)
                    except json.JSONDecodeError:
                        continue
        except IOError:
            continue
    
    # Deduplicate by timestamp + ticker
    seen = set()
    unique_trades = []
    for t in trades:
        key = (t.get("timestamp", ""), t.get("ticker", ""))
        if key not in seen:
            seen.add(key)
            unique_trades.append(t)
    
    return unique_trades

def get_hour_bucket(timestamp_str):
    """Get hour bucket from timestamp."""
    try:
        ts = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        return ts.hour
    except (ValueError, TypeError):
        return None

def get_day_of_week(timestamp_str):
    """Get day of week from timestamp (0=Monday)."""
    try:
        ts = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        return ts.weekday()
    except (ValueError, TypeError):
        return None

def analyze_losses(trades, verbose=False):
    """Analyze losing trades for patterns."""
    # Filter to losses only
    losses = [t for t in trades if t.get("result_status") == "lost"]
    wins = [t for t in trades if t.get("result_status") == "won"]
    
    if not losses:
        return {"error": "No losing trades found to analyze"}
    
    total_trades = len(wins) + len(losses)
    overall_win_rate = len(wins) / total_trades if total_trades > 0 else 0
    
    analysis = {
        "summary": {
            "total_losses": len(losses),
            "total_wins": len(wins),
            "total_trades": total_trades,
            "overall_win_rate": round(overall_win_rate * 100, 1),
            "analyzed_at": datetime.now(timezone.utc).isoformat()
        },
        "patterns": {},
        "lessons": []
    }
    
    # ========== PATTERN: By Asset ==========
    asset_losses = defaultdict(list)
    asset_wins = defaultdict(list)
    for t in losses:
        asset = t.get("asset", "unknown")
        asset_losses[asset].append(t)
    for t in wins:
        asset = t.get("asset", "unknown")
        asset_wins[asset].append(t)
    
    asset_analysis = {}
    for asset in set(list(asset_losses.keys()) + list(asset_wins.keys())):
        loss_count = len(asset_losses[asset])
        win_count = len(asset_wins[asset])
        total = loss_count + win_count
        if total > 0:
            win_rate = win_count / total
            loss_pct = loss_count / len(losses) if len(losses) > 0 else 0
            asset_analysis[asset] = {
                "losses": loss_count,
                "wins": win_count,
                "total": total,
                "win_rate": round(win_rate * 100, 1),
                "pct_of_all_losses": round(loss_pct * 100, 1)
            }
    
    analysis["patterns"]["by_asset"] = asset_analysis
    
    # Lesson: If one asset has significantly lower win rate
    for asset, stats in asset_analysis.items():
        if stats["total"] >= 5 and stats["win_rate"] < overall_win_rate * 100 - 15:
            analysis["lessons"].append({
                "type": "asset_underperformance",
                "severity": "high",
                "message": f"{asset.upper()} has {stats['win_rate']:.0f}% win rate vs {overall_win_rate*100:.0f}% overall. "
                          f"Consider reducing exposure or reviewing strategy for {asset}."
            })
    
    # ========== PATTERN: By Side (YES/NO) ==========
    side_losses = defaultdict(list)
    side_wins = defaultdict(list)
    for t in losses:
        side = t.get("side", "unknown")
        side_losses[side].append(t)
    for t in wins:
        side = t.get("side", "unknown")
        side_wins[side].append(t)
    
    side_analysis = {}
    for side in set(list(side_losses.keys()) + list(side_wins.keys())):
        loss_count = len(side_losses[side])
        win_count = len(side_wins[side])
        total = loss_count + win_count
        if total > 0:
            win_rate = win_count / total
            side_analysis[side] = {
                "losses": loss_count,
                "wins": win_count,
                "total": total,
                "win_rate": round(win_rate * 100, 1)
            }
    
    analysis["patterns"]["by_side"] = side_analysis
    
    # Lesson: If one side significantly underperforms
    for side, stats in side_analysis.items():
        if stats["total"] >= 5 and stats["win_rate"] < overall_win_rate * 100 - 15:
            analysis["lessons"].append({
                "type": "side_bias",
                "severity": "medium",
                "message": f"{side.upper()} trades have {stats['win_rate']:.0f}% win rate vs {overall_win_rate*100:.0f}% overall. "
                          f"Consider reviewing {side} bet logic."
            })
    
    # ========== PATTERN: By Momentum State ==========
    momentum_losses = defaultdict(list)
    momentum_wins = defaultdict(list)
    for t in losses:
        mom_dir = t.get("momentum_dir", 0)
        if mom_dir > 0:
            state = "bullish"
        elif mom_dir < 0:
            state = "bearish"
        else:
            state = "neutral"
        momentum_losses[state].append(t)
    for t in wins:
        mom_dir = t.get("momentum_dir", 0)
        if mom_dir > 0:
            state = "bullish"
        elif mom_dir < 0:
            state = "bearish"
        else:
            state = "neutral"
        momentum_wins[state].append(t)
    
    momentum_analysis = {}
    for state in set(list(momentum_losses.keys()) + list(momentum_wins.keys())):
        loss_count = len(momentum_losses[state])
        win_count = len(momentum_wins[state])
        total = loss_count + win_count
        if total > 0:
            win_rate = win_count / total
            momentum_analysis[state] = {
                "losses": loss_count,
                "wins": win_count,
                "total": total,
                "win_rate": round(win_rate * 100, 1)
            }
    
    analysis["patterns"]["by_momentum"] = momentum_analysis
    
    # Lesson: Counter-momentum trades
    if "bullish" in momentum_analysis and "bearish" in momentum_analysis:
        bullish_wr = momentum_analysis["bullish"]["win_rate"]
        bearish_wr = momentum_analysis["bearish"]["win_rate"]
        if abs(bullish_wr - bearish_wr) > 20:
            worse = "bullish" if bullish_wr < bearish_wr else "bearish"
            analysis["lessons"].append({
                "type": "momentum_mismatch",
                "severity": "medium",
                "message": f"Trading during {worse} momentum has {momentum_analysis[worse]['win_rate']:.0f}% win rate. "
                          f"Consider being more selective during {worse} markets."
            })
    
    # ========== PATTERN: By Hour of Day ==========
    hour_losses = defaultdict(list)
    hour_wins = defaultdict(list)
    for t in losses:
        hour = get_hour_bucket(t.get("timestamp", ""))
        if hour is not None:
            hour_losses[hour].append(t)
    for t in wins:
        hour = get_hour_bucket(t.get("timestamp", ""))
        if hour is not None:
            hour_wins[hour].append(t)
    
    hour_analysis = {}
    for hour in range(24):
        loss_count = len(hour_losses[hour])
        win_count = len(hour_wins[hour])
        total = loss_count + win_count
        if total >= 2:  # Only include hours with meaningful data
            win_rate = win_count / total
            hour_analysis[hour] = {
                "losses": loss_count,
                "wins": win_count,
                "total": total,
                "win_rate": round(win_rate * 100, 1)
            }
    
    analysis["patterns"]["by_hour"] = hour_analysis
    
    # Lesson: Bad hours
    bad_hours = [h for h, stats in hour_analysis.items() 
                 if stats["total"] >= 3 and stats["win_rate"] < 30]
    if bad_hours:
        analysis["lessons"].append({
            "type": "time_sensitivity",
            "severity": "low",
            "message": f"Hours {bad_hours} (UTC) have <30% win rate. Consider avoiding trades during these times."
        })
    
    # ========== PATTERN: By Alignment Status ==========
    alignment_losses = {"aligned": 0, "not_aligned": 0}
    alignment_wins = {"aligned": 0, "not_aligned": 0}
    for t in losses:
        aligned = t.get("momentum_aligned", False)
        key = "aligned" if aligned else "not_aligned"
        alignment_losses[key] += 1
    for t in wins:
        aligned = t.get("momentum_aligned", False)
        key = "aligned" if aligned else "not_aligned"
        alignment_wins[key] += 1
    
    alignment_analysis = {}
    for key in ["aligned", "not_aligned"]:
        total = alignment_losses[key] + alignment_wins[key]
        if total > 0:
            win_rate = alignment_wins[key] / total
            alignment_analysis[key] = {
                "losses": alignment_losses[key],
                "wins": alignment_wins[key],
                "total": total,
                "win_rate": round(win_rate * 100, 1)
            }
    
    analysis["patterns"]["by_alignment"] = alignment_analysis
    
    # Lesson: Alignment effectiveness
    if "aligned" in alignment_analysis and "not_aligned" in alignment_analysis:
        aligned_wr = alignment_analysis["aligned"]["win_rate"]
        not_aligned_wr = alignment_analysis["not_aligned"]["win_rate"]
        if aligned_wr > not_aligned_wr + 10:
            analysis["lessons"].append({
                "type": "alignment_benefit",
                "severity": "info",
                "message": f"Momentum-aligned trades have {aligned_wr:.0f}% win rate vs {not_aligned_wr:.0f}% for non-aligned. "
                          f"Alignment strategy is working - consider increasing MIN_EDGE for non-aligned trades."
            })
        elif not_aligned_wr > aligned_wr + 10:
            analysis["lessons"].append({
                "type": "alignment_ineffective",
                "severity": "medium",
                "message": f"Non-aligned trades ({not_aligned_wr:.0f}% WR) outperform aligned ({aligned_wr:.0f}% WR). "
                          f"Momentum alignment may not be adding value - review calculation."
            })
    
    # ========== PATTERN: By Vol Ratio ==========
    vol_high_losses = []  # vol_ratio > 1.2
    vol_normal_losses = []
    vol_high_wins = []
    vol_normal_wins = []
    
    for t in losses:
        vol_ratio = t.get("vol_ratio", 1.0)
        if vol_ratio > 1.2:
            vol_high_losses.append(t)
        else:
            vol_normal_losses.append(t)
    for t in wins:
        vol_ratio = t.get("vol_ratio", 1.0)
        if vol_ratio > 1.2:
            vol_high_wins.append(t)
        else:
            vol_normal_wins.append(t)
    
    vol_analysis = {}
    for label, loss_list, win_list in [
        ("high_vol", vol_high_losses, vol_high_wins),
        ("normal_vol", vol_normal_losses, vol_normal_wins)
    ]:
        total = len(loss_list) + len(win_list)
        if total > 0:
            win_rate = len(win_list) / total
            vol_analysis[label] = {
                "losses": len(loss_list),
                "wins": len(win_list),
                "total": total,
                "win_rate": round(win_rate * 100, 1)
            }
    
    analysis["patterns"]["by_volatility"] = vol_analysis
    
    # ========== PATTERN: Combined Asset + Side ==========
    combo_stats = defaultdict(lambda: {"wins": 0, "losses": 0})
    for t in losses:
        key = f"{t.get('asset', 'unknown')}_{t.get('side', 'unknown')}"
        combo_stats[key]["losses"] += 1
    for t in wins:
        key = f"{t.get('asset', 'unknown')}_{t.get('side', 'unknown')}"
        combo_stats[key]["wins"] += 1
    
    combo_analysis = {}
    worst_combo = None
    worst_wr = 100
    for key, stats in combo_stats.items():
        total = stats["wins"] + stats["losses"]
        if total >= 3:
            win_rate = stats["wins"] / total * 100
            combo_analysis[key] = {
                "wins": stats["wins"],
                "losses": stats["losses"],
                "total": total,
                "win_rate": round(win_rate, 1)
            }
            if win_rate < worst_wr:
                worst_wr = win_rate
                worst_combo = key
    
    analysis["patterns"]["by_asset_side_combo"] = combo_analysis
    
    if worst_combo and worst_wr < 30:
        analysis["lessons"].append({
            "type": "worst_combo",
            "severity": "high",
            "message": f"Worst performing strategy: {worst_combo.replace('_', ' ').upper()} with {worst_wr:.0f}% win rate. "
                      f"Consider avoiding or significantly increasing edge threshold for this combination."
        })
    
    # ========== Sort lessons by severity ==========
    severity_order = {"high": 0, "medium": 1, "low": 2, "info": 3}
    analysis["lessons"].sort(key=lambda x: severity_order.get(x["severity"], 99))
    
    return analysis

def print_report(analysis, verbose=False):
    """Print human-readable report."""
    if "error" in analysis:
        print(f"❌ {analysis['error']}")
        return
    
    summary = analysis["summary"]
    patterns = analysis["patterns"]
    lessons = analysis["lessons"]
    
    print("\n📊 TRADING LESSONS LEARNED ANALYSIS")
    print("=" * 60)
    print(f"Total trades analyzed: {summary['total_trades']}")
    print(f"Wins: {summary['total_wins']} | Losses: {summary['total_losses']}")
    print(f"Overall win rate: {summary['overall_win_rate']}%")
    print()
    
    # Asset breakdown
    if patterns.get("by_asset"):
        print("📈 By Asset:")
        for asset, stats in sorted(patterns["by_asset"].items(), key=lambda x: x[1]["win_rate"]):
            emoji = "🔴" if stats["win_rate"] < 40 else "🟡" if stats["win_rate"] < 50 else "🟢"
            print(f"   {emoji} {asset.upper():10} → {stats['win_rate']:5.1f}% WR ({stats['total']} trades, {stats['pct_of_all_losses']:.0f}% of losses)")
        print()
    
    # Side breakdown
    if patterns.get("by_side"):
        print("⬆️ By Side:")
        for side, stats in patterns["by_side"].items():
            emoji = "🔴" if stats["win_rate"] < 40 else "🟡" if stats["win_rate"] < 50 else "🟢"
            print(f"   {emoji} {side.upper():10} → {stats['win_rate']:5.1f}% WR ({stats['total']} trades)")
        print()
    
    # Worst combo
    if patterns.get("by_asset_side_combo"):
        combos = sorted(patterns["by_asset_side_combo"].items(), key=lambda x: x[1]["win_rate"])
        print("🎯 Worst Combinations:")
        for combo, stats in combos[:3]:
            emoji = "🔴" if stats["win_rate"] < 40 else "🟡" if stats["win_rate"] < 50 else "🟢"
            print(f"   {emoji} {combo.replace('_', ' '):15} → {stats['win_rate']:5.1f}% WR ({stats['total']} trades)")
        print()
    
    # Lessons
    if lessons:
        print("💡 KEY LESSONS:")
        for i, lesson in enumerate(lessons[:5], 1):
            severity_emoji = {"high": "🔴", "medium": "🟡", "low": "🔵", "info": "ℹ️"}.get(lesson["severity"], "•")
            print(f"   {i}. {severity_emoji} [{lesson['type']}] {lesson['message']}")
        print()
    
    print(f"Full analysis saved to: {OUTPUT_FILE}")

def main():
    # Parse args
    v2_only = "--v2" in sys.argv
    verbose = "--verbose" in sys.argv
    days = None
    
    for i, arg in enumerate(sys.argv):
        if arg == "--days" and i + 1 < len(sys.argv):
            try:
                days = int(sys.argv[i + 1])
            except ValueError:
                pass
    
    print("📊 Loading trades...")
    trades = load_trades(v2_only=v2_only, days=days)
    
    if not trades:
        print("❌ No trades found to analyze")
        return
    
    print(f"   Loaded {len(trades)} trades")
    
    print("🔍 Analyzing losing trade patterns...")
    analysis = analyze_losses(trades, verbose=verbose)
    
    # Save to file
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(analysis, f, indent=2)
    
    # Print report
    print_report(analysis, verbose=verbose)

if __name__ == "__main__":
    main()
