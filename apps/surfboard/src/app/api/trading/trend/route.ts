import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface DailyStats {
  date: string;
  winRate: number;
  dailyWinRate?: number;
  trades: number;
  won: number;
  lost: number;
  pnlCents: number;
  cumulativePnlCents?: number;
}

// Fetch real data from trading stats gist (same source as betting page)
const TRADING_STATS_GIST_URL = 'https://gist.githubusercontent.com/FreeRiverHouse/43b0815cc640bba8ac799ecb27434579/raw/onde-trading-stats.json';

async function fetchRealTrendData(): Promise<{ data: DailyStats[]; summary: Record<string, unknown> } | null> {
  try {
    const response = await fetch(TRADING_STATS_GIST_URL, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 120 } // Cache for 2 minutes
    });
    
    if (!response.ok) return null;
    
    const gistData = await response.json();
    const winRateTrend = gistData.winRateTrend;
    
    if (!winRateTrend?.data || winRateTrend.data.length === 0) return null;
    
    // Map gist format to our DailyStats format
    const data: DailyStats[] = winRateTrend.data.map((d: Record<string, unknown>) => ({
      date: d.date as string,
      winRate: (d.winRate as number) || 0,
      dailyWinRate: (d.dailyWinRate as number) || 0,
      trades: (d.trades as number) || 0,
      won: (d.won as number) || 0,
      lost: (d.lost as number) || 0,
      pnlCents: (d.pnlCents as number) || 0,
      cumulativePnlCents: (d.cumulativePnlCents as number) || 0,
    }));
    
    // Calculate summary from real data
    const totalTrades = data.reduce((sum, d) => sum + d.trades, 0);
    const totalWon = data.reduce((sum, d) => sum + d.won, 0);
    const overallWinRate = totalTrades > 0 ? (totalWon / totalTrades) * 100 : 0;
    const totalPnlCents = data.reduce((sum, d) => sum + d.pnlCents, 0);
    
    // Trend direction
    const recentDays = data.slice(-7);
    const previousDays = data.slice(-14, -7);
    const recentAvgWR = recentDays.length > 0 
      ? recentDays.reduce((s, d) => s + d.winRate, 0) / recentDays.length : 0;
    const previousAvgWR = previousDays.length > 0 
      ? previousDays.reduce((s, d) => s + d.winRate, 0) / previousDays.length : recentAvgWR;
    const trend = recentAvgWR > previousAvgWR + 2 ? 'improving' 
                : recentAvgWR < previousAvgWR - 2 ? 'declining' 
                : 'stable';
    
    return {
      data,
      summary: {
        days: data.length,
        source: winRateTrend.source || 'gist',
        totalTrades,
        totalWon,
        totalLost: totalTrades - totalWon,
        overallWinRate: Math.round(overallWinRate * 10) / 10,
        totalPnlCents,
        trend,
        recentAvgWinRate: Math.round(recentAvgWR * 10) / 10,
        previousAvgWinRate: Math.round(previousAvgWR * 10) / 10,
      }
    };
  } catch (e) {
    console.error('Failed to fetch trend data from gist:', e);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30', 10);
  const clampedDays = Math.max(7, Math.min(90, days));
  
  // Try real data from gist first
  const realData = await fetchRealTrendData();
  
  if (realData) {
    // Slice to requested number of days
    const slicedData = realData.data.slice(-clampedDays);
    
    return NextResponse.json({
      data: slicedData,
      summary: realData.summary,
      lastUpdated: new Date().toISOString(),
      source: 'gist'
    }, {
      headers: {
        'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
        'X-Data-Source': 'gist'
      }
    });
  }
  
  // Fallback: return empty data with clear indication
  return NextResponse.json({
    data: [],
    summary: {
      days: 0,
      source: 'none',
      totalTrades: 0,
      totalWon: 0,
      totalLost: 0,
      overallWinRate: 0,
      totalPnlCents: 0,
      trend: 'stable',
      recentAvgWinRate: 0,
      previousAvgWinRate: 0,
    },
    lastUpdated: new Date().toISOString(),
    source: 'fallback',
    note: 'Real data unavailable from gist. Check gist push script.'
  }, {
    headers: {
      'Cache-Control': 'no-cache',
      'X-Data-Source': 'fallback'
    }
  });
}
