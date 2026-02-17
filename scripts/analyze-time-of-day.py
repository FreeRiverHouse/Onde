#!/usr/bin/env python3
"""
T826: Analyze trading performance by time of day.

Groups trades by hour (PST) and calculates:
- Win rate per hour
- Average PnL per hour
- Trade count per hour
- Best and worst trading hours

Output: data/trading/time-analysis.json

Usage:
    python3 scripts/analyze-time-of-day.py
    python3 scripts/analyze-time-of-day.py --days 30  # Last 30 days only
"""

import json
import glob
from pathlib import Path
from datetime import datetime, timezone, timedelta
from collections import defaultdict
import argparse

# PST offset from UTC
PST_OFFSET = timedelta(hours=-8)

def load_all_trades(days_limit: int = None) -> list:
    """Load all trades from JSONL files."""
    trades = []
    
    # Calculate cutoff date if days_limit specified
    cutoff = None
    if days_limit:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days_limit)
    
    # Find all trade log files
    log_files = sorted(glob.glob("data/trading/kalshi-trades-*.jsonl"))
    
    for log_file in log_files:
        # Skip the 'latest' symlink to avoid double-counting
        if "latest" in log_file:
            continue
            
        with open(log_file) as f:
            for line in f:
                try:
                    entry = json.loads(line.strip())
                    
                    # Only count actual trades with results
                    if entry.get("type") != "trade":
                        continue
                    if entry.get("result_status") not in ["won", "lost"]:
                        continue
                    
                    # Parse timestamp
                    ts_str = entry.get("timestamp", "")
                    try:
                        ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                    except:
                        continue
                    
                    # Apply cutoff
                    if cutoff and ts < cutoff:
                        continue
                    
                    # Convert to PST
                    pst_time = ts + PST_OFFSET
                    
                    # Extract hour
                    entry["pst_hour"] = pst_time.hour
                    entry["pst_date"] = pst_time.date().isoformat()
                    entry["ts_utc"] = ts
                    
                    trades.append(entry)
                    
                except json.JSONDecodeError:
                    continue
    
    return trades


def analyze_by_hour(trades: list) -> dict:
    """Analyze trades grouped by PST hour."""
    
    # Initialize counters for all 24 hours
    by_hour = {h: {"wins": 0, "losses": 0, "total_pnl_cents": 0, "trades": []} for h in range(24)}
    
    for trade in trades:
        hour = trade["pst_hour"]
        result = trade.get("result_status")
        
        if result == "won":
            by_hour[hour]["wins"] += 1
            # Winning NO trades: profit = (100 - price) * contracts
            # Winning YES trades: profit = (100 - price) * contracts
            # Simplified: assume 1-cent trades have ~99 cent profit per contract
            contracts = trade.get("contracts", 1)
            price = trade.get("price_cents", 1)
            pnl = (100 - price) * contracts  # Approximate profit
            by_hour[hour]["total_pnl_cents"] += pnl
        elif result == "lost":
            by_hour[hour]["losses"] += 1
            # Lost cost = price * contracts
            cost = trade.get("cost_cents", 0)
            by_hour[hour]["total_pnl_cents"] -= cost
        
        by_hour[hour]["trades"].append({
            "timestamp": trade.get("timestamp"),
            "ticker": trade.get("ticker"),
            "result": result,
            "contracts": trade.get("contracts"),
            "price_cents": trade.get("price_cents")
        })
    
    # Calculate stats per hour
    results = {}
    for hour in range(24):
        data = by_hour[hour]
        total_trades = data["wins"] + data["losses"]
        
        win_rate = 0
        avg_pnl = 0
        if total_trades > 0:
            win_rate = round(data["wins"] / total_trades * 100, 1)
            avg_pnl = round(data["total_pnl_cents"] / total_trades, 1)
        
        results[hour] = {
            "hour_pst": hour,
            "hour_label": f"{hour:02d}:00-{hour:02d}:59 PST",
            "total_trades": total_trades,
            "wins": data["wins"],
            "losses": data["losses"],
            "win_rate_pct": win_rate,
            "total_pnl_cents": data["total_pnl_cents"],
            "avg_pnl_cents": avg_pnl
        }
    
    return results


def identify_best_worst_hours(hour_stats: dict, min_trades: int = 3) -> dict:
    """Identify best and worst trading hours."""
    
    # Filter hours with enough trades
    active_hours = {h: s for h, s in hour_stats.items() if s["total_trades"] >= min_trades}
    
    if not active_hours:
        return {
            "best_hours": [],
            "worst_hours": [],
            "recommendation": "Not enough data (need at least {min_trades} trades per hour)"
        }
    
    # Sort by win rate, then by PnL
    sorted_by_winrate = sorted(active_hours.items(), key=lambda x: (x[1]["win_rate_pct"], x[1]["avg_pnl_cents"]), reverse=True)
    
    best_hours = [{"hour": h, **s} for h, s in sorted_by_winrate[:3] if s["win_rate_pct"] > 50]
    worst_hours = [{"hour": h, **s} for h, s in sorted_by_winrate[-3:] if s["win_rate_pct"] < 50]
    
    # Generate recommendation
    rec_parts = []
    if best_hours:
        best_labels = [f"{h['hour']:02d}:00" for h in best_hours]
        rec_parts.append(f"Best hours: {', '.join(best_labels)} PST")
    if worst_hours:
        worst_labels = [f"{h['hour']:02d}:00" for h in worst_hours]
        rec_parts.append(f"Avoid: {', '.join(worst_labels)} PST")
    
    return {
        "best_hours": best_hours,
        "worst_hours": worst_hours,
        "recommendation": " | ".join(rec_parts) if rec_parts else "No clear pattern yet"
    }


def generate_heatmap_data(hour_stats: dict) -> list:
    """Generate heatmap-friendly data for dashboard."""
    
    heatmap = []
    for hour in range(24):
        stats = hour_stats[hour]
        
        # Determine color intensity based on win rate
        # Green for >60% win rate, red for <40%, yellow for 40-60%
        win_rate = stats["win_rate_pct"]
        if stats["total_trades"] == 0:
            color = "gray"
            intensity = 0
        elif win_rate >= 60:
            color = "green"
            intensity = min(1.0, (win_rate - 50) / 50)
        elif win_rate <= 40:
            color = "red"
            intensity = min(1.0, (50 - win_rate) / 50)
        else:
            color = "yellow"
            intensity = 0.3
        
        heatmap.append({
            "hour": hour,
            "label": f"{hour:02d}:00",
            "trades": stats["total_trades"],
            "win_rate": win_rate,
            "pnl_cents": stats["total_pnl_cents"],
            "color": color,
            "intensity": round(intensity, 2)
        })
    
    return heatmap


def main():
    parser = argparse.ArgumentParser(description="Analyze trading performance by time of day")
    parser.add_argument("--days", type=int, default=None, help="Limit to last N days")
    parser.add_argument("--min-trades", type=int, default=3, help="Minimum trades per hour for best/worst")
    args = parser.parse_args()
    
    print("📊 Analyzing trading performance by time of day...")
    
    # Load trades
    trades = load_all_trades(days_limit=args.days)
    print(f"   Loaded {len(trades)} settled trades")
    
    if not trades:
        print("   ⚠️ No settled trades found")
        return
    
    # Analyze by hour
    hour_stats = analyze_by_hour(trades)
    
    # Identify best/worst
    best_worst = identify_best_worst_hours(hour_stats, min_trades=args.min_trades)
    
    # Generate heatmap data
    heatmap = generate_heatmap_data(hour_stats)
    
    # Calculate overall stats
    total_wins = sum(h["wins"] for h in hour_stats.values())
    total_losses = sum(h["losses"] for h in hour_stats.values())
    total_trades = total_wins + total_losses
    overall_win_rate = round(total_wins / total_trades * 100, 1) if total_trades > 0 else 0
    total_pnl = sum(h["total_pnl_cents"] for h in hour_stats.values())
    
    # Build output
    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "days_analyzed": args.days or "all",
        "total_trades": total_trades,
        "overall_win_rate_pct": overall_win_rate,
        "total_pnl_cents": total_pnl,
        "by_hour": hour_stats,
        "heatmap": heatmap,
        "best_worst": best_worst,
        "timezone": "PST (UTC-8)"
    }
    
    # Save output
    output_path = Path("data/trading/time-analysis.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2, default=str)
    
    print(f"   ✅ Analysis saved to {output_path}")
    
    # Print summary
    print(f"\n📈 SUMMARY ({total_trades} trades)")
    print(f"   Overall win rate: {overall_win_rate}%")
    print(f"   Total PnL: ${total_pnl/100:.2f}")
    
    if best_worst["recommendation"]:
        print(f"\n💡 {best_worst['recommendation']}")
    
    # Print heatmap preview
    print("\n🗓️ HOURLY BREAKDOWN (PST):")
    print("   Hour  | Trades | Win Rate | PnL")
    print("   " + "-" * 40)
    for h in heatmap:
        if h["trades"] > 0:
            pnl_str = f"${h['pnl_cents']/100:+.2f}"
            print(f"   {h['label']} |   {h['trades']:3d}  |   {h['win_rate']:5.1f}% | {pnl_str}")


if __name__ == "__main__":
    main()
