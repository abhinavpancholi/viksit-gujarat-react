import React, { useMemo, useState } from 'react'
import { Treemap, ResponsiveContainer } from 'recharts'

const THEME_COLORS = {
  'Agriculture, Irrigation and Rural Development': { fill: '#1a7fd4', border: '#1261a0' },
  'Human Capital: Education and Skilling': { fill: '#0c2461', border: '#06133a' },
  'Nari Shakti: Women-led Development': { fill: '#8e24aa', border: '#5c007a' },
  'Art Culture and Sports': { fill: '#e91e63', border: '#b0003a' },
  'City Agglomerations: Vibrant Socio-Economic Epicenters': { fill: '#6c5ce7', border: '#3b3b98' },
  'Healthcare and Nutrition for all': { fill: '#d9534f', border: '#b52b27' },
  'Industries of the Future': { fill: '#2e7d32', border: '#1b5e20' },
  'Gujarat as Tourism Hub': { fill: '#e67e22', border: '#d35400' },
  'Transport and Logistics Infrastructure': { fill: '#138d75', border: '#0e6655' },
  'Services of the Future': { fill: '#0288d1', border: '#01579b' },
  'Governance 2.0: Reform, Perform and Transform': { fill: '#00838f', border: '#006064' }
}

const THEME_SHORT_NAMES = {
  'Agriculture, Irrigation and Rural Development': 'Agriculture & Rural Dev.',
  'Human Capital: Education and Skilling': 'Human Capital & Skills',
  'Nari Shakti: Women-led Development': 'Nari Shakti',
  'Art Culture and Sports': 'Art, Culture & Sports',
  'City Agglomerations: Vibrant Socio-Economic Epicenters': 'City Agglomerations',
  'Healthcare and Nutrition for all': 'Healthcare & Nutrition',
  'Industries of the Future': 'Industries of Future',
  'Gujarat as Tourism Hub': 'Gujarat Tourism Hub',
  'Transport and Logistics Infrastructure': 'Transport & Logistics',
  'Services of the Future': 'Services of Future',
  'Governance 2.0: Reform, Perform and Transform': 'Governance 2.0'
}

/** Approximate text truncation based on tile pixel width */
function truncateText(text, maxPx, fontSize) {
  const avgCharWidth = fontSize * 0.56
  const maxChars = Math.floor(maxPx / avgCharWidth)
  if (text.length <= maxChars) return text
  return text.slice(0, Math.max(0, maxChars - 1)) + '\u2026'
}

// ─── Module-level store (callbacks + timers only) ────────────────────────────
// activeTheme is intentionally NOT stored here — it's embedded in data items
// so that Recharts re-renders tiles when selection changes (opacity updates),
// while layout remains stable because tile `size` values never change.
const _store = {
  onSelectTheme: null,
  onResetFilters: null,
  setTooltip: null,
  hideTimer: null,
}

// ─── Tile renderer ────────────────────────────────────────────────────────────
// Defined before use (hoisting doesn't apply to arrow functions/const)
function CustomizedContent(props) {
  // Recharts injects all data-item fields as props, including _activeTheme
  const { x, y, width, height, name, count, color, borderColor, macroGoalsList, _activeTheme } = props

  // activeTheme comes from the data item (not _store) so tiles re-render when selection changes
  const activeTheme = _activeTheme ?? 'All'

  const isZero = count === 0
  const hasActive = activeTheme && activeTheme !== 'All'
  const isSelected = hasActive && activeTheme === name
  const isDimmed = hasActive && !isSelected

  const showText = width > 45 && height > 30
  const labelFontSize = Math.max(9, Math.min(11, width / 12))
  const countFontSize = Math.max(13, Math.min(22, height / 4))
  const shortName = THEME_SHORT_NAMES[name] || name
  const label = truncateText(shortName, width - 20, labelFontSize)

  const cancelHide = () => {
    if (_store.hideTimer) { clearTimeout(_store.hideTimer); _store.hideTimer = null }
  }
  const scheduleHide = () => {
    cancelHide()
    _store.hideTimer = setTimeout(() => {
      _store.setTooltip?.(prev => ({ ...prev, visible: false }))
      _store.hideTimer = null
    }, 150)
  }

  const handleClick = () => {
    if (isZero) return
    isSelected ? _store.onResetFilters?.() : _store.onSelectTheme?.(name)
  }

  const handleMouseEnter = (e) => {
    cancelHide()
    if (isZero || !macroGoalsList?.length || !_store.setTooltip) return
    _store.setTooltip({ visible: true, x: e.clientX, y: e.clientY, theme: shortName, goals: macroGoalsList, color })
  }

  const handleMouseMove = (e) => {
    _store.setTooltip?.(prev => prev.visible ? { ...prev, x: e.clientX, y: e.clientY } : prev)
  }

  const handleMouseLeave = () => scheduleHide()

  // Dimmed tiles: washed-out background + dark readable text
  const rectOpacity = isDimmed ? 0.18 : 1
  const textColor = isDimmed ? '#1e3a5f' : isZero ? '#8b93a3' : '#ffffff'
  const textOpacity = isDimmed ? 0.8 : 1

  return (
    <g
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: isZero ? 'not-allowed' : 'pointer' }}
    >
      <rect
        x={x} y={y} width={width} height={height}
        fill={isZero ? '#f3f4f6' : color}
        fillOpacity={rectOpacity}
        stroke={isSelected ? '#1e40af' : isZero ? '#dde3ee' : borderColor}
        strokeWidth={isSelected ? 2.5 : 0.8}
        rx={4} ry={4}
        style={{ transition: 'fill-opacity 0.22s ease' }}
      />
      {showText && (
        <text
          x={x + 10} y={y + labelFontSize + 8}
          fill={textColor} fillOpacity={textOpacity}
          fontSize={labelFontSize} fontWeight={isDimmed ? '600' : '700'}
          style={{ userSelect: 'none', pointerEvents: 'none', transition: 'fill 0.22s ease, fill-opacity 0.22s ease' }}
        >
          {label}
        </text>
      )}
      {showText && (
        <text
          x={x + 10} y={y + height - 10}
          fill={textColor} fillOpacity={textOpacity}
          fontSize={countFontSize} fontWeight="800"
          style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'monospace', transition: 'fill 0.22s ease, fill-opacity 0.22s ease' }}
        >
          {count}
        </text>
      )}
    </g>
  )
}

// Stable singleton — passed to Treemap once, never recreated
const STABLE_CONTENT = <CustomizedContent />

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function TreemapTooltip({ tooltip }) {
  if (!tooltip.visible || !tooltip.goals?.length) return null

  const OFFSET = 14
  const safeLeft = Math.min(tooltip.x + OFFSET, window.innerWidth - 304)
  const safeTop = Math.min(tooltip.y + OFFSET, window.innerHeight - 248)

  const cancelHide = () => {
    if (_store.hideTimer) { clearTimeout(_store.hideTimer); _store.hideTimer = null }
  }
  const scheduleHide = () => {
    cancelHide()
    _store.hideTimer = setTimeout(() => {
      _store.setTooltip?.(prev => ({ ...prev, visible: false }))
      _store.hideTimer = null
    }, 150)
  }

  return (
    <div
      onMouseEnter={cancelHide}
      onMouseLeave={scheduleHide}
      style={{
        position: 'fixed',
        left: safeLeft,
        top: safeTop,
        zIndex: 9999,
        pointerEvents: 'auto',   // must be auto so user can scroll the list
        maxWidth: 292,
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 10,
        boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
        padding: '11px 14px',
        border: `1.5px solid ${tooltip.color}55`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: tooltip.color, flexShrink: 0, display: 'inline-block' }} />
        <span style={{ color: '#0f172a', fontWeight: 700, fontSize: 11.5, lineHeight: 1.3 }}>
          {tooltip.theme}
        </span>
      </div>
      <div style={{ color: '#64748b', fontSize: 9.5, marginBottom: 7, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
        Macro Goals ({tooltip.goals.length})
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 184, overflowY: 'auto' }}>
        {tooltip.goals.map((goal, i) => (
          <li key={i} style={{
            display: 'flex', gap: 6, alignItems: 'flex-start',
            color: '#334155', fontSize: 10.5, lineHeight: 1.5,
            paddingBottom: 5, marginBottom: 5,
            borderBottom: i < tooltip.goals.length - 1 ? '1px solid #e2e8f0' : 'none',
          }}>
            <span style={{ color: tooltip.color, fontWeight: 700, flexShrink: 0, fontSize: 9.5, marginTop: 1 }}>
              {goal.code}
            </span>
            <span>{goal.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ThemeTreeMap({ goals = [], activeTheme = 'All', onSelectTheme, onResetFilters }) {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, theme: '', goals: [], color: '#000' })

  // Sync callbacks into store (activeTheme is NOT stored here — it lives in data items)
  _store.onSelectTheme = onSelectTheme
  _store.onResetFilters = onResetFilters
  _store.setTooltip = setTooltip

  const themeGoalsMap = useMemo(() => {
    return goals.reduce((acc, goal) => {
      if (!acc[goal.theme]) acc[goal.theme] = []
      acc[goal.theme].push({ code: goal.mgCode, name: goal.macroGoal })
      return acc
    }, {})
  }, [goals])

  // Tile sizes — built from full goals list so layout is always stable.
  // _activeTheme is embedded in each item so Recharts re-renders tiles when
  // activeTheme changes (enabling opacity updates). Layout is unaffected
  // because Recharts computes positions from `size` only, which never changes.
  const data = useMemo(() => {
    const themeCounts = goals.reduce((acc, goal) => {
      acc[goal.theme] = (acc[goal.theme] || 0) + 1
      return acc
    }, {})
    return Object.keys(THEME_SHORT_NAMES).map((themeName) => {
      const count = themeCounts[themeName] || 0
      const colors = THEME_COLORS[themeName] || { fill: '#f3f4f6', border: '#dde3ee' }
      return {
        name: themeName,
        size: count === 0 ? 0.35 : count,
        count,
        color: colors.fill,
        borderColor: colors.border,
        macroGoalsList: themeGoalsMap[themeName] || [],
        _activeTheme: activeTheme,  // triggers Recharts re-render on selection change
      }
    })
  }, [goals, themeGoalsMap, activeTheme])

  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl p-5 shadow-2xs flex flex-col" style={{ height: 440 }}>
      <div className="flex items-center justify-between mb-4 border-b border-surface-2 pb-2">
        <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider">
          No. of Macro Goals by Theme
        </h3>
        <span className="text-[10px] font-bold text-ink-muted bg-surface-0 border border-surface-border px-2 py-0.5 rounded-full uppercase tracking-wider">
          {activeTheme !== 'All' ? 'Click tile to reset' : 'Click tile to filter'}
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={data}
            dataKey="size"
            aspectRatio={4 / 3}
            fill="#fff"
            content={STABLE_CONTENT}
            animationDuration={0}
          />
        </ResponsiveContainer>
      </div>

      <TreemapTooltip tooltip={tooltip} />
    </div>
  )
}
