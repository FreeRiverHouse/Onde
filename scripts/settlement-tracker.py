#!/usr/bin/env python3
"""
Settlement Tracker for Kalshi Autotrader
Fetches historical BTC prices and determines actual win/loss for settled trades.

Usage:
    python scripts/settlement-tracker.py              # Check and settle pending trades
    python scripts/settlement-tracker.py --stats      # Show win/loss statistics
    python scripts/settlement-tracker.py --verbose    # Detailed output
"""

import json
import sys
import requests
from datetime import datetime, timezone, timedelta
from pathlib import Path
import re
from typing import Optional, Dict, List, Tuple

# ============== CONFIG ==============
TRADE_LOG_FILE = Path(__file__).parent / "kalshi-trades.jsonl"
SETTLEMENT_FILE = Path(__file__).parent / "kalshi-settlements.json"
COINGECKO_API = "https://api.coingecko.com/api/v3"

# Cache for BTC prices to avoid repeated API calls
price_cache: Dict[str, float] = {}


def parse_ticker_expiry(ticker: str) -> Optional[datetime]:
    """
    Parse expiry time from ticker like KXBTCD-26JAN2804-T88499.99
    
    Format: KXBTCD-YYMMMDD HH-T{strike}
    - 26 = year 2026
    - JAN = January
    - 28 = day 28
    - 04 = 04:00 UTC
    
    So KXBTCD-26JAN2804 = Jan 28, 2026, 04:00 UTC
    """
    # Match pattern like KXBTCD-26JAN2804 or KXBTC-26JAN2804
    match = re.search(r'KXBTC[DE]?-(\d{2})([A-Z]{3})(\d{2})(\d{2})', ticker)
    if not match:
        return None
    
    year_short = int(match.group(1))  # 26 = 2026
    month_str = match.group(2)         # JAN
    day = int(match.group(3))          # 28
    hour = int(match.group(4))         # 04
    
    # Convert month
    months = {
        'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4,
        'MAY': 5, 'JUN': 6, 'JUL': 7, 'AUG': 8,
        'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
    }
    month = months.get(month_str, 1)
    
    # Assume 2020s
    year = 2000 + year_short
    
    try:
        return datetime(year, month, day, hour, 0, 0, tzinfo=timezone.utc)
    except ValueError:
        return None


def get_btc_price_at_time(dt: datetime) -> Optional[float]:
    """
    Get BTC price at a specific time using multiple API sources.
    Tries in order: Coinbase, CryptoCompare, CoinGecko
    """
    cache_key = dt.strftime("%Y-%m-%d-%H")
    if cache_key in price_cache:
        return price_cache[cache_key]
    
    import time as time_module
    
    # Try Coinbase first (no auth needed for historical)
    try:
        # Coinbase candles: granularity 3600 = 1 hour
        start_iso = dt.strftime("%Y-%m-%dT%H:00:00Z")
        end_iso = (dt + timedelta(hours=1)).strftime("%Y-%m-%dT%H:00:00Z")
        
        url = f"https://api.exchange.coinbase.com/products/BTC-USD/candles"
        params = {
            "start": start_iso,
            "end": end_iso,
            "granularity": 3600
        }
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        if data and len(data) > 0:
            # Coinbase format: [time, low, high, open, close, volume]
            close_price = float(data[0][4])
            price_cache[cache_key] = close_price
            return close_price
            
    except Exception as e:
        pass  # Try next API
    
    # Try CryptoCompare
    try:
        ts = int(dt.timestamp())
        url = "https://min-api.cryptocompare.com/data/v2/histohour"
        params = {
            "fsym": "BTC",
            "tsym": "USD",
            "limit": 1,
            "toTs": ts + 3600  # End of the hour
        }
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get("Data", {}).get("Data"):
            candles = data["Data"]["Data"]
            if candles:
                # Find candle closest to our target time
                for candle in candles:
                    if candle["time"] <= ts < candle["time"] + 3600:
                        close_price = float(candle["close"])
                        price_cache[cache_key] = close_price
                        return close_price
                # Fallback to last candle
                close_price = float(candles[-1]["close"])
                price_cache[cache_key] = close_price
                return close_price
                
    except Exception as e:
        pass  # Try next API
    
    # Fallback to CoinGecko (has strict rate limits)
    start_ts = int((dt - timedelta(hours=1)).timestamp())
    end_ts = int((dt + timedelta(hours=1)).timestamp())
    
    try:
        url = f"{COINGECKO_API}/coins/bitcoin/market_chart/range"
        params = {
            "vs_currency": "usd",
            "from": start_ts,
            "to": end_ts
        }
        resp = requests.get(url, params=params, timeout=10)
        
        if resp.status_code == 429:
            print("⚠️ Rate limited by CoinGecko, waiting 30s...")
            time_module.sleep(30)
            resp = requests.get(url, params=params, timeout=10)
        
        if resp.status_code != 200:
            return None
            
        data = resp.json()
        
        if not data.get("prices"):
            return None
        
        # Find the closest price to target time
        target_ts = dt.timestamp() * 1000  # CoinGecko uses milliseconds
        closest_price = None
        min_diff = float('inf')
        
        for ts, price in data["prices"]:
            diff = abs(ts - target_ts)
            if diff < min_diff:
                min_diff = diff
                closest_price = price
        
        if closest_price:
            price_cache[cache_key] = closest_price
        
        return closest_price
        
    except Exception as e:
        print(f"⚠️ All price APIs failed: {e}")
        return None


def determine_outcome(trade: dict, settlement_price: float) -> Tuple[str, int]:
    """
    Determine if trade won or lost and calculate profit/loss in cents.
    
    For binary options:
    - YES wins if price >= strike at expiry
    - NO wins if price < strike at expiry
    
    Returns: (outcome, profit_cents)
    - outcome: "win" or "loss"
    - profit_cents: positive for wins, negative for losses
    """
    strike = trade.get("strike", 0)
    side = trade.get("side", "no")
    contracts = trade.get("contracts", 0)
    price_cents = trade.get("price_cents", 0)
    
    # Did YES or NO win?
    yes_won = settlement_price >= strike
    
    # Did we win?
    if side == "yes":
        we_won = yes_won
    else:  # side == "no"
        we_won = not yes_won
    
    if we_won:
        # Win: we get 100 cents per contract, minus what we paid
        profit = (100 - price_cents) * contracts
        return ("win", profit)
    else:
        # Loss: we lose what we paid
        loss = price_cents * contracts
        return ("loss", -loss)


def load_settlements() -> dict:
    """Load existing settlements from file"""
    if SETTLEMENT_FILE.exists():
        try:
            return json.loads(SETTLEMENT_FILE.read_text())
        except:
            return {}
    return {}


def save_settlements(settlements: dict):
    """Save settlements to file"""
    SETTLEMENT_FILE.write_text(json.dumps(settlements, indent=2))


def load_trades() -> List[dict]:
    """Load all trades from the JSONL file"""
    trades = []
    if not TRADE_LOG_FILE.exists():
        return trades
    
    with open(TRADE_LOG_FILE) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get("type") == "trade":
                    trades.append(entry)
            except:
                continue
    
    return trades


def settle_trades(verbose: bool = False) -> dict:
    """
    Process pending trades and settle them.
    Returns statistics.
    """
    trades = load_trades()
    settlements = load_settlements()
    
    stats = {
        "total_trades": len(trades),
        "already_settled": 0,
        "newly_settled": 0,
        "pending": 0,
        "wins": 0,
        "losses": 0,
        "total_profit_cents": 0,
        "total_cost_cents": 0
    }
    
    now = datetime.now(timezone.utc)
    print(f"📊 Processing {len(trades)} trades...")
    
    for trade in trades:
        ticker = trade.get("ticker", "")
        timestamp = trade.get("timestamp", "")
        
        # Create unique key for this trade
        trade_key = f"{ticker}_{timestamp}"
        
        # Already settled?
        if trade_key in settlements:
            stats["already_settled"] += 1
            settlement = settlements[trade_key]
            if settlement["outcome"] == "win":
                stats["wins"] += 1
            else:
                stats["losses"] += 1
            stats["total_profit_cents"] += settlement["profit_cents"]
            stats["total_cost_cents"] += trade.get("cost_cents", 0)
            continue
        
        # Parse expiry time
        expiry = parse_ticker_expiry(ticker)
        if not expiry:
            if verbose:
                print(f"⚠️ Could not parse expiry from: {ticker}")
            continue
        
        # Is it expired yet?
        if expiry > now:
            stats["pending"] += 1
            if verbose:
                time_left = expiry - now
                print(f"⏳ Pending: {ticker} expires in {time_left}")
            continue
        
        # Get settlement price
        settlement_price = get_btc_price_at_time(expiry)
        if not settlement_price:
            if verbose:
                print(f"⚠️ Could not get price for {ticker} at {expiry}")
            stats["pending"] += 1
            continue
        
        # Determine outcome
        outcome, profit_cents = determine_outcome(trade, settlement_price)
        
        # Save settlement
        settlements[trade_key] = {
            "ticker": ticker,
            "trade_timestamp": timestamp,
            "expiry": expiry.isoformat(),
            "settlement_price": settlement_price,
            "strike": trade.get("strike"),
            "side": trade.get("side"),
            "contracts": trade.get("contracts"),
            "price_cents": trade.get("price_cents"),
            "outcome": outcome,
            "profit_cents": profit_cents,
            "settled_at": now.isoformat()
        }
        
        stats["newly_settled"] += 1
        stats["total_cost_cents"] += trade.get("cost_cents", 0)
        stats["total_profit_cents"] += profit_cents
        
        if outcome == "win":
            stats["wins"] += 1
            if verbose:
                print(f"✅ WIN: {ticker} | BTC=${settlement_price:.2f} | +{profit_cents}¢")
        else:
            stats["losses"] += 1
            if verbose:
                print(f"❌ LOSS: {ticker} | BTC=${settlement_price:.2f} | {profit_cents}¢")
    
    # Save updated settlements
    save_settlements(settlements)
    
    return stats


def print_stats(stats: dict):
    """Pretty print statistics"""
    total_settled = stats["wins"] + stats["losses"]
    win_rate = (stats["wins"] / total_settled * 100) if total_settled > 0 else 0
    
    print("\n" + "="*50)
    print("📊 SETTLEMENT STATISTICS")
    print("="*50)
    print(f"Total trades:      {stats['total_trades']}")
    print(f"Already settled:   {stats['already_settled']}")
    print(f"Newly settled:     {stats['newly_settled']}")
    print(f"Still pending:     {stats['pending']}")
    print("-"*50)
    print(f"✅ Wins:           {stats['wins']}")
    print(f"❌ Losses:         {stats['losses']}")
    print(f"📈 Win Rate:       {win_rate:.1f}%")
    print("-"*50)
    print(f"💰 Total Cost:     ${stats['total_cost_cents']/100:.2f}")
    print(f"💵 Net Profit:     ${stats['total_profit_cents']/100:.2f}")
    
    roi = (stats['total_profit_cents'] / stats['total_cost_cents'] * 100) if stats['total_cost_cents'] > 0 else 0
    print(f"📊 ROI:            {roi:.1f}%")
    print("="*50)


def main():
    verbose = "--verbose" in sys.argv or "-v" in sys.argv
    stats_only = "--stats" in sys.argv or "-s" in sys.argv
    
    print("🔄 Settlement Tracker for Kalshi Autotrader")
    print(f"📁 Trade log: {TRADE_LOG_FILE}")
    print(f"📁 Settlements: {SETTLEMENT_FILE}")
    
    stats = settle_trades(verbose=verbose)
    print_stats(stats)


if __name__ == "__main__":
    main()
