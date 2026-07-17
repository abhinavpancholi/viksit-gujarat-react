import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { X, RotateCcw, ChevronRight, Layers, Target, Building2, Inbox, Sparkles, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFilterStore } from '../../context/FilterStore'
import { STATUS_STYLE_MAP } from '../../utils/statusCalculator'

// Pillar accent colors for visual differentiation
const PILLAR_ACCENTS = {
  'Empowered Citizen - Living Well': { gradient: 'from-blue-500 to-indigo-500', soft: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', icon: '🏛️' },
  'Thriving Economy - Earning Well': { gradient: 'from-emerald-500 to-teal-500', soft: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: '📈' },
  'Key Enablers':                     { gradient: 'from-violet-500 to-purple-500', soft: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', icon: '⚙️' }
}

const DEFAULT_ACCENT = { gradient: 'from-slate-500 to-slate-400', soft: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-500', icon: '📊' }

export default function HierarchyModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { macroGoals } = useFilterStore()

  // Local-only selection state — fully isolated from global filters
  const [selectedPillar, setSelectedPillar] = useState(null)
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [confirmGoal, setConfirmGoal] = useState(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPillar(null)
      setSelectedTheme(null)
      setConfirmGoal(null)
    }
  }, [isOpen])

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Build the Pillar → Theme → Goals tree from data
  const hierarchy = useMemo(() => {
    const tree = {}
    macroGoals.forEach((g) => {
      if (!tree[g.pillar]) tree[g.pillar] = {}
      if (!tree[g.pillar][g.theme]) tree[g.pillar][g.theme] = []
      tree[g.pillar][g.theme].push(g)
    })
    return tree
  }, [macroGoals])

  // Derived lists
  const pillars = useMemo(() => {
    return Object.entries(hierarchy).map(([name, themes]) => ({
      name,
      themeCount: Object.keys(themes).length,
      goalCount: Object.values(themes).reduce((sum, goals) => sum + goals.length, 0)
    }))
  }, [hierarchy])

  const themes = useMemo(() => {
    if (!selectedPillar || !hierarchy[selectedPillar]) return []
    return Object.entries(hierarchy[selectedPillar]).map(([name, goals]) => ({
      name,
      goalCount: goals.length,
      // Summary of statuses for the theme badge
      statusCounts: goals.reduce((acc, g) => {
        const key = g.status2030
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
    }))
  }, [hierarchy, selectedPillar])

  const goals = useMemo(() => {
    if (!selectedPillar || !selectedTheme || !hierarchy[selectedPillar]?.[selectedTheme]) return []
    return hierarchy[selectedPillar][selectedTheme]
  }, [hierarchy, selectedPillar, selectedTheme])

  const handleReset = useCallback(() => {
    setSelectedPillar(null)
    setSelectedTheme(null)
  }, [])

  const handlePillarClick = useCallback((pillarName) => {
    setSelectedPillar(pillarName)
    setSelectedTheme(null)
  }, [])

  if (!isOpen) return null

  // Breadcrumb segments
  const breadcrumb = ['All Pillars']
  if (selectedPillar) breadcrumb.push(selectedPillar)
  if (selectedTheme) breadcrumb.push(selectedTheme)

  const activePillarAccent = selectedPillar ? (PILLAR_ACCENTS[selectedPillar] || DEFAULT_ACCENT) : null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-800/40 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'hmFadeIn 150ms ease-out' }}
      />

      {/* Modal */}
      <div
        className="relative w-[88vw] max-w-[1440px] h-[85vh] bg-surface-1 rounded-2xl shadow-2xl border border-surface-border flex flex-col overflow-hidden"
        style={{ animation: 'hmScaleIn 200ms ease-out' }}
      >
        {/* ─── HEADER ─── */}
        <div className="flex-shrink-0 bg-navy-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold tracking-wide">Explore Hierarchy</h2>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1 mt-0.5 text-xs font-medium text-white/60">
                {breadcrumb.map((seg, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <ChevronRight className="w-2.5 h-2.5 text-white/30 flex-shrink-0" />}
                    <span className={`truncate ${i === breadcrumb.length - 1 ? 'text-white/90' : 'text-white/50'}`}>
                      {seg}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Reset */}
            {selectedPillar && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-bold transition cursor-pointer"
                title="Reset to All Pillars"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── THREE-COLUMN BODY ─── */}
        <div className="flex-1 min-h-0 grid grid-cols-12 divide-x divide-surface-border">

          {/* ── Column 1: Pillars ── */}
          <div className="col-span-2 flex flex-col min-h-0">
            <div className="flex-shrink-0 px-3 py-2.5 border-b border-surface-2 bg-surface-0/50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-navy-500" />
                <span className="text-xs font-bold text-navy-800 uppercase tracking-wider">Pillars</span>
              </div>
              <span className="text-[10px] font-bold font-mono-num text-ink-muted bg-surface-2 px-2 py-0.5 rounded-full">
                {pillars.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {pillars.map((p) => {
                const isActive = selectedPillar === p.name
                const accent = PILLAR_ACCENTS[p.name] || DEFAULT_ACCENT
                return (
                  <button
                    key={p.name}
                    onClick={() => handlePillarClick(p.name)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl transition cursor-pointer group ${
                      isActive
                        ? `${accent.soft} ring-1 ring-inset ${accent.text.replace('text-', 'ring-')}/20 shadow-sm`
                        : 'hover:bg-surface-0 active:bg-surface-2'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Icon */}
                      <span className="text-xl flex-shrink-0">{accent.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold leading-snug ${isActive ? accent.text : 'text-ink-body group-hover:text-navy-800'}`}>
                          {p.name}
                        </p>
                        <p className="text-[10px] text-ink-muted font-medium mt-0.5">
                          {p.themeCount} themes · {p.goalCount} goals
                        </p>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition ${
                        isActive ? accent.text : 'text-surface-border group-hover:text-ink-muted'
                      }`} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Column 2: Themes ── */}
          <div className="col-span-3 flex flex-col min-h-0">
            <div className="flex-shrink-0 px-4 py-2.5 border-b border-surface-2 bg-surface-0/50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-navy-500" />
                <span className="text-xs font-bold text-navy-800 uppercase tracking-wider">Themes</span>
              </div>
              {themes.length > 0 && (
                <span className="text-[10px] font-bold font-mono-num text-ink-muted bg-surface-2 px-2 py-0.5 rounded-full">
                  {themes.length}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2 min-h-0">
              {!selectedPillar ? (
                <EmptyState icon={Layers} text="Select a pillar to see its themes" />
              ) : themes.length === 0 ? (
                <EmptyState icon={Inbox} text="No themes found under this pillar" />
              ) : (
                <div className="space-y-1">
                  {themes.map((t) => {
                    const isActive = selectedTheme === t.name
                    return (
                      <button
                        key={t.name}
                        onClick={() => setSelectedTheme(t.name)}
                        className={`w-full text-left px-3.5 py-3 rounded-xl transition cursor-pointer group ${
                          isActive
                            ? 'bg-navy-50 ring-1 ring-inset ring-navy-200 shadow-sm'
                            : 'hover:bg-surface-0 active:bg-surface-2'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Accent bar */}
                          <div className={`w-1 h-full min-h-[28px] rounded-full mt-0.5 flex-shrink-0 ${
                            isActive ? (activePillarAccent?.dot || 'bg-navy-500') : 'bg-surface-border group-hover:bg-navy-300'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold leading-snug ${isActive ? 'text-navy-800' : 'text-ink-body group-hover:text-navy-800'}`}>
                              {t.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-semibold text-ink-muted">
                                {t.goalCount} macro goals
                              </span>
                              {/* Mini status dots */}
                              <div className="flex items-center gap-0.5">
                                {Object.entries(t.statusCounts).map(([status, count]) => {
                                  const style = STATUS_STYLE_MAP[status]
                                  return style ? (
                                    <span
                                      key={status}
                                      className="w-2 h-2 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: style.color }}
                                      title={`${style.label}: ${count}`}
                                    />
                                  ) : null
                                })}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 transition ${
                            isActive ? 'text-navy-500' : 'text-surface-border group-hover:text-ink-muted'
                          }`} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Column 3: Macro Goals ── */}
          <div className="col-span-7 flex flex-col min-h-0">
            <div className="flex-shrink-0 px-4 py-2.5 border-b border-surface-2 bg-surface-0/50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-navy-500" />
                <span className="text-xs font-bold text-navy-800 uppercase tracking-wider">Macro Goals</span>
              </div>
              {goals.length > 0 && (
                <span className="text-[10px] font-bold font-mono-num text-ink-muted bg-surface-2 px-2 py-0.5 rounded-full">
                  {goals.length}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2 min-h-0">
              {!selectedTheme ? (
                <EmptyState icon={Target} text="Select a theme to see its macro goals" />
              ) : goals.length === 0 ? (
                <EmptyState icon={Inbox} text="No macro goals found under this theme" />
              ) : (
                <div className="space-y-1.5">
                  {goals.map((g) => {
                    const style2030 = STATUS_STYLE_MAP[g.status2030] || {}
                    const style2047 = STATUS_STYLE_MAP[g.status2047] || {}
                    return (
                      <div
                        key={g.mgCode}
                        onClick={() => setConfirmGoal(g)}
                        className="bg-surface-0 border border-surface-border rounded-xl p-4 hover:shadow-md hover:border-navy-300 transition group cursor-pointer"
                      >
                        {/* Header: Code + Name */}
                        <div className="flex items-start gap-2.5 mb-2.5">
                          <span className="font-mono text-[10px] font-bold text-navy-800 bg-navy-800/5 px-2 py-0.5 rounded-md border border-navy-800/10 flex-shrink-0 mt-0.5">
                            {g.mgCode}
                          </span>
                          <p className="text-sm font-bold text-ink-body leading-snug group-hover:text-navy-800 transition flex-1">
                            {g.macroGoal}
                          </p>
                          <ExternalLink className="w-3.5 h-3.5 text-surface-border group-hover:text-navy-500 transition flex-shrink-0 mt-0.5" />
                        </div>

                        {/* Status badges row */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <StatusPill label="2030" status={g.status2030} style={style2030} />
                          <StatusPill label="2047" status={g.status2047} style={style2047} />

                          {/* Baseline / Target mini-info */}
                          <div className="ml-auto flex items-center gap-3 text-[10px] font-mono-num text-ink-muted">
                            <span>Base: <span className="text-ink-body font-bold">{g.baseline}</span></span>
                            <span className="w-0.5 h-3.5 bg-surface-border rounded-full" />
                            <span>2030: <span className="text-emerald-700 font-bold">{g.target2030}</span></span>
                            <span className="w-0.5 h-3.5 bg-surface-border rounded-full" />
                            <span>2047: <span className="text-indigo-700 font-bold">{g.target2047}</span></span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── FOOTER ─── */}
        <div className="flex-shrink-0 px-5 py-2 border-t border-surface-2 bg-surface-0/50 flex items-center justify-between">
          <p className="text-xs text-ink-muted font-medium">
            Click a pillar → theme → macro goal to view its detailed analysis.
          </p>
          <p className="text-[10px] text-ink-faint font-mono-num">
            {macroGoals.length} total macro goals
          </p>
        </div>
      </div>

      {/* ─── CONFIRMATION POPUP OVERLAY ─── */}
      {confirmGoal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-xs" style={{ animation: 'hmFadeIn 150ms ease-out' }}>
          <div className="bg-surface-1 border border-surface-border rounded-2xl p-6 max-w-md w-full shadow-2xl mx-4" style={{ animation: 'hmScaleIn 180ms ease-out' }}>
            <div className="flex items-center gap-3 mb-4 text-navy-800">
              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-navy-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Navigation Confirmation</span>
                <h3 className="text-sm font-bold">Goal Detailed View</h3>
              </div>
            </div>

            <p className="text-xs text-ink-body mb-2 leading-relaxed">
              Do you want to go to detailed view of this macro goal?
            </p>

            <div className="bg-surface-0 border border-surface-border rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
              <span className="font-mono text-[9px] font-bold text-navy-800 bg-navy-800/5 px-1.5 py-0.5 rounded border border-navy-800/10 flex-shrink-0 mt-0.5">
                {confirmGoal.mgCode}
              </span>
              <span className="text-xs font-bold text-navy-800 leading-snug">
                {confirmGoal.macroGoal}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3.5">
              <button
                onClick={() => setConfirmGoal(null)}
                className="px-4 py-2 text-xs font-bold text-ink-muted hover:text-navy-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const targetCode = confirmGoal.mgCode
                  setConfirmGoal(null)
                  onClose()
                  navigate(`/v2/goal/${targetCode}`)
                }}
                className="px-4 py-2 text-xs font-bold bg-navy-800 hover:bg-navy-700 text-white rounded-lg shadow-sm transition cursor-pointer"
              >
                Go to Detailed View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes hmFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes hmScaleIn { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  )
}

// ─── Sub-components ───

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-ink-faint" />
      </div>
      <p className="text-xs text-ink-muted font-medium max-w-[180px] leading-relaxed">{text}</p>
    </div>
  )
}

function StatusPill({ label, status, style }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${style.bg || 'bg-surface-2'} ${style.text || 'text-ink-muted'} ${style.border || 'border-surface-border'}`}>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: style.color }} />
      <span>{label}: {style.label || 'N/A'}</span>
    </span>
  )
}
