#!/usr/bin/env python3
"""
AUTO-TUNE ENGINE - Autonomous parameter optimization for Kalshi autotrader

Feedback loop:
1. Read paper trade results
2. Analyze performance by regime/asset/edge/time
3. Identify what works and what doesn't
4. Adjust autotrader parameters automatically
5. Save tuning report for dashboard

Runs every 30 min via cron. Zero human intervention.
"""

import json
import os
import sys
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path
from collections import defaultdict
import statistics

# Paths
BASE_DIR = Path(__file__).parent.parent
TRADES_FILE = BASE_DIR / "scripts" / "kalshi-trades-dryrun.jsonl"
REAL_TRADES_FILE = BASE_DIR / "scripts" / "kalshi-trades-v2.jsonl"
AUTOTRADER = BASE_DIR / "scripts" / "kalshi-autotrader-v2.py"
TUNE_REPORT = BASE_DIR / "data" / "trading" / "tune-report.json"
TUNE_HISTORY = BASE_DIR / "data" / "trading" / "tune-history.jsonl"
PAPER_STATE = BASE_DIR / "data" / "trading" / "paper-trade-state.json"

def load_trades(filepath):
    """Load trades from JSONL file."""
    trades = []
    if not filepath.exists():
        return trades
    with open(filepath) as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    trades.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    return trades

def analyze_trades(trades):
    """Deep analysis of trade performance."""
    if not trades:
        return {"error": "no trades"}
    
    analysis = {
        "total_trades": len(trades),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "by_asset": defaultdict(lambda: {"trades": 0, "wins": 0, "losses": 0, "pending": 0, "pnl_cents": 0, "edges": [], "prices": []}),
        "by_side": defaultdict(lambda: {"trades": 0, "wins": 0, "losses": 0, "pending": 0, "edges": []}),
        "by_regime": defaultdict(lambda: {"trades": 0, "wins": 0, "losses": 0, "pending": 0, "edges": []}),
        "by_edge_bucket": defaultdict(lambda: {"trades": 0, "wins": 0, "losses": 0, "pending": 0}),
        "by_hour": defaultdict(lambda: {"trades": 0, "wins": 0, "losses": 0, "pending": 0}),
        "edge_stats": {},
        "prob_calibration": [],
        "timing": [],
    }
    
    edges = []
    probs = []
    
    for t in trades:
        asset = t.get("asset", "unknown")
        side = t.get("side", "unknown")
        regime = t.get("regime", "unknown")
        edge = t.get("edge", 0)
        status = t.get("result_status", "pending")
        pnl = t.get("pnl_cents", 0)
        our_prob = t.get("our_prob", 0)
        market_prob = t.get("market_prob", 0)
        price = t.get("price_cents", 0)
        
        # Parse hour from timestamp
        ts = t.get("timestamp", "")
        hour = "unknown"
        if ts:
            try:
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                hour = dt.strftime("%H")
            except:
                pass
        
        # Edge bucket
        if edge < 0.05:
            bucket = "0-5%"
        elif edge < 0.10:
            bucket = "5-10%"
        elif edge < 0.15:
            bucket = "10-15%"
        elif edge < 0.20:
            bucket = "15-20%"
        else:
            bucket = "20%+"
        
        # Accumulate
        for key, group in [
            (asset, analysis["by_asset"]),
            (side, analysis["by_side"]),
            (regime, analysis["by_regime"]),
            (bucket, analysis["by_edge_bucket"]),
            (hour, analysis["by_hour"]),
        ]:
            group[key]["trades"] += 1
            if status == "won":
                group[key]["wins"] += 1
            elif status == "lost":
                group[key]["losses"] += 1
            else:
                group[key]["pending"] += 1
        
        analysis["by_asset"][asset]["edges"].append(edge)
        analysis["by_asset"][asset]["prices"].append(price)
        analysis["by_asset"][asset]["pnl_cents"] += pnl
        analysis["by_side"][side]["edges"].append(edge)
        analysis["by_regime"][regime]["edges"].append(edge)
        
        edges.append(edge)
        probs.append({"our": our_prob, "market": market_prob, "status": status, "edge": edge})
    
    # Edge statistics
    if edges:
        analysis["edge_stats"] = {
            "mean": statistics.mean(edges),
            "median": statistics.median(edges),
            "stdev": statistics.stdev(edges) if len(edges) > 1 else 0,
            "min": min(edges),
            "max": max(edges),
            "count": len(edges),
        }
    
    # Probability calibration check
    # Group by our_prob buckets and check actual win rate
    prob_buckets = defaultdict(lambda: {"count": 0, "wins": 0, "total_prob": 0})
    for p in probs:
        if p["status"] not in ("won", "lost"):
            continue
        bucket = round(p["our"] * 10) / 10  # Round to nearest 0.1
        prob_buckets[bucket]["count"] += 1
        prob_buckets[bucket]["wins"] += 1 if p["status"] == "won" else 0
        prob_buckets[bucket]["total_prob"] += p["our"]
    
    for bucket, data in sorted(prob_buckets.items()):
        if data["count"] > 0:
            actual_wr = data["wins"] / data["count"]
            expected_wr = data["total_prob"] / data["count"]
            analysis["prob_calibration"].append({
                "predicted_prob": round(bucket, 2),
                "actual_win_rate": round(actual_wr, 3),
                "expected_win_rate": round(expected_wr, 3),
                "sample_size": data["count"],
                "calibration_error": round(actual_wr - expected_wr, 3),
            })
    
    # Convert defaultdicts for JSON serialization
    for key in ["by_asset", "by_side", "by_regime", "by_edge_bucket", "by_hour"]:
        analysis[key] = dict(analysis[key])
        for k, v in analysis[key].items():
            analysis[key][k] = dict(v)
            # Calculate win rate where applicable
            resolved = v.get("wins", 0) + v.get("losses", 0)
            if resolved > 0:
                analysis[key][k]["win_rate"] = round(v["wins"] / resolved, 3)
            # Calculate avg edge
            if "edges" in v and v["edges"]:
                analysis[key][k]["avg_edge"] = round(statistics.mean(v["edges"]), 4)
                del analysis[key][k]["edges"]  # Don't store raw list
            if "prices" in v:
                del analysis[key][k]["prices"]
    
    return analysis

def generate_recommendations(analysis):
    """Generate parameter tuning recommendations based on analysis."""
    recs = []
    
    total = analysis.get("total_trades", 0)
    if total < 10:
        recs.append({
            "type": "data_insufficient",
            "message": f"Only {total} trades. Need 50+ for meaningful analysis. Keep collecting.",
            "action": "wait",
            "confidence": "low",
        })
        return recs
    
    # Check by regime
    for regime, data in analysis.get("by_regime", {}).items():
        resolved = data.get("wins", 0) + data.get("losses", 0)
        if resolved >= 5:
            wr = data.get("win_rate", 0)
            avg_edge = data.get("avg_edge", 0)
            if wr < 0.4:
                recs.append({
                    "type": "regime_underperform",
                    "regime": regime,
                    "win_rate": wr,
                    "avg_edge": avg_edge,
                    "message": f"Regime '{regime}' has {wr:.0%} WR ({resolved} trades). Consider raising min_edge.",
                    "action": "raise_min_edge",
                    "param": f"regime.{regime}.dynamic_min_edge",
                    "current_edge": avg_edge,
                    "suggested_edge": avg_edge * 1.5,
                })
            elif wr > 0.65:
                recs.append({
                    "type": "regime_outperform",
                    "regime": regime,
                    "win_rate": wr,
                    "avg_edge": avg_edge,
                    "message": f"Regime '{regime}' has {wr:.0%} WR ({resolved} trades). Can lower min_edge for more volume.",
                    "action": "lower_min_edge",
                    "param": f"regime.{regime}.dynamic_min_edge",
                    "current_edge": avg_edge,
                    "suggested_edge": avg_edge * 0.75,
                })
    
    # Check by asset
    for asset, data in analysis.get("by_asset", {}).items():
        resolved = data.get("wins", 0) + data.get("losses", 0)
        if resolved >= 5:
            wr = data.get("win_rate", 0)
            if wr < 0.35:
                recs.append({
                    "type": "asset_underperform",
                    "asset": asset,
                    "win_rate": wr,
                    "message": f"Asset '{asset}' has {wr:.0%} WR. Consider reducing exposure or raising edge.",
                    "action": "reduce_asset_allocation",
                })
            elif wr > 0.6:
                recs.append({
                    "type": "asset_outperform",
                    "asset": asset,
                    "win_rate": wr,
                    "message": f"Asset '{asset}' performing well at {wr:.0%} WR. Consider increasing allocation.",
                    "action": "increase_asset_allocation",
                })
    
    # Probability calibration
    cal = analysis.get("prob_calibration", [])
    if cal:
        total_cal_error = sum(abs(c["calibration_error"]) for c in cal) / len(cal)
        if total_cal_error > 0.15:
            recs.append({
                "type": "prob_miscalibrated",
                "avg_cal_error": total_cal_error,
                "message": f"Probability model miscalibrated by avg {total_cal_error:.1%}. Need to adjust probability calculation.",
                "action": "recalibrate_probs",
                "details": cal,
            })
    
    # Edge analysis
    edge_stats = analysis.get("edge_stats", {})
    if edge_stats:
        # Check if we're taking too-low-edge trades
        by_bucket = analysis.get("by_edge_bucket", {})
        low_edge = by_bucket.get("0-5%", {})
        if low_edge.get("losses", 0) > low_edge.get("wins", 0) and low_edge.get("trades", 0) > 5:
            recs.append({
                "type": "low_edge_losers",
                "message": f"0-5% edge trades are net losers. Raise minimum edge threshold.",
                "action": "raise_min_edge_global",
                "suggested": 0.06,
            })
    
    if not recs:
        recs.append({
            "type": "no_changes",
            "message": "Performance looks OK. Keep collecting data for more confident recommendations.",
            "action": "continue",
        })
    
    return recs

def apply_auto_tune(recommendations, dry_run=True):
    """
    Apply parameter changes to autotrader based on recommendations.
    Returns list of changes made.
    """
    changes = []
    
    if not os.path.exists(AUTOTRADER):
        return changes
    
    with open(AUTOTRADER) as f:
        code = f.read()
    
    original_code = code
    
    for rec in recommendations:
        action = rec.get("action", "")
        
        if action == "raise_min_edge" and rec.get("regime"):
            regime = rec["regime"]
            suggested = rec.get("suggested_edge", 0)
            if suggested > 0 and suggested < 0.25:
                # Find and update the regime's min_edge in code
                # This is a targeted regex replacement
                pattern = rf'(elif result\["regime"\] == "{regime}":.*?dynamic_min_edge"\] = )(\d+\.\d+)'
                match = re.search(pattern, code, re.DOTALL)
                if match:
                    old_val = float(match.group(2))
                    new_val = round(suggested, 3)
                    if abs(new_val - old_val) > 0.005:  # Only change if meaningful
                        code = code[:match.start(2)] + str(new_val) + code[match.end(2):]
                        changes.append({
                            "param": f"regime.{regime}.min_edge",
                            "old": old_val,
                            "new": new_val,
                            "reason": rec["message"],
                        })
        
        elif action == "raise_min_edge_global":
            suggested = rec.get("suggested", 0.06)
            # Update the min_floor for paper mode
            pattern = r'(min_floor = )(\d+\.\d+)( if DRY_RUN)'
            match = re.search(pattern, code)
            if match:
                old_val = float(match.group(2))
                new_val = round(suggested, 3)
                if new_val > old_val:
                    code = code[:match.start(2)] + str(new_val) + code[match.end(2):]
                    changes.append({
                        "param": "min_edge_floor_paper",
                        "old": old_val,
                        "new": new_val,
                        "reason": rec["message"],
                    })
    
    # Write changes if any and not dry_run
    if changes and code != original_code:
        if dry_run:
            print(f"[DRY RUN] Would apply {len(changes)} parameter changes")
            for c in changes:
                print(f"  {c['param']}: {c['old']} → {c['new']} ({c['reason'][:60]})")
        else:
            with open(AUTOTRADER, 'w') as f:
                f.write(code)
            print(f"✅ Applied {len(changes)} parameter changes to autotrader")
            for c in changes:
                print(f"  {c['param']}: {c['old']} → {c['new']}")
    
    return changes

def update_paper_state(analysis):
    """Update paper-trade-state.json with real analysis data for dashboard."""
    try:
        with open(PAPER_STATE) as f:
            state = json.load(f)
    except:
        state = {}
    
    # Add analysis data for dashboard charts
    state["analysis"] = {
        "last_tune": datetime.now(timezone.utc).isoformat(),
        "total_paper_trades": analysis.get("total_trades", 0),
        "edge_stats": analysis.get("edge_stats", {}),
        "by_asset": {k: {"trades": v.get("trades", 0), "avg_edge": v.get("avg_edge", 0)} 
                     for k, v in analysis.get("by_asset", {}).items()},
        "by_regime": {k: {"trades": v.get("trades", 0), "avg_edge": v.get("avg_edge", 0)} 
                      for k, v in analysis.get("by_regime", {}).items()},
    }
    
    with open(PAPER_STATE, 'w') as f:
        json.dump(state, f, indent=2)

def main():
    print(f"\n{'='*60}")
    print(f"🔧 AUTO-TUNE ENGINE - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"{'='*60}")
    
    # Load all trades (paper + real)
    paper_trades = load_trades(TRADES_FILE)
    real_trades = load_trades(REAL_TRADES_FILE)
    
    print(f"\n📊 Data: {len(paper_trades)} paper trades, {len(real_trades)} real trades")
    
    all_trades = paper_trades + real_trades
    
    if not all_trades:
        print("❌ No trades to analyze. Waiting for data.")
        return
    
    # Analyze
    analysis = analyze_trades(all_trades)
    
    # Print summary
    print(f"\n📈 Analysis Summary:")
    print(f"   Total trades: {analysis['total_trades']}")
    
    for asset, data in analysis.get("by_asset", {}).items():
        resolved = data.get("wins", 0) + data.get("losses", 0)
        wr = data.get("win_rate", "N/A")
        avg_edge = data.get("avg_edge", 0)
        print(f"   {asset.upper()}: {data['trades']} trades, {resolved} resolved, WR={wr}, avg edge={avg_edge:.1%}")
    
    for regime, data in analysis.get("by_regime", {}).items():
        print(f"   Regime {regime}: {data['trades']} trades, avg edge={data.get('avg_edge', 0):.1%}")
    
    edge_stats = analysis.get("edge_stats", {})
    if edge_stats:
        print(f"\n   Edge: mean={edge_stats['mean']:.1%}, median={edge_stats['median']:.1%}, "
              f"stdev={edge_stats['stdev']:.1%}, range=[{edge_stats['min']:.1%}, {edge_stats['max']:.1%}]")
    
    # Generate recommendations
    recs = generate_recommendations(analysis)
    
    print(f"\n💡 Recommendations ({len(recs)}):")
    for r in recs:
        print(f"   [{r['type']}] {r['message']}")
    
    # Apply auto-tune (dry_run=True until we have enough data for confidence)
    min_trades_for_auto = 100
    auto_apply = len(all_trades) >= min_trades_for_auto
    
    if auto_apply:
        changes = apply_auto_tune(recs, dry_run=False)
        if changes:
            print(f"\n🔧 Applied {len(changes)} auto-tune changes!")
    else:
        changes = apply_auto_tune(recs, dry_run=True)
        print(f"\n⏳ Need {min_trades_for_auto - len(all_trades)} more trades before auto-applying changes")
    
    # Save report
    report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "analysis": analysis,
        "recommendations": recs,
        "changes_applied": changes,
        "auto_tune_active": auto_apply,
        "trades_until_auto": max(0, min_trades_for_auto - len(all_trades)),
    }
    
    os.makedirs(TUNE_REPORT.parent, exist_ok=True)
    with open(TUNE_REPORT, 'w') as f:
        json.dump(report, f, indent=2)
    
    # Append to history
    with open(TUNE_HISTORY, 'a') as f:
        f.write(json.dumps({
            "timestamp": report["timestamp"],
            "total_trades": analysis["total_trades"],
            "edge_mean": edge_stats.get("mean", 0),
            "recommendations": len(recs),
            "changes": len(changes),
        }) + "\n")
    
    # Update paper state for dashboard
    update_paper_state(analysis)
    
    print(f"\n✅ Report saved to {TUNE_REPORT}")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
