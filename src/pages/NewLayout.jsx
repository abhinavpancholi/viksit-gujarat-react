import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Search, CheckCircle, AlertTriangle, AlertCircle, 
  Bookmark, Award, X, Target, Activity, Zap, ChevronDown,
  Maximize2, TrendingUp, TrendingDown, Crosshair, Layers,
  ChevronLeft, ChevronRight, Sparkles, LayoutGrid,
  MoveDown,
  ArrowBigDown,
  SearchAlert,
  SearchX,
  TreeDeciduous,
  Layers2,
  DoorOpen,
  Menu,
  MenuIcon,
  LucideMenuSquare,
  GitBranch,
  GitBranchPlus,
  DrillIcon,
  LucideDrill,
  BookDown,
  MenuSquare
} from 'lucide-react'
import { useFilterStore } from '../context/FilterStore'
import GoalTrendChart from '../components/charts/GoalTrendChart'
import { STATUS_STYLE_MAP } from '../utils/statusCalculator'

// ─── Mappings ───
const THEME_DEPARTMENT_MAP = {
  'Agriculture, Irrigation and Rural Development': 'Agriculture & Cooperation Dept.',
  'Human Capital: Education and Skilling': 'Education / Labor & Employment Dept.',
  'Nari Shakti: Women-led Development': 'Women & Child Development Dept.',
  'Art Culture and Sports': 'Sports, Youth & Cultural Activities Dept.',
  'City Agglomerations: Vibrant Socio-Economic Epicenters': 'Urban Development & Urban Housing Dept.',
  'Healthcare and Nutrition for all': 'Health & Family Welfare Dept.',
  'Industries of the Future': 'Industries & Mines Dept.',
  'Gujarat as Tourism Hub': 'Tourism & Civil Aviation Dept.',
  'Transport and Logistics Infrastructure': 'Ports & Transport / Roads & Buildings',
  'Services of the Future': 'Science & Technology Dept.',
  'Governance 2.0: Reform, Perform and Transform': 'General Administration / Finance Dept.'
}

const THEME_INITIATIVES_MAP = {
  'Agriculture, Irrigation and Rural Development': [
    'Sujalam Sufalam Jal Abhiyan for water conservation.',
    'Sardar Sarovar Canal Project for micro-irrigation.',
    'Soil Health Card Scheme — agri chemical profiling.',
    'Krushi Kranti Yojana — farm solar subsidy.',
    'Krishi Mahotsav — tech transfer to farmers.'
  ],
  'Human Capital: Education and Skilling': [
    'Shala Praveshotsav & Gunotsav for enrolment audits.',
    'MYSY — higher education scholarship.',
    'Kaushalya Skill University for vocational excellence.',
    'TEQIP across State Engineering Colleges.',
    'Gyankunj digital smart classrooms.'
  ],
  'Nari Shakti: Women-led Development': [
    'Mission Mangalam — women Self Help Groups.',
    'Ghar Divada — credit for women entrepreneurs.',
    'Vidhava Sahay Pension Yojana.',
    'Saraswati Sadhana — bicycles for school girls.',
    'Mati Tapi — clean cooking stoves in tribal areas.'
  ],
  'Art Culture and Sports': [
    'Khel Mahakumbh — grassroots sports tournament.',
    'Heritage Tourism Policy for monuments.',
    'Sanskruti Kunj cultural festival.',
    'District Sports Complexes across 33 districts.',
    'Financial assistance for folk artists.'
  ],
  'City Agglomerations: Vibrant Socio-Economic Epicenters': [
    'GIFT City development.',
    'Swarnim Jayanti Urban Development Scheme.',
    'MEGA Metro Link Express project.',
    'STP & SCADA-based water distribution.',
    'Smart Cities Mission in Surat, Vadodara, Rajkot.'
  ],
  'Healthcare and Nutrition for all': [
    'Facility-Based Newborn Care programme.',
    'Chiranjeevi Yojana — PPP obstetric services.',
    'Janani Suraksha & 108 Emergency Services.',
    'SNCU & Neonatal Stabilization Units.',
    'Community-Level Nutrition expansion.'
  ],
  'Industries of the Future': [
    'Vibrant Gujarat Global Summit.',
    'MSME Policy — interest subsidy & cluster funding.',
    'GIDC industrial estate expansion.',
    'Single Window Clearance Portal.',
    'Startup Gujarat seed funding.'
  ],
  'Gujarat as Tourism Hub': [
    'Khushboo Gujarat Ki brand campaigns.',
    'Rann Utsav tent city in Kutch.',
    'Statue of Unity tourism zone.',
    'Dwarka-Somnath spiritual circuit.',
    'Girnar Ropeway & Seaplane service.'
  ],
  'Transport and Logistics Infrastructure': [
    'GSHP high-density road widening.',
    'PM GatiShakti Gujarat Portal.',
    'DMIC logistics parks.',
    'RO-RO Ferry Ghogha–Dahej.',
    'Dholera International Airport.'
  ],
  'Services of the Future': [
    'IT/ITeS Policy — digital tech park subsidy.',
    'Science City expansion in Ahmedabad.',
    'Biotech Policy — vaccine research grants.',
    'Dron Technology for agri spraying.',
    'Semiconductor Fab in Sanand cluster.'
  ],
  'Governance 2.0: Reform, Perform and Transform': [
    'SWAGAT grievance redressal platform.',
    'e-GujCop integrated policing network.',
    'Digital Seva Setu for panchayats.',
    'IFMS for state financial management.',
    'e-Urja grid optimization portal.'
  ]
}

const STATUS_ACCENT = {
  'On Track (gap ≤ 25%)':            { gradient: 'from-emerald-500 to-teal-400', soft: 'bg-emerald-50', dot: 'bg-emerald-500', ring: 'ring-emerald-200' },
  'Slightly Off Track (gap ≤ 50%)':   { gradient: 'from-amber-400 to-yellow-300', soft: 'bg-amber-50', dot: 'bg-amber-500', ring: 'ring-amber-200' },
  'At Risk (gap ≤ 75%)':             { gradient: 'from-orange-500 to-amber-400', soft: 'bg-orange-50', dot: 'bg-orange-500', ring: 'ring-orange-200' },
  'Critical (gap > 75%)':            { gradient: 'from-rose-500 to-red-400', soft: 'bg-rose-50', dot: 'bg-rose-500', ring: 'ring-rose-200' }
}

// ─── Theme icons ───
const THEME_ICON_MAP = {
  'Agriculture, Irrigation and Rural Development': '🌾',
  'Human Capital: Education and Skilling': '🎓',
  'Nari Shakti: Women-led Development': '👩',
  'Art Culture and Sports': '🎨',
  'City Agglomerations: Vibrant Socio-Economic Epicenters': '🏙️',
  'Healthcare and Nutrition for all': '🏥',
  'Industries of the Future': '🏭',
  'Gujarat as Tourism Hub': '✈️',
  'Transport and Logistics Infrastructure': '🚆',
  'Services of the Future': '💡',
  'Governance 2.0: Reform, Perform and Transform': '⚙️'
}

// Short theme names for compact display
const THEME_SHORT = {
  'Agriculture, Irrigation and Rural Development': 'Agriculture & Rural Dev.',
  'Human Capital: Education and Skilling': 'Education & Skilling',
  'Nari Shakti: Women-led Development': 'Women-led Dev.',
  'Art Culture and Sports': 'Art, Culture & Sports',
  'City Agglomerations: Vibrant Socio-Economic Epicenters': 'City Agglomerations',
  'Healthcare and Nutrition for all': 'Healthcare & Nutrition',
  'Industries of the Future': 'Future Industries',
  'Gujarat as Tourism Hub': 'Tourism',
  'Transport and Logistics Infrastructure': 'Transport & Logistics',
  'Services of the Future': 'Future Services',
  'Governance 2.0: Reform, Perform and Transform': 'Governance 2.0'
}

export default function NewLayout() {
  const { mgCode } = useParams()
  const navigate = useNavigate()
  const { macroGoals, trendData } = useFilterStore()

  const [horizon, setHorizon] = useState('2030')
  const [isChartExpanded, setIsChartExpanded] = useState(false)
  const [isInitiativesExpanded, setIsInitiativesExpanded] = useState(false)
  const [isGoalSelectorOpen, setIsGoalSelectorOpen] = useState(false)
  const [selectorSearch, setSelectorSearch] = useState('')
  const selectorRef = useRef(null)

  const goal = useMemo(() => macroGoals.find((g) => g.mgCode === mgCode), [macroGoals, mgCode])
  const trend = useMemo(() => trendData?.[mgCode], [trendData, mgCode])

  // Goals grouped by theme
  const goalsByTheme = useMemo(() => {
    const groups = {}
    macroGoals.forEach(g => {
      if (!groups[g.theme]) groups[g.theme] = []
      groups[g.theme].push(g)
    })
    return groups
  }, [macroGoals])

  // Filtered goals for selector search
  const filteredSelectorGoals = useMemo(() => {
    const query = selectorSearch.trim().toLowerCase()
    if (!query) return null // show grouped view
    return macroGoals.filter(g =>
      g.macroGoal.toLowerCase().includes(query) || g.mgCode.toLowerCase().includes(query)
    )
  }, [macroGoals, selectorSearch])

  // Previous/Next goal navigation
  const goalIndex = useMemo(() => macroGoals.findIndex(g => g.mgCode === mgCode), [macroGoals, mgCode])
  const prevGoal = goalIndex > 0 ? macroGoals[goalIndex - 1] : null
  const nextGoal = goalIndex < macroGoals.length - 1 ? macroGoals[goalIndex + 1] : null

  // Close selector when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) {
        setIsGoalSelectorOpen(false)
        setSelectorSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!goal) {
    return (
      <div className="h-[calc(100vh-82px)] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 text-center max-w-md shadow-xl border border-surface-border">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="font-display text-xl font-bold text-navy-800 mb-2">Goal Not Found</h2>
          <p className="text-sm text-ink-muted mb-6">Code "{mgCode}" does not exist.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 text-white rounded-xl text-sm font-semibold shadow hover:bg-navy-700 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const activeStatus = horizon === '2030' ? goal.status2030 : goal.status2047
  const statusMeta = STATUS_STYLE_MAP[activeStatus] || { bg: 'bg-surface-0', text: 'text-ink-muted', border: 'border-surface-border', label: 'Unknown', color: '#999' }
  const accent = STATUS_ACCENT[activeStatus] || STATUS_ACCENT['Critical (gap > 75%)']
  const dept = THEME_DEPARTMENT_MAP[goal.theme] || 'GRIT'
  const initiatives = THEME_INITIATIVES_MAP[goal.theme] || ['Policy audits.', 'PPP partnerships.', 'Technology enablement.']
  const themeIcon = THEME_ICON_MAP[goal.theme] || '📊'
  const themeShort = THEME_SHORT[goal.theme] || goal.theme

  const getStatusIcon = (s) => {
    if (s.includes('On Track')) return <CheckCircle className="w-4 h-4" />
    if (s.includes('Critical')) return <AlertCircle className="w-4 h-4" />
    return <AlertTriangle className="w-4 h-4" />
  }

  return (
    <>
      <div className="h-[calc(100vh-82px)] flex flex-col min-h-0 overflow-hidden">

        {/* ═══════════ TOP: Hero Banner ═══════════ */}
        <div className="flex-shrink-0 relative">
          {/* Gradient accent line */}
          <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent.gradient}`} />

          <div className="px-5 pt-3 pb-2.5 flex items-start justify-between gap-4">
            {/* Left: Goal info with navigator */}
            <div className="min-w-0 flex-1">
              {/* Breadcrumb row */}
              <div className="flex items-center gap-2 mb-1.5 text-xs">
                <Link to="/" className="text-ink-muted hover:text-navy-800 transition font-semibold flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <span className="text-surface-border">/</span>
                <span className="font-semibold text-ink-muted">{goal.pillar}</span>
              </div>

              {/* Goal title with switcher */}
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-navy-800 leading-snug sm:text-2xl">
                  {goal.macroGoal}
                </h1>

                {/* Goal Switcher Button */}
                <div className="relative" ref={selectorRef}>
                  <button 
                    onClick={() => { setIsGoalSelectorOpen(!isGoalSelectorOpen); setSelectorSearch('') }}
                    className={`p-1.5 rounded-lg border transition cursor-pointer flex-shrink-0 ${
                      isGoalSelectorOpen 
                        ? 'bg-navy-800 text-white border-navy-800' 
                        : 'bg-surface-1 text-ink-muted border-surface-border hover:bg-surface-2 hover:text-navy-800'
                    }`}
                    title="Switch macro goal"
                  >
                    <MenuSquare className="w-3.5 h-3.5" />
                  </button>

                  {/* Floating Goal Selector Panel */}
                  {isGoalSelectorOpen && (
                    <div className="absolute top-full left-0 mt-2 w-[420px] bg-white rounded-xl shadow-2xl border border-surface-border z-50 overflow-hidden" style={{ animation: 'slideDown 200ms ease-out' }}>
                      {/* Search */}
                      <div className="p-3 border-b border-surface-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={selectorSearch}
                            onChange={(e) => setSelectorSearch(e.target.value)}
                            placeholder="Search by name or code..."
                            className="w-full bg-surface-0 border border-surface-border rounded-lg pl-8 pr-3 py-2 text-xs text-ink-body focus:border-navy-500 focus:ring-1 focus:ring-navy-500 outline-hidden transition"
                            autoFocus
                          />
                          <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      {/* Results */}
                      <div className="max-h-[50vh] overflow-y-auto p-2">
                        {filteredSelectorGoals ? (
                          /* Search results — flat list */
                          filteredSelectorGoals.length === 0 ? (
                            <p className="text-xs text-ink-muted text-center py-6">No goals found.</p>
                          ) : (
                            filteredSelectorGoals.map(g => {
                              const isActive = g.mgCode === mgCode
                              const gStatus = STATUS_STYLE_MAP[g.status2030]
                              return (
                                <button
                                  key={g.mgCode}
                                  onClick={() => { navigate(`/v2/goal/${g.mgCode}`); setIsGoalSelectorOpen(false); setSelectorSearch('') }}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 transition cursor-pointer mb-0.5 ${
                                    isActive ? 'bg-navy-50 text-navy-800 font-bold' : 'hover:bg-surface-0 text-ink-body'
                                  }`}
                                >
                                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: gStatus?.color }} />
                                  <span className="font-mono text-[9px] font-bold text-ink-muted flex-shrink-0">{g.mgCode}</span>
                                  <span className="truncate">{g.macroGoal}</span>
                                </button>
                              )
                            })
                          )
                        ) : (
                          /* Grouped by theme */
                          Object.entries(goalsByTheme).map(([themeName, goals]) => (
                            <div key={themeName} className="mb-2">
                              <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                                <span>{THEME_ICON_MAP[themeName] || '📊'}</span>
                                <span className="truncate">{THEME_SHORT[themeName] || themeName}</span>
                                <span className="text-[9px] font-mono-num bg-surface-2 px-1.5 rounded-full ml-auto">{goals.length}</span>
                              </div>
                              {goals.map(g => {
                                const isActive = g.mgCode === mgCode
                                const gStatus = STATUS_STYLE_MAP[g.status2030]
                                return (
                                  <button
                                    key={g.mgCode}
                                    onClick={() => { navigate(`/v2/goal/${g.mgCode}`); setIsGoalSelectorOpen(false) }}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-2 transition cursor-pointer ${
                                      isActive ? 'bg-navy-50 text-navy-800 font-bold' : 'hover:bg-surface-0 text-ink-body'
                                    }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: gStatus?.color }} />
                                    <span className="truncate">{g.macroGoal}</span>
                                  </button>
                                )
                              })}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Prev / Next navigation */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                  <button
                    onClick={() => prevGoal && navigate(`/v2/goal/${prevGoal.mgCode}`)}
                    disabled={!prevGoal}
                    className="p-1 rounded-md border border-surface-border bg-surface-1 hover:bg-surface-2 text-ink-muted hover:text-navy-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    title={prevGoal ? `Previous: ${prevGoal.macroGoal}` : 'No previous goal'}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono-num text-ink-muted font-bold">{goalIndex + 1}/{macroGoals.length}</span>
                  <button
                    onClick={() => nextGoal && navigate(`/v2/goal/${nextGoal.mgCode}`)}
                    disabled={!nextGoal}
                    className="p-1 rounded-md border border-surface-border bg-surface-1 hover:bg-surface-2 text-ink-muted hover:text-navy-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    title={nextGoal ? `Next: ${nextGoal.macroGoal}` : 'No next goal'}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Theme / Dept subtitle */}
              <div className="flex items-center gap-2 mt-1.5 text-xs text-ink-muted">
                <span className="text-base">{themeIcon}</span>
                <span className="font-semibold text-navy-700">{themeShort}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-surface-border" />
                <Bookmark className="w-3.5 h-3.5 text-navy-400" />
                <span className="font-medium">{dept}</span>
              </div>
            </div>

            {/* Right: Status + Horizon */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Horizon toggle */}
              <div className="flex bg-surface-2/60 rounded-xl p-0.5 border border-surface-border/50">
                {['2030', '2047'].map(h => (
                  <button
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                      horizon === h 
                        ? 'bg-white text-navy-800 shadow-sm' 
                        : 'text-ink-muted hover:text-navy-800'
                    }`}
                  >
                    {h} Target
                  </button>
                ))}
              </div>

              {/* Status pill */}
              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border font-bold text-sm ring-2 ${accent.ring} ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                {getStatusIcon(activeStatus)}
                <span>{statusMeta.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ MAIN CONTENT GRID ═══════════ */}
        <div className="flex-1 min-h-0 px-5 pb-3 flex flex-col gap-3">

          {/* Row 1: Metrics + Trend Chart */}
          <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">

            {/* Left Column: Stacked metric cards + Initiatives */}
            <div className="col-span-3 flex flex-col gap-2.5 min-h-0">
              {/* Baseline */}
              <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Baseline</span>
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Crosshair className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono-num text-navy-800 leading-none">{goal.baseline}</p>
                <p className="text-[12px] text-slate-400 font-medium mt-1">Reference starting point</p>
              </div>

              {/* Target 2030 */}
              <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-bold text-emerald-400 uppercase tracking-widest">Target 2030</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono-num text-navy-800 leading-none">{goal.target2030}</p>
                <p className="text-[12px] text-emerald-500/70 font-semibold mt-1">
                  Gap: {goal.gap2030Ratio !== null ? `${(goal.gap2030Ratio * 100).toFixed(0)}%` : 'N/A'}
                </p>
              </div>

              {/* Target 2047 */}
              <div className="bg-white border border-violet-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-bold text-violet-400 uppercase tracking-widest">Target 2047</span>
                  <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-violet-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono-num text-navy-800 leading-none">{goal.target2047}</p>
                <p className="text-[12px] text-violet-500/70 font-semibold mt-1">
                  Gap: {goal.gap2047Ratio !== null ? `${(goal.gap2047Ratio * 100).toFixed(0)}%` : 'N/A'}
                </p>
              </div>

              {/* Key Initiatives — fills remaining space */}
              <div className="bg-white border border-saffron-500 rounded-xl p-2.5 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-saffron-500" />
                    <h4 className="text-[14px] font-bold text-navy-800 uppercase tracking-widest">Key Initiatives</h4>
                  </div>
                  <button
                    onClick={() => setIsInitiativesExpanded(true)}
                    className="p-1 rounded-md border border-surface-border bg-surface-0 hover:bg-surface-2 text-ink-muted hover:text-navy-800 transition cursor-pointer"
                    title="Maximize Initiatives"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-0.5">
                  {initiatives.map((ini, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-md bg-gradient-to-br from-saffron-400 to-orange-400 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        {idx + 1}
                      </span>
                      <p className="text-[11px] text-ink-body leading-snug font-semibold">{ini}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Trend Chart */}
            <div className="col-span-9 min-h-0">
              <GoalTrendChart
                goal={goal}
                trend={trend}
                horizon={horizon}
                onHorizonChange={setHorizon}
                onExpandClick={() => setIsChartExpanded(true)}
              />
            </div>
          </div>

          {/* Row 2: CAGR Performance */}
          <div className="flex-shrink-0 bg-white border border-surface-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b border-surface-2/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-navy-500" />
                <span className="text-[15px] font-bold text-navy-800 uppercase tracking-wider">CAGR Performance Analysis</span>
              </div>
              <span className="text-[12px] font-medium text-ink-muted bg-surface-0 border border-surface-border px-2 py-0.5 rounded-full uppercase tracking-wider">
                Compound Annual Growth Rate
              </span>
            </div>

            {!goal.hasCagrAnalysis ? (
              <div className="py-4 text-center text-xs text-ink-muted font-medium">
                CAGR analysis is not available for this macro goal.
              </div>
            ) : (
              <div className="grid grid-cols-2 divide-x-[1px] divide-surface-200">
                {/* 2030 */}
                <CagrCard 
                  label="2030 Horizon"
                  dotColor="bg-emerald-500"
                  target={goal.target2030}
                  currentCagr={goal.cagr.currentCagr}
                  requiredCagr={goal.cagr.recommendedCagr2030}
                  achievement={goal.cagr.targetAchievement2030}
                  status={goal.status2030}
                  isActive={horizon === '2030'}
                />
                {/* 2047 */}
                <CagrCard 
                  label="2047 Horizon"
                  dotColor="bg-violet-500"
                  target={goal.target2047}
                  currentCagr={goal.cagr.currentCagr}
                  requiredCagr={goal.cagr.recommendedCagr2047}
                  achievement={goal.cagr.targetAchievement2047}
                  status={goal.status2047}
                  isActive={horizon === '2047'}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ FULLSCREEN CHART MODAL ═══════════ */}
      {isChartExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setIsChartExpanded(false)}>
          <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-md" style={{ animation: 'fadeIn 200ms ease-out' }} />
          <div
            className="relative bg-white rounded-2xl shadow-2xl border border-surface-border w-[92vw] h-[85vh] flex flex-col overflow-hidden"
            style={{ animation: 'scaleIn 300ms ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-3 border-b border-surface-2 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-7 rounded-full bg-gradient-to-b ${accent.gradient}`} />
                <div>
                  <h3 className="text-sm font-bold text-navy-800">{goal.macroGoal}</h3>
                  <p className="text-[10px] text-ink-muted font-medium">{goal.pillar} • {themeShort}</p>
                </div>
              </div>
              <button onClick={() => setIsChartExpanded(false)} className="p-2 rounded-xl border border-surface-border bg-surface-0 hover:bg-rose-50 text-ink-muted hover:text-rose-500 transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 p-5">
              <GoalTrendChart goal={goal} trend={trend} horizon={horizon} isExpanded={true} />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ FULLSCREEN KEY INITIATIVES MODAL ═══════════ */}
      {isInitiativesExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setIsInitiativesExpanded(false)}>
          <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-md" style={{ animation: 'fadeIn 200ms ease-out' }} />
          <div
            className="relative bg-white rounded-2xl shadow-2xl border border-surface-border w-[85vw] max-w-4xl h-[70vh] flex flex-col overflow-hidden"
            style={{ animation: 'scaleIn 300ms ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-2 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-7 rounded-full bg-gradient-to-b ${accent.gradient}`} />
                <div>
                  <h3 className="text-base font-bold text-navy-800">Key Initiatives</h3>
                  <p className="text-xs text-ink-muted font-medium">{goal.pillar} • {themeShort}</p>
                </div>
              </div>
              <button onClick={() => setIsInitiativesExpanded(false)} className="p-2 rounded-xl border border-surface-border bg-surface-0 hover:bg-rose-50 text-ink-muted hover:text-rose-500 transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              <div className="bg-saffron-50/50 border border-saffron-100 rounded-xl p-4 mb-2">
                <p className="text-xs text-saffron-800 font-semibold">
                  Department Responsible: {dept}
                </p>
              </div>
              <div className="space-y-4">
                {initiatives.map((ini, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50/70 transition-colors">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron-400 to-orange-400 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                      {idx + 1}
                    </span>
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm text-ink-body font-semibold leading-relaxed">{ini}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </>
  )
}

// ─── CAGR Card sub-component ───
function CagrCard({ label, dotColor, target, currentCagr, requiredCagr, achievement, status, isActive }) {
  const style = STATUS_STYLE_MAP[status] || {}
  return (
    <div className={`px-4 py-3 transition ${isActive ? 'bg-navy-50/30' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <span className="text-[14px] font-bold text-navy-800">{label}</span>
        </div>
        <span className={`inline-flex items-center px-1.5 py-0.5 text-[12px] font-bold rounded-lg border ${style.bg} ${style.text} ${style.border}`}>
          {status.split(' (')[0]}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Target</p>
          <p className="text-[14px] font-bold font-mono-num text-navy-800">{target}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Current CAGR</p>
          <p className="text-[14px] font-bold font-mono-num text-blue-600">
            {currentCagr !== null ? `${(currentCagr * 100).toFixed(2)}%` : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Required CAGR</p>
          <p className="text-[14px] font-bold font-mono-num text-saffron-600">
            {requiredCagr !== null ? `${(requiredCagr * 100).toFixed(2)}%` : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Achievement</p>
          <p className="text-[14px] font-bold font-mono-num text-navy-800">{achievement || 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}
