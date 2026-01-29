'use client';

import { useMemo } from 'react';

interface DataPoint {
  date: string;
  winRate: number;
  trades: number;
}

interface WinRateTrendChartProps {
  data: DataPoint[];
  height?: number;
  className?: string;
  showLabels?: boolean;
}

export function WinRateTrendChart({ 
  data, 
  height = 120, 
  className = '',
  showLabels = true 
}: WinRateTrendChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const padding = { top: 20, right: 10, bottom: 25, left: 40 };
    const width = 300;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Normalize values
    const minRate = Math.min(...data.map(d => d.winRate));
    const maxRate = Math.max(...data.map(d => d.winRate));
    const range = maxRate - minRate || 1;
    
    // Generate path points
    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((d.winRate - minRate) / range) * chartHeight;
      return { x, y, ...d };
    });
    
    // Create SVG path
    const pathD = points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${acc} L ${point.x} ${point.y}`;
    }, '');
    
    // Area path for gradient fill
    const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
    
    // Current trend
    const lastRate = data[data.length - 1]?.winRate || 0;
    const prevRate = data[data.length - 2]?.winRate || lastRate;
    const trend = lastRate > prevRate ? 'up' : lastRate < prevRate ? 'down' : 'flat';
    
    return { points, pathD, areaD, minRate, maxRate, trend, width, height: height, padding, chartHeight };
  }, [data, height]);

  if (!chartData || data.length < 2) {
    return (
      <div className={`flex items-center justify-center text-gray-500 text-sm ${className}`} style={{ height }}>
        Not enough data for trend chart
      </div>
    );
  }

  const { points, pathD, areaD, minRate, maxRate, trend, width, padding, chartHeight } = chartData;
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280';
  const gradientId = `winrate-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={trendColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((pct) => {
          const y = padding.top + (chartHeight * (1 - pct / 100));
          return (
            <g key={pct}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeDasharray="2,2"
              />
              {showLabels && (
                <text
                  x={padding.left - 5}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[8px] fill-gray-500"
                >
                  {Math.round(minRate + (maxRate - minRate) * (pct / 100))}%
                </text>
              )}
            </g>
          );
        })}
        
        {/* Area fill */}
        <path d={areaD} fill={`url(#${gradientId})`} />
        
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={trendColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={trendColor}
              className="opacity-0 hover:opacity-100 transition-opacity"
            />
            {/* Tooltip on hover - simplified */}
            <title>{`${point.date}: ${point.winRate.toFixed(1)}% (${point.trades} trades)`}</title>
          </g>
        ))}
        
        {/* X-axis labels */}
        {showLabels && points.filter((_, i) => i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)).map((point, i) => (
          <text
            key={i}
            x={point.x}
            y={height - 5}
            textAnchor="middle"
            className="text-[8px] fill-gray-500"
          >
            {point.date.slice(5)} {/* MM-DD format */}
          </text>
        ))}
        
        {/* Current value indicator */}
        <g transform={`translate(${points[points.length - 1].x}, ${points[points.length - 1].y})`}>
          <circle r="5" fill={trendColor} className="animate-pulse" />
          <circle r="3" fill="white" />
        </g>
      </svg>
    </div>
  );
}

// Helper to generate mock trend data for testing
export function generateMockWinRateTrend(days: number = 30): DataPoint[] {
  const data: DataPoint[] = [];
  let winRate = 50;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Random walk with mean reversion
    winRate += (Math.random() - 0.5) * 10;
    winRate = Math.max(20, Math.min(80, winRate));
    winRate = winRate * 0.9 + 50 * 0.1; // Mean reversion to 50%
    
    data.push({
      date: date.toISOString().slice(0, 10),
      winRate: Math.round(winRate * 10) / 10,
      trades: Math.floor(Math.random() * 10) + 1
    });
  }
  
  return data;
}
