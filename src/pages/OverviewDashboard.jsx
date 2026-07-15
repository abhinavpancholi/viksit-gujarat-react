import React, { useMemo } from 'react'
import { Building2, Layers, Target, Trophy } from 'lucide-react'
import { useFilterStore } from '../context/FilterStore'
import FilterBar from '../components/layout/FilterBar'
import KpiCard from '../components/kpi/KpiCard'
import StatusSummaryCard from '../components/kpi/StatusSummaryCard'
import ProgressDonut from '../components/charts/ProgressDonut'
import PillarBarChart from '../components/charts/PillarBarChart'
import ThemeTileGrid from '../components/charts/ThemeTileGrid'
import AtRiskTable from '../components/charts/AtRiskTable'
import AllYearsTrendChart from '../components/charts/AllYearsTrendChart'

export default function OverviewDashboard() {
  const {
    trendData,
    getFilteredGoals,
    setTheme
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

  // Count goals by status
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

  // Combine counts for total status summary card
  const statusSummaryCounts = useMemo(() => {
    // We average/combine or just show 2030 statuses by default (standard for overview)
    // The screenshot has a status card row called "MACRO GOALS STATUS SUMMARY (All Years)"
    // Since "All Years" isn't a single status field, we'll display 2030 statuses for overview, which represents the intermediate target
    return statusCounts2030
  }, [statusCounts2030])

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Filters Section */}
      <FilterBar />

      {/* 5 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Pillars"
          value={kpis.pillarsCount}
          icon={Building2}
          colorClass="bg-purple-500/10 text-purple-600"
          borderClass="border-purple-500/20"
        />
        <KpiCard
          title="Total Themes"
          value={kpis.themesCount}
          icon={Layers}
          colorClass="bg-blue-500/10 text-blue-600"
          borderClass="border-blue-500/20"
        />
        <KpiCard
          title="Total Macro Goals"
          value={kpis.goalsCount}
          icon={Target}
          colorClass="bg-emerald-500/10 text-emerald-600"
          borderClass="border-emerald-500/20"
        />
        <KpiCard
          title="Near Achievement (2030)"
          value={kpis.nearAchievement2030}
          icon={Trophy}
          colorClass="bg-saffron-500/10 text-saffron-600"
          borderClass="border-saffron-500/20"
        />
        <KpiCard
          title="Near Achievement (2047)"
          value={kpis.nearAchievement2047}
          icon={Trophy}
          colorClass="bg-rose-500/10 text-rose-600"
          borderClass="border-rose-500/20"
        />
      </div>

      {/* Middle Row: Status Summary & Donut Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Summary */}
        <div className="lg:col-span-6 xl:col-span-6">
          <StatusSummaryCard counts={statusSummaryCounts} />
        </div>
        
        {/* 2030 Donut */}
        <div className="lg:col-span-3 xl:col-span-3">
          <ProgressDonut title="Progress Toward 2030 Target" counts={statusCounts2030} />
        </div>

        {/* 2047 Donut */}
        <div className="lg:col-span-3 xl:col-span-3">
          <ProgressDonut title="Progress Toward 2047 Target" counts={statusCounts2047} />
        </div>
      </div>

      {/* Bottom Chart Row: Pillar Bar, Theme Grid, At Risk Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pillar Bar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <PillarBarChart goals={filteredGoals} />
        </div>

        {/* Theme Tile Grid */}
        <div className="lg:col-span-8 xl:col-span-5">
          <ThemeTileGrid goals={filteredGoals} onSelectTheme={setTheme} />
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
