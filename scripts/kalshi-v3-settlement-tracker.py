#!/usr/bin/env python3
"""
Kalshi V3 Settlement Tracker

Tracks settlement of paper trades logged by kalshi-autotrader-v3.py.
For each unique ticker with a BUY action, queries the Kalshi API to check
if the market has settled and determines win/loss.

Calculates: win rate, PnL (paper), ROI, Sharpe ratio.

Usage:
    python3 scripts/kalshi-v3-settlement-tracker.py           # Full run
    python3 scripts/kalshi-v3-settlement-tracker.py --stats    # Show saved stats only
    python3 scripts/kalshi-v3-settlement-tracker.py --force    # Re-check all (ignore cache)

Author: Clawd
Date: 2026-07-14
"""

import json
import sys
import time
import math
import base64
import argparse
from datetime import datetime, timezone
from pathlib import Path
from collections import defaultdict

import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

# ============== PATHS ==============

PROJECT_ROOT = Path(__file__).parent.parent
TRADES_FILE = PROJECT_ROOT / "data" / "trading" / "kalshi-v3-trades.jsonl"
RESULTS_FILE = PROJECT_ROOT / "data" / "trading" / "kalshi-v3-settlement-results.jsonl"

# ============== KALSHI API AUTH ==============
# Reused from kalshi-autotrader-v3.py

API_KEY_ID = "4308d1ca-585e-4b73-be82-5c0968b9a59a"
PRIVATE_KEY = """-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEArvbCjuzAtVbmxZjlm5jglJTy6ZI8kOEGIktgl1KEgzgGr5mF
PE42QKSPdV2NQrvp14fIn2Y+sQ5Us2xrpJ348LiwB5QxfIG63cjblRZ7xvXH6svY
vVke4NShnB8l3uSdJrIvzbnlNEy86+vPaw+GjsODlKhQwm5v4rVEizG1yHxlC20e
SSPG7xyHxuNgDKLCCqERlwiDAhhM75KpPYlJ5OtFkSxNKbGn3PEv7veUbHB485y3
yAc/v6CxCYzbRmwIl9xXQp2F9unYkEJO3UEaxFvTO+G6RL10Q9whbWKrQpKCW0GI
XDRIima44BkT9MOAy5c1q2zXypwddsfUo4O32wIDAQABAoIBADlOFvEq9/8s5E7J
wkJRMxVXJ6x6uh2VpiWrXIqTe1VjD0WKWcojr79CZr5BEthNpcxy67HRkiz5jaJq
m2MCXpuxUe5Zik/GSccEV28gOxAyRfVQKL/zpZpr6jaxOP0lEZev+to9zaVwkNwQ
kxH0ttShksIo0rKr6zdsuXOBp5FvKaO/Cb9YFBjsSc0dzsWWtRBonh9EMrUKoP97
cjbN04vvBv9Xz8f+VmdyLJdLv3BrpdjAtI0oeAvDJjd6ruR1+OR06omSlW6XBPQy
1Ugzr6BZQ/9txGoblyHcpNGLyf+iS4n3IqPFhLkERBylsl2XWF77Ucy386exlYtZ
JIjYS+ECgYEA5krxSpQ4j9e54Sj/d1aID7jeLNy4BfjVcYEfvXSHFap6SsY42aZC
zwjL6tQ8aCAGgrjdkiq8GDdsPf8AG0w99o/jlUbDtaxy5fUgViguqu4P31lXKLc8
IUed89Qlt0sk9cQXxPBANVjFTSfIhGNNZ6si25zNECpxIQky7Vq7SksCgYEAwn6w
jDQUf8VQtHVeelb8T+/rxVO1NQWSZ90GbiZL3oEWIA7vBmnBCffPfrD82tbXrnOh
BGm5PphNnUPbeLovPzcSQaZllDcvq0iXuhrymG8iewCunKttrbQ42dA8QTh7nsl8
Bj8SkJr9CayU1tlMJDz/f+YsO4G3jDOWXCCXzrECgYB5m1NlTXW8x27ZbhvQubnp
i3aO/BKU3LxhTo0jLxhyIW6oc5nrnLckuoFrxJ0NYvPtLY+bMsPWidW3uyMkRxNl
UsAbwJ1yHtkhg1qLBHb4PfPVvkifMHspG7dV3U35R04CFYVzsmZFhVXSk1J4TjO+
rYkfrOJAShkpF8FzwviplwKBgQCTzo3C7u1JMJ2llrCnDqYO5cjqnDPQyJw7vHff
i9EKllVHJbI20HW4apBQupZehPlCBXOvk90ImdwaEPCgbfXr96EzLQ5zNgFPDQrp
jwMgHw04JwuL2qeuY5D0ztCLzC3+PSa45IPqSy7ThElUgazguU5+V2D0FB92N9oj
x0028QKBgElTmOkG9w7V8MUhBQdI79TERvrls9r0kDeqzC3LqRHkJFuYueFP2C6p
+OjRdeYnhHLtOH3+UkpCxUB4G0l5YVJtBcJUtNFSJMBKfaxqrd7awX2TZImfvgkb
YJZnQlMSeGK5ezv10pi0K5q7luyW8TNfknr5uafM5vq2c/LLcAJn
-----END RSA PRIVATE KEY-----"""

BASE_URL = "https://api.elections.kalshi.com"


def sign_request(method: str, path: str, timestamp: str) -> str:
    """Sign request with RSA-PSS for Kalshi API."""
    private_key = serialization.load_pem_private_key(PRIVATE_KEY.encode(), password=None)
    message = f"{timestamp}{method}{path}".encode('utf-8')
    signature = private_key.sign(
        message,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode('utf-8')


def kalshi_api(method: str, path: str, max_retries: int = 3) -> dict:
    """Make authenticated Kalshi API request."""
    url = f"{BASE_URL}{path}"

    for attempt in range(max_retries):
        timestamp = str(int(datetime.now(timezone.utc).timestamp() * 1000))
        signature = sign_request(method, path.split('?')[0], timestamp)
        headers = {
            "KALSHI-ACCESS-KEY": API_KEY_ID,
            "KALSHI-ACCESS-SIGNATURE": signature,
            "KALSHI-ACCESS-TIMESTAMP": timestamp,
            "Content-Type": "application/json"
        }

        try:
            if method == "GET":
                resp = requests.get(url, headers=headers, timeout=15)
            else:
                return {"error": f"Unsupported method {method}"}

            if resp.status_code == 429:
                # Rate limited
                wait = 2 ** (attempt + 1)
                print(f"    ⏳ Rate limited, waiting {wait}s...")
                time.sleep(wait)
                continue

            if resp.status_code >= 500:
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                return {"error": f"Server error {resp.status_code}"}

            if resp.status_code == 404:
                return {"error": "not_found", "status_code": 404}

            return resp.json()

        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
                continue
            return {"error": "Timeout"}
        except requests.exceptions.ConnectionError:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
                continue
            return {"error": "Connection error"}
        except Exception as e:
            return {"error": str(e)}

    return {"error": "Max retries exceeded"}


# ============== TRADE LOADING ==============

def load_trades() -> list:
    """Load all BUY trades from the v3 trades JSONL file."""
    if not TRADES_FILE.exists():
        print(f"❌ Trades file not found: {TRADES_FILE}")
        return []

    trades = []
    with open(TRADES_FILE) as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                action = entry.get("action", "")
                if action.startswith("BUY_"):
                    trades.append(entry)
            except json.JSONDecodeError:
                print(f"  Warning: bad JSON on line {line_num}")
                continue

    return trades


def deduplicate_trades(trades: list) -> dict:
    """
    Group trades by ticker.  For each ticker keep list of individual trade entries.
    Some tickers appear multiple times if the autotrader ran multiple cycles.
    We treat each BUY as a separate contract position.
    """
    by_ticker = defaultdict(list)
    for t in trades:
        ticker = t.get("ticker", "")
        if ticker:
            by_ticker[ticker].append(t)
    return dict(by_ticker)


# ============== SETTLEMENT CHECKING ==============

def get_market_info(ticker: str) -> dict:
    """
    Fetch market info from Kalshi API.
    Returns the market dict or error dict.
    """
    result = kalshi_api("GET", f"/trade-api/v2/markets/{ticker}")
    if "error" in result:
        return result
    return result.get("market", result)


def determine_settlement(trade: dict, market: dict) -> dict:
    """
    Determine win/loss for a single trade given market settlement info.

    Kalshi market response has:
      - status: "open", "closed", "settled"
      - result: "yes", "no", "" (empty if not settled)
      - settlement_value: sometimes present

    Our trade has:
      - action: "BUY_YES" or "BUY_NO"
      - order_result.side: "yes" or "no"
      - price_cents or order_result.price: price paid in cents
      - contracts or order_result.count: number of contracts
    """
    market_status = market.get("status", "")
    market_result = market.get("result", "")

    if market_status not in ("settled", "finalized") and not market_result:
        return {"settled": False, "status": market_status}

    # Our side
    order = trade.get("order_result", {})
    side = order.get("side", "")
    if not side:
        # Fallback: derive from action
        action = trade.get("action", "")
        side = "yes" if action == "BUY_YES" else "no" if action == "BUY_NO" else ""

    price_cents = order.get("price", 0) or trade.get("price_cents", 0)
    contracts = order.get("count", 0) or trade.get("contracts", 0)
    cost_cents = price_cents * contracts

    # Win if our side matches the market result
    won = (side == market_result)

    if won:
        # Each contract pays out 100 cents
        payout_cents = contracts * 100
        pnl_cents = payout_cents - cost_cents
    else:
        payout_cents = 0
        pnl_cents = -cost_cents

    return {
        "settled": True,
        "status": market_status,
        "market_result": market_result,
        "side": side,
        "price_cents": price_cents,
        "contracts": contracts,
        "cost_cents": cost_cents,
        "payout_cents": payout_cents,
        "pnl_cents": pnl_cents,
        "won": won,
    }


# ============== RESULTS / CACHE ==============

def load_cached_results() -> dict:
    """Load previously saved settlement results keyed by ticker."""
    cache = {}
    if RESULTS_FILE.exists():
        with open(RESULTS_FILE) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    ticker = entry.get("ticker", "")
                    if ticker:
                        cache[ticker] = entry
                except json.JSONDecodeError:
                    continue
    return cache


def save_results(results: list):
    """Save all settlement results as JSONL."""
    RESULTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(RESULTS_FILE, 'w') as f:
        for r in results:
            f.write(json.dumps(r, default=str) + '\n')


# ============== METRICS ==============

def compute_metrics(settled_results: list) -> dict:
    """
    Compute performance metrics from settled results.

    Each result has: won, pnl_cents, cost_cents, price_cents, side, contracts
    """
    if not settled_results:
        return {
            "total_trades": 0,
            "settled": 0,
            "wins": 0,
            "losses": 0,
            "win_rate": 0.0,
            "total_pnl_cents": 0,
            "total_cost_cents": 0,
            "roi_pct": 0.0,
            "avg_pnl_per_trade": 0.0,
            "sharpe_ratio": 0.0,
        }

    wins = sum(1 for r in settled_results if r.get("won"))
    losses = len(settled_results) - wins
    total = len(settled_results)

    total_pnl = sum(r.get("pnl_cents", 0) for r in settled_results)
    total_cost = sum(r.get("cost_cents", 0) for r in settled_results)

    win_rate = wins / total if total else 0.0
    roi = (total_pnl / total_cost * 100) if total_cost else 0.0
    avg_pnl = total_pnl / total if total else 0.0

    # Sharpe ratio: mean(returns) / std(returns)
    # Per-trade return = pnl / cost
    returns = []
    for r in settled_results:
        cost = r.get("cost_cents", 0)
        if cost > 0:
            returns.append(r.get("pnl_cents", 0) / cost)

    if len(returns) >= 2:
        mean_ret = sum(returns) / len(returns)
        variance = sum((x - mean_ret) ** 2 for x in returns) / (len(returns) - 1)
        std_ret = math.sqrt(variance) if variance > 0 else 0.0001
        sharpe = mean_ret / std_ret if std_ret > 0 else 0.0
    else:
        sharpe = 0.0

    # Breakdown by side
    yes_results = [r for r in settled_results if r.get("side") == "yes"]
    no_results = [r for r in settled_results if r.get("side") == "no"]

    yes_wins = sum(1 for r in yes_results if r.get("won"))
    no_wins = sum(1 for r in no_results if r.get("won"))

    # Breakdown by edge bucket
    edge_buckets = defaultdict(lambda: {"count": 0, "wins": 0, "pnl": 0})
    for r in settled_results:
        edge = r.get("edge", 0)
        if edge < 0.03:
            bucket = "<3%"
        elif edge < 0.05:
            bucket = "3-5%"
        elif edge < 0.10:
            bucket = "5-10%"
        else:
            bucket = ">10%"
        edge_buckets[bucket]["count"] += 1
        if r.get("won"):
            edge_buckets[bucket]["wins"] += 1
        edge_buckets[bucket]["pnl"] += r.get("pnl_cents", 0)

    return {
        "total_trades": total,
        "wins": wins,
        "losses": losses,
        "win_rate": win_rate,
        "total_pnl_cents": total_pnl,
        "total_pnl_dollars": total_pnl / 100,
        "total_cost_cents": total_cost,
        "total_cost_dollars": total_cost / 100,
        "roi_pct": roi,
        "avg_pnl_per_trade_cents": avg_pnl,
        "sharpe_ratio": sharpe,
        "yes_trades": len(yes_results),
        "yes_wins": yes_wins,
        "yes_win_rate": yes_wins / len(yes_results) if yes_results else 0,
        "no_trades": len(no_results),
        "no_wins": no_wins,
        "no_win_rate": no_wins / len(no_results) if no_results else 0,
        "edge_buckets": dict(edge_buckets),
    }


def print_report(metrics: dict, pending_count: int, error_count: int):
    """Print a human-readable settlement report."""
    print("\n" + "=" * 60)
    print("  KALSHI V3 PAPER TRADING - SETTLEMENT REPORT")
    print("=" * 60)

    print(f"\n📊 Overview")
    print(f"  Settled trades:    {metrics['total_trades']}")
    print(f"  Pending:           {pending_count}")
    print(f"  API errors:        {error_count}")

    if metrics["total_trades"] == 0:
        print("\n  No settled trades yet. Markets may still be open.")
        print("=" * 60)
        return

    print(f"\n🏆 Performance")
    print(f"  Wins:              {metrics['wins']}")
    print(f"  Losses:            {metrics['losses']}")
    print(f"  Win Rate:          {metrics['win_rate']:.1%}")

    print(f"\n💰 PnL (Paper)")
    print(f"  Total Cost:        ${metrics['total_cost_dollars']:,.2f}")
    print(f"  Total PnL:         ${metrics['total_pnl_dollars']:+,.2f}")
    print(f"  ROI:               {metrics['roi_pct']:+.1f}%")
    print(f"  Avg PnL/Trade:     {metrics['avg_pnl_per_trade_cents']:+.1f}¢")

    print(f"\n📈 Risk-Adjusted")
    print(f"  Sharpe Ratio:      {metrics['sharpe_ratio']:.3f}")

    print(f"\n📋 By Side")
    print(f"  YES trades:        {metrics['yes_trades']} (win rate: {metrics['yes_win_rate']:.1%})")
    print(f"  NO  trades:        {metrics['no_trades']} (win rate: {metrics['no_win_rate']:.1%})")

    if metrics.get("edge_buckets"):
        print(f"\n📐 By Edge Bucket")
        for bucket in ["<3%", "3-5%", "5-10%", ">10%"]:
            data = metrics["edge_buckets"].get(bucket)
            if data and data["count"] > 0:
                wr = data["wins"] / data["count"]
                print(f"  {bucket:>5}: {data['count']:3d} trades, "
                      f"win rate {wr:.1%}, PnL ${data['pnl']/100:+.2f}")

    print("\n" + "=" * 60)


# ============== MAIN ==============

def run(force: bool = False, stats_only: bool = False):
    """Main settlement tracking run."""
    # Load trades
    trades = load_trades()
    if not trades:
        print("No BUY trades found in the trade log.")
        return

    ticker_groups = deduplicate_trades(trades)
    total_unique = len(ticker_groups)
    total_trades = sum(len(v) for v in ticker_groups.values())

    print(f"📂 Loaded {total_trades} BUY trades across {total_unique} unique tickers")

    # Load cache
    cached = load_cached_results()
    if stats_only:
        # Just report from cached results
        settled = [r for r in cached.values() if r.get("settled")]
        pending = total_unique - len(settled)
        metrics = compute_metrics(settled)
        print_report(metrics, pending, 0)
        return

    # Process each ticker
    all_results = []
    settled_results = []
    pending_count = 0
    error_count = 0
    api_calls = 0

    for i, (ticker, trade_list) in enumerate(sorted(ticker_groups.items())):
        # Check cache first (unless force)
        if not force and ticker in cached and cached[ticker].get("settled"):
            result_entry = cached[ticker]
            all_results.append(result_entry)
            settled_results.append(result_entry)
            continue

        # Rate limit: sleep between API calls
        if api_calls > 0:
            time.sleep(0.3)  # 300ms between calls

        # Fetch market info
        market = get_market_info(ticker)
        api_calls += 1

        if "error" in market:
            err = market["error"]
            if err == "not_found":
                # Market might have been delisted
                print(f"  [{i+1}/{total_unique}] {ticker[:50]}... → ⚠️ not found (delisted?)")
            else:
                print(f"  [{i+1}/{total_unique}] {ticker[:50]}... → ❌ API error: {err}")
            error_count += 1

            # Save as error entry
            for trade in trade_list:
                entry = {
                    "ticker": ticker,
                    "settled": False,
                    "error": err,
                    "timestamp": trade.get("timestamp"),
                    "title": trade.get("title", ""),
                    "action": trade.get("action"),
                    "edge": trade.get("edge", 0),
                }
                all_results.append(entry)
            continue

        # Check settlement for each trade on this ticker
        market_status = market.get("status", "unknown")
        market_result = market.get("result", "")

        if market_status not in ("settled", "finalized") and not market_result:
            # Not settled yet
            pending_count += 1
            if (i + 1) <= 10 or (i + 1) % 20 == 0:
                print(f"  [{i+1}/{total_unique}] {ticker[:50]}... → ⏳ {market_status}")

            for trade in trade_list:
                entry = {
                    "ticker": ticker,
                    "settled": False,
                    "market_status": market_status,
                    "timestamp": trade.get("timestamp"),
                    "title": trade.get("title", ""),
                    "action": trade.get("action"),
                    "edge": trade.get("edge", 0),
                }
                all_results.append(entry)
            continue

        # Market is settled - process each trade
        for trade in trade_list:
            outcome = determine_settlement(trade, market)

            entry = {
                "ticker": ticker,
                "settled": True,
                "market_status": market_status,
                "market_result": market_result,
                "timestamp": trade.get("timestamp"),
                "title": trade.get("title", ""),
                "expiry": trade.get("expiry", ""),
                "action": trade.get("action"),
                "side": outcome.get("side"),
                "price_cents": outcome.get("price_cents"),
                "contracts": outcome.get("contracts"),
                "cost_cents": outcome.get("cost_cents"),
                "payout_cents": outcome.get("payout_cents"),
                "pnl_cents": outcome.get("pnl_cents"),
                "won": outcome.get("won"),
                "edge": trade.get("edge", 0),
                "forecast_prob": trade.get("forecast_prob"),
                "market_price_yes": trade.get("market_price_yes"),
                "forecast_confidence": trade.get("forecast_confidence"),
            }
            all_results.append(entry)
            settled_results.append(entry)

        status_icon = "✅" if all(
            determine_settlement(t, market).get("won") for t in trade_list
        ) else "❌" if not any(
            determine_settlement(t, market).get("won") for t in trade_list
        ) else "🔀"

        if (i + 1) <= 20 or (i + 1) % 10 == 0:
            print(f"  [{i+1}/{total_unique}] {ticker[:50]}... → {status_icon} "
                  f"result={market_result}, {len(trade_list)} trade(s)")

    # Save results
    save_results(all_results)
    print(f"\n💾 Saved {len(all_results)} results to {RESULTS_FILE}")

    # Compute and display metrics
    metrics = compute_metrics(settled_results)
    print_report(metrics, pending_count, error_count)


def main():
    parser = argparse.ArgumentParser(description="Kalshi V3 Paper Trade Settlement Tracker")
    parser.add_argument("--stats", action="store_true", help="Show stats from cached results only")
    parser.add_argument("--force", action="store_true", help="Re-check all tickers (ignore cache)")
    args = parser.parse_args()

    run(force=args.force, stats_only=args.stats)


if __name__ == "__main__":
    # Unbuffered output
    import functools
    print = functools.partial(print, flush=True)
    main()
