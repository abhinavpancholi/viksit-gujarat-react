import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

const PILLAR_SHORT_MAP = {
  'Thriving Economy - Earning Well': 'Economy',
  'Empowered Citizen - Living Well': 'Citizen',
  'Key Enablers': 'Enablers'
}

const BADGE_CLASSES = {
  'On Track (gap ≤ 25%)': 'bg-status-ontrack-soft text-status-ontrack border-status-ontrack/20',
  'Slightly Off Track (gap ≤ 50%)': 'bg-status-slight-soft text-status-slight border-status-slight/20',
  'At Risk (gap ≤ 75%)': 'bg-status-atrisk-soft text-status-atrisk border-status-atrisk/20',
  'Critical (gap > 75%)': 'bg-status-critical-soft text-status-critical border-status-critical/20'
}

export default function AtRiskTable({ goals = [] }) {
  const navigate = useNavigate()

  // Filter to At Risk / Critical and sort by gap ratio descending
  const tableData = goals
    .filter(g => g.status2030.startsWith('Critical') || g.status2030.startsWith('At Risk'))
    .sort((a, b) => (b.gap2030Ratio || 0) - (a.gap2030Ratio || 0))
    .slice(0, 10)

  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs flex flex-col" style={{ height: 440 }}>
      <div className="flex items-center justify-between mb-4 border-b border-surface-2 pb-2">
        <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider">
          Top 10 Macro Goals at Risk / Critical
        </h3>
        <span className="text-[10px] font-bold text-ink-muted bg-surface-0 border border-surface-border px-2 py-0.5 rounded-full uppercase tracking-wider">
          2030 Horizon
        </span>
      </div>

      <div className="flex-1 overflow-x-auto min-h-[250px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-border text-[10px] font-bold text-ink-muted uppercase tracking-wider select-none">
              <th className="py-2.5 pr-4 font-bold">Macro Goal</th>
              <th className="py-2.5 px-3 font-bold hidden sm:table-cell">Pillar</th>
              <th className="py-2.5 px-3 font-bold text-right">Gap %</th>
              <th className="py-2.5 pl-3 font-bold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-2/60">
            {tableData.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-xs text-ink-muted font-medium">
                  No critical or at-risk goals match the current filters.
                </td>
              </tr>
            ) : (
              tableData.map((goal) => {
                const badgeStyle = BADGE_CLASSES[goal.status2030] || 'bg-surface-0 text-ink-muted'
                const statusLabel = goal.status2030.split(' (')[0]
                const gapPercent = goal.gap2030Ratio !== null 
                  ? `${(goal.gap2030Ratio * 100).toFixed(0)}%` 
                  : 'N/A'

                return (
                  <tr 
                    key={goal.mgCode}
                    onClick={() => navigate(`/goal/${goal.mgCode}`)}
                    className="hover:bg-surface-0 cursor-pointer transition duration-150 group"
                  >
                    <td className="py-3 pr-4 text-xs font-semibold text-ink-body group-hover:text-navy-800 transition">
                      <div className="flex items-center gap-1.5 align-middle">
                        {/* <span className="font-mono text-[10px] font-bold text-navy-600 bg-surface-2 px-1 rounded-sm flex-shrink-0">
                          {goal.mgCode}
                        </span> */}
                        <span className="line-clamp-2 leading-tight">
                          {goal.macroGoal}
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-ink-faint group-hover:text-navy-500 opacity-0 group-hover:opacity-100 transition flex-shrink-0 ml-auto" />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs text-ink-muted hidden sm:table-cell font-medium">
                      {PILLAR_SHORT_MAP[goal.pillar] || goal.pillar}
                    </td>
                    <td className="py-3 px-3 text-xs text-right font-mono-num font-bold text-navy-800">
                      {gapPercent}
                    </td>
                    <td className="py-3 pl-3 text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold rounded-md border ${badgeStyle}`}>
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
