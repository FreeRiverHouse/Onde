#!/usr/bin/env python3
"""
Analyze dry-run trades vs actual settlement outcomes.

Compares kalshi-trades-dryrun.jsonl trades against what actually happened
to validate strategy before going live.

Usage:
    python3 analyze-dryrun-trades.py
    python3 analyze-dryrun-trades.py --days 7  # Last 7 days only
"""

import json
import os
import sys
import argparse
from datetime import datetime, timedelta, timezone
from pathlib import Path
import requests

SCRIPT_DIR = Path(__file__).parent
DRYRUN_FILE = SCRIPT_DIR / "kalshi-trades-dryrun.jsonl"
SETTLEMENT_CACHE = SCRIPT_DIR / "dryrun-settlement-cache.json"


def get_btc_price_at_time(timestamp: datetime) -> float | None:
    """Fetch BTC price at a specific time from CoinGecko."""
    try:
        # CoinGecko market_chart/range API
        start = int(timestamp.timestamp())
        end = start + 300  # 5 minute window
        url = f"https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range"
        params = {"vs_currency": "usd", "from": start, "to": end}
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("prices"):
                return data["prices"][0][1]
    except Exception as e:
        print(f"  ⚠️ CoinGecko error: {e}")
    return None


def get_eth_price_at_time(timestamp: datetime) -> float | None:
    """Fetch ETH price at a specific time from CoinGecko."""
    try:
        start = int(timestamp.timestamp())
        end = start + 300
        url = f"https://api.coingecko.com/api/v3/coins/ethereum/market_chart/range"
        params = {"vs_currency": "usd", "from": start, "to": end}
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("prices"):
                return data["prices"][0][1]
    except Exception as e:
        print(f"  ⚠️ CoinGecko error: {e}")
    return None


def parse_ticker(ticker: str) -> dict | None:
    """
    Parse Kalshi ticker to extract settlement parameters.
    
    Examples:
        KXBTCD-26JAN28-T88500 -> BTC, Jan 28 2026, strike $88,500
        KXETHD-26JAN28-T2950 -> ETH, Jan 28 2026, strike $2,950
    """
    try:
        parts = ticker.split("-")
        if len(parts) != 3:
            return None
        
        asset_code = parts[0]
        date_str = parts[1]
        strike_str = parts[2]
        
        # Determine asset
        if asset_code == "KXBTCD":
            asset = "BTC"
        elif asset_code == "KXETHD":
            asset = "ETH"
        else:
            return None
        
        # Parse date (26JAN28 -> Jan 28, 2026)
        day = int(date_str[0:2])  # Year prefix
        month_str = date_str[2:5]
        day_of_month = int(date_str[5:7])
        
        months = {
            "JAN": 1, "FEB": 2, "MAR": 3, "APR": 4,
            "MAY": 5, "JUN": 6, "JUL": 7, "AUG": 8,
            "SEP": 9, "OCT": 10, "NOV": 11, "DEC": 12
        }
        month = months.get(month_str)
        if not month:
            return None
        
        year = 2000 + day
        
        # Parse strike (T88500 -> 88500.00, could also have decimal like T88499.99)
        strike_val = strike_str[1:]  # Remove 'T'
        if "." in strike_val:
            strike = float(strike_val)
        else:
            strike = float(strike_val)
        
        # Extract hour from ticker if hourly contract
        # Format: KXBTCD-26JAN28-T88500@04 -> hour 04:00 UTC
        hour = None
        if "@" in ticker:
            hour_str = ticker.split("@")[1]
            hour = int(hour_str)
        
        return {
            "asset": asset,
            "year": year,
            "month": month,
            "day": day_of_month,
            "hour": hour,
            "strike": strike
        }
    except Exception as e:
        print(f"  ⚠️ Failed to parse ticker {ticker}: {e}")
        return None


def determine_settlement(trade: dict) -> dict:
    """
    Determine if a dry-run trade would have won or lost.
    
    Returns dict with:
        - outcome: "won" | "lost" | "pending" | "unknown"
        - settlement_price: actual price at expiry
        - profit_cents: theoretical profit/loss
    """
    ticker = trade.get("ticker", "")
    side = trade.get("side", "")
    price_cents = trade.get("price_cents", 0)
    contracts = trade.get("contracts", 0)
    
    parsed = parse_ticker(ticker.split("@")[0] if "@" in ticker else ticker)
    if not parsed:
        return {"outcome": "unknown", "reason": "Could not parse ticker"}
    
    # Construct settlement time
    try:
        if parsed["hour"] is not None:
            # Hourly contract - settles at the hour
            settlement_time = datetime(
                parsed["year"], parsed["month"], parsed["day"],
                parsed["hour"], 0, 0, tzinfo=timezone.utc
            )
        else:
            # Daily contract - settles at 00:00 UTC next day
            settlement_time = datetime(
                parsed["year"], parsed["month"], parsed["day"],
                0, 0, 0, tzinfo=timezone.utc
            ) + timedelta(days=1)
    except Exception as e:
        return {"outcome": "unknown", "reason": f"Invalid date: {e}"}
    
    # Check if settled yet
    now = datetime.now(timezone.utc)
    if settlement_time > now:
        return {"outcome": "pending", "settlement_time": settlement_time.isoformat()}
    
    # Get price at settlement
    if parsed["asset"] == "BTC":
        settlement_price = get_btc_price_at_time(settlement_time)
    else:
        settlement_price = get_eth_price_at_time(settlement_time)
    
    if settlement_price is None:
        return {"outcome": "unknown", "reason": "Could not fetch settlement price"}
    
    # Determine outcome
    strike = parsed["strike"]
    
    # YES wins if price >= strike, NO wins if price < strike
    price_above_strike = settlement_price >= strike
    
    if side == "YES":
        won = price_above_strike
    else:  # NO
        won = not price_above_strike
    
    # Calculate profit
    if won:
        profit_cents = (100 - price_cents) * contracts
    else:
        profit_cents = -price_cents * contracts
    
    return {
        "outcome": "won" if won else "lost",
        "settlement_price": settlement_price,
        "strike": strike,
        "price_above_strike": price_above_strike,
        "profit_cents": profit_cents
    }


def load_dryrun_trades(days: int | None = None) -> list[dict]:
    """Load dry-run trades from JSONL file."""
    if not DRYRUN_FILE.exists():
        return []
    
    trades = []
    cutoff = None
    if days:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    
    with open(DRYRUN_FILE, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                trade = json.loads(line)
                
                # Filter by date if specified
                if cutoff:
                    trade_time = datetime.fromisoformat(trade["timestamp"].replace("Z", "+00:00"))
                    if trade_time < cutoff:
                        continue
                
                trades.append(trade)
            except json.JSONDecodeError:
                continue
    
    return trades


def load_settlement_cache() -> dict:
    """Load cached settlement results."""
    if SETTLEMENT_CACHE.exists():
        try:
            with open(SETTLEMENT_CACHE, "r") as f:
                return json.load(f)
        except:
            pass
    return {}


def save_settlement_cache(cache: dict):
    """Save settlement cache."""
    with open(SETTLEMENT_CACHE, "w") as f:
        json.dump(cache, f, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Analyze dry-run trades vs actual outcomes")
    parser.add_argument("--days", type=int, help="Only analyze trades from last N days")
    args = parser.parse_args()
    
    print("=" * 60)
    print("🧪 DRY-RUN TRADE ANALYSIS")
    print("=" * 60)
    
    trades = load_dryrun_trades(args.days)
    
    if not trades:
        print("\n❌ No dry-run trades found!")
        print(f"   File: {DRYRUN_FILE}")
        print("\n💡 To generate dry-run trades:")
        print("   DRY_RUN=true python3 scripts/kalshi-autotrader-v2.py")
        return
    
    print(f"\n📊 Found {len(trades)} dry-run trade(s)")
    if args.days:
        print(f"   (filtered to last {args.days} days)")
    
    # Load settlement cache
    cache = load_settlement_cache()
    
    # Analyze each trade
    results = {
        "won": 0,
        "lost": 0,
        "pending": 0,
        "unknown": 0,
        "total_profit_cents": 0,
        "trades": []
    }
    
    print("\n📈 Checking settlements...")
    for i, trade in enumerate(trades):
        ticker = trade.get("ticker", "unknown")
        
        # Check cache first
        cache_key = f"{ticker}_{trade.get('timestamp', '')}"
        if cache_key in cache and cache[cache_key].get("outcome") not in ["pending", "unknown"]:
            settlement = cache[cache_key]
        else:
            print(f"   [{i+1}/{len(trades)}] {ticker}...", end=" ", flush=True)
            settlement = determine_settlement(trade)
            cache[cache_key] = settlement
            print(settlement.get("outcome", "?"))
        
        results[settlement.get("outcome", "unknown")] += 1
        
        if settlement.get("outcome") in ["won", "lost"]:
            results["total_profit_cents"] += settlement.get("profit_cents", 0)
        
        results["trades"].append({
            **trade,
            "settlement": settlement
        })
    
    # Save cache
    save_settlement_cache(cache)
    
    # Print summary
    settled = results["won"] + results["lost"]
    
    print("\n" + "=" * 60)
    print("📊 RESULTS SUMMARY")
    print("=" * 60)
    
    print(f"\n   Total trades:  {len(trades)}")
    print(f"   Settled:       {settled}")
    print(f"   Pending:       {results['pending']}")
    print(f"   Unknown:       {results['unknown']}")
    
    if settled > 0:
        win_rate = (results["won"] / settled) * 100
        pnl_dollars = results["total_profit_cents"] / 100
        
        print(f"\n   ✅ Won:         {results['won']} ({win_rate:.1f}%)")
        print(f"   ❌ Lost:        {results['lost']} ({100 - win_rate:.1f}%)")
        print(f"\n   💰 Theoretical PnL: ${pnl_dollars:+.2f}")
        
        # Compare to expectations
        avg_edge = sum(t.get("edge", 0) for t in trades if t.get("edge")) / max(1, len([t for t in trades if t.get("edge")]))
        if avg_edge:
            expected_wr = 50 + (avg_edge * 100)  # Rough approximation
            print(f"\n   📊 Avg calculated edge: {avg_edge*100:.1f}%")
            print(f"   📊 Expected win rate:   ~{expected_wr:.0f}%")
            print(f"   📊 Actual win rate:     {win_rate:.1f}%")
            
            if win_rate >= expected_wr - 10:
                print("\n   ✅ Strategy performing as expected!")
            else:
                print("\n   ⚠️ Strategy underperforming - review model assumptions")
    else:
        print("\n   ℹ️ No settled trades yet - check back later!")
    
    # Show recent trades
    print("\n" + "-" * 60)
    print("📝 RECENT TRADES")
    print("-" * 60)
    
    for trade in results["trades"][-10:]:  # Last 10
        ticker = trade.get("ticker", "?")[:30]
        side = trade.get("side", "?")
        price = trade.get("price_cents", 0)
        outcome = trade.get("settlement", {}).get("outcome", "?")
        profit = trade.get("settlement", {}).get("profit_cents")
        
        icon = {"won": "✅", "lost": "❌", "pending": "⏳", "unknown": "❓"}.get(outcome, "?")
        profit_str = f"${profit/100:+.2f}" if profit is not None else ""
        
        print(f"   {icon} {side:3} @{price:2}¢ {ticker} {profit_str}")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
