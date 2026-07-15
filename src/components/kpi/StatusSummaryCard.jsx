import React from 'react'

const STATUS_METADATA = {
  'On Track (gap ≤ 25%)': {
    label: 'On Track',
    sub: 'gap ≤ 25%',
    bgClass: 'bg-status-ontrack-soft/50',
    borderClass: 'border-status-ontrack/35',
    textClass: 'text-status-ontrack',
    badgeClass: 'bg-status-ontrack text-white'
  },
  'Slightly Off Track (gap ≤ 50%)': {
    label: 'Slightly Off Track',
    sub: 'gap ≤ 50%',
    bgClass: 'bg-status-slight-soft/50',
    borderClass: 'border-status-slight/35',
    textClass: 'text-status-slight',
    badgeClass: 'bg-status-slight text-white'
  },
  'At Risk (gap ≤ 75%)': {
    label: 'At Risk',
    sub: 'gap ≤ 75%',
    bgClass: 'bg-status-atrisk-soft/50',
    borderClass: 'border-status-atrisk/35',
    textClass: 'text-status-atrisk',
    badgeClass: 'bg-status-atrisk text-white'
  },
  'Critical (gap > 75%)': {
    label: 'Critical / Behind',
    sub: 'gap > 75%',
    bgClass: 'bg-status-critical-soft/50',
    borderClass: 'border-status-critical/35',
    textClass: 'text-status-critical',
    badgeClass: 'bg-status-critical text-white'
  }
}

const PILLAR_SHORT_MAP = {
  'Thriving Economy - Earning Well': 'Economy',
  'Empowered Citizen - Living Well': 'Citizen',
  'Key Enablers': 'Enablers'
}

export default function StatusSummaryCard({ goals = [] }) {
  const { counts, goalsByStatus } = React.useMemo(() => {
    const listMap = {
      'On Track (gap ≤ 25%)': [],
      'Slightly Off Track (gap ≤ 50%)': [],
      'At Risk (gap ≤ 75%)': [],
      'Critical (gap > 75%)': []
    }
    const countsMap = {
      'On Track (gap ≤ 25%)': 0,
      'Slightly Off Track (gap ≤ 50%)': 0,
      'At Risk (gap ≤ 75%)': 0,
      'Critical (gap > 75%)': 0
    }

    goals.forEach(goal => {
      const statusKey = goal.status2030
      if (listMap[statusKey]) {
        listMap[statusKey].push(goal)
        countsMap[statusKey]++
      }
    })

    return { counts: countsMap, goalsByStatus: listMap }
  }, [goals])

  const total = goals.length

  // Ensure all 4 statuses are represented even if they have 0 counts
  const statuses = Object.keys(STATUS_METADATA)

  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs h-full">
      <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider mb-4 border-b border-surface-2 pb-2">
        Macro Goals Status Summary
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statuses.map((statusKey) => {
          const count = counts[statusKey] || 0
          const meta = STATUS_METADATA[statusKey]
          const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
          const statusGoalsList = goalsByStatus[statusKey] || []

          return (
            <div key={statusKey} className="relative group/status">
              <div 
                className={`p-4 rounded-xl border ${meta.borderClass} ${meta.bgClass} flex flex-col justify-between transition-all duration-300 hover:shadow-2xs cursor-help h-full`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${meta.textClass} tracking-wide`}>
                      {meta.label}
                    </span>
                    <span className="text-[10px] font-medium text-ink-muted bg-surface-1 px-1.5 py-0.5 rounded-sm border border-surface-border">
                      {meta.sub}
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono-num text-navy-800 mt-2">
                    {count}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="w-full bg-surface-2 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-1.5 rounded-full" 
                      style={{ 
                        width: `${pct}%`,
                        backgroundColor: `var(--color-status-${statusKey.includes('On Track') ? 'ontrack' : statusKey.includes('Slightly') ? 'slight' : statusKey.includes('At Risk') ? 'atrisk' : 'critical'})`
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-bold font-mono-num text-ink-body w-10 text-right">
                    {pct}%
                  </span>
                </div>
              </div>

              {statusGoalsList.length > 0 && (
                <div className="absolute top-full left-0 z-50 mt-2 hidden group-hover/status:block w-[420px] bg-surface-1 border border-surface-border rounded-xl shadow-lg max-h-64 overflow-y-auto select-none">
                  <div className="p-2.5 border-b border-surface-border bg-surface-0 rounded-t-xl sticky top-0 z-20">
                    <p className="text-[10px] font-bold text-navy-800 uppercase tracking-wider">
                      Goals in this Status ({statusGoalsList.length})
                    </p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[10px] table-fixed">
                      <thead className="sticky top-[33px] bg-surface-1 border-b border-surface-border text-navy-800 font-bold uppercase tracking-wider z-10 shadow-2xs">
                        <tr>
                          <th className="py-2 px-3 w-20 text-center">Code</th>
                          <th className="py-2 px-3">Goal description</th>
                          <th className="py-2 px-3 w-24">Pillar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-2 text-ink-body font-semibold">
                        {statusGoalsList.map((g) => (
                          <tr key={g.mgCode} className="hover:bg-surface-0 transition">
                            <td className="py-2 px-3 font-mono font-bold text-navy-800 text-center">
                              {g.mgCode}
                            </td>
                            <td className="py-2 px-3 truncate" title={g.macroGoal}>
                              {g.macroGoal}
                            </td>
                            <td className="py-2 px-3 text-ink-muted truncate" title={g.pillar}>
                              {PILLAR_SHORT_MAP[g.pillar] || g.pillar || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
