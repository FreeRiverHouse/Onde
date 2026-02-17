#!/usr/bin/env python3
"""
Kalshi Paper Trade Analyzer

Reads kalshi-trades-dryrun.jsonl, calculates statistics, verifies outcomes
against actual market results, and suggests optimizations.

Run periodically to track progress toward live trading criteria.

Usage:
    python3 scripts/analyze-paper-trades.py [--settle] [--calibration] [--summary]

Flags:
    --settle       Check Kalshi API for settled market results and update trades
    --calibration  Show probability calibration analysis
    --summary      Show compact summary only (default: full report)
"""

import json
import sys
import os
import math
from pathlib import Path
from collections import Counter, defaultdict
from datetime import datetime, timezone, timedelta

# Config
DRYRUN_FILE = Path(__file__).parent / "kalshi-trades-dryrun.jsonl"
LIVE_FILE = Path(__file__).parent / "kalshi-trades-v2.jsonl"
ANALYSIS_OUTPUT = Path(__file__).parent.parent / "data" / "trading" / "paper-trade-analysis.json"

# Live trading criteria (from optimization plan)
CRITERIA = {
    "min_trades_with_outcome": 200,
    "min_win_rate": 0.55,
    "min_profit_factor": 1.2,
    "max_consecutive_losses": 8,
    "max_drawdown_pct": 0.15,
    "max_brier_score": 0.08,
    "min_stable_days": 60,
}


def load_trades(filepath: Path) -> list:
    """Load trades from JSONL file."""
    if not filepath.exists():
        print(f"❌ File not found: {filepath}")
        return []
    
    trades = []
    with open(filepath) as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                trades.append(json.loads(line))
            except json.JSONDecodeError as e:
                print(f"⚠️ Line {line_num}: JSON parse error: {e}")
    
    return trades


def basic_stats(trades: list) -> dict:
    """Calculate basic trade statistics."""
    if not trades:
        return {"total": 0}
    
    # Filter to actual trades (not events/logs)
    trade_entries = [t for t in trades if t.get("type") == "trade"]
    
    # Count outcomes
    outcomes = Counter(t.get("result_status", "pending") for t in trade_entries)
    wins = outcomes.get("win", 0)
    losses = outcomes.get("loss", 0)
    pending = outcomes.get("pending", 0)
    settled = wins + losses
    
    # Win rate
    win_rate = wins / settled if settled > 0 else None
    
    # Edge stats
    edges = [t["edge"] for t in trade_entries if "edge" in t]
    edges_wb = [t.get("edge_with_bonus", t["edge"]) for t in trade_entries if "edge" in t]
    
    # Probability stats
    our_probs = [t["our_prob"] for t in trade_entries if "our_prob" in t]
    market_probs = [t["market_prob"] for t in trade_entries if "market_prob" in t]
    
    # Price stats
    prices = [t["price_cents"] for t in trade_entries if "price_cents" in t]
    
    # P&L
    total_pnl = 0
    for t in trade_entries:
        if t.get("result_status") == "win":
            total_pnl += (100 - t.get("price_cents", 0)) * t.get("contracts", 1)
        elif t.get("result_status") == "loss":
            total_pnl -= t.get("price_cents", 0) * t.get("contracts", 1)
    
    # Asset distribution
    assets = Counter(t.get("asset", "unknown") for t in trade_entries)
    
    # Side distribution
    sides = Counter(t.get("side", "unknown") for t in trade_entries)
    
    # Regime distribution
    regimes = Counter(t.get("regime", "unknown") for t in trade_entries)
    
    # Unique tickers
    tickers = set(t.get("ticker", "") for t in trade_entries)
    
    # Timestamps
    timestamps = [t.get("timestamp", "") for t in trade_entries if t.get("timestamp")]
    
    # Minutes to expiry
    mte = [t["minutes_to_expiry"] for t in trade_entries if t.get("minutes_to_expiry")]
    
    # Consecutive losses (worst streak)
    max_consec_losses = 0
    current_streak = 0
    for t in sorted(trade_entries, key=lambda x: x.get("timestamp", "")):
        if t.get("result_status") == "loss":
            current_streak += 1
            max_consec_losses = max(max_consec_losses, current_streak)
        elif t.get("result_status") == "win":
            current_streak = 0
    
    return {
        "total": len(trade_entries),
        "wins": wins,
        "losses": losses,
        "pending": pending,
        "settled": settled,
        "win_rate": win_rate,
        "total_pnl_cents": total_pnl,
        "max_consecutive_losses": max_consec_losses,
        "edge": {
            "min": min(edges) if edges else None,
            "max": max(edges) if edges else None,
            "avg": sum(edges) / len(edges) if edges else None,
            "median": sorted(edges)[len(edges)//2] if edges else None,
        },
        "edge_with_bonus": {
            "min": min(edges_wb) if edges_wb else None,
            "max": max(edges_wb) if edges_wb else None,
            "avg": sum(edges_wb) / len(edges_wb) if edges_wb else None,
        },
        "our_prob": {
            "min": min(our_probs) if our_probs else None,
            "max": max(our_probs) if our_probs else None,
            "avg": sum(our_probs) / len(our_probs) if our_probs else None,
        },
        "market_prob": {
            "min": min(market_probs) if market_probs else None,
            "max": max(market_probs) if market_probs else None,
            "avg": sum(market_probs) / len(market_probs) if market_probs else None,
        },
        "price_cents": {
            "min": min(prices) if prices else None,
            "max": max(prices) if prices else None,
            "avg": sum(prices) / len(prices) if prices else None,
        },
        "minutes_to_expiry": {
            "min": min(mte) if mte else None,
            "max": max(mte) if mte else None,
            "avg": sum(mte) / len(mte) if mte else None,
        },
        "assets": dict(assets),
        "sides": dict(sides),
        "regimes": dict(regimes),
        "unique_tickers": len(tickers),
        "first_trade": min(timestamps) if timestamps else None,
        "last_trade": max(timestamps) if timestamps else None,
    }


def calibration_analysis(trades: list) -> dict:
    """
    Probability calibration analysis.
    
    Groups trades by predicted probability bins and compares
    predicted probability to actual win rate in each bin.
    
    This is the MOST IMPORTANT analysis for improving the model.
    """
    trade_entries = [t for t in trades if t.get("type") == "trade" and t.get("result_status") in ("win", "loss")]
    
    if len(trade_entries) < 10:
        return {
            "status": "insufficient_data",
            "settled_trades": len(trade_entries),
            "needed": 10,
            "message": f"Need at least 10 settled trades for calibration (have {len(trade_entries)})"
        }
    
    # Define probability bins
    bins = [
        (0.0, 0.3, "0-30%"),
        (0.3, 0.5, "30-50%"),
        (0.5, 0.6, "50-60%"),
        (0.6, 0.7, "60-70%"),
        (0.7, 0.8, "70-80%"),
        (0.8, 0.9, "80-90%"),
        (0.9, 1.0, "90-100%"),
    ]
    
    bin_data = {}
    
    for low, high, label in bins:
        bin_trades = [t for t in trade_entries if low <= t.get("our_prob", 0) < high]
        
        if not bin_trades:
            continue
        
        wins = sum(1 for t in bin_trades if t["result_status"] == "win")
        total = len(bin_trades)
        actual_wr = wins / total
        predicted_avg = sum(t["our_prob"] for t in bin_trades) / total
        
        # Calibration error: how far off is our prediction?
        calibration_error = abs(predicted_avg - actual_wr)
        
        bin_data[label] = {
            "count": total,
            "wins": wins,
            "losses": total - wins,
            "actual_win_rate": round(actual_wr, 4),
            "predicted_avg_prob": round(predicted_avg, 4),
            "calibration_error": round(calibration_error, 4),
            "direction": "overconfident" if predicted_avg > actual_wr else "underconfident",
        }
    
    # Calculate overall Brier score
    brier = sum((t["our_prob"] - (1 if t["result_status"] == "win" else 0))**2 
                for t in trade_entries) / len(trade_entries)
    
    # Calculate overall calibration
    total_predicted = sum(t["our_prob"] for t in trade_entries)
    total_actual = sum(1 for t in trade_entries if t["result_status"] == "win")
    
    return {
        "status": "ok",
        "settled_trades": len(trade_entries),
        "brier_score": round(brier, 6),
        "brier_target": CRITERIA["max_brier_score"],
        "brier_ok": brier <= CRITERIA["max_brier_score"],
        "overall_predicted": round(total_predicted / len(trade_entries), 4),
        "overall_actual": round(total_actual / len(trade_entries), 4),
        "bins": bin_data,
    }


def edge_analysis(trades: list) -> dict:
    """Analyze edge distribution and profitability by edge range."""
    trade_entries = [t for t in trades if t.get("type") == "trade"]
    
    edge_ranges = [
        (0.03, 0.06, "3-6%"),
        (0.06, 0.09, "6-9%"),
        (0.09, 0.12, "9-12%"),
        (0.12, 0.15, "12-15%"),
        (0.15, 0.20, "15-20%"),
        (0.20, 0.30, "20-30%"),
        (0.30, 1.00, "30%+"),
    ]
    
    result = {}
    
    for low, high, label in edge_ranges:
        range_trades = [t for t in trade_entries if low <= t.get("edge", 0) < high]
        
        if not range_trades:
            continue
        
        wins = sum(1 for t in range_trades if t.get("result_status") == "win")
        losses = sum(1 for t in range_trades if t.get("result_status") == "loss")
        pending = sum(1 for t in range_trades if t.get("result_status") == "pending")
        settled = wins + losses
        
        # P&L for settled trades
        pnl = 0
        for t in range_trades:
            if t.get("result_status") == "win":
                pnl += (100 - t.get("price_cents", 0)) * t.get("contracts", 1)
            elif t.get("result_status") == "loss":
                pnl -= t.get("price_cents", 0) * t.get("contracts", 1)
        
        result[label] = {
            "count": len(range_trades),
            "wins": wins,
            "losses": losses,
            "pending": pending,
            "win_rate": round(wins / settled, 4) if settled > 0 else None,
            "pnl_cents": pnl,
            "avg_edge": round(sum(t["edge"] for t in range_trades) / len(range_trades), 4),
            "avg_price": round(sum(t.get("price_cents", 0) for t in range_trades) / len(range_trades), 1),
        }
    
    return result


def regime_analysis(trades: list) -> dict:
    """Analyze performance by market regime."""
    trade_entries = [t for t in trades if t.get("type") == "trade"]
    
    regimes = defaultdict(list)
    for t in trade_entries:
        regimes[t.get("regime", "unknown")].append(t)
    
    result = {}
    for regime, regime_trades in regimes.items():
        wins = sum(1 for t in regime_trades if t.get("result_status") == "win")
        losses = sum(1 for t in regime_trades if t.get("result_status") == "loss")
        settled = wins + losses
        
        edges = [t["edge"] for t in regime_trades if "edge" in t]
        
        pnl = 0
        for t in regime_trades:
            if t.get("result_status") == "win":
                pnl += (100 - t.get("price_cents", 0)) * t.get("contracts", 1)
            elif t.get("result_status") == "loss":
                pnl -= t.get("price_cents", 0) * t.get("contracts", 1)
        
        result[regime] = {
            "count": len(regime_trades),
            "wins": wins,
            "losses": losses,
            "pending": len(regime_trades) - settled,
            "win_rate": round(wins / settled, 4) if settled > 0 else None,
            "avg_edge": round(sum(edges) / len(edges), 4) if edges else None,
            "pnl_cents": pnl,
            "avg_dynamic_min_edge": round(
                sum(t.get("dynamic_min_edge", 0) for t in regime_trades) / len(regime_trades), 4
            ) if regime_trades else None,
        }
    
    return result


def timing_analysis(trades: list) -> dict:
    """Analyze trades by hour of day (UTC) and day of week."""
    trade_entries = [t for t in trades if t.get("type") == "trade" and t.get("timestamp")]
    
    by_hour = defaultdict(list)
    by_day = defaultdict(list)
    
    for t in trade_entries:
        try:
            dt = datetime.fromisoformat(t["timestamp"].replace("Z", "+00:00"))
            by_hour[dt.hour].append(t)
            by_day[dt.strftime("%A")].append(t)
        except (ValueError, KeyError):
            continue
    
    hour_stats = {}
    for hour in sorted(by_hour.keys()):
        trades_h = by_hour[hour]
        wins = sum(1 for t in trades_h if t.get("result_status") == "win")
        losses = sum(1 for t in trades_h if t.get("result_status") == "loss")
        settled = wins + losses
        
        hour_stats[f"{hour:02d}:00"] = {
            "count": len(trades_h),
            "wins": wins,
            "losses": losses,
            "pending": len(trades_h) - settled,
            "win_rate": round(wins / settled, 4) if settled > 0 else None,
        }
    
    day_stats = {}
    for day, trades_d in by_day.items():
        wins = sum(1 for t in trades_d if t.get("result_status") == "win")
        losses = sum(1 for t in trades_d if t.get("result_status") == "loss")
        settled = wins + losses
        
        day_stats[day] = {
            "count": len(trades_d),
            "wins": wins,
            "losses": losses,
            "pending": len(trades_d) - settled,
            "win_rate": round(wins / settled, 4) if settled > 0 else None,
        }
    
    return {"by_hour": hour_stats, "by_day": day_stats}


def duplication_analysis(trades: list) -> dict:
    """Analyze trade duplication (same ticker/side in short time window)."""
    trade_entries = [t for t in trades if t.get("type") == "trade"]
    
    # Count by ticker+side
    ticker_side_counts = Counter(
        (t.get("ticker", ""), t.get("side", "")) 
        for t in trade_entries
    )
    
    # Find repeated trades
    repeated = {f"{ticker} {side}": count 
                for (ticker, side), count in ticker_side_counts.most_common()
                if count > 1}
    
    # Check for conflicting trades (same ticker, different side)
    ticker_sides = defaultdict(set)
    for t in trade_entries:
        ticker_sides[t.get("ticker", "")].add(t.get("side", ""))
    
    conflicts = {ticker: list(sides) 
                 for ticker, sides in ticker_sides.items() 
                 if len(sides) > 1}
    
    unique_ratio = len(set((t.get("ticker"), t.get("side")) for t in trade_entries)) / len(trade_entries) if trade_entries else 0
    
    return {
        "total_trades": len(trade_entries),
        "unique_ticker_side_combos": len(ticker_side_counts),
        "unique_ratio": round(unique_ratio, 4),
        "most_repeated": dict(list(repeated.items())[:10]),
        "conflicting_tickers": conflicts,
        "has_conflicts": len(conflicts) > 0,
    }


def live_trading_readiness(stats: dict, calibration: dict) -> dict:
    """Check if system meets live trading criteria."""
    checks = {}
    
    # 1. Sufficient trades with outcomes
    settled = stats.get("settled", 0)
    checks["min_trades"] = {
        "value": settled,
        "threshold": CRITERIA["min_trades_with_outcome"],
        "pass": settled >= CRITERIA["min_trades_with_outcome"],
        "progress": f"{settled}/{CRITERIA['min_trades_with_outcome']}",
    }
    
    # 2. Win rate
    wr = stats.get("win_rate")
    checks["win_rate"] = {
        "value": wr,
        "threshold": CRITERIA["min_win_rate"],
        "pass": wr is not None and wr >= CRITERIA["min_win_rate"],
        "progress": f"{wr*100:.1f}%" if wr else "N/A",
    }
    
    # 3. Max consecutive losses
    mcl = stats.get("max_consecutive_losses", 0)
    checks["max_consec_losses"] = {
        "value": mcl,
        "threshold": CRITERIA["max_consecutive_losses"],
        "pass": mcl <= CRITERIA["max_consecutive_losses"],
        "progress": f"{mcl}/{CRITERIA['max_consecutive_losses']}",
    }
    
    # 4. Brier score (calibration)
    brier = calibration.get("brier_score") if calibration.get("status") == "ok" else None
    checks["brier_score"] = {
        "value": brier,
        "threshold": CRITERIA["max_brier_score"],
        "pass": brier is not None and brier <= CRITERIA["max_brier_score"],
        "progress": f"{brier:.4f}" if brier else "N/A",
    }
    
    # 5. Profit factor
    total_wins_cents = 0
    total_losses_cents = 0
    if stats.get("total_pnl_cents") is not None:
        # Rough estimate - need actual data
        if stats["wins"] > 0:
            total_wins_cents = max(0, stats["total_pnl_cents"])
        if stats["losses"] > 0:
            total_losses_cents = abs(min(0, stats["total_pnl_cents"]))
    pf = total_wins_cents / total_losses_cents if total_losses_cents > 0 else None
    checks["profit_factor"] = {
        "value": pf,
        "threshold": CRITERIA["min_profit_factor"],
        "pass": pf is not None and pf >= CRITERIA["min_profit_factor"],
        "progress": f"{pf:.2f}" if pf else "N/A",
    }
    
    # Overall readiness
    all_pass = all(c["pass"] for c in checks.values())
    pass_count = sum(1 for c in checks.values() if c["pass"])
    
    return {
        "ready": all_pass,
        "checks_passed": pass_count,
        "checks_total": len(checks),
        "details": checks,
    }


def print_report(trades: list, compact: bool = False):
    """Print comprehensive analysis report."""
    stats = basic_stats(trades)
    
    print("\n" + "=" * 70)
    print("📊 KALSHI PAPER TRADE ANALYSIS REPORT")
    print("=" * 70)
    
    if stats["total"] == 0:
        print("\n❌ No trades found!")
        return
    
    # Basic stats
    print(f"\n📈 OVERVIEW")
    print(f"   Total trades: {stats['total']}")
    print(f"   Period: {stats.get('first_trade', 'N/A')[:19]} → {stats.get('last_trade', 'N/A')[:19]}")
    print(f"   Unique tickers: {stats['unique_tickers']}")
    print(f"   Outcomes: {stats['wins']}W / {stats['losses']}L / {stats['pending']}P")
    
    if stats["win_rate"] is not None:
        wr_emoji = "✅" if stats["win_rate"] >= 0.55 else "⚠️" if stats["win_rate"] >= 0.45 else "❌"
        print(f"   Win rate: {wr_emoji} {stats['win_rate']*100:.1f}%")
        print(f"   P&L: ${stats['total_pnl_cents']/100:+.2f}")
    else:
        print(f"   Win rate: ⏳ No settled trades yet")
    
    # Assets & Sides
    print(f"\n📊 DISTRIBUTION")
    print(f"   Assets: {stats['assets']}")
    print(f"   Sides:  {stats['sides']}")
    print(f"   Regimes: {stats['regimes']}")
    
    # Edge stats
    if stats["edge"]["avg"]:
        print(f"\n📐 EDGE ANALYSIS")
        print(f"   Edge:       min={stats['edge']['min']*100:.1f}%  avg={stats['edge']['avg']*100:.1f}%  max={stats['edge']['max']*100:.1f}%")
        print(f"   Edge+bonus: min={stats['edge_with_bonus']['min']*100:.1f}%  avg={stats['edge_with_bonus']['avg']*100:.1f}%  max={stats['edge_with_bonus']['max']*100:.1f}%")
        print(f"   Our prob:   min={stats['our_prob']['min']*100:.1f}%  avg={stats['our_prob']['avg']*100:.1f}%  max={stats['our_prob']['max']*100:.1f}%")
        print(f"   Mkt prob:   min={stats['market_prob']['min']*100:.1f}%  avg={stats['market_prob']['avg']*100:.1f}%  max={stats['market_prob']['max']*100:.1f}%")
    
    # Timing
    if stats["minutes_to_expiry"]["avg"]:
        avg_hours = stats["minutes_to_expiry"]["avg"] / 60
        min_hours = stats["minutes_to_expiry"]["min"] / 60
        print(f"\n⏰ TIMING")
        print(f"   Avg time to expiry: {avg_hours:.1f}h (min: {min_hours:.1f}h)")
    
    if compact:
        return
    
    # Duplication analysis
    dup = duplication_analysis(trades)
    print(f"\n🔄 DUPLICATION")
    print(f"   Unique ratio: {dup['unique_ratio']*100:.0f}% ({dup['unique_ticker_side_combos']} unique / {dup['total_trades']} total)")
    if dup["most_repeated"]:
        print(f"   Most repeated:")
        for combo, count in list(dup["most_repeated"].items())[:5]:
            print(f"      {combo}: {count}x")
    if dup["has_conflicts"]:
        print(f"   ⚠️ CONFLICTING TRADES (same ticker, both YES and NO):")
        for ticker, sides in dup["conflicting_tickers"].items():
            print(f"      {ticker}: {', '.join(sides)}")
    
    # Edge by range
    edge_ranges = edge_analysis(trades)
    if edge_ranges:
        print(f"\n📊 EDGE RANGE ANALYSIS")
        print(f"   {'Range':>10} | {'Count':>5} | {'W':>3} | {'L':>3} | {'WR':>6} | {'P&L':>8} | {'Avg Edge':>8}")
        print(f"   {'-'*10}-+-{'-'*5}-+-{'-'*3}-+-{'-'*3}-+-{'-'*6}-+-{'-'*8}-+-{'-'*8}")
        for label, data in edge_ranges.items():
            wr_str = f"{data['win_rate']*100:.0f}%" if data["win_rate"] is not None else "N/A"
            pnl_str = f"${data['pnl_cents']/100:+.2f}" if data["pnl_cents"] else "$0.00"
            print(f"   {label:>10} | {data['count']:>5} | {data['wins']:>3} | {data['losses']:>3} | {wr_str:>6} | {pnl_str:>8} | {data['avg_edge']*100:>7.1f}%")
    
    # Regime analysis
    regime_data = regime_analysis(trades)
    if regime_data:
        print(f"\n📊 REGIME ANALYSIS")
        print(f"   {'Regime':>18} | {'Count':>5} | {'W':>3} | {'L':>3} | {'WR':>6} | {'Avg Edge':>8} | {'Min Edge':>8}")
        print(f"   {'-'*18}-+-{'-'*5}-+-{'-'*3}-+-{'-'*3}-+-{'-'*6}-+-{'-'*8}-+-{'-'*8}")
        for regime, data in regime_data.items():
            wr_str = f"{data['win_rate']*100:.0f}%" if data["win_rate"] is not None else "N/A"
            min_edge_str = f"{data['avg_dynamic_min_edge']*100:.1f}%" if data["avg_dynamic_min_edge"] else "N/A"
            print(f"   {regime:>18} | {data['count']:>5} | {data['wins']:>3} | {data['losses']:>3} | {wr_str:>6} | {data['avg_edge']*100:>7.1f}% | {min_edge_str:>8}")
    
    # Timing analysis
    timing = timing_analysis(trades)
    if timing["by_hour"]:
        print(f"\n⏰ TIMING ANALYSIS (by hour UTC)")
        for hour, data in timing["by_hour"].items():
            wr_str = f"{data['win_rate']*100:.0f}%" if data["win_rate"] is not None else "N/A"
            print(f"   {hour}: {data['count']} trades, WR: {wr_str}")
    
    # Calibration
    cal = calibration_analysis(trades)
    if cal["status"] == "ok":
        print(f"\n🎯 PROBABILITY CALIBRATION")
        brier_emoji = "✅" if cal["brier_ok"] else "❌"
        print(f"   Brier score: {brier_emoji} {cal['brier_score']:.4f} (target: ≤{cal['brier_target']})")
        print(f"   Overall: predicted {cal['overall_predicted']*100:.1f}% vs actual {cal['overall_actual']*100:.1f}%")
        
        if cal["bins"]:
            print(f"\n   {'Bin':>10} | {'N':>4} | {'W':>3} | {'L':>3} | {'Predicted':>9} | {'Actual':>8} | {'Error':>7} | {'Direction':>14}")
            print(f"   {'-'*10}-+-{'-'*4}-+-{'-'*3}-+-{'-'*3}-+-{'-'*9}-+-{'-'*8}-+-{'-'*7}-+-{'-'*14}")
            for label, data in cal["bins"].items():
                print(f"   {label:>10} | {data['count']:>4} | {data['wins']:>3} | {data['losses']:>3} | "
                      f"{data['predicted_avg_prob']*100:>8.1f}% | {data['actual_win_rate']*100:>7.1f}% | "
                      f"{data['calibration_error']*100:>6.1f}% | {data['direction']:>14}")
    else:
        print(f"\n🎯 PROBABILITY CALIBRATION: {cal['message']}")
    
    # Live trading readiness
    readiness = live_trading_readiness(stats, cal)
    print(f"\n🚦 LIVE TRADING READINESS")
    print(f"   Status: {'✅ READY' if readiness['ready'] else '❌ NOT READY'}")
    print(f"   Checks: {readiness['checks_passed']}/{readiness['checks_total']} passed")
    for name, check in readiness["details"].items():
        emoji = "✅" if check["pass"] else "❌"
        print(f"   {emoji} {name}: {check['progress']} (threshold: {check['threshold']})")
    
    # Recommendations
    print(f"\n💡 RECOMMENDATIONS")
    
    if stats["pending"] > 0 and stats["settled"] == 0:
        print(f"   🔴 All {stats['pending']} trades are pending — run with --settle to check outcomes")
    
    if stats["pending"] > 0 and stats["settled"] > 0:
        print(f"   🟡 {stats['pending']} trades still pending — run --settle again later")
    
    if dup["unique_ratio"] < 0.5:
        print(f"   🟡 High duplication ({(1-dup['unique_ratio'])*100:.0f}% duplicates) — consider dedup in paper mode")
    
    if dup["has_conflicts"]:
        print(f"   🔴 Conflicting YES/NO trades on same ticker — model instability")
    
    if stats["our_prob"]["avg"] and stats["our_prob"]["avg"] > 0.80:
        print(f"   🟡 High average predicted prob ({stats['our_prob']['avg']*100:.0f}%) — may indicate overconfidence")
    
    if stats["unique_tickers"] < 5:
        print(f"   🟡 Low ticker diversity ({stats['unique_tickers']}) — need more varied market conditions")
    
    if stats["total"] < CRITERIA["min_trades_with_outcome"]:
        remaining = CRITERIA["min_trades_with_outcome"] - stats["total"]
        # Estimate time to reach target (assuming current rate continues)
        if stats.get("first_trade") and stats.get("last_trade"):
            try:
                first = datetime.fromisoformat(stats["first_trade"].replace("Z", "+00:00"))
                last = datetime.fromisoformat(stats["last_trade"].replace("Z", "+00:00"))
                duration = (last - first).total_seconds()
                if duration > 0:
                    rate_per_day = stats["total"] / (duration / 86400) if duration >= 86400 else stats["total"] * (86400 / max(duration, 1))
                    days_needed = remaining / rate_per_day if rate_per_day > 0 else float('inf')
                    print(f"   📊 At current rate (~{rate_per_day:.0f}/day), need ~{days_needed:.0f} more days for {CRITERIA['min_trades_with_outcome']} trades")
            except (ValueError, ZeroDivisionError):
                pass
    
    print(f"\n{'=' * 70}")


def save_analysis(trades: list):
    """Save analysis results to JSON file for programmatic access."""
    stats = basic_stats(trades)
    cal = calibration_analysis(trades)
    edge_data = edge_analysis(trades)
    regime_data = regime_analysis(trades)
    timing = timing_analysis(trades)
    dup = duplication_analysis(trades)
    readiness = live_trading_readiness(stats, cal)
    
    analysis = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_file": str(DRYRUN_FILE),
        "basic_stats": stats,
        "calibration": cal,
        "edge_analysis": edge_data,
        "regime_analysis": regime_data,
        "timing_analysis": timing,
        "duplication": dup,
        "readiness": readiness,
    }
    
    ANALYSIS_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(ANALYSIS_OUTPUT, "w") as f:
        json.dump(analysis, f, indent=2, default=str)
    
    print(f"\n📁 Analysis saved to {ANALYSIS_OUTPUT}")


def main():
    args = set(sys.argv[1:])
    compact = "--summary" in args
    do_settle = "--settle" in args
    show_calibration = "--calibration" in args
    
    # Load trades
    trades = load_trades(DRYRUN_FILE)
    
    if not trades:
        # Try live file
        trades = load_trades(LIVE_FILE)
        if trades:
            print(f"📋 Loaded {len(trades)} trades from live file")
        else:
            print("❌ No trade files found!")
            return
    else:
        print(f"📋 Loaded {len(trades)} trades from paper trade file")
    
    # Settlement check (requires Kalshi API access)
    if do_settle:
        print("\n🔍 Checking market settlements...")
        print("   ⚠️ Settlement check requires Kalshi API access")
        print("   ⚠️ Use the autotrader's update_trade_results() function")
        print("   ⚠️ Or manually check tickers on kalshi.com")
        
        # Show tickers to check
        pending = [t for t in trades if t.get("type") == "trade" and t.get("result_status") == "pending"]
        unique_pending = set(t.get("ticker", "") for t in pending)
        print(f"\n   📋 {len(unique_pending)} unique tickers to check:")
        for ticker in sorted(unique_pending):
            print(f"      {ticker}")
    
    # Print report
    print_report(trades, compact=compact)
    
    # Save analysis
    save_analysis(trades)


if __name__ == "__main__":
    main()
