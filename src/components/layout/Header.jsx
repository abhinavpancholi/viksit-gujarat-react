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
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Logo and Titles */}
        <div className="flex items-center gap-4">
          {/* Logo Pack */}
          <div className="flex items-center gap-2">
            {/* Gujarat Abstract Map Shape SVG */}
            <svg 
              viewBox="0 0 100 100" 
              className="w-12 h-12 text-saffron-500 fill-current filter drop-shadow-sm"
              aria-label="Gujarat State Logo"
            >
              {/* Stylized abstract vector outline of Gujarat */}
              <path d="M15,45 Q20,30 35,28 T55,20 T70,30 T85,32 T90,45 T85,60 T75,70 T65,85 T45,82 T30,85 T18,75 T10,60 Z" className="opacity-10" />
              <path d="M22,35 Q28,25 38,28 T50,22 T68,32 T82,30 T88,42 T82,55 T72,65 T62,80 T42,78 T28,80 T20,70 T15,55 Z" fill="url(#spine-grad)" />
              <circle cx="50" cy="48" r="8" className="text-white fill-current" />
              <circle cx="50" cy="48" r="4" className="text-saffron-500 fill-current" />
              <defs>
                <linearGradient id="spine-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-pillar-economy)" />
                  <stop offset="50%" stopColor="var(--color-pillar-citizen)" />
                  <stop offset="100%" stopColor="var(--color-pillar-enablers)" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* GRIT Logo Emblem SVG */}
            <svg 
              viewBox="0 0 100 100" 
              className="w-12 h-12 text-navy-800 fill-none stroke-current stroke-2"
              aria-label="GRIT Logo"
            >
              <circle cx="50" cy="50" r="42" className="stroke-navy-800" strokeWidth="2" />
              <circle cx="50" cy="50" r="34" className="stroke-saffron-500 stroke-dasharray-[4,4]" strokeWidth="1.5" />
              <path d="M35,60 L50,30 L65,60 M42,50 L58,50" className="stroke-navy-800" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <text x="50" y="80" textAnchor="middle" className="fill-navy-800 stroke-none font-bold text-[13px] tracking-widest font-sans">GRIT</text>
            </svg>
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
