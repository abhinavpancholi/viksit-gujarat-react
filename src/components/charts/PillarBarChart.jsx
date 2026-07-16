import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const PILLAR_COLOR_MAP = {
  'Thriving Economy - Earning Well': 'var(--color-pillar-economy)',
  'Empowered Citizen - Living Well': 'var(--color-pillar-citizen)',
  'Key Enablers': 'var(--color-pillar-enablers)'
}

const SHORT_NAMES = {
  'Thriving Economy - Earning Well': 'Thriving Economy',
  'Empowered Citizen - Living Well': 'Empowered Citizen',
  'Key Enablers': 'Key Enablers'
}

export default function PillarBarChart({ goals = [], activePillar = 'All', onSelectPillar }) {
  // Group and count goals by pillar
  const pillarCounts = goals.reduce((acc, goal) => {
    acc[goal.pillar] = (acc[goal.pillar] || 0) + 1
    return acc
  }, {})

  // Map to Recharts data shape
  const chartData = Object.entries(PILLAR_COLOR_MAP).map(([pillar, color]) => {
    const value = pillarCounts[pillar] || 0
    return {
      name: pillar,
      shortName: SHORT_NAMES[pillar] || pillar,
      value,
      color
    }
  })

  const handleBarClick = (data) => {
    if (!onSelectPillar) return
    const clickedPillarName = data.name
    // Toggle behavior: if clicked on the active pillar, reset to 'All'
    if (activePillar === clickedPillarName) {
      onSelectPillar('All')
    } else {
      onSelectPillar(clickedPillarName)
    }
  }

  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs flex flex-col" style={{ height: 440 }}>
      <div className="flex items-center justify-between mb-4 border-b border-surface-2 pb-2">
        <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider">
          Number of Macro Goals by Pillars
        </h3>
        {/* <span className="text-[10px] font-bold text-ink-muted bg-surface-0 border border-surface-border px-2 py-0.5 rounded-full uppercase tracking-wider">
          Click Bars to Filter
        </span> */}
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 25, right: 5, left: -40, bottom: 5 }}
            barSize={45}
          >
            <XAxis 
              dataKey="shortName" 
              tick={{ fill: 'var(--color-ink-muted)', fontSize: 10, fontWeight: 500}}
              axisLine={{ stroke: 'var(--color-surface-border)' }}
              tickLine={false}
              interval={0} // Ensure all bars are shown
              textAnchor="middle" // Center the text
              // angle={-5} // Rotate labels to prevent overlap
              // height={100} // Increase height to fit rotated labels
            />
            <YAxis 
              tick={{ fill: 'var(--color-ink-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-surface-0)', opacity: 0.5 }}
              contentStyle={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: '11px',
                borderRadius: '8px',
                border: '1px solid var(--color-surface-border)'
              }}
              formatter={(value) => [value, 'Goals']}
              labelFormatter={(label) => `Pillar: ${label}`}
            />
            <Bar 
              dataKey="value" 
              radius={[6, 6, 0, 0]} 
              animationDuration={600}
              onClick={handleBarClick}
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => {
                // If a specific pillar is active, dim the others
                const isDimmed = activePillar !== 'All' && activePillar !== entry.name
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    opacity={isDimmed ? 0.35 : 1}
                    className="transition-all duration-300 hover:opacity-85"
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
