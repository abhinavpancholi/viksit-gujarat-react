import React, { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Search, CheckCircle, AlertTriangle, AlertCircle, Bookmark, Compass, Award } from 'lucide-react'
import { useFilterStore } from '../context/FilterStore'
import GoalTrendChart from '../components/charts/GoalTrendChart'
import { STATUS_STYLE_MAP } from '../utils/statusCalculator'

// Department mapping based on Theme
const THEME_DEPARTMENT_MAP = {
  'Agriculture, Irrigation and Rural Development': 'Agriculture & Cooperation Dept.',
  'Human Capital: Education and Skilling': 'Education / Labor & Employment Dept.',
  'Nari Shakti: Women-led Development': 'Women & Child Development Dept.',
  'Art Culture and Sports': 'Sports, Youth & Cultural Activities Dept.',
  'City Agglomeration': 'Urban Development & Urban Housing Dept.',
  'Healthcare and Nutrition for all': 'Health & Family Welfare Dept.',
  'Industry, MSME and Services': 'Industries & Mines Dept.',
  'Gujarat as Tourism Hub': 'Tourism & Civil Aviation Dept.',
  'Transport and Logistics': 'Ports & Transport / Roads & Buildings',
  'Services of Future': 'Science & Technology Dept.',
  'Governance Reforms': 'General Administration / Finance Dept.'
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
  'City Agglomeration': [
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
  'Industry, MSME and Services': [
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
  'Transport and Logistics': [
    'Gujarat State Highway Project (GSHP) - high density road widening.',
    'PM GatiShakti Gujarat Portal - integrated infrastructure planning.',
    'Delhi-Mumbai Industrial Corridor (DMIC) logistics parks.',
    'RO-RO Ferry service between Ghogha and Dahej.',
    'Dholera Greenfield International Airport development.'
  ],
  'Services of Future': [
    'IT & ITeS Policy - capital subsidy for digital tech parks.',
    'Science City (Ahmedabad) expansion - robotics, space, and aquatic galleries.',
    'Gujarat Biotechnology Policy - vaccine and genomic research grants.',
    'Dron Technology promotion for agricultural spraying and surveillance.',
    'Semiconductor Fab setup facilitation (Sanand Industrial cluster).'
  ],
  'Governance Reforms': [
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
  const [activeTab, setActiveTab] = useState('analysis') // 'analysis' | 'best_studies'

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

  // Top delayed/critical goals in the SAME theme as the current goal
  const relatedDelayedGoals = useMemo(() => {
    if (!goal) return []
    return macroGoals
      .filter((g) => {
        const isSameTheme = g.theme === goal.theme
        const isDifferentGoal = g.mgCode !== goal.mgCode
        const isDelayed = g.status2030.startsWith('Critical') || g.status2030.startsWith('At Risk')
        return isSameTheme && isDifferentGoal && isDelayed
      })
      .slice(0, 5)
  }, [macroGoals, goal])

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
    if (statusStr.includes('On Track')) return <CheckCircle className="w-4 h-4" />
    if (statusStr.includes('Critical')) return <AlertCircle className="w-4 h-4" />
    return <AlertTriangle className="w-4 h-4" />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* 1. Left Sidebar: Goal Selection Panel (3 cols) */}
      <div className="lg:col-span-3 flex flex-col gap-6 h-full lg:sticky lg:top-[74px]">
        {/* Selection panel */}
        <div className="bg-surface-1 border border-surface-border rounded-xl p-4 flex flex-col max-h-[420px] shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-2">
            <h3 className="text-xs font-bold text-navy-800 uppercase tracking-wider">
              Select Macro Goal
            </h3>
            <span className="text-[10px] font-bold font-mono-num text-ink-muted">
              {filteredSidebarGoals.length} goals
            </span>
          </div>

          {/* Search box */}
          <div className="relative mb-3">
            <input
              type="text"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder="Search macro goal..."
              className="w-full bg-surface-0 border border-surface-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-ink-body focus:border-navy-500 focus:ring-1 focus:ring-navy-500 outline-hidden transition"
            />
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto divide-y divide-surface-2/65 pr-1">
            {filteredSidebarGoals.map((g) => {
              const isSelected = g.mgCode === mgCode
              return (
                <button
                  key={g.mgCode}
                  onClick={() => navigate(`/goal/${g.mgCode}`)}
                  className={`w-full text-left py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                    isSelected
                      ? 'bg-navy-800 text-white shadow-2xs'
                      : 'hover:bg-surface-0 text-ink-body hover:text-navy-800'
                  }`}
                >
                  <span className={`font-mono text-[9px] font-bold px-1 py-0.5 rounded-sm ${isSelected ? 'bg-navy-700 text-white' : 'bg-surface-2 text-navy-600'}`}>
                    {g.mgCode}
                  </span>
                  <span className="truncate leading-normal flex-1" title={g.macroGoal}>
                    {g.macroGoal}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dynamic List Summary Card: Baseline & Targets list */}
        <div className="bg-surface-1 border border-surface-border rounded-xl p-4 shadow-2xs flex flex-col max-h-[300px]">
          <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider mb-2 pb-2 border-b border-surface-2">
            Goals Baseline & Targets
          </h4>
          <div className="flex-1 overflow-y-auto divide-y divide-surface-2/60 pr-1">
            {macroGoals.map((g) => {
              const isSelected = g.mgCode === mgCode
              return (
                <div 
                  key={g.mgCode}
                  onClick={() => navigate(`/goal/${g.mgCode}`)}
                  className={`py-2 px-1 text-[10px] grid grid-cols-4 gap-1 items-center cursor-pointer transition ${
                    isSelected ? 'bg-navy-50 font-bold' : 'hover:bg-surface-0'
                  }`}
                >
                  <span className="font-mono text-[9px] font-bold text-navy-800 truncate" title={g.macroGoal}>
                    {g.mgCode}
                  </span>
                  <span className="text-right text-ink-muted">{g.baseline}</span>
                  <span className="text-right font-bold text-emerald-800">{g.target2030}</span>
                  <span className="text-right font-bold text-indigo-800">{g.target2047}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 2. Right Content Area: Detailed Details (9 cols) */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        {/* Navigation Tabs bar */}
        <div className="flex items-center justify-between border-b border-surface-border pb-px">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-2 px-3 border-b-2 font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'analysis'
                  ? 'border-navy-800 text-navy-800 font-bold'
                  : 'border-transparent text-ink-muted hover:text-navy-800'
              }`}
            >
              Analysis M-Goal
            </button>
            <button
              onClick={() => setActiveTab('best_studies')}
              className={`py-2 px-3 border-b-2 font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'best_studies'
                  ? 'border-navy-800 text-navy-800'
                  : 'border-transparent text-ink-muted hover:text-navy-800'
              }`}
            >
              Best Studies / Initiatives
            </button>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1 text-xs font-bold text-navy-800 hover:text-navy-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview Dashboard</span>
          </Link>
        </div>

        {/* Current Active Goal header card */}
        <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-navy-800 bg-surface-2 px-2 py-0.5 rounded-md border border-surface-border">
                  {goal.mgCode}
                </span>
                <span className="text-xs font-bold text-ink-muted">
                  {goal.pillar}
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-navy-800 mt-2 leading-snug">
                {goal.macroGoal}
              </h2>
              <div className="flex items-center gap-2 text-xs font-medium text-ink-muted mt-2">
                <Bookmark className="w-3.5 h-3.5 text-navy-600 flex-shrink-0" />
                <span className="font-bold text-navy-800">Theme:</span>
                <span>{goal.theme}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-surface-border" />
                <span className="font-bold text-navy-800">Dept:</span>
                <span>{dept}</span>
              </div>
            </div>

            {/* Dynamic Status Pill */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-xs ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border} shadow-2xs`}>
              {getStatusIcon(activeStatus)}
              <span>{statusMeta.label} ({horizon === '2030' ? '2030 Target' : '2047 Target'})</span>
            </div>
          </div>
        </div>

        {/* Tab content conditional rendering */}
        {activeTab === 'analysis' ? (
          <>
            {/* CAGR and Trend chart block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* CAGR Analysis Metrics Cards or Summary table */}
              <div className="md:col-span-1 flex flex-col gap-4">
                <div className="bg-surface-1 border border-surface-border rounded-xl p-4 shadow-2xs flex-1 flex flex-col justify-between">
                  <div className="border-b border-surface-2 pb-2 mb-3">
                    <h3 className="text-xs font-bold text-navy-800 uppercase tracking-wider">
                      Parameter Values
                    </h3>
                  </div>
                  
                  <div className="flex flex-col gap-3 flex-1 justify-center">
                    <div className="flex justify-between items-center text-xs py-1 border-b border-surface-2/45">
                      <span className="font-semibold text-ink-body">Baseline Value</span>
                      <span className="font-mono-num font-bold text-navy-800">{goal.baseline}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1 border-b border-surface-2/45">
                      <span className="font-semibold text-ink-body">Target 2030</span>
                      <span className="font-mono-num font-bold text-emerald-800">{goal.target2030}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1">
                      <span className="font-semibold text-ink-body">Target 2047</span>
                      <span className="font-mono-num font-bold text-indigo-800">{goal.target2047}</span>
                    </div>
                  </div>
                </div>

                {/* Horizon Switcher Card */}
                <div className="bg-surface-1 border border-surface-border rounded-xl p-4 shadow-2xs">
                  <span className="text-xs font-bold text-ink-muted tracking-wider uppercase block mb-3">
                    Select Target Horizon
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setHorizon('2030')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                        horizon === '2030'
                          ? 'bg-navy-800 text-white shadow-2xs'
                          : 'bg-surface-2 text-navy-800 hover:bg-surface-border'
                      }`}
                    >
                      2030 Target
                    </button>
                    <button
                      onClick={() => setHorizon('2047')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                        horizon === '2047'
                          ? 'bg-navy-800 text-white shadow-2xs'
                          : 'bg-surface-2 text-navy-800 hover:bg-surface-border'
                      }`}
                    >
                      2047 Target
                    </button>
                  </div>
                </div>
              </div>

              {/* Trend Chart pane */}
              <div className="md:col-span-2">
                <GoalTrendChart goal={goal} trend={trend} horizon={horizon} />
              </div>
            </div>

            {/* Analysis details block */}
            <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider mb-4 border-b border-surface-2 pb-2">
                Compound Annual Growth Rate (CAGR) Performance Analysis
              </h3>

              {!goal.hasCagrAnalysis ? (
                <div className="py-8 text-center text-xs text-ink-muted font-medium">
                  Detailed CAGR analysis is not available for this macro goal category.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-surface-border text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                        <th className="py-2 px-3">Horizon Year</th>
                        <th className="py-2 px-3 text-right">Target Value</th>
                        <th className="py-2 px-3 text-right">Current CAGR</th>
                        <th className="py-2 px-3 text-right">Required CAGR</th>
                        <th className="py-2 px-3 text-center">Projected Achievement Year</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-2 text-xs font-semibold text-ink-body">
                      {/* 2030 CAGR row */}
                      <tr className={horizon === '2030' ? 'bg-navy-50/50' : ''}>
                        <td className="py-3 px-3 font-bold">2030 Targets</td>
                        <td className="py-3 px-3 text-right font-mono-num">{goal.target2030}</td>
                        <td className="py-3 px-3 text-right font-mono-num text-navy-600">
                          {goal.cagr.currentCagr !== null ? `${(goal.cagr.currentCagr * 100).toFixed(2)}%` : 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono-num text-saffron-600">
                          {goal.cagr.recommendedCagr2030 !== null ? `${(goal.cagr.recommendedCagr2030 * 100).toFixed(2)}%` : 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono-num font-bold text-navy-800">
                          {goal.cagr.targetAchievement2030 || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md border ${STATUS_STYLE_MAP[goal.status2030]?.bg} ${STATUS_STYLE_MAP[goal.status2030]?.text} ${STATUS_STYLE_MAP[goal.status2030]?.border}`}>
                            {goal.status2030.split(' (')[0]}
                          </span>
                        </td>
                      </tr>
                      {/* 2047 CAGR row */}
                      <tr className={horizon === '2047' ? 'bg-navy-50/50' : ''}>
                        <td className="py-3 px-3 font-bold">2047 Targets</td>
                        <td className="py-3 px-3 text-right font-mono-num">{goal.target2047}</td>
                        <td className="py-3 px-3 text-right font-mono-num text-navy-600">
                          {goal.cagr.currentCagr !== null ? `${(goal.cagr.currentCagr * 100).toFixed(2)}%` : 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono-num text-saffron-600">
                          {goal.cagr.recommendedCagr2047 !== null ? `${(goal.cagr.recommendedCagr2047 * 100).toFixed(2)}%` : 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono-num font-bold text-navy-800">
                          {goal.cagr.targetAchievement2047 || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md border ${STATUS_STYLE_MAP[goal.status2047]?.bg} ${STATUS_STYLE_MAP[goal.status2047]?.text} ${STATUS_STYLE_MAP[goal.status2047]?.border}`}>
                            {goal.status2047.split(' (')[0]}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Best practices tab view */
          <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-4 border-b border-surface-2 pb-2">
              <Compass className="w-4 h-4 text-navy-600" />
              <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider">
                Detailed Policy Case Studies
              </h3>
            </div>
            
            <p className="text-xs text-ink-muted mb-4 font-medium">
              We compile best practices, national frameworks, and successful pilots implemented inside Gujarat or peer states that positively affect indicators under the theme <span className="font-bold text-navy-800">"{goal.theme}"</span>.
            </p>

            <div className="space-y-4">
              {initiatives.map((initiative, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-surface-0 border border-surface-border flex gap-3 items-start hover:shadow-2xs transition">
                  <div className="w-6 h-6 rounded-full bg-navy-800/10 text-navy-800 font-mono-num font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-ink-body">
                      {initiative.split(' - ')[0]}
                    </p>
                    {initiative.includes(' - ') && (
                      <p className="text-[10px] text-ink-muted mt-1">
                        {initiative.split(' - ')[1]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Initiatives & Related Delayed KPIs grid */}
        {activeTab === 'analysis' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Initiatives */}
            <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs flex flex-col">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-2">
                <Award className="w-4 h-4 text-navy-600" />
                <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider">
                  Government Best Practices & Initiatives
                </h4>
              </div>
              <ul className="space-y-2 flex-1 flex flex-col justify-center">
                {initiatives.slice(0, 3).map((ini, idx) => (
                  <li key={idx} className="text-xs text-ink-body leading-relaxed flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 mt-1.5 flex-shrink-0" />
                    <span className="font-semibold">{ini}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => setActiveTab('best_studies')}
                className="text-[10px] font-bold text-navy-800 hover:text-navy-600 transition uppercase mt-4 block text-left"
              >
                View All Case Studies &rarr;
              </button>
            </div>

            {/* Top Delayed KPIs under same theme */}
            <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs flex flex-col">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-2">
                <AlertCircle className="w-4 h-4 text-status-critical" />
                <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider">
                  Top Delayed KPIs in Theme
                </h4>
              </div>
              
              <div className="flex-1 overflow-y-auto divide-y divide-surface-2 pr-1">
                {relatedDelayedGoals.length === 0 ? (
                  <div className="py-6 text-center text-[10px] text-ink-muted font-medium">
                    No delayed indicators in this theme segment.
                  </div>
                ) : (
                  relatedDelayedGoals.map((g) => {
                    const style = STATUS_STYLE_MAP[g.status2030] || {}
                    const gap = g.gap2030Ratio !== null ? `${(g.gap2030Ratio * 100).toFixed(0)}%` : 'N/A'

                    return (
                      <div 
                        key={g.mgCode}
                        onClick={() => navigate(`/goal/${g.mgCode}`)}
                        className="py-2 flex items-center justify-between gap-3 hover:bg-surface-0 rounded-sm cursor-pointer transition"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-ink-body truncate" title={g.macroGoal}>
                            {g.macroGoal}
                          </p>
                          <p className="text-[9px] font-mono-num text-ink-muted">
                            Code: {g.mgCode} • Gap: {gap}
                          </p>
                        </div>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-sm flex-shrink-0 ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
