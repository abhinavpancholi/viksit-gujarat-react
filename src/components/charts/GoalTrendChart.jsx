import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function GoalTrendChart({ trend, horizon }) {
  const chartData = useMemo(() => {
    if (!trend) return []

    // Horizon configuration
    const horizonKey = horizon === '2030' ? 'target2030' : 'target2047'
    const requiredPoints = trend.requiredTrend[horizonKey] || []
    
    // Join actual, projected (currentTrend), and required points by year
    const yearMap = {}

    // Populate actuals
    trend.actual.forEach((p) => {
      yearMap[p.fyNumeric] = {
        year: p.fyNumeric,
        name: p.fyLabel,
        actual: p.value,
        projected: null,
        required: null
      }
    })

    // Populate projected (currentTrend)
    trend.currentTrend.forEach((p) => {
      if (yearMap[p.fyNumeric]) {
        yearMap[p.fyNumeric].projected = p.value
      } else {
        yearMap[p.fyNumeric] = {
          year: p.fyNumeric,
          name: p.fyLabel,
          actual: null,
          projected: p.value,
          required: null
        }
      }
    })

    // Populate required trend line
    requiredPoints.forEach((p) => {
      const year = p.fyNumeric
      const label = `${year - 1}-${String(year).slice(-2)}`
      
      if (yearMap[year]) {
        yearMap[year].required = p.value
      } else {
        yearMap[year] = {
          year,
          name: label,
          actual: null,
          projected: null,
          required: p.value
        }
      }
    })

    // Convert map to sorted array
    return Object.values(yearMap).sort((a, b) => a.year - b.year)
  }, [trend, horizon])

  if (!trend) {
    return (
      <div className="bg-surface-1 border border-surface-border rounded-xl p-6 shadow-2xs flex items-center justify-center min-h-[300px]">
        <span className="text-xs text-ink-muted font-medium">
          Trend visualization is not available for this macro goal.
        </span>
      </div>
    )
  }

  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 border-b border-surface-2 pb-2">
        <div>
          <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider">
            Trend Analysis for Target {horizon}
          </h3>
          <p className="text-[10px] text-ink-muted font-medium mt-0.5">
            Compares historical & projected values (Current Trend) against the linear path to target (Required Trend)
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[280px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-2)" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'var(--color-ink-muted)', fontSize: 9, fontWeight: 500 }}
              axisLine={{ stroke: 'var(--color-surface-border)' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: 'var(--color-ink-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: '11px',
                borderRadius: '8px',
                border: '1px solid var(--color-surface-border)'
              }}
              formatter={(value, name) => {
                const label = name === 'actual' ? 'Actual Value' : name === 'projected' ? 'Current Projection' : 'Required Path'
                return [`${value.toFixed(2)}`, label]
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-ink-body)' }}
            />
            
            {/* Actual History (Solid Navy/Blue) */}
            <Line 
              type="monotone" 
              dataKey="actual" 
              name="actual"
              stroke="var(--color-navy-800)" 
              strokeWidth={3} 
              dot={{ r: 3, fill: 'var(--color-navy-800)' }}
              activeDot={{ r: 5 }}
            />
            
            {/* Projected Extension (Dashed Light Blue) */}
            <Line 
              type="monotone" 
              dataKey="projected" 
              name="projected"
              stroke="var(--color-navy-500)" 
              strokeWidth={2} 
              strokeDasharray="4 4"
              dot={{ r: 3, fill: 'var(--color-navy-500)' }}
              activeDot={{ r: 5 }}
            />
            
            {/* Required Target Path (Dashed Orange/Grey) */}
            <Line 
              type="monotone" 
              dataKey="required" 
              name="required"
              stroke="var(--color-saffron-500)" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
