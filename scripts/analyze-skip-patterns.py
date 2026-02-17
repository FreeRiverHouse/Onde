#!/usr/bin/env python3
"""
Analyze kalshi-skips.jsonl to find optimal MIN_EDGE threshold.

Helps answer:
1. Are we skipping too many trades close to threshold?
2. What's the distribution of edge values?
3. Should we lower MIN_EDGE to catch more opportunities?

Author: Clawd
"""

import json
import sys
from collections import defaultdict
from pathlib import Path
from datetime import datetime

SKIP_LOG = Path(__file__).parent / "kalshi-skips.jsonl"

def load_skips():
    """Load all skip records"""
    skips = []
    if not SKIP_LOG.exists():
        print("❌ No skip log found at", SKIP_LOG)
        return []
    
    with open(SKIP_LOG) as f:
        for line in f:
            try:
                skips.append(json.loads(line.strip()))
            except json.JSONDecodeError:
                continue
    return skips

def analyze_edge_distribution(skips):
    """Analyze the distribution of edge values"""
    yes_edges = []
    no_edges = []
    yes_gaps = []
    no_gaps = []
    
    for s in skips:
        edge = s.get("edge", 0)
        gap = s.get("edge_gap", 0)
        reason = s.get("reason", "")
        
        if "yes" in reason:
            yes_edges.append(edge)
            yes_gaps.append(gap)
        elif "no" in reason:
            no_edges.append(edge)
            no_gaps.append(gap)
    
    return {
        "yes_edges": yes_edges,
        "no_edges": no_edges,
        "yes_gaps": yes_gaps,
        "no_gaps": no_gaps
    }

def histogram(values, bins=10):
    """Create simple text histogram"""
    if not values:
        return "No data"
    
    min_v = min(values)
    max_v = max(values)
    if min_v == max_v:
        return f"All values: {min_v:.2%}"
    
    bin_size = (max_v - min_v) / bins
    counts = defaultdict(int)
    
    for v in values:
        bin_idx = min(int((v - min_v) / bin_size), bins - 1)
        counts[bin_idx] += 1
    
    lines = []
    max_count = max(counts.values()) if counts else 1
    
    for i in range(bins):
        low = min_v + i * bin_size
        high = min_v + (i + 1) * bin_size
        count = counts[i]
        bar = "█" * int(40 * count / max_count) if max_count > 0 else ""
        lines.append(f"  {low:>6.1%} - {high:>6.1%}: {bar} ({count})")
    
    return "\n".join(lines)

def find_near_threshold(skips, threshold_yes=0.15, threshold_no=0.25, near_pct=0.05):
    """Find skips that were close to threshold (within near_pct of threshold)"""
    near_yes = []
    near_no = []
    
    for s in skips:
        edge = s.get("edge", 0)
        gap = s.get("edge_gap", 0)
        reason = s.get("reason", "")
        
        if "yes" in reason and gap <= near_pct:
            near_yes.append(s)
        elif "no" in reason and gap <= near_pct:
            near_no.append(s)
    
    return near_yes, near_no

def suggest_thresholds(data):
    """Suggest optimal thresholds based on distribution"""
    yes_edges = data["yes_edges"]
    no_edges = data["no_edges"]
    
    suggestions = []
    
    # For YES: look at 75th percentile of edges (we want to capture top 25% of opportunities)
    if yes_edges:
        yes_edges_sorted = sorted(yes_edges, reverse=True)
        p75_yes = yes_edges_sorted[len(yes_edges_sorted) // 4] if yes_edges_sorted else 0
        p50_yes = yes_edges_sorted[len(yes_edges_sorted) // 2] if yes_edges_sorted else 0
        max_yes = max(yes_edges)
        
        suggestions.append(f"YES edges: max={max_yes:.2%}, p75={p75_yes:.2%}, p50={p50_yes:.2%}")
        
        # If many edges are positive, we might be too conservative
        positive_yes = sum(1 for e in yes_edges if e > 0)
        if positive_yes > len(yes_edges) * 0.3:
            suggestions.append(f"  ⚠️ {positive_yes} YES skips ({positive_yes/len(yes_edges):.0%}) had positive edge - consider lowering YES threshold")
    
    # For NO: same analysis
    if no_edges:
        no_edges_sorted = sorted(no_edges, reverse=True)
        p75_no = no_edges_sorted[len(no_edges_sorted) // 4] if no_edges_sorted else 0
        p50_no = no_edges_sorted[len(no_edges_sorted) // 2] if no_edges_sorted else 0
        max_no = max(no_edges)
        
        suggestions.append(f"NO edges: max={max_no:.2%}, p75={p75_no:.2%}, p50={p50_no:.2%}")
        
        positive_no = sum(1 for e in no_edges if e > 0)
        if positive_no > len(no_edges) * 0.3:
            suggestions.append(f"  ⚠️ {positive_no} NO skips ({positive_no/len(no_edges):.0%}) had positive edge - consider lowering NO threshold")
    
    return suggestions

def analyze_by_asset(skips):
    """Separate analysis by asset (BTC vs ETH)"""
    btc = [s for s in skips if s.get("asset") == "BTC"]
    eth = [s for s in skips if s.get("asset") == "ETH"]
    
    return {
        "BTC": len(btc),
        "ETH": len(eth),
        "btc_skips": btc,
        "eth_skips": eth
    }

def main():
    print("=" * 60)
    print("📊 KALSHI SKIP LOG ANALYSIS")
    print("=" * 60)
    
    skips = load_skips()
    if not skips:
        return
    
    print(f"\n📈 Total skips logged: {len(skips)}")
    
    # Time range
    timestamps = [s.get("timestamp", "") for s in skips if s.get("timestamp")]
    if timestamps:
        print(f"   Time range: {timestamps[0][:16]} → {timestamps[-1][:16]}")
    
    # By reason
    reasons = defaultdict(int)
    for s in skips:
        reasons[s.get("reason", "unknown")] += 1
    
    print(f"\n📋 By reason:")
    for reason, count in sorted(reasons.items(), key=lambda x: -x[1]):
        print(f"   {reason}: {count}")
    
    # By asset
    assets = analyze_by_asset(skips)
    print(f"\n💰 By asset:")
    print(f"   BTC: {assets['BTC']} skips")
    print(f"   ETH: {assets['ETH']} skips")
    
    # Edge distribution
    data = analyze_edge_distribution(skips)
    
    print(f"\n📊 YES edge distribution (skipped trades):")
    print(histogram(data["yes_edges"]))
    
    print(f"\n📊 NO edge distribution (skipped trades):")
    print(histogram(data["no_edges"]))
    
    # Edge gap distribution (how far from threshold)
    print(f"\n📏 YES edge gap distribution (distance from 15% threshold):")
    print(histogram(data["yes_gaps"]))
    
    print(f"\n📏 NO edge gap distribution (distance from 25% threshold):")
    print(histogram(data["no_gaps"]))
    
    # Near-threshold analysis
    near_yes, near_no = find_near_threshold(skips)
    print(f"\n🎯 Near-threshold skips (within 5% of threshold):")
    print(f"   YES: {len(near_yes)} skips close to 15% threshold")
    print(f"   NO: {len(near_no)} skips close to 25% threshold")
    
    if near_yes:
        print(f"\n   Top 5 closest YES misses:")
        for s in sorted(near_yes, key=lambda x: x.get("edge_gap", 1))[:5]:
            print(f"      {s.get('ticker', 'N/A')}: edge={s.get('edge', 0):.1%}, gap={s.get('edge_gap', 0):.1%}")
    
    if near_no:
        print(f"\n   Top 5 closest NO misses:")
        for s in sorted(near_no, key=lambda x: x.get("edge_gap", 1))[:5]:
            print(f"      {s.get('ticker', 'N/A')}: edge={s.get('edge', 0):.1%}, gap={s.get('edge_gap', 0):.1%}")
    
    # Suggestions
    print(f"\n💡 THRESHOLD SUGGESTIONS:")
    suggestions = suggest_thresholds(data)
    for s in suggestions:
        print(f"   {s}")
    
    # Final recommendation
    print(f"\n🎯 RECOMMENDATION:")
    
    yes_gaps = data["yes_gaps"]
    no_gaps = data["no_gaps"]
    
    if yes_gaps:
        close_yes = sum(1 for g in yes_gaps if g < 0.05)
        if close_yes > len(yes_gaps) * 0.2:
            print(f"   • Consider lowering YES threshold to 12% ({close_yes} trades within 5% of 15%)")
        else:
            print(f"   • YES threshold (15%) looks appropriate")
    
    if no_gaps:
        close_no = sum(1 for g in no_gaps if g < 0.05)
        if close_no > len(no_gaps) * 0.2:
            print(f"   • Consider lowering NO threshold to 22% ({close_no} trades within 5% of 25%)")
        else:
            print(f"   • NO threshold (25%) looks appropriate")
    
    # Check if most edges are negative (market is efficient)
    all_edges = data["yes_edges"] + data["no_edges"]
    if all_edges:
        negative_edges = sum(1 for e in all_edges if e < 0)
        if negative_edges > len(all_edges) * 0.8:
            print(f"   • ⚠️ {negative_edges/len(all_edges):.0%} of skipped trades had NEGATIVE edge")
            print(f"     → Market pricing is efficient; current thresholds may be appropriate")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
