#!/usr/bin/env python3
"""
Analyze win rate by streak position.

Purpose: Detect if win rate changes based on position in streak
(e.g., do we perform worse after 3+ consecutive wins/losses?)

This helps identify psychological or model patterns:
- Overconfidence after wins
- Tilt after losses
- Mean reversion tendencies

Usage:
  python3 scripts/analyze-streak-position.py [--v2] [--min-trades N]
"""

import json
import sys
from pathlib import Path
from collections import defaultdict
from datetime import datetime

V1_FILE = Path(__file__).parent / "kalshi-trades.jsonl"
V2_FILE = Path(__file__).parent / "kalshi-trades-v2.jsonl"

def load_trades(use_v2=False):
    """Load trades with result_status from trade file."""
    filepath = V2_FILE if use_v2 else V1_FILE
    if not filepath.exists():
        print(f"❌ Trade file not found: {filepath}")
        return []
    
    trades = []
    with open(filepath, 'r') as f:
        for line in f:
            try:
                trade = json.loads(line.strip())
                # Only include actual trades with results
                if trade.get('type') == 'trade' and trade.get('result_status') in ('won', 'lost'):
                    trades.append(trade)
            except json.JSONDecodeError:
                continue
    
    # Sort by timestamp
    trades.sort(key=lambda t: t.get('timestamp', ''))
    return trades


def analyze_by_streak_position(trades):
    """
    Analyze win rate by position within a streak.
    
    Position 0 = start of new streak (after opposite outcome)
    Position 1 = 2nd trade in streak direction
    Position 2+ = deep in streak
    """
    if not trades:
        return {}
    
    # Track win rate by position in win streak
    win_streak_positions = defaultdict(lambda: {'wins': 0, 'losses': 0})
    # Track win rate by position in loss streak  
    loss_streak_positions = defaultdict(lambda: {'wins': 0, 'losses': 0})
    # Track win rate after streak end
    after_streak_stats = defaultdict(lambda: {'wins': 0, 'losses': 0})
    
    current_streak = 0  # positive = wins, negative = losses
    
    for trade in trades:
        won = trade['result_status'] == 'won'
        
        # Determine position context
        if current_streak > 0:
            # We were on a win streak, this trade follows wins
            position = min(current_streak, 5)  # Cap at 5+ for grouping
            key = f"after_{position}_wins"
            if won:
                after_streak_stats[key]['wins'] += 1
            else:
                after_streak_stats[key]['losses'] += 1
        elif current_streak < 0:
            # We were on a loss streak, this trade follows losses
            position = min(abs(current_streak), 5)
            key = f"after_{position}_losses"
            if won:
                after_streak_stats[key]['wins'] += 1
            else:
                after_streak_stats[key]['losses'] += 1
        else:
            # First trade or streak just ended
            if won:
                after_streak_stats['first_trade']['wins'] += 1
            else:
                after_streak_stats['first_trade']['losses'] += 1
        
        # Update streak
        if won:
            if current_streak > 0:
                current_streak += 1
            else:
                current_streak = 1  # New win streak
        else:
            if current_streak < 0:
                current_streak -= 1
            else:
                current_streak = -1  # New loss streak
    
    return after_streak_stats


def calculate_stats(stats_dict):
    """Calculate win rate and totals from stats dict."""
    results = []
    for key, stats in sorted(stats_dict.items()):
        total = stats['wins'] + stats['losses']
        if total > 0:
            win_rate = stats['wins'] / total * 100
            results.append({
                'context': key,
                'total': total,
                'wins': stats['wins'],
                'losses': stats['losses'],
                'win_rate': win_rate
            })
    return results


def print_analysis(results, title, min_trades=3):
    """Print formatted analysis results."""
    print(f"\n{'='*60}")
    print(f"📊 {title}")
    print('='*60)
    
    if not results:
        print("  No data available")
        return
    
    # Filter by minimum trades
    filtered = [r for r in results if r['total'] >= min_trades]
    if not filtered:
        print(f"  No contexts with >= {min_trades} trades")
        return
    
    # Sort by context name for readability
    filtered.sort(key=lambda r: r['context'])
    
    for r in filtered:
        bar_len = int(r['win_rate'] / 5)  # 20 chars max
        bar = '█' * bar_len + '░' * (20 - bar_len)
        
        # Color coding
        if r['win_rate'] >= 55:
            emoji = '🟢'
        elif r['win_rate'] >= 45:
            emoji = '🟡'
        else:
            emoji = '🔴'
        
        context_formatted = r['context'].replace('_', ' ').title()
        print(f"\n  {emoji} {context_formatted}")
        print(f"     Trades: {r['total']} ({r['wins']}W / {r['losses']}L)")
        print(f"     Win Rate: {r['win_rate']:.1f}% |{bar}|")


def analyze_streak_continuation(trades):
    """
    Analyze probability of streak continuing vs breaking.
    E.g., after 2 wins, how often does the 3rd trade win?
    """
    if not trades:
        return {}
    
    continuation_stats = defaultdict(lambda: {'continues': 0, 'breaks': 0})
    
    current_streak = 0
    
    for trade in trades:
        won = trade['result_status'] == 'won'
        
        # Check if this trade continues or breaks streak
        if current_streak > 0:  # On win streak
            streak_len = min(current_streak, 5)
            key = f"win_streak_{streak_len}"
            if won:
                continuation_stats[key]['continues'] += 1
            else:
                continuation_stats[key]['breaks'] += 1
        elif current_streak < 0:  # On loss streak
            streak_len = min(abs(current_streak), 5)
            key = f"loss_streak_{streak_len}"
            if not won:  # Loss continues loss streak
                continuation_stats[key]['continues'] += 1
            else:
                continuation_stats[key]['breaks'] += 1
        
        # Update streak
        if won:
            current_streak = current_streak + 1 if current_streak > 0 else 1
        else:
            current_streak = current_streak - 1 if current_streak < 0 else -1
    
    return continuation_stats


def print_continuation_analysis(stats, min_trades=3):
    """Print streak continuation analysis."""
    print(f"\n{'='*60}")
    print("🎲 Streak Continuation Probability")
    print("    (Does a streak tend to continue or break?)")
    print('='*60)
    
    if not stats:
        print("  No data available")
        return
    
    for key in sorted(stats.keys()):
        s = stats[key]
        total = s['continues'] + s['breaks']
        if total < min_trades:
            continue
        
        cont_rate = s['continues'] / total * 100
        
        # Parse key
        parts = key.split('_')
        streak_type = parts[0]
        streak_len = parts[2]
        
        if streak_type == 'win':
            emoji = '🔥' if cont_rate > 50 else '💨'
            label = f"After {streak_len} win(s)"
            outcome = "another win" if cont_rate > 50 else "a loss"
        else:
            emoji = '❄️' if cont_rate > 50 else '🌤️'
            label = f"After {streak_len} loss(es)"
            outcome = "another loss" if cont_rate > 50 else "a win"
        
        bar_len = int(cont_rate / 5)
        bar = '█' * bar_len + '░' * (20 - bar_len)
        
        print(f"\n  {emoji} {label}")
        print(f"     Sample: {total} trades")
        print(f"     Continues: {cont_rate:.1f}% |{bar}|")
        print(f"     → More likely to see {outcome}")


def print_insights(position_results, continuation_stats):
    """Print key insights from the analysis."""
    print(f"\n{'='*60}")
    print("💡 KEY INSIGHTS")
    print('='*60)
    
    insights = []
    
    # Find best/worst contexts
    if position_results:
        best = max(position_results, key=lambda r: r['win_rate']) if position_results else None
        worst = min(position_results, key=lambda r: r['win_rate']) if position_results else None
        
        if best and best['total'] >= 5:
            insights.append(f"✅ Best context: {best['context'].replace('_', ' ')} ({best['win_rate']:.1f}% WR)")
        if worst and worst['total'] >= 5:
            insights.append(f"❌ Worst context: {worst['context'].replace('_', ' ')} ({worst['win_rate']:.1f}% WR)")
    
    # Check for mean reversion patterns
    for key, stats in continuation_stats.items():
        total = stats['continues'] + stats['breaks']
        if total >= 5:
            cont_rate = stats['continues'] / total * 100
            if 'win' in key and cont_rate < 40:
                insights.append(f"📉 Win streaks tend to break early ({100-cont_rate:.0f}% break rate)")
            elif 'loss' in key and cont_rate < 40:
                insights.append(f"📈 Loss streaks tend to break early ({100-cont_rate:.0f}% break rate)")
            elif 'win' in key and cont_rate > 60:
                insights.append(f"🔥 Hot hand detected! Win streaks continue {cont_rate:.0f}% of time")
            elif 'loss' in key and cont_rate > 60:
                insights.append(f"⚠️ Tilt risk! Loss streaks continue {cont_rate:.0f}% of time")
    
    if not insights:
        insights.append("📊 Not enough data for reliable insights yet")
        insights.append("   (Need more trades with win/loss results)")
    
    for insight in insights:
        print(f"  {insight}")
    
    print("\n" + "="*60)


def analyze_by_asset(trades, min_trades=3):
    """
    T389: Analyze streak patterns per asset (BTC vs ETH).
    
    Returns dict with per-asset analysis:
    - streak continuation rates per asset
    - win rate by context per asset
    - comparison insights
    """
    # Group trades by asset
    by_asset = defaultdict(list)
    for trade in trades:
        asset = trade.get('asset', 'unknown')
        by_asset[asset].append(trade)
    
    results = {}
    
    for asset, asset_trades in by_asset.items():
        if len(asset_trades) < min_trades:
            continue
        
        # Run streak analysis per asset
        position_stats = analyze_by_streak_position(asset_trades)
        position_results = calculate_stats(position_stats)
        continuation_stats = analyze_streak_continuation(asset_trades)
        
        # Calculate continuation metrics
        cont_results = []
        for key, s in continuation_stats.items():
            total = s['continues'] + s['breaks']
            if total >= 2:  # Lower threshold per asset
                parts = key.split('_')
                cont_results.append({
                    'streak_type': parts[0],
                    'streak_length': int(parts[2]),
                    'continuation_rate': round(s['continues'] / total * 100, 1),
                    'total': total
                })
        
        # Calculate overall streak stats
        won_trades = sum(1 for t in asset_trades if t.get('result_status') == 'won')
        lost_trades = len(asset_trades) - won_trades
        
        results[asset] = {
            'total_trades': len(asset_trades),
            'wins': won_trades,
            'losses': lost_trades,
            'overall_win_rate': round(won_trades / len(asset_trades) * 100, 1) if asset_trades else 0,
            'position_analysis': position_results,
            'continuation_analysis': cont_results
        }
    
    # Generate comparison insights (BTC vs ETH)
    comparison_insights = []
    if 'btc' in results and 'eth' in results:
        btc = results['btc']
        eth = results['eth']
        
        # Compare overall win rates
        if abs(btc['overall_win_rate'] - eth['overall_win_rate']) > 10:
            better = 'BTC' if btc['overall_win_rate'] > eth['overall_win_rate'] else 'ETH'
            comparison_insights.append({
                'type': 'win_rate_diff',
                'message': f"{better} has significantly better win rate (+{abs(btc['overall_win_rate'] - eth['overall_win_rate']):.1f}%)"
            })
        
        # Compare streak continuation patterns
        btc_loss_cont = next((c for c in btc['continuation_analysis'] 
                             if c['streak_type'] == 'loss' and c['streak_length'] >= 2), None)
        eth_loss_cont = next((c for c in eth['continuation_analysis'] 
                             if c['streak_type'] == 'loss' and c['streak_length'] >= 2), None)
        
        if btc_loss_cont and eth_loss_cont:
            if btc_loss_cont['continuation_rate'] > eth_loss_cont['continuation_rate'] + 15:
                comparison_insights.append({
                    'type': 'tilt_pattern',
                    'message': f"BTC shows more tilt risk (loss streak continues {btc_loss_cont['continuation_rate']:.0f}% vs ETH {eth_loss_cont['continuation_rate']:.0f}%)"
                })
            elif eth_loss_cont['continuation_rate'] > btc_loss_cont['continuation_rate'] + 15:
                comparison_insights.append({
                    'type': 'tilt_pattern',
                    'message': f"ETH shows more tilt risk (loss streak continues {eth_loss_cont['continuation_rate']:.0f}% vs BTC {btc_loss_cont['continuation_rate']:.0f}%)"
                })
    
    return results, comparison_insights


def print_asset_analysis(asset_results, comparison_insights, min_trades=3):
    """Print per-asset streak analysis."""
    print(f"\n{'='*60}")
    print("📊 STREAK ANALYSIS BY ASSET (T389)")
    print('='*60)
    
    for asset, data in sorted(asset_results.items()):
        print(f"\n{'─'*40}")
        emoji = {'btc': '₿', 'eth': 'Ξ', 'weather': '🌤️'}.get(asset, '📈')
        print(f"{emoji} {asset.upper()}")
        print(f"   Trades: {data['total_trades']} | Win Rate: {data['overall_win_rate']:.1f}%")
        
        # Show continuation patterns
        if data['continuation_analysis']:
            print(f"\n   Streak Continuation:")
            for c in sorted(data['continuation_analysis'], key=lambda x: (x['streak_type'], x['streak_length'])):
                if c['total'] >= 2:
                    emoji2 = '🔥' if c['streak_type'] == 'win' else '❄️'
                    print(f"      {emoji2} After {c['streak_length']} {c['streak_type']}(s): {c['continuation_rate']:.0f}% continues (n={c['total']})")
    
    # Print comparison insights
    if comparison_insights:
        print(f"\n{'─'*40}")
        print("🔄 BTC vs ETH COMPARISON")
        for insight in comparison_insights:
            print(f"   → {insight['message']}")
    
    print()


def save_json_output(position_results, continuation_stats, trades_count, min_trades, asset_results=None, comparison_insights=None):
    """Save analysis results to JSON for dashboard consumption."""
    output_dir = Path(__file__).parent.parent / "data" / "trading"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "streak-position-analysis.json"
    
    # Calculate continuation results
    continuation_results = []
    for key in sorted(continuation_stats.keys()):
        s = continuation_stats[key]
        total = s['continues'] + s['breaks']
        if total >= min_trades:
            parts = key.split('_')
            streak_type = parts[0]
            streak_len = int(parts[2])
            cont_rate = s['continues'] / total * 100
            continuation_results.append({
                'streak_type': streak_type,
                'streak_length': streak_len,
                'total': total,
                'continues': s['continues'],
                'breaks': s['breaks'],
                'continuation_rate': round(cont_rate, 1)
            })
    
    # Generate insights
    insights = []
    for r in position_results:
        if r['total'] >= 5:
            if r['win_rate'] >= 60:
                insights.append({
                    'type': 'positive',
                    'context': r['context'],
                    'message': f"Strong win rate ({r['win_rate']:.1f}%) {r['context'].replace('_', ' ')}"
                })
            elif r['win_rate'] <= 40:
                insights.append({
                    'type': 'warning',
                    'context': r['context'],
                    'message': f"Weak win rate ({r['win_rate']:.1f}%) {r['context'].replace('_', ' ')}"
                })
    
    for r in continuation_results:
        if r['continuation_rate'] > 60:
            if r['streak_type'] == 'win':
                insights.append({
                    'type': 'positive',
                    'message': f"Hot hand: Win streaks continue {r['continuation_rate']:.0f}% of time"
                })
            else:
                insights.append({
                    'type': 'warning',
                    'message': f"Tilt risk: Loss streaks continue {r['continuation_rate']:.0f}% of time"
                })
    
    output = {
        'generated_at': datetime.now().isoformat(),
        'trades_analyzed': trades_count,
        'min_trades_threshold': min_trades,
        'position_analysis': position_results,
        'continuation_analysis': continuation_results,
        'insights': insights,
        # T389: Per-asset analysis
        'by_asset': asset_results or {},
        'asset_comparison': comparison_insights or []
    }
    
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)
    
    return output_file


def main():
    use_v2 = '--v2' in sys.argv
    min_trades = 3
    quiet = '--quiet' in sys.argv or '-q' in sys.argv
    
    # Parse --min-trades N
    for i, arg in enumerate(sys.argv):
        if arg == '--min-trades' and i + 1 < len(sys.argv):
            try:
                min_trades = int(sys.argv[i + 1])
            except ValueError:
                pass
    
    source = "v2" if use_v2 else "v1"
    if not quiet:
        print(f"\n🎯 Analyzing streak position patterns ({source} trades)...")
        print(f"   Minimum trades per context: {min_trades}")
    
    trades = load_trades(use_v2)
    
    if not trades:
        if not quiet:
            print("\n❌ No settled trades found!")
            print("   Run settlement tracker first: python3 scripts/kalshi-settlement-tracker.py")
        return
    
    if not quiet:
        print(f"\n📈 Found {len(trades)} settled trades")
    
    # Analyze by position
    position_stats = analyze_by_streak_position(trades)
    position_results = calculate_stats(position_stats)
    if not quiet:
        print_analysis(position_results, "Win Rate by Preceding Context", min_trades)
    
    # Analyze continuation
    continuation_stats = analyze_streak_continuation(trades)
    if not quiet:
        print_continuation_analysis(continuation_stats, min_trades)
    
    # Print insights
    if not quiet:
        print_insights(position_results, continuation_stats)
    
    # T389: Analyze by asset (BTC vs ETH)
    asset_results, comparison_insights = analyze_by_asset(trades, min_trades)
    if not quiet and asset_results:
        print_asset_analysis(asset_results, comparison_insights, min_trades)
    
    # Save JSON output (including asset analysis)
    output_file = save_json_output(
        position_results, continuation_stats, len(trades), min_trades,
        asset_results, comparison_insights
    )
    if not quiet:
        print(f"\n💾 Saved JSON output to: {output_file}")


if __name__ == '__main__':
    main()
