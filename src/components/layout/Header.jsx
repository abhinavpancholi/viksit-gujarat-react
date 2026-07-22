import React from 'react'
import { Calendar, Download, Home, ArrowLeft, LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'


export default function Header() {
  const location = useLocation()
  const isGoalPage = location.pathname.includes('/goal/')
  const isOverviewPage = location.pathname === '/'
  const { currentUser, logout } = useAuth()

  // e.g. "admin" → "Admin"
  const roleLabel = currentUser
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : ''

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
            <img src="/indiamap.png" alt="Gujarat Map" className="h-14" />
            {/* GRIT Logo Emblem SVG */}
            <img src="/vikistrajyalogo.png" alt="GRIT Logo" className="h-14" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-navy-800 tracking-tight leading-tight">
                VIKSIT RAJYA @ 2047
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
              Viksit Rajya Institution for Transformation (VRIT)
            </p>
          </div>
        </div>

        {/* Action and Info widgets */}
        <div className="flex flex-wrap items-center gap-3 self-end sm:self-center">
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

          {/* ── Auth: user badge + logout ──────────────────────────────── */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-3 border-l border-surface-border">
              {/* Name + role badge */}
              <div className="flex flex-col items-end leading-tight">
                <span className="text-xs font-semibold text-ink-body">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-medium text-ink-faint bg-surface-2 rounded px-1.5 py-0.5 mt-0.5">
                  {roleLabel}
                </span>
              </div>

              {/* Logout button */}
              <button
                id="header-logout-btn"
                onClick={logout}
                title="Sign out"
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-surface-border bg-surface-0 hover:bg-status-critical-soft hover:border-status-critical hover:text-status-critical text-ink-muted transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

