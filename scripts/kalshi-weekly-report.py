#!/usr/bin/env python3
"""
Kalshi Weekly Trading Report - PDF Generator
Generates a comprehensive weekly trading report in PDF format.
Runs every Sunday via cron.
"""

import json
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from pathlib import Path

from fpdf import FPDF
from fpdf.enums import XPos, YPos

TRADES_FILE = Path(__file__).parent / "kalshi-trades.jsonl"
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "reports"

def parse_timestamp(ts):
    """Parse ISO timestamp."""
    return datetime.fromisoformat(ts.replace('Z', '+00:00'))

def get_pst_date(dt):
    """Convert datetime to PST date string."""
    pst_offset = timedelta(hours=-8)
    pst_time = dt + pst_offset
    return pst_time.strftime('%Y-%m-%d')

def get_pst_now():
    """Get current datetime in PST."""
    now_utc = datetime.now(timezone.utc)
    pst_offset = timedelta(hours=-8)
    return now_utc + pst_offset

def analyze_week():
    """Analyze last 7 days of trades."""
    now_pst = get_pst_now()
    week_ago = now_pst - timedelta(days=7)
    
    trades = []
    daily_stats = defaultdict(lambda: {'trades': 0, 'won': 0, 'lost': 0, 'pending': 0, 'pnl': 0, 'wagered': 0})
    
    with open(TRADES_FILE) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get('type') != 'trade' or entry.get('order_status') != 'executed':
                    continue
                    
                trade_time = parse_timestamp(entry['timestamp'])
                if trade_time < week_ago.replace(tzinfo=timezone.utc):
                    continue
                    
                trade_date = get_pst_date(trade_time)
                trades.append(entry)
                
                cost = entry.get('cost_cents', 0)
                contracts = entry.get('contracts', 1)
                result = entry.get('result_status', 'pending')
                
                daily_stats[trade_date]['trades'] += 1
                daily_stats[trade_date]['wagered'] += cost
                
                if result == 'won':
                    daily_stats[trade_date]['won'] += 1
                    daily_stats[trade_date]['pnl'] += (contracts * 100) - cost
                    entry['_pnl'] = (contracts * 100) - cost
                elif result == 'lost':
                    daily_stats[trade_date]['lost'] += 1
                    daily_stats[trade_date]['pnl'] -= cost
                    entry['_pnl'] = -cost
                else:
                    daily_stats[trade_date]['pending'] += 1
                    entry['_pnl'] = 0
                    
            except (json.JSONDecodeError, KeyError):
                continue
    
    # Sort trades by PnL for best/worst
    settled_trades = [t for t in trades if t.get('result_status') in ('won', 'lost')]
    settled_trades.sort(key=lambda x: x.get('_pnl', 0), reverse=True)
    
    best_trade = settled_trades[0] if settled_trades else None
    worst_trade = settled_trades[-1] if settled_trades else None
    
    # Calculate totals
    total_trades = len(trades)
    total_won = sum(d['won'] for d in daily_stats.values())
    total_lost = sum(d['lost'] for d in daily_stats.values())
    total_pending = sum(d['pending'] for d in daily_stats.values())
    total_pnl = sum(d['pnl'] for d in daily_stats.values())
    total_wagered = sum(d['wagered'] for d in daily_stats.values())
    
    settled = total_won + total_lost
    win_rate = (total_won / settled * 100) if settled > 0 else 0
    
    return {
        'week_start': (now_pst - timedelta(days=7)).strftime('%Y-%m-%d'),
        'week_end': now_pst.strftime('%Y-%m-%d'),
        'total_trades': total_trades,
        'total_won': total_won,
        'total_lost': total_lost,
        'total_pending': total_pending,
        'total_pnl': total_pnl,
        'total_wagered': total_wagered,
        'win_rate': win_rate,
        'daily_stats': dict(daily_stats),
        'best_trade': best_trade,
        'worst_trade': worst_trade,
    }

def generate_pdf(stats):
    """Generate PDF report."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Title
    pdf.set_font('Helvetica', 'B', 24)
    pdf.cell(0, 15, 'Kalshi Trading Report', align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_font('Helvetica', '', 12)
    pdf.cell(0, 8, f"Week: {stats['week_start']} to {stats['week_end']}", align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(10)
    
    # Summary Box
    pdf.set_fill_color(240, 240, 240)
    pdf.set_font('Helvetica', 'B', 14)
    pdf.cell(0, 10, 'Weekly Summary', new_x=XPos.LMARGIN, new_y=YPos.NEXT, fill=True)
    
    pdf.set_font('Helvetica', '', 11)
    pdf.ln(3)
    
    # Stats grid
    col_width = 95
    pdf.cell(col_width, 7, f"Total Trades: {stats['total_trades']}", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(col_width, 7, f"Total Wagered: ${stats['total_wagered']/100:.2f}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.cell(col_width, 7, f"Trades Won: {stats['total_won']}", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(col_width, 7, f"Trades Lost: {stats['total_lost']}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.cell(col_width, 7, f"Pending: {stats['total_pending']}", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pnl_color = (0, 128, 0) if stats['total_pnl'] >= 0 else (200, 0, 0)
    pdf.cell(col_width, 7, f"Win Rate: {stats['win_rate']:.1f}%", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.ln(3)
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(*pnl_color)
    pdf.cell(0, 10, f"Weekly PnL: ${stats['total_pnl']/100:+.2f}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(5)
    
    # Daily Breakdown
    pdf.set_font('Helvetica', 'B', 14)
    pdf.cell(0, 10, 'Daily Breakdown', new_x=XPos.LMARGIN, new_y=YPos.NEXT, fill=True)
    pdf.ln(3)
    
    # Table header
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_fill_color(220, 220, 220)
    pdf.cell(35, 8, 'Date', border=1, fill=True)
    pdf.cell(25, 8, 'Trades', border=1, align='C', fill=True)
    pdf.cell(25, 8, 'Won', border=1, align='C', fill=True)
    pdf.cell(25, 8, 'Lost', border=1, align='C', fill=True)
    pdf.cell(35, 8, 'Wagered', border=1, align='R', fill=True)
    pdf.cell(35, 8, 'PnL', border=1, align='R', fill=True)
    pdf.ln()
    
    # Table rows
    pdf.set_font('Helvetica', '', 10)
    for date in sorted(stats['daily_stats'].keys(), reverse=True):
        day = stats['daily_stats'][date]
        pdf.cell(35, 7, date, border=1)
        pdf.cell(25, 7, str(day['trades']), border=1, align='C')
        pdf.cell(25, 7, str(day['won']), border=1, align='C')
        pdf.cell(25, 7, str(day['lost']), border=1, align='C')
        pdf.cell(35, 7, f"${day['wagered']/100:.2f}", border=1, align='R')
        
        pnl = day['pnl']
        if pnl >= 0:
            pdf.set_text_color(0, 128, 0)
        else:
            pdf.set_text_color(200, 0, 0)
        pdf.cell(35, 7, f"${pnl/100:+.2f}", border=1, align='R')
        pdf.set_text_color(0, 0, 0)
        pdf.ln()
    
    pdf.ln(8)
    
    # Best/Worst Trades
    pdf.set_font('Helvetica', 'B', 14)
    pdf.cell(0, 10, 'Notable Trades', new_x=XPos.LMARGIN, new_y=YPos.NEXT, fill=True)
    pdf.ln(3)
    
    pdf.set_font('Helvetica', '', 10)
    
    if stats['best_trade']:
        t = stats['best_trade']
        pdf.set_text_color(0, 128, 0)
        pdf.cell(0, 7, f"Best Trade: {t.get('ticker', 'N/A')} @ {t.get('avg_price', 0)}c "
                       f"({t.get('side', 'N/A')}) -> ${t.get('_pnl', 0)/100:+.2f}", 
                 new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    if stats['worst_trade']:
        t = stats['worst_trade']
        pdf.set_text_color(200, 0, 0)
        pdf.cell(0, 7, f"Worst Trade: {t.get('ticker', 'N/A')} @ {t.get('avg_price', 0)}c "
                       f"({t.get('side', 'N/A')}) -> ${t.get('_pnl', 0)/100:+.2f}",
                 new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_text_color(0, 0, 0)
    pdf.ln(10)
    
    # Footer
    pdf.set_font('Helvetica', 'I', 9)
    pdf.set_text_color(128, 128, 128)
    pdf.cell(0, 6, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Autotrader v2 | Black-Scholes Model",
             new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    # Save
    filename = f"kalshi-weekly-{stats['week_end']}.pdf"
    output_path = OUTPUT_DIR / filename
    pdf.output(str(output_path))
    
    print(f"Report saved to: {output_path}")
    return output_path

def main():
    stats = analyze_week()
    
    # Print summary to stdout
    print(f"\n📊 Weekly Report: {stats['week_start']} → {stats['week_end']}")
    print(f"   Trades: {stats['total_trades']} | Won: {stats['total_won']} | Lost: {stats['total_lost']}")
    print(f"   Win Rate: {stats['win_rate']:.1f}% | PnL: ${stats['total_pnl']/100:+.2f}")
    
    # Generate PDF
    pdf_path = generate_pdf(stats)
    
    # Write alert file if there were trades
    if stats['total_trades'] > 0:
        alert_file = Path(__file__).parent / "kalshi-weekly-report.alert"
        with open(alert_file, 'w') as f:
            f.write(f"📊 **Weekly Trading Report Ready**\n\n")
            f.write(f"Week: {stats['week_start']} → {stats['week_end']}\n")
            f.write(f"Trades: {stats['total_trades']}\n")
            f.write(f"Win Rate: {stats['win_rate']:.1f}%\n")
            f.write(f"PnL: ${stats['total_pnl']/100:+.2f}\n\n")
            f.write(f"PDF: {pdf_path}")
        print(f"Alert file written: {alert_file}")
    
    return pdf_path

if __name__ == "__main__":
    main()
