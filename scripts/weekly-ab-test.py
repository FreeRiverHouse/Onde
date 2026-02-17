#!/usr/bin/env python3
"""
Weekly A/B Test Runner
======================
Automatically runs A/B tests comparing baseline strategy vs all variants.
Creates alerts when a strategy significantly outperforms baseline.

Usage:
  python weekly-ab-test.py              # Run comparison
  python weekly-ab-test.py --dry-run    # Show what would be alerted
  python weekly-ab-test.py --force      # Run even if already ran this week

Cron: 0 21 * * 0 (Sunday 21:00 UTC / 13:00 PST, after weekly report)

Author: @clawd
Created: 2026-02-01
"""

import os
import sys
import json
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any

# Add parent dir for imports
SCRIPT_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRIPT_DIR))

# Import from ab-testing-framework.py (with hyphen)
import importlib.util
spec = importlib.util.spec_from_file_location("ab_testing", SCRIPT_DIR / "ab-testing-framework.py")
ab_testing = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ab_testing)

# Import needed functions
load_strategies = ab_testing.load_strategies
load_historical_trades = ab_testing.load_historical_trades
backtest_strategy = ab_testing.backtest_strategy
statistical_significance = ab_testing.statistical_significance
BacktestResult = ab_testing.BacktestResult
StrategyParams = ab_testing.StrategyParams

# Paths
DATA_DIR = SCRIPT_DIR.parent / "data" / "trading"
ALERT_FILE = SCRIPT_DIR / "kalshi-strategy-recommendation.alert"
STATE_FILE = DATA_DIR / "weekly-ab-test-state.json"
RESULTS_FILE = DATA_DIR / "weekly-ab-test-results.json"

# Thresholds
MIN_IMPROVEMENT_PCT = 5.0  # Minimum win rate improvement to alert
MIN_TRADES = 20  # Minimum trades to consider valid
DAYS_TO_ANALYZE = 30  # Days of historical data


def load_state() -> Dict:
    """Load last run state."""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE) as f:
                return json.load(f)
        except:
            pass
    return {}


def save_state(state: Dict) -> None:
    """Save run state."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def save_results(results: Dict) -> None:
    """Save test results."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # Load existing results
    existing = {}
    if RESULTS_FILE.exists():
        try:
            with open(RESULTS_FILE) as f:
                existing = json.load(f)
        except:
            pass
    
    # Add new results
    week_key = datetime.now().strftime("%Y-W%W")
    existing[week_key] = results
    
    # Keep last 12 weeks
    sorted_keys = sorted(existing.keys(), reverse=True)[:12]
    existing = {k: existing[k] for k in sorted_keys}
    
    with open(RESULTS_FILE, "w") as f:
        json.dump(existing, f, indent=2, default=str)


def create_alert(
    winner: str,
    baseline_wr: float,
    winner_wr: float,
    improvement: float,
    confidence: str,
    details: Dict
) -> None:
    """Create alert file for heartbeat pickup."""
    alert_content = {
        "timestamp": datetime.now().isoformat(),
        "type": "strategy_recommendation",
        "winner": winner,
        "baseline_win_rate": round(baseline_wr * 100, 1),
        "winner_win_rate": round(winner_wr * 100, 1),
        "improvement_pct": round(improvement, 1),
        "confidence": confidence,
        "recommendation": f"Consider switching to '{winner}' strategy",
        "details": details,
    }
    
    with open(ALERT_FILE, "w") as f:
        json.dump(alert_content, f, indent=2)
    
    print(f"✅ Alert created: {ALERT_FILE}")


def format_result_summary(result: BacktestResult) -> Dict:
    """Format result for reporting."""
    return {
        "trades": result.trades,
        "win_rate": round(result.win_rate * 100, 1),
        "pnl": round(result.total_pnl, 2),
        "roi": round(result.roi * 100, 1),
        "sharpe": round(result.sharpe_ratio, 2),
        "max_drawdown": round(result.max_drawdown * 100, 1),
    }


def run_weekly_test(dry_run: bool = False, verbose: bool = False) -> Optional[Dict]:
    """
    Run weekly A/B test comparing all strategies to baseline.
    Returns the winning strategy details if one significantly outperforms.
    """
    print(f"\n📊 Weekly A/B Test - {datetime.now().strftime('%Y-%m-%d')}")
    print("=" * 60)
    
    # Load strategies
    strategies = load_strategies()
    if "baseline" not in strategies:
        print("❌ No baseline strategy defined")
        return None
    
    # Load historical trades
    trades = load_historical_trades(DAYS_TO_ANALYZE)
    print(f"📈 Analyzing {len(trades)} trades from last {DAYS_TO_ANALYZE} days")
    
    if len(trades) < MIN_TRADES:
        print(f"⚠️  Not enough trades ({len(trades)}) for analysis. Need {MIN_TRADES}+")
        return None
    
    # Backtest all strategies
    results = {}
    baseline_result = None
    
    for name, strategy in strategies.items():
        result = backtest_strategy(strategy, trades)
        results[name] = result
        
        if name == "baseline":
            baseline_result = result
        
        if verbose:
            print(f"   {name}: {result.trades} trades, {result.win_rate*100:.1f}% WR, ${result.total_pnl:+.2f}")
    
    if not baseline_result:
        print("❌ Could not backtest baseline strategy")
        return None
    
    print(f"\n📊 Baseline: {baseline_result.win_rate*100:.1f}% WR, ${baseline_result.total_pnl:+.2f} PnL")
    
    # Compare each strategy to baseline
    winners = []
    
    for name, result in results.items():
        if name == "baseline":
            continue
        
        if result.trades < MIN_TRADES:
            if verbose:
                print(f"   {name}: Skipped (only {result.trades} trades)")
            continue
        
        # Calculate improvement
        wr_improvement = (result.win_rate - baseline_result.win_rate) * 100
        roi_improvement = (result.roi - baseline_result.roi) * 100
        
        # Statistical significance test
        sig = statistical_significance(baseline_result, result)
        
        if verbose:
            print(f"\n   {name} vs baseline:")
            print(f"      WR: {result.win_rate*100:.1f}% vs {baseline_result.win_rate*100:.1f}% ({wr_improvement:+.1f}%)")
            print(f"      ROI: {result.roi*100:.1f}% vs {baseline_result.roi*100:.1f}% ({roi_improvement:+.1f}%)")
            print(f"      Significance: {sig['significance']}")
        
        # Check if significantly better
        if sig['significant'] and sig['winner'] == name:
            if wr_improvement >= MIN_IMPROVEMENT_PCT or roi_improvement >= MIN_IMPROVEMENT_PCT * 2:
                winners.append({
                    "strategy": name,
                    "result": result,
                    "wr_improvement": wr_improvement,
                    "roi_improvement": roi_improvement,
                    "significance": sig,
                })
    
    # Save all results
    test_results = {
        "timestamp": datetime.now().isoformat(),
        "days_analyzed": DAYS_TO_ANALYZE,
        "total_trades": len(trades),
        "baseline": format_result_summary(baseline_result),
        "strategies": {name: format_result_summary(r) for name, r in results.items()},
        "significant_winners": len(winners),
    }
    
    if not dry_run:
        save_results(test_results)
    
    # Report findings
    if not winners:
        print(f"\n✅ No strategies significantly outperform baseline")
        print("   Current configuration remains optimal")
        return None
    
    # Sort winners by improvement
    winners.sort(key=lambda x: x['wr_improvement'], reverse=True)
    best_winner = winners[0]
    
    print(f"\n🏆 WINNER FOUND: {best_winner['strategy']}")
    print(f"   Win Rate: {best_winner['result'].win_rate*100:.1f}% ({best_winner['wr_improvement']:+.1f}% vs baseline)")
    print(f"   ROI: {best_winner['result'].roi*100:.1f}% ({best_winner['roi_improvement']:+.1f}% vs baseline)")
    print(f"   Confidence: {best_winner['significance']['significance']}")
    
    # Create alert
    if not dry_run:
        create_alert(
            winner=best_winner['strategy'],
            baseline_wr=baseline_result.win_rate,
            winner_wr=best_winner['result'].win_rate,
            improvement=best_winner['wr_improvement'],
            confidence=best_winner['significance']['significance'],
            details={
                "baseline_roi": round(baseline_result.roi * 100, 1),
                "winner_roi": round(best_winner['result'].roi * 100, 1),
                "trades_analyzed": len(trades),
                "z_score": best_winner['significance']['z_score'],
            }
        )
    else:
        print("\n🔍 DRY RUN: Alert would be created for above winner")
    
    return test_results


def main():
    parser = argparse.ArgumentParser(
        description="Weekly A/B Test Runner for Trading Strategies"
    )
    parser.add_argument("--dry-run", action="store_true", help="Show results without creating alerts")
    parser.add_argument("--force", action="store_true", help="Run even if already ran this week")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    # Check if already ran this week
    state = load_state()
    last_run = state.get("last_run")
    
    if last_run and not args.force:
        last_run_date = datetime.fromisoformat(last_run)
        days_since = (datetime.now() - last_run_date).days
        
        if days_since < 7:
            print(f"ℹ️  Already ran {days_since} days ago. Use --force to run again.")
            return
    
    # Run test
    results = run_weekly_test(dry_run=args.dry_run, verbose=args.verbose)
    
    # Update state
    if not args.dry_run:
        state["last_run"] = datetime.now().isoformat()
        state["last_result"] = "winner_found" if results and results.get("significant_winners", 0) > 0 else "no_change"
        save_state(state)
    
    print("\n✅ Weekly A/B test complete")


if __name__ == "__main__":
    main()
