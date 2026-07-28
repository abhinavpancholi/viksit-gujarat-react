import React, { useState, useEffect, useMemo } from 'react'
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

    // Decode an arc index into longitude/latitude coordinates
    const decodeArc = (arcIdx) => {
      const rawArc = arcs[arcIdx >= 0 ? arcIdx : ~arcIdx]
      const coords = []
      let x = 0, y = 0
      for (let i = 0; i < rawArc.length; i++) {
        x += rawArc[i][0]
        y += rawArc[i][1]
        const lon = x * scale[0] + translate[0]
        const lat = y * scale[1] + translate[1]
        coords.append ? coords.append([lon, lat]) : coords.push([lon, lat])
      }
      if (arcIdx < 0) coords.reverse()
      return coords
    }

    // Determine geographic bounds for projection
    let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90

    // First pass to get coordinates for each geometry
    const decodedGeoms = geometries.map(geom => {
      const topoName = geom.properties.district
      const excelName = getExcelDistrictName(topoName)

      const polygonCoordsList = [] // Array of rings

      const processPolygonRings = (rings) => {
        return rings.map(ring => {
          let ringCoords = []
          ring.forEach(arcIdx => {
            const decoded = decodeArc(arcIdx)
            // Skip first point of subsequent arcs if matching last point
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

    // SVG Canvas dimensions
    const width = 600
    const height = 480
    const padding = 20

    // Projection function: Lon/Lat -> SVG (x, y)
    const project = ([lon, lat]) => {
      const x = padding + ((lon - minLon) / (maxLon - minLon)) * (width - 2 * padding)
      // Invert Y axis for screen space
      const y = padding + ((maxLat - lat) / (maxLat - minLat)) * (height - 2 * padding)
      return [x, y]
    }

    // Convert decoded rings into SVG 'd' path strings
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
      <div className="w-full h-full min-h-[350px] flex items-center justify-center bg-surface-0/50 rounded-xl border border-surface-border">
        <div className="flex flex-col items-center gap-2 text-ink-muted">
          <div className="w-6 h-6 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Loading Map Geometry...</span>
        </div>
      </div>
    )
  }

  const handleMouseMove = (e, dName, dData) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setHoveredInfo({ name: dName, data: dData })
  }

  const handleMouseLeave = () => {
    setHoveredInfo(null)
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-white border border-surface-border rounded-xl p-3 shadow-xs min-h-[360px]">
      {/* Header & Title */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-display text-sm font-bold text-navy-800 leading-tight">
            Average of Yield of Fruits(MT/Ha) by District and Yield Range
          </h3>
        </div>
        {selectedDistrict && (
          <button
            onClick={() => onDistrictSelect(null)}
            className="text-[10px] font-bold text-navy-800 bg-navy-50 hover:bg-navy-100 border border-navy-200 px-2 py-0.5 rounded-md transition cursor-pointer"
          >
            Clear Map Filter ({selectedDistrict})
          </button>
        )}
      </div>

      {/* Legend Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 my-1 px-1 text-[11px] font-semibold text-slate-700">
        {Object.entries(YIELD_COLOR_MAP).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shadow-xs flex-shrink-0" style={{ backgroundColor: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Interactive Map SVG Container */}
      <div className="relative flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 600 480"
          className="w-full h-full max-h-[380px] drop-shadow-xs"
          onMouseLeave={handleMouseLeave}
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

              // Opacity logic for cross-filtering dimming
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
                  onMouseMove={(e) => handleMouseMove(e, excelName, dData)}
                />
              )
            })}
          </g>
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredInfo && (
          <div
            className="pointer-events-none absolute z-30 bg-navy-900/90 text-white rounded-lg px-3 py-2 text-xs shadow-xl backdrop-blur-xs border border-white/20"
            style={{
              left: Math.min(tooltipPos.x + 15, 420),
              top: Math.max(tooltipPos.y - 40, 10)
            }}
          >
            <p className="font-bold text-saffron-400 text-sm mb-1">{hoveredInfo.name}</p>
            <div className="space-y-0.5 text-[11px] font-mono-num">
              <p><span className="text-slate-300">Yield Range:</span> <span className="font-bold text-white">{hoveredInfo.data.yieldRange || 'N/A'}</span></p>
              <p><span className="text-slate-300">Yield:</span> <span className="font-bold text-emerald-400">{hoveredInfo.data.yield ? hoveredInfo.data.yield.toFixed(2) : 'N/A'} MT/Ha</span></p>
              <p><span className="text-slate-300">Production:</span> <span className="font-bold text-blue-300">{hoveredInfo.data.production ? hoveredInfo.data.production.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : 'N/A'} (00 MT)</span></p>
              <p><span className="text-slate-300">Area:</span> <span className="font-bold text-amber-300">{hoveredInfo.data.area ? hoveredInfo.data.area.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : 'N/A'} (00 Ha)</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
