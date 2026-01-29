'use client';

import { useMemo } from 'react';

export interface LatencyTrendPoint {
  timestamp: string;
  avgMs: number;
  p95Ms: number;
  minMs: number;
  maxMs: number;
  count: number;
}

interface LatencyTrendChartProps {
  data: LatencyTrendPoint[];
  height?: number;
  showP95?: boolean;
}

/**
 * Latency trend chart showing order execution latency over time.
 * Displays average and optionally P95 latency as lines with area fill.
 */
export function LatencyTrendChart({ 
  data, 
  height = 200,
  showP95 = true 
}: LatencyTrendChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    const allValues = data.flatMap(d => showP95 ? [d.avgMs, d.p95Ms] : [d.avgMs]);
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);
    
    // Add 10% padding
    const padding = (maxValue - minValue) * 0.1 || 100;
    const yMax = maxValue + padding;
    const yMin = Math.max(0, minValue - padding);
    const yRange = yMax - yMin || 1;

    const width = 100;
    const xStep = width / Math.max(data.length - 1, 1);

    // Create path for avg line
    const avgPath = data.map((d, i) => {
      const x = i * xStep;
      const y = 100 - ((d.avgMs - yMin) / yRange) * 100;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    // Create path for p95 line
    const p95Path = showP95 ? data.map((d, i) => {
      const x = i * xStep;
      const y = 100 - ((d.p95Ms - yMin) / yRange) * 100;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') : '';

    // Create area path for avg
    const areaPath = data.map((d, i) => {
      const x = i * xStep;
      const y = 100 - ((d.avgMs - yMin) / yRange) * 100;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ` L ${(data.length - 1) * xStep} 100 L 0 100 Z`;

    // Calculate trend (comparing last 3 to first 3)
    const recentAvg = data.slice(-3).reduce((s, d) => s + d.avgMs, 0) / Math.min(3, data.length);
    const oldAvg = data.slice(0, 3).reduce((s, d) => s + d.avgMs, 0) / Math.min(3, data.length);
    const trend = recentAvg > oldAvg * 1.1 ? 'increasing' : recentAvg < oldAvg * 0.9 ? 'decreasing' : 'stable';

    // Overall stats
    const overallAvg = data.reduce((s, d) => s + d.avgMs, 0) / data.length;
    const overallP95 = Math.max(...data.map(d => d.p95Ms));
    const totalTrades = data.reduce((s, d) => s + d.count, 0);

    return {
      avgPath,
      p95Path,
      areaPath,
      yMin,
      yMax,
      trend,
      overallAvg,
      overallP95,
      totalTrades,
      points: data.map((d, i) => ({
        x: i * xStep,
        yAvg: 100 - ((d.avgMs - yMin) / yRange) * 100,
        yP95: 100 - ((d.p95Ms - yMin) / yRange) * 100,
        data: d
      }))
    };
  }, [data, showP95]);

  if (!chartData || data.length < 2) {
    return (
      <div className="bg-zinc-800/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-2">⏱️ Latency Trend</h3>
        <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
          {data.length < 2 
            ? 'Need more trades for latency trend'
            : 'No latency data available'}
        </div>
      </div>
    );
  }

  // Determine color based on average latency
  const getLatencyColor = (ms: number) => {
    if (ms < 500) return '#22c55e'; // green - excellent
    if (ms < 1000) return '#f59e0b'; // orange - acceptable
    return '#ef4444'; // red - slow
  };

  const avgColor = getLatencyColor(chartData.overallAvg);
  const trendIcon = chartData.trend === 'increasing' ? '📈' : chartData.trend === 'decreasing' ? '📉' : '➡️';
  const trendLabel = chartData.trend === 'increasing' ? 'Slower' : chartData.trend === 'decreasing' ? 'Faster' : 'Stable';

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">⏱️ Latency Trend</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-zinc-500">{chartData.totalTrades} trades</span>
          <span className="flex items-center gap-1">
            <span>{trendIcon}</span>
            <span className={
              chartData.trend === 'increasing' ? 'text-red-400' :
              chartData.trend === 'decreasing' ? 'text-green-400' : 'text-zinc-400'
            }>{trendLabel}</span>
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div>
          <span className="text-zinc-500">Avg: </span>
          <span style={{ color: avgColor }} className="font-medium">
            {chartData.overallAvg.toFixed(0)}ms
          </span>
        </div>
        {showP95 && (
          <div>
            <span className="text-zinc-500">P95: </span>
            <span className="text-orange-400 font-medium">
              {chartData.overallP95.toFixed(0)}ms
            </span>
          </div>
        )}
        <div>
          <span className="text-zinc-500">Range: </span>
          <span className="text-zinc-300">
            {chartData.yMin.toFixed(0)}-{chartData.yMax.toFixed(0)}ms
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }} className="relative">
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          <defs>
            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={avgColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={avgColor} stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Horizontal grid */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#3f3f46"
              strokeWidth="0.3"
              strokeDasharray="2,2"
            />
          ))}

          {/* Area fill for avg */}
          <path
            d={chartData.areaPath}
            fill="url(#latencyGradient)"
          />

          {/* P95 line (dashed) */}
          {showP95 && chartData.p95Path && (
            <path
              d={chartData.p95Path}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="3,2"
              strokeLinecap="round"
            />
          )}

          {/* Avg line */}
          <path
            d={chartData.avgPath}
            fill="none"
            stroke={avgColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points for avg */}
          {chartData.points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.yAvg}
              r="1.5"
              fill={avgColor}
              className="opacity-70"
            >
              <title>
                {new Date(p.data.timestamp).toLocaleDateString()}: {p.data.avgMs.toFixed(0)}ms avg ({p.data.count} trades)
              </title>
            </circle>
          ))}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-zinc-500 -ml-1">
          <span>{chartData.yMax.toFixed(0)}</span>
          <span>{((chartData.yMax + chartData.yMin) / 2).toFixed(0)}</span>
          <span>{chartData.yMin.toFixed(0)}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-[10px] text-zinc-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 rounded" style={{ backgroundColor: avgColor }}></div>
          <span>Avg</span>
        </div>
        {showP95 && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-orange-400 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 3px, transparent 3px, transparent 5px)' }}></div>
            <span>P95</span>
          </div>
        )}
        <span className="ml-auto">
          🟢 &lt;500ms | 🟡 500-1000ms | 🔴 &gt;1000ms
        </span>
      </div>
    </div>
  );
}

/**
 * Generate mock latency data for demo/testing
 */
export function generateMockLatencyTrend(days: number = 14): LatencyTrendPoint[] {
  const data: LatencyTrendPoint[] = [];
  const baseAvg = 350; // Starting average in ms
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    
    // Add some variation
    const variation = (Math.random() - 0.5) * 200;
    const avgMs = Math.max(100, baseAvg + variation + Math.sin(i / 3) * 100);
    const p95Ms = avgMs * (1.5 + Math.random() * 0.5);
    const minMs = avgMs * (0.3 + Math.random() * 0.2);
    const maxMs = p95Ms * (1.2 + Math.random() * 0.3);
    
    data.push({
      timestamp: date.toISOString(),
      avgMs: Math.round(avgMs),
      p95Ms: Math.round(p95Ms),
      minMs: Math.round(minMs),
      maxMs: Math.round(maxMs),
      count: Math.floor(5 + Math.random() * 20)
    });
  }
  
  return data;
}
