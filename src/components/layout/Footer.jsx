import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-surface-1 border-t border-surface-border py-2 px-2 sm:px-6 lg:px-8 mt-auto text-xs text-ink-muted">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="font-medium text-center sm:text-left">
          Note: The data and references shown are dummy and representative in nature, intended solely for demonstration purposes.
        </p>
        <p className="font-bold text-navy-800 text-center sm:text-right uppercase tracking-wider text-[10px]">
          Source: VIKSIT RAJYA @2047 Dashboard
        </p>
      </div>
    </footer>
  )
}
