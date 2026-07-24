import React from 'react'
import { TrendingUp, ShieldCheck, Wallet, Table, BarChart3 } from 'lucide-react'

const STRATEGY_DATA = [
  {
    id: 'gsdp',
    title: 'GSDP (nominal)',
    subtitle: 'Gross State Domestic Product',
    badge: '13.5x Growth',
    icon: TrendingUp,
    iconBg: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
    current: '$0.259 Tn',
    target2030: '>$0.630 Tn',
    target2047: '>$3.5 Tn',
    growthNote: '+143% by 2030'
  },
  {
    id: 'mpi',
    title: 'Poverty Index (MPI)',
    subtitle: 'Multidimensional Poverty Index',
    badge: '80% Reduction',
    icon: ShieldCheck,
    iconBg: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    current: '0.05',
    target2030: '<0.03',
    target2047: '<0.01',
    growthNote: '-40% by 2030'
  },
  {
    id: 'pci',
    title: 'Per Capita Income',
    subtitle: 'Average State Income',
    badge: '10x Expansion',
    icon: Wallet,
    iconBg: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
    current: '$3,728',
    target2030: '>$9,000',
    target2047: '$38-43K',
    growthNote: '+141% by 2030'
  }
]

export default function StateVisionTable({ viewMode = 'vision', onViewChange }) {
  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl p-3.5 shadow-2xs flex flex-col h-full overflow-hidden">
      {/* Component Title Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-surface-2 flex-shrink-0">
        <h3 className="text-xs font-bold text-navy-800 uppercase tracking-wider truncate pr-1">
          State Vision & Strategy
        </h3>
        {onViewChange && (
          <div className="flex items-center bg-surface-2/80 p-0.5 rounded-lg border border-surface-border flex-shrink-0">
            <button
              onClick={() => onViewChange('vision')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'vision' ? 'bg-white text-navy-800 shadow-2xs' : 'text-ink-muted hover:text-navy-800'
              }`}
              title="View State Vision & Macro Strategy Table"
            >
              <Table className="w-3 h-3" />
              <span>Vision</span>
            </button>
            <button
              onClick={() => onViewChange('pillars')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'pillars' ? 'bg-white text-navy-800 shadow-2xs' : 'text-ink-muted hover:text-navy-800'
              }`}
              title="View Macro Goals by Pillar Chart"
            >
              <BarChart3 className="w-3 h-3" />
              <span>Pillars</span>
            </button>
          </div>
        )}
      </div>

      {/* Metric Rows Container */}
      <div className="flex-1 flex flex-col justify-between gap-2 min-h-0 overflow-y-auto pr-0.5">
        {STRATEGY_DATA.map((row) => {
          const Icon = row.icon
          return (
            <div
              key={row.id}
              className="bg-white border border-surface-border hover:border-navy-300 rounded-lg p-2 shadow-2xs transition duration-150 flex flex-col justify-between"
            >
              {/* Top Row: Icon + Title + Growth Badge */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1 rounded-md border flex-shrink-0 ${row.iconBg}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-navy-900 block leading-none truncate">
                      {row.title}
                    </span>
                    <span className="text-[9px] text-ink-muted leading-none block truncate mt-0.5">
                      {row.subtitle}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-navy-700 bg-surface-2 border border-surface-border px-1.5 py-0.5 rounded-md flex-shrink-0">
                  {row.badge}
                </span>
              </div>

              {/* Grid Values Row */}
              <div className="grid grid-cols-12 gap-1.5 items-center text-center bg-surface-0/60 border border-surface-border/60 rounded-md p-1.5">
                {/* Current Baseline */}
                <div className="col-span-4 text-left pl-1">
                  <span className="text-[9px] font-medium text-ink-muted uppercase block leading-none mb-0.5">
                    Current
                  </span>
                  <span className="text-xs font-bold text-navy-900 font-mono leading-none">
                    {row.current}
                  </span>
                </div>

                {/* Target 2030 */}
                <div className="col-span-4 text-center border-x border-surface-border/60 px-1">
                  <span className="text-[9px] font-medium text-navy-600/80 uppercase block leading-none mb-0.5">
                    2030 Target
                  </span>
                  <span className="text-xs font-bold text-navy-700 font-mono leading-none">
                    {row.target2030}
                  </span>
                </div>

                {/* Target 2047 */}
                <div className="col-span-4 text-right pr-1">
                  <span className="text-[9px] font-bold text-purple-600/90 uppercase block leading-none mb-0.5">
                    2047 Target
                  </span>
                  <span className="text-xs font-extrabold text-purple-700 font-mono leading-none">
                    {row.target2047}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
