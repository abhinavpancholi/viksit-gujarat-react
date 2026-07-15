import React from 'react'

const THEME_STYLES = {
  'Agriculture, Irrigation and Rural Development': {
    gradient: 'from-emerald-600/10 to-teal-600/15',
    border: 'border-emerald-600/25',
    text: 'text-emerald-800',
    countColor: 'text-emerald-900',
    shortName: 'Agriculture & Rural Dev.'
  },
  'Human Capital: Education and Skilling': {
    gradient: 'from-indigo-600/10 to-blue-600/15',
    border: 'border-indigo-600/25',
    text: 'text-indigo-800',
    countColor: 'text-indigo-900',
    shortName: 'Human Capital & Education'
  },
  'Nari Shakti: Women-led Development': {
    gradient: 'from-rose-600/10 to-pink-600/15',
    border: 'border-rose-600/25',
    text: 'text-rose-800',
    countColor: 'text-rose-900',
    shortName: 'Nari Shakti (Women-led)'
  },
  'Art Culture and Sports': {
    gradient: 'from-amber-600/10 to-saffron-600/15',
    border: 'border-saffron-600/25',
    text: 'text-saffron-600',
    countColor: 'text-saffron-800',
    shortName: 'Art, Culture & Sports'
  },
  'City Agglomeration': {
    gradient: 'from-cyan-600/10 to-sky-600/15',
    border: 'border-cyan-600/25',
    text: 'text-cyan-800',
    countColor: 'text-cyan-900',
    shortName: 'City Agglomeration'
  },
  'Healthcare and Nutrition for all': {
    gradient: 'from-green-600/10 to-emerald-600/15',
    border: 'border-green-600/25',
    text: 'text-green-800',
    countColor: 'text-green-900',
    shortName: 'Healthcare & Nutrition'
  },
  'Industry, MSME and Services': {
    gradient: 'from-blue-700/10 to-indigo-700/15',
    border: 'border-blue-700/25',
    text: 'text-blue-800',
    countColor: 'text-blue-900',
    shortName: 'Industry & MSME'
  },
  'Gujarat as Tourism Hub': {
    gradient: 'from-yellow-600/10 to-amber-600/15',
    border: 'border-amber-600/25',
    text: 'text-amber-800',
    countColor: 'text-amber-900',
    shortName: 'Gujarat Tourism'
  },
  'Transport and Logistics': {
    gradient: 'from-violet-600/10 to-fuchsia-600/15',
    border: 'border-violet-600/25',
    text: 'text-violet-800',
    countColor: 'text-violet-900',
    shortName: 'Transport & Logistics'
  },
  'Services of Future': {
    gradient: 'from-sky-600/10 to-teal-600/15',
    border: 'border-sky-600/25',
    text: 'text-sky-800',
    countColor: 'text-sky-900',
    shortName: 'Services of Future'
  },
  'Governance Reforms': {
    gradient: 'from-slate-600/10 to-zinc-600/15',
    border: 'border-slate-600/25',
    text: 'text-slate-800',
    countColor: 'text-slate-900',
    shortName: 'Governance Reforms'
  }
}

export default function ThemeTileGrid({ goals = [], onSelectTheme }) {
  // Compute counts for all themes based on filtered goals
  const themeCounts = goals.reduce((acc, goal) => {
    acc[goal.theme] = (acc[goal.theme] || 0) + 1
    return acc
  }, {})

  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs flex flex-col h-full">
      <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider mb-4 border-b border-surface-2 pb-2">
        Number of Macro Goals by Theme
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mt-2 flex-1">
        {Object.entries(THEME_STYLES).map(([themeKey, style]) => {
          const count = themeCounts[themeKey] || 0
          const isZero = count === 0

          return (
            <button
              key={themeKey}
              onClick={() => onSelectTheme && onSelectTheme(themeKey)}
              disabled={isZero}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all duration-300 ${
                isZero 
                  ? 'opacity-40 bg-surface-0 border-surface-border cursor-not-allowed' 
                  : `bg-gradient-to-br ${style.gradient} ${style.border} hover:shadow-2xs hover:-translate-y-0.5 cursor-pointer`
              }`}
            >
              <span className={`text-[11px] font-bold tracking-tight line-clamp-2 leading-tight ${isZero ? 'text-ink-muted' : style.text}`}>
                {style.shortName}
              </span>
              <span className={`text-xl font-bold font-mono-num mt-2 ${isZero ? 'text-ink-muted' : style.countColor}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
