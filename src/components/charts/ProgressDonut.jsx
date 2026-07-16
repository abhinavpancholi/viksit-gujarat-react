import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

// Custom label rendered just inside the outer edge of each slice
const SliceLabel = ({ cx, cy, midAngle, outerRadius, value }) => {
  if (!value) return null
  const RADIAN = Math.PI / 180
  const r = outerRadius + 14
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x} y={y}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="700"
      fontFamily="var(--font-mono)"
      fill="var(--color-navy-800)"
    >
      {value}
    </text>
  )
}

const STATUS_COLORS = {
  'On Track (gap ≤ 25%)': '#1e8a5f',
  'Slightly Off Track (gap ≤ 50%)': '#c98a12',
  'At Risk (gap ≤ 75%)': '#d9711f',
  'Critical (gap > 75%)': '#c53d3d'
}

const SHORT_NAMES = {
  'On Track (gap ≤ 25%)': 'On Track',
  'Slightly Off Track (gap ≤ 50%)': 'Slightly Off Track',
  'At Risk (gap ≤ 75%)': 'At Risk',
  'Critical (gap > 75%)': 'Critical / Behind'
}

export default function ProgressDonut({ title, counts = {}, activeStatus = 'All', onSelectStatus }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  
  // Format data for Recharts Pie
  const rawData = Object.entries(STATUS_COLORS).map(([statusKey, color]) => {
    const value = counts[statusKey] || 0
    return {
      key: statusKey,
      name: SHORT_NAMES[statusKey],
      value,
      color,
      pct: total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
    }
  })

  const handlePieClick = (data) => {
    if (!onSelectStatus) return
    const clickedKey = data.key
    if (activeStatus === clickedKey) {
      onSelectStatus('All')
    } else {
      onSelectStatus(clickedKey)
    }
  }

  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs flex flex-col justify-between h-full">
      <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider mb-2 border-b border-surface-2 pb-2">
        {title}
      </h3>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
        {/* Pie Chart Section */}
        <div className="relative w-[200px] h-[200px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rawData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={68}
                paddingAngle={2}
                dataKey="value"
                animationDuration={600}
                onClick={handlePieClick}
                className="cursor-pointer"
                label={SliceLabel}
                labelLine={false}
              >
                {rawData.map((entry, index) => {
                  const isDimmed = activeStatus !== 'All' && activeStatus !== entry.key
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      opacity={isDimmed ? 0.35 : 1}
                      className="outline-hidden transition-all duration-300 hover:opacity-85" 
                    />
                  )
                })}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [value, name]} 
                contentStyle={{ 
                  fontFamily: 'var(--font-body)', 
                  fontSize: '11px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-surface-border)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Centered Total Indicator */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold font-mono-num text-navy-800">{total}</span>
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Total</span>
          </div>
        </div>

        {/* Custom Legend Section */}
        <div className="flex-1 w-full flex flex-col gap-1.5 min-w-0">
          {rawData.map((item) => {
            const isDimmed = activeStatus !== 'All' && activeStatus !== item.key
            return (
              <div 
                key={item.key} 
                onClick={() => {
                  if (onSelectStatus) {
                    if (activeStatus === item.key) {
                      onSelectStatus('All')
                    } else {
                      onSelectStatus(item.key)
                    }
                  }
                }}
                className={`flex items-center justify-between text-[11px] border-b border-surface-2/40 pb-1 last:border-0 min-w-0 gap-2 cursor-pointer transition-all duration-300 ${
                  isDimmed ? 'opacity-35 hover:opacity-75' : 'opacity-100 font-semibold'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-ink-body truncate select-none block" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <span className="font-mono-num font-bold text-navy-800 flex-shrink-0">
                  {item.value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
