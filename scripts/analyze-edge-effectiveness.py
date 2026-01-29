#!/usr/bin/env python3
"""
Analyze trade confidence (edge) vs actual outcomes.

Purpose: Track if calculated edge at entry correlates with win rate.
Higher edge should = higher win rate if model is well-calibrated.

This helps validate model accuracy and find optimal edge thresholds.

Usage:
  python3 scripts/analyze-edge-effectiveness.py [--v2] [--buckets N]
"""

import json
import sys
from pathlib import Path
from collections import defaultdict
from datetime import datetime

V1_FILE = Path(__file__).parent / "kalshi-trades.jsonl"
V2_FILE = Path(__file__).parent / "kalshi-trades-v2.jsonl"

def load_trades(use_v2=False):
    """Load trades with edge and result_status."""
    filepath = V2_FILE if use_v2 else V1_FILE
    if not filepath.exists():
        print(f"❌ Trade file not found: {filepath}")
        return []
    
    trades = []
    with open(filepath, 'r') as f:
        for line in f:
            try:
                trade = json.loads(line.strip())
                # Only include trades with results
                if trade.get('type') == 'trade' and trade.get('result_status') in ('won', 'lost'):
                    # Try to get edge from various fields
                    edge = None
                    if 'edge' in trade:
                        edge = trade['edge']
                    elif 'edge_at_entry' in trade:
                        edge = trade['edge_at_entry']
                    elif 'calculated_edge' in trade:
                        edge = trade['calculated_edge']
                    elif 'reason' in trade:
                        # Try to parse edge from reason string
                        # e.g., "edge 12.5%, momentum bullish"
                        import re
                        match = re.search(r'edge\s*([\d.]+)%', trade['reason'])
                        if match:
                            edge = float(match.group(1))
                    
                    if edge is not None:
                        trade['edge_value'] = edge
                        trades.append(trade)
            except json.JSONDecodeError:
                continue
    
    trades.sort(key=lambda t: t.get('timestamp', ''))
    return trades


def analyze_by_edge_bucket(trades, num_buckets=5):
    """
    Group trades by edge bucket and analyze win rate per bucket.
    """
    if not trades:
        return {}
    
    edges = [t['edge_value'] for t in trades]
    min_edge = min(edges)
    max_edge = max(edges)
    
    if max_edge == min_edge:
        bucket_size = 5  # Default 5% buckets
    else:
        bucket_size = (max_edge - min_edge) / num_buckets
    
    bucket_stats = defaultdict(lambda: {'wins': 0, 'losses': 0, 'edges': []})
    
    for trade in trades:
        edge = trade['edge_value']
        # Determine bucket
        bucket_idx = int((edge - min_edge) / bucket_size) if bucket_size > 0 else 0
        bucket_idx = min(bucket_idx, num_buckets - 1)  # Cap at last bucket
        
        bucket_start = min_edge + (bucket_idx * bucket_size)
        bucket_end = bucket_start + bucket_size
        bucket_key = f"{bucket_start:.1f}%-{bucket_end:.1f}%"
        
        won = trade['result_status'] == 'won'
        if won:
            bucket_stats[bucket_key]['wins'] += 1
        else:
            bucket_stats[bucket_key]['losses'] += 1
        bucket_stats[bucket_key]['edges'].append(edge)
    
    return dict(bucket_stats)


def analyze_edge_correlation(trades):
    """
    Calculate correlation between edge and win outcome.
    Returns Pearson correlation coefficient.
    """
    if len(trades) < 3:
        return None, None
    
    edges = [t['edge_value'] for t in trades]
    outcomes = [1 if t['result_status'] == 'won' else 0 for t in trades]
    
    n = len(edges)
    mean_edge = sum(edges) / n
    mean_outcome = sum(outcomes) / n
    
    # Calculate covariance
    cov = sum((e - mean_edge) * (o - mean_outcome) for e, o in zip(edges, outcomes)) / n
    
    # Calculate standard deviations
    std_edge = (sum((e - mean_edge) ** 2 for e in edges) / n) ** 0.5
    std_outcome = (sum((o - mean_outcome) ** 2 for o in outcomes) / n) ** 0.5
    
    if std_edge == 0 or std_outcome == 0:
        return None, None
    
    correlation = cov / (std_edge * std_outcome)
    
    return correlation, mean_outcome


def analyze_calibration(trades, threshold=0.5):
    """
    Analyze if edge predicts actual win rate well.
    For each trade, edge is the expected advantage.
    Expected win rate ≈ 0.5 + (edge/2) for binary outcomes.
    """
    if not trades:
        return {}
    
    # Group by expected probability range
    calibration = defaultdict(lambda: {'predicted_prob': [], 'actual_wins': 0, 'total': 0})
    
    for trade in trades:
        edge = trade['edge_value']
        # Convert edge to expected probability
        # Edge of 10% means ~55% expected win rate
        expected_prob = 0.5 + (edge / 200)  # /200 because edge is in %
        expected_prob = max(0.5, min(0.95, expected_prob))  # Clamp
        
        # Bucket by 10% probability ranges
        prob_bucket = int(expected_prob * 10) / 10  # 0.5, 0.6, 0.7, etc.
        bucket_key = f"{prob_bucket:.0%}-{prob_bucket+0.1:.0%}"
        
        calibration[bucket_key]['predicted_prob'].append(expected_prob)
        calibration[bucket_key]['total'] += 1
        if trade['result_status'] == 'won':
            calibration[bucket_key]['actual_wins'] += 1
    
    return dict(calibration)


def print_edge_analysis(bucket_stats, title="Edge vs Win Rate"):
    """Print edge bucket analysis."""
    print(f"\n{'='*60}")
    print(f"📊 {title}")
    print('='*60)
    
    if not bucket_stats:
        print("  No data available")
        return
    
    # Sort buckets by edge range
    sorted_buckets = sorted(bucket_stats.items(), 
                           key=lambda x: float(x[0].split('%')[0]))
    
    print(f"\n  {'Edge Range':<15} {'Trades':>8} {'W/L':>10} {'Win Rate':>10} {'Expected':>10}")
    print("  " + "-"*55)
    
    for bucket, stats in sorted_buckets:
        total = stats['wins'] + stats['losses']
        if total == 0:
            continue
        
        win_rate = stats['wins'] / total * 100
        avg_edge = sum(stats['edges']) / len(stats['edges'])
        expected_wr = 50 + (avg_edge / 2)  # Simplified expectation
        
        # Color indicator
        if win_rate >= expected_wr - 5:
            emoji = '✅'  # On or above expectation
        elif win_rate >= expected_wr - 15:
            emoji = '⚠️'  # Slightly below
        else:
            emoji = '❌'  # Way below expectation
        
        print(f"  {emoji} {bucket:<12} {total:>6} {stats['wins']:>4}/{stats['losses']:<4} {win_rate:>8.1f}% {expected_wr:>8.1f}%")
    
    print()


def print_correlation(correlation, avg_win_rate):
    """Print correlation analysis."""
    print(f"\n{'='*60}")
    print("📈 Edge-Outcome Correlation")
    print('='*60)
    
    if correlation is None:
        print("  ❓ Not enough data for correlation analysis")
        return
    
    # Interpret correlation
    if correlation > 0.3:
        interpretation = "Strong positive 💪"
        insight = "Higher edge → Higher win rate (model works!)"
    elif correlation > 0.1:
        interpretation = "Weak positive 👍"
        insight = "Edge has some predictive value"
    elif correlation > -0.1:
        interpretation = "No correlation 🤷"
        insight = "Edge doesn't predict outcomes (needs calibration)"
    elif correlation > -0.3:
        interpretation = "Weak negative ⚠️"
        insight = "Model may be overfit or wrong"
    else:
        interpretation = "Strong negative 🚨"
        insight = "Model is inverted! High edge = worse outcomes"
    
    print(f"\n  Correlation coefficient: {correlation:+.3f}")
    print(f"  Interpretation: {interpretation}")
    print(f"  Insight: {insight}")
    print(f"\n  Average win rate: {avg_win_rate*100:.1f}%")


def print_calibration(calibration):
    """Print calibration analysis."""
    print(f"\n{'='*60}")
    print("🎯 Model Calibration (Predicted vs Actual)")
    print('='*60)
    
    if not calibration:
        print("  No data available")
        return
    
    print(f"\n  {'Expected WR':<12} {'Actual WR':>10} {'Trades':>8} {'Calibration':>12}")
    print("  " + "-"*45)
    
    for bucket in sorted(calibration.keys()):
        stats = calibration[bucket]
        if stats['total'] == 0:
            continue
        
        avg_predicted = sum(stats['predicted_prob']) / len(stats['predicted_prob']) * 100
        actual_wr = stats['actual_wins'] / stats['total'] * 100
        
        diff = actual_wr - avg_predicted
        if abs(diff) <= 5:
            cal_emoji = '✅ Perfect'
        elif abs(diff) <= 15:
            cal_emoji = '⚠️ Off by ' + f'{abs(diff):.0f}%'
        else:
            cal_emoji = '❌ Way off'
        
        print(f"  {bucket:<12} {actual_wr:>8.1f}% {stats['total']:>8} {cal_emoji:>12}")


def print_insights(bucket_stats, correlation, avg_win_rate):
    """Print key insights."""
    print(f"\n{'='*60}")
    print("💡 KEY INSIGHTS")
    print('='*60)
    
    insights = []
    
    # Check if higher edge = better win rate
    if bucket_stats:
        sorted_buckets = sorted(bucket_stats.items(), 
                               key=lambda x: float(x[0].split('%')[0]))
        
        win_rates = []
        for _, stats in sorted_buckets:
            total = stats['wins'] + stats['losses']
            if total >= 3:
                wr = stats['wins'] / total * 100
                win_rates.append(wr)
        
        if len(win_rates) >= 2:
            if win_rates[-1] > win_rates[0]:
                insights.append("✅ Higher edge correlates with better win rate")
            else:
                insights.append("⚠️ Edge doesn't improve win rate (model needs work)")
    
    # Correlation insights
    if correlation is not None:
        if correlation > 0.2:
            insights.append(f"✅ Edge has predictive power (r={correlation:.2f})")
        elif correlation < -0.1:
            insights.append(f"🚨 Edge is negatively correlated! (r={correlation:.2f})")
    
    # Win rate insights
    if avg_win_rate is not None:
        if avg_win_rate > 0.55:
            insights.append(f"🏆 Overall win rate is strong ({avg_win_rate*100:.1f}%)")
        elif avg_win_rate < 0.45:
            insights.append(f"⚠️ Overall win rate is low ({avg_win_rate*100:.1f}%)")
    
    # Recommendations
    print("\n  📋 FINDINGS:")
    if not insights:
        insights.append("📊 Not enough data for meaningful insights")
        insights.append("   Need more trades with edge data")
    
    for insight in insights:
        print(f"  {insight}")
    
    print("\n  🔧 RECOMMENDATIONS:")
    if correlation is not None and correlation < 0.1:
        print("  • Revisit probability model - edge should predict outcomes")
        print("  • Consider recalibrating MIN_EDGE threshold")
    if avg_win_rate is not None and avg_win_rate < 0.5:
        print("  • Model may be systematically biased")
        print("  • Check if market conditions have changed")
    
    print("\n" + "="*60)


def main():
    use_v2 = '--v2' in sys.argv
    num_buckets = 5
    
    # Parse --buckets N
    for i, arg in enumerate(sys.argv):
        if arg == '--buckets' and i + 1 < len(sys.argv):
            try:
                num_buckets = int(sys.argv[i + 1])
            except ValueError:
                pass
    
    source = "v2" if use_v2 else "v1"
    print(f"\n🎯 Analyzing edge effectiveness ({source} trades)...")
    
    trades = load_trades(use_v2)
    
    if not trades:
        print("\n❌ No trades with edge data found!")
        print("   Edge tracking was added later - need v2 trades or trades with 'reason' field")
        return
    
    print(f"\n📈 Found {len(trades)} trades with edge data")
    
    # Edge vs Win Rate by bucket
    bucket_stats = analyze_by_edge_bucket(trades, num_buckets)
    print_edge_analysis(bucket_stats)
    
    # Correlation analysis
    correlation, avg_wr = analyze_edge_correlation(trades)
    print_correlation(correlation, avg_wr)
    
    # Calibration analysis
    calibration = analyze_calibration(trades)
    print_calibration(calibration)
    
    # Insights
    print_insights(bucket_stats, correlation, avg_wr)


if __name__ == '__main__':
    main()
