'use client';

import { useState, useEffect } from 'react';
import { TrendChart, TrendDataPoint } from './TrendChart';

const TRADING_STATS_GIST_URL =
  'https://gist.githubusercontent.com/FreeRiverHouse/43b0815cc640bba8ac799ecb27434579/raw/onde-trading-stats.json';

interface WinRateTrendDay {
  date: string;
  trades: number;
  won: number;
  lost: number;
  pnlCents: number;
  cumulativePnlCents: number;
  winRate: number;
}

export function PnLTrendWidget({ className = '' }: { className?: string }) {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{
    totalPnl: number;
    totalTrades: number;
    winRate: number;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(TRADING_STATS_GIST_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        const gist = await res.json();

        const trend: WinRateTrendDay[] = gist.winRateTrend?.data || [];
        if (trend.length === 0) {
          setData([]);
          return;
        }

        // Map to TrendDataPoint: cumulative PnL in dollars, with daily win rate as secondary
        const mapped: TrendDataPoint[] = trend.map(d => ({
          label: formatDateShort(d.date),
          value: d.cumulativePnlCents / 100, // Convert cents to dollars
          value2: d.winRate,
        }));

        setData(mapped);
        setSummary({
          totalPnl: gist.pnlCents ? gist.pnlCents / 100 : (trend[trend.length - 1]?.cumulativePnlCents ?? 0) / 100,
          totalTrades: gist.totalTrades ?? trend.reduce((s: number, d: WinRateTrendDay) => s + d.trades, 0),
          winRate: gist.winRate ?? 0,
        });
      } catch (err) {
        console.error('PnLTrendWidget: failed to fetch', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className={className}>
      {/* Summary bar */}
      {summary && !loading && data.length > 0 && (
        <div className="flex items-center gap-4 mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white/40">Total PnL</span>
            <span
              className={`text-sm font-mono font-bold ${
                summary.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {summary.totalPnl >= 0 ? '+' : ''}${summary.totalPnl.toFixed(2)}
            </span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white/40">Trades</span>
            <span className="text-sm font-mono text-white/70">{summary.totalTrades}</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white/40">Win Rate</span>
            <span className="text-sm font-mono text-cyan-400">{summary.winRate.toFixed(1)}%</span>
          </div>
        </div>
      )}

      <TrendChart
        data={data}
        loading={loading}
        title="💰 Cumulative PnL"
        subtitle="Kalshi Autotrader"
        label2="Win Rate %"
        color={data.length > 0 && data[data.length - 1]?.value >= 0 ? 'emerald' : 'red'}
        color2="cyan"
        height={200}
        showZeroLine={true}
        showDots={true}
        fill={true}
        formatValue={(v) => `$${v.toFixed(0)}`}
        emptyMessage="No trading data yet..."
      />
    </div>
  );
}

function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default PnLTrendWidget;
