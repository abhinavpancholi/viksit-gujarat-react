import React from 'react'

const PILLAR_SHORT_MAP = {
  'Thriving Economy - Earning Well': 'Economy',
  'Empowered Citizen - Living Well': 'Citizen',
  'Key Enablers': 'Enablers'
}

/**
 * tooltipMode:
 *   'pillars'  — string list (No. / Name)
 *   'themes'   — object list: Pillar | Theme name  (no Code)
 *   'goals'    — object list: Pillar | Theme | Macro Goal  (no Code)
 *   default    — legacy: Code | Macro Goal | Pillar
 */
export default function KpiCard({ title, value, icon: Icon, colorClass, borderClass, tooltipItems, tooltipMode }) {
  const isStringList = tooltipItems && tooltipItems.length > 0 && typeof tooltipItems[0] === 'string'

  return (
    <div className="relative group">
      {/* KPI Card */}
      <div className={`bg-surface-1 border border-surface-border rounded-xl p-5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all duration-300 hover:-translate-y-0.5 cursor-help`}>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-ink-muted tracking-wider uppercase">
            {title}
          </span>
          <span className="text-3xl font-bold font-mono-num text-navy-800 tracking-tight">
            {value}
          </span>
        </div>
        <div className={`p-3 rounded-xl ${colorClass} ${borderClass} border transition-all duration-300 group-hover:scale-105`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Tooltip */}
      {tooltipItems && tooltipItems.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-2 hidden group-hover:block w-[400px] bg-surface-1 border border-surface-border rounded-xl shadow-lg max-h-72 overflow-y-auto select-none">
          {/* Header */}
          <div className="p-2.5 border-b border-surface-border bg-surface-0 rounded-t-xl sticky top-0 z-20">
            <p className="text-[10px] font-bold text-navy-800 uppercase tracking-wider">
              {title} ({tooltipItems.length})
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10px] table-fixed">

              {/* ── Pillars: string list ─────────────────────────────── */}
              {isStringList && (
                <>
                  <thead className="sticky top-[3px] bg-surface-1 border-b border-surface-border text-navy-800 font-bold uppercase tracking-wider z-10 shadow-2xs">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center">#</th>
                      <th className="py-2 px-3">Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-2 text-ink-body font-semibold">
                    {tooltipItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-0 transition">
                        <td className="py-2 px-3 font-mono-num font-bold text-navy-600 text-center">{idx + 1}</td>
                        <td className="py-2 px-3 truncate" title={item}>{item}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* ── Themes: Pillar | Theme (no Code) ─────────────────── */}
              {!isStringList && tooltipMode === 'themes' && (
                <>
                  <thead className="sticky top-[3px] bg-surface-1 border-b border-surface-border text-navy-800 font-bold uppercase tracking-wider z-10 shadow-2xs">
                    <tr>
                      <th className="py-2 px-3 w-24">Pillar</th>
                      <th className="py-2 px-3">Theme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-2 text-ink-body font-semibold">
                    {tooltipItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-0 transition">
                        <td className="py-2 px-3 text-ink-muted truncate" title={item.pillar}>
                          {PILLAR_SHORT_MAP[item.pillar] || item.pillar || 'N/A'}
                        </td>
                        <td className="py-2 px-3 truncate" title={item.name}>{item.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* ── Goals / Near Achievement: Pillar | Theme | Goal ──── */}
              {!isStringList && (tooltipMode === 'goals' || tooltipMode === 'near') && (
                <>
                  <thead className="sticky top-[3px] bg-surface-1 border-b border-surface-border text-navy-800 font-bold uppercase tracking-wider z-10 shadow-2xs">
                    <tr>
                      <th className="py-2 px-3 w-20">Pillar</th>
                      <th className="py-2 px-3 w-24">Theme</th>
                      <th className="py-2 px-3">Macro Goal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-2 text-ink-body font-semibold">
                    {tooltipItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-0 transition">
                        <td className="py-2 px-3 text-ink-muted truncate" title={item.pillar}>
                          {PILLAR_SHORT_MAP[item.pillar] || item.pillar || 'N/A'}
                        </td>
                        <td className="py-2 px-3 text-ink-muted truncate" title={item.theme || item.pillar}>
                          {item.theme || '—'}
                        </td>
                        <td className="py-2 px-3 truncate" title={item.name}>{item.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* ── Legacy fallback: Code | Macro Goal | Pillar ──────── */}
              {!isStringList && !tooltipMode && (
                <>
                  <thead className="sticky top-[3px] bg-surface-1 border-b border-surface-border text-navy-800 font-bold uppercase tracking-wider z-10 shadow-2xs">
                    <tr>
                      <th className="py-2 px-3 w-16 text-center">Code</th>
                      <th className="py-2 px-3">Macro Goal</th>
                      <th className="py-2 px-3 w-24">Pillar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-2 text-ink-body font-semibold">
                    {tooltipItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-0 transition">
                        <td className="py-2 px-3 font-mono font-bold text-navy-800 text-center">{item.code || `ID-${idx + 1}`}</td>
                        <td className="py-2 px-3 truncate" title={item.name}>{item.name}</td>
                        <td className="py-2 px-3 text-ink-muted truncate" title={item.pillar}>
                          {PILLAR_SHORT_MAP[item.pillar] || item.pillar || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

            </table>
          </div>
        </div>
      )}
    </div>
  )
}
