/**
 * Calculates the gap ratio based on target direction (UP or DOWN)
 */
export function calculateGapRatio(value, target, direction) {
  if (value === null || target === null || target === 0) return null
  
  if (direction === 'UP') {
    return value >= target ? 0 : (target - value) / target
  } else {
    // direction === 'DOWN' (lower is better, e.g., mortality, dropout rates)
    return value <= target ? 0 : (value - target) / target
  }
}

/**
 * Maps a gap ratio to one of the 4 standard status categories
 */
export function getStatusFromGap(gapRatio) {
  if (gapRatio === null) return 'Critical (gap > 75%)'
  
  if (gapRatio <= 0.25) {
    return 'On Track (gap ≤ 25%)'
  } else if (gapRatio <= 0.50) {
    return 'Slightly Off Track (gap ≤ 50%)'
  } else if (gapRatio <= 0.75) {
    return 'At Risk (gap ≤ 75%)'
  } else {
    return 'Critical (gap > 75%)'
  }
}

/**
 * Returns color classes and styles for status labels
 */
export const STATUS_STYLE_MAP = {
  'On Track (gap ≤ 25%)': {
    color: '#1e8a5f',
    bg: 'bg-status-ontrack-soft',
    text: 'text-status-ontrack',
    border: 'border-status-ontrack/20',
    label: 'On Track'
  },
  'Slightly Off Track (gap ≤ 50%)': {
    color: '#c98a12',
    bg: 'bg-status-slight-soft',
    text: 'text-status-slight',
    border: 'border-status-slight/20',
    label: 'Slightly Off Track'
  },
  'At Risk (gap ≤ 75%)': {
    color: '#d9711f',
    bg: 'bg-status-atrisk-soft',
    text: 'text-status-atrisk',
    border: 'border-status-atrisk/20',
    label: 'At Risk'
  },
  'Critical (gap > 75%)': {
    color: '#c53d3d',
    bg: 'bg-status-critical-soft',
    text: 'text-status-critical',
    border: 'border-status-critical/20',
    label: 'Critical'
  }
}
