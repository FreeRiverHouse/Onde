'use client';

import { useState, useEffect } from 'react';
import { TrendChart, TrendDataPoint } from './TrendChart';

const TRADING_STATS_GIST_URL =
  'https://gist.githubusercontent.com/FreeRiverHouse/43b0815cc640bba8ac799ecb27434579/raw/onde-trading-stats.json';

interface LatencyTrendPoint {
  timestamp: string;
  avgMs: number;
  p95Ms: number;
  minMs: number;
  maxMs: number;
  count: number;
}

export function SystemHealthTrendWidget({ className = '' }: { className?: string }) {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthSummary, setHealthSummary] = useState<{
    avgLatency: number | null;
    p95Latency: number | null;
    isRunning: boolean;
    uptimePct: number | null;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(TRADING_STATS_GIST_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        const gist = await res.json();

        // Use latency trend data (daily aggregated)
        const trend: LatencyTrendPoint[] = Array.isArray(gist.trend) ? gist.trend : [];
        // Also try latencyHistory (more granular)
        const latencyHistory = gist.latencyHistory?.dataPoints || [];
        const healthStatus = gist.healthStatus;

        // Prefer trend data (daily), fall back to latencyHistory
        const source = trend.length > 0 ? trend : latencyHistory;

        if (source.length === 0) {
          setData([]);
          setHealthSummary({
            avgLatency: gist.avgLatencyMs ?? null,
            p95Latency: gist.p95LatencyMs ?? null,
            isRunning: healthStatus?.is_running ?? false,
            uptimePct: null,
          });
          return;
        }

        const mapped: TrendDataPoint[] = source.map((p: LatencyTrendPoint) => ({
          label: formatDateShort(p.timestamp),
          value: p.avgMs,
          value2: p.p95Ms,
        }));

        setData(mapped);
        setHealthSummary({
          avgLatency: gist.avgLatencyMs ?? null,
          p95Latency: gist.p95LatencyMs ?? null,
          isRunning: healthStatus?.is_running ?? false,
          uptimePct: gist.healthHistory?.uptimePct ?? null,
        });
      } catch (err) {
        console.error('SystemHealthTrendWidget: failed to fetch', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className={className}>
      {/* Health summary bar */}
      {healthSummary && !loading && (
        <div className="flex items-center gap-4 mb-2 px-1 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                healthSummary.isRunning
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-pulse'
                  : 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
              }`}
            />
            <span className="text-xs text-white/60">
              {healthSummary.isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
          {healthSummary.avgLatency !== null && (
            <>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-white/40">Avg</span>
                <span className="text-sm font-mono text-amber-400">
                  {healthSummary.avgLatency.toFixed(0)}ms
                </span>
              </div>
            </>
          )}
          {healthSummary.p95Latency !== null && (
            <>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-white/40">p95</span>
                <span className="text-sm font-mono text-purple-400">
                  {healthSummary.p95Latency.toFixed(0)}ms
                </span>
              </div>
            </>
          )}
          {healthSummary.uptimePct !== null && (
            <>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-white/40">Uptime</span>
                <span className="text-sm font-mono text-emerald-400">
                  {healthSummary.uptimePct.toFixed(1)}%
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <TrendChart
        data={data}
        loading={loading}
        title="⚡ Response Time"
        subtitle="API Latency"
        label2="p95"
        color="amber"
        color2="purple"
        height={180}
        showDots={data.length <= 20}
        fill={true}
        showGrid={true}
        formatValue={(v) => `${v.toFixed(0)}ms`}
        emptyMessage="Collecting latency data..."
      />
    </div>
  );
}

function formatDateShort(timestamp: string): string {
  try {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return timestamp;
  }
}

export default SystemHealthTrendWidget;
