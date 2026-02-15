import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Paper trading stats + auto-tune data from GitHub Gist
const PAPER_STATS_GIST_URL = 'https://gist.githubusercontent.com/FreeRiverHouse/43b0815cc640bba8ac799ecb27434579/raw/onde-paper-stats.json';

// Also fetch real stats for comparison
const REAL_STATS_GIST_URL = 'https://gist.githubusercontent.com/FreeRiverHouse/43b0815cc640bba8ac799ecb27434579/raw/onde-trading-stats.json';

export async function GET() {
  try {
    // Fetch paper stats and real stats in parallel
    const [paperRes, realRes] = await Promise.all([
      fetch(PAPER_STATS_GIST_URL, { cache: 'no-store' }),
      fetch(REAL_STATS_GIST_URL, { cache: 'no-store' }).catch(() => null),
    ]);

    if (!paperRes.ok) {
      throw new Error(`Paper stats gist fetch failed: ${paperRes.status}`);
    }

    const paperData = await paperRes.json();

    // Try to get real stats for comparison
    let realStats = null;
    if (realRes && realRes.ok) {
      try {
        const realData = await realRes.json();
        realStats = {
          total_trades: realData.totalTrades ?? 0,
          win_rate: realData.winRate ?? 0,
          pnl_cents: realData.pnlCents ?? 0,
          pnl_dollars: (realData.pnlCents ?? 0) / 100,
          profit_factor: realData.profitFactor ?? 0,
          max_drawdown_pct: realData.maxDrawdownPercent ?? 0,
        };
      } catch {
        // Ignore real stats errors
      }
    }

    return NextResponse.json({
      ...paperData,
      real_stats_comparison: realStats,
      api: {
        source: 'gist',
        fetched_at: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Paper trade API error:', error);

    return NextResponse.json({
      paper_trading: {
        total_trades: 0,
        wins: 0,
        losses: 0,
        pending: 0,
        win_rate: 0,
        pnl_cents: 0,
        by_asset: {},
        by_regime: {},
        by_edge_bucket: {},
        daily_breakdown: [],
        timeline: [],
      },
      auto_tune: {
        status: 'unknown',
        history: [],
        latest_report: null,
      },
      real_stats_comparison: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      api: {
        source: 'default',
        fetched_at: new Date().toISOString(),
        error: true,
      }
    });
  }
}
