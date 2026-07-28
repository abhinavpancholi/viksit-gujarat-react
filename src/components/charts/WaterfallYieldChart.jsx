import React, { useState, useMemo } from 'react'

export default function WaterfallYieldChart({ 
  yearlyYieldData, 
  staticTooltipData, 
  selectedFYs, 
  selectedDistrict 
}) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Compute Waterfall Bar Steps based on active filters
  const waterfallSteps = useMemo(() => {
    if (!yearlyYieldData || yearlyYieldData.length === 0) return []

    // Sort selected FYs chronologically
    const sortedFYs = Array.from(selectedFYs).sort((a, b) => {
      const yA = parseInt(a.split('-')[0]) || 0
      const yB = parseInt(b.split('-')[0]) || 0
      return yA - yB
    })

    if (sortedFYs.length === 0) return []

    const steps = []

    // ── CASE A: Single District Selected (e.g. Ahmedabad) ──
    if (selectedDistrict) {
      const distRows = yearlyYieldData.filter(
        r => r.district.toLowerCase() === selectedDistrict.toLowerCase() && selectedFYs.has(r.fy)
      )
      
      const fyMap = {}
      distRows.forEach(r => { fyMap[r.fy] = r.production })

      let prevVal = null

      sortedFYs.forEach((fy, idx) => {
        const yrLabel = fy.split('-')[0] // e.g. "2016" or "2020"
        const currentVal = fyMap[fy] || 0

        if (idx === 0) {
          // Base initial year total
          steps.push({
            topLabel: Math.round(currentVal).toLocaleString('en-IN'),
            subLabel: yrLabel,
            type: 'total',
            start: 0,
            end: currentVal,
            value: Math.round(currentVal),
            diff: currentVal
          })
          prevVal = currentVal
        } else {
          // Change step
          const diff = currentVal - (prevVal || 0)
          if (diff !== 0) {
            steps.push({
              topLabel: diff > 0 ? `+${Math.round(diff)}` : `${Math.round(diff)}`,
              subLabel: selectedDistrict,
              type: diff > 0 ? 'increase' : 'decrease',
              start: Math.min(prevVal, currentVal),
              end: Math.max(prevVal, currentVal),
              value: Math.round(diff),
              diff
            })
          }
          // Year total bar
          steps.push({
            topLabel: Math.round(currentVal).toLocaleString('en-IN'),
            subLabel: yrLabel,
            type: 'total',
            start: 0,
            end: currentVal,
            value: Math.round(currentVal),
            diff: currentVal
          })
          prevVal = currentVal
        }
      })
    } 
    // ── CASE B: All Districts Selected ──
    else {
      // Group by FY
      const fyTotals = {}
      const fyDistMap = {}

      yearlyYieldData.forEach(r => {
        if (!selectedFYs.has(r.fy)) return
        if (!fyTotals[r.fy]) fyTotals[r.fy] = 0
        fyTotals[r.fy] += r.production

        if (!fyDistMap[r.fy]) fyDistMap[r.fy] = {}
        fyDistMap[r.fy][r.district] = r.production
      })

      sortedFYs.forEach((fy, idx) => {
        const yrLabel = fy.split('-')[0]
        const currentTotal = fyTotals[fy] || 0

        if (idx === 0) {
          steps.push({
            topLabel: Math.round(currentTotal).toLocaleString('en-IN'),
            subLabel: yrLabel,
            type: 'total',
            start: 0,
            end: currentTotal,
            value: Math.round(currentTotal),
            diff: currentTotal
          })
        } else {
          const prevFY = sortedFYs[idx - 1]
          const prevTotal = fyTotals[prevFY] || 0

          // Calculate district changes between prevFY and fy
          const prevDists = fyDistMap[prevFY] || {}
          const currDists = fyDistMap[fy] || {}

          const districtDiffs = []
          const allDistNames = new Set([...Object.keys(prevDists), ...Object.keys(currDists)])
          
          allDistNames.forEach(d => {
            const p = prevDists[d] || 0
            const c = currDists[d] || 0
            const delta = c - p
            if (Math.abs(delta) > 10) {
              districtDiffs.push({ district: d, delta })
            }
          })

          // Sort by magnitude
          districtDiffs.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))

          // Take top 4-5 changes
          let runningLevel = prevTotal
          const topChanges = districtDiffs.slice(0, 5)

          topChanges.forEach(item => {
            const startLvl = item.delta > 0 ? runningLevel : runningLevel + item.delta
            const endLvl = item.delta > 0 ? runningLevel + item.delta : runningLevel
            runningLevel += item.delta

            steps.push({
              topLabel: item.delta > 0 ? `+${Math.round(item.delta)}` : `${Math.round(item.delta)}`,
              subLabel: item.district,
              type: item.delta > 0 ? 'increase' : 'decrease',
              start: startLvl,
              end: endLvl,
              value: Math.round(item.delta),
              diff: item.delta
            })
          })

          // Final year total bar
          steps.push({
            topLabel: Math.round(currentTotal).toLocaleString('en-IN'),
            subLabel: yrLabel,
            type: 'total',
            start: 0,
            end: currentTotal,
            value: Math.round(currentTotal),
            diff: currentTotal
          })
        }
      })
    }

    return steps
  }, [yearlyYieldData, selectedFYs, selectedDistrict])

  // Determine Y-axis min/max with dynamic auto-scaling baseline
  const { minY, maxY } = useMemo(() => {
    if (waterfallSteps.length === 0) return { minY: 0, maxY: 1000 }
    
    let minLvl = Infinity
    let maxLvl = -Infinity

    waterfallSteps.forEach(s => {
      // For total bars, evaluate top level (end) for baseline scaling
      const low = s.type === 'total' ? s.end : s.start
      const high = s.end
      if (low < minLvl) minLvl = low
      if (high < minLvl) minLvl = high
      if (low > maxLvl) maxLvl = low
      if (high > maxLvl) maxLvl = high
    })

    if (minLvl === Infinity) return { minY: 0, maxY: 1000 }

    // If viewing state-level totals (around 80k-95k), start baseline near 80k/84k
    if (minLvl >= 40000) {
      const calcMin = Math.floor((minLvl - 500) / 2000) * 2000 // e.g. 80,000 or 84,000
      const calcMax = Math.ceil((maxLvl + 500) / 2000) * 2000  // e.g. 98,000 or 100,000
      return { minY: Math.max(0, calcMin), maxY: calcMax }
    }

    // For single district or smaller numbers:
    const range = maxLvl - minLvl || 100
    const padding = range * 0.2
    const calcMin = Math.max(0, Math.floor((minLvl - padding) / 10) * 10)
    const calcMax = Math.ceil((maxLvl + padding) / 10) * 10

    return { minY: calcMin, maxY: Math.max(10, calcMax) }
  }, [waterfallSteps])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPos({
      x: Math.min(e.clientX - rect.left + 15, rect.width - 440),
      y: Math.max(e.clientY - rect.top - 120, 10)
    })
  }

  // Width calculation for horizontal scroll (approx 60px per bar)
  const barWidth = 40
  const gap = 20
  const totalSvgWidth = Math.max(700, waterfallSteps.length * (barWidth + gap) + 60)

  return (
    <div className="relative w-full h-full flex flex-col bg-white border border-surface-border rounded-xl p-3 shadow-xs min-h-[360px]">
      {/* Title & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <h3 className="font-display text-sm font-bold text-navy-800">
          District-wise Increase and Decrease in Production Between Financial Years
        </h3>
        <div className="flex items-center gap-3 text-[10px] font-bold flex-shrink-0">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" /> Increase</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500 rounded-xs" /> Decrease</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-xs" /> Total</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-xs" /> Other</span>
        </div>
      </div>

      {/* Main Chart Container with Sticky Y-Axis & Horizontal Scroll */}
      <div className="relative flex-1 w-full min-h-0 flex items-stretch border-t border-slate-100 pt-2 cursor-pointer">
        {waterfallSteps.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-ink-muted">
            No data available for the selected filters.
          </div>
        ) : (
          <>
            {/* Sticky Y-Axis Label Column */}
            <div className="w-[52px] flex-shrink-0 h-full flex flex-col justify-between pr-2 border-r border-slate-200 bg-white z-10 select-none pb-12">
              {[1, 0.75, 0.5, 0.25, 0].map((ratio, i) => {
                const yVal = minY + (maxY - minY) * ratio
                return (
                  <span key={i} className="text-[10px] font-mono-num font-bold text-slate-500 text-right">
                    {yVal >= 1000 ? `${(yVal / 1000).toFixed(0)}K` : Math.round(yVal)}
                  </span>
                )
              })}
            </div>

            {/* Scrollable Waterfall SVG Area (Shows max ~4 years visible at a time) */}
            <div className="flex-1 min-w-0 h-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50">
              <svg className="h-full" style={{ width: `${totalSvgWidth}px` }} viewBox={`0 0 ${totalSvgWidth} 280`}>
                {/* Horizontal Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const yPos = 220 - ratio * 190
                  return (
                    <line key={i} x1="0" y1={yPos} x2={totalSvgWidth} y2={yPos} stroke="#F1F5F9" strokeDasharray="3 3" />
                  )
                })}

                {/* X-Axis Baseline */}
                <line x1="0" y1="220" x2={totalSvgWidth} y2="220" stroke="#CBD5E1" strokeWidth="1.5" />

                {/* Waterfall Bars */}
                {waterfallSteps.map((step, idx) => {
                  const xPos = 25 + idx * (barWidth + gap)

                  // Determine start and end levels relative to minY baseline
                  const startLvl = step.type === 'total' ? minY : step.start
                  const endLvl = step.end

                  const yStart = 220 - ((startLvl - minY) / (maxY - minY)) * 190
                  const yEnd = 220 - ((endLvl - minY) / (maxY - minY)) * 190

                  const barHeight = Math.max(Math.abs(yStart - yEnd), 6)
                  const barY = Math.min(yStart, yEnd)

                  let barColor = '#3B82F6' // Total Blue
                  if (step.type === 'increase') barColor = '#22C55E' // Green
                  if (step.type === 'decrease') barColor = '#EF4444' // Red
                  if (step.type === 'other') barColor = '#EAB308' // Yellow

                  return (
                    <g 
                      key={idx} 
                      className="hover:opacity-85 transition-opacity cursor-pointer"
                      onMouseEnter={(e) => {
                        setShowTooltip(true)
                        handleMouseMove(e)
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      {/* Top Numeric Value Label */}
                      <text
                        x={xPos + barWidth / 2}
                        y={barY - 6}
                        fill="#1E293B"
                        fontSize="10"
                        fontWeight="800"
                        textAnchor="middle"
                        className="font-mono-num"
                      >
                        {step.topLabel}
                      </text>

                      {/* Waterfall Bar */}
                      <rect
                        x={xPos}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        fill={barColor}
                        rx="4"
                        ry="4"
                      />

                      {/* Sublabel below X-Axis (Year / District Name) */}
                      <text
                        x={xPos + barWidth / 2}
                        y="238"
                        fill="#334155"
                        fontSize="10"
                        fontWeight="700"
                        textAnchor="end"
                        transform={`rotate(-40, ${xPos + barWidth / 2}, 238)`}
                      >
                        {step.subLabel}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </>
        )}

        {/* ── STATIC TOOLTIP TABLE FROM SHEET 2 ── */}
        {showTooltip && staticTooltipData && staticTooltipData.length > 0 && (
          <div
            className="pointer-events-none absolute z-40 bg-white border border-navy-800 shadow-2xl rounded-lg p-3 text-xs w-[420px]"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            {/* Tooltip Header */}
            <div className="bg-teal-700 text-white font-bold text-xs p-2 rounded-t-md mb-1 text-center">
              Surat - Area('00' Ha,) and Production('00' MT)
            </div>

            {/* Tooltip Table */}
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-teal-600 text-white text-[10px]">
                  <th className="p-1 border border-teal-700">Taluka</th>
                  <th className="p-1 border border-teal-700 text-right">2019-20 - Area</th>
                  <th className="p-1 border border-teal-700 text-right">2019-20 - Prod</th>
                  <th className="p-1 border border-teal-700 text-right">2020-21 - Area</th>
                  <th className="p-1 border border-teal-700 text-right">2020-21 - Prod</th>
                  <th className="p-1 border border-teal-700 text-right">% Change</th>
                </tr>
              </thead>
              <tbody>
                {staticTooltipData.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="p-1 font-bold border border-slate-200">{row.taluka}</td>
                    <td className="p-1 text-right font-mono-num border border-slate-200">{row.area1920.toFixed(2)}</td>
                    <td className="p-1 text-right font-mono-num border border-slate-200">{row.prod1920.toFixed(2)}</td>
                    <td className="p-1 text-right font-mono-num border border-slate-200">{row.area2021.toFixed(2)}</td>
                    <td className="p-1 text-right font-mono-num border border-slate-200">{row.prod2021.toFixed(2)}</td>
                    <td className={`p-1 text-right font-mono-num font-bold border border-slate-200 ${row.pctChange < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {row.pctChange ? (row.pctChange * 100).toFixed(2) + '%' : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
