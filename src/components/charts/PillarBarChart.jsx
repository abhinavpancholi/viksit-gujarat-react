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

export default function PillarBarChart({ goals = [] }) {
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

  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs flex flex-col h-full">
      <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider mb-4 border-b border-surface-2 pb-2">
        Number of Macro Goals by Pillars
      </h3>

      <div className="flex-1 min-h-[220px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            barSize={45}
          >
            <XAxis 
              dataKey="shortName" 
              tick={{ fill: 'var(--color-ink-muted)', fontSize: 10, fontWeight: 500 }}
              axisLine={{ stroke: 'var(--color-surface-border)' }}
              tickLine={false}
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
            <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={600}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
