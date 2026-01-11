'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

interface CategoryData {
  name: string
  completed: number
  total: number
}

interface ProgressChartProps {
  data: CategoryData[]
  completionRate: number
}

export default function ProgressChart({ data, completionRate }: ProgressChartProps) {
  // Pie chart data
  const pieData = [
    { name: 'Completed', value: completionRate },
    { name: 'Remaining', value: 100 - completionRate }
  ]

  const COLORS = ['#f4d03f', 'rgba(255,255,255,0.1)']

  // Bar chart data - format category names
  const barData = data.map(d => ({
    name: d.name.charAt(0).toUpperCase() + d.name.slice(1),
    completed: d.completed,
    remaining: d.total - d.completed
  }))

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Completion Rate Pie Chart */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
        <div className="relative h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-onde-gold">{completionRate}%</span>
            <span className="text-sm opacity-60">Complete</span>
          </div>
        </div>
      </div>

      {/* Category Progress Bar Chart */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold mb-4">Progress by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 70, bottom: 0 }}
            >
              <XAxis type="number" stroke="#666" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#666"
                fontSize={12}
                width={65}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid rgba(244, 208, 63, 0.3)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number, name: string) => [
                  value,
                  name === 'completed' ? 'Done' : 'Todo'
                ]}
              />
              <Bar
                dataKey="completed"
                stackId="a"
                fill="#f4d03f"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="remaining"
                stackId="a"
                fill="rgba(255,255,255,0.1)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
