#!/usr/bin/env python3
"""
T266: Backtest regime detection on historical OHLC data.

Runs the regime detection algorithm on historical data to see:
1. How often each regime occurs
2. If regimes correctly predict future price movement
3. Regime transition patterns

Usage:
    python3 scripts/backtest-regime-detection.py [--asset btc|eth]
"""

import json
import argparse
from datetime import datetime, timedelta
from collections import defaultdict
from pathlib import Path

def load_ohlc(asset='btc'):
    """Load cached OHLC data."""
    path = f'data/ohlc/{asset}-ohlc.json'
    try:
        with open(path, 'r') as f:
            data = json.load(f)
            return data.get('candles', [])
    except FileNotFoundError:
        print(f"⚠️  OHLC cache not found: {path}")
        print("   Run: python3 scripts/cache-ohlc-data.py first")
        return []

def detect_regime(candles, current_idx, lookback_4h=6, lookback_24h=6):
    """
    Detect market regime based on OHLC data.
    Mirrors autotrader-v2.py detect_market_regime() logic.
    
    Returns: (regime, details)
    """
    if current_idx < lookback_24h:
        return 'unknown', {}
    
    # Get current and historical prices
    current_close = candles[current_idx]['close']
    
    # 4h lookback (6 x 4h candles = 24h in 4h data)
    # But we have 4h candles, so lookback_4h=1 means previous candle
    idx_4h_ago = max(0, current_idx - 1)  # 1 candle ago = 4h
    price_4h_ago = candles[idx_4h_ago]['close']
    
    # 24h lookback (6 candles in 4h data)
    idx_24h_ago = max(0, current_idx - 6)
    price_24h_ago = candles[idx_24h_ago]['close']
    
    # Calculate changes
    change_4h = (current_close - price_4h_ago) / price_4h_ago * 100
    change_24h = (current_close - price_24h_ago) / price_24h_ago * 100
    
    # Calculate volatility (high-low range)
    recent_candles = candles[max(0, current_idx-5):current_idx+1]
    if recent_candles:
        ranges = [(c['high'] - c['low']) / c['low'] * 100 for c in recent_candles]
        avg_range = sum(ranges) / len(ranges)
    else:
        avg_range = 0
    
    # Determine regime
    details = {
        'change_4h': change_4h,
        'change_24h': change_24h,
        'avg_range_pct': avg_range,
        'current_price': current_close
    }
    
    # Trending: consistent direction with decent move
    if change_24h > 2 and change_4h > 0:
        regime = 'trending_bullish'
    elif change_24h < -2 and change_4h < 0:
        regime = 'trending_bearish'
    # Choppy: high volatility, direction changes
    elif avg_range > 2 and abs(change_4h) < 1:
        regime = 'choppy'
    # Sideways: low movement
    elif abs(change_24h) < 1.5 and abs(change_4h) < 0.5:
        regime = 'sideways'
    # Default to sideways
    else:
        regime = 'sideways'
    
    return regime, details

def calculate_future_return(candles, current_idx, hours_ahead=4):
    """Calculate return N hours ahead for prediction accuracy."""
    candles_ahead = hours_ahead // 4  # Convert to candle count
    future_idx = current_idx + candles_ahead
    
    if future_idx >= len(candles):
        return None
    
    current_close = candles[current_idx]['close']
    future_close = candles[future_idx]['close']
    return (future_close - current_close) / current_close * 100

def run_backtest(candles, asset='BTC'):
    """Run regime detection on all candles and analyze results."""
    results = {
        'regimes': defaultdict(lambda: {'count': 0, 'returns': [], 'transitions': defaultdict(int)}),
        'transitions': defaultdict(int),
        'total_candles': len(candles),
        'analyzed': 0
    }
    
    prev_regime = None
    
    for i in range(6, len(candles) - 1):  # Start at 6 for lookback, end before last for future
        regime, details = detect_regime(candles, i)
        
        if regime == 'unknown':
            continue
        
        results['analyzed'] += 1
        results['regimes'][regime]['count'] += 1
        
        # Calculate future return (4h ahead)
        future_return = calculate_future_return(candles, i, hours_ahead=4)
        if future_return is not None:
            results['regimes'][regime]['returns'].append(future_return)
        
        # Track transitions
        if prev_regime and prev_regime != regime:
            results['transitions'][f"{prev_regime}→{regime}"] += 1
            results['regimes'][prev_regime]['transitions'][regime] += 1
        
        prev_regime = regime
    
    return results

def analyze_prediction_accuracy(results):
    """Analyze how well each regime predicts future movement."""
    predictions = {}
    
    for regime, data in results['regimes'].items():
        returns = data['returns']
        if not returns:
            continue
        
        avg_return = sum(returns) / len(returns)
        positive = sum(1 for r in returns if r > 0)
        negative = sum(1 for r in returns if r < 0)
        
        # Expected direction based on regime
        if regime == 'trending_bullish':
            expected_dir = 'up'
            correct = positive
        elif regime == 'trending_bearish':
            expected_dir = 'down'
            correct = negative
        else:
            expected_dir = 'neutral'
            correct = sum(1 for r in returns if abs(r) < 1)  # Small moves
        
        accuracy = correct / len(returns) * 100 if returns else 0
        
        predictions[regime] = {
            'expected_direction': expected_dir,
            'avg_4h_return': avg_return,
            'prediction_accuracy': accuracy,
            'sample_size': len(returns)
        }
    
    return predictions

def print_report(results, predictions, asset):
    """Print formatted backtest report."""
    print("\n" + "="*70)
    print(f"📊 REGIME DETECTION BACKTEST - {asset.upper()}")
    print("="*70)
    
    total = results['analyzed']
    print(f"\n📈 Total candles analyzed: {total}")
    print(f"   (Lookback requires first 6 candles)")
    
    # Regime distribution
    print("\n" + "-"*60)
    print("📊 REGIME DISTRIBUTION")
    print("-"*60)
    print(f"{'Regime':<20} {'Count':>8} {'%':>8} {'Avg 4h Return':>15}")
    print("-"*60)
    
    for regime in ['trending_bullish', 'trending_bearish', 'sideways', 'choppy']:
        data = results['regimes'].get(regime, {'count': 0, 'returns': []})
        count = data['count']
        pct = count / total * 100 if total > 0 else 0
        avg_ret = sum(data['returns']) / len(data['returns']) if data['returns'] else 0
        
        emoji = {'trending_bullish': '🟢', 'trending_bearish': '🔴', 'sideways': '🟡', 'choppy': '🟠'}.get(regime, '⚪')
        print(f"{emoji} {regime:<18} {count:>8} {pct:>7.1f}% {avg_ret:>14.2f}%")
    
    # Prediction accuracy
    print("\n" + "-"*60)
    print("🎯 PREDICTION ACCURACY (4h ahead)")
    print("-"*60)
    print(f"{'Regime':<20} {'Expected':>10} {'Accuracy':>10} {'Samples':>10}")
    print("-"*60)
    
    for regime, pred in predictions.items():
        acc = pred['prediction_accuracy']
        marker = '✅' if acc > 50 else '❌'
        print(f"{marker} {regime:<18} {pred['expected_direction']:>10} {acc:>9.1f}% {pred['sample_size']:>10}")
    
    # Transitions
    print("\n" + "-"*60)
    print("🔄 REGIME TRANSITIONS (top 5)")
    print("-"*60)
    
    sorted_transitions = sorted(results['transitions'].items(), key=lambda x: x[1], reverse=True)[:5]
    for transition, count in sorted_transitions:
        print(f"   {transition}: {count}")
    
    # Insights
    print("\n" + "-"*60)
    print("💡 INSIGHTS")
    print("-"*60)
    
    # Find dominant regime
    regimes_by_count = sorted(results['regimes'].items(), key=lambda x: x[1]['count'], reverse=True)
    if regimes_by_count:
        dominant = regimes_by_count[0][0]
        dom_pct = regimes_by_count[0][1]['count'] / total * 100 if total > 0 else 0
        print(f"   📌 Dominant regime: {dominant} ({dom_pct:.1f}% of time)")
    
    # Find most accurate prediction
    if predictions:
        best_pred = max(predictions.items(), key=lambda x: x[1]['prediction_accuracy'])
        print(f"   🎯 Most accurate regime: {best_pred[0]} ({best_pred[1]['prediction_accuracy']:.1f}% accuracy)")
    
    # Trend persistence
    bullish_data = results['regimes'].get('trending_bullish', {})
    bearish_data = results['regimes'].get('trending_bearish', {})
    
    if bullish_data.get('returns'):
        bullish_avg = sum(bullish_data['returns']) / len(bullish_data['returns'])
        print(f"   📈 Bullish regime avg return: {bullish_avg:+.2f}% (trend continuation)")
    
    if bearish_data.get('returns'):
        bearish_avg = sum(bearish_data['returns']) / len(bearish_data['returns'])
        print(f"   📉 Bearish regime avg return: {bearish_avg:+.2f}% (trend continuation)")
    
    print("\n" + "="*70 + "\n")

def save_results(results, predictions, asset):
    """Save results to JSON."""
    output = {
        'asset': asset,
        'generated_at': datetime.now().isoformat(),
        'regime_distribution': {},
        'predictions': predictions,
        'transitions': dict(results['transitions'])
    }
    
    for regime, data in results['regimes'].items():
        output['regime_distribution'][regime] = {
            'count': data['count'],
            'percentage': data['count'] / results['analyzed'] * 100 if results['analyzed'] > 0 else 0,
            'avg_return_4h': sum(data['returns']) / len(data['returns']) if data['returns'] else 0
        }
    
    path = Path(f'data/trading/regime-backtest-{asset.lower()}.json')
    path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(path, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"✅ Results saved to {path}")

def main():
    parser = argparse.ArgumentParser(description='Backtest regime detection on historical OHLC data')
    parser.add_argument('--asset', choices=['btc', 'eth'], default='btc', help='Asset to analyze')
    args = parser.parse_args()
    
    candles = load_ohlc(args.asset)
    if not candles:
        return
    
    print(f"📂 Loaded {len(candles)} candles for {args.asset.upper()}")
    
    results = run_backtest(candles, args.asset)
    predictions = analyze_prediction_accuracy(results)
    
    print_report(results, predictions, args.asset)
    save_results(results, predictions, args.asset)

if __name__ == '__main__':
    main()
