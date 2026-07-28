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
    fillOpacity: 0.65,
    tooltipLabel: 'Total Area (00 Ha)',
    valueFormatter: (val) => val >= 1000 ? Math.round(val).toLocaleString('en-IN') : Math.round(val).toString()
  },
  production: {
    gradientId: 'prodBlueGrad',
    strokeColor: '#1D4ED8',
    stopColor1: '#3B82F6',
    stopColor2: '#EFF6FF',
    fillOpacity: 0.55,
    tooltipLabel: 'Production in 00 Mt',
    valueFormatter: (val) => val >= 1000 ? Math.round(val).toLocaleString('en-IN') : val.toFixed(1)
  },
  yield: {
    gradientId: 'yieldAmberGrad',
    strokeColor: '#B45309',
    stopColor1: '#F59E0B',
    stopColor2: '#FEF3C7',
    fillOpacity: 0.6,
    tooltipLabel: 'Yield of fruits',
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
      y={y - 6}
      fill="#0F172A"
      textAnchor="middle"
      className="font-mono-num text-[10px] font-extrabold"
    >
      {displayVal}
    </text>
  )
}

export default function FruitAreaChart({ title, data, dataKey, theme = 'area' }) {
  const config = THEME_CONFIGS[theme] || THEME_CONFIGS.area

  // Calculate domain min/max with padding
  const values = data.map(d => d[dataKey]).filter(v => v !== undefined && v !== null)
  const minVal = values.length > 0 ? Math.min(...values) : 0
  const maxVal = values.length > 0 ? Math.max(...values) : 100
  const yMin = Math.floor(minVal * 0.94)
  const yMax = Math.ceil(maxVal * 1.06)

  return (
    <div className="w-full h-full flex flex-col bg-white border border-surface-border rounded-xl px-3 py-2 shadow-xs overflow-hidden">
      {/* Title */}
      <h3 className="font-display text-sm font-bold text-navy-900 text-center flex-shrink-0">
        {title}
      </h3>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 16, right: 14, left: -20, bottom: -4 }}
          >
            <defs>
              <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.stopColor1} stopOpacity={0.7} />
                <stop offset="95%" stopColor={config.stopColor2} stopOpacity={0.15} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

            <XAxis
              dataKey="fy"
              stroke="#64748B"
              fontSize={9}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              dy={2}
            />

            <YAxis
              domain={[yMin, yMax]}
              stroke="#64748B"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => val >= 1000 ? `${Math.round(val / 1000)}K` : val}
            />

            {/* Custom Tooltip Format: "<Label> : <Value>" */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value
                  const formattedVal = val !== undefined ? val.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : 'N/A'
                  return (
                    <div className="bg-white border border-slate-200 text-navy-900 rounded-lg px-2.5 py-1.5 text-xs shadow-xl font-mono-num">
                      <p className="font-bold text-slate-500 mb-0.5 text-[10px] uppercase tracking-wider">{label}</p>
                      <p className="font-bold text-navy-900 text-xs">
                        <span className="font-sans text-slate-600 font-semibold">{config.tooltipLabel} : </span>
                        <span className="text-navy-900 font-extrabold">{formattedVal}</span>
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
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${config.gradientId})`}
              dot={{ r: 3.5, fill: '#0F172A', stroke: config.strokeColor, strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: '#FFFFFF', stroke: config.strokeColor, strokeWidth: 2.5 }}
              label={<CustomPointLabel formatter={config.valueFormatter} />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
