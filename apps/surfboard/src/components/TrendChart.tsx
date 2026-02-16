'use client';

import { useMemo } from 'react';

export interface TrendDataPoint {
  label: string;
  value: number;
  /** Optional secondary value for dual-line charts */
  value2?: number;
}

export interface TrendChartProps {
  data: TrendDataPoint[];
  height?: number;
  color?: 'cyan' | 'emerald' | 'purple' | 'amber' | 'red';
  color2?: 'cyan' | 'emerald' | 'purple' | 'amber' | 'red';
  /** Show area fill under the line */
  fill?: boolean;
  /** Format function for Y-axis labels */
  formatValue?: (value: number) => string;
  /** Format function for tooltip */
  formatTooltip?: (point: TrendDataPoint) => string;
  /** Show dots on data points */
  showDots?: boolean;
  /** Show Y-axis reference lines */
  showGrid?: boolean;
  /** Number of Y-axis grid lines */
  gridLines?: number;
  /** Show zero line when data crosses zero */
  showZeroLine?: boolean;
  /** Title displayed inside the chart */
  title?: string;
  /** Subtitle / legend text */
  subtitle?: string;
  /** Label for secondary line (legend) */
  label2?: string;
  /** Message when no data */
  emptyMessage?: string;
  /** Loading state */
  loading?: boolean;
  className?: string;
}

const COLOR_MAP = {
  cyan: {
    stroke: '#06b6d4',
    fill: 'rgba(6, 182, 212, 0.15)',
    dot: '#22d3ee',
    text: 'text-cyan-400',
    glow: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.4))',
  },
  emerald: {
    stroke: '#10b981',
    fill: 'rgba(16, 185, 129, 0.15)',
    dot: '#34d399',
    text: 'text-emerald-400',
    glow: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))',
  },
  purple: {
    stroke: '#a855f7',
    fill: 'rgba(168, 85, 247, 0.15)',
    dot: '#c084fc',
    text: 'text-purple-400',
    glow: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.4))',
  },
  amber: {
    stroke: '#f59e0b',
    fill: 'rgba(245, 158, 11, 0.15)',
    dot: '#fbbf24',
    text: 'text-amber-400',
    glow: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))',
  },
  red: {
    stroke: '#ef4444',
    fill: 'rgba(239, 68, 68, 0.15)',
    dot: '#f87171',
    text: 'text-red-400',
    glow: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.4))',
  },
};

export function TrendChart({
  data,
  height = 180,
  color = 'cyan',
  color2 = 'purple',
  fill = true,
  formatValue,
  showDots = true,
  showGrid = true,
  gridLines = 4,
  showZeroLine = false,
  title,
  subtitle,
  label2,
  emptyMessage = 'Collecting data...',
  loading = false,
  className = '',
}: TrendChartProps) {
  const colors = COLOR_MAP[color];
  const colors2 = COLOR_MAP[color2];

  const chart = useMemo(() => {
    if (!data || data.length === 0) return null;

    const padding = { top: 20, right: 16, bottom: 30, left: 50 };
    const width = 500;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Compute bounds across all values
    const allValues = data.map(d => d.value);
    const allValues2 = data.filter(d => d.value2 !== undefined).map(d => d.value2!);
    const combined = [...allValues, ...allValues2];
    
    let minVal = Math.min(...combined);
    let maxVal = Math.max(...combined);
    
    // If showZeroLine, ensure zero is included
    if (showZeroLine) {
      minVal = Math.min(minVal, 0);
      maxVal = Math.max(maxVal, 0);
    }
    
    // Add 10% padding
    const range = maxVal - minVal || 1;
    minVal -= range * 0.05;
    maxVal += range * 0.05;
    const finalRange = maxVal - minVal;

    // Map points
    const points = data.map((d, i) => ({
      x: padding.left + (data.length === 1 ? chartWidth / 2 : (i / (data.length - 1)) * chartWidth),
      y: padding.top + chartHeight - ((d.value - minVal) / finalRange) * chartHeight,
      ...d,
    }));

    const points2 = allValues2.length > 0
      ? data.map((d, i) => ({
          x: padding.left + (data.length === 1 ? chartWidth / 2 : (i / (data.length - 1)) * chartWidth),
          y: padding.top + chartHeight - (((d.value2 ?? 0) - minVal) / finalRange) * chartHeight,
          ...d,
        }))
      : [];

    // SVG path for line 1
    const linePath = points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      // Smooth curve with cubic bezier
      const prev = points[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `${acc} C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
    }, '');

    // Area path
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

    // Line 2 path
    const line2Path = points2.length > 0
      ? points2.reduce((acc, p, i) => {
          if (i === 0) return `M ${p.x} ${p.y}`;
          const prev = points2[i - 1];
          const cpx = (prev.x + p.x) / 2;
          return `${acc} C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
        }, '')
      : '';

    // Grid lines
    const gridYs = Array.from({ length: gridLines }, (_, i) => {
      const val = minVal + (finalRange * (i / (gridLines - 1)));
      const y = padding.top + chartHeight - ((val - minVal) / finalRange) * chartHeight;
      return { y, value: val };
    });

    // Zero line Y position
    const zeroY = showZeroLine
      ? padding.top + chartHeight - ((0 - minVal) / finalRange) * chartHeight
      : null;

    // X-axis labels (show first, middle, last)
    const xLabels: { x: number; label: string }[] = [];
    if (data.length > 0) {
      xLabels.push({ x: points[0].x, label: data[0].label });
      if (data.length > 2) {
        const mid = Math.floor(data.length / 2);
        xLabels.push({ x: points[mid].x, label: data[mid].label });
      }
      if (data.length > 1) {
        xLabels.push({ x: points[points.length - 1].x, label: data[data.length - 1].label });
      }
    }

    // Trend arrow
    const lastVal = data[data.length - 1].value;
    const prevVal = data.length > 1 ? data[data.length - 2].value : lastVal;
    const trend = lastVal > prevVal ? 'up' : lastVal < prevVal ? 'down' : 'flat';

    return {
      width,
      points,
      points2,
      linePath,
      areaPath,
      line2Path,
      gridYs,
      zeroY,
      xLabels,
      padding,
      chartHeight,
      trend,
      lastVal,
    };
  }, [data, height, gridLines, showZeroLine]);

  // Loading skeleton
  if (loading) {
    return (
      <div className={`relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 ${className}`}>
        {title && (
          <div className="h-4 w-24 bg-white/10 rounded mb-3 animate-pulse" />
        )}
        <div
          className="w-full animate-pulse rounded-lg bg-white/[0.04]"
          style={{ height }}
        />
      </div>
    );
  }

  // Empty state
  if (!chart) {
    return (
      <div className={`relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 ${className}`}>
        {title && (
          <div className="text-sm font-medium text-white/70 mb-2">{title}</div>
        )}
        <div
          className="w-full flex flex-col items-center justify-center rounded-lg bg-white/[0.02] border border-dashed border-white/[0.08]"
          style={{ height }}
        >
          <div className="text-2xl mb-2 opacity-40">📊</div>
          <p className="text-white/30 text-sm">{emptyMessage}</p>
          <div className="mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/40 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/40 animate-pulse" style={{ animationDelay: '0.3s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/40 animate-pulse" style={{ animationDelay: '0.6s' }} />
          </div>
        </div>
      </div>
    );
  }

  const fmtVal = formatValue || ((v: number) => {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
    if (Math.abs(v) >= 1) return v.toFixed(0);
    return v.toFixed(2);
  });

  return (
    <div className={`relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 overflow-hidden group ${className}`}>
      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${colors.fill}, transparent 70%)`,
        }}
      />

      {/* Header */}
      {(title || subtitle) && (
        <div className="relative z-10 flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {title && (
              <span className="text-sm font-medium text-white/70">{title}</span>
            )}
            {chart.trend === 'up' && (
              <span className="text-emerald-400 text-xs">▲</span>
            )}
            {chart.trend === 'down' && (
              <span className="text-red-400 text-xs">▼</span>
            )}
          </div>
          {(subtitle || label2) && (
            <div className="flex items-center gap-3 text-xs">
              {subtitle && (
                <span className="text-white/40">{subtitle}</span>
              )}
              {label2 && (
                <div className="flex items-center gap-1">
                  <span
                    className="w-2 h-0.5 rounded-full"
                    style={{ backgroundColor: colors2.stroke }}
                  />
                  <span className="text-white/40">{label2}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${chart.width} ${height}`}
        className="w-full relative z-10"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`trend-fill-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.25" />
            <stop offset="100%" stopColor={colors.stroke} stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {showGrid &&
          chart.gridYs.map((g, i) => (
            <g key={i}>
              <line
                x1={chart.padding.left}
                y1={g.y}
                x2={chart.width - chart.padding.right}
                y2={g.y}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 4"
              />
              <text
                x={chart.padding.left - 6}
                y={g.y + 4}
                textAnchor="end"
                fill="rgba(255,255,255,0.25)"
                fontSize="10"
                fontFamily="monospace"
              >
                {fmtVal(g.value)}
              </text>
            </g>
          ))}

        {/* Zero line */}
        {chart.zeroY !== null && (
          <line
            x1={chart.padding.left}
            y1={chart.zeroY}
            x2={chart.width - chart.padding.right}
            y2={chart.zeroY}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
            strokeDasharray="6 3"
          />
        )}

        {/* Area fill */}
        {fill && (
          <path
            d={chart.areaPath}
            fill={`url(#trend-fill-${color})`}
          />
        )}

        {/* Main line */}
        <path
          d={chart.linePath}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* Secondary line */}
        {chart.line2Path && (
          <path
            d={chart.line2Path}
            fill="none"
            stroke={colors2.stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 3"
            opacity="0.7"
          />
        )}

        {/* Dots */}
        {showDots &&
          chart.points.map((p, i) => (
            <g key={i}>
              {/* Outer glow */}
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                fill={colors.stroke}
                opacity="0.2"
              />
              {/* Inner dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r="3"
                fill={colors.dot}
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="1"
              />
            </g>
          ))}

        {/* X-axis labels */}
        {chart.xLabels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={height - 6}
            textAnchor={i === 0 ? 'start' : i === chart.xLabels.length - 1 ? 'end' : 'middle'}
            fill="rgba(255,255,255,0.3)"
            fontSize="10"
            fontFamily="monospace"
          >
            {l.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default TrendChart;
