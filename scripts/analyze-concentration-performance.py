#!/usr/bin/env python3
"""
Analyze relationship between portfolio concentration and trade performance.
Compares win rate and PnL when concentration >40% vs <40%.

Output: data/trading/concentration-analysis.json
"""

import json
import os
import glob
from datetime import datetime, timedelta
from collections import defaultdict
from pathlib import Path

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "trading"
OUTPUT_FILE = DATA_DIR / "concentration-analysis.json"

# Asset classification
CRYPTO_TICKERS = ["KXBTC", "KXETH"]
WEATHER_CITIES = ["KXNYC", "KXMIA", "KXDEN", "KXCHI", "KXLAX", "KXHOU", "KXAUS", "KXPHI", "KXSFO"]


def classify_asset(ticker: str) -> tuple[str, str]:
    """Returns (asset_class, specific_asset)"""
    ticker_upper = ticker.upper()
    
    if "KXBTC" in ticker_upper:
        return "crypto", "BTC"
    elif "KXETH" in ticker_upper:
        return "crypto", "ETH"
    
    for city in WEATHER_CITIES:
        if city in ticker_upper:
            return "weather", city.replace("KX", "")
    
    return "other", "OTHER"


def load_trades() -> list[dict]:
    """Load all trades from trade log files."""
    trades = []
    
    # Find all trade log files
    for filepath in glob.glob(str(DATA_DIR / "kalshi-trades-*.jsonl")):
        with open(filepath, "r") as f:
            for line in f:
                try:
                    entry = json.loads(line.strip())
                    if entry.get("type") == "trade":
                        trades.append(entry)
                except json.JSONDecodeError:
                    continue
    
    return sorted(trades, key=lambda x: x.get("timestamp", ""))


def load_concentration_history() -> list[dict]:
    """Load concentration history if available."""
    history_file = DATA_DIR / "concentration-history.jsonl"
    
    if not history_file.exists():
        return []
    
    history = []
    with open(history_file, "r") as f:
        for line in f:
            try:
                history.append(json.loads(line.strip()))
            except json.JSONDecodeError:
                continue
    
    return sorted(history, key=lambda x: x.get("timestamp", ""))


def calculate_retroactive_concentration(trades: list[dict]) -> dict:
    """
    Calculate what concentration would have been at each trade time.
    Uses sliding window of active positions.
    """
    # Group trades by hour to estimate active positions
    hourly_positions = defaultdict(lambda: defaultdict(int))
    
    for trade in trades:
        ts = trade.get("timestamp", "")
        if not ts:
            continue
        
        # Parse timestamp and round to hour
        try:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            hour_key = dt.strftime("%Y-%m-%d-%H")
        except:
            continue
        
        asset_class, _ = classify_asset(trade.get("ticker", ""))
        contracts = trade.get("contracts", 1)
        cost = trade.get("cost_cents", contracts) / 100  # Dollars
        
        hourly_positions[hour_key][asset_class] += cost
    
    # Calculate concentration for each hour
    hourly_concentration = {}
    for hour, positions in hourly_positions.items():
        total = sum(positions.values())
        if total > 0:
            hourly_concentration[hour] = {
                asset: (value / total) * 100
                for asset, value in positions.items()
            }
            hourly_concentration[hour]["total_exposure"] = total
    
    return hourly_concentration


def get_concentration_at_trade(trade: dict, concentration_history: list, retroactive: dict) -> float:
    """Get concentration level at time of trade."""
    
    # First check if trade has embedded concentration data
    if "concentration_asset_pct" in trade:
        return trade["concentration_asset_pct"]
    
    # Next check concentration history
    trade_ts = trade.get("timestamp", "")
    if trade_ts and concentration_history:
        try:
            trade_dt = datetime.fromisoformat(trade_ts.replace("Z", "+00:00"))
            
            # Find closest concentration snapshot
            best_match = None
            best_diff = timedelta(hours=999)
            
            for snapshot in concentration_history:
                snap_ts = snapshot.get("timestamp", "")
                if not snap_ts:
                    continue
                snap_dt = datetime.fromisoformat(snap_ts.replace("Z", "+00:00"))
                diff = abs(trade_dt - snap_dt)
                
                if diff < best_diff:
                    best_diff = diff
                    best_match = snapshot
            
            if best_match and best_diff < timedelta(hours=1):
                asset_class, _ = classify_asset(trade.get("ticker", ""))
                return best_match.get(f"{asset_class}_pct", 0)
        except:
            pass
    
    # Fall back to retroactive calculation
    if trade_ts and retroactive:
        try:
            trade_dt = datetime.fromisoformat(trade_ts.replace("Z", "+00:00"))
            hour_key = trade_dt.strftime("%Y-%m-%d-%H")
            
            if hour_key in retroactive:
                asset_class, _ = classify_asset(trade.get("ticker", ""))
                return retroactive[hour_key].get(asset_class, 0)
        except:
            pass
    
    # If all else fails, assume 100% concentration (single asset trading)
    return 100.0


def analyze_trades(trades: list[dict], concentration_history: list[dict]) -> dict:
    """Main analysis function."""
    
    if not trades:
        return {
            "status": "no_data",
            "message": "No trades found for analysis",
            "generated_at": datetime.now().isoformat()
        }
    
    # Calculate retroactive concentration
    retroactive = calculate_retroactive_concentration(trades)
    
    # Categorize trades by concentration level
    high_concentration = []  # >40%
    low_concentration = []   # <=40%
    
    for trade in trades:
        concentration = get_concentration_at_trade(trade, concentration_history, retroactive)
        
        trade_data = {
            "ticker": trade.get("ticker"),
            "timestamp": trade.get("timestamp"),
            "side": trade.get("side"),
            "contracts": trade.get("contracts"),
            "cost_cents": trade.get("cost_cents"),
            "won": trade.get("result_status") == "won",
            "concentration": concentration,
            "asset_class": classify_asset(trade.get("ticker", ""))[0]
        }
        
        if concentration > 40:
            high_concentration.append(trade_data)
        else:
            low_concentration.append(trade_data)
    
    # Calculate stats for each group
    def calc_stats(group: list) -> dict:
        if not group:
            return {
                "trades": 0,
                "wins": 0,
                "losses": 0,
                "win_rate": 0,
                "total_cost": 0,
                "avg_concentration": 0
            }
        
        wins = sum(1 for t in group if t["won"])
        losses = len(group) - wins
        total_cost = sum(t.get("cost_cents", 0) for t in group) / 100
        avg_conc = sum(t.get("concentration", 0) for t in group) / len(group)
        
        return {
            "trades": len(group),
            "wins": wins,
            "losses": losses,
            "win_rate": (wins / len(group) * 100) if group else 0,
            "total_cost": round(total_cost, 2),
            "avg_concentration": round(avg_conc, 1)
        }
    
    high_stats = calc_stats(high_concentration)
    low_stats = calc_stats(low_concentration)
    
    # Calculate overall stats
    all_trades = high_concentration + low_concentration
    overall_stats = calc_stats(all_trades)
    
    # Asset class breakdown
    asset_breakdown = defaultdict(lambda: {"wins": 0, "losses": 0, "cost": 0})
    for t in all_trades:
        ac = t["asset_class"]
        asset_breakdown[ac]["wins" if t["won"] else "losses"] += 1
        asset_breakdown[ac]["cost"] += t.get("cost_cents", 0) / 100
    
    # Generate recommendations
    recommendations = []
    
    if high_stats["trades"] > 5 and low_stats["trades"] > 5:
        # Enough data for comparison
        wr_diff = high_stats["win_rate"] - low_stats["win_rate"]
        
        if wr_diff > 10:
            recommendations.append({
                "type": "concentrate_more",
                "reason": f"High concentration trades have {wr_diff:.1f}% better win rate",
                "confidence": "high" if abs(wr_diff) > 20 else "medium"
            })
        elif wr_diff < -10:
            recommendations.append({
                "type": "diversify_more",
                "reason": f"Low concentration trades have {-wr_diff:.1f}% better win rate",
                "confidence": "high" if abs(wr_diff) > 20 else "medium"
            })
        else:
            recommendations.append({
                "type": "neutral",
                "reason": f"Win rate difference ({wr_diff:.1f}%) is within noise range",
                "confidence": "low"
            })
    else:
        recommendations.append({
            "type": "insufficient_data",
            "reason": f"Need more trades in both categories (high: {high_stats['trades']}, low: {low_stats['trades']})",
            "confidence": "none"
        })
    
    # Check for single-asset dominance
    if len(asset_breakdown) == 1:
        dominant_asset = list(asset_breakdown.keys())[0]
        recommendations.append({
            "type": "add_diversification",
            "reason": f"All trades are in {dominant_asset} - consider adding other asset classes",
            "confidence": "high"
        })
    
    # Check overall performance
    if overall_stats["win_rate"] < 30 and overall_stats["trades"] > 10:
        recommendations.append({
            "type": "review_strategy",
            "reason": f"Overall win rate ({overall_stats['win_rate']:.1f}%) is below 30%",
            "confidence": "high"
        })
    
    result = {
        "generated_at": datetime.now().isoformat(),
        "status": "success",
        "summary": {
            "total_trades": len(all_trades),
            "overall_win_rate": round(overall_stats["win_rate"], 1),
            "high_concentration_win_rate": round(high_stats["win_rate"], 1),
            "low_concentration_win_rate": round(low_stats["win_rate"], 1),
            "win_rate_difference": round(high_stats["win_rate"] - low_stats["win_rate"], 1)
        },
        "high_concentration": {
            "threshold": ">40%",
            "description": "Trades when a single asset class was >40% of portfolio",
            **high_stats
        },
        "low_concentration": {
            "threshold": "<=40%",
            "description": "Trades when portfolio was diversified",
            **low_stats
        },
        "asset_breakdown": {
            asset: {
                "trades": stats["wins"] + stats["losses"],
                "win_rate": round(stats["wins"] / (stats["wins"] + stats["losses"]) * 100, 1) if (stats["wins"] + stats["losses"]) > 0 else 0,
                "total_cost": round(stats["cost"], 2)
            }
            for asset, stats in asset_breakdown.items()
        },
        "recommendations": recommendations,
        "data_quality": {
            "has_concentration_history": len(concentration_history) > 0,
            "trades_with_embedded_concentration": sum(1 for t in trades if "concentration_asset_pct" in t),
            "using_retroactive_calculation": len(concentration_history) == 0
        }
    }
    
    return result


def main():
    print("📊 Analyzing concentration vs performance...")
    
    # Load data
    trades = load_trades()
    concentration_history = load_concentration_history()
    
    print(f"   Found {len(trades)} trades")
    print(f"   Found {len(concentration_history)} concentration snapshots")
    
    # Run analysis
    result = analyze_trades(trades, concentration_history)
    
    # Save output
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(result, f, indent=2)
    
    print(f"\n✅ Analysis saved to: {OUTPUT_FILE}")
    
    # Print summary
    if result["status"] == "success":
        s = result["summary"]
        print(f"\n📈 Summary:")
        print(f"   Total trades: {s['total_trades']}")
        print(f"   Overall win rate: {s['overall_win_rate']:.1f}%")
        print(f"   High concentration (>40%) win rate: {s['high_concentration_win_rate']:.1f}%")
        print(f"   Low concentration (≤40%) win rate: {s['low_concentration_win_rate']:.1f}%")
        print(f"   Difference: {s['win_rate_difference']:+.1f}%")
        
        print(f"\n💡 Recommendations:")
        for rec in result["recommendations"]:
            icon = "⚠️" if rec["confidence"] == "high" else "💭"
            print(f"   {icon} [{rec['type']}] {rec['reason']}")
    else:
        print(f"\n⚠️ {result['message']}")
    
    return result


if __name__ == "__main__":
    main()
