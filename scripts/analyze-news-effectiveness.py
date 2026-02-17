#!/usr/bin/env python3
"""
Analyze news sentiment effectiveness on trade performance.
Compares win rate for news-aligned trades vs neutral/non-aligned.

Created: 2026-01-29
Task: T419
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict

TRADES_FILE = Path(__file__).parent / "kalshi-trades.jsonl"
OUTPUT_FILE = Path(__file__).parent.parent / "data" / "trading" / "news-effectiveness.json"

def load_trades():
    """Load all trade entries (not skips) from trade log."""
    trades = []
    if not TRADES_FILE.exists():
        return trades
    
    with open(TRADES_FILE, 'r') as f:
        for line in f:
            if not line.strip():
                continue
            try:
                entry = json.loads(line)
                if entry.get('type') == 'trade':
                    trades.append(entry)
            except json.JSONDecodeError:
                continue
    return trades


def analyze_news_effectiveness(trades):
    """Analyze how news sentiment affects trade outcomes."""
    
    # Categorize trades
    news_aligned = []      # Trade direction matches news sentiment
    news_conflicting = []  # Trade direction conflicts with news sentiment
    news_neutral = []      # No strong news signal
    
    for trade in trades:
        news_sentiment = trade.get('news_sentiment', 'neutral')
        news_bonus = trade.get('news_bonus', 0)
        news_confidence = trade.get('news_confidence', 0)
        side = trade.get('side', '').lower()
        result = trade.get('result_status', '')
        
        # Skip trades without news data
        if news_sentiment == 'neutral' or news_confidence < 0.3:
            news_neutral.append(trade)
            continue
        
        # Determine alignment
        # YES bet + bullish = aligned
        # NO bet + bearish = aligned
        # YES bet + bearish = conflicting
        # NO bet + bullish = conflicting
        is_aligned = (
            (side == 'yes' and news_sentiment == 'bullish') or
            (side == 'no' and news_sentiment == 'bearish')
        )
        
        if is_aligned:
            news_aligned.append(trade)
        else:
            news_conflicting.append(trade)
    
    def calc_stats(trade_list, name):
        """Calculate stats for a trade category."""
        if not trade_list:
            return {
                'name': name,
                'count': 0,
                'settled_count': 0,
                'wins': 0,
                'win_rate': None,
                'avg_edge': None,
                'total_pnl': 0,
                'avg_news_confidence': None
            }
        
        wins = sum(1 for t in trade_list if t.get('result_status') == 'won')
        settled = [t for t in trade_list if t.get('result_status') in ('won', 'lost')]
        
        edges = [t.get('edge', 0) for t in trade_list if t.get('edge')]
        confidences = [t.get('news_confidence', 0) for t in trade_list if t.get('news_confidence')]
        
        # Calculate PnL
        total_pnl = 0
        for t in trade_list:
            if t.get('result_status') == 'won':
                contracts = t.get('contracts', 1)
                price = t.get('price_cents', 50)
                total_pnl += (100 - price) * contracts / 100  # Convert to dollars
            elif t.get('result_status') == 'lost':
                contracts = t.get('contracts', 1)
                price = t.get('price_cents', 50)
                total_pnl -= price * contracts / 100
        
        return {
            'name': name,
            'count': len(trade_list),
            'settled_count': len(settled),
            'wins': wins,
            'win_rate': round(wins / len(settled) * 100, 1) if settled else None,
            'avg_edge': round(sum(edges) / len(edges) * 100, 1) if edges else None,
            'total_pnl': round(total_pnl, 2),
            'avg_news_confidence': round(sum(confidences) / len(confidences), 2) if confidences else None
        }
    
    aligned_stats = calc_stats(news_aligned, 'News Aligned')
    conflicting_stats = calc_stats(news_conflicting, 'News Conflicting')
    neutral_stats = calc_stats(news_neutral, 'Neutral/No News')
    
    # Calculate effectiveness delta
    effectiveness = None
    if aligned_stats['win_rate'] is not None and neutral_stats['win_rate'] is not None:
        effectiveness = round(aligned_stats['win_rate'] - neutral_stats['win_rate'], 1)
    
    # News reasons breakdown
    reasons_count = defaultdict(int)
    for trade in trades:
        for reason in trade.get('news_reasons', []):
            reasons_count[reason] += 1
    
    return {
        'analysis_date': datetime.now(timezone.utc).isoformat(),
        'total_trades': len(trades),
        'trades_with_news': len(news_aligned) + len(news_conflicting),
        'trades_neutral': len(news_neutral),
        
        'categories': {
            'aligned': aligned_stats,
            'conflicting': conflicting_stats,
            'neutral': neutral_stats
        },
        
        'effectiveness_delta': effectiveness,
        'news_reasons': dict(sorted(reasons_count.items(), key=lambda x: -x[1])[:10]),
        
        'recommendation': get_recommendation(aligned_stats, conflicting_stats, neutral_stats)
    }


def get_recommendation(aligned, conflicting, neutral):
    """Generate actionable recommendation based on analysis."""
    
    if aligned['count'] == 0:
        return "INSUFFICIENT_DATA: No news-aligned trades yet. Keep trading to gather data."
    
    if aligned['settled_count'] < 10:
        return f"NEED_MORE_DATA: Only {aligned['settled_count']} settled news-aligned trades. Need 10+ for significance."
    
    if aligned['win_rate'] is None or neutral['win_rate'] is None:
        return "AWAITING_SETTLEMENTS: Some trades still pending settlement."
    
    delta = aligned['win_rate'] - (neutral['win_rate'] or 50)
    
    if delta > 10:
        return f"NEWS_HIGHLY_EFFECTIVE: +{delta:.1f}pp win rate! Consider INCREASING news bonus weight."
    elif delta > 5:
        return f"NEWS_EFFECTIVE: +{delta:.1f}pp win rate. Current integration is working."
    elif delta > -5:
        return f"NEWS_NEUTRAL: {delta:+.1f}pp difference. News signal neither helps nor hurts."
    else:
        return f"NEWS_HURTING: {delta:.1f}pp lower win rate! Consider DISABLING news bonus or inverting signal."


def print_report(analysis):
    """Print human-readable report."""
    print("\n" + "="*60)
    print("📰 NEWS SENTIMENT EFFECTIVENESS ANALYSIS")
    print("="*60)
    print(f"\nAnalysis Date: {analysis['analysis_date'][:19]}")
    print(f"Total Trades: {analysis['total_trades']}")
    print(f"  With News Signal: {analysis['trades_with_news']}")
    print(f"  Neutral/No News: {analysis['trades_neutral']}")
    
    print("\n" + "-"*60)
    print("CATEGORY BREAKDOWN")
    print("-"*60)
    
    for cat_name, cat in analysis['categories'].items():
        print(f"\n{cat['name'].upper()}:")
        print(f"  Trades: {cat['count']}")
        if cat['settled_count']:
            print(f"  Settled: {cat['settled_count']} ({cat['wins']} wins)")
            print(f"  Win Rate: {cat['win_rate']}%" if cat['win_rate'] is not None else "  Win Rate: N/A")
        if cat['avg_edge']:
            print(f"  Avg Edge: {cat['avg_edge']}%")
        print(f"  Total PnL: ${cat['total_pnl']:+.2f}")
        if cat['avg_news_confidence']:
            print(f"  Avg Confidence: {cat['avg_news_confidence']}")
    
    if analysis['effectiveness_delta'] is not None:
        print("\n" + "-"*60)
        print(f"📊 EFFECTIVENESS DELTA: {analysis['effectiveness_delta']:+.1f} pp")
        print("   (Aligned win rate - Neutral win rate)")
    
    if analysis['news_reasons']:
        print("\n" + "-"*60)
        print("TOP NEWS REASONS:")
        for reason, count in list(analysis['news_reasons'].items())[:5]:
            print(f"  {count}x {reason}")
    
    print("\n" + "-"*60)
    print(f"💡 RECOMMENDATION: {analysis['recommendation']}")
    print("="*60 + "\n")


def main():
    trades = load_trades()
    
    if not trades:
        print("❌ No trades found in log file")
        sys.exit(1)
    
    analysis = analyze_news_effectiveness(trades)
    
    # Save to file
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(analysis, f, indent=2)
    
    # Print report
    print_report(analysis)
    
    print(f"📄 Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
