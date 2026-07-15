import React from 'react'

export default function KpiCard({ title, value, icon: Icon, colorClass, borderClass }) {
  return (
    <div className={`bg-surface-1 border border-surface-border rounded-xl p-5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all duration-300 hover:-translate-y-0.5 group`}>
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
  )
}
