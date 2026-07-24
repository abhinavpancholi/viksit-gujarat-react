import React from 'react'
import { TrendingUp, ShieldCheck, Wallet, Compass } from 'lucide-react'

const STRATEGY_METRICS = [
  {
    id: 'gsdp',
    title: 'GSDP (nominal)',
    icon: TrendingUp,
    current: '$0.259 Tn',
    target2030: '>$0.630 Tn',
    target2047: '>$3.5 Tn',
    headerBg: 'bg-navy-800 text-white'
  },
  {
    id: 'mpi',
    title: 'Multidimensional Poverty Index',
    icon: ShieldCheck,
    current: '0.05',
    target2030: '<0.03',
    target2047: '<0.01',
    headerBg: 'bg-navy-800 text-white'
  },
  {
    id: 'pci',
    title: 'Per Capita Income',
    icon: Wallet,
    current: '$3,728',
    target2030: '>$9K',
    target2047: '$38-43K',
    headerBg: 'bg-navy-800 text-white'
  }
]

export default function StateVisionTable() {
  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl p-3.5 shadow-2xs flex flex-col h-full overflow-hidden">
      {/* Component Title Header */}
      <div className="flex items-center justify-between mb-2.5 border-b border-surface-2 pb-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-navy-600" />
          <h3 className="text-xs font-bold text-navy-800 uppercase tracking-wider">
            State Vision & Macro Strategy
          </h3>
        </div>
        <span className="text-[9px] font-bold text-navy-700 bg-navy-50 border border-navy-200/60 px-1.5 py-0.5 rounded-full uppercase">
          Vision @ 2047
        </span>
      </div>

      {/* Metric Blocks (Stacked Vertical Tabular Grid) */}
      <div className="flex-1 flex flex-col justify-between gap-2 min-h-0 overflow-y-auto pr-0.5">
        {STRATEGY_METRICS.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.id}
              className="border border-navy-900/15 rounded-lg overflow-hidden bg-white shadow-2xs flex flex-col"
            >
              {/* Metric Header Bar */}
              <div className="bg-navy-800 px-3 py-1 text-white flex items-center justify-between">
                <span className="text-xs font-bold tracking-tight text-white">{metric.title}</span>
                <Icon className="w-3.5 h-3.5 text-blue-200 opacity-90" />
              </div>

              {/* 3 Status Sub-Columns */}
              <div className="grid grid-cols-3 divide-x divide-surface-border text-center py-2 px-1 bg-surface-0/30">
                <div className="flex flex-col items-center justify-center px-1">
                  <span className="text-xs font-bold text-navy-900 font-mono tracking-tight">
                    {metric.current}
                  </span>
                  <span className="text-[9px] font-medium text-ink-muted leading-tight mt-0.5">
                    Current Status
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center px-1">
                  <span className="text-xs font-bold text-navy-700 font-mono tracking-tight">
                    {metric.target2030}
                  </span>
                  <span className="text-[9px] font-medium text-navy-600/80 leading-tight mt-0.5">
                    Target 2030
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center px-1 bg-purple-50/40 rounded-r-md">
                  <span className="text-xs font-extrabold text-purple-700 font-mono tracking-tight">
                    {metric.target2047}
                  </span>
                  <span className="text-[9px] font-bold text-purple-600/90 leading-tight mt-0.5">
                    Target 2047
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
