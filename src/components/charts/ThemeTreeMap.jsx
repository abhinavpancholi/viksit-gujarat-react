import React, { useMemo } from 'react'
import { Treemap, ResponsiveContainer } from 'recharts'

// Vibrant colors matching the user-supplied reference image
const THEME_COLORS = {
  'Agriculture, Irrigation and Rural Development': { fill: '#007bff', border: '#0056b3' },
  'Human Capital: Education and Skilling': { fill: '#0c2461', border: '#06133a' },
  'Nari Shakti: Women-led Development': { fill: '#8e24aa', border: '#5c007a' },
  'Art Culture and Sports': { fill: '#e91e63', border: '#b0003a' },
  'City Agglomerations: Vibrant Socio-Economic Epicenters': { fill: '#6c5ce7', border: '#3b3b98' },
  'Healthcare and Nutrition for all': { fill: '#d9534f', border: '#b52b27' },
  'Industries of the Future': { fill: '#28a745', border: '#1e7e34' },
  'Gujarat as Tourism Hub': { fill: '#f39c12', border: '#d35400' },
  'Transport and Logistics Infrastructure': { fill: '#138d75', border: '#0e6655' },
  'Services of the Future': { fill: '#17a2b8', border: '#117a8b' },
  'Governance 2.0: Reform, Perform and Transform': { fill: '#00a8ff', border: '#0084b3' }
}

const THEME_SHORT_NAMES = {
  'Agriculture, Irrigation and Rural Development': 'Agriculture, Irrigation and Rural Development',
  'Human Capital: Education and Skilling': 'Human Capital: Education and Skills',
  'Nari Shakti: Women-led Development': 'Nari Shakti: Women Empowerment',
  'Art Culture and Sports': 'Art, Culture and Tourism',
  'City Agglomerations: Vibrant Socio-Economic Epicenters': 'City Agglomeration',
  'Healthcare and Nutrition for all': 'Healthcare',
  'Industries of the Future': 'Industry and MSME',
  'Gujarat as Tourism Hub': 'Gujarat as Top Investment Destination',
  'Transport and Logistics Infrastructure': 'Transport and Logistics',
  'Services of the Future': 'Services of Future',
  'Governance 2.0: Reform, Perform and Transform': 'Governance Reforms'
}

const CustomizedContent = (props) => {
  const { x, y, width, height, name, count, color, borderColor, onSelectTheme, activeTheme } = props
  const isZero = count === 0
  const isSelected = activeTheme === name

  // Do not render labels if box is too small
  const showText = width > 50 && height > 35

  return (
    <g 
      onClick={() => {
        if (!isZero && onSelectTheme) {
          if (isSelected) {
            onSelectTheme('All')
          } else {
            onSelectTheme(name)
          }
        }
      }}
      className={isZero ? 'cursor-not-allowed opacity-30' : 'cursor-pointer group'}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isZero ? '#f3f4f6' : color}
        stroke={isSelected ? '#ffffff' : isZero ? '#dde3ee' : borderColor}
        strokeWidth={isSelected ? 3 : 1}
        rx={4}
        ry={4}
        className="transition-all duration-300 group-hover:brightness-95"
      />
      {showText && (
        <text
          x={x + 10}
          y={y + 24}
          fill={isZero ? '#8b93a3' : '#ffffff'}
          fontSize={10}
          fontWeight="bold"
          className="select-none pointer-events-none font-body"
        >
          {THEME_SHORT_NAMES[name] || name}
        </text>
      )}
      {showText && (
        <text
          x={x + 10}
          y={y + height - 12}
          fill={isZero ? '#8b93a3' : '#ffffff'}
          fontSize={20}
          fontWeight="bold"
          className="select-none pointer-events-none font-mono font-bold"
        >
          {count}
        </text>
      )}
      
      <title>{`${THEME_SHORT_NAMES[name] || name}: ${count} Macro Goals`}</title>
    </g>
  )
}

export default function ThemeTreeMap({ goals = [], activeTheme = 'All', onSelectTheme }) {
  // Aggregate data by theme
  const data = useMemo(() => {
    const themeCounts = goals.reduce((acc, goal) => {
      acc[goal.theme] = (acc[goal.theme] || 0) + 1
      return acc
    }, {})

    // Ensure all 11 themes are represented in the list
    return Object.keys(THEME_SHORT_NAMES).map((themeName) => {
      const count = themeCounts[themeName] || 0
      const colors = THEME_COLORS[themeName] || { fill: '#f3f4f6', border: '#dde3ee' }

      return {
        name: themeName,
        // Proportional sizing: if size is 0, give it a tiny fractional size so a small tile displays
        size: count === 0 ? 0.35 : count,
        count,
        color: colors.fill,
        borderColor: colors.border
      }
    })
  }, [goals])

  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-surface-2 pb-2">
        <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider">
          Number of Macro Goals by Theme (Tree Map)
        </h3>
        <span className="text-[10px] font-bold text-ink-muted bg-surface-0 border border-surface-border px-2 py-0.5 rounded-full uppercase tracking-wider">
          Click Active Tiles to Toggle Filter
        </span>
      </div>

      <div className="flex-1 min-h-[220px] w-full mt-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={data}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
            content={<CustomizedContent onSelectTheme={onSelectTheme} activeTheme={activeTheme} />}
            animationDuration={500}
          />
        </ResponsiveContainer>
      </div>
    </div>
  )
}
