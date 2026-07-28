import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import fruitDataBundle from '../data/fruitYieldData.json'
import FruitAreaChart from '../components/charts/FruitAreaChart'
import GujaratDistrictMap from '../components/charts/GujaratDistrictMap'
import WaterfallYieldChart from '../components/charts/WaterfallYieldChart'

const ALL_FYS = [
  '2015-2016',
  '2016-2017',
  '2017-2018',
  '2018-2019',
  '2019-2020',
  '2020-2021',
  '2021-2022',
  '2022-2023',
  '2023-2024',
  '2024-2025'
]

export default function FruitYieldDashboard() {
  const navigate = useNavigate()

  // ── State Management ──
  // selectedFYs: Set of selected financial year strings
  const [selectedFYs, setSelectedFYs] = useState(new Set(ALL_FYS))
  
  // selectedDistrict: null (all districts) or district name string (e.g. "Ahmedabad")
  const [selectedDistrict, setSelectedDistrict] = useState(null)

  // Raw datasets from JSON asset
  const yearlyYield = fruitDataBundle.yearlyYield || []
  const staticTooltip = fruitDataBundle.staticTooltip || []

  // ── Toggle Year Slicer ──
  const toggleFY = (fy) => {
    setSelectedFYs(prev => {
      // If currently ALL 10 years are selected, clicking a single year selects ONLY that year!
      if (prev.size === ALL_FYS.length) {
        return new Set([fy])
      }
      const next = new Set(prev)
      if (next.has(fy)) {
        if (next.size > 1) next.delete(fy)
      } else {
        next.add(fy)
      }
      return next
    })
  }

  const selectAllFYs = () => {
    setSelectedFYs(new Set(ALL_FYS))
  }

  // ── Central Data Filtering Engine ──
  // Power BI Measure: SelectedFY = SELECTEDVALUE(Yield_Fruit_MT_Per_Ha[FY], "2024-2025")
  const targetFYForKPI = useMemo(() => {
    if (selectedFYs.size === 1) {
      return Array.from(selectedFYs)[0]
    }
    return "2024-2025" // Fallback matching DAX SELECTEDVALUE
  }, [selectedFYs])

  // Aggregate Top KPI Cards according to exact Power BI Measures
  const kpis = useMemo(() => {
    const kpiRows = yearlyYield.filter(r => {
      const matchesFY = r.fy === targetFYForKPI
      const matchesDistrict = selectedDistrict 
        ? r.district.toLowerCase() === selectedDistrict.toLowerCase()
        : true
      return matchesFY && matchesDistrict
    })

    if (kpiRows.length === 0) {
      return { totalArea: '0.00', totalProd: '0.00', yieldVal: '0.00' }
    }

    const sumArea = kpiRows.reduce((acc, r) => acc + r.area, 0)
    const sumProd = kpiRows.reduce((acc, r) => acc + r.production, 0)
    const yieldVal = sumArea > 0 ? (sumProd / sumArea) : 0

    const formatMetric = (val) => {
      if (val >= 1000) {
        return (val / 1000).toFixed(2) + 'K'
      }
      return val.toFixed(2)
    }

    return {
      totalArea: formatMetric(sumArea),
      totalProd: formatMetric(sumProd),
      yieldVal: yieldVal.toFixed(2)
    }
  }, [yearlyYield, targetFYForKPI, selectedDistrict])

  // ── Prepare Trend Chart Datasets (Aggregated by FY) ──
  const trendChartData = useMemo(() => {
    // Collect rows matching selectedFYs and selectedDistrict
    const relevantRows = yearlyYield.filter(r => {
      const matchesFY = selectedFYs.has(r.fy)
      const matchesDistrict = selectedDistrict 
        ? r.district.toLowerCase() === selectedDistrict.toLowerCase()
        : true
      return matchesFY && matchesDistrict
    })

    // Group by FY
    const fyGroups = {}
    ALL_FYS.forEach(fy => {
      if (selectedFYs.has(fy)) {
        fyGroups[fy] = { area: 0, production: 0, count: 0 }
      }
    })

    relevantRows.forEach(r => {
      if (fyGroups[r.fy]) {
        fyGroups[r.fy].area += r.area
        fyGroups[r.fy].production += r.production
        fyGroups[r.fy].count += 1
      }
    })

    return ALL_FYS.filter(fy => selectedFYs.has(fy)).map(fy => {
      const g = fyGroups[fy] || { area: 0, production: 0 }
      const area = g.area
      const production = g.production
      const yVal = area > 0 ? (production / area) : 0

      return {
        fy,
        area: Math.round(area),
        production: Math.round(production),
        yield: parseFloat(yVal.toFixed(2))
      }
    })
  }, [yearlyYield, selectedFYs, selectedDistrict])

  // ── Prepare District Map Dataset ──
  // Computes average Yield Range and metrics for each district across selected FYs
  const districtDataMap = useMemo(() => {
    const dMap = {}
    yearlyYield.forEach(r => {
      if (!selectedFYs.has(r.fy)) return
      if (!dMap[r.district]) {
        dMap[r.district] = { totalArea: 0, totalProd: 0, count: 0 }
      }
      dMap[r.district].totalArea += r.area
      dMap[r.district].totalProd += r.production
      dMap[r.district].count += 1
    })

    const finalMap = {}
    Object.entries(dMap).forEach(([dName, val]) => {
      const avgArea = val.totalArea / (val.count || 1)
      const avgProd = val.totalProd / (val.count || 1)
      const yVal = avgArea > 0 ? (avgProd / avgArea) : 0

      // Dynamic yield range classification based on exact calculated yield!
      let yieldRange = 'Between 10 and 15 MT'
      if (yVal <= 10) yieldRange = 'Less than Equal to 10 MT'
      else if (yVal <= 15) yieldRange = 'Between 10 and 15 MT'
      else if (yVal <= 20) yieldRange = 'Between 15 and 20 MT'
      else yieldRange = 'More than 20'

      finalMap[dName] = {
        area: avgArea,
        production: avgProd,
        yield: yVal,
        yieldRange
      }
    })
    return finalMap
  }, [yearlyYield, selectedFYs])

  const isAllFYsSelected = selectedFYs.size === ALL_FYS.length

  return (
    <div className="h-[calc(100vh-68px)] flex flex-col min-h-0 overflow-hidden bg-surface-0 font-sans antialiased text-ink-body">
      {/* ═══════════ TOP CONTROL BAR (Single Unified Row) ═══════════ */}
      <div className="bg-white border-b border-surface-border px-4 py-1.5 flex-shrink-0 shadow-xs">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Main Title */}
          <div className="flex-shrink-0">
            <h1 className="font-display text-2xl font-extrabold text-navy-800 tracking-tight">
              Yield of Fruits (MT/Ha)
            </h1>
          </div>

          {/* FY Multi-Select Slicer Bar */}
          <div className="flex-1 max-w-3xl overflow-x-auto bg-surface-1 border border-surface-border rounded-md p-0.5 flex items-center gap-1 shadow-xs">
            <button
              onClick={selectAllFYs}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer flex-shrink-0 ${
                isAllFYsSelected 
                  ? 'bg-navy-800 text-white shadow-xs' 
                  : 'bg-white text-ink-body hover:bg-surface-2 border border-surface-border'
              }`}
            >
              Select all
            </button>

            {ALL_FYS.map(fy => {
              const isSelected = selectedFYs.has(fy)
              return (
                <button
                  key={fy}
                  onClick={() => toggleFY(fy)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer flex-shrink-0 ${
                    isSelected 
                      ? 'bg-navy-800 text-white shadow-xs' 
                      : 'bg-white text-ink-muted hover:text-navy-800 border border-surface-border'
                  }`}
                >
                  {fy}
                </button>
              )
            })}
          </div>

          {/* Top Right KPI Box (3 Summary Metrics - 2 Line Labels) */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-md px-1 py-1 flex items-center justify-between gap-1 shadow-xs min-w-[400px] flex-shrink-0">
            <div className="text-center flex-1 border-r border-amber-200/80 pr-2">
              <p className="font-display text-sm font-extrabold text-navy-800 font-mono-num leading-tight">
                {kpis.totalArea}
              </p>
              <p className="text-[8.5px] font-bold text-slate-600 uppercase tracking-wider leading-tight">
                TOTAL AREA<br />(00 HA)
              </p>
            </div>

            <div className="text-center flex-1 border-r border-amber-200/80 pr-2">
              <p className="font-display text-sm font-extrabold text-navy-800 font-mono-num leading-tight">
                {kpis.totalProd}
              </p>
              <p className="text-[8.5px] font-bold text-slate-600 uppercase tracking-wider leading-tight">
                TOTAL PRODUCTION<br />(00 MT)
              </p>
            </div>

            <div className="text-center flex-1">
              <p className="font-display text-sm font-extrabold text-navy-800 font-mono-num leading-tight">
                {kpis.yieldVal}
              </p>
              <p className="text-[8.5px] font-bold text-slate-600 uppercase tracking-wider leading-tight">
                YIELD<br />(MT/HA.)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ MAIN DASHBOARD CONTENT GRID (5 CHARTS) ═══════════ */}
      <main className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto p-2.5 grid grid-cols-12 gap-2.5 overflow-hidden">
        
        {/* Left Column (3 Stacked Trend Charts) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-2 min-h-0 h-full">
          
          {/* Chart 1: Total Area (00 Hectare) */}
          <div className="flex-1 min-h-0">
            <FruitAreaChart
              title="Total Area (00 Hectare)"
              data={trendChartData}
              dataKey="area"
              theme="area"
            />
          </div>

          {/* Chart 2: Production in 00 M.T. */}
          <div className="flex-1 min-h-0">
            <FruitAreaChart
              title="Production in 00 M.T."
              data={trendChartData}
              dataKey="production"
              theme="production"
            />
          </div>

          {/* Chart 3: Yield of Fruits(MT/Ha) */}
          <div className="flex-1 min-h-0">
            <FruitAreaChart
              title="Yield of Fruits(MT/Ha)"
              data={trendChartData}
              dataKey="yield"
              theme="yield"
            />
          </div>
        </div>

        {/* Right Column (Map & Waterfall Chart) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-2 min-h-0 h-full">
          
          {/* Chart 4: Gujarat District Map (Top Right) */}
          <div className="flex-[1.1] min-h-0">
            <GujaratDistrictMap
              districtDataMap={districtDataMap}
              selectedDistrict={selectedDistrict}
              onDistrictSelect={setSelectedDistrict}
            />
          </div>

          {/* Chart 5: Waterfall YoY Production Chart (Bottom Right) */}
          <div className="flex-1 min-h-0">
            <WaterfallYieldChart
              yearlyYieldData={yearlyYield}
              staticTooltipData={staticTooltip}
              selectedFYs={selectedFYs}
              selectedDistrict={selectedDistrict}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
