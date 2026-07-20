import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts'
import { Maximize2 } from 'lucide-react'

export default function GoalTrendChart({ trend, horizon, onHorizonChange, onExpandClick, isExpanded }) {
  const chartData = useMemo(() => {
    if (!trend) return []

    const actualPoints = trend.actual || []
    const currentPoints = horizon === '2030' ? (trend.current_2030 || []) : (trend.current_2047 || [])
    const recommendedPoints = horizon === '2030' ? (trend.recommended_2030 || []) : (trend.recommended_2047 || [])

    const yearMap = {}

    // Populate actuals
    actualPoints.forEach((p) => {
      yearMap[p.fyNumeric] = {
        year: p.fyNumeric,
        name: p.fyLabel,
        actual: p.value,
        projected: null,
        recommended: null
      }
    })

    // Populate projected (currentTrend)
    currentPoints.forEach((p) => {
      if (yearMap[p.fyNumeric]) {
        yearMap[p.fyNumeric].projected = p.value
      } else {
        yearMap[p.fyNumeric] = {
          year: p.fyNumeric,
          name: p.fyLabel,
          actual: null,
          projected: p.value,
          recommended: null
        }
      }
    })

    // Populate recommended trend line
    recommendedPoints.forEach((p) => {
      if (yearMap[p.fyNumeric]) {
        yearMap[p.fyNumeric].recommended = p.value
      } else {
        yearMap[p.fyNumeric] = {
          year: p.fyNumeric,
          name: p.fyLabel,
          actual: null,
          projected: null,
          recommended: p.value
        }
      }
    })

    // Convert map to sorted array
    return Object.values(yearMap).sort((a, b) => a.year - b.year)
  }, [trend, horizon])

  if (!trend) {
    return (
      <div className="bg-surface-1 border border-surface-border rounded-xl p-6 shadow-2xs flex items-center justify-center h-full">
        <span className="text-xs text-ink-muted font-medium">
          Trend visualization is not available for this macro goal.
        </span>
      </div>
    )
  }

  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl p-4 shadow-2xs flex flex-col h-full overflow-hidden">
      {/* Header with title and expand button */}
      <div className="flex items-center justify-between gap-2 mb-2 border-b border-surface-2 pb-2 flex-shrink-0">
        <div className="min-w-0">
          <h3 className={`${isExpanded ? 'text-lg' : 'text-lg'} font-bold text-navy-800 uppercase tracking-wider`}>
            Trend Analysis for Target {horizon}
          </h3>
          <p className="text-[13px] text-ink-muted font-medium mt-0.5 truncate">
            Historical & projected values vs. required path to target
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Expand button */}
          {onExpandClick && (
            <button
              onClick={onExpandClick}
              className="p-1.5 rounded-lg border border-surface-border bg-surface-0 hover:bg-surface-2 text-ink-muted hover:text-navy-800 transition cursor-pointer"
              title="Expand chart"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Chart area */}
      <div 
        className={`flex-1 min-h-0 w-full ${onExpandClick && !isExpanded ? 'cursor-pointer' : ''}`}
        onClick={onExpandClick && !isExpanded ? onExpandClick : undefined}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 15, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-2)" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'var(--color-ink-muted)', fontSize: isExpanded ? 11 : 9, fontWeight: 500 }}
              axisLine={{ stroke: 'var(--color-surface-border)' }}
              tickLine={false}
              interval="preserveStartEnd"
              angle={isExpanded ? -45 : 0}
              textAnchor={isExpanded ? "end" : "middle"}
              height={isExpanded ? 55 : 30}
            />
            <YAxis 
              tick={{ fill: 'var(--color-ink-muted)', fontSize: isExpanded ? 11 : 9, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid var(--color-surface-border)'
              }}
              formatter={(value, name) => {
                return [value !== null && typeof value === 'number' ? value.toFixed(2) : value, name]
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={28}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink-body)' }}
            />
            
            {/* Actual History (Solid Grey) */}
            <Line 
              type="monotone" 
              dataKey="actual" 
              name="Actual"
              stroke="#6b7280" 
              strokeWidth={isExpanded ? 3 : 2} 
              dot={{ r: isExpanded ? 3 : 2, fill: '#6b7280' }}
              activeDot={{ r: isExpanded ? 5 : 4 }}
            >
              {/* <LabelList 
                dataKey="actual" 
                position="bottom" 
                offset={10}
                fill="var(--color-ink-body)"
                fontSize={isExpanded ? 14 : 12}
                fontWeight={600}
                formatter={(val) => (val !== null && val !== undefined ? val.toFixed(1) : '')}
              /> */}
              <LabelList
              dataKey="actual"
              fill="var(--color-ink-body)"
              fontSize={isExpanded ? 14 : 12}
              fontWeight={600}
              content={(props) => {
                const { x, y, value, index } = props;

                // Don't render anything if the value is missing
                if (value === null || value === undefined) return null;

                const formattedValue = value.toFixed(1);
                const isEven = index % 2 === 0;

                // Alternate the vertical offset (dy) 
                // Even indexes go above the dot (-15), Odd indexes go below (+22)
                const dy = isEven ? -18 : 18;

                return (
                  <text
                    x={x}
                    y={y}
                    dy={dy}
                    fill={props.fill}
                    fontSize={props.fontSize}
                    fontWeight={props.fontWeight}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {formattedValue}
                  </text>
                );
              }}
            />
            </Line>
            
            {/* Projected Extension (Dashed Blue) */}
            <Line 
              type="monotone" 
              dataKey="projected" 
              name="Current Trend"
              stroke="#2563eb" 
              strokeWidth={2} 
              strokeDasharray="4 4"
              dot={{ r: isExpanded ? 3 : 2, fill: '#2563eb' }}
              activeDot={{ r: isExpanded ? 5 : 4 }}
            />
            
            {/* Recommended Target Path (Dashed Orange) */}
            <Line 
              type="monotone" 
              dataKey="recommended" 
              name="Required Trend"
              stroke="#ea580c" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              dot={{ r: isExpanded ? 3 : 2, fill: '#ea580c' }}
              activeDot={{ r: isExpanded ? 5 : 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
