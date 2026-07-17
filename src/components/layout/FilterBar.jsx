import React from 'react'
import { RotateCcw, Search, X } from 'lucide-react'
import { useFilterStore } from '../../context/FilterStore'

export default function FilterBar({ isOpen, onClose }) {
  const {
    pillar,
    theme,
    status2030,
    status2047,
    searchQuery,
    setPillar,
    setTheme,
    setStatus2030,
    setStatus2047,
    setSearchQuery,
    resetFilters,
    getPillars,
    getThemes,
    getStatuses2030,
    getStatuses2047
  } = useFilterStore()

  if (!isOpen) return null

  const pillars = getPillars()
  const themes = getThemes()
  const statuses2030 = getStatuses2030()
  const statuses2047 = getStatuses2047()

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-80 sm:w-96 max-w-full h-full bg-surface-1 border-l border-surface-border shadow-2xl flex flex-col p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-2 pb-4 mb-6">
          <span className="text-sm font-bold text-navy-800 tracking-wider uppercase">
            Dashboard Filters
          </span>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:bg-surface-2 hover:text-navy-800 transition cursor-pointer"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Keyword Search */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="keyword-search" className="text-xs font-bold text-ink-muted tracking-wider uppercase">
              Search Goal
            </label>
            <div className="relative">
              <input
                id="keyword-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search KPI / Code..."
                className="w-full bg-surface-0 border border-surface-border rounded-lg pl-8 pr-3 py-2 text-xs font-medium text-ink-body focus:border-navy-500 focus:ring-1 focus:ring-navy-500 outline-hidden transition"
              />
              <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Pillar Filter */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pillar-select" className="text-xs font-bold text-ink-muted tracking-wider uppercase">
              Pillar
            </label>
            <select
              id="pillar-select"
              value={pillar}
              onChange={(e) => setPillar(e.target.value)}
              className="w-full bg-surface-0 border border-surface-border rounded-lg px-3 py-2 text-xs font-medium text-ink-body focus:border-navy-500 focus:ring-1 focus:ring-navy-500 outline-hidden transition cursor-pointer"
            >
              {pillars.map((p) => (
                <option key={p} value={p}>
                  {p === 'All' ? 'All Pillars' : p}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Filter */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="theme-select" className="text-xs font-bold text-ink-muted tracking-wider uppercase">
              Theme Category
            </label>
            <select
              id="theme-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-surface-0 border border-surface-border rounded-lg px-3 py-2 text-xs font-medium text-ink-body focus:border-navy-500 focus:ring-1 focus:ring-navy-500 outline-hidden transition cursor-pointer"
            >
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Themes' : t}
                </option>
              ))}
            </select>
          </div>

          {/* Status 2030 Filter */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status2030-select" className="text-xs font-bold text-ink-muted tracking-wider uppercase">
              MG Status (2030)
            </label>
            <select
              id="status2030-select"
              value={status2030}
              onChange={(e) => setStatus2030(e.target.value)}
              className="w-full bg-surface-0 border border-surface-border rounded-lg px-3 py-2 text-xs font-medium text-ink-body focus:border-navy-500 focus:ring-1 focus:ring-navy-500 outline-hidden transition cursor-pointer"
            >
              {statuses2030.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : s.split(' (')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Status 2047 Filter */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status2047-select" className="text-xs font-bold text-ink-muted tracking-wider uppercase">
              MG Status (2047)
            </label>
            <select
              id="status2047-select"
              value={status2047}
              onChange={(e) => setStatus2047(e.target.value)}
              className="w-full bg-surface-0 border border-surface-border rounded-lg px-3 py-2 text-xs font-medium text-ink-body focus:border-navy-500 focus:ring-1 focus:ring-navy-500 outline-hidden transition cursor-pointer"
            >
              {statuses2047.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : s.split(' (')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-surface-2 pt-6 mt-8 flex flex-col gap-3">
          <button
            onClick={resetFilters}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-surface-border bg-surface-0 hover:bg-surface-2 text-ink-body hover:text-navy-800 text-xs font-semibold shadow-2xs hover:shadow-xs transition cursor-pointer active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Filters</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm cursor-pointer transition active:scale-98"
          >
            <span>Close Filters</span>
          </button>
        </div>
      </div>
    </div>
  )
}
