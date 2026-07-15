import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { calculateGapRatio, getStatusFromGap } from '../../utils/statusCalculator'

const STATUS_COLORS = {
  'On Track': '#1e8a5f',
  'Slightly Off Track': '#c98a12',
  'At Risk': '#d9711f',
  'Critical': '#c53d3d'
}

export default function AllYearsTrendChart({ goals = [], trendData = {} }) {
  const chartData = useMemo(() => {
    if (!trendData || goals.length === 0) return []

    // Get list of active goals that have trend series
    const goalsWithTrend = goals.filter(g => g.mgCode in trendData)

    if (goalsWithTrend.length === 0) return []

    // Determine the range of years. The dataset covers 2014 to 2030 (some go up to 2040)
    // We'll plot 2014 through 2030 (target year)
    const yearsRange = []
    for (let y = 2014; y <= 2030; y++) {
      yearsRange.push(y)
    }

    // Build the counts for each year
    return yearsRange.map(year => {
      let onTrack = 0
      let slightlyOff = 0
      let atRisk = 0
      let critical = 0

      goalsWithTrend.forEach(goal => {
        const trend = trendData[goal.mgCode]
        if (!trend) return

        // Find value for this year
        let point = trend.actual.find(p => p.fyNumeric === year)
        if (!point) {
          point = trend.currentTrend.find(p => p.fyNumeric === year)
        }

        if (point && point.value !== null) {
          // Calculate status for this year using 2030 target
          const gap = calculateGapRatio(point.value, goal.target2030, goal.direction)
          const status = getStatusFromGap(gap)

          if (status.includes('On Track')) onTrack++
          else if (status.includes('Slightly Off Track')) slightlyOff++
          else if (status.includes('At Risk')) atRisk++
          else if (status.includes('Critical')) critical++
        }
      })

      // Generate visual label (e.g. 2014 -> "2013-14")
      const yrLabel = `${year - 1}-${String(year).slice(-2)}`

      return {
        year,
        name: yrLabel,
        'On Track': onTrack,
        'Slightly Off Track': slightlyOff,
        'At Risk': atRisk,
        'Critical': critical
      }
    })
  }, [goals, trendData])

  if (chartData.length === 0) {
    return (
      <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs flex flex-col items-center justify-center min-h-[300px]">
        <span className="text-xs text-ink-muted font-medium">
          Trend data not available for the selected filters.
        </span>
      </div>
    )
  }

  // Count how many goals are represented in this chart
  const representedCount = goals.filter(g => trendData && g.mgCode in trendData).length

  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 border-b border-surface-2 pb-2">
        <div>
          <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider">
            Macro Goals Trend (All Years)
          </h3>
          <p className="text-[10px] text-ink-muted font-medium mt-0.5">
            Historical & Projected status distribution of goals with trend data ({representedCount} / {goals.length} goals)
          </p>
        </div>
        <span className="text-[10px] font-bold text-ink-muted bg-surface-0 border border-surface-border px-2.5 py-0.5 rounded-full uppercase tracking-wider self-start sm:self-center">
          2030 Target Horizon
        </span>
      </div>

      <div className="flex-1 min-h-[250px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
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
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-ink-body)' }}
            />
            <Line 
              type="monotone" 
              dataKey="On Track" 
              stroke={STATUS_COLORS['On Track']} 
              strokeWidth={2.5} 
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Slightly Off Track" 
              stroke={STATUS_COLORS['Slightly Off Track']} 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="At Risk" 
              stroke={STATUS_COLORS['At Risk']} 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Critical" 
              stroke={STATUS_COLORS['Critical']} 
              strokeWidth={2.5} 
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
