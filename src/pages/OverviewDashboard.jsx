import React, { useMemo } from 'react'
import { Building2, Layers, Target, Trophy } from 'lucide-react'
import { useFilterStore } from '../context/FilterStore'
import FilterBar from '../components/layout/FilterBar'
import KpiCard from '../components/kpi/KpiCard'
import StatusSummaryCard from '../components/kpi/StatusSummaryCard'
import ProgressDonut from '../components/charts/ProgressDonut'
import PillarBarChart from '../components/charts/PillarBarChart'
import ThemeTreeMap from '../components/charts/ThemeTreeMap'
import AtRiskTable from '../components/charts/AtRiskTable'
import AllYearsTrendChart from '../components/charts/AllYearsTrendChart'

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
    resetFilters
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
  const statusCounts2030 = useMemo(() => {
    return filteredGoals.reduce((acc, goal) => {
      acc[goal.status2030] = (acc[goal.status2030] || 0) + 1
      return acc
    }, {})
  }, [filteredGoals])

  const statusCounts2047 = useMemo(() => {
    return filteredGoals.reduce((acc, goal) => {
      acc[goal.status2047] = (acc[goal.status2047] || 0) + 1
      return acc
    }, {})
  }, [filteredGoals])

  // Generate lists of goals/attributes for KPI hover tooltips (tabular design layout)
  const kpiTooltips = useMemo(() => {
    const pillarsList = Array.from(new Set(filteredGoals.map((g) => g.pillar)))
    
    // Map theme strings to objects to render in tabular layout
    const themesList = Array.from(new Set(filteredGoals.map((g) => g.theme))).map((themeName) => ({
      code: 'Theme',
      name: themeName,
      pillar: THEME_PILLAR_MAP[themeName] || 'N/A'
    }))
    
    const goalsList = filteredGoals.map((g) => ({
      code: g.mgCode,
      name: g.macroGoal,
      pillar: g.pillar
    }))
    
    const nearAchievement2030List = filteredGoals
      .filter((g) => g.status2030 && g.status2030.startsWith('On Track'))
      .map((g) => ({ code: g.mgCode, name: g.macroGoal, pillar: g.pillar }))
      
    const nearAchievement2047List = filteredGoals
      .filter((g) => g.status2047 && g.status2047.startsWith('On Track'))
      .map((g) => ({ code: g.mgCode, name: g.macroGoal, pillar: g.pillar }))

    return {
      pillars: pillarsList,
      themes: themesList,
      goals: goalsList,
      near2030: nearAchievement2030List,
      near2047: nearAchievement2047List
    }
  }, [filteredGoals])

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Filters Section */}
      <FilterBar />

      {/* 5 KPI Cards Row with Hover Tooltips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Pillars"
          value={kpis.pillarsCount}
          icon={Building2}
          colorClass="bg-purple-500/10 text-purple-600"
          borderClass="border-purple-500/20"
          tooltipItems={kpiTooltips.pillars}
        />
        <KpiCard
          title="Total Themes"
          value={kpis.themesCount}
          icon={Layers}
          colorClass="bg-blue-500/10 text-blue-600"
          borderClass="border-blue-500/20"
          tooltipItems={kpiTooltips.themes}
        />
        <KpiCard
          title="Total Macro Goals"
          value={kpis.goalsCount}
          icon={Target}
          colorClass="bg-emerald-500/10 text-emerald-600"
          borderClass="border-emerald-500/20"
          tooltipItems={kpiTooltips.goals}
        />
        <KpiCard
          title="Near Achievement (2030)"
          value={kpis.nearAchievement2030}
          icon={Trophy}
          colorClass="bg-saffron-500/10 text-saffron-600"
          borderClass="border-saffron-500/20"
          tooltipItems={kpiTooltips.near2030}
        />
        <KpiCard
          title="Near Achievement (2047)"
          value={kpis.nearAchievement2047}
          icon={Trophy}
          colorClass="bg-rose-500/10 text-rose-600"
          borderClass="border-rose-500/20"
          tooltipItems={kpiTooltips.near2047}
        />
      </div>

      {/* Middle Row: Status Summary & Donut Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Summary with Goal Hover list */}
        <div className="lg:col-span-6 xl:col-span-6">
          <StatusSummaryCard goals={filteredGoals} />
        </div>
        
        {/* 2030 Donut (Click to filter status) */}
        <div className="lg:col-span-3 xl:col-span-3">
          <ProgressDonut 
            title="Progress Toward 2030 Target" 
            counts={statusCounts2030} 
            activeStatus={status2030}
            onSelectStatus={setStatus2030}
          />
        </div>

        {/* 2047 Donut (Click to filter status) */}
        <div className="lg:col-span-3 xl:col-span-3">
          <ProgressDonut 
            title="Progress Toward 2047 Target" 
            counts={statusCounts2047} 
            activeStatus={status2047}
            onSelectStatus={setStatus2047}
          />
        </div>
      </div>

      {/* Bottom Chart Row: Interactive Pillar Bar, Tree Map, At Risk Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pillar Bar (Click to Cross-Highlight) */}
        <div className="lg:col-span-4 xl:col-span-3">
          <PillarBarChart goals={filteredGoals} activePillar={pillar} onSelectPillar={setPillar} />
        </div>

        {/* Theme Tree Map (Vibrant Colors, Click Toggle Deselect) */}
        <div className="lg:col-span-8 xl:col-span-5">
          <ThemeTreeMap 
            goals={macroGoals}
            activeTheme={theme}
            onSelectTheme={setTheme}
            onResetFilters={resetFilters}
          />
        </div>

        {/* At Risk Table */}
        <div className="lg:col-span-12 xl:col-span-4">
          <AtRiskTable goals={filteredGoals} />
        </div>
      </div>

      {/* Full-width Line Chart */}
      <div className="w-full">
        <AllYearsTrendChart goals={filteredGoals} trendData={trendData} />
      </div>
    </div>
  )
}
