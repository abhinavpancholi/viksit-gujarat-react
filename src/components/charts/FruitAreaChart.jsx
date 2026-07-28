import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

const THEME_CONFIGS = {
  area: {
    gradientId: 'areaPinkGrad',
    strokeColor: '#BE185D',
    stopColor1: '#EC4899',
    stopColor2: '#FCE7F3',
    fillOpacity: 0.6,
    valueFormatter: (val) => val >= 1000 ? (val).toLocaleString('en-IN') : Math.round(val).toString()
  },
  production: {
    gradientId: 'prodBlueGrad',
    strokeColor: '#1D4ED8',
    stopColor1: '#3B82F6',
    stopColor2: '#EFF6FF',
    fillOpacity: 0.5,
    valueFormatter: (val) => val >= 1000 ? Math.round(val).toLocaleString('en-IN') : val.toFixed(1)
  },
  yield: {
    gradientId: 'yieldAmberGrad',
    strokeColor: '#B45309',
    stopColor1: '#F59E0B',
    stopColor2: '#FEF3C7',
    fillOpacity: 0.55,
    valueFormatter: (val) => val.toFixed(2)
  }
}

// Custom top label for data point markers matching Power BI mockup
const CustomPointLabel = (props) => {
  const { x, y, value, formatter } = props
  if (value === undefined || value === null) return null
  const displayVal = formatter ? formatter(value) : value
  return (
    <text
      x={x}
      y={y - 8}
      fill="#1E293B"
      textAnchor="middle"
      className="font-mono-num text-[11px] font-extrabold"
    >
      {displayVal}
    </text>
  )
}

export default function FruitAreaChart({ title, yAxisLabel, data, dataKey, theme = 'area' }) {
  const config = THEME_CONFIGS[theme] || THEME_CONFIGS.area

  // Calculate domain min/max with padding
  const values = data.map(d => d[dataKey]).filter(v => v !== undefined && v !== null)
  const minVal = values.length > 0 ? Math.min(...values) : 0
  const maxVal = values.length > 0 ? Math.max(...values) : 100
  const yMin = Math.floor(minVal * 0.93)
  const yMax = Math.ceil(maxVal * 1.07)

  return (
    <div className="w-full h-full flex flex-col bg-white border border-surface-border rounded-xl p-3 shadow-xs min-h-[220px]">
      <h3 className="font-display text-sm font-bold text-navy-800 text-center mb-1">
        {title}
      </h3>

      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 22, right: 20, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.stopColor1} stopOpacity={0.65} />
                <stop offset="95%" stopColor={config.stopColor2} stopOpacity={0.15} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

            <XAxis
              dataKey="fy"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              label={{ value: 'FY', position: 'insideBottom', offset: -12, fill: '#64748B', fontSize: 10, fontWeight: 700 }}
            />

            <YAxis
              domain={[yMin, yMax]}
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => val >= 1000 ? `${Math.round(val / 1000)}K` : val}
              label={{ 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft', 
                offset: 10, 
                fill: '#64748B', 
                fontSize: 9, 
                fontWeight: 700 
              }}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value
                  return (
                    <div className="bg-navy-900/90 text-white rounded-lg px-2.5 py-1.5 text-xs shadow-md backdrop-blur-xs font-mono-num">
                      <p className="font-bold text-slate-300">{label}</p>
                      <p className="font-bold text-amber-400">
                        {val !== undefined ? val.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : 'N/A'}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />

            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={config.strokeColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${config.gradientId})`}
              dot={{ r: 4, fill: '#1E293B', stroke: config.strokeColor, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#FFFFFF', stroke: config.strokeColor, strokeWidth: 3 }}
              label={<CustomPointLabel formatter={config.valueFormatter} />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
