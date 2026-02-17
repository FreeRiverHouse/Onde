#!/usr/bin/env python3
"""
Push paper trading stats + auto-tune data to GitHub Gist.

Reads paper trades from kalshi-trades-dryrun.jsonl and auto-tune data
from data/trading/tune-report.json + tune-history.jsonl.

Pushes combined JSON to the existing gist as 'onde-paper-stats.json'.

Usage:
    python push-paper-stats-to-gist.py [--create]
"""

import json
import subprocess
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
from collections import defaultdict

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
TRADES_FILE = SCRIPT_DIR / "kalshi-trades-dryrun.jsonl"
TUNE_REPORT_FILE = PROJECT_ROOT / "data" / "trading" / "tune-report.json"
TUNE_HISTORY_FILE = PROJECT_ROOT / "data" / "trading" / "tune-history.jsonl"
GIST_ID_FILE = PROJECT_ROOT / "data" / "trading" / "stats-gist-id.txt"

STATS_FILENAME = "onde-paper-stats.json"
GIST_ID = "43b0815cc640bba8ac799ecb27434579"

MAX_RETRIES = 3
INITIAL_BACKOFF_SECONDS = 2


def load_trades():
    """Load paper trades from JSONL file."""
    trades = []
    if not TRADES_FILE.exists():
        print(f"Warning: {TRADES_FILE} not found")
        return trades
    
    with open(TRADES_FILE, 'r') as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    trades.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    return trades


def load_tune_report():
    """Load the latest auto-tune report."""
    if not TUNE_REPORT_FILE.exists():
        return None
    try:
        with open(TUNE_REPORT_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Warning: Could not load tune report: {e}")
        return None


def load_tune_history():
    """Load auto-tune history from JSONL."""
    history = []
    if not TUNE_HISTORY_FILE.exists():
        return history
    
    with open(TUNE_HISTORY_FILE, 'r') as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    history.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    return history


def calculate_paper_stats(trades):
    """Calculate comprehensive stats from paper trades."""
    if not trades:
        return {
            "total_trades": 0,
            "wins": 0,
            "losses": 0,
            "pending": 0,
            "win_rate": 0,
            "pnl_cents": 0,
            "by_asset": {},
            "by_regime": {},
            "by_side": {},
            "by_edge_bucket": {},
            "by_hour": {},
            "daily_breakdown": [],
            "edge_stats": {},
            "timeline": [],
        }
    
    total = len(trades)
    wins = sum(1 for t in trades if t.get("result_status") == "won")
    losses = sum(1 for t in trades if t.get("result_status") == "lost")
    pending = sum(1 for t in trades if t.get("result_status") == "pending")
    
    # Calculate PnL
    pnl_cents = 0
    for t in trades:
        if t.get("result_status") == "won":
            pnl_cents += (100 - t.get("price_cents", 0)) * t.get("contracts", 1)
        elif t.get("result_status") == "lost":
            pnl_cents -= t.get("price_cents", 0) * t.get("contracts", 1)
    
    settled = wins + losses
    win_rate = round(wins / settled * 100, 1) if settled > 0 else 0
    
    # By asset
    by_asset = defaultdict(lambda: {"trades": 0, "wins": 0, "losses": 0, "pending": 0, "pnl_cents": 0, "edges": []})
    for t in trades:
        asset = t.get("asset", "unknown")
        by_asset[asset]["trades"] += 1
        if t.get("result_status") == "won":
            by_asset[asset]["wins"] += 1
            by_asset[asset]["pnl_cents"] += (100 - t.get("price_cents", 0)) * t.get("contracts", 1)
        elif t.get("result_status") == "lost":
            by_asset[asset]["losses"] += 1
            by_asset[asset]["pnl_cents"] -= t.get("price_cents", 0) * t.get("contracts", 1)
        else:
            by_asset[asset]["pending"] += 1
        by_asset[asset]["edges"].append(t.get("edge", 0))
    
    by_asset_clean = {}
    for asset, data in by_asset.items():
        settled_a = data["wins"] + data["losses"]
        by_asset_clean[asset] = {
            "trades": data["trades"],
            "wins": data["wins"],
            "losses": data["losses"],
            "pending": data["pending"],
            "pnl_cents": data["pnl_cents"],
            "win_rate": round(data["wins"] / settled_a * 100, 1) if settled_a > 0 else 0,
            "avg_edge": round(sum(data["edges"]) / len(data["edges"]) * 100, 1) if data["edges"] else 0,
        }
    
    # By regime
    by_regime = defaultdict(lambda: {"trades": 0, "wins": 0, "losses": 0, "pending": 0, "edges": []})
    for t in trades:
        regime = t.get("regime", "unknown")
        by_regime[regime]["trades"] += 1
        if t.get("result_status") == "won":
            by_regime[regime]["wins"] += 1
        elif t.get("result_status") == "lost":
            by_regime[regime]["losses"] += 1
        else:
            by_regime[regime]["pending"] += 1
        by_regime[regime]["edges"].append(t.get("edge", 0))
    
    by_regime_clean = {}
    for regime, data in by_regime.items():
        settled_r = data["wins"] + data["losses"]
        by_regime_clean[regime] = {
            "trades": data["trades"],
            "wins": data["wins"],
            "losses": data["losses"],
            "pending": data["pending"],
            "win_rate": round(data["wins"] / settled_r * 100, 1) if settled_r > 0 else 0,
            "avg_edge": round(sum(data["edges"]) / len(data["edges"]) * 100, 1) if data["edges"] else 0,
        }
    
    # By side
    by_side = defaultdict(lambda: {"trades": 0, "wins": 0, "losses": 0, "pending": 0})
    for t in trades:
        side = t.get("side", "unknown")
        by_side[side]["trades"] += 1
        if t.get("result_status") == "won":
            by_side[side]["wins"] += 1
        elif t.get("result_status") == "lost":
            by_side[side]["losses"] += 1
        else:
            by_side[side]["pending"] += 1
    
    by_side_clean = {}
    for side, data in by_side.items():
        settled_s = data["wins"] + data["losses"]
        by_side_clean[side] = {
            **data,
            "win_rate": round(data["wins"] / settled_s * 100, 1) if settled_s > 0 else 0,
        }
    
    # By edge bucket
    def edge_bucket(edge):
        edge_pct = edge * 100
        if edge_pct >= 20:
            return "20%+"
        elif edge_pct >= 15:
            return "15-20%"
        elif edge_pct >= 10:
            return "10-15%"
        elif edge_pct >= 5:
            return "5-10%"
        else:
            return "<5%"
    
    by_edge = defaultdict(lambda: {"trades": 0, "wins": 0, "losses": 0, "pending": 0})
    for t in trades:
        bucket = edge_bucket(t.get("edge", 0))
        by_edge[bucket]["trades"] += 1
        if t.get("result_status") == "won":
            by_edge[bucket]["wins"] += 1
        elif t.get("result_status") == "lost":
            by_edge[bucket]["losses"] += 1
        else:
            by_edge[bucket]["pending"] += 1
    
    by_edge_clean = {}
    for bucket, data in by_edge.items():
        settled_e = data["wins"] + data["losses"]
        by_edge_clean[bucket] = {
            **data,
            "win_rate": round(data["wins"] / settled_e * 100, 1) if settled_e > 0 else 0,
        }
    
    # By hour (UTC)
    by_hour = defaultdict(lambda: {"trades": 0, "wins": 0, "losses": 0, "pending": 0})
    for t in trades:
        try:
            ts = datetime.fromisoformat(t["timestamp"].replace("Z", "+00:00"))
            hour = ts.strftime("%H")
            by_hour[hour]["trades"] += 1
            if t.get("result_status") == "won":
                by_hour[hour]["wins"] += 1
            elif t.get("result_status") == "lost":
                by_hour[hour]["losses"] += 1
            else:
                by_hour[hour]["pending"] += 1
        except Exception:
            continue
    
    by_hour_clean = {}
    for hour, data in sorted(by_hour.items()):
        settled_h = data["wins"] + data["losses"]
        by_hour_clean[hour] = {
            **data,
            "win_rate": round(data["wins"] / settled_h * 100, 1) if settled_h > 0 else 0,
        }
    
    # Daily breakdown for trend chart
    daily = defaultdict(lambda: {"trades": 0, "wins": 0, "losses": 0, "pending": 0, "pnl_cents": 0, "edges": []})
    for t in trades:
        try:
            ts = datetime.fromisoformat(t["timestamp"].replace("Z", "+00:00"))
            day = ts.strftime("%Y-%m-%d")
            daily[day]["trades"] += 1
            if t.get("result_status") == "won":
                daily[day]["wins"] += 1
                daily[day]["pnl_cents"] += (100 - t.get("price_cents", 0)) * t.get("contracts", 1)
            elif t.get("result_status") == "lost":
                daily[day]["losses"] += 1
                daily[day]["pnl_cents"] -= t.get("price_cents", 0) * t.get("contracts", 1)
            else:
                daily[day]["pending"] += 1
            daily[day]["edges"].append(t.get("edge", 0))
        except Exception:
            continue
    
    daily_breakdown = []
    cumulative_pnl = 0
    cumulative_wins = 0
    cumulative_settled = 0
    for day in sorted(daily.keys()):
        data = daily[day]
        settled_d = data["wins"] + data["losses"]
        cumulative_pnl += data["pnl_cents"]
        cumulative_wins += data["wins"]
        cumulative_settled += settled_d
        daily_breakdown.append({
            "date": day,
            "trades": data["trades"],
            "wins": data["wins"],
            "losses": data["losses"],
            "pending": data["pending"],
            "pnl_cents": data["pnl_cents"],
            "cumulative_pnl_cents": cumulative_pnl,
            "win_rate": round(data["wins"] / settled_d * 100, 1) if settled_d > 0 else 0,
            "cumulative_win_rate": round(cumulative_wins / cumulative_settled * 100, 1) if cumulative_settled > 0 else 0,
            "avg_edge": round(sum(data["edges"]) / len(data["edges"]) * 100, 1) if data["edges"] else 0,
        })
    
    # Edge stats
    edges = [t.get("edge", 0) for t in trades]
    edges.sort()
    edge_stats = {
        "mean": round(sum(edges) / len(edges) * 100, 2) if edges else 0,
        "median": round(edges[len(edges) // 2] * 100, 2) if edges else 0,
        "min": round(min(edges) * 100, 2) if edges else 0,
        "max": round(max(edges) * 100, 2) if edges else 0,
        "count": len(edges),
    }
    
    # Timeline (recent 20 trades for display)
    recent = sorted(trades, key=lambda t: t.get("timestamp", ""), reverse=True)[:20]
    timeline = []
    for t in recent:
        timeline.append({
            "timestamp": t.get("timestamp"),
            "ticker": t.get("ticker"),
            "asset": t.get("asset"),
            "side": t.get("side"),
            "contracts": t.get("contracts"),
            "price_cents": t.get("price_cents"),
            "edge": round(t.get("edge", 0) * 100, 1),
            "regime": t.get("regime"),
            "result_status": t.get("result_status"),
            "our_prob": round(t.get("our_prob", 0) * 100, 1),
            "market_prob": round(t.get("market_prob", 0) * 100, 1),
        })
    
    return {
        "total_trades": total,
        "wins": wins,
        "losses": losses,
        "pending": pending,
        "win_rate": win_rate,
        "pnl_cents": pnl_cents,
        "pnl_dollars": round(pnl_cents / 100, 2),
        "by_asset": by_asset_clean,
        "by_regime": by_regime_clean,
        "by_side": dict(by_side_clean),
        "by_edge_bucket": dict(by_edge_clean),
        "by_hour": by_hour_clean,
        "daily_breakdown": daily_breakdown,
        "edge_stats": edge_stats,
        "timeline": timeline,
        "date_range": {
            "first_trade": trades[0].get("timestamp") if trades else None,
            "last_trade": trades[-1].get("timestamp") if trades else None,
        },
    }


def build_auto_tune_section(tune_report, tune_history):
    """Build auto-tune monitoring section."""
    section = {
        "latest_report": None,
        "history": [],
        "status": "unknown",
        "next_run_estimate": None,
    }
    
    if tune_report:
        section["latest_report"] = {
            "timestamp": tune_report.get("timestamp"),
            "total_trades_analyzed": tune_report.get("analysis", {}).get("total_trades", 0),
            "auto_tune_active": tune_report.get("auto_tune_active", False),
            "recommendations": tune_report.get("recommendations", []),
            "changes_applied": tune_report.get("changes_applied", []),
            "by_asset": tune_report.get("analysis", {}).get("by_asset", {}),
            "edge_stats": tune_report.get("analysis", {}).get("edge_stats", {}),
            "prob_calibration": tune_report.get("analysis", {}).get("prob_calibration", []),
        }
        section["status"] = "active" if tune_report.get("auto_tune_active") else "paused"
    
    if tune_history:
        # Sort by timestamp
        tune_history.sort(key=lambda x: x.get("timestamp", ""))
        section["history"] = [
            {
                "timestamp": h.get("timestamp"),
                "total_trades": h.get("total_trades"),
                "edge_mean": round(h.get("edge_mean", 0) * 100, 1),
                "recommendations": h.get("recommendations", 0),
                "changes": h.get("changes", 0),
            }
            for h in tune_history
        ]
        
        # Estimate next run based on intervals
        if len(tune_history) >= 2:
            last_ts = datetime.fromisoformat(tune_history[-1]["timestamp"].replace("Z", "+00:00"))
            prev_ts = datetime.fromisoformat(tune_history[-2]["timestamp"].replace("Z", "+00:00"))
            interval = last_ts - prev_ts
            next_run = last_ts + interval
            section["next_run_estimate"] = next_run.isoformat()
            section["run_interval_minutes"] = int(interval.total_seconds() / 60)
    
    return section


def get_gist_id():
    if GIST_ID_FILE.exists():
        return GIST_ID_FILE.read_text().strip()
    return GIST_ID


def update_gist(gist_id, stats_json):
    """Update existing gist with paper stats as a new file."""
    last_error = None
    for attempt in range(MAX_RETRIES):
        if attempt > 0:
            backoff = INITIAL_BACKOFF_SECONDS * (2 ** (attempt - 1))
            print(f"  Retry {attempt}/{MAX_RETRIES-1} in {backoff}s...")
            time.sleep(backoff)
        
        result = subprocess.run(
            ["gh", "api", "-X", "PATCH", f"/gists/{gist_id}",
             "-f", f"files[{STATS_FILENAME}][content]={stats_json}"],
            capture_output=True, text=True
        )
        
        if result.returncode == 0:
            print(f"Updated gist: https://gist.github.com/{gist_id}")
            return True
        
        last_error = result.stderr
        print(f"Error updating gist (attempt {attempt + 1}/{MAX_RETRIES}): {last_error}")
    
    print(f"Failed to update gist after {MAX_RETRIES} attempts: {last_error}")
    return False


def main():
    print("=" * 60)
    print("Paper Trading Stats → Gist Push")
    print("=" * 60)
    
    # Load data
    trades = load_trades()
    tune_report = load_tune_report()
    tune_history = load_tune_history()
    
    print(f"Loaded {len(trades)} paper trades")
    print(f"Tune report: {'found' if tune_report else 'not found'}")
    print(f"Tune history: {len(tune_history)} entries")
    
    # Calculate stats
    paper_stats = calculate_paper_stats(trades)
    auto_tune = build_auto_tune_section(tune_report, tune_history)
    
    # Build combined payload
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "paper_trading": paper_stats,
        "auto_tune": auto_tune,
    }
    
    stats_json = json.dumps(payload, indent=2)
    
    print(f"\nPaper stats: {paper_stats['total_trades']} trades, "
          f"{paper_stats['win_rate']}% WR, ${paper_stats['pnl_dollars']} PnL")
    asset_parts = []
    for k, v in paper_stats['by_asset'].items():
        asset_parts.append(f"{k}: {v['trades']}")
    print(f"Assets: {', '.join(asset_parts)}")
    print(f"Auto-tune status: {auto_tune['status']}")
    
    # Push to gist
    gist_id = get_gist_id()
    print(f"\nPushing to gist {gist_id} as {STATS_FILENAME}...")
    success = update_gist(gist_id, stats_json)
    
    if success:
        raw_url = f"https://gist.githubusercontent.com/FreeRiverHouse/{gist_id}/raw/{STATS_FILENAME}"
        print(f"\n✅ Success!")
        print(f"Raw URL: {raw_url}")
    else:
        print("\n❌ Failed to push to gist")
        sys.exit(1)


if __name__ == "__main__":
    main()
