import React, { useState, useEffect, useMemo, useRef } from 'react'
import { getExcelDistrictName, getTopoDistrictName, normalizeDistrict } from '../../utils/districtNameMapper'

// Yield range color mapping matching Power BI mockup
const YIELD_COLOR_MAP = {
  'Between 10 and 15 MT': '#3B82F6',       // Bright Blue
  'Between 15 and 20 MT': '#1E3A8A',       // Dark Navy Blue
  'Less than Equal to 10 MT': '#F97316',   // Orange
  'More than 20': '#7C3AED'                // Purple
}

const DEFAULT_COLOR = '#94A3B8'

export default function GujaratDistrictMap({ 
  districtDataMap, 
  selectedDistrict, 
  onDistrictSelect 
}) {
  const [topology, setTopology] = useState(null)
  const [hoveredInfo, setHoveredInfo] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  useEffect(() => {
    fetch('/gujarat.json')
      .then(res => res.json())
      .then(data => setTopology(data))
      .catch(err => console.error('Failed to load gujarat.json topology:', err))
  }, [])

  // Decode TopoJSON geometries into SVG path string array
  const districtPaths = useMemo(() => {
    if (!topology || !topology.transform || !topology.arcs || !topology.objects?.districts?.geometries) {
      return []
    }

    const { scale, translate } = topology.transform
    const { arcs, objects } = topology
    const geometries = objects.districts.geometries

    const decodeArc = (arcIdx) => {
      const rawArc = arcs[arcIdx >= 0 ? arcIdx : ~arcIdx]
      const coords = []
      let x = 0, y = 0
      for (let i = 0; i < rawArc.length; i++) {
        x += rawArc[i][0]
        y += rawArc[i][1]
        const lon = x * scale[0] + translate[0]
        const lat = y * scale[1] + translate[1]
        coords.push([lon, lat])
      }
      if (arcIdx < 0) coords.reverse()
      return coords
    }

    let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90

    const decodedGeoms = geometries.map(geom => {
      const topoName = geom.properties.district
      const excelName = getExcelDistrictName(topoName)

      const polygonCoordsList = []

      const processPolygonRings = (rings) => {
        return rings.map(ring => {
          let ringCoords = []
          ring.forEach(arcIdx => {
            const decoded = decodeArc(arcIdx)
            if (ringCoords.length > 0 && decoded.length > 0) {
              ringCoords = ringCoords.concat(decoded.slice(1))
            } else {
              ringCoords = ringCoords.concat(decoded)
            }
          })
          ringCoords.forEach(([lon, lat]) => {
            if (lon < minLon) minLon = lon
            if (lon > maxLon) maxLon = lon
            if (lat < minLat) minLat = lat
            if (lat > maxLat) maxLat = lat
          })
          return ringCoords
        })
      }

      if (geom.type === 'Polygon') {
        polygonCoordsList.push(...processPolygonRings(geom.arcs))
      } else if (geom.type === 'MultiPolygon') {
        geom.arcs.forEach(polyRings => {
          polygonCoordsList.push(...processPolygonRings(polyRings))
        })
      }

      return {
        topoName,
        excelName,
        rings: polygonCoordsList
      }
    })

    const width = 600
    const height = 450
    const padding = 15

    const project = ([lon, lat]) => {
      const x = padding + ((lon - minLon) / (maxLon - minLon)) * (width - 2 * padding)
      const y = padding + ((maxLat - lat) / (maxLat - minLat)) * (height - 2 * padding)
      return [x, y]
    }

    return decodedGeoms.map(dGeom => {
      const svgPaths = dGeom.rings.map(ring => {
        if (ring.length === 0) return ''
        const pts = ring.map(project)
        return `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)} ` +
               pts.slice(1).map(p => `L ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') +
               ' Z'
      }).join(' ')

      return {
        topoName: dGeom.topoName,
        excelName: dGeom.excelName,
        pathD: svgPaths
      }
    })
  }, [topology])

  if (!topology) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white rounded-xl border border-surface-border p-3">
        <div className="flex flex-col items-center gap-1.5 text-ink-muted">
          <div className="w-5 h-5 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] font-semibold">Loading Map...</span>
        </div>
      </div>
    )
  }

  // Smooth mouse tracking relative to main container
  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full flex flex-col bg-white border border-surface-border rounded-xl px-3 py-2 shadow-xs overflow-hidden"
    >
      {/* Header & Title (Size text-sm as requested) */}
      <div className="flex items-center justify-between flex-shrink-0 mb-1">
        <h3 className="font-display text-sm font-bold text-navy-900 leading-tight">
          Average of Yield of Fruits(MT/Ha) by District and Yield Range
        </h3>
        {selectedDistrict && (
          <button
            onClick={() => onDistrictSelect(null)}
            className="text-[10px] font-bold text-navy-800 bg-navy-50 hover:bg-navy-100 border border-navy-200 px-2 py-0.5 rounded-md transition cursor-pointer"
          >
            Clear Map Filter ({selectedDistrict})
          </button>
        )}
      </div>

      {/* Main Map Body with Floating RHS Vertical Legends */}
      <div className="relative flex-1 w-full min-h-0 flex items-center justify-between overflow-hidden">
        
        {/* SVG Gujarat Map */}
        <div className="flex-1 h-full min-w-0 flex items-center justify-center">
          <svg
            viewBox="0 0 600 450"
            className="w-full h-full max-h-full drop-shadow-xs"
            onMouseLeave={() => setHoveredInfo(null)}
          >
            <g>
              {districtPaths.map(({ topoName, excelName, pathD }) => {
                const dData = districtDataMap[excelName] || districtDataMap[topoName] || {}
                const yieldRange = dData.yieldRange || 'Between 10 and 15 MT'
                const baseColor = YIELD_COLOR_MAP[yieldRange] || DEFAULT_COLOR

                const isSelected = selectedDistrict && (
                  normalizeDistrict(selectedDistrict) === normalizeDistrict(excelName) ||
                  normalizeDistrict(selectedDistrict) === normalizeDistrict(topoName)
                )
                const isAnySelected = Boolean(selectedDistrict)

                let opacity = 0.9
                let stroke = '#FFFFFF'
                let strokeWidth = 1.2
                let filter = 'none'

                if (isAnySelected) {
                  if (isSelected) {
                    opacity = 1.0
                    stroke = '#000000'
                    strokeWidth = 2.5
                    filter = 'drop-shadow(0px 3px 6px rgba(0,0,0,0.4))'
                  } else {
                    opacity = 0.22
                    stroke = '#CBD5E1'
                    strokeWidth = 0.8
                  }
                }

                return (
                  <path
                    key={topoName}
                    d={pathD}
                    fill={baseColor}
                    opacity={opacity}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    style={{ filter, transition: 'all 200ms ease' }}
                    className="cursor-pointer hover:opacity-100 transition-opacity"
                    onClick={() => {
                      if (isSelected) {
                        onDistrictSelect(null)
                      } else {
                        onDistrictSelect(excelName)
                      }
                    }}
                    onMouseEnter={() => setHoveredInfo({ name: excelName, data: dData })}
                  />
                )
              })}
            </g>
          </svg>
        </div>

        {/* Vertical Order Legends on the RHS of Map */}
        <div className="w-[185px] flex-shrink-0 bg-slate-50/80 border border-slate-200 rounded-lg p-2.5 shadow-2xs space-y-2 self-center ml-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Yield Range Category
          </span>
          {Object.entries(YIELD_COLOR_MAP).map(([label, color]) => (
            <div key={label} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
              <span className="w-3 h-3 rounded-md shadow-2xs flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Dynamic Smooth Plain White Cursor Tooltip */}
        {hoveredInfo && (
          <div
            className="pointer-events-none absolute z-40 bg-white border border-slate-200 text-navy-900 rounded-lg px-3 py-2 text-xs shadow-xl font-sans"
            style={{
              left: Math.min(tooltipPos.x + 15, 340),
              top: Math.max(tooltipPos.y - 45, 10)
            }}
          >
            <p className="font-bold text-navy-900 text-sm mb-1 border-b border-slate-100 pb-0.5">
              {hoveredInfo.name}
            </p>
            <div className="space-y-1 font-mono-num text-[11px]">
              <p className="flex justify-between gap-3">
                <span className="text-slate-500 font-sans font-medium">Category:</span>
                <span className="font-bold text-navy-900">{hoveredInfo.data.yieldRange || 'N/A'}</span>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-slate-500 font-sans font-medium">Yield:</span>
                <span className="font-bold text-emerald-600">{hoveredInfo.data.yield ? hoveredInfo.data.yield.toFixed(2) : 'N/A'} MT/Ha</span>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-slate-500 font-sans font-medium">Production:</span>
                <span className="font-bold text-blue-600">{hoveredInfo.data.production ? hoveredInfo.data.production.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : 'N/A'} (00 MT)</span>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-slate-500 font-sans font-medium">Area:</span>
                <span className="font-bold text-amber-600">{hoveredInfo.data.area ? hoveredInfo.data.area.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : 'N/A'} (00 Ha)</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
