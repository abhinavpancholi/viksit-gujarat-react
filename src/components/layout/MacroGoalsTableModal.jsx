import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { X, Search, RotateCcw, ArrowUpRight, TrendingUp, TrendingDown, Table, ExternalLink, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFilterStore } from '../../context/FilterStore'
import { STATUS_STYLE_MAP } from '../../utils/statusCalculator'

const PILLAR_SHORT_NAMES = {
  'Thriving Economy - Earning Well': 'Economy',
  'Empowered Citizen - Living Well': 'Citizen',
  'Key Enablers': 'Enablers'
}

const PILLAR_BADGE_STYLES = {
  'Thriving Economy - Earning Well': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Empowered Citizen - Living Well': 'bg-blue-50 text-blue-700 border-blue-200',
  'Key Enablers': 'bg-purple-50 text-purple-700 border-purple-200'
}

export default function MacroGoalsTableModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { macroGoals } = useFilterStore()

  // Modal local search & filter state
  const [search, setSearch] = useState('')
  const [selectedPillar, setSelectedPillar] = useState('All')
  const [selectedTheme, setSelectedTheme] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [sortField, setSortField] = useState('mgCode')
  const [sortOrder, setSortOrder] = useState('asc')

  // Reset state on modal open
  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelectedPillar('All')
      setSelectedTheme('All')
      setSelectedStatus('All')
      setSortField('mgCode')
      setSortOrder('asc')
    }
  }, [isOpen])

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Derive unique lists for dropdown filters
  const pillarList = useMemo(() => {
    return Array.from(new Set(macroGoals.map((g) => g.pillar))).filter(Boolean)
  }, [macroGoals])

  const themeList = useMemo(() => {
    let filtered = macroGoals
    if (selectedPillar !== 'All') {
      filtered = filtered.filter((g) => g.pillar === selectedPillar)
    }
    return Array.from(new Set(filtered.map((g) => g.theme))).filter(Boolean)
  }, [macroGoals, selectedPillar])

  // Reset local filters
  const handleResetFilters = useCallback(() => {
    setSearch('')
    setSelectedPillar('All')
    setSelectedTheme('All')
    setSelectedStatus('All')
  }, [])

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Filtered & Sorted goals list
  const filteredGoals = useMemo(() => {
    let result = macroGoals.filter((g) => {
      // Search match
      if (search.trim() !== '') {
        const query = search.toLowerCase().trim()
        const matchesCode = g.mgCode?.toLowerCase().includes(query)
        const matchesName = g.macroGoal?.toLowerCase().includes(query)
        const matchesTheme = g.theme?.toLowerCase().includes(query)
        if (!matchesCode && !matchesName && !matchesTheme) return false
      }
      // Pillar match
      if (selectedPillar !== 'All' && g.pillar !== selectedPillar) return false
      // Theme match
      if (selectedTheme !== 'All' && g.theme !== selectedTheme) return false
      // Status match (checks 2030 status)
      if (selectedStatus !== 'All' && g.status2030 !== selectedStatus) return false

      return true
    })

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField] ?? ''
      let valB = b[sortField] ?? ''

      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [macroGoals, search, selectedPillar, selectedTheme, selectedStatus, sortField, sortOrder])

  // Summary KPI counts for footer
  const statusSummary = useMemo(() => {
    const counts = { onTrack: 0, slight: 0, atRisk: 0, critical: 0 }
    filteredGoals.forEach((g) => {
      if (g.status2030?.startsWith('On Track')) counts.onTrack++
      else if (g.status2030?.startsWith('Slightly')) counts.slight++
      else if (g.status2030?.startsWith('At Risk')) counts.atRisk++
      else if (g.status2030?.startsWith('Critical')) counts.critical++
    })
    return counts
  }, [filteredGoals])

  if (!isOpen) return null

  const hasActiveFilters = search !== '' || selectedPillar !== 'All' || selectedTheme !== 'All' || selectedStatus !== 'All'

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      {/* Modal Card */}
      <div className="bg-surface-1 border border-surface-border rounded-2xl shadow-2xl w-full max-w-7xl h-[88vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="flex-shrink-0 bg-navy-800 text-white px-5 py-3.5 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 text-white rounded-xl shadow-2xs">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Macro Goals Master Directory
                <span className="text-xs font-semibold px-2 py-0.5 bg-white/10 text-white border border-white/20 rounded-full">
                  {filteredGoals.length} Goals
                </span>
              </h2>
              <p className="text-xs text-white/60 leading-none mt-0.5">
                Complete state performance targets, baselines, and status trajectory across 2030 & 2047
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-ink-muted hover:text-navy-800 bg-surface-0 hover:bg-surface-2 border border-surface-border rounded-lg transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-ink-muted hover:text-navy-800 hover:bg-surface-2 rounded-lg transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="px-5 py-3 bg-surface-0 border-b border-surface-border grid grid-cols-12 gap-3 items-center flex-shrink-0">
          {/* Search Box */}
          <div className="col-span-12 sm:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search goal name, code (e.g. HM3)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-surface-border rounded-lg text-ink-body placeholder-ink-muted focus:outline-none focus:border-navy-500 transition shadow-2xs"
            />
          </div>

          {/* Pillar Filter Dropdown */}
          <div className="col-span-6 sm:col-span-3">
            <select
              value={selectedPillar}
              onChange={(e) => {
                setSelectedPillar(e.target.value)
                setSelectedTheme('All')
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-white border border-surface-border rounded-lg text-ink-body font-medium focus:outline-none focus:border-navy-500 cursor-pointer shadow-2xs"
            >
              <option value="All">All Pillars ({pillarList.length})</option>
              {pillarList.map((p) => (
                <option key={p} value={p}>
                  {PILLAR_SHORT_NAMES[p] || p}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Filter Dropdown */}
          <div className="col-span-6 sm:col-span-3">
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-white border border-surface-border rounded-lg text-ink-body font-medium focus:outline-none focus:border-navy-500 cursor-pointer shadow-2xs"
            >
              <option value="All">All Themes ({themeList.length})</option>
              {themeList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Status 2030 Filter */}
          <div className="col-span-12 sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-white border border-surface-border rounded-lg text-ink-body font-medium focus:outline-none focus:border-navy-500 cursor-pointer shadow-2xs"
            >
              <option value="All">All 2030 Statuses</option>
              <option value="On Track (gap ≤ 25%)">On Track</option>
              <option value="Slightly Off Track (gap ≤ 50%)">Slightly Off Track</option>
              <option value="At Risk (gap ≤ 75%)">At Risk</option>
              <option value="Critical (gap > 75%)">Critical</option>
            </select>
          </div>
        </div>

        {/* Scrollable Data Table Container */}
        <div className="flex-1 overflow-auto min-h-0 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 bg-navy-700 text-white border-b border-surface-border text-xs font-bold text-ink-muted uppercase tracking-wider select-none shadow-2xs">
                <th
                  onClick={() => handleSort('mgCode')}
                  className="py-2.5 px-4 cursor-pointer hover:text-blue-400 transition w-24"
                >
                  <div className="flex items-center gap-1">
                    <span>Code</span>
                    {sortField === 'mgCode' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('macroGoal')}
                  className="py-2.5 px-4 cursor-pointer hover:text-blue-400 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Macro Goal</span>
                    {sortField === 'macroGoal' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('pillar')}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-400 transition w-32"
                >
                  <div className="flex items-center gap-1">
                    <span>Pillar</span>
                    {sortField === 'pillar' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('theme')}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-400 transition hidden lg:table-cell"
                >
                  <div className="flex items-center gap-1">
                    <span>Theme</span>
                    {sortField === 'theme' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('baseline')}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-400 transition text-right w-24"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Baseline</span>
                    {sortField === 'baseline' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('target2030')}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-400 transition text-center w-36"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Target 2030</span>
                    {sortField === 'target2030' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('target2047')}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-400 transition text-center w-36"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Target 2047</span>
                    {sortField === 'target2047' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>

                <th className="py-2.5 px-4 text-center w-24 font-bold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-surface-2/70 text-xs">
              {filteredGoals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-ink-muted">
                    <p className="font-semibold text-sm">No macro goals found matching your search filters.</p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-2 text-navy-600 font-bold underline cursor-pointer hover:text-navy-800"
                    >
                      Clear all search filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredGoals.map((goal) => {
                  const style2030 = STATUS_STYLE_MAP[goal.status2030] || { bg: 'bg-surface-0', text: 'text-ink-muted', label: goal.status2030 }
                  const style2047 = STATUS_STYLE_MAP[goal.status2047] || { bg: 'bg-surface-0', text: 'text-ink-muted', label: goal.status2047 }
                  const pillarBadge = PILLAR_BADGE_STYLES[goal.pillar] || 'bg-surface-0 text-ink-muted border-surface-border'

                  return (
                    <tr
                      key={goal.mgCode}
                      className="hover:bg-gray-300 cursor-pointer transition duration-50 group"
                    >
                      {/* Code */}
                      <td className="py-2.5 px-4 font-mono font-bold text-navy-700 flex-shrink-0">
                        <span className="bg-navy-50 border border-navy-200/60 px-1.5 py-0.5 rounded-md text-[11px]">
                          {goal.mgCode}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="py-2.5 px-4 font-semibold text-ink-body group-hover:text-navy-800 transition">
                        <div className="flex items-center gap-1.5">
                          {goal.direction === 'UP' ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          )}
                          <span className="line-clamp-2 leading-snug">{goal.macroGoal}</span>
                        </div>
                      </td>

                      {/* Pillar */}
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold border rounded-md truncate max-w-[120px] ${pillarBadge}`}>
                          {PILLAR_SHORT_NAMES[goal.pillar] || goal.pillar}
                        </span>
                      </td>

                      {/* Theme */}
                      <td className="py-2.5 px-3 text-ink-muted font-medium hidden lg:table-cell">
                        <span className="line-clamp-1">{goal.theme}</span>
                      </td>

                      {/* Baseline */}
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-navy-900">
                        {goal.baseline !== null && goal.baseline !== undefined ? goal.baseline : 'N/A'}
                      </td>

                      {/* Target 2030 + Status */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-mono font-bold text-navy-800">
                            {goal.target2030 !== null ? goal.target2030 : 'N/A'}
                          </span>
                          <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-md border ${style2030.bg} ${style2030.text} ${style2030.border || 'border-transparent'}`}>
                            {style2030.label}
                          </span>
                        </div>
                      </td>

                      {/* Target 2047 + Status */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-mono font-bold text-purple-800">
                            {goal.target2047 !== null ? goal.target2047 : 'N/A'}
                          </span>
                          <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-md border ${style2047.bg} ${style2047.text} ${style2047.border || 'border-transparent'}`}>
                            {style2047.label}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onClose()
                            navigate(`/v2/goal/${goal.mgCode}`)
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-navy-700 hover:text-white bg-navy-50 hover:bg-navy-800 border border-navy-200/60 rounded-md transition cursor-pointer group-hover:bg-navy-800 group-hover:text-white"
                        >
                          <span>View</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer Summary */}
        <div className="px-5 py-2.5 border-t border-surface-border bg-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 flex-shrink-0 text-xs">
          <div className="flex items-center gap-3 font-semibold text-ink-muted text-s">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {statusSummary.onTrack} On Track
            </span>
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {statusSummary.slight} Slightly Off
            </span>
            <span className="flex items-center gap-1 text-orange-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              {statusSummary.atRisk} At Risk
            </span>
            <span className="flex items-center gap-1 text-rose-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {statusSummary.critical} Critical
            </span>
          </div>

          <span className="text-ink-muted font-medium text-[11px]">
            Showing <strong className="text-navy-800">{filteredGoals.length}</strong> of {macroGoals.length} Macro Goals
          </span>
        </div>
      </div>
    </div>
  )
}
