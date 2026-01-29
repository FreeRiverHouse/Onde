#!/usr/bin/env python3
"""
Kalshi Stop-Loss Performance Analysis
Analyzes stop-loss effectiveness: how much was saved vs holding to expiry?

Tracks:
- Total stop-losses triggered
- Average loss at exit vs potential loss if held
- Estimated money saved by stop-loss
"""

import json
from datetime import datetime, timezone
from pathlib import Path

STOP_LOSS_LOG = Path(__file__).parent / "kalshi-stop-loss.log"
TRADES_LOG = Path(__file__).parent / "kalshi-trades.jsonl"

def analyze_stop_losses():
    """Analyze stop-loss performance."""
    
    if not STOP_LOSS_LOG.exists():
        print("📊 No stop-loss events recorded yet.")
        return None
    
    stop_losses = []
    with open(STOP_LOSS_LOG) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get('type') == 'stop_loss':
                    stop_losses.append(entry)
            except json.JSONDecodeError:
                continue
    
    if not stop_losses:
        print("📊 No stop-loss events found in log.")
        return None
    
    # Load settled trades to find final outcomes
    settled = {}
    if TRADES_LOG.exists():
        with open(TRADES_LOG) as f:
            for line in f:
                try:
                    entry = json.loads(line.strip())
                    if entry.get('result_status') in ['won', 'lost']:
                        # Use ticker as key
                        ticker = entry.get('ticker')
                        if ticker:
                            settled[ticker] = entry
                except json.JSONDecodeError:
                    continue
    
    # Analyze each stop-loss
    total_actual_loss = 0
    total_potential_loss = 0
    total_saved = 0
    count = 0
    
    print("🛑 Stop-Loss Performance Analysis")
    print("=" * 50)
    
    for sl in stop_losses:
        ticker = sl.get('ticker', 'unknown')
        entry_price = sl.get('entry_price', 0) or sl.get('entry_price_cents', 0)
        exit_price = sl.get('exit_price', 0) or sl.get('exit_price_cents', 0)
        contracts = sl.get('contracts', 1)
        side = sl.get('side', 'unknown')
        loss_pct = sl.get('loss_pct', 0)
        
        # Actual loss at stop-loss exit
        actual_loss_cents = (entry_price - exit_price) * contracts
        total_actual_loss += actual_loss_cents
        
        # Check if we have settlement data for this ticker
        if ticker in settled:
            result = settled[ticker].get('result_status')
            # For NO bets: won = price went below strike, lost = price above
            # For YES bets: won = price above strike, lost = below
            if result == 'lost':
                # Would have lost 100% - entry_price was lost
                potential_loss_cents = entry_price * contracts
                saved = potential_loss_cents - actual_loss_cents
                print(f"\n📍 {ticker}")
                print(f"   Side: {side.upper()} | Contracts: {contracts}")
                print(f"   Entry: {entry_price:.0f}¢ → Exit: {exit_price:.0f}¢ (stop-loss)")
                print(f"   Settlement: LOST (would have lost {entry_price:.0f}¢/contract)")
                print(f"   Actual loss: ${actual_loss_cents/100:.2f}")
                print(f"   Potential loss: ${potential_loss_cents/100:.2f}")
                print(f"   💰 SAVED: ${saved/100:.2f}")
                total_potential_loss += potential_loss_cents
                total_saved += saved
            else:
                # Would have won!
                # Potential profit = (100 - entry_price) * contracts
                potential_profit = (100 - entry_price) * contracts
                print(f"\n📍 {ticker}")
                print(f"   Side: {side.upper()} | Contracts: {contracts}")
                print(f"   Entry: {entry_price:.0f}¢ → Exit: {exit_price:.0f}¢ (stop-loss)")
                print(f"   Settlement: WON (would have gained ${potential_profit/100:.2f})")
                print(f"   ⚠️ Stop-loss cost us: ${(potential_profit + actual_loss_cents)/100:.2f}")
                # Track as potential "negative savings" (we lost opportunity)
                total_saved -= (potential_profit + actual_loss_cents)
        else:
            # No settlement data yet (still pending or no match)
            print(f"\n📍 {ticker}")
            print(f"   Side: {side.upper()} | Contracts: {contracts}")
            print(f"   Entry: {entry_price:.0f}¢ → Exit: {exit_price:.0f}¢ (stop-loss)")
            print(f"   Settlement: PENDING (no outcome yet)")
            print(f"   Loss at exit: ${actual_loss_cents/100:.2f} ({loss_pct:.1f}%)")
        
        count += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Summary:")
    print(f"   Total stop-losses: {count}")
    print(f"   Total loss at exit: ${total_actual_loss/100:.2f}")
    if total_potential_loss > 0:
        print(f"   Total potential loss: ${total_potential_loss/100:.2f}")
        print(f"   Net savings: ${total_saved/100:.2f}")
        if total_saved > 0:
            print(f"   ✅ Stop-loss strategy SAVED money!")
        else:
            print(f"   ⚠️ Stop-loss strategy cost money (premature exits)")
    else:
        print(f"   (No settled trades with stop-loss history yet)")
    
    return {
        "count": count,
        "total_actual_loss_cents": total_actual_loss,
        "total_potential_loss_cents": total_potential_loss,
        "net_saved_cents": total_saved
    }


if __name__ == "__main__":
    analyze_stop_losses()
