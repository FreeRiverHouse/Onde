import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Gist URL for real trading stats
const TRADING_STATS_GIST_URL = 'https://gist.githubusercontent.com/FreeRiverHouse/43b0815cc640bba8ac799ecb27434579/raw/onde-trading-stats.json';

export async function GET() {
  try {
    const gistRes = await fetch(TRADING_STATS_GIST_URL, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });

    if (gistRes.ok) {
      const gistData = await gistRes.json();
      
      const totalTrades = gistData.totalTrades ?? 0;
      const winRate = gistData.winRate ?? 0;
      const wonTrades = Math.round((winRate * totalTrades) / 100);
      const lostTrades = totalTrades - wonTrades - (gistData.pendingTrades ?? 0);

      return NextResponse.json({
        totalTrades,
        winRate,
        pnlCents: gistData.pnlCents ?? 0,
        todayStats: {
          trades: gistData.todayTrades ?? 0,
          wins: 0,
          losses: 0,
          pending: 0,
          pnl: gistData.todayPnlCents ?? 0
        },
        recentTrades: gistData.v3PaperTrading?.recentTrades?.slice(0, 10) || [],
        grossProfitCents: gistData.grossProfitCents ?? 0,
        grossLossCents: gistData.grossLossCents ?? 0,
        profitFactor: gistData.profitFactor === "∞" ? Infinity : (gistData.profitFactor ?? 0),
        sharpeRatio: 0,
        maxDrawdownCents: gistData.maxDrawdownCents ?? 0,
        maxDrawdownPercent: gistData.maxDrawdownPercent ?? 0,
        calmarRatio: 0,
        sortinoRatio: 0,
        avgDurationHours: 0,
        longestWinStreak: gistData.longestWinStreak ?? 0,
        longestLossStreak: gistData.longestLossStreak ?? 0,
        currentStreak: gistData.currentStreak ?? 0,
        currentStreakType: gistData.currentStreakType ?? 'none',
        avgReturnCents: totalTrades > 0 ? Math.round((gistData.pnlCents ?? 0) / totalTrades) : 0,
        avgLatencyMs: gistData.avgLatencyMs ?? null,
        dataSource: 'gist',
        lastUpdated: gistData.lastUpdated ?? new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Failed to fetch trading stats from gist:', error);
  }

  // Fallback: empty stats with notice
  return NextResponse.json({
    totalTrades: 0,
    winRate: 0,
    pnlCents: 0,
    todayStats: { trades: 0, wins: 0, losses: 0, pending: 0, pnl: 0 },
    recentTrades: [],
    grossProfitCents: 0,
    grossLossCents: 0,
    profitFactor: 0,
    sharpeRatio: 0,
    maxDrawdownCents: 0,
    maxDrawdownPercent: 0,
    calmarRatio: 0,
    sortinoRatio: 0,
    avgDurationHours: 0,
    longestWinStreak: 0,
    longestLossStreak: 0,
    currentStreak: 0,
    currentStreakType: 'none',
    avgReturnCents: 0,
    avgLatencyMs: null,
    dataSource: 'none',
    notice: 'No trading stats available. Data will appear when the autotrader pushes stats to the Gist.',
  });
}
