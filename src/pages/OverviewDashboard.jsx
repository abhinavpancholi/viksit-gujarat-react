import React, { useMemo, useState } from 'react'
import { Building2, Layers, Target, Trophy, SlidersHorizontal } from 'lucide-react'
import { useFilterStore } from '../context/FilterStore'
import FilterBar from '../components/layout/FilterBar'
import KpiCard from '../components/kpi/KpiCard'
import StatusSummaryCard from '../components/kpi/StatusSummaryCard'
import ProgressDonut from '../components/charts/ProgressDonut'
import PillarBarChart from '../components/charts/PillarBarChart'
import ThemeTreeMap from '../components/charts/ThemeTreeMap'
import AtRiskTable from '../components/charts/AtRiskTable'

// Mapping actual themes to pillars
const THEME_PILLAR_MAP = {
  'Healthcare and Nutrition for all': 'Empowered Citizen - Living Well',
  'Gujarat as Tourism Hub': 'Thriving Economy - Earning Well',
  'Agriculture, Irrigation and Rural Development': 'Thriving Economy - Earning Well',
  'Human Capital: Education and Skilling': 'Empowered Citizen - Living Well',
  'Art Culture and Sports': 'Empowered Citizen - Living Well',
  'Nari Shakti: Women-led Development': 'Empowered Citizen - Living Well',
  'Transport and Logistics Infrastructure': 'Key Enablers',
  'City Agglomerations: Vibrant Socio-Economic Epicenters': 'Key Enablers',
  'Industries of the Future': 'Thriving Economy - Earning Well',
  'Services of the Future': 'Thriving Economy - Earning Well',
  'Governance 2.0: Reform, Perform and Transform': 'Key Enablers'
}

export default function OverviewDashboard() {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const {
    trendData,
    macroGoals,
    getFilteredGoals,
    setTheme,
    pillar,
    setPillar,
    status2030,
    setStatus2030,
    status2047,
    setStatus2047,
    theme,
    resetFilters,
    searchQuery
  } = useFilterStore()

  const filteredGoals = getFilteredGoals()

  // Dynamic KPI Aggregations based on filtered dataset
  const kpis = useMemo(() => {
    const pillars = new Set()
    const themes = new Set()
    let nearAchievement2030 = 0
    let nearAchievement2047 = 0

    filteredGoals.forEach((goal) => {
      if (goal.pillar) pillars.add(goal.pillar)
      if (goal.theme) themes.add(goal.theme)
      if (goal.status2030 && goal.status2030.startsWith('On Track')) nearAchievement2030++
      if (goal.status2047 && goal.status2047.startsWith('On Track')) nearAchievement2047++
    })

    return {
      pillarsCount: pillars.size,
      themesCount: themes.size,
      goalsCount: filteredGoals.length,
      nearAchievement2030,
      nearAchievement2047
    }
  }, [filteredGoals])

  // Count goals by status for donuts
  const statusCounts2047 = useMemo(() => {
    return filteredGoals.reduce((acc, goal) => {
      acc[goal.status2047] = (acc[goal.status2047] || 0) + 1
      return acc
    }, {})
  }, [filteredGoals])

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (pillar !== 'All') count++
    if (theme !== 'All') count++
    if (status2030 !== 'All') count++
    if (status2047 !== 'All') count++
    if (searchQuery && searchQuery.trim() !== '') count++
    return count
  }, [pillar, theme, status2030, status2047, searchQuery])

  // Generate lists of goals/attributes for KPI hover tooltips
  const kpiTooltips = useMemo(() => {
    const pillarsList = Array.from(new Set(filteredGoals.map((g) => g.pillar)))

    // Themes: Pillar | Theme (no Code)
    const themesList = Array.from(new Set(filteredGoals.map((g) => g.theme))).map((themeName) => ({
      name: themeName,
      pillar: THEME_PILLAR_MAP[themeName] || 'N/A'
    }))

    // Goals: Pillar | Theme | Macro Goal (no Code)
    const goalsList = filteredGoals.map((g) => ({
      name: g.macroGoal,
      theme: g.theme,
      pillar: g.pillar
    }))

    // Near Achievement 2030: same structure as goals
    const nearAchievement2030List = filteredGoals
      .filter((g) => g.status2030 && g.status2030.startsWith('On Track'))
      .map((g) => ({ name: g.macroGoal, theme: g.theme, pillar: g.pillar }))

    // Near Achievement 2047: same structure as goals
    const nearAchievement2047List = filteredGoals
      .filter((g) => g.status2047 && g.status2047.startsWith('On Track'))
      .map((g) => ({ name: g.macroGoal, theme: g.theme, pillar: g.pillar }))

    return {
      pillars: pillarsList,
      themes: themesList,
      goals: goalsList,
      near2030: nearAchievement2030List,
      near2047: nearAchievement2047List
    }
  }, [filteredGoals])

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col gap-2.5 min-h-0 overflow-hidden -mt-4">
      {/* Dashboard Top Header Control Bar */}
      <div className="flex items-center justify-between border-b border-surface-border pb-1 flex-shrink-0">
        <h2 className="text-xs font-bold text-navy-800 uppercase tracking-wider">
          Overview Dashboard
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border bg-surface-1 hover:bg-surface-2 text-ink-body hover:text-navy-800 text-xs font-bold shadow-2xs hover:shadow-xs transition cursor-pointer active:scale-98"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-navy-600" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-navy-600 text-white rounded-full px-1.5 py-0.2 text-[9px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Drawer Slideover */}
      <FilterBar isOpen={isFilterDrawerOpen} onClose={() => setIsFilterDrawerOpen(false)} />

      {/* 5 KPI Cards Row - Extremely Compact Height */}
      <div className="grid grid-cols-5 gap-3 flex-shrink-0 h-[72px] min-h-0">
        <KpiCard
          title="Pillars"
          value={kpis.pillarsCount}
          icon={Building2}
          colorClass="bg-purple-500/10 text-purple-600"
          borderClass="border-purple-500/20"
          tooltipItems={kpiTooltips.pillars}
        />
        <KpiCard
          title="Themes"
          value={kpis.themesCount}
          icon={Layers}
          colorClass="bg-blue-500/10 text-blue-600"
          borderClass="border-blue-500/20"
          tooltipItems={kpiTooltips.themes}
          tooltipMode="themes"
        />
        <KpiCard
          title="Macro Goals"
          value={kpis.goalsCount}
          icon={Target}
          colorClass="bg-emerald-500/10 text-emerald-600"
          borderClass="border-emerald-500/20"
          tooltipItems={kpiTooltips.goals}
          tooltipMode="goals"
        />
        <KpiCard
          title="Near Achievement (2030)"
          value={kpis.nearAchievement2030}
          icon={Trophy}
          colorClass="bg-saffron-500/10 text-saffron-600"
          borderClass="border-saffron-500/20"
          tooltipItems={kpiTooltips.near2030}
          tooltipMode="near"
        />
        <KpiCard
          title="Near Achievement (2047)"
          value={kpis.nearAchievement2047}
          icon={Trophy}
          colorClass="bg-rose-500/10 text-rose-600"
          borderClass="border-rose-500/20"
          tooltipItems={kpiTooltips.near2047}
          tooltipMode="near"
        />
      </div>

      {/* Middle Row: Status Summary & 2047 Donut */}
      <div className="grid grid-cols-12 gap-3 flex-shrink-0 h-[168px] min-h-0">
        <div className="col-span-8 h-full min-h-0">
          <StatusSummaryCard
            goals={filteredGoals}
            activeStatus={status2030}
            onSelectStatus={setStatus2030}
          />
        </div>

        <div className="col-span-4 h-full min-h-0">
          <ProgressDonut
            title="Progress Toward 2047 Target"
            counts={statusCounts2047}
            activeStatus={status2047}
            onSelectStatus={setStatus2047}
          />
        </div>
      </div>

      {/* Bottom Chart Row: Interactive Pillar Bar, Tree Map, At Risk Table */}
      <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
        <div className="col-span-3 h-full min-h-0">
          <PillarBarChart goals={filteredGoals} activePillar={pillar} onSelectPillar={setPillar} />
        </div>

        <div className="col-span-5 h-full min-h-0">
          <ThemeTreeMap 
            goals={macroGoals}
            activeTheme={theme}
            onSelectTheme={setTheme}
            onResetFilters={resetFilters}
          />
        </div>

        <div className="col-span-4 h-full min-h-0">
          <AtRiskTable goals={filteredGoals} />
        </div>
      </div>
    </div>
  )
}
