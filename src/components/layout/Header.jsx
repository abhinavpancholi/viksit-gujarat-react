import React from 'react'
import { Calendar, Download, Home, ArrowLeft } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'


export default function Header() {
  const location = useLocation()
  const isGoalPage = location.pathname.includes('/goal/')
  const isOverviewPage = location.pathname === '/'

  return (
    <header className="bg-surface-1 border-b border-surface-border sticky top-0 z-50 shadow-xs">
      {/* Signature Motif Brand Spine */}
      <div className="brand-spine w-full" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-1 flex flex-col sm:flex-row sm:items-center lg:justify-between gap-4">
        {/* Logo and Titles */}
        <div className="flex items-center gap-4">
          {/* Logo Pack */}
          <div className="flex items-center gap-2">
            {/* Gujarat Abstract Map Shape SVG */}
            <img src="/gujarat_map.png" alt="Gujarat Map" className="h-14" />
            {/* GRIT Logo Emblem SVG */}
            <img src="/gritlogo.jpg" alt="GRIT Logo" className="h-14" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-navy-800 tracking-tight leading-tight">
                VIKSIT GUJARAT @ 2047
              </h1>
              {isGoalPage && (
                <Link
                  to="/"
                  className="flex items-center justify-center p-1 rounded-md text-ink-muted hover:bg-surface-2 hover:text-navy-800 transition"
                  title="Back to Overview"
                >
                  <Home className="w-4 h-4" />
                </Link>
              )}
            </div>
            <p className="text-xs sm:text-sm text-ink-muted font-medium">
              Gujarat Rajya Institution for Transformation (GRIT)
            </p>
          </div>
        </div>

        {/* Action and Info widgets */}
        <div className="flex flex-wrap items-center gap-3 self-end sm:self-center">
          {/* Data as on */}
          {/* <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border bg-surface-0 text-xs font-medium text-ink-body">
            <Calendar className="w-3.5 h-3.5 text-navy-600" />
            <span>Data as on: <span className="text-navy-800 font-semibold">May 13, 2025</span></span>
          </div> */}

          {/* Download Button */}
          {/* <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm cursor-pointer transition active:scale-98"
            title="Download Dashboard as PDF / Print"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export / Print</span>
          </button> */}

          {/* Back to Overview link (replaces Refreshed badge on goal pages) */}
          {isGoalPage && (
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm cursor-pointer transition active:scale-98"
            >
              {/* <ArrowLeft className="w-3.5 h-3.5" /> */}
              <span>Overview Dashboard</span>
            </Link>
          )}
          {isOverviewPage && (
            <Link
              to="/v2/goal/HM3"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm cursor-pointer transition active:scale-98"
            >
              {/* <ArrowLeft className="w-3.5 h-3.5" /> */}
              <span>Macro Goals Dashboard</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
