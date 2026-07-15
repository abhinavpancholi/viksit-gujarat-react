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

export default function StatusSummaryCard({ counts = {} }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  // Ensure all 4 statuses are represented even if they have 0 counts
  const statuses = Object.keys(STATUS_METADATA)

  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs">
      <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider mb-4 border-b border-surface-2 pb-2">
        Macro Goals Status Summary
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statuses.map((statusKey) => {
          const count = counts[statusKey] || 0
          const meta = STATUS_METADATA[statusKey]
          const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'

          return (
            <div 
              key={statusKey}
              className={`p-4 rounded-xl border ${meta.borderClass} ${meta.bgClass} flex flex-col justify-between transition-all duration-300 hover:shadow-2xs`}
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
          )
        })}
      </div>
    </div>
  )
}
