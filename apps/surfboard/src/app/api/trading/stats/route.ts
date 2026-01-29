import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface Trade {
  timestamp: string;
  type: string;
  ticker: string;
  side: string;
  contracts?: number;
  price_cents?: number;
  cost_cents?: number;
  edge?: number;
  our_prob?: number;
  market_prob?: number;
  strike?: number;
  current_price?: number;
  order_status?: string;
  result_status?: string;
  minutes_to_expiry?: number;
  latency_ms?: number;  // order placement to fill time
}

interface TradingStats {
  totalTrades: number;
  wonTrades: number;
  lostTrades: number;
  pendingTrades: number;
  winRate: number;
  totalPnlCents: number;
  grossProfitCents: number;
  grossLossCents: number;
  profitFactor: number;  // gross profit / gross loss - key metric for strategy health
  sharpeRatio: number;   // risk-adjusted return: (avg return) / std dev of returns
  maxDrawdownCents: number;  // largest peak-to-trough decline in cents
  maxDrawdownPercent: number;  // max drawdown as % of peak equity
  calmarRatio: number;   // annualized return / max drawdown % - risk-adjusted performance
  sortinoRatio: number;  // return / downside deviation - only penalizes negative returns
  avgTradeDurationHours: number;  // average time from entry to settlement
  avgReturnCents: number;  // average profit/loss per settled trade
  longestWinStreak: number;  // longest consecutive wins
  longestLossStreak: number;  // longest consecutive losses
  currentStreak: number;  // current streak (positive for wins, negative for losses)
  currentStreakType: 'win' | 'loss' | 'none';  // type of current streak
  // Latency stats (order placement to fill)
  avgLatencyMs: number | null;   // average order latency in milliseconds
  p95LatencyMs: number | null;   // 95th percentile latency
  minLatencyMs: number | null;   // fastest order
  maxLatencyMs: number | null;   // slowest order
  latencyTradeCount: number;     // number of trades with latency data
  todayTrades: number;
  todayWinRate: number;
  todayPnlCents: number;
  recentTrades: Trade[];
  lastUpdated: string;
}

export async function GET() {
  try {
    const tradesPath = path.join(process.cwd(), '../../scripts/kalshi-trades.jsonl');
    
    if (!existsSync(tradesPath)) {
      return NextResponse.json({ 
        error: 'Trades file not found',
        path: tradesPath 
      }, { status: 404 });
    }

    const content = readFileSync(tradesPath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    
    // Parse all trades (type === 'trade' and order_status === 'executed')
    const trades: Trade[] = [];
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.type === 'trade' && entry.order_status === 'executed') {
          trades.push(entry);
        }
      } catch {
        // Skip invalid JSON lines
      }
    }

    // Calculate stats
    const wonTrades = trades.filter(t => t.result_status === 'won');
    const lostTrades = trades.filter(t => t.result_status === 'lost');
    const pendingTrades = trades.filter(t => !t.result_status || t.result_status === 'pending');

    // Calculate PnL and Profit Factor
    // Won: profit = (100 - price) * contracts
    // Lost: loss = price * contracts
    let grossProfitCents = 0;
    let grossLossCents = 0;
    
    for (const trade of trades) {
      const contracts = trade.contracts || 1;
      const price = trade.price_cents || 0;
      
      if (trade.result_status === 'won') {
        grossProfitCents += (100 - price) * contracts;
      } else if (trade.result_status === 'lost') {
        grossLossCents += price * contracts;
      }
      // pending trades don't affect PnL yet
    }
    
    const totalPnlCents = grossProfitCents - grossLossCents;
    // Profit Factor: gross profit / gross loss (>1 = profitable strategy)
    const profitFactor = grossLossCents > 0 ? grossProfitCents / grossLossCents : (grossProfitCents > 0 ? Infinity : 0);

    // Sharpe Ratio: (average return) / std dev of returns
    // For binary options: return = profit/cost as percentage
    // Only calculate for settled trades (won or lost)
    const settledTrades = trades.filter(t => t.result_status === 'won' || t.result_status === 'lost');
    const returns: number[] = [];
    
    for (const trade of settledTrades) {
      const cost = trade.cost_cents || trade.price_cents || 1;
      const contracts = trade.contracts || 1;
      const price = trade.price_cents || 0;
      
      if (trade.result_status === 'won') {
        // Profit percentage: (100 - price) * contracts / cost
        const profit = (100 - price) * contracts;
        returns.push(profit / cost);
      } else {
        // Loss percentage: -price * contracts / cost = -1 (full loss)
        returns.push(-1);
      }
    }
    
    let sharpeRatio = 0;
    let sortinoRatio = 0;
    if (returns.length >= 2) {
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      // Sharpe = mean / std (assuming risk-free rate = 0 for short-term trades)
      sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
      
      // Sortino Ratio: only penalizes downside volatility (negative returns)
      // Target return = 0 (break-even)
      const negativeReturns = returns.filter(r => r < 0);
      if (negativeReturns.length > 0) {
        const downsideVariance = negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length;
        const downsideDev = Math.sqrt(downsideVariance);
        sortinoRatio = downsideDev > 0 ? avgReturn / downsideDev : (avgReturn > 0 ? Infinity : 0);
      } else if (avgReturn > 0) {
        // No negative returns = infinite Sortino (perfect downside)
        sortinoRatio = Infinity;
      }
    }

    // Max Drawdown: largest peak-to-trough decline
    // Sort settled trades by timestamp and calculate cumulative PnL
    const sortedSettled = [...settledTrades].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    let cumulativePnl = 0;
    let peak = 0;
    let maxDrawdownCents = 0;
    let maxDrawdownPercent = 0;
    
    for (const trade of sortedSettled) {
      const contracts = trade.contracts || 1;
      const price = trade.price_cents || 0;
      
      if (trade.result_status === 'won') {
        cumulativePnl += (100 - price) * contracts;
      } else if (trade.result_status === 'lost') {
        cumulativePnl -= price * contracts;
      }
      
      // Update peak if we have a new high
      if (cumulativePnl > peak) {
        peak = cumulativePnl;
      }
      
      // Calculate current drawdown from peak
      const drawdown = peak - cumulativePnl;
      if (drawdown > maxDrawdownCents) {
        maxDrawdownCents = drawdown;
        // Calculate drawdown percent (relative to peak, avoid division by zero)
        maxDrawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;
      }
    }

    // Calmar Ratio: annualized return / max drawdown %
    // Need: total invested, trading period, total return
    let calmarRatio = 0;
    if (sortedSettled.length >= 2 && maxDrawdownPercent > 0) {
      // Calculate total invested (sum of all costs)
      let totalInvestedCents = 0;
      for (const trade of settledTrades) {
        const cost = trade.cost_cents || (trade.price_cents || 0) * (trade.contracts || 1);
        totalInvestedCents += cost;
      }
      
      // Calculate trading period in days
      const firstTradeDate = new Date(sortedSettled[0].timestamp);
      const lastTradeDate = new Date(sortedSettled[sortedSettled.length - 1].timestamp);
      const tradingDays = Math.max(1, (lastTradeDate.getTime() - firstTradeDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Total return as percentage
      const totalReturn = totalInvestedCents > 0 ? (totalPnlCents / totalInvestedCents) * 100 : 0;
      
      // Annualized return (extrapolate to 365 days)
      const annualizedReturn = totalReturn * (365 / tradingDays);
      
      // Calmar = annualized return / max drawdown %
      calmarRatio = annualizedReturn / maxDrawdownPercent;
    }

    // Average trade duration (time from entry to settlement in hours)
    // Uses minutes_to_expiry field which indicates time until settlement at trade entry
    let avgTradeDurationHours = 0;
    const tradesWithDuration = trades.filter(t => t.minutes_to_expiry && t.minutes_to_expiry > 0);
    if (tradesWithDuration.length > 0) {
      const totalMinutes = tradesWithDuration.reduce((sum, t) => sum + (t.minutes_to_expiry || 0), 0);
      avgTradeDurationHours = (totalMinutes / tradesWithDuration.length) / 60;
    }

    // Average return per trade (cents): total PnL / number of settled trades
    const avgReturnCents = settledTrades.length > 0 
      ? Math.round(totalPnlCents / settledTrades.length) 
      : 0;

    // Streak tracking: consecutive wins/losses
    // Sort settled trades chronologically to track streaks properly
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let currentStreak = 0;
    let currentStreakType: 'win' | 'loss' | 'none' = 'none';
    
    let tempWinStreak = 0;
    let tempLossStreak = 0;
    
    for (const trade of sortedSettled) {
      if (trade.result_status === 'won') {
        tempWinStreak++;
        tempLossStreak = 0;
        if (tempWinStreak > longestWinStreak) {
          longestWinStreak = tempWinStreak;
        }
      } else if (trade.result_status === 'lost') {
        tempLossStreak++;
        tempWinStreak = 0;
        if (tempLossStreak > longestLossStreak) {
          longestLossStreak = tempLossStreak;
        }
      }
    }
    
    // Determine current streak (from most recent trade)
    if (sortedSettled.length > 0) {
      // Walk backwards to count current streak
      let streakCount = 0;
      const lastResult = sortedSettled[sortedSettled.length - 1].result_status;
      
      for (let i = sortedSettled.length - 1; i >= 0; i--) {
        if (sortedSettled[i].result_status === lastResult) {
          streakCount++;
        } else {
          break;
        }
      }
      
      if (lastResult === 'won') {
        currentStreak = streakCount;
        currentStreakType = 'win';
      } else if (lastResult === 'lost') {
        currentStreak = -streakCount;
        currentStreakType = 'loss';
      }
    }

    // Latency stats (order placement to fill time)
    const tradesWithLatency = trades.filter(t => t.latency_ms && t.latency_ms > 0);
    let avgLatencyMs: number | null = null;
    let p95LatencyMs: number | null = null;
    let minLatencyMs: number | null = null;
    let maxLatencyMs: number | null = null;
    const latencyTradeCount = tradesWithLatency.length;
    
    if (tradesWithLatency.length > 0) {
      const latencies = tradesWithLatency.map(t => t.latency_ms!).sort((a, b) => a - b);
      avgLatencyMs = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
      minLatencyMs = latencies[0];
      maxLatencyMs = latencies[latencies.length - 1];
      // P95: 95th percentile
      const p95Index = Math.floor(latencies.length * 0.95);
      p95LatencyMs = latencies[Math.min(p95Index, latencies.length - 1)];
    }

    // Today's trades (UTC)
    const today = new Date().toISOString().split('T')[0];
    const todayTrades = trades.filter(t => t.timestamp.startsWith(today));
    const todayWon = todayTrades.filter(t => t.result_status === 'won');
    const todayLost = todayTrades.filter(t => t.result_status === 'lost');
    
    let todayPnlCents = 0;
    for (const trade of todayTrades) {
      const contracts = trade.contracts || 1;
      const price = trade.price_cents || 0;
      
      if (trade.result_status === 'won') {
        todayPnlCents += (100 - price) * contracts;
      } else if (trade.result_status === 'lost') {
        todayPnlCents -= price * contracts;
      }
    }

    const stats: TradingStats = {
      totalTrades: trades.length,
      wonTrades: wonTrades.length,
      lostTrades: lostTrades.length,
      pendingTrades: pendingTrades.length,
      winRate: trades.length > 0 ? (wonTrades.length / (wonTrades.length + lostTrades.length)) * 100 : 0,
      totalPnlCents,
      grossProfitCents,
      grossLossCents,
      profitFactor: Number.isFinite(profitFactor) ? Math.round(profitFactor * 100) / 100 : 0,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,  // Round to 2 decimal places
      sortinoRatio: Number.isFinite(sortinoRatio) ? Math.round(sortinoRatio * 100) / 100 : 0,
      maxDrawdownCents,
      maxDrawdownPercent: Math.round(maxDrawdownPercent * 100) / 100,  // Round to 2 decimal places
      calmarRatio: Number.isFinite(calmarRatio) ? Math.round(calmarRatio * 100) / 100 : 0,  // Round to 2 decimal places
      avgTradeDurationHours: Math.round(avgTradeDurationHours * 10) / 10,  // Round to 1 decimal place
      avgReturnCents,  // Average profit/loss per settled trade
      longestWinStreak,
      longestLossStreak,
      currentStreak,
      currentStreakType,
      // Latency stats
      avgLatencyMs,
      p95LatencyMs,
      minLatencyMs,
      maxLatencyMs,
      latencyTradeCount,
      todayTrades: todayTrades.length,
      todayWinRate: todayTrades.length > 0 ? (todayWon.length / (todayWon.length + todayLost.length)) * 100 : 0,
      todayPnlCents,
      recentTrades: trades.slice(-10).reverse(), // Last 10, newest first
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error reading trades:', error);
    return NextResponse.json({ 
      error: 'Failed to read trades',
      details: String(error)
    }, { status: 500 });
  }
}
