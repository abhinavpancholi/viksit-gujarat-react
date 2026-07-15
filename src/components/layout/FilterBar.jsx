import React from 'react'
import { Filter, RotateCcw, Search } from 'lucide-react'
import { useFilterStore } from '../../context/FilterStore'

export default function FilterBar() {
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

  const pillars = getPillars()
  const themes = getThemes()
  const statuses2030 = getStatuses2030()
  const statuses2047 = getStatuses2047()

  return (
    <div className="bg-surface-1 border-b border-surface-border py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-4">
        {/* Top Header Filter Label */}
        <div className="flex items-center gap-2 text-navy-800 font-semibold text-sm border-b border-surface-2 pb-2">
          <Filter className="w-4 h-4 text-navy-600" />
          <span>DASHBOARD FILTERS</span>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
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

          {/* Reset Filters Button */}
          <div className="flex flex-col">
            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-surface-border bg-surface-0 hover:bg-surface-2 text-ink-body hover:text-navy-800 text-xs font-semibold shadow-2xs hover:shadow-xs transition cursor-pointer active:scale-98"
              title="Reset Filters to All"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
