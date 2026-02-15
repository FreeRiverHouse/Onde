'use client'

import { motion } from 'framer-motion'

interface DataPoint {
  label: string
  value: number
}

interface MiniChartProps {
  data: DataPoint[]
  title?: string
  color?: string
  suffix?: string
  height?: number
  showLabels?: boolean
}

/**
 * Lightweight inline SVG chart — no external deps.
 * Works with static export (no recharts/d3 needed).
 */
export default function MiniChart({
  data,
  title,
  color = '#06b6d4',
  suffix = '',
  height = 200,
  showLabels = true,
}: MiniChartProps) {
  if (!data.length) return null

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const width = 600
  const padding = { top: 20, right: 20, bottom: 40, left: 60 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  // Generate path
  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW
    const y = padding.top + chartH - ((d.value - min) / range) * chartH
    return { x, y, ...d }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // Area fill path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`

  // Y-axis ticks
  const yTicks = 5
  const yTickValues = Array.from({ length: yTicks }, (_, i) => min + (range * i) / (yTicks - 1))

  return (
    <motion.div
      className="my-8 rounded-xl border border-white/10 bg-white/5 p-4 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {title && <h4 className="text-sm font-medium text-white/70 mb-3">{title}</h4>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
        {/* Grid lines */}
        {yTickValues.map((v, i) => {
          const y = padding.top + chartH - ((v - min) / range) * chartH
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="11">
                {v >= 0 ? `${v.toFixed(suffix === '%' ? 0 : 2)}${suffix}` : `${v.toFixed(2)}${suffix}`}
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={areaD} fill={`${color}15`} />

        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        ))}

        {/* X-axis labels */}
        {showLabels &&
          points
            .filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1)
            .map((p, i) => (
              <text
                key={i}
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                fill="rgba(255,255,255,0.4)"
                fontSize="10"
              >
                {p.label}
              </text>
            ))}
      </svg>
    </motion.div>
  )
}

/**
 * Horizontal bar chart for comparing categories.
 */
export function MiniBarChart({
  data,
  title,
  color = '#06b6d4',
  suffix = '%',
}: {
  data: { label: string; value: number }[]
  title?: string
  color?: string
  suffix?: string
}) {
  if (!data.length) return null
  const maxVal = Math.max(...data.map((d) => d.value))

  return (
    <motion.div
      className="my-8 rounded-xl border border-white/10 bg-white/5 p-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {title && <h4 className="text-sm font-medium text-white/70 mb-4">{title}</h4>}
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-white/50 w-24 text-right shrink-0">{d.label}</span>
            <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                whileInView={{ width: `${(d.value / maxVal) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              />
            </div>
            <span className="text-xs text-white/70 w-12">
              {d.value}
              {suffix}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
