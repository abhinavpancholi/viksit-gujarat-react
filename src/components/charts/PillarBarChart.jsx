import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { Table, BarChart3 } from 'lucide-react'

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

export default function PillarBarChart({ goals = [], activePillar = 'All', onSelectPillar, viewMode = 'pillars', onViewChange }) {
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
    <div className="bg-surface-1 border border-surface-border rounded-xl p-3.5 shadow-2xs flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-surface-2 flex-shrink-0">
        <h3 className="text-xs font-bold text-navy-800 uppercase tracking-wider truncate pr-1">
          Macro Goals by Pillars
        </h3>
        {onViewChange && (
          <div className="flex items-center bg-surface-2/80 p-0.5 rounded-lg border border-surface-border flex-shrink-0">
            <button
              onClick={() => onViewChange('vision')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'vision' ? 'bg-white text-navy-800 shadow-2xs' : 'text-ink-muted hover:text-navy-800'
              }`}
              title="View State Vision & Macro Strategy Table"
            >
              <Table className="w-3 h-3" />
              <span>Vision</span>
            </button>
            <button
              onClick={() => onViewChange('pillars')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'pillars' ? 'bg-white text-navy-800 shadow-2xs' : 'text-ink-muted hover:text-navy-800'
              }`}
              title="View Macro Goals by Pillar Chart"
            >
              <BarChart3 className="w-3 h-3" />
              <span>Pillars</span>
            </button>
          </div>
        )}
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
              textAnchor="middle" 
              // angle={-5} // Rotate labels to prevent overlap
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
              <LabelList
                dataKey="value"
                position="top"
                fill="var(--color-ink)"
                fontSize={15}
                fontWeight={600}
              />
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
