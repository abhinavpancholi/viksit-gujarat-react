import React, { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Search, CheckCircle, AlertTriangle, AlertCircle, Bookmark, Award, X } from 'lucide-react'
import { useFilterStore } from '../context/FilterStore'
import GoalTrendChart from '../components/charts/GoalTrendChart'
import { STATUS_STYLE_MAP } from '../utils/statusCalculator'

// Department mapping based on Theme
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

// Custom initiatives by Theme
const THEME_INITIATIVES_MAP = {
  'Agriculture, Irrigation and Rural Development': [
    'Sujalam Sufalam Jal Abhiyan for water conservation and desiltation.',
    'Sardar Sarovar Canal Project network extension for micro-irrigation.',
    'Soil Health Card Scheme - pioneering agricultural chemical profiling.',
    'Pramukh Swami Krushi Kranti Yojana - farm solar electrification subsidy.',
    'Krishi Mahotsav - direct technology transfer to rural farmers.'
  ],
  'Human Capital: Education and Skilling': [
    'Shala Praveshotsav & Gunotsav for school enrolment and qualitative audits.',
    'Mukhya Mantri Yuva Swavalamban Yojana (MYSY) - higher education scholarship.',
    'Establishment of Kaushalya - The Skill University for vocational excellence.',
    'TEQIP implementation across State Engineering Colleges.',
    'Primary School Smart Classrooms & Gyankunj digital board initiatives.'
  ],
  'Nari Shakti: Women-led Development': [
    'Mission Mangalam - organizing rural women into Self Help Groups (SHGs).',
    'Ghar Divada Scheme - credit linkage and marketing support for women entrepreneurs.',
    'Vidhava Sahay Pension Yojana - financial support for destitute widows.',
    'Saraswati Sadhana Yojana - free bicycle distribution to high-school girls.',
    'Mati Tapi - promotion of clean cooking stoves in tribal pockets.'
  ],
  'Art Culture and Sports': [
    'Khel Mahakumbh - annual grassroots sports tournament since 2010.',
    'Heritage Tourism Policy - preservation of ASI and state monuments.',
    'Sanskruti Kunj - annual craft and cultural festival at Gandhinagar.',
    'District Sports Complexes (DSC) development across all 33 districts.',
    'Financial assistance scheme for traditional folk artists & artisans.'
  ],
  'City Agglomerations: Vibrant Socio-Economic Epicenters': [
    'GIFT City (Gujarat International Finance Tec-City) development.',
    'Swarnim Jayanti Mukhya Mantri Urban Development Scheme.',
    'Ahmedabad-Gandhinagar Metro Link Express (MEGA) project.',
    'Sewerage Treatment Plants (STP) & SCADA-based water distribution.',
    'Smart Cities Mission implementation in Surat, Vadodara, Rajkot.'
  ],
  'Healthcare and Nutrition for all': [
    'Strengthening Facility-Based Newborn Care (2005-2008).',
    'Chiranjeevi Yojana - PPP model for specialist obstetric services.',
    'Janani Suraksha Yojana, Infant Death Review, 108 Emergency Services.',
    'Special Newborn Care Units (SNCU) & Neonatal Stabilization Units (NBSU).',
    'Community-Level Nutrition & Care expansion (2009-2011).'
  ],
  'Industries of the Future': [
    'Vibrant Gujarat Global Summit - biennial investment promotion forum.',
    'Gujarat MSME Policy - interest subsidy and cluster infrastructure funding.',
    'Industrial Infrastructure Development (GIDC) estate expansion.',
    'Single Window Clearance System (Investor Facilitation Portal).',
    'Startup Gujarat Scheme - seed funding and incubator networking.'
  ],
  'Gujarat as Tourism Hub': [
    'Khushboo Gujarat Ki - global brand promotion campaigns.',
    'Rann Utsav - development of tent city and tourism infra in Dhordo, Kutch.',
    'Statue of Unity & Kevadia (Ekta Nagar) tourism zone development.',
    'Dwarka-Somnath coastal spiritual circuit development.',
    'Seaplane service & Ropeways projects (e.g. Girnar Ropeway).'
  ],
  'Transport and Logistics Infrastructure': [
    'Gujarat State Highway Project (GSHP) - high density road widening.',
    'PM GatiShakti Gujarat Portal - integrated infrastructure planning.',
    'Delhi-Mumbai Industrial Corridor (DMIC) logistics parks.',
    'RO-RO Ferry service between Ghogha and Dahej.',
    'Dholera Greenfield International Airport development.'
  ],
  'Services of the Future': [
    'IT & ITeS Policy - capital subsidy for digital tech parks.',
    'Science City (Ahmedabad) expansion - robotics, space, and aquatic galleries.',
    'Gujarat Biotechnology Policy - vaccine and genomic research grants.',
    'Dron Technology promotion for agricultural spraying and surveillance.',
    'Semiconductor Fab setup facilitation (Sanand Industrial cluster).'
  ],
  'Governance 2.0: Reform, Perform and Transform': [
    'SWAGAT (State Wide Attention on Grievances by Application of Technology).',
    'e-GujCop - integrated policing and crime tracking network.',
    'Digital Seva Setu - delivery of civic services to panchayats.',
    'Integrated Financial Management System (IFMS) for state accounts.',
    'e-Urja - digital billing and grid optimization portal.'
  ]
}

export default function MacroGoalDetail() {
  const { mgCode } = useParams()
  const navigate = useNavigate()
  const { macroGoals, trendData } = useFilterStore()

  // Selection states
  const [horizon, setHorizon] = useState('2030')
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [isChartExpanded, setIsChartExpanded] = useState(false)

  // Retrieve current goal and trend
  const goal = useMemo(() => {
    return macroGoals.find((g) => g.mgCode === mgCode)
  }, [macroGoals, mgCode])

  const trend = useMemo(() => {
    return trendData?.[mgCode]
  }, [trendData, mgCode])

  // Filter sidebar goals list based on sidebar search
  const filteredSidebarGoals = useMemo(() => {
    const query = sidebarSearch.trim().toLowerCase()
    return macroGoals.filter((g) => {
      return (
        query === '' ||
        g.macroGoal.toLowerCase().includes(query) ||
        g.mgCode.toLowerCase().includes(query)
      )
    })
  }, [macroGoals, sidebarSearch])

  if (!goal) {
    return (
      <div className="bg-surface-1 border border-surface-border rounded-xl p-8 text-center max-w-md mx-auto shadow-xs">
        <h2 className="font-display text-lg font-bold text-navy-800 mb-2">Goal Not Found</h2>
        <p className="text-sm text-ink-muted mb-6">The goal code "{mgCode}" does not exist in the dataset.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-800 text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-navy-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    )
  }

  // Determine active status styles based on active horizon
  const activeStatus = horizon === '2030' ? goal.status2030 : goal.status2047
  const statusMeta = STATUS_STYLE_MAP[activeStatus] || {
    bg: 'bg-surface-0',
    text: 'text-ink-muted',
    border: 'border-surface-border',
    label: 'Unknown'
  }

  const dept = THEME_DEPARTMENT_MAP[goal.theme] || 'Transformation Department (GRIT)'
  const initiatives = THEME_INITIATIVES_MAP[goal.theme] || [
    'Sectoral audits and resource prioritization protocols.',
    'Public-Private partnerships and infrastructure funding guidelines.',
    'Technology enablement initiatives and digital audits.'
  ]

  // Status Badge Icon selector
  const getStatusIcon = (statusStr) => {
    if (statusStr.includes('On Track')) return <CheckCircle className="w-3.5 h-3.5" />
    if (statusStr.includes('Critical')) return <AlertCircle className="w-3.5 h-3.5" />
    return <AlertTriangle className="w-3.5 h-3.5" />
  }

  return (
    <>
      {/* Main Page — 100vh constrained */}
      <div className="h-[calc(100vh-82px)] grid grid-cols-12 gap-4 min-h-0 overflow-hidden">
        
        {/* ──────────────── LEFT SIDEBAR (3 cols) ──────────────── */}
        <div className="col-span-3 flex flex-col gap-3 min-h-0 overflow-hidden">
          
          {/* SELECT MACRO GOAL list card */}
          <div className="bg-surface-1 border border-surface-border rounded-xl p-3.5 flex flex-col flex-1 min-h-0 shadow-2xs">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-surface-2 flex-shrink-0">
              <h3 className="text-[10px] font-bold text-navy-800 uppercase tracking-wider">
                Select Macro Goal
              </h3>
              <span className="text-[9px] font-bold font-mono-num text-ink-muted">
                {filteredSidebarGoals.length} goals
              </span>
            </div>

            {/* Search box */}
            <div className="relative mb-2 flex-shrink-0">
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Search macro goal..."
                className="w-full bg-surface-0 border border-surface-border rounded-lg pl-7 pr-3 py-1.5 text-[11px] text-ink-body focus:border-navy-500 focus:ring-1 focus:ring-navy-500 outline-hidden transition"
              />
              <Search className="w-3 h-3 text-ink-muted absolute left-2 top-1/2 -translate-y-1/2" />
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto divide-y divide-surface-2/65 pr-1 min-h-0">
              {filteredSidebarGoals.map((g) => {
                const isSelected = g.mgCode === mgCode
                return (
                  <button
                    key={g.mgCode}
                    onClick={() => navigate(`/goal/${g.mgCode}`)}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? 'bg-navy-800 text-white shadow-2xs'
                        : 'hover:bg-surface-0 text-ink-body hover:text-navy-800'
                    }`}
                  >
                    <span className={`font-mono text-[8px] font-bold px-1 py-0.5 rounded-sm flex-shrink-0 ${isSelected ? 'bg-navy-700 text-white' : 'bg-surface-2 text-navy-600'}`}>
                      {g.mgCode}
                    </span>
                    <span className="truncate leading-tight flex-1" title={g.macroGoal}>
                      {g.macroGoal}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* GOVERNMENT BEST PRACTICES & INITIATIVES */}
          <div className="bg-surface-1 border border-surface-border rounded-xl p-3.5 shadow-2xs flex flex-col flex-shrink-0" style={{ maxHeight: '35%' }}>
            <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-surface-2 flex-shrink-0">
              <Award className="w-3.5 h-3.5 text-navy-600" />
              <h4 className="text-[10px] font-bold text-navy-800 uppercase tracking-wider">
                Govt. Best Practices & Initiatives
              </h4>
            </div>
            <ul className="space-y-1.5 flex-1 overflow-y-auto min-h-0 pr-1">
              {initiatives.map((ini, idx) => (
                <li key={idx} className="text-[10px] text-ink-body leading-snug flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 mt-1 flex-shrink-0" />
                  <span className="font-medium">{ini}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ──────────────── MAIN CONTENT AREA (9 cols) ──────────────── */}
        <div className="col-span-9 flex flex-col gap-3 min-h-0 overflow-hidden">
          
          {/* Row 1: Macro Goal Title Card — Compact */}
          <div className="bg-surface-1 border border-surface-border rounded-xl p-3.5 shadow-2xs flex-shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] font-bold text-navy-800 bg-surface-2 px-1.5 py-0.5 rounded-md border border-surface-border">
                    {goal.mgCode}
                  </span>
                  <span className="text-[10px] font-bold text-ink-muted">
                    {goal.pillar}
                  </span>
                </div>
                <h2 className="font-display text-base font-bold text-navy-800 mt-1 leading-snug">
                  {goal.macroGoal}
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-medium text-ink-muted mt-1">
                  <Bookmark className="w-3 h-3 text-navy-600 flex-shrink-0" />
                  <span className="font-bold text-navy-800">Theme:</span>
                  <span className="truncate">{goal.theme}</span>
                  <span className="w-1 h-1 rounded-full bg-surface-border flex-shrink-0" />
                  <span className="font-bold text-navy-800">Dept:</span>
                  <span className="truncate">{dept}</span>
                </div>
              </div>

              {/* Dynamic Status Pill */}
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-[10px] flex-shrink-0 ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border} shadow-2xs`}>
                {getStatusIcon(activeStatus)}
                <span>{statusMeta.label} ({horizon === '2030' ? '2030' : '2047'} Target)</span>
              </div>
            </div>
          </div>

          {/* Row 2: Goals Baseline & Targets (left) + Trend Chart (right) */}
          <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
            {/* Goals Baseline & Targets table */}
            <div className="col-span-4 bg-surface-1 border border-surface-border rounded-xl shadow-2xs flex flex-col min-h-0 overflow-hidden">
              <div className="border-b border-surface-2 p-3 flex-shrink-0">
                <h3 className="text-[10px] font-bold text-navy-800 uppercase tracking-wider">
                  Goals Baseline & Targets
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto min-h-0">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-surface-1">
                    <tr className="border-b border-surface-border text-[8px] font-bold text-ink-muted uppercase tracking-wider">
                      <th className="py-1.5 px-2.5 font-bold">Macro Goal</th>
                      <th className="py-1.5 px-1.5 font-bold text-right whitespace-nowrap">Base</th>
                      <th className="py-1.5 px-1.5 font-bold text-right whitespace-nowrap">2030</th>
                      <th className="py-1.5 px-1.5 font-bold text-right whitespace-nowrap">2047</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-2/60">
                    {macroGoals.map((g) => {
                      const isSelected = g.mgCode === mgCode
                      return (
                        <tr 
                          key={g.mgCode}
                          onClick={() => navigate(`/goal/${g.mgCode}`)}
                          className={`cursor-pointer transition hover:bg-surface-0 ${
                            isSelected ? 'bg-navy-50/60 font-bold' : ''
                          }`}
                        >
                          <td className="py-1.5 px-2.5 text-[10px] font-semibold text-ink-body">
                            <span className="line-clamp-1" title={g.macroGoal}>{g.macroGoal}</span>
                          </td>
                          <td className="py-1.5 px-1.5 text-[10px] text-right font-mono-num text-ink-muted">{g.baseline}</td>
                          <td className="py-1.5 px-1.5 text-[10px] text-right font-mono-num font-bold text-emerald-800">{g.target2030}</td>
                          <td className="py-1.5 px-1.5 text-[10px] text-right font-mono-num font-bold text-indigo-800">{g.target2047}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trend Analysis Chart */}
            <div className="col-span-8 min-h-0">
              <GoalTrendChart 
                goal={goal} 
                trend={trend} 
                horizon={horizon}
                onHorizonChange={setHorizon}
                onExpandClick={() => setIsChartExpanded(true)}
              />
            </div>
          </div>

          {/* Row 3: CAGR Performance Analysis */}
          <div className="bg-surface-1 border border-surface-border rounded-xl p-3.5 shadow-2xs flex-shrink-0">
            <h3 className="text-[10px] font-bold text-navy-800 uppercase tracking-wider mb-2 border-b border-surface-2 pb-1.5">
              Compound Annual Growth Rate (CAGR) Performance Analysis
            </h3>

            {!goal.hasCagrAnalysis ? (
              <div className="py-4 text-center text-[10px] text-ink-muted font-medium">
                Detailed CAGR analysis is not available for this macro goal category.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-surface-border text-[9px] font-bold text-ink-muted uppercase tracking-wider">
                      <th className="py-1.5 px-2">Horizon Year</th>
                      <th className="py-1.5 px-2 text-right">Target Value</th>
                      <th className="py-1.5 px-2 text-right">Current CAGR</th>
                      <th className="py-1.5 px-2 text-right">Required CAGR</th>
                      <th className="py-1.5 px-2 text-center">Projected Achievement Year</th>
                      <th className="py-1.5 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-2 text-xs font-semibold text-ink-body">
                    {/* 2030 CAGR row */}
                    <tr className={horizon === '2030' ? 'bg-navy-50/50' : ''}>
                      <td className="py-2 px-2 font-bold text-[11px]">2030 Targets</td>
                      <td className="py-2 px-2 text-right font-mono-num text-[11px]">{goal.target2030}</td>
                      <td className="py-2 px-2 text-right font-mono-num text-navy-600 text-[11px]">
                        {goal.cagr.currentCagr !== null ? `${(goal.cagr.currentCagr * 100).toFixed(2)}%` : 'N/A'}
                      </td>
                      <td className="py-2 px-2 text-right font-mono-num text-saffron-600 text-[11px]">
                        {goal.cagr.recommendedCagr2030 !== null ? `${(goal.cagr.recommendedCagr2030 * 100).toFixed(2)}%` : 'N/A'}
                      </td>
                      <td className="py-2 px-2 text-center font-mono-num font-bold text-navy-800 text-[11px]">
                        {goal.cagr.targetAchievement2030 || 'N/A'}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-md border ${STATUS_STYLE_MAP[goal.status2030]?.bg} ${STATUS_STYLE_MAP[goal.status2030]?.text} ${STATUS_STYLE_MAP[goal.status2030]?.border}`}>
                          {goal.status2030.split(' (')[0]}
                        </span>
                      </td>
                    </tr>
                    {/* 2047 CAGR row */}
                    <tr className={horizon === '2047' ? 'bg-navy-50/50' : ''}>
                      <td className="py-2 px-2 font-bold text-[11px]">2047 Targets</td>
                      <td className="py-2 px-2 text-right font-mono-num text-[11px]">{goal.target2047}</td>
                      <td className="py-2 px-2 text-right font-mono-num text-navy-600 text-[11px]">
                        {goal.cagr.currentCagr !== null ? `${(goal.cagr.currentCagr * 100).toFixed(2)}%` : 'N/A'}
                      </td>
                      <td className="py-2 px-2 text-right font-mono-num text-saffron-600 text-[11px]">
                        {goal.cagr.recommendedCagr2047 !== null ? `${(goal.cagr.recommendedCagr2047 * 100).toFixed(2)}%` : 'N/A'}
                      </td>
                      <td className="py-2 px-2 text-center font-mono-num font-bold text-navy-800 text-[11px]">
                        {goal.cagr.targetAchievement2047 || 'N/A'}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-md border ${STATUS_STYLE_MAP[goal.status2047]?.bg} ${STATUS_STYLE_MAP[goal.status2047]?.text} ${STATUS_STYLE_MAP[goal.status2047]?.border}`}>
                          {goal.status2047.split(' (')[0]}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ──────────────── FULLSCREEN TREND CHART MODAL ──────────────── */}
      {isChartExpanded && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsChartExpanded(false)}
        >
          <div 
            className="bg-surface-1 rounded-2xl shadow-2xl border border-surface-border w-[92vw] h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-surface-2 flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider">
                  {goal.macroGoal}
                </h3>
                <p className="text-[10px] text-ink-muted font-medium mt-0.5">
                  Detailed Trend Analysis — {goal.pillar} / {goal.theme}
                </p>
              </div>
              <button
                onClick={() => setIsChartExpanded(false)}
                className="p-2 rounded-lg border border-surface-border bg-surface-0 hover:bg-surface-2 text-ink-muted hover:text-navy-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Expanded chart */}
            <div className="flex-1 min-h-0 p-4">
              <GoalTrendChart 
                goal={goal} 
                trend={trend} 
                horizon={horizon}
                onHorizonChange={setHorizon}
                isExpanded={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
